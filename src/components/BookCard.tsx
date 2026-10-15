
import { Heart, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../services/bookService";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
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
          <Heart size={18} className="shrink-0 text-slate-400" />
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
