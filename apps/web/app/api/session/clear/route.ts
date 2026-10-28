import { NextResponse } from 'next/server';

// Not part of the proxied /api/v1 API: the session cookie is httpOnly, so only the server can remove it.
export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'parapo_session';

/** Clears a stale `parapo_session` cookie so /login is not bounced back to /plan by middleware. */
export async function POST() {
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
