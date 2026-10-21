
import { Heart, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../services/bookService";

interface BookCardProps {
  book: Book;
  isFavorite?: boolean;
  onToggleFavorite?: (bookId: number) => void;
}

export default function BookCard({ book, isFavorite = false, onToggleFavorite }: BookCardProps) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/books/${book.gutendexId}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl
        border border-slate-200 bg-white transition
        hover:-translate-y-1 hover:shadow-lg
        dark:border-white/10 dark:bg-gray-900"
    >
      <div className="flex h-56 items-center justify-center bg-slate-100 dark:bg-gray-800">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <BookOpen size={48} className="text-slate-400" />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold">{book.title}</h3>
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(book.id);
            }}
            className={`shrink-0 p-1.5 rounded-full transition ${
              isFavorite
                ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
          {book.author}
        </p>

        <p className="mt-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {book.genre}
        </p>

        <p className="mt-3 text-xs text-indigo-600 dark:text-indigo-400">
          {book.downloadCount.toLocaleString()} downloads
        </p>
      </div>
    </article>
  );
}
