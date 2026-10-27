import { useEffect, useState } from "react";
import { Heart, Clock, LoaderCircle, Bookmark, ArrowRight, ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFavorites, toggleFavorite, getReadingHistory, type ReadingHistoryItem, type Book } from "../services/bookService";
import BookCard from "../components/BookCard";

interface MyLibraryPageProps {
  onOpenMenu?: () => void;
}

export default function MyLibraryPage({ onOpenMenu }: MyLibraryPageProps) {
  const [activeTab, setActiveTab] = useState<"favorites" | "history">("favorites");
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [favs, hist] = await Promise.all([
          getFavorites().catch(() => []),
          getReadingHistory().catch(() => []),
        ]);
        setFavorites(favs);
        setFavoriteIds(new Set(favs.map((b) => b.id)));
        setHistory(hist);
      } catch (err: any) {
        if (err?.message?.includes("Session expired") || err?.message?.includes("401")) {
          navigate("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Unable to load your library data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigate]);

  async function handleToggleFavorite(bookId: number) {
    try {
      await toggleFavorite(bookId);
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  }

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header & Tabs */}
        <div
          className="pb-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-start justify-between sm:justify-start gap-3 w-full sm:w-auto">
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-xl border transition hover:opacity-80 shrink-0 shadow-xs mt-1"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <button
                onClick={() => navigate("/")}
                className="mb-2 flex items-center gap-1.5 text-xs font-semibold hover:underline"
                style={{ color: "var(--link)" }}
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
                <Bookmark className="w-8 h-8" style={{ color: "var(--accent)" }} /> My Library
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                All your saved favorites and reading history organized in one convenient place.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div
            className="flex p-1.5 rounded-2xl border self-start"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setActiveTab("favorites")}
              style={
                activeTab === "favorites"
                  ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Favorites ({favorites.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={
                activeTab === "history"
                  ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Reading History ({history.length})</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <LoaderCircle size={32} className="animate-spin text-indigo-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Favorites View */}
        {!loading && !error && activeTab === "favorites" && (
          <div>
            {favorites.length === 0 ? (
              <div
                className="py-16 text-center rounded-3xl border p-8 space-y-3"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Heart size={28} />
                </div>
                <h3 className="font-bold text-base">No Favorite Books Yet</h3>
                <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
                  Browse through the Public Domain Library and click the heart icon on any book you want to save.
                </p>
                <button
                  onClick={() => navigate("/discover")}
                  style={{
                    backgroundColor: "var(--btn-primary)",
                    color: "var(--btn-text)",
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition hover:opacity-90 inline-flex items-center gap-2"
                >
                  Explore Books <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favorites.map((book) => (
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
        )}

        {/* Reading History View */}
        {!loading && !error && activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <div
                className="py-16 text-center rounded-3xl border p-8 space-y-3"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Clock size={28} />
                </div>
                <h3 className="font-bold text-base">No Reading History Yet</h3>
                <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
                  Open any book to begin reading. Your reading positions and progress will be tracked automatically.
                </p>
                <button
                  onClick={() => navigate("/discover")}
                  style={{
                    backgroundColor: "var(--btn-primary)",
                    color: "var(--btn-text)",
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition hover:opacity-90 inline-flex items-center gap-2"
                >
                  Start Reading <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/read/${item.book.gutendexId || item.book.id}`)}
                    className="p-4 rounded-2xl border flex items-center gap-4 transition hover:shadow-md cursor-pointer"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {item.book.coverImage ? (
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="h-20 w-14 rounded-xl object-cover shrink-0 shadow-xs"
                      />
                    ) : (
                      <div
                        className="h-20 w-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: "var(--surface-secondary)",
                          color: "var(--accent)",
                        }}
                      >
                        <Clock size={24} />
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <h4 className="font-bold text-sm truncate">{item.book.title}</h4>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {item.book.author}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] mt-2 font-semibold" style={{ color: "var(--link)" }}>
                        <span>Resume Reading</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
