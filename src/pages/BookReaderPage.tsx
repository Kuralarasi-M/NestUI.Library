
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Home,
  List,
  LoaderCircle,
  Menu,
  Minus,
  Moon,
  Plus,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookDetails } from "../services/bookService";
import type { BookDetails } from "../services/bookService";
import { useTheme } from "../hooks/useTheme";

const readerThemes = {
  light: {
    page: "bg-[#F5F3EF] text-[#292720]",
    muted: "text-stone-500",
    border: "border-stone-200",
    toolbar: "bg-white",
    sidebar: "bg-white",
    control: "bg-white hover:bg-stone-100",
    active: "bg-indigo-50 text-indigo-700",
    paper: "bg-white border-stone-200",
    progress: "bg-indigo-600",
    track: "bg-slate-200",
    inactive: "hover:bg-stone-100",
  },
  dark: {
    page: "bg-[#17191F] text-[#E7E5E4]",
    muted: "text-slate-400",
    border: "border-white/10",
    toolbar: "bg-[#1D2028]",
    sidebar: "bg-[#1D2028]",
    control: "bg-[#272A34] hover:bg-[#323642]",
    active: "bg-indigo-500/20 text-indigo-300",
    paper: "bg-[#20232B] border-white/10",
    progress: "bg-indigo-400",
    track: "bg-white/10",
    inactive: "hover:bg-white/5",
  },
  sepia: {
    page: "bg-[#E8DDC7] text-[#51412F]",
    muted: "text-[#86745E]",
    border: "border-[#D4C4A7]",
    toolbar: "bg-[#F4ECD8]",
    sidebar: "bg-[#F4ECD8]",
    control: "bg-[#F8F0DE] hover:bg-[#E9DCC1]",
    active: "bg-amber-200 text-amber-900",
    paper: "bg-[#FAF3E3] border-[#DCCDB1]",
    progress: "bg-amber-700",
    track: "bg-amber-200",
    inactive: "hover:bg-amber-200/50",
  },
};

