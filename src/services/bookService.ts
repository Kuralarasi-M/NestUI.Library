import { getLoggedInUser } from "./authServices";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";
const API_BASE_URL = `${BACKEND_URL}/api/Books`;

export interface Book {
  id: number;
  gutendexId: number;
  title: string;
  author: string;
  coverImage: string;
  language: string;
  genre: string;
  summary: string;
  subjects: string;
  downloadCount: number;
}
export interface BookDetails {
  id: number;
  title: string;
  authors: BookAuthor[];
  summaries: string[];
  subjects: string[];
  languages: string[];
  formats: Record<string, string>;
  download_Count: number;

  bookText: string;
}
export interface BookAuthor {
  name: string;
  birth_Year: number;
  death_Year: number;
}

function getAuthHeaders(): HeadersInit {
  const user = getLoggedInUser();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user?.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
  }
  return headers;
}

export async function getAllBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/AllBooks`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    throw new Error("Unable to load books.");
  }

  return response.json();
}

export async function searchBooks(query: string, language?: string): Promise<Book[]> {
  const params = new URLSearchParams();
  if (query?.trim()) params.append("query", query.trim());
  if (language && language !== "all") params.append("language", language);

  const url = `${API_BASE_URL}/Search?${params.toString()}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    throw new Error("Unable to perform search.");
  }

  return response.json();
}

export async function getBookDetails(
  gutendexId: number
): Promise<BookDetails> {
  const response = await fetch(`${API_BASE_URL}/${gutendexId}`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    throw new Error("Unable to load book details.");
  }

  return response.json();
}

export async function getBookContent(
  gutendexId: number
): Promise<{ bookId: number; bookText: string }> {
  const response = await fetch(`${API_BASE_URL}/${gutendexId}/content`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    throw new Error("Unable to load book reading content.");
  }

  return response.json();
}

export async function getFavoriteIds(): Promise<number[]> {
  const response = await fetch(`${BACKEND_URL}/api/Favorites/ids`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getFavorites(): Promise<Book[]> {
  const response = await fetch(`${BACKEND_URL}/api/Favorites`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    throw new Error("Unable to load favorites.");
  }

  return response.json();
}

export async function toggleFavorite(bookId: number): Promise<{ isFavorite: boolean }> {
  const response = await fetch(`${BACKEND_URL}/api/Favorites/${bookId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    throw new Error("Unable to update favorite.");
  }

  return response.json();
}

export interface ReadingHistoryItem {
  id: number;
  lastReadAt: string;
  book: Book;
}

export async function getReadingHistory(): Promise<ReadingHistoryItem[]> {
  const response = await fetch(`${BACKEND_URL}/api/ReadingHistory`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function recordReading(bookId: number): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/ReadingHistory/${bookId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch {
    // Non-blocking best-effort logging
  }
}

export async function recordDownload(bookId: number): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/DownloadHistory/${bookId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch {
    // Non-blocking best-effort logging
  }
}

export function downloadBookAsText(title: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  searchAt: string;
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  const response = await fetch(`${BACKEND_URL}/api/SearchHistory`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function recordSearchQuery(query: string): Promise<void> {
  if (!query?.trim()) return;
  try {
    await fetch(`${BACKEND_URL}/api/SearchHistory`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query: query.trim() }),
    });
  } catch {
    // Non-blocking best-effort logging
  }
}

export async function clearSearchHistory(): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/SearchHistory`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }
}



