# AgentOps-5e · Baseline quote-integrity schema fold · design memo (inspection only)

> Design memo · **$0** · no runtime activity · no baseline mutation ·
> no schema mutation · no code change.

## 1 · Purpose

Design how the `.agent/regression_baselines/` metadata should
**explicitly** carry quote-integrity information so that:

1. Whether QI evaluation was done is machine-checkable, not
   human-readable-only.
2. Which QI schema was used is recorded per baseline.
3. Grandfathered pre-QI baselines are visibly grandfathered with a
   reason.
4. Telemetry-only vs blocking policy is recorded per baseline.
5. Future promotion eligibility is deterministically evaluable.

## 2 · Approved scope

Per `.agent/decisions/2026-07-23_run_04_DECISION.md`
(5d-cosmetic approve · recommended next loop is 5e inspection
first). **$0 · no baseline mutation · no schema mutation · no
code change.**

## 3 · What was not run

- No Playwright · no dev server · no browser.
- No Fixture A / B / C / D / E generation.
- No Anthropic / OpenAI call.
- No `scripts/report-regression-local.mjs` invocation.
- No `scripts/quote-integrity-check.mjs` invocation.
- No edit to any file under `.agent/regression_baselines/**` ·
  `.agent/regression_fixtures/**` ·
  `.agent/regression_runs/**` ·
  `.agent/quote_integrity_runs/**`.
- No harness or checker code change.
- No `src/**` change.
- No pipeline change.
- **`--help` was NOT invoked** (documented safe post-5d-cosmetic but
  irrelevant · not needed this loop).

## 4 · Current baseline inventory

### Fixture A (`.agent/regression_baselines/fixture-A/current/`)

- 6 files: `baseline_metadata.json` · `baseline_structural_checks.json`
  · `baseline_summary.md` · `baseline_verdict.md` ·
  `promotion_decision.md` · `source_run_id.txt`.
- `baseline_metadata.json`: **34 fields** — `baseline_id` ·
  `fixture_id` · `fixture_version` · `source_run_id` ·
  `source_run_artifact_path` · `source_commit_sha` ·
  `promoted_at` · `promoted_by` · `promotion_decision_path` ·
  `harness_script_path` · `harness_script_commit` · `verdict` ·
  `exit_code` · `capture_scope` · `fallback_used` ·
  `report_char_count` · `report_length_soft_min` ·
  `report_length_soft_max` · `duration_ms` · `corpus_snapshot_date`
  · `model_display` · `cost_measured` · `estimated_cost` ·
  `production_target_used` · `baseline_status` ·
  `supersedes_baseline_id` · 4 `stability_*` · `notes[]`.
- `baseline_id = fixture-A_20260714T025246Z_current` · source
  commit `451bb7f` · harness commit `d393db9` · promoted via
  `.agent/decisions/2026-07-12_run_09_DECISION.md`.
- **QI representation**: implicit only via `notes[]` string
  `"Quote integrity not yet a gate."`
- **No structured QI fields** in metadata.

### Fixture B (`.agent/regression_baselines/fixture-B/current/`)

- Same 6 files.
- `baseline_metadata.json`: **35 fields** (A's 34 plus
  `fixture_specific_recommendation_keywords`).
- `baseline_id = fixture-B_20260719T054151Z_current` · source
  commit `0341461` · harness commit `0341461` · promoted via
  `.agent/decisions/2026-07-19_run_03_DECISION.md`.
- **QI representation**: identical to A — same prose note only.
- **No structured QI fields** in metadata.

## 5 · Current quote-integrity policy

From the 5a → 5d-cosmetic DECISION chain:

- **Ground truth** for QI = cleaned served corpus body
  (`src/data/web_bundle.json.records[].body`).
- **Deterministic-first** (no LLM judge · no edit-distance ·
  no semantic equivalence).
- **R1 (post-ellipsis grammar bridging)** → RED. Locked in
  `2026-07-21_run_03_DECISION.md`.
- **R2 (terminal-punctuation-only mismatch)** → AMBER under 8
  strict conditions. Locked in `2026-07-21_run_03_DECISION.md`.
