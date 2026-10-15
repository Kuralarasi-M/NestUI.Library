
import {
  BookOpen,
  LayoutDashboard,
  Compass,
  Heart,
  History,
  Search,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/history", label: "Reading History", icon: History },
  { to: "/search-history", label: "Search History", icon: Search },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
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
          border-r border-slate-200 bg-white p-5
          transition-transform duration-300
          dark:border-white/10 dark:bg-gray-900
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <div className="mb-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <BookOpen size={24} />
            </div>
            <span className="text-lg font-bold">BookNest</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Your Library
        </p>

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
          <BookOpen className="mb-2 text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold">Your next chapter awaits.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Discover a new book today.
          </p>
        </div>
      </aside>
    </>
  );
}
