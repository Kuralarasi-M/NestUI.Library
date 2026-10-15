import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Coffee,
  LoaderCircle,
  Minus,
  Moon,
  Plus,
  Settings2,
  Sun,
  X,
  Columns2,
  Square,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookDetails } from "../services/bookService";
import type { BookDetails } from "../services/bookService";
import { useTheme } from "../hooks/useTheme";

const readerThemes = {
  light: {
    bg: "bg-[#F3EFE6]",
    bookBg: "bg-[#FAF7F0]",
    bookBorder: "border-[#E3DAC9]",
    bookShadow: "shadow-[0_20px_50px_rgba(40,30,20,0.15)]",
    spine: "from-black/10 via-black/5 to-transparent",
    centerCrease: "border-[#DFD6C3]",
    text: "text-[#2C2523]",
    muted: "text-[#857973]",
    pageNumber: "text-[#A89F99]",
    toolbar: "bg-[#FAF7F0]/90 border-[#E3DAC9] text-[#2C2523]",
    sidebar: "bg-[#FAF7F0] border-[#E3DAC9] text-[#2C2523]",
    control: "bg-[#ECE6D8] hover:bg-[#E2D9C7] text-[#2C2523]",
    active: "bg-indigo-600 text-white",
    progress: "bg-amber-700",
    track: "bg-[#DFD6C3]",
    chapterHeading: "text-[#5C3D2E]",
  },
  dark: {
    bg: "bg-[#121316]",
    bookBg: "bg-[#1C1E24]",
    bookBorder: "border-white/10",
    bookShadow: "shadow-[0_25px_60px_rgba(0,0,0,0.7)]",
    spine: "from-black/40 via-black/20 to-transparent",
    centerCrease: "border-white/5",
    text: "text-[#DCDAD5]",
    muted: "text-slate-400",
    pageNumber: "text-slate-500",
    toolbar: "bg-[#1C1E24]/90 border-white/10 text-white",
    sidebar: "bg-[#1C1E24] border-white/10 text-white",
    control: "bg-[#282B34] hover:bg-[#343844] text-white",
    active: "bg-indigo-600 text-white",
    progress: "bg-indigo-400",
    track: "bg-white/10",
    chapterHeading: "text-indigo-300",
  },
  sepia: {
    bg: "bg-[#E6D7BD]",
    bookBg: "bg-[#F4E9D5]",
    bookBorder: "border-[#D6C4A5]",
    bookShadow: "shadow-[0_20px_50px_rgba(70,45,20,0.2)]",
    spine: "from-[#4A3B2C]/15 via-black/5 to-transparent",
    centerCrease: "border-[#D6C4A5]",
    text: "text-[#433022]",
    muted: "text-[#876F58]",
    pageNumber: "text-[#A28870]",
    toolbar: "bg-[#F4E9D5]/90 border-[#D6C4A5] text-[#433022]",
    sidebar: "bg-[#F4E9D5] border-[#D6C4A5] text-[#433022]",
    control: "bg-[#E5D5BC] hover:bg-[#D9C6A9] text-[#433022]",
    active: "bg-amber-800 text-white",
    progress: "bg-amber-800",
    track: "bg-[#D6C4A5]",
    chapterHeading: "text-amber-900",
  },
};

