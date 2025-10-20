import { test, expect } from '@playwright/test';
import { hashPassword, comparePassword } from '../src/lib/crypto';

test.describe('Funciones de criptografía', () => {
  test('Validar función de hash de contraseña', async () => {
    // Arrange
    const plainPassword = 'Contraseña123!';
    
    // Act
    const hashedPassword = await hashPassword(plainPassword);
    
    // Assert
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(plainPassword);
    expect(hashedPassword.startsWith('$2a$')).toBeTruthy(); // Verifica que sea un hash de bcrypt
    expect(hashedPassword.length).toBeGreaterThan(50); // Los hashes de bcrypt son largos
  });

  test('Validar comparación de contraseñas', async () => {
    // Arrange
    const plainPassword = 'Contraseña123!';
    const hashedPassword = await hashPassword(plainPassword);
    const wrongPassword = 'ContraseñaIncorrecta123!';
    
    // Act & Assert - Contraseña correcta
    const validComparison = await comparePassword(plainPassword, hashedPassword);
    expect(validComparison).toBeTruthy();
    
    // Act & Assert - Contraseña incorrecta
    const invalidComparison = await comparePassword(wrongPassword, hashedPassword);
    expect(invalidComparison).toBeFalsy();
  });
});