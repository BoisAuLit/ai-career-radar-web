# Implementation memo · AgentOps-5e-followup-phase3-structural-rendered-text-contract-implement

## 1. Purpose

Implement the approved Path A deterministic structural checker
correction for rendered browser `innerText` while preserving all
Markdown-source behavior, citation semantics (regex + threshold),
telemetry-only isolation, legacy verdict authority, and process-exit
authority. Diagnosis-DECISION reference:
`.agent/decisions/2026-07-25_run_03_DECISION.md`.

## 2. Approved diagnosis

`multiple_root_causes_confirmed`:

- **Primary**: structural checker required literal Markdown `##` in
  gap heading regex and appendix heading literal. Browser
  `innerText` strips `##` from `<h2>` renders. Content is present;
  RED was contract mismatch, not content absence.
- **Secondary**: appendix row parser accepted tabs only and lacked
  deterministic whitespace/pipe fallback.

## 3. Selected Path A

Correct structural checker grammar to deterministically accept both
Markdown-source and rendered plain-text heading forms; align appendix
row parser with QI's proven whitespace/pipe fallback. Preserve
Markdown-source compatibility, citation regex, thresholds, and
telemetry isolation.

## 4. Scope

- `scripts/structural-evidence-check.mjs` — checker grammar + parser fix
- `scripts/test-structural-evidence-check.mjs` — 40 new RTC tests (rendered-text accept + rejection + citation scoping + non-broadening guards)
- Governance: TASK · this memo · RUN_REPORT
- Two commits (code+tests · governance)

## 5. Out of scope

- `src/**` (all)
- `src/lib/prompts.ts`
- `src/app/page.tsx`
- `scripts/quote-integrity-check.mjs`
- `scripts/report-regression-local.mjs`
- `scripts/lib/structural-evidence-integration.mjs` (no change needed)
- `package.json`, `package-lock.json`
- fixtures, baselines, previous run artifacts
- `.agent/scripts/**`, workflows, env, `vercel.json`
- pipeline
- provider calls · fixture reruns · dev server · Playwright
- blocking promotion · baseline mutation · threshold change · Phase 4/5/6 · `AgentOps-5f-promote`
- DECISION creation · push

## 6. Previous grammar

- **Gap regex**: `/^##\s+Your top 5 gaps\b/im` — required literal `##`.
- **Appendix heading**: literal `"## Evidence Appendix"` via `text.indexOf(...)` — required literal `##`.
- **Appendix row parser**: `line.split("\t")` — tabs only, no fallback.
- **Citation regex**: `/Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})/g` — **kept byte-identical**.
- **Thresholds**: `REQUIRED_GAP_COUNT = 5` · `MIN_CITATION_LINE_COUNT = 5` — **kept byte-identical**.

## 7. New gap heading grammar

```
/^\s*(?:##\s+)?Your top 5 gaps(?:,\s*ranked(?:\s*\(5 numbered items\))?)?\s*$/im
```

- **Whole-line, line-anchored** (`^\s*...\s*$` with `m` flag).
- **Optional exact `##` prefix** — no other Markdown levels (`#`, `###`, `####`) accepted; rejected in RTC12 + RTC13.
- **Exact phrase** `Your top 5 gaps`.
- **Approved suffixes only**: none · `, ranked` · `, ranked (5 numbered items)`.
- **Case-insensitive** deterministic matching (`i` flag).
- **Bounded whitespace normalization** — only leading/trailing line whitespace.
- **Rejects**: arbitrary text before or after · prose · unsupported suffixes · arbitrary semantic variants · other Markdown heading levels.
- **No** fuzzy · edit-distance · LLM · substring matching.

## 8. New appendix heading grammar

```
/^\s*(?:##\s+)?Evidence Appendix\s*$/im
```

- Same shape as gap heading: whole-line · line-anchored · optional exact `##` prefix · exact phrase · deterministic case-insensitive matching.
- Accepts `## Evidence Appendix` and `Evidence Appendix`.
- Rejects prose mentions (`See the Evidence Appendix below.`), unrelated titles (`Supporting Evidence Appendix`), extra suffixes (`Evidence Appendix Notes`).
- `heading_exact` retained for artifact schema parity; both accepted forms are treated as exact.

## 9. Appendix row parser

`parseAppendixRow(line)` — deterministic fixed-order fallback chain:

1. **Tab-separated**: `line.split("\t")` — require exactly 3 parts, first matches `jd_\d{4,}`, other two non-empty.
2. **Pipe-separated**: `line.split("|")` — strip empty outer parts (from outer `|`), require exactly 3 parts, first matches `jd_\d{4,}`, other two non-empty.
3. **Two-or-more whitespace**: `line.split(/\s{2,}/)` — require exactly 3 parts, first matches `jd_\d{4,}`, other two non-empty.

