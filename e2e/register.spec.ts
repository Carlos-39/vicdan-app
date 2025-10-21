// e2e/register.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Registro Tests (RegisterAdmin)", () => {
  test("Registro con contraseña inválida - muestra mensaje de validación", async ({ page }) => {
    // Ir a la página de registro
    await page.goto("/register-admin");

    // Llenar los campos: nombre y email válidos
    await page.locator('input[name="name"]').fill("Usuario Prueba");
    await page.locator('input[name="email"]').fill("usuario_prueba@example.com");

    // Contraseña inválida: minúsculas y números, pero NO mayúscula ni símbolo
    await page.locator('input[name="password"]').fill("contrasena123");
    await page.locator('input[name="confirmPassword"]').fill("contrasena123");

    // Forzar blur en ambos campos para disparar mode: "onBlur"
    await page.locator('input[name="password"]').evaluate((el: HTMLInputElement) => el.blur());
    await page.locator('input[name="confirmPassword"]').evaluate((el: HTMLInputElement) => el.blur());

    // Opcional: hacer click en submit para forzar validación adicional
    await page.getByRole("button", { name: /registrar/i }).click();

    // Buscar el mensaje exacto de Yup — esto evita confundirlo con el hint.
    // Puedes comprobar cualquiera de las dos cadenas definidas en el esquema:
    await expect(
      page.getByText(/Debe contener al menos una mayúscula/i)
    ).toBeVisible();

    // O si prefieres aceptar cualquiera de los dos mensajes válidos:
    // await expect(page.getByText(/Debe contener al menos una mayúscula|Debe contener al menos un símbolo/i)).toBeVisible();

    // Aseguramos que no se muestre el mensaje de éxito
    await expect(page.getByText(/¡Registro exitoso!/i)).toHaveCount(0);

    // Confirmamos que seguimos en la página de registro
    await expect(page).toHaveURL(/\/register-admin/);
  });

  test("Registro con correo duplicado — registrar dos veces el mismo email (cliente-only)", async ({ page }) => {
    await page.goto("/register-admin");

    const duplicateEmail = "admin@vicdan.com";

    // Primer registro (cliente)
    await page.locator('input[name="name"]').fill("Usuario Duplicado 1");
    await page.locator('input[name="email"]').fill(duplicateEmail);
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('input[name="confirmPassword"]').fill("Password123!");
    await page.getByRole("button", { name: /registrar/i }).click();

    await expect(page.getByText("¡Registro exitoso!")).toBeVisible();

    // Recargamos la página para simular un nuevo intento limpio
    await page.reload();

    // Segundo registro con el mismo email
    await page.locator('input[name="name"]').fill("Usuario Duplicado 2");
    await page.locator('input[name="email"]').fill(duplicateEmail);
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('input[name="confirmPassword"]').fill("Password123!");
    await page.getByRole("button", { name: /registrar/i }).click();

    // Con la implementación actual sin backend, también vemos éxito
    await expect(page.getByText("¡Registro exitoso!")).toBeVisible();
  });

  test("Registro exitoso con datos válidos - muestra mensaje de éxito", async ({
    page,
  }) => {
    await page.goto("/register-admin");

    // Email único para evitar interferencias locales
    const timestamp = Date.now();
    const uniqueEmail = `usuario_${timestamp}@example.com`;

    await page.locator('input[name="name"]').fill("Usuario Nuevo");
    await page.locator('input[name="email"]').fill(uniqueEmail);

    // Contraseña válida: mayúscula, minúscula, número y símbolo
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('input[name="confirmPassword"]').fill("Password123!");

    // Botón Registrar
    const submit = page.getByRole("button", { name: /registrar/i });

    // Esperamos que esté habilitado y hacemos click
    await expect(submit).toBeEnabled();
    await submit.click();

    // Tu componente marca success=true y renderiza: "¡Registro exitoso!"
    const success = page.getByText("¡Registro exitoso!");
    await expect(success).toBeVisible();
  });
});
