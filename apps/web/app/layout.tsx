import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Manrope } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { Providers } from '@/providers';
import { PageViewTracker } from '@/features/analytics/PageViewTracker';

// One workhorse sans, self-hosted by next/font at build time (no third-party request from the browser).
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: { default: 'ParaPo! Jeepney fare calculator', template: '%s | ParaPo!' },
  description: 'Plan your jeepney trip, know your fare, and keep a log of your commute.',
  icons: { icon: '/icon.svg' },
};

// viewport-fit=cover lets the tab bar own the home-indicator inset. Zoom stays enabled.
export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Middleware issues a per-request CSP nonce. Reading request headers opts the tree into dynamic
  // rendering, which is required for Next to stamp that nonce onto its framework scripts.
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" className={manrope.variable} data-nonce={nonce ? 'set' : undefined}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-ink focus:shadow-pop"
        >
          Skip to content
        </a>
        <Providers>
          <PageViewTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
