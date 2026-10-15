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

export async function getAllBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/AllBooks`);

  if (!response.ok) {
    throw new Error("Unable to load books.");
  }

  return response.json();
}

export async function getBookDetails(
  gutendexId: number
): Promise<BookDetails> {
  const response = await fetch(`${API_BASE_URL}/${gutendexId}`);

  if (!response.ok) {
    throw new Error("Unable to load book details.");
  }

  return response.json();
}
