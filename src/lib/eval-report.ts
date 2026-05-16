// LLM-as-judge meta-eval for AI Career Radar Gap Reports.
// Three metrics, each = one Haiku call. Run in parallel.

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type { ArchetypeProfile, JdRecord, Classification } from "./types";

const JUDGE_MODEL = "claude-haiku-4-5-20251001";

export interface ReportEvalInput {
  report_markdown: string;
  classification: Classification;
  profile: ArchetypeProfile;
  evidence: Pick<JdRecord, "id" | "company" | "title">[];
}

export interface GroundednessDetail {
  n_claims: number;
  n_grounded: number;
  ungrounded_examples: string[];
}

export interface SpecificityDetail {
  n_recommendations: number;
  n_specific: number;
  vague_examples: string[];
}

export interface ActionabilityDetail {
  n_recommendations: number;
  n_actionable: number;
  blocking_examples: string[];
}

export interface ReportEvalResult {
  groundedness: number;
  specificity: number;
  actionability: number;
  details: {
    groundedness: GroundednessDetail;
    specificity: SpecificityDetail;
    actionability: ActionabilityDetail;
  };
}

function stripFences(text: string): string {
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```[a-z]*\n/i, "").replace(/\n```$/i, "");
    s = s.trim();
  }
  return s;
}

function formatProfile(profile: ArchetypeProfile): string {
  const lines = profile.top_skills
    .slice(0, 18)
    .map(
      (s) =>
        `  - ${s.skill}: ${s.pct}% of ${profile.n_jds_in_archetype} ${profile.archetype} JDs (${s.n_jds} JDs)`,
    );
  return `Archetype: ${profile.archetype} (n=${profile.n_jds_in_archetype})\nTop skills:\n${lines.join("\n")}`;
}

function formatEvidence(
  evidence: Pick<JdRecord, "id" | "company" | "title">[],
): string {
  return evidence.map((e) => `  - ${e.id} · ${e.company} · ${e.title}`).join("\n");
}

