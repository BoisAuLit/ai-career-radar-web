# Design memo · AgentOps-5e-followup-baseline-lint-design · Structural evidence validator

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-design
- **parent_loop**: AgentOps-5e-followup-prompt-refinement-implement (`2026-07-24_run_03` · Outcome A · approved)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_03_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_04_TASK.md`
- **cost**: **$0**

## 1 · Purpose

Design (but not implement) a deterministic structural validator that
can measure and fail structural evidence regressions **without
rewriting output, invoking an LLM, or automatically retrying
generation**.

## 2 · Background

Two prior loops in the 5e-followup arc bracketed this need:

- **`5e-followup-prompt-tune-implement`** — verbatim-only prompt
  patch caused the model to omit the citation apparatus entirely.
  Structural regression went undetected by legacy verdict because
  `contains_evidence_appendix` is red-level but does not currently
  flip exit code, and no per-gap or count check existed. Rolled
  back.
- **`5e-followup-prompt-refinement-implement`** — Option B-lite
  restored the apparatus (5 lines · 5/5 per-gap · Appendix present)
  AND achieved exact `jd_000201` verbatim in B. Success is
  currently observable only in QI counts + manual per-gap grep.

The gap is a **deterministic first-class structural signal** that
records these facts as their own artifact.

## 3 · Successful prompt refinement

Committed prompt (`src/lib/prompts.ts` on `main` at `090d6c4`)
requires:

- Exactly 5 numbered ranked gaps
- 1 Evidence quote line per gap · exact
  `Evidence quote: "TEXT" — Company, jd_XXXXXX.` shape
- Mandatory `## Evidence Appendix` heading · tab-separated rows
- Verbatim quotes · shorter fragments preferred over omission
- Structure-first self-check

The validator this memo designs is the **read-side counterpart**
to that prompt contract.

## 4 · Scope

Design only. No code change. No prompt change. No generation. No
fixture run. No LLM/API call. Cost $0.

## 5 · Out of scope

- Implementation
- Harness integration
- Baseline metadata mutation
- Promotion
- New A+B paid validation
- Any change to the QI checker / harness / parser / R1 / R2 /
  thresholds
- `AgentOps-5f-promote`
- Structural validator becoming blocking

## 6 · Current structural signals (inventory)

From `.agent/regression_runs/20260724T040011Z_fixture-A` (healthy
refined run) and equivalents:

| signal | source | producer | current-blocking | sufficient? |
|---|---|---|---|---|
| `contains_evidence_appendix` | `report-regression-local.mjs` | harness | binary presence check · red-level tag | **NO** — presence only, no rows/dedup/consistency |
| `evidence_quotes_with_citation` | `quote-integrity-check.mjs` | `extractEvidenceQuotes` | no | partial — total only, no per-gap |
| `evidence_entries` | checker | dedup on (jd_id, quote_text) | no | ambiguous — differs from lines when reuse |
| `unique_cited_jd_count` | derivable | checker sample_items | no | no |
| `quote_candidates` | checker | `extractAllDoubleQuoted` | no | too broad |
| `fabricated_or_unmatched_quotes` | checker | tier aggregation | no | belongs to QI, not structural |
| `terminal_punctuation_only_matches` | checker | R2 tier | no | belongs to QI |
| `appendix_entries_not_cited` | checker | cross-check | no | partial (one of several consistency signals) |
| `legacy_verdict` | harness | 25-check aggregate | yes | insufficient for structural evidence |
| `completion_state` | harness | fail-fast race | yes | orthogonal (network/capture) |
| `capture_scope` | harness | shortest-qualified strategy | no | gating input |
| `fallback_used` | harness | capture strategy | no | gating input |

**Missing today** (validator target):

- per-gap citation coverage
- exactly-5-gaps invariant check
- body-cited-jd_id vs Appendix-jd_id consistency (RED-severity)
- deterministic Appendix row parsing against the single canonical
  tab-separated format
- capture-scope-not-evaluable classification

## 7 · Current blocking behavior

- Legacy exit code = red if any red-level structural check fails
  AND / OR duration ≥ 240 s.
- `contains_evidence_appendix` is red-level tagged but has been
  observed to NOT flip exit code in the 5e-implement-rejected runs
  (both had `red_reasons_count = 1` for appendix missing yet exit
  0 GREEN). Reason: the harness aggregates only certain failure
  conditions into the exit code; some red-level checks are advisory.
