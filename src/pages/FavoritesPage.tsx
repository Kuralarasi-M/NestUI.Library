import { useEffect, useState } from "react";
import { ArrowLeft, Heart, LoaderCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../services/bookService";
import type { Book } from "../services/bookService";
import BookCard from "../components/BookCard";

interface FavoritesPageProps {
  onOpenMenu?: () => void;
}

export default function FavoritesPage({ onOpenMenu }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        setError("");
        const data = await getFavorites();
        setFavorites(data);
      } catch (err: any) {
        if (err?.message?.includes("Session expired") || err?.message?.includes("401")) {
          navigate("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Unable to load favorite books.");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [navigate]);

  async function handleToggleFavorite(bookId: number) {
    try {
      await toggleFavorite(bookId);
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-gray-950 dark:text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition hover:opacity-80 shrink-0 shadow-xs mt-1"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <button
                onClick={() => navigate("/")}
                className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart size={24} className="text-rose-500 fill-rose-500" />
                My Favorite Books
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Books you have saved to read and revisit anytime.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <LoaderCircle size={32} className="animate-spin text-indigo-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 dark:border-white/10">
            <Heart size={44} className="text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold">No favorite books yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Browse the library and tap the heart icon on any book to add it here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Discover Books
            </button>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
