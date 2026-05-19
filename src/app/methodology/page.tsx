// /methodology — public methodology page.
// Trust system for the automated AI job-post collection pipeline.
// See AUTOMATED_COLLECTION_DESIGN.md (v1.2) for the full design.
//
// PHASE A0: the automated pipeline is in skeleton state — sources.yaml,
// SQLite schema, methodology page (this page), but no network calls yet.
// The /snapshot data still comes from the manually-collected May 2026
// corpus of 443 JDs from 36 companies.

import Link from "next/link";

export const metadata = {
  title: "Methodology · AI Career Radar",
  description:
    "How we collect, deduplicate, classify, and report on AI job postings. The trust system for our snapshot product.",
};

const LAB_REPO = "https://github.com/BoisAuLit/tuto_ai_career_radar";
const DESIGN_DOC = `${LAB_REPO}/blob/main/AUTOMATED_COLLECTION_DESIGN.md`;
const BUILD_LOG = `${LAB_REPO}/blob/main/BUILD_LOG.ipynb`;
const DECISION_LOG = `${LAB_REPO}/blob/main/DECISION_LOG.md`;

function StatusBadge({
  phase,
  description,
}: {
  phase: string;
  description: string;
}) {
  return (
    <div className="my-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40">
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
        Current pipeline phase
      </div>
      <div className="mt-1 font-mono text-sm">{phase}</div>
      <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
        {description}
      </div>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="mb-8 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          How we collect, deduplicate, classify, and report on AI job
          postings. Read this before trusting any number in our reports.
        </p>
      </header>

      <StatusBadge
        phase="Phase E · Live snapshot generation (2026-05-18)"
        description="The automated collection pipeline now generates snapshot reports end-to-end from live data. 398 Anthropic JDs fetched (Phase A2), 131 classified as AI-related (Phase C), 131 extracted with full skill / archetype / seniority signals (Phase D), rendered to per-archetype reports (Phase E). Each phase is idempotent and SQLite-backed. The /snapshot page in the live web app still serves the May 2026 manual corpus — wiring the pipeline's JSON exports into the web bundle is Phase F1. Auto-running on cron is Phase F2."
      />

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">What this corpus is</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          A curated set of approximately 40 AI / AI-adjacent technology
          companies, collected weekly (eventually — currently a single May
          2026 manual snapshot). The companies span frontier AI labs,
          big-tech AI teams, AI-native scaleups, AI infrastructure
          platforms, and AI tooling / evaluation / observability vendors.
          Most postings are based in the US and EU.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">What this corpus is NOT</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Not the entire AI job market.</strong> 40 companies is
            a curated sample, not a census. We do not claim "the AI market
            is doing X." We claim "in the curated companies we follow, the
            visible composition is X."
          </li>
          <li>
            <strong>Not a flow of hires.</strong> The snapshot reflects
            currently-posted JDs. Specialized hard-to-fill roles persist
            on careers pages longer and are over-represented; hot
            high-velocity roles fill before our weekly snapshot captures
            them. Treat archetype shares as "composition of public
            postings," not "composition of hires."
          </li>
          <li>
            <strong>Not a single aggregate percentage.</strong> Scale AI
            (61 JDs) and Anthropic (10 JDs) have very different sample
            sizes. Reports default to per-company spread (median, range,
            interquartile range) rather than a single weighted average
            that hides the variation.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">How we collect</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Source priority, in order of preference:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            Official public APIs (Greenhouse Job Board API, Lever
            Postings API) — used wherever available
          </li>
          <li>Public ATS pages without authentication</li>
          <li>Company-owned careers pages (static HTML)</li>
          <li>Company-owned careers pages (JavaScript-rendered)</li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          We <strong>do not automate</strong> against LinkedIn, Indeed, or
          Glassdoor. Their terms of service prohibit automated access, and
          the data they aggregate is the same first-party data we collect
          directly. Going first-party is strictly more legal, equally
          accurate, and avoids deduplication noise.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Every source in our registry has a documented compliance entry:
          ToS URL, when it was read, who read it, what level of public
          display is permitted, and a written rationale for the
          determination. Sources at <code>allowed_public_use: unknown</code> are
          skipped by the collector — technical ability to crawl does not
          imply permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">How we deduplicate</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Deduplication runs as a layered cascade, cheapest-signals first:
          source URL → content hash → normalized title equality → TF-IDF
          similarity → embedding similarity → LLM judge. Same-job
          different-location and reposts merge into a single
          identifier; similar-but-distinct cases flag for human review
          rather than auto-merge.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          The canonical identifier for a job is anchored on the source's
          stable ID (Greenhouse / Lever job ID) when available. A
          classifier prompt change never changes a job's canonical
          identity — archetype is a derived attribute, not part of the
          ID.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">How we strip boilerplate</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Most companies put a stock "About [Company]" paragraph at the
          top of every JD. Without stripping, the same words inflate skill
          counts (every Anthropic JD appearing to "mention research"
          purely because the about-paragraph mentions research). We
          detect each company's common JD prefix/suffix and strip it
          before extraction. The extraction prompt also has an
          "ignore about-company" rule as a fallback.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">AI relevance classification</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          A two-stage filter: a cheap keyword pre-filter (high recall,
          loose precision) followed by an LLM classifier that returns a
          categorical decision — <code>include</code>, <code>review</code>,
          or <code>exclude</code>. We deliberately do not show a numeric
          confidence value on public surfaces: an LLM's self-reported
          probability is uncalibrated, and exposing it as "91% confident"
          suggests precision we have not earned. Borderline cases land in
          a human review queue.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">What we report and why</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <strong>V1 ships snapshot-only.</strong> We report:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            Per-company spread of archetype shares (median, range, IQR
            across companies)
          </li>
          <li>Top skills within each archetype, with the supporting JD count</li>
          <li>
            Distribution of seniority and JD counts per company (in the
            aggregate-stats appendix)
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          We do <strong>not</strong> report:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            "Rising / falling / emerging" trend claims. The corpus is a
            single point in time. Trend reporting requires fixed-cohort
            longitudinal data plus confidence intervals plus
            multiple-comparisons correction — none of which are honest at
            V1's data accumulation level.
          </li>
          <li>
            Universal market claims. Our corpus is 40 curated companies,
            not a market census.
          </li>
          <li>
            Salary statistics. Salary disclosure laws differ by US state
            and country; aggregating across jurisdictions produces
            sample-biased trends. V2 candidate after we segment by
            disclosure jurisdiction.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Trust signals</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Every claim in our snapshot report should be auditable. To that
          end, we publish:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            The full design document:{" "}
            <a className="underline" href={DESIGN_DOC}>
              AUTOMATED_COLLECTION_DESIGN.md
            </a>{" "}
            (v1.2)
          </li>
          <li>
            The day-by-day build log:{" "}
            <a className="underline" href={BUILD_LOG}>
              BUILD_LOG.ipynb
            </a>
          </li>
          <li>
            The decision log:{" "}
            <a className="underline" href={DECISION_LOG}>
              DECISION_LOG.md
            </a>
          </li>
          <li>
            The eval matrix that caught a real prompt bug:{" "}
            <Link className="underline" href="/lab">
              /lab
            </Link>
          </li>
        </ul>
      </section>

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          This page is part of the trust system for the snapshot report.
          It is maintained alongside the pipeline code; when a phase
          ships, this page updates. If you find a claim on the snapshot
          page that is not explainable by reading this methodology page,
          please open an issue on{" "}
          <a className="underline" href={LAB_REPO}>
            the lab repo
          </a>
          .
        </p>
        <p className="mt-2">
          Last updated 2026-05-18. Pipeline phase status:{" "}
          <span className="font-mono">E · live snapshot generation</span>.
          Latest auto-generated snapshot report:{" "}
          <a
            className="underline"
            href={`${LAB_REPO}/tree/main/corpus/snapshots`}
          >
            corpus/snapshots/
          </a>{" "}
          on GitHub.
        </p>
      </footer>
    </main>
  );
}
