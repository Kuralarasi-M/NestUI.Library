import { ArrowUpRight, MessageSquare, ArrowBigUp, Calendar, ExternalLink } from "lucide-react";
import type { TechUpdate } from "../../types/techUpdate";
import TechBrandIcon from "./TechBrandIcon";

interface TechUpdateCardProps {
  update: TechUpdate;
}

export default function TechUpdateCard({ update }: TechUpdateCardProps) {
  // Format Date (e.g. "Apr 24, 2025")
  const formattedDate = (() => {
    try {
      const d = new Date(update.publishedAt);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  })();

  // Primary tag for brand logo matching
  const primaryBrand = update.tags[0] || update.source;

  return (
    <article
      className="rounded-3xl border p-5 sm:p-6 transition hover:shadow-md flex flex-col sm:flex-row items-start gap-5 group"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left Brand Container Icon */}
      <div className="shrink-0">
        <TechBrandIcon technologyOrSource={primaryBrand} size={54} />
      </div>

      {/* Main Body */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Top Badges & Upvote / Comments */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tech Tag Pill (Blue tint) */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {update.tags[0] || "Tech"}
            </span>

            {/* Category Badge (Emerald for release, Amber for news, Purple for tutorial) */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                update.category.toLowerCase().includes("release")
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : update.category.toLowerCase().includes("tutorial")
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              {update.category}
            </span>

            {/* Source Pill */}
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
              <ExternalLink size={12} className="opacity-70" />
              {update.source}
            </span>
          </div>

          {/* Social Stats (Upvotes & Comments) */}
          <div className="flex items-center gap-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            <span className="flex items-center gap-1 hover:text-blue-500 transition">
              <ArrowBigUp size={16} className="text-blue-500" />
              {update.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={13} className="opacity-70" />
              {update.commentsCount}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold leading-snug group-hover:text-blue-500 transition line-clamp-2">
          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-none"
          >
            {update.title}
          </a>
        </h3>

        {/* Summary Description (2–3 sentences) */}
        <p className="text-xs sm:text-sm leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>
          {update.summary}
        </p>

        {/* Footer Meta & Read Original Button */}
        <div className="pt-2 border-t flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="flex items-center gap-1">
              <Calendar size={13} className="opacity-70" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="truncate max-w-[140px] sm:max-w-none">{update.domain || update.source}</span>
          </div>

          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "var(--btn-primary)",
              color: "var(--btn-text)",
            }}
          >
            Read more <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
