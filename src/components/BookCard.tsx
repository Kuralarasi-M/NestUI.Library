
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
      className="group cursor-pointer overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-lg"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="flex h-56 items-center justify-center p-3"
        style={{ backgroundColor: "var(--surface-secondary)" }}
      >
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full w-full object-contain rounded-md"
          />
        ) : (
          <BookOpen size={48} style={{ color: "var(--text-secondary)" }} />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-sm leading-snug">{book.title}</h3>
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
                : "hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
            style={!isFavorite ? { color: "var(--text-secondary)" } : {}}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="mt-1.5 truncate text-xs" style={{ color: "var(--text-secondary)" }}>
          {book.author}
        </p>

        <p className="mt-2.5 line-clamp-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {book.genre}
        </p>

        <p className="mt-3 text-xs font-medium" style={{ color: "var(--link)" }}>
          {book.downloadCount.toLocaleString()} downloads
        </p>
      </div>
    </article>
  );
}
