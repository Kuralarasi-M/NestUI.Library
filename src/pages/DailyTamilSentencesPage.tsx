import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Languages,
  Volume2,
  Sparkles,
  CheckCircle,
  Flame,
  Trophy,
  HelpCircle,
  Check,
  X,
  Shuffle,
  RotateCcw,
  BookOpen,
  ArrowRightLeft,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import {
  getTodayTamilSentences,
  completeDailyReading,
  type DailyTamilSentence,
  type CompleteReadingResponse,
} from "../services/dailyTamilService";

interface DailyTamilSentencesPageProps {
  onOpenMenu?: () => void;
}

interface FillInTheBlankQuiz {
  sentenceWithBlank: string;
  tamilMeaningHint: string;
  correctWord: string;
  options: string[];
}

interface MatchQuestion {
  id: number;
  wordItem: DailyTamilSentence;
  prompt: string;
  promptType: "en-to-ta" | "ta-to-en";
  correctAnswer: string;
  options: string[];
  imageUrl: string;
}

interface MatchReviewItem {
  question: MatchQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

export default function DailyTamilSentencesPage({}: DailyTamilSentencesPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"learn" | "match">("learn");
  const [sentences, setSentences] = useState<DailyTamilSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWordId, setActiveWordId] = useState<number | null>(null);
  const [readWords, setReadWords] = useState<Set<number>>(new Set());
  const [completionResult, setCompletionResult] = useState<CompleteReadingResponse | null>(null);
  const [streakUpdated, setStreakUpdated] = useState(false);

  // Today's storage keys based on date YYYY-MM-DD
  const todayKey = `tamil_daily_read_${new Date().toISOString().slice(0, 10)}`;
  const todayQuizKey = `tamil_daily_quiz_${new Date().toISOString().slice(0, 10)}`;

