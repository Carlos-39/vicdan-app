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
    await expect(error).toContainText(/credenciales inválidas/i);

    // 5. Verificar que **no redirige al dashboard**
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test("Test de login con credenciales incorrectas - Debe fallar con 401", async ({
    page,
  }) => {
    // 1. Ir a la página de login
    await page.goto("/login");
    // 2. Llenar los campos con credenciales incorrectas
    await page.fill('input[type="email"]', "admin@vicdan.com");
    await page.fill('input[type="password"]', "contraseña_incorrecta");

    // 3. Hacer clic en el botón de enviar
    await page.click('button[type="submit"]');

    // 4. Esperar a que aparezca el mensaje de error
    const error = page.locator('p[class*="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(/credenciales inválidas/i);

    // 5. Verificar que **no redirige al dashboard**
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test("Login exitoso redirige al dashboard", async ({ page }) => {
    // 1️⃣ Navegar a la página de login
    await page.goto("/login");

    // 2️⃣ Completar los campos con las credenciales correctas
    await page.fill('input[type="email"]', "admin@vicdan.com");
    await page.fill('input[type="password"]', "123456");

    // 3️⃣ Hacer clic en el botón de "Iniciar sesión"
    await page.click('button[type="submit"]');

    // 4️⃣ Verificar que el botón muestra el estado de carga (opcional)
    // esto depende de tu UI; si ves “Ingresando...” en pantalla, se puede testear:
    // await expect(
    //   page.getByRole("button", { name: /iniciar sesión/i })
    // )

    // 5️⃣ Esperar que redirija al dashboard
    await expect(page).toHaveURL(/dashboard/);

    // 6️⃣ Verificar que el localStorage tiene los datos correctos
    const token = await page.evaluate(() => localStorage.getItem("token"));
    const user = await page.evaluate(() => localStorage.getItem("user"));

    expect(token).toBe("fake-jwt-token");
    expect(user).toContain("Administrador");

    // 7️⃣ (Opcional) puedes verificar que el dashboard tenga contenido esperado
    // await expect(page.locator('h1')).toContainText(/dashboard/i);
  });
});