- **QI is telemetry-only** — never blocks.
- The new structural validator MUST also start telemetry-only.

## 8 · Validator responsibility

Answers **10 structural questions** (V1-V10):

| id | question |
|---|---|
| V1 | Does the report contain the exact `## Evidence Appendix` heading? |
| V2 | ≥ 5 parser-recognized Evidence quote lines? |
| V3 | Each of the 5 ranked gap sections contains ≥ 1 recognized Evidence quote line? |
| V4 | Exactly 5 ranked gaps present? |
| V5 | Every cited body `jd_id` appears in the Appendix? |
| V6 | Appendix rows syntactically valid and parser-recognized? |
| V7 | Duplicate Appendix rows correctly de-duplicated? |
| V8 | Uncited Appendix rows present? |
| V9 | Citations concentrated in one gap vs distributed 5/5? |
| V10 | Captured report scope sufficient to make these determinations? |

## 9 · Explicit exclusions

- Quote exactness (belongs to R1/R2 in QI checker)
- R1/R2 tier matching (unchanged)
- Semantic relevance
- JD selection quality
- Source diversity (no minimum unique jd count)
- Whether `jd_000201` must appear

## 10 · Count semantics

**Four distinct counts** — do NOT treat interchangeably:

| count | definition |
|---|---|
| `citation_line_count` | parser-recognized `Evidence quote:` lines anywhere in body |
| `per_gap_coverage_count` | number of gaps 1-5 with ≥ 1 recognized citation line |
| `unique_cited_jd_count` | distinct jd_ids across all body citations |
| `appendix_row_count` | distinct valid Appendix rows after dedup |

**Policy** (matches `2026-07-24_run_03_DECISION` explicit clause):

- `min(citation_line_count) = 5`
- `min(per_gap_coverage_count) = 5`
- **no minimum on `unique_cited_jd_count`** — repetition allowed if
  lines cover 5/5 gaps
- `appendix_row_count` may be less than `citation_line_count` when
  body reuses jd_ids

**Canonical example (Fixture A refined-run · GREEN)**:
5 citation lines · 5/5 gap coverage · **4** unique jd_ids · **4**
Appendix rows — **structurally VALID**.

## 11 · Ranked-gap parsing

**Selected strategy**: **C — narrow deterministic regex / state
machine**.

- Detect `## Your top 5 gaps` heading → enter gap section
- Detect gap boundaries via `^\d+\.\s+` line-start regex
- Detect Evidence quote lines within each gap via checker regex
  `Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})`
- Exit gap section on next `## ` heading
- Zero new dependencies · deterministic · robust to prose changes
  as long as Markdown-heading boundaries hold

Rejected: Markdown AST (adds npm dep), reuse-existing-helpers (no
helpers to reuse), example-pattern-only (fragile to prompt drift).

## 12 · Appendix parsing

**Selected strategy**: **narrow reimplementation** of the checker's
primary tab-separated path (`jd_id\tcompany\ttitle`).

- Prompt now emits ONLY tab-separated format (per `2026-07-24_run_03`
  Option B-lite contract).
- Validator implements narrow parser matching that one format.
- Checker's `extractAppendix` remains untouched and continues to
  accept 2-space and pipe alternates for backward compatibility.
- If validator and checker Appendix row-counts disagree → emit
  `structural_parser_ambiguity` **AMBER** signal (visible, non-
  blocking).

## 13 · Body / Appendix consistency

Deterministic sets:

- `body_cited_jd_ids` = distinct jd_ids from recognized citation lines
- `appendix_jd_ids` = distinct jd_ids from valid Appendix rows
- `missing_from_appendix` = `body_cited_jd_ids − appendix_jd_ids`
- `appendix_not_cited` = `appendix_jd_ids − body_cited_jd_ids`
- `duplicate_appendix_jd_ids` = jd_ids appearing > 1 time in Appendix

**Severity**:

- `missing_from_appendix` → **RED**
- `malformed_appendix_row_when_required` → **RED**
- `duplicate identical Appendix row` → **AMBER** (dedup miss)
- `Appendix entry not cited` → **AMBER telemetry**
- `duplicate body citations same jd different span` → **GREEN**
- `fewer Appendix rows than citation lines` (body reuses jd_ids) →
  **GREEN**

