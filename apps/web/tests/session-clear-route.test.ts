// @vitest-environment node
import { POST } from '@/app/api/session/clear/route';

const req = (headers: Record<string, string> = {}) =>
  new Request('http://localhost:3000/api/session/clear', { method: 'POST', headers });

describe('POST /api/session/clear', () => {
  it('expires the parapo_session cookie server-side', async () => {
    const res = await POST(req());
    expect(res.status).toBe(204);
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('parapo_session='))!;
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/Path=\//i);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Max-Age=0/i);
    expect(cookie).toMatch(/^parapo_session=;/);
  });

  it('is not cacheable', async () => {
    expect((await POST(req())).headers.get('cache-control')).toBe('no-store');
  });

  it('accepts a same-origin Origin header', async () => {
    expect((await POST(req({ origin: 'http://localhost:3000' }))).status).toBe(204);
  });

  it('rejects a cross-origin Origin header with 403 and does not clear the cookie', async () => {
    const res = await POST(req({ origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('rejects a malformed Origin header', async () => {
    expect((await POST(req({ origin: 'null' }))).status).toBe(403);
  });
});
