import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import {
  reportSystemPrompt,
  buildReportUserMessage,
} from "@/lib/prompts";
import {
  buildArchetypeProfile,
  buildCompanyProfile,
  pickCompanyEvidence,
  pickEvidenceJds,
} from "@/lib/corpus";
import type { Classification, Archetype, JdRecord } from "@/lib/types";

export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

const VALID_ARCHETYPES: Archetype[] = [
  "applied_ai",
  "agent_engineering",
  "llm_infra",
  "eval",
  "research_engineer",
  "forward_deployed",
  "ml_engineer",
  "other",
];

export async function POST(req: Request): Promise<Response> {
  const body: {
    resume?: string;
    target?: string;
    classification?: Classification;
    company_filter?: string;
  } = await req.json();

  const resume = (body.resume || "").trim();
  const target = (body.target || "").trim();
  const classification = body.classification;
  const companyFilter = (body.company_filter || "").trim();

  if (!resume || !target || !classification) {
    return Response.json(
      { error: "Missing 'resume', 'target', or 'classification'" },
      { status: 400 },
    );
  }

  if (!VALID_ARCHETYPES.includes(classification.archetype)) {
    return Response.json(
      { error: `Invalid archetype: ${classification.archetype}` },
      { status: 400 },
    );
  }

  const profile = buildArchetypeProfile(classification.archetype);

  const companyProfile = companyFilter ? buildCompanyProfile(companyFilter) : null;

  let evidence: JdRecord[];
  if (companyProfile) {
    evidence = pickCompanyEvidence(
      companyProfile.company,
      classification.archetype,
      5,
    );
    if (evidence.length < 5) {
      const seenIds = new Set(evidence.map((r) => r.id));
      const backfill = pickEvidenceJds(
        classification.archetype,
        classification.company_preferences || [],
        5,
      ).filter((r) => !seenIds.has(r.id));
      evidence = [...evidence, ...backfill.slice(0, 5 - evidence.length)];
    }
  } else {
    evidence = pickEvidenceJds(
      classification.archetype,
      classification.company_preferences || [],
      5,
    );
  }

  const userMessage = buildReportUserMessage(
    resume,
    target,
    classification,
    profile,
    evidence,
    companyProfile,
  );

  const result = streamText({
    model: anthropic(MODEL),
    system: reportSystemPrompt(companyProfile),
    messages: [{ role: "user", content: userMessage }],
  });

  return result.toTextStreamResponse();
}
