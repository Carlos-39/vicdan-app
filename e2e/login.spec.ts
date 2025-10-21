import { test, expect } from '@playwright/test'; 

test.describe('Tests de acceso y autenticación', () => {
  test('Test de redirección sin token debe redirigir al login', async ({ page }) => {
    // Arrange - Asegurarse de que no hay token (navegación limpia)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('fake-jwt-token');
    });

    // Act - Intentar acceder al dashboard sin token
    await page.goto('/dashboard');

    // Assert - Verificar que fuimos redirigidos a la página de login
    await expect(page).toHaveURL('/login');

    // Verificar elementos que confirmen que estamos en la página de login
    await expect(page.locator('button:has-text("Iniciar sesión")')).toBeVisible();
    // O algún otro elemento característico de la página de login
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });


  test('Test de acceso con token válido debe permitir la entrada', async ({ page }) => {
    // Arrange - Simular token y usuario en localStorage
    await page.goto('/'); // Página con dominio válido

    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem(
        'user',
        JSON.stringify({ name: 'Administrador', email: 'admin@vicdan.com' })
      );
    });

    // Act - Navegar al dashboard
    await page.goto('/dashboard');

    // Assert - Verificar que estamos en el dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Puedes ajustar este selector a lo que realmente haya en tu dashboard
    // await expect(page.locator('h1, h2, p')).toContainText(/dashboard|bienvenido|administrador/i);

    // Confirmar que NO fue redirigido al login
    await expect(page).not.toHaveURL(/\/login/);
  });
});