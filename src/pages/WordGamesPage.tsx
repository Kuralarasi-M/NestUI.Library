import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Puzzle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  getSentenceBuilderGames,
  getGuessTheWordGames,
  getWordSearchGame,
  getUserWordGameProgress,
  submitGameScore,
  type SentenceBuilderGame,
  type GuessTheWordGame,
  type WordSearchGame,
} from "../services/wordGamesService";

interface WordGamesPageProps {
  onOpenMenu?: () => void;
}

export default function WordGamesPage({}: WordGamesPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "sentence" | "guess" | "search") || "sentence";
  const [activeTab, setActiveTab] = useState<"sentence" | "guess" | "search">(
    ["sentence", "guess", "search"].includes(initialTab) ? initialTab : "sentence"
  );

  // Game 1: Sentence Builder
  const [sentenceGames, setSentenceGames] = useState<SentenceBuilderGame[]>([]);
  const [sbIndex, setSbIndex] = useState(0);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [sbSuccess, setSbSuccess] = useState(false);
  const [sbError, setSbError] = useState(false);

  // Game 2: Guess the Word
  const [guessGames, setGuessGames] = useState<GuessTheWordGame[]>([]);
  const [gwIndex, setGwIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [userGuess, setUserGuess] = useState("");
  const [gwSuccess, setGwSuccess] = useState(false);
  const [gwError, setGwError] = useState(false);

  // Game 3: Word Search
  const STAGES = ["literature", "nature", "science"];
  const [searchGame, setSearchGame] = useState<WordSearchGame | null>(null);
  const [searchTheme, setSearchTheme] = useState("literature");
  const [stageLevel, setStageLevel] = useState(1);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<{ r: number; c: number }[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Feedback points
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Initial Games
  useEffect(() => {
    async function initGames() {
      try {
        setLoading(true);
        // Load user progress first to get their saved Word Search stage
        const progress = await getUserWordGameProgress().catch(() => ({ wordSearchStage: 1, totalPoints: 0 }));
        const currentSavedStage = progress?.wordSearchStage && progress.wordSearchStage > 0 ? progress.wordSearchStage : 1;
        setStageLevel(currentSavedStage);
        
        const initialTheme = STAGES[(currentSavedStage - 1) % STAGES.length];
        setSearchTheme(initialTheme);

        const [sentences, guesses, wSearch] = await Promise.all([
          getSentenceBuilderGames(),
          getGuessTheWordGames(),
          getWordSearchGame(initialTheme, currentSavedStage),
        ]);
        setSentenceGames(sentences);
        if (sentences.length > 0) {
          setAvailableWords([...sentences[0].scrambledWords]);
        }
        setGuessGames(guesses);
        setSearchGame(wSearch);
      } catch (err) {
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    }
    initGames();
  }, []);

  // --- Sentence Builder Handlers ---
  const currentSentenceGame = sentenceGames[sbIndex];

  const handlePickWord = (word: string, index: number) => {
    setPlacedWords([...placedWords, word]);
    const updated = [...availableWords];
    updated.splice(index, 1);
    setAvailableWords(updated);
    setSbError(false);
  };

  const handleRemovePlacedWord = (word: string, index: number) => {
    const updated = [...placedWords];
    updated.splice(index, 1);
    setPlacedWords(updated);
    setAvailableWords([...availableWords, word]);
    setSbError(false);
  };

  const handleCheckSentence = async () => {
    if (!currentSentenceGame) return;
    const constructed = placedWords.join(" ").trim().toLowerCase();
    const target = currentSentenceGame.targetSentence.trim().toLowerCase();

    if (constructed === target) {
      setSbSuccess(true);
      setSbError(false);
      setPointsAwarded(currentSentenceGame.points);
      await submitGameScore("sentence-builder", currentSentenceGame.points, currentSentenceGame.targetSentence).catch(() => {});
    } else {
      setSbError(true);
    }
  };

  const handleNextSentence = () => {
    const nextIdx = (sbIndex + 1) % sentenceGames.length;
    setSbIndex(nextIdx);
    setPlacedWords([]);
    setAvailableWords([...sentenceGames[nextIdx].scrambledWords]);
    setSbSuccess(false);
    setSbError(false);
    setPointsAwarded(null);
  };

  const handleResetSentence = () => {
    if (!currentSentenceGame) return;
    setPlacedWords([]);
    setAvailableWords([...currentSentenceGame.scrambledWords]);
    setSbSuccess(false);
    setSbError(false);
  };

  // --- Guess The Word Handlers ---
  const currentGuessGame = guessGames[gwIndex];

  const handleCheckGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuessGame || !userGuess.trim()) return;

    if (userGuess.trim().toUpperCase() === currentGuessGame.word.toUpperCase()) {
      setGwSuccess(true);
      setGwError(false);
      // Points penalty per hint used: e.g. 50 - (hints * 10)
      const points = Math.max(20, currentGuessGame.basePoints - revealedHints * 10);
      setPointsAwarded(points);
      await submitGameScore("guess-word", points, currentGuessGame.word).catch(() => {});
    } else {
      setGwError(true);
    }
  };

  const handleNextGuess = () => {
    const nextIdx = (gwIndex + 1) % guessGames.length;
    setGwIndex(nextIdx);
    setUserGuess("");
    setRevealedHints(0);
    setGwSuccess(false);
    setGwError(false);
    setPointsAwarded(null);
  };

  // --- Word Search Handlers ---
  const triggerConfettiEffect = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  const handleCellClick = (r: number, c: number) => {
    if (!searchGame) return;
    const exists = selectedCells.some((cell) => cell.r === r && cell.c === c);
    let newSelected: { r: number; c: number }[];

    if (exists) {
      newSelected = selectedCells.filter((cell) => !(cell.r === r && cell.c === c));
    } else {
      newSelected = [...selectedCells, { r: r, c: c }];
    }
    setSelectedCells(newSelected);

    // Form word from selected cells
    const formed = newSelected.map((cell) => searchGame.grid[cell.r][cell.c]).join("");
    const matchedWord = searchGame.wordsToFind.find(
      (w) => w === formed || w === formed.split("").reverse().join("")
    );

    if (matchedWord && !foundWords.includes(matchedWord)) {
      const nextFound = [...foundWords, matchedWord];
      setFoundWords(nextFound);
      // Persist the matched cells so they stay highlighted in green
      setFoundCells((prev) => [...prev, ...newSelected]);
      setSelectedCells([]);

      // Check if entire puzzle is complete
      if (nextFound.length === searchGame.wordsToFind.length) {
        setPointsAwarded(searchGame.points);
        setShowCelebration(true);
        triggerConfettiEffect();
        // Submit score and save user stage in backend
        submitGameScore("word-search", searchGame.points, `${searchGame.theme} - Stage ${stageLevel}`, stageLevel)
          .then((res) => {
            if (res && res.wordSearchStage) {
              // Update local stage to the newly reached stage if higher
              setStageLevel(res.wordSearchStage);
            }
          })
          .catch(() => {});
      }
    }
  };

  const handleChangeSearchTheme = async (theme: string, newLevel?: number) => {
    setSearchTheme(theme);
    const targetStage = newLevel ?? stageLevel;
    if (newLevel) setStageLevel(newLevel);
    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells([]);
    setShowCelebration(false);
    setPointsAwarded(null);
    try {
      const g = await getWordSearchGame(theme, targetStage);
      setSearchGame(g);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextStage = () => {
    const nextLevel = stageLevel + 1;
    const nextTheme = STAGES[(nextLevel - 1) % STAGES.length];
    handleChangeSearchTheme(nextTheme, nextLevel);
  };

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

        {/* Header */}
        <div
          className="mb-8 pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--accent)" }}
            >
              <Sparkles className="w-4 h-4" /> Interactive Language Arena
            </div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
              <Puzzle className="w-8 h-8" style={{ color: "var(--accent)" }} /> Word Games & Puzzles
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Practise grammar, guess mystery vocabulary, and solve word search grids to earn points.
            </p>
          </div>

          {/* Game Mode Tabs */}
          <div
            className="flex p-1.5 rounded-2xl border self-start"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => {
                setActiveTab("sentence");
                setPointsAwarded(null);
              }}
              style={
                activeTab === "sentence"
                  ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              7. Sentence Builder
            </button>
            <button
              onClick={() => {
                setActiveTab("guess");
                setPointsAwarded(null);
              }}
              style={
                activeTab === "guess"
                  ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              6. Guess the Word
            </button>
            <button
              onClick={() => {
                setActiveTab("search");
                setPointsAwarded(null);
              }}
              style={
                activeTab === "search"
                  ? { backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              5. Word Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center" style={{ color: "var(--text-secondary)" }}>
            Loading game challenge...
          </div>
        ) : (
          <div>
            {/* ---------------- 7. SENTENCE BUILDER ---------------- */}
            {activeTab === "sentence" && currentSentenceGame && (
              <div
                className="border rounded-3xl p-6 sm:p-9 shadow-xs space-y-6"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>
                      Grammar & Syntax • #{sbIndex + 1}
                    </span>
                    <h3 className="text-xl font-bold mt-1">Arrange the words in the correct order</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      Theme: <span className="font-semibold">{currentSentenceGame.theme}</span> • +{currentSentenceGame.points} points
                    </p>
                  </div>

                  <button
                    onClick={handleResetSentence}
                    className="p-2.5 rounded-xl border transition hover:opacity-80 flex items-center gap-1.5 text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>

                {/* Construction Box */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Your Sentence:
                  </span>
                  <div
                    className="min-h-20 p-4 rounded-2xl border flex flex-wrap items-center gap-2"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: sbError ? "#EF4444" : sbSuccess ? "#10B981" : "var(--border)",
                    }}
                  >
                    {placedWords.length === 0 ? (
                      <span className="text-sm italic" style={{ color: "var(--text-secondary)" }}>
                        Click on the words below to form the sentence...
                      </span>
                    ) : (
                      placedWords.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRemovePlacedWord(word, idx)}
                          style={{
                            backgroundColor: "var(--btn-primary)",
                            color: "var(--btn-text)",
                          }}
                          className="px-3.5 py-2 rounded-xl text-sm font-semibold shadow-xs transition hover:scale-105"
                          title="Click to remove"
                        >
                          {word} ✕
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Scrambled Word Pool */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Available Words:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {availableWords.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePickWord(word, idx)}
                        style={{
                          backgroundColor: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                        className="px-4 py-2.5 rounded-xl border text-sm font-semibold transition hover:scale-105 shadow-xs"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clue / Hint */}
                {currentSentenceGame.hint && (
                  <div
                    className="p-3.5 rounded-xl border text-xs flex items-center gap-2"
                    style={{
                      backgroundColor: "var(--surface-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                    <span>Hint: {currentSentenceGame.hint}</span>
                  </div>
                )}

                {/* Status Banners */}
                {sbSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold text-sm">Correct sentence! +{pointsAwarded} points added.</span>
                    </div>
                    <button
                      onClick={handleNextSentence}
                      style={{
                        backgroundColor: "var(--btn-primary)",
                        color: "var(--btn-text)",
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-90 flex items-center gap-1.5"
                    >
                      Next Sentence <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {sbError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
                    Not quite right yet. Try rearranging the words!
                  </div>
                )}

                {/* Action Footer */}
                {!sbSuccess && (
                  <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={handleCheckSentence}
                      disabled={placedWords.length === 0}
                      style={{
                        backgroundColor: "var(--btn-primary)",
                        color: "var(--btn-text)",
                      }}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-40 hover:opacity-90"
                    >
                      Verify Sentence
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 6. GUESS THE WORD ---------------- */}
            {activeTab === "guess" && currentGuessGame && (
              <div
                className="border rounded-3xl p-6 sm:p-9 shadow-xs space-y-6"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>
                      Vocabulary Challenge • #{gwIndex + 1}
                    </span>
                    <h3 className="text-xl font-bold mt-1">Guess the Mystery Word</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      Word Length: <span className="font-semibold">{currentGuessGame.word.length} letters</span> • Part of Speech: {currentGuessGame.partOfSpeech}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      Max Points: +{currentGuessGame.basePoints}
                    </span>
                  </div>
                </div>

                {/* Definition Box */}
                <div
                  className="p-5 rounded-2xl border text-base font-medium leading-relaxed"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--accent)" }}>
                    Definition / Clue:
                  </span>
                  "{currentGuessGame.definition}"
                </div>

                {/* Progressive Hints */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                      Hints ({revealedHints}/{currentGuessGame.clues.length}):
                    </span>
                    {revealedHints < currentGuessGame.clues.length && !gwSuccess && (
                      <button
                        type="button"
                        onClick={() => setRevealedHints(revealedHints + 1)}
                        className="text-xs font-bold hover:underline"
                        style={{ color: "var(--link)" }}
                      >
                        + Reveal Hint (-10 pts)
                      </button>
                    )}
                  </div>

                  {revealedHints === 0 ? (
                    <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
                      No hints revealed yet. Guess directly for maximum points!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {currentGuessGame.clues.slice(0, revealedHints).map((clue, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border text-xs flex items-center gap-2"
                          style={{
                            backgroundColor: "var(--surface-secondary)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <HelpCircle className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                          <span>{clue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Form */}
                {!gwSuccess ? (
                  <form onSubmit={handleCheckGuess} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={userGuess}
                        onChange={(e) => {
                          setUserGuess(e.target.value);
                          setGwError(false);
                        }}
                        placeholder={`Type your guess (${currentGuessGame.word.length} letters)...`}
                        className="w-full p-4 rounded-2xl border text-base font-semibold outline-hidden uppercase tracking-wider"
                        style={{
                          backgroundColor: "var(--input-bg)",
                          borderColor: gwError ? "#EF4444" : "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                      {gwError && (
                        <p className="text-xs font-medium text-rose-500 mt-2">
                          Incorrect guess! Try revealing a hint or try another word.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="submit"
                        disabled={!userGuess.trim()}
                        style={{
                          backgroundColor: "var(--btn-primary)",
                          color: "var(--btn-text)",
                        }}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-40 hover:opacity-90"
                      >
                        Submit Guess
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-base">Brilliant! The word was {currentGuessGame.word}.</h4>
                      <p className="text-xs mt-0.5">You earned +{pointsAwarded} points!</p>
                    </div>
                    <button
                      onClick={handleNextGuess}
                      style={{
                        backgroundColor: "var(--btn-primary)",
                        color: "var(--btn-text)",
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-90 flex items-center gap-1.5"
                    >
                      Next Word <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 5. WORD SEARCH ---------------- */}
            {activeTab === "search" && searchGame && (
              <div
                className="border rounded-3xl p-6 sm:p-9 shadow-xs space-y-6"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-4" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>
                        Stage {searchGame.stage || stageLevel} • Letter Grid
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        style={{
                          backgroundColor: "var(--surface-secondary)",
                          borderColor: "var(--accent)",
                          color: "var(--accent)",
                        }}
                      >
                        Stage {searchGame.stage || stageLevel}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        style={{
                          backgroundColor:
                            searchGame.difficulty === "Easy"
                              ? "rgba(16, 185, 129, 0.15)"
                              : searchGame.difficulty === "Medium"
                              ? "rgba(59, 130, 246, 0.15)"
                              : searchGame.difficulty === "Hard"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                          borderColor:
                            searchGame.difficulty === "Easy"
                              ? "#10B981"
                              : searchGame.difficulty === "Medium"
                              ? "#3B82F6"
                              : searchGame.difficulty === "Hard"
                              ? "#F59E0B"
                              : "#EF4444",
                          color:
                            searchGame.difficulty === "Easy"
                              ? "#10B981"
                              : searchGame.difficulty === "Medium"
                              ? "#3B82F6"
                              : searchGame.difficulty === "Hard"
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      >
                        {searchGame.difficulty || "Easy"} • {searchGame.gridSize}×{searchGame.gridSize}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mt-1 capitalize">Word Search: {searchGame.theme}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      {searchGame.difficulty === "Easy" && "Horizontal word search • Great for warmups!"}
                      {searchGame.difficulty === "Medium" && "Horizontal & Vertical words • Increased grid challenge!"}
                      {(searchGame.difficulty === "Hard" || searchGame.difficulty === "Master") &&
                        "Horizontal, Vertical & Diagonal words • Master level vocabulary!"}
                    </p>
                  </div>

                  {/* Theme Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Theme:</span>
                    {STAGES.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleChangeSearchTheme(t)}
                        style={{
                          backgroundColor: searchTheme === t ? "var(--btn-primary)" : "var(--surface-secondary)",
                          color: searchTheme === t ? "var(--btn-text)" : "var(--text-secondary)",
                          borderColor: "var(--border)",
                        }}
                        className="px-3 py-1.5 rounded-xl border text-xs font-bold capitalize transition hover:opacity-90"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Grid */}
                  <div className="md:col-span-8 flex justify-center">
                    <div
                      className="grid gap-1.5 p-3 rounded-2xl border shadow-inner"
                      style={{
                        gridTemplateColumns: `repeat(${searchGame.gridSize}, minmax(0, 1fr))`,
                        backgroundColor: "var(--surface-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {searchGame.grid.map((row, rIdx) =>
                        row.map((letter, cIdx) => {
                          const isSelected = selectedCells.some(
                            (c) => c.r === rIdx && c.c === cIdx
                          );
                          const isAlreadyFound = foundCells.some(
                            (c) => c.r === rIdx && c.c === cIdx
                          );
                          return (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              onClick={() => handleCellClick(rIdx, cIdx)}
                              style={{
                                backgroundColor: isSelected
                                  ? "var(--btn-primary)"
                                  : isAlreadyFound
                                  ? "rgba(16, 185, 129, 0.25)"
                                  : "var(--surface)",
                                color: isSelected
                                  ? "var(--btn-text)"
                                  : isAlreadyFound
                                  ? "#10B981"
                                  : "var(--text-primary)",
                                borderColor: isAlreadyFound
                                  ? "#10B981"
                                  : isSelected
                                  ? "var(--accent)"
                                  : "var(--border)",
                              }}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border text-xs sm:text-sm font-black flex items-center justify-center transition-all ${
                                isSelected ? "scale-105 shadow-md" : "hover:scale-105"
                              } ${isAlreadyFound ? "animate-pulse" : ""}`}
                            >
                              {letter}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Words Checklist */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                        Target Words ({foundWords.length}/{searchGame.wordsToFind.length})
                      </h4>
                      <span className="text-xs font-bold text-emerald-500">
                        {Math.round((foundWords.length / (searchGame.wordsToFind.length || 1)) * 100)}% Complete
                      </span>
                    </div>

                    <div className="space-y-2">
                      {searchGame.wordsToFind.map((word) => {
                        const isFound = foundWords.includes(word);
                        return (
                          <div
                            key={word}
                            style={{
                              backgroundColor: isFound ? "rgba(16, 185, 129, 0.15)" : "var(--surface-secondary)",
                              borderColor: isFound ? "#10B981" : "var(--border)",
                              color: isFound ? "#10B981" : "var(--text-primary)",
                            }}
                            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                              isFound ? "scale-[1.02] shadow-sm" : ""
                            }`}
                          >
                            <span className={isFound ? "line-through font-extrabold tracking-wider" : "tracking-wide"}>
                              {word}
                            </span>
                            {isFound && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {foundWords.length === searchGame.wordsToFind.length && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          <span>Stage {stageLevel} Complete! +{searchGame.points} pts</span>
                        </div>
                        <button
                          onClick={handleNextStage}
                          style={{
                            backgroundColor: "var(--btn-primary)",
                            color: "var(--btn-text)",
                          }}
                          className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition hover:opacity-95"
                        >
                          Next Stage / Next Puzzle <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Celebration Level-Up Modal Overlay */}
                {showCelebration && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
                    <div
                      className="border rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative"
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-lg">
                        🎉
                      </div>

                      <div className="space-y-1.5">
                        <span
                          className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border"
                          style={{
                            backgroundColor: "var(--surface-secondary)",
                            borderColor: "var(--accent)",
                            color: "var(--accent)",
                          }}
                        >
                          Stage {stageLevel} Cleared!
                        </span>
                        <h2 className="text-2xl font-black mt-2">Magnificent Word Master!</h2>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          You found all {searchGame.wordsToFind.length} words in the {searchGame.theme} puzzle!
                        </p>
                      </div>

                      <div
                        className="p-4 rounded-2xl border flex items-center justify-around"
                        style={{
                          backgroundColor: "var(--surface-secondary)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div>
                          <div className="text-xl font-black text-emerald-500">+{searchGame.points}</div>
                          <div className="text-[10px] uppercase font-bold" style={{ color: "var(--text-secondary)" }}>Points Earned</div>
                        </div>
                        <div className="w-px h-8" style={{ backgroundColor: "var(--border)" }} />
                        <div>
                          <div className="text-xl font-black" style={{ color: "var(--accent)" }}>Stage {stageLevel + 1}</div>
                          <div className="text-[10px] uppercase font-bold" style={{ color: "var(--text-secondary)" }}>Next Unlocked</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCelebration(false)}
                          style={{
                            backgroundColor: "var(--surface-secondary)",
                            color: "var(--text-primary)",
                            borderColor: "var(--border)",
                          }}
                          className="flex-1 py-3 rounded-2xl border font-bold text-xs transition hover:opacity-80"
                        >
                          View Board
                        </button>
                        <button
                          onClick={handleNextStage}
                          style={{
                            backgroundColor: "var(--btn-primary)",
                            color: "var(--btn-text)",
                          }}
                          className="flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition hover:opacity-90"
                        >
                          Play Next Stage <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confetti Animation Elements */}
                {showConfetti && (
                  <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
                    {Array.from({ length: 45 }).map((_, i) => {
                      const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];
                      const randomColor = colors[i % colors.length];
                      const randomLeft = `${(i * 2.3) % 100}%`;
                      const randomDelay = `${(i % 10) * 0.25}s`;
                      const randomDuration = `${2.5 + (i % 5) * 0.4}s`;
                      return (
                        <div
                          key={i}
                          className="confetti-piece"
                          style={{
                            left: randomLeft,
                            backgroundColor: randomColor,
                            animationDelay: randomDelay,
                            animationDuration: randomDuration,
                          }}
                        />
                      );
                    })}
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
