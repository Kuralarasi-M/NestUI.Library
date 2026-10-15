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
  userId?: number;
}

export interface RegisterResponse {
  success?: boolean;
  message: string;
  role?: string;
  userId?: number;
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
  localStorage.removeItem(AUTH_USER_KEY);
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
    } else if (typeof result === "string") {
      errorMessage = result;
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
