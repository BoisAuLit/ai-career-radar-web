"use client";

import { useMemo, useState } from "react";

export type CompanyRow = {
  company: string;
  n: number;
  dominantArchetype: string | null;
  dominantCount: number;
};

// Light client-side filter on the company breakdown table.
// Keeps the parent server component cheap (it computes the rows once
// at request time); this component just renders + filters in memory.
// No heavy table/grid library — a useState + an Array.filter call.
export default function CompanyBreakdownTable({ rows }: { rows: CompanyRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        (r.dominantArchetype || "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  // Proportional bar fill is computed against the page-wide max so
  // companies with thin coverage still render a visible bar relative
  // to the leader.
  const maxN = useMemo(() => Math.max(1, ...rows.map((r) => r.n)), [rows]);

  return (
    <div>
      {/* Filter row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label
          htmlFor="company-filter"
          className="eyebrow shrink-0"
        >
          Filter
        </label>
        <input
          id="company-filter"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="company or archetype…"
          className="flex-1 rounded-xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-zinc-200 transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-900 dark:ring-zinc-800 dark:focus:ring-zinc-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-zinc-200 transition hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
          >
            Clear
          </button>
        )}
        <span className="metric text-xs text-zinc-500">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-900/40">
              <th className="eyebrow px-4 py-3 text-left">Company</th>
              <th className="eyebrow px-4 py-3 text-right">Included jobs</th>
              <th className="eyebrow px-4 py-3 text-left">Dominant archetype</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-xs text-zinc-500">
                  No companies match &quot;{query}&quot;.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.company} className="relative">
                  <td className="px-4 py-2.5 font-medium">{c.company}</td>
                  <td className="relative px-4 py-2.5">
                    {/* Bar fill behind the count, proportional to maxN */}
                    <div
                      aria-hidden
                      className="absolute inset-y-1.5 right-4 rounded-md bg-gradient-to-l from-emerald-500/[0.10] to-transparent dark:from-emerald-400/[0.16]"
                      style={{
                        width: `${(c.n / maxN) * 100}%`,
                        maxWidth: "calc(100% - 1rem)",
                      }}
                    />
                    <span className="metric relative block text-right text-zinc-700 dark:text-zinc-300">
                      {c.n}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {c.dominantArchetype ? (
                      <span className="inline-flex items-center gap-1.5">
                        <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {c.dominantArchetype}
                        </code>
                        <span className="metric text-xs text-zinc-400">
                          {c.dominantCount}
                        </span>
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
