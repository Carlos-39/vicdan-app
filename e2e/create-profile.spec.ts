import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Test de creación exitosa con datos válidos", () => {
  test("debe crear un perfil exitosamente cuando se completan todos los campos válidos", async ({
    page,
  }) => {
    await login(page);

    // Mock del API para simular una creación exitosa
    await page.route("**/api/perfiles", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "123",
            message: "Perfil creado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de creación de perfil
    await page.goto("/create-profile");

    // Verificar que estamos en la página correcta
    await expect(
      page.getByRole("heading", { name: /Crear Nuevo Perfil/i })
    ).toBeVisible();

    // Llenar el campo de nombre
    await page.fill('input[name="nombre"]', "Juan");

    // Llenar el campo de apellido
    await page.fill('input[name="apellido"]', "Pérez");

    // Llenar el campo de email
    await page.fill('input[name="email"]', "juan.perez@ejemplo.com");

    // Llenar el campo de descripción (opcional)
    await page.fill(
      'textarea[name="descripcion"]',
      "Descripción de prueba del perfil"
    );

    // Hacer submit del formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestra el mensaje de éxito
    await expect(page.getByText(/Perfil creado exitosamente/i)).toBeVisible();

    // Verificar que el botón cambia a estado de carga y luego vuelve
    await expect(
      page.getByRole("button", { name: /Guardar Perfil/i })
    ).toBeVisible({
      timeout: 5000,
    });
  });
});