- **Blocking mode**: **`telemetry_only`** universally. Locked in
  `2026-07-21_run_02_DECISION.md`. Promotion to `blocking` requires
  a separate DECISION.
- **Existing A/B baselines are grandfathered** and NOT
  retroactively mutated by 5a. Any exception requires an explicit
  DECISION (per 5a DECISION #4).
- **Checker schema currently in use**: `0.3-r2-terminal-punctuation`.

## 6 · Controlled A/B run evidence (2026-07-23)

Five real controlled runs exist today (all under
`.agent/regression_runs/`). Selected columns for design purposes:

| run_id | legacy | exit | QI verdict | QI schema | evidence_entries | key note |
|---|---|---:|---|---|---:|---|
| `20260723T035644Z_fixture-A` | GREEN | 0 | red | 0.3-r2-… | 0 | appendix missing (flake) |
| `20260723T042627Z_fixture-A` | GREEN | 0 | amber | 0.3-r2-… | 5 | appendix present · R2 fired |
| `20260723T035828Z_fixture-B` | RED | 1 | blocked_no_report | null | n/a | 502 timeout |
| `20260723T042759Z_fixture-B` | RED | 1 | blocked_no_report | null | n/a | 502 reproduced 2/2 |
| `20260723T160538Z_fixture-B` | GREEN | 0 | red | 0.3-r2-… | 5 | R1 NVIDIA `jd_000201` |

**Implication for 5f-promote**: none of the current controlled runs
is a clean promotion candidate (`red` or `blocked_no_report`
throughout · except one AMBER A run which requires review).

## 7 · Problems with current baseline representation

1. **QI status is not machine-checkable** — only expressible as
   `notes[]` prose. A tool cannot answer "is this baseline
   evaluated?" without NLP.
2. **No schema-version traceability** — cannot tell which checker
   version produced a baseline's QI verdict (because there IS no
   verdict recorded).
3. **Grandfathering is implicit** — the notes say "Quote integrity
   not yet a gate", but there is no boolean or reason field, so a
   future automated promotion tool cannot distinguish
   "grandfathered on purpose" from "someone forgot to evaluate".
4. **Blocking-mode / policy provenance is missing** — no field
   links a baseline to the DECISION that locked its policy.
5. **Promotion eligibility is not deterministically computable** —
   an operator would have to read notes, look up DECISIONs by
   hand, and re-derive R1/R2 status.

## 8 · State model

Two orthogonal dimensions, kept as separate fields (not overloaded
into one enum):

- **evaluation_status** (baseline-lifecycle state):
  - `not_evaluated` — no QI was attempted / policy predates QI.
  - `evaluated` — QI checker actually ran on the source run and
    emitted a `quote_integrity_summary.json`.
  - `blocked` — evaluation was attempted but the checker returned
    `blocked_no_report` or `blocked_no_corpus`.
  - `error` — evaluation was attempted but the checker returned
    `checker_error`.

- **verdict** (checker output at evaluation time):
  - `green` · `amber` · `red` · `null` (`null` only when
    `evaluation_status != evaluated`).

Plus two policy fields (independent of verdict):

- **blocking_mode**: `telemetry_only` | `blocking`.
- **grandfathered**: `true` | `false`.

## 9 · Candidate schema

Flat `quote_integrity` block added to `baseline_metadata.json`
(backward-compatible · does not remove any existing field):

```json
{
  "quote_integrity": {
    "evaluation_status": "not_evaluated",
    "verdict": null,
    "schema_version": null,
    "checker_commit": null,
    "blocking_mode": "telemetry_only",
    "grandfathered": true,
    "grandfather_reason": "pre_quote_integrity_baseline",
    "evaluated_run_id": null,
    "evaluated_at": null,
    "summary_path": null,
    "promotion_eligibility": "requires_review",
    "promotion_reasons": [
      "grandfathered_pre_qi",
      "requires_evaluated_source_run_before_next_promotion"
    ],
    "reviewed_by": [],
    "decision_id": null
  }
}
```

For an evaluated future baseline:

