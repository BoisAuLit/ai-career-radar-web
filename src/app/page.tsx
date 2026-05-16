"use client";

import { useRef, useState } from "react";
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
        body: JSON.stringify({ resume, target, classification: cls }),
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
        body: JSON.stringify({ report_markdown: report, classification }),
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
      <header className="mb-8">
        <h1 className="text-2xl font-bold">AI Career Radar</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Paste or upload your resume + the role you want. Get an evidence-grounded gap
          report against <strong>443 real AI engineering JDs</strong> from frontier labs,
          big tech, AI scaleups, and infra companies.
        </p>
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
        </>
      )}

      {stage === "error" && (
        <section className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <div className="mb-1 font-medium">Failed</div>
          <div className="whitespace-pre-wrap break-words font-mono text-xs">{errMsg}</div>
        </section>
      )}

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
        Powered by 443 real AI engineering JDs · Claude Sonnet 4.6 · Haiku 4.5 for evals ·
        Single-shot, evidence-grounded · Built for senior engineers pivoting to AI.
      </footer>
    </div>
  );
}
