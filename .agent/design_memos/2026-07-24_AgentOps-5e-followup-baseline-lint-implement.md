# Design memo · AgentOps-5e-followup-baseline-lint-implement · Structural-evidence validator (phase 1)

- **date**: 2026-07-24
- **loop**: AgentOps-5e-followup-baseline-lint-implement
- **parent_loop**: AgentOps-5e-followup-baseline-lint-design (`2026-07-24_run_04` · approved)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_04_DECISION.md`
- **task**: `.agent/tasks/2026-07-24_run_05_TASK.md`
- **cost**: **$0**

## 1 · Purpose

Implement the approved standalone deterministic structural-evidence
validator + zero-dependency synthetic tests. Phase 1 only.
Standalone CLI · no harness integration · no baseline mutation · no
legacy-verdict impact · no blocking promotion. Cost **$0**.

## 2 · Approved phase

Phase 1 only per `2026-07-24_run_04_DECISION`. Phases 2-6 remain
gated by separate DECISIONs.

## 3 · Scope

- `scripts/structural-evidence-check.mjs` (new · +327 lines · Node
  stdlib only · zero-dependency)
- `scripts/test-structural-evidence-check.mjs` (new · +509 lines ·
  deterministic test runner · Node stdlib only)
- `scripts/fixtures/structural-evidence/` (new · synthetic report
  fixtures + README explaining fictional content)
- `.agent/tasks/2026-07-24_run_05_TASK.md`
- `.agent/design_memos/2026-07-24_AgentOps-5e-followup-baseline-lint-implement.md`
  (this file)
- `.agent/run_reports/2026-07-24_run_05_RUN_REPORT.md`

## 4 · Out of scope

- Harness integration (deferred to phase 2)
- Report generation (deferred to phase 3)
- Baseline metadata mutation (deferred to phase 4)
- Blocking promotion (deferred to phase 6)
- `AgentOps-5f-promote`
- Any modification of `scripts/quote-integrity-check.mjs`,
  `scripts/report-regression-local.mjs`, `src/**`, or
  `.agent/scripts/**`
- R1 / R2 relaxation · fuzzy · edit-distance · LLM judge ·
  post-generation quote replacement

## 5 · CLI implementation

- File: `scripts/structural-evidence-check.mjs`
- Invocation:
  `node scripts/structural-evidence-check.mjs --report <p> --output <p>`
- Optional args: `--fixture <A-E>` · `--source-run-id <id>` · `--help` / `-h`
- No network · no LLM · no report rewriting · no retries
- Zero dependencies (only Node stdlib: `node:fs`, `node:path`,
  `node:process`)

## 6 · Argument handling

- `parseArgs()` uses an explicit known-flags allowlist
- Rejects unknown flags, missing values, and invalid `--fixture`
  values via `fatalCli()` → exit 2
- `--help` / `-h` prints usage and exits 0 (safe · no side effects)
- `--report` and `--output` are required

## 7 · Gap parser

- Enters at `## Your top 5 gaps` H2 heading (case-insensitive prefix
  match on the current prompt wording)
- Records line-start numbered items `^(\d+)\.\s+\S` from 1..N
- Splits section into per-gap blocks between numbered items
- Exits at the next `## ` H2 heading or EOF
- Recognizes duplicate/missing gap numbers by comparing count vs
  `REQUIRED_GAP_COUNT = 5`

## 8 · Citation parser

- Regex mirrors checker `extractEvidenceQuotes`:
  `Evidence quote:\s*["“]([^"”\n]{5,})["”]\s*[—–\-]\s*([^,\n]{1,120}?),\s*(jd_\d{4,})`
- Extracted globally from the gap section (for total count) AND
  per-gap block (for per-gap coverage)
- `looksLikeMalformedCitation()` flags lines starting with
  `Evidence quote:` that fail the exact recognized regex — surfaces
  RED `malformed_required_citation_line`

## 9 · Appendix parser

- Finds exact heading `## Evidence Appendix` (heading exactness
  asserted via `heading_exact` boolean · RED if not exact)
- Parses **only the canonical tab-separated format**:
  `jd_id\tcompany\ttitle` (3 columns)
- Existing checker `extractAppendix` (which also accepts 2-space and
  pipe alternates) is **NOT** touched
- Malformed rows (`jd_`-prefixed but not tab-separated 3-col) are
  captured for RED
- Duplicate identical rows recorded for AMBER
- Conflicting duplicate rows (same jd_id, different company/title)
  recorded for RED
- Blank lines ignored deterministically
- Row parsing stops when a subsequent `## ` H2 heading appears

## 10 · Count semantics

Four distinct counts (all separately reported in the artifact):

- `recognized_citation_line_count`
- `observed_gap_count` · `covered_gap_count`
- `unique_cited_jd_count`
- `appendix.row_count` · `appendix.unique_jd_count`

**Never equated** with each other. Canonical GREEN pattern
(Fixture A refined-run) validated via test G2:
`5 lines · 5/5 gaps · 4 unique jd_ids · 4 Appendix rows · GREEN`.

## 11 · Repeated-JD policy

- Repeated `jd_id` across DIFFERENT gaps → **GREEN** when all
  structural requirements pass (matches `2026-07-24_run_04_DECISION`
  Q3 correction)
- Test G2 asserts this canonical pattern is GREEN
- Test asserts NO AMBER reason contains `repeated_jd` — enforces the
  DECISION's clarification at runtime
- AMBER only for **identical duplicate citation WITHIN the SAME
  gap** (test A3) or **redundant excess citations** (test A4)

## 12 · Body / Appendix consistency

- `bodyJdIds` = distinct jd_ids from recognized citation lines
- `appendixJdIds` = distinct jd_ids from valid Appendix rows
- `missing_from_appendix` = body − appendix → **RED**
- `appendix_not_cited` = appendix − body → **AMBER telemetry**
- `duplicate_identical_appendix_rows` → **AMBER**
- `conflicting_appendix_rows` (same jd, different content) → **RED**

## 13 · Capture sufficiency

- Explicit empty body → `not_evaluable` with reason
  `report_body_empty`
- Explicit synthetic truncation marker
  `<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->` → `not_evaluable` with
  reason `explicit_truncation_marker`
- **Standalone text alone cannot reliably distinguish genuine
  Appendix omission from mid-report truncation.** Documented
  limitation: without harness-supplied capture-scope metadata, the
  validator applies observable structural rules. A truly truncated
  report without the marker will be classified as RED
  (Appendix missing) rather than `not_evaluable`. Phase 2 (harness
  integration) will supply `capture_scope` and `fallback_used` as
  additional inputs.

## 14 · Verdict precedence

`tool_error` (exit 2, no artifact) > `not_evaluable` > `red` >
`amber` > `green`. Implemented in `computeVerdict()`.

## 15 · Artifact schema

Written to `--output` as pretty-printed JSON:

```json
{
  "schema_version": "0.1-phase1",
  "verdict": "green|amber|red|not_evaluable",
  "blocking_mode": "telemetry_only",
  "report_path": "...",
  "checker_commit": "structural-evidence-check.mjs@0.1-phase1",
  "generated_at": "iso-8601",
  "duration_ms": 0,
  "fixture": null,
  "source_run_id": null,
  "required_gap_count": 5,
  "observed_gap_count": 5,
  "recognized_citation_line_count": 5,
  "unique_cited_jd_count": 4,
  "per_gap": [
    {"gap_number": 1, "present": true, "citation_count": 1,
     "cited_jd_ids": ["jd_100001"], "covered": true,
     "redundant_identical_citation_count": 0}
  ],
  "covered_gap_count": 5,
  "uncovered_gap_numbers": [],
  "appendix": {
    "present": true, "heading_exact": true, "row_count": 4,
    "unique_jd_count": 4, "jd_ids": [...],
    "malformed_rows": [], "duplicate_rows": [], "conflicting_rows": []
  },
  "body_appendix": {
    "missing_from_appendix": [],
    "appendix_not_cited": []
  },
  "parser_ambiguities": [],
  "red_reasons": [],
  "amber_reasons": [],
  "not_evaluable_reasons": [],
  "tool_errors": [],
  "source_rewritten": false,
  "network_used": false,
  "llm_used": false
}
```

Artifact deliberately does NOT embed full report body or quote
content.

## 16 · Exit codes

- **0** — GREEN, AMBER, or `not_evaluable` telemetry emitted
- **1** — RED structural result emitted
- **2** — tool / config / input / output error; no partial artifact
  written

## 17 · Atomic output behavior

- Write to `<output>.tmp-<pid>` then `renameSync` to final path
- Creates parent directory recursively if missing
- On tool_error, no artifact is emitted (verified by test E1)

## 18 · Synthetic fixtures

- Directory `scripts/fixtures/structural-evidence/`
- Fictional companies: `ExampleCo`, `NovaAI`, `HelixLabs`, `Zenith`,
  `Draft`
- Fictional `jd_XXXXXX` IDs: `jd_100001`–`jd_100005`, `jd_999999`,
  etc.
- README documents fictional nature
- Fixtures generated at test time via `skeleton()` helper; no
  proprietary content

## 19 · Deterministic tests

- File: `scripts/test-structural-evidence-check.mjs`
- Node stdlib only · no new dependency
- Invokes CLI as a child process via `spawnSync`
- Reads output artifact JSON
- 26 tests total:
  - **GREEN**: G1 (5 unique jd_ids), G2 (canonical 5/5/4/4), G3
    (two-citation gap, non-redundant), G4 (deduped Appendix)
  - **RED**: R1-R11 (missing Appendix, zero citations, 4 lines,
    concentration, uncovered gap, missing from Appendix, malformed
    citation, malformed Appendix row, 4 gaps, 6 gaps, conflicting
    duplicate rows)
  - **AMBER**: A1-A4 (uncited Appendix, duplicate row, within-gap
    duplicate, redundant excess)
  - **NOT_EVALUABLE**: N1 (empty), N2 (explicit truncation marker)
  - **TOOL_ERROR**: E1 (missing report), E3/E3b (invalid args /
    missing required)
  - **INVARIANTS**: no fixture modified · no full body in artifact ·
    `network_used=false` · `llm_used=false` · `source_rewritten=false`
- **Result**: 26 / 26 PASS

## 20 · Static validation

- `npx tsc --noEmit` → **exit 0** (TypeScript typecheck clean; no
  new dependency, no `.ts` files touched)
- Deterministic test suite → **26 / 26 PASS**
- No linter changes required (no ESLint config change; the two
  new `.mjs` files follow existing project conventions)

## 21 · Existing checker / harness preservation

- `scripts/quote-integrity-check.mjs` hash: **`105ce8a`** pre + post
- `scripts/report-regression-local.mjs` hash: **`4abfd9f`** pre + post
- `extractEvidenceQuotes` unchanged
- `extractAppendix` unchanged (validator implements its own narrow
  parser)
- `matchTiered` / `matchEllipsisFragments` /
  `matchTerminalPunctuationOnly` unchanged
- R1 / R2 unchanged · no new match tier

## 22 · Baseline policy

- **No baseline mutation** in phase 1
- Sibling `structural_evidence` metadata block deferred to phase 4
- Pre-validator baselines will need grandfathering exception if
  migration is later approved

## 23 · Legacy verdict policy

- **No legacy verdict impact** in phase 1
- Standalone CLI writes `structural_evidence_summary.json` when
  invoked manually with `--report` and `--output`
- Harness does NOT invoke the CLI in phase 1 (that's phase 2)
- Legacy exit-code semantics of the report-regression harness
  remain unchanged

## 24 · Rollout boundary

- Phase 1 ends here.
- Phase 2 (harness integration) requires separate DECISION.
- Phase 3 (paid A+B validation) requires separate DECISION + cost
  approval.
- Phase 4 (baseline migration) requires separate DECISION +
  grandfathering exception clause.
- Phase 5 (stability) per-run approval.
- Phase 6 (blocking promotion) requires separate DECISION.
- **`AgentOps-5f-promote` not authorized.**

## 25 · Risks

1. Narrow tab-only Appendix parser may drift from checker's more
   permissive parser — mitigated by test G4 (dedup) + design's
   `parser_ambiguity` AMBER signal (currently unused because
   validator doesn't compare against checker; phase 2 may wire this).
2. Fixed heading pattern `## Your top 5 gaps` is prompt-imposed; if
   the prompt shape ever changes, validator must update in lockstep.
3. Standalone-text truncation classification is limited without
   harness metadata (documented in § 13); phase 2 addresses this by
   consuming `capture_scope` and `fallback_used`.
4. Within-gap redundancy detection uses `(jd_id, quote)` signature;
   two structurally-different quote strings citing the same jd
   within one gap will NOT trigger AMBER, matching Q7 wording that
   non-redundant additional citations remain GREEN.
5. Empty-body classification uses `text.trim().length === 0`; a
   report with only whitespace and no structure is `not_evaluable`.

## 26 · Known limitations

- **Truncation detection**: without harness metadata, cannot
  distinguish a genuinely missing Appendix from a truncated capture.
  Fixtures use an explicit synthetic marker
  (`<!-- STRUCTURAL_EVIDENCE_TRUNCATED -->`) to trigger
  `not_evaluable`; real reports will never contain this marker.
- **Test E2/E4** (unreadable input / unwritable output) were **not
  added** — reliable cross-platform simulation would require either
  `chmod` (unreliable if running as root or on network filesystems)
  or invalid pathnames that behave differently per platform. The
  E1 (missing report) and E3/E3b (invalid args) cases cover the
  tool-error branches deterministically.
- **N2's explicit marker** is a test-only convention. The design
  memo (phase 1 § 9) acknowledges that this trades a small amount
  of purity for reliable test coverage of `not_evaluable`.
- **`unique_appendix_jd_count`** is emitted as
  `appendix.unique_jd_count` (field-name difference is
  intentionally namespaced under `appendix.` for clarity; matches
  design § 11).
- **`parser_ambiguities`** field is present but empty in phase 1;
  phase 2 will populate it when validator-vs-checker Appendix row
  counts disagree (requires harness integration).

## 27 · Rollback plan

- `git revert <impl commit>` removes:
  - `scripts/structural-evidence-check.mjs`
  - `scripts/test-structural-evidence-check.mjs`
  - `scripts/fixtures/structural-evidence/`
  - TASK
  - this memo
- Zero downstream impact (no harness integration, no baseline
  mutation, no legacy verdict change)
- Pre-push · trivial rollback

## 28 · Boundaries respected

- ✅ Only new files under `scripts/` and `.agent/` (per allowed
  scope)
- ✅ `scripts/quote-integrity-check.mjs` unchanged (`105ce8a`)
- ✅ `scripts/report-regression-local.mjs` unchanged (`4abfd9f`)
- ✅ `src/lib/prompts.ts` unchanged
- ✅ No `.agent/scripts/**` change (hard rule)
- ✅ No `src/**` change
- ✅ No R1 / R2 relaxation · no new match tier
- ✅ No fuzzy · no edit-distance · no LLM judge · no post-generation
  replacement · no silent quote rewriting
- ✅ No Markdown / citation syntax change
- ✅ No model / provider change
- ✅ No API-route change
- ✅ No baseline mutation · no baseline promotion
- ✅ No harness integration (phase 1 standalone only)
- ✅ No pipeline change · no `.env*` · no `vercel.json` · no
  `package.json` · no lockfile · no workflow
- ✅ No threshold change · no retry behavior added
- ✅ No C/D/E · no A-E · no PDFs · no OpenAI API
- ✅ QI remains telemetry-only · structural lint remains telemetry-
  only · no blocking promotion · no `AgentOps-5f-promote`
- ✅ BLK-0001 / BLK-0002 / BLK-0003 remain `open`
- ✅ G2.1d remains `blocked_pending_human` · Q10 pause · Codex
  planner spec-only
- ✅ **cost $0**
