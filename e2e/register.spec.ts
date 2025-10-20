import { test, expect } from "@playwright/test";

test.describe("Registro Tests", () => {
  test("Test de registro con contraseña inválida - Debe fallar con 400", async ({
    page,
  }) => {
    // 1. Ir a la página de registro
    await page.goto("/register");

    // 2. Llenar los campos con datos válidos excepto la contraseña
    await page.fill('input[name="name"]', "Usuario Prueba");
    await page.fill('input[name="email"]', "usuario_prueba@example.com");
    // Contraseña inválida (sin caracteres especiales ni mayúsculas)
    await page.fill('input[name="password"]', "contrasena123");

    // 3. Hacer clic en el botón de enviar
    await page.click('button[type="submit"]');

    // 4. Esperar a que aparezca el mensaje de error
    const error = page.locator('p[class*="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(/contraseña.*inválida|requisitos de contraseña/i);

    // 5. Verificar que no redirige al dashboard o página de éxito
    await expect(page).not.toHaveURL(/dashboard|success/);
  });

  test("Test de registro exitoso con datos válidos", async ({ page }) => {
    // 1. Ir a la página de registro
    await page.goto("/register");

    // 2. Generar un correo único para evitar duplicados
    const timestamp = new Date().getTime();
    const uniqueEmail = `usuario_${timestamp}@example.com`;

    // 3. Llenar los campos con datos válidos
    await page.fill('input[name="name"]', "Usuario Nuevo");
    await page.fill('input[name="email"]', uniqueEmail);
    // Contraseña válida (con mayúsculas, minúsculas, números y símbolos)
    await page.fill('input[name="password"]', "Contraseña123!");

    // 4. Hacer clic en el botón de enviar
    await page.click('button[type="submit"]');

    // 5. Verificar que se redirige al dashboard o página de éxito
    await expect(page).toHaveURL(/dashboard|success/);
  });

  test("Test de registro con correo duplicado - Debe fallar con 409", async ({ page }) => {
    // 1. Ir a la página de registro
    await page.goto("/register");

    // 2. Usar un correo que ya existe en el sistema
    const existingEmail = "admin@vicdan.com"; // Asumiendo que este correo ya existe

    // 3. Llenar los campos con datos válidos pero correo duplicado
    await page.fill('input[name="name"]', "Usuario Duplicado");
    await page.fill('input[name="email"]', existingEmail);
    await page.fill('input[name="password"]', "Contraseña123!");

    // 4. Hacer clic en el botón de enviar
    await page.click('button[type="submit"]');

    // 5. Esperar a que aparezca el mensaje de error
    const error = page.locator('p[class*="error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(/correo.*ya.*registrado|ya existe|duplicado/i);

    // 6. Verificar que no redirige al dashboard o página de éxito
    await expect(page).not.toHaveURL(/dashboard|success/);
  });
});