```json
{
  "quote_integrity": {
    "evaluation_status": "evaluated",
    "verdict": "amber",
    "schema_version": "0.3-r2-terminal-punctuation",
    "checker_commit": "<sha of scripts/quote-integrity-check.mjs at eval>",
    "blocking_mode": "telemetry_only",
    "grandfathered": false,
    "grandfather_reason": null,
    "evaluated_run_id": "<runId>",
    "evaluated_at": "<iso8601>",
    "summary_path": ".agent/regression_runs/<runId>/quote_integrity_summary.json",
    "promotion_eligibility": "requires_review",
    "promotion_reasons": ["amber_verdict_R2_present"],
    "reviewed_by": ["Bohao", "ChatGPT-reviewer"],
    "decision_id": ".agent/decisions/<future-5f-promote>.md"
  }
}
```

## 10 · Field-by-field rationale

| field | required | source of truth | rationale |
|---|---|---|---|
| `evaluation_status` | must | derived at promotion | primary machine-checkable state |
| `verdict` | must (may be null) | source run's `quote_integrity_summary.json.verdict` | snapshot at promotion time |
| `schema_version` | must (may be null) | source run's summary `schema_version` | required for compatibility policy |
| `checker_commit` | recommended | git SHA of `scripts/quote-integrity-check.mjs` at eval time | audit trail |
| `blocking_mode` | must | linked to policy DECISION | records intended enforcement per baseline |
| `grandfathered` | must | promotion DECISION | boolean · unambiguous |
| `grandfather_reason` | must if `grandfathered=true` | free-form controlled vocabulary | provides audit trail |
| `evaluated_run_id` | required if `evaluation_status=evaluated` | source run | immutable pointer |
| `evaluated_at` | required if `evaluation_status=evaluated` | source run `started_at` | temporal audit |
| `summary_path` | required if `evaluation_status=evaluated` | committed path | direct reference |
| `promotion_eligibility` | must | tool-derivable per §13 | 3-state |
| `promotion_reasons` | recommended | tool-derived | machine-readable rationale |
| `reviewed_by` | recommended | promotion DECISION | human accountability |
| `decision_id` | must | promotion DECISION path | provenance |

**Deliberately NOT included in baseline metadata** (kept in source
`regression_runs/<runId>/quote_integrity_summary.json` only):

- `counts` object — volatile · read from source when needed.
- `red_reasons` array — same.
- `amber_reasons` array — same.
- Full `sample_items` — never in baseline; too large.

This prevents duplication and stale-data risk. Baseline records the
**decision state** at promotion time; counts/reasons stay in the
immutable source run.

## 11 · Required invariants

Grouped by severity.

### Must-have

- **I1**: `evaluation_status = not_evaluated` ⇒ `verdict = null` AND
  `schema_version = null` AND `evaluated_run_id = null`.
- **I2**: `evaluation_status = evaluated` ⇒ `schema_version != null`
  AND `evaluated_run_id != null` AND `summary_path != null`.
- **I3**: `blocked_no_report` source run cannot be promoted
  (`promotion_eligibility = ineligible`).
- **I4**: `checker_error` source run cannot be promoted
  (`promotion_eligibility = ineligible`).
- **I5**: legacy `GREEN` alone does not imply promotion
  eligibility · requires evaluated QI.
- **I6**: `quote_integrity_verdict = red` AND `blocking_mode =
  blocking` ⇒ `promotion_eligibility = ineligible`.
- **I8**: `grandfathered = true` requires an explicit
  `grandfather_reason`.
- **I9**: evaluated baseline must point to immutable committed run
  artifact AND immutable committed promotion DECISION.
- **I10**: baseline metadata must NEVER claim a QI result that was
  not actually evaluated (no fabricated verdicts).
- **I12**: promotion NEVER silently changes `blocking_mode` · the
  promotion DECISION must state intended mode.

### Recommended

- **I7**: under `blocking_mode = telemetry_only`, a `red` verdict
  baseline candidate becomes `promotion_eligibility =
  requires_review` — not auto-eligible, not auto-blocked. Human
  DECISION decides.
- **I11**: checker `schema_version` change requires either explicit
  compatibility annotation in the promotion DECISION or a
  re-evaluation with the new schema.

### Future (not required now)

- **I13**: baseline lineage / supersession must record whether the
  superseded baseline shared the same `schema_version` (helps
  reason about drift).
