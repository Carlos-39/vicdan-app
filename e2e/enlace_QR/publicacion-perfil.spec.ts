import { test, expect } from "@playwright/test";

// Helper para login
async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe("E2E - Publicación de Perfil", () => {
  const profileId = "test-profile-id";
  
  // Perfil completo listo para publicar
  const completeProfile = {
    id: profileId,
    administrador_id: "admin-123",
    nombre: "Perfil Completo",
    logo_url: "https://example.com/logo.png",
    correo: "contacto@ejemplo.com",
    descripcion: "Descripción válida",
    diseno: { colors: {}, typography: {} },
    estado: "borrador",
    slug: null, // No publicado aún
    fechas: new Date().toISOString(),
  };

  // Perfil incompleto (sin logo)
  const incompleteProfile = {
    ...completeProfile,
    logo_url: null,
    nombre: "Perfil Incompleto"
  };

  test("Debe permitir publicar un perfil completo exitosamente", async ({ page }) => {
    await login(page);

    // 1. Mock del perfil inicial y actualizado
    let isPublished = false;
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        const profileToReturn = isPublished 
          ? { ...completeProfile, slug: "p_perfil_completo_123", estado: "activo" }
          : completeProfile;
          
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ perfil: profileToReturn }),
        });
      } else {
        await route.continue();
      }
    });

    // 2. Mock de la petición de publicar
    await page.route(`**/api/perfiles/${profileId}/publicar`, async (route) => {
      isPublished = true; // Actualizamos el estado para la próxima llamada GET
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          slug: "p_perfil_completo_123",
          qrPublicUrl: "https://example.com/qr-code.png",
          message: "Perfil publicado exitosamente"
        }),
      });
    });

    // 3. Navegar al detalle del perfil
    await page.goto(`/dashboard/perfiles/${profileId}`);

    // 4. Verificar que el botón "Publicar" está habilitado
    const publishButton = page.getByRole("button", { name: /Publicar/i });
    await expect(publishButton).toBeVisible();
    await expect(publishButton).toBeEnabled();

    // 5. Verificar que el checklist indica que está completo
    await expect(page.getByText("Tu perfil está completo y listo para publicar")).toBeVisible();

    // 6. Hacer clic en Publicar
    await publishButton.click();

    // 7. Esperar a que aparezca el modal de compartir
    // El componente recarga la página después de 1 segundo, así que esperamos
    // a que la página recargue y luego verificamos el nuevo estado
    await page.waitForLoadState('networkidle');
    
    // 8. Después del reload, el perfil ahora tiene slug, así que el botón cambió a "Compartir"
    const shareButton = page.getByRole("button", { name: /Compartir/i });
    await expect(shareButton).toBeVisible({ timeout: 10000 });
    
    // 9. El botón "Publicar" ya no debe estar visible
    await expect(publishButton).not.toBeVisible();
  });

  test("Debe deshabilitar el botón de publicar si el perfil está incompleto", async ({ page }) => {
    await login(page);

    // 1. Mock del perfil incompleto
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ perfil: incompleteProfile }),
      });
    });

    // 2. Navegar al detalle del perfil
    await page.goto(`/dashboard/perfiles/${profileId}`);

    // 3. Verificar que el botón "Publicar" está deshabilitado
    const publishButton = page.getByRole("button", { name: /Publicar/i });
    await expect(publishButton).toBeVisible();
    await expect(publishButton).toBeDisabled();

    // 4. Verificar que el checklist muestra el campo faltante
    await expect(page.getByText("Campos requeridos pendientes")).toBeVisible();
    await expect(page.getByText("Logo del perfil")).toBeVisible();
    
    // 5. Verificar que NO dice que está listo
    await expect(page.getByText("Tu perfil está completo y listo para publicar")).not.toBeVisible();
  });

  test("Debe mostrar error si falla la publicación", async ({ page }) => {
    await login(page);

    // 1. Mock del perfil completo
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ perfil: completeProfile }),
        });
      } else {
        await route.continue();
      }
    });

    // 2. Mock de error en la publicación (500)
    await page.route(`**/api/perfiles/${profileId}/publicar`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Error interno del servidor al publicar" }),
      });
    });

    // 3. Navegar al detalle del perfil
    await page.goto(`/dashboard/perfiles/${profileId}`);

    // 4. Hacer clic en Publicar
    const publishButton = page.getByRole("button", { name: /Publicar/i });
    await publishButton.click();

    // 5. Verificar mensaje de error
    await expect(page.getByText("Error al publicar")).toBeVisible();
    await expect(page.getByText("Error interno del servidor al publicar")).toBeVisible();
    
    // 6. Verificar que NO se abrió el modal de compartir
    await expect(page.getByText("Compartir Perfil")).not.toBeVisible();
  });
});
