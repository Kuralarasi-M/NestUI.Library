
import {
  BookOpen,
  LayoutDashboard,
  X,
  LogIn,
  LogOut,
  Send,
  Trophy,
  Gamepad2,
  Bookmark,
  Bell,
  Cpu,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLoggedInUser, logoutUser, type LoginResponse } from "../services/authServices";
import { removeFcmToken } from "../services/fcmService";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to?: string;
  label: string;
  icon: any;
  badge?: "Existing" | "New" | "Later";
  disabled?: boolean;
}

const baseLinks: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Library", icon: BookOpen },
  { to: "/daily-tech", label: "Latest Tech Updates", icon: Cpu, badge: "New" },
  { to: "/games", label: "Games & Puzzles", icon: Gamepad2 },
  { to: "/leaderboard", label: "Leaderboard & Badges", icon: Trophy },
  { to: "/my-library", label: "My Library", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(getLoggedInUser);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
  }, [open]);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  const links = isAdmin
    ? [...baseLinks, { to: "/admin/broadcast", label: "Send Broadcast", icon: Send }]
    : baseLinks;

  function handleLogout() {
    if (currentUser?.userId) {
      removeFcmToken(currentUser.userId).catch(() => {});
    }
    logoutUser();
    setCurrentUser(null);
    navigate("/login");
  }
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r p-5 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
      >
        <div className="mb-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="rounded-xl p-2"
              style={{ backgroundColor: "var(--btn-primary)", color: "var(--btn-text)" }}
            >
              <BookOpen size={24} />
            </div>
            <span className="text-lg font-bold tracking-tight">BookNest</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 hover:opacity-80 transition lg:hidden"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={20} />
          </button>
        </div>

        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          Your Library
        </p>

        <nav className="space-y-1">
          {links.map((item, idx) => {
            const { to, label, icon: Icon, badge, disabled } = item;

            if (disabled || !to) {
              return (
                <div
                  key={label + idx}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-500 opacity-60 cursor-not-allowed select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span className="text-[11px] font-medium text-slate-500">
                      {badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={to + label + idx}
                to={to}
                end={to === "/"}
                onClick={onClose}
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: "var(--btn-primary)",
                        color: "var(--btn-text)",
                      }
                    : {}
                }
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "shadow-sm font-semibold"
                      : "hover:opacity-90"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span
                    className={`text-[11px] font-medium ${
                      badge === "New"
                        ? "text-sky-400 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: "var(--surface-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <BookOpen
              className="mb-2"
              size={20}
              style={{ color: "var(--accent)" }}
            />
            <p className="text-sm font-semibold">Public Domain Library</p>
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Non-copyright public domain books alone are available here to read.
            </p>
          </div>

          {currentUser ? (
            <div
              className="flex items-center justify-between rounded-xl border p-3"
              style={{
                backgroundColor: "var(--surface-secondary)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "var(--btn-primary)",
                    color: "var(--btn-text)",
                  }}
                >
                  {currentUser.role?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="truncate text-xs">
                  <p className="font-semibold truncate">{currentUser.role || "Member"}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Active</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="rounded-lg p-1.5 hover:opacity-80 transition"
                style={{ color: "var(--text-secondary)" }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
              style={{
                backgroundColor: "var(--btn-primary)",
                color: "var(--btn-text)",
              }}
            >
              <LogIn size={16} />
              Log In
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
