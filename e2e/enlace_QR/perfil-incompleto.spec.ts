import { test, expect } from "@playwright/test";

test.describe("Validación de Perfil Incompleto - Escenarios Detallados", () => {
  // Perfil base con todos los campos llenos
  const baseProfile = {
    id: "test-profile-id",
    administrador_id: "admin-123",
    nombre: "Perfil de Prueba",
    logo_url: "https://example.com/logo.png",
    correo: "contacto@empresa.com",
    descripcion: "Una descripción válida para el perfil.",
    diseno: { color: "#000000", theme: "dark" },
    estado: "borrador",
    slug: null,
    fecha_publicacion: null,
    qr_url: null,
    fechas: new Date().toISOString(),
    administrador: {
      id: "admin-123",
      nombre: "Admin Test",
      correo: "admin@test.com"
    }
  };

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "brayanss2018@gmail.com");
    await page.fill('input[type="password"]', "Steven-123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  // Definir los casos de prueba
  const testCases = [
    {
      name: "Falta solo el Logo",
      profile: { ...baseProfile, logo_url: null },
      missingFieldLabel: "Logo del perfil",
      expectedProgress: "80%" // 4 de 5 campos
    },
    {
      name: "Falta solo la Descripción",
      profile: { ...baseProfile, descripcion: null },
      missingFieldLabel: "Descripción",
      expectedProgress: "80%"
    },
    {
      name: "Falta solo el Correo",
      profile: { ...baseProfile, correo: null },
      missingFieldLabel: "Correo electrónico",
      expectedProgress: "80%"
    },
    {
      name: "Falta solo el Diseño",
      profile: { ...baseProfile, diseno: null },
      missingFieldLabel: "Diseño personalizado",
      expectedProgress: "80%"
    },
    {
      name: "Faltan Logo y Descripción",
      profile: { ...baseProfile, logo_url: null, descripcion: null },
      missingFieldsLabels: ["Logo del perfil", "Descripción"],
      expectedProgress: "60%" // 3 de 5 campos
    },
    {
      name: "Perfil totalmente vacío (excepto nombre)",
      profile: { 
        ...baseProfile, 
        logo_url: null, 
        correo: null, 
        descripcion: null, 
        diseno: null 
      },
      missingFieldsLabels: ["Logo del perfil", "Correo electrónico", "Descripción", "Diseño personalizado"],
      expectedProgress: "20%" // 1 de 5 campos (solo nombre)
    }
  ];

  for (const testCase of testCases) {
    test(`Debe detectar que ${testCase.name}`, async ({ page }) => {
      // Interceptar la petición
      await page.route(`**/api/perfiles/${baseProfile.id}`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ perfil: testCase.profile }),
        });
      });

      // Navegar
      await page.goto(`/dashboard/perfiles/${baseProfile.id}`);
      
      // Esperar carga
      await expect(page.getByText("Cargando perfil...")).not.toBeVisible();
      await expect(page.getByText(baseProfile.nombre)).toBeVisible();

      // Verificar botón publicar deshabilitado
      const publishButton = page.locator("button", { hasText: "Publicar" });
      await expect(publishButton).toBeDisabled();

      // Verificar tarjeta de completitud
      const completenessCard = page.locator(".border").filter({ hasText: "Completitud del perfil" }).first();
      await expect(completenessCard).toBeVisible();

      // Verificar campos faltantes
      const labelsToCheck = testCase.missingFieldsLabels || [testCase.missingFieldLabel];
      for (const label of labelsToCheck) {
        if (label) {
           await expect(completenessCard.getByText(label)).toBeVisible();
        }
      }

      // Verificar progreso
      await expect(page.getByText(testCase.expectedProgress)).toBeVisible();
    });
  }

  test("Perfil Completo - Debe permitir publicar", async ({ page }) => {
    // Interceptar la petición con el perfil completo
    await page.route(`**/api/perfiles/${baseProfile.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ perfil: baseProfile }),
      });
    });

    // Navegar
    await page.goto(`/dashboard/perfiles/${baseProfile.id}`);
    
    // Esperar carga
    await expect(page.getByText("Cargando perfil...")).not.toBeVisible();

    // Verificar botón publicar HABILITADO
    const publishButton = page.locator("button", { hasText: "Publicar" });
    await expect(publishButton).toBeEnabled();

    // Verificar mensaje de éxito
    // Buscamos el texto de éxito que aparece cuando está completo
    // Nota: El componente ProfileCompletenessCheck muestra "Perfil completo" en el título
    // y un mensaje de éxito en el cuerpo
    const completenessCard = page.locator(".border").filter({ hasText: "Perfil completo" }).first();
    await expect(completenessCard).toBeVisible();
    await expect(completenessCard.getByText("Tu perfil está completo y listo para publicar")).toBeVisible();
    
    // Verificar progreso 100%
    await expect(page.getByText("100%")).toBeVisible();
  });

});
