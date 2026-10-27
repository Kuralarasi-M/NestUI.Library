const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";
const API_BASE_URL = `${BACKEND_URL}/api/Auth`;

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  isSucess?: boolean;
  success?: boolean;
  message: string;
  token?: string;
  role?: string;
  userId?: string;
}

export interface RegisterResponse {
  success?: boolean;
  message: string;
  role?: string;
  userId?: string;
}

const AUTH_USER_KEY = "library_user";

export function getLoggedInUser(): LoginResponse | null {
  const data = localStorage.getItem(AUTH_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveLoggedInUser(user: LoginResponse) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function logoutUser() {
  // Clear logged in credentials
  localStorage.removeItem(AUTH_USER_KEY);

  // Clear daily game progress, quiz completions, and reading state
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("tamil_daily_") ||
          key.startsWith("word_search_") ||
          key.startsWith("reading_") ||
          key.startsWith("quiz_"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn("Failed to clear game storage on logout", e);
  }
}

async function sendAuthRequest<T>(
  endpoint: string,
  data: RegisterRequest | LoginRequest
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();
  let result: any = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    if (result && typeof result === "object" && result.message) {
      errorMessage = result.message;
    } else if (typeof result === "string" && !result.includes("System.") && !result.includes("<html")) {
      errorMessage = result;
    } else {
      errorMessage = "Invalid credentials or service temporarily unavailable. Please try again.";
    }
    throw new Error(errorMessage);
  }

  return result as T;
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  return sendAuthRequest<RegisterResponse>("/register", data);
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  return sendAuthRequest<LoginResponse>("/Login", data);
}
