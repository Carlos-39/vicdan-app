import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET no está definida.');
}

// estructura de los datos que guardarás en el token
interface JwtPayload {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin'; 
}

/**
 * Genera un token de autenticación JWT.
 * @param payload Los datos para incluir en el token.
 * @returns El token firmado.
 */
export function generateAuthToken(payload: JwtPayload): string {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d', // El token expirará en 1 día
  });
  return token;
}

/**
 * Verifica y decodifica un token JWT.
 * @param token El token a verificar.
 * @returns El payload decodificado si el token es válido.
 */
export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    // El token es inválido o ha expirado
    return null;
  }
}

/** Intenta extraer el token del header Authorization: Bearer <token> */
export function getTokenFromAuthHeader(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}