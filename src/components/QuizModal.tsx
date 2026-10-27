import { useState } from "react";
import {
  Trophy,
  Flame,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  type QuizQuestion,
  submitQuiz,
  type QuizSubmitResponse,
} from "../services/quizService";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  bookId?: number;
  genre: string;
  difficulty: "easy" | "medium" | "hard";
  isDailyRead?: boolean;
  currentLevel?: number;
  onNextLevel?: () => void;
  onCompleted?: (result: QuizSubmitResponse) => void;
}

export default function QuizModal({
  isOpen,
  onClose,
  questions,
  bookId,
  genre,
  difficulty,
  isDailyRead = false,
  currentLevel,
  onNextLevel,
  onCompleted,
}: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const correctCount = calculateScore();

    try {
      const res = await submitQuiz({
        bookId,
        category: genre,
        difficulty,
        totalQuestions: total,
        correctAnswers: correctCount,
        isDailyRead,
      });

      setResult(res);
      setSubmitted(true);
      if (onCompleted) {
        onCompleted(res);
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isDailyRead ? "Daily Reading Quiz" : `${genre} Quiz`}
              </h3>
              <p className="text-xs text-slate-400 capitalize">
                Level: <span className="text-amber-400 font-semibold">{difficulty}</span> •{" "}
                {total} Questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {!submitted ? (
          <div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>Question {currentIndex + 1} of {total}</span>
              <span className="text-indigo-400 font-medium">{genre}</span>
            </div>

            <h4 className="text-base sm:text-lg font-semibold text-slate-100 min-h-14 mb-6 leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80"
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

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {isLast ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || selectedAnswers[currentIndex] === undefined}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  {submitting ? "Submitting..." : "Submit Answers"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedAnswers[currentIndex] === undefined}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Result Screen */
          <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
              <Trophy className="w-12 h-12" />
            </div>

            <h3 className="text-2xl font-black text-white mb-1">Quiz Completed!</h3>
            <p className="text-slate-400 text-sm mb-6">
              You scored {calculateScore()} out of {total} correct answers
            </p>

            {/* Stats Earned Box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">Points Earned</span>
                <span className="text-xl font-bold text-amber-400">+{result?.pointsEarned || 0}</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl">
                <span className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Current Streak
                </span>
                <span className="text-xl font-bold text-orange-400">{result?.currentStreak || 0} Days</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400 block mb-1">Total Points</span>
                <span className="text-xl font-bold text-indigo-400">{result?.totalPoints || 0}</span>
              </div>
            </div>

            {/* Badges notification */}
            {result?.newBadgesUnlocked && result.newBadgesUnlocked.length > 0 && (
              <div className="bg-indigo-950/60 border border-indigo-700/60 p-4 rounded-2xl mb-6 text-left flex items-start gap-3">
                <Award className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-white">New Badge Unlocked!</h5>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {result.newBadgesUnlocked.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
              {onNextLevel && (
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onNextLevel();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  Play Level {(currentLevel || 1) + 1} ⚡ <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
