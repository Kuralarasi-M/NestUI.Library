import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Sparkles,
  Globe2,
  Menu,
} from "lucide-react";
import { AVAILABLE_GENRES } from "../components/GenrePickerModal";
import { type QuizQuestion } from "../services/quizService";
import { getProgressiveQuizLevel, QUIZ_REGIONS } from "../services/bookQuizLevelService";
import QuizModal from "../components/QuizModal";

interface RandomChallengePageProps {
  onOpenMenu?: () => void;
}

export default function RandomChallengePage({ onOpenMenu }: RandomChallengePageProps) {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const saved = localStorage.getItem("book_quiz_level");
    return saved ? Math.max(1, parseInt(saved, 10)) : 1;
  });
  const [selectedRegion, setSelectedRegion] = useState<string>(() => {
    return localStorage.getItem("book_quiz_region") || "india";
  });
  const [selectedGenre, setSelectedGenre] = useState<string>("Fiction");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizOpen, setQuizOpen] = useState(false);

  const handleRegionChange = (regId: string) => {
    setSelectedRegion(regId);
    try {
      localStorage.setItem("book_quiz_region", regId);
    } catch {}
  };

  const startChallenge = async (levelToLoad = currentLevel, regionToUse = selectedRegion) => {
    setLoading(true);
    try {
      const quizData = await getProgressiveQuizLevel(levelToLoad, regionToUse);
      setQuestions(quizData.questions);
      setQuizOpen(true);
    } catch (err) {
      console.error("Failed to start challenge", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextLevel = () => {
    const nextLvl = currentLevel + 1;
    setCurrentLevel(nextLvl);
    try {
      localStorage.setItem("book_quiz_level", nextLvl.toString());
    } catch {}
    startChallenge(nextLvl, selectedRegion);
  };

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back to Games Menu & Mobile Navigation Bar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/games")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition hover:opacity-85 shadow-xs"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Games & Puzzles
          </button>

          {onOpenMenu && (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl border transition hover:opacity-80 shadow-xs flex items-center gap-1.5 text-xs font-bold"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <Menu size={18} />
              <span>Menu</span>
            </button>
          )}
        </div>

        <div
          className="mb-8 pb-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-500" /> Book Quiz Challenge
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Customized by Country & Region. Fun, accessible questions with endless progressive levels!
            </p>
          </div>

          {/* Level Progress Pill */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-xs shrink-0"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Current Stage
              </div>
              <div className="text-base font-black">
                Level {currentLevel}
              </div>
            </div>
          </div>
        </div>

        <div
          className="border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* Step 1: Select Country / Region (Default: India) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label
                className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                <span>1</span> Choose Country / Region
              </label>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5"
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <Globe2 className="w-3.5 h-3.5 text-amber-500" />
                Default: India (🇮🇳)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUIZ_REGIONS.map((reg) => {
                const isSelected = selectedRegion === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleRegionChange(reg.id)}
                    style={{
                      backgroundColor: isSelected ? "var(--btn-primary)" : "var(--surface-secondary)",
                      borderColor: isSelected ? "var(--btn-primary)" : "var(--border)",
                      color: isSelected ? "var(--btn-text)" : "var(--text-primary)",
                    }}
                    className="p-4 rounded-2xl border text-left transition shadow-xs flex items-start gap-3.5 group hover:opacity-95"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{reg.flag}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm flex items-center gap-2">
                        {reg.name}
                        {reg.id === "india" && (
                          <span
                            className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "var(--btn-primary)",
                              color: isSelected ? "#fff" : "var(--btn-text)",
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs mt-1 leading-relaxed line-clamp-2"
                        style={{ opacity: isSelected ? 0.9 : 0.7 }}
                      >
                        {reg.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Pick Genre */}
          <div>
            <label
              className="text-sm font-bold uppercase tracking-wider block mb-3 flex items-center gap-2"
              style={{ color: "var(--accent)" }}
            >
              <span>2</span> Select Topic / Genre
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_GENRES.map((g) => {
                const active = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGenre(g.id)}
                    style={{
                      backgroundColor: active ? "var(--btn-primary)" : "var(--surface-secondary)",
                      borderColor: active ? "var(--btn-primary)" : "var(--border)",
                      color: active ? "var(--btn-text)" : "var(--text-primary)",
                    }}
                    className="p-3.5 rounded-2xl border text-left transition flex items-center gap-3 shadow-xs"
                  >
                    <span className="text-xl">{g.icon}</span>
                    <span className="text-sm font-semibold">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        {/* Step 3: Difficulty Selection */}
        <div>
          <label
            className="text-sm font-bold uppercase tracking-wider block mb-3 flex items-center gap-2"
            style={{ color: "var(--accent)" }}
          >
            <span>3</span> Choose Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDifficulty("easy")}
              style={{
                backgroundColor: difficulty === "easy" ? "var(--btn-primary)" : "var(--surface-secondary)",
                borderColor: difficulty === "easy" ? "var(--btn-primary)" : "var(--border)",
                color: difficulty === "easy" ? "var(--btn-text)" : "var(--text-primary)",
              }}
              className="p-4 rounded-2xl border text-center transition shadow-xs"
            >
              <h4 className="font-bold text-base">Easy</h4>
              <p className="text-xs mt-1" style={{ opacity: 0.85 }}>+10 pts per question</p>
            </button>

            <button
              type="button"
              onClick={() => setDifficulty("medium")}
              style={{
                backgroundColor: difficulty === "medium" ? "var(--btn-primary)" : "var(--surface-secondary)",
                borderColor: difficulty === "medium" ? "var(--btn-primary)" : "var(--border)",
                color: difficulty === "medium" ? "var(--btn-text)" : "var(--text-primary)",
              }}
              className="p-4 rounded-2xl border text-center transition shadow-xs"
            >
              <h4 className="font-bold text-base">Medium</h4>
              <p className="text-xs mt-1" style={{ opacity: 0.85 }}>+20 pts per question</p>
            </button>

            <button
              type="button"
              onClick={() => setDifficulty("hard")}
              style={{
                backgroundColor: difficulty === "hard" ? "var(--btn-primary)" : "var(--surface-secondary)",
                borderColor: difficulty === "hard" ? "var(--btn-primary)" : "var(--border)",
                color: difficulty === "hard" ? "var(--btn-text)" : "var(--text-primary)",
              }}
              className="p-4 rounded-2xl border text-center transition shadow-xs"
            >
              <h4 className="font-bold text-base">Hard</h4>
              <p className="text-xs mt-1" style={{ opacity: 0.85 }}>+30 pts per question</p>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div
          className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Ready for <strong>Level {currentLevel}</strong> • {QUIZ_REGIONS.find((r) => r.id === selectedRegion)?.name}</span>
          </div>
          <button
            type="button"
            onClick={() => startChallenge(currentLevel, selectedRegion)}
            disabled={loading}
            style={{
              backgroundColor: "var(--btn-primary)",
              color: "var(--btn-text)",
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-md hover:opacity-90"
          >
            {loading ? "Preparing Questions..." : `Play Level ${currentLevel} Challenge`}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <QuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        questions={questions}
        genre={selectedGenre}
        difficulty={difficulty}
        isDailyRead={false}
        currentLevel={currentLevel}
        onNextLevel={handleNextLevel}
      />
      </div>
    </main>
  );
}
