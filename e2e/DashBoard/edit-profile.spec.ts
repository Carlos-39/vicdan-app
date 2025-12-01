import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Editar Perfil", () => {
  test("valida que el correo sea obligatorio", async ({ page }) => {
    await login(page);

    // Mock del perfil
    await page.route("**/api/perfiles/1", async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                id: "1",
                nombre: "Empresa Test",
                correo: "test@empresa.com",
                descripcion: "Descripción test",
                estado: "activo",
                logo_url: null,
                }),
            });
        } else if (route.request().method() === 'PUT') {
             await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ success: true }),
            });
        }
    });

    await page.goto("/dashboard/perfiles/1/editar");

    // Limpiar el correo
    await page.fill('input[name="correo"]', "");

    // Intentar guardar
    await page.click('button[type="submit"]');

    // Verificar error
    await expect(page.getByText("El correo es obligatorio")).toBeVisible();

    // Llenar correo válido
    await page.fill('input[name="correo"]', "nuevo@empresa.com");

    // Guardar
    await page.click('button[type="submit"]');

    // Verificar éxito
    await expect(page.getByText("¡Perfil actualizado exitosamente!")).toBeVisible();
  });
});
