import type { ReactNode } from 'react';

/** A template remounts on every navigation, so each screen eases in: 12px slide plus fade, ~220ms. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
