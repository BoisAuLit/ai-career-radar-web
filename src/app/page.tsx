"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

// Demo mode — fictional resume + target pairs. Useful for new visitors
// who want to see the product work before pasting their real resume.
// Each persona is bluntly marked as fictional in the UI; do NOT use real
// names. Keep resumes ~600-900 chars: long enough to produce a meaningful
// gap report, short enough to keep the bundle small.
const SAMPLE_PERSONAS: {
  id: string;
  label: string;
  blurb: string;
  resume: string;
  target: string;
}[] = [
  {
    id: "frontend_to_applied_ai",
    label: "Frontend → Applied AI",
    blurb: "7yr JS/React shipping product features → applied AI at an LLM-product company",
    resume: `Pat Example — Frontend Engineer (FICTIONAL SAMPLE)

KEY SKILLS
- TypeScript (7y), JavaScript (8y), Python (3y, scripting only)
- React (7y), Next.js (4y), Redux/Zustand, Tailwind, Storybook
- Jest, Playwright, Cypress; visual regression; BDD/Gherkin
- Docker (3y), GitHub Actions, Vercel deploys

EXPERIENCE
Senior Frontend Engineer · 2022–present · MidSizeSaaS
- Led migration of a B2B dashboard from CRA → Next.js App Router
- Shipped ~12 product features touching billing, onboarding, analytics
- Mentored 3 juniors; ran the frontend hiring loop
- Built a Storybook + visual-regression pipeline; cut UI bug escapes ~60%

Frontend Engineer · 2019–2022 · ConsumerStartup
- Greenfield React app; built design system from scratch
- Worked with PMs/designers; A/B tested 8 features

Education: BS in Computer Science, 2019`,
    target:
      "Applied AI Engineer at an LLM-product company (e.g., Anthropic, OpenAI, Cursor). Ship customer-facing AI features in production; not pure research. Comfortable with TypeScript + Python; want to grow into the AI stack (RAG, agents, eval).",
  },
  {
    id: "backend_to_llm_infra",
    label: "Backend → LLM Infra",
    blurb: "8yr Go/Python distributed systems → LLM infrastructure / inference",
    resume: `Sam Example — Backend Engineer (FICTIONAL SAMPLE)

KEY SKILLS
- Go (6y), Python (8y), Rust (1y hobby)
- Kubernetes (4y), Helm, Terraform; AWS (5y) — EKS, S3, RDS, Lambda
- gRPC, Protobuf, REST; PostgreSQL, Redis, Kafka
- Prometheus, Grafana, distributed tracing (OpenTelemetry)
- Docker, CI/CD (GitHub Actions, ArgoCD)

EXPERIENCE
Staff Backend Engineer · 2020–present · PaymentsCo
- Led migration of monolithic payments service → 7 microservices on EKS
- Built a request-coalescing layer that cut p99 latency ~40%
- On-call lead for 18 months; wrote the SLO/SLI framework
- Mentored 5 engineers across two teams

Senior Backend Engineer · 2017–2020 · LogisticsStartup
- Designed an event-sourced order-state machine (Kafka + Go)
- Built the team's load-testing harness (k6)

Education: BS in EECS, 2016`,
    target:
      "LLM Infrastructure Engineer at NVIDIA, Together AI, Fireworks, Modal, or similar. Inference optimization, GPU systems, model serving at scale. Strong systems background, less ML; want to grow into CUDA + vLLM-style serving.",
  },
  {
    id: "data_eng_to_ai_platform",
    label: "Data Eng → AI Platform",
    blurb: "6yr Spark/Airflow/dbt → data engineering for AI / eval datasets / training data",
    resume: `Jordan Example — Data Engineer (FICTIONAL SAMPLE)

KEY SKILLS
- Python (8y), SQL (8y), Scala (3y)
- Apache Spark (6y), Apache Airflow (5y), dbt (3y)
- Snowflake (4y), BigQuery (2y), Postgres
- Kafka, Kinesis; AWS (Glue, EMR, S3, Athena)
- Great Expectations, dbt tests, data-quality SLAs

EXPERIENCE
Senior Data Engineer · 2021–present · AdTechCo
- Owned the clickstream pipeline (5B rows/day) — Spark on EMR
- Built dbt models powering exec dashboards; 200+ models, 95% test coverage
- Designed a metric-store layer that cut analyst SQL time ~50%
- Mentored 2 juniors; led data-quality reviews

Data Engineer · 2018–2021 · RetailAnalytics
- Built the company's first Airflow deployment from scratch
- Migrated batch ETLs from Hive → Spark

Education: MS in Statistics, 2018`,
    target:
      "Data engineering for AI / AI platform role. Building training data pipelines, eval datasets, fine-tuning data prep, and the data infrastructure underneath an LLM product team. Companies: Scale AI, Anthropic, OpenAI, Cohere.",
  },
  {
    id: "ml_phd_to_research_engineer",
    label: "ML PhD → Research Engineer",
    blurb: "ML PhD (NLP) + 3yr post-PhD → research engineer at a frontier lab",
    resume: `Riley Example — Research Engineer (FICTIONAL SAMPLE)

KEY SKILLS
- Python (10y), PyTorch (6y), JAX (2y)
- Distributed training (DeepSpeed, FSDP); CUDA basics; H100 clusters
- HuggingFace ecosystem; vLLM for serving experiments
- 4 first-author NLP papers (EMNLP, ACL); ~80 citations

EXPERIENCE
ML Engineer / Researcher · 2022–present · AppliedML Startup
- Led pre-training experiments for a 7B domain model; ran scaling ablations
- Built the team's eval harness (10+ benchmarks, auto-promotion gates)
- Co-authored 2 papers on retrieval-augmented fine-tuning

PhD in Machine Learning · 2018–2022 · State University
- Thesis: efficient attention variants for long-context language models
- TA'd two grad-level ML courses

Education: PhD ML 2022, BS CS 2018`,
    target:
      "Research Engineer at a frontier lab (Anthropic, OpenAI, Google DeepMind, Meta FAIR). Bridge between research and production — implement papers, run experiments at scale, ship to internal users. NOT pure research scientist.",
  },
];

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

