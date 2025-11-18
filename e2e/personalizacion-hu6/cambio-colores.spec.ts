import { test, expect } from "@playwright/test";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Test de actualización de colores", () => {
  test("debe actualizar los colores del perfil correctamente", async ({
    page,
  }) => {
    await login(page);

    const profileId = "7b12f9af-5aa9-418b-842a-fc55b046a7e0";
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
      },
    };

    const newColors = {
      primary: "#3b82f6", // Azul
      secondary: "#1e293b", // Azul oscuro
      background: "#f8fafc", // Gris claro
      text: "#64748b", // Gris medio
      card: "#3b82f6", // Azul
      cardText: "#ffffff", // Blanco
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
              nombre: "Perfil de Prueba",
              correo: "test@example.com",
              logo_url: null,
              descripcion: "Descripción de prueba",
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

    // Verificar que estamos en la página de personalización
    // Buscar el tab de colores o algún elemento del ThemeEditor
    await expect(
      page.locator(
        'button:has-text("Colores"), [role="tab"]:has-text("Colores")'
      )
    ).toBeVisible({ timeout: 10000 });

    // Asegurarse de que estamos en el tab de colores
    const colorsTab = page
      .locator('[role="tab"]:has-text("Colores"), button:has-text("Colores")')
      .first();
    if (await colorsTab.isVisible()) {
      await colorsTab.click();
    }

    // Esperar a que los controles de color estén visibles
    await page.waitForTimeout(500);

    // Cambiar el color principal
    const primaryColorInput = page
      .locator('input[type="text"]')
      .filter({ hasText: /primary/i })
      .or(
        page.locator('label:has-text("Color principal") + * input[type="text"]')
      )
      .or(page.locator('input[type="text"]').first());

    // Buscar el input de color principal de forma más específica
    const primaryColorField = page
      .locator('label:has-text("Color principal")')
      .locator("..")
      .locator('input[type="text"]')
      .first();

    if (await primaryColorField.isVisible()) {
      await primaryColorField.clear();
      await primaryColorField.fill(newColors.primary);
    } else {
      // Fallback: buscar todos los inputs de texto y usar el primero
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 0) {
        await textInputs.nth(0).clear();
        await textInputs.nth(0).fill(newColors.primary);
      }
    }

    // Cambiar el color secundario
    const secondaryColorField = page
      .locator('label:has-text("Color de texto")')
      .locator("..")
      .locator('input[type="text"]')
      .first();

    if (await secondaryColorField.isVisible()) {
      await secondaryColorField.clear();
      await secondaryColorField.fill(newColors.secondary);
    } else {
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 1) {
        await textInputs.nth(1).clear();
        await textInputs.nth(1).fill(newColors.secondary);
      }
    }

    // Cambiar el color de fondo
    const backgroundColorField = page
      .locator('label:has-text("Color de fondo")')
      .locator("..")
      .locator('input[type="text"]')
      .first();

    if (await backgroundColorField.isVisible()) {
      await backgroundColorField.clear();
      await backgroundColorField.fill(newColors.background);
    } else {
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 2) {
        await textInputs.nth(2).clear();
        await textInputs.nth(2).fill(newColors.background);
      }
    }

    // Cambiar el color de texto/descripción
    const textColorField = page
      .locator('label:has-text("Color de descripción")')
      .locator("..")
      .locator('input[type="text"]')
      .first();

    if (await textColorField.isVisible()) {
      await textColorField.clear();
      await textColorField.fill(newColors.text);
    } else {
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 3) {
        await textInputs.nth(3).clear();
        await textInputs.nth(3).fill(newColors.text);
      }
    }

    // Cambiar el color de tarjeta
    const cardColorField = page
      .locator('label:has-text("Fondo de tarjetas")')
      .locator("..")
      .locator('input[type="text"]')
      .first();

    if (await cardColorField.isVisible()) {
      await cardColorField.clear();
      await cardColorField.fill(newColors.card);
    } else {
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 4) {
        await textInputs.nth(4).clear();
        await textInputs.nth(4).fill(newColors.card);
      }
    }

    // Cambiar el color de texto de tarjeta
    const cardTextColorField = page
      .locator('label:has-text("Texto de tarjetas")')
      .locator("..")
      .locator('input[type="text"]')
      .first();

    if (await cardTextColorField.isVisible()) {
      await cardTextColorField.clear();
      await cardTextColorField.fill(newColors.cardText);
    } else {
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 5) {
        await textInputs.nth(5).clear();
        await textInputs.nth(5).fill(newColors.cardText);
      }
    }

    // Esperar un momento para que los cambios se reflejen
    await page.waitForTimeout(500);

    // Buscar y hacer clic en el botón de guardar
    const saveButton = page
      .locator('button:has-text("Guardar"), button:has-text("Guardar cambios")')
      .first();

    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Esperar a que se complete el guardado (puede mostrar un toast o cerrar un modal)
    await page.waitForTimeout(2000);

    // Verificar que el tema se guardó correctamente en el backend
    expect(savedTheme).not.toBeNull();
    expect(savedTheme.colors.primary).toBe(newColors.primary);
    expect(savedTheme.colors.secondary).toBe(newColors.secondary);
    expect(savedTheme.colors.background).toBe(newColors.background);
    expect(savedTheme.colors.text).toBe(newColors.text);
    expect(savedTheme.colors.card).toBe(newColors.card);
    expect(savedTheme.colors.cardText).toBe(newColors.cardText);

    // Verificar que se muestra un mensaje de éxito (toast o alert)
    // El mensaje puede variar, así que verificamos que no hay errores visibles
    const errorMessages = page.locator("text=/error|Error|ERROR/i");
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
  });

  test("debe actualizar colores usando plantillas de color", async ({
    page,
  }) => {
    await login(page);

    const profileId = "7b12f9af-5aa9-418b-842a-fc55b046a7e0";
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
              nombre: "Perfil de Prueba",
              correo: "test@example.com",
              logo_url: null,
              descripcion: "Descripción de prueba",
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

    // Asegurarse de que estamos en el tab de colores
    const colorsTab = page
      .locator('[role="tab"]:has-text("Colores"), button:has-text("Colores")')
      .first();
    if (await colorsTab.isVisible()) {
      await colorsTab.click();
    }

    await page.waitForTimeout(500);

    // Buscar y hacer clic en una plantilla de color (por ejemplo, "blue")
    const bluePreset = page
      .locator('button:has-text("blue"), button:has-text("Blue")')
      .or(page.locator('span:has-text("blue")').locator(".."))
      .first();

    if (await bluePreset.isVisible()) {
      await bluePreset.click();
    } else {
      // Buscar por el color visual (botón con gradiente azul)
      const presetButtons = page.locator("button").filter({
        has: page.locator('div[style*="background"]'),
      });
      const count = await presetButtons.count();
      if (count > 0) {
        // Hacer clic en el segundo botón (asumiendo que el primero es violet)
        await presetButtons.nth(1).click();
      }
    }

    await page.waitForTimeout(500);

    // Guardar los cambios
    const saveButton = page
      .locator('button:has-text("Guardar"), button:has-text("Guardar cambios")')
      .first();

    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Esperar a que se complete el guardado
    await page.waitForTimeout(2000);

    // Verificar que el tema se guardó con los colores de la plantilla
    expect(savedTheme).not.toBeNull();
    expect(savedTheme.colors).toBeDefined();
    // Los colores de la plantilla blue deberían ser diferentes a los iniciales
    expect(savedTheme.colors.primary).not.toBe(initialTheme.colors.primary);
  });
});
