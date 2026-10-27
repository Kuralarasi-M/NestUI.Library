import { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  Award,
  Star,
  Users,
  Menu,
} from "lucide-react";
import {
  getLeaderboard,
  getUserGamificationStats,
  type LeaderboardEntry,
  type UserGamificationStats,
} from "../services/quizService";
import { getLoggedInUser } from "../services/authServices";

interface LeaderboardPageProps {
  onOpenMenu?: () => void;
}

export default function LeaderboardPage({ onOpenMenu }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<UserGamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"points" | "streaks">("points");

  const loggedUser = getLoggedInUser();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [boardData, userStats] = await Promise.all([
          getLeaderboard(50),
          getUserGamificationStats().catch(() => null),
        ]);
        setLeaderboard(boardData);
        setStats(userStats);
      } catch (err) {
        console.error("Failed to load leaderboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const sortedBoard = [...leaderboard].sort((a, b) => {
    if (tab === "streaks") return b.currentStreak - a.currentStreak;
    return b.totalPoints - a.totalPoints;
  });

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div
          className="flex items-center justify-between mb-8 pb-4 border-b gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-start gap-3">
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                aria-label="Open navigation menu"
                className="lg:hidden p-2.5 rounded-2xl border transition hover:opacity-80 shrink-0 shadow-xs mt-0.5"
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
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-500" /> Leaderboard & Achievements
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Compete with fellow readers, maintain your daily streaks, and earn badges.
              </p>
            </div>
          </div>
        </div>

        {/* User Stats Card Banner */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div
              className="border rounded-3xl p-5 shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: "var(--accent)" }}>
                <Star className="w-5 h-5 fill-current" />
                <span className="text-xs uppercase font-bold tracking-wider">Your Total Points</span>
              </div>
              <div className="text-3xl font-black">{stats.totalPoints.toLocaleString()}</div>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Earn points by finishing readings and quizzes
              </p>
            </div>

            <div
              className="border rounded-3xl p-5 shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-orange-500">
                <Flame className="w-5 h-5" />
                <span className="text-xs uppercase font-bold tracking-wider">Active Streak</span>
              </div>
              <div className="text-3xl font-black text-orange-500">{stats.currentStreak} Days</div>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Longest: <span className="font-semibold">{stats.longestStreak} Days</span>
                {stats.longestStreakStartDate && (
                  <span className="block text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    ({new Date(stats.longestStreakStartDate).toLocaleDateString()} to{" "}
                    {stats.longestStreakEndDate ? new Date(stats.longestStreakEndDate).toLocaleDateString() : "present"})
                  </span>
                )}
              </p>
            </div>

            <div
              className="border rounded-3xl p-5 shadow-xs"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-amber-500">
                <Award className="w-5 h-5" />
                <span className="text-xs uppercase font-bold tracking-wider">Badges Earned</span>
              </div>
              <div className="text-3xl font-black text-amber-500">
                {stats.badges.filter((b) => b.isUnlocked).length} / {stats.badges.length}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Unlock badges through reading consistency
              </p>
            </div>
          </div>
        )}

      {/* Badges Showcase Section */}
      {stats && stats.badges.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: "var(--accent)" }} /> Reading Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.badges.map((b) => (
              <div
                key={b.id}
                style={{
                  backgroundColor: b.isUnlocked ? "var(--surface)" : "var(--surface-secondary)",
                  borderColor: "var(--border)",
                  opacity: b.isUnlocked ? 1 : 0.5,
                }}
                className="p-4 rounded-2xl border text-center transition shadow-xs"
              >
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    color: "var(--accent)",
                  }}
                >
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold truncate">{b.name}</h4>
                <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  {b.description}
                </p>
                {b.isUnlocked && (
                  <span className="inline-block mt-2 text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    Unlocked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Table Section */}
      <div
        className="border rounded-3xl p-6 shadow-xs"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: "var(--accent)" }} /> Community Rankings
          </h2>

          <div
            className="flex p-1 rounded-xl self-start border"
            style={{
              backgroundColor: "var(--surface-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <button
              onClick={() => setTab("points")}
              style={
                tab === "points"
                  ? {
                      backgroundColor: "var(--btn-primary)",
                      color: "var(--btn-text)",
                    }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Top Points
            </button>
            <button
              onClick={() => setTab("streaks")}
              style={
                tab === "streaks"
                  ? {
                      backgroundColor: "var(--btn-primary)",
                      color: "var(--btn-text)",
                    }
                  : { color: "var(--text-secondary)" }
              }
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Longest Streaks
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center" style={{ color: "var(--text-secondary)" }}>
            Loading rankings...
          </div>
        ) : sortedBoard.length === 0 ? (
          <div className="py-12 text-center" style={{ color: "var(--text-secondary)" }}>
            No ranked users yet. Be the first!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="border-b text-xs uppercase"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <th className="pb-3 px-4">Rank</th>
                  <th className="pb-3 px-4">Reader</th>
                  <th className="pb-3 px-4">Current Streak</th>
                  <th className="pb-3 px-4">Longest Streak</th>
                  <th className="pb-3 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--border)" }}
              >
                {sortedBoard.map((entry, idx) => {
                  const isCurrent = loggedUser?.userId === entry.userId;
                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        backgroundColor: isCurrent ? "var(--surface-secondary)" : undefined,
                      }}
                      className="transition hover:opacity-90"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold" style={{ color: "var(--text-secondary)" }}>
                        {idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : `#${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-4 flex items-center gap-2">
                        <span className="font-medium">{entry.name}</span>
                        {isCurrent && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: "var(--btn-primary)",
                              color: "var(--btn-text)",
                            }}
                          >
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-orange-500 font-medium">
                        🔥 {entry.currentStreak} Days
                      </td>
                      <td className="py-3.5 px-4" style={{ color: "var(--text-secondary)" }}>
                        {entry.longestStreak} Days
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-500">
                        ⭐ {entry.totalPoints.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
