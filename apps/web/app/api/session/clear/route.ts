import { NextResponse } from 'next/server';

// Not part of the proxied /api/v1 API: the session cookie is httpOnly, so only the server can remove it.
export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'parapo_session';

/** A present Origin must be this app's own; otherwise another site could log the user out (CSRF). */
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // non-browser or same-origin navigation without Origin
  try {
    const o = new URL(origin);
    return o.origin === new URL(req.url).origin || o.host === req.headers.get('host');
  } catch {
    return false;
  }
}

/** Clears a stale `parapo_session` cookie so /login is not bounced back to /plan by middleware. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ statusCode: 403, message: 'Forbidden', error: 'Forbidden' }, { status: 403 });
  }
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
