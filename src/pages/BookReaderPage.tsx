import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  Smartphone,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  List,
  BookMarked,
  Globe,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookDetails, getBookContent, recordReading, recordDownload, downloadBookAsText } from "../services/bookService";
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

  // Reader view modes: 'pdf' (full document with zoom/pan) vs 'mobile' (natural vertical reflow)
  const [viewMode, setViewMode] = useState<"pdf" | "mobile">("pdf");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif");
  const [lineHeight, setLineHeight] = useState(1.85);
  const [isTwoPage, setIsTwoPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  // In-book search state (Google Books search bar)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Table of Contents drawer state
  const [tocOpen, setTocOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // Close download dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setTocOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pan state for PDF Document zoom mode
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const colors = readerThemes[theme] || readerThemes.light;

  // Load book metadata and on-demand content concurrently
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

        const bookId = Number(gutendexId);

        // Fetch metadata first
        const details = await getBookDetails(bookId);
        if (cancelled) return;
        setBook(details);

        // Fetch text from content endpoint, with graceful fallback to details.bookText
        let text = details.bookText || "";
        try {
          const contentRes = await getBookContent(bookId);
          if (contentRes?.bookText?.trim()) {
            text = contentRes.bookText;
          }
        } catch {
          // If content endpoint fails, continue to client-side fallbacks
        }

        // Direct client-side Gutenberg candidate fetch if text is not yet resolved
        if (!text.trim() && details.formats) {
          const directUrls = [
            details.formats["text/plain; charset=utf-8"],
            details.formats["text/plain"],
            details.formats["text/html; charset=utf-8"],
            details.formats["text/html"],
            `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`,
            `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`,
          ].filter(Boolean) as string[];

          for (const url of directUrls) {
            try {
              const res = await fetch(url);
              if (res.ok) {
                let fetchedText = await res.text();
                if (url.includes(".htm") || fetchedText.includes("<html")) {
                  const doc = new DOMParser().parseFromString(fetchedText, "text/html");
                  fetchedText = doc.body.textContent || doc.body.innerText || "";
                }
                if (fetchedText && fetchedText.trim().length > 200) {
                  text = fetchedText.trim();
                  break;
                }
              }
            } catch {
              // Ignore CORS failures and try next candidate
            }
          }
        }

        if (!text.trim()) {
          // Fallback to summary and historical intro if no raw text file is available
          if (details.summaries?.[0]) {
            text = `*** START OF THIS PROJECT GUTENBERG EBOOK ${details.title.toUpperCase()} ***\n\n` +
              `${details.title}\nby ${details.authors.map((a) => a.name).join(", ")}\n\n` +
              `Overview:\n${details.summaries[0]}\n\n` +
              `This historical edition was cataloged under Project Gutenberg ID ${bookId}.\n` +
              `You can also view the unaltered archival web scan using the "Original Archive ↗" button on the top toolbar.`;
          } else {
            throw new Error("Book text is currently not available for reading.");
          }
        }

        setContent(text);

        // Record reading in history
        recordReading(bookId);

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

  // Extract Table of Contents chapters from text
  const chapters = useMemo(() => {
    const list: { title: string; pageIndex: number }[] = [
      { title: "Cover Page", pageIndex: 0 },
      { title: "Title Page & Frontispiece", pageIndex: 1 },
      { title: "Table of Contents", pageIndex: 2 },
    ];

    pages.forEach((pageParagraphs, idx) => {
      for (const p of pageParagraphs) {
        const isHeading =
          p.length < 90 &&
          (/^(chapter|book|act|scene|part|prologue|epilogue|introduction|contents)\b/i.test(p) ||
            p === p.toUpperCase());
        if (isHeading) {
          list.push({
            title: p,
            pageIndex: idx + 3, // Cover (0) + Frontispiece (1) + TOC (2) = +3 offset
          });
          break;
        }
      }
    });

    return list;
  }, [pages]);

  // Compute search matches across all pages
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase();
    const matches: { pageIndex: number; preview: string }[] = [];

    // Search through pages
    pages.forEach((pageParagraphs, pIdx) => {
      const pageText = pageParagraphs.join(" ");
      if (pageText.toLowerCase().includes(query)) {
        // Build preview snippet
        const matchIdx = pageText.toLowerCase().indexOf(query);
        const snippetStart = Math.max(0, matchIdx - 35);
        const snippetEnd = Math.min(pageText.length, matchIdx + query.length + 45);
        const preview =
          (snippetStart > 0 ? "..." : "") +
          pageText.slice(snippetStart, snippetEnd) +
          (snippetEnd < pageText.length ? "..." : "");

        matches.push({
          pageIndex: pIdx + 3, // Account for Cover (0), Title (1), TOC (2)
          preview,
        });
      }
    });

    return matches;
  }, [pages, searchQuery]);

  // +3 pages for Cover Page (0), Title Page (1), and Table of Contents (2)
  const totalPages = pages.length ? pages.length + 3 : 1;

  // Jump to specific search match
  const goToMatch = useCallback(
    (index: number) => {
      if (!searchMatches.length) return;
      const normalizedIndex =
        (index + searchMatches.length) % searchMatches.length;
      setCurrentMatchIndex(normalizedIndex);
      goToPage(searchMatches[normalizedIndex].pageIndex);
    },
    [searchMatches]
  );

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

  const prevStep = isTwoPage && viewMode === "pdf" ? 2 : 1;
  const nextStep = isTwoPage && viewMode === "pdf" ? 2 : 1;

  const handlePrev = useCallback(() => {
    goToPage(currentPage - prevStep);
  }, [currentPage, prevStep, goToPage]);

  const handleNext = useCallback(() => {
    goToPage(currentPage + nextStep);
  }, [currentPage, nextStep, goToPage]);

  // Keyboard navigation
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

  // Zoom handlers for PDF-style view
  function handleZoomIn() {
    setZoomLevel((prev) => Math.min(250, prev + 25));
  }
  function handleZoomOut() {
    setZoomLevel((prev) => Math.max(75, prev - 25));
  }
  function handleResetZoom() {
    setZoomLevel(100);
    setPanPosition({ x: 0, y: 0 });
  }

  // Mouse pan handlers when zoomed in
  function handleMouseDown(e: React.MouseEvent) {
    if (zoomLevel <= 100) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panPosition };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPanPosition({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function toggleBookmark() {
    const nextVal = !bookmarked;
    setBookmarked(nextVal);
    if (gutendexId) {
      localStorage.setItem(`reader-bookmark-${gutendexId}`, String(nextVal));
    }
  }

  const progressPercentage = Math.round(((currentPage + 1) / totalPages) * 100);

  // Render a PDF-style structured page
  const renderBookPage = (pageIndex: number, _side: "left" | "right" | "single") => {
    // PAGE 0: Realistic Book Cover (Front Cover)
    if (pageIndex === 0) {
      return (
        <div className="relative flex h-full w-full flex-col items-center justify-between p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-l-2xl select-none">
          {/* Subtle gold foil ornament borders */}
          <div className="absolute inset-4 border border-amber-400/30 rounded-xl pointer-events-none" />
          <div className="absolute inset-6 border border-amber-400/15 rounded-lg pointer-events-none" />

          <div className="z-10 text-center pt-6">
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-amber-300/80">
              Classic Library Edition
            </span>
          </div>

          <div className="z-10 flex flex-col items-center text-center my-auto px-4 max-w-sm">
            {book?.formats?.["image/jpeg"] ? (
              <div className="relative mb-6 shadow-2xl rounded-lg overflow-hidden border border-white/20 max-w-[180px] max-h-[240px]">
                <img
                  src={book.formats["image/jpeg"]}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                <BookOpen size={48} />
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight text-white mb-3 leading-tight drop-shadow-md">
              {book?.title}
            </h1>
            <p className="text-sm font-serif italic text-amber-200/90 tracking-wide">
              by {book?.authors?.map((a) => a.name).join(", ") || "Unknown Author"}
            </p>
          </div>

          <div className="z-10 flex flex-col items-center pb-4 text-center">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Project Gutenberg • Free Public Domain
            </span>
            <span className="text-[10px] text-amber-300/60 mt-1 font-serif">
              Cover Page
            </span>
          </div>
        </div>
      );
    }

    // PAGE 1: Frontispiece / Title and Publication Info Page
    if (pageIndex === 1) {
      return (
        <div className="relative flex h-full w-full flex-col justify-between p-8 sm:p-12 select-text text-center">
          <div className="border-b border-current/10 pb-2 text-[10px] uppercase tracking-widest opacity-50">
            Frontispiece
          </div>

          <div className="my-auto flex flex-col items-center max-w-md mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
              {book?.title}
            </h2>
            <div className="w-12 h-0.5 bg-current opacity-30 my-2" />
            <p className="text-sm font-serif italic">
              {book?.authors?.map((a) => a.name).join(", ")}
            </p>

            {book?.summaries?.[0] && (
              <div className="mt-6 p-4 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-justify leading-relaxed opacity-80 max-h-48 overflow-y-auto">
                <p className="font-serif italic">{book.summaries[0]}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[11px] opacity-70">
              {book?.languages?.map((lang) => (
                <span key={lang} className="px-2 py-0.5 rounded-full border border-current/20">
                  {lang.toUpperCase()}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-full border border-current/20">
                {book?.download_Count?.toLocaleString()} Readers
              </span>
            </div>
          </div>

          <div className="border-t border-current/10 pt-2 text-[11px] font-serif opacity-50">
            — Title Page —
          </div>
        </div>
      );
    }

    // PAGE 2: Table of Contents (like Google Books screenshot 1)
    if (pageIndex === 2) {
      return (
        <div className="relative flex h-full w-full flex-col justify-between p-8 sm:p-12 select-text">
          <div className="border-b border-current/10 pb-2 text-[10px] uppercase tracking-widest opacity-50 text-center">
            Contents
          </div>

          <div className="my-auto py-4 overflow-y-auto max-w-lg mx-auto w-full">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-center mb-6">
              Table of Contents
            </h2>

            <div className="space-y-2.5">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToPage(ch.pageIndex)}
                  className="w-full group flex items-baseline justify-between text-left text-sm py-1.5 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="font-serif group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:underline truncate pr-4 text-xs sm:text-sm">
                    {ch.title}
                  </span>
                  <span className="text-[11px] font-mono opacity-50 group-hover:opacity-100 shrink-0">
                    p. {ch.pageIndex + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-current/10 pt-2 text-[11px] font-serif opacity-50 text-center">
            — Table of Contents —
          </div>
        </div>
      );
    }

    // PAGES 3+: Main Body Text (pageIndex - 3 corresponds to pages array index)
    const textPageIndex = pageIndex - 3;
    const pageContent = pages[textPageIndex];
    if (!pageContent) {
      return (
        <div className={`flex h-full w-full flex-col items-center justify-center p-8 select-none ${colors.muted}`}>
          <Sparkles size={28} className="mb-3 opacity-30" />
          <p className="text-sm italic font-serif">End of Book</p>
        </div>
      );
    }

    return (
      <div className="relative flex h-full flex-col justify-between p-7 sm:p-10 select-text">
        <div className="flex items-center justify-between border-b border-current/10 pb-2 text-[11px] uppercase tracking-widest opacity-60">
          <span className="truncate max-w-[200px]">{book?.title}</span>
          <span className="font-serif">Page {pageIndex + 1}</span>
        </div>

        <div
          className={`my-auto py-4 overflow-y-auto ${
            fontFamily === "serif" ? "font-serif" : fontFamily === "mono" ? "font-mono" : "font-sans"
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

        <div className="flex items-center justify-center pt-2 text-xs font-serif opacity-50">
          — {pageIndex + 1} —
        </div>
      </div>
    );
  };

  // Render Mobile Reflow continuous view
  const renderMobileView = () => {
    if (currentPage === 0) {
      return (
        <div className="w-full max-w-xl mx-auto px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white shadow-xl border border-white/10">
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 mb-6">
              Classic Library Edition
            </span>
            {book?.formats?.["image/jpeg"] && (
              <img
                src={book.formats["image/jpeg"]}
                alt={book.title}
                className="w-40 h-56 object-cover rounded-lg shadow-2xl mb-6 border border-white/20"
              />
            )}
            <h1 className="text-2xl font-serif font-bold mb-2">{book?.title}</h1>
            <p className="text-sm italic text-amber-200/90 mb-6">
              {book?.authors?.map((a) => a.name).join(", ")}
            </p>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition shadow-md"
            >
              Start Reading &rarr;
            </button>
          </div>
        </div>
      );
    }

    if (currentPage === 1) {
      return (
        <div className="w-full max-w-xl mx-auto px-4 py-8 sm:px-6 text-center">
          <div className="p-8 rounded-2xl border border-current/10 space-y-4">
            <span className="text-[11px] uppercase tracking-widest opacity-60">Frontispiece</span>
            <h2 className="text-2xl font-serif font-bold">{book?.title}</h2>
            <p className="text-sm font-serif italic">{book?.authors?.map((a) => a.name).join(", ")}</p>
            {book?.summaries?.[0] && (
              <p className="text-xs text-justify leading-relaxed opacity-80 pt-4 border-t border-current/10">
                {book.summaries[0]}
              </p>
            )}
            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={handlePrev}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold ${colors.control}`}
              >
                &larr; Cover
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Contents &rarr;
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 2) {
      return (
        <div className="w-full max-w-xl mx-auto px-4 py-8 sm:px-6">
          <div className="p-6 rounded-2xl border border-current/10 space-y-4">
            <span className="text-[11px] uppercase tracking-widest opacity-60 block text-center">
              Table of Contents
            </span>
            <div className="space-y-2 pt-2">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToPage(ch.pageIndex)}
                  className="w-full flex items-center justify-between text-left py-2 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="font-serif text-sm truncate pr-2 hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">
                    {ch.title}
                  </span>
                  <span className="text-xs font-mono opacity-50 shrink-0">
                    p. {ch.pageIndex + 1}
                  </span>
                </button>
              ))}
            </div>
            <div className="pt-4 flex justify-between items-center border-t border-current/10">
              <button
                onClick={handlePrev}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold ${colors.control}`}
              >
                &larr; Title Page
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Start Reading &rarr;
              </button>
            </div>
          </div>
        </div>
      );
    }

    const textPageIndex = currentPage - 3;
    const pageContent = pages[textPageIndex];
    if (!pageContent) return null;

    return (
      <div className="w-full max-w-xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between border-b border-current/10 pb-2 mb-4 text-xs opacity-60">
          <span className="truncate max-w-[220px] font-bold">{book?.title}</span>
          <span className="font-serif font-semibold">Page {currentPage + 1} / {totalPages}</span>
        </div>

        <div
          className={`${
            fontFamily === "serif" ? "font-serif" : fontFamily === "mono" ? "font-mono" : "font-sans"
          }`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight,
          }}
        >
          {pageContent.map((paragraph, idx) => {
            const isHeading =
              paragraph.length < 90 &&
              (/^(chapter|book|act|scene|part|prologue|epilogue)\b/i.test(paragraph) ||
                paragraph === paragraph.toUpperCase());

            if (isHeading) {
              return (
                <h2 key={idx} className={`my-5 text-center text-lg font-bold uppercase ${colors.chapterHeading}`}>
                  {paragraph}
                </h2>
              );
            }

            return (
              <p key={idx} className="mb-4 text-left leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Quick mobile page turner taps */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-current/10">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${colors.control} disabled:opacity-30`}
          >
            <ChevronLeft size={16} /> Prev Page
          </button>
          <span className="text-xs opacity-60 font-serif">Page {currentPage + 1}</span>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${colors.control} disabled:opacity-30`}
          >
            Next Page <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center ${colors.bg}`}>
        <LoaderCircle size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="font-serif text-sm">Opening book content...</p>
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
        className={`sticky top-0 z-30 flex items-center justify-between border-b px-3 py-2.5 backdrop-blur-md shadow-sm sm:px-8 ${colors.toolbar}`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(`/books/${gutendexId}`)}
            className={`flex items-center gap-1.5 rounded-xl p-2 text-sm font-medium transition ${colors.control}`}
            title="Back to Book Details"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Details</span>
          </button>

          <div className="max-w-[150px] sm:max-w-md truncate">
            <h1 className="truncate text-xs sm:text-sm font-bold font-serif">{book.title}</h1>
            <p className={`truncate text-[11px] sm:text-xs ${colors.muted}`}>
              {book.authors.map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>

        {/* View Mode Toggle Pill (PDF/Document vs. Mobile Reflow) */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => {
              setViewMode("pdf");
              setZoomLevel(100);
              setPanPosition({ x: 0, y: 0 });
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "pdf" ? "bg-indigo-600 text-white shadow-sm" : "opacity-75 hover:opacity-100"
            }`}
            title="PDF Document Mode (Pinch/Zoom & Spreads)"
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Page Mode</span>
          </button>

          <button
            onClick={() => setViewMode("mobile")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "mobile" ? "bg-indigo-600 text-white shadow-sm" : "opacity-75 hover:opacity-100"
            }`}
            title="Mobile Reflow Mode (Natural Screen Fit)"
          >
            <Smartphone size={14} />
            <span>Mobile View</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls (Only in PDF Document Mode) */}
          {viewMode === "pdf" && (
            <div className="hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-xl text-xs">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 75}
                className="p-1 hover:opacity-80 disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="px-1 font-mono text-[11px] font-semibold">{zoomLevel}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 250}
                className="p-1 hover:opacity-80 disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              {zoomLevel !== 100 && (
                <button
                  onClick={handleResetZoom}
                  className="p-1 hover:opacity-80 text-indigo-500"
                  title="Reset Zoom"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          )}

          {/* Two-page / Single-page toggle (on desktop) */}
          {viewMode === "pdf" && (
            <button
              onClick={() => setIsTwoPage(!isTwoPage)}
              className={`hidden lg:flex items-center gap-1 rounded-xl p-2 text-xs font-semibold ${colors.control}`}
              title={isTwoPage ? "Switch to Single Page" : "Switch to Two-Page Spread"}
            >
              {isTwoPage ? <Columns2 size={16} /> : <Square size={16} />}
            </button>
          )}

          {/* Download Dropdown */}
          <div className="relative" ref={downloadRef}>
            <button
              onClick={() => setDownloadOpen(!downloadOpen)}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${colors.control}`}
              title="Download Options"
            >
              <Download size={15} />
              <span className="hidden md:inline">Download</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${downloadOpen ? "rotate-180" : ""}`}
              />
            </button>

            {downloadOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl border p-1.5 shadow-2xl z-50 ${
                  theme === "dark"
                    ? "bg-gray-900 border-white/10 text-white"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Download Book
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
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-indigo-500/10 text-left transition"
                >
                  <BookMarked size={15} className="text-indigo-500 shrink-0" />
                  <div>
                    <div className="font-semibold">EPUB E-Book</div>
                    <div className="text-[10px] opacity-60">For e-readers & mobile apps</div>
                  </div>
                </button>

                {/* Plain Text (.txt) */}
                <button
                  type="button"
                  onClick={() => {
                    if (content) {
                      downloadBookAsText(book.title, content);
                    } else {
                      const textUrl =
                        book.formats?.["text/plain; charset=utf-8"] ||
                        book.formats?.["text/plain"] ||
                        `https://www.gutenberg.org/ebooks/${gutendexId}.txt.utf-8`;
                      window.open(textUrl, "_blank", "noopener,noreferrer");
                    }
                    recordDownload(book.id || Number(gutendexId));
                    setDownloadOpen(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-indigo-500/10 text-left transition"
                >
                  <FileText size={15} className="text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-semibold">Plain Text (.txt)</div>
                    <div className="text-[10px] opacity-60">Complete offline text file</div>
                  </div>
                </button>

                {/* HTML Archive */}
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
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-indigo-500/10 text-left transition border-t border-current/10 mt-1 pt-1.5"
                >
                  <Globe size={15} className="text-amber-500 shrink-0" />
                  <div>
                    <div className="font-semibold">Original HTML Archive</div>
                    <div className="text-[10px] opacity-60">Historical Gutenberg page</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Original Gutenberg Archive Edition in New Tab */}
          <button
            onClick={() => {
              const archiveUrl =
                book.formats?.["text/html"] ||
                book.formats?.["text/html; charset=utf-8"] ||
                book.formats?.["text/html; charset=iso-8859-1"] ||
                `https://www.gutenberg.org/ebooks/${gutendexId}`;
              recordDownload(book.id || Number(gutendexId));
              window.open(archiveUrl, "_blank", "noopener,noreferrer");
            }}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${colors.control} text-amber-700 dark:text-amber-400`}
            title="Open Original Gutenberg Archive Edition in another tab"
          >
            <ExternalLink size={15} />
            <span className="hidden lg:inline">Original Archive</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`rounded-xl p-2 transition ${
              bookmarked ? "text-amber-500 bg-amber-500/10" : colors.control
            }`}
            title={bookmarked ? "Bookmarked" : "Add Bookmark"}
          >
            <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${colors.control}`}
          >
            <Settings2 size={15} />
            <span className="hidden sm:inline">Aa</span>
          </button>
        </div>
      </header>

      {/* Main Reading Stage */}
      {viewMode === "mobile" ? (
        // MOBILE REFLOW MODE
        <main className="flex-1 overflow-y-auto">{renderMobileView()}</main>
      ) : (
        // PDF DOCUMENT / PAGE SPREAD MODE WITH ZOOM & PAN
        <main
          className={`relative flex flex-1 items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden select-none ${
            zoomLevel > 100 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Left page navigation arrow */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            aria-label="Previous Page"
            className="absolute left-2 sm:left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-current backdrop-blur-sm transition disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Realistic PDF Book Container with dynamic scale & pan */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100}) translate(${panPosition.x / (zoomLevel / 100)}px, ${
                panPosition.y / (zoomLevel / 100)
              }px)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            className={`relative flex w-full max-w-5xl rounded-2xl border ${colors.bookBorder} ${colors.bookBg} ${colors.bookShadow} min-h-[75vh] max-h-[85vh] overflow-hidden`}
          >
            {/* Left Page */}
            <div className={`relative flex-1 ${isTwoPage ? "border-r" : ""} ${colors.centerCrease}`}>
              {renderBookPage(currentPage, isTwoPage ? "left" : "single")}

              {isTwoPage && (
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${colors.spine}`}
                />
              )}
            </div>

            {/* Right Page (Only in Two-Page view on wider screens) */}
            {isTwoPage && (
              <div className="relative hidden md:flex flex-1">
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r ${colors.spine}`}
                />
                {renderBookPage(currentPage + 1, "right")}
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
          </div>

          {/* Right page navigation arrow */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages - (isTwoPage ? 2 : 1)}
            aria-label="Next Page"
            className="absolute right-2 sm:right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-current backdrop-blur-sm transition disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight size={24} />
          </button>
        </main>
      )}

      {/* Google Books Floating Action & Control Dock */}
      <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          {/* In-Book Search Floating Box (Appears when Search is opened or active) */}
          {searchOpen && (
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-gray-900/95 text-white p-2 px-3 shadow-2xl border border-white/10 backdrop-blur-md w-full max-w-md animate-in fade-in slide-in-from-bottom-2">
              <Search size={16} className="text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentMatchIndex(0);
                }}
                placeholder="Search inside book..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 outline-none"
                autoFocus
              />
              <span className="text-[11px] font-mono text-slate-300 px-1 whitespace-nowrap">
                {searchMatches.length > 0
                  ? `${currentMatchIndex + 1} of ${searchMatches.length}`
                  : searchQuery.trim().length >= 2
                  ? "0 results"
                  : ""}
              </span>

              <button
                type="button"
                onClick={() => goToMatch(currentMatchIndex - 1)}
                disabled={!searchMatches.length}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"
                title="Previous match"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => goToMatch(currentMatchIndex + 1)}
                disabled={!searchMatches.length}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white"
                title="Next match"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                title="Close search"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Signature Google Books Bottom Pill Control Bar */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-2xl bg-gray-950/90 text-white px-3 sm:px-4 py-2 shadow-2xl border border-white/10 backdrop-blur-md">
            {/* Search Pill Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                searchOpen || searchQuery
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 hover:bg-white/15 text-slate-200"
              }`}
              title="Search in book"
            >
              <Search size={14} />
              <span className="hidden sm:inline">
                {searchQuery ? `"${searchQuery.slice(0, 10)}..."` : "Search"}
              </span>
            </button>

            {/* Contents Dropdown Trigger */}
            <div className="relative" ref={tocRef}>
              <button
                type="button"
                onClick={() => setTocOpen(!tocOpen)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                  tocOpen ? "bg-indigo-600 text-white" : "bg-white/10 hover:bg-white/15 text-slate-200"
                }`}
                title="Table of Contents"
              >
                <List size={14} />
                <span>Contents</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${tocOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Contents Popup Menu */}
              {tocOpen && (
                <div className="absolute bottom-full left-0 mb-3 w-72 max-h-80 overflow-y-auto rounded-2xl bg-gray-900/95 border border-white/15 p-2 shadow-2xl text-white backdrop-blur-md z-50">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Table of Contents
                  </div>
                  <div className="py-1">
                    {chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          goToPage(ch.pageIndex);
                          setTocOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-xl transition ${
                          currentPage === ch.pageIndex
                            ? "bg-indigo-600 text-white font-semibold"
                            : "hover:bg-white/10 text-slate-200"
                        }`}
                      >
                        <span className="truncate pr-3">{ch.title}</span>
                        <span className="text-[10px] font-mono opacity-50 shrink-0">
                          p. {ch.pageIndex + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />

            {/* View Mode (Single vs Two-Page Spread) */}
            {viewMode === "pdf" && (
              <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsTwoPage(false)}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    !isTwoPage ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Single Page View"
                >
                  <Square size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsTwoPage(true)}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    isTwoPage ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Two-Page Spread View"
                >
                  <Columns2 size={14} />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            {viewMode === "pdf" && (
              <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 75}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="px-1 text-[11px] font-mono text-slate-300">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 250}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            )}

            <div className="h-4 w-[1px] bg-white/15" />

            {/* Page Scrubber & Label */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
                {currentPage + 1}
                {isTwoPage && viewMode === "pdf" && currentPage + 1 < totalPages
                  ? `–${currentPage + 2}`
                  : ""}{" "}
                / {totalPages}
              </span>

              <input
                type="range"
                min={0}
                max={totalPages - 1}
                step={isTwoPage && viewMode === "pdf" ? 2 : 1}
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-16 sm:w-28 h-1.5 cursor-pointer appearance-none rounded-lg bg-white/20 accent-indigo-500"
              />
            </div>
          </div>
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

              {/* View Mode in Settings */}
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider mb-2.5 block opacity-60">
                  Layout Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewMode("pdf")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                      viewMode === "pdf" ? "ring-2 ring-indigo-500 font-bold" : colors.control
                    }`}
                  >
                    <BookOpen size={16} /> Page Mode
                  </button>
                  <button
                    onClick={() => setViewMode("mobile")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                      viewMode === "mobile" ? "ring-2 ring-indigo-500 font-bold" : colors.control
                    }`}
                  >
                    <Smartphone size={16} /> Mobile View
                  </button>
                </div>
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