async function judge(systemPrompt: string, userMessage: string): Promise<unknown> {
  const r = await generateText({
    model: anthropic(JUDGE_MODEL),
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  return JSON.parse(stripFences(r.text));
}

// ─── Groundedness ────────────────────────────────────────────────────────────

const GROUNDEDNESS_SYSTEM = `You are an impartial judge evaluating whether the factual claims in a generated career gap report are grounded in the supplied source data.

For each percentage, count, fraction, or specific factual claim in the report, decide if it can be traced back to either:
1. The supplied skill profile (e.g., "75% of llm_infra JDs require Python" is grounded if the profile says python at 75% of llm_infra JDs)
2. The supplied evidence JD list (e.g., quoting Microsoft from jd_000173 is grounded if Microsoft / jd_000173 is in the evidence list)

A claim is UNGROUNDED if:
- It cites a percentage not in the profile
- It cites a company or JD not in the evidence list
- It invents a number ratio ("60% technical / 40% customer advisory")
- It references "trend" data we don't have (rising, falling, growing)

Return ONE JSON object, no prose:
{
  "n_claims": <int total factual claims you identified>,
  "n_grounded": <int>,
  "score": <float 0-1 rounded to 2 decimals = n_grounded / n_claims>,
  "ungrounded_examples": [<short quote>, ...]  // up to 3, empty if none
}`;

async function evalGroundedness(
  input: ReportEvalInput,
): Promise<{ score: number; detail: GroundednessDetail }> {
  const userMessage = `SKILL PROFILE (source of valid percentages):
${formatProfile(input.profile)}

EVIDENCE JDs (source of valid JD references):
${formatEvidence(input.evidence)}

CLASSIFICATION REASONING:
${input.classification.reasoning}

REPORT TO EVALUATE:
${input.report_markdown}`;
  const r = (await judge(GROUNDEDNESS_SYSTEM, userMessage)) as {
    n_claims: number;
    n_grounded: number;
    score: number;
    ungrounded_examples: string[];
  };
  return {
    score: r.score,
    detail: {
      n_claims: r.n_claims,
      n_grounded: r.n_grounded,
      ungrounded_examples: r.ungrounded_examples || [],
    },
  };
}

// ─── Specificity ─────────────────────────────────────────────────────────────

const SPECIFICITY_SYSTEM = `You are an impartial judge evaluating whether the recommendations in a generated career gap report are specific enough to act on.

A recommendation is SPECIFIC if it has all three:
1. Names a concrete resource (tool, library, course, book, repo, framework — by NAME, not category)
2. Has a time bound (this week, in 2 weeks, in N days)
3. Describes a concrete output (a public URL, a GitHub repo, a benchmark report, a working demo)

A recommendation is VAGUE if it says:
- "Consider learning X" without saying what specifically
- "Learn agents" without naming a course/framework/tool
- "Build something with RAG" without specifying what to build
- "Improve your skills" with no concrete action

Examine all 5 ranked gaps + the single highest-leverage next action.

Return ONE JSON object, no prose:
{
  "n_recommendations": <int — usually 6 (5 gaps + 1 final action)>,
  "n_specific": <int>,
  "score": <float 0-1 rounded to 2 decimals = n_specific / n_recommendations>,
  "vague_examples": [<short quote>, ...]  // up to 3, empty if none
}`;

async function evalSpecificity(
  input: ReportEvalInput,
): Promise<{ score: number; detail: SpecificityDetail }> {
  const userMessage = `REPORT TO EVALUATE:
${input.report_markdown}`;
  const r = (await judge(SPECIFICITY_SYSTEM, userMessage)) as {
    n_recommendations: number;
    n_specific: number;
    score: number;
    vague_examples: string[];
  };
  return {
    score: r.score,
    detail: {
      n_recommendations: r.n_recommendations,
      n_specific: r.n_specific,
      vague_examples: r.vague_examples || [],
    },
  };
}

// ─── Actionability ───────────────────────────────────────────────────────────

const ACTIONABILITY_SYSTEM = `You are an impartial judge evaluating whether a career gap report's recommendations are actually executable by the reader given their background.

A recommendation is ACTIONABLE if:
1. A developer who reads it could start the task today (no missing prerequisite knowledge that hasn't been addressed)
2. Resources mentioned exist and are reachable (LangChain docs, OpenAI API, public GitHub repos — not made-up tools)
3. The recommendation respects the user's current skill level (doesn't ask a frontend engineer to suddenly build CUDA kernels)
4. The size of the task fits the time-box (build a chat UI in a week = plausible; build a foundation model in a week = not)

A recommendation is BLOCKING (not actionable) if:
- It assumes skills the resume doesn't show without bridging
- It references made-up or extremely niche tools
- The time-box is unrealistic for the scope

Return ONE JSON object, no prose:
{
  "n_recommendations": <int>,
  "n_actionable": <int>,
  "score": <float 0-1 rounded to 2 decimals = n_actionable / n_recommendations>,
  "blocking_examples": [<short quote>, ...]  // up to 3, empty if none
}`;

async function evalActionability(
  input: ReportEvalInput,
): Promise<{ score: number; detail: ActionabilityDetail }> {
  const userMessage = `CLASSIFICATION (level hint indicates user's experience):
${JSON.stringify(input.classification)}

REPORT TO EVALUATE:
${input.report_markdown}`;
  const r = (await judge(ACTIONABILITY_SYSTEM, userMessage)) as {
    n_recommendations: number;
    n_actionable: number;
    score: number;
    blocking_examples: string[];
  };
  return {
    score: r.score,
    detail: {
      n_recommendations: r.n_recommendations,
      n_actionable: r.n_actionable,
      blocking_examples: r.blocking_examples || [],
    },
  };
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

export async function runReportEvals(
  input: ReportEvalInput,
): Promise<ReportEvalResult> {
  const [g, s, a] = await Promise.all([
    evalGroundedness(input),
    evalSpecificity(input),
    evalActionability(input),
  ]);
  return {
    groundedness: g.score,
    specificity: s.score,
    actionability: a.score,
    details: {
      groundedness: g.detail,
      specificity: s.detail,
      actionability: a.detail,
    },
  };
}
