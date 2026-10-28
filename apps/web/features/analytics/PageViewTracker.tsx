'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Records a page view (pathname only, never the query string) on every route change. */
export function sendPageView(path: string) {
  if (path.startsWith('/api') || path.length > 200) return;
  const payload = JSON.stringify({ path });
  const url = '/api/v1/analytics/pageview';
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      if (ok) return;
    }
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => undefined);
  } catch {
    /* analytics must never break the app */
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) sendPageView(pathname);
  }, [pathname]);
  return null;
}
