export default function TechUpdateSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-3xl border p-5 sm:p-6 animate-pulse flex flex-col sm:flex-row items-start gap-5"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* Skeleton Icon */}
          <div className="w-14 h-14 rounded-2xl bg-slate-300 dark:bg-slate-700/60 shrink-0" />

          {/* Skeleton Body */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-16 h-5 rounded-full bg-slate-300 dark:bg-slate-700/60" />
                <div className="w-20 h-5 rounded-full bg-slate-300 dark:bg-slate-700/60" />
              </div>
              <div className="w-16 h-4 rounded bg-slate-300 dark:bg-slate-700/60" />
            </div>

            <div className="w-3/4 h-5 rounded-lg bg-slate-300 dark:bg-slate-700/60" />
            <div className="w-full h-4 rounded-md bg-slate-300 dark:bg-slate-700/40" />
            <div className="w-5/6 h-4 rounded-md bg-slate-300 dark:bg-slate-700/40" />

            <div className="pt-2 flex items-center justify-between">
              <div className="w-24 h-4 rounded bg-slate-300 dark:bg-slate-700/50" />
              <div className="w-28 h-8 rounded-xl bg-slate-300 dark:bg-slate-700/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
