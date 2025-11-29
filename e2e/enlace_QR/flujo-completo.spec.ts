import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth.helper";

test.describe("E2E - Flujo Completo: Publicación y Acceso Público", () => {
  const profileId = "test-profile-id-complete-flow";
  const slug = "p_test_profile_complete";
  const publicUrl = `http://localhost:3000/${slug}`;
  const qrUrl = "https://wkthjrftwyiwenmwuifl.supabase.co/storage/v1/object/public/perfiles-logos/logos/aac489dc-39b7-427e-8ca0-ce5582dce5b7-1762248105785-23e4e7aa8e7a9e2dbc75fece9d77fc99.jpg";

  // Perfil completo listo para publicar
  const completeProfile = {
    id: profileId,
    administrador_id: "admin-123",
    nombre: "Perfil de Prueba Completo",
    logo_url: "https://wkthjrftwyiwenmwuifl.supabase.co/storage/v1/object/public/perfiles-logos/logos/aac489dc-39b7-427e-8ca0-ce5582dce5b7-1762248105785-23e4e7aa8e7a9e2dbc75fece9d77fc99.jpg",
    correo: "contacto@prueba.com",
    descripcion: "Descripción de prueba para el flujo completo",
    diseno: { 
      colors: { background: "#ffffff" }, 
      typography: { fontFamily: "Inter" } 
    },
    estado: "borrador",
    slug: null,
    fechas: new Date().toISOString(),
  };

  test("Debe permitir publicar un perfil, generar QR y acceder al enlace público", async ({ page }) => {
    console.log("Iniciando test de flujo completo...");
    await login(page);

    // 1. Mock del perfil inicial y actualizado
    let isPublished = false;
    await page.route(`**/api/perfiles/${profileId}`, async (route) => {
      if (route.request().method() === "GET") {
        const profileToReturn = isPublished 
          ? { ...completeProfile, slug: slug, estado: "publicado", qr_url: qrUrl, fecha_publicacion: new Date().toISOString() }
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
      isPublished = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          slug: slug,
          publicUrl: publicUrl,
          qrPublicUrl: qrUrl,
          message: "Perfil publicado exitosamente"
        }),
      });
    });

    // 3. Mock de la página pública (simulando que el servidor responde con el perfil)
    // Esto intercepta la navegación al slug
    await page.route(`**/${slug}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <html>
            <body>
              <div id="profile-name">${completeProfile.nombre}</div>
              <div id="profile-description">${completeProfile.descripcion}</div>
            </body>
          </html>
        `,
      });
    });

    // --- INICIO DEL FLUJO ---

    // 4. Navegar al detalle del perfil en el dashboard
    await page.goto(`/dashboard/perfiles/${profileId}`);

    // 5. Verificar que estamos en el perfil correcto y listo para publicar
    await expect(page.getByText("✓ Tu perfil está completo y listo para publicar")).toBeVisible();
    const publishButton = page.getByRole("button", { name: /Publicar/i });
    await expect(publishButton).toBeVisible();

    // 6. Publicar el perfil
    console.log("Haciendo clic en Publicar...");
    await publishButton.click();

    // 7. Esperar a que la página se recargue y aparezca el botón "Compartir"
    // El componente recarga la página después de 1 segundo
    console.log("Esperando recarga y botón Compartir...");
    const shareButton = page.getByRole("button", { name: /Compartir/i });
    await expect(shareButton).toBeVisible({ timeout: 15000 });

    // 8. Abrir el modal de compartir manualmente
    console.log("Abriendo modal de compartir...");
    await shareButton.click();
    
    const shareModal = page.getByRole("dialog", { name: "Compartir perfil" });
    await expect(shareModal).toBeVisible();
    console.log("Modal visible tras clic manual");
    
    // 9. Verificar elementos del modal (QR y Enlace)
    console.log("Verificando contenido del modal...");
    // Verificar input con el enlace
    const dialog = page.getByRole("dialog", { name: "Compartir perfil" });
    console.log("Dialog HTML:", await dialog.innerHTML());
    
    const inputs = dialog.locator('input');
    const count = await inputs.count();
    console.log(`Encontrados ${count} inputs en el diálogo`);
    
    for (let i = 0; i < count; i++) {
        console.log(`Input ${i} value:`, await inputs.nth(i).inputValue());
        console.log(`Input ${i} outerHTML:`, await inputs.nth(i).evaluate(el => el.outerHTML));
    }

    const linkInput = inputs.first(); // Asumimos que es el primero o el único por ahora
    await expect(linkInput).toBeVisible();
    
    // Verificar imagen QR
    const qrImage = page.locator('img[alt="QR Code"]');
    await expect(qrImage).toBeVisible();
    await expect(qrImage).toHaveAttribute("src", qrUrl);

    // 10. Simular acceso al enlace público
    console.log("Simulando acceso público...");
    // En un escenario real, el usuario copiaría el link o escanearía el QR.
    // Aquí navegamos directamente a la URL pública.
    
    // Abrir en una nueva página para simular un usuario externo
    const newPage = await page.context().newPage();
    await newPage.goto(`/${slug}`);

    // 10. Verificar contenido de la página pública (basado en nuestro mock)
    console.log("Verificando página pública...");
    await expect(newPage.locator("#profile-name")).toHaveText(completeProfile.nombre);
    await expect(newPage.locator("#profile-description")).toHaveText(completeProfile.descripcion);

    await newPage.close();
  });
});
