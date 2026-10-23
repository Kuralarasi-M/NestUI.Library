import React, { useState } from "react";
import { Send, ArrowLeft, Radio, Users, ShieldCheck, CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendBroadcastNotification } from "../services/notificationService";
import { getLoggedInUser } from "../services/authServices";

export default function SendNotificationPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<"all" | "admins">("all");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const navigate = useNavigate();
  const currentUser = getLoggedInUser();
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMsg({ type: "error", text: "Please provide both a title and a message." });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await sendBroadcastNotification({
        title: title.trim(),
        message: message.trim(),
        targetAudience,
      });

      setStatusMsg({
        type: "success",
        text: `Success! ${res.message} (${res.recipientsCount} recipient(s) saved in DB and notified via FCM).`,
      });
      setTitle("");
      setMessage("");
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to send broadcast.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--page-bg)", color: "var(--text-primary)" }}
      >
        <div
          className="max-w-md p-8 rounded-3xl border text-center space-y-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <AlertCircle size={48} className="mx-auto text-amber-500" />
          <h2 className="text-xl font-bold">Admin Access Required</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Only users with the <span className="font-semibold">Admin</span> role can broadcast notifications to other members.
          </p>
          <button
            onClick={() => navigate("/")}
            className="rounded-xl px-5 py-2.5 text-xs font-semibold shadow transition"
            style={{ backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }}
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen p-4 sm:p-8"
      style={{
        backgroundColor: "var(--page-bg)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition"
          style={{ color: "var(--link)" }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Page Header */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
            style={{
              backgroundColor: "var(--btn-primary)",
              color: "var(--btn-text)",
            }}
          >
            <Radio size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Broadcast Notification
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
              Send in-app database notifications and live FCM push notifications to members.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border text-xs leading-relaxed ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Broadcast Form Card */}
        <form
          onSubmit={handleSend}
          className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-sm transition"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* Target Audience Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "var(--text-secondary)" }}>
              Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetAudience("all")}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition ${
                  targetAudience === "all" ? "ring-2" : "opacity-85 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "var(--btn-primary)",
                    color: "var(--btn-text)",
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs">All Users (Broadcast)</h4>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    Every registered library member & admin
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience("admins")}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition ${
                  targetAudience === "admins" ? "ring-2" : "opacity-85 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--btn-text)",
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs">Admins Only</h4>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    Staff and library administrators
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label
              htmlFor="notif-title"
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Notification Title
            </label>
            <input
              id="notif-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Classics & Tamil Books Added!"
              required
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label
              htmlFor="notif-msg"
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Message Body
            </label>
            <textarea
              id="notif-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write the message that users will see in their feed and device push notifications..."
              required
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition leading-relaxed"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              • Saves to PostgreSQL database and triggers FCM push
            </span>

            <button
              type="submit"
              disabled={loading || !title.trim() || !message.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow transition hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "var(--btn-primary)",
                color: "var(--btn-text)",
              }}
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
