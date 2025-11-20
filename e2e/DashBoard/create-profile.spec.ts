import { test, expect } from "@playwright/test";
import path from "path";

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

    // Subir imagen de perfil
    const filePath = path.resolve(__dirname, "./images/test-profile.jpg");
    await page.setInputFiles('input[type="file"]', filePath);

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


test.describe("E2E - Validaciones cliente en CreateProfile (Zod)", () => {
  test("mostrar error cuando falta el nombre (El nombre debe tener al menos 2 caracteres)", async ({ page }) => {
    await login(page);

    await page.goto("/create-profile");
    await expect(page.getByRole("heading", { name: /Crear Nuevo Perfil/i })).toBeVisible();

    // Dejar nombre vacío
    // Rellenar los demás campos válidos
    await page.fill('input[name="apellido"]', "Pérez");
    await page.fill('input[name="email"]', "juan@example.com");

    // Intentar enviar
    await page.click('button[type="submit"]');

    // Validación esperada
    await expect(page.getByText("El nombre debe tener al menos 2 caracteres")).toBeVisible();

    // Aseguramos que no se muestra mensaje de éxito
    await expect(page.getByText(/Perfil creado exitosamente/i)).toHaveCount(0);
  });

  test("mostrar error cuando falta el apellido (El apellido debe tener al menos 2 caracteres)", async ({ page }) => {
    await login(page);

    await page.goto("/create-profile");
    await expect(page.getByRole("heading", { name: /Crear Nuevo Perfil/i })).toBeVisible();

    // Dejar apellido vacío
    // Rellenar los demás campos válidos
    await page.fill('input[name="nombre"]', "Juan");
    await page.fill('input[name="email"]', "juan@example.com");

    // Intentar enviar
    await page.click('button[type="submit"]');

    // Validación esperada
    await expect(page.getByText("El apellido debe tener al menos 2 caracteres")).toBeVisible();

    // Aseguramos que no se muestra mensaje de éxito
    await expect(page.getByText(/Perfil creado exitosamente/i)).toHaveCount(0);
  });

  test("mostrar error cuando el correo es inválido (Por favor ingresa un correo electrónico válido)", async ({ page }) => {
    await login(page);

    await page.goto("/create-profile");
    await expect(page.getByRole("heading", { name: /Crear Nuevo Perfil/i })).toBeVisible();

    // Rellenar nombre y apellido válidos
    await page.fill('input[name="nombre"]', "Juan");
    await page.fill('input[name="apellido"]', "Pérez");

    // Correo inválido
    await page.fill('input[name="email"]', "juan-no-valido");

    // Intentar enviar
    await page.click('button[type="submit"]');

    // Validación esperada
    await expect(page.getByText("Por favor ingresa un correo electrónico válido")).toBeVisible();

    // Aseguramos que no se muestra mensaje de éxito
    await expect(page.getByText(/Perfil creado exitosamente/i)).toHaveCount(0);
  });
});
