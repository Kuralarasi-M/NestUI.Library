import { getLoggedInUser } from "./authServices";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";
const AUTH_URL = `${BACKEND_URL}/api/Auth`;
const FCM_TOKEN_STORAGE_KEY = "fcm_device_token";

/**
 * Returns the device FCM token from storage, or creates a mock token if Firebase Web SDK is not configured.
 */
export function getStoredFcmToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
}

/**
 * Save FCM token to backend for the logged-in user.
 * Called automatically during login and registration.
 */
export async function syncFcmToken(userId: string, token?: string): Promise<boolean> {
  const fcmToken = token || getStoredFcmToken() || `web_device_${userId.slice(0, 8)}_${Date.now()}`;
  localStorage.setItem(FCM_TOKEN_STORAGE_KEY, fcmToken);

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
