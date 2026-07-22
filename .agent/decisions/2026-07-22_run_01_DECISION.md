# DECISION · AgentOps-5d-R2 · Terminal-punctuation AMBER micro-tier

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-22). Standing in for the ChatGPT
> reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-22_run_01_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-22_run_01_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-22_run_01_TASK.md`
- **loop**: `AgentOps-5d-R2`
- **parent_loop**: `AgentOps-5c` (`2026-07-21_run_03`)
- **impl_commit**: `b6249cb` (Add quote integrity R2 terminal punctuation tier)
- **run_report_commit**: `2a9d896` (Add RUN_REPORT 2026-07-22_run_01)
- **files_reviewed**:
  - `.agent/tasks/2026-07-22_run_01_TASK.md`
  - `scripts/quote-integrity-check.mjs` (modified · +82 / −5 · additive-only)
  - `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json`
    (~6 KB · v0.3-r2-terminal-punctuation)
  - `.agent/design_memos/2026-07-22_AgentOps-5d-R2_terminal_punctuation_micro_tier.md`
    (21-section findings memo)
  - `.agent/run_reports/2026-07-22_run_01_RUN_REPORT.md`
    (dogfoods 3f `## Regression verdict` with `regression_required=no`,
    `verdict=not_required`, plus separately recorded
    `quote_integrity_verdict=red`)
  - `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
    (read-only · v0.2 preserved · 2 REDs preserved · frozen per 5c
    DECISION §Policy decision R2)
  - `.agent/decisions/2026-07-21_run_03_DECISION.md` (5c approve · R1
    keep RED · R2 approved · read-only)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — DECISION confirms R2 tier ships and shapes the
AgentOps-5c-integrate scope. No push, no deploy pending explicit
human approval per turn.

## Reasoning summary

AgentOps-5d-R2 successfully implemented the approved R2
terminal-punctuation AMBER micro-tier in
`scripts/quote-integrity-check.mjs`. The implementation was
additive-only, enforced the eight strict R2 conditions, bumped the
quote-integrity summary schema to `v0.3-r2-terminal-punctuation`, and
produced a new committed summary artifact under
`.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/`.
The checker was re-run against the same Fixture B source report and
cleaned served corpus. **Microsoft `jd_000173` correctly moved from
RED to AMBER** via `terminal_punctuation_only` with `sub_tier =
case_insensitive` and source terminal comma. **NVIDIA `jd_000201`
correctly stayed RED** because the model inserted a grammar-bridging
connector in the post-ellipsis fragment, preserving the R1 policy
that grammar bridging remains RED. The overall
`quote_integrity_verdict` remains **RED**, which is intended because
one true R1 RED remains. **Fabricated / unmatched count dropped from
2 → 1**, which is the meaningful signal.

The loop respected all boundaries: no generation, no report
regression harness, no Playwright, no LLM/API calls, no OpenAI API,
no baseline mutation, no regression run mutation, no fixture
mutation, no `src` changes, no `.agent/scripts` changes, no pipeline
changes, no uploaded PDFs, no `report.md` or screenshots committed,
no push/deploy, and cost **$0**.

## Approved direction

- **Approve AgentOps-5d-R2.**
- **Accept the R2 terminal-punctuation AMBER micro-tier
  implementation.**
- **Accept `schema_version = v0.3-r2-terminal-punctuation`.**
- **Accept the new `quote_integrity_summary.json` artifact** at
  `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/`.
- **Accept Microsoft `jd_000173` RED → AMBER** as correct.
- **Accept NVIDIA `jd_000201` remaining RED** as correct.
- **Accept overall `quote_integrity_verdict` remaining RED** as
  correct — because R1 grammar bridging remains RED.
- **Keep R1 grammar bridging RED.**
- **Keep R2 narrow and governed by the eight strict conditions.**
- **Keep no LLM judge.**
- **Keep no edit-distance matching.**
- **Keep no semantic equivalence.**
- **Keep A/B baselines grandfathered** and do NOT mutate them in
  this DECISION.
- **Do NOT retroactively modify the 5c artifact.**
- **Do NOT run controlled A/B generation** in this DECISION.
- **Do NOT run C/D/E.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest uploaded PDFs.**
- **Do NOT introduce OpenAI API.**
- **Recommended next loop**: **AgentOps-5c-integrate**, wiring
  `scripts/quote-integrity-check.mjs` into
  `scripts/report-regression-local.mjs` artifact envelope without
  generation.

## Quote-integrity summary (as recorded in the committed artifact)

- **artifact_path**: `.agent/quote_integrity_runs/20260722T_AGENTOPS5D_R2_fixture-B/quote_integrity_summary.json`
- **schema_version**: **`v0.3-r2-terminal-punctuation`**
- **fixture_id**: `B`
- **source_run_id**: `20260719T054151Z_fixture-B`
- **corpus_path**: `src/data/web_bundle.json`
- **corpus_record_count**: **443**
- **ground_truth**: `cleaned_served_corpus`
- **verdict**: **`red`**
- **verbatim_matches**: 3
- **terminal_punctuation_only_matches**: **1** (new field, new match)
- **fabricated_or_unmatched_quotes**: **1** (down from 2)
- **duplicates**: 1
- **appendix_entries_not_cited**: 1

## 5c → 5d-R2 delta

| metric | 5c | 5d-R2 | delta |
|---|---:|---:|---|
| `terminal_punctuation_only_matches` | (n/a) | **1** | **+1 new** |
| `fabricated_or_unmatched_quotes` | 2 | **1** | **−1** |
| **Microsoft `jd_000173`** | **RED** | **AMBER** | **RED → AMBER** |
| **NVIDIA `jd_000201`** | **RED** | **RED** | RED → RED (R1 preserved) |
| **overall verdict** | **red** | **red** | red → red (intended) |

## R2 policy confirmation

The terminal-punctuation-only micro-tier is approved **only when all
eight strict conditions hold**:

1. source id resolves
2. company check passes
3. role/title check is `pass` or `unknown`, not `fail`
4. the only unmatched difference is the final punctuation mark
5. the rest matches verbatim, normalized, or case-insensitive
   normalized
6. no word has been inserted, deleted, reordered, or replaced
7. quote length is at least **40 non-space characters**
8. punctuation change preserves meaning
   - allowed source terminals: `,` · `;` · no-final-punct
   - forbidden: `?` · `!` · `:` · any internal punctuation change ·
     any word-level difference

## R1 policy confirmation

**Post-ellipsis grammar bridging remains RED.**

- If **all meaningful ellipsis fragments match** the same source
  body → classify as **AMBER** (`ellipsis_fragments`).
- If the model inserts a **connector word or bridge phrase** not
  present in the corpus → classify as **RED**
  (`unmatched_ellipsis_fragment`).

## RED reasons (after R2)

- `unmatched_ellipsis_fragment for jd_000201` (NVIDIA — R1 preserved)

(Only remaining RED. Verdict still `red` because any single RED
escalates the rollup.)

## AMBER reasons (after R2)

- **`terminal-punctuation-only match for jd_000173`** (Microsoft —
  R2 fired · new)
- `in appendix but not cited by any Evidence quote: jd_000310`
  (Scale AI · unchanged)
- `duplicate evidence quotes: 1` (Databricks · unchanged)

## What worked

- R2 tier implementation was **additive-only** (~65 lines new · one
  helper + one integration point + minor plumbing · no existing tier
  weakened · no LLM · no edit-distance · no network).
- All eight R2 conditions enforced deterministically · trivially
  auditable.
- Microsoft `jd_000173` moved **RED → AMBER** with full audit trail
  visible in `sample_items[3].r2_sub_tier` and
  `sample_items[3].r2_source_terminal_char`.
- NVIDIA `jd_000201` stayed **RED**, preserving R1 policy exactly.
- 5c artifact remained **frozen and unchanged** (verified: still
  `v0.2-integration-prototype`, still 2 REDs, no diff).
- New `v0.3-r2-terminal-punctuation` summary artifact is small
  (~6 KB) and diff-friendly.
- No full report body or long quote excerpts were committed.

## What remains brittle

- Overall verdict remains **RED** due to NVIDIA R1 — **intended**.
- Role/title check is still a title-presence placeholder.
- Only `Evidence quote:` pattern is gated.
- Corpus `|` → `\n` normalization remains a heuristic at ingest.
- Checker is **not yet integrated** into
  `scripts/report-regression-local.mjs`.
- A/B baselines remain **`quote_integrity_not_evaluated`**
  conceptually.
- No controlled A/B regeneration with checker attached has happened.
- No production quote validation exists.

## Recommended next loop

**AgentOps-5c-integrate**:

- Wire `scripts/quote-integrity-check.mjs` into
  `scripts/report-regression-local.mjs`.
- Include `quote_integrity_summary.json` in regression run
  artifacts.
- Add `quote_integrity_verdict` / `quote_integrity_summary_path` /
  `quote_integrity_counts` into metadata or equivalent run
  envelope.
- Add a quote-integrity section to `verdict.md`.
- Include `quote_integrity_verdict` in RUN_REPORT.
- **No new generation required.**
- **No baseline mutation.**
- **No C/D/E.**
- **No A-E.**
- **No uploaded PDFs.**
- **No LLM/API.**
- Cost **$0**.

**After AgentOps-5c-integrate**:

- Run **controlled A+B generation with checker attached** in a
  separate loop.
- Expected cost approximately **~$0.10**.
- Still **no baseline mutation** unless separately approved.

## Required fixes

**`none`**

## Risks found · 10

1. `quote_integrity_verdict` still RED due to NVIDIA R1.
2. R1 grammar bridging is a true quote-integrity concern and should
   remain RED.
3. R2 is now handled but intentionally narrow.
4. Checker is not yet integrated into the report regression harness.
5. A/B baselines remain `quote_integrity_not_evaluated`
   conceptually.
6. No controlled A/B generation with checker attached has happened.
7. No production quote validation exists.
8. C/D/E still not real-run.
9. Uploaded 20 PDFs remain out of scope.
10. BLK-0001 / BLK-0002 / BLK-0003 remain `open` and unaffected.

## Non-blocking followups

- **Push AgentOps-5d-R2 after human approval.**
- **Update daily summary after push.**
- **Next recommended loop**: **AgentOps-5c-integrate**
  harness-envelope integration.
- Then **controlled A+B generation with checker attached**.
- Do not mutate A/B baselines yet.
- Do not use LLM judge.
- Do not use edit-distance.
- Do not ingest uploaded PDFs.
- Do not run C/D/E yet.
- Do not introduce OpenAI API.
- Do not modify `.agent/scripts/**`.
- Do not modify `src/**`.
- Do not modify pipeline.

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-5c-integrate. Do NOT run harness. Do NOT run Playwright.
Do NOT run report generation. Do NOT call Anthropic/OpenAI. Do NOT
run C/D/E. Do NOT run A-E full suite. Do NOT ingest uploaded PDFs.
Do NOT modify baselines. Do NOT modify fixtures. Do NOT modify
pipeline. Do NOT modify `.agent/scripts/**`. Do NOT modify `src/**`.
Do NOT edit `scripts/report-regression-local.mjs`. Do NOT implement
Codex planner. Do NOT create `.agent/planner_reports/`. Do NOT run
collector. Do NOT refresh corpus. Do NOT modify GitHub Actions. Do
NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start G2.1d.
Recommended next task after push/cleanup is
**AgentOps-5c-integrate** (wire checker into
`scripts/report-regression-local.mjs` · include
`quote_integrity_summary.json` in run artifacts · add
`quote_integrity_*` fields to metadata + `verdict.md` +
RUN_REPORT · no new generation · no baseline mutation · no LLM/API ·
no OpenAI · no PDFs · no C/D/E · no A-E · **$0 cost**).

## Boundary confirmations · 27 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No report generation | ✅ |
| No report regression harness run | ✅ |
| No Playwright | ✅ |
| No LLM / API calls | ✅ |
| No OpenAI API | ✅ (BLK-0003 unchanged) |
| No baseline mutation | ✅ (A + B untouched · grandfathered) |
| No `.agent/regression_baselines/**` changes | ✅ |
| No `.agent/regression_runs/**` changes | ✅ |
| No `.agent/regression_fixtures/**` changes | ✅ |
| **No 5c artifact mutation** | ✅ (v0.2 preserved · 2 REDs preserved) |
| No `report.md` committed | ✅ |
| No screenshot committed | ✅ |
| No uploaded PDFs committed | ✅ |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `src/**` changes | ✅ (`src/data/web_bundle.json` read-only reference only) |
| No pipeline changes | ✅ (`b019786` 起终一致) |
| No collector run / corpus refresh | ✅ |
| No GitHub Actions changes | ✅ |
| No `package.json` / lockfile changes | ✅ |
| No `.env*` read | ✅ |
| No `vercel.json` / Codex-Claude config changes | ✅ |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |
| Cost for this DECISION loop | ✅ **$0** |
| Any generation happened | ✅ **no** |
| Harness ran | ✅ **no** |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says "push AgentOps-5d-R2".
