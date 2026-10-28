import { notificationsApi } from '@/lib/api/endpoints';

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** True when a subscription was created with exactly this VAPID public key. */
export function sameServerKey(existing: ArrayBuffer | null | undefined, key: Uint8Array): boolean {
  if (!existing) return false;
  const a = new Uint8Array(existing);
  return a.length === key.length && a.every((b, i) => b === key[i]);
}

/**
 * Removes this browser's push subscription: browser first (so no more pushes can arrive),
 * then the server record. Failures are tolerated; this must never block sign-out.
 */
export async function unsubscribePush(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    const endpoint = sub.endpoint;
    await sub.unsubscribe().catch(() => undefined);
    await notificationsApi.unsubscribe(endpoint).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