export default function BookReaderPage() {
  const { gutendexId } = useParams();
  const navigate = useNavigate();

  const { theme, setTheme } = useTheme();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif");
  const [lineHeight, setLineHeight] = useState(1.85);
  const [isTwoPage, setIsTwoPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  const colors = readerThemes[theme] || readerThemes.light;

  // Load book details and Gutenberg text
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
          throw new Error("Book text is currently not available for reading.");
        }

        setContent(details.bookText);

        const savedBookmark = localStorage.getItem(`reader-bookmark-${gutendexId}`);
        setBookmarked(savedBookmark === "true");

        const savedPage = localStorage.getItem(`reader-page-${gutendexId}`);
        if (savedPage) {
          const parsed = parseInt(savedPage, 10);
          if (!isNaN(parsed) && parsed >= 0) {
            setCurrentPage(parsed);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to open this book.");
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

  // Clean Gutenberg headers/footers and build paginated book pages
  const pages = useMemo(() => {
    if (!content) return [];

    // Strip standard Gutenberg legal boilerplates for an authentic book feel
    let cleanText = content.replace(/\r\n/g, "\n");
    const startIdx = cleanText.search(/\*\*\* START OF (THE|THIS) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*/i);
    if (startIdx !== -1) {
      const offset = cleanText.indexOf("\n", startIdx);
      if (offset !== -1) cleanText = cleanText.slice(offset).trim();
    }
    const endIdx = cleanText.search(/\*\*\* END OF (THE|THIS) PROJECT GUTENBERG EBOOK/i);
    if (endIdx !== -1) {
      cleanText = cleanText.slice(0, endIdx).trim();
    }

    const paragraphs = cleanText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Approximate ~260 words per book page for comfortable typography
    const pageList: string[][] = [];
    let currentPageParagraphs: string[] = [];
    let currentWordCount = 0;

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).length;
      const isChapterHeading =
        paragraph.length < 90 &&
        (/^(chapter|book|act|scene|part|prologue|epilogue)\b/i.test(paragraph) ||
          paragraph === paragraph.toUpperCase());

      // If chapter heading, start a clean new page
      if (isChapterHeading && currentPageParagraphs.length > 0) {
        pageList.push(currentPageParagraphs);
        currentPageParagraphs = [paragraph];
        currentWordCount = words;
        continue;
      }

      if (currentWordCount + words > 260 && currentPageParagraphs.length > 0) {
        pageList.push(currentPageParagraphs);
        currentPageParagraphs = [paragraph];
        currentWordCount = words;
      } else {
        currentPageParagraphs.push(paragraph);
        currentWordCount += words;
      }
    }

    if (currentPageParagraphs.length > 0) {
      pageList.push(currentPageParagraphs);
    }

    return pageList;
  }, [content]);

  const totalPages = pages.length || 1;

  // Turn page safely and persist
  const goToPage = useCallback(
    (pageIndex: number) => {
      const safePage = Math.max(0, Math.min(pageIndex, totalPages - 1));
      setCurrentPage(safePage);
      if (gutendexId) {
        localStorage.setItem(`reader-page-${gutendexId}`, String(safePage));
      }
    },
    [totalPages, gutendexId]
  );

  const prevStep = isTwoPage ? 2 : 1;
  const nextStep = isTwoPage ? 2 : 1;

  const handlePrev = useCallback(() => {
    goToPage(currentPage - prevStep);
  }, [currentPage, prevStep, goToPage]);

  const handleNext = useCallback(() => {
    goToPage(currentPage + nextStep);
  }, [currentPage, nextStep, goToPage]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  function toggleBookmark() {
    const nextVal = !bookmarked;
    setBookmarked(nextVal);
    if (gutendexId) {
      localStorage.setItem(`reader-bookmark-${gutendexId}`, String(nextVal));
    }
  }

  const progressPercentage = Math.round(((currentPage + 1) / totalPages) * 100);

  // Render an authentic book page
  const renderBookPage = (pageIndex: number, _side: "left" | "right" | "single") => {
    const pageContent = pages[pageIndex];
    if (!pageContent) {
      return (
        <div
          className={`flex h-full w-full flex-col items-center justify-center p-8 select-none ${colors.muted}`}
        >
          <Sparkles size={28} className="mb-3 opacity-30" />
          <p className="text-sm italic font-serif">End of Book</p>
        </div>
      );
    }

    return (
      <div className="relative flex h-full flex-col justify-between p-7 sm:p-10 select-text">
        {/* Header running head */}
        <div className="flex items-center justify-between border-b border-current/10 pb-2 text-[11px] uppercase tracking-widest opacity-60">
          <span className="truncate max-w-[200px]">{book?.title}</span>
          <span className="font-serif">Page {pageIndex + 1}</span>
        </div>

        {/* Page text body */}
        <div
          className={`my-auto py-4 overflow-y-auto ${
            fontFamily === "serif"
              ? "font-serif"
              : fontFamily === "mono"
              ? "font-mono"
              : "font-sans"
          }`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight,
            textAlign: "justify",
          }}
        >
          {pageContent.map((paragraph, idx) => {
            const isHeading =
              paragraph.length < 90 &&
              (/^(chapter|book|act|scene|part|prologue|epilogue)\b/i.test(paragraph) ||
                paragraph === paragraph.toUpperCase());

            if (isHeading) {
              return (
                <h2
                  key={idx}
                  className={`my-6 text-center text-lg font-bold tracking-wide uppercase ${colors.chapterHeading}`}
                >
                  {paragraph}
                </h2>
              );
            }

            // Drop cap for the very first letter of a chapter page
            const isFirstPara = idx === 0 || (idx === 1 && pageContent[0].length < 90);

            return (
              <p key={idx} className="mb-4 text-justify leading-relaxed">
                {isFirstPara && paragraph.length > 20 ? (
                  <>
                    <span className="float-left mr-2.5 text-4xl sm:text-5xl font-serif font-bold leading-none text-indigo-700 dark:text-indigo-400">
                      {paragraph[0]}
                    </span>
                    {paragraph.slice(1)}
                  </>
                ) : (
                  paragraph
                )}
              </p>
            );
          })}
        </div>

        {/* Footer with page number */}
        <div className="flex items-center justify-center pt-2 text-xs font-serif opacity-50">
          — {pageIndex + 1} —
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center ${colors.bg}`}>
        <LoaderCircle size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="font-serif text-sm">Turning to your page...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center p-6 text-center ${colors.bg}`}>
        <p className="font-serif text-lg text-red-600 mb-4">{error || "Book not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className={`relative flex min-h-screen flex-col ${colors.bg} ${colors.text} transition-colors duration-300`}>
      {/* Top Reading Toolbar */}
      <header
        className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md shadow-sm sm:px-8 ${colors.toolbar}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/books/${gutendexId}`)}
            className={`flex items-center gap-2 rounded-xl p-2 text-sm font-medium transition ${colors.control}`}
            title="Back to Book Details"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Details</span>
          </button>

          <div className="max-w-[200px] sm:max-w-md truncate">
            <h1 className="truncate text-sm font-bold font-serif">{book.title}</h1>
            <p className={`truncate text-xs ${colors.muted}`}>
              {book.authors.map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Two-page / Single-page toggle (on desktop) */}
          <button
            onClick={() => setIsTwoPage(!isTwoPage)}
            className={`hidden lg:flex items-center gap-1 rounded-xl p-2 text-xs font-semibold ${colors.control}`}
            title={isTwoPage ? "Switch to Single Page" : "Switch to Two-Page Spread"}
          >
            {isTwoPage ? <Columns2 size={18} /> : <Square size={18} />}
          </button>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`rounded-xl p-2 transition ${
              bookmarked ? "text-amber-500 bg-amber-500/10" : colors.control
            }`}
            title={bookmarked ? "Bookmarked" : "Add Bookmark"}
          >
            <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${colors.control}`}
          >
            <Settings2 size={16} />
            <span>Aa</span>
          </button>
        </div>
      </header>

      {/* Main Reading Stage */}
      <main className="relative flex flex-1 items-center justify-center p-3 sm:p-6 lg:p-8">
        {/* Left page-turn navigation arrow */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          aria-label="Previous Page"
          className="absolute left-2 sm:left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-current backdrop-blur-sm transition disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Realistic Book Mockup Container */}
        <div
          className={`relative flex w-full max-w-5xl rounded-2xl border ${colors.bookBorder} ${colors.bookBg} ${colors.bookShadow} min-h-[75vh] max-h-[85vh] overflow-hidden transition-all duration-300`}
        >
          {/* Left Page */}
          <div className={`relative flex-1 ${isTwoPage ? "border-r" : ""} ${colors.centerCrease}`}>
            {renderBookPage(currentPage, isTwoPage ? "left" : "single")}

            {/* Book spine shadow effect on the right edge of left page */}
            {isTwoPage && (
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${colors.spine}`}
              />
            )}
          </div>

          {/* Right Page (Only in Two-Page view on wider screens) */}
          {isTwoPage && (
            <div className="relative hidden md:flex flex-1">
              {/* Book spine shadow effect on the left edge of right page */}
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r ${colors.spine}`}
              />
              {renderBookPage(currentPage + 1, "right")}
            </div>
          )}

          {/* Hardcover Outer Spine Edge Shadow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
        </div>

        {/* Right page-turn navigation arrow */}
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages - (isTwoPage ? 2 : 1)}
          aria-label="Next Page"
          className="absolute right-2 sm:right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-current backdrop-blur-sm transition disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight size={28} />
        </button>
      </main>

      {/* Bottom Progress Scrubber */}
      <footer className={`border-t px-6 py-3 ${colors.toolbar} backdrop-blur-md`}>
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <span className="text-xs font-serif font-semibold whitespace-nowrap">
            {currentPage + 1}
            {isTwoPage && currentPage + 1 < totalPages ? `–${currentPage + 2}` : ""} of {totalPages}
          </span>

          {/* Page scrubber slider */}
          <input
            type="range"
            min={0}
            max={totalPages - 1}
            step={isTwoPage ? 2 : 1}
            value={currentPage}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-black/10 accent-indigo-600 dark:bg-white/20"
          />

          <span className="text-xs font-semibold whitespace-nowrap opacity-60">
            {progressPercentage}%
          </span>
        </div>
      </footer>

      {/* Reader Settings Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className={`w-80 h-full p-6 shadow-2xl flex flex-col justify-between border-l ${colors.sidebar}`}>
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Settings2 size={18} />
                  Reader Settings
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Theme Picker */}
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider mb-2.5 block opacity-60">
                  Paper Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                      theme === "light" ? "ring-2 ring-indigo-500 font-bold" : "border-slate-300"
                    }`}
                  >
                    <Sun size={18} />
                    <span className="text-xs">Linen</span>
                  </button>

                  <button
                    onClick={() => setTheme("sepia")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition bg-[#F4E9D5] text-[#433022] ${
                      theme === "sepia" ? "ring-2 ring-amber-700 font-bold" : "border-[#D6C4A5]"
                    }`}
                  >
                    <Coffee size={18} />
                    <span className="text-xs">Sepia</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition bg-[#1C1E24] text-white ${
                      theme === "dark" ? "ring-2 ring-indigo-400 font-bold" : "border-white/10"
                    }`}
                  >
                    <Moon size={18} />
                    <span className="text-xs">Velvet</span>
                  </button>
                </div>
              </div>

              {/* Typography Font Picker */}
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider mb-2.5 block opacity-60">
                  Typeface
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFontFamily("serif")}
                    className={`rounded-xl border p-2.5 text-xs font-serif transition ${
                      fontFamily === "serif" ? "ring-2 ring-indigo-500 font-bold" : colors.control
                    }`}
                  >
                    Classic Serif
                  </button>
                  <button
                    onClick={() => setFontFamily("sans")}
                    className={`rounded-xl border p-2.5 text-xs font-sans transition ${
                      fontFamily === "sans" ? "ring-2 ring-indigo-500 font-bold" : colors.control
                    }`}
                  >
                    Modern Sans
                  </button>
                  <button
                    onClick={() => setFontFamily("mono")}
                    className={`rounded-xl border p-2.5 text-xs font-mono transition ${
                      fontFamily === "mono" ? "ring-2 ring-indigo-500 font-bold" : colors.control
                    }`}
                  >
                    Typewriter
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-60">
                    Font Size
                  </label>
                  <span className="text-xs font-semibold">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize((s) => Math.max(13, s - 1))}
                    className={`rounded-xl p-2.5 ${colors.control}`}
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex-1 text-center font-bold text-lg select-none">Aa</div>
                  <button
                    onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                    className={`rounded-xl p-2.5 ${colors.control}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Line Spacing */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">
                  Line Spacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1.6, 1.85, 2.2].map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => setLineHeight(spacing)}
                      className={`rounded-xl border p-2 text-xs font-semibold ${
                        lineHeight === spacing ? "ring-2 ring-indigo-500" : colors.control
                      }`}
                    >
                      {spacing === 1.6 ? "Compact" : spacing === 1.85 ? "Book" : "Relaxed"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              Done Reading
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
