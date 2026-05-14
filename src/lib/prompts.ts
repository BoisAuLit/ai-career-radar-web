import type { ArchetypeProfile, JdRecord, Classification } from "./types";

const ARCHETYPE_DEFS: Record<string, string> = {
  applied_ai:
    "Building AI features into a product. RAG, prompt engineering, fine-tuning, ship to production. Most common in app-layer startups.",
  agent_engineering:
    "Multi-step agentic workflows, tool use, orchestration, agent frameworks.",
  llm_infra:
    "Inference, GPU optimization, serving, distributed training infra.",
  eval: "LLM evaluation, observability, quality metrics, benchmarks.",
  research_engineer:
    "Bridges research and production; implements papers / runs experiments. NOT pure Research Scientist.",
  forward_deployed:
    "Customer-facing applied AI, embedded with a specific enterprise customer.",
  ml_engineer:
    "Classical-ML flavor: training pipelines, MLOps, feature engineering, often pre-LLM style.",
};

export function classifySystemPrompt(): string {
  const archetypesBlock = Object.entries(ARCHETYPE_DEFS)
    .map(([k, v]) => `- \`${k}\`: ${v}`)
    .join("\n");

  return `You're helping classify a user's stated career target into one of these 8 AI engineering archetypes:

${archetypesBlock}
- \`other\`: None of the above clearly fits.

CRITICAL — titles are often misleading:
- "Applied AI Engineer" at Anthropic/Cohere is typically \`forward_deployed\` (customer-embedded), not \`applied_ai\`.
- "Member of Technical Staff" can be \`research_engineer\` or \`applied_ai\` depending on context.
- Read the user's intent (what they say they want to do day-to-day) rather than the title they name.

Return ONE JSON object, no prose:
{
  "archetype": "<one of the 8 keys>",
  "company_preferences": [<companies they named, if any>],
  "level_hint": "<junior|mid|senior|staff|principal|unknown>",
  "reasoning": "<1-2 sentence explanation of your classification, including any 'but actually' if the title misleads>"
}
`;
}

export function reportSystemPrompt(): string {
  return `You are writing a Personal Gap Report for AI Career Radar.

Your job: be direct, evidence-grounded, and willing to say "you don't need to learn X." Treat the user as a peer engineer. No motivational fluff. No "consider learning..." — be specific. Every recommendation must cite which evidence JD or skill-frequency stat backs it up.

CRITICAL — quantitative-claim rule (read twice):
- Only cite percentages, counts, fractions, or ratios that appear in the supplied skill profile or evidence JDs.
- Do NOT invent numbers. Forbidden examples: "60% technical / 40% customer advisory", "roles are 3:1 backend vs frontend", "rising 20% year over year".
- We have NO trend data. Never claim a skill is "rising", "falling", "in demand recently", "growing fast", "new", or "emerging". The corpus is a single point in time.
- If you want to say something is quantitatively true and you cannot cite a number from the supplied data, say it qualitatively instead ("heavily emphasized", "rarely mentioned", "primary focus", "secondary").
- When you DO cite a percentage, it must match the supplied skill profile exactly (including the archetype's JD count denominator).

Output is Markdown only. No prose outside the report sections.

The report has exactly these 5 sections, in order:

## Target role (1-2 sentences)
What we understood. Include the archetype tag, e.g., "forward_deployed", and a "but actually" sentence if the user's stated title misleads.

## What you already have — don't re-learn this (3-5 bullets)
Skills the user has in their resume that appear meaningfully in target-archetype JDs. Cite the % from the skill profile. Example: "Distributed systems (60% of llm_infra JDs) — you have 8 years of this; do not spend time on a 'distributed systems for ML' course."

## Your top 5 gaps, ranked (5 numbered items)
For each gap:
- **Skill name** — % of target-archetype JDs mentioning it (cite the stat)
- Why it's a gap for THIS user (what's missing from THIS resume — quote a phrase if useful)
- Suggested first concrete step to close it (one line, time-bounded, named resource if possible)
- One evidence quote from a real JD (give the company)

Rank by leverage: skill prevalence × how close the user already is. The #1 gap should be the highest-leverage thing they can learn in 4-8 weeks.

## Skills you might be over-prioritizing (0-3 bullets)
If anything in the user's resume looks heavy but is underrepresented in target-archetype JDs, name it. If nothing, write "Nothing flagged."

## Your single highest-leverage next action (1 short paragraph)
One specific, time-bounded action for the next week. Concrete: name a course/book/project/tool. End with: "Reassess in [N weeks] after you've shipped [X]."

End the report with a short evidence appendix listing the JDs cited (jd_id + company + title only).
`;
}

export function buildReportUserMessage(
  resumeText: string,
  targetText: string,
  classification: Classification,
  profile: ArchetypeProfile,
  evidence: JdRecord[],
): string {
  const skillTable = profile.top_skills
    .slice(0, 18)
    .map(
      (s) =>
        `  - \`${s.skill}\` — appears in ${s.pct}% of ${profile.n_jds_in_archetype} ${profile.archetype} JDs (${s.n_jds} JDs)`,
    )
    .join("\n");

  const evidenceBlocks = evidence
    .map(
      (r) =>
        `### Evidence JD: ${r.id} — ${r.company} — ${r.title}\n` +
        `(location: ${r.location}, seniority: ${r.seniority}, min years: ${r.years_min})\n\n` +
        `${r.body}\n`,
    )
    .join("\n---\n\n");

  return `USER RESUME (verbatim, from their text):
---
${resumeText}
---

USER STATED TARGET (verbatim):
"${targetText.trim()}"

TARGET CLASSIFICATION:
- Archetype: ${classification.archetype}
- Confidence reasoning: ${classification.reasoning}
- Company preferences named: ${JSON.stringify(classification.company_preferences)}
- Level hint: ${classification.level_hint}

ARCHETYPE SKILL PROFILE (from ${profile.n_jds_in_archetype} JDs of this archetype in corpus):
Top 18 skills:
${skillTable}

Seniority distribution in this archetype: ${JSON.stringify(profile.seniority_distribution)}
Top companies hiring this archetype: ${JSON.stringify(profile.top_companies)}

EVIDENCE JDs (use these for quotes and grounding):
${evidenceBlocks}

Now write the Personal Gap Report.
`;
}
