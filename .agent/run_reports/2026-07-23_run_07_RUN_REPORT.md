# RUN REPORT · AgentOps-5e-followup-prompt-tune · R1 grammar-bridging inspection

## Metadata

- **task_id**: `2026-07-23_run_07`
- **date**: 2026-07-23
- **loop**: AgentOps-5e-followup-prompt-tune
- **parent_loop**: AgentOps-5e-migrate (`2026-07-23_run_06`)
- **task_path**: `.agent/tasks/2026-07-23_run_07_TASK.md`
- **findings_path**: `.agent/findings/2026-07-23_r1_grammar_bridging_inventory.json`
- **memo_path**: `.agent/design_memos/2026-07-23_AgentOps-5e-followup-prompt-tune.md`
- **impl_commit**: `e530252` (Design exact evidence quote contract)
- **target_job_id**: `jd_000201`

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: inspection / design-only analysis of
  R1 grammar-bridging; no product, prompt, checker, harness, or
  runtime change
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: none generated
- **target_environment**: local inspection
- **latest_run_id**: not_applicable
- **verdict**: `not_required`
- **exit_code**: not_applicable
- **artifact_paths**:
  - `.agent/tasks/2026-07-23_run_07_TASK.md`
  - `.agent/findings/2026-07-23_r1_grammar_bridging_inventory.json`
  - `.agent/design_memos/2026-07-23_AgentOps-5e-followup-prompt-tune.md`
- **report_char_count**: not_applicable
- **capture_scope**: not_applicable
- **fallback_used**: not_applicable
- **red_checks_failed**: not_applicable
- **amber_checks_failed**: not_applicable
- **cost_measured**: **true**
- **estimated_cost**: **$0**
- **duration_ms**: not_applicable
- **baseline_promoted**: no
- **production_target_used**: no
- **reviewer_action_required**: human + ChatGPT review, then DECISION
- **push_implication**: no push until DECISION

## Target

`jd_000201` · NVIDIA · Senior AI ML Solution Engineer, AI-Native
Development · archetype `applied_ai` · body 2204 chars.

## Occurrence inventory (all committed)

4 committed occurrences · all RED · deterministic across runs:

| run_id | schema | match_status | length | fragments |
|---|---|---|---|---|
| `20260721T_AGENTOPS5C_fixture-B` | 0.2 | `unmatched_ellipsis_fragment` | 158 | 120 verbatim + 34 unmatched |
| `20260722T_AGENTOPS5C_INTEGRATE_fixture-B` | 0.3-r2 | `unmatched_ellipsis_fragment` | 158 | 120 verbatim + 34 unmatched |
| `20260722T_AGENTOPS5D_R2_fixture-B` | 0.3-r2 | `unmatched_ellipsis_fragment` | 158 | 120 verbatim + 34 unmatched |
| `20260723T160538Z_fixture-B` | 0.3-r2 | `unmatched` | 179 | (no ellipsis; single fragment) |

`company_check` = pass · `role_check` = pass · `cited_jd_id` =
jd_000201 in every occurrence.

## Exact mismatch

- **Source** (from `src/data/web_bundle.json` at char 1411): first
  117 chars = `"Evaluate and select ML approaches for specific
  problems: when to use LLM prompting vs. fine-tuning (QLoRA),
  classical"`, continuing to ~214 chars up to sentence-terminating
  period.
- **Generated head (60-char snippet, checker-truncated)**:
  `"Evaluate and select ML approaches for specific problems: whe"`
- **Length variants**: 158 (3 runs) · 179 (1 run).
- **Ellipsis split**: 120-char verbatim head + 34-char unmatched
  tail (in 3/4 runs).
- **Full generated quote text unavailable** — checker records only
  60-char snippet; `report.md` is scratchpad-only and not committed
  per artifact-safety rules.

## Precise mismatch classification

- **Primary**: `F_non_contiguous_bridging` — model concatenates a
  verbatim source span with a non-source tail using `...` between
  them.
- **Secondary**: `G_semantic_paraphrase` or `A_B_grammar_repair` —
  1-of-4 runs shows a continuous 179-char quote with no ellipsis,
  where the tail deviates from source.
- **Rejected**: `C_morphological`, `D_punctuation_only`,
  `E_whitespace_unicode`, `H_source_selection_mismatch`,
  `I_appendix_citation_error`.

## Prompt findings

`src/lib/prompts.ts::reportSystemPrompt` currently has **no**:

- verbatim requirement
- exact-substring requirement
- "do not paraphrase" clause
- "do not repair grammar" clause
- "quote may be a fragment" allowance
- pre-submit self-check
- structural quote/interpretation separation

Present wording is limited to:

- *"quoting language from a specific JD"* (line ~79)
- *"quote a phrase if useful"* (line ~95)
- *"one evidence quote from a real JD"* (line ~97)

The checker regex `Evidence quote: "TEXT" — Company, jd_XXXXXX.` is
recognized but not required by the prompt — the shape emerges from
example-following, not from an explicit instruction.

## Lineage conclusion

Mismatch is introduced **exclusively** at the model-generation stage.
All other stages (`web_bundle.json` → `pickEvidenceJds` →
`buildReportUserMessage` → API stream → `report.md` → checker) are
pass-through and byte-preserving. Checker is faithful. No `body`
transformation happens anywhere before the model.

## Selected design

**Primary: Option A — stronger prompt wording**

