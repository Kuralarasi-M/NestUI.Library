const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";
const API_BASE_URL = `${BACKEND_URL}/api/Auth`;

export interface RegisterRequest {
  userName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

async function sendAuthRequest(
  endpoint: string,
  data: RegisterRequest | LoginRequest,
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const responseText = await response.text()

  let result: unknown = null

  if (responseText) {
    try {
      result = JSON.parse(responseText)
    } catch {
      result = responseText
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`

    if (typeof result === 'string' && result.trim()) {
      errorMessage = result
    } else if (
      result !== null &&
      typeof result === 'object' &&
      'message' in result &&
      typeof result.message === 'string'
    ) {
      errorMessage = result.message
    } else if (
      result !== null &&
      typeof result === 'object' &&
      'title' in result &&
      typeof result.title === 'string'
    ) {
      errorMessage = result.title
    }

    throw new Error(errorMessage)
  }

  return result
}

export function registerUser(data: RegisterRequest) {
  return sendAuthRequest('/register', data)
}

export function loginUser(data: LoginRequest) {
  return sendAuthRequest('/Login', data)
}
