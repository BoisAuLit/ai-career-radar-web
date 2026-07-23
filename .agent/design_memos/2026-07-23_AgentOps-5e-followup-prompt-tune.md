# Design memo · AgentOps-5e-followup-prompt-tune · R1 grammar-bridging inspection

- **date**: 2026-07-23
- **loop**: AgentOps-5e-followup-prompt-tune
- **parent_loop**: AgentOps-5e-migrate (`2026-07-23_run_06`)
- **target_job_id**: `jd_000201`
- **cost**: **$0**

## 1 · Purpose

Inspect the recurring `jd_000201` R1 grammar-bridging mismatch, trace
it to prompt / output-format behavior, and design the smallest
product-side prompt / output-format correction that increases
evidence-quote faithfulness **without weakening R1 or R2**.

## 2 · Approved scope

Inspection / design only. No code change. No generation. No fixture
run. No LLM/API. No baseline mutation. No promotion. Cost $0.

## 3 · What was NOT run

- No Fixture A / B / C / D / E
- No harness / Playwright / dev server
- No Anthropic / OpenAI call
- No prompt or code change
- No checker change (`scripts/quote-integrity-check.mjs` untouched)
- No harness change (`scripts/report-regression-local.mjs` untouched)
- No `.agent/scripts/**` change
- No pipeline change
- No threshold change
- No `.env*` / `vercel.json` / package / lockfile / workflow change
- No baseline mutation or promotion
- No AgentOps-5f-promote

## 4 · Governing R1 / R2 policy

- **R1** (locked in `2026-07-21_run_03_DECISION`): post-ellipsis
  grammar bridging → RED. Rejected: fuzzy / edit-distance / LLM
  judge / semver-loose compat.
- **R2** (locked in `2026-07-22_run_01_DECISION`): terminal-punctuation-
  only swap → AMBER under 8 strict conditions (min 40 non-space
  chars · company + role pass · `.` → `,` / `;` / no-punct only ·
  `?` / `!` / `:` forbidden).
- **Verdict semantics**: telemetry-only per `2026-07-21_run_02_DECISION`
  (5b) and never promoted to blocking without a separate DECISION.
- **Blocking promotion prerequisites** (per 5e DECISION Q5): R1
  remediation strongly preferred before first QI-aware promotion.

## 5 · `jd_000201` occurrence inventory

Four committed occurrences, all RED, all NVIDIA · Senior AI ML
Solution Engineer (applied_ai archetype):

| run_id | schema | match_status | length | ellipsis-fragments |
|---|---|---|---|---|
| `20260721T_AGENTOPS5C_fixture-B` | 0.2 | `unmatched_ellipsis_fragment` | 158 | 120 verbatim + 34 unmatched |
| `20260722T_AGENTOPS5C_INTEGRATE_fixture-B` | 0.3-r2 | `unmatched_ellipsis_fragment` | 158 | 120 verbatim + 34 unmatched |
| `20260722T_AGENTOPS5D_R2_fixture-B` | 0.3-r2 | `unmatched_ellipsis_fragment` | 158 | 120 verbatim + 34 unmatched |
| `20260723T160538Z_fixture-B` | 0.3-r2 | `unmatched` | 179 | (no ellipsis; single fragment) |

`company_check` and `role_check` **pass** in every occurrence.
`cited_jd_id` is `jd_000201` in every occurrence. Deterministic RED
across 4 runs.

## 6 · Exact source / generated mismatch

**Source** (from `src/data/web_bundle.json` records[jd_000201].body
starting at char 1411, minimal excerpt):

> "Evaluate and select ML approaches for specific problems: when to
> use LLM prompting vs. fine-tuning (QLoRA), classical" (first 117
> chars; continues to ~214 chars up to a sentence-terminating period)

**Generated quote head (60-char snippet from checker)**:

> "Evaluate and select ML approaches for specific problems: whe"

**Length observations**:

- 158-char generated quote: checker splits on ellipsis → 120 char
  **verbatim** head + 34 char **unmatched** tail.
- 179-char generated quote: no ellipsis → whole quote falls straight
  to `unmatched`; the head still starts with the same 60-char
  substring, suggesting the model paraphrased or grammar-repaired the
  tail beyond the 120-char verbatim head.

**Full generated quote text is intentionally not available**: the
checker records only `quote_snippet_60` for safety; `report.md` is
scratchpad-only and never committed (per artifact-safety rules).
The 60-char head + total length + ellipsis-fragment breakdown are
sufficient to classify the mechanism.

## 7 · Precise mismatch classification

**Primary**: `F_non_contiguous_bridging`

- 3 of 4 runs: ellipsis-fragment split of 120 verbatim head + 34
  unmatched tail.
- The model concatenates a verbatim source span with a non-source
  tail using `...` between them.

