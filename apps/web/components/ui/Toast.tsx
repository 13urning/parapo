'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

/** Toasts rise from the bottom and sit above the tab bar and any pinned action; they dismiss themselves or by swipe. */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      offset={{ bottom: 'calc(var(--nav-h) + var(--toast-lift) + 12px)' }}
      mobileOffset={{ bottom: 'calc(var(--nav-h) + var(--toast-lift) + 12px)', left: 16, right: 16 }}
      richColors
      toastOptions={{ style: { fontFamily: 'inherit', fontWeight: 600, borderRadius: 14 } }}
    />
  );
}

export { toast };
