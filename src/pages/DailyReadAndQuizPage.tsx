import { useEffect, useState } from "react";
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
} from "lucide-react";
import {
  getAllBooks,
  getBookDetails,
  type Book,
  type BookDetails,
} from "../services/bookService";
import {
  getQuizQuestions,
  submitQuiz,
  type QuizQuestion,
  type QuizSubmitResponse,
} from "../services/quizService";
import { useNavigate } from "react-router-dom";

interface DailyReadAndQuizPageProps {
  onOpenMenu?: () => void;
}

export default function DailyReadAndQuizPage({}: DailyReadAndQuizPageProps) {
  const navigate = useNavigate();
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  useEffect(() => {
    async function loadDailyFeatured() {
      try {
        setLoading(true);
        const books = await getAllBooks();
        if (books && books.length > 0) {
          // Deterministic daily pick
          const day = new Date().getDate();
          const selected = books[day % books.length];
          setFeaturedBook(selected);

          const details = await getBookDetails(selected.gutendexId || selected.id);
          setBookDetails(details);

          // Preload daily quiz
          const q = await getQuizQuestions("Books", "medium", 5);
          setQuestions(q);
        }
      } catch (err) {
        console.error("Failed to load daily read", err);
      } finally {
        setLoading(false);
      }
    }
    loadDailyFeatured();
  }, []);

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: idx });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) correct++;
    });

    try {
      const res = await submitQuiz({
        bookId: featuredBook?.id,
        category: "Books",
        difficulty: "medium",
        totalQuestions: questions.length,
        correctAnswers: correct,
        isDailyRead: true,
      });
      setResult(res);
      setSubmitted(true);
    } catch (e) {
      console.error("Failed to submit daily quiz", e);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Banner Header */}
        <div
          className="mb-8 pb-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--accent)" }}
          >
            <Sparkles className="w-4 h-4" /> Daily Habit & Challenge
          </div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <BookOpen className="w-8 h-8" style={{ color: "var(--accent)" }} /> Daily Read & Quiz
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Complete today's short reading and answer 5 quiz questions to advance your reading streak!
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center" style={{ color: "var(--text-secondary)" }}>
            Loading today's featured read...
          </div>
        ) : !featuredBook ? (
          <div className="py-20 text-center" style={{ color: "var(--text-secondary)" }}>
            No featured read available today.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Daily Featured Story / Excerpt Card */}
            <div
              className="border rounded-3xl p-6 sm:p-8 shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {featuredBook.coverImage && (
                  <img
                    src={featuredBook.coverImage}
                    alt={featuredBook.title}
                    className="w-36 h-52 object-cover rounded-2xl shadow-md border shrink-0 mx-auto md:mx-0"
                    style={{ borderColor: "var(--border)" }}
                  />
                )}

                <div className="flex-1">
                  <span
                    className="text-xs uppercase font-bold tracking-wider"
                    style={{ color: "var(--accent)" }}
                  >
                    Today's Story Selection
                  </span>
                  <h2 className="text-2xl font-bold mt-1 mb-2">{featuredBook.title}</h2>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    By {featuredBook.author}
                  </p>

                  <p className="text-sm leading-relaxed mb-6 line-clamp-4" style={{ color: "var(--text-primary)" }}>
                    {bookDetails?.summaries?.[0] ||
                      featuredBook.summary ||
                      "Immerse yourself in today's featured classic story. Read through the opening excerpt and take the comprehension quiz below."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate(`/read/${featuredBook.gutendexId || featuredBook.id}`)}
                      style={{
                        backgroundColor: "var(--btn-primary)",
                        color: "var(--btn-text)",
                      }}
                      className="px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 hover:opacity-90 shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Open Full Book
                    </button>
                    <button
                      onClick={() => {
                        const quizEl = document.getElementById("daily-quiz-section");
                        quizEl?.scrollIntoView({ behavior: "smooth" });
                      }}
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border)",
                      }}
                      className="px-5 py-2.5 rounded-xl border font-bold text-xs transition flex items-center gap-2 hover:opacity-90"
                    >
                      <HelpCircle className="w-4 h-4" style={{ color: "var(--accent)" }} /> Take Today's Quiz (5 Questions)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Quiz Section */}
            <div
              id="daily-quiz-section"
              className="border rounded-3xl p-6 sm:p-8 shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <HelpCircle className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-bold text-lg text-white">Daily Comprehension Quiz</h3>
                  <p className="text-xs text-slate-400">
                    Earn up to <span className="text-amber-400 font-bold">+125 points</span> and extend your streak!
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full">
                Daily Streak Eligible 🔥
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="py-8 text-center text-slate-500">Loading daily quiz...</div>
            ) : !submitted ? (
              <div>
                {/* Progress */}
                <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                  <span className="text-indigo-400 font-semibold">{currentQ?.category}</span>
                </div>

                <h4 className="text-base sm:text-lg font-semibold text-slate-100 min-h-14 mb-6 leading-relaxed">
                  {currentQ?.question}
                </h4>

                <div className="space-y-3 mb-8">
                  {currentQ?.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                            : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <span className="text-sm font-medium">{option}</span>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                            isSelected
                              ? "border-indigo-400 bg-indigo-600 text-white"
                              : "border-slate-600 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {currentIndex === questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting || selectedAnswers[currentIndex] === undefined}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit & Keep Streak 🔥"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={selectedAnswers[currentIndex] === undefined}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 flex items-center gap-2"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                  <Trophy className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Daily Quiz Completed!</h3>
                <p className="text-slate-400 text-sm mb-6">
                  You successfully earned points and preserved your reading streak today.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
                  <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
                    <span className="text-xs text-slate-400 block mb-1">Points Earned</span>
                    <span className="text-xl font-bold text-amber-400">+{result?.pointsEarned || 0}</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
                    <span className="text-xs text-slate-400 block mb-1">Current Streak</span>
                    <span className="text-xl font-bold text-orange-400">{result?.currentStreak || 0} Days</span>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                    <span className="text-xs text-slate-400 block mb-1">Total Points</span>
                    <span className="text-xl font-bold text-indigo-400">{result?.totalPoints || 0}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/leaderboard")}
                  style={{
                    backgroundColor: "var(--btn-primary)",
                    color: "var(--btn-text)",
                  }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition hover:opacity-90"
                >
                  View Leaderboard & Badges
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
