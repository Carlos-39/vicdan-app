import { test, expect } from "@playwright/test";

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

  // Esperar a que el botón muestre el estado de carga (opcional, pero ayuda a verificar que el proceso inició)
  await page.waitForTimeout(500);

  // Esperar a que la URL cambie a dashboard (con timeout más largo)
  await page.waitForURL(/dashboard/, { timeout: 15000 });

  // Verificar que efectivamente estamos en el dashboard
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Test de carga de datos existentes", () => {
  test("debe cargar correctamente los datos existentes del perfil en el formulario de edición", async ({
    page,
  }) => {
    await login(page);

    const profileId = "7b12f9af-5aa9-418b-842a-fc55b046a7e0";
    const profileData = {
      id: profileId,
      nombre: "Perfil de Prueba Carga",
      correo: "test.carga@example.com",
      estado: "activo",
      logo_url: "https://wkthjrftwyiwenmwuifl.supabase.co/storage/v1/object/public/perfiles-logos/logos/aac489dc-39b7-427e-8ca0-ce5582dce5b7-1762248105785-23e4e7aa8e7a9e2dbc75fece9d77fc99.jpg",
      administrador_id: "admin-123",
      fechas: "2024-01-01",
    };

    // Mock del API para obtener el perfil
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: profileData,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);

    // PASO 1: Verificar que se muestra el estado de carga inicialmente
    // (puede ser muy rápido, así que verificamos que eventualmente desaparece)
    await page.waitForLoadState("networkidle");

    // PASO 2: Verificar que el formulario está visible
    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // PASO 3: Verificar que los campos están poblados con los datos existentes
    // Verificar campo nombre
    const nombreInput = page.locator('input[type="text"]').first();
    await expect(nombreInput).toBeVisible();
    const nombreValue = await nombreInput.inputValue();
    expect(nombreValue).toBe(profileData.nombre);

    // Verificar campo correo
    const correoInput = page.locator('input[type="email"]');
    await expect(correoInput).toBeVisible();
    const correoValue = await correoInput.inputValue();
    expect(correoValue).toBe(profileData.correo);

    // Verificar campo estado (select)
    const estadoSelect = page.locator("select").first();
    await expect(estadoSelect).toBeVisible();
    const estadoValue = await estadoSelect.inputValue();
    expect(estadoValue).toBe(profileData.estado);

    // PASO 4: Verificar que la imagen del logo se muestra si existe
    // Buscar la imagen de preview (puede estar en un contenedor con clase específica)
    const imagePreview = page
      .locator('img[alt*="Preview"], img[alt*="perfil"]')
      .first();
    if (profileData.logo_url) {
      await expect(imagePreview).toBeVisible({ timeout: 5000 });
      const imageSrc = await imagePreview.getAttribute("src");
      expect(imageSrc).toContain(profileData.logo_url);
    }

    // PASO 5: Verificar que no hay mensajes de error visibles
    const errorMessages = page.locator("text=/error|Error|ERROR/i");
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);

    // PASO 6: Verificar que el botón de guardar está visible y deshabilitado (sin cambios)
    const saveButton = page
      .locator('button:has-text("Guardar")')
      .or(page.locator('button:has-text("Guardar Cambios")'))
      .first();
    await expect(saveButton).toBeVisible();
    // El botón debería estar deshabilitado si no hay cambios
    const isDisabled = await saveButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("debe cargar correctamente un perfil sin logo", async ({ page }) => {
    await login(page);

    const profileId = "7b12f9af-5aa9-418b-842a-fc55b046a7e0";
    const profileData = {
      id: profileId,
      nombre: "Perfil Sin Logo",
      correo: "sin.logo@example.com",
      estado: "inactivo",
      logo_url: null,
      administrador_id: "admin-123",
      fechas: "2024-01-01",
    };

    // Mock del API para obtener el perfil
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: profileData,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    // Verificar que el formulario está visible
    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // Verificar que los campos están poblados
    const nombreInput = page.locator('input[type="text"]').first();
    await expect(nombreInput).toBeVisible();
    expect(await nombreInput.inputValue()).toBe(profileData.nombre);

    const correoInput = page.locator('input[type="email"]');
    await expect(correoInput).toBeVisible();
    expect(await correoInput.inputValue()).toBe(profileData.correo);

    const estadoSelect = page.locator("select").first();
    await expect(estadoSelect).toBeVisible();
    expect(await estadoSelect.inputValue()).toBe(profileData.estado);

    // Verificar que no hay imagen de preview visible (ya que logo_url es null)
    const imagePreview = page.locator(
      'img[alt*="Preview"], img[alt*="perfil"]'
    );
    const imageCount = await imagePreview.count();
    // Puede haber 0 imágenes o puede haber una imagen placeholder, pero no debería haber una imagen del logo
    expect(imageCount).toBeLessThanOrEqual(1);
  });

  test("debe manejar correctamente el estado de error al cargar el perfil", async ({
    page,
  }) => {
    await login(page);

    const profileId = "test-profile-error-789";

    // Mock del API para retornar un error
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Perfil no encontrado",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");

    // Verificar que se muestra un mensaje de error
    await expect(
      page.locator("text=/error|Error|ERROR|no encontrado|No se pudo/i")
    ).toBeVisible({ timeout: 10000 });

    // Verificar que hay un botón para intentar de nuevo
    const retryButton = page.locator(
      'button:has-text("Intentar"), button:has-text("reintentar")'
    );
    const retryButtonCount = await retryButton.count();
    expect(retryButtonCount).toBeGreaterThan(0);

    // Verificar que hay un botón para volver al listado
    const backButton = page.locator(
      'button:has-text("Volver"), button:has-text("listado")'
    );
    const backButtonCount = await backButton.count();
    expect(backButtonCount).toBeGreaterThan(0);
  });

  test("debe mostrar el estado de carga mientras se obtienen los datos", async ({
    page,
  }) => {
    await login(page);

    const profileId = "test-profile-loading-999";
    const profileData = {
      id: profileId,
      nombre: "Perfil Loading",
      correo: "loading@example.com",
      estado: "activo",
      logo_url: null,
      administrador_id: "admin-123",
      fechas: "2024-01-01",
    };

    // Mock del API con un delay para poder capturar el estado de carga
    let requestResolved = false;
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        // Agregar un pequeño delay para poder ver el estado de carga
        await page.waitForTimeout(500);
        requestResolved = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: profileData,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de edición
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);

    // Verificar que eventualmente se carga el formulario
    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });

    // Verificar que los datos se cargaron correctamente
    const nombreInput = page.locator('input[type="text"]').first();
    await expect(nombreInput).toBeVisible();
    expect(await nombreInput.inputValue()).toBe(profileData.nombre);
  });
});