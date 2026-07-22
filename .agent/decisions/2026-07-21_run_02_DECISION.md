# DECISION · AgentOps-5b · Quote integrity parser prototype

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-21). Standing in for the ChatGPT
> reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-21_run_02_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-21_run_02_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-21_run_02_TASK.md`
- **loop**: `AgentOps-5b`
- **parent_loop**: `AgentOps-5a` (`2026-07-21_run_01`)
- **impl_commit**: `8c310b2` (Prototype quote integrity parser · TASK + findings memo)
- **run_report_commit**: `9a8c7a0` (Add RUN_REPORT 2026-07-21_run_02)
- **files_reviewed**:
  - `.agent/tasks/2026-07-21_run_02_TASK.md`
  - `.agent/design_memos/2026-07-21_AgentOps-5b_quote_integrity_parser_prototype.md`
    (22-section findings memo)
  - `.agent/run_reports/2026-07-21_run_02_RUN_REPORT.md`
    (dogfoods 3f `## Regression verdict` with `regression_required=no`,
    `verdict=not_required`)
  - `.agent/design_memos/2026-07-21_AgentOps-5a_quote_integrity_design.md`
    (18-section parent design memo · read-only)
  - `.agent/decisions/2026-07-21_run_01_DECISION.md`
    (approve · six §17 answers · read-only)
  - `.agent/regression_baselines/fixture-B/current/baseline_metadata.json`
    (read-only · B baseline unchanged · promoted 2026-07-20T21:48:00Z)
  - `.agent/regression_runs/20260719T054151Z_fixture-B/metadata.json`
    (read-only · confirmed `scratch_paths.report_md` path used by
    the prototype exists and is the Fixture B baseline source)
  - `/tmp/agentops-5b/qi_summary.json` (scratchpad · read-only inspection)
  - `/tmp/agentops-5b/quote_integrity_parser_probe.mjs` (scratchpad ·
    read-only inspection)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — DECISION shapes the AgentOps-5c integration scope. No
push, no deploy pending explicit human approval per turn.

## Reasoning summary

AgentOps-5b successfully prototyped a deterministic quote-integrity
parser using an existing Fixture B baseline source report and the
cleaned served corpus. The prototype did not run the harness, did
not generate a report, did not call LLM/API, did not mutate
baselines, did not touch `src`, did not touch `.agent/scripts`, did
not touch pipeline, and cost **$0**. The parser produced a RED
verdict on the current Fixture B source report, but this is an
actionable prototype finding rather than evidence of fabricated
product claims. Manual spot-check showed the two REDs were caused
by quote-formatting behavior: one case-only capitalization mismatch
(Microsoft `jd_000173`) and one ellipsis-stitched quote where both
fragments exist in the corpus but the stitched literal does not
(NVIDIA `jd_000201`). The parser also found one AMBER issue where a
Scale AI (`jd_000310`) appendix entry was present but not cited by
any Evidence quote. This proves the report/corpus format is
sufficiently parseable for deterministic quote provenance checking,
and it identifies two concrete refinements needed before
integration.

## Approved direction

- **Approve AgentOps-5b.**
- **Accept that the prototype RED is a useful quality discovery, not
  a reason to revert.**
- **Accept that deterministic quote-integrity checking is feasible**
  with existing `report.md` and `src/data/web_bundle.json`.
- **Accept that 5c should integrate the parser logic into the
  regression artifact envelope only after adding two refinements**:
  1. case-insensitive normalization tier
  2. ellipsis-fragment splitting
