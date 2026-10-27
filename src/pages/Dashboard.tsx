
import { useEffect, useState, useRef } from "react";
import {
  Search,
  Menu,
  Moon,
  Sun,
  BookOpen,
  Bell,
  Flame,
  Star,
  Award,
  Sparkles,
  Zap,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import {
  getAllBooks,
  getReadingHistory,
  recordSearchQuery,
  type ReadingHistoryItem,
} from "../services/bookService";
import type { Book } from "../services/bookService";
import { getUnreadNotificationCount } from "../services/notificationService";
import { fetchLiveTechArticles, type TechArticle } from "../services/techNewsService";
import {
  getUserGamificationStats,
  updateUserGenres,
  type UserGamificationStats,
} from "../services/quizService";
import GenrePickerModal from "../components/GenrePickerModal";
import { useNavigate, useSearchParams } from "react-router-dom";

interface DashboardProps {
  onOpenMenu: () => void;
}

export default function Dashboard({ onOpenMenu }: DashboardProps) {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [recentReads, setRecentReads] = useState<ReadingHistoryItem[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState("");
  const [search, setSearch] = useState(urlSearch);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Gamification & Genre State
  const [gamification, setGamification] = useState<UserGamificationStats | null>(null);
  const [genreModalOpen, setGenreModalOpen] = useState(false);
  const [topTechArticle, setTopTechArticle] = useState<TechArticle | null>(null);

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const searchTimerRef = useRef<any>(null);

  useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  // Debounced recording of search queries to SearchHistory
  function handleSearchChange(text: string) {
    setSearch(text);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    if (text.trim().length >= 3) {
      searchTimerRef.current = setTimeout(() => {
        recordSearchQuery(text.trim());
      }, 1000);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [booksData, historyData, notifCount, gamifData, techData] = await Promise.all([
          getAllBooks(),
          getReadingHistory().catch(() => []),
          getUnreadNotificationCount().catch(() => 0),
          getUserGamificationStats().catch(() => null),
          fetchLiveTechArticles().catch(() => []),
        ]);

        setBooks(booksData);
        setRecentReads(historyData.slice(0, 3));
        setUnreadCount(notifCount);
        if (gamifData) {
          setGamification(gamifData);
        }
        if (techData && techData.length > 0) {
          setTopTechArticle(techData[0]);
        }
      } catch (err: any) {
        if (err?.message?.includes("Session expired") || err?.message?.includes("401")) {
          window.location.href = "/login";
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/discover?q=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b p-4 backdrop-blur sm:px-7"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <button
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="rounded-lg p-2 hover:opacity-80 transition lg:hidden"
          style={{ color: "var(--text-secondary)" }}
        >
          <Menu size={21} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative max-w-xl flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
          />

          <input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search books, authors, genres... (Press Enter to search)"
            className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none transition"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </form>

        <button
          onClick={() => navigate("/notifications")}
          title="Notifications"
          className="relative rounded-xl border p-2.5 hover:opacity-80 transition"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
            color: "var(--text-primary)",
          }}
        >
          <Bell size={19} style={{ color: "var(--text-secondary)" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: "#EF4444" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          title={
            theme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          className="rounded-xl border p-2.5 hover:opacity-80 transition"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
            color: "var(--text-primary)",
          }}
        >
          {theme === "dark" ? (
            <Sun size={19} style={{ color: "var(--accent)" }} />
          ) : (
            <Moon size={19} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-7">
        {/* Streak & Points Ribbon */}
        {gamification && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
                <span className="font-bold text-white">{gamification.currentStreak} Day Streak</span>
                <span className="text-xs text-slate-400">
                  (Best: {gamification.longestStreak} days)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-amber-300">{gamification.totalPoints} Pts</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGenreModalOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {gamification.selectedGenres.length > 0
                  ? `Genres (${gamification.selectedGenres.length})`
                  : "Pick Genres"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/leaderboard")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" /> Leaderboard
              </button>
            </div>
          </div>
        )}

        <section
          className="rounded-3xl p-6 sm:p-9 shadow-sm border transition"
          style={{
            backgroundColor: "var(--btn-primary)",
            color: "var(--btn-text)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold opacity-85">
                MY LIBRARY
              </p>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Every day is a chance to learn something new.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 opacity-90">
                Pick up where you left off, find your next great read, and take on a quick knowledge challenge.
              </p>
            </div>

            {/* Daily 5 Words Knowledge CTA Card */}
            <div className="bg-black/25 backdrop-blur-sm border border-white/10 p-5 rounded-2xl max-w-xs shrink-0 text-left">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" /> Daily Habit
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Test Your Knowledge</h4>
              <p className="text-xs text-white/80 mb-4">
                Learn 5 daily vocabulary words with Tamil meanings and keep your reading streak alive!
              </p>
              <button
                type="button"
                onClick={() => navigate("/daily-tamil")}
                className="w-full py-2 px-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md flex items-center justify-center gap-1.5"
              >
                Start Daily 5 Words ⚡
              </button>
            </div>
          </div>

          <div
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium border"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.15)",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Non-copyright public domain books alone are available here to read.</span>
          </div>
        </section>

        {/* Continue Reading Section (If recent history exists) */}
        {recentReads.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen size={20} style={{ color: "var(--accent)" }} />
                Continue Reading
              </h2>
              <button
                onClick={() => navigate("/history")}
                className="text-xs font-semibold hover:underline"
                style={{ color: "var(--link)" }}
              >
                View all history &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {recentReads.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/read/${item.book.gutendexId || item.book.id}`)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition hover:shadow-md"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  {item.book.coverImage ? (
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="h-16 w-11 rounded-lg object-cover shrink-0 shadow-sm"
                    />
                  ) : (
                    <div
                      className="h-16 w-11 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        color: "var(--accent)",
                      }}
                    >
                      <BookOpen size={20} />
                    </div>
                  )}
                  <div className="truncate">
                    <h4 className="font-bold text-xs truncate">{item.book.title}</h4>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {item.book.author}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--link)" }}>
                      Resume &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* Today's Tech Pulse Card */}
        {topTechArticle && (
          <section
            onClick={() => navigate("/daily-tech")}
            className="p-5 sm:p-6 rounded-3xl border transition-all hover:scale-[1.008] hover:shadow-lg cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-start gap-4 flex-1">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: "#0284C7" }}
              >
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--accent)",
                    }}
                  >
                    Today&apos;s Tech Pulse
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                    • Live from {topTechArticle.source}
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg line-clamp-1">
                  {topTechArticle.title}
                </h3>
                <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {topTechArticle.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <div
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:opacity-90"
                style={{
                  backgroundColor: "var(--btn-primary)",
                  color: "var(--btn-text)",
                }}
              >
                Read & Take Quiz (+100 Pts) <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </section>
        )}

        {/* Quick Hub Navigation Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => navigate("/discover")}
            className="p-6 rounded-3xl border transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer flex flex-col justify-between"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm"
                style={{ backgroundColor: "var(--btn-primary)" }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Public Domain Library</h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Browse our full collection of classic literature, search by title or author, and read non-copyright books.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t flex items-center justify-between text-xs font-bold" style={{ borderColor: "var(--border)", color: "var(--link)" }}>
              <span>Browse Catalog ({books.length} Books)</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div
            onClick={() => navigate("/games")}
            className="p-6 rounded-3xl border transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer flex flex-col justify-between"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm bg-purple-600"
              >
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Games & Puzzles</h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Sentence Builder, Guess the Word, Multi-Stage Word Search, and Tamil vocabulary matching.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400" style={{ borderColor: "var(--border)" }}>
              <span>Play All 4 Activities</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div
            onClick={() => navigate("/my-library")}
            className="p-6 rounded-3xl border transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer flex flex-col justify-between"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm bg-rose-500"
              >
                <Star className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-bold text-lg">My Library</h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Access all your saved favorite books and continue reading from your recent bookmark history.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t flex items-center justify-between text-xs font-bold text-rose-500" style={{ borderColor: "var(--border)" }}>
              <span>View Favorites & History</span>
              <span>&rarr;</span>
            </div>
          </div>
        </section>
      </div>

      <GenrePickerModal
        isOpen={genreModalOpen}
        onClose={() => setGenreModalOpen(false)}
        selectedGenres={gamification?.selectedGenres || []}
        onSave={async (genres) => {
          await updateUserGenres(genres);
          if (gamification) {
            setGamification({ ...gamification, selectedGenres: genres });
          }
        }}
      />
    </main>
  );
}
