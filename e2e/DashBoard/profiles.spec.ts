import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Listado de perfiles del usuario", () => {
  test("lista perfiles cuando la API responde 200 con datos", async ({
    page,
  }) => {
    await login(page);

    await page.route("**/api/perfiles**", async (route) => {
      const perfiles = [
        {
          id: "1",
          administrador_id: null,
          nombre: "Empresa Uno",
          logo_url: null,
          correo: "uno@empresa.com",
          estado: "activo",
          fechas: new Date().toISOString(),
        },
        {
          id: "2",
          administrador_id: null,
          nombre: "Empresa Dos",
          logo_url: null,
          correo: "dos@empresa.com",
          estado: "inactivo",
          fechas: new Date().toISOString(),
        },
        {
          id: "3",
          administrador_id: null,
          nombre: "Empresa Tres",
          logo_url: null,
          correo: null,
          estado: "activo",
          fechas: new Date().toISOString(),
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ perfiles }),
      });
    });

    await page.goto("/dashboard/perfiles");

    await expect(
      page.getByRole("heading", { name: /Perfiles/i })
    ).toBeVisible();
    await expect(page.getByText(/3\s+perfiles\s+en total/i)).toBeVisible();

    await expect(page.getByText("Empresa Uno")).toBeVisible();
    await expect(page.getByText("Empresa Dos")).toBeVisible();
    await expect(page.getByText("Empresa Tres")).toBeVisible();
  });

  test("muestra estado vacío cuando la API devuelve lista vacía", async ({
    page,
  }) => {
    await login(page);

    await page.route("**/api/perfiles**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ perfiles: [] }),
      });
    });

    await page.goto("/dashboard/perfiles");

    await expect(page.getByText(/No se encontraron perfiles/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Crear perfil/i })
    ).toBeVisible();
  });

  test("muestra mensaje de error cuando la API falla", async ({ page }) => {
    await login(page);

    await page.route("**/api/perfiles**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Fallo interno" }),
      });
    });

    await page.goto("/dashboard/perfiles");

    await expect(page.getByText(/Error al cargar perfiles/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Intentar de nuevo/i })
    ).toBeVisible();
  });
});

test.describe("E2E - Test de acceso denegado a perfil de otro usuario (403)", () => {
  test("debe denegar acceso cuando se intenta acceder a un perfil de otro usuario", async ({
    page,
  }) => {
    await login(page);

    // Mock del API para simular un perfil que pertenece a otro usuario
    await page.route("**/api/perfiles/*", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: "No tienes permiso para acceder a este perfil",
        }),
      });
    });

    // Intentar acceder a un perfil de otro usuario
    await page.goto("/dashboard/perfiles/999");

    // Verificar que se muestra el mensaje de error
    await expect(page.getByText(/Error al cargar el perfil/i)).toBeVisible();
    await expect(
      page.getByText(/No tienes permiso para acceder a este perfil/i)
    ).toBeVisible();

    // Verificar que aparece el botón para volver al listado
    await expect(
      page.getByRole("button", { name: /Volver al listado/i })
    ).toBeVisible();
  });
});
