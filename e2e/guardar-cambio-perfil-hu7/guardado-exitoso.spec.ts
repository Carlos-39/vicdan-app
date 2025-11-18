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

test.describe("E2E - Test de guardado exitoso de perfil", () => {
  const profileId = "test-profile-guardado-exitoso-123";
  const initialProfile = {
    id: profileId,
    nombre: "Perfil Inicial Test",
    correo: "inicial.test@example.com",
    descripcion: "Descripción inicial para test",
    estado: "borrador",
    logo_url: null,
    administrador_id: "admin-123",
    fechas: "2024-01-01",
  };

  test("debe guardar exitosamente cuando se edita el nombre", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      nombre: "Perfil Actualizado - Nombre",
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

    // PASO 1: Editar solo el nombre
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill(updatedProfile.nombre);

    // PASO 2: Verificar que el botón de guardar está habilitado
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();

    // PASO 3: Hacer click en guardar
    await submitButton.click();

    // PASO 4: Verificar que se muestra el mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // PASO 5: Verificar redirección a la página de detalle del perfil
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/perfiles/${profileId}$`)
    );
  });

  test("debe guardar exitosamente cuando se edita el correo electrónico", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      correo: "nuevo.correo@example.com",
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

    // Editar correo
    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill(updatedProfile.correo);

    // Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verificar mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe guardar exitosamente cuando se edita la descripción", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      descripcion: "Nueva descripción actualizada para el perfil de prueba",
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

    // Editar descripción
    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();
    await descripcionInput.fill(updatedProfile.descripcion);

    // Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verificar mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe guardar exitosamente cuando se cambia el estado", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      estado: "activo",
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

    // Cambiar estado
    const estadoSelect = page.locator('select[name="estado"]').first();
    await estadoSelect.selectOption(updatedProfile.estado);

    // Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verificar mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe guardar exitosamente cuando se editan todos los campos simultáneamente", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      nombre: "Perfil Completo Actualizado",
      correo: "completo.actualizado@example.com",
      descripcion: "Descripción completa actualizada con todos los cambios",
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

    // PASO 1: Editar nombre
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill(updatedProfile.nombre);

    // PASO 2: Editar correo
    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill(updatedProfile.correo);

    // PASO 3: Editar descripción
    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();
    await descripcionInput.fill(updatedProfile.descripcion);

    // PASO 4: Cambiar estado
    const estadoSelect = page.locator('select[name="estado"]').first();
    await estadoSelect.selectOption(updatedProfile.estado);

    // PASO 5: Verificar que todos los valores están actualizados
    expect(await nombreInput.inputValue()).toBe(updatedProfile.nombre);
    expect(await correoInput.inputValue()).toBe(updatedProfile.correo);
    expect(await descripcionInput.inputValue()).toBe(
      updatedProfile.descripcion
    );
    expect(await estadoSelect.inputValue()).toBe(updatedProfile.estado);

    // PASO 6: Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // PASO 7: Verificar mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // PASO 8: Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe guardar exitosamente cuando se sube una nueva imagen", async ({
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

    // Subir nueva imagen
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);

    // Esperar a que se procese la imagen
    await page.waitForTimeout(500);

    // Verificar que se muestra el preview
    const imagePreview = page
      .locator('img[alt*="Preview"], img[alt*="perfil"]')
      .first();
    await expect(imagePreview).toBeVisible({ timeout: 2000 });

    // Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verificar mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe guardar exitosamente cuando se elimina la imagen", async ({
    page,
  }) => {
    await login(page);

    const profileWithImage = {
      ...initialProfile,
      logo_url: "https://example.com/existing-logo.jpg",
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

    // Verificar que la imagen inicial está visible
    const initialImagePreview = page
      .locator('img[alt*="Preview"], img[alt*="perfil"]')
      .first();
    await expect(initialImagePreview).toBeVisible({ timeout: 2000 });

    // Eliminar imagen
    const removeImageButton = page
      .locator('button:has-text("Eliminar imagen")')
      .or(page.locator('button:has-text("Eliminar")'))
      .first();
    await expect(removeImageButton).toBeVisible();
    await removeImageButton.click();

    await page.waitForTimeout(500);

    // Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verificar mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // Verificar redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });
  });

  test("debe mostrar el estado de carga mientras se guarda", async ({
    page,
  }) => {
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
        // Esperar antes de responder para poder capturar el estado de carga
        await page.waitForTimeout(1000);
        if (resolveRequest) {
          resolveRequest();
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: profileId,
            message: "Perfil actualizado exitosamente",
            perfil: {
              ...initialProfile,
              nombre: "Perfil Actualizado",
            },
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

    // Editar nombre
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("Perfil Actualizado");

    // Hacer click en guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await submitButton.click();

    // PASO 1: Verificar que el botón muestra estado de carga
    await expect(page.getByText(/Guardando|Guardando\.\.\./i)).toBeVisible({
      timeout: 1000,
    });

    // PASO 2: Verificar que el botón está deshabilitado durante el guardado
    await expect(submitButton).toBeDisabled({ timeout: 500 });

    // Esperar a que termine la petición
    await requestPromise;
    await page.waitForTimeout(500);

    // PASO 3: Verificar que eventualmente se muestra el mensaje de éxito
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });
  });

  test("debe redirigir correctamente después del guardado exitoso", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      nombre: "Perfil para Redirección",
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

    // Editar un campo
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill(updatedProfile.nombre);

    // Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await submitButton.click();

    // Verificar mensaje de éxito primero
    await expect(
      page.getByText("¡Perfil actualizado exitosamente! Redirigiendo...")
    ).toBeVisible({ timeout: 5000 });

    // Verificar que la URL cambia de /editar a la página de detalle
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });

    // Verificar que la URL final NO contiene /editar
    const currentUrl = page.url();
    expect(currentUrl).toContain(`/dashboard/perfiles/${profileId}`);
    expect(currentUrl).not.toContain("/editar");

    // Verificar que estamos en la página de detalle (no en edición)
    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).not.toBeVisible({ timeout: 3000 });
  });

  test("debe mantener los datos guardados después de la redirección", async ({
    page,
  }) => {
    await login(page);

    const updatedProfile = {
      ...initialProfile,
      nombre: "Perfil Persistente",
      correo: "persistente@example.com",
      estado: "activo",
    };

    // Mock para GET después del guardado (para verificar que los datos se guardaron)
    await page.route(`**/api/perfiles/${profileId}`, async (route: any) => {
      if (route.request().method() === "GET") {
        // Retornar el perfil actualizado para simular que se guardó
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: updatedProfile,
          }),
        });
      } else if (route.request().method() === "PUT") {
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

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // Editar campos
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill(updatedProfile.nombre);

    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill(updatedProfile.correo);

    const estadoSelect = page.locator('select[name="estado"]').first();
    await estadoSelect.selectOption(updatedProfile.estado);

    // Guardar
    const submitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Guardar Cambios/i })
      .first();
    await submitButton.click();

    // Esperar a la redirección
    await page.waitForURL(`**/dashboard/perfiles/${profileId}`, {
      timeout: 5000,
    });

    // Verificar que los datos se mantienen (navegar de nuevo a editar para verificar)
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    // Verificar que los valores guardados están presentes
    const nombreValue = await nombreInput.inputValue();
    expect(nombreValue).toBe(updatedProfile.nombre);

    const correoValue = await correoInput.inputValue();
    expect(correoValue).toBe(updatedProfile.correo);

    const estadoValue = await estadoSelect.inputValue();
    expect(estadoValue).toBe(updatedProfile.estado);
  });
});
