import { userService } from "@/services/userService";

/** VAPID public key only — must match server `VAPID_PUBLIC_KEY`. */
function getVapidPublicKey(): string | null {
  const k = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  return k?.trim() || null;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (e) {
    console.error("Service worker registration failed:", e);
    return null;
  }
}

/**
 * Subscribe this browser to web push and register the subscription with the API.
 */
export async function subscribeWebPush(): Promise<boolean> {
  const vapid = getVapidPublicKey();
  if (!vapid) {
    console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
    return false;
  }

  const reg = await registerServiceWorker();
  if (!reg) return false;

  await navigator.serviceWorker.ready;

  /**
   * If the user (or a prior deploy) subscribed with a different VAPID public key, the browser
   * would still return that old PushSubscription from getSubscription(). The server then signs
   * pushes with the *current* key pair → FCM returns errors like “VAPID credentials must match”.
   * Always drop the old subscription and create a fresh one for the key in env.
   */
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    try {
      await existing.unsubscribe();
    } catch (e) {
      console.warn("pushManager.unsubscribe failed:", e);
    }
  }

  let sub: PushSubscription;
  try {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
    });
  } catch (e) {
    console.error("pushManager.subscribe failed:", e);
    return false;
  }

  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return false;
  }

  try {
    await userService.setWebPushToken({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    });
    return true;
  } catch (e) {
    console.error("setWebPushToken failed:", e);
    return false;
  }
}