- **I14**: a "baseline compatibility check" tool that reads
  `schema_version` from all baselines and warns on mixed schemas.

## 12 · Current A/B grandfathering options

### Option 1 — Retroactive annotation

Add the `quote_integrity` block to the existing A + B
`baseline_metadata.json` files with fixed values:

- `evaluation_status = not_evaluated`
- `verdict = null`
- `schema_version = null`
- `grandfathered = true`
- `grandfather_reason = "pre_quote_integrity_baseline"`
- `blocking_mode = telemetry_only`
- `promotion_eligibility = requires_review`
- `promotion_reasons = ["grandfathered_pre_qi",
  "requires_evaluated_source_run_before_next_promotion"]`
- `decision_id = <link to the new AgentOps-5e-migrate DECISION>`

Pros: single source of truth · machine-checkable immediately ·
records already-known truth (does not reclassify anything).
Cons: touches grandfathered baseline files · requires explicit
grandfathering-exception DECISION per 5a DECISION #4 · adds a
migration commit to the history.

### Option 2 — External registry

Keep A + B baseline files frozen. Add a new file
`.agent/regression_baselines/quote_integrity_registry.json` that
maps `fixture_id` → the same values above.

Pros: baseline files literally unchanged · no grandfathering
exception needed. Cons: split source of truth · two files to keep
in sync · risk of stale registry · every consumer must remember to
consult two files.

### Option 3 — No mutation

Leave A + B baseline files entirely alone. Apply the new schema
only to future promoted baselines.

Pros: zero risk to existing baselines · smallest surface area.
Cons: A + B stay "silent" on QI · a future automated promotion
tool cannot uniformly reason about all baselines · must still hand-
consult the notes on legacy baselines.

## 13 · Promotion eligibility model

The `promotion_eligibility` field is computed from a fixed decision
tree:

### Hard blockers (⇒ `ineligible`)

- `legacy_verdict != green`
- `evaluation_status` in `{not_evaluated, blocked, error}` — hard
  block if the harness is expected to have evaluated
- `verdict == red` AND `blocking_mode == blocking`
- `source_run_id` missing or its committed artifact directory does
  not exist
- `promotion_decision_path` missing

### Review-required (⇒ `requires_review`)

- `verdict == red` AND `blocking_mode == telemetry_only`
- `verdict == amber`
- `schema_version != current_checker_schema_version`
- `grandfathered == true`

### Non-blocking warnings (⇒ `eligible` but noted)

- `terminal_punctuation_only_matches > 0` (R2 fired)
- `appendix_entries_not_cited > 0`

The tree does not decide by itself — it computes the eligibility
label. A promotion DECISION must still be authored by human +
reviewer.

## 14 · Schema compatibility policy

**Default: exact-match.** A baseline evaluated with
`schema_version = 0.3-r2-terminal-punctuation` is considered
"current" only while the checker's `schema_version` string equals
that value.

**Explicit compatibility allowlist:** when a checker bumps to a
new version but preserves semantics for a subset of baselines, the
promotion DECISION for the new version can declare
`compatibility_allowed_from_versions: ["0.3-r2-terminal-punctuation"]`.
This is an **opt-in per DECISION** — never automatic.

**Do NOT infer semver compatibility.** The schema-version string is
free-form and includes the R-tier label; treat it as an opaque
identifier.

Old baselines can remain **grandfathered** even if the checker
version bumps. Grandfather status does not expire.

## 15 · Source-of-truth map

| information | primary source | baseline snapshot | derived by |
|---|---|---|---|
| evaluation_status | promotion DECISION | yes | promotion tooling |
| verdict | `regression_runs/<runId>/quote_integrity_summary.json` | yes (snapshot) | copy at promotion |
| schema_version | source run summary | yes | copy at promotion |
| checker_commit | `git log -1 -- scripts/quote-integrity-check.mjs` at eval | yes | derive at eval |
| counts / reasons | source run summary | **NO** | read from source |
| blocking_mode | policy DECISION | yes | promotion DECISION states it |
| grandfathered / reason | promotion DECISION | yes | explicit |
| promotion_eligibility | tool + human | yes (computed) | §13 decision tree |
| reviewed_by | promotion DECISION | yes | human |
| decision_id | promotion DECISION | yes | explicit |

