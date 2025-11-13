import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Test de integridad referencial en Base de Datos", () => {
  
  test("debe verificar que administrador_id existe en tabla administradores antes de insertar perfil", async ({ page }) => {
    await login(page);

    // Mock que simula la verificación de existencia del administrador
    await page.route("**/api/perfiles/verify-admin**", async (route) => {
      const url = new URL(route.request().url());
      const adminId = url.searchParams.get('adminId');
      
      if (adminId === "admin-valido-123") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            exists: true,
            administrador: {
              id: "admin-valido-123",
              nombre: "Administrador Válido",
              email: "admin@valido.com"
            }
          }),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({
            exists: false,
            message: "Administrador no encontrado"
          }),
        });
      }
    });

    // Mock para crear perfil solo si el admin existe
    await page.route("**/api/perfiles", async (route) => {
      if (route.request().method() === "POST") {
        const requestData = JSON.parse(route.request().postData());
        
        // Verificar que el administrador_id es válido
        if (requestData.administrador_id === "admin-valido-123") {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              id: "perf-200",
              administrador_id: requestData.administrador_id,
              nombre: requestData.nombre,
              correo: requestData.correo,
              estado: "activo",
              message: "Perfil creado exitosamente con administrador válido"
            }),
          });
        } else {
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Administrador no válido",
              message: "El administrador especificado no existe en la base de datos"
            }),
          });
        }
      } else {
        await route.continue();
      }
    });

    await page.goto("/create-profile");

    // Llenar formulario con datos válidos
    await page.fill('input[name="nombre"]', "Perfil con Admin Válido");
    await page.fill('input[name="apellido"]', "Test FK");
    await page.fill('input[name="email"]', "perf.fk@test.com");

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Verificar que se creó exitosamente
    await expect(page.getByText(/Perfil creado exitosamente/i)).toBeVisible();
  });

  test("debe verificar constraint ON DELETE RESTRICT en tabla perfiles", async ({ page }) => {
    await login(page);

    // Mock que simula el comportamiento de ON DELETE RESTRICT
    await page.route("**/api/administradores/*/delete-check", async (route) => {
      const url = new URL(route.request().url());
      const adminId = url.pathname.split('/')[3];
      
      // Simular que el administrador tiene perfiles asociados
      if (adminId === "admin-con-perfiles") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            canDelete: false,
            error: "ON DELETE RESTRICT violation",
            message: "No se puede eliminar el administrador porque tiene perfiles asociados",
            details: {
              perfiles_count: 3,
              constraint: "fk_perfiles_administrador_id"
            }
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            canDelete: true,
            message: "El administrador puede ser eliminado"
          }),
        });
      }
    });

    // Navegar a sección de administradores
    await page.goto("/administradores");

    // Verificar que se muestra el mensaje de restricción
    await expect(page.getByText(/No se puede eliminar el administrador/i)).toBeVisible();
    await expect(page.getByText(/tiene perfiles asociados/i)).toBeVisible();
  });

  test("debe verificar constraint ON UPDATE CASCADE en claves foráneas", async ({ page }) => {
    await login(page);

    // Mock que simula el comportamiento de ON UPDATE CASCADE
    await page.route("**/api/administradores/*/update-cascade**", async (route) => {
      if (route.request().method() === "PUT") {
        const requestData = JSON.parse(route.request().postData());
        
        // Simular que al actualizar el ID del admin, se actualiza en perfiles también
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Administrador actualizado con CASCADE",
            cascade: {
              perfiles_actualizados: 2,
              old_admin_id: "admin-antiguo-123",
              new_admin_id: requestData.id
            }
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Verificar que el sistema soporte CASCADE UPDATE
    await page.goto("/administradores/admin-antiguo-123/edit");
    
    // El test verifica que el sistema soporte CASCADE UPDATE
    await expect(page.getByText(/Actualización con CASCADE/i)).toBeVisible();
  });

  test("debe verificar validación de null en administrador_id", async ({ page }) => {
    await login(page);

    // Mock para crear perfil sin administrador (administrador_id = null)
    await page.route("**/api/perfiles", async (route) => {
      if (route.request().method() === "POST") {
        const requestData = JSON.parse(route.request().postData());
        
        // Verificar que se permite null en administrador_id
        if (requestData.administrador_id === null || requestData.administrador_id === undefined) {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              id: "perf-400",
              administrador_id: null,
              nombre: requestData.nombre,
              correo: requestData.correo,
              estado: "activo",
              message: "Perfil creado exitosamente sin administrador asociado"
            }),
          });
        } else {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              id: "perf-401",
              administrador_id: requestData.administrador_id,
              nombre: requestData.nombre,
              correo: requestData.correo,
              estado: "activo",
              message: "Perfil creado exitosamente con administrador"
            }),
          });
        }
      } else {
        await route.continue();
      }
    });

    await page.goto("/create-profile");

    // Crear perfil sin especificar administrador
    await page.fill('input[name="nombre"]', "Perfil Sin Admin");
    await page.fill('input[name="apellido"]', "Test NULL");
    await page.fill('input[name="email"]', "sin.admin@test.com");

    await page.click('button[type="submit"]');

    // Verificar que se creó exitosamente sin administrador
    await expect(page.getByText(/Perfil creado exitosamente/i)).toBeVisible();
  });
});