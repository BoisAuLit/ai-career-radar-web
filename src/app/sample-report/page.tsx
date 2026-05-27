// /sample-report — static fictional gap report for first-time visitors who
// want to see the final product value without uploading their resume.
//
// This page is intentionally STATIC. It does not call any API, does not
// read real user data, and does not connect to the corpus. Every name,
// company quote, and percentage on this page is a representative fiction.
// The disclosure is shown prominently in two places.

import Link from "next/link";

export const metadata = {
  title: "Sample report — AI Career Radar",
  description:
    "A static fictional gap report for a Frontend Engineer pivoting into Applied AI. No real user data; not connected to the live API.",
};

const TARGET_ARCHETYPE = "applied_ai";

export default function SampleReportPage() {
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-white via-zinc-50/60 to-white text-zinc-900 dark:from-zinc-950 dark:via-zinc-900/40 dark:to-zinc-950 dark:text-zinc-100">
      {/* Sticky navbar — matches homepage */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
        <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 text-xs font-bold text-white shadow-sm dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
              ◉
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

      <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Fictional-disclosure banner */}
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50/80 px-4 py-3 text-sm ring-1 ring-amber-200/80 dark:bg-amber-950/30 dark:ring-amber-900/40">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
            Sample · fictional
          </span>
          <span className="text-amber-900 dark:text-amber-200">
            Every name, percentage, and quote on this page is fiction. The real
            tool reads your actual resume and the live JD corpus.
          </span>
        </div>

        {/* Report shell */}
        <article className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-zinc-300/30 ring-1 ring-zinc-200/70 dark:bg-zinc-900/60 dark:shadow-black/40 dark:ring-zinc-800/70">
          {/* Executive summary strip */}
          <div className="border-b border-zinc-200/70 bg-gradient-to-br from-zinc-50/60 to-white px-7 py-6 sm:px-10 sm:py-8 dark:border-zinc-800/70 dark:from-zinc-900 dark:to-zinc-900/40">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Gap report · static sample
              </div>
              <div className="text-xs text-zinc-500">
                Generated from tracked JD corpus · evidence-grounded
              </div>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Frontend Engineer → Applied AI Engineer
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-zinc-900 px-2 py-0.5 font-mono text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
                {TARGET_ARCHETYPE}
              </code>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Fit · strong baseline
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                5 leverage gaps
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Based on 92 applied_ai JDs
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="divide-y divide-zinc-200/70 px-7 py-8 sm:px-10 sm:py-12 dark:divide-zinc-800/60 [&>section]:py-10 sm:[&>section]:py-12 [&>section:first-child]:pt-0 [&>section:last-child]:pb-0">
            {/* Background */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Background
              </h2>
              <p className="mt-3 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                7 years building product-facing React + TypeScript at a B2B SaaS.
                Strong shipping cadence, hands-on with CI/CD, mentored juniors,
                ran a frontend hiring loop. Python used scripting-only — no LLM
                or ML systems in production.
              </p>
            </section>

            {/* Strengths */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">
                Already strong · don&apos;t re-learn
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <li className="flex items-start gap-3 rounded-2xl bg-emerald-50/40 px-4 py-3 ring-1 ring-emerald-100/80 dark:bg-emerald-950/20 dark:ring-emerald-900/40">
                  <span aria-hidden className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                  <div>
                    <div className="font-medium">Frontend systems</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Cited in 38% of applied_ai JDs you&apos;d target.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-emerald-50/40 px-4 py-3 ring-1 ring-emerald-100/80 dark:bg-emerald-950/20 dark:ring-emerald-900/40">
                  <span aria-hidden className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                  <div>
                    <div className="font-medium">Product shipping cadence</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Soft signal, but unusually high-weighted at frontier labs.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-emerald-50/40 px-4 py-3 ring-1 ring-emerald-100/80 dark:bg-emerald-950/20 dark:ring-emerald-900/40">
                  <span aria-hidden className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                  <div>
                    <div className="font-medium">TypeScript / React depth</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      26% of applied_ai JDs explicitly list it.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-emerald-50/40 px-4 py-3 ring-1 ring-emerald-100/80 dark:bg-emerald-950/20 dark:ring-emerald-900/40">
                  <span aria-hidden className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                  <div>
                    <div className="font-medium">CI/CD + Docker discipline</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Directly transferable to model-serving infrastructure.
                    </div>
                  </div>
                </li>
              </ul>
            </section>

            {/* Top gaps */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">
                Top leverage gaps · ranked
              </h2>
              <ol className="mt-4 space-y-5">
                <li className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/60 to-white p-6 shadow-sm ring-1 ring-amber-200/60 sm:p-7 dark:from-amber-950/20 dark:to-zinc-900/40 dark:ring-amber-900/40">
                  <span aria-hidden className="absolute right-5 top-5 text-[11px] font-mono uppercase tracking-[0.15em] text-amber-700/70 dark:text-amber-400/70">
                    Top priority
                  </span>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-base font-semibold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
                      1
                    </span>
                    <h3 className="text-xl font-semibold tracking-tight">
                      Python production AI workflows
                    </h3>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      55% of applied_ai JDs
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    Your Python is scripting-only. The role expects you to wire
                    LLM APIs into production paths: RAG retrieval, evaluation
                    harnesses, structured output, prompt versioning.
                  </p>
                  <blockquote className="mt-4 border-l-2 border-amber-400 pl-4 text-xs italic text-zinc-600 dark:border-amber-700 dark:text-zinc-400">
                    &quot;Build, evaluate, and ship LLM-powered features in
                    production.&quot;
                    <br />— Anthropic · jd_000017
                  </blockquote>
                </li>
                <li className="rounded-2xl bg-zinc-50/60 p-5 ring-1 ring-zinc-200/70 dark:bg-zinc-900/40 dark:ring-zinc-800/70">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      2
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Eval-driven development
                    </h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      48% of applied_ai JDs
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    Promptfoo / Ragas / custom regression suites. Without an
                    eval loop you can&apos;t iterate on LLM features safely. Your
                    test-engineering instincts transfer cleanly here.
                  </p>
                  <blockquote className="mt-3 border-l-2 border-amber-300 pl-3 text-xs italic text-zinc-600 dark:border-amber-700 dark:text-zinc-400">
                    &quot;Maintain offline + online evals to prevent regression
                    on customer-shipping prompts.&quot;
                    <br />— Cursor · jd_000412
                  </blockquote>
                </li>
                <li className="rounded-2xl bg-zinc-50/60 p-5 ring-1 ring-zinc-200/70 dark:bg-zinc-900/40 dark:ring-zinc-800/70">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      3
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Agent orchestration patterns
                    </h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      31% of applied_ai JDs
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    Tool-calling, state machines, multi-step planning. Frame
                    LangGraph as the entry point; you already know how to think
                    in state from your Redux background.
                  </p>
                </li>
                <li className="rounded-2xl bg-zinc-50/60 p-5 ring-1 ring-zinc-200/70 dark:bg-zinc-900/40 dark:ring-zinc-800/70">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      4
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Vector retrieval + embeddings basics
                    </h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      27% of applied_ai JDs
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    pgvector or Chroma is enough at first. Skip the
                    custom-vector-DB rabbit-hole until you have a real
                    bottleneck.
                  </p>
                </li>
                <li className="rounded-2xl bg-zinc-50/60 p-5 ring-1 ring-zinc-200/70 dark:bg-zinc-900/40 dark:ring-zinc-800/70">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      5
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Cloud platform for ML workloads
                    </h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      19% of applied_ai JDs
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    Modal or Fly.io is fine to start. Stronger signal for staff+
                    roles than for L4/L5; pick one and ship.
                  </p>
                </li>
              </ol>
            </section>

            {/* Recommended project */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:text-indigo-400">
                One project to build next · 2 weeks
              </h2>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-white p-6 ring-1 ring-indigo-100/80 dark:from-indigo-950/30 dark:to-zinc-900/40 dark:ring-indigo-900/40">
                <h3 className="text-xl font-semibold tracking-tight">
                  Agent workflow debugger with eval traces
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  Build a small CLI + web UI that runs a 3-tool LangGraph
                  agent over a fixed task set, logs each LLM call with
                  inputs/outputs/timings, and produces a Promptfoo eval
                  report at the end. Ship it as a public GitHub repo with a
                  one-paragraph README that frames the design choices.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    LangGraph
                  </span>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Promptfoo
                  </span>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Anthropic SDK
                  </span>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    pgvector
                  </span>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Modal
                  </span>
                </div>
              </div>
            </section>

            {/* 7-day action plan */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                First seven days · concrete plan
              </h2>
              <ol className="mt-5 overflow-hidden rounded-2xl ring-1 ring-zinc-200/70 dark:ring-zinc-800/70">
                {[
                  ["1", "Read 5 applied_ai JDs end-to-end (Anthropic, Cursor, Cohere, Together AI, NVIDIA). Take notes on language."],
                  ["2", "Stand up the Anthropic SDK locally. Ship a tiny single-prompt CLI that takes a query and returns a structured JSON."],
                  ["3", "Add a second tool to the agent (web search). Wire it through LangGraph."],
                  ["4", "Add a third tool (pgvector lookup over your own document set). Write the chunking strategy in the README."],
                  ["5", "Add a Promptfoo eval suite with 10 representative tasks. Make the scores reproducible."],
                  ["6", "Add an eval-trace viewer (a tiny Next.js page over the run logs). This is where your frontend depth shines."],
                  ["7", "Deploy on Modal. Write a 1-paragraph design note. Open the repo. Reassess in 7 more days."],
                ].map(([day, copy], i) => (
                  <li
                    key={day}
                    className={`flex items-start gap-5 px-5 py-4 text-sm ${
                      i % 2 === 0
                        ? "bg-white dark:bg-zinc-900/30"
                        : "bg-zinc-50/60 dark:bg-zinc-900/50"
                    } ${i > 0 ? "border-t border-zinc-200/70 dark:border-zinc-800/70" : ""}`}
                  >
                    <div className="flex shrink-0 items-baseline gap-1.5 font-mono text-xs">
                      <span className="text-zinc-400">Day</span>
                      <span className="text-base font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">{day}</span>
                    </div>
                    <span className="leading-relaxed text-zinc-700 dark:text-zinc-300">{copy}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Honest note */}
            <section className="rounded-2xl bg-zinc-50/60 px-5 py-4 text-sm leading-relaxed text-zinc-600 ring-1 ring-zinc-200/60 dark:bg-zinc-900/40 dark:text-zinc-400 dark:ring-zinc-800/60">
              <strong className="text-zinc-800 dark:text-zinc-200">Honest note · </strong>
              This is a static fictional report. The real product reads your
              actual resume, classifies your stated target into one of 8
              archetypes, then grounds every claim in real percentages from the
              JD corpus and quotes five evidence JDs by ID. The structure you
              see here is representative of the real output.
            </section>
          </div>
        </article>

        {/* CTAs */}
        <div className="mx-auto mt-12 flex flex-wrap justify-center gap-3 sm:mt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Generate my own report
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/#samples"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            Try a fictional sample
            <span aria-hidden>→</span>
          </Link>
        </div>
      </main>

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
              <Link href="/snapshot-pipeline" className="hover:text-zinc-700 dark:hover:text-zinc-300">
                Pipeline snapshot
              </Link>
              <Link href="/lab" className="hover:text-zinc-700 dark:hover:text-zinc-300">
                Lab
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
