import { Filter, Flame, ChevronRight } from "lucide-react";

interface TechUpdateSidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
  onClearFilters: () => void;
  onSelectTrendingTag: (tag: string) => void;
  onSelectSource: (source: string) => void;
  selectedSource: string;
}

export const AVAILABLE_TECHNOLOGIES = [
  "React",
  "TypeScript",
  ".NET",
  "Node.js",
  "JavaScript",
  "SQL",
  "AI",
  "Cloud & DevOps",
];

export const TRENDING_TAGS = [
  "React",
  "TypeScript",
  ".NET",
  "Node.js",
  "AI",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "GitHub Copilot",
];

export const TOP_SOURCES = [
  { name: "GitHub Blog", id: "GitHub", domain: "github.com" },
  { name: "Hacker News", id: "Hacker News", domain: "news.ycombinator.com" },
  { name: "Official Tech Blogs", id: "Official Blog", domain: "devblogs.microsoft.com" },
  { name: "DEV Community", id: "DEV Community", domain: "dev.to" },
];

export default function TechUpdateSidebar({
  selectedCategory,
  onSelectCategory,
  selectedTechs,
  onToggleTech,
  onClearFilters,
  onSelectTrendingTag,
  onSelectSource,
  selectedSource,
}: TechUpdateSidebarProps) {
  const updateTypes = ["All", "News", "Releases", "Tutorials", "Updates"];

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* 1. Quick Filters Panel */}
      <div
        className="rounded-3xl border p-5 shadow-xs space-y-5"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2 pb-3 border-b font-bold text-sm tracking-tight" style={{ borderColor: "var(--border)" }}>
          <Filter size={16} className="text-blue-500" />
          <span>Quick Filters</span>
        </div>

        {/* Update Type (Radio list) */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
            Update Type
          </label>
          <div className="space-y-2">
            {updateTypes.map((type) => {
              const isChecked = selectedCategory.toLowerCase() === type.toLowerCase();
              return (
                <label
                  key={type}
                  className="flex items-center gap-3 text-xs font-medium cursor-pointer hover:opacity-85 select-none"
                >
                  <input
                    type="radio"
                    name="updateType"
                    checked={isChecked}
                    onChange={() => onSelectCategory(type)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded-full"
                  />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Technologies (Multi-select Checkbox list) */}
        <div className="space-y-2.5 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
            Technologies
          </label>
          <div className="space-y-2">
            {AVAILABLE_TECHNOLOGIES.map((tech) => {
              const isChecked = selectedTechs.includes(tech);
              return (
                <label
                  key={tech}
                  className="flex items-center gap-3 text-xs font-medium cursor-pointer hover:opacity-85 select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleTech(tech)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded-md"
                  />
                  <span>{tech}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Apply Filters & Clear All */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            className="w-full py-2.5 rounded-xl font-bold text-xs transition shadow-xs text-center hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: "var(--btn-primary)",
              color: "var(--btn-text)",
            }}
          >
            <Filter size={13} /> Apply Filters
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            className="w-full py-2 rounded-xl text-xs font-semibold hover:opacity-80 transition text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* 2. Trending Technologies Tag Cloud */}
      <div
        className="rounded-3xl border p-5 shadow-xs space-y-3.5"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <Flame size={16} className="text-amber-500" />
          <span>Trending Technologies</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTrendingTag(tag)}
              className="px-2.5 py-1 rounded-xl text-xs font-medium border transition hover:border-blue-500 hover:text-blue-500"
              style={{
                backgroundColor: "var(--surface-secondary)",
                borderColor: "var(--border)",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Top Sources Directory */}
      <div
        className="rounded-3xl border p-5 shadow-xs space-y-3"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="font-bold text-sm tracking-tight pb-2 border-b" style={{ borderColor: "var(--border)" }}>
          Top Sources
        </div>
        <div className="space-y-1.5">
          {TOP_SOURCES.map((src) => {
            const isSelected = selectedSource === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => onSelectSource(isSelected ? "All" : src.id)}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition ${
                  isSelected ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{src.name}</span>
                <ChevronRight size={14} className="opacity-60 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
