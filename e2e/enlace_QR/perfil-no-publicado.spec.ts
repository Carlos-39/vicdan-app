import { test, expect } from "@playwright/test";

test.describe("Acceso a Perfil No Publicado", () => {
  test("Debe mostrar error 404 al acceder a un perfil no existente o no publicado", async ({ page }) => {
    // Slug que sabemos que no existe o simula uno no publicado
    const nonExistentSlug = "p_no_existe_12345";

    // Navegar a la URL
    const response = await page.goto(`/${nonExistentSlug}`);

    // Verificar que el status code es 404
    // Nota: En Next.js, notFound() renderiza la página de 404 pero el status code
    // de la respuesta inicial debería ser 404.
    expect(response?.status()).toBe(404);

    // Verificar que se muestra la página de 404
    // Buscamos específicamente el h1 o el texto principal
    const errorHeading = page.locator("h1").filter({ hasText: "404" });
    const errorText = page.getByText("This page could not be found");
    
    // Verificamos que al menos uno de los indicadores de error esté visible
    // (Next.js a veces muestra el 404 estilizado con ambos)
    if (await errorHeading.isVisible()) {
      await expect(errorHeading).toBeVisible();
    } else {
      await expect(errorText).toBeVisible();
    }
  });

  test("Debe redirigir o dar error si el slug no tiene el formato correcto", async ({ page }) => {
    // Slug inválido (no empieza con p_)
    const invalidSlug = "slug-invalido";

    const response = await page.goto(`/${invalidSlug}`);

    // Según el código: if (!slug.startsWith('p_')) { notFound(); }
    expect(response?.status()).toBe(404);
  });
});
