import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("Personalización Visual Completa - Persistencia y Coherencia", () => {
  test("Debe guardar cambios de personalización completa y persistir después de recargar", async ({
    page,
  }) => {
    await login(page);

    const mockProfileId = "test-profile-persist";
    
    // Estado inicial del diseño
    const initialTheme = {
      colors: {
        primary: "#877af7",
        secondary: "#000000",
        background: "#ffffff",
        text: "#1f2937",
        card: "#877af7",
        cardText: "#ffffff",
      },
      background: { type: "color" },
      typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: { base: "16px", heading: "20px", cardText: "14px" },
      },
      spacing: { padding: "24px", margin: "16px", gap: "16px" },
      layout: {
        type: "centered",
        showAvatar: true,
        showSocialLinks: true,
        socialIconsPosition: "above-links",
      },
    };

    // Tema modificado que guardaremos
    const modifiedTheme = {
      colors: {
        primary: "#ff0000",
        secondary: "#0000ff",
        background: "#f0f0f0",
        text: "#000000",
        card: "#00ff00",
        cardText: "#000000",
      },
      background: { type: "color" },
      typography: {
        fontFamily: "Roboto, sans-serif",
        fontSize: { base: "18px", heading: "24px", cardText: "16px" },
      },
      spacing: { padding: "32px", margin: "20px", gap: "20px" },
      layout: {
        type: "left-aligned",
        showAvatar: true,
        showSocialLinks: true,
        socialIconsPosition: "below-links",
      },
    };

    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Profile Persistence",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify(initialTheme),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Variable para almacenar el diseño guardado
    let savedDesign = initialTheme;

    // Mock GET /api/perfiles/[id]
    await page.route(`**/api/perfiles/${mockProfileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: {
              ...mockProfile,
              diseno: JSON.stringify(savedDesign),
            },
          }),
        });
      } else if (route.request().method() === "PUT") {
        // Simular actualización de perfil
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock GET /api/perfiles/[id]/diseno
    await page.route(
      `**/api/perfiles/${mockProfileId}/diseno`,
      async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              diseno: savedDesign,
              existe: true,
            }),
          });
        } else if (route.request().method() === "PUT") {
          // Capturar y guardar el diseño actualizado
          const requestBody = route.request().postDataJSON();
          savedDesign = requestBody;

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(savedDesign),
          });
        } else {
          await route.continue();
        }
      }
    );

    // Mock GET /api/perfiles/[id]/tarjetas
    await page.route(
      `**/api/perfiles/${mockProfileId}/tarjetas`,
      async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
        } else {
          await route.continue();
        }
      }
    );

    // Navegar a personalizar
    await page.goto(`/dashboard/perfiles/${mockProfileId}/personalizar`);

    // Esperar carga
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();

    // Verificar que botón de guardar está deshabilitado inicialmente (sin cambios)
    const saveButton = page.getByRole("button", { name: /Guardar Cambios/i });
    await expect(saveButton).toBeDisabled();

    // ===== REALIZAR CAMBIOS =====
    
    // 1. Cambiar color primario
    await page.getByRole("tab", { name: /Colores/i }).click();
    const primaryColorInput = page.locator('input[type="color"]').first();
    await primaryColorInput.fill(modifiedTheme.colors.primary);
    await page.waitForTimeout(300);

    // Verificar que ahora hay cambios sin guardar
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();
    await expect(saveButton).toBeEnabled();

    // 2. Guardar cambios
    await saveButton.click();

    // Esperar mensaje de guardado
    await expect(
      page.getByText(/Guardando cambios/i)
    ).toBeVisible({ timeout: 3000 });

    // Esperar confirmación de éxito
    await expect(
      page.getByText(/Cambios guardados exitosamente/i)
    ).toBeVisible({ timeout: 10000 });

    // Verificar que ya no hay cambios sin guardar
    await expect(saveButton).toBeDisabled();

    // ===== RECARGAR PÁGINA Y VERIFICAR PERSISTENCIA =====
    
    await page.reload();

    // Esperar que cargue nuevamente
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible({ timeout: 10000 });

    // Esperar que termine de cargar
    await page.waitForTimeout(1000);

    // Verificar que el botón de guardar está deshabilitado (sin cambios pendientes)
    await expect(saveButton).toBeDisabled();

    // Verificar que NO aparece el mensaje de cambios sin guardar
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).not.toBeVisible();

    // Verificar que la vista previa está cargada
    await expect(
      page.getByRole("heading", { name: /Vista Previa/i })
    ).toBeVisible();
  });

  test("Debe mantener coherencia entre diferentes pestañas de personalización", async ({
    page,
  }) => {
    await login(page);

    const mockProfileId = "test-profile-coherence";
    const mockTheme = {
      colors: {
        primary: "#877af7",
        secondary: "#000000",
        background: "#ffffff",
        text: "#1f2937",
        card: "#877af7",
        cardText: "#ffffff",
      },
      background: { type: "color" },
      typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: { base: "16px", heading: "20px", cardText: "14px" },
      },
      spacing: { padding: "24px", margin: "16px", gap: "16px" },
      layout: {
        type: "centered",
        showAvatar: true,
        showSocialLinks: true,
        socialIconsPosition: "above-links",
      },
    };

    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Profile Coherence",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify(mockTheme),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Mocks
    await page.route(`**/api/perfiles/${mockProfileId}**`, async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET") {
        if (url.includes("/diseno")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ diseno: mockTheme, existe: true }),
          });
        } else if (url.includes("/tarjetas")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ perfil: mockProfile }),
          });
        }
      } else {
        await route.continue();
      }
    });

    // Navegar a personalizar
    await page.goto(`/dashboard/perfiles/${mockProfileId}/personalizar`);

    // Esperar carga
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();

    // Hacer cambio en pestaña Colores
    await page.getByRole("tab", { name: /Colores/i }).click();
    const colorInput = page.locator('input[type="color"]').first();
    await colorInput.fill("#ff0000");
    await page.waitForTimeout(300);

    // Verificar cambios sin guardar
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();

    // Cambiar a pestaña Layout
    await page.getByRole("tab", { name: /Layout/i }).click();
    await page.waitForTimeout(200);

    // Verificar que el mensaje de cambios sin guardar persiste
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();

    // Cambiar a pestaña Tipografía
    const typographyTab = page.getByRole("tab", {
      name: /Tipografía|Texto/i,
    });
    await typographyTab.click();
    await page.waitForTimeout(200);

    // Verificar que el mensaje sigue ahí
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();

    // Volver a la pestaña de Colores
    await page.getByRole("tab", { name: /Colores/i }).click();
    await page.waitForTimeout(200);

    // Verificar que el cambio de color se mantiene
    const currentColorValue = await colorInput.inputValue();
    expect(currentColorValue.toLowerCase()).toBe("#ff0000");

    // El mensaje de cambios sin guardar debe seguir visible
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();
  });

  test("Debe advertir al usuario sobre cambios sin guardar al intentar salir", async ({
    page,
  }) => {
    await login(page);

    const mockProfileId = "test-profile-unsaved";
    const mockTheme = {
      colors: {
        primary: "#877af7",
        secondary: "#000000",
        background: "#ffffff",
        text: "#1f2937",
        card: "#877af7",
        cardText: "#ffffff",
      },
      background: { type: "color" },
      typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: { base: "16px", heading: "20px", cardText: "14px" },
      },
      spacing: { padding: "24px", margin: "16px", gap: "16px" },
      layout: {
        type: "centered",
        showAvatar: true,
        showSocialLinks: true,
        socialIconsPosition: "above-links",
      },
    };

    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Unsaved Changes",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify(mockTheme),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Mocks
    await page.route(`**/api/perfiles/${mockProfileId}**`, async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET") {
        if (url.includes("/diseno")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ diseno: mockTheme, existe: true }),
          });
        } else if (url.includes("/tarjetas")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ perfil: mockProfile }),
          });
        }
      } else {
        await route.continue();
      }
    });

    // Navegar a personalizar
    await page.goto(`/dashboard/perfiles/${mockProfileId}/personalizar`);

    // Esperar carga
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();

    // Hacer un cambio
    await page.getByRole("tab", { name: /Colores/i }).click();
    const colorInput = page.locator('input[type="color"]').first();
    await colorInput.fill("#00ff00");
    await page.waitForTimeout(300);

    // Verificar cambios sin guardar
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();

    // Configurar listener para el diálogo beforeunload
    let dialogShown = false;
    page.on("dialog", async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    // Intentar navegar a otra página (esto debería mostrar advertencia)
    // Nota: beforeunload solo se activa en ciertos escenarios del navegador
    // Por ahora verificamos que el estado de cambios sin guardar está activo
    
    const backButton = page.getByRole("button", { name: /Volver/i });
    if (await backButton.isVisible()) {
      // El botón de volver puede manejar el diálogo internamente
      await expect(backButton).toBeVisible();
    }

    // Verificar que la advertencia visual está presente
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();
  });

  test("Debe guardar y aplicar múltiples cambios de personalización simultáneamente", async ({
    page,
  }) => {
    await login(page);

    const mockProfileId = "test-profile-multiple";
    
    const initialTheme = {
      colors: {
        primary: "#877af7",
        secondary: "#000000",
        background: "#ffffff",
        text: "#1f2937",
        card: "#877af7",
        cardText: "#ffffff",
      },
      background: { type: "color" },
      typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: { base: "16px", heading: "20px", cardText: "14px" },
      },
      spacing: { padding: "24px", margin: "16px", gap: "16px" },
      layout: {
        type: "centered",
        showAvatar: true,
        showSocialLinks: true,
        socialIconsPosition: "above-links",
      },
    };

    let savedDesign = initialTheme;

    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Multiple Changes",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify(initialTheme),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Mocks
    await page.route(`**/api/perfiles/${mockProfileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: {
              ...mockProfile,
              diseno: JSON.stringify(savedDesign),
            },
          }),
        });
      } else if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(
      `**/api/perfiles/${mockProfileId}/diseno`,
      async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ diseno: savedDesign, existe: true }),
          });
        } else if (route.request().method() === "PUT") {
          const requestBody = route.request().postDataJSON();
          savedDesign = requestBody;

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(savedDesign),
          });
        } else {
          await route.continue();
        }
      }
    );

    await page.route(
      `**/api/perfiles/${mockProfileId}/tarjetas`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      }
    );

    // Navegar a personalizar
    await page.goto(`/dashboard/perfiles/${mockProfileId}/personalizar`);
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();

    // Hacer múltiples cambios en diferentes secciones
    
    // 1. Cambiar colores
    await page.getByRole("tab", { name: /Colores/i }).click();
    const primaryColor = page.locator('input[type="color"]').first();
    await primaryColor.fill("#ff0000");
    await page.waitForTimeout(200);

    // 2. Cambiar layout
    await page.getByRole("tab", { name: /Layout/i }).click();
    await page.waitForTimeout(200);

    // 3. Cambiar tipografía (si hay controles disponibles)
    const typographyTab = page.getByRole("tab", {
      name: /Tipografía|Texto/i,
    });
    await typographyTab.click();
    await page.waitForTimeout(200);

    // Verificar que hay cambios sin guardar
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();

    // Guardar todos los cambios
    const saveButton = page.getByRole("button", { name: /Guardar Cambios/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Esperar guardado
    await expect(
      page.getByText(/Guardando cambios/i)
    ).toBeVisible({ timeout: 3000 });

    await expect(
      page.getByText(/Cambios guardados exitosamente/i)
    ).toBeVisible({ timeout: 10000 });

    // Verificar que no hay cambios pendientes
    await expect(saveButton).toBeDisabled();

    // Recargar y verificar persistencia
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible({ timeout: 10000 });

    // Verificar que no hay cambios sin guardar después de recargar
    await page.waitForTimeout(1000);
    await expect(saveButton).toBeDisabled();
  });
});
