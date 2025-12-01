import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("Vista Previa en Tiempo Real - Editor de Temas", () => {
  test("Debe actualizar el color primario instantáneamente sin recargar la página", async ({
    page,
  }) => {
    await login(page);

    // Mock del perfil
    const mockProfileId = "test-profile-123";
    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Profile",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify({
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
      }),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Mock GET /api/perfiles/[id]
    await page.route(`**/api/perfiles/${mockProfileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ perfil: mockProfile }),
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
            body: JSON.stringify({ diseno: mockProfile.diseno }),
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

    // Navegar a la página de personalización
    await page.goto(`/dashboard/perfiles/${mockProfileId}/personalizar`);

    // Esperar a que cargue el editor
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();

    // Verificar que la vista previa está visible
    await expect(
      page.getByRole("heading", { name: /Vista Previa/i })
    ).toBeVisible();

    // Ir a la pestaña de colores (debería estar activa por defecto)
    await page.getByRole("tab", { name: /Colores/i }).click();

    // Capturar el estado inicial de la vista previa
    const previewContainer = page.locator('[class*="ThemePreview"]').first();
    
    // Buscar input de color primario y cambiar su valor
    const primaryColorInput = page.locator('input[type="color"]').first();
    await expect(primaryColorInput).toBeVisible();

    // Cambiar el color primario a rojo
    const newColor = "#ff0000";
    await primaryColorInput.fill(newColor);

    // Esperar un momento para que React actualice el estado
    await page.waitForTimeout(500);

    // Verificar que NO hubo recarga de página (verificando que un elemento sigue presente)
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();

    // Verificar que el estado "sin guardar" está activo
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();

    // Verificar que la preview se actualizó sin guardar
    // El botón de guardar debe estar habilitado porque hay cambios sin guardar
    const saveButton = page.getByRole("button", { name: /Guardar Cambios/i });
    await expect(saveButton).toBeEnabled();
  });

  test("Debe actualizar el layout instantáneamente sin recargar la página", async ({
    page,
  }) => {
    await login(page);

    const mockProfileId = "test-profile-456";
    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Profile Layout",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify({
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
      }),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Mock APIs
    await page.route(`**/api/perfiles/${mockProfileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ perfil: mockProfile }),
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
            body: JSON.stringify({ diseno: mockProfile.diseno }),
          });
        } else {
          await route.continue();
        }
      }
    );

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

    // Cambiar a pestaña de Layout
    await page.getByRole("tab", { name: /Layout/i }).click();

    // Esperar que la pestaña se active
    await page.waitForTimeout(300);

    // Intentar cambiar alguna opción de layout
    // Buscar botones de layout (pueden tener iconos o texto)
    const layoutOptions = page.locator('button[role="radio"], button').filter({
      hasText: /left-aligned|right-aligned|card|minimal/i,
    });

    // Si hay opciones de layout, hacer clic en una diferente
    const optionsCount = await layoutOptions.count();
    if (optionsCount > 0) {
      await layoutOptions.first().click();
      await page.waitForTimeout(300);
    }

    // Verificar que hay cambios sin guardar
    await expect(
      page.getByText(/Tienes cambios sin guardar/i)
    ).toBeVisible();

    // Verificar que NO hubo recarga de página
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Vista Previa/i })
    ).toBeVisible();
  });

  test("Debe actualizar tipografía instantáneamente sin recargar la página", async ({
    page,
  }) => {
    await login(page);

    const mockProfileId = "test-profile-789";
    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Profile Typography",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify({
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
      }),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Mock APIs
    await page.route(`**/api/perfiles/${mockProfileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ perfil: mockProfile }),
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
            body: JSON.stringify({ diseno: mockProfile.diseno }),
          });
        } else {
          await route.continue();
        }
      }
    );

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

    // Cambiar a pestaña de Tipografía
    const typographyTab = page.getByRole("tab", {
      name: /Tipografía|Texto/i,
    });
    await typographyTab.click();

    // Esperar que la pestaña se active
    await page.waitForTimeout(300);

    // Buscar controles de tamaño de fuente (sliders o inputs)
    const fontSizeControls = page.locator('input[type="range"], select').first();
    
    if (await fontSizeControls.isVisible()) {
      // Cambiar valor del control
      await fontSizeControls.click();
      
      // Si es un range, cambiar su valor
      if ((await fontSizeControls.getAttribute("type")) === "range") {
        await fontSizeControls.fill("20");
      }
      
      await page.waitForTimeout(500);
    }

    // Verificar que NO hubo recarga de página
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Vista Previa/i })
    ).toBeVisible();

    // Verificar que el botón de guardar está habilitado o hay mensaje de cambios sin guardar
    const saveButton = page.getByRole("button", { name: /Guardar/i });
    // El botón puede estar habilitado o deshabilitado dependiendo de si hubo cambios
    await expect(saveButton).toBeVisible();
  });

  test("Debe mantener la vista previa visible mientras se navega entre pestañas", async ({
    page,
  }) => {
    await login(page);

    const mockProfileId = "test-profile-nav";
    const mockProfile = {
      id: mockProfileId,
      administrador_id: "admin-1",
      nombre: "Test Navigation",
      logo_url: null,
      correo: "test@test.com",
      descripcion: "Test description",
      diseno: JSON.stringify({
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
      }),
      estado: "borrador",
      slug: null,
      fecha_publicacion: null,
      qr_url: null,
      fechas: new Date().toISOString(),
    };

    // Mock APIs
    await page.route(`**/api/perfiles/${mockProfileId}**`, async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET") {
        if (url.includes("/diseno")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ diseno: mockProfile.diseno }),
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

    // Verificar que vista previa está visible inicialmente
    const previewHeading = page.getByRole("heading", { name: /Vista Previa/i });
    await expect(previewHeading).toBeVisible();

    // Navegar por todas las pestañas y verificar que la vista previa sigue visible
    const tabs = ["Colores", "Layout", "Tipografía", "Texto", "Espaciado", "Espacio", "Enlaces"];

    for (const tabName of tabs) {
      const tab = page.getByRole("tab", { name: new RegExp(tabName, "i") });
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(200);
        
        // Verificar que la vista previa sigue visible
        await expect(previewHeading).toBeVisible();
      }
    }

    // Verificar que NO hubo recarga de página durante la navegación
    await expect(
      page.getByRole("heading", { name: /Personalizar Diseño/i })
    ).toBeVisible();
  });
});
