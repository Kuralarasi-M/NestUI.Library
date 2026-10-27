import { Sparkles } from "lucide-react";
import TechBannerGraphic from "./TechBannerGraphic";

export default function TechHeroBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left text description */}
      <div className="max-w-xl space-y-2 z-10">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500">
            <Sparkles className="w-6 h-6" />
          </span>
          Latest Tech Updates
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Stay informed with the latest news, releases, and developer updates from across the tech world.
          Curated from trusted sources like GitHub, Hacker News, official blogs, and the developer community.
        </p>
      </div>

      {/* Right Hero Illustration with TechBannerGraphic */}
      <div className="shrink-0 hidden md:flex items-center justify-center">
        <TechBannerGraphic />
      </div>
    </div>
  );
}
