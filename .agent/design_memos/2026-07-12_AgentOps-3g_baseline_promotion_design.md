# AgentOps-3g · Baseline Promotion Design

- **Date**: 2026-07-12
- **Loop**: `AgentOps-3g`
- **Parent loop**: `AgentOps-3f` (`2026-07-12_run_06`)
- **Type**: Design / protocol / memo-only (no code, no run, no baseline file)
- **Status**: Draft · pending human + ChatGPT review + DECISION
- **Owner**: Bohao (product) · Claude (executor) · ChatGPT (reviewer)

## 1. Purpose

AgentOps now has:
- a working local regression harness
  (`scripts/report-regression-local.mjs`, stable at `d393db9`), and
- a **validated GREEN Fixture A run**
  (`20260713T014957Z_fixture-A`, 25/25 checks passed).

The GREEN run **proves the harness can produce a healthy verdict**. But a
GREEN run is **not automatically an official baseline**. Baseline
promotion is a distinct governance step. AgentOps-3f (`2026-07-12_run_06`)
explicitly deferred it here.

**Non-goals for 3g** (this memo):
- Do NOT promote a baseline.
- Do NOT create `baselines/`, `.agent/baselines/`, or
  `.agent/regression_baselines/`.
- Do NOT run the harness.
- Do NOT generate a report.
- Do NOT touch `scripts/report-regression-local.mjs`.
- Do NOT touch `src/**` or `.agent/scripts/**`.

Promotion itself is a follow-up loop (3g-2 or 3g-stability, TBD by
DECISION §17 recommendation).

## 2. Current state

| field | value |
|---|---|
| latest validated run | `20260713T014957Z_fixture-A` |
| fixture | A (v1 · synthetic) |
| verdict | **green** |
| exit_code | **0** |
| structural + fixture + operational checks | **25 / 25 pass** |
| capture_scope | `main section` |
| capture_strategy | `shortest-qualified-candidate` |
| fallback_used | **false** |
| report_char_count (selected) | 11773 |
| report_length_soft_min / max | 1500 / 14000 |
| page_body_char_count (obs) | 18422 |
| duration_ms | 75804 |
| target environment | **`localhost:3000` only** (hard-rejects non-localhost) |
| corpus_snapshot_date | May 14, 2026 |
| model_display | Claude Sonnet 4.6 |
| harness commit at run time | `2486eb6` (harness itself at `d393db9`) |
| baseline exists | **no** |
| `.agent/baselines/` exists | **no** |
| `.agent/regression_baselines/` exists | **no** |
| B-E fixtures real-run | **no** |
| production tested | **no** |
| Codex planner implemented | **no** (still spec-only) |
| `.agent/planner_reports/` | **empty** |

**Interpretation**: the harness is technically capable of producing GREEN
verdicts; one validated GREEN exists; no official baseline exists yet.

## 3. Definitions

Precise vocabulary for the rest of the memo and future loops. Use
verbatim.

- **regression run artifact**: The 3 committed files under
  `.agent/regression_runs/<run-id>/` (`metadata.json`,
  `structural_checks.json`, `verdict.md`) plus the ephemeral
  scratchpad artifacts (`report.md`, `report.png`) at
  `os.tmpdir()/acr-regression-runs/<run-id>/`. Every real harness
  invocation produces one.
- **validated GREEN run**: A regression run artifact whose
  `metadata.json.verdict == "green"` AND `exit_code == 0` AND
  `fallback_used == false` AND every structural / fixture /
  operational check passed. This is the informal daily-summary
  reference. **No promotion yet.**
- **official baseline**: A committed baseline file set (see §7) that
  has been explicitly promoted via a human-approved DECISION. Not the
  same as "latest validated GREEN". A baseline has a stable
  `baseline_id`, a `promoted_at` timestamp, and a
  `promotion_decision_path`.
- **baseline candidate**: A validated GREEN run being considered for
  promotion. Being a candidate does NOT confer baseline status;
  candidacy is just eligibility to enter the promotion workflow (§9).
