import { useEffect, useState, useMemo } from "react";
import { Search, BookOpen, Languages, Sparkles, Filter, X, Sun, Moon, Menu } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getBooksByLanguage,
  getFavoriteIds,
  toggleFavorite,
  recordSearchQuery,
  type Book,
} from "../services/bookService";
import BookCard from "../components/BookCard";
import { useTheme } from "../hooks/useTheme";

interface LanguageBooksPageProps {
  onOpenMenu?: () => void;
}

interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  tagline: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: "ta",
    label: "Tamil",
    nativeLabel: "தமிழ்",
    flag: "🇮🇳",
    tagline: "செம்மொழி தமிழ் இலக்கியங்கள், திருக்குறள் & வரலாற்றுப் படைப்புகள்",
  },
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
    tagline: "World classics, historical fiction, adventures and philosophy",
  },
  {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    flag: "🇫🇷",
    tagline: "Chef-d'œuvres de la littérature française, Victor Hugo, Jules Verne",
  },
  {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    flag: "🇩🇪",
    tagline: "Klassiker der deutschen Literatur, Goethe, Kafka, Hesse",
  },
  {
    code: "es",
    label: "Spanish",
    nativeLabel: "Español",
    flag: "🇪🇸",
    tagline: "Obras clásicas de la literatura en español, Cervantes",
  },
  {
    code: "all",
    label: "All Languages",
    nativeLabel: "அனைத்து மொழிகளும்",
    flag: "🌐",
    tagline: "Multilingual library collection across all published tongues",
  },
];

export default function LanguageBooksPage({ onOpenMenu }: LanguageBooksPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ta"; // Default to Tamil
  const initialSearch = searchParams.get("q") || "";

  const [selectedLang, setSelectedLang] = useState<string>(initialLang);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"popular" | "title" | "author">("popular");

  const [books, setBooks] = useState<Book[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const currentLanguageInfo =
    LANGUAGE_OPTIONS.find((l) => l.code === selectedLang) || LANGUAGE_OPTIONS[0];

  // Fetch books from backend API GET /api/Books/Language/{selectedLang}
  useEffect(() => {
    let cancelled = false;

    async function loadLanguageBooks() {
      try {
        setLoading(true);
        setError("");

        const [booksData, favIds] = await Promise.all([
          getBooksByLanguage(
            selectedLang,
            searchQuery.trim() || undefined,
            selectedTopic !== "All" ? selectedTopic : undefined
          ),
          getFavoriteIds().catch(() => []),
        ]);

        if (!cancelled) {
          setBooks(booksData);
          setFavoriteIds(new Set(favIds));
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err?.message?.includes("Session expired") || err?.message?.includes("401")) {
            navigate("/login");
            return;
          }
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load language collection."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLanguageBooks();

    return () => {
      cancelled = true;
    };
  }, [selectedLang, searchQuery, selectedTopic, navigate]);

  // Handle switching language tabs
  function handleSelectLanguage(code: string) {
    setSelectedLang(code);
    setSearchQuery("");
    setSelectedTopic("All");
    setSearchParams({ lang: code });
  }

  // Handle in-page search
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      recordSearchQuery(searchQuery.trim());
    }
  }

  async function handleToggleFavorite(bookId: number) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });

    try {
      const res = await toggleFavorite(bookId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (res.isFavorite) next.add(bookId);
        else next.delete(bookId);
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

  // Client-side sorting
  const sortedBooks = useMemo(() => {
    const list = [...books];
    return list.sort((a, b) => {
      if (sortBy === "popular") {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "author") {
        return a.author.localeCompare(b.author);
      }
      return 0;
    });
  }, [books, sortBy]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-950/90 sm:px-8">
        <div className="flex items-center gap-3">
          {onOpenMenu && (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition hover:opacity-80 shrink-0 shadow-xs"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
            <Languages size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              Language Shelf
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold font-mono">
                {currentLanguageInfo.nativeLabel}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Read books organized by language
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl border border-slate-200 p-2.5 dark:border-white/10"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-6">
        {/* Prominent Language Switcher Bar across the Top */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-white/5">
            <Languages size={16} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Language / மொழியைத் தேர்ந்தெடுக்கவும்
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-bold">{lang.nativeLabel}</div>
                    <div className={`text-[10px] ${isSelected ? "text-amber-100" : "text-slate-400"}`}>
                      {lang.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dedicated Banner for Tamil Books (Cultural Heritage Theme) */}
        {selectedLang === "ta" ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 p-6 sm:p-8 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={14} className="text-amber-200" />
                தமிழ் செம்மொழி நூல் தொகுப்பு • Classical Tamil Books
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif pt-1">
                தமிழ் இலக்கியப் பொக்கிஷங்கள்
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                Project Gutenberg-ல் உள்ள தமிழ் இலக்கியங்கள், திருக்குறள், நன்னூல், மற்றும் செம்மொழிப் படைப்புகள். அனைத்தும் இலவச பொது உரிமத்தில் வாசிக்கக் கிடைக்கின்றன.
              </p>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 text-9xl font-serif font-black opacity-10 select-none">
              தமிழ்
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {currentLanguageInfo.flag} {currentLanguageInfo.label} Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentLanguageInfo.nativeLabel} Books
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {currentLanguageInfo.tagline}
              </p>
            </div>
          </div>
        )}

        {/* Filter and In-Language Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-gray-900">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search within ${currentLanguageInfo.label} books...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs outline-none focus:border-amber-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Topic Filter */}
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium outline-none focus:border-amber-500 dark:border-white/10 dark:bg-gray-800"
              >
                <option value="All">All Topics</option>
                <option value="fiction">Fiction</option>
                <option value="philosophy">Philosophy</option>
                <option value="poetry">Poetry</option>
                <option value="history">History</option>
                <option value="drama">Drama</option>
              </select>
            </div>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium outline-none focus:border-amber-500 dark:border-white/10 dark:bg-gray-800"
            >
              <option value="popular">Most Popular</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Book Grid */}
        {loading && (
          <div className="flex h-64 flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Loading {currentLanguageInfo.nativeLabel} books from library server...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-5 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && sortedBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
            <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold">
              No books found for {currentLanguageInfo.label}
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Try switching topics, clearing the search query, or selecting another language.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTopic("All");
              }}
              className="mt-5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-700 transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {!loading && !error && sortedBooks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {sortedBooks.length} {currentLanguageInfo.label} books available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={favoriteIds.has(book.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
