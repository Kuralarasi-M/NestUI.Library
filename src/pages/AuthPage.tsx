import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, User, ArrowRight, LoaderCircle, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser, saveLoggedInUser } from "../services/authServices";
import { syncFcmToken } from "../services/fcmService";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password || (isRegister && !userName)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await registerUser({ userName, email, password });
        if (res.success === false) {
          setError(res.message || "Registration failed.");
        } else {
          setSuccessMsg("Account created! Please log in.");
          if (res.userId) {
            syncFcmToken(res.userId).catch(() => {});
          }
          setIsRegister(false);
          setPassword("");
        }
      } else {
        const res = await loginUser({ email, password });
        if (res.isSucess === false || res.success === false) {
          setError(res.message || "Invalid credentials.");
        } else {
          saveLoggedInUser(res);
          if (res.userId) {
            syncFcmToken(res.userId).catch(() => {});
          }
          navigate("/");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 transition-colors dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-all dark:border-white/10 dark:bg-gray-900">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <BookOpen size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isRegister ? "Join BookNest" : "Welcome Back"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isRegister
              ? "Create your reader account to start reading"
              : "Sign in to access your library and saved books"}
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Jane Austen"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@booknest.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <>
                {isRegister ? "Create Account" : "Sign In"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                }}
                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                }}
                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Create one
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