**Rule of thumb**: baseline metadata records **state and pointers**,
not **volatile derived data**. Anything that could drift or that is
large (counts · reasons · sample_items · full appendix) stays in
the source run.

## 16 · Options considered

- **A**: add `quote_integrity` block directly to
  `baseline_metadata.json` (see §9).
- **B**: separate `.agent/regression_baselines/quote_integrity_registry.json`
  (see §12 Option 2).
- **C**: per-fixture `.agent/regression_baselines/<fixture>/current/quote_integrity_policy.json`
  (per-baseline file · similar to Option 1 but new file rather
  than block-in-metadata).
- **D**: no schema; only apply the model going forward via docs +
  DECISIONs (see §12 Option 3).

## 17 · Recommended architecture

**Recommend Option A + the schema in §9.**

- **Why A over B (registry)**: single source of truth per baseline;
  the baseline file already carries `verdict`, `exit_code`,
  `promotion_decision_path`, `harness_script_commit`, etc.
  Adding a sibling QI block matches the shape of what is already
  there. A registry would split the contract across two files with
  no compensating benefit.
- **Why A over C (separate file per baseline)**: `baseline_metadata.json`
  is already the canonical baseline descriptor. Splitting into two
  files doubles the consumers' cognitive load. C is only useful if
  the QI info would ever change independently of the baseline —
  which it should NOT (both are frozen at promotion time).
- **Why A over D (no schema)**: D leaves grandfathered baselines
  unrepresentable to automation. Any future promotion tool would
  need to hand-parse prose. That is the exact bug this loop
  addresses.

### Migration approach (for a **separate later** DECISION)

1. AgentOps-5e-migrate loop (or 5e-schema): add the `quote_integrity`
   block to the two existing A + B `baseline_metadata.json` files
   with the "grandfathered + not_evaluated" values from §12
   Option 1. Nothing else changes.
2. Update the promotion pathway in `.agent/scripts/**` OR in
   `scripts/report-regression-local.mjs` (if promotion tooling
   lives there — TBD) to always emit the block for future
   baselines. **If the pathway is in `.agent/scripts/**` (hard-rule
   read-only), this needs a separate exception DECISION.** Executor
   guess: promotion is currently manual (per 3g / 4b patterns) —
   so this step may be documentation only.
3. Optional: add a small compatibility check tool at
   `scripts/baseline-qi-audit.mjs` that reads all baselines and
   prints their `evaluation_status` / `verdict` / `grandfathered` /
   `blocking_mode` / `promotion_eligibility` at a glance. **$0
   inspection tool** — separate loop.

### Implementation risk

- Touching `.agent/regression_baselines/**` in migration
  contradicts the informal "grandfathered baselines are frozen"
  posture from 5a DECISION #4. The migration MUST be authored by
  an explicit DECISION that names this as a one-time exception
  (records-only, does not reclassify).
- If the migration DECISION is not written, existing A + B stay in
  Option 3 (no mutation) mode indefinitely.

### Validation strategy

- Static: `python3 -c "json.load(open(...))"` on both edited files.
- Invariant check: hand-verify I1, I8, I9, I10, I12 on the two
  migrated files.
- Behavioral: no runtime change · nothing to re-generate.

### Rollback strategy

- Migration commit is a pure `.agent/regression_baselines/**` edit
  (`baseline_metadata.json` only). Rollback is `git revert <sha>`.
- No downstream tooling depends on the block until a subsequent
  loop (5f-promote) reads it.

### Relation to AgentOps-5f-promote

- 5f-promote will be the first loop that **enforces** promotion
  eligibility using this schema. Until then the fields are
  observation-only.
- 5f-promote must **not** silently change `blocking_mode`; the
  DECISION must state the intended mode explicitly (I12).

## 18 · Proposed migration sequence

Only after this design memo + DECISION lands:

1. **AgentOps-5e-migrate** (a separate future loop):
   - Edit `.agent/regression_baselines/fixture-A/current/baseline_metadata.json`
     to append the `quote_integrity` block with grandfathered
     values.
   - Same for Fixture B.
   - Do not touch `baseline_verdict.md`, `promotion_decision.md`,
     `baseline_summary.md`, `source_run_id.txt`,
     `baseline_structural_checks.json`.
   - Cost **$0**.
   - Commit + separate DECISION.

