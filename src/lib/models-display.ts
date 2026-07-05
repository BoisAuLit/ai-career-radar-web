/**
 * Display-only labels for the runtime models the app calls.
 * This module is a **single source of truth for what the UI
 * *says*** about the models — not what it *invokes* at runtime.
 *
 * Actual runtime model selection lives in
 * `src/app/api/**` (generate-report, eval-report, classify,
 * etc.) and is intentionally NOT touched by this file. If the
 * runtime models change, first update the API route that
 * selects them, verify the new choice, then refresh the
 * constants below to keep UI copy honest.
 *
 * Source of truth for the versions below: authoring-time
 * inspection of the API routes' model choice on 2026-07-05.
 * Runtime models: Claude Sonnet 4.6 (report generation) +
 * Claude Haiku 4.5 (report evaluation).
 *
 * When runtime models change:
 *   1. Update the API route(s).
 *   2. Verify the new choice compiles and runs.
 *   3. Edit the constants here to match the new model names.
 */
export const MODELS_DISPLAY = {
  /** Provider brand used in user-facing copy. */
  provider: "Anthropic",
  /** Full label for the report-generation model. */
  generationModel: "Claude Sonnet 4.6",
  /** Short label suitable for compact contexts. */
  generationModelShort: "Sonnet 4.6",
  /** Full label for the report-evaluation (LLM-judge) model. */
  evalModel: "Claude Haiku 4.5",
  /** Short label suitable for compact contexts. */
  evalModelShort: "Haiku 4.5",
} as const;
