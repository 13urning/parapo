'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const ITEMS = [
  { href: '/admin/fare-matrices', label: 'Fare matrices' },
  { href: '/admin/analytics', label: 'Analytics' },
];

/** Inside Admin: a two-way switch between the matrices and the analytics. Looks like the Fares vehicle switch. */
export function AdminNav() {
  const pathname = usePathname() ?? '';
  return (
    <nav aria-label="Admin sections" className="mb-7 mt-1 flex max-w-sm gap-1 rounded-[14px] bg-surface p-1">
      {ITEMS.map((i) => {
        const active = pathname === i.href || pathname.startsWith(`${i.href}/`);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'press flex min-h-11 flex-1 items-center justify-center rounded-[11px] px-3 text-[14px] font-bold transition-colors',
              active ? 'bg-white text-ink shadow-[0_1px_3px_rgba(21,24,28,0.14)]' : 'text-ink-soft',
            )}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
