export interface SessionClaims {
  sub?: string;
  role?: 'COMMUTER' | 'ADMIN';
  name?: string;
  exp?: number;
}

/**
 * Decodes (does NOT verify) a JWT payload. Only for UX redirects; the API is the
 * sole authority on authentication and authorization.
 */
export function decodeJwtPayload(token: string | undefined): SessionClaims | null {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return parsed && typeof parsed === 'object' ? (parsed as SessionClaims) : null;
  } catch {
    return null;
  }
}

export function isExpired(claims: SessionClaims | null, nowMs = Date.now()) {
  return !!claims?.exp && claims.exp * 1000 <= nowMs;
}
