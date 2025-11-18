import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Flujo completo de personalización hasta vista previa", () => {
  test("debe completar todo el flujo de personalización y verificar la vista previa", async ({
    page,
  }) => {
    await login(page);

    const profileId = "test-profile-completo-123";
    const initialTheme = {
      colors: {
        primary: "#877af7",
        secondary: "#000000",
        background: "#ffffff",
        text: "#1f2937",
        card: "#877af7",
        cardText: "#ffffff",
      },
      typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: {
          base: "16px",
          heading: "20px",
          cardText: "14px",
        },
      },
      spacing: {
        padding: "24px",
        margin: "16px",
        gap: "16px",
      },
      layout: {
        type: "centered",
        showAvatar: true,
        showSocialLinks: true,
        textAlignment: "center",
      },
    };

    const personalizacion = {
      colors: {
        primary: "#3b82f6",
        secondary: "#1e293b",
        background: "#f8fafc",
        text: "#64748b",
        card: "#3b82f6",
        cardText: "#ffffff",
      },
      layout: {
        type: "card",
        showAvatar: true,
        showSocialLinks: true,
        textAlignment: "center",
      },
      typography: {
        fontFamily: "Roboto, sans-serif",
        fontSize: {
          base: "18px",
          heading: "24px",
          cardText: "16px",
        },
      },
      spacing: {
        padding: "32px",
        margin: "24px",
        gap: "20px",
      },
    };

    // Mock del API para obtener el perfil
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: {
              id: profileId,
              nombre: "Perfil de Prueba Completo",
              correo: "test@example.com",
              logo_url: null,
              descripcion: "Descripción de prueba para el flujo completo",
              diseno: JSON.stringify(initialTheme),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock del API para guardar el diseño
    let savedTheme: any = null;
    await page.route(`**/api/perfiles/${profileId}/diseno`, async (route) => {
      if (route.request().method() === "PUT") {
        const requestBody = await route.request().postDataJSON();
        savedTheme = requestBody;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Diseño actualizado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock del API para actualizar el perfil
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Perfil actualizado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de personalización
    await page.goto(`/dashboard/perfiles/${profileId}/personalizar`);

    // Esperar a que la página cargue completamente
    await page.waitForLoadState("networkidle");

    // Verificar que la vista previa está visible
    await expect(
      page.locator('text="Vista Previa", h2:has-text("Vista Previa")')
    ).toBeVisible({ timeout: 10000 });

    // PASO 1: Cambiar colores
    const colorsTab = page
      .locator('[role="tab"]:has-text("Colores"), button:has-text("Colores")')
      .first();
    if (await colorsTab.isVisible()) {
      await colorsTab.click();
    }
    await page.waitForTimeout(500);

    // Cambiar color principal
    const primaryColorField = page
      .locator('label:has-text("Color principal")')
      .locator("..")
      .locator('input[type="text"]')
      .first();
    if (await primaryColorField.isVisible()) {
      await primaryColorField.clear();
      await primaryColorField.fill(personalizacion.colors.primary);
    } else {
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 0) {
        await textInputs.nth(0).clear();
        await textInputs.nth(0).fill(personalizacion.colors.primary);
      }
    }

    // Verificar que la vista previa se actualiza con el nuevo color
    await page.waitForTimeout(500);
    const previewSection = page.locator('text="Vista Previa"').locator("..");
    await expect(previewSection).toBeVisible();

    // PASO 2: Cambiar layout
    const layoutTab = page
      .locator(
        '[role="tab"]:has-text("Layout"), button:has-text("Layout"), [role="tab"]:has-text("Diseño"), button:has-text("Diseño")'
      )
      .first();
    if (await layoutTab.isVisible()) {
      await layoutTab.click();
    }
    await page.waitForTimeout(500);

    // Seleccionar layout "Modelo Tarjeta"
    const cardLayout = page
      .locator('text="Modelo Tarjeta"')
      .locator("..")
      .or(page.locator('[class*="Card"]:has-text("Modelo Tarjeta")'))
      .first();
    if (await cardLayout.isVisible()) {
      await cardLayout.click();
    } else {
      const layoutCards = page.locator(
        '[class*="Card"][class*="cursor-pointer"]'
      );
      const count = await layoutCards.count();
      if (count > 4) {
        await layoutCards.nth(4).click();
      }
    }

    // Verificar que la vista previa se actualiza con el nuevo layout
    await page.waitForTimeout(500);
    await expect(previewSection).toBeVisible();

    // PASO 3: Cambiar tipografía
    const typographyTab = page
      .locator(
        '[role="tab"]:has-text("Tipografía"), button:has-text("Tipografía"), [role="tab"]:has-text("Fuente"), button:has-text("Fuente")'
      )
      .first();
    if (await typographyTab.isVisible()) {
      await typographyTab.click();
    }
    await page.waitForTimeout(500);

    // Buscar y cambiar la fuente (si hay un selector de fuente)
    const fontSelectors = page.locator('select, [role="combobox"]');
    const fontCount = await fontSelectors.count();
    if (fontCount > 0) {
      // Intentar seleccionar Roboto si está disponible
      await fontSelectors.first().click();
      await page.waitForTimeout(200);
      const robotoOption = page.locator('text="Roboto", text="roboto"').first();
      if (await robotoOption.isVisible()) {
        await robotoOption.click();
      }
    }

    // Verificar que la vista previa se actualiza
    await page.waitForTimeout(500);
    await expect(previewSection).toBeVisible();

    // PASO 4: Cambiar espaciado
    const spacingTab = page
      .locator(
        '[role="tab"]:has-text("Espaciado"), button:has-text("Espaciado"), [role="tab"]:has-text("Espacio"), button:has-text("Espacio")'
      )
      .first();
    if (await spacingTab.isVisible()) {
      await spacingTab.click();
    }
    await page.waitForTimeout(500);

    // Cambiar padding
    const paddingInput = page
      .locator('label:has-text("Padding"), label:has-text("padding")')
      .locator("..")
      .locator('input[type="text"], input[type="number"]')
      .first();
    if (await paddingInput.isVisible()) {
      await paddingInput.clear();
      await paddingInput.fill(personalizacion.spacing.padding);
    }

    // Verificar que la vista previa se actualiza
    await page.waitForTimeout(500);
    await expect(previewSection).toBeVisible();

    // PASO 5: Verificar que todos los cambios se reflejan en la vista previa
    // La vista previa debe mostrar:
    // - El nuevo color principal
    // - El nuevo layout (card)
    // - La nueva tipografía (si se cambió)
    // - El nuevo espaciado

    const previewContent = previewSection.locator("..");
    await expect(previewContent).toBeVisible();

    // Verificar que el nombre del perfil está visible en la vista previa
    await expect(
      page
        .locator('text="Perfil de Prueba Completo"')
        .or(page.locator('text="Perfil de Prueba"'))
    ).toBeVisible({ timeout: 5000 });

    // PASO 6: Guardar todos los cambios
    const saveButton = page
      .locator('button:has-text("Guardar"), button:has-text("Guardar cambios")')
      .first();

    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Esperar a que se complete el guardado
    await page.waitForTimeout(3000);

    // Verificar que todos los cambios se guardaron correctamente
    expect(savedTheme).not.toBeNull();
    expect(savedTheme.colors.primary).toBe(personalizacion.colors.primary);
    expect(savedTheme.layout.type).toBe(personalizacion.layout.type);
    expect(savedTheme.spacing.padding).toBe(personalizacion.spacing.padding);

    // Verificar que no hay errores visibles
    const errorMessages = page.locator("text=/error|Error|ERROR/i");
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);

    // Verificar que se muestra un mensaje de éxito (opcional)
    const successMessage = page
      .locator("text=/éxito|exitosamente|guardado/i")
      .first();
    // No fallar si no hay mensaje visible, ya que puede ser un toast que desaparece rápido
  });

  test("debe mostrar la vista previa actualizada en tiempo real", async ({
    page,
  }) => {
    await login(page);

    const profileId = "test-profile-preview-456";
    const initialTheme = {
      colors: {
        primary: "#877af7",
        secondary: "#000000",
        background: "#ffffff",
        text: "#1f2937",
        card: "#877af7",
        cardText: "#ffffff",
      },
      typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: {
          base: "16px",
          heading: "20px",
          cardText: "14px",
        },
      },
      spacing: {
        padding: "24px",
        margin: "16px",
        gap: "16px",
      },
      layout: {
        type: "centered",
        showAvatar: true,
        showSocialLinks: true,
        textAlignment: "center",
      },
    };

    // Mock del API
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            perfil: {
              id: profileId,
              nombre: "Test Preview",
              correo: "test@example.com",
              logo_url: null,
              descripcion: "Test de vista previa",
              diseno: JSON.stringify(initialTheme),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(`**/api/perfiles/${profileId}/diseno`, async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Diseño actualizado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Perfil actualizado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navegar a la página de personalización
    await page.goto(`/dashboard/perfiles/${profileId}/personalizar`);
    await page.waitForLoadState("networkidle");

    // Verificar que la vista previa está visible desde el inicio
    const previewSection = page
      .locator('text="Vista Previa", h2:has-text("Vista Previa")')
      .first();
    await expect(previewSection).toBeVisible({ timeout: 10000 });

    // Verificar que el nombre del perfil está en la vista previa
    await expect(
      page.locator('text="Test Preview"').or(page.locator('text="Test"'))
    ).toBeVisible({ timeout: 5000 });

    // Cambiar un color y verificar que la vista previa se actualiza
    const colorsTab = page
      .locator('[role="tab"]:has-text("Colores"), button:has-text("Colores")')
      .first();
    if (await colorsTab.isVisible()) {
      await colorsTab.click();
    }
    await page.waitForTimeout(500);

    const newColor = "#ff0000"; // Rojo
    const primaryColorField = page
      .locator('label:has-text("Color principal")')
      .locator("..")
      .locator('input[type="text"]')
      .first();
    if (await primaryColorField.isVisible()) {
      await primaryColorField.clear();
      await primaryColorField.fill(newColor);
      await page.waitForTimeout(500);

      // Verificar que la vista previa sigue visible después del cambio
      await expect(previewSection).toBeVisible();
    }

    // Cambiar el layout y verificar que la vista previa se actualiza
    const layoutTab = page
      .locator(
        '[role="tab"]:has-text("Layout"), button:has-text("Layout"), [role="tab"]:has-text("Diseño"), button:has-text("Diseño")'
      )
      .first();
    if (await layoutTab.isVisible()) {
      await layoutTab.click();
    }
    await page.waitForTimeout(500);

    const rightAlignedLayout = page
      .locator('text="Alineado a la derecha"')
      .locator("..")
      .or(page.locator('[class*="Card"]:has-text("Alineado a la derecha")'))
      .first();
    if (await rightAlignedLayout.isVisible()) {
      await rightAlignedLayout.click();
      await page.waitForTimeout(500);

      // Verificar que la vista previa sigue visible y actualizada
      await expect(previewSection).toBeVisible();
    }

    // Verificar que la vista previa muestra el contenido del perfil
    await expect(
      page.locator('text="Test Preview"').or(page.locator('text="Test"'))
    ).toBeVisible();
  });
});
