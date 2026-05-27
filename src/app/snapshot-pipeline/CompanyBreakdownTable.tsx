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

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <label htmlFor="company-filter" className="text-zinc-600 dark:text-zinc-400">
          Filter
        </label>
        <input
          id="company-filter"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="company or archetype…"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-md border border-zinc-300 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
        <span className="text-zinc-500">
          {filtered.length} of {rows.length}
        </span>
      </div>
      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2 text-right">Included jobs</th>
              <th className="px-3 py-2">Dominant archetype</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-xs text-zinc-500">
                  No companies match &quot;{query}&quot;.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.company}>
                  <td className="px-3 py-2">{c.company}</td>
                  <td className="px-3 py-2 text-right font-mono">{c.n}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {c.dominantArchetype ? (
                      <>
                        <span className="font-mono">{c.dominantArchetype}</span>{" "}
                        <span className="text-zinc-400">({c.dominantCount})</span>
                      </>
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
