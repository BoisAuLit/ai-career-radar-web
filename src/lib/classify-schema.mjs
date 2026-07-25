// AgentOps-5e-followup-phase3-classify-json-hardening-implement · schema module.
//
// Strict Zod schema for the /api/classify Classification contract.
//
// Policy: VALIDATION ONLY — no transforms of any kind.
// - No trim, no lowercase, no dedup, no defaults, no coercion, no enum
//   normalization, no repair, no semantic rewriting, no silent removal
//   of duplicate entries, no silent stripping of unknown keys.
// - Duplicate company_preferences entries are rejected via deterministic
//   refinement (NOT silently removed).
// - Case-different company_preferences values remain distinct
//   ('anthropic' vs 'Anthropic' both accepted).
// - Whitespace-only reasoning is rejected via deterministic refinement
//   (NOT silently trimmed or rewritten).
// - Unknown top-level keys are rejected via `.strict()`.
//
// Written as .mjs pure ESM so it can be imported by both the Next.js
// route (src/app/api/classify/route.ts) and the deterministic test
// runners (scripts/test-classify-*.mjs) without any TypeScript build step.
// tsconfig `moduleResolution: bundler` + `allowJs: true` supports the
// route-side import as `import { ... } from "@/lib/classify-schema.mjs"`.
//
// References:
//   - .agent/decisions/2026-07-24_run_11_DECISION.md
//   - .agent/design_memos/2026-07-24_AgentOps-5e-followup-phase3-classify-json-hardening-design.md

import { z } from "zod";

export const ARCHETYPE_VALUES = [
  "applied_ai",
  "agent_engineering",
  "llm_infra",
  "eval",
  "research_engineer",
  "forward_deployed",
  "ml_engineer",
  "other",
];

export const SENIORITY_VALUES = [
  "junior",
  "mid",
  "senior",
  "staff",
  "principal",
  "unknown",
];

export const COMPANY_PREFERENCES_MAX_ITEMS = 10;
export const COMPANY_PREFERENCE_ITEM_MAX_CHARS = 200;
export const REASONING_MAX_CHARS = 2000;

// company_preferences: exact-duplicate entries REJECTED via refinement.
// Case-different values remain distinct (Set uses reference equality on
// strings, which is exact string equality; 'anthropic' and 'Anthropic'
// are distinct entries).
const companyPreferencesSchema = z
  .array(z.string().min(1).max(COMPANY_PREFERENCE_ITEM_MAX_CHARS))
  .min(0)
  .max(COMPANY_PREFERENCES_MAX_ITEMS)
  .refine(
    (arr) => new Set(arr).size === arr.length,
    {
      message: "company_preferences contains exact-duplicate entries",
    },
  );

// reasoning: whitespace-only strings REJECTED via refinement.
// The refinement inspects .trim().length WITHOUT modifying the value.
const reasoningSchema = z
  .string()
  .min(1)
  .max(REASONING_MAX_CHARS)
  .refine((s) => s.trim().length > 0, {
    message: "reasoning must not consist only of whitespace",
  });

// Strict object — unknown keys REJECTED. No coercion. No defaults.
// No transforms on any field.
export const classificationSchema = z
  .object({
    archetype: z.enum(ARCHETYPE_VALUES),
    company_preferences: companyPreferencesSchema,
    level_hint: z.enum(SENIORITY_VALUES),
    reasoning: reasoningSchema,
  })
  .strict();

/**
 * @typedef {object} Classification
 * @property {typeof ARCHETYPE_VALUES[number]} archetype
 * @property {string[]} company_preferences
 * @property {typeof SENIORITY_VALUES[number]} level_hint
 * @property {string} reasoning
 */
