import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth.helper";


test.describe("E2E - Test de cambio de layout", () => {
  test("debe cambiar el layout del perfil correctamente", async ({ page }) => {
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
        textAlignment: "center",
      },
    };

    const newLayoutType = "left-aligned";

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
    await expect(
      page.locator(
        'button:has-text("Layout"), [role="tab"]:has-text("Layout"), button:has-text("Diseño")'
      )
    ).toBeVisible({ timeout: 10000 });

    // Asegurarse de que estamos en el tab de layout
    const layoutTab = page
      .locator(
        '[role="tab"]:has-text("Layout"), button:has-text("Layout"), [role="tab"]:has-text("Diseño"), button:has-text("Diseño")'
      )
      .first();
    if (await layoutTab.isVisible()) {
      await layoutTab.click();
    }

    // Esperar a que los controles de layout estén visibles
    await page.waitForTimeout(500);

    // Buscar y hacer clic en el layout "Alineado a la izquierda"
    const leftAlignedLayout = page
      .locator('text="Alineado a la izquierda"')
      .or(page.locator('text="left-aligned"'))
      .locator("..")
      .or(page.locator('[class*="Card"]:has-text("Alineado a la izquierda")'))
      .first();

    if (await leftAlignedLayout.isVisible()) {
      await leftAlignedLayout.click();
    } else {
      // Fallback: buscar todas las cards de layout y hacer clic en la segunda (left-aligned)
      const layoutCards = page.locator(
        '[class*="Card"][class*="cursor-pointer"]'
      );
      const count = await layoutCards.count();
      if (count > 1) {
        await layoutCards.nth(1).click();
      }
    }

    // Esperar un momento para que los cambios se reflejen
    await page.waitForTimeout(500);

    // Verificar que la vista previa se actualiza (opcional, si es visible)
    const previewSection = page.locator('text="Vista Previa"').locator("..");
    if (await previewSection.isVisible()) {
      // Verificar que el layout cambió en la vista previa
      await page.waitForTimeout(300);
    }

    // Buscar y hacer clic en el botón de guardar
    const saveButton = page
      .locator('button:has-text("Guardar"), button:has-text("Guardar cambios")')
      .first();

    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Esperar a que se complete el guardado
    await page.waitForTimeout(2000);

    // Verificar que el layout se guardó correctamente en el backend
    expect(savedTheme).not.toBeNull();
    expect(savedTheme.layout.type).toBe(newLayoutType);
    expect(savedTheme.layout.textAlignment).toBe("left"); // Debe actualizarse automáticamente

    // Verificar que no hay errores visibles
    const errorMessages = page.locator("text=/error|Error|ERROR/i");
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
  });

  test("debe cambiar entre diferentes tipos de layout", async ({ page }) => {
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
        textAlignment: "center",
      },
    };

    const layoutTypes = [
      { name: "Centrado", id: "centered", alignment: "center" },
      {
        name: "Alineado a la izquierda",
        id: "left-aligned",
        alignment: "left",
      },
      {
        name: "Alineado a la derecha",
        id: "right-aligned",
        alignment: "right",
      },
      { name: "Justificado", id: "justified", alignment: "justify" },
      { name: "Modelo Tarjeta", id: "card", alignment: "center" },
      { name: "Minimalista", id: "minimal", alignment: "center" },
    ];

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
    let savedThemes: any[] = [];
    await page.route(`**/api/perfiles/${profileId}/diseno`, async (route) => {
      if (route.request().method() === "PUT") {
        const requestBody = await route.request().postDataJSON();
        savedThemes.push(requestBody);
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

    // Ir al tab de layout
    const layoutTab = page
      .locator(
        '[role="tab"]:has-text("Layout"), button:has-text("Layout"), [role="tab"]:has-text("Diseño"), button:has-text("Diseño")'
      )
      .first();
    if (await layoutTab.isVisible()) {
      await layoutTab.click();
    }

    await page.waitForTimeout(500);

    // Probar cambiar a cada tipo de layout
    for (const layoutType of layoutTypes) {
      // Buscar el layout por su nombre
      const layoutCard = page
        .locator(`text="${layoutType.name}"`)
        .locator("..")
        .or(page.locator(`[class*="Card"]:has-text("${layoutType.name}")`))
        .first();



      if (await layoutCard.isVisible()) {
        await layoutCard.click();


        const selectedCard = page.locator('.border-primary.ring-primary\\/20');
        await expect(selectedCard).toBeVisible({ timeout: 5000 });
      }

    }

    // Guardar los cambios
    const saveButton = page
      .locator('button:has-text("Guardar"), button:has-text("Guardar cambios")')
      .first();

    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Esperar a que se complete el guardado
    await page.waitForTimeout(2000);

    // Verificar que se guardó el último layout seleccionado
    expect(savedThemes.length).toBeGreaterThan(0);
    const lastSavedTheme = savedThemes[savedThemes.length - 1];
    expect(lastSavedTheme.layout.type).toBe(
      layoutTypes[layoutTypes.length - 1].id
    );
    expect(lastSavedTheme.layout.textAlignment).toBe(
      layoutTypes[layoutTypes.length - 1].alignment
    );
  });
});