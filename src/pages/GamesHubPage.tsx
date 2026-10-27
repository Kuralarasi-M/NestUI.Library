import { useState } from "react";
import {
  Search,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface GamesHubPageProps {
  onOpenMenu?: () => void;
}

export default function GamesHubPage({}: GamesHubPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const games = [
    {
      id: "daily-tamil",
      title: "Daily 5 Words (தமிழ்)",
      description: "Learn 5 new words every day with Tamil meanings, pronunciation, examples and fill-in-the-blanks practice.",
      bulletPoints: null,
      duration: "5-10 mins",
      points: "+10 to +25 pts",
      to: "/daily-tamil",
      bgColor: "rgba(250, 245, 255, 0.75)", // Soft purple tint
      borderColor: "rgba(233, 213, 255, 0.8)",
      btnBg: "#7C3AED", // Purple button
      btnHover: "#6D28D9",
      dotColor: "#8B5CF6",
      customIllustration: (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-purple-200/50 dark:bg-purple-900/30 rounded-full blur-xl scale-95" />
          {/* Flashcard with Tamil script */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Background tilted card */}
            <div className="absolute w-18 h-22 bg-purple-300/60 dark:bg-purple-800/60 rounded-2xl transform rotate-12 shadow-sm" />
            {/* Front card */}
            <div className="relative w-20 h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-purple-200 dark:border-purple-700 p-2 flex flex-col justify-between items-center text-center">
              <div className="w-4 h-1 bg-purple-300 rounded-full" />
              <div>
                <span className="text-purple-700 dark:text-purple-300 font-extrabold text-sm tracking-wide">
                  தமிழ்
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                  English
                </span>
              </div>
              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                அ
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "word-games",
      title: "Word Games",
      description: "Build vocabulary and improve grammar with fun word challenges.",
      bulletPoints: ["Sentence Builder", "Guess the Word", "Word Search"],
      duration: "5-10 mins",
      points: "+10 to +50 pts",
      to: "/word-games",
      bgColor: "rgba(239, 246, 255, 0.75)", // Soft blue tint
      borderColor: "rgba(191, 219, 254, 0.8)",
      btnBg: "#2563EB", // Blue button
      btnHover: "#1D4ED8",
      dotColor: "#3B82F6",
      customIllustration: (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          {/* Decorative soft glow */}
          <div className="absolute inset-0 bg-blue-200/50 dark:bg-blue-900/30 rounded-full blur-xl scale-95" />
          {/* Scrabble tiles illustration */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {/* Tile 1: W */}
            <div
              className="absolute left-2 top-3 w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-200 text-amber-900 font-black text-xl flex items-center justify-center shadow-md transform -rotate-12 border border-amber-300"
            >
              W
            </div>
            {/* Tile 2: O */}
            <div
              className="absolute right-4 top-2 w-11 h-11 rounded-xl bg-emerald-400 text-emerald-950 font-black text-xl flex items-center justify-center shadow-md transform rotate-6 border border-emerald-300"
            >
              O
            </div>
            {/* Tile 3: R */}
            <div
              className="absolute left-4 bottom-2 w-11 h-11 rounded-xl bg-teal-400 text-teal-950 font-black text-xl flex items-center justify-center shadow-md transform rotate-12 border border-teal-300"
            >
              R
            </div>
            {/* Tile 4: D */}
            <div
              className="absolute right-3 bottom-3 w-11 h-11 rounded-xl bg-amber-200 dark:bg-amber-300 text-amber-900 font-black text-xl flex items-center justify-center shadow-md transform -rotate-6 border border-amber-400"
            >
              D
            </div>
            {/* Pencil decorative */}
            <div
              className="absolute -right-1 bottom-1 w-2.5 h-12 bg-blue-600 rounded-full transform rotate-45 shadow-sm border border-blue-400"
            />
          </div>
        </div>
      ),
    },
    {
      id: "word-search",
      title: "Word Search Puzzle",
      description: "Find hidden words inside letter grids with progressive difficulty and stage unlock animations.",
      bulletPoints: ["Easy 8x8 to Hard 12x12", "Stage Persistence", "Confetti Cleared"],
      duration: "5-10 mins",
      points: "+100 pts / Level",
      to: "/word-games?tab=search",
      bgColor: "rgba(253, 242, 248, 0.75)", // Soft pink/rose tint
      borderColor: "rgba(251, 207, 232, 0.8)",
      btnBg: "#DB2777", // Pink pill button
      btnHover: "#BE185D",
      dotColor: "#EC4899",
      customIllustration: (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-pink-200/50 dark:bg-pink-900/30 rounded-full blur-xl scale-95" />
          {/* Mini 3x3 letter grid with magnifying glass */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="grid grid-cols-3 gap-1 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-pink-200 dark:border-pink-800">
              <span className="w-5 h-5 rounded-md bg-pink-500 text-white font-bold text-xs flex items-center justify-center">B</span>
              <span className="w-5 h-5 rounded-md bg-pink-500 text-white font-bold text-xs flex items-center justify-center">O</span>
              <span className="w-5 h-5 rounded-md bg-pink-500 text-white font-bold text-xs flex items-center justify-center">O</span>
              <span className="w-5 h-5 rounded-md bg-pink-100 dark:bg-slate-700 text-pink-900 dark:text-pink-200 font-bold text-xs flex items-center justify-center">K</span>
              <span className="w-5 h-5 rounded-md bg-pink-100 dark:bg-slate-700 text-pink-900 dark:text-pink-200 font-bold text-xs flex items-center justify-center">S</span>
              <span className="w-5 h-5 rounded-md bg-pink-100 dark:bg-slate-700 text-pink-900 dark:text-pink-200 font-bold text-xs flex items-center justify-center">E</span>
              <span className="w-5 h-5 rounded-md bg-pink-100 dark:bg-slate-700 text-pink-900 dark:text-pink-200 font-bold text-xs flex items-center justify-center">A</span>
              <span className="w-5 h-5 rounded-md bg-pink-100 dark:bg-slate-700 text-pink-900 dark:text-pink-200 font-bold text-xs flex items-center justify-center">R</span>
              <span className="w-5 h-5 rounded-md bg-pink-100 dark:bg-slate-700 text-pink-900 dark:text-pink-200 font-bold text-xs flex items-center justify-center">C</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "random-challenge",
      title: "Random Book Quiz Challenge",
      description: "Test your knowledge with random questions about books, authors, characters and more.",
      bulletPoints: null,
      duration: "5-10 mins",
      points: "+15 to +25 pts",
      to: "/challenge",
      bgColor: "rgba(255, 251, 235, 0.75)", // Soft warm amber tint
      borderColor: "rgba(254, 215, 170, 0.8)",
      btnBg: "#EA580C", // Vibrant warm orange button
      btnHover: "#C2410C",
      dotColor: "#F97316",
      customIllustration: (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-900/30 rounded-full blur-xl scale-95" />
          {/* Stack of books with question mark */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Floating question bubble */}
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md mb-1 animate-bounce">
              ?
            </div>
            {/* Book 1 (Blue) */}
            <div className="w-18 h-4.5 bg-blue-600 rounded-sm shadow-md border-t border-blue-400 flex items-center justify-end px-1">
              <div className="w-1 h-3 bg-amber-300 rounded-xs" />
            </div>
            {/* Book 2 (Green) */}
            <div className="w-20 h-4.5 bg-emerald-600 rounded-sm shadow-md border-t border-emerald-400 mt-0.5 flex items-center justify-start px-1">
              <div className="w-1.5 h-3 bg-amber-100 rounded-xs" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.bulletPoints?.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Top Header matching reference image: Gaming Controller + Title + Subtitle + Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Vibrant Blue Controller Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
              <svg
                className="w-7 h-7 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M7.5 7h9a5.5 5.5 0 0 1 5.5 5.5c0 3.038-2.462 5.5-5.5 5.5a5.5 5.5 0 0 1-1.638-.25l-2.022-2.023a1.5 1.5 0 0 0-1.06-.44H12.22a1.5 1.5 0 0 0-1.06.44l-2.022 2.023A5.5 5.5 0 0 1 7.5 18 5.5 5.5 0 0 1 2 12.5 5.5 5.5 0 0 1 7.5 7zm-1 3.5v1.5H5a.75.75 0 0 0 0 1.5h1.5V15a.75.75 0 0 0 1.5 0v-1.5H9.5a.75.75 0 0 0 0-1.5H8v-1.5a.75.75 0 0 0-1.5 0zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Games &amp; Puzzles
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Play, learn and grow your skills! Choose from a variety of fun and educational games to improve your vocabulary, reading, grammar and more.
              </p>
            </div>
          </div>

          {/* Search Box on Right */}
          <div className="relative w-full sm:w-64 shrink-0 self-start sm:self-center">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full rounded-full border border-blue-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-xs"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* 2x2 Grid matching reference image cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden"
              style={{
                backgroundColor: game.bgColor,
                borderColor: game.borderColor,
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Custom 3D-styled vector illustration */}
                  {game.customIllustration}

                  {/* Right: Title, Description, Bullet points */}
                  <div className="flex-1 space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {game.title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {game.description}
                    </p>

                    {/* Bullet Points for Word Games */}
                    {game.bulletPoints && (
                      <ul className="space-y-1 pt-1">
                        {game.bulletPoints.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: game.dotColor }}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Footer: Duration, Points, Play Now Button */}
              <div className="pt-6 mt-4 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{game.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{game.points}</span>
                  </div>
                </div>

                <Link
                  to={game.to}
                  style={{
                    backgroundColor: game.btnBg,
                  }}
                  className="px-5 py-2.5 rounded-full text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-black/10 hover:opacity-95 transition"
                >
                  Play Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
