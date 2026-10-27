import { Sparkles } from "lucide-react";

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

      {/* Right Hero Illustration matching DevLearn Image */}
      <div className="relative shrink-0 w-64 h-36 hidden sm:flex items-center justify-center">
        {/* Soft Background Radial Glow */}
        <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-2xl transform scale-90" />

        {/* Central Code Laptop SVG */}
        <div className="relative z-10 w-36 h-24 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="space-y-1 font-mono text-[8px] text-cyan-400">
            <div className="text-indigo-400">&gt; npm run build</div>
            <div className="text-emerald-400">✓ Ready in 1.2s</div>
            <div className="text-slate-400">const app = true;</div>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Floating Badges surrounding laptop matching reference */}
        {/* React Badge */}
        <div className="absolute top-1 left-4 w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-lg animate-pulse">
          <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-5 h-5 text-cyan-400 fill-none stroke-current stroke-[1.2]">
            <circle cx="0" cy="0" r="2.05" fill="#38bdf8" stroke="none" />
            <g stroke="#38bdf8">
              <ellipse rx="11" ry="4.2" />
              <ellipse rx="11" ry="4.2" transform="rotate(60)" />
              <ellipse rx="11" ry="4.2" transform="rotate(120)" />
            </g>
          </svg>
        </div>

        {/* GitHub Cat Badge */}
        <div className="absolute top-0 right-16 w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>

        {/* .NET Badge */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-purple-600/90 border border-purple-400/40 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md">
          .NET
        </div>

        {/* TS Badge */}
        <div className="absolute bottom-1 right-1 w-8 h-8 rounded-xl bg-blue-600 border border-blue-400 text-white font-bold text-[10px] flex items-center justify-center shadow-md">
          TS
        </div>

        {/* Vue / Green Badge */}
        <div className="absolute bottom-2 left-6 w-7 h-7 rounded-lg bg-emerald-600/90 border border-emerald-400/40 text-white font-black text-[9px] flex items-center justify-center shadow-md">
          V
        </div>
      </div>
    </div>
  );
}
