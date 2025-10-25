import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

test.describe('Tests de acceso y autenticación', () => {
  test('Test de acceso con token válido debe permitir la entrada', async ({ page }) => {
    // Arrange - Crear un token válido
    const validToken = jwt.sign(
      { id: '123', email: 'usuario@ejemplo.com', role: 'admin' },
      process.env.JWT_SECRET || 'secret_de_prueba',
      { expiresIn: '1h' }
    );
    
    // Configurar localStorage con el token antes de navegar
    await page.goto('about:blank');
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
    }, validToken);
    
    // Act - Navegar al dashboard
    await page.goto('/dashboard');
    
    // Assert - Verificar que estamos en el dashboard y no fuimos redirigidos
    expect(page.url()).toContain('/dashboard');
    
    // Verificar elementos que confirmen que estamos en el dashboard
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    // Alternativa si no hay un h1 específico
    await expect(page).not.toHaveURL('/login');
  });

  test('Test de redirección sin token debe redirigir al login', async ({ page }) => {
    // Arrange - Asegurarse de que no hay token (navegación limpia)
    await page.goto('about:blank');
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
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
});