## 14 · Per-gap coverage

For each gap 1..5, record:

```json
{
  "gap_number": 1,
  "citation_count": 1,
  "cited_jd_ids": ["jd_000347"],
  "covered": true
}
```

`covered_gap_count` = count of gaps with `citation_count ≥ 1`.

Report validator RED if `covered_gap_count < 5` OR
`observed_gap_count ≠ 5`.

## 15 · Verdict semantics

**GREEN**:

- exactly 5 ranked gaps
- 5/5 per-gap coverage
- `citation_line_count ≥ 5`
- Appendix present
- all body jd_ids represented in Appendix
- no malformed required rows

**AMBER**:

- Appendix contains uncited entries
- duplicate identical Appendix row
- more than one citation in a single gap (all gaps still covered)
- more than 5 total citation lines
- repeated jd_id across multiple gaps (visible signal · not RED)
- structural parser ambiguity (validator vs checker disagreement)

**RED**:

- Appendix missing
- fewer or more than 5 ranked gaps (contract says exactly 5)
- fewer than 5 recognized citation lines
- any ranked gap lacks a citation
- body citation jd_id missing from Appendix
- malformed citation line where required
- malformed required Appendix row

**not_evaluable**:

- capture_scope insufficient (do NOT overload RED with tool-side
  deficiencies)
- report body empty
- tool_error

## 16 · Artifact schema (draft · not implemented)

`structural_evidence_summary.json` in the run directory:

```json
{
  "schema_version": "0.1-design",
  "verdict": "green|amber|red|not_evaluable",
  "required_gap_count": 5,
  "observed_gap_count": 5,
  "recognized_citation_line_count": 5,
  "unique_cited_jd_count": 4,
  "per_gap": [
    {"gap_number": 1, "citation_count": 1, "cited_jd_ids": ["jd_000347"], "covered": true}
  ],
  "covered_gap_count": 5,
  "appendix": {
    "present": true,
    "row_count": 4,
    "jd_ids": ["jd_000347","jd_000089","jd_000173","jd_000042"],
    "malformed_rows": [],
    "duplicate_rows": []
  },
  "body_appendix": {
    "missing_from_appendix": [],
    "appendix_not_cited": []
  },
  "red_reasons": [],
  "amber_reasons": [],
  "capture_scope": "main section",
  "capture_evaluable": true,
  "tool_error": null,
  "checker_hash_at_evaluation": "105ce8a"
}
```

## 17 · Structural vs quote-integrity separation

Two independent summaries per run:

- `quote_integrity_summary.json` — R1/R2/fabricated matching
  (existing)
- `structural_evidence_summary.json` — Appendix / citation count /
  per-gap / body-Appendix consistency (new)

**Combined evaluation policy (first implementation)**:

- Legacy verdict remains unchanged initially.
- Structural lint remains **telemetry-only** initially.
- No baseline eligibility or promotion impact in first
  implementation.
- Neither summary masks the other in `verdict.md`.

**Example coexistence**:

- `quote_integrity = green`
- `structural_evidence = red`
- combined telemetry surfaces both
- legacy verdict remains green until a separate promotion DECISION

## 18 · Implementation-location options

- **A · extend `scripts/quote-integrity-check.mjs`** — REJECT
  (couples structural to R1/R2 evolution; risks touching tier logic)
- **B · new `scripts/structural-evidence-check.mjs`** — **PRIMARY**
- **C · extend harness inline** — REJECT (harness already large;
  low testability; high coupling)
- **D · shared parser library + two CLIs** — DEFER (worth revisit
  only if a third checker emerges)

## 19 · Selected design

**Option B — standalone `scripts/structural-evidence-check.mjs`**.

- Separation of concerns
- No risk to R1/R2
- Small independent file · zero-dependency
- Easy to test / lint / revert
- Clean rollback (delete file)
- Parser duplication risk mitigated: prompt emits only one canonical
  Appendix format

## 20 · CLI contract

```
node scripts/structural-evidence-check.mjs \
  --report <report.md path> \
  --output <structural_evidence_summary.json path> \
  [--fixture <A|B|C|D|E>] [--source-run-id <id>] [--help]
```

