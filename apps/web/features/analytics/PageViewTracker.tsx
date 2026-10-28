'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Records a page view (pathname only, never the query string) via fetch keepalive. */
export function sendPageView(path: string) {
  if (path.startsWith('/api') || path.length > 200) return;
  try {
    void fetch('/api/v1/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
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
