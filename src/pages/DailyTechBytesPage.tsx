import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  X,
  Menu,
} from "lucide-react";
import { fetchTechUpdates, refreshTechNewsCache } from "../services/techNewsService";
import type { TechUpdate } from "../types/techUpdate";
import TechHeroBanner from "../components/tech-updates/TechHeroBanner";
import TechUpdateCard from "../components/tech-updates/TechUpdateCard";
import TechUpdateSidebar from "../components/tech-updates/TechUpdateSidebar";
import TechUpdateSkeleton from "../components/tech-updates/TechUpdateSkeleton";

interface DailyTechBytesPageProps {
  onOpenMenu?: () => void;
}

const CATEGORIES = ["All", "News", "Releases", "Tutorials", "Updates"];
const TECH_PILLS = [
  "All Tech",
  "React",
  "TypeScript",
  ".NET",
  "Node.js",
  "JavaScript",
  "SQL",
  "AI",
  "Cloud",
];

export default function DailyTechBytesPage({ onOpenMenu }: DailyTechBytesPageProps) {
  // State
  const [updates, setUpdates] = useState<TechUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTechPill, setSelectedTechPill] = useState("All Tech");
  const [selectedTechs, setSelectedTechs] = useState<string[]>(["React", "TypeScript", ".NET", "Node.js"]);
  const [selectedSource, setSelectedSource] = useState("All");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Load tech updates from backend API
  async function loadData(pageNum = 1, append = false) {
    if (!append) setLoading(true);
    try {
      const activeTech = selectedTechPill !== "All Tech" ? selectedTechPill : selectedTechs.length === 1 ? selectedTechs[0] : undefined;
      const res = await fetchTechUpdates({
        category: selectedCategory,
        technology: activeTech,
        search: search.trim() || undefined,
        source: selectedSource !== "All" ? selectedSource : undefined,
        sort: sortBy,
        page: pageNum,
        pageSize: 10,
      });

      if (append) {
        setUpdates((prev) => [...prev, ...res.items]);
      } else {
        setUpdates(res.items);
      }
      setHasMore(pageNum < res.totalPages);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load tech updates", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setPage(1);
    loadData(1, false);
  }, [selectedCategory, selectedTechPill, selectedTechs, selectedSource, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTechNewsCache();
    await loadData(1, false);
  };

  const handleToggleTech = (tech: string) => {
    setSelectedTechs((prev) => {
      if (prev.includes(tech)) {
        return prev.filter((t) => t !== tech);
      } else {
        return [...prev, tech];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSelectedTechPill("All Tech");
    setSelectedTechs([]);
    setSelectedSource("All");
    setSearch("");
    setSortBy("latest");
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  return (
    <main
      className="min-h-screen p-4 sm:p-7 space-y-6"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Mobile Top Navigation with hamburger menu */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                aria-label="Open navigation menu"
                className="p-2.5 rounded-2xl border transition hover:opacity-80 shrink-0 shadow-xs"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <span className="font-extrabold text-base tracking-tight">Latest Tech Updates</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xs"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        {/* 1. Hero Banner with Floating Tech Badges */}
        <TechHeroBanner />

        {/* 2. Primary Category Pills (All, News, Releases, Tutorials, Updates) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: active ? "var(--btn-primary)" : "var(--surface)",
                  color: active ? "var(--btn-text)" : "var(--text-secondary)",
                  borderColor: active ? "var(--btn-primary)" : "var(--border)",
                }}
                className="px-5 py-2 rounded-2xl border text-xs font-bold transition shadow-xs hover:opacity-90 shrink-0"
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. Secondary Technology Pills Bar (All Tech, React, TypeScript, .NET, Node.js, etc.) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TECH_PILLS.map((pill) => {
            const active = selectedTechPill.toLowerCase() === pill.toLowerCase();
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedTechPill(pill)}
                style={{
                  backgroundColor: active ? "var(--surface-secondary)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition hover:border-blue-500 shrink-0 ${
                  active ? "font-bold shadow-xs" : ""
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* 4. Search Bar & Sort Dropdown Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Keyword Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full rounded-2xl border py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-blue-500 shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Switcher (Latest / Popular) & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
                className="bg-transparent border-none outline-none font-bold cursor-pointer text-xs"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="latest" className="dark:bg-slate-900">⚡ Latest</option>
                <option value="popular" className="dark:bg-slate-900">🔥 Most Popular</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title={`Last updated ${lastUpdated.toLocaleTimeString()}`}
              className="p-2.5 rounded-2xl border hover:opacity-85 transition shadow-xs flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* 5. Main Grid: Left Central Feed + Right Sidebar */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Central Newsfeed Cards */}
          <div className="flex-1 w-full space-y-4">
            {loading ? (
              <TechUpdateSkeleton />
            ) : updates.length === 0 ? (
              <div
                className="rounded-3xl border p-12 text-center space-y-4 shadow-xs"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <Sparkles size={40} className="mx-auto text-amber-500 opacity-80" />
                <h3 className="font-extrabold text-base">No tech updates found</h3>
                <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
                  Try relaxing your search keywords or clearing active filters to see more stories.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2 rounded-xl text-xs font-bold transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--btn-primary)",
                    color: "var(--btn-text)",
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {updates.map((item) => (
                    <TechUpdateCard key={item.id} update={item} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-8 py-3 rounded-2xl text-xs font-bold border transition hover:opacity-90 shadow-xs"
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      Load More Updates ↓
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar Filters (Desktop) */}
          <div className="hidden lg:block">
            <TechUpdateSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedTechs={selectedTechs}
              onToggleTech={handleToggleTech}
              onClearFilters={handleClearFilters}
              onSelectTrendingTag={(tag) => setSelectedTechPill(tag)}
              onSelectSource={setSelectedSource}
              selectedSource={selectedSource}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs lg:hidden">
          <div
            className="w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 shadow-2xl"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--text-primary)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="font-black text-sm">Filter Tech Updates</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg hover:opacity-80"
              >
                <X size={18} />
              </button>
            </div>

            <TechUpdateSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setMobileFilterOpen(false);
              }}
              selectedTechs={selectedTechs}
              onToggleTech={handleToggleTech}
              onClearFilters={handleClearFilters}
              onSelectTrendingTag={(tag) => {
                setSelectedTechPill(tag);
                setMobileFilterOpen(false);
              }}
              onSelectSource={(src) => {
                setSelectedSource(src);
                setMobileFilterOpen(false);
              }}
              selectedSource={selectedSource}
            />
          </div>
        </div>
      )}
    </main>
  );
}
