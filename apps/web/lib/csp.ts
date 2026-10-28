/** Enforced Content-Security-Policy, built per request with a nonce. */
export function buildCsp(nonce: string, isDev = process.env.NODE_ENV !== 'production') {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
    "connect-src 'self'",
    "font-src 'self' data:",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export function makeNonce() {
  return btoa(crypto.randomUUID());
}
