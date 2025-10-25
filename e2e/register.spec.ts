// e2e/register.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Registro Tests (RegisterAdmin)", () => {
  test("Registro con contraseña inválida - muestra mensaje de validación", async ({
    page,
  }) => {
    // Ir a la página de registro
    await page.goto("/register-admin");

    // Llenar los campos: nombre y email válidos
    await page.locator('input[name="name"]').fill("Usuario Prueba");

    await page
      .locator('input[name="email"]')
      .fill("usuario_prueba@example.com");

    // Contraseña inválida: tiene minúsculas y números pero NO mayúscula ni símbolo
    await page.locator('input[name="password"]').fill("contrasena123");
    await page.locator('input[name="confirmPassword"]').fill("contrasena123");

    // Click en Registrar
    const submit = page.getByRole("button", { name: /registrar/i });
    await expect(submit).toBeEnabled(); // el formulario puede estar listo según la lógica de strength
    await submit.click();

    // Debe mostrarse un mensaje de validación relacionado con mayúscula / símbolo
    // La validación la produce yup; detectamos alguno de los mensajes esperados
    await expect(
      page.getByText(
        /mayúscula|símbolo|Debe contener al menos una mayúscula|Debe contener al menos un símbolo/i
      )
    ).toBeVisible();

    // No debe redirigir a dashboard (tu componente actual no redirige)
    await expect(page).not.toHaveURL(/dashboard|success/);
  });

  test("Registro exitoso con datos válidos - muestra mensaje de éxito", async ({
    page,
  }) => {
    await page.goto("/register-admin");

    // Email único para evitar interferencias locales
    const timestamp = Date.now();
    const uniqueEmail = `usuario_${timestamp}@example.com`;

    await page.getByLabel("Nombre").fill("Usuario Nuevo");
    await page.getByLabel("Correo electrónico").fill(uniqueEmail);

    // Contraseña válida: mayúscula, minúscula, número y símbolo
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByLabel("Confirmar contraseña").fill("Password123!");

    // Botón Registrar
    const submit = page.getByRole("button", { name: /registrar/i });

    // Esperamos que esté habilitado y hacemos click
    await expect(submit).toBeEnabled();
    await submit.click();

    // Tu componente marca success=true y renderiza: "¡Registro exitoso!"
    const success = page.getByText("¡Registro exitoso!");
    await expect(success).toBeVisible();

    // No hay redirect en tu componente actual — solo comprobamos que se muestra el mensaje
    await expect(page).not.toHaveURL(/dashboard|success/);
  });

  test("Registro con correo duplicado (sin backend) — registrar dos veces el mismo email", async ({
    page,
  }) => {
    // Nota: actualmente tu RegisterAdmin no hace llamada al backend, por eso no hay verificación de "409".
    // Aquí comprobamos que, con la implementación actual, es posible enviar el mismo email dos veces y obtener el mensaje de éxito.
    // Si luego implementas un endpoint, abajo indico cómo mockear un 409.

    await page.goto("/register-admin");

    const duplicateEmail = "admin@vicdan.com";

    // Primer registro (cliente)
    await page.getByLabel("Nombre").fill("Usuario Duplicado 1");
    await page.getByLabel("Correo electrónico").fill(duplicateEmail);
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByLabel("Confirmar contraseña").fill("Password123!");
    await page.getByRole("button", { name: /registrar/i }).click();
    await expect(page.getByText("¡Registro exitoso!")).toBeVisible();

    // Limpiamos success y volvemos a intentar con el mismo email
    // (Si tu UI mantiene el estado de formulario, volvemos a cargar la página para simular otro intento)
    await page.reload();

    await page.getByLabel("Nombre").fill("Usuario Duplicado 2");
    await page.getByLabel("Correo electrónico").fill(duplicateEmail);
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByLabel("Confirmar contraseña").fill("Password123!");
    await page.getByRole("button", { name: /registrar/i }).click();

    // Con la implementación actual también veremos éxito
    await expect(page.getByText("¡Registro exitoso!")).toBeVisible();

    // ---- Información útil: si en el futuro implementas una API que responde 409,
    // puedes mockearla así (descomenta y ajusta la ruta si agregas fetch):
    //
    // await page.route('**/api/register', route => {
    //   route.fulfill({
    //     status: 409,
    //     contentType: 'application/json',
    //     body: JSON.stringify({ message: 'Correo ya registrado' })
    //   });
    // });
    //
    // y luego al hacer submit comprobarías que aparece el error:
    // await expect(page.getByText(/correo.*ya.*registrado|409/i)).toBeVisible();
  });
});
