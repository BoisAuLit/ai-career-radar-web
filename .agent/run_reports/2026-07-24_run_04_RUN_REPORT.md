# RUN REPORT · AgentOps-5e-followup-baseline-lint-design · Structural evidence validator design

## Metadata

- **task_id**: `2026-07-24_run_04`
- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-design
- **parent_loop**: AgentOps-5e-followup-prompt-refinement-implement
  (`2026-07-24_run_03` · Outcome A)
- **task_path**: `.agent/tasks/2026-07-24_run_04_TASK.md`
- **findings_path**: `.agent/findings/2026-07-24_structural_evidence_lint_inventory.json`
- **memo_path**: `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-design.md`
- **impl_commit**: `badbe0a` (Design structural evidence lint)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_03_DECISION.md`

## Regression verdict

- **regression_required**: no
- **reason_required_or_not**: design-only structural validation
  planning; no code, prompt, checker, harness, baseline, or runtime
  behavior changed
- **harness_used**: no
- **harness_command**: not_run
- **fixture_ids**: none
- **target_environment**: local design inspection
- **latest_run_id**: not_applicable
- **verdict**: `not_required`
- **exit_code**: not_applicable
- **artifact_paths**:
  - `.agent/tasks/2026-07-24_run_04_TASK.md`
  - `.agent/findings/2026-07-24_structural_evidence_lint_inventory.json`
  - `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-design.md`
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

## Current structural signals

12 signals inventoried in memo § 6 · missing today (validator
target): per-gap citation coverage · exactly-5-gaps invariant ·
body-cited vs Appendix-jd_id consistency (RED severity) ·
deterministic canonical Appendix row parser · capture-scope-not-
evaluable classification.

## Validator responsibility

10 structural questions V1-V10（memo § 8）: exact `## Evidence
Appendix` heading · ≥ 5 recognized `Evidence quote:` lines · per-gap
coverage · exactly 5 gaps · body-cited jd in Appendix · Appendix row
validity · dedup correctness · uncited Appendix rows · citation
concentration · capture sufficiency.

## Explicit exclusions

Quote exactness (belongs to R1/R2 in QI) · R1/R2 tier matching ·
semantic relevance · JD selection quality · source diversity
minimum · `jd_000201` presence.

## Count semantics

4 distinct counts: `citation_line_count` · `per_gap_coverage_count` ·
`unique_cited_jd_count` · `appendix_row_count`. Policy: `min(lines)
= 5` · `min(per_gap) = 5` · no minimum on unique jds · appendix rows
may be fewer than lines when jd_ids repeat. **Canonical GREEN
example**: Fixture A refined-run · 5/5/4/4.

## Selected parsing strategy

- **Ranked-gap**: narrow deterministic regex/state machine (Option
  C · no new dep · robust to prose changes within Markdown-heading
  boundaries)
- **Appendix**: narrow reimplementation of canonical tab-separated
  format only (prompt now emits only one format per Option B-lite);
  checker `extractAppendix` remains untouched; validator-vs-checker
  count mismatch → AMBER `structural_parser_ambiguity`

## Appendix consistency rules

- `missing_from_appendix` (body cite not in Appendix) → **RED**
- `malformed_appendix_row_when_required` → **RED**
- `duplicate identical row` → **AMBER** (dedup miss)
- `Appendix entry not cited` → **AMBER** telemetry
- `duplicate body citations same jd different span` → **GREEN**
- `fewer Appendix rows than citation lines` → **GREEN** when body
  reuses jd_ids

## Verdict policy

- **GREEN**: exactly 5 gaps · 5/5 covered · ≥ 5 lines · Appendix
  present · all body jds in Appendix · no malformed required rows
- **AMBER**: uncited Appendix · duplicate row · identical/redundant
  citation duplicated WITHIN the SAME gap · > 1 citation per gap
  when redundant (still 5/5) · > 5 lines when redundant · parser
  ambiguity  · **NOT** ordinary repeated jd_id across DIFFERENT
  gaps (that stays GREEN)
- **RED**: Appendix missing · gap count ≠ 5 · < 5 lines · gap without
  citation · body cite missing from Appendix · malformed required
  citation · malformed required Appendix row
- **not_evaluable**: capture insufficient · empty body · tool_error

## Selected implementation option

**Option B** — separate `scripts/structural-evidence-check.mjs`
standalone CLI. Zero-dependency · low coupling · easy testable ·
clean rollback · does not touch R1/R2. Rejected: A (extend QI checker
· coupling risk) · C (harness inline · low testability) · D (shared
library · refactor cost).

## CLI and exit-code design

```
node scripts/structural-evidence-check.mjs \
  --report <report.md> --output <structural_evidence_summary.json>
