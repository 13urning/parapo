import { render } from '@testing-library/react';
import { PageViewTracker, sendPageView } from './PageViewTracker';

let pathname = '/plan';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

describe('PageViewTracker', () => {
  const beacon = vi.fn().mockReturnValue(true);
  beforeEach(() => {
    beacon.mockClear();
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true, writable: true });
  });

  it('posts the pathname only (no query string) via sendBeacon', async () => {
    pathname = '/trips';
    render(<PageViewTracker />);
    expect(beacon).toHaveBeenCalledOnce();
    const [url, blob] = beacon.mock.calls[0] as [string, Blob];
    expect(url).toBe('/api/v1/analytics/pageview');
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    expect(JSON.parse(text)).toEqual({ path: '/trips' });
  });

  it('re-fires when the pathname changes', () => {
    pathname = '/plan';
    const { rerender } = render(<PageViewTracker />);
    pathname = '/fares';
    rerender(<PageViewTracker />);
    expect(beacon).toHaveBeenCalledTimes(2);
  });

  it('skips /api paths', () => {
    sendPageView('/api/v1/health');
    expect(beacon).not.toHaveBeenCalled();
  });

  it('falls back to fetch keepalive when sendBeacon is unavailable', () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true, writable: true });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    sendPageView('/fares');
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/analytics/pageview', expect.objectContaining({ method: 'POST', keepalive: true }));
    vi.unstubAllGlobals();
  });
});
