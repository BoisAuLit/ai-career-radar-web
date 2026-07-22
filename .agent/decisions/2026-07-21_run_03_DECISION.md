# DECISION · AgentOps-5c · Quote-integrity integration prototype

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-22). Standing in for the ChatGPT
> reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-21_run_03_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-21_run_03_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-21_run_03_TASK.md`
- **loop**: `AgentOps-5c`
- **parent_loop**: `AgentOps-5b` (`2026-07-21_run_02`)
- **impl_commit**: `cf0923f` (Add quote integrity checker prototype)
- **run_report_commit**: `9b19da8` (Add RUN_REPORT 2026-07-21_run_03)
- **files_reviewed**:
  - `.agent/tasks/2026-07-21_run_03_TASK.md`
  - `scripts/quote-integrity-check.mjs` (~250 lines · Node ESM · no deps)
  - `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
    (~5 KB · v0.2-integration-prototype)
  - `.agent/design_memos/2026-07-21_AgentOps-5c_quote_integrity_integration_prototype.md`
    (24-section findings memo)
  - `.agent/run_reports/2026-07-21_run_03_RUN_REPORT.md`
    (dogfoods 3f `## Regression verdict` with `regression_required=no`,
    `verdict=not_required`, plus separately recorded
    `quote_integrity_verdict=red`)
  - `.agent/decisions/2026-07-21_run_01_DECISION.md` (5a approve · read-only)
  - `.agent/decisions/2026-07-21_run_02_DECISION.md` (5b approve · read-only)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — DECISION locks R1/R2 policy for the next loop and shapes
the AgentOps-5d scope. No push, no deploy pending explicit human
approval per turn.

## Reasoning summary

AgentOps-5c successfully turned the AgentOps-5b scratchpad
quote-integrity probe into a repeatable integration prototype. It
added `scripts/quote-integrity-check.mjs`, produced a small committed
`quote_integrity_summary.json` artifact, and documented the results
in a findings memo and RUN_REPORT. The loop respected boundaries: no
report generation, no Playwright or report regression harness run,
no LLM/API calls, no OpenAI API, no `src` changes, no
`.agent/scripts` changes, no baseline mutation, no regression run
mutation, no fixture mutation, no pipeline changes, no uploaded PDFs,
no `report.md` or screenshot committed, no push/deploy, and cost
**$0**.

The checker verdict is **RED** on the existing Fixture B baseline
source report, but the RED is approved as **useful integrity signal**
rather than a reason to revert. The two AgentOps-5b refinements were
implemented and exercised honestly. The NVIDIA ellipsis-fragment
matcher fired correctly and found that the model inserted an extra
grammar-bridging `vs.` into the post-ellipsis fragment; this should
remain RED because it is **fabrication-adjacent quote modification**.
The Microsoft case-insensitive tier also ran, but the remaining
mismatch was a **final punctuation swap** (source `,` versus report
`.`); this should be handled by a **narrow future AMBER micro-tier
only under strict conditions**, and not retroactively applied to the
5c artifact.

## Approved direction

- **Approve AgentOps-5c.**
- **Accept `scripts/quote-integrity-check.mjs`** as the repeatable
  quote-integrity checker prototype.
- **Accept `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`**
  as the first small committed quote-integrity artifact.
- **Accept `quote_integrity_verdict=red`** as honest and useful.
- **Do NOT hide or downgrade the current REDs retroactively** in 5c.
- **Keep no LLM judge.**
- **Keep no edit-distance matching.**
- **Keep no semantic equivalence in v1.**
- **Keep A/B baselines grandfathered** and do NOT mutate them in this
  DECISION.
- **Do NOT integrate into `scripts/report-regression-local.mjs`** in
  this DECISION.
- **Do NOT run a new generation** in this DECISION.
- **Do NOT run C/D/E.**
- **Do NOT run A-E full suite.**
- **Do NOT ingest uploaded PDFs.**
- **Do NOT introduce OpenAI API.**
- **Recommended next loop**: **AgentOps-5d-R2** (narrow R2 terminal-
  punctuation AMBER micro-tier · $0 · no generation · no harness · no
  baseline mutation) — then AgentOps-5d controlled A+B generation with
  checker attached (~$0.10) once the checker policy is complete.

## Quote-integrity summary (as recorded in the committed artifact)

