import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Standard screen column: phone gutters first, a readable measure on laptop. */
export function Page({ children, wide, className }: { children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <div className={cn('mx-auto w-full px-5 pb-12 pt-1 lg:px-10 lg:pt-10', wide ? 'max-w-[880px]' : 'max-w-[680px]', className)}>
      {children}
    </div>
  );
}
