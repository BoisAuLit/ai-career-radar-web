// /snapshot-pipeline — staging-only preview of the automated pipeline output.
//
// Reads src/data/web_bundle_pipeline.json (a copy of the tuto repo's
// corpus/web_bundle_pipeline.json). The pipeline runs daily on GitHub
// Actions and updates that file in the tuto repo; the copy in this app
// is refreshed manually. The live /snapshot page (not this page) still
// uses src/data/web_bundle.json — the May 2026 manual corpus.
//
// This page is intentionally minimal: read the bundle on the server,
// compute a few aggregates inline, render with Tailwind. No new deps.

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const metadata = {
  title: "Snapshot (pipeline) · AI Career Radar",
  description:
    "Staging preview of the automated daily pipeline's output. Not the live production dataset.",
};

type BundleRecord = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  source_url: string | null;
  seniority: string | null;
  archetype: string | null;
  years_min: number | null;
  canonical_skills: string[] | null;
  raw_skills: string[] | null;
  body: string | null;
};

type Bundle = {
  version?: string | number;
  generated_at?: string;
  n_records?: number;
  records?: BundleRecord[];
  _provenance?: Record<string, unknown>;
};

function loadBundle(): Bundle | null {
  const p = path.join(process.cwd(), "src", "data", "web_bundle_pipeline.json");
  try {
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw) as Bundle;
  } catch {
    return null;
  }
}

function topCounts<T extends string>(
  items: Iterable<T | null | undefined>,
  limit: number,
): { key: T; count: number }[] {
  const counts = new Map<T, number>();
  for (const it of items) {
    if (!it) continue;
    counts.set(it, (counts.get(it) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function StagingBanner() {
  return (
    <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40">
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
        Staging — not the live dataset
      </div>
      <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
        This page is generated from the automated pipeline and is not yet
        the live production dataset. The live{" "}
        <Link className="underline" href="/">
          home
        </Link>{" "}
        still uses the manually-curated May 2026 corpus. See the{" "}
        <Link className="underline" href="/methodology">
          methodology page
        </Link>{" "}
        for the pipeline design and current status.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="mb-8 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight">
          Snapshot (pipeline)
        </h1>
      </header>
      <StagingBanner />
      <section className="rounded-md border border-zinc-200 bg-zinc-50 p-6 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <p>
          The pipeline bundle is not available yet at{" "}
          <code>src/data/web_bundle_pipeline.json</code>. This usually
          means a copy has not been synced from the pipeline repo since
          the last cron run. Check back after the next daily run, or
          refresh the file manually from{" "}
          <code>corpus/web_bundle_pipeline.json</code> in the lab repo.
        </p>
      </section>
    </main>
  );
}

function formatGeneratedAt(iso: string | undefined): string {
  if (!iso) return "unknown";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().replace("T", " ").replace(".000Z", "Z");
  } catch {
    return iso;
  }
}

export default function SnapshotPipelinePage() {
  const bundle = loadBundle();
  if (!bundle || !bundle.records || bundle.records.length === 0) {
    return <EmptyState />;
  }

  const records = bundle.records;
  const nRecords = bundle.n_records ?? records.length;

  // Company aggregates
  const companies = new Set<string>();
  for (const r of records) {
    if (r.company) companies.add(r.company);
  }

  // Top archetypes
  const topArchetypes = topCounts(
    records.map((r) => r.archetype),
    12,
  );
  const archetypesShown = new Set(topArchetypes.map((a) => a.key));

  // Top skills (canonical_skills, flattened)
  const allSkills: string[] = [];
  for (const r of records) {
    if (r.canonical_skills) {
      for (const s of r.canonical_skills) allSkills.push(s);
    }
  }
  const topSkills = topCounts(allSkills, 25);

  // Company breakdown with dominant archetype
  type CompanyRow = {
    company: string;
    n: number;
    dominantArchetype: string | null;
    dominantCount: number;
  };
  const byCompany = new Map<
    string,
    { n: number; archetypes: Map<string, number> }
  >();
  for (const r of records) {
    if (!r.company) continue;
    let bucket = byCompany.get(r.company);
    if (!bucket) {
      bucket = { n: 0, archetypes: new Map() };
      byCompany.set(r.company, bucket);
    }
    bucket.n += 1;
    if (r.archetype) {
      bucket.archetypes.set(
        r.archetype,
        (bucket.archetypes.get(r.archetype) ?? 0) + 1,
      );
    }
  }
  const companyRows: CompanyRow[] = [...byCompany.entries()]
    .map(([company, b]) => {
      let dominantArchetype: string | null = null;
      let dominantCount = 0;
      for (const [a, c] of b.archetypes) {
        if (c > dominantCount) {
          dominantCount = c;
          dominantArchetype = a;
        }
      }
      return { company, n: b.n, dominantArchetype, dominantCount };
    })
    .sort((a, b) => b.n - a.n);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="mb-6 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight">
          Snapshot (pipeline)
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Staging preview of what the automated daily pipeline currently
          emits. For the methodology behind these numbers, see the{" "}
          <Link className="underline" href="/methodology">
            methodology page
          </Link>
          .
        </p>
      </header>

      <StagingBanner />

      {/* Pipeline summary */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Pipeline summary</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Records
            </dt>
            <dd className="mt-1 font-mono text-lg">{nRecords}</dd>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Companies
            </dt>
            <dd className="mt-1 font-mono text-lg">{companies.size}</dd>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Archetypes
            </dt>
            <dd className="mt-1 font-mono text-lg">{archetypesShown.size}</dd>
          </div>
          <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Generated at (UTC)
            </dt>
            <dd className="mt-1 font-mono text-xs">
              {formatGeneratedAt(bundle.generated_at)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Data source: automated pipeline (daily cron) · staging only ·
          may lag the most recent run until the bundle copy is synced.
        </p>
      </section>

      {/* Top archetypes */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Top archetypes</h2>
        <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {topArchetypes.map((a) => (
            <li
              key={a.key}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="font-mono">{a.key}</span>
              <span className="text-zinc-500">{a.count}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top skills */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Top skills</h2>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {topSkills.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between border-b border-zinc-100 py-1 dark:border-zinc-900"
            >
              <span>{s.key}</span>
              <span className="text-zinc-500">{s.count}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Company breakdown */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Company breakdown</h2>
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
              {companyRows.map((c) => (
                <tr key={c.company}>
                  <td className="px-3 py-2">{c.company}</td>
                  <td className="px-3 py-2 text-right font-mono">{c.n}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {c.dominantArchetype ? (
                      <>
                        <span className="font-mono">
                          {c.dominantArchetype}
                        </span>{" "}
                        <span className="text-zinc-400">
                          ({c.dominantCount})
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          Staging preview of the automated pipeline. See the{" "}
          <Link className="underline" href="/methodology">
            methodology
          </Link>{" "}
          page for the pipeline design, scope of claims, and current
          automation status.
        </p>
      </footer>
    </main>
  );
}
