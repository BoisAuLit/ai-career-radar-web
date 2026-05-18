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
  const topCompanies = Object.entries(profile.top_companies || {})
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `  - ${c}: ${n} JDs`)
    .join("\n");
  return (
    `Archetype: ${profile.archetype} (n=${profile.n_jds_in_archetype})\n` +
    `Top skills:\n${lines.join("\n")}\n` +
    `Top companies hiring this archetype (claims like "X has N ${profile.archetype} JDs" are grounded if X+N matches):\n${topCompanies}`
  );
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

For each percentage, count, fraction, or specific factual claim in the report, decide if it can be traced back to one of these supplied sources:
1. The skill profile (e.g., "75% of llm_infra JDs require Python" is grounded if the profile says python at 75% of llm_infra JDs).
2. The evidence JD list (e.g., quoting Microsoft from jd_000173 is grounded if Microsoft / jd_000173 is in the evidence list).
3. The \`top_companies\` stats supplied with the archetype profile. Claims of the form "Together AI has 9 llm_infra JDs in corpus" or "NVIDIA is the #2 company in llm_infra with 19 JDs" are GROUNDED if the company + count match the supplied top_companies dict for that archetype.
4. The company-specific profile (deep-dive mode only). Claims of the form "50% of Anthropic JDs require evaluation frameworks" are GROUNDED if the company profile supports that pct for that company.
5. The user's resume text (claims about what the user has / lacks are grounded if the resume supports them).

A claim is UNGROUNDED if:
- It cites a percentage not in any of the above
- It cites a company or JD not in the evidence list AND not in top_companies AND not in the company profile
- It invents a number ratio ("60% technical / 40% customer advisory")
- It references "trend" data we don't have (rising, falling, growing)
- It cites a third company's internal practice the model couldn't have known from the supplied data (e.g., "DeepMind uses JAX internally")

Do NOT flag generic archetype patterns (e.g., "research labs typically use Python") as ungrounded just because no specific quote backs them up; only flag specific named-company / named-JD / specific-percentage claims that can't be traced.

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