// Human-friendly error categorizer. Maps raw error text to a category +
// friendly title + hint while preserving the raw message for debugging.
function categorizeError(raw: string): { title: string; hint: string } {
  const m = raw.toLowerCase();
  if (m.includes("pdf") || m.includes("extract") || m.includes("encrypted")) {
    return {
      title: "Couldn't read that PDF",
      hint:
        "Some PDFs are scanned images or encrypted. Try pasting your resume as plain text instead.",
    };
  }
  if (m.includes("rate limit") || m.includes("429")) {
    return {
      title: "Rate-limited by the model API",
      hint: "Wait ~30s and try again. This is set by Anthropic, not the app.",
    };
  }
  if (m.includes("timeout") || m.includes("aborted")) {
    return {
      title: "Request timed out",
      hint:
        "The model took longer than ~60s. Unusual — retrying once usually fixes it.",
    };
  }
  if (m.includes("network") || m.includes("fetch failed") || m.includes("failed to fetch")) {
    return {
      title: "Network error",
      hint: "Check your connection and try again.",
    };
  }
  if (m.includes("classify")) {
    return {
      title: "Couldn't classify your target role",
      hint:
        "If your target is very short or vague, try writing 1–3 sentences describing what you'd actually do day-to-day.",
    };
  }
  if (m.includes("generate")) {
    return {
      title: "Couldn't generate the report",
      hint:
        "The model API call failed mid-stream. Retrying usually works; if it persists, the model service may be temporarily degraded.",
    };
  }
  return {
    title: "Something went wrong",
    hint: "Please try again. The raw error is below for debugging.",
  };
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

  function loadSample(persona: (typeof SAMPLE_PERSONAS)[number]) {
    setResume(persona.resume);
    setTarget(persona.target);
    setPdfFilename(null);
    setPdfErr("");
    setErrMsg("");
    setReport("");
    setClassification(null);
    setEvalResult(null);
    setEvalErr("");
    setStage("idle");
  }

  function handleStartOver() {
    setResume("");
    setTarget("");
    setStage("idle");
    setClassification(null);
    setReport("");
    setErrMsg("");
    setEvalResult(null);
    setEvalErr("");
    setCopied(false);
    setPdfErr("");
    setPdfFilename(null);
    setCompanyFilter("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="min-h-dvh w-full bg-gradient-to-b from-white via-zinc-50/60 to-white text-zinc-900 dark:from-zinc-950 dark:via-zinc-900/40 dark:to-zinc-950 dark:text-zinc-100">
      {/* ─────────────────── Sticky navbar ─────────────────── */}
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
            <Link href="/snapshot-pipeline" className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100">
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

      <main className="mx-auto w-full max-w-7xl px-6 sm:px-8">

      {/* ─────────────────── Hero (Apple-style, big type, single column) ─────────────────── */}
      <section className="relative pt-20 pb-12 text-center sm:pt-28 sm:pb-16 lg:pt-36">
        {/* Soft radial glow behind hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%)] dark:bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(99,102,241,0.16),transparent_70%)]" />
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Know exactly{" "}
          <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:via-zinc-300 dark:to-zinc-500">
            what to build next.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 sm:mt-8 sm:text-xl dark:text-zinc-400">
          AI Career Radar compares your resume against what AI companies
          actually hire for — distilled from{" "}
          <span className="text-zinc-900 dark:text-zinc-100">443 real AI engineering job posts</span>.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500 sm:text-base">
          For senior engineers moving into applied AI, LLM infrastructure,
          agent engineering, and frontier-lab roles.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3 sm:mt-12">
          <a
            href="#generator"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Generate my report
            <span aria-hidden>→</span>
          </a>
          <a
            href="#samples"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            See sample
            <span aria-hidden>↓</span>
          </a>
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 sm:text-sm dark:text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
            443 real JDs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
            Daily automated corpus
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
            Evidence-grounded
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
            No account required
          </span>
        </div>
      </section>

      {/* ─────────────────── Hero mock preview (large, premium card) ─────────────────── */}
      <section className="relative pb-24 sm:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-[400px] max-w-3xl bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.14),transparent_70%)]"
        />
        <div className="mx-auto max-w-4xl">
          <div
            aria-hidden
            className="relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-white via-white to-zinc-50 p-8 shadow-2xl shadow-zinc-300/40 sm:p-12 dark:border-zinc-800/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 dark:shadow-black/40"
          >
            <div className="mb-6 flex items-center justify-between border-b border-zinc-200/70 pb-5 dark:border-zinc-800/70">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Sample report</div>
                <div className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                  Target · Applied AI Engineer
                </div>
              </div>
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                applied_ai
              </span>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-10">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">
                  Already strong
                </div>
                <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <li>Frontend systems</li>
                  <li>Product shipping cadence</li>
                  <li>TypeScript / React depth</li>
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">
                  Highest-leverage gap
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  Python production AI workflows — RAG retrieval, evaluation
                  harnesses, agent orchestration.
                </p>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-700 dark:text-indigo-400">
                  Build next · 2 weeks
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  An agent workflow debugger with eval traces, shipped as a
                  public GitHub repo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── Three value pillars ─────────────────── */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What makes this different.
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="rounded-3xl bg-gradient-to-br from-white to-zinc-50/50 p-8 sm:p-10 dark:from-zinc-900/60 dark:to-zinc-900/20">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-lg text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              ◎
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Grounded in real jobs</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Built from 443 tracked AI engineering job posts, not generic
              career advice. Every claim traces back to a real posting.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white to-zinc-50/50 p-8 sm:p-10 dark:from-zinc-900/60 dark:to-zinc-900/20">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-lg text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              ↗
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Finds the leverage point</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Prioritizes the gaps most likely to change your trajectory —
              ranked by skill prevalence and how close you already are.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white to-zinc-50/50 p-8 sm:p-10 dark:from-zinc-900/60 dark:to-zinc-900/20">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-lg text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
              ⌘
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Turns gaps into projects</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Recommends what to build next so your portfolio matches the
              market — named tools, time bounds, concrete deliverables.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────── Sample personas (premium cards) ─────────────────── */}
      <section id="samples" className="scroll-mt-24 pb-24 sm:pb-32">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Try a fictional career pivot.
          </h2>
          <p className="mt-4 text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Load a made-up resume and target role. Nothing runs until you
            click Generate.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {SAMPLE_PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadSample(p)}
              disabled={isBusy}
              title={p.blurb}
              className="group relative flex h-full flex-col items-start gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-white to-zinc-50/60 p-7 text-left shadow-sm ring-1 ring-zinc-200/60 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/30 hover:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm dark:from-zinc-900/70 dark:to-zinc-900/30 dark:ring-zinc-800/60 dark:hover:ring-zinc-700 dark:hover:shadow-black/40"
            >
              <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {p.label}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {p.blurb}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-white">
                Load sample <span aria-hidden>→</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">
          Samples are fictional. Real resumes are never persisted server-side.
        </p>
      </section>

      {/* ─────────────────── Report generator workbench ─────────────────── */}
      <section id="generator" className="scroll-mt-24 pb-24 sm:pb-32">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Generate your personalized gap report.
          </h2>
          <p className="mt-4 text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Paste your resume, choose a target role, and get a five-section
            report in about a minute.
          </p>
        </div>
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-white to-zinc-50/60 p-7 shadow-xl shadow-zinc-300/30 ring-1 ring-zinc-200/70 sm:p-10 dark:from-zinc-900/80 dark:to-zinc-900/40 dark:shadow-black/40 dark:ring-zinc-800/70">
          <div className="space-y-6">

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

        {/* Privacy & trust — short version near the action button so it's read before submitting */}
        <details className="rounded-xl border border-zinc-200 bg-zinc-50/60 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
          <summary className="cursor-pointer select-none px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
            🔒 What happens to my resume? (1-min read)
          </summary>
          <div className="space-y-2 border-t border-zinc-200 px-3 py-3 leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            <p>
              <strong>Sent to:</strong> Anthropic&apos;s API (Claude Sonnet 4.6 for
              generation, Haiku 4.5 if you run the eval). Nothing else.
            </p>
            <p>
              <strong>Saved on this server:</strong> nothing. The request is
              proxied through the API route, streamed back to your browser, and
              dropped. No database, no logging of your resume or your report.
            </p>
            <p>
              <strong>Training:</strong> Anthropic&apos;s API does not use input
              data for model training by default (see their privacy policy).
              This app sends no opt-in for training.
            </p>
            <p>
              <strong>Stateless:</strong> each visit starts fresh. The only thing
              persisted in your browser is an optional <code>ref=</code> URL
              param (for attribution on feedback emails) — no resume content.
            </p>
            <p>
              <strong>Practical advice:</strong> don&apos;t paste anything you
              wouldn&apos;t put into a model context — phone numbers, full
              addresses, real client/employer secrets. The tool works fine on a
              lightly anonymized resume.
            </p>
            <p className="text-zinc-500">
              Want more detail? See the{" "}
              <Link className="underline" href="/methodology">
                methodology page
              </Link>
              .
            </p>
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!resume.trim() || !target.trim() || isBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:hover:bg-white"
          >
            {stage === "classifying"
              ? "Classifying target…"
              : stage === "generating"
              ? "Streaming report…"
              : companyFilter
              ? `Generate ${companyFilter} deep-dive report`
              : "Generate gap report"}
            {stage !== "classifying" && stage !== "generating" && <span aria-hidden>→</span>}
          </button>
          <span className="text-xs text-zinc-500">~$0.05 · ~60s · two LLM calls</span>
        </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── Report output region (centered, max-w-5xl) ─────────────────── */}
      <div className="mx-auto max-w-5xl pb-24 sm:pb-32">

      {classification && (
        <section className="mt-6 rounded-2xl bg-gradient-to-br from-zinc-50 to-white p-5 text-sm ring-1 ring-zinc-200/60 sm:p-6 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:ring-zinc-800/60">
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

      {isBusy && (
        <section
          className="mt-6 rounded-2xl bg-gradient-to-br from-zinc-50 to-white p-5 text-sm ring-1 ring-zinc-200/60 sm:p-6 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:ring-zinc-800/60"
          aria-live="polite"
        >
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
            Working
          </div>
          <ol className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <span aria-hidden>
                {stage === "classifying" ? "▶" : "✓"}
              </span>
              <span className={stage === "classifying" ? "font-medium" : "text-zinc-500"}>
                Classifying your target role into one of 8 AI engineering archetypes…
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden>{stage === "generating" ? "▶" : "•"}</span>
              <span className={stage === "generating" ? "font-medium" : "text-zinc-500"}>
                Comparing your resume against the matching skill profile + 5 evidence JDs, then streaming your gap report…
              </span>
            </li>
          </ol>
        </section>
      )}

      {(stage === "generating" || stage === "done") && (
        <>
          <section className="mt-6 rounded-3xl bg-white p-7 shadow-xl shadow-zinc-300/30 ring-1 ring-zinc-200/70 sm:p-10 dark:bg-zinc-900/60 dark:shadow-black/40 dark:ring-zinc-800/70">
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
              <button
                type="button"
                onClick={handleStartOver}
                className="ml-auto rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                title="Clear the report and inputs to start over"
              >
                ↺ Start over
              </button>
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

      {stage === "error" && (() => {
        const cat = categorizeError(errMsg);
        return (
          <section className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <div className="mb-1 font-semibold">{cat.title}</div>
            <p className="mb-3 text-sm">{cat.hint}</p>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!resume.trim() || !target.trim()}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:bg-zinc-900 dark:text-red-200 dark:hover:bg-zinc-800"
              >
                ↻ Retry
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ↺ Start over
              </button>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer select-none text-red-700/70 dark:text-red-300/70">
                Show raw error (for debugging)
              </summary>
              <div className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] text-red-800/80 dark:text-red-200/80">
                {errMsg}
              </div>
            </details>
          </section>
        );
      })()}

      </div>
      {/* ─────────────────── How it works (premium 3 steps) ─────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 pb-24 sm:pb-32">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works.
          </h2>
          <p className="mt-4 text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Three steps. No surveys, no generic course lists, no magic.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="rounded-3xl bg-gradient-to-br from-white to-zinc-50/60 p-8 sm:p-10 dark:from-zinc-900/60 dark:to-zinc-900/20">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-base font-semibold text-white dark:bg-white dark:text-zinc-900">
              1
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Understand your target</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your stated target role is mapped to one of eight AI engineering
              archetypes. The classifier reads what you&apos;d actually do
              day-to-day, not just the title.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white to-zinc-50/60 p-8 sm:p-10 dark:from-zinc-900/60 dark:to-zinc-900/20">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-base font-semibold text-white dark:bg-white dark:text-zinc-900">
              2
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Compare against real evidence</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your resume is compared against the skill profile of dozens of
              real job posts matching that archetype, plus five evidence JDs
              quoted directly in your report.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white to-zinc-50/60 p-8 sm:p-10 dark:from-zinc-900/60 dark:to-zinc-900/20">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-base font-semibold text-white dark:bg-white dark:text-zinc-900">
              3
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Generate a focused action plan</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              A five-section report: what you already have, your five ranked
              gaps, what you might be over-prioritizing, and the single
              highest-leverage thing to build next.
            </p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-zinc-500">
          Quantitative claims are clamped to the supplied profile — no
          hallucinated stats. This is a tracked corpus snapshot, not a complete
          market survey.
        </p>
      </section>

      {/* ─────────────────── Quality / trust (premium stat cards) ─────────────────── */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Calibrated quality.
          </h2>
          <p className="mt-4 text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Every metric the model claims, audited by an independent judge.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-8 ring-1 ring-emerald-100/80 sm:p-10 dark:from-emerald-950/30 dark:to-zinc-900/30 dark:ring-emerald-900/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              Evidence-grounded
            </div>
            <div className="mt-3 text-5xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
              0.93
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Factual claims traced back to the supplied profile or evidence JDs.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-8 ring-1 ring-emerald-100/80 sm:p-10 dark:from-emerald-950/30 dark:to-zinc-900/30 dark:ring-emerald-900/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              Specificity
            </div>
            <div className="mt-3 text-5xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
              0.83
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Recommendations with a named tool, time bound, and concrete output.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-8 ring-1 ring-emerald-100/80 sm:p-10 dark:from-emerald-950/30 dark:to-zinc-900/30 dark:ring-emerald-900/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              Actionability
            </div>
            <div className="mt-3 text-5xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
              0.82
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Recommendations executable by the user given their background.
            </p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-zinc-500">
          V1 baseline from representative reports graded by an LLM judge. Not
          a guarantee. Every report you generate has its own{" "}
          <strong>Eval this report</strong> button so you can audit your own.
        </p>
      </section>
      </main>

      {/* ─────────────────── Footer ─────────────────── */}
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
              <Link href="/methodology" className="hover:text-zinc-700 dark:hover:text-zinc-300">Methodology</Link>
              <Link href="/snapshot-pipeline" className="hover:text-zinc-700 dark:hover:text-zinc-300">Pipeline snapshot</Link>
              <Link href="/lab" className="hover:text-zinc-700 dark:hover:text-zinc-300">Lab</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500">
            <span>Built from 443 real AI engineering JDs</span>
            <span aria-hidden>·</span>
            <span>Daily automated corpus</span>
            <span aria-hidden>·</span>
            <span>Transparent methodology</span>
            <span aria-hidden>·</span>
            <span>For senior engineers pivoting into AI</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            Claude Sonnet 4.6 (generation) · Haiku 4.5 (eval) · Single-shot, evidence-grounded.
          </div>
        </div>
      </footer>
    </div>
  );
}
