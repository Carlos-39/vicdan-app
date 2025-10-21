import { hashPassword, comparePassword } from "../../src/lib/crypto";
import bcrypt from "bcryptjs";

describe("Crypto Utility Functions - bcrypt", () => {
  describe("hashPassword", () => {
    it("debería generar un hash válido para una contraseña", async () => {
      // Arrange
      const plainPassword = "Contraseña123!";

      // Act
      const hashedPassword = await hashPassword(plainPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword).not.toEqual(plainPassword);
      expect(hashedPassword.startsWith("$2")).toBeTruthy(); // Verifica que sea un hash de bcrypt
      expect(hashedPassword.length).toBeGreaterThan(50); // Los hashes de bcrypt son largos
    });

    it("debería generar hashes diferentes para la misma contraseña (salt)", async () => {
      // Arrange
      const plainPassword = "Contraseña123!";

      // Act
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      // Assert
      expect(hash1).not.toEqual(hash2); // Cada hash debe ser único debido al salt
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
    });

    it("debería manejar contraseñas con caracteres especiales", async () => {
      // Arrange
      const specialPassword = "P@ssw0rd!@#$%^&*()_+-=[]{}|;':\",./<>?";

      // Act
      const hashedPassword = await hashPassword(specialPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.startsWith("$2")).toBeTruthy();
    });

    it("debería manejar contraseñas vacías", async () => {
      // Arrange
      const emptyPassword = "";

      // Act
      const hashedPassword = await hashPassword(emptyPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.startsWith("$2")).toBeTruthy();
    });

    it("debería usar el número de rounds por defecto", async () => {
      // Arrange
      const plainPassword = "Test123!";

      // Act
      const hashedPassword = await hashPassword(plainPassword);

      // Assert
      // Verificamos que el hash contiene el número de rounds (12 por defecto)
      expect(hashedPassword).toMatch(/^\$2[ab]\$12\$/);
    });
  });

  describe("comparePassword", () => {
    it("debería retornar true para contraseña correcta", async () => {
      // Arrange
      const plainPassword = "Contraseña123!";
      const hashedPassword = await hashPassword(plainPassword);

      // Act
      const result = await comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
    });

    it("debería retornar false para contraseña incorrecta", async () => {
      // Arrange
      const plainPassword = "Contraseña123!";
      const wrongPassword = "ContraseñaIncorrecta123!";
      const hashedPassword = await hashPassword(plainPassword);

      // Act
      const result = await comparePassword(wrongPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
    });

    it("debería retornar false para contraseña vacía contra hash válido", async () => {
      // Arrange
      const plainPassword = "Contraseña123!";
      const emptyPassword = "";
      const hashedPassword = await hashPassword(plainPassword);

      // Act
      const result = await comparePassword(emptyPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
    });

    it("debería retornar false para hash inválido", async () => {
      // Arrange
      const plainPassword = "Contraseña123!";
      const invalidHash = "hash_invalido";

      // Act
      const result = await comparePassword(plainPassword, invalidHash);

      // Assert
      expect(result).toBe(false);
    });

    it("debería manejar contraseñas con caracteres especiales correctamente", async () => {
      // Arrange
      const specialPassword = "P@ssw0rd!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const hashedPassword = await hashPassword(specialPassword);

      // Act
      const correctResult = await comparePassword(
        specialPassword,
        hashedPassword
      );
      const incorrectResult = await comparePassword(
        "P@ssw0rd!@#$%^&*()_+-=[]{}|;':\",./<>",
        hashedPassword
      );

      // Assert
      expect(correctResult).toBe(true);
      expect(incorrectResult).toBe(false);
    });

    it("debería ser consistente con bcrypt.compare directamente", async () => {
      // Arrange
      const plainPassword = "TestPassword123!";
      const hashedPassword = await hashPassword(plainPassword);

      // Act
      const ourResult = await comparePassword(plainPassword, hashedPassword);
      const bcryptResult = await bcrypt.compare(plainPassword, hashedPassword);

      // Assert
      expect(ourResult).toBe(bcryptResult);
      expect(ourResult).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("debería completar el flujo completo: hash -> compare", async () => {
      // Arrange
      const testPasswords = [
        "Contraseña123!",
        "admin123",
        "P@ssw0rd!@#$%^&*()_+-=[]{}|;':\",./<>?",
        "123456",
        "",
      ];

      // Act & Assert
      for (const password of testPasswords) {
        const hashedPassword = await hashPassword(password);
        const isValid = await comparePassword(password, hashedPassword);

        expect(hashedPassword).toBeDefined();
        expect(isValid).toBe(true);
      }
    });

    it("debería fallar la comparación con contraseñas similares pero diferentes", async () => {
      // Arrange
      const password1 = "Contraseña123!";
      const password2 = "Contraseña123";
      const password3 = "contraseña123!";

      const hashedPassword1 = await hashPassword(password1);

      // Act & Assert
      const result1 = await comparePassword(password1, hashedPassword1); // Debe ser true
      const result2 = await comparePassword(password2, hashedPassword1); // Debe ser false
      const result3 = await comparePassword(password3, hashedPassword1); // Debe ser false

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });
});
