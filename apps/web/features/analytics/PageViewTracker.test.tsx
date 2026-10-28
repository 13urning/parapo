import { render } from '@testing-library/react';
import { PageViewTracker, sendPageView } from './PageViewTracker';

let pathname = '/plan';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

describe('PageViewTracker', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('posts the pathname only (no query string) with fetch keepalive', () => {
    pathname = '/trips';
    render(<PageViewTracker />);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/analytics/pageview');
    expect(init).toMatchObject({ method: 'POST', keepalive: true, credentials: 'same-origin' });
    expect(JSON.parse(init.body)).toEqual({ path: '/trips' });
  });

  it('re-fires when the pathname changes', () => {
    pathname = '/plan';
    const { rerender } = render(<PageViewTracker />);
    pathname = '/fares';
    rerender(<PageViewTracker />);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('skips /api paths', () => {
    sendPageView('/api/v1/health');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never throws when the request fails', () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    expect(() => sendPageView('/fares')).not.toThrow();
  });
});
