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

/**
 * Calls backend API GET /api/Books/Language/{languageCode}
 * Seamlessly retrieves books in specific languages (Tamil 'ta', English 'en', French 'fr', German 'de', Spanish 'es')
 * with server-side caching and fallback.
 */
export async function getBooksByLanguage(
  languageCode: string,
  query?: string,
  topic?: string
): Promise<Book[]> {
  const params = new URLSearchParams();
  if (query?.trim()) params.append("query", query.trim());
  if (topic?.trim() && topic !== "All") params.append("topic", topic.trim());

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const url = `${API_BASE_URL}/Language/${encodeURIComponent(languageCode)}${queryString}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("401: Session expired or invalid token. Please log in.");
  }

  if (!response.ok) {
    throw new Error(`Unable to load books for language ${languageCode}.`);
  }

  return response.json();
}

export interface GutendexSearchParams {
  search?: string;
  topic?: string;
  languages?: string;
  ids?: string;
}

// Map raw Gutendex book object to application Book interface
function mapGutendexToBook(item: any): Book {
  const authorName =
    item.authors && item.authors.length > 0
      ? item.authors.map((a: any) => a.name).join(", ")
      : "Unknown Author";

  const coverImage =
    item.formats?.["image/jpeg"] ||
    `https://www.gutenberg.org/cache/epub/${item.id}/pg${item.id}.cover.medium.jpg`;

  const language =
    item.languages && item.languages.length > 0
      ? item.languages[0]
      : "en";

  const subjects =
    Array.isArray(item.subjects)
      ? item.subjects.join("; ")
      : "";

  const genre =
    Array.isArray(item.bookshelves) && item.bookshelves.length > 0
      ? item.bookshelves.join(", ")
      : Array.isArray(item.subjects) && item.subjects.length > 0
      ? item.subjects[0]
      : "General";

  const summary =
    Array.isArray(item.summaries) && item.summaries.length > 0
      ? item.summaries[0]
      : `Classic work by ${authorName}.`;

  return {
    id: item.id,
    gutendexId: item.id,
    title: item.title || "Untitled",
    author: authorName,
    coverImage,
    language,
    genre,
    summary,
    subjects,
    downloadCount: item.download_count || 0,
  };
}

/**
 * Direct search against Gutendex API:
 * - Search by title or author: ?search=harry+potter or ?search=Jane+Austen
 * - Filter by topic: ?topic=fiction
 * - Filter by language: ?languages=en
 * - Filter by Gutenberg book IDs: ?ids=1342,11,84
 */
export async function searchGutendexBooks(params: GutendexSearchParams): Promise<Book[]> {
  const queryParams = new URLSearchParams();

  if (params.search?.trim()) {
    queryParams.append("search", params.search.trim());
  }
  if (params.topic?.trim() && params.topic !== "All") {
    queryParams.append("topic", params.topic.trim());
  }
  if (params.languages?.trim() && params.languages !== "all") {
    queryParams.append("languages", params.languages.trim());
  }
  if (params.ids?.trim()) {
    queryParams.append("ids", params.ids.trim());
  }

  const url = `https://gutendex.com/books/?${queryParams.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gutendex request failed with status: ${response.status}`);
  }

  const data = await response.json();
  const rawResults: any[] = data.results || [];
  return rawResults.map(mapGutendexToBook);
}

export async function searchBooks(
  query: string,
  language?: string,
  topic?: string,
  ids?: string
): Promise<Book[]> {
  // 1. First attempt live search via Gutendex API for comprehensive 70,000+ catalog results
  try {
    const gutendexResults = await searchGutendexBooks({
      search: query,
      languages: language,
      topic,
      ids,
    });
    if (gutendexResults && gutendexResults.length > 0) {
      return gutendexResults;
    }
  } catch (err) {
    console.warn("Gutendex direct search error, falling back to local database:", err);
  }

  // 2. Fallback to local database search endpoint GET /api/Books/Search
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



