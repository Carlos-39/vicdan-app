import { Page, expect } from "@playwright/test";

/**
 * Helper function to log in a user
 * @param page - Playwright Page object
 * @param email - User email (default: brayanss2018@gmail.com)
 * @param password - User password (default: Steven-123)
 */
export async function login(
  page: Page,
  email: string = "brayanss2018@gmail.com",
  password: string = "Steven-123"
) {
  await page.goto("/login");

  // Esperar a que el formulario esté listo
  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.waitForSelector('input[type="password"]', { state: "visible" });

  // Llenar los campos
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Esperar a que el botón esté habilitado
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  // Hacer click y esperar a que se complete el proceso de login
  await submitButton.click();

  // Esperar a que el botón muestre el estado de carga (opcional, pero ayuda a verificar que el proceso inició)
  await page.waitForTimeout(500);

  // Esperar a que la URL cambie a dashboard (con timeout más largo)
  await page.waitForURL(/dashboard/, { timeout: 15000 });

  // Verificar que efectivamente estamos en el dashboard
  await expect(page).toHaveURL(/dashboard/);
}

export async function login_alternative(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "brayanss2018@gmail.com");
  await page.fill('input[type="password"]', "Steven-123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}