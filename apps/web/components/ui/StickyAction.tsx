'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Primary action pinned just above the tab bar (phone) or to the bottom of its column (laptop).
 * Publishes its height as --toast-lift so toasts rise clear of it; laptop CSS zeroes the lift.
 */
export function StickyAction({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty('--sticky-action-h', `${Math.ceil(entry.contentRect.height + 28)}px`);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--sticky-action-h');
    };
  }, []);

  return (
    <div
      ref={ref}
      data-sticky-action
      className={cn(
        'sticky bottom-[var(--nav-h)] z-10 mt-auto bg-gradient-to-t from-white from-75% to-white/0 px-4 pb-3 pt-4 lg:bottom-0 lg:px-6 lg:pb-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