**Secondary**: `G_semantic_paraphrase` OR `A_B_grammar_repair`

- 1 of 4 runs: 179-char continuous quote with no ellipsis; tail
  beyond ~120 chars deviates from source.
- Most likely: grammar repair / added conjunction / paraphrase to
  make the quote read as a complete sentence.

**Rejected categories**:

- `C_morphological`: no evidence of isolated tense / plurality change.
- `D_punctuation_only`: would qualify for R2 tier (AMBER); every
  occurrence is RED.
- `E_whitespace_unicode`: checker already normalizes curly quotes,
  dashes, ellipsis, pipe-newline — mismatch survives normalization.
- `H_source_selection_mismatch`: company + role check pass; cited
  `jd_id` is correct; quoted head IS from `jd_000201` body.
- `I_appendix_citation_error`: appendix entry present and consistent.

## 8 · Data lineage

| stage | path / function | value form | mutation risk |
|---|---|---|---|
| source | `src/data/web_bundle.json` records[jd_000201].body | raw scraped text | frozen (2026-05-14 snapshot) |
| evidence_selection | `src/lib/corpus.ts::pickEvidenceJds` | `JdRecord[]` pass-through | none |
| prompt_user_message | `src/lib/prompts.ts::buildReportUserMessage` line ~144 (`${r.body}`) | body inserted verbatim | none |
| api_call | `src/app/api/generate-report/route.ts` streamText → Anthropic Sonnet 4.6 | system + user msg streamed | none in transport |
| **model_generation** | Anthropic Sonnet 4.6 | Markdown; Evidence quote inside `""` | **ROOT-CAUSE STAGE** |
| response_stream | route.ts ReadableStream | text/plain to client + sentinel | none |
| report_md_capture | `scripts/report-regression-local.mjs` | streamed text → scratchpad `report.md` | none |
| checker_extract | `scripts/quote-integrity-check.mjs::extractEvidenceQuotes` regex | captures quote + company + jd_id | none |
| checker_match | tiered / ellipsis-fragment / R2 substring match against `record.body` | deterministic; no fuzzy | none |

**Lineage conclusion**: mismatch is introduced **exclusively** at the
model-generation stage. All other stages are pass-through and
byte-preserving. Checker is faithful.

## 9 · Current prompt contract (`src/lib/prompts.ts::reportSystemPrompt`)

Explicit quote wording present:

- Line ~79: *"Allowed: quoting language from a specific JD in the
  evidence list (with the jd_id / company tag), since the user can
  verify it in the appendix."*
- Line ~95: *"Why it's a gap for THIS user (what's missing from
  THIS resume — quote a phrase if useful)"*
- Line ~97: *"One evidence quote from a real JD (give the company)"*

Explicit quote wording **absent**:

- ❌ no "verbatim" requirement
- ❌ no "exact substring" requirement
- ❌ no "do not paraphrase" clause
- ❌ no "do not repair grammar" clause
- ❌ no "quote may be a fragment" allowance
- ❌ no "verify quote appears in supplied text" self-check
- ❌ no explicit output shape separating quote token from
  interpretation

## 10 · Current output-format contract

- Single Markdown bullet under each gap:
  `- One evidence quote from a real JD (give the company)`
- Model naturally produces:
  `Evidence quote: "TEXT" — Company, jd_XXXXXX.`
- **The checker regex recognizes this exact shape** — but the prompt
  does not instruct the model to use it. The shape emerges from
  example-following and few-shot inertia.
- Quote lives in the same free-form bullet as surrounding gap prose;
  **no structural boundary forces exact copying**.

## 11 · Root-cause assessment

The model is not defective. The prompt is under-specified for the
evidence-quote task:

- No verbatim contract → model treats "quote" as *free-form
  paraphrase acceptable*.
- No fragment allowance → model may naturalize incomplete source
  fragments into complete grammatical sentences.
- No self-check → model never re-verifies quote against source.
- No structural separation → quote and interpretation blur, so quote
  may be adjusted for rhetorical flow.

The observed pattern (verbatim 120-char head + 34-char unmatched
tail after `...`) is exactly what an under-specified quote contract
would produce when the model wants a "polished" evidence sentence
but the source span is grammatically incomplete.

## 12 · Options considered

- **A · Stronger prompt wording** — RECOMMENDED PRIMARY.
- **B · Separate quote and interpretation fields** — RECOMMENDED
  SECONDARY (compose only if A alone insufficient).
- **C · Structured JSON generation** — deferred to future design loop.
- **D · Deterministic span selection** — deferred to future design loop.
- **E · Post-generation quote replacement** — **REJECT** (masks
  hallucination · breaks audit trust).
- **F · Checker relaxation** (fuzzy / edit-distance / LLM judge) —
  **REJECT** (undoes 5c / 5d / 5d-R2 policy).

