// Control characters (tab/newline are silently stripped by URL parsers) and backslashes enable open redirects.
const UNSAFE = /[\x00-\x1f\x7f\\]/;

/**
 * Only same-origin relative paths are allowed as post-login redirect targets.
 * Returns pathname + search + hash of the validated URL, or the fallback.
 */
export function safeNext(next: string | null | undefined, fallback = '/plan') {
  if (!next) return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return fallback;
  }
  // Check the decoded form too: `/%09/evil` or `/%5Cevil` must not slip past a later decode.
  if (UNSAFE.test(next) || UNSAFE.test(decoded)) return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || decoded.startsWith('//')) return fallback;
  try {
    const url = new URL(next, 'http://x');
    if (url.origin !== 'http://x') return fallback;
    if (url.pathname === '/login' || url.pathname === '/register') return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
