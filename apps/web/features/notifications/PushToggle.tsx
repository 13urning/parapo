'use client';

import { Badge, Button, Card } from '@/components/ui';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export function PushToggle() {
  const { status, busy, error, subscribe, unsubscribe } = usePushSubscription();
  const enabled = status === 'subscribed';

  let note = 'Get an alert on this device whenever fares are updated.';
  if (status === 'unsupported') note = 'This browser does not support push notifications. In-app alerts still work.';
  if (status === 'denied') note = 'Notifications are blocked for this site. Enable notifications in your browser settings, then reload this page.';

  return (
    <Card accent="blue" title="Push notifications" actions={enabled ? <Badge tone="green">On</Badge> : <Badge>Off</Badge>}>
      <p className="text-sm text-ink-soft">{note}</p>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-jeep-red-dark">
          {error}
        </p>
      )}
      {status !== 'unsupported' && status !== 'denied' && (
        <Button
          className="mt-4"
          variant={enabled ? 'ghost' : 'primary'}
          loading={busy}
          disabled={status === 'loading'}
          onClick={enabled ? unsubscribe : subscribe}
          aria-pressed={enabled}
        >
          {enabled ? 'Disable push notifications' : 'Enable push notifications'}
        </Button>
      )}
    </Card>
  );
}
