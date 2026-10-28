import { request } from './client';
import { ApiError, toApiError } from './errors';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('toApiError', () => {
  it('maps a string message', () => {
    const e = toApiError(401, { statusCode: 401, message: 'Invalid email or password', error: 'Unauthorized' });
    expect(e).toBeInstanceOf(ApiError);
    expect(e.status).toBe(401);
    expect(e.message).toBe('Invalid email or password');
    expect(e.isUnauthorized).toBe(true);
  });

  it('keeps all validation messages and surfaces the first', () => {
    const e = toApiError(400, { statusCode: 400, message: ['baseFare must not be less than 1', 'baseKm too big'] });
    expect(e.message).toBe('baseFare must not be less than 1');
    expect(e.details).toHaveLength(2);
  });

  it('falls back to a generic message for unknown bodies', () => {
    expect(toApiError(500, null).message).toMatch(/something went wrong/i);
    expect(toApiError(418, 'nope').message).toBe('Request failed.');
  });
});

describe('request', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends same-origin credentials, JSON body and query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await request<{ ok: boolean }>('/trips', {
      method: 'POST',
      body: { a: 1 },
      query: { page: 2, skip: undefined, q: '' },
    });

    expect(res).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/trips?page=2');
    expect(init.credentials).toBe('same-origin');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('returns undefined for 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(request('/trips/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws ApiError with the server message on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(404, { statusCode: 404, message: 'Trip not found', error: 'Not Found' })));
    await expect(request('/trips/x')).rejects.toMatchObject({ name: 'ApiError', status: 404, message: 'Trip not found' });
  });

  it('survives non-JSON error bodies', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })));
    await expect(request('/x')).rejects.toMatchObject({ status: 502 });
  });

  it('maps network failures to an ApiError with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const err = (await request('/x').catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });
});
