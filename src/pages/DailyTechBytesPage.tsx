import { useEffect, useState } from "react";
import {
  Cpu,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  ExternalLink,
  Clock,
  Tag,
  RefreshCw,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchLiveTechArticles,
  generateTechQuiz,
  type TechArticle,
  type TechQuizQuestion,
} from "../services/techNewsService";
import { submitQuiz, type QuizSubmitResponse } from "../services/quizService";

interface DailyTechBytesPageProps {
  onOpenMenu?: () => void;
}

export default function DailyTechBytesPage({ onOpenMenu }: DailyTechBytesPageProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"news" | "quiz">("news");
  const [articles, setArticles] = useState<TechArticle[]>([]);
  const [selectedArticleIndex, setSelectedArticleIndex] = useState(0);
  const [questions, setQuestions] = useState<TechQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const fetchedArticles = await fetchLiveTechArticles();
      setArticles(fetchedArticles);
      setSelectedArticleIndex(0);
      const generatedQ = generateTechQuiz(fetchedArticles);
      setQuestions(generatedQ);
      // Reset quiz status
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setSubmitted(false);
      setResult(null);
    } catch (err) {
      console.error("Failed to load live tech bytes", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectOption = (optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQIndex]: optIdx });
  };

  const handleNextQ = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handlePrevQ = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) correct++;
    });

    try {
      const res = await submitQuiz({
        category: "Technology",
        difficulty: "medium",
        totalQuestions: questions.length,
        correctAnswers: correct,
        isDailyRead: true, // Counts toward daily streak!
      });
      setResult(res);
      setSubmitted(true);
    } catch (e) {
      console.error("Failed to submit daily tech quiz", e);
    } finally {
      setSubmitting(false);
    }
  };

  const activeArticle = articles[selectedArticleIndex] || articles[0];
  const currentQ = questions[currentQIndex];

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner Header */}
        <div
          className="pb-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-start gap-3">
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                aria-label="Open navigation menu"
                className="lg:hidden p-2.5 rounded-2xl border transition hover:opacity-80 shrink-0 shadow-xs mt-1"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Menu size={22} />
              </button>
            )}
            <div>
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--accent)" }}
              >
                <Cpu className="w-4 h-4" /> Live Tech Feed & Daily Streak
              </div>
              <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
                <Sparkles className="w-8 h-8" style={{ color: "var(--accent)" }} /> Daily Tech Bytes
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Read live industry updates from Developer & Hacker communities, or take today&apos;s comprehension quiz!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Header Mode Switcher Tabs */}
            <div
              className="flex p-1.5 rounded-2xl border"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <button
                onClick={() => setViewMode("news")}
                style={
                  viewMode === "news"
                    ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                    : { color: "var(--text-secondary)" }
                }
                className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Cpu className="w-3.5 h-3.5" /> Tech Articles
              </button>
              <button
                onClick={() => setViewMode("quiz")}
                style={
                  viewMode === "quiz"
                    ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                    : { color: "var(--text-secondary)" }
                }
                className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Daily Tech Quiz ({questions.length} Qs)
              </button>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition hover:opacity-80"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              title="Refresh Live Tech Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3" style={{ color: "var(--text-secondary)" }}>
            <Cpu className="w-10 h-10 mx-auto animate-pulse" style={{ color: "var(--accent)" }} />
            <p className="font-semibold text-sm">Fetching real-time technology updates...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center" style={{ color: "var(--text-secondary)" }}>
            No technology updates available right now. Please refresh.
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === "news" ? (
              <>
                {/* Top Stories Selector Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-xs font-bold uppercase tracking-wider shrink-0 mr-2" style={{ color: "var(--text-secondary)" }}>
                    Today&apos;s Highlights:
                  </span>
                  {articles.map((art, idx) => (
                    <button
                      key={art.id}
                      onClick={() => setSelectedArticleIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                        selectedArticleIndex === idx
                          ? "shadow-sm"
                          : "hover:opacity-80"
                      }`}
                      style={
                        selectedArticleIndex === idx
                          ? {
                              backgroundColor: "var(--btn-primary)",
                              color: "var(--btn-text)",
                              borderColor: "transparent",
                            }
                          : {
                              backgroundColor: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      #{idx + 1} {art.tags[0] || art.source}
                    </button>
                  ))}
                </div>

                {/* Featured Article Card */}
                <div
                  className="border rounded-3xl p-6 sm:p-9 shadow-xs transition"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                          style={{
                            backgroundColor: "var(--surface-secondary)",
                            borderColor: "var(--border)",
                            color: "var(--accent)",
                          }}
                        >
                          {activeArticle.source}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Clock className="w-3.5 h-3.5" /> ~{activeArticle.readingTime || 3} min read
                        </span>
                        {activeArticle.publishedAt && (
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            • {activeArticle.publishedAt}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                        {activeArticle.title}
                      </h2>

                      <p
                        className="text-sm sm:text-base leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {activeArticle.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {activeArticle.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
                            style={{
                              backgroundColor: "var(--surface-secondary)",
                              borderColor: "var(--border)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <Tag className="w-3 h-3 opacity-60" /> {t}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="pt-4 flex flex-wrap items-center gap-3">
                        <a
                          href={activeArticle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: "var(--btn-primary)",
                            color: "var(--btn-text)",
                          }}
                          className="px-5 py-2.5 rounded-xl font-bold text-xs transition inline-flex items-center gap-2 hover:opacity-90 shadow-sm"
                        >
                          Read Full Article <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setViewMode("quiz")}
                          style={{
                            backgroundColor: "var(--surface-secondary)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                          }}
                          className="px-5 py-2.5 rounded-xl border font-bold text-xs transition inline-flex items-center gap-2 hover:opacity-90"
                        >
                          <HelpCircle className="w-4 h-4" style={{ color: "var(--accent)" }} /> Take Daily Quiz ({questions.length} Qs)
                        </button>
                      </div>
                    </div>

                    {activeArticle.coverImage && (
                      <div className="w-full lg:w-72 shrink-0">
                        <img
                          src={activeArticle.coverImage}
                          alt={activeArticle.title}
                          className="w-full h-48 lg:h-52 object-cover rounded-2xl border shadow-sm"
                          style={{ borderColor: "var(--border)" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Daily Tech Comprehension Quiz Section (Shown when Quiz tab in header is clicked) */
              <div
                id="tech-quiz-section"
                className="border rounded-3xl p-6 sm:p-9 shadow-xs"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
              <div
                className="flex items-center justify-between pb-5 border-b mb-6"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="p-3 rounded-2xl border"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--accent)",
                    }}
                  >
                    <HelpCircle className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-xl">Daily Tech Comprehension Quiz</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      Answer today&apos;s 3 questions to earn <span className="font-bold text-amber-500">+100 Points</span> & keep your streak!
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex text-xs font-bold px-3 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  Streak Verified 🔥
                </span>
              </div>

              {questions.length === 0 ? (
                <div className="py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                  Generating quiz from today&apos;s updates...
                </div>
              ) : !submitted ? (
                <div>
                  {/* Progress bar */}
                  <div
                    className="w-full h-2 rounded-full mb-6 overflow-hidden"
                    style={{ backgroundColor: "var(--surface-secondary)" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentQIndex + 1) / questions.length) * 100}%`,
                        backgroundColor: "var(--accent)",
                      }}
                    />
                  </div>

                  <div
                    className="flex justify-between items-center text-xs mb-3 font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>Question {currentQIndex + 1} of {questions.length}</span>
                    <span style={{ color: "var(--accent)" }}>Tech Knowledge</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold min-h-14 mb-6 leading-relaxed">
                    {currentQ?.question}
                  </h4>

                  <div className="space-y-3 mb-8">
                    {currentQ?.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[currentQIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between ${
                            isSelected ? "shadow-sm scale-[1.005]" : "hover:opacity-90"
                          }`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: "var(--surface-secondary)",
                                  borderColor: "var(--accent)",
                                  color: "var(--text-primary)",
                                }
                              : {
                                  backgroundColor: "var(--input-bg)",
                                  borderColor: "var(--border)",
                                  color: "var(--text-primary)",
                                }
                          }
                        >
                          <span className="text-sm font-semibold pr-3">{option}</span>
                          <span
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                              isSelected
                                ? "font-bold text-white shadow-sm"
                                : "text-transparent"
                            }`}
                            style={
                              isSelected
                                ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)" }
                                : { borderColor: "var(--border)" }
                            }
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <button
                      type="button"
                      onClick={handlePrevQ}
                      disabled={currentQIndex === 0}
                      className="px-4 py-2 rounded-xl text-xs font-bold border transition hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Previous
                    </button>

                    {currentQIndex === questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        disabled={submitting || selectedAnswers[currentQIndex] === undefined}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition disabled:opacity-40"
                        style={{ backgroundColor: "#10B981" }}
                      >
                        {submitting ? "Submitting..." : "Submit & Keep Streak 🔥"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQ}
                        disabled={selectedAnswers[currentQIndex] === undefined}
                        style={{
                          backgroundColor: "var(--btn-primary)",
                          color: "var(--btn-text)",
                        }}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-200">
                  <div
                    className="inline-flex p-4 rounded-3xl border mb-4 shadow-sm"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--accent)",
                    }}
                  >
                    <Trophy className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black mb-1">Daily Tech Bytes Cleared!</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                    You successfully read today&apos;s tech feed, answered the quiz, and advanced your daily streak.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
                    <div
                      className="border p-4 rounded-2xl"
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
                        Points Earned
                      </span>
                      <span className="text-xl font-bold text-amber-500">
                        +{result?.pointsEarned || 100}
                      </span>
                    </div>

                    <div
                      className="border p-4 rounded-2xl"
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
                        Current Streak
                      </span>
                      <span className="text-xl font-bold text-orange-500">
                        {result?.currentStreak || 1} Days 🔥
                      </span>
                    </div>

                    <div
                      className="border p-4 rounded-2xl col-span-2 sm:col-span-1"
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
                        Total Points
                      </span>
                      <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>
                        {result?.totalPoints || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/leaderboard")}
                      style={{
                        backgroundColor: "var(--btn-primary)",
                        color: "var(--btn-text)",
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition hover:opacity-90"
                    >
                      View Leaderboard & Badges
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/games")}
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                      className="px-6 py-2.5 rounded-xl border text-xs font-bold transition hover:opacity-90"
                    >
                      Back to Games Hub
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
