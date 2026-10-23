import { useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw, Sparkles, UserPlus, Radio, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "../services/notificationService";
import { getLoggedInUser } from "../services/authServices";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUser = getLoggedInUser();
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const list = await getMyNotifications();
      setNotifications(list);
    } catch (err: any) {
      if (err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
        navigate("/login");
        return;
      }
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleMarkRead(id: number) {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.warn("Error marking read:", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn("Error marking all read:", err);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition"
              style={{ color: "var(--link)" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "var(--surface)",
                  color: "var(--accent)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Bell size={22} />
              </div>
              Notifications
              {unreadCount > 0 && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: "var(--btn-primary)",
                    color: "var(--btn-text)",
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              Stay updated with library announcements, broadcasts, and system updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {isAdmin && (
              <button
                onClick={() => navigate("/admin/broadcast")}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition hover:opacity-90 flex items-center gap-1.5"
                style={{
                  backgroundColor: "var(--btn-primary)",
                  color: "var(--btn-text)",
                }}
              >
                <Radio size={14} /> Send Broadcast
              </button>
            )}

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="rounded-xl border px-3.5 py-2 text-xs font-semibold transition hover:opacity-90 flex items-center gap-1.5"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}

            <button
              onClick={loadData}
              title="Refresh notifications"
              className="rounded-xl border p-2 hover:opacity-80 transition"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        {loading && (
          <div className="py-20 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading notifications...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-4 text-red-700 dark:bg-red-950/30 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-center"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <Bell size={48} className="mb-3 opacity-40" style={{ color: "var(--text-secondary)" }} />
            <h3 className="text-base font-semibold">You&apos;re all caught up!</h3>
            <p className="mt-1 max-w-sm text-xs" style={{ color: "var(--text-secondary)" }}>
              No notifications right now. New announcements and alerts will appear here.
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div
            className="rounded-3xl border overflow-hidden shadow-sm divide-y"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {notifications.map((item) => {
              const isRegisterAlert = item.title.toLowerCase().includes("user registered");

              return (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkRead(item.id)}
                  className={`flex items-start justify-between gap-4 p-4 sm:p-5 transition cursor-pointer hover:opacity-95 ${
                    !item.isRead ? "font-medium" : "opacity-85"
                  }`}
                  style={{
                    backgroundColor: !item.isRead ? "var(--surface-secondary)" : "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: isRegisterAlert ? "rgba(16, 185, 129, 0.15)" : "rgba(0, 71, 171, 0.15)",
                        color: isRegisterAlert ? "#10B981" : "var(--accent)",
                      }}
                    >
                      {isRegisterAlert ? <UserPlus size={19} /> : <Sparkles size={19} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{item.title}</h4>
                        {!item.isRead && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "var(--accent)" }}
                          />
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {item.message}
                      </p>
                      <span className="mt-2 block text-[10px]" style={{ color: "var(--text-secondary)" }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(item.id);
                      }}
                      className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold border hover:opacity-80 transition"
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--link)",
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
