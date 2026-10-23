import { getLoggedInUser } from "./authServices";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";
const API_BASE_URL = `${BACKEND_URL}/api/Notifications`;

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  targetAudience: "all" | "admins";
}

export interface BroadcastResponse {
  success: boolean;
  message: string;
  recipientsCount: number;
}

function getAuthHeaders(): HeadersInit {
  const user = getLoggedInUser();
  const token = user?.token || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMyNotifications(): Promise<AppNotification[]> {
  const response = await fetch(`${API_BASE_URL}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("401: Unauthorized");
    throw new Error("Failed to load notifications.");
  }
  return response.json();
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/unread-count`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.unreadCount || 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/${id}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await fetch(`${API_BASE_URL}/read-all`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
}

export async function sendBroadcastNotification(
  payload: BroadcastPayload
): Promise<BroadcastResponse> {
  const response = await fetch(`${API_BASE_URL}/broadcast`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to broadcast notification (${response.status})`);
  }
  return data;
}
