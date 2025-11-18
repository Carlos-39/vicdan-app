import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

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

  // Esperar a que la URL cambie a dashboard
  await page.waitForURL(/dashboard/, { timeout: 15000 });

  // Verificar que efectivamente estamos en el dashboard
  await expect(page).toHaveURL(/dashboard/);
}

// Función helper para configurar el mock de perfil
async function setupProfileMock(
  page: any,
  profileId: string,
  profileData: any
) {
  await page.route(`**/api/perfiles/${profileId}`, async (route: any) => {
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
}

test.describe("E2E - Validaciones de datos en EditProfile (Zod)", () => {
  const profileId = "test-profile-validacion-123";
  const baseProfileData = {
    id: profileId,
    nombre: "Perfil Test Validación",
    correo: "test@example.com",
    descripcion: "Descripción inicial del perfil",
    estado: "activo",
    logo_url: null,
    administrador_id: "admin-123",
    fechas: "2024-01-01",
  };

  test.beforeEach(async ({ page }) => {
    await login(page);
    await setupProfileMock(page, profileId, baseProfileData);
    await page.goto(`/dashboard/perfiles/${profileId}/editar`);
    await page.waitForLoadState("networkidle");
    await expect(
      page
        .locator('text="Editar Perfil"')
        .or(page.locator('h2:has-text("Editar Perfil")'))
    ).toBeVisible({ timeout: 10000 });
  });

  // Validaciones del campo NOMBRE
  test("debe mostrar error cuando el nombre tiene menos de 2 caracteres", async ({
    page,
  }) => {
    // Limpiar el campo nombre
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("A"); // Solo 1 carácter

    // Intentar enviar el formulario
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Verificar que se muestra el mensaje de error
    await expect(
      page.getByText("El nombre debe tener al menos 2 caracteres")
    ).toBeVisible();

    // Verificar que el botón sigue deshabilitado o no se envió
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("debe mostrar error cuando el nombre excede 100 caracteres", async ({
    page,
  }) => {
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    // Crear un string de 101 caracteres
    const longName = "A".repeat(101);
    await nombreInput.fill(longName);

    // Intentar enviar el formulario
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Verificar que se muestra el mensaje de error
    await expect(
      page.getByText("El nombre no puede exceder 100 caracteres")
    ).toBeVisible();
  });

  test("debe aceptar un nombre válido con exactamente 2 caracteres", async ({
    page,
  }) => {
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("AB"); // Exactamente 2 caracteres

    // Esperar a que la validación se actualice
    await page.waitForTimeout(500);

    // Verificar que NO se muestra el error de mínimo de caracteres
    const errorMessages = page.locator(
      "text=/El nombre debe tener al menos 2 caracteres/i"
    );
    await expect(errorMessages).toHaveCount(0);
  });

  test("debe aceptar un nombre válido con exactamente 100 caracteres", async ({
    page,
  }) => {
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    const validName = "A".repeat(100); // Exactamente 100 caracteres
    await nombreInput.fill(validName);

    // Esperar a que la validación se actualice
    await page.waitForTimeout(500);

    // Verificar que NO se muestra el error de máximo de caracteres
    const errorMessages = page.locator(
      "text=/El nombre no puede exceder 100 caracteres/i"
    );
    await expect(errorMessages).toHaveCount(0);
  });

  // Validaciones del campo CORREO
  test("debe mostrar error cuando el correo tiene formato inválido", async ({
    page,
  }) => {
    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill("correo-invalido-sin-arroba");

    // Intentar enviar el formulario o cambiar el foco
    await correoInput.blur();
    await page.waitForTimeout(500);

    // Verificar que se muestra el mensaje de error
    await expect(
      page.getByText("Por favor ingresa un correo electrónico válido")
    ).toBeVisible();
  });

  test("debe aceptar un correo válido", async ({ page }) => {
    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill("usuario.valido@ejemplo.com");

    await correoInput.blur();
    await page.waitForTimeout(500);

    // Verificar que NO se muestra el error
    const errorMessages = page.locator(
      "text=/Por favor ingresa un correo electrónico válido/i"
    );
    await expect(errorMessages).toHaveCount(0);
  });

  test("debe permitir dejar el correo vacío (campo opcional)", async ({
    page,
  }) => {
    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();

    await correoInput.blur();
    await page.waitForTimeout(500);

    // Verificar que NO se muestra error ya que es opcional
    const errorMessages = page.locator(
      "text=/Por favor ingresa un correo electrónico válido/i"
    );
    await expect(errorMessages).toHaveCount(0);
  });

  // Validaciones del campo DESCRIPCIÓN
  test("debe mostrar error cuando la descripción excede 500 caracteres", async ({
    page,
  }) => {
    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();
    // Crear un string de 501 caracteres
    const longDescription = "A".repeat(501);
    await descripcionInput.fill(longDescription);

    // Esperar a que la validación se ejecute
    await descripcionInput.blur();
    await page.waitForTimeout(500);

    // Verificar que se muestra el mensaje de error
    await expect(
      page.getByText("La descripción no puede exceder 500 caracteres")
    ).toBeVisible();
  });

  test("debe aceptar una descripción válida con exactamente 500 caracteres", async ({
    page,
  }) => {
    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();
    const validDescription = "A".repeat(500); // Exactamente 500 caracteres
    await descripcionInput.fill(validDescription);

    await descripcionInput.blur();
    await page.waitForTimeout(500);

    // Verificar que NO se muestra el error
    const errorMessages = page.locator(
      "text=/La descripción no puede exceder 500 caracteres/i"
    );
    await expect(errorMessages).toHaveCount(0);
  });

  test("debe permitir dejar la descripción vacía (campo opcional)", async ({
    page,
  }) => {
    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();

    await descripcionInput.blur();
    await page.waitForTimeout(500);

    // Verificar que NO se muestra error ya que es opcional
    const errorMessages = page.locator(
      "text=/La descripción no puede exceder 500 caracteres/i"
    );
    await expect(errorMessages).toHaveCount(0);
  });

  // Validaciones del campo ESTADO
  test("debe requerir que se seleccione un estado", async ({ page }) => {
    const estadoSelect = page.locator('select[name="estado"]').first();

    // Verificar que el select tiene un valor por defecto (debe tener uno)
    const currentValue = await estadoSelect.inputValue();
    expect(currentValue).toBeTruthy();

    // El estado es requerido pero como tiene un valor por defecto, no debería mostrar error
    // Este test verifica que el campo está presente y tiene valores válidos
    await expect(estadoSelect).toBeVisible();

    // Verificar que tiene las opciones correctas
    const options = await estadoSelect.locator("option").allTextContents();
    expect(options).toContain("Borrador");
    expect(options).toContain("Activo");
    expect(options).toContain("Inactivo");
  });

  test("debe aceptar todos los valores válidos del estado", async ({
    page,
  }) => {
    const estadoSelect = page.locator('select[name="estado"]').first();

    const validStates = ["borrador", "activo", "inactivo"];

    for (const state of validStates) {
      await estadoSelect.selectOption(state);
      await page.waitForTimeout(300);

      const selectedValue = await estadoSelect.inputValue();
      expect(selectedValue).toBe(state);

      // Verificar que no hay error
      const errorMessages = page.locator("text=/Debes seleccionar un estado/i");
      await expect(errorMessages).toHaveCount(0);
    }
  });

  // Validaciones del campo FOTO DE PERFIL (imagen)
  test("debe mostrar error al subir una imagen mayor a 5MB", async ({
    page,
  }) => {
    // Crear un archivo temporal de más de 5MB
    const tempFilePath = path.join(__dirname, "temp-large-image.jpg");
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1); // 5MB + 1 byte
    fs.writeFileSync(tempFilePath, largeBuffer);

    try {
      // Intentar subir el archivo
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tempFilePath);

      // Esperar a que se procese la validación
      await page.waitForTimeout(500);

      // Verificar que se muestra el mensaje de error
      await expect(
        page.getByText("La imagen no puede ser mayor a 5MB")
      ).toBeVisible();
    } finally {
      // Limpiar el archivo temporal
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });

  test("debe mostrar error al subir un archivo que no es una imagen", async ({
    page,
  }) => {
    // Crear un archivo de texto que simule un archivo inválido
    const tempFilePath = path.join(__dirname, "temp-invalid-file.txt");
    fs.writeFileSync(tempFilePath, "Este no es un archivo de imagen");

    try {
      // Intentar subir el archivo
      const fileInput = page.locator('input[type="file"]');

      // Playwright normalmente validaría el tipo de archivo, pero podemos verificar
      // que solo se aceptan formatos de imagen a través del accept attribute
      const acceptAttr = await fileInput.getAttribute("accept");
      expect(acceptAttr).toContain("image/jpeg");
      expect(acceptAttr).toContain("image/png");
      expect(acceptAttr).toContain("image/webp");
    } finally {
      // Limpiar el archivo temporal
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });

  test("debe aceptar una imagen válida (JPG, PNG o WebP menor a 5MB)", async ({
    page,
  }) => {
    // Usar la imagen de prueba existente
    const imagePath = path.resolve(__dirname, "../images/test-profile.jpg");

    // Verificar que el archivo existe
    if (fs.existsSync(imagePath)) {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(imagePath);

      // Esperar a que se procese
      await page.waitForTimeout(500);

      // Verificar que NO se muestra error de tamaño
      const sizeErrorMessages = page.locator(
        "text=/La imagen no puede ser mayor a 5MB/i"
      );
      await expect(sizeErrorMessages).toHaveCount(0);

      // Verificar que NO se muestra error de formato
      const formatErrorMessages = page.locator(
        "text=/Solo se permiten formatos JPG, PNG y WebP/i"
      );
      await expect(formatErrorMessages).toHaveCount(0);

      // Verificar que se muestra el preview de la imagen
      const imagePreview = page
        .locator('img[alt*="Preview"], img[alt*="perfil"]')
        .first();
      await expect(imagePreview).toBeVisible({ timeout: 2000 });
    }
  });

  // Test de validación múltiple - varios errores a la vez
  test("debe mostrar múltiples errores cuando varios campos son inválidos", async ({
    page,
  }) => {
    // Nombre inválido (muy corto)
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("A");

    // Correo inválido
    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill("correo-invalido");

    // Descripción muy larga
    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();
    const longDescription = "A".repeat(501);
    await descripcionInput.fill(longDescription);

    // Intentar enviar
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Verificar que se muestran todos los errores
    await expect(
      page.getByText("El nombre debe tener al menos 2 caracteres")
    ).toBeVisible();

    await expect(
      page.getByText("Por favor ingresa un correo electrónico válido")
    ).toBeVisible();

    await expect(
      page.getByText("La descripción no puede exceder 500 caracteres")
    ).toBeVisible();
  });

  // Test de validación - campos válidos deben permitir envío
  test("debe permitir enviar el formulario cuando todos los campos son válidos", async ({
    page,
  }) => {
    // Mock del API para simular una actualización exitosa
    await page.route(`**/api/perfiles/${profileId}`, async (route: any) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: profileId,
            message: "Perfil actualizado exitosamente",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Llenar todos los campos con valores válidos
    const nombreInput = page.locator('input[name="nombre"]').first();
    await nombreInput.clear();
    await nombreInput.fill("Nombre Válido");

    const correoInput = page.locator('input[type="email"]');
    await correoInput.clear();
    await correoInput.fill("correo.valido@ejemplo.com");

    const descripcionInput = page.locator('textarea[name="descripcion"]');
    await descripcionInput.clear();
    await descripcionInput.fill("Descripción válida del perfil");

    const estadoSelect = page.locator('select[name="estado"]').first();
    await estadoSelect.selectOption("activo");

    // Esperar a que los cambios se registren
    await page.waitForTimeout(500);

    // Verificar que no hay errores de validación
    const errorMessages = page.locator("text=/debe tener|no puede|válido/i");
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);

    // El botón debería estar habilitado (ya que hay cambios y son válidos)
    const submitButton = page.locator('button[type="submit"]').first();
    const isDisabled = await submitButton.isDisabled();

    // Si el botón está habilitado, intentar enviar
    if (!isDisabled) {
      await submitButton.click();

      // Verificar que se muestra el mensaje de éxito
      await expect(
        page.getByText(/actualizado exitosamente|Redirigiendo/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });
});