- **artifact_path**: `.agent/quote_integrity_runs/20260721T_AGENTOPS5C_fixture-B/quote_integrity_summary.json`
- **schema_version**: `0.2-integration-prototype`
- **status**: `integration_prototype`
- **fixture_id**: `B`
- **source_run_id**: `20260719T054151Z_fixture-B`
- **corpus_path**: `src/data/web_bundle.json`
- **corpus_record_count**: **443**
- **ground_truth**: `cleaned_served_corpus`
- **verdict**: **`red`**
- **quote_candidates**: 23
- **evidence_entries**: 5
- **evidence_quotes_with_citation**: 5
- **verbatim_matches**: 3
- **normalized_matches**: 0
- **case_insensitive_matches**: 0
- **ellipsis_fragment_matches**: 0
- **missing_source_id**: 0
- **unresolved_source_id**: 0
- **wrong_company**: 0
- **wrong_role**: 0
- **fabricated_or_unmatched_quotes**: 2
- **duplicates**: 1
- **appendix_entries_not_cited**: 1

### `red_reasons`

- `unmatched_ellipsis_fragment for jd_000201` (NVIDIA)
- `unmatched quote for jd_000173` (Microsoft)

### `amber_reasons`

- `in appendix but not cited by any Evidence quote: jd_000310`
  (Scale AI)
- `duplicate evidence quotes: 1` (Databricks `jd_000347` cited twice)

## Policy decision · **R1 · Post-ellipsis grammar bridging**

R1 is post-ellipsis grammar bridging, such as an inserted connector
word at the beginning of the post-ellipsis fragment.

**Decision**: **keep RED**.

If a quote uses ellipsis stitching and every meaningful fragment
exists in the same source body, classify as **AMBER**
(`ellipsis_fragments`). But if the model inserts an extra connector
word or bridge phrase that is not present in the source body,
classify as **RED** (`unmatched_ellipsis_fragment`). This is close
enough to quote fabrication that the strict quote-integrity gate
should catch it.

Concrete corollary from 5c: NVIDIA `jd_000201` fragment 2
(`"vs. RAG vs. structured extraction."`) is legitimately RED because
the corpus body has `"RAG vs. structured extraction."` (single `vs.`)
and the model inserted an extra leading `vs. ` for grammar
continuity.

## Policy decision · **R2 · Trailing sentence-boundary punctuation swap**

R2 is trailing sentence-boundary punctuation swap, such as source
`,` / `;` / no-punctuation versus report `.` at the final character.

**Decision**: **approve a very narrow future AMBER micro-tier**,
but **do NOT retroactively modify the 5c result**.

The micro-tier should apply only when **all** of these conditions
hold:

1. **source id resolves**
2. **company check passes**
3. **role/title check is `pass` or `unknown`, not `fail`**
4. **the only unmatched difference is the final punctuation mark**
5. **the rest of the quote matches verbatim, normalized, or
   case-insensitive normalized**
6. **no word has been inserted, deleted, reordered, or replaced**
7. **quote length is long enough to make accidental match unlikely**
   (recommended minimum: ~40 non-space characters, to be confirmed in
   AgentOps-5d-R2 TASK)
8. **the punctuation change does not change meaning** (e.g. `,` → `.`
   at end is OK; `?` → `.` is not, since it flips assertion type;
   `!` → `.` is not, since it flips emphasis; `;` → `.` is OK)

**If any condition fails, keep RED.**

Concrete corollary from 5c: Microsoft `jd_000173` will move from RED
to AMBER once the R2 micro-tier ships in AgentOps-5d-R2, since it
satisfies conditions 1–8 (source id resolves, company check passes,
role check pass, only last-char `.` vs `,` differs, rest CI-verbatim,
no word insert/delete/reorder/replace, 106 chars long, `,` → `.` at
end preserves meaning).

## Approved future match tiers · rollup

For AgentOps-5d-R2 and later:

| tier | classification |
|---|---|
| verbatim source substring | **GREEN** |
| whitespace/punctuation normalization that preserves all words and punctuation semantics | **AMBER** |
| case-only normalization | **AMBER** |
| ellipsis fragments all match same source body | **AMBER** |
| **terminal-punctuation-only mismatch under strict R2 rules (§Policy decision R2)** | **AMBER** |
| inserted connector word in ellipsis fragment | **RED** |
| unresolved source id | **RED** |
| wrong company | **RED** |
| wrong role/job attribution | **RED** |
| unmatched meaningful quote fragment | **RED** |
| fabricated quote | **RED** |

## What worked

- CLI checker was created (`scripts/quote-integrity-check.mjs`, no
  deps, no network, no LLM/API).
- Corpus loader worked on `src/data/web_bundle.json`.
- Evidence Appendix parser found 5/5 entries.
- Evidence quote parser found 5/5 evidence quotes.
- Source id resolution worked.
- Verbatim matching identified true verbatim quotes.
- Case-insensitive tier was implemented and exercised.
- Ellipsis-fragment matcher was implemented and exercised.
- Duplicate detection worked.
- Appendix-vs-evidence cross-check worked.
- Small committed summary artifact worked (~5 KB, diff-friendly).
- No long quote excerpts or full report were committed.

