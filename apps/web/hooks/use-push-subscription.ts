'use client';

import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';

export type PushStatus = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

const isSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/** Registers /sw.js and manages the browser's Web Push subscription for this user. */
export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!isSupported()) return setStatus('unsupported');
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
    if (!isSupported()) return setStatus('unsupported');
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
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
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
      const reg = await navigator.serviceWorker.getRegistration('/');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await notificationsApi.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus('unsubscribed');
    } catch (err) {
      setError(errorMessage(err, 'Could not disable push notifications.'));
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, subscribe, unsubscribe };
}
