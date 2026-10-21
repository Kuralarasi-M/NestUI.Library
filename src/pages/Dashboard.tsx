
import { useEffect, useState, useRef } from "react";
import { Search, Menu, Moon, Sun, Languages, BookOpen } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import {
  getAllBooks,
  getFavoriteIds,
  toggleFavorite,
  getReadingHistory,
  recordSearchQuery,
  type ReadingHistoryItem,
} from "../services/bookService";
import type { Book } from "../services/bookService";
import BookCard from "../components/BookCard";
import { useNavigate, useSearchParams } from "react-router-dom";

interface DashboardProps {
  onOpenMenu: () => void;
}

export default function Dashboard({ onOpenMenu }: DashboardProps) {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [recentReads, setRecentReads] = useState<ReadingHistoryItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(urlSearch);

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

        const [booksData, favIds, historyData] = await Promise.all([
          getAllBooks(),
          getFavoriteIds().catch(() => []),
          getReadingHistory().catch(() => []),
        ]);

        setBooks(booksData);
        setFavoriteIds(new Set(favIds));
        setRecentReads(historyData.slice(0, 3));
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

  async function handleToggleFavorite(bookId: number) {
    // Optimistic UI update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      return next;
    });

    try {
      const res = await toggleFavorite(bookId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (res.isFavorite) {
          next.add(bookId);
        } else {
          next.delete(bookId);
        }
        return next;
      });
    } catch {
      // Revert if error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(bookId)) next.delete(bookId);
        else next.add(bookId);
        return next;
      });
    }
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !search ||
      `${book.title} ${book.author} ${book.genre} ${book.subjects} ${book.summary}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesLang =
      selectedLanguage === "all" ||
      book.language?.toLowerCase() === selectedLanguage.toLowerCase() ||
      (selectedLanguage === "ta" &&
        (book.language?.toLowerCase().includes("ta") ||
          book.genre?.toLowerCase().includes("tamil") ||
          book.title?.toLowerCase().includes("tamil")));
    return matchesSearch && matchesLang;
  });

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/discover?q=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-white">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-950/90 sm:px-7">
        <button
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative max-w-xl flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search books, authors, genres... (Press Enter to search)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-white/10 dark:bg-gray-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-gray-900"
          />
        </form>

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
          className="rounded-xl border border-slate-200 p-2.5 dark:border-white/10"
        >
          {theme === "dark" ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-7">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 p-6 text-white sm:p-9">
          <p className="text-sm text-indigo-100">
            YOUR PERSONAL LIBRARY
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Every book opens a new world.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
            Discover stories, explore genres, and find your next
            favorite book.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm border border-white/20">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Non-copyright public domain books alone are available here to read.</span>
          </div>
        </section>

        {/* Continue Reading Section (If recent history exists) */}
        {recentReads.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
                Continue Reading
              </h2>
              <button
                onClick={() => navigate("/history")}
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View all history &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {recentReads.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/read/${item.book.gutendexId || item.book.id}`)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500/50 hover:shadow-md cursor-pointer transition dark:border-white/10 dark:bg-gray-900"
                >
                  {item.book.coverImage ? (
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="h-16 w-11 rounded-lg object-cover shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-11 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0 text-indigo-600">
                      <BookOpen size={20} />
                    </div>
                  )}
                  <div className="truncate">
                    <h4 className="font-bold text-xs truncate">{item.book.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.book.author}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Resume &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
            <p className="text-sm text-slate-500">
              Books available
            </p>
            <p className="mt-2 text-3xl font-bold">
              {books.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
            <p className="text-sm text-slate-500">Genres</p>
            <p className="mt-2 text-3xl font-bold">
              {
                new Set(
                  books.flatMap((book) =>
                    book.genre
                      .split(",")
                      .map((genre) => genre.trim())
                  )
                ).size
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
            <p className="text-sm text-slate-500">
              Total downloads
            </p>
            <p className="mt-2 text-3xl font-bold">
              {books
                .reduce(
                  (total, book) => total + book.downloadCount,
                  0
                )
                .toLocaleString()}
            </p>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Discover books</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Browse your library and select a book to see its details.
              </p>
            </div>

            {/* Language filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 shrink-0">
                <Languages size={15} /> Language:
              </span>
              {[
                { code: "all", label: "All" },
                { code: "en", label: "English" },
                { code: "ta", label: "தமிழ் (Tamil)" },
                { code: "fr", label: "Français" },
                { code: "de", label: "Deutsch" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedLanguage === lang.code
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-200/70 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <p role="status" className="py-10 text-center">
              Loading books...
            </p>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}

              <button
                onClick={() => window.location.reload()}
                className="ml-3 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredBooks.length === 0 && (
            <p className="py-10 text-center text-slate-500">
              No books match your search.
            </p>
          )}

          {!loading && !error && filteredBooks.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={favoriteIds.has(book.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
