import { getLoggedInUser } from "./authServices";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";

export interface SentenceBuilderGame {
  id: number;
  theme: string;
  targetSentence: string;
  scrambledWords: string[];
  hint: string;
  points: number;
}

export interface GuessTheWordGame {
  id: number;
  word: string;
  definition: string;
  partOfSpeech: string;
  clues: string[];
  maxHints: number;
  basePoints: number;
}

export interface WordSearchGame {
  id: number;
  theme: string;
  stage: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Master";
  gridSize: number;
  grid: string[][];
  wordsToFind: string[];
  points: number;
}

export interface SubmitGameScoreResponse {
  pointsEarned: number;
  totalPoints: number;
  wordSearchStage: number;
  message: string;
}

export interface UserWordGameProgress {
  wordSearchStage: number;
  totalPoints: number;
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

export async function getSentenceBuilderGames(): Promise<SentenceBuilderGame[]> {
  const res = await fetch(`${BACKEND_URL}/api/WordGames/SentenceBuilder`);
  if (!res.ok) throw new Error("Failed to load Sentence Builder games");
  return res.json();
}

export async function getGuessTheWordGames(): Promise<GuessTheWordGame[]> {
  const res = await fetch(`${BACKEND_URL}/api/WordGames/GuessTheWord`);
  if (!res.ok) throw new Error("Failed to load Guess The Word games");
  return res.json();
}

export async function getWordSearchGame(theme = "literature", stage?: number): Promise<WordSearchGame> {
  const url = stage
    ? `${BACKEND_URL}/api/WordGames/WordSearch?theme=${encodeURIComponent(theme)}&stage=${stage}`
    : `${BACKEND_URL}/api/WordGames/WordSearch?theme=${encodeURIComponent(theme)}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load Word Search game");
  return res.json();
}

export async function getUserWordGameProgress(): Promise<UserWordGameProgress> {
  const res = await fetch(`${BACKEND_URL}/api/WordGames/UserProgress`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return { wordSearchStage: 1, totalPoints: 0 };
  return res.json();
}

export async function submitGameScore(
  gameType: "sentence-builder" | "guess-word" | "word-search",
  pointsEarned: number,
  details: string,
  completedStage?: number
): Promise<SubmitGameScoreResponse> {
  const res = await fetch(`${BACKEND_URL}/api/WordGames/SubmitScore`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ gameType, pointsEarned, details, completedStage }),
  });
  if (!res.ok) throw new Error("Failed to submit score");
  return res.json();
}
