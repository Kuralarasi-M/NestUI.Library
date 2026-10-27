
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Download,
  LoaderCircle,
  ExternalLink,
  Sparkles,
  ChevronDown,
  FileText,
  BookMarked,
  Globe,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookDetails, recordDownload } from "../services/bookService";
import type { BookDetails } from "../services/bookService";
import BookReviewsSection from "../components/BookReviewsSection";

export default function BookDetailsPage() {
  const { gutendexId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

            {/* Choose Reading Experience Section */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  Choose Reading Experience
                </h3>

                {/* Unified Download Dropdown */}
                <div className="relative" ref={downloadRef}>
                  <button
                    type="button"
                    onClick={() => setDownloadOpen(!downloadOpen)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 px-3.5 py-2 text-xs font-semibold transition text-slate-800 dark:text-white"
                  >
                    <Download size={15} />
                    <span>Download Options</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${downloadOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {downloadOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-gray-800 z-50">
                      <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Available Formats
                      </div>

                      {/* EPUB Option */}
                      <button
                        type="button"
                        onClick={() => {
                          const epubUrl =
                            book.formats?.["application/epub+zip"] ||
                            `https://www.gutenberg.org/ebooks/${gutendexId}.epub.images`;
                          recordDownload(book.id || Number(gutendexId));
                          window.open(epubUrl, "_blank", "noopener,noreferrer");
                          setDownloadOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-left transition"
                      >
                        <BookMarked size={16} className="text-indigo-500 shrink-0" />
                        <div>
                          <div className="font-semibold">EPUB E-Book</div>
                          <div className="text-[10px] text-slate-400">For Apple Books, Kindle, Kobo</div>
                        </div>
                      </button>

                      {/* Plain Text Option */}
                      <button
                        type="button"
                        onClick={() => {
                          const textUrl =
                            book.formats?.["text/plain; charset=utf-8"] ||
                            book.formats?.["text/plain"] ||
                            `https://www.gutenberg.org/ebooks/${gutendexId}.txt.utf-8`;
                          recordDownload(book.id || Number(gutendexId));
                          window.open(textUrl, "_blank", "noopener,noreferrer");
                          setDownloadOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-left transition"
                      >
                        <FileText size={16} className="text-emerald-500 shrink-0" />
                        <div>
                          <div className="font-semibold">Plain Text (.txt)</div>
                          <div className="text-[10px] text-slate-400">Standard offline text format</div>
                        </div>
                      </button>

                      {/* HTML Archive Option */}
                      <button
                        type="button"
                        onClick={() => {
                          const archiveUrl =
                            book.formats?.["text/html"] ||
                            book.formats?.["text/html; charset=utf-8"] ||
                            book.formats?.["text/html; charset=iso-8859-1"] ||
                            `https://www.gutenberg.org/ebooks/${gutendexId}`;
                          recordDownload(book.id || Number(gutendexId));
                          window.open(archiveUrl, "_blank", "noopener,noreferrer");
                          setDownloadOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-left transition border-t border-slate-100 dark:border-white/5 mt-1 pt-2"
                      >
                        <Globe size={16} className="text-amber-500 shrink-0" />
                        <div>
                          <div className="font-semibold">Gutenberg HTML Archive</div>
                          <div className="text-[10px] text-slate-400">Historical web edition (.htm)</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: BookNest In-App Immersive Reader */}
                <div className="flex flex-col justify-between p-4 rounded-xl border-2 border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500/30">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base text-indigo-950 dark:text-indigo-200">
                        BookNest Reader
                      </span>
                      <span className="rounded-full bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5">
                        RECOMMENDED
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                      <li>• Realistic hardcover front cover & frontispiece</li>
                      <li>• 2-page spread & mobile reflow views</li>
                      <li>• Dark, Sepia, and Linen reading paper themes</li>
                      <li>• Bookmark support & auto-progress resume</li>
                    </ul>
                  </div>

                  {hasReadableEdition ? (
                    <button
                      type="button"
                      onClick={openReader}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-indigo-700 text-sm"
                    >
                      <BookOpen size={16} />
                      Read with BookNest
                    </button>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      In-app reading edition not available for this text.
                    </p>
                  )}
                </div>

                {/* Option 2: Original Gutenberg Archive Edition */}
                <div className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base">
                        Original Archive Edition
                      </span>
                      <span className="rounded-full border border-slate-300 text-slate-500 dark:border-white/20 dark:text-slate-400 text-[10px] font-semibold px-2 py-0.5">
                        UNALTERED 1800s
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                      <li>• Opens authentic Gutenberg transcript in a new tab</li>
                      <li>• Historical layout and original public domain archive</li>
                      <li>• Direct text references and original formatting</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const archiveUrl =
                        book.formats?.["text/html"] ||
                        book.formats?.["text/html; charset=utf-8"] ||
                        book.formats?.["text/html; charset=iso-8859-1"] ||
                        `https://www.gutenberg.org/ebooks/${gutendexId}`;
                      recordDownload(book.id || Number(gutendexId));
                      window.open(archiveUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-100 dark:border-white/20 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white"
                  >
                    <ExternalLink size={16} />
                    Open Original Archive ↗
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Reviews and Community Discussion */}
        <BookReviewsSection bookId={Number(gutendexId)} />
      </div>
    </main>
  );
}