- **Keep no LLM judge in v1** (5a DECISION #6 unchanged).
- **Keep no edit-distance matching in v1** (5a DECISION #1 unchanged).
- **Keep blocking RED** for true fabricated quotes, unresolved source
  id, wrong company attribution, wrong role attribution, and true
  quote/source mismatch (5a DECISION #5 unchanged).
- **Keep duplicates as AMBER-only** unless they materially change a
  conclusion.
- **Keep appendix-not-cited evidence as AMBER** in v1 unless the
  report relies on it for a claim.
- **Keep A/B baselines grandfathered** and do NOT mutate them in
  this DECISION (5a DECISION #4 unchanged).
- **Do NOT commit** the scratchpad parser or `qi_summary.json` yet.
- **Do NOT start 5c** in this DECISION.
- **Do NOT run C/D/E.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest the 20 uploaded PDFs.**
- **Do NOT introduce OpenAI API.**
- **Do NOT modify `.agent/scripts/**`.**
- **Do NOT modify `src/**`.**
- **Do NOT modify pipeline.**

## Prototype summary

- **prototype_script**: `/tmp/agentops-5b/quote_integrity_parser_probe.mjs`
- **prototype_script_committed**: **no**
- **prototype_output**: `/tmp/agentops-5b/qi_summary.json`
- **qi_summary_committed**: **no**
- **source_report**: Fixture B baseline source report from
  `20260719T054151Z_fixture-B` scratchpad
  (`/var/folders/xx/…/T/acr-regression-runs/20260719T054151Z_fixture-B/report.md`)
- **corpus**: `src/data/web_bundle.json`
- **corpus_record_count**: **443**
- **corpus_ground_truth**: cleaned served corpus
- **parser_verdict**: **`red`**
- **quote_candidates**: 23
- **evidence_entries**: 5
- **evidence_quotes_with_citation**: 5
- **verbatim_matches**: 3 (Google DeepMind `jd_000042` + Databricks
  `jd_000347` ×2)
- **normalized_matches**: 0
- **missing_source_id**: 0
- **unresolved_source_id**: 0
- **wrong_company**: 0
- **wrong_role**: 0
- **fabricated_or_unmatched_quotes**: 2 (NVIDIA `jd_000201` +
  Microsoft `jd_000173`)
- **duplicates**: 1 (Databricks `jd_000347` evidence quote cited
  twice — same verbatim string)
- **red_reasons**:
  - `unmatched quote for jd_000201`
  - `unmatched quote for jd_000173`
- **amber_reasons**:
  - `appendix entry jd_000310 present but not cited by any Evidence quote`

## Manual spot-check result

The two REDs are not treated as proof of fabrication. They are
quote-formatting issues that the deterministic checker should catch
and classify more precisely in 5c:

1. **NVIDIA `jd_000201`**:
   The report used an ellipsis-stitched quote. The individual
   fragments exist in the corpus body, but the combined literal
   quote does not. In 5c, split on ellipsis and require every
   fragment to match verbatim or normalized. If all fragments match,
   classify as **AMBER**, not RED. If any fragment fails, classify
   as **RED**.
2. **Microsoft `jd_000173`**:
   The report capitalized the beginning of a quote that appears
   lower-case in the corpus body. In 5c, add a case-insensitive
   normalization tier. Case-only mismatch should be **AMBER**, not
   RED.
3. **Scale AI `jd_000310`**:
   Appendix entry exists but is not cited by any Evidence quote.
   Keep this as **AMBER** unless the report uses it to support a
   body claim.

## Approved 5c refinements

- **Add case-insensitive normalization tier**:
  - exact verbatim match: **GREEN**
  - whitespace / punctuation normalized match: **AMBER**
  - case-only normalized match: **AMBER**
  - no match: **RED**
- **Add ellipsis-fragment matcher**:
  - split quoted spans on literal `...` **and** unicode ellipsis (`…`)
  - trim fragments
  - ignore trivial fragments below a conservative length threshold
  - require **all meaningful fragments** to match the **same** source
    JD body
  - all fragments verbatim: **AMBER** because stitched quote is not
    literal
  - all fragments normalized / case-insensitive: **AMBER**
  - any meaningful fragment unmatched: **RED**
- **Add `quote_char_length` and `citation_pattern`** to
  `sample_items` for auditability.
- **Add appendix-vs-evidence cross-check** (already prototyped in 5b;
  formalize into structural checks envelope).
- **Keep duplicate evidence as AMBER-only.**
- **Keep no LLM judge.**
- **Keep no edit-distance matching.**
- **Keep no semantic equivalence in v1.**

## Recommended 5c scope

**AgentOps-5c should be an integration prototype, not a full baseline
refresh.** It may create a committed quote-integrity parser module
or helper under an allowed path, but must **not** use
`.agent/scripts/**`.

**Preferred possible path**:

- `scripts/quote-integrity-check.mjs`

or, if it must remain prototype-only:

- `.agent/prototypes/quote_integrity_parser_probe.mjs`

**5c should**:

- implement the two refinements (case-insensitive AMBER tier +
  ellipsis-fragment splitting)
- read `report.md` and `src/data/web_bundle.json` read-only
- emit `quote_integrity_summary.json`
- integrate `quote_integrity_summary` reference into run artifacts
  or prototype artifact envelope **only if explicitly scoped**
- **NOT** mutate A/B baselines
- **NOT** run a new report generation
- **NOT** run Playwright unless explicitly approved
- **NOT** call LLM / API
- **NOT** use OpenAI API
- **NOT** ingest uploaded PDFs
- **NOT** run C/D/E
- **NOT** run A-E full suite
- **cost $0** unless a controlled generation is explicitly approved
  in the 5c TASK

## Risks found · 14

1. The prototype produced RED on the current Fixture B source report.
2. The RED is due to quote-formatting behavior, not confirmed
   fabrication.
3. Current reports may use stitched ellipsis quotes that are not
   literal source strings.
4. Current reports may alter capitalization at quote boundaries.
5. Evidence Appendix entries may not map cleanly to body citations.
6. The current Evidence Appendix is parseable enough for prototype,
   but likely needs stricter machine-readable citation format later.
7. The parser is scratchpad-only and not yet integrated into harness
   artifacts.
8. `quote_integrity_summary.json` is not yet committed per run.
9. A/B baselines remain `quote_integrity_not_evaluated` conceptually.
10. No baseline refresh has happened.
11. No production quote validation exists.
12. C/D/E still not real-run.
13. Uploaded 20 PDFs remain out of scope.
14. BLK-0001 / BLK-0002 / BLK-0003 remain `open` and unaffected.

## Required fixes

**`none` for AgentOps-5b.**

However, **AgentOps-5c should incorporate the two approved parser
refinements** (case-insensitive AMBER tier + ellipsis-fragment
splitting) **before any blocking quote-integrity gate is used**.

## Non-blocking followups

- **Push AgentOps-5b after human approval.**
- **Update daily summary after push.**
- **Next recommended loop**: **AgentOps-5c quote-integrity
  integration prototype**.
- 5c should add case-insensitive AMBER tier.
- 5c should add ellipsis-fragment splitting.
- 5c should not use LLM judge.
- 5c should not use edit-distance.
- 5c should not mutate A/B baselines.
- 5c should not run new generation.
- 5c should not ingest the 20 uploaded PDFs.
- Do not run C/D/E yet.
- Do not run A-E full suite.
- Do not introduce OpenAI API.
- Do not modify `.agent/scripts/**`.
- Do not modify `src/**` unless a later explicit DECISION scopes
  runtime integration.
- Do not modify pipeline.

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-5c. Do NOT run harness. Do NOT run report generation. Do
NOT call Anthropic/OpenAI. Do NOT run C/D/E. Do NOT run A-E full
suite. Do NOT ingest uploaded PDFs. Do NOT modify code. Do NOT
modify baselines. Do NOT modify fixtures. Do NOT modify pipeline.
Do NOT modify `.agent/scripts/**`. Do NOT modify `src/**`. Do NOT
implement Codex planner. Do NOT create `.agent/planner_reports/`.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT
start G2.1d. Recommended next task after push/cleanup is
**AgentOps-5c · quote-integrity integration prototype** (adds
case-insensitive AMBER tier + ellipsis-fragment splitting;
scratchpad-first or a single new committed helper under `scripts/`
root; no `.agent/scripts/**`; no baseline mutation; no new
generation; no LLM/API; $0).

## Boundary confirmations · 28 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No code runtime changes | ✅ (only `.agent/decisions/`) |
| No harness run | ✅ |
| No report generation | ✅ |
| No LLM / API calls | ✅ |
| No baseline mutation | ✅ (A + B untouched) |
| No `.agent/regression_baselines/**` changes | ✅ |
| No `.agent/regression_runs/**` changes | ✅ |
| No `.agent/regression_fixtures/**` changes | ✅ |
| No scratchpad `/tmp` artifacts committed | ✅ (probe.mjs + qi_summary.json remain in `/tmp/agentops-5b/`) |
| No `report.md` committed | ✅ (read-only inspection only) |
| No screenshot committed | ✅ |
| No uploaded PDFs committed | ✅ |
| No `scripts/report-regression-local.mjs` changes | ✅ (stable at `0341461`) |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No `src/**` changes | ✅ |
| No pipeline changes | ✅ (`b019786` 起终一致) |
| No collector run / corpus refresh | ✅ |
| No OpenAI API | ✅ (BLK-0003 unchanged) |
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
follow-up action is authorized until Bohao says "push AgentOps-5b".
