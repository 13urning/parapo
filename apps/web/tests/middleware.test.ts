// @vitest-environment node
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

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

  it('lets anonymous users see /login and /register', () => {
    expect(run('/login').headers.get('location')).toBeNull();
    expect(run('/register').headers.get('location')).toBeNull();
  });
});
