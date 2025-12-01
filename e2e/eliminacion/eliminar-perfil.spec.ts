import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("Eliminación de perfil", () => {
  test("Debe eliminar un perfil exitosamente", async ({ page }) => {
    await login(page);

    const mockProfile = {
      id: "profile-to-delete-123",
      administrador_id: "admin-1",
      nombre: "Perfil Para Eliminar",
      logo_url: null,
      correo: "delete@test.com",
      descripcion: "Perfil de prueba para eliminación",
      diseno: null,
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
      administrador: {
        id: "admin-1",
        nombre: "Test Admin",
        correo: "admin@test.com"
      }
    };

    // Variable para controlar el estado de los perfiles (simulando DB)
    let profiles = [mockProfile];

    // Mock GET /api/perfiles
    await page.route("**/api/perfiles*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ perfiles: profiles }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock DELETE /api/perfiles/[id]
    await page.route(`**/api/perfiles/${mockProfile.id}`, async (route) => {
      if (route.request().method() === "DELETE") {
        // Simular eliminación en "DB"
        profiles = [];
        
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Perfil eliminado correctamente" }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar al dashboard
    await page.goto("/dashboard/perfiles");

    // Verificar que el perfil es visible
    const profileCard = page.locator(".group", { hasText: mockProfile.nombre });
    await expect(profileCard).toBeVisible();

    // Abrir menú de acciones
    // Buscamos el botón dentro de la tarjeta específica
    await profileCard.getByRole("button", { name: /Acciones/i }).click();

    // Hacer clic en Eliminar
    await page.getByRole("menuitem", { name: "Eliminar" }).click();

    // Verificar que aparece el diálogo de confirmación
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByText("Confirmación de Eliminación")).toBeVisible();
    await expect(page.getByText(`Estás a punto de eliminar permanentemente el siguiente perfil:`)).toBeVisible();
    await expect(page.getByText(mockProfile.nombre)).toBeVisible();

    // Confirmar eliminación
    await page.getByRole("button", { name: "Confirmar Eliminación" }).click();

    // Verificar mensaje de éxito (Toast)
    await expect(page.getByText(`El perfil "${mockProfile.nombre}" ha sido eliminado`)).toBeVisible();

    // Verificar que el perfil ya no es visible
    await expect(profileCard).not.toBeVisible();
  });
});
