import { test, expect } from "@playwright/test";

test.describe("Login Tests", () => {
  test("Test de login con cuenta inexistente - Debe fallar con 401", async ({
    page,
  }) => {
    // 1. Ir a la página de login
    await page.goto("/login");

    // 2. Llenar los campos con una cuenta inválida
    await page.fill('input[type="email"]', "usuario_inexistente@example.com");
    await page.fill('input[type="password"]', "contraseña_incorrecta");

    // 3. Hacer clic en el botón de enviar
    await page.click('button[type="submit"]');

    // 4. Esperar a que aparezca el mensaje de error
    const error = page.locator('p[class*="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(/El correo ingresado no está registrado/i);

    // 5. Verificar que **no redirige al dashboard**
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test("Test de login con contraseña incorrecta - Debe fallar con 401", async ({
    page,
  }) => {
    // 1. Ir a la página de login
    await page.goto("/login");
    // 2. Llenar los campos con credenciales incorrectas
    await page.fill('input[type="email"]', "brayanss2018@gmail.com");
    await page.fill('input[type="password"]', "contraseña_incorrecta");

    // 3. Hacer clic en el botón de enviar
    await page.click('button[type="submit"]');

    // 4. Esperar a que aparezca el mensaje de error
    const error = page.locator('p[class*="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(/La contraseña es incorrecta/i);

    // 5. Verificar que **no redirige al dashboard**
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test("Login exitoso redirige al dashboard", async ({ page }) => {
    // Navegar a la página de login
    await page.goto("/login");

    // Completar los campos con las credenciales correctas
    await page.fill('input[type="email"]', "brayanss2018@gmail.com");
    await page.fill('input[type="password"]', "Steven-123");

    // Hacer clic en el botón de "Iniciar sesión"
    await page.click('button[type="submit"]');

    // Verificar que el botón muestra el estado de carga
    await expect(page.locator('button[type="submit"]')).toContainText(/ingresando/i);

    // Esperar que redirija al dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);

    // Verificar que el dashboard se cargó correctamente
    await expect(page.locator('text=Procesos Principales')).toBeVisible();
    
    // Verificar que el nombre del usuario aparece en el header
    await expect(page.locator('text=Brayan Steven Narvaez Valdes')).toBeVisible();
    
    // Verificar que hay elementos clave del dashboard
    await expect(page.locator('text=Actividad Reciente')).toBeVisible();
    await expect(page.locator('text=Acciones Rápidas')).toBeVisible();
    
    // Verificar que las cookies de sesión fueron establecidas
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('session')
    );
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie?.value).toBeTruthy();
  });

  test("Mensaje de error general", async ({ page }) => {
    // Navegar a la página de login
    await page.goto("/login");

    // Completar los campos con credenciales incorrectas
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    // Hacer clic en el botón de "Iniciar sesión"
    await page.click('button[type="submit"]');

    // Verificar que no hay cookies de sesión establecidas
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('session')
    );

    expect(sessionCookie).toBeFalsy();

    // Verificar que el mensaje de error se muestra
    await expect(page.locator('p[class*="error"], div[class*="error"], .error')).toContainText(/el correo ingresado no está registrado/i);
  });
});
