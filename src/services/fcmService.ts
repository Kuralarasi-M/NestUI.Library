import { getLoggedInUser } from "./authServices";
import { getFirebaseMessaging, getToken } from "../firebaseConfig";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";
const AUTH_URL = `${BACKEND_URL}/api/Auth`;
const FCM_TOKEN_STORAGE_KEY = "fcm_device_token";

/**
 * Returns the device FCM token from storage.
 */
export function getStoredFcmToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
}

/**
 * Requests browser notification permission and retrieves a real FCM registration token via Firebase Web SDK.
 */
export async function requestAndRegisterFcmToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log("[FCM] Push notifications are not supported by this browser.");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("[FCM] Notification permission was not granted:", permission);
    return null;
  }

  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    // Register service worker if needed
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }

    const token = await getToken(messaging, {
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      return token;
    }
  } catch (err) {
    console.warn("[FCM] Could not get FCM registration token from Firebase SDK:", err);
  }

  return getStoredFcmToken();
}

/**
 * Requests browser notification permission and syncs FCM token to backend only if granted.
 * Called during login, registration, or when user enables notifications.
 */
export async function syncFcmToken(userId: string, token?: string): Promise<boolean> {
  let fcmToken = token;
  if (!fcmToken) {
    fcmToken = (await requestAndRegisterFcmToken()) || undefined;
  }

  if (!fcmToken) {
    console.log("[FCM] No valid registration token available to sync.");
    return false;
  }

  const user = getLoggedInUser();
  const authToken = user?.token || "";

  try {
    const response = await fetch(`${AUTH_URL}/FCMToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        userId,
        fcmToken,
      }),
    });

    return response.ok;
  } catch (err) {
    console.warn("[FCM] Failed to sync FCM token to backend:", err);
    return false;
  }
}

/**
 * Deactivates/removes the FCM token from the backend when the user logs out.
 */
export async function removeFcmToken(userId: string): Promise<boolean> {
  const fcmToken = getStoredFcmToken();
  const user = getLoggedInUser();
  const authToken = user?.token || "";

  try {
    const response = await fetch(`${AUTH_URL}/RemoveFCMToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        userId,
        fcmToken: fcmToken || null,
      }),
    });

    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    return response.ok;
  } catch (err) {
    console.warn("[FCM] Failed to remove FCM token on logout:", err);
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    return false;
  }
}
