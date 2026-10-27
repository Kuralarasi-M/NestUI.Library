import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Clock, LoaderCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getReadingHistory, type ReadingHistoryItem } from "../services/bookService";

interface HistoryPageProps {
  onOpenMenu?: () => void;
}

export default function HistoryPage({ onOpenMenu }: HistoryPageProps) {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");
        const data = await getReadingHistory();
        setHistory(data);
      } catch (err: any) {
        if (err?.message?.includes("Session expired") || err?.message?.includes("401")) {
          navigate("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Unable to load reading history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [navigate]);

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
                <Clock size={24} className="text-indigo-600" />
                Reading History
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Continue where you left off from your previously opened books.
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

        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 dark:border-white/10">
            <Clock size={44} className="text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold">No reading history yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Open any book to read, and your progress will be automatically saved here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Discover Books
            </button>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-gray-900"
              >
                <div className="flex items-center gap-4">
                  {item.book.coverImage ? (
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="h-20 w-14 rounded-lg object-cover shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <BookOpen size={24} />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-base line-clamp-1">{item.book.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      by {item.book.author}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium uppercase text-[10px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {item.book.language || "EN"}
                      </span>
                      <span>•</span>
                      <span>
                        Last opened: {new Date(item.lastReadAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => navigate(`/books/${item.book.gutendexId || item.book.id}`)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => navigate(`/read/${item.book.gutendexId || item.book.id}`)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
                  >
                    <BookOpen size={14} />
                    Resume Reading
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
