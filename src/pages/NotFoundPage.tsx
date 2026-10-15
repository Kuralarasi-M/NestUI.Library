import { Link } from "react-router-dom";
import { Ghost, Library, Sparkles, BookOpen, Compass } from "lucide-react";

interface NotFoundPageProps {
  onOpenMenu?: () => void;
}

export default function NotFoundPage({ onOpenMenu }: NotFoundPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center text-slate-800 transition-colors dark:bg-gray-950 dark:text-slate-100">
      {/* Icon cluster */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-100/80 shadow-inner dark:bg-amber-950/40">
          <Library size={48} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="absolute -top-2 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
          <Ghost size={20} className="animate-pulse" />
        </div>
      </div>

      {/* 404 Header */}
      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
        <Sparkles size={14} />
        <span>Shelf Not Found • Error 404</span>
      </div>

      {/* Short Funny Punchline */}
      <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
        Shhh! A book ghost stole this page.
      </h1>

      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        Even the librarian can&apos;t find this chapter in our stacks!
      </p>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
        >
          <BookOpen size={18} />
          Return to Library
        </Link>

        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/15 dark:bg-gray-900 dark:text-slate-200 dark:hover:bg-white/10 lg:hidden"
          >
            <Compass size={18} />
            Explore Menu
          </button>
        )}
      </div>
    </div>
  );
}
