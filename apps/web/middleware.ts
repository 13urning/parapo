import { NextResponse, type NextRequest } from 'next/server';
import { decodeJwtPayload, isExpired } from '@/lib/jwt';

const SESSION_COOKIE = 'parapo_session';
const PUBLIC_PATHS = ['/login', '/register'];

/**
 * UX-level route guard. It checks cookie presence and decodes (never verifies) the
 * JWT role; the API remains the sole authority on every request.
 */
export function middleware(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;
  // `/` has no UI; app/page.tsx redirects by session.
  if (pathname === '/') return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = decodeJwtPayload(token);
  const hasSession = !!token && !isExpired(claims);

  const redirect = (to: string, params?: Record<string, string>) => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    url.search = '';
    Object.entries(params ?? {}).forEach(([k, v]) => url.searchParams.set(k, v));
    return NextResponse.redirect(url);
  };

  if (PUBLIC_PATHS.includes(pathname)) {
    // reason=expired means the API rejected the cookie: let /login render so the loop breaks.
    if (hasSession && searchParams.get('reason') !== 'expired') return redirect('/plan');
    return NextResponse.next();
  }

  if (!hasSession) return redirect('/login', { next: `${pathname}${search}` });

  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && claims?.role !== 'ADMIN') {
    return redirect('/plan');
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the API, Next internals, the service worker, icons and any file with an extension.
  matcher: ['/((?!api|_next|sw\\.js|icon\\.svg|favicon\\.ico|.*\\..*).*)'],
};
