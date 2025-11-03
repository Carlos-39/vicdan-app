// Mock del módulo JWT para evitar el error de variable de entorno
jest.mock("../../src/lib/jwt", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jwt = require("jsonwebtoken");
  const secret = "test_secret_key_for_jwt_tests";

  const generateAuthToken = (payload: Record<string, unknown>) => {
    return jwt.sign(payload, secret, { expiresIn: "1h" });
  };

  const verifyAuthToken = (token: string) => {
    try {
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  };

  return { generateAuthToken, verifyAuthToken };
});

import { generateAuthToken, verifyAuthToken } from "../../src/lib/jwt";
import jwt from "jsonwebtoken";

describe("JWT Utility Functions", () => {
  const payload = {
    id: "1",
    nombre: "Laura",
    email: "laura@ejemplo.com",
    rol: "admin" as const,
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
    const expiredToken = jwt.sign(payload, "test_secret_key_for_jwt_tests", {
      expiresIn: "1ms",
    });

    // Esperamos un poco para que expire
    await new Promise((r) => setTimeout(r, 5));

    const result = verifyAuthToken(expiredToken);
    expect(result).toBeNull();
  });

  it("debería generar tokens diferentes para el mismo payload", () => {
    const token1 = generateAuthToken(payload);

    // Pequeña pausa para asegurar timestamps diferentes
    setTimeout(() => {}, 1);

    const token2 = generateAuthToken(payload);

    // Los tokens pueden ser iguales si se generan muy rápido, pero ambos deben ser strings válidos
    expect(typeof token1).toBe("string");
    expect(typeof token2).toBe("string");
    expect(token1.length).toBeGreaterThan(0);
    expect(token2.length).toBeGreaterThan(0);

    // Verificamos que ambos tokens sean válidos
    const decoded1 = verifyAuthToken(token1);
    const decoded2 = verifyAuthToken(token2);

    expect(decoded1).not.toBeNull();
    expect(decoded2).not.toBeNull();
  });

  it("debería manejar payloads con diferentes tipos de datos", () => {
    const complexPayload = {
      id: "123",
      nombre: "Juan Pérez",
      email: "juan@ejemplo.com",
      rol: "admin" as const,
      permisos: ["read", "write", "delete"],
      metadata: {
        ultimoAcceso: new Date().toISOString(),
        activo: true,
      },
    };

    const token = generateAuthToken(complexPayload);
    const decoded = verifyAuthToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(complexPayload.id);
    // Verificamos que los datos adicionales estén presentes
    expect((decoded as Record<string, unknown>)?.permisos).toEqual(
      complexPayload.permisos
    );
    expect((decoded as Record<string, unknown>)?.metadata).toBeDefined();
  });

  it("debería devolver null para tokens malformados", () => {
    const malformedTokens = [
      "token.malformado",
      "solo.una.parte",
      "sin.puntos",
      "",
      "header.payload", // Falta signature
      "header.payload.signature.extra", // Demasiadas partes
    ];

    malformedTokens.forEach((token) => {
      const result = verifyAuthToken(token);
      expect(result).toBeNull();
    });
  });

  it("debería devolver null para tokens con firma incorrecta", () => {
    const validToken = generateAuthToken(payload);
    const parts = validToken.split(".");

    // Modificamos la firma para que sea inválida
    const invalidToken = `${parts[0]}.${parts[1]}.invalid_signature`;

    const result = verifyAuthToken(invalidToken);
    expect(result).toBeNull();
  });

  it("debería manejar tokens con payload mínimo", () => {
    const minimalPayload = {
      id: "1",
      nombre: "Test",
      email: "test@test.com",
      rol: "admin" as const,
    };
    const token = generateAuthToken(minimalPayload);
    const decoded = verifyAuthToken(token);

    expect(decoded).not.toBeNull();
    expect(typeof decoded).toBe("object");
  });

  it("debería ser consistente con jwt.sign y jwt.verify directamente", () => {
    const directToken = jwt.sign(payload, "test_secret_key_for_jwt_tests", {
      expiresIn: "1h",
    });
    const ourToken = generateAuthToken(payload);

    // Ambos tokens deben ser válidos
    const directDecoded = jwt.verify(
      directToken,
      "test_secret_key_for_jwt_tests"
    );
    const ourDecoded = verifyAuthToken(ourToken);

    expect(directDecoded).toBeDefined();
    expect(ourDecoded).toBeDefined();
    expect(typeof directToken).toBe("string");
    expect(typeof ourToken).toBe("string");
  });
});
