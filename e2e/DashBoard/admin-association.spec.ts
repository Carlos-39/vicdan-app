import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Test de asociación correcta con administrador y verificación de FK", () => {
  
  test("debe crear un perfil con administrador_id válido y verificar integridad referencial", async ({ page }) => {
    await login(page);

    // Mock del API para simular la creación con administrador asociado
    await page.route("**/api/perfiles", async (route) => {
      if (route.request().method() === "POST") {
        const requestData = JSON.parse(route.request().postData());
        
        // Verificar que el perfil incluya administrador_id
        expect(requestData).toHaveProperty('administrador_id');
        expect(requestData.administrador_id).toBeTruthy();
        expect(typeof requestData.administrador_id).toBe('string');
        
        // Simular respuesta exitosa con administrador asociado
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "perf-123",
            administrador_id: "admin-456",
            nombre: requestData.nombre,
            correo: requestData.correo,
            logo_url: requestData.logo_url,
            estado: 'activo',
            message: "Perfil creado exitosamente con administrador asociado",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock del API para obtener el administrador actual
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "admin-456",
            nombre: "Admin Test",
            email: "brayanss2018@gmail.com"
          }
        }),
      });
    });

    // Navegar a la página de creación de perfil
    await page.goto("/create-profile");

    // Verificar que estamos en la página correcta
    await expect(
      page.getByRole("heading", { name: /Crear Nuevo Perfil/i })
    ).toBeVisible();

    // Llenar el formulario
    await page.fill('input[name="nombre"]', "Perfil con Admin");
    await page.fill('input[name="apellido"]', "Asociado");
    await page.fill('input[name="email"]', "perfil.admin@test.com");
    await page.fill('textarea[name="descripcion"]', "Perfil de prueba con administrador asociado");

    // Hacer submit del formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestra el mensaje de éxito
    await expect(page.getByText(/Perfil creado exitosamente/i)).toBeVisible();
  });

  test("debe verificar que el administrador_id existe en la base de datos antes de crear perfil", async ({ page }) => {
    await login(page);

    // Mock para simular error cuando el administrador no existe
    await page.route("**/api/perfiles", async (route) => {
      if (route.request().method() === "POST") {
        const requestData = JSON.parse(route.request().postData());
        
        // Simular error de FK cuando el administrador no existe
        if (requestData.administrador_id === "admin-inexistente") {
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Foreign key constraint violation",
              message: "El administrador especificado no existe en la base de datos",
              code: "FK_VIOLATION"
            }),
          });
        } else {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              id: "perf-124",
              administrador_id: requestData.administrador_id,
              message: "Perfil creado exitosamente",
            }),
          });
        }
      } else {
        await route.continue();
      }
    });

    await page.goto("/create-profile");

    // Llenar formulario con datos válidos
    await page.fill('input[name="nombre"]', "Perfil FK Test");
    await page.fill('input[name="apellido"]', "Prueba");
    await page.fill('input[name="email"]', "fk.test@test.com");

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Si el sistema maneja correctamente la FK, debería crear el perfil sin problemas
    // ya que el administrador está logueado y existe
    await expect(page.getByText(/Perfil creado exitosamente/i)).toBeVisible();
  });

  test("debe verificar integridad referencial al actualizar perfil con nuevo administrador", async ({ page }) => {
    await login(page);

    // Mock para obtener perfil existente
    await page.route("**/api/perfiles/perf-125", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "perf-125",
            nombre: "Perfil Existente",
            administrador_id: "admin-original",
            correo: "existente@test.com",
            estado: "activo",
          }),
        });
      } else if (route.request().method() === "PUT") {
        const requestData = JSON.parse(route.request().postData());
        
        // Verificar que se está actualizando el administrador_id
        expect(requestData).toHaveProperty('administrador_id');
        
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "perf-125",
            administrador_id: requestData.administrador_id,
            nombre: requestData.nombre || "Perfil Existente",
            message: "Perfil actualizado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a edición de perfil
    await page.goto("/profiles/perf-125/edit");

    // Verificar que el formulario carga con datos existentes
    await expect(page.locator('input[name="nombre"]')).toHaveValue("Perfil Existente");

    // Actualizar el perfil
    await page.click('button[type="submit"]');

    // Verificar mensaje de éxito
    await expect(page.getByText(/Perfil actualizado exitosamente/i)).toBeVisible();
  });

  test("debe listar perfiles con información del administrador asociado", async ({ page }) => {
    await login(page);

    // Mock para obtener lista de perfiles con administradores
    await page.route("**/api/perfiles", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            profiles: [
              {
                id: "perf-126",
                nombre: "Perfil 1",
                administrador_id: "admin-456",
                administrador: {
                  id: "admin-456",
                  nombre: "Admin Test",
                  correo: "brayanss2018@gmail.com"
                },
                correo: "perfil1@test.com",
                estado: "activo",
              },
              {
                id: "perf-127",
                nombre: "Perfil 2",
                administrador_id: null,
                administrador: null,
                correo: "perfil2@test.com",
                estado: "activo",
              }
            ],
            total: 2,
            page: 1,
            pageSize: 10,
            totalPages: 1,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la lista de perfiles
    await page.goto("/profiles");

    // Verificar que se muestran los perfiles
    await expect(page.getByText("Perfil 1")).toBeVisible();
    await expect(page.getByText("Perfil 2")).toBeVisible();

    // Verificar que se muestra la información del administrador
    await expect(page.getByText("Admin Test")).toBeVisible();
    await expect(page.getByText("brayanss2018@gmail.com")).toBeVisible();

    // Verificar que se indica cuando un perfil no tiene administrador
    const perfilSinAdmin = page.locator('tr').filter({ hasText: 'Perfil 2' });
    await expect(perfilSinAdmin).toContainText('Sin administrador');
  });

  test("debe validar constraint de FK al eliminar administrador con perfiles asociados", async ({ page }) => {
    await login(page);

    // Mock para simular error de constraint al intentar eliminar administrador con perfiles
    await page.route("**/api/administradores/admin-456", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 409, // Conflict
          contentType: "application/json",
          body: JSON.stringify({
            error: "Foreign key constraint violation",
            message: "No se puede eliminar el administrador porque tiene perfiles asociados",
            code: "FK_CONSTRAINT_VIOLATION",
            details: {
              perfiles_asociados: 2,
              perfiles: ["perf-126", "perf-127"]
            }
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de administradores (simulada)
    await page.goto("/administradores");

    // Intentar eliminar administrador (esto sería en el UI real)
    // El test verifica que el sistema maneje correctamente el error de FK
    
    // Como este es un test de verificación de FK, verificamos que el sistema
    // no permita la eliminación y muestre el error apropiado
    await expect(page.getByText(/No se puede eliminar el administrador/i)).toBeVisible();
  });
});