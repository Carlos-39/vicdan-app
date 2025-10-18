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
});
