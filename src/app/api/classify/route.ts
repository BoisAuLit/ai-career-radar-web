// AgentOps-5e-followup-phase3-classify-json-hardening-implement.
//
// Thin Next.js route wrapper. All logic lives in the pure ESM handler
// `src/lib/classify-handler.mjs` so it can be unit-tested with mocked
// dependencies without spawning a Next.js runtime or making a real
// provider call.
//
// Guarantees enforced by the handler (and asserted by
// scripts/test-classify-route.mjs):
//   - exactly ONE provider call per classify request (`maxRetries: 0`)
//   - no `experimental_repairText` (silent repair prohibited)
//   - manual `JSON.parse(raw)` of unrestricted free-form provider text
//     is REMOVED — generateObject validates against the Zod schema
//   - raw model output NEVER returned to client
//   - raw model output NEVER logged by default (bounded structured
//     metadata + correlation_id only)
//   - success response contract preserved at field + type level
//   - client failure bodies contain ONLY { error, category, correlation_id }
//
// References:
//   - .agent/decisions/2026-07-24_run_11_DECISION.md
//   - .agent/design_memos/2026-07-24_AgentOps-5e-followup-phase3-classify-json-hardening-design.md

import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { classifySystemPrompt } from "@/lib/prompts";
import { handleClassify } from "@/lib/classify-handler.mjs";

const MODEL = "claude-sonnet-4-6";

export const maxDuration = 30;

function generateCorrelationId(): string {
  // crypto.randomUUID is a Node/Web global on Node 22.
  return globalThis.crypto.randomUUID();
}

// Structured redacted logger. Emits JSON lines to stderr for server
// observability. Field allowlist enforced at call sites in the handler
// (see src/lib/classify-handler.mjs). No user-derived content (target,
// reasoning, company_preferences values) is ever logged here.
function serverLogger(event: object): void {
  try {
    process.stderr.write(JSON.stringify(event) + "\n");
  } catch {
    /* logging must never throw */
  }
}

export async function POST(req: Request): Promise<Response> {
  return handleClassify({
    req,
    deps: {
      generateObject,
      model: anthropic(MODEL),
      systemPrompt: classifySystemPrompt(),
      generateCorrelationId,
      logger: serverLogger,
    },
  });
}
