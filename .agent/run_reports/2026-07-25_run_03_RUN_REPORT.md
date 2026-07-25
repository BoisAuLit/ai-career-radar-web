# RUN REPORT · AgentOps 5e diagnose structural report quality

## Metadata

- **task_id**: `2026-07-25_run_03`
- **date**: `2026-07-25`
- **run_number**: `03`
- **branch**: `main`
- **loop**: `AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design`
- **parent_loop**: `AgentOps-5e-followup-phase3-fixture-b-completion-execute` (`2026-07-25_run_02`)
- **authorizing_decision**: `.agent/decisions/2026-07-25_run_02_DECISION.md`
- **human_authorization**: Bohao 2026-07-25 explicit GO — read-only diagnosis + design only.

## Commits

- `<hash-1>` Design structural product quality diagnostics
- `<hash-2>` Add RUN_REPORT 2026-07-25_run_03

## Files changed

```
 .agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-structural-product-quality-diagnostics-design.md
 .agent/findings/2026-07-25_structural_product_quality_inventory.json
 .agent/run_reports/2026-07-25_run_03_RUN_REPORT.md
 .agent/tasks/2026-07-25_run_03_TASK.md
 (4 files · governance-only · no code / test / prompt / checker / harness / fixture / baseline / telemetry / package / workflow / env / vercel diff)
```

## Summary

Read-only diagnosis of the structural RED signal produced on both
completed Phase 3 report samples (Fixture A `run_09` and Fixture B
`run_02`). Root cause is **confirmed multi-cause contract mismatch
between the structural checker and the harness capture path**. The
structural checker's gap-heading regex requires literal `##` and its
appendix heading lookup uses the literal string `## Evidence
Appendix`, but the harness captures rendered plain text via
`page.locator(...).innerText()` which strips `##` from `<h2>` renders
produced by `ReactMarkdown`. The QI checker, applied to the SAME
captured text, successfully parses 5 evidence citations and 4
appendix rows on Fixture B — proving the content exists and the
divergence is contract, not content. A secondary defect (structural
appendix row parser is tab-only while QI has a whitespace/pipe
fallback) is likely to activate once the primary `##` requirement is
relaxed. The prompt is consistent with the checker on Markdown source
form — the true mismatch is harness ↔ checker, not prompt ↔ checker.
No code / prompt / checker / harness / fixture / baseline / telemetry
change; no provider call; no fixture rerun; no push; no DECISION.

## Regression verdict

- **regression_required**: `no`
- **reason_required_or_not**: read-only structural product-quality diagnosis and design — no source or telemetry change to validate; no harness invocation authorized.
- **harness_used**: `no`
- **harness_command**: `n/a`
- **fixture_ids**: `n/a` (no fixture invocation this loop)
- **target_environment**: `n/a`
- **latest_run_id**: n/a for this loop; **relevant existing runs**: `20260724T193135Z_fixture-A` and `20260725T041414Z_fixture-B`
- **verdict**: `not_required`
- **exit_code**: `n/a`
- **artifact_paths**: `n/a` — see `.agent/regression_runs/20260724T193135Z_fixture-A/**` and `.agent/regression_runs/20260725T041414Z_fixture-B/**` (existing)
- **report_char_count**: `n/a` (this loop generated no report)
- **capture_scope**: `n/a`
- **fallback_used**: `n/a`
- **red_checks_failed**: `n/a`
- **amber_checks_failed**: `n/a`
- **cost_measured**: `n/a` (no provider call this loop)
- **estimated_cost**: **$0**
- **duration_ms**: `n/a`
- **baseline_promoted**: `no`
- **production_target_used**: `no`
- **reviewer_action_required**: **human + ChatGPT review; then structural diagnostics DECISION**
- **push_implication**: **no push before DECISION** (governance-only commits stay local until reviewed)

## Q&A summary

### Intended contract
- **Gap section**: `## Your top 5 gaps, ranked (5 numbered items)` (exactly 5 numbered items, one Evidence quote each). Word-boundary analysis shows the checker regex `\b` matches this prompt heading when `##` is present.
- **Citations**: `Evidence quote: "TEXT" — Company, jd_XXXXXX.` — one per gap, ≥5 total.
- **Evidence Appendix**: `## Evidence Appendix` heading + tab-separated `jd_id\tcompany\ttitle` rows.
- **Prompt duplication noted**: a final sentence at prompt end says "short evidence appendix" (lowercase, no `##`). Non-normative; not causal.

