"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Classification } from "@/lib/types";

// ─── Local types (avoid server-only imports in client component) ─────────────

interface ReportEvalResult {
  groundedness: number;
  specificity: number;
  actionability: number;
  details: {
    groundedness: {
      n_claims: number;
      n_grounded: number;
      ungrounded_examples: string[];
    };
    specificity: {
      n_recommendations: number;
      n_specific: number;
      vague_examples: string[];
    };
    actionability: {
      n_recommendations: number;
      n_actionable: number;
      blocking_examples: string[];
    };
  };
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="mb-2 mt-4 text-xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-4 border-b border-zinc-200 pb-1 text-lg font-semibold dark:border-zinc-800">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-3 text-base font-semibold">{children}</h3>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-zinc-300 pl-3 italic text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = (className ?? "").startsWith("language-");
    if (isBlock) {
      return <code className="block whitespace-pre-wrap break-words font-mono text-xs">{children}</code>;
    }
    return <code className="rounded bg-zinc-200 px-1 py-0.5 font-mono text-xs dark:bg-zinc-700">{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-zinc-300 dark:border-zinc-700">{children}</thead>,
  th: ({ children }) => <th className="px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-zinc-200 px-2 py-1 dark:border-zinc-800">{children}</td>,
  hr: () => <hr className="my-3 border-zinc-300 dark:border-zinc-700" />,
};

const EXAMPLE_RESUME = `Paste your resume here in plain text, or upload a PDF (button above).

The tool works best with at least one job (with bullets describing what you did) and a list of your technical skills with years of experience.`;

const EXAMPLE_TARGET = `Describe in 1-3 sentences what role you want — or pick a preset above.`;

const TARGET_PRESETS: { label: string; text: string }[] = [
  {
    label: "Applied AI · frontier lab",
    text:
      "Applied AI Engineer at a frontier lab (Anthropic, OpenAI, Cohere). Customer-facing, ship to production, not pure research. Remote or US/EU.",
  },
  {
    label: "Forward Deployed",
    text:
      "Forward Deployed Engineer at Anthropic, Cohere, or Sierra. Customer-embedded, helping enterprise customers deploy AI in production.",
  },
  {
    label: "LLM Infrastructure",
    text:
      "LLM Infrastructure Engineer at NVIDIA, Together AI, Fireworks, or Modal. Inference optimization, GPU systems, model serving.",
  },
  {
    label: "Agent Engineering",
    text:
      "Agent Engineering at Cursor (Anysphere), Sierra, or Cohere. Build coding/operations agents — multi-step tool use, planning, orchestration.",
  },
  {
    label: "LLM Evaluation",
    text:
      "LLM Evaluation Engineer at Arize, Anthropic, or Glean. Build eval harnesses, observability, and model-quality systems.",
  },
];

type Stage = "idle" | "classifying" | "generating" | "done" | "error";

function buildFeedbackMailto(
  classification: Classification,
  evalResult: ReportEvalResult | null,
  ref: string | null,
): string {
  const evalLine = evalResult
    ? `gr ${evalResult.groundedness.toFixed(2)} · sp ${evalResult.specificity.toFixed(2)} · ac ${evalResult.actionability.toFixed(2)}`
    : "(I did not run the meta-eval)";
  const companies =
    classification.company_preferences?.length > 0
      ? classification.company_preferences.join(", ")
      : "(none named)";
  const subject = `AI Career Radar feedback — ${classification.archetype}`;
  const body = [
    "Hi Bohao,",
    "",
    "Just ran AI Career Radar. Here's my feedback:",
    "",
    "1. ONE specific thing I'll try in the next week because of this report:",
    "[your answer here]",
    "",
    "2. Was that already on my radar before reading?",
    "[ ] Yes, already planning to do this",
    "[ ] Sort of — the report sharpened it",
    "[ ] No, this is genuinely new / non-obvious to me",
    "",
    "3. Anything that felt off, surprised me, or suggestions:",
    "[optional]",
    "",
    "---",
    "Auto-attached context (please don't edit):",
    `- Target classification: ${classification.archetype}`,
    `- Level hint: ${classification.level_hint}`,
    `- Companies I named: ${companies}`,
    `- Eval scores I saw: ${evalLine}`,
    `- Referred via: ${ref || "(direct visit)"}`,
    `- Time: ${new Date().toISOString()}`,
    "",
    "Thanks 🙏",
  ].join("\n");
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function scoreBg(s: number): string {
  if (s >= 0.8) return "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900";
  if (s >= 0.5) return "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900";
  return "bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-900";
}
function scoreText(s: number): string {
  if (s >= 0.8) return "text-emerald-700 dark:text-emerald-400";
  if (s >= 0.5) return "text-amber-700 dark:text-amber-400";
  return "text-red-700 dark:text-red-400";
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${scoreBg(score)}`}>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`text-xl font-bold ${scoreText(score)}`}>{score.toFixed(2)}</div>
    </div>
  );
}

const FEEDBACK_EMAIL =
  process.env.NEXT_PUBLIC_FEEDBACK_EMAIL || "arthur130237@hotmail.com";

const REF_STORAGE_KEY = "acr:ref";

export default function Page() {
  const [resume, setResume] = useState("");
  const [target, setTarget] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [classification, setClassification] = useState<Classification | null>(null);
  const [report, setReport] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // PDF upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfErr, setPdfErr] = useState("");
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);

  // Eval
  const [evalRunning, setEvalRunning] = useState(false);
  const [evalErr, setEvalErr] = useState("");
  const [evalResult, setEvalResult] = useState<ReportEvalResult | null>(null);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Phase 5 #3 · Per-company deep dive
  const [eligibleCompanies, setEligibleCompanies] = useState<
    {
      name: string;
      n_jds: number;
      archetype_distribution: Record<string, number>;
    }[]
  >([]);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/companies")
      .then((r) => (r.ok ? r.json() : { companies: [] }))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.companies)) {
          setEligibleCompanies(data.companies);
        }
      })
      .catch(() => {
        /* non-fatal: deep-dive is optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Referrer tracking — captured from ?ref=<name> on first visit, persisted to
  // localStorage so it survives reloads after a report is generated.
  const [ref, setRef] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("ref");
      if (fromUrl) {
        const clean = fromUrl.slice(0, 64).replace(/[^a-zA-Z0-9_\-.]/g, "");
        if (clean) {
          window.localStorage.setItem(REF_STORAGE_KEY, clean);
          setRef(clean);
          return;
        }
      }
      const stored = window.localStorage.getItem(REF_STORAGE_KEY);
      if (stored) setRef(stored);
    } catch {
      /* ignore — incognito sometimes throws on localStorage */
    }
  }, []);

  const isBusy = stage === "classifying" || stage === "generating";

  async function handlePdfUpload(file: File) {
    setPdfUploading(true);
    setPdfErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `extract failed (${res.status})`);
      setResume(data.text);
      setPdfFilename(data.filename);
    } catch (e) {
      setPdfErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPdfUploading(false);
    }
  }

  async function handleSubmit() {
    if (!resume.trim() || !target.trim() || isBusy) return;
    setStage("classifying");
    setClassification(null);
    setReport("");
    setErrMsg("");
    setEvalResult(null);
    setEvalErr("");
    setCopied(false);

    try {
      const cRes = await fetch("/api/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target }),
      });
      if (!cRes.ok) {
        const err = await cRes.json().catch(() => ({ error: cRes.statusText }));
        throw new Error(err.error || `classify failed (${cRes.status})`);
      }
      const cls: Classification = await cRes.json();
      setClassification(cls);

      setStage("generating");
      const gRes = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resume,
          target,
          classification: cls,
          company_filter: companyFilter || undefined,
        }),
      });
      if (!gRes.ok || !gRes.body) {
        const err = await gRes.json().catch(() => ({ error: gRes.statusText }));
        throw new Error(err.error || `generate failed (${gRes.status})`);
      }
      const reader = gRes.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setReport(accumulated);
      }
      setStage("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : String(e));
      setStage("error");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function handleDownload() {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    a.href = url;
    a.download = `gap-report-${stamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleRunEval() {
    if (!report || !classification || evalRunning) return;
    setEvalRunning(true);
    setEvalErr("");
    try {
      const res = await fetch("/api/eval-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ report_markdown: report, classification, resume_text: resume }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `eval failed (${res.status})`);
      setEvalResult(data as ReportEvalResult);
    } catch (e) {
      setEvalErr(e instanceof Error ? e.message : String(e));
    } finally {
      setEvalRunning(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-2 inline-block rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          For senior engineers pivoting into AI
        </div>
        <h1 className="text-3xl font-bold tracking-tight">AI Career Radar</h1>
        <p className="mt-2 text-base text-zinc-700 dark:text-zinc-300">
          What AI companies actually hire for — distilled from <strong>443 real JDs</strong>
          across frontier labs, big tech, AI scaleups, and infra companies.
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Paste resume + describe the role you want. Get a personalized 5-section gap
          report in ~60s.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-md border border-zinc-300 px-2 py-0.5 dark:border-zinc-700">
            Quality (V1, LLM-graded): <strong className="text-zinc-700 dark:text-zinc-300">gr 0.93 · sp 0.83 · ac 0.82</strong>
          </span>
          <a
            href="#how-it-works"
            className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            How does this work?
          </a>
        </div>
      </header>

      <section className="space-y-4">
        {/* Resume input with PDF upload */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="resume">
              Your resume (plain text or PDF)
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePdfUpload(f);
                  e.target.value = ""; // allow re-selecting same file
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={pdfUploading || isBusy}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {pdfUploading ? "Extracting..." : "📎 Upload PDF"}
              </button>
              {pdfFilename && (
                <span className="text-xs text-zinc-500">
                  loaded <code className="font-mono">{pdfFilename}</code>
                </span>
              )}
            </div>
          </div>
          {pdfErr && (
            <div className="mb-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {pdfErr}
            </div>
          )}
          <textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder={EXAMPLE_RESUME}
            rows={12}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={isBusy || pdfUploading}
          />
        </div>

        {/* Target with presets */}
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="target">
            Target role (1-3 sentences)
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {TARGET_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setTarget(p.text)}
                disabled={isBusy}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                {p.label}
              </button>
            ))}
          </div>
          <textarea
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={EXAMPLE_TARGET}
            rows={4}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={isBusy}
          />
        </div>

        {/* Phase 5 #3 · Optional per-company deep dive */}
        {eligibleCompanies.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="company">
              Focus on a specific company? <span className="font-normal text-zinc-500">(optional — deep-dive mode)</span>
            </label>
            <select
              id="company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              disabled={isBusy}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">No deep dive — use full corpus for the target archetype</option>
              {eligibleCompanies.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.n_jds} JDs in corpus)
                </option>
              ))}
            </select>
            {companyFilter && (() => {
              const co = eligibleCompanies.find((c) => c.name === companyFilter);
              if (!co) return null;
              const breakdown = Object.entries(co.archetype_distribution)
                .sort((a, b) => b[1] - a[1])
                .map(([a, n]) => `${a} (${n})`)
                .join(", ");
              return (
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-zinc-500">
                    Deep-dive mode: the report will contrast {companyFilter} JDs against the industry-wide archetype baseline.
                  </p>
                  <p className="text-xs text-zinc-500">
                    {companyFilter}&apos;s {co.n_jds} JDs by archetype: <span className="font-mono">{breakdown}</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    If your target archetype above has fewer than 3 JDs, the report will lean on industry-wide patterns rather than {companyFilter}-specific signals (and will say so honestly).
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!resume.trim() || !target.trim() || isBusy}
            className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
          >
            {stage === "classifying"
              ? "Classifying target..."
              : stage === "generating"
              ? "Streaming report..."
              : companyFilter
              ? `Generate ${companyFilter} deep-dive report`
              : "Generate gap report"}
          </button>
          <span className="text-xs text-zinc-500">Two LLM calls. ~$0.05, ~60s.</span>
        </div>
      </section>

      {classification && (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
            Target classification
          </div>
          <div className="mb-2">
            Archetype:{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">
              {classification.archetype}
            </code>{" "}
            · Level hint:{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">
              {classification.level_hint}
            </code>
            {classification.company_preferences?.length > 0 && (
              <>
                {" "}
                · Companies named:{" "}
                <span className="text-zinc-600 dark:text-zinc-400">
                  {classification.company_preferences.join(", ")}
                </span>
              </>
            )}
          </div>
          <div className="text-zinc-700 dark:text-zinc-300">
            <em>{classification.reasoning}</em>
          </div>
        </section>
      )}

      {(stage === "generating" || stage === "done") && (
        <>
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {report || "..."}
            </ReactMarkdown>
          </section>

          {stage === "done" && (
            <section className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                {copied ? "✓ Copied" : "📋 Copy report"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                ⬇️ Download .md
              </button>
              {!evalResult && (
                <button
                  type="button"
                  onClick={handleRunEval}
                  disabled={evalRunning}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  {evalRunning ? "Scoring (3 parallel judges)..." : "📊 Eval this report"}
                </button>
              )}
            </section>
          )}

          {evalErr && (
            <section className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {evalErr}
            </section>
          )}

          {evalResult && (
            <section className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <ScoreCard label="Groundedness" score={evalResult.groundedness} />
                <ScoreCard label="Specificity" score={evalResult.specificity} />
                <ScoreCard label="Actionability" score={evalResult.actionability} />
              </div>
              <details className="rounded-xl border border-zinc-200 bg-zinc-50 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
                <summary className="cursor-pointer select-none px-3 py-2 font-medium text-zinc-600 dark:text-zinc-400">
                  Eval rationales (what the judges flagged)
                </summary>
                <div className="space-y-3 border-t border-zinc-200 px-3 py-3 text-[11px] dark:border-zinc-800">
                  <div>
                    <strong>Groundedness</strong> — {evalResult.details.groundedness.n_grounded} of {evalResult.details.groundedness.n_claims} factual claims grounded in the supplied profile / evidence.
                    {evalResult.details.groundedness.ungrounded_examples.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-zinc-600 dark:text-zinc-400">
                        {evalResult.details.groundedness.ungrounded_examples.map((q, i) => (
                          <li key={i}>
                            <em>&quot;{q}&quot;</em> — ungrounded
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <strong>Specificity</strong> — {evalResult.details.specificity.n_specific} of {evalResult.details.specificity.n_recommendations} recommendations have a named tool/resource + time bound + concrete output.
                    {evalResult.details.specificity.vague_examples.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-zinc-600 dark:text-zinc-400">
                        {evalResult.details.specificity.vague_examples.map((q, i) => (
                          <li key={i}>
                            <em>&quot;{q}&quot;</em> — vague
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <strong>Actionability</strong> — {evalResult.details.actionability.n_actionable} of {evalResult.details.actionability.n_recommendations} recommendations executable by the user given their background.
                    {evalResult.details.actionability.blocking_examples.length > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-zinc-600 dark:text-zinc-400">
                        {evalResult.details.actionability.blocking_examples.map((q, i) => (
                          <li key={i}>
                            <em>&quot;{q}&quot;</em> — blocking
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </details>
            </section>
          )}

          {stage === "done" && classification && (
            <section className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-2 text-sm font-semibold">💌 Tell the builder what surprised you</h3>
              <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">
                One-click email with the classification context auto-attached. Tell the
                builder whether anything in the report was non-obvious — that single
                answer is what makes Phase 4 validation real.
              </p>
              <a
                href={buildFeedbackMailto(classification, evalResult, ref)}
                className="inline-block rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                💌 Send feedback to builder
              </a>
              {ref && (
                <p className="mt-2 text-[11px] text-zinc-500">
                  Referred via <code className="font-mono">?ref={ref}</code> — will be
                  attached to your email so the builder knows which invite you came from.
                </p>
              )}
            </section>
          )}
        </>
      )}

      {stage === "error" && (
        <section className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <div className="mb-1 font-medium">Failed</div>
          <div className="whitespace-pre-wrap break-words font-mono text-xs">{errMsg}</div>
        </section>
      )}

      <section id="how-it-works" className="mt-12 space-y-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">How this works</h2>
        <ol className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-black">
              1
            </span>
            <span>
              <strong>Classify your target</strong> into one of <strong>8 AI engineering archetypes</strong>{" "}
              — <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">applied_ai</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">forward_deployed</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">llm_infra</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">agent_engineering</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">eval</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">research_engineer</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">ml_engineer</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">other</code>. The
              classifier is brutal about title-vs-reality: &quot;Applied AI Engineer at
              Anthropic&quot; is often actually <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">forward_deployed</code>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-black">
              2
            </span>
            <span>
              <strong>Build a real skill profile</strong> for that archetype from the
              43–102 JDs in the corpus that match it. Top skills with %, top hiring
              companies, evidence quotes — all derived from real postings, not surveys.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-black">
              3
            </span>
            <span>
              <strong>Generate a personalized 5-section report</strong> grounded in
              that profile + 5 evidence JDs: what you already have · top 5 gaps ranked
              · what you might be over-prioritizing · single highest-leverage next action.
              Quantitative claims are clamped to numbers in the supplied profile (no
              hallucinated stats).
            </span>
          </li>
        </ol>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h3 className="mb-2 text-base font-semibold">Quality (V1 LLM-graded baseline)</h3>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Four representative reports were graded by Claude Haiku 4.5 on three
            metrics. <strong>The eval is reproducible from the repo.</strong>
          </p>
          <div className="mb-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/40">
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">Groundedness</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">0.93</div>
            </div>
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/40">
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">Specificity</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">0.83</div>
            </div>
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/40">
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">Actionability</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">0.82</div>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Each generated report has a <strong>📊 Eval this report</strong> button so
            you can grade your own report and see exactly which claims the judge
            considered ungrounded, vague, or blocking.
          </p>
        </div>

        <div className="text-xs text-zinc-500">
          <strong>Privacy:</strong> Your resume is sent only to Anthropic&apos;s API for
          generation and is not stored or logged server-side beyond the duration of the
          request. Each report is generated fresh; nothing is persisted across visits.
        </div>
      </section>

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
        Powered by 443 real AI engineering JDs · Claude Sonnet 4.6 · Haiku 4.5 for evals ·
        Single-shot, evidence-grounded · Built for senior engineers pivoting to AI.
      </footer>
    </div>
  );
}
