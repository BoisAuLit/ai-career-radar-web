# RUN REPORT · AgentOps 5e diagnose QI amber case insensitive quote

## Metadata

- **task_id**: `2026-07-25_run_05`
- **date**: `2026-07-25`
- **run_number**: `05`
- **branch**: `main`
- **loop**: `AgentOps-5e-followup-phase3-QI-amber-case-insensitive-diagnostics-design`
- **parent_loop**: `AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement` (`2026-07-25_run_04`)
- **authorizing_decision**: `.agent/decisions/2026-07-25_run_02_DECISION.md` (Phase 3 completion — QI diagnosis deferred)
- **human_authorization**: Bohao 2026-07-25 explicit GO — read-only QI AMBER diagnosis using retained governance-safe artifacts.

## Commits

- `<hash-1>` Design QI amber quote diagnostics
- `<hash-2>` Add RUN_REPORT 2026-07-25_run_05

## Files changed

```
 .agent/design_memos/2026-07-25_AgentOps-5e-followup-phase3-QI-amber-case-insensitive-diagnostics-design.md
 .agent/findings/2026-07-25_qi_amber_case_insensitive_inventory.json
 .agent/run_reports/2026-07-25_run_05_RUN_REPORT.md
 .agent/tasks/2026-07-25_run_05_TASK.md
 (4 files · governance-only)
```

## Summary

Read-only diagnosis of Fixture B's single case-insensitive Evidence
quote match (`case-insensitive-only match for jd_000173`). Cause
identified as **sentence_start_capitalization_only_at_position_0**:
generated quote starts with `B` (U+0042) while source body starts
with `b` (U+0062). All other visible characters (positions 1..59 of
the 60-char retained snippet) are byte-identical to the source at
`src/data/web_bundle.json` record `jd_000173` (Microsoft · Principal
Software Engineer - Full Stack AI, body index 1175). QI Tier-3
case-insensitive fallback fired as designed and emitted AMBER — not
RED — consistent with AgentOps-5a/5c/5d graded-tier design. Product
significance: **benign_formatting_variance**. Prompt is strict
("character-for-character"); checker is graded by design; AMBER is
the correct signal. Selected next path: **Path A — no change**.

## Regression verdict

- **regression_required**: `no`
- **reason_required_or_not**: read-only diagnosis of an existing QI AMBER signal using retained governance-safe Fixture B artifacts and the already-committed corpus record; no source, telemetry, or checker change to validate; no harness invocation authorized.
- **harness_used**: `no`
- **harness_command**: `n/a`
- **fixture invocations**: **0**
- **provider calls**: **0**
- **paid calls**: **0**
- **cost**: **$0**
- **source changes**: **none**
- **checker changes**: **none**
- **prompt changes**: **none**
- **harness changes**: **none**
- **baseline changes**: **none**
- **telemetry changes**: **none**
- **evidence source**: retained governance-safe Fixture B artifacts (`quote_integrity_summary.json`) + committed corpus record `src/data/web_bundle.json::jd_000173`
- **diagnosis confidence**: `most_likely_cause`
- **selected next path**: **Path A — no change**
- **reviewer action**: **human + ChatGPT review; then QI diagnostics DECISION**
- **push implication**: **no push before DECISION**

## Intended quote contract

- **Prompt authority**: `src/lib/prompts.ts::reportSystemPrompt` — "Text inside quotation marks MUST be copied verbatim from ONE contiguous span of the cited JD body" · "Exactness: every quoted string appears character-for-character in the supplied body text for its cited jd_id".
- **Interpretation**: byte-identical, case-sensitive, contiguous. Capitalization is not called out separately but is implicitly covered by "character-for-character".

## Checker behavior

- `scripts/quote-integrity-check.mjs@0.3-r2-terminal-punctuation`
- Tier 1 verbatim: `bodyRaw.includes(quote)` — case-sensitive raw substring
- Tier 2 normalized: `normalize()` (curly quotes / dashes / ellipsis / pipe / whitespace) then substring — case-preserving
- Tier 3 case-insensitive: `normalize().toLowerCase()` then substring — **AMBER (not RED)**
- R1 ellipsis-fragment stitched: AMBER
- R2 terminal-punctuation-only: AMBER (strict 8-gate)
- **blocking_mode**: `telemetry_only`

## Exact matched quote evidence

- **cited_jd_id**: `jd_000173`
- **cited_company**: Microsoft
- **corpus_title**: Principal Software Engineer - Full Stack AI
- **corpus_archetype**: applied_ai
- **quote_char_length**: **105**
- **quote_snippet_60**: `"Build AI-infused applications, Agentic Solutions and Copilot"`
- **match_status**: `case_insensitive` · company_check pass · role_check pass
- **retention limitation**: only first 60 chars of the 105-char generated quote retained in the governance-safe artifact

## Exact source evidence

- Corpus: `src/data/web_bundle.json` record `jd_000173`
- body_length: 2205
- Case-sensitive find of 60-char snippet: **not found**
- Case-insensitive find of 60-char snippet: **found at index 1175**
- **Bounded source excerpt (120 chars, redacted)**: `"build AI-infused applications, Agentic Solutions and Copilots, enhancing user experience and productivity, fostering cre"`

## Character-level difference

| position | generated | source | code point | category |
|---|---|---|---|---|
| 0 | `B` | `b` | U+0042 → U+0062 | capitalization_only |
| 1..59 | (identical) | (identical) | — | none |
| 60..104 | **not directly observable** | inferred identical-modulo-case | — | inferred |

## Mismatch classification

