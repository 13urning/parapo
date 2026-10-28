// @vitest-environment node
import { POST } from '@/app/api/session/clear/route';

describe('POST /api/session/clear', () => {
  it('expires the parapo_session cookie server-side', async () => {
    const res = await POST();
    expect(res.status).toBe(204);
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('parapo_session='))!;
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/Path=\//i);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Max-Age=0/i);
    expect(cookie).toMatch(/^parapo_session=;/);
  });

  it('is not cacheable', async () => {
    expect((await POST()).headers.get('cache-control')).toBe('no-store');
  });
});
