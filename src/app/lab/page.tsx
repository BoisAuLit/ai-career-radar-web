// /lab — Public eval matrix viewer.
// Frozen snapshot of the Day 10 (2026-05-17) per-company deep-dive
// quality matrix, with a side-by-side pre-fix vs post-fix view of the
// cross-company-leakage bug that the matrix caught.

import {
  PRE_FIX_MATRIX,
  POST_FIX_BACKEND_ANTHROPIC,
  PROMPT_RULE_FIX,
  type MatrixCell,
} from "@/data/lab/eval_matrix";
import { PageBackground, SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const metadata = {
  title: "Lab — Eval Matrix · AI Career Radar",
  description:
    "Public snapshot of the quality eval matrix that surfaced (and helped fix) a real LLM-prompt bug in the per-company deep-dive mode.",
};

function scoreCell(value: number, alarm = 0.7) {
  const v = value.toFixed(2);
  if (value < alarm) {
    return (
      <span className="font-mono font-semibold text-rose-700 dark:text-rose-300">
        {v}
      </span>
    );
  }
  if (value >= 0.9) {
    return (
      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
        {v}
      </span>
    );
  }
  return <span className="font-mono">{v}</span>;
}

function CellRow({ c }: { c: MatrixCell }) {
  const outlier = c.persona === "backend_to_infra" && c.company === "Anthropic";
  return (
    <tr
      className={
        outlier
          ? "border-b border-zinc-200 bg-rose-50/40 dark:border-zinc-800 dark:bg-rose-950/20"
          : "border-b border-zinc-200 dark:border-zinc-800"
      }
    >
      <td className="py-2 pr-3 font-mono text-xs">{c.persona}</td>
      <td className="py-2 pr-3">{c.company}</td>
      <td className="py-2 pr-3 font-mono text-xs">{c.archetype}</td>
      <td className="py-2 pr-3 text-right">{scoreCell(c.gr)}</td>
      <td className="py-2 pr-3 text-right">{scoreCell(c.sp)}</td>
      <td className="py-2 pr-3 text-right">{scoreCell(c.ac)}</td>
    </tr>
  );
}

export default function LabPage() {
  return (
    <PageBackground>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Lab
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          How the eval matrix caught a real LLM-prompt bug.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Snapshot from Day 10 (2026-05-17). Live tool:{" "}
          <a className="underline" href="/">
            ai-career-radar-web
          </a>
          . Full build log:{" "}
          <a
            className="underline"
            href="https://github.com/BoisAuLit/tuto_ai_career_radar/blob/main/BUILD_LOG.md"
          >
            BUILD_LOG.md
          </a>
          .
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold tracking-tight sm:text-2xl">The setup</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Per-company &ldquo;deep-dive&rdquo; mode contrasts a target
          company&apos;s JDs against the industry-wide archetype baseline.
          Anthropic deep-dive surfaces things like &ldquo;40% TypeScript at
          Anthropic vs 0% in the research_engineer top-18 industry-wide&rdquo;
          — a real Anthropic-specific signal you can&apos;t see without the
          corpus.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Single-cell eval (one report, one judge) said the deep-dive was
          fine. I then ran a 6-cell quality matrix: 2 synthetic personas ×
          3 target companies. <strong>One cell stood out.</strong>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
          The matrix (pre-fix)
        </h2>
        <div className="surface-card overflow-x-auto p-1">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr className="border-b-2 border-zinc-300 dark:border-zinc-700">
                <th className="py-2 pr-3 text-left">Persona</th>
                <th className="py-2 pr-3 text-left">Company</th>
                <th className="py-2 pr-3 text-left">Target archetype</th>
                <th className="py-2 pr-3 text-right">Gr</th>
                <th className="py-2 pr-3 text-right">Sp</th>
                <th className="py-2 pr-3 text-right">Ac</th>
              </tr>
            </thead>
            <tbody>
              {PRE_FIX_MATRIX.map((c, i) => (
                <CellRow key={i} c={c} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          The shaded row (backend_to_infra × Anthropic) scored Gr=0.64 —
          the outlier. Judge variance is ~±0.10 across reruns; 0.64 is far
          outside noise.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
          The bug · cross-company training-data leakage
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Anthropic has 10 JDs in the corpus but <strong>0 of them are
          llm_infra archetype</strong> (the backend persona&apos;s target).
          The model — facing thin coverage — reached for training-data
          claims about ADJACENT companies as substitutes. Judge-flagged
          ungrounded quotes from the outlier cell:
        </p>
        <ul className="mb-3 list-disc rounded-2xl bg-gradient-to-br from-rose-50 to-rose-50/40 px-8 py-5 text-sm ring-1 ring-rose-200/60 dark:from-rose-950/30 dark:to-rose-950/10 dark:ring-rose-900/40">
          {PRE_FIX_MATRIX[3].ungrounded.map((q, i) => (
            <li key={i} className="font-mono text-xs text-rose-900 dark:text-rose-200">
              &ldquo;{q}&rdquo;
            </li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          None of those companies were in the supplied evidence list. The
          pre-fix prompt&apos;s company-claim rule said &ldquo;Statements
          about <em>a specific named company&apos;s</em> internal tech stack
          MUST come from that company&apos;s evidence JDs.&rdquo; The model
          parsed &ldquo;a specific named company&rdquo; as the TARGET
          company; when target evidence was thin, it imported claims about
          OTHER named companies as a workaround.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">The fix · 5 prompt lines</h2>
        <pre className="overflow-x-auto rounded-2xl bg-zinc-950 px-6 py-5 font-mono text-xs leading-relaxed text-zinc-100 ring-1 ring-zinc-200/70 shadow-sm shadow-zinc-200/40 dark:ring-zinc-800/70 dark:shadow-black/30">
          {PROMPT_RULE_FIX}
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
          The result · same input, same model, post-fix
        </h2>
        <div className="surface-card overflow-x-auto p-1">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr className="border-b-2 border-zinc-300 dark:border-zinc-700">
                <th className="py-2 pr-3 text-left">Run</th>
                <th className="py-2 pr-3 text-right">Gr</th>
                <th className="py-2 pr-3 text-right">Sp</th>
                <th className="py-2 pr-3 text-right">Ac</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-3">Pre-fix backend × Anthropic</td>
                <td className="py-2 pr-3 text-right">{scoreCell(PRE_FIX_MATRIX[3].gr)}</td>
                <td className="py-2 pr-3 text-right">{scoreCell(PRE_FIX_MATRIX[3].sp)}</td>
                <td className="py-2 pr-3 text-right">{scoreCell(PRE_FIX_MATRIX[3].ac)}</td>
              </tr>
              <tr className="border-b border-zinc-200 bg-emerald-50/40 dark:border-zinc-800 dark:bg-emerald-950/20">
                <td className="py-2 pr-3">Post-fix backend × Anthropic</td>
                <td className="py-2 pr-3 text-right">{scoreCell(POST_FIX_BACKEND_ANTHROPIC.gr)}</td>
                <td className="py-2 pr-3 text-right">{scoreCell(POST_FIX_BACKEND_ANTHROPIC.sp)}</td>
                <td className="py-2 pr-3 text-right">{scoreCell(POST_FIX_BACKEND_ANTHROPIC.ac)}</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2 pr-3">Δ</td>
                <td className="py-2 pr-3 text-right text-emerald-700 dark:text-emerald-300">
                  +{(POST_FIX_BACKEND_ANTHROPIC.gr - PRE_FIX_MATRIX[3].gr).toFixed(2)}
                </td>
                <td className="py-2 pr-3 text-right text-zinc-500">0</td>
                <td className="py-2 pr-3 text-right text-zinc-500">0</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          The post-fix report contains the disclosure the rule asked for —
          flagged by the judge but the &ldquo;flag&rdquo; is the model
          honestly stating sparse coverage:
        </p>
        <ul className="mt-2 list-disc rounded-md bg-emerald-50 px-6 py-3 text-sm dark:bg-emerald-950/30">
          {POST_FIX_BACKEND_ANTHROPIC.ungrounded.map((q, i) => (
            <li key={i} className="font-mono text-xs text-emerald-900 dark:text-emerald-200">
              &ldquo;{q}&rdquo;
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">Why this generalizes</h2>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          This isn&apos;t a code bug. No test would have caught it. It&apos;s
          a <strong>prompt-and-data interaction</strong> that only surfaces
          when input is varied enough — different personas × different
          companies × different archetype-coverage densities. A matrix is
          the cheapest possible variant of &ldquo;test with multiple
          inputs.&rdquo;
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Total cost of running this matrix end-to-end:{" "}
          <span className="font-mono">~$0.30 in LLM spend, ~10 minutes</span>.
          The bug it caught — invisible to single-cell eval — would have
          shipped to production and silently degraded reports for every
          user whose target company had thin coverage in their archetype.
        </p>
      </section>

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          Methodology: 3-metric LLM-as-judge (Claude Haiku 4.5) over each
          generated report.{" "}
          <a
            className="underline"
            href="https://github.com/BoisAuLit/tuto_ai_career_radar/blob/main/scripts/eval_existing_reports.py"
          >
            Judge code
          </a>
          ,{" "}
          <a
            className="underline"
            href="https://github.com/BoisAuLit/tuto_ai_career_radar/tree/main/corpus/reports/eval_results"
          >
            per-report judge JSONs
          </a>
          ,{" "}
          <a
            className="underline"
            href="https://github.com/BoisAuLit/tuto_ai_career_radar/blob/main/corpus/reports/DEEP_DIVE_EVAL_MATRIX.md"
          >
            full eval-matrix write-up
          </a>
          .
        </p>
        <p className="mt-2">
          Single measurements have ~±0.10 judge variance; the +0.25 fix is
          well above noise. Specificity uniformly stuck at 0.83 across the
          matrix is the real cost of deep-dive mode (vs 1.00 in
          archetype-only mode) — documented, not a bug.
        </p>
      </footer>
      </main>
      <SiteFooter />
    </PageBackground>
  );
}
