// @vitest-environment node
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { buildCsp } from '@/lib/csp';
import { config, middleware } from '@/middleware';

const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (payload: object) => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.sig`;
const future = Math.floor(Date.now() / 1000) + 3600;

function run(path: string, token?: string) {
  const req = new NextRequest(`http://localhost:3000${path}`, {
    headers: token ? { cookie: `parapo_session=${token}` } : {},
  });
  return middleware(req);
}
const location = (res: Response) => new URL(res.headers.get('location')!);

/** Discover every page under app/(app) so a newly added route cannot silently be unguarded. */
function appRoutes(dir = join(process.cwd(), 'app', '(app)'), prefix = ''): string[] {
  const routes: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const seg = name.startsWith('[') ? '123' : name;
      routes.push(...appRoutes(full, `${prefix}/${seg}`));
    } else if (name === 'page.tsx') {
      routes.push(prefix || '/');
    }
  }
  return routes;
}

describe('middleware', () => {
  it('redirects anonymous users to /login with the original path as next', () => {
    const res = run('/trips?page=2');
    expect(res.status).toBe(307);
    const loc = location(res);
    expect(loc.pathname).toBe('/login');
    expect(loc.searchParams.get('next')).toBe('/trips?page=2');
  });

  it('treats an expired token as no session', () => {
    const res = run('/plan', jwt({ role: 'COMMUTER', exp: 1 }));
    expect(location(res).pathname).toBe('/login');
  });

  it('lets a commuter through to commuter pages', () => {
    const res = run('/plan', jwt({ sub: '1', role: 'COMMUTER', exp: future }));
    expect(res.headers.get('location')).toBeNull();
  });

  it('bounces non-admins away from /admin to /plan', () => {
    const res = run('/admin/fare-matrices', jwt({ role: 'COMMUTER', exp: future }));
    expect(location(res).pathname).toBe('/plan');
  });

  it('bounces garbage tokens away from /admin', () => {
    expect(location(run('/admin/analytics', 'not-a-jwt')).pathname).toBe('/plan');
  });

  it('allows admins into /admin', () => {
    const res = run('/admin/fare-matrices/new', jwt({ role: 'ADMIN', exp: future }));
    expect(res.headers.get('location')).toBeNull();
  });

  it('sends logged-in users from /login and /register to /plan', () => {
    const token = jwt({ role: 'COMMUTER', exp: future });
    expect(location(run('/login', token)).pathname).toBe('/plan');
    expect(location(run('/register', token)).pathname).toBe('/plan');
  });

  it('lets /login render for a stale cookie when reason=expired (breaks the redirect loop)', () => {
    const token = jwt({ role: 'COMMUTER', exp: future });
    expect(run('/login?reason=expired', token).headers.get('location')).toBeNull();
  });

  it('lets anonymous users see /login and /register', () => {
    expect(run('/login').headers.get('location')).toBeNull();
    expect(run('/register').headers.get('location')).toBeNull();
  });

  it('handles / explicitly (the page redirects by session)', () => {
    expect(run('/').headers.get('location')).toBeNull();
  });
});

describe('Content-Security-Policy', () => {
  const csp = (res: Response) => res.headers.get('content-security-policy')!;
  beforeEach(() => vi.stubEnv('NODE_ENV', 'production'));
  afterEach(() => vi.unstubAllEnvs());

  it('allows unsafe-eval only in development', () => {
    expect(buildCsp('n', true)).toContain("'unsafe-eval'");
    expect(buildCsp('n', false)).not.toContain("'unsafe-eval'");
  });

  it('enforces (not report-only) a nonce-based CSP on page responses', () => {
    const res = run('/login');
    expect(res.headers.get('content-security-policy-report-only')).toBeNull();
    const policy = csp(res);
    expect(policy).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("connect-src 'self'");
    expect(policy).toContain('img-src');
    expect(policy).toContain('https://*.tile.openstreetmap.org');
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it('uses a fresh nonce for every request', () => {
    const nonce = (r: Response) => csp(r).match(/'nonce-([^']+)'/)![1];
    expect(nonce(run('/login'))).not.toBe(nonce(run('/login')));
  });

  it('forwards the nonce to the app via request headers', () => {
    const res = run('/login');
    const nonce = csp(res).match(/'nonce-([^']+)'/)![1];
    expect(res.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
    expect(res.headers.get('x-middleware-request-content-security-policy')).toBe(csp(res));
  });

  it('also sets the CSP on redirects and on /', () => {
    expect(csp(run('/trips'))).toContain('nonce-');
    expect(csp(run('/'))).toContain('nonce-');
  });
});

describe('route guarding', () => {
  const matcher = new RegExp(`^${config.matcher[0]}$`);

  it('discovers the app routes', () => {
    expect(appRoutes().length).toBeGreaterThanOrEqual(8);
  });

  it.each(appRoutes())('matcher covers and anonymous users are redirected from %s', (route) => {
    expect(matcher.test(route)).toBe(true);
    expect(location(run(route)).pathname).toBe('/login');
  });

  it.each(appRoutes().filter((r) => r.startsWith('/admin')))('non-admins are bounced from %s', (route) => {
    expect(location(run(route, jwt({ role: 'COMMUTER', exp: future }))).pathname).toBe('/plan');
  });

  it.each(['/api/v1/trips', '/api/session/clear', '/_next/static/chunk.js', '/sw.js', '/icon.svg', '/favicon.ico'])(
    'matcher excludes %s',
    (path) => {
      expect(matcher.test(path)).toBe(false);
    },
  );
});