Additional deterministic filters applied to the raw line:

- Header rows (`JD_ID ...` OR `| jd_id | company | title |`) — skipped.
- GFM separator rows (`|---|---|---|`) — skipped via dedicated regex `/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/`.
- `##` heading start — terminates appendix table.
- Blank lines — skipped.
- Non-`jd_`-like lines — ignored as prose.
- `jd_`-like lines that fail all three parse attempts — recorded as `malformed_rows`.

Preserves `jd_id` validation, non-empty company + non-empty title. Rejects 2-col, 4-col, ambiguous multi-pipe fields.

## 10. Citation logic preservation

- `EVIDENCE_QUOTE_REGEX` **byte-identical** — verified by test RTC37 which reads the source line.
- Citation scoping still restricted to the extracted gap section — unchanged behavior; RTC33 verifies out-of-section citations are not counted.
- Malformed citation-line detection (`looksLikeMalformedCitation`) unchanged.

## 11. Threshold preservation

- `REQUIRED_GAP_COUNT = 5` **byte-identical** — verified by RTC38.
- `MIN_CITATION_LINE_COUNT = 5` **byte-identical** — verified by RTC38.
- No threshold change proposed or applied.

## 12. Tests-first evidence

Before implementation, the RTC test additions produced this baseline:

- **16 RTC tests FAILED** under the pre-change checker:
  - RTC01-05 (gap heading raw + rendered variants)
  - RTC14 (whitespace tolerance)
  - RTC15-16 (appendix heading raw + rendered — on rendered-report body)
  - RTC20-24, RTC29-30 (appendix rows — because heading detection prerequisite failed on rendered body)
  - RTC32, RTC34 (citation counts — because gap section detection failed on rendered body)
- **24 RTC tests PASSED** under the pre-change checker (rejection cases + non-broadening guards).
- **All 40 pre-existing structural tests remained green** during the tests-first phase.

## 13. Unit test additions

40 new RTC tests, grouped:

- **RTC01-05**: rendered + Markdown-source gap heading accept cases.
- **RTC06-14**: gap heading rejection + whitespace policy.
- **RTC15-19**: appendix heading accept + rejection.
- **RTC20-31**: appendix row parser — all three separator forms accept, plus rejection of 2-col / 4-col / invalid `jd_id` / empty fields / prose / GFM separator / ambiguous pipe.
- **RTC32-36**: citation scoping guarantees.
- **RTC37-38**: source-level byte-identical guards for citation regex + thresholds.
- **RTC39-40**: `blocking_mode=telemetry_only` + `network_used`/`llm_used`/`source_rewritten` remain false.

## 14. Integration preservation

`scripts/lib/structural-evidence-integration.mjs` — **NOT modified**. `BLOCKING_MODE = "telemetry_only"` and `affected_legacy_verdict: false` invariants intact. `scripts/test-structural-evidence-integration.mjs` — **NOT modified**. All 26/26 integration tests remain green (verified). Integration semantics unchanged: structural telemetry does not enter `checks[]`, combined remains display-only, `classify(checks)` / `process.exit(classification.exit)` authorities preserved.

## 15. Broader regression results

- `scripts/test-structural-evidence-check.mjs`: **80/80 pass** (40 pre-existing + 40 new RTC)
- `scripts/test-structural-evidence-integration.mjs`: **26/26 pass** (unchanged)
- `scripts/test-classify-schema.mjs`: **19/19 pass** (unchanged)
- `scripts/test-classify-route.mjs`: **32/32 pass** (unchanged)
- **Grand total: 157/157**
- `npx tsc --noEmit`: **exit 0**

## 16. Telemetry isolation

- Structural artifact fields: `blocking_mode=telemetry_only` preserved (RTC39).
- `network_used=false`, `llm_used=false`, `source_rewritten=false` preserved (RTC40).
- Integration helper untouched — `affected_legacy_verdict=false` invariant unchanged.
- Harness `scripts/report-regression-local.mjs` untouched — `classify(checks)` + `process.exit(classification.exit)` intact.
- Baselines untouched — no baseline mutation.

## 17. Green-flip interpretation

Any subsequent structural RED → GREEN change on Fixture A / Fixture B (or new fixtures) driven by this correction MUST be documented as:

- checker / capture **contract correction**
- **NOT** improved report content
- **NOT** improved prompt behavior
- **NOT** baseline promotion
- **NOT** blocking promotion

Live validation of the flip is out of scope for this loop and requires a separate cost-approved fixture run.

## 18. Privacy