  // Fill in the blanks quiz state
  const [quiz, setQuiz] = useState<FillInTheBlankQuiz | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);

  // Quick Match state
  const [matchDirection, setMatchDirection] = useState<"en-to-ta" | "ta-to-en" | "random">("random");
  const [matchQuestions, setMatchQuestions] = useState<MatchQuestion[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [selectedMatchAnswer, setSelectedMatchAnswer] = useState<string | null>(null);
  const [isMatchAnswerSubmitted, setIsMatchAnswerSubmitted] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [matchFinished, setMatchFinished] = useState(false);
  const [mistakesList, setMistakesList] = useState<MatchReviewItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getTodayTamilSentences();
        setSentences(data);

        // Check if user already read words today in localStorage
        let savedReadIds: number[] = [];
        try {
          const raw = localStorage.getItem(todayKey);
          if (raw) savedReadIds = JSON.parse(raw);
        } catch {}

        // Check if user already submitted the daily quiz today
        let savedQuizData: { quiz: FillInTheBlankQuiz; selectedOption: string; isCorrect: boolean } | null = null;
        try {
          const rawQuiz = localStorage.getItem(todayQuizKey);
          if (rawQuiz) savedQuizData = JSON.parse(rawQuiz);
        } catch {}

        if (data.length > 0) {
          setActiveWordId(data[0].id);

          const initialSet = new Set<number>(savedReadIds);
          // Always ensure the first word is marked
          initialSet.add(data[0].id);
          setReadWords(initialSet);

          // If all words were already read today, keep the completed stage intact!
          if (initialSet.size >= data.length) {
            setStreakUpdated(true);
            if (savedQuizData) {
              setQuiz(savedQuizData.quiz);
              setSelectedQuizOption(savedQuizData.selectedOption);
              setQuizCorrect(savedQuizData.isCorrect);
              setQuizSubmitted(true);
            } else {
              generateFillInTheBlankQuiz(data);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load daily sentences", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [todayKey, todayQuizKey]);

  const generateFillInTheBlankQuiz = (items: DailyTamilSentence[]) => {
    if (items.length === 0) return;
    // Pick one target sentence randomly
    const targetIdx = Math.floor(Math.random() * items.length);
    const target = items[targetIdx];
    const correctWord = target.word;

    // Replace the target word in its English sentence with "_____" (case-insensitive regex)
    const regex = new RegExp(`\\b${correctWord}\\b`, "i");
    const sentenceWithBlank = target.englishSentence.replace(regex, "_____");

    // Distractor options from the other daily words + alternative vocabulary
    const otherWords = items
      .filter((i) => i.id !== target.id)
      .map((i) => i.word);
    
    // Fallback options if fewer words available
    const fallbackDistractors = ["Gratitude", "Resilience", "Magnificent", "Courage", "Harmony"];
    const pool = [...otherWords, ...fallbackDistractors].filter(
      (w) => w.toUpperCase() !== correctWord.toUpperCase()
    );

    // Shuffle and pick 2 distinct distractors
    const shuffledPool = pool.sort(() => 0.5 - Math.random());
    const distractors = Array.from(new Set(shuffledPool)).slice(0, 2);

    const options = [correctWord, ...distractors].sort(() => 0.5 - Math.random());

    setQuiz({
      sentenceWithBlank,
      tamilMeaningHint: target.tamilMeaning,
      correctWord,
      options,
    });
  };

  const generateQuickMatch = (items: DailyTamilSentence[], direction = matchDirection) => {
    if (items.length === 0) return;

    const questions: MatchQuestion[] = items.map((item, idx) => {
      // Determine question direction
      let promptType: "en-to-ta" | "ta-to-en" = "en-to-ta";
      if (direction === "ta-to-en") {
        promptType = "ta-to-en";
      } else if (direction === "random") {
        promptType = idx % 2 === 0 ? "en-to-ta" : "ta-to-en";
      }

      const prompt = promptType === "en-to-ta" ? item.word : item.tamilMeaning;
      const correctAnswer = promptType === "en-to-ta" ? item.tamilMeaning : item.word;

      // Distractors
      const distractors = items
        .filter((o) => o.id !== item.id)
        .map((o) => (promptType === "en-to-ta" ? o.tamilMeaning : o.word));

      const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
      const allOptions = [correctAnswer, ...shuffledDistractors].sort(() => 0.5 - Math.random());

      // Context-aware Unsplash visual
      const imageUrl = `https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=700&q=80&sig=${encodeURIComponent(
        item.word
      )}`;

      return {
        id: item.id,
        wordItem: item,
        prompt,
        promptType,
        correctAnswer,
        options: allOptions,
        imageUrl,
      };
    });

    setMatchQuestions(questions.sort(() => 0.5 - Math.random()));
    setCurrentMatchIndex(0);
    setSelectedMatchAnswer(null);
    setIsMatchAnswerSubmitted(false);
    setMatchScore(0);
    setMatchFinished(false);
    setMistakesList([]);
  };

  const handleAnswerMatch = (chosen: string) => {
    if (isMatchAnswerSubmitted || !matchQuestions[currentMatchIndex]) return;

    const currQ = matchQuestions[currentMatchIndex];
    setSelectedMatchAnswer(chosen);
    setIsMatchAnswerSubmitted(true);

    const isCorrect = chosen.trim().toLowerCase() === currQ.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      setMatchScore((prev: number) => prev + 1);
    } else {
      setMistakesList((prev: MatchReviewItem[]) => [
        ...prev,
        {
          question: currQ,
          userAnswer: chosen,
          isCorrect: false,
        },
      ]);
    }
  };

  const handleNextMatchQuestion = () => {
    if (currentMatchIndex < matchQuestions.length - 1) {
      setCurrentMatchIndex((prev: number) => prev + 1);
      setSelectedMatchAnswer(null);
      setIsMatchAnswerSubmitted(false);
    } else {
      setMatchFinished(true);
    }
  };

  const handleRestartMatch = () => {
    generateQuickMatch(sentences, matchDirection);
  };

  // When active word changes, add it to read words and check if all 5 are read
  const handleSelectWord = (id: number) => {
    setActiveWordId(id);
    const updated = new Set(readWords);
    updated.add(id);
    setReadWords(updated);
    try {
      localStorage.setItem(todayKey, JSON.stringify(Array.from(updated)));
    } catch {}

    if (sentences.length > 0 && updated.size === sentences.length && !streakUpdated) {
      setStreakUpdated(true);
      generateFillInTheBlankQuiz(sentences);
      completeDailyReading()
        .then((res) => {
          setCompletionResult(res);
        })
        .catch((e) => console.error("Streak sync error", e));
    }
  };

  const handleAnswerQuiz = (chosen: string) => {
    if (quizSubmitted || !quiz) return;
    setSelectedQuizOption(chosen);
    setQuizSubmitted(true);
    const isRight = chosen.toUpperCase() === quiz.correctWord.toUpperCase();
    setQuizCorrect(isRight);

    // Save one-time quiz submission to localStorage
    try {
      localStorage.setItem(
        todayQuizKey,
        JSON.stringify({
          quiz,
          selectedOption: chosen,
          isCorrect: isRight,
        })
      );
    } catch {}
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const activeSentence =
    sentences.find((s) => s.id === activeWordId) || sentences[0];

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Back to Games Menu Button */}
        <button
          onClick={() => navigate("/games")}
          className="mb-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition hover:opacity-85 shadow-xs"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games & Puzzles
        </button>

        {/* Top Banner & Mode Toggle */}
        <div
          className="mb-8 pb-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--accent)" }}
            >
              <Sparkles className="w-4 h-4" /> Daily Vocabulary & Practice (தினசரி 5 வாக்கியங்கள்)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
              <Languages className="w-8 h-8" style={{ color: "var(--accent)" }} /> Daily English - Tamil Hub
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Read 5 contextual words daily, play Quick Match with rich visuals, and review tricky vocabulary.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className="flex p-1.5 rounded-2xl border self-start"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setActiveTab("learn")}
              style={
                activeTab === "learn"
                  ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study 5 Words</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("match");
                if (matchQuestions.length === 0 && sentences.length > 0) {
                  generateQuickMatch(sentences, matchDirection);
                }
              }}
              style={
                activeTab === "match"
                  ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Quick Match Game</span>
            </button>
          </div>
        </div>

        {/* Completion & Streak Award Ribbon */}
        {completionResult && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400">
                  {completionResult.message}
                </h4>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Streak: {completionResult.currentStreak} Day{completionResult.currentStreak > 1 ? "s" : ""} • Longest: {completionResult.longestStreak} Day{completionResult.longestStreak > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {completionResult.pointsEarned > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> +{completionResult.pointsEarned} pts
              </div>
            )}
          </div>
        )}

      {activeTab === "learn" && (
        <>
          {loading ? (
            <div className="py-20 text-center text-slate-500">Loading today's sentences...</div>
      ) : sentences.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No sentences found for today.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 5 Words List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3
                className="text-xs uppercase font-bold tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Today's Words ({readWords.size}/{sentences.length} Read)
              </h3>
              <span className="text-xs font-bold text-emerald-500">
                {readWords.size === sentences.length ? "All Complete! ✨" : `${sentences.length - readWords.size} remaining`}
              </span>
            </div>
            {sentences.map((item, idx) => {
              const isActive = item.id === activeSentence?.id;
              const isRead = readWords.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectWord(item.id)}
                  style={{
                    backgroundColor: isActive ? "var(--btn-primary)" : "var(--surface)",
                    borderColor: isActive ? "var(--btn-primary)" : isRead ? "rgba(16, 185, 129, 0.4)" : "var(--border)",
                    color: isActive ? "var(--btn-text)" : "var(--text-primary)",
                  }}
                  className="w-full p-4 rounded-2xl border text-left transition flex items-center justify-between shadow-xs hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center"
                      style={{
                        backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "var(--surface-secondary)",
                        color: isActive ? "var(--btn-text)" : "var(--text-secondary)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-base flex items-center gap-1.5">
                        {item.word}
                        {isRead && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: isActive ? "var(--btn-text)" : "var(--link)" }}
                      >
                        {item.tamilMeaning}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "var(--surface-secondary)",
                      color: isActive ? "var(--btn-text)" : "var(--text-secondary)",
                    }}
                  >
                    {item.partOfSpeech}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Word & Sentence Card */}
          {activeSentence && (
            <div
              className="lg:col-span-7 border rounded-3xl p-6 sm:p-8 shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* Word Header */}
              <div
                className="flex items-start justify-between pb-6 border-b mb-6"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black">{activeSentence.word}</h2>
                    <button
                      onClick={() => speakText(activeSentence.word)}
                      title="Listen pronunciation"
                      className="p-2 rounded-xl transition hover:opacity-80"
                      style={{
                        backgroundColor: "var(--surface-secondary)",
                        color: "var(--accent)",
                      }}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div
                    className="flex items-center gap-3 mt-1.5 text-xs font-mono"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>{activeSentence.phonetic}</span>
                    <span>•</span>
                    <span className="font-sans font-semibold" style={{ color: "var(--accent)" }}>
                      {activeSentence.partOfSpeech}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs block mb-0.5" style={{ color: "var(--text-secondary)" }}>
                    Tamil Meaning
                  </span>
                  <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                    {activeSentence.tamilMeaning}
                  </span>
                </div>
              </div>

              {/* Scenario Badge */}
              {activeSentence.scenario && (
                <div
                  className="mb-6 p-3 rounded-xl border text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span className="font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                    Context / சூழல்:
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>{activeSentence.scenario}</span>
                </div>
              )}

              {/* English Example Sentence */}
              <div className="mb-6">
                <div
                  className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span>English Sentence:</span>
                  <button
                    onClick={() => speakText(activeSentence.englishSentence)}
                    className="flex items-center gap-1 normal-case font-medium hover:underline"
                    style={{ color: "var(--link)" }}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Speak Sentence
                  </button>
                </div>
                <div
                  className="p-4 rounded-2xl border text-base font-medium leading-relaxed"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  "{activeSentence.englishSentence}"
                </div>
              </div>

              {/* Tamil Meaning Sentence */}
              <div className="mb-8">
                <div
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Tamil Meaning (தமிழ் வாக்கியம்):
                </div>
                <div
                  className="p-4 rounded-2xl border text-base font-medium leading-relaxed"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  "{activeSentence.tamilSentence}"
                </div>
              </div>

              {/* Learning Tip Footer */}
              <div
                className="pt-4 border-t flex items-center justify-between text-xs"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle className="w-4 h-4" /> Daily Word Mastered
                </span>
                <span>Come back tomorrow for 5 new sentences!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fill In The Blanks Quiz Section (Appears once all 5 words are read) */}
      {quiz && readWords.size === sentences.length && (
        <div
          className="mt-8 border rounded-3xl p-6 sm:p-8 shadow-xs animate-in fade-in duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b mb-6 gap-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Daily Check Quiz • Fill in the Blank
                </span>
                <h3 className="text-xl font-black">Test What You Just Learned</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                +25 Bonus Points
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {quizSubmitted ? "Completed for Today ✓" : "1 Attempt Daily"}
              </span>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                Choose the correct missing word to complete the sentence:
              </p>
              <div
                className="p-5 rounded-2xl border text-lg sm:text-xl font-semibold leading-relaxed tracking-wide"
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                "{quiz.sentenceWithBlank}"
              </div>
              <p className="text-xs mt-2 italic" style={{ color: "var(--accent)" }}>
                Hint (பொருள்): {quiz.tamilMeaningHint}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quiz.options.map((opt) => {
                const isSelected = selectedQuizOption === opt;
                const isCorrectWord = opt.toUpperCase() === quiz.correctWord.toUpperCase();

                let btnBg = "var(--surface)";
                let btnBorder = "var(--border)";
                let btnText = "var(--text-primary)";

                if (quizSubmitted) {
                  if (isCorrectWord) {
                    btnBg = "rgba(16, 185, 129, 0.2)";
                    btnBorder = "#10B981";
                    btnText = "#10B981";
                  } else if (isSelected && !isCorrectWord) {
                    btnBg = "rgba(239, 68, 68, 0.2)";
                    btnBorder = "#EF4444";
                    btnText = "#EF4444";
                  }
                } else if (isSelected) {
                  btnBg = "var(--btn-primary)";
                  btnBorder = "var(--btn-primary)";
                  btnText = "var(--btn-text)";
                }

                return (
                  <button
                    key={opt}
                    disabled={quizSubmitted}
                    onClick={() => handleAnswerQuiz(opt)}
                    style={{
                      backgroundColor: btnBg,
                      borderColor: btnBorder,
                      color: btnText,
                    }}
                    className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all ${
                      quizSubmitted ? "cursor-default" : "hover:scale-[1.02] shadow-xs"
                    }`}
                  >
                    <span>{opt}</span>
                    {quizSubmitted && isCorrectWord && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {quizSubmitted && isSelected && !isCorrectWord && <X className="w-4 h-4 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {quizSubmitted && (
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold ${
                  quizCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                }`}
              >
                <div>
                  {quizCorrect ? (
                    <div>
                      🎉 Perfect! You mastered how <span className="underline">{quiz.correctWord}</span> is used in real sentences.
                    </div>
                  ) : (
                    <div>
                      Nice try! The correct word was <span className="underline">{quiz.correctWord}</span>.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}

      {/* QUICK MATCH GAME TAB */}
      {activeTab === "match" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div
            className="p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-500">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Quick Match Settings</h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Choose match direction or practice in reverse
                </p>
              </div>
            </div>

            {/* Direction Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Mode:</span>
              {(["random", "en-to-ta", "ta-to-en"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => {
                    setMatchDirection(dir);
                    generateQuickMatch(sentences, dir);
                  }}
                  style={{
                    backgroundColor: matchDirection === dir ? "var(--btn-primary)" : "var(--surface-secondary)",
                    color: matchDirection === dir ? "var(--btn-text)" : "var(--text-secondary)",
                    borderColor: "var(--border)",
                  }}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold transition capitalize hover:opacity-90"
                >
                  {dir === "random" && "Shuffle Both 🔀"}
                  {dir === "en-to-ta" && "English ➔ Tamil"}
                  {dir === "ta-to-en" && "Tamil ➔ English"}
                </button>
              ))}
            </div>
          </div>

          {!matchFinished && matchQuestions.length > 0 && (
            <div
              className="border rounded-3xl p-6 sm:p-9 shadow-xs space-y-6"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* Question Progress Header */}
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider" style={{ color: "var(--accent)" }}>
                    Question {currentMatchIndex + 1} of {matchQuestions.length}
                  </span>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {matchQuestions[currentMatchIndex].promptType === "en-to-ta"
                      ? "Match the English word to its correct Tamil meaning"
                      : "தமிழ் பொருளுக்குரிய ஆங்கில வார்த்தையைத் தேர்ந்தெடுக்கவும்"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    Score: {matchScore}/{matchQuestions.length}
                  </span>
                </div>
              </div>

              {/* Question Body with Visual Image */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Visual Representation Image */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full h-48 sm:h-56 rounded-3xl overflow-hidden border relative shadow-md" style={{ borderColor: "var(--border)" }}>
                    <img
                      src={matchQuestions[currentMatchIndex].imageUrl}
                      alt={matchQuestions[currentMatchIndex].prompt}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                    <div className="absolute bottom-2 left-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-xs text-[10px] text-white font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Context Visual
                    </div>
                  </div>
                </div>

                {/* Prompt & Pronunciation */}
                <div className="md:col-span-7 space-y-5">
                  <div
                    className="p-6 rounded-3xl border flex items-center justify-between"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-secondary)" }}>
                        {matchQuestions[currentMatchIndex].promptType === "en-to-ta" ? "English Word" : "Tamil Meaning"}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black mt-1">
                        {matchQuestions[currentMatchIndex].prompt}
                      </h2>
                      {matchQuestions[currentMatchIndex].wordItem.phonetic && (
                        <div className="text-xs font-mono mt-1" style={{ color: "var(--accent)" }}>
                          {matchQuestions[currentMatchIndex].wordItem.phonetic}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => speakText(matchQuestions[currentMatchIndex].wordItem.word)}
                      title="Pronounce word"
                      className="p-3 rounded-2xl transition hover:opacity-80 shadow-xs"
                      style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--accent)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchQuestions[currentMatchIndex].options.map((opt) => {
                      const isSelected = selectedMatchAnswer === opt;
                      const isCorrect = opt.trim().toLowerCase() === matchQuestions[currentMatchIndex].correctAnswer.trim().toLowerCase();

                      let btnBg = "var(--surface)";
                      let btnBorder = "var(--border)";
                      let btnColor = "var(--text-primary)";

                      if (isMatchAnswerSubmitted) {
                        if (isCorrect) {
                          btnBg = "rgba(16, 185, 129, 0.2)";
                          btnBorder = "#10B981";
                          btnColor = "#10B981";
                        } else if (isSelected && !isCorrect) {
                          btnBg = "rgba(239, 68, 68, 0.2)";
                          btnBorder = "#EF4444";
                          btnColor = "#EF4444";
                        }
                      } else if (isSelected) {
                        btnBg = "var(--btn-primary)";
                        btnBorder = "var(--btn-primary)";
                        btnColor = "var(--btn-text)";
                      }

                      return (
                        <button
                          key={opt}
                          disabled={isMatchAnswerSubmitted}
                          onClick={() => handleAnswerMatch(opt)}
                          style={{
                            backgroundColor: btnBg,
                            borderColor: btnBorder,
                            color: btnColor,
                          }}
                          className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all ${
                            isMatchAnswerSubmitted ? "cursor-default" : "hover:scale-[1.02] shadow-xs"
                          }`}
                        >
                          <span className="text-left">{opt}</span>
                          {isMatchAnswerSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                          {isMatchAnswerSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sentence Context & Next Button */}
                  {isMatchAnswerSubmitted && (
                    <div className="space-y-4 pt-2">
                      <div
                        className="p-4 rounded-2xl border text-xs space-y-1"
                        style={{
                          backgroundColor: "var(--surface-secondary)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="font-bold" style={{ color: "var(--accent)" }}>Example Context:</div>
                        <p className="font-medium">"{matchQuestions[currentMatchIndex].wordItem.englishSentence}"</p>
                        <p style={{ color: "var(--text-secondary)" }}>"{matchQuestions[currentMatchIndex].wordItem.tamilSentence}"</p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleNextMatchQuestion}
                          style={{
                            backgroundColor: "var(--btn-primary)",
                            color: "var(--btn-text)",
                          }}
                          className="px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition hover:opacity-90"
                        >
                          {currentMatchIndex < matchQuestions.length - 1 ? "Next Word ➔" : "View Results & Review ➔"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results & Mistakes Review Screen */}
          {matchFinished && (
            <div
              className="border rounded-3xl p-6 sm:p-9 shadow-xs space-y-6 text-center animate-in fade-in"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-lg">
                {matchScore === matchQuestions.length ? "🏆" : "🎯"}
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>
                  Quick Match Complete
                </span>
                <h2 className="text-2xl font-black mt-2">
                  {matchScore === matchQuestions.length ? "Flawless Vocabulary Master!" : "Great Practice Session!"}
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  You scored {matchScore} out of {matchQuestions.length} correct words!
                </p>
              </div>

              {/* Review of Incorrectly Answered Words */}
              <div className="text-left space-y-4 max-w-2xl mx-auto pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <h4 className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--text-secondary)" }}>
                  {mistakesList.length > 0 ? `Review Mistakes (${mistakesList.length} to practice)` : "No mistakes! Everything was correct ✨"}
                </h4>

                {mistakesList.length > 0 && (
                  <div className="space-y-3">
                    {mistakesList.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border space-y-2"
                        style={{
                          backgroundColor: "var(--surface-secondary)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{m.question.wordItem.word}</span>
                          <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>
                            {m.question.wordItem.phonetic}
                          </span>
                        </div>
                        <div className="text-xs flex items-center gap-2">
                          <span className="text-rose-500 line-through">Your choice: {m.userAnswer}</span>
                          <span>•</span>
                          <span className="text-emerald-500 font-bold">Correct: {m.question.correctAnswer}</span>
                        </div>
                        <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
                          "{m.question.wordItem.englishSentence}" ({m.question.wordItem.tamilMeaning})
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={handleRestartMatch}
                    style={{
                      backgroundColor: "var(--btn-primary)",
                      color: "var(--btn-text)",
                    }}
                    className="px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition hover:opacity-90"
                  >
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <button
                    onClick={() => setActiveTab("learn")}
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                    }}
                    className="px-6 py-3 rounded-2xl border font-bold text-xs transition hover:opacity-80"
                  >
                    Back to Study Mode
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </main>
  );
}
