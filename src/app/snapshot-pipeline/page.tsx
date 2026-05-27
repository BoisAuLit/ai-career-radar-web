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
import CompanyBreakdownTable from "./CompanyBreakdownTable";
import { PageBackground, SiteHeader, SiteFooter } from "@/components/SiteChrome";

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
    <div className="mb-10 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white p-5 ring-1 ring-amber-200/70 dark:from-amber-950/30 dark:to-zinc-900/30 dark:ring-amber-900/40">
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300">
        Staging — not the live dataset
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
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
    <PageBackground>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Pipeline snapshot
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
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
      <SiteFooter />
    </PageBackground>
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
    <PageBackground>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Pipeline snapshot · staging
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Snapshot from the automated daily pipeline.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Staging preview of what the automated daily pipeline currently
          emits. For the methodology behind these numbers, see the{" "}
          <Link className="underline" href="/methodology">
            methodology page
          </Link>
          .
        </p>
      </header>

      <StagingBanner />

      {/* What this is + what this is NOT */}
      <section className="mb-8 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-zinc-50 to-white p-4 shadow-sm shadow-zinc-200/40 ring-1 ring-zinc-200/70 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:shadow-black/20 dark:ring-zinc-800/70">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            What this page shows
          </div>
          <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
            <li>· The latest snapshot from the automated daily pipeline.</li>
            <li>· Counts and breakdowns over postings the classifier marked as AI-related.</li>
            <li>
              · A staging surface — useful for inspecting the pipeline's output
              before any decision to promote it to the live home page.
            </li>
          </ul>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-zinc-50 to-white p-4 shadow-sm shadow-zinc-200/40 ring-1 ring-zinc-200/70 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:shadow-black/20 dark:ring-zinc-800/70">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            What this page does NOT show
          </div>
          <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
            <li>· The live production dataset (still the May 2026 manual corpus, 443 JDs).</li>
            <li>· The whole AI job market — only a curated ~40-company sample.</li>
            <li>
              · Trend / time-series data. Each daily snapshot is a single point in
              time; trend claims require months of accumulation.
            </li>
            <li>
              · Full job descriptions. Counts only, with links back to original
              ATS postings — never republished prose.
            </li>
          </ul>
        </div>
      </section>

      {/* Pipeline summary */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">Pipeline summary</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-white to-zinc-50/60 p-4 shadow-sm shadow-zinc-200/40 ring-1 ring-zinc-200/70 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:shadow-black/20 dark:ring-zinc-800/70">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Records
            </dt>
            <dd className="mt-1 font-mono text-lg">{nRecords}</dd>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-white to-zinc-50/60 p-4 shadow-sm shadow-zinc-200/40 ring-1 ring-zinc-200/70 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:shadow-black/20 dark:ring-zinc-800/70">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Companies
            </dt>
            <dd className="mt-1 font-mono text-lg">{companies.size}</dd>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-white to-zinc-50/60 p-4 shadow-sm shadow-zinc-200/40 ring-1 ring-zinc-200/70 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:shadow-black/20 dark:ring-zinc-800/70">
            <dt className="text-xs uppercase tracking-wider text-zinc-500">
              Archetypes
            </dt>
            <dd className="mt-1 font-mono text-lg">{archetypesShown.size}</dd>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-white to-zinc-50/60 p-4 shadow-sm shadow-zinc-200/40 ring-1 ring-zinc-200/70 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:shadow-black/20 dark:ring-zinc-800/70">
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

      {/* Top archetypes — bar-chart row treatment (data feel) */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">Top archetypes</h2>
        {(() => {
          const maxA = Math.max(1, ...topArchetypes.map((a) => a.count));
          return (
            <ul className="surface-card overflow-hidden">
              {topArchetypes.map((a, i) => (
                <li
                  key={a.key}
                  className={
                    "relative px-4 py-2.5 text-sm" +
                    (i > 0 ? " border-t border-zinc-200/70 dark:border-zinc-800/70" : "")
                  }
                >
                  {/* progress bar background, very subtle */}
                  <div
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/[0.08] to-transparent dark:from-emerald-400/[0.12]"
                    style={{ width: `${(a.count / maxA) * 100}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="font-mono">{a.key}</span>
                    <span className="metric text-zinc-600 dark:text-zinc-400">{a.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
      </section>

      {/* Top skills — bar-chart treatment, two columns */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">Top skills</h2>
        {(() => {
          const maxS = Math.max(1, ...topSkills.map((s) => s.count));
          return (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {topSkills.map((s) => (
                <li
                  key={s.key}
                  className="relative overflow-hidden rounded-md px-3 py-1.5"
                >
                  <div
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500/[0.08] to-transparent dark:from-indigo-400/[0.14]"
                    style={{ width: `${(s.count / maxS) * 100}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span>{s.key}</span>
                    <span className="metric text-zinc-500">{s.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
      </section>

      {/* Company breakdown (with client-side filter) */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">Company breakdown</h2>
        <CompanyBreakdownTable rows={companyRows} />
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
      <SiteFooter />
    </PageBackground>
  );
}