**`capitalization_only`** — specifically `sentence_start_capitalization_only_at_position_0`.

Confidence: **high** for visible span (0..59); **inferred** for unavailable span (60..104).

## Product significance

**`benign_formatting_variance`**.

- User would call quote faithful: **yes**
- Auditor would call byte-verbatim: **no**
- Meaning altered: **no**
- Citation trust impact: **very_low**
- AMBER should remain: **yes**

## Prompt / checker alignment

- Prompt: strict ("character-for-character")
- Checker: graded tiers with AMBER fallback (intentional per AgentOps-5a/5c/5d)
- AMBER is the correct signal for "close but not byte-exact"
- No contradiction — this is the design

## Hypothesis ranking

- **H1** (model changed capitalization only at sentence-start): **confirmed_high**
- **H4** (checker case-insensitive fallback intentional): **confirmed**
- H2 (renderer/capture): refuted
- H3 (source parser normalization): refuted
- H5 (checker too permissive): not_supported
- H6 (prompt insufficient): possible but low-impact
- H7 (substantive difference): refuted (visible span)
- H8 (retention insufficient): partial limitation, doesn't change classification

## Diagnosis confidence

**`most_likely_cause`.** Primary conclusion: sentence-start capitalization only. Additional uncertainty: chars 60..104 not directly observable — doesn't change classification.

## Selected next path

**Path A — no change.**

- Path B (prompt reinforcement): possible but low-impact; not selected.
- Path C (checker sub-tier split): adds complexity; not selected.
- Path D (retention change): privacy trade-offs; not selected.
- Path E (deterministic tests): useful codification; subsumed by any future implementation; not selected.
- Fuzzy / edit-distance / semantic / LLM judge / post-generation rewrite / provider retry / fixture rerun: explicitly not authorized.

## Policy resolutions (highlights)

Q3 difference capitalization-only: **yes** (visible span) · Q9 prompt requires case-sensitive verbatim: **yes** · Q10 checker case-insensitive fallback intentional: **yes** · Q11 current AMBER expected: **yes** · Q12 checker defect: **no** · Q13 prompt defect: **no** · Q15 product trust impact material: **no (very_low)** · Q16 code change justified: **no** · Q17 prompt change justified: **no** · Q18/Q19/Q20/Q21/Q22: all **no**. Full Q1-Q22 in findings JSON.

## Risks

- **R1** (low): AMBER continues to fire on future runs for benign sentence-start capitalization convention. Telemetry noise remains at low rate. Mitigation: AMBER is telemetry-only.
- **R2** (low): 60-char retention limitation means chars 60..104 are inferred. Tier-3 semantics constrain to case-only. Path D would eliminate uncertainty.
- **R3** (high): silent broadening without DECISION violates promotion posture. Mitigation: any implementation loop must author its own DECISION.

## Open questions

- Do chars 60..104 contain further capitalization differences? Retained artifact insufficient.
- Is a formal QI test for this specific AMBER pattern worth adding? Path E open but not selected.
- Would prompt reinforcement measurably reduce future AMBER rate? No a-priori evidence.

## Cost and boundaries

- **cost**: **$0**
- **provider calls**: **0**
- **fixture reruns**: **0**
- **dev server / Playwright**: not started
- **QI blocking_mode**: preserved as **telemetry_only**
- all forbidden zones empty diff (see below)

## Constraints checked

- [x] `.github/workflows/*` — untouched
- [x] `src/**` — untouched (read-only inspection only)
- [x] `src/lib/prompts.ts` — untouched
- [x] `src/app/page.tsx` — untouched
- [x] `scripts/**` — untouched
- [x] `package.json` / `package-lock.json` — untouched
- [x] `.env*` — untouched
- [x] `.agent/scripts/**` — untouched
- [x] `.agent/regression_baselines/**` — untouched
- [x] `.agent/regression_fixtures/**` — untouched
- [x] `.agent/regression_runs/**` — untouched (read-only of Fixture B artifacts)
- [x] pipeline — untouched (`b019786`)
- [x] No `report.md` / screenshot / raw log / secret / long proprietary JD text reproduced
- [x] No provider call · no fixture rerun · no dev server · no Playwright

## Red-zone check

Red-zone files modified this run: **none**. Approval reference: N/A.

## Validation results

```
$ git status
On branch main
Your branch is up to date with 'origin/main'.
(untracked design bundle + RUN_REPORT staged/committed per step 21)

$ git diff --name-only origin/main..HEAD -- src scripts package.json package-lock.json .agent/regression_fixtures .agent/regression_baselines .agent/regression_runs .agent/scripts .github vercel.json
(empty)

$ git -C /Users/bohaoli/Desktop/tuto/tuto_ai_career_radar rev-parse HEAD
b0197867d93e50e60f84f8aefc7c71ee792d3006
```

## Build result

`not-run` (read-only diagnosis loop — no source change to build)

## Tests result

`not-run` (no tests modified; last full suite 157/157 was validated in parent loop `2026-07-25_run_04`)

## Screenshots (if any)

**None** — no frontend edit this loop.

## Follow-up recommendations

- **Human + ChatGPT review** of findings JSON + design memo + this RUN_REPORT.
- **QI diagnostics DECISION** in a separate loop under explicit GO — verdict on Path A vs alternatives.
- Do NOT modify checker / prompt / harness. Do NOT rerun fixtures. Do NOT promote QI. Do NOT start Phase 4/5/6 or `AgentOps-5f-promote`.

## Ready for review

`yes`

## Requires human decision

`yes` — path selection + any downstream action all require explicit human approval.