- **No network access**
- **No LLM access**
- **No report rewriting**
- Writes artifact via temp+rename for atomicity
- stdout: one-line summary
- stderr: diagnostics on `tool_error` only

## 21 · Exit codes

- **0** — GREEN or AMBER telemetry result generated successfully
- **1** — RED structural result generated successfully
- **2** — tool / config / input error (unreadable · malformed args)

Rationale: harness can distinguish "validator ran and reported
non-green" (exit 1) from "validator failed to run" (exit 2). Not-
evaluable is still a normal artifact (exit 0), because the
validator produced a valid signal — it just couldn't reach a
verdict.

## 22 · Harness integration (deferred to phase 2 loop)

- **Timing**: after report capture · after QI check · before final
  verdict artifact
- **No retry**
- **No rewrite**
- **Writes** `structural_evidence_summary.json` in run dir
- **Records** validator_exit_code · validator_duration_ms ·
  validator_hash in metadata
- **Legacy verdict impact (initial)**: **none** (telemetry-only)
- **QI verdict impact (initial)**: **none**
- **`verdict.md`** includes both blocks side-by-side

## 23 · Tool-error behavior

- Record `tool_error` in metadata
- Emit `structural_evidence_summary.json` with `verdict = not_evaluable`
  and `reason = tool_error`
- Do NOT silently ignore
- Do NOT auto-retry
- Do NOT fall back to old behavior without a signal

## 24 · Baseline metadata design (draft · not applied)

Sibling block `structural_evidence` mirroring `quote_integrity`
shape (fields: `evaluation_status` · `verdict` · `schema_version` ·
`checker_commit` · `blocking_mode` · `grandfathered` ·
`grandfather_reason` · `evaluated_run_id` · `evaluated_at` ·
`summary_path` · `promotion_eligibility` · `promotion_reasons` ·
`reviewed_by` · `decision_id`).

## 25 · Grandfathering considerations

Pre-validator baselines would require a narrow
`AgentOps-5e-followup-baseline-lint-migrate` DECISION analogous to
`AgentOps-5e-migrate` if metadata migration is later approved.
Current A + B baselines would be:

- `evaluation_status = not_evaluated`
- `verdict = null`
- `grandfathered = true`
- `grandfather_reason = "pre_structural_validator_baseline"`
- `blocking_mode = telemetry_only`
- `promotion_eligibility = requires_review`

**First implementation loop does NOT mutate baselines.**

## 26 · Deterministic test matrix (23 fixtures)

Full list in findings JSON `test_matrix`. Summary:

- **GREEN**: G1-G4 (5-gaps + 5-citations · unique + repeated jd_ids
  · dedupe correct)
- **RED**: R1-R10 (missing Appendix · zero/insufficient lines · gap
  concentration · body/Appendix mismatch · malformed shapes · wrong
  gap count)
- **AMBER**: A1-A5 (uncited Appendix · duplicate row · repeated jd
  · > 5 lines · parser ambiguity)
- **not_evaluable**: N1 (truncated capture)
- **tool_error**: E1-E3 (missing file · unreadable · bad args)

## 27 · Rollout phases

| phase | name | cost | gate |
|---|---|---|---|
| 1 | standalone validator + deterministic tests | $0 | separate TASK+RUN_REPORT+DECISION |
| 2 | harness telemetry integration | $0 | separate TASK+RUN_REPORT+DECISION |
| 3 | controlled A/B validation, no retries | ~$0.10 | separate TASK+RUN_REPORT+DECISION + human GO + cost approval |
| 4 | baseline metadata migration, grandfathered | $0 | separate DECISION + grandfathering exception clause |
| 5 | stability evidence collection | per-run approval | per-run DECISION |
| 6 | promotion DECISION (structural lint → blocking) | $0 | separate DECISION analogous to 5f-promote |

**No phase automatically implies the next.**

## 28 · Cost model

- Design (this loop): **$0**
- Phase 1 implementation + static tests: **$0**
- Phase 2 harness integration: **$0**
- Phase 3 controlled A+B: **~$0.10** (separate approval)
- Phase 4 migration: **$0**
- Phase 5 stability reruns: separate approval per run
- Phase 6 promotion DECISION: **$0**

## 29 · Promotion boundaries

