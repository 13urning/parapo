import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Classes shared by every item in the main navigation. The same markup is a bottom tab on a phone
 * and a rail item on a laptop; only the axis changes.
 */
export const navItemClass = (active: boolean) =>
  cn(
    'press relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold leading-none transition-colors',
    'lg:min-h-[4.5rem] lg:flex-none lg:rounded-2xl',
    active ? 'text-brand' : 'text-ink-soft hover:text-ink',
  );

export function NavItemInner({ icon, label, active }: { icon: ReactNode; label: string; active: boolean }) {
  return (
    <>
      <span
        className={cn(
          'relative grid h-7 w-12 place-items-center rounded-full transition-colors duration-200',
          active ? 'bg-brand-50' : 'bg-transparent',
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </>
  );
}