- **promoted baseline**: An official baseline with
  `baseline_status = "current"`. There is at most **one current
  baseline per fixture** at any time.
- **stale baseline**: An official baseline whose `harness_script_commit`
  or `corpus_snapshot_date` is older than the current `main` HEAD or
  the current corpus snapshot. Still valid for comparison, but
  Codex planner should flag drift.
- **deprecated baseline**: A baseline explicitly marked
  `baseline_status = "deprecated"` because its underlying assumptions
  (fixture version, harness logic, corpus snapshot, model) have shifted
  enough that comparison is no longer meaningful. Kept for audit; not
  used for verdict comparison.
- **superseded baseline**: A baseline that has been replaced by a newer
  promoted baseline (`baseline_status = "superseded"`). Its
  `supersedes_baseline_id` field on the new baseline points back to it.
  Superseded ≠ deprecated: superseded implies orderly replacement;
  deprecated implies invalidation.

## 4. Why not auto-promote GREEN

Reasons the executor pushes back against auto-promotion:

1. **A single green run can still be lucky.** LLM outputs are
   nondeterministic (temperature, retrieval jitter, corpus reordering).
   One 25/25 does not prove stability.
2. **One fixture does not cover all roles.** Fixture A is a Senior
   Backend SWE → Applied AI archetype. It says nothing about how the
   harness scores Fixture B (recommendation-heavy), C
   (career-transition), D (senior IC → lead), or E (product manager).
3. **Baseline promotion affects future push decisions.** If a
   comparison-based check enters the harness later, the baseline
   becomes load-bearing. A weak baseline weakens every downstream
   gate.
4. **Baseline changes should be auditable.** Promotion should live in a
   DECISION file with a named human approver, not fall out of a
   successful run.
5. **LLM outputs are nondeterministic.** Two consecutive runs can
   differ by ±10% chars, ±30% latency, and can flip individual amber
   checks (recommendation match heuristic, action-bar visibility).
6. **Baseline drift can hide regressions.** If the baseline is set from
   a lucky run and later "normal" runs come in slightly worse, the
   harness will treat the worse as regression — false alarms
   erode trust in the whole gate.

## 5. Baseline eligibility criteria

A run is a **baseline candidate** only if **all** of the following are
true. This is necessary but not sufficient (see §6 for additional
promotion criteria).

- `verdict == "green"`
- `exit_code == 0`
- `fixture_id` and `fixture_version` are known (recorded in
  `metadata.json`)
- `capture_scope != "body_fallback"`
- `fallback_used == false`
- **All red checks pass** (15 checks in current harness · e.g.
  `page_loaded`, `done_state_reached`, `incomplete_banner_absent`,
  `must_not_happen_absent`, all 5 section headers, Evidence Appendix,
  hard latency, no fatal Playwright error, no production target,
  `report_text_capture_success`)
- **All amber checks pass** (9 checks · e.g.
  `report_capture_scope_not_body`, `action_bar_buttons_present`,
  `report_length_in_soft_band`, `at_least_2_strengths_reflected`,
  `at_least_2_gaps_reflected`, `recommendation_roughly_matches_expected`,
  `duration_under_soft_threshold`)
- **All fixture-specific checks pass**
- **All operational checks pass**
- **No production target** used (`base_url` hostname in
  `{localhost, 127.0.0.1}`)
- **No baseline promotion attempted in the same run** (a run cannot
  self-promote)
- **No forbidden repo diff** at the time of the run — the run's
  `git_commit_sha` must correspond to a clean, forbidden-file-free
  state
- **No unresolved incident in the paired RUN_REPORT** (no red-zone
  hit, no stop-condition triggered, no `request_changes` DECISION
  outstanding)
- **Cost and duration within accepted bounds**:
  `duration_ms < HARD_LATENCY_MS = 240_000`,
  `estimated_cost ≤ $0.25`

## 6. Additional promotion criteria

Beyond §5 eligibility, before **official promotion** require:

- **Human approval** (Bohao only)
- **ChatGPT review** of the candidate run + baseline metadata
- **Explicit DECISION file** with `verdict = approve` naming the
  candidate `run_id`
