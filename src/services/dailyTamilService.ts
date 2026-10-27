import { getLoggedInUser } from "./authServices";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";

export interface DailyTamilSentence {
  id: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  tamilMeaning: string;
  englishSentence: string;
  tamilSentence: string;
  scenario: string;
  dayNumber: number;
}

export interface CompleteReadingResponse {
  success: boolean;
  isNewToday: boolean;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  pointsEarned: number;
  message: string;
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

export async function getTodayTamilSentences(): Promise<DailyTamilSentence[]> {
  const res = await fetch(`${BACKEND_URL}/api/DailyTamil/Today`);
  if (!res.ok) throw new Error("Failed to load today's sentences");
  return res.json();
}

export async function completeDailyReading(): Promise<CompleteReadingResponse> {
  const res = await fetch(`${BACKEND_URL}/api/DailyTamil/CompleteDailyReading`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to record reading completion");
  return res.json();
}
