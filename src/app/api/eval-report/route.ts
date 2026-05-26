import { runReportEvals } from "@/lib/eval-report";
import { buildArchetypeProfile, pickEvidenceJds } from "@/lib/corpus";
import type { Classification, Archetype } from "@/lib/types";

export const maxDuration = 60;

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
  let body: {
    report_markdown?: string;
    classification?: Classification;
    resume_text?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const report_markdown = (body.report_markdown || "").trim();
  const classification = body.classification;
  const resume_text = (body.resume_text || "").trim();

  if (!report_markdown || !classification) {
    return Response.json(
      { error: "Missing 'report_markdown' or 'classification'" },
      { status: 400 },
    );
  }
  if (!VALID_ARCHETYPES.includes(classification.archetype)) {
    return Response.json(
      { error: `Invalid archetype: ${classification.archetype}` },
      { status: 400 },
    );
  }

  // Re-derive profile and evidence server-side using the same corpus accessor
  // the report-generation route used. Keeps client state minimal.
  const profile = buildArchetypeProfile(classification.archetype);
  const evidence = pickEvidenceJds(
    classification.archetype,
    classification.company_preferences || [],
    5,
  ).map((r) => ({ id: r.id, company: r.company, title: r.title }));

  try {
    const result = await runReportEvals({
      report_markdown,
      classification,
      profile,
      evidence,
      resume_text,
    });
    return Response.json(result);
  } catch (e) {
    return Response.json(
      {
        error: "Eval call failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 502 },
    );
  }
}