- Structural lint remains **telemetry-only** until phase 6.
- `AgentOps-5f-promote` remains unauthorized until at least: phase 3
  Outcome A · phase 4 baseline migration · phase 5 stability
  evidence · phase 6 explicit promotion DECISION.
- **No auto-promotion at any phase boundary.**

## 30 · Policy-question resolutions (Q1-Q15)

| Q | Question | Recommendation |
|---|---|---|
| Q1 | Exactly 5 or at least 5 gaps? | **exactly 5** |
| Q2 | Exactly 5 or at least 5 citations? | **at least 5** (>5 → AMBER) |
| Q3 | Repeated jd_id across gaps allowed? | **allowed AMBER** (visible · not RED) |
| Q4 | Body-cited jd_id must appear in Appendix? | **yes** — missing_from_appendix RED |
| Q5 | Uncited Appendix rows RED or AMBER? | **AMBER telemetry** |
| Q6 | Duplicate Appendix rows RED or AMBER? | **AMBER** for identical dedup miss · **RED** for conflicting content |
| Q7 | > 1 citation per gap allowed? | **allowed AMBER** |
| Q8 | Missing Appendix RED while telemetry-only? | **yes** RED in structural_evidence_summary · does NOT flip legacy exit code |
| Q9 | Insufficient capture RED or not_evaluable? | **not_evaluable** — do NOT overload RED |
| Q10 | Separate CLI or extend checker? | **separate CLI** (Option B) |
| Q11 | First implementation touch harness? | **NO** — phase 2 |
| Q12 | First implementation mutate baseline metadata? | **NO** — phase 4 with grandfathering exception |
| Q13 | Structural lint affect legacy verdict initially? | **NO** — telemetry-only |
| Q14 | Controlled A+B required before blocking promotion? | **YES** — phase 3 |
| Q15 | 5f-promote authorized after implementation? | **NO** — separate arc; structural stability is prerequisite but not sufficient |

## 31 · Risks

1. Narrow reimplementation of Appendix parser may drift from
   checker — mitigated by validator-vs-checker AMBER signal.
2. Exactly-5-gaps invariant is prompt-imposed; if prompt shape
   changes, validator must update in lockstep.
3. `capture_scope not_evaluable` path may mask real Appendix
   omission — mitigated by keeping harness `completion_state`
   independent.
4. Structural lint may raise AMBER signals for currently-benign
   patterns (uncited Appendix rows) — visible but non-blocking
   initially.
5. jd_id spacing/case bugs could confuse consistency — mitigated by
   exact string match.
6. Harness integration timing could hide the new signal in
   `verdict.md` — fix in phase 2.
7. Baseline metadata migration requires grandfathering exception
   per 5e-migrate precedent.
8. One stability A+B is not sufficient for probabilistic long-term
   behavior — phase 5 needs multiple loops.

## 32 · Open questions

All resolved with executor recommendations in § 30. None
outstanding for the design.

## 33 · Recommendations

- Approve this design.
- Next loop: **`AgentOps-5e-followup-baseline-lint-implement`**
  (phase 1) — **$0** — implement standalone
  `scripts/structural-evidence-check.mjs` + deterministic test
  matrix · no harness integration · no baseline mutation.
- Explicit GO required per loop.
- Do NOT skip to phase 3 (paid A+B).
- Do NOT touch harness in phase 1.

## 34 · Boundaries respected

- ✅ no implementation
- ✅ no code / prompt / script change
- ✅ no generation · no fixture run · no Playwright · no dev server
- ✅ no LLM / API call
- ✅ no checker / parser / harness change
- ✅ no R1 / R2 relaxation
- ✅ no baseline mutation · no promotion · no blocking promotion ·
  no `AgentOps-5f-promote`
- ✅ no pipeline change · no `.agent/scripts/**` change
- ✅ no threshold / retry / package / config / workflow / env /
  Vercel change
- ✅ no C/D/E · no A-E · no PDFs · no OpenAI API
- ✅ no LLM judge · no edit-distance · no fuzzy · no post-generation
  quote replacement · no silent quote rewriting
- ✅ no `report.md` / screenshot / full body / long quote / secret
  committed
- ✅ QI remains telemetry-only
- ✅ structural lint remains **design-only**
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause · Codex
  planner spec-only
- ✅ **cost $0**