- No proprietary report body reproduced in test fixtures — synthetic `jd_100001..jd_100005` + `ExampleCo` / `NovaAI` / `HelixLabs` / `Zenith` / `Draft` companies.
- No production report captured or read.
- No API keys, headers, cookies, or secrets touched.
- No `.env*` read or logged.

## 19. Performance

- Grammar changes: 4 additional line-anchored regex `.match()` calls per report (gap heading + appendix heading + follow-on boundary detection). Each is O(n) over report length. Report bodies are ~10k chars; total overhead is well under 1 ms.
- Appendix row parser fallback chain: up to 3 `split()` calls per row. Row count is bounded (≤ 10 typical). Overhead negligible.
- Overall checker duration remains sub-100ms on both Fixture A and Fixture B report shapes (observed in prior runs).

## 20. Cost

- **Provider calls**: **0**
- **Fixture reruns**: **0**
- **Paid API calls**: **0**
- **Network calls**: **0** (no dependency changes; no `npm install`)
- **Total loop cost**: **$0**

## 21. Residual risks

- Rendered-text grammar was intentionally kept narrow (complete-line, exact-phrase, approved suffixes only). If future model outputs use an unlisted heading suffix (e.g. `Your top 5 gaps for AI engineers`), that will be rejected — this is the approved semantics per DECISION `2026-07-25_run_03`. Any policy change requires a new DECISION.
- Appendix pipe-form parser accepts `| jd | Co | Title |` and `jd | Co | Title`. If a title itself contains an unescaped `|` character, the row is rejected as malformed (RTC31). This is deterministic and safe but does mean pipes-in-titles need escaping upstream if they occur.
- The follow-on section boundary detector uses hard-coded section names (`Skills you might be over-prioritizing`, `Your single highest-leverage next action`, `Evidence Appendix`). If the prompt evolves to change these section names, the boundary detector must be updated in a new DECISION.
- Fixture A diagnosis remained strongly-supported-not-directly-confirmed in the parent DECISION. This loop does not change that: it fixes the checker deterministically and does not attempt live validation. Any live validation requires separate cost approval.
- No live provider validation was performed; the fix is verified on synthetic test fixtures only. A future separately cost-approved Fixture B rerun would confirm the flip on real captured text.

## 22. Rollback

- Revert the 2 commits (code+tests · governance).
- No baseline / prompt / harness / QI checker / package change to reverse.
- No live fixture data to unwind.

## 23. Future live validation boundary

- **Not authorized in this loop** and **not required for the implementation**.
- A future separately cost-approved Fixture A + Fixture B rerun MAY be requested to observe the RED → GREEN flip against real captured text.
- Any such run must:
  - Author its own TASK + RUN_REPORT + DECISION.
  - Preserve telemetry-only mode.
  - Document the flip as **contract correction**, not product-quality improvement.
  - Respect the same per-run + total cost caps used in prior fixture runs.

## 24. Boundaries respected

- read-only diagnosis inputs · **yes**
- checker code change scoped to `scripts/structural-evidence-check.mjs` · **yes**
- test additions scoped to `scripts/test-structural-evidence-check.mjs` · **yes**
- no `src/**` change · **yes**
- no `src/lib/prompts.ts` change · **yes**
- no `src/app/page.tsx` change · **yes**
- no `scripts/quote-integrity-check.mjs` change · **yes**
- no `scripts/report-regression-local.mjs` change · **yes**
- no `scripts/lib/structural-evidence-integration.mjs` change · **yes**
- no `package.json` / `package-lock.json` change · **yes**
- no fixture change · **yes**
- no baseline change · **yes**
- no regression-run change · **yes**
- no `.agent/scripts/**` change · **yes**
- no workflow / env / vercel change · **yes**
- no pipeline change · **yes** (`b019786` untouched)
- no provider call · **yes**
- no fixture rerun · **yes**
- no dev server / Playwright · **yes**
- citation regex byte-identical · **yes** (RTC37 guard)
- thresholds byte-identical · **yes** (RTC38 guard)
- `blocking_mode=telemetry_only` preserved · **yes** (RTC39 + integration 26/26)
- `network_used`/`llm_used`/`source_rewritten` false · **yes** (RTC40)
- structural does NOT enter `checks[]` · **yes** (integration helper unchanged)
- `classify(checks)` unchanged · **yes** (harness unchanged)
- `process.exit(classification.exit)` unchanged · **yes** (harness unchanged)
- baselines unchanged · **yes**
- no promotion · **yes**
- no Phase 4/5/6 · **yes**
- no `AgentOps-5f-promote` · **yes**
- no push · **yes**
- no DECISION · **yes**
- cost `$0` · **yes**