Full scoring per option in
`.agent/findings/2026-07-23_r1_grammar_bridging_inventory.json`
under `options`.

## 13 · Rejected approaches

- **E (post-generation replacement)** — silently rewrites model output
  to look faithful. Violates auditability + user trust. **REJECT.**
- **F (checker relaxation)** — undoes R1 policy locked in
  `2026-07-21_run_03_DECISION`. **REJECT.**
- **Adding edit-distance / fuzzy matching** — explicitly forbidden
  by 5c DECISION. **REJECT.**
- **Adding LLM judge** — explicitly forbidden by 5c DECISION.
  **REJECT.**

## 14 · Recommended design

**Primary: Option A — stronger prompt wording.**

Rationale:

- Smallest possible surface: ~30 lines of prompt text in one file.
- Zero checker impact — R1 / R2 remain unchanged.
- Zero Markdown-structure change — `Evidence quote: "..."` shape
  preserved; checker regex untouched.
- Highest auditability — single-source-of-truth diff in
  `src/lib/prompts.ts`.
- Matches minimum-first / anti-overengineering preference.

**Composable secondary: Option B** if paid A/B validation shows A
insufficient. Escalate in a separate design loop.

## 15 · Proposed prompt patch (DRAFTED · NOT APPLIED)

**Target**: `src/lib/prompts.ts::reportSystemPrompt`

**Insertion point**: immediately after the company-specific-claim
rule block and before the `## Target role` section.

**Patch wording**:

> CRITICAL — evidence-quote-verbatim rule (read twice):
>
> - Every quoted Evidence span MUST be copied verbatim from ONE
>   contiguous span of the cited job description.
> - Do NOT paraphrase, repair grammar, change tense, change
>   plurality, add or remove articles, add or remove conjunctions,
>   or combine separated fragments inside quotation marks.
> - A quote does not need to be a complete sentence. Grammatical
>   fragments are allowed and preferred over stitched-together spans.
> - If the useful source text is grammatically incomplete, quote the
>   incomplete source text EXACTLY and put your explanation OUTSIDE
>   the quotation marks.
> - If you would need `...` inside a quote to skip source text, do
>   NOT do that; either quote the first contiguous span alone or
>   emit two separate quotes.
> - Before finalizing the report, verify that every quoted string
>   occurs EXACTLY (character-for-character) in the supplied text
>   for the cited `jd_id`. If it does not, shorten or replace it with
>   an exact source span.

## 16 · Proposed output-format change

**None.** The existing Markdown shape
`Evidence quote: "TEXT" — Company, jd_XXXXXX.` is preserved. Checker
regex untouched. UI parser untouched.

If Option A alone proves insufficient in paid A/B validation, a
future loop may propose Option B (structural separation of quote and
interpretation) — but that requires a separate design + DECISION.

## 17 · Checker impact

**Zero.** R1 remains strict. R2 remains 8-condition-strict. Ellipsis-
fragment matcher remains unchanged. No new tier introduced. Success
is measured by the model producing exact contiguous quotes, not by
the checker becoming more lenient.

## 18 · UI / parser compatibility

- **Prompt-only change (Option A)**: no UI change, no parser change,
  no harness change. Existing report shape preserved.
- **Regex compat**: `extractEvidenceQuotes` continues to match on
  `Evidence quote: "TEXT" — Company, jd_XXXXXX.`

## 19 · Deterministic test plan ($0)

For any future implementation loop:

1. Prompt-string assertion — `evidence-quote-verbatim rule` substring
   present in `reportSystemPrompt()` output.
2. Output-schema unit test — `Evidence quote: "..." — Company,
   jd_XXXXXX.` still recognized by checker regex.
3. Known `jd_000201` exact-span fixture — `source_phrase_head_120`
   asserted to appear verbatim in `web_bundle.json` record body.
4. Negative example (grammar-added article) — `Evaluate and select
   ML approaches for THE specific problems` fails Tier 1-3.
5. Non-contiguous bridging example — `phrase A ... phrase B` where
   A and B come from different source spans stays RED at ellipsis-
   fragment tier.
6. R2 punctuation-only preservation — existing R2 fixture stays
   AMBER (not GREEN, not RED).
7. Interpretation-outside-quotes tolerance — bullet with quote
   followed by free-form text still parses.

**None of these are added in this inspection loop.**

## 20 · Paid A/B validation plan

Requires **separate TASK + RUN_REPORT + DECISION + explicit human
approval**.

Proposed stages:

1. Implement the minimal prompt patch in `src/lib/prompts.ts` (no
   other file changes).
