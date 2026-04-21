import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'horussight_secret_key_1337';

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extracts and verifies the JWT from an Authorization header.
 * Returns the decoded user payload, or null if invalid.
 */
export function getAuthUser(authHeader: string | null): any | null {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
