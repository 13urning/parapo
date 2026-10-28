// @vitest-environment node
import { NextRequest } from 'next/server';
import { DELETE, GET, POST, dynamic } from '@/app/api/v1/[...path]/route';

const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });

function upstreamResponse(status = 200, body: string | null = '{"ok":true}') {
  const headers = new Headers({ 'content-type': 'application/json', connection: 'keep-alive', 'transfer-encoding': 'chunked' });
  headers.append('set-cookie', 'parapo_session=abc; Path=/; HttpOnly; SameSite=Lax');
  headers.append('set-cookie', 'other=1; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT');
  return new Response(body, { status, headers });
}

describe('API proxy route handler', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    delete process.env.API_INTERNAL_URL;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('is dynamic so the upstream URL is resolved at runtime', () => {
    expect(dynamic).toBe('force-dynamic');
  });

  it('forwards method, path, query, body, cookie and content-type to API_INTERNAL_URL', async () => {
    process.env.API_INTERNAL_URL = 'http://api:3001/';
    fetchMock.mockResolvedValue(upstreamResponse(200));
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login?next=%2Fplan', {
      method: 'POST',
      headers: { cookie: 'parapo_session=old', 'content-type': 'application/json', 'x-secret': 'nope' },
      body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
    });

    const res = await POST(req, ctx('auth', 'login'));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api:3001/api/v1/auth/login?next=%2Fplan');
    expect(init.method).toBe('POST');
    const sent = init.headers as Headers;
    expect(sent.get('cookie')).toBe('parapo_session=old');
    expect(sent.get('content-type')).toBe('application/json');
    expect(sent.get('x-secret')).toBeNull();
    expect(Buffer.from(init.body as ArrayBuffer).toString()).toBe('{"email":"a@b.c","password":"x"}');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it('defaults to http://localhost:3001 when API_INTERNAL_URL is unset', async () => {
    fetchMock.mockResolvedValue(upstreamResponse(200));
    await GET(new NextRequest('http://localhost:3000/api/v1/health'), ctx('health'));
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3001/api/v1/health');
  });

  it('passes every Set-Cookie header through and strips hop-by-hop headers', async () => {
    fetchMock.mockResolvedValue(upstreamResponse(200));
    const res = await GET(new NextRequest('http://localhost:3000/api/v1/auth/me'), ctx('auth', 'me'));

    expect(res.headers.getSetCookie()).toEqual([
      'parapo_session=abc; Path=/; HttpOnly; SameSite=Lax',
      'other=1; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT',
    ]);
    expect(res.headers.get('connection')).toBeNull();
    expect(res.headers.get('transfer-encoding')).toBeNull();
    expect(res.headers.get('content-type')).toBe('application/json');
  });

  it('sets X-Forwarded-For from the incoming x-forwarded-for, else x-real-ip', async () => {
    fetchMock.mockResolvedValue(upstreamResponse(200));
    await GET(
      new NextRequest('http://localhost:3000/api/v1/auth/me', { headers: { 'x-forwarded-for': '203.0.113.7' } }),
      ctx('auth', 'me'),
    );
    expect((fetchMock.mock.calls[0][1].headers as Headers).get('x-forwarded-for')).toBe('203.0.113.7');

    fetchMock.mockResolvedValue(upstreamResponse(200));
    await GET(
      new NextRequest('http://localhost:3000/api/v1/auth/me', { headers: { 'x-real-ip': '198.51.100.9' } }),
      ctx('auth', 'me'),
    );
    expect((fetchMock.mock.calls[1][1].headers as Headers).get('x-forwarded-for')).toBe('198.51.100.9');
  });

  it('forwards the Origin header unchanged', async () => {
    fetchMock.mockResolvedValue(upstreamResponse(200));
    await POST(
      new NextRequest('http://localhost:3000/api/v1/trips', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
        body: '{}',
      }),
      ctx('trips'),
    );
    expect((fetchMock.mock.calls[0][1].headers as Headers).get('origin')).toBe('http://localhost:3000');
  });

  it('returns 204 responses without a body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const res = await DELETE(new NextRequest('http://localhost:3000/api/v1/trips/1', { method: 'DELETE' }), ctx('trips', '1'));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('relays upstream error statuses and bodies', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"statusCode":401,"message":"Invalid email or password","error":"Unauthorized"}', {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const res = await POST(
      new NextRequest('http://localhost:3000/api/v1/auth/login', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } }),
      ctx('auth', 'login'),
    );
    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe('Invalid email or password');
  });

  it('answers 502 when the API is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await GET(new NextRequest('http://localhost:3000/api/v1/health'), ctx('health'));
    expect(res.status).toBe(502);
  });
});