2. Deterministic tests from § 19.
3. Run Fixture A **exactly once** (no retries).
4. Run Fixture B **exactly once** (no retries).
5. Compare:
   - legacy 25-check verdict
   - report structure
   - Evidence Appendix presence
   - quote-integrity verdict
   - `jd_000201` result
   - any new R1 failures
   - R2 fires
   - appendix-uncited telemetry
6. Keep QI **telemetry-only** — no blocking promotion.
7. **No baseline promotion** — even if A + B both pass.

**Estimated cost**: **~$0.10** total (2 real Sonnet 4.6 generations
at ~$0.05 each).

## 21 · Success criteria

- `jd_000201` no longer R1 RED (either matches verbatim / normalized
  / case-insensitive, or is replaced by a shorter exact quote).
- No new fabricated / unmatched quotes appear in A or B.
- R1 unchanged in checker code.
- R2 unchanged in checker code.
- Legacy 25-check report remains structurally valid (all post-A/B
  checks pass).
- Evidence Appendix remains present.
- No baseline mutation.
- No blocking promotion.

## 22 · Failure / rollback criteria

- R1 merely hidden by format/parser change.
- Quotes become longer or more hallucinated.
- Evidence loses usefulness (all quotes become 4-word fragments).
- Report structure breaks.
- Checker weakened.
- Post-processing silently rewrites model output.
- New unmatched quotes appear in previously-clean fixtures.

If any failure criterion trips: `git revert` the prompt patch commit;
document in a follow-up RUN_REPORT.

## 23 · Risks

1. Prompt patch may under-perform on Fixture A (which already runs
   clean today) if the model over-shortens quotes.
2. Model may occasionally still paraphrase — one prompt pass is not
   guaranteed to eliminate all RED cases.
3. Self-check instruction adds tokens but does not guarantee
   verification.
4. Validation is only 1 real A + 1 real B run — small sample.
5. `jd_000201` reproduces in 4 different loops (`5c`, `5c-integrate`,
   `5d-R2`, `5d-b-timeout-diagnostics`), so the fix must be robust
   enough to survive that repeat pattern.
6. `jd_000173` also fires R2 repeatedly — the prompt patch may
   affect its behavior; validation must monitor.
7. R1 grammar bridging may recur on other job records not yet
   surfaced by A/B.
8. `jd_000310` appendix-uncited AMBER remains an orthogonal issue.
9. Fixture B 502 remains a possible transient blocker — validation
   may need re-run on 502.
10. Cost cap at $0.10 is a per-loop budget; a rerun on 502 would
    push cost.

## 24 · Open questions requiring human decision

| Q | Question | Recommendation |
|---|---|---|
| **Q1** | Option A alone or A + B together? | **Option A alone first**; escalate to B only if paid validation fails |
| **Q2** | Shortest exact phrase or full source sentence? | **Shortest useful contiguous span**; allow fragments |
| **Q3** | Explicit model self-check before final output? | **Yes** — one sentence is cheap and directly addresses the bridging pattern |
| **Q4** | Alter only prompt text or also Markdown structure? | **Prompt text only**; preserve existing `Evidence quote:` shape |
| **Q5** | Require paid A+B validation before any promotion-related work? | **Yes** — do NOT start AgentOps-5f-promote until at least one A+B loop shows the patch works |

## 25 · Recommended next loop

**AgentOps-5e-followup-prompt-tune-implement** (separate TASK +
RUN_REPORT + DECISION · human GO required):

- Cost **~$0.10**.
- Implement the prompt patch in `src/lib/prompts.ts` **only**.
- Add deterministic tests from § 19.
- Run Fixture A exactly once + Fixture B exactly once (no retries).
- Compare against success / failure criteria.
- **Keep QI telemetry-only.**
- **No baseline mutation.** **No baseline promotion.**
- **No 5f-promote.**

**Alternative**: handoff / pause for human to decide whether to
prioritize this over baseline QI lint / promotion checker design.

## 26 · Boundaries respected

- ✅ no generation
- ✅ no fixture run
- ✅ no harness / Playwright / dev server
- ✅ no LLM / API call
- ✅ no prompt or code change
- ✅ no checker change
- ✅ no harness change
- ✅ no R1 / R2 relaxation
- ✅ no edit-distance · fuzzy · LLM judge
- ✅ no baseline mutation
- ✅ no baseline promotion
- ✅ no `src/**` change
- ✅ no `scripts/**` change
- ✅ no `.agent/scripts/**` change
- ✅ no pipeline change
- ✅ no threshold change
- ✅ no retry behavior added
- ✅ no C/D/E · no A-E
- ✅ no PDFs
- ✅ no OpenAI API
- ✅ no `report.md` / screenshot / full body / long quote committed
- ✅ QI remains telemetry-only
- ✅ no blocking promotion
- ✅ no AgentOps-5f-promote
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human`
- ✅ Q10 pause unchanged
- ✅ Codex planner spec-only
- ✅ **cost $0**
