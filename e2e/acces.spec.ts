import { test, expect } from '@playwright/test';

// Helper para agregar listeners de debug en la página — imprime consola, errores y respuestas
async function attachDebugLogs(page: any) {
  page.on('console', (msg: any) => console.log(`[PAGE ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err: any) => console.error('[PAGE ERROR]', err));
  page.on('response', (r: any) => console.log(`[RESP ${r.status()}] ${r.url()}`));
  page.on('requestfailed', (r: any) => console.warn('[REQ FAIL]', r.url(), r.failure()?.errorText));
}

test.describe('Tests de acceso y autenticación con NextAuth.js', () => {
  test('Test de acceso con sesión válida debe permitir la entrada', async ({ page }) => {
    await attachDebugLogs(page);

    // Arrange - Autenticarse correctamente usando el formulario de login
    await page.goto('/login');

    // Llenar el formulario de login con credenciales válidas
    await page.fill('input[type="email"]', 'brayanss2018@gmail.com');
    await page.fill('input[type="password"]', 'Steven-123');

    // Hacer submit del formulario y esperar navegación a dashboard
    await Promise.all([
      page.waitForURL(/dashboard/, { timeout: 15000 }),
      page.click('button[type="submit"]:has-text("Iniciar sesión")'),
    ]);

    // Asegurar que la página terminó de cargar recursos
    await page.waitForLoadState('networkidle');

    // Act - Navegar al dashboard (ya deberíamos estar autenticados)
    await page.goto('/dashboard');

    // Assert - Verificar que estamos en el dashboard y no fuimos redirigidos
    expect(page.url()).toContain('/dashboard');

    // Verificar elementos que confirmen que estamos en el dashboard
    await expect(page.locator('body')).toContainText(/dashboard/i);

    // Verificar que no estamos en la página de login
    await expect(page).not.toHaveURL('/login');

    // Verificar que hay elementos del dashboard visibles
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Test de acceso con credenciales inválidas debe mostrar error', async ({ page }) => {
    await attachDebugLogs(page);

    await page.goto('/login');

    // Intentar iniciar sesión con credenciales inválidas
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');

    // Esperar a que aparezca el mensaje de error
    await page.waitForTimeout(2000);

    // Verificar que se muestre el mensaje de error específico
    const errorMessage = await page.textContent('p[class*="error"], div[class*="error"], .error');
    expect(errorMessage).toContain('El correo ingresado no está registrado');
    
    // Verificar que permanezca en la página de login
    await expect(page).toHaveURL(/login/);
  });

  test('Test de redirección sin autenticación debe redirigir al login', async ({ page }) => {
    await attachDebugLogs(page);

    // Arrange - Asegurarse de que no hay sesión activa
    await page.goto('/login');

    // Cerrar sesión si existe (intenta ambos selectores por separado y corto timeout)
    try {
      const logoutBtn = page.locator('button:has-text("Cerrar sesión")').first();
      if (await logoutBtn.count()) {
        await logoutBtn.click({ timeout: 2000 });
        await page.waitForLoadState('networkidle');
      } else {
        const logoutLink = page.locator('a:has-text("Salir")').first();
        if (await logoutLink.count()) {
          await logoutLink.click({ timeout: 2000 });
          await page.waitForLoadState('networkidle');
        }
      }
    } catch (error) {
      // Si no hay botón de cerrar sesión, continuar
      console.log('No se encontró botón de cerrar sesión (ok).');
    }

    // Act - Intentar acceder al dashboard sin autenticación
    // Esperamos la redirección a login si el middleware la ejecuta
    await page.goto('/dashboard').catch(err => console.warn('page.goto to /dashboard failed:', err));

    // Assert - Verificar que fuimos redirigidos a la página de login
    await expect(page).toHaveURL('/login');

    // Verificar elementos que confirmen que estamos en la página de login
    await expect(page.locator('button[type="submit"]:has-text("Iniciar sesión")')).toBeVisible();

    // Verificar campos de email y contraseña
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verificar que no estamos en el dashboard
    await expect(page).not.toHaveURL('/dashboard');
  });
});