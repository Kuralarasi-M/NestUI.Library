
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Download, LoaderCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookDetails, recordDownload } from "../services/bookService";
import type { BookDetails } from "../services/bookService";

export default function BookDetailsPage() {
  const { gutendexId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      if (!gutendexId || !/^\d+$/.test(gutendexId)) {
        setError("Invalid book ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getBookDetails(Number(gutendexId));

        if (!cancelled) {
          setBook(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load book details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [gutendexId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <LoaderCircle className="animate-spin" />
          Loading book details...
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 dark:bg-gray-950">
        <button
          onClick={() => navigate("/")}
          className="mb-5 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
        >
          <ArrowLeft size={18} />
          Back to library
        </button>

        <p role="alert" className="text-red-600 dark:text-red-400">
          {error || "Book not found."}
        </p>
      </main>
    );
  }

  const coverUrl = book.formats?.["image/jpeg"];

  const hasReadableEdition = Boolean(
    book.formats?.["text/html"] ||
      book.formats?.["text/plain; charset=utf-8"] ||
      book.formats?.["text/plain"] ||
      true
  );

  function openReader() {
    if (!gutendexId) return;

    // Open the book inside our React application.
    navigate(`/read/${gutendexId}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-gray-950 dark:text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400"
        >
          <ArrowLeft size={18} />
          Back to library
        </button>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <div className="flex justify-center">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`Cover of ${book.title}`}
                className="h-fit max-h-[360px] w-full max-w-[240px] rounded-xl object-contain shadow-lg"
              />
            ) : (
              <div className="flex h-64 w-full max-w-[240px] items-center justify-center rounded-xl bg-slate-200 dark:bg-white/10">
                <BookOpen size={80} />
              </div>
            )}
          </div>

          <section>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              BOOK DETAILS
            </p>

            <h1 className="mt-3 text-3xl font-bold">{book.title}</h1>

            <div className="mt-3 space-y-1 text-slate-600 dark:text-slate-300">
              {book.authors.map((author, index) => (
                <p key={`${author.name}-${index}`}>
                  {author.name}
                  {author.birth_Year
                    ? ` (${author.birth_Year}–${author.death_Year || "present"})`
                    : ""}
                </p>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {book.languages.map((language) => (
                <span
                  key={language}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                >
                  {language.toUpperCase()}
                </span>
              ))}

              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs dark:bg-white/10">
                {book.download_Count.toLocaleString()} downloads
              </span>
            </div>

            <h2 className="mt-7 text-lg font-semibold">About this book</h2>

            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
              {book.summaries[0] || "No summary is available for this book."}
            </p>

            <h2 className="mt-7 text-lg font-semibold">Subjects</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {book.subjects.map((subject) => (
                <span
                  key={subject}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10"
                >
                  {subject}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 items-center">
              {hasReadableEdition ? (
                <button
                  type="button"
                  onClick={openReader}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-indigo-700"
                >
                  <BookOpen size={18} />
                  Read Book
                </button>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  An online reading edition is not available for this book.
                </p>
              )}

              {/* EPUB Download */}
              {book.formats["application/epub+zip"] && (
                <a
                  href={book.formats["application/epub+zip"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordDownload(book.id || Number(gutendexId))}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                >
                  <Download size={18} />
                  Download EPUB
                </a>
              )}

              {/* TXT Download */}
              {(book.formats["text/plain; charset=utf-8"] || book.formats["text/plain"]) && (
                <a
                  href={book.formats["text/plain; charset=utf-8"] || book.formats["text/plain"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordDownload(book.id || Number(gutendexId))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-medium transition hover:bg-slate-100 dark:border-white/20 dark:hover:bg-white/10"
                >
                  <Download size={18} />
                  Download Text
                </a>
              )}

              {/* Gutenberg HTML Edition */}
              {book.formats["text/html"] && (
                <button
                  type="button"
                  onClick={() => {
                    recordDownload(book.id || Number(gutendexId));
                    window.open(book.formats["text/html"], "_blank", "noopener,noreferrer");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium transition hover:bg-slate-100 dark:border-white/20 dark:hover:bg-white/10 opacity-75 hover:opacity-100"
                >
                  <Download size={16} />
                  Gutenberg HTML
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