- Add ~30 lines of explicit evidence-quote-verbatim rule to
  `reportSystemPrompt`.
- No Markdown-shape change.
- No checker change.
- No R1 / R2 relaxation.

**Composable secondary: Option B — separate quote and interpretation
fields**. Adopt only if paid A/B validation shows A insufficient.

## Rejected alternatives

- **E · post-generation quote replacement** — masks hallucination ·
  breaks audit trust.
- **F · checker relaxation** — undoes R1 policy locked in
  `2026-07-21_run_03_DECISION`.
- Adding **edit-distance / fuzzy matching** — forbidden by 5c
  DECISION.
- Adding **LLM judge** — forbidden by 5c DECISION.

## Proposed prompt patch (DRAFTED · NOT APPLIED)

Insertion point: after the company-specific-claim rule block, before
`## Target role`.

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
>   for the cited `jd_id`. If it does not, shorten or replace it
>   with an exact source span.

## Output-format recommendation

**None.** Existing Markdown shape `Evidence quote: "TEXT" — Company,
jd_XXXXXX.` preserved. Checker regex untouched. UI parser untouched.

## Checker impact

**Zero.** R1 remains strict. R2 remains 8-condition-strict. No new
tier introduced.

## Deterministic test plan ($0)

1. Prompt string assertion — `evidence-quote-verbatim rule` substring
   present in `reportSystemPrompt()` output.
2. Output schema — `Evidence quote: "..." — Company, jd_XXXXXX.`
   regex still recognized.
3. Known `jd_000201` exact-span fixture — head-120 chars appear
   verbatim in `web_bundle.json`.
4. Grammar-added negative example — `THE specific problems` fails
   Tier 1-3.
5. Non-contiguous bridging — stays RED at ellipsis-fragment tier.
6. R2 punctuation-only — existing fixture stays AMBER.
7. Interpretation-outside-quotes tolerance parsable.

**Not added in this inspection loop.**

## Paid A/B validation plan

- Requires **separate TASK + RUN_REPORT + DECISION + explicit human
  approval**.
- Stages: implement prompt patch → deterministic tests → run Fixture
  A once (no retries) → run Fixture B once (no retries) → compare.
- **Estimated cost**: **~$0.10 total** (2 real Sonnet 4.6 generations
  at ~$0.05 each).
- **Keep QI telemetry-only** — no blocking promotion.
- **No baseline mutation** — no baseline promotion.

## Success criteria

- `jd_000201` no longer R1 RED
- no new fabricated / unmatched quotes appear in A or B
- R1 + R2 unchanged in checker code
- legacy 25-check report remains structurally valid
- Evidence Appendix remains present
- no baseline mutation
- no blocking promotion

## Failure / rollback criteria

- R1 merely hidden by format/parser change
- quotes become longer or more hallucinated
- evidence loses usefulness
- report structure breaks
- checker weakened
- post-processing silently rewrites model output
- new unmatched quotes appear in previously-clean fixtures

Rollback: `git revert` prompt-patch commit; follow-up RUN_REPORT.

## Open questions with recommendations

| Q | Question | Recommendation |
|---|---|---|
| **Q1** | Option A alone or A + B together? | Option A alone first |
| **Q2** | Shortest exact phrase or full source sentence? | Shortest useful contiguous span; allow fragments |
| **Q3** | Explicit model self-check? | Yes |
| **Q4** | Alter only prompt text or also Markdown structure? | Prompt text only |
| **Q5** | Require paid A+B validation before promotion? | Yes — no 5f-promote until at least one A+B loop |

## Confirmations

- **no generation** ✅
- **no prompt / code changes** ✅
- **no checker changes** ✅
- **no R1 / R2 relaxation** ✅
- **no edit-distance / fuzzy / LLM judge** ✅
- **no baseline mutation** ✅
- **no promotion** ✅
- **no pipeline changes** ✅ (`b019786` 起终一致)
- **no `src/**` changes** ✅
- **no `scripts/**` changes** ✅
- **no `.agent/scripts/**` changes** ✅
- **no threshold changes** ✅ (`HARD_LATENCY_MS = 240_000` ·
  `SOFT_LATENCY_MS = 120_000`)
- **no retry behavior added** ✅
- **no C/D/E · no A-E** ✅
- **no PDFs** ✅
- **no OpenAI API** ✅
- **no `report.md` / screenshot / long quote committed** ✅
- **no `.env*` / `vercel.json` / package / lockfile / workflow
  changes** ✅
- **quote integrity remains telemetry-only** ✅
- **no blocking promotion** ✅
- **no AgentOps-5f-promote** ✅
- BLK-0001 / BLK-0002 / BLK-0003 remain `open` ✅
- G2.1d remains `blocked_pending_human` ✅
- Q10 pause unchanged ✅ · Codex planner spec-only ✅ ·
  `.agent/planner_reports/` empty ✅

## Cost

**$0**

## Recommended next step

**Human + ChatGPT review, then create DECISION.**

Then (executor mild preference): **`AgentOps-5e-followup-prompt-
tune-implement`** — separate TASK + RUN_REPORT + DECISION + human GO
· ~$0.10 · implement prompt patch only · 1 A + 1 B run · no retries
· no baseline mutation · no promotion · no 5f-promote.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT implement prompt changes.** **Do NOT run
A/B.** **Do NOT start AgentOps-5f-promote.**