2. **AgentOps-5e-audit-tool** (optional later loop):
   - Add `scripts/baseline-qi-audit.mjs` that prints per-baseline
     QI summary.
   - $0.

3. **Prompt-tune loop** (see §21):
   - Product-side R1 remediation before 5f.

4. **AgentOps-5f-promote** (much later):
   - Prescribe promotion criteria using the schema.
   - Only after §21 lands OR the DECISION explicitly accepts red
     baselines under review.

## 19 · Validation plan

- **This inspection loop**: no runtime · JSON inventory well-formed
  (verified via helper Python check when written).
- **Later 5e-migrate loop**: JSON-validity + invariant check + no
  other diff.
- **Later 5f-promote loop**: dry-run against A/B baselines to
  confirm the decision tree in §13 evaluates as
  `requires_review` for both (currently grandfathered + no
  evaluated verdict).

## 20 · Rollback plan

- This memo: no runtime state to roll back.
- Any future 5e-migrate: `git revert <sha>`; baseline files return
  to current shape.
- Any future 5f-promote: the block is snapshot-at-promotion; if a
  promotion is wrong, the standard "supersedes_baseline_id"
  mechanism replaces it. No special QI rollback needed.

## 21 · Relationship to prompt / format work

R1 (post-ellipsis grammar bridging) is the single largest QI RED
signal today. In the five controlled A/B runs, it appears whenever
the model uses ellipsis to stitch a quote and inserts a bridging
connector word.

Options to address R1 outside the schema:

- **Prompt-tune loop** — change the report-generation prompt to
  discourage ellipsis stitching, prefer verbatim quoting or explicit
  paraphrase. Cost ~$0.10 for controlled A + B validation.
- **Product-side fix** — a server-side post-processing pass that
  splits stitched quotes into two verbatim quotes. More complex ·
  probably lower priority than prompt-tune.

Neither is in AgentOps-5e's scope. But 5f-promote should probably
**wait** until R1 is either eliminated at the prompt layer or
explicitly accepted by DECISION as "R1 RED baselines can be
promoted under review with human sign-off".

## 22 · Relationship to AgentOps-5f-promote

- 5f-promote is the first loop that **acts** on this schema.
- 5f-promote requires: R1 remediated OR explicitly accepted;
  schema in place on A + B (via 5e-migrate) OR schema in place
  only on the specific new baseline being promoted; separate design
  memo + DECISION.
- The current A + B baselines will be treated as `requires_review`
  under the decision tree — they will not auto-qualify for
  re-promotion.

## 23 · Risks

1. **Touching `.agent/regression_baselines/**` violates the
   grandfathering norm** from 5a DECISION #4. Mitigated by
   requiring an explicit 5e-migrate DECISION.
2. **Baselines could drift from the schema over time** if new
   fixtures are added without updating tooling. Mitigated by
   optional `baseline-qi-audit.mjs` tool.
3. **`promotion_eligibility` might create false confidence** that
   "eligible" means "definitely OK". Mitigated by keeping
   promotion strictly DECISION-driven; the field is advisory.
4. **Schema versioning could become a chore**. Mitigated by exact-
   match + opt-in allowlist rule (§14).
5. **Counts / reasons duplication** if someone snapshots them into
   the baseline. Mitigated by explicit §15 source-of-truth rule.
6. **Auto-consumers might treat `grandfathered=true` as
   "eligible"** — precisely wrong. Mitigated by making
   `promotion_eligibility = requires_review` for all
   grandfathered baselines (§13).
7. **Prompt-tune loop might not fully eliminate R1** — 5f-promote
   would then either wait longer or accept R1 under review.
   Acceptable either way.
8. **Cascade risk**: schema in baselines with no promotion tooling
   change → dead field. Mitigated by binding schema landing to
   5f-promote scoping.
9. **AgentOps-5e-migrate cost = $0 but risk-of-touch is real.**
   The one-time exception must be crystal clear in that DECISION.
10. **`scripts/baseline-qi-audit.mjs` might tempt scope creep** —
    only add if the audit is actually used.

