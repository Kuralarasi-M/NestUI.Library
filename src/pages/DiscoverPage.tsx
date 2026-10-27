import { useEffect, useState, useMemo } from "react";
import { Search, Compass, X, Moon, Sun, Filter, BookOpen } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllBooks, searchBooks, getFavoriteIds, toggleFavorite, recordSearchQuery } from "../services/bookService";
import type { Book } from "../services/bookService";
import BookCard from "../components/BookCard";
import { useTheme } from "../hooks/useTheme";

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("search") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [bookIds, setBookIds] = useState<string>("");
  const [sortBy, setSortBy] = useState<"popular" | "title" | "author">("popular");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Load books with live Gutendex API integration & local DB fallback
  useEffect(() => {
    let cancelled = false;

    async function fetchSearchResults() {
      try {
        setLoading(true);
        setError("");

        const [booksData, favIds] = await Promise.all([
          query.trim() || selectedLanguage !== "all" || selectedGenre !== "All" || bookIds.trim()
            ? searchBooks(
                query,
                selectedLanguage,
                selectedGenre !== "All" ? selectedGenre : undefined,
                bookIds.trim() || undefined
              )
            : getAllBooks(),
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
          setError(err instanceof Error ? err.message : "Unable to load search results.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSearchResults();

    return () => {
      cancelled = true;
    };
  }, [query, selectedLanguage, selectedGenre, bookIds, navigate]);

  // Sync URL search param changes into state
  useEffect(() => {
    const urlQ = searchParams.get("q") || searchParams.get("search") || "";
    setQuery(urlQ);
  }, [searchParams]);

  // Extract all distinct genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.genre) {
        b.genre.split(",").forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [books]);

  // Execute search submission and record history
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    if (query.trim().length >= 2) {
      recordSearchQuery(query.trim());
    }
  }

  // Clear search input
  function handleClearSearch() {
    setQuery("");
    setSearchParams({});
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

  // Filter & Sort: since backend/Gutendex already performs server-side filtering on query, language, topic, and IDs,
  // we do safe client-side refinement and sorting without dropping books that have different bookshelf metadata format.
  const filteredBooks = useMemo(() => {
    const qLower = query.toLowerCase().trim();

    const result = books.filter((book) => {
      // Search matching across title, author, genre, subjects, summary
      const matchesQuery =
        !qLower ||
        book.title?.toLowerCase().includes(qLower) ||
        book.author?.toLowerCase().includes(qLower) ||
        book.genre?.toLowerCase().includes(qLower) ||
        book.subjects?.toLowerCase().includes(qLower) ||
        book.summary?.toLowerCase().includes(qLower);

      // Genre / Topic matching: check both genre and subjects fields
      const matchesGenre =
        selectedGenre === "All" ||
        book.genre?.toLowerCase().includes(selectedGenre.toLowerCase()) ||
        book.subjects?.toLowerCase().includes(selectedGenre.toLowerCase());

      // Language filter
      const matchesLang =
        selectedLanguage === "all" ||
        book.language?.toLowerCase() === selectedLanguage.toLowerCase() ||
        (selectedLanguage === "ta" &&
          (book.language?.toLowerCase().includes("ta") ||
            book.genre?.toLowerCase().includes("tamil") ||
            book.subjects?.toLowerCase().includes("tamil") ||
            book.title?.toLowerCase().includes("tamil")));

      return matchesQuery && matchesGenre && matchesLang;
    });

    // Sorting
    return result.sort((a, b) => {
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
  }, [books, query, selectedGenre, selectedLanguage, sortBy]);

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Header with Search input */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b p-4 backdrop-blur sm:px-8"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author (e.g. 'harry potter', 'Jane Austen')..."
            className="w-full rounded-2xl border py-2.5 pl-11 pr-10 text-sm outline-none transition"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-80 transition"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={16} />
            </button>
          )}
        </form>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
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

      <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-6">
        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
              <Compass style={{ color: "var(--accent)" }} />
              Discover & Search
            </h1>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              {query ? (
                <span>
                  Showing results for <span className="font-semibold" style={{ color: "var(--accent)" }}>&ldquo;{query}&rdquo;</span> ({filteredBooks.length} books found)
                </span>
              ) : (
                `Explore ${books.length} books available in the library catalog.`
              )}
            </p>
            <p className="mt-1 text-[11px] font-medium" style={{ color: "var(--link)" }}>
              • Non-copyright public domain books alone are available here to read.
            </p>
          </div>

          {/* Quick links to search history */}
          <button
            onClick={() => navigate("/search-history")}
            className="text-xs font-semibold hover:underline self-start sm:self-auto"
            style={{ color: "var(--link)" }}
          >
            Recent searches &rarr;
          </button>
        </div>

        {/* Library Badges / Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className="rounded-2xl border p-5 transition"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Books available
            </p>
            <p className="mt-2 text-3xl font-bold">
              {books.length}
            </p>
          </div>

          <div
            className="rounded-2xl border p-5 transition"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Genres
            </p>
            <p className="mt-2 text-3xl font-bold">
              {
                new Set(
                  books.flatMap((book) =>
                    book.genre
                      ? book.genre.split(",").map((g) => g.trim()).filter(Boolean)
                      : []
                  )
                ).size
              }
            </p>
          </div>

          <div
            className="rounded-2xl border p-5 transition"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Total downloads
            </p>
            <p className="mt-2 text-3xl font-bold">
              {books
                .reduce((total, book) => total + (book.downloadCount || 0), 0)
                .toLocaleString()}
            </p>
          </div>
        </section>

        {/* Filter Toolbar: Language, Genre, Sort */}
        <div
          className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border transition"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            <Filter size={14} /> Filter:
          </div>

          {/* Language selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-xl border px-3 py-1.5 text-xs font-medium outline-none transition"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">All Languages</option>
            <option value="en">English (en)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="fr">Français (fr)</option>
            <option value="de">Deutsch (de)</option>
          </select>

          {/* Topic / Genre selector */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="rounded-xl border px-3 py-1.5 text-xs font-medium outline-none max-w-[200px] transition"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="All">All Topics / Genres</option>
            <option value="fiction">Fiction</option>
            <option value="adventure">Adventure</option>
            <option value="mystery">Mystery</option>
            <option value="philosophy">Philosophy</option>
            <option value="science">Science</option>
            <option value="poetry">Poetry</option>
            <option value="history">History</option>
            {availableGenres
              .filter((g) => !["All", "fiction", "adventure", "mystery", "philosophy", "science", "poetry", "history"].includes(g.toLowerCase()))
              .map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
          </select>

          {/* Filter by Gutenberg Book IDs (e.g. 1342, 11, 84) */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={bookIds}
              onChange={(e) => setBookIds(e.target.value)}
              placeholder="Filter IDs: 1342, 11, 84"
              className="w-36 rounded-xl border px-2.5 py-1.5 text-xs font-mono outline-none transition"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              title="Filter by specific Gutenberg Book IDs (comma-separated, e.g. 1342, 11, 84)"
            />
            {bookIds && (
              <button
                type="button"
                onClick={() => setBookIds("")}
                className="hover:opacity-80 transition"
                style={{ color: "var(--text-secondary)" }}
                title="Clear ID filter"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border px-3 py-1.5 text-xs font-medium outline-none transition"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results view */}
        {loading && (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="text-sm font-medium text-slate-500">Searching catalog...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
            <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold">No books found matching &ldquo;{query}&rdquo;</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Try searching with broader terms (like &ldquo;Dickens&rdquo;, &ldquo;Adventure&rdquo;, or &ldquo;Love&rdquo;) or switch languages.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Show All Books
            </button>
          </div>
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
      </div>
    </main>
  );
}