### Checker contract
- **Source**: `scripts/structural-evidence-check.mjs@0.1-phase1`.
- **Gap regex**: `/^##\s+Your top 5 gaps\b/im` — requires literal `##`.
- **Appendix heading**: literal `## Evidence Appendix` via `text.indexOf`.
- **Appendix row parser**: `line.split('\t')` (tabs only, no fallback).
- **Evidence quote regex**: identical to QI.
- **Thresholds**: 5 gaps, 5 citations.

### Checker regex details
See findings JSON `checker_contract` + section 9 of design memo.

### Fixture A evidence
`red` · reasons: gap section missing + citation=0 + Appendix missing · `capture_complete=true` · `expected_sections_captured=true` · `selected_candidate_marker_count=5` (all substrings present) · `selected_candidate_has_evidence=true` · `report_char_count=9339` · `candidate_count=9` · `qualified_candidate_count=2` · `fallback_used=false` · `completion_state=success`.

### Fixture B evidence
Same `red` reasons · same capture properties · `report_char_count=10448` · `candidate_count=8` · `qualified_candidate_count=2` · `fallback_used=false` · `completion_state=success`.

**Cross-check on Fixture B captured text via QI** (SAME text, different checker):
- `evidence_entries` in appendix: **4**
- `evidence_quotes_with_citation`: **5**
- `verbatim_matches`: **4** · `case_insensitive_matches`: **1**
- `fabricated=0` · `wrong_company=0` · `wrong_role=0` · `duplicates=0`

The content the structural checker reports as absent IS present in the captured text. Divergence is contract, not content.

### Capture semantics
`page.locator(...).innerText()` → rendered plain text. `capture_complete=true` is a Category-A harness-mechanism signal (candidate found + all 5 markers matched as substrings + evidence-appendix regex matched). It does NOT claim the extracted text passes the checker's Markdown grammar. This is a correct semantic distinction but easy to misread as "the report is complete and passes structure."

### Prompt findings
Prompt is **consistent** with checker on Markdown source form. Word-boundary analysis on `## Your top 5 gaps, ranked (5 numbered items)` matches the checker regex. Minor duplicate wording at prompt end is not causal. **No prompt change indicated.**

### Rendering / extraction findings
`src/app/page.tsx` uses `ReactMarkdown` + `remark-gfm`. `## X` renders as `<h2>X</h2>` — `##` characters are absent from DOM text. Playwright `innerText()` returns rendered text with `##` stripped. Tab-separated rows may collapse whitespace depending on GFM table parsing behavior; needs test coverage to confirm.

The **raw report Markdown IS available** in the page state as the `report` variable (line 438) and is already posted to `/api/eval-report` as `report_markdown`. The harness does not currently access this raw form.

### Gap diagnosis
**Confirmed capture mismatch.** Content present in captured text but checker regex requires `##` which rendering strips.

### Citation diagnosis
**Downstream consequence** — structural checker only counts citations INSIDE the gap section; since gap section not recognized, `citationsInGapSection=[]`. QI's identical regex scoped whole-text finds 5 citations.

### Appendix diagnosis
**Confirmed contract mismatch** — `##` literal required by structural; QI's plain-string lookup succeeds. Secondary: tab-only row parser vs QI's whitespace/pipe fallback.

### Evidence matrix

| reason | class (A) | class (B) |
|---|---|---|
| gap_section_missing_or_unrecognized | confirmed_capture_mismatch | confirmed_capture_mismatch |
| citation_line_count=0_lt_5 | confirmed_contract_mismatch (downstream) | confirmed_contract_mismatch (downstream) |
| evidence_appendix_missing | confirmed_contract_mismatch | confirmed_contract_mismatch |

### Hypothesis ranking
- **H8 (rendering strips Markdown structure needed by checker) — confirmed_high**
- **H11 (appendix row tab-only parser fragile once H8 fixed) — likely secondary**
- H2 possible but not primary; H1 · H3 · H4 · H5 · H6 · H9 refuted; H7 reframed as harness ↔ checker (not prompt ↔ checker); H10 not a defect.

### Diagnosis confidence
**`multiple_root_causes_confirmed`** — primary: gap heading + appendix heading both require literal `##`; secondary likely: appendix row tab-only parser.

