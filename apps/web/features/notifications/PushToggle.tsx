'use client';

import { Spinner } from '@/components/ui';
import { usePushSubscription } from '@/hooks/use-push-subscription';
import { cn } from '@/lib/cn';

/** Push opt-in as a settings row with a real switch. */
export function PushToggle() {
  const { status, busy, error, subscribe, unsubscribe } = usePushSubscription();
  const enabled = status === 'subscribed';
  const blocked = status === 'unsupported' || status === 'denied';

  let note = 'Get an alert on this device whenever fares are updated.';
  if (status === 'unsupported') note = 'This browser does not support push notifications. In-app alerts still work.';
  if (status === 'denied') note = 'Notifications are blocked for this site. Enable notifications in your browser settings, then reload this page.';

  return (
    <section aria-label="Push notifications" className="rounded-[14px] bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p id="push-label" className="text-base font-bold text-ink">
            Push notifications
          </p>
          <p id="push-note" className="mt-0.5 text-[13px] leading-snug text-ink-soft">
            {note}
          </p>
        </div>
        {!blocked && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-labelledby="push-label"
            aria-describedby="push-note"
            disabled={busy || status === 'loading'}
            onClick={enabled ? unsubscribe : subscribe}
            className="press relative grid h-11 w-[60px] shrink-0 place-items-center disabled:opacity-60"
          >
            <span className={cn('h-8 w-[52px] rounded-full transition-colors duration-200', enabled ? 'bg-brand' : 'bg-[#8A9099]')} />
            <span
              className={cn(
                'absolute left-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white shadow transition-transform duration-200 ease-out',
                enabled && 'translate-x-[22px]',
              )}
            >
              {busy && <Spinner label="Working" className="text-ink-soft [&_svg]:h-4 [&_svg]:w-4" />}
            </span>
            <span className="sr-only">{enabled ? 'On' : 'Off'}</span>
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
