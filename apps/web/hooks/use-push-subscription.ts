'use client';

import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { isPushSupported, sameServerKey, unsubscribePush, urlBase64ToUint8Array } from '@/lib/push';

export { urlBase64ToUint8Array };

export type PushStatus = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

/** Registers /sw.js and manages the browser's Web Push subscription for this user. */
export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!isPushSupported()) return setStatus('unsupported');
      if (Notification.permission === 'denied') return setStatus('denied');
      try {
        const reg = await navigator.serviceWorker.getRegistration('/');
        const sub = await reg?.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? 'subscribed' : 'unsubscribed');
      } catch {
        if (!cancelled) setStatus('unsubscribed');
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = useCallback(async () => {
    setError(null);
    if (!isPushSupported()) return setStatus('unsupported');
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'unsubscribed');
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      const { publicKey } = await notificationsApi.publicKey();
      const serverKey = urlBase64ToUint8Array(publicKey);

      let sub = await reg.pushManager.getSubscription();
      // A subscription made under a different VAPID key can never receive our pushes: replace it.
      if (sub && !sameServerKey(sub.options.applicationServerKey, serverKey)) {
        await sub.unsubscribe().catch(() => undefined);
        sub = null;
      }
      sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: serverKey });

      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error('Incomplete push subscription.');
      await notificationsApi.subscribe({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      setStatus('subscribed');
    } catch (err) {
      setError(errorMessage(err, 'Could not enable push notifications.'));
      setStatus('unsubscribed');
    } finally {
      setBusy(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await unsubscribePush();
      setStatus('unsubscribed');
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, subscribe, unsubscribe };
}
