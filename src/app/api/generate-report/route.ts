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

/**
 * Application-level end-of-stream marker. Emitted by the server AFTER the
 * model's text stream completes normally. The client
 * (`src/app/page.tsx` — search for STREAM_COMPLETE_SENTINEL) strips this
 * before rendering and treats its absence as "the stream ended
 * unexpectedly, warn the user". Never included in the prompt; never
 * emitted by the model. Change both sites together.
 */
const STREAM_COMPLETE_SENTINEL =
  "\n\n<!-- AI_CAREER_RADAR_STREAM_COMPLETE -->";

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

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        // Model stream ended normally — append the sentinel so the client
        // can distinguish a clean finish from a mid-stream disconnect.
        controller.enqueue(encoder.encode(STREAM_COMPLETE_SENTINEL));
        controller.close();
      } catch (err) {
        // Propagate errors instead of emitting the sentinel; the client's
        // existing catch flips to `stage === "error"` and shows the
        // categorized error panel.
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
