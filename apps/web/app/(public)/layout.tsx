import type { ReactNode } from 'react';
import { Brand } from '@/features/layout/Brand';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative flex flex-col justify-between bg-jeep-blue p-6 text-white lg:w-[42%] lg:p-12">
        <div className="livery-stripe absolute inset-y-0 right-0 hidden w-3 lg:block" aria-hidden="true" />
        <Brand href="/login" />
        <div className="my-8 hidden lg:block">
          <p className="font-display text-4xl font-extrabold leading-tight">
            Know your fare
            <br />
            before you say <span className="text-jeep-yellow">&quot;Para po!&quot;</span>
          </p>
          <p className="mt-4 max-w-sm text-blue-100">
            Plan a jeepney or UV Express trip, see the official fare with your discount applied, and keep a log of
            every ride.
          </p>
        </div>
        <p className="hidden text-xs text-blue-200 lg:block">Fares follow published LTFRB-style matrices.</p>
      </aside>
      <main id="main" className="flex flex-1 items-center justify-center p-4 py-8 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