```

- Exit **0** — GREEN or AMBER (telemetry emitted OK)
- Exit **1** — RED structural (telemetry emitted OK)
- Exit **2** — tool / config / input error
- No network · no LLM · no rewrite
- Artifact written via temp+rename for atomicity
- stdout one-line summary · stderr diagnostics on tool_error only

## Harness integration boundary

**Phase 2 only** (separate loop). Timing: after report capture ·
after QI check · before final verdict artifact. No retry · no
rewrite. Writes `structural_evidence_summary.json`. Records
validator_exit_code + validator_duration_ms + validator_hash in
metadata. **Legacy verdict impact initially: none** (telemetry-only).
`verdict.md` includes both blocks side-by-side. On validator error →
record `tool_error` + emit summary with `verdict = not_evaluable`;
do NOT silently ignore / auto-retry / fall back.

## Baseline metadata design

**Draft only · not applied.** Sibling block `structural_evidence`
mirroring `quote_integrity` shape (14 fields). Pre-validator
baselines would need a narrow
`AgentOps-5e-followup-baseline-lint-migrate` DECISION analogous to
`5e-migrate` if metadata migration is later approved (phase 4).
Values would be `not_evaluated · null verdict · grandfathered=true ·
grandfather_reason="pre_structural_validator_baseline" ·
blocking_mode=telemetry_only · promotion_eligibility=requires_review`.

## Deterministic test matrix

23 fixtures (memo § 26 · full list in findings JSON):

- **GREEN**: G1-G4
- **RED**: R1-R10
- **AMBER**: A1-A5
- **not_evaluable**: N1
- **tool_error**: E1-E3

## Rollout phases

6 phases (memo § 27): Standalone impl+tests (Phase 1 · $0) → Harness
telemetry integration (Phase 2 · $0) → Controlled A+B (Phase 3 ·
~$0.10 · separate GO+cost approval) → Baseline migration (Phase 4 ·
$0 · grandfathering exception clause) → Stability collection (Phase
5) → Promotion DECISION (Phase 6). **No phase auto-implies next.**

## Policy-question resolutions (Q1-Q15)

Full answers in memo § 30 + findings JSON `policy_resolutions`.
Key resolutions: exactly-5 gaps · ≥ 5 lines · **repeated jd_id
across DIFFERENT gaps allowed AND GREEN** (five unique jd_ids NOT
required · source diversity out of scope · Fixture A 5/5/4/4 is
canonical GREEN) · missing-from-Appendix RED · uncited-Appendix
AMBER · duplicate-row AMBER (or RED if conflicting content) ·
identical/redundant citation WITHIN the SAME gap AMBER · > 1 per-gap
when redundant AMBER · missing-Appendix RED in structural summary
but telemetry-only · insufficient-capture not_evaluable · **Option
B** separate CLI · **first impl standalone only** · **no baseline
mutation in first loop** · **no legacy verdict impact initially** ·
**controlled A+B required before blocking promotion** · **5f-promote
NOT authorized after implementation**.

## Risks

8 risks (memo § 31): parser drift · prompt-shape coupling · capture
not_evaluable masking · benign AMBER visibility · jd_id
normalization · verdict.md hiding · migration cost · single-loop
stability.

## No implementation / no generation / no changes

- **No implementation** ✅
- **No generation** ✅
- **No checker / parser / harness change** ✅
- **No R1 / R2 change** ✅
- **No baseline mutation / promotion** ✅
- **QI remains telemetry-only** ✅
- **Structural lint remains design-only** ✅

## Boundary confirmations · 全 CLEAN

no implementation · no code / prompt / script change · no generation
· no fixture run · no LLM / API · no checker / parser / harness
change · no R1 / R2 relaxation · no fuzzy / edit-distance / LLM
judge / post-generation replacement / silent rewriting · no
structural validator implemented (design only) · no baseline
mutation / promotion · no blocking promotion · no 5f-promote · no
pipeline change · no `.agent/scripts/**` change · no threshold /
retry / package / config / workflow / env / Vercel change · no
C/D/E · no A-E · no PDFs · no OpenAI · no `report.md` / screenshot /
long quote / secret committed · no push · no deploy · BLK-0001/0002/
0003 open · G2.1d blocked_pending_human · Q10 pause · Codex planner
spec-only.

## Cost

**$0** — no runtime activity of any kind.

## Recommended next step

**Human + ChatGPT review, then create DECISION.**

Executor mild preference: **approve** · required_fixes **none** ·
confirm Option B · authorize next loop = **phase 1
`AgentOps-5e-followup-baseline-lint-implement`** ($0 · standalone
validator + deterministic tests · no harness integration · no
baseline mutation) with separate human GO.

Alternative: handoff / pause and collect stability re-run evidence
later under separate cost approval.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.**
**Do NOT push.** **Do NOT implement validator.** **Do NOT integrate
harness.** **Do NOT mutate baselines.** **Do NOT run A/B.** **Do
NOT promote anything.** **Do NOT start `AgentOps-5f-promote`.**
