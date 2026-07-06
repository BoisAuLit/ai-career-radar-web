// /methodology — public methodology page.
// Trust system for the automated AI job-post collection pipeline.
// See AUTOMATED_COLLECTION_DESIGN.md (v1.2) for the full design.
//
// PHASE F2.13 (2026-05-25): daily automated cron is enabled and under
// observation. The live home page still serves the manually-curated
// May 2026 corpus (443 JDs); the automated pipeline's output is
// previewed at /snapshot-pipeline and will be promoted to the live
// bundle once the daily cron has accumulated enough clean runs.

import Link from "next/link";
import { PageBackground, SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { WEB_BUNDLE_STATS } from "@/lib/web-bundle-stats";

const SECTIONS = [
  { id: "what-this-corpus-is", title: "What this corpus is" },
  { id: "what-this-corpus-is-not", title: "What this corpus is NOT" },
  { id: "data-sources", title: "Data sources" },
  { id: "pipeline-flow", title: "Pipeline flow" },
  { id: "how-we-deduplicate", title: "How we deduplicate" },
  { id: "how-we-strip-boilerplate", title: "How we strip boilerplate" },
  { id: "ai-relevance-classification", title: "AI relevance classification" },
  { id: "what-we-report", title: "What we report and why" },
  { id: "public-display-rules", title: "Public display rules" },
  { id: "human-review", title: "Human review" },
  { id: "automation-status", title: "Automation status" },
  { id: "trust-signals", title: "Trust signals" },
] as const;

function TableOfContents({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Table of contents" className={className}>
      <div className="eyebrow mb-3">Contents</div>
      <ol className="space-y-2 text-sm">
        {SECTIONS.map((s, i) => (
          <li key={s.id} className="flex gap-2">
            <span className="metric w-5 shrink-0 text-zinc-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <a
              href={`#${s.id}`}
              className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const metadata = {
  title: "Methodology · AI Career Radar",
  description:
    "How we collect, deduplicate, classify, and report on AI job postings. The trust system for our snapshot product.",
};

const LAB_REPO = "https://github.com/BoisAuLit/tuto_ai_career_radar";
const DESIGN_DOC = `${LAB_REPO}/blob/main/AUTOMATED_COLLECTION_DESIGN.md`;
const BUILD_LOG = `${LAB_REPO}/blob/main/BUILD_LOG.md`;
const DECISION_LOG = `${LAB_REPO}/blob/main/DECISION_LOG.md`;

function StatusBadge({
  phase,
  description,
}: {
  phase: string;
  description: string;
}) {
  // Whitepaper-style callout. No box / no bg tint — just a left rule and
  // an eyebrow label. Reads as part of the editorial flow, not a chrome
  // panel breaking it.
  return (
    <aside className="mb-12 border-l-2 border-zinc-300 pl-5 dark:border-zinc-700">
      <div className="eyebrow">Current pipeline phase</div>
      <div className="mt-2 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">{phase}</div>
      <p className="mt-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        {description}
      </p>
    </aside>
  );
}

export default function MethodologyPage() {
  return (
    <PageBackground>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 lg:mb-16">
        <div className="eyebrow">Methodology</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          How we collect, classify, and report.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Read this before trusting any number in our reports.
        </p>
      </header>

      {/* Mobile + tablet: inline TOC at top */}
      <TableOfContents className="mb-12 lg:hidden" />

      {/* Two-column layout on desktop: sticky TOC sidebar + main column */}
      <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <TableOfContents className="sticky top-24" />
        </aside>

        <div className="max-w-3xl">
      <StatusBadge
        phase="Phase F2.13 · Daily automated cron, under observation (2026-05-25)"
        description="The full pipeline runs unattended on GitHub Actions every day at 06:00 UTC: rehydrate canonical state from the committed dump → fetch 8 first-party ATS sources (Greenhouse + Ashby) → classify AI relevance → extract structured signals → validate against 9 pre-commit gates → re-dump canonical state → commit artifacts back to main. Each phase is idempotent and SQLite-backed; a steady-state run with no new postings costs near $0. The live home page still serves the manually-curated May 2026 corpus (443 JDs). The automated output is previewed at /snapshot-pipeline as a staging surface and will be promoted to the live bundle once the daily cron has accumulated enough clean runs to trust unattended."
      />

      <section className="mb-12">
        <h2 id="what-this-corpus-is" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">What this corpus is</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          A curated set of {WEB_BUNDLE_STATS.trackedCompanies} AI / AI-adjacent
          technology companies. The companies span frontier AI labs, big-tech AI
          teams, AI-native scaleups, AI infrastructure platforms, and AI
          tooling / evaluation / observability vendors. Most postings are
          based in the US and EU. The live home page currently serves the
          May 2026 manually-curated snapshot; the automated pipeline now
          re-fetches the corpus daily and writes a separate staging
          bundle previewed at{" "}
          <Link className="underline" href="/snapshot-pipeline">
            /snapshot-pipeline
          </Link>
          .
        </p>
        <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Treat the snapshot as <strong>directional intelligence from
          selected AI-relevant companies</strong>, not a market-wide
          claim. Numbers reflect <em>postings currently visible on the
          corpus's careers pages</em>, not hires made, and not the AI job
          market as a whole.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="what-this-corpus-is-not" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">What this corpus is NOT</h2>
        <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Not the entire AI job market.</strong>{" "}
            {WEB_BUNDLE_STATS.trackedCompanies} companies is a curated sample,
            not a census. We do not claim "the AI market
            is doing X." We claim "in the curated companies we follow, the
            visible composition is X."
          </li>
          <li>
            <strong>Not a flow of hires.</strong> The snapshot reflects
            currently-posted JDs. Specialized hard-to-fill roles persist
            on careers pages longer and are over-represented; hot
            high-velocity roles fill between two consecutive daily
            snapshots. Treat archetype shares as "composition of public
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

      <section className="mb-12">
        <h2 id="data-sources" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">Data sources</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          All data comes from <strong>first-party company career pages and
          their ATS providers</strong>. The pipeline currently fetches
          from two source types: Greenhouse and Ashby. Both expose public
          job-board APIs that companies opt into when they set up their
          ATS — no scraping, no headless browsers, no auth bypass.
        </p>
        <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          We <strong>do not scrape</strong> LinkedIn, Indeed, or Glassdoor.
          Their terms of service prohibit automated access, and the data
          they aggregate is the same first-party data we collect directly.
          Going first-party is strictly more legal, equally accurate, and
          avoids deduplication noise.
        </p>
        <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Every source in our registry has a documented compliance entry:
          ToS URL, when it was read, who read it, what level of public
          display is permitted, and a written rationale for the
          determination. Sources at <code>allowed_public_use: unknown</code> are
          skipped by the collector — technical ability to crawl does not
          imply permission.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="pipeline-flow" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">Pipeline flow</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Each daily run is a single idempotent chain:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <li>
            <code>sources.yaml</code> — the registry of companies and
            compliance metadata
          </li>
          <li><strong>Fetch</strong> — pull current postings from each ATS API</li>
          <li>
            <strong>Normalize</strong> — canonical_job_id anchored on the
            source's stable ID (Greenhouse / Ashby job ID)
          </li>
          <li>
            <strong>Boilerplate clean</strong> — strip each company's
            stock "About [Company]" prefix/suffix before extraction
          </li>
          <li>
            <strong>Classify AI relevance</strong> — keyword pre-filter
            then an LLM classifier returning <code>include</code>,{" "}
            <code>review</code>, or <code>exclude</code>
          </li>
          <li>
            <strong>Extract structured signals</strong> — skills,
            archetype, seniority, years on include'd JDs
          </li>
          <li>
            <strong>Snapshot</strong> — write a human-readable report and
            machine-readable JSON of the run
          </li>
          <li>
            <strong>Web bundle</strong> — emit a static JSON the front-end
            reads (staging at{" "}
            <Link className="underline" href="/snapshot-pipeline">
              /snapshot-pipeline
            </Link>{" "}
            today; production bundle still manual)
          </li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 id="how-we-deduplicate" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">How we deduplicate</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Deduplication runs as a layered cascade, cheapest-signals first:
          source URL → content hash → normalized title equality → TF-IDF
          similarity → embedding similarity → LLM judge. Same-job
          different-location and reposts merge into a single
          identifier; similar-but-distinct cases flag for human review
          rather than auto-merge.
        </p>
        <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          The canonical identifier for a job is anchored on the source's
          stable ID (Greenhouse / Lever job ID) when available. A
          classifier prompt change never changes a job's canonical
          identity — archetype is a derived attribute, not part of the
          ID.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="how-we-strip-boilerplate" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">How we strip boilerplate</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Most companies put a stock "About [Company]" paragraph at the
          top of every JD. Without stripping, the same words inflate skill
          counts (every Anthropic JD appearing to "mention research"
          purely because the about-paragraph mentions research). We
          detect each company's common JD prefix/suffix and strip it
          before extraction. The extraction prompt also has an
          "ignore about-company" rule as a fallback.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="ai-relevance-classification" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">AI relevance classification</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
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

      <section className="mb-12">
        <h2 id="what-we-report" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">What we report and why</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <strong>V1 ships snapshot-only.</strong> We report:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-7 text-zinc-700 dark:text-zinc-300">
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
        <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          We do <strong>not</strong> report:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <li>
            "Rising / falling / emerging" trend claims. The corpus is a
            single point in time. Trend reporting requires fixed-cohort
            longitudinal data plus confidence intervals plus
            multiple-comparisons correction — none of which are honest at
            V1's data accumulation level.
          </li>
          <li>
            Universal market claims. Our corpus is{" "}
            {WEB_BUNDLE_STATS.trackedCompanies} curated companies, not a market
            census.
          </li>
          <li>
            Salary statistics. Salary disclosure laws differ by US state
            and country; aggregating across jurisdictions produces
            sample-biased trends. V2 candidate after we segment by
            disclosure jurisdiction.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 id="public-display-rules" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">Public display rules</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          We do not republish full job descriptions publicly. Public
          surfaces show <strong>aggregate statistics</strong> (counts,
          archetype/skill distributions, per-company breakdowns), with
          links back to the original posting on the company's ATS so the
          source of every data point is one click away. Short excerpted
          snippets may appear in analysis where they help interpretation,
          but the canonical full text is only ever held in the pipeline's
          private working storage, not republished.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="human-review" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">Human review</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          The classifier returns a categorical decision —{" "}
          <code>include</code>, <code>review</code>, or{" "}
          <code>exclude</code>. Borderline cases (mid-range confidence,
          ambiguous AI-relatedness, or surface mentions that may not
          reflect actual AI work) are routed to a{" "}
          <strong>human review queue</strong> rather than auto-decided.
          We do not show a numeric confidence value on public surfaces:
          an LLM's self-reported probability is uncalibrated, and
          exposing it as "91% confident" suggests precision we have not
          earned.
        </p>
        <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          The review queue is part of the trust system. Operators work
          through it via a small CLI (no auto-resolution, no batch
          guessing) — each item is decided as include / exclude / defer
          with a written note, and the audit trail (who, when, why) is
          persisted as a lifecycle event. The dataset gets cleaner with
          time, not noisier; the visible cost is a slower path to
          publication.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="automation-status" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">Automation status</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Daily automation is enabled. The pipeline runs unattended on
          GitHub Actions at 06:00 UTC every day, gated by nine pre-commit
          validation gates that catch fetch failures, classifier
          collapse, review-queue explosion, and cost overruns. A run that
          fails any gate aborts before its artifacts are committed back
          to the repo.
        </p>
        <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          The automated output is{" "}
          <strong>still under observation</strong>. The live home page
          continues to serve the older manually-curated May 2026 bundle;
          the automated daily output is previewed at{" "}
          <Link className="underline" href="/snapshot-pipeline">
            /snapshot-pipeline
          </Link>{" "}
          as a staging surface. Promotion of the automated bundle to the
          live home page is a separate, deliberate step that happens only
          after the daily cron has accumulated enough clean runs to be
          trusted unattended.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="trust-signals" className="scroll-mt-24 mb-3 text-xl font-semibold tracking-tight sm:text-2xl">Trust signals</h2>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          Every claim in our snapshot report should be auditable. To that
          end, we publish:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-base leading-7 text-zinc-700 dark:text-zinc-300">
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
              BUILD_LOG.md
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
          Last updated 2026-05-25. Pipeline phase status:{" "}
          <span className="font-mono">
            F2.13 · daily cron live, under observation
          </span>
          . Per-run summaries (one JSON per source per run) are committed
          to{" "}
          <a
            className="underline"
            href={`${LAB_REPO}/tree/main/corpus/runs`}
          >
            corpus/runs/
          </a>{" "}
          on GitHub.
        </p>
      </footer>
        </div>
      </div>
      </main>
      <SiteFooter />
    </PageBackground>
  );
}
