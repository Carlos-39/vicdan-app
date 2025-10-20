import { generateAuthToken, verifyAuthToken } from "../../src/utils/jwt";
import jwt from "jsonwebtoken";

// ⚙️ Simular variable de entorno
process.env.JWT_SECRET = "test_secret_key";

describe("JWT Utility Functions", () => {
  const payload = {
    id: "1",
    nombre: "Laura",
    email: "laura@ejemplo.com",
    rol: "admin",
  };

  it("debería generar un token JWT válido", () => {
    const token = generateAuthToken(payload);

    // Verificamos que el token sea un string
    expect(typeof token).toBe("string");

    // Verificamos que el token tenga tres partes (header.payload.signature)
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  it("debería verificar y decodificar correctamente un token válido", () => {
    const token = generateAuthToken(payload);
    const decoded = verifyAuthToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.nombre).toBe(payload.nombre);
    expect(decoded?.rol).toBe("admin");
  });

  it("debería devolver null si el token es inválido o manipulado", () => {
    const token = generateAuthToken(payload);
    const invalidToken = token + "malicioso";

    const result = verifyAuthToken(invalidToken);
    expect(result).toBeNull();
  });

  it("debería devolver null si el token ha expirado", async () => {
    // Creamos un token que expira inmediatamente
    const expiredToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1ms",
    });

    // Esperamos un poco para que expire
    await new Promise((r) => setTimeout(r, 5));

    const result = verifyAuthToken(expiredToken);
    expect(result).toBeNull();
  });
});