### Selected next path
**Instrumentation-first, then choose between Path A and Path B under a separate DECISION.**
- **Path A**: relax structural regexes to accept rendered plain text.
- **Path B**: expose raw `report` Markdown from page state to harness; feed to checker.
- Path C rejected (prompt already consistent). Path D subsumed by Step 1 of A or B. Fuzzy / edit-distance / LLM judge / post-generation rewrite not indicated.

### Policy resolutions (Q1-Q20 verbatim in findings JSON)
- Q1 gap content genuinely absent: **no**
- Q4 checker grammar consistent with prompt on Markdown source: **yes**; vs rendered text: **no**
- Q11 checker evaluates rendered text: **yes**
- Q12 A/B same reason: **yes**
- Q13 checker change justified: **yes** (only under separate DECISION)
- Q14 prompt change justified: **no**
- Q15 capture change justified: **yes** (Path B alternative)
- Q17 paid rerun justified now: **no**
- Q18 fixture rerun authorized: **no**
- Q19 structural blocking promotion authorized: **no**
- Q20 loop authorizes Phase 4/5/6 or 5f-promote: **no**

### Cost and boundaries
- **cost this loop**: **$0**
- **provider calls**: **0** (Anthropic 0 · OpenAI 0)
- **fixture reruns**: **0**
- **dev server / Playwright**: not started
- **structural blocking mode**: preserved as **telemetry_only**
- **all forbidden zones**: empty diff (see below)

## Constraints checked

- [x] `.github/workflows/*` — untouched
- [x] `src/**` — untouched (read-only inspection only)
- [x] `src/lib/prompts.ts` — untouched
- [x] `scripts/**` — untouched (read-only)
- [x] `package.json` / `package-lock.json` — untouched
- [x] `.env*` — untouched
- [x] `.agent/scripts/**` — untouched
- [x] `.agent/regression_baselines/**` — untouched
- [x] `.agent/regression_fixtures/**` — untouched
- [x] `.agent/regression_runs/**` — untouched (read-only of Fixture A + B existing artifacts)
- [x] pipeline — untouched (`b019786`)
- [x] no `report.md` / screenshot / raw log / secret / target text / reasoning / preference values committed
- [x] no long report body reproduction in findings / memo / RUN_REPORT

## Red-zone check

- Red-zone files modified this run: **none**
- Approval reference: N/A

## Validation results

```
$ git status
On branch main
Your branch is up to date with 'origin/main'.
(untracked design bundle + RUN_REPORT staged/committed per steps 21-22)

$ git diff --name-only origin/main..HEAD -- src scripts package.json package-lock.json .agent/regression_fixtures .agent/regression_baselines .agent/scripts .github vercel.json
(empty)

$ git rev-parse HEAD (pipeline)
b0197867d93e50e60f84f8aefc7c71ee792d3006
$ git rev-list --left-right --count origin/main...HEAD (pipeline)
0 0
```

## Build result

`not-run` (read-only diagnosis loop — no source change to build)

## Tests result

`not-run` (no tests modified; existing 117/117 preflight suite validated in the parent loop 2026-07-25_run_02)

## Screenshots (if any)

**None** — no frontend edit this loop.

## Risks

- **R1**: over-broad Path A could accept renderer-flattened text where genuine ambiguity exists (medium; mitigation: add rendered-text tests first).
- **R2**: Path B requires page.tsx edit; risk of accidental UI leak (medium; mitigation: hidden `<script type="application/x-report-markdown">` element).
- **R3**: silent broadening without DECISION violates promotion posture (high; mitigation: next loop must author its own DECISION).
- **R4**: post-fix structural GREEN flip could be misread as product-quality improvement (low; mitigation: explicit documentation in future implementation DECISION).

## Follow-up recommendations

- **Human + ChatGPT review** of the findings JSON + design memo + this RUN_REPORT.
- **Structural diagnostics DECISION** in a separate loop under explicit GO — verdict on which path (A or B) to pursue, and whether to add rendered-text tests as a mandatory Step 1.
- Do NOT rerun fixtures. Do NOT modify code. Do NOT promote structural. Do NOT start Phase 4/5/6 or AgentOps-5f-promote.

## Ready for review

`yes`

## Requires human decision

`yes` — next loop's implementation path (A vs B) requires human choice; downstream structural verdict flip and telemetry stance require separate DECISION.
