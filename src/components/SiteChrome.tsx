// Shared chrome (navbar + footer) for secondary pages so they pick up the
// same visual language as the homepage without duplicating ~50 lines of
// JSX per page. Local component — no new dependencies. The homepage and
// /sample-report keep their navbar/footer inlined because they were
// already shipped with subtle context-specific styling.

import Link from "next/link";

// Brand mark — inline SVG radar. Concentric rings + offset dot to suggest
// "detected signal at a distance" — on-brand for "Career Radar". Stays
// crisp at any size, inherits currentColor.
export function BrandMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="14" cy="14" r="11.5" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
      <circle cx="14" cy="14" r="6.5" stroke="currentColor" strokeWidth="1.25" opacity="0.7" />
      <circle cx="14" cy="14" r="1.75" fill="currentColor" />
      <circle cx="20.5" cy="14" r="1.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/70 bg-white/75 shadow-sm shadow-zinc-200/30 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/70 dark:shadow-black/30">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-sm dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
            <BrandMark className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">AI Career Radar</span>
          <span className="hidden rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 sm:inline-block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            443 real JDs
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/methodology" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Methodology
          </Link>
          <Link
            href="/snapshot-pipeline"
            className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Pipeline snapshot
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              staging
            </span>
          </Link>
          <Link href="/lab" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Lab
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 text-xs font-bold text-white dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
              ◉
            </span>
            <span className="text-sm font-semibold tracking-tight">AI Career Radar</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
            <Link href="/methodology" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Methodology
            </Link>
            <Link
              href="/snapshot-pipeline"
              className="hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Pipeline snapshot
            </Link>
            <Link href="/lab" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Lab
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-white via-zinc-50/60 to-white text-zinc-900 dark:from-zinc-950 dark:via-zinc-900/40 dark:to-zinc-950 dark:text-zinc-100">
      {children}
    </div>
  );
}
