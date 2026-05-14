"use client";

import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Classification } from "@/lib/types";

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
    <pre className="my-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
      {children}
    </pre>
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

const EXAMPLE_RESUME = `Paste your resume here in plain text.

The tool works best with at least one job (with bullets describing what you did) and a list of your technical skills with years of experience.`;

const EXAMPLE_TARGET = `Describe in 1-3 sentences what role you want.

Example: "I want to be an Applied AI Engineer at a frontier lab (Anthropic, OpenAI, Cohere). Customer-facing, ship to production, not pure research. Remote or SF Bay Area."`;

type Stage = "idle" | "classifying" | "generating" | "done" | "error";

export default function Page() {
  const [resume, setResume] = useState("");
  const [target, setTarget] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [classification, setClassification] = useState<Classification | null>(null);
  const [report, setReport] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const isBusy = stage === "classifying" || stage === "generating";

  async function handleSubmit() {
    if (!resume.trim() || !target.trim() || isBusy) return;
    setStage("classifying");
    setClassification(null);
    setReport("");
    setErrMsg("");

    try {
      // Step 1: classify
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

      // Step 2: stream the report
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

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">AI Career Radar</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Paste your resume + the role you want. Get an evidence-grounded gap report
          against <strong>443 real AI engineering JDs</strong> from frontier labs, big
          tech, AI scaleups, and infra companies.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="resume">
            Your resume (plain text)
          </label>
          <textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder={EXAMPLE_RESUME}
            rows={12}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={isBusy}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="target">
            Target role (1-3 sentences)
          </label>
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
          <span className="text-xs text-zinc-500">
            Two LLM calls. ~$0.05, ~60s.
          </span>
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
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {report || "..."}
          </ReactMarkdown>
        </section>
      )}

      {stage === "error" && (
        <section className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <div className="mb-1 font-medium">Failed</div>
          <div className="whitespace-pre-wrap break-words font-mono text-xs">{errMsg}</div>
        </section>
      )}

      <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
        Powered by 443 real AI engineering JDs · Claude Sonnet 4.6 · Single-shot,
        evidence-grounded · Built for senior engineers pivoting to AI.
      </footer>
    </div>
  );
}
