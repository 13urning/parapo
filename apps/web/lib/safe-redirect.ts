/** Only allow same-origin relative paths as post-login redirect targets. */
export function safeNext(next: string | null | undefined, fallback = '/plan') {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  if (next === '/login' || next === '/register') return fallback;
  return next;
}