- **Comparison to previous validated runs** if any exist (drift
  awareness)
- **Confirmation artifacts are small and safe**:
  `metadata.json` ≤ 5 KB, `structural_checks.json` ≤ 10 KB,
  `verdict.md` ≤ 3 KB (order-of-magnitude sanity check)
- **Confirmation `report.md` and screenshot are NOT committed** unless
  separately approved with an explicit storage-policy DECISION
- **Confirmation no secrets or real user data** (fixtures are
  synthetic; no PII)
- **Confirmation no production target** was used at any point

**Optional but recommended** (executor's preference, not binding):

- **One stability re-run of Fixture A** at the candidate commit to
  confirm the GREEN is reproducible, not lucky
- **B-E real runs before broader baseline policy** so we know if the
  harness generalizes; not required for Fixture A's own baseline
- **Quote integrity check later** — separate follow-up loop to verify
  JD-attributed quotes actually appear in `src/data/web_bundle.json`

## 7. Baseline storage design (proposed · not created)

**Proposed future path** (DO NOT CREATE IN THIS LOOP):

```
.agent/regression_baselines/
└── fixture-A/
    └── current/
        ├── baseline_metadata.json
        ├── baseline_verdict.md
        ├── baseline_structural_checks.json
        ├── source_run_id.txt
        ├── promotion_decision.md         # or pointer to .agent/decisions/…
        └── baseline_summary.md           # optional short human-readable
```

**Design principles**:

- **One `current/` per fixture.** Fixture A's current baseline lives at
  `.agent/regression_baselines/fixture-A/current/`. When a new
  baseline promotes, the old one moves to
  `.agent/regression_baselines/fixture-A/<old-baseline-id>/`
  with `baseline_status = "superseded"`.
- **Symmetric to `.agent/regression_runs/`.** Baseline layout mirrors
  run layout for grep-ability; readers can pattern-match on
  `metadata.json` → `baseline_metadata.json`.
- **No full `report.md` in v1.** Same policy as regression runs: keep
  `report.md` and `report.png` in scratchpad only. Committing them
  once per baseline change would balloon the repo.
- **No screenshots in v1.** Binary blobs, low signal per KB.
- **Lightweight + auditable.** Every baseline file is human-readable
  Markdown or JSON, short, and diff-friendly.

**Alternative** considered and rejected: `.agent/regression_runs/baselines/`
(nested under runs). Rejected because it visually collapses the "runs vs
baselines" distinction that the vocabulary in §3 tries to preserve.

## 8. Baseline metadata schema

`baseline_metadata.json` fields (canonical order, 22 fields):

| field | type | example |
|---|---|---|
| `baseline_id` | string | `fixture-A_20260713T014957Z` (fixture + source_run stamp) |
| `fixture_id` | string | `A` |
| `fixture_version` | string | `1` |
| `source_run_id` | string | `20260713T014957Z_fixture-A` |
| `source_commit_sha` | string (40-hex) | `2486eb6510e5d7a872cb714a92397f966047f12c` |
| `promoted_at` | ISO-8601 string | `2026-07-14T00:00:00Z` |
| `promoted_by` | string | `Bohao (Bohao msg 2026-07-14 HH:MM)` |
| `promotion_decision_path` | string (repo-relative) | `.agent/decisions/2026-07-14_run_XX_DECISION.md` |
| `harness_script_commit` | string | `d393db9` |
| `verdict` | string | `green` |
| `exit_code` | integer | `0` |
| `capture_scope` | string | `main section` |
| `fallback_used` | boolean | `false` |
| `report_char_count` | integer | `11773` |
| `report_length_soft_min` | integer | `1500` |
| `report_length_soft_max` | integer | `14000` |
| `duration_ms` | integer | `75804` |
| `corpus_snapshot_date` | string | `May 14, 2026` |
| `model_display` | string | `Claude Sonnet 4.6` |
| `cost_measured` | boolean | `false` |
| `estimated_cost` | string | `≈ $0.05` |
| `production_target_used` | boolean | `false` |
| `baseline_status` | enum | `current` \| `superseded` \| `deprecated` \| `invalidated` |
| `supersedes_baseline_id` | string \| null | previous baseline_id or `null` |
| `notes` | string | free-form context (max ~500 chars) |

Every field is required; use `null` explicitly when unknown, never
omit.

## 9. Promotion workflow

Once a candidate is identified, the future promotion loop follows this
11-step order:

1. **Identify candidate GREEN run** by `run_id`.
2. **Verify candidate metadata** against §5 eligibility criteria.
3. **Verify artifacts**: `metadata.json`,
   `structural_checks.json`, `verdict.md` exist, are readable, and
   fit the size sanity bounds from §6.
4. **Compare to previous baseline** if one exists (drift check).
5. **Write TASK** — a dedicated promotion TASK with `risk=yellow`,
   allowed files scoped to `.agent/regression_baselines/fixture-<X>/**`
   + TASK/RUN_REPORT/DECISION triad.
6. **Write promotion memo or RUN_REPORT section** — either a short
   promotion memo referencing the design, or the RUN_REPORT's
   `## Baseline promotion` subsection with all 22 metadata fields
   pre-filled.
7. **Create baseline files** — the 5-6 files listed in §7 in the
   correct fixture directory. This is the **only** loop where these
   paths may be created.
8. **Create DECISION** — with `verdict = approve` naming the
   candidate `run_id` and the `baseline_id`.
9. **Human approves** (Bohao only · standing terminal-autonomy rule
   still applies; baseline promotion is not a routine op and needs
   explicit approval per turn).
10. **Push baseline files** — via the standard cleanup push loop.
11. **Update daily summary** with baseline promotion record.

**Guardrails**:
- Baseline promotion **must be its own loop**. It cannot ride on
  another TASK.
- A harness run **must never auto-promote itself**. §5 forbids
  same-run promotion.
- Baseline files must be **created inside the promotion loop** —
  never on ad-hoc doc loops like this one.

## 10. Demotion / deprecation policy

A promoted baseline may be **demoted** when any of the following
happens (the promotion loop authors should watch for these):

- **Fixture changes** — content, metadata, or version bump in
  `.agent/regression_fixtures/benchmark_<X>_*.md`.
- **Harness logic changes** — any commit that touches
  `scripts/report-regression-local.mjs`, especially `extractReportText`
  or check thresholds (`REPORT_LEN_SOFT_MIN/MAX`, latency thresholds).
- **Model changes** — model display / provider / model ID moves in
  `src/lib/models-display.ts` or `src/app/api/generate-report/route.ts`.
- **Prompt changes** — any `src/lib/prompts.ts` edit.
- **Report structure changes** — `src/app/page.tsx` markdown
  components, section headers, streaming sentinel behavior.
- **Corpus / source promotion** — `src/data/web_bundle.json` refresh
  or `corpus_snapshot_date` bump.
- **Evaluation checks changed** — new structural or fixture-specific
  checks added / removed.
- **Baseline artifact found flawed** — reader spots that the baseline
  was set from a lucky run whose next re-run diverges materially.
- **Evidence / quote integrity bug found** — a report was accepted
  green but contained fabricated JD quotes; that whole baseline is
  suspect.
- **Production report format diverges** from local report format
  materially (only relevant once production probes exist).

Statuses:

- **`current`** — the single active baseline for a fixture; used for
  comparison.
- **`superseded`** — replaced by a newer `current`; kept for audit.
- **`deprecated`** — no longer valid for comparison (fixture / harness
  / prompt / model shift); kept for audit; do not use in verdicts.
- **`invalidated`** — flawed at creation (e.g. lucky run, bugged
  capture, undiscovered must-not-happen match); kept for audit with
  a `notes` explanation; never use.

Only **Bohao** may demote a baseline (parallel to §17 skip-approval
rule from AgentOps-3f).

## 11. How future regression uses baseline

- The **current harness can already produce verdicts without an
  official baseline.** GREEN / AMBER / RED classification is
  self-contained via thresholds and structural checks. A baseline
  does not change verdict logic in v1.
- **Baseline adds comparison context.** Future versions of the harness
  may compare `metadata.json` fields against the current baseline
  (e.g. char-count drift, duration drift, marker-hit-count drift) and
  surface soft-warnings via new amber checks.
- **v1 baseline comparison should NOT be exact full-text diff.**
  Reports are LLM outputs; exact text diff would flip AMBER on every
  run.
- **Compare** at v1: `capture_scope`, `fallback_used`, section-header
  presence pass/fail, `report_length_in_soft_band` pass/fail,
  `report_char_count` within `±30%` of baseline,
  `duration_ms` within `2×` of baseline, `must_not_happen_absent`,
  `contains_evidence_appendix`.
- **Semantic comparison deferred.** No LLM-judge diff, no embedding
  similarity, no BLEU/ROUGE.
- **Quote integrity deferred.** Separate later loop.

## 12. Relationship to AgentOps-3f verdict states

The 6-state vocabulary from AgentOps-3f (`not_required`, `unavailable`,
`required_green`, `required_amber`, `required_red`,
`skipped_with_reason`) is orthogonal to baseline promotion.

- `required_green` **can be green without an official baseline**. The
  current harness produces its own GREEN using thresholds; a baseline
  is not required for a report-affecting change to pass.
- **Baseline strengthens confidence** but is not required for every
  green.
- `unavailable` **must never be treated as green** whether or not a
  baseline exists.
- `required_red` **still blocks push** regardless of baseline state.
- `required_amber` **still escalates** to human + ChatGPT regardless
  of baseline state.
- `skipped_with_reason` **remains Bohao-only** (never AI-approved).

**Interaction subtlety**: once a baseline exists AND comparison-based
amber checks land (later loops), a run could produce
`required_amber` because of drift-from-baseline rather than
absolute-threshold failure. The RUN_REPORT prose must call out which
kind of amber it is.

## 13. Fixture expansion policy

- **Fixture A** can get the **first baseline** now (or after one
  stability re-run · see §17).
- **B-E should be run gradually later**, one fixture per loop,
  driven by real code changes that touch the corresponding archetype.
- **Do NOT create baselines for un-run fixtures.** A baseline claims
  reproducibility; a fixture that hasn't been real-run cannot claim
  that.
- **Do NOT require A-E full baseline suite before using Fixture A as
  a narrow baseline.** A single-fixture baseline is honestly labeled
  as such and is more useful than no baseline at all.
- **Later**: baseline set may grow to `fixture-A` … `fixture-E`, each
  with independent `current` / `superseded` / `deprecated` chains.

Recommended activation order (from 3f DECISION):
**B → C → D → E**, on-demand, one per loop.

## 14. Production baseline policy

- **No production baseline in v1.** The harness hard-rejects
  non-localhost hosts; a "production baseline" cannot be produced by
  the current harness.
- **Production smoke / baseline requires a separate DECISION** with:
  - Cost bounding (production calls may cost more; rate limits).
  - Rate-limit awareness.
  - Read-only guarantee (never post an eval, never store PII).
  - Explicit human approval per session.
- **Localhost baseline is the only candidate now**, and remains so
  until an explicit production-testing DECISION lands (separate future
  loop; not this one).

## 15. Security and privacy

- **Fixtures are synthetic** (Fixture A - E all `synthetic: true` per
  their metadata). No real user resumes touched.
- **No secrets** in metadata, structural checks, verdicts, or any
  baseline file.
- **No `.env`** committed anywhere. The harness explicitly never reads
  `.env*`.
- **No `report.md` / `screenshot.png` committed by default.**
  Scratchpad-only. This applies to baseline files too.
- **Scratchpad paths must not leak secrets** — `os.tmpdir()` is a
  system temp path; anything left there is local-only.
- **Baseline metadata must be safe to commit.** The fields in §8 are
  all machine state (IDs, timestamps, counts, thresholds); no free-form
  quotes from the generated report, no user identifiers.
- **`notes`** field is the only free-form field in the schema and
  should be reviewed for PII / secrets before commit.

## 16. Open decisions

Recorded for future DECISION resolution — not for this DECISION.

1. **Should Fixture A GREEN be promoted immediately after this
   design?** Two viable paths:
   (a) direct promotion in 3g-2 (efficient, scope is narrow); or
   (b) one stability re-run first in 3g-stability (stronger
   confidence at the cost of one extra ≈ $0.05 run).
2. **Should there be one more stability re-run before promotion?**
   Executor mild preference: yes, one re-run — cheap, catches "lucky
   green" risk.
3. **Should baseline files live under `.agent/regression_baselines/`
   or `.agent/regression_runs/baselines/`?** Memo §7 recommends the
   former (`.agent/regression_baselines/`); confirm at DECISION.
4. **Should full `report.md` ever be committed?** Memo default: no,
   even for baselines. Reconsider if we later need round-trip
   comparison of exact prose.
5. **Should screenshots ever be committed?** Memo default: no. Binary
   diff churn is expensive; scratchpad is enough for eyeballing.
6. **Should baseline require quote integrity first?** Memo default:
   no. Quote integrity is a separate later loop; making baseline
   depend on it delays the whole governance step. But once quote
   integrity exists, retroactively invalidate baselines that fail it.
7. **Should B-E run before official baseline promotion?** Memo
   default: no. Fixture A can baseline first; B-E baselines follow
   their own runs. Do not gate A on B-E.
8. **Who can demote a baseline?** Memo default: Bohao only (mirrors
   skip-approval rule from AgentOps-3f).
9. **How often should baselines expire?** Memo suggests: automatic
   "stale" flag when `harness_script_commit` or
   `corpus_snapshot_date` shifts; automatic "deprecated" only after
   human review. No time-based auto-expiry.
10. **Should baseline promotion update RUN_REPORT template?** Memo
    default: no — the existing `## Regression verdict` section already
    covers `baseline_promoted: yes/no`. A separate `## Baseline
    promotion` subsection could be added but should be an explicit
    later choice, not a byproduct of 3g-2.

## 17. Recommendation

- **Approve baseline promotion design.** The 16 preceding sections
  are self-contained; the schema in §8 is complete; the workflow in
  §9 is executable; guardrails in §10 §12 §14 §15 preserve every
  deferral Bohao has been carrying.

- **Do NOT promote a baseline in 3g.** 3g is design-only. Promotion
  is the next loop.

- **Next loop should be either**:
  - **A. `AgentOps-3g-2` — promote Fixture A GREEN run as the first
    official baseline.** Direct promotion. Cheapest (no new run).
    Assumes the `20260713T014957Z_fixture-A` run is considered
    stable enough by itself.
  - **B. `AgentOps-3g-stability` — one more Fixture A stability
    re-run before promotion.** Adds ≈ $0.05 and ~90 s of local
    generation; provides a second data point to compare against
    (`report_char_count` drift, `duration_ms` drift, verdict
    stability). Only after this passes cleanly do we open 3g-2.

- **Executor's mild preference: B first, then 3g-2.** A single re-run
  is cheap insurance against lucky-green risk (§4 reason 1). If the
  re-run also lands GREEN with capture_scope=`main section`,
  fallback_used=false, and `report_char_count` within ±30% of 11773,
  we have two data points and 3g-2 becomes very safe. If it diverges
  materially, we learn something important **before** committing the
  baseline.

- **Direct promotion (path A) is also acceptable** because the scope
  is narrow (Fixture A only), the baseline is honestly labeled as
  such, and any demotion trigger (§10) is available.

- **Do NOT run A-E full suite yet.**
- **Do NOT test production.**
- **Do NOT enable full automation.**
- **Do NOT implement Codex planner.**
- **Do NOT modify `scripts/report-regression-local.mjs`** in the
  promotion loop either; promotion is purely additive to
  `.agent/regression_baselines/fixture-A/current/`.
