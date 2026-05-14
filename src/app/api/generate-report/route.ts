import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import {
  reportSystemPrompt,
  buildReportUserMessage,
} from "@/lib/prompts";
import { buildArchetypeProfile, pickEvidenceJds } from "@/lib/corpus";
import type { Classification, Archetype } from "@/lib/types";

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
  } = await req.json();

  const resume = (body.resume || "").trim();
  const target = (body.target || "").trim();
  const classification = body.classification;

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
  const evidence = pickEvidenceJds(
    classification.archetype,
    classification.company_preferences || [],
    5,
  );

  const userMessage = buildReportUserMessage(
    resume,
    target,
    classification,
    profile,
    evidence,
  );

  const result = streamText({
    model: anthropic(MODEL),
    system: reportSystemPrompt(),
    messages: [{ role: "user", content: userMessage }],
  });

  return result.toTextStreamResponse();
}
