interface TechBrandIconProps {
  technologyOrSource: string;
  className?: string;
  size?: number;
}

export default function TechBrandIcon({
  technologyOrSource,
  className = "w-12 h-12",
  size = 48,
}: TechBrandIconProps) {
  const norm = technologyOrSource.toLowerCase();

  // 1. React (Cyan Atomic Orbit)
  if (norm.includes("react")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-cyan-950/40 border border-cyan-500/20 shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="-11.5 -10.23174 23 20.46348"
          className="w-7 h-7 text-cyan-400 fill-none stroke-current stroke-[1.2]"
        >
          <circle cx="0" cy="0" r="2.05" fill="#38bdf8" stroke="none" />
          <g stroke="#38bdf8">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      </div>
    );
  }

  // 2. TypeScript (Solid Blue Tile TS)
  if (norm.includes("typescript") || norm === "ts") {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-xl shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        TS
      </div>
    );
  }

  // 3. Hacker News (Orange Y Combinator block)
  if (norm.includes("hacker") || norm === "hn" || norm.includes("ycombinator")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#ff6600] text-white font-black text-2xl shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        Y
      </div>
    );
  }

  // 4. GitHub (Octocat Silhouette)
  if (norm.includes("github")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </div>
    );
  }

  // 5. DEV Community (Black block with DEV)
  if (norm.includes("dev") || norm.includes("forem")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-black border border-slate-700 text-white font-black text-sm tracking-widest shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        DEV
      </div>
    );
  }

  // 6. .NET / C# (Purple Badge)
  if (norm.includes(".net") || norm.includes("c#") || norm.includes("dotnet")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-purple-600 text-white font-extrabold text-base shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        .NET
      </div>
    );
  }

  // 7. Node.js (Green Hexagon)
  if (norm.includes("node")) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-bold text-sm shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        Node
      </div>
    );
  }

  // 8. Python / AI / Default (Gradient tech block)
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black text-lg shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      &lt;/&gt;
    </div>
  );
}