## 24 · Open questions requiring human decision

### Q1 — Direct baseline metadata block vs separate registry?

- Options: `A` (block in `baseline_metadata.json`) · `B` (separate
  `quote_integrity_registry.json`) · `C` (per-baseline
  `quote_integrity_policy.json`).
- **Executor recommendation**: **A**. Single source of truth,
  matches existing baseline shape, lowest migration cost.

### Q2 — Should A + B receive explicit one-time grandfather annotations?

- Options: **retrofit under 5e-migrate DECISION** · leave frozen
  (Option 3 in §12).
- **Executor recommendation**: **retrofit under a separate
  AgentOps-5e-migrate DECISION**. Records already-known truth,
  does not reclassify anything, small commit. Requires an
  explicit "grandfathering exception" clause in that DECISION per
  5a DECISION #4.

### Q3 — Telemetry-only RED eligibility for baseline promotion?

- Options: always ineligible if RED · `requires_review` with human
  sign-off under `telemetry_only`.
- **Executor recommendation**: **`requires_review` under
  `telemetry_only` only**. Always ineligible if
  `blocking_mode = blocking` (I6 · matches the R1-locked posture
  from 5c).

### Q4 — Checker schema compatibility rule?

- Options: exact match · semver compatible · explicit allowlist per
  DECISION.
- **Executor recommendation**: **exact match by default, explicit
  opt-in allowlist per DECISION** for cross-version reuse. Never
  auto-infer compatibility from strings.

### Q5 — Prompt / format remediation as prerequisite for promotion?

- Options: require R1 remediation before ANY promotion · allow RED
  promotion under review · case-by-case.
- **Executor recommendation**: **case-by-case in DECISION** · but
  do NOT auto-promote RED · R1 remediation strongly preferred
  before the first 5f-promote. The DECISION that opens 5f should
  state whether R1 has been eliminated at the prompt layer or is
  being explicitly grandfathered.

## 25 · Recommended next loop

- **AgentOps-5e-migrate** — retrofit A + B `baseline_metadata.json`
  with the `quote_integrity` block per §9 (grandfathered =
  true · not_evaluated · telemetry_only). Cost **$0**. No
  runtime. Requires explicit "grandfathering exception" clause in
  the DECISION.
- Alternatively (executor's second choice): **hand off / pause**
  and wait for human to decide whether to proceed with 5e-migrate,
  a prompt-tune loop, or 5f-promote directly.

**Do not** merge migration into this loop. **Do not** implement
`scripts/baseline-qi-audit.mjs` in this loop. **Do not** touch
`.agent/scripts/**`. **Do not** promote QI to blocking. **Do not**
run any fixture.

## 26 · Boundaries respected

- No push · no deploy · no manual `vercel deploy`.
- **No generation** · **no harness run** · **no Playwright** ·
  **no dev server**.
- **No LLM / API calls** (no Anthropic · no OpenAI).
- **No baseline mutation** · **no schema mutation** · **no code
  changes**.
- **No threshold mutation** (`HARD_LATENCY_MS = 240_000` ·
  `SOFT_LATENCY_MS = 120_000`).
- **No retry behavior**.
- **No `src/**` change** · **no `.agent/scripts/**` change** (hard
  rule) · **no checker change** · **no harness code change** (only
  read for context).
- **No `.agent/regression_baselines/**` /
  `.agent/regression_fixtures/**` /
  `.agent/regression_runs/**` /
  `.agent/quote_integrity_runs/**` change**.
- **No pipeline change** (`b019786` unchanged).
- No `package.json` / lockfile / `.github/workflows/**` / `.env*` /
  `vercel.json` / Codex-Claude config change.
- No uploaded PDFs · no `report.md` · no `*.png` · no full report
  body · no long quote excerpts committed.
- **No OpenAI API** introduced. **No LLM judge.** **No
  edit-distance.**
- **No C/D/E** · **no A-E full suite**.
- **Quote integrity remained telemetry-only.**
- **No promotion of QI to blocking.**
- BLK-0001 / BLK-0002 / BLK-0003 remain `open`.
- QUEUE-0002 G2.1d remains `blocked_pending_human`.
- Cost: **$0**.
