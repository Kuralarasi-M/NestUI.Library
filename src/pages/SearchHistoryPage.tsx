import { useEffect, useState } from "react";
import { ArrowLeft, Search, Trash2, Clock, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSearchHistory, clearSearchHistory, type SearchHistoryItem } from "../services/bookService";

export default function SearchHistoryPage() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSearchHistory() {
      try {
        setLoading(true);
        setError("");
        const data = await getSearchHistory();
        setHistory(data);
      } catch (err: any) {
        if (err?.message?.includes("Session expired") || err?.message?.includes("401")) {
          navigate("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Unable to load search history.");
      } finally {
        setLoading(false);
      }
    }

    loadSearchHistory();
  }, [navigate]);

  async function handleClear() {
    try {
      await clearSearchHistory();
      setHistory([]);
    } catch {
      // ignore
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-gray-950 dark:text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Search size={24} className="text-indigo-600" />
              Search History
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Keywords and topics you have recently looked up.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-300 transition"
            >
              <Trash2 size={14} /> Clear History
            </button>
          )}
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
            <h3 className="text-base font-semibold">No search history yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Your recent search queries will appear here so you can re-run them with one click.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Start Searching
            </button>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:divide-white/10 dark:border-white/10 dark:bg-gray-900">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 transition hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Search size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">&ldquo;{item.query}&rdquo;</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.searchAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/?search=${encodeURIComponent(item.query)}`)}
                  className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition"
                >
                  Search Again
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
