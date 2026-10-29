import type { ReactNode } from 'react';
import { Brand } from '@/features/layout/Brand';

/**
 * Phone first: a short green brand block, then a white sheet that carries the form and rises into
 * place. On a laptop the same two parts sit side by side.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-brand lg:flex-row">
      <aside className="relative flex flex-col justify-between overflow-hidden px-6 pb-9 pt-[max(0.75rem,env(safe-area-inset-top))] text-white lg:w-[46%] lg:p-14">
        <Brand href="/login" tone="light" className="-ml-1" />
        <div className="mt-4 lg:mt-0">
          <p className="text-[44px] font-extrabold leading-none tracking-[-0.03em] lg:text-[72px]">Para po!</p>
          <p className="mt-3 max-w-sm text-base font-medium text-[#E3F4EC]">
            Know your fare before you ride.
            <span className="hidden lg:inline">
              {' '}
              Pick two places, see what each ride costs with your discount applied, and log the trip.
            </span>
          </p>
        </div>
        <svg
          className="hidden lg:block"
          width="260"
          height="72"
          viewBox="0 0 260 72"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M14 56C60 56 80 20 130 24S200 52 246 16" stroke="#fff" strokeOpacity="0.9" strokeWidth="4" strokeLinecap="round" />
          <circle cx="14" cy="56" r="7" fill="#08744C" stroke="#fff" strokeWidth="3.5" />
          <rect x="240" y="10" width="12" height="12" rx="3" fill="#fff" />
        </svg>
      </aside>
      <main
        id="main"
        className="animate-rise flex-1 rounded-t-[28px] bg-white px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 lg:flex lg:items-center lg:justify-center lg:rounded-none lg:px-10"
      >
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
