import { getLoggedInUser } from "./authServices";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7062";

export interface QuizQuestion {
  id: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface QuizSubmitRequest {
  bookId?: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
  correctAnswers: number;
  isDailyRead?: boolean;
}

export interface QuizSubmitResponse {
  pointsEarned: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  longestStreakStartDate?: string;
  longestStreakEndDate?: string;
  newBadgesUnlocked: string[];
}

export interface BadgeItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  earnedAt?: string;
}

export interface UserGamificationStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  currentStreakStartDate?: string;
  longestStreakStartDate?: string;
  longestStreakEndDate?: string;
  completedDailyReadToday: boolean;
  selectedGenres: string[];
  badges: BadgeItem[];
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badgeCount: number;
}

export interface BookReview {
  id: string;
  userId: string;
  userName: string;
  bookId: number;
  rating: number;
  comment: string;
  createdAt: string;
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

// Fetch quiz questions
export async function getQuizQuestions(
  genre = "Books",
  difficulty = "medium",
  amount = 5
): Promise<QuizQuestion[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/Quiz/Questions?genre=${encodeURIComponent(genre)}&difficulty=${encodeURIComponent(difficulty)}&amount=${amount}`
  );
  if (!res.ok) throw new Error("Failed to load questions");
  return res.json();
}

// Submit quiz answers
export async function submitQuiz(req: QuizSubmitRequest): Promise<QuizSubmitResponse> {
  const res = await fetch(`${BACKEND_URL}/api/Quiz/Submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("Failed to submit quiz");
  return res.json();
}

// Get user gamification stats (streaks, points, badges)
export async function getUserGamificationStats(): Promise<UserGamificationStats> {
  const res = await fetch(`${BACKEND_URL}/api/Quiz/Stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

// Get leaderboard
export async function getLeaderboard(top = 50): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BACKEND_URL}/api/Quiz/Leaderboard?top=${top}`);
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return res.json();
}

// User Genre preferences
export async function getUserGenres(): Promise<string[]> {
  const res = await fetch(`${BACKEND_URL}/api/Quiz/Genres`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load genres");
  return res.json();
}

export async function updateUserGenres(genres: string[]): Promise<boolean> {
  const res = await fetch(`${BACKEND_URL}/api/Quiz/Genres`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ genres }),
  });
  return res.ok;
}

// Reviews
export async function getBookReviews(bookId: number): Promise<BookReview[]> {
  const res = await fetch(`${BACKEND_URL}/api/Reviews/book/${bookId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function submitBookReview(
  bookId: number,
  rating: number,
  comment: string
): Promise<BookReview> {
  const res = await fetch(`${BACKEND_URL}/api/Reviews`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, rating, comment }),
  });
  if (!res.ok) throw new Error("Failed to save review");
  return res.json();
}