export default function BookReaderPage() {
  const { gutendexId } = useParams();
  const navigate = useNavigate();

  // Use the shared theme hook instead of separate theme state.
  const { theme, setTheme } = useTheme();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "book" | "appearance"
  >("book");

  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [bookmarked, setBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);

  const colors = readerThemes[theme];
  const coverUrl = book?.formats?.["image/jpeg"];

  // Load book details and text from the backend API.
  useEffect(() => {
    let cancelled = false;

    async function loadBook() {
      if (!gutendexId || !/^\d+$/.test(gutendexId)) {
        setError("Invalid book ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setBook(null);
        setContent("");

        const details = await getBookDetails(Number(gutendexId));

        if (cancelled) return;

        setBook(details);

        if (!details.bookText?.trim()) {
          throw new Error(
            "Book text is not available. Please check your backend API response."
          );
        }

        setContent(details.bookText);

        const savedBookmark = localStorage.getItem(
          `reader-bookmark-${gutendexId}`
        );

        setBookmarked(savedBookmark === "true");

        const savedProgress = Number(
          localStorage.getItem(
            `reader-progress-${gutendexId}`
          ) ?? 0
        );

        setProgress(
          Number.isFinite(savedProgress)
            ? Math.min(100, Math.max(0, savedProgress))
            : 0
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to open this book."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;
    };
  }, [gutendexId]);

  // Split the plain-text book into paragraphs.
  const paragraphs = useMemo(() => {
    return content
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [content]);

  // Update and save reading progress while scrolling.
  useEffect(() => {
    function updateProgress() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      const percentage =
        scrollable <= 0
          ? 0
          : Math.round((window.scrollY / scrollable) * 100);

      const safeProgress = Math.min(100, Math.max(0, percentage));

      setProgress(safeProgress);

      if (gutendexId) {
        localStorage.setItem(
          `reader-progress-${gutendexId}`,
          String(safeProgress)
        );
      }
    }

    window.addEventListener("scroll", updateProgress, {
      passive: true,
    });

    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, [gutendexId, content]);

  function toggleBookmark() {
    const nextValue = !bookmarked;

    setBookmarked(nextValue);

    if (gutendexId) {
      localStorage.setItem(
        `reader-bookmark-${gutendexId}`,
        String(nextValue)
      );
    }
  }

  function changeFontSize(increase: boolean) {
    setFontSize((size) =>
      increase ? Math.min(28, size + 1) : Math.max(14, size - 1)
    );
  }

  function goToStart() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function continueReading() {
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: "smooth",
    });
  }

  function resumeReading() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    if (scrollable > 0) {
      window.scrollTo({
        top: (progress / 100) * scrollable,
        behavior: "smooth",
      });
    }
  }

  // Loading screen.
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="flex items-center gap-3 text-stone-600">
          <LoaderCircle className="animate-spin" size={24} />
          <span>Opening your book...</span>
        </div>
      </main>
    );
  }

  // Error screen.
  if (error || !book) {
    return (
      <main className={`min-h-screen p-6 ${colors.page}`}>
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="max-w-2xl rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p role="alert">{error || "Book not found."}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-200 ${colors.page}`}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r ${colors.border} ${colors.sidebar} transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div
          className={`flex items-center justify-between border-b ${colors.border} p-5`}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-semibold"
          >
            <BookOpen className="text-indigo-500" size={23} />
            <span>Library Reader</span>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className={`rounded-lg p-2 ${colors.inactive} lg:hidden`}
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable middle section */}
        <div className="flex-1 overflow-y-auto">
          {/* Book cover */}
          <div className={`border-b ${colors.border} p-5`}>
            <div className="mb-4 flex justify-center">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`Cover of ${book.title}`}
                className="h-48 w-36 rounded-md object-cover shadow-lg"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div
                className={`flex h-48 w-36 flex-col items-center justify-center rounded-md border ${colors.border} ${colors.paper} p-3 text-center shadow-lg`}
              >
                <BookOpen
                  size={36}
                  className="mb-4 text-indigo-500"
                />
                <span className="text-sm font-bold">
                  {book.title}
                </span>
              </div>
            )}
          </div>

          <h2 className="line-clamp-2 text-center font-semibold">
            {book.title}
          </h2>

          <p className={`mt-1 text-center text-sm ${colors.muted}`}>
            {book.authors.map((author) => author.name).join(", ")}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className={colors.muted}>
                Reading progress
              </span>
              <span className="font-semibold">{progress}%</span>
            </div>

            <div
              className={`h-2 overflow-hidden rounded-full ${colors.track}`}
            >
              <div
                className={`h-full rounded-full transition-all ${colors.progress}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={resumeReading}
              disabled={progress === 0}
              className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Resume reading
            </button>
          </div>
        </div>

        {/* Sidebar navigation */}
        <nav className="space-y-1 p-3">
          <p
            className={`px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider ${colors.muted}`}
          >
            Reader menu
          </p>

          <button
            onClick={() => {
              setActiveSection("book");
              setSidebarOpen(false);
              goToStart();
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              activeSection === "book"
                ? colors.active
                : colors.inactive
            }`}
          >
            <List size={18} />
            Book information
          </button>

          <button
            onClick={() => setActiveSection("appearance")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              activeSection === "appearance"
                ? colors.active
                : colors.inactive
            }`}
          >
            <Settings2 size={18} />
            Reading settings
          </button>

          <button
            onClick={toggleBookmark}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${colors.inactive} ${
              bookmarked ? "text-indigo-500" : ""
            }`}
          >
            <Bookmark
              size={18}
              fill={bookmarked ? "currentColor" : "none"}
            />
            {bookmarked ? "Bookmarked" : "Bookmark this book"}

            {bookmarked && (
              <Check size={15} className="ml-auto" />
            )}
          </button>
        </nav>

        {/* Appearance settings */}
        {activeSection === "appearance" && (
          <div className={`border-t ${colors.border} p-4`}>
            <p className="mb-3 text-sm font-semibold">
              Appearance
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                className={`flex flex-col items-center gap-2 rounded-lg border ${colors.border} p-3 ${
                  theme === "light"
                    ? "ring-2 ring-indigo-500"
                    : ""
                }`}
              >
                <Sun size={18} />
                <span className="text-xs">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className={`flex flex-col items-center gap-2 rounded-lg border ${colors.border} p-3 ${
                  theme === "dark"
                    ? "ring-2 ring-indigo-500"
                    : ""
                }`}
              >
                <Moon size={18} />
                <span className="text-xs">Dark</span>
              </button>

              <button
                onClick={() => setTheme("sepia")}
                aria-pressed={theme === "sepia"}
                className={`flex flex-col items-center gap-2 rounded-lg border ${colors.border} p-3 ${
                  theme === "sepia"
                    ? "ring-2 ring-indigo-500"
                    : ""
                }`}
              >
                <Coffee size={18} />
                <span className="text-xs">Sepia</span>
              </button>
            </div>

            {/* Font size */}
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm">Font size</label>
                <span className={`text-sm ${colors.muted}`}>
                  {fontSize}px
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => changeFontSize(false)}
                  disabled={fontSize <= 14}
                  aria-label="Decrease font size"
                  className={`rounded-lg p-2 ${colors.control} disabled:opacity-30`}
                >
                  <Minus size={18} />
                </button>

                <div
                  className={`h-1 flex-1 rounded-full ${colors.track}`}
                >
                  <div
                    className={`h-full rounded-full ${colors.progress}`}
                    style={{
                      width: `${((fontSize - 14) / 14) * 100}%`,
                    }}
                  />
                </div>

                <button
                  onClick={() => changeFontSize(true)}
                  disabled={fontSize >= 28}
                  aria-label="Increase font size"
                  className={`rounded-lg p-2 ${colors.control} disabled:opacity-30`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Line spacing */}
            <div className="mt-5">
              <label className="mb-2 block text-sm">
                Line spacing
              </label>

              <select
                value={lineHeight}
                onChange={(event) =>
                  setLineHeight(Number(event.target.value))
                }
                className={`w-full rounded-lg border ${colors.border} ${colors.control} px-3 py-2 text-sm`}
              >
                <option value={1.5}>Compact</option>
                <option value={1.9}>Comfortable</option>
                <option value={2.2}>Relaxed</option>
              </select>
            </div>
          </div>
        )}
        </div>

        {/* Sidebar footer */}
        <div className={`mt-auto border-t ${colors.border} p-4`}>
          <button
            onClick={() => navigate(-1)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${colors.control}`}
          >
            <ArrowLeft size={18} />
            Back to book details
          </button>

          <button
            onClick={() => navigate("/")}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${colors.control}`}
          >
            <Home size={18} />
            Home
          </button>
        </div>
      </aside>

      {/* Main reader area */}
      <div className="min-h-screen lg:pl-72">
        {/* Toolbar */}
        <header
          className={`sticky top-0 z-30 border-b ${colors.border} ${colors.toolbar} px-3 py-3 sm:px-6`}
        >
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className={`rounded-lg p-2 ${colors.control} lg:hidden`}
            >
              <Menu size={21} />
            </button>

            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className={`hidden rounded-lg p-2 ${colors.control} sm:block`}
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {book.title}
              </p>
              <p className={`truncate text-xs ${colors.muted}`}>
                {book.authors
                  .map((author) => author.name)
                  .join(", ")}
              </p>
            </div>

            <button
              onClick={toggleBookmark}
              aria-label={
                bookmarked ? "Remove bookmark" : "Bookmark"
              }
              title={bookmarked ? "Bookmarked" : "Bookmark"}
              className={`rounded-lg p-2 ${
                bookmarked ? "text-indigo-500" : colors.control
              }`}
            >
              <Bookmark
                size={20}
                fill={bookmarked ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="mx-auto mt-3 max-w-5xl">
            <div
              className={`h-1 overflow-hidden rounded-full ${colors.track}`}
            >
              <div
                className={`h-full rounded-full transition-all ${colors.progress}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className={`mt-1 text-right text-xs ${colors.muted}`}>
              {progress}% read
            </p>
          </div>
        </header>

        {/* Book cover and title page */}
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:px-12">
          <div
            className={`mx-auto mb-10 flex min-h-[70vh] max-w-3xl flex-col items-center justify-center rounded-sm border px-6 py-12 text-center shadow-md sm:px-12 ${colors.paper}`}
          >
            {coverUrl && (
              <img
                src={coverUrl}
                alt={`Cover of ${book.title}`}
                className="mb-8 max-h-[360px] w-auto max-w-[240px] rounded-md object-contain shadow-xl"
              />
            )}

            {!coverUrl && (
              <div className="mb-8 flex h-64 w-48 flex-col items-center justify-center border-4 border-double border-current/30 p-5">
                <BookOpen
                  size={42}
                  className="mb-6 text-indigo-500"
                />
                <p className="text-lg font-bold">{book.title}</p>
              </div>
            )}

            <p
              className={`text-xs font-semibold uppercase tracking-[0.25em] ${colors.muted}`}
            >
              Your reading space
            </p>

            <h1 className="mt-5 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">
              {book.title}
            </h1>

            <p className={`mt-5 font-serif text-lg ${colors.muted}`}>
              {book.authors
                .map((author) => author.name)
                .join(", ")}
            </p>

            {book.languages.length > 0 && (
              <p className={`mt-3 text-sm ${colors.muted}`}>
                Language: {book.languages.join(", ")}
              </p>
            )}

            <button
              onClick={continueReading}
              className="mt-9 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              <BookOpen size={18} />
              Start reading
            </button>
          </div>

          {/* Book text */}
          <article
            className={`mx-auto max-w-3xl rounded-sm border px-5 py-10 shadow-md sm:px-12 sm:py-14 lg:px-16 ${colors.paper}`}
          >
            <div className="mb-12 border-b border-current/10 pb-8 text-center">
              <p
                className={`text-xs uppercase tracking-[0.2em] ${colors.muted}`}
              >
                {book.title}
              </p>

              <h2 className="mt-4 font-serif text-2xl font-bold">
                Begin reading
              </h2>
            </div>

            <div
              className="mx-auto max-w-[680px] break-words font-serif"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight,
                textAlign: "justify",
              }}
            >
              {paragraphs.map((paragraph, index) => {
                const isHeading =
                  paragraph.length < 100 &&
                  (paragraph === paragraph.toUpperCase() ||
                    /^(chapter|book|part|prologue|epilogue)\b/i.test(
                      paragraph
                    ));

                if (isHeading) {
                  return (
                    <h3
                      key={index}
                      className="mb-8 mt-12 text-center font-serif text-xl font-bold"
                    >
                      {paragraph}
                    </h3>
                  );
                }

                return (
                  <p
                    key={index}
                    className="mb-6 whitespace-pre-wrap indent-8"
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Bottom reader controls */}
            <div
              className={`mt-14 flex items-center justify-between gap-3 border-t ${colors.border} pt-6`}
            >
              <button
                onClick={goToStart}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${colors.control}`}
              >
                <ChevronLeft size={18} />
                Back to start
              </button>

              <button
                onClick={continueReading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Continue reading
                <ChevronRight size={18} />
              </button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
