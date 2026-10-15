
import { useEffect, useState } from "react";
import { Search, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { getAllBooks } from "../services/bookService";
import type { Book } from "../services/bookService";
import BookCard from "../components/BookCard";

interface DashboardProps {
  onOpenMenu: () => void;
}

export default function Dashboard({ onOpenMenu }: DashboardProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllBooks();
        setBooks(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.genre}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

        <div className="relative max-w-xl flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search books, authors, genres..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-gray-900"
          />
        </div>

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
        </section>

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
          <div className="mb-5">
            <h2 className="text-xl font-bold">Discover books</h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Browse your library and select a book to see its details.
            </p>
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
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
