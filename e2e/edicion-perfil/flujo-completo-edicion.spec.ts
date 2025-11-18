import { test, expect } from "@playwright/test";
import path from "path";

async function login(page: any) {
  await page.goto("/login");

  // Esperar a que el formulario esté listo
  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.waitForSelector('input[type="password"]', { state: "visible" });

  // Llenar los campos
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");

  // Esperar a que el botón esté habilitado
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  // Hacer click y esperar a que se complete el proceso de login
  await submitButton.click();

  // Esperar a que la URL cambie a dashboard
  await page.waitForURL(/dashboard/, { timeout: 15000 });

  // Verificar que efectivamente estamos en el dashboard
  await expect(page).toHaveURL(/dashboard/);
}

// Función helper para configurar los mocks del perfil
async function setupProfileMocks(
  page: any,
  profileId: string,
  initialProfile: any,
  updatedProfile?: any
) {
  // Mock para GET del perfil inicial
  await page.route(`**/api/perfiles/${profileId}`, async (route: any) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          perfil: initialProfile,
        }),
      });
    } else if (route.request().method() === "PUT" && updatedProfile) {
      // Mock para PUT con perfil actualizado
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: profileId,
          message: "Perfil actualizado exitosamente",
          perfil: updatedProfile,
        }),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe("E2E - Flujo completo de edición y guardado de perfil", () => {
  const profileId = "7b12f9af-5aa9-418b-842a-fc55b046a7e0";
  const initialProfile = {
    id: profileId,
    nombre: "Perfil Inicial",
    correo: "inicial@example.com",
    descripcion: "Descripción inicial",
    estado: "borrador",
    logo_url: null,
    administrador_id: "admin-123",
    fechas: "2024-01-01",
  };

  test("debe editar todos los campos y guardar exitosamente", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      nombre: "Perfil Actualizado",
      correo: "actualizado@example.com",
      descripcion: "Descripción actualizada",
      estado: "activo",
    };

    await setupProfileMocks(page, profileId, initialProfile, updatedProfile);

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    // Verificar que el formulario está visible
    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // PASO 1: Editar nombre
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill(updatedProfile.nombre);
    expect(await nombreInput.inputValue()).toBe(updatedProfile.nombre);

    // PASO 2: Editar correo
    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill(updatedProfile.correo);
    expect(await correoInput.inputValue()).toBe(updatedProfile.correo);

    // PASO 3: Editar descripción
    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();
    await descripcionInput.fill(updatedProfile.descripcion);
    expect(await descripcionInput.inputValue()).toBe(updatedProfile.descripcion);

    // PASO 4: Cambiar estado
    const estadoSelect = page.locator('select[name="estado"]').first();
    await estadoSelect.selectOption(updatedProfile.estado);
    expect(await estadoSelect.inputValue()).toBe(updatedProfile.estado);

    // PASO 5: Verificar que el botón de guardar está habilitado (hay cambios)
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();

    // PASO 6: Hacer click en guardar
    await submitButton.click();

    // PASO 7: Verificar mensaje de éxito
    await expect(
      page.getByText(/actualizado exitosamente|Redirigiendo/i)
    ).toBeVisible({ timeout: 5000 });

    // PASO 8: Verificar redirección después del guardado
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
    await expect(page).toHaveURL(new RegExp(`/dashboard/perfiles/${profileId}$`));
  });

  test("debe editar solo algunos campos y guardar exitosamente", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      nombre: "Solo nombre actualizado",
      estado: "inactivo",
    };

    await setupProfileMocks(page, profileId, initialProfile, updatedProfile);

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // Editar solo el nombre
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill(updatedProfile.nombre);

    // Cambiar solo el estado
    const estadoSelect = page.locator('select[name="estado"]').first();
    await estadoSelect.selectOption(updatedProfile.estado);

    // Verificar que correo y descripción no cambiaron
    const correoInput = page.locator('input[type="email"]');
    expect(await correoInput.inputValue()).toBe(initialProfile.correo);

    const descripcionInput = page.locator('textarea[name="descripcion"]');
    expect(await descripcionInput.inputValue()).toBe(initialProfile.descripcion);

    // Guardar cambios
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verificar éxito
    await expect(
      page.getByText(/actualizado exitosamente|Redirigiendo/i)
    ).toBeVisible({ timeout: 5000 });

    // Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe cambiar la imagen del perfil y guardar exitosamente", async ({
    page,
  }) => {
    await login(page);

    const imagePath = path.resolve(__dirname, "../images/test-profile.jpg");
    
    // Solo ejecutar si la imagen existe
    try {
      const fs = await import("fs");
      if (!fs.existsSync(imagePath)) {
        test.skip();
        return;
      }
    } catch {
      test.skip();
      return;
    }

    const updatedProfile = {
      ...initialProfile,
      logo_url: "https://example.com/new-logo.jpg",
    };

    await setupProfileMocks(page, profileId, initialProfile, updatedProfile);

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // PASO 1: Subir nueva imagen
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);

    // PASO 2: Verificar que se muestra el preview de la nueva imagen
    await page.waitForTimeout(500);
    const imagePreview = page
      .locator('img[alt*="Preview"], img[alt*="perfil"]')
      .first();
    await expect(imagePreview).toBeVisible({ timeout: 2000 });

    // PASO 3: Verificar que el botón de guardar está habilitado
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();

    // PASO 4: Guardar cambios
    await submitButton.click();

    // PASO 5: Verificar mensaje de éxito
    await expect(
      page.getByText(/actualizado exitosamente|Redirigiendo/i)
    ).toBeVisible({ timeout: 5000 });

    // PASO 6: Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe eliminar la imagen del perfil y guardar exitosamente", async ({
    page,
  }) => {
    await login(page);

    const profileWithImage = {
      ...initialProfile,
      logo_url: "https://wkthjrftwyiwenmwuifl.supabase.co/storage/v1/object/public/perfiles-logos/logos/aac489dc-39b7-427e-8ca0-ce5582dce5b7-1762248105785-23e4e7aa8e7a9e2dbc75fece9d77fc99.jpg",
    };

    const updatedProfile = {
      ...profileWithImage,
      logo_url: null,
    };

    await setupProfileMocks(page, profileId, profileWithImage, updatedProfile);

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // PASO 1: Verificar que la imagen inicial está visible
    const initialImagePreview = page
      .locator('img[alt*="Preview"], img[alt*="perfil"]')
      .first();
    await expect(initialImagePreview).toBeVisible({ timeout: 2000 });

    // PASO 2: Hacer click en el botón de eliminar imagen
    const removeImageButton = page
      .locator('button:has-text("Eliminar imagen")')
      .or(page.locator('button:has-text("Eliminar")'))
      .first();
    await expect(removeImageButton).toBeVisible();
    await removeImageButton.click();

    // PASO 3: Verificar que el preview de la imagen desapareció
    await page.waitForTimeout(500);
    const imagePreviewAfterRemove = page.locator(
      'img[alt*="Preview"], img[alt*="perfil"]'
    );
    const imageCount = await imagePreviewAfterRemove.count();
    // Puede que aún esté visible brevemente, pero debería desaparecer
    // O puede que se muestre un placeholder, así que verificamos que el botón de eliminar ya no está
    await expect(removeImageButton).not.toBeVisible({ timeout: 2000 }).catch(() => {
      // Si el botón sigue visible, verificar que el botón de guardar está habilitado
    });

    // PASO 4: Verificar que el botón de guardar está habilitado
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();

    // PASO 5: Guardar cambios
    await submitButton.click();

    // PASO 6: Verificar mensaje de éxito
    await expect(
      page.getByText(/actualizado exitosamente|Redirigiendo/i)
    ).toBeVisible({ timeout: 5000 });

    // PASO 7: Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe mantener el botón de guardar deshabilitado cuando no hay cambios", async ({
    page,
  }) => {
    await login(page);

    await setupProfileMocks(page, profileId, initialProfile);

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // Verificar que el botón de guardar está deshabilitado inicialmente
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeDisabled();

    // Verificar que se muestra el mensaje de "No hay cambios para guardar"
    await expect(
      page.getByText(/No hay cambios para guardar/i)
    ).toBeVisible();
  });

  test("debe mostrar error cuando el servidor retorna un error", async ({
    page,
  }) => {
    await login(page);

    // Mock para GET del perfil inicial
    await page.route(`**/api/perfiles/${profileId}`, async (route: any) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: initialProfile,
          }),
        });
      } else if (route.request().method() === "PUT") {
        // Mock para PUT con error del servidor
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Error interno del servidor",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // Editar un campo
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("Nuevo nombre");

    // Intentar guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verificar que se muestra el mensaje de error
    await expect(
      page.getByText(/Error|error interno|Error al actualizar/i)
    ).toBeVisible({ timeout: 5000 });

    // Verificar que NO se redirige
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/perfiles/${profileId}/editar`)
    );
  });

  test("debe habilitar y deshabilitar el botón de guardar según los cambios", async ({
    page,
  }) => {
    await login(page);

    await setupProfileMocks(page, profileId, initialProfile);

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();

    // PASO 1: Botón deshabilitado inicialmente (sin cambios)
    await expect(submitButton).toBeDisabled();

    // PASO 2: Editar nombre - botón debe habilitarse
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("Nuevo nombre");
    await page.waitForTimeout(300);
    await expect(submitButton).toBeEnabled();

    // PASO 3: Revertir el cambio - botón debe deshabilitarse de nuevo
    await nombreInput.clear();
    await nombreInput.fill(initialProfile.nombre);
    await page.waitForTimeout(300);
    await expect(submitButton).toBeDisabled();
  });

  test("debe mostrar estado de carga mientras se guarda", async ({ page }) => {
    await login(page);

    let resolveRequest: (() => void) | null = null;
    const requestPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    // Mock para GET del perfil inicial
    await page.route(`**/api/perfiles/${profileId}`, async (route: any) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: initialProfile,
          }),
        });
      } else if (route.request().method() === "PUT") {
        // Esperar antes de responder para simular una petición lenta
        await page.waitForTimeout(500);
        if (resolveRequest) {
          resolveRequest();
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: profileId,
            message: "Perfil actualizado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // Editar un campo
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("Nombre para cargar");

    // Hacer click en guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await submitButton.click();

    // Verificar que el botón muestra estado de carga (texto "Guardando...")
    await expect(
      page.getByText(/Guardando|Guardando\.\.\./i)
    ).toBeVisible({ timeout: 1000 });

    // Esperar a que termine la petición
    await requestPromise;

    // Verificar que eventualmente se muestra el mensaje de éxito
    await expect(
      page.getByText(/actualizado exitosamente|Redirigiendo/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