## What remains brittle

- **R1 grammar bridging** remains RED and should stay RED.
- **R2 terminal punctuation** needs a narrow AMBER micro-tier
  before controlled A/B generation.
- **Role/title check** is still a placeholder.
- **Only `Evidence quote:` pattern** is gated.
- **Corpus pipe-to-newline normalization** is heuristic (`|` → `\n`).
- **No caching** (fine for one-off; add memoization if 5d does a
  per-fixture loop).
- The checker is **not yet integrated into
  `scripts/report-regression-local.mjs`**.
- A/B baselines remain **`quote_integrity_not_evaluated`**
  conceptually.

## Recommended next loop

**Preferred next loop**: **AgentOps-5d-R2** (or the equivalent
narrow scope) — implement the approved R2 terminal-punctuation AMBER
micro-tier and re-run the checker on the same Fixture B source
report. Cost **$0**. No generation. No harness. No baseline
mutation. This would make the checker policy complete before
controlled A/B generation.

**Alternative**: **AgentOps-5d** — controlled A+B generation with
checker attached, approximately **~$0.10**, but only if the TASK
explicitly allows two real generations and accepts that R2 may still
produce RED until the micro-tier is implemented.

**Executor recommendation**: **do AgentOps-5d-R2 first**, then
controlled A+B generation after the checker no longer REDs on
terminal punctuation only.

## Risks found · 12

1. Current quote-integrity verdict is RED.
2. NVIDIA R1 grammar-bridging is a real integrity concern and should
   remain RED.
3. Microsoft R2 trailing punctuation is probably not fabrication but
   still fails current strict matching (to be addressed by
   AgentOps-5d-R2).
4. Evidence Appendix is parseable enough but still not ideal.
5. Role/title check is not strong yet.
6. Checker is not yet attached to
   `scripts/report-regression-local.mjs`.
7. Existing A/B baselines remain `quote_integrity_not_evaluated`
   conceptually.
8. No controlled A/B re-generation with checker attached has happened.
9. No production quote validation exists.
10. C/D/E still not real-run.
11. Uploaded 20 PDFs remain out of scope.
12. BLK-0001 / BLK-0002 / BLK-0003 remain `open` and unaffected.

## Required fixes

**`none` for AgentOps-5c.**

Before any blocking production or baseline gate, implement the
approved R2 micro-tier (per §Policy decision R2) and decide whether
to integrate the checker into the report regression harness.

## Non-blocking followups

- **Push AgentOps-5c after human approval.**
- **Update daily summary after push.**
- **Next recommended loop**: **AgentOps-5d-R2** terminal-punctuation
  micro-tier, **$0**.
- After R2 micro-tier, run **controlled A/B generation with checker
  attached** (~$0.10).
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
AgentOps-5d or AgentOps-5d-R2. Do NOT run harness. Do NOT run
Playwright. Do NOT run report generation. Do NOT call
Anthropic/OpenAI. Do NOT run C/D/E. Do NOT run A-E full suite. Do
NOT ingest uploaded PDFs. Do NOT modify baselines. Do NOT modify
fixtures. Do NOT modify pipeline. Do NOT modify `.agent/scripts/**`.
Do NOT modify `src/**`. Do NOT edit
`scripts/report-regression-local.mjs`. Do NOT implement Codex
planner. Do NOT create `.agent/planner_reports/`. Do NOT run
collector. Do NOT refresh corpus. Do NOT modify GitHub Actions. Do
NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT start G2.1d.
Recommended next task after push/cleanup is **AgentOps-5d-R2 ·
terminal-punctuation AMBER micro-tier** (implement per §Policy
decision R2 eight strict conditions · re-run checker on same
Fixture B source report · $0 · no generation · no harness · no
baseline mutation · no LLM/API · no OpenAI · no PDFs · no C/D/E ·
no A-E).

## Boundary confirmations · 26 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No report generation | ✅ |
| No harness run | ✅ |
| No Playwright | ✅ |
| No LLM / API calls | ✅ |
| No OpenAI API | ✅ (BLK-0003 unchanged) |
| No baseline mutation | ✅ (A + B untouched · grandfathered) |
| No `.agent/regression_baselines/**` changes | ✅ |
| No `.agent/regression_runs/**` changes | ✅ |
| No `.agent/regression_fixtures/**` changes | ✅ |
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
follow-up action is authorized until Bohao says "push AgentOps-5c".
