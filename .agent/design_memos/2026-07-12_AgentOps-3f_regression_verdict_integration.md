# AgentOps-3f · Regression Verdict Integration

- **Date**: 2026-07-12
- **Loop**: `AgentOps-3f`
- **Parent loop**: `AgentOps-3e-tune-2` (`2026-07-12_run_05`)
- **Type**: Design / protocol / template integration (no code, no run)
- **Status**: Draft · pending human + ChatGPT review + DECISION
- **Owner**: Bohao (product) · Claude (executor) · ChatGPT (reviewer)

## 1. Purpose

AgentOps now has a **working local report regression harness**
(`scripts/report-regression-local.mjs`) that produced the first honest
GREEN verdict on Fixture A. The next step is **not more generation** —
it is **process integration**. From this loop forward, every future
report-affecting change must **explicitly record whether regression was
required and what verdict resulted**, in a RUN_REPORT field that a human
reviewer can scan in three seconds. The integration must make it
mechanically hard for an AI agent to push a report-affecting change
without acknowledging regression state. It should also give the Codex
read-only daily planner (specified in AgentOps-3b, not yet implemented)
a deterministic contract for how to consume regression state.

Non-goals for 3f:
- Running the harness (deferred; harness is stable at `d393db9`).
- Promoting a baseline (separate explicit loop).
- Expanding to Fixtures B-E (separate scale-out loop).
- Implementing the Codex planner (still a spec, not code).
- Any `src/**` or `.agent/scripts/**` edit.

## 2. Current validated harness state

Anchor state as of this memo:

| field | value |
|---|---|
| harness script | `scripts/report-regression-local.mjs` @ `d393db9` (828 lines) |
| fixtures covered | **A only** (v1 · `.agent/regression_fixtures/benchmark_A_backend_to_applied_ai.md`) |
| B-E fixtures | shipped, **not yet real-run** |
| target environment | **`localhost:3000` only** (hard-rejects non-localhost) |
| driver | Playwright CLI headless Chromium (no MCP) |
| latest green run_id | `20260713T014957Z_fixture-A` |
| verdict | **green** · exit_code `0` |
| duration_ms | 75804 |
| capture_scope | `main section` |
| capture_strategy | `shortest-qualified-candidate` |
| fallback_used | **false** |
| report_char_count (selected) | 11773 |
| page_body_char_count (obs) | 18422 |
| report_length_soft_min / max | 1500 / 14000 |
| selected_candidate_marker_count | 5 / 5 |
| selected_candidate_has_evidence | true |
| checks total / passed | 25 / 25 |
| baseline promoted | **no** (baseline promotion is not yet in scope) |
| A-E full suite run | **no** |
| production tested | **no** (harness hard-rejects non-localhost) |
| cost_measured | false |
| estimated_cost_per_run | ≈ $0.05 (Sonnet 4.6) |
| cost cap enforced by | `single_generation_limit` (policy, not measurement) |

## 3. Regression state vocabulary

Every RUN_REPORT and every Codex planner report must classify the
current regression state as **exactly one** of the following six values.
Use this vocabulary verbatim.

### `not_required`
**Meaning**: The task cannot affect generated report content, structure,
evidence citations, streaming completion, or export behavior. Examples:
`.agent/**` docs, design memos, daily summaries, this very protocol
change, pipeline-repo-only changes, unrelated web infra tweaks.
**Push implication**: Push may proceed under normal review process; no
regression run needed. RUN_REPORT must **explain why** regression is
not required — do not leave the reason blank.

### `unavailable`
**Meaning**: Regression should have been run for this change, but was
not run because the harness or environment was unavailable (dev server
down, Playwright missing, corpus stale relative to code, harness itself
broken, etc.).
**Push implication**: **No automatic push.** Human must decide whether
to (a) fix the harness first, (b) explicitly override with recorded
reason, or (c) revert the change. RUN_REPORT must explain the exact
unavailability cause.

### `required_green`
**Meaning**: Regression was required (change is report-affecting), was
run, produced verdict = **green**, `fallback_used=false`, all 15 red
checks passed, all amber checks passed.
**Push implication**: Push is **eligible** once other AgentOps checks
pass and human explicitly approves. This is the strongest positive
state.

### `required_amber`
**Meaning**: Regression was required, was run, produced verdict =
**amber**. At least one amber check failed (typically length band,
recommendation match heuristic, action-bar visibility) but no red
check failed and body fallback was not used.
**Push implication**: **No push until reviewed.** Requires ChatGPT +
human review of the amber failure. Amber may reflect real regression
or measurement noise; the DECISION file must call it explicitly. An
amber push requires explicit human override with recorded reason.

### `required_red`
**Meaning**: Regression was required, was run, produced verdict =
**red**. At least one red-level check failed (page did not load,
`done_state_reached=false`, incomplete banner visible, must-not-happen
matched, missing section header, missing Evidence Appendix, fatal
Playwright error, hard latency exceeded, or non-localhost target).
**Push implication**: **Push blocked.** Fix or revert must ship first.
Never override a red without explicit human decision recorded in a
DECISION file that acknowledges the specific red check.

### `skipped_with_reason`
**Meaning**: Regression was required by rule (§4 says the change is
report-affecting) but was **not run** because the human explicitly
approved the skip. Typical cases: overnight-hours skip with follow-up
next day, corpus refresh pending, harness scheduled maintenance,
non-urgent doc adjacent to a report file.
**Push implication**: Push may proceed **only if** the RUN_REPORT
contains the human-approved skip reason **and** the DECISION
acknowledges it. Skip approval is human-only, never AI-only. A
`skipped_with_reason` push must also queue a follow-up regression run
in the next appropriate loop.

## 4. When regression is required

### Required (report-affecting)

Any change to files or behavior that can affect **generated report
content, structure, evidence citations, streaming completion, or export
behavior** is report-affecting:

- **Prompt changes**: `src/lib/prompts.ts` and any file consumed as
  system/user prompt input.
- **Model / provider selection changes**: `src/lib/models-display.ts`,
  model IDs in `src/app/api/generate-report/route.ts` or elsewhere.
- **Report generation route changes**:
  `src/app/api/generate-report/route.ts` and anything it calls.
- **Report renderer changes**: `src/app/page.tsx` markdown renderer /
  section styling / stream-complete sentinel handling.
- **Resume / PDF parsing input changes**: `src/lib/pdf-*.ts`,
  `src/app/api/parse-pdf/route.ts`, empty-PDF gate, character
  thresholds.
- **Eval / report-quality changes**: `src/app/api/eval-report/route.ts`.
- **Retrieval / corpus selection changes**: `src/data/**`,
  `src/lib/web-bundle-stats.ts`, corpus snapshot bump.
- **Source / corpus promotion**: any pipeline-side change that becomes
  visible via `src/data/web_bundle.json` after re-bundling.
- **Anything else** that plausibly changes what the report says or how
  it renders.

### Not required

- `.agent/**` files that describe process, not runtime behavior.
- Design memos.
- Daily summaries.
- Non-runtime docs (`README.md`, changelogs, etc.).
- Pure protocol changes like this loop.
- Pipeline-repo-only changes that do NOT feed into `src/data/`.
- Tests / harness scripts themselves (unless they change what
  regression measures).

### Not sufficient alone

Regression signal is **necessary but not sufficient** for:

- **Red-zone classifier / prompt / schema changes** — require prior
  human approval documented in a red DECISION, on top of green
  regression.
- **Legal / compliance data-source changes** — require legal/compliance
  sign-off, on top of green regression.
- **Production deployment decisions** — production is never targeted
  by the harness; a green localhost run does not certify production.
  Production releases require separate human decision.

## 5. RUN_REPORT integration

Every future RUN_REPORT that references a report-affecting change must
contain a top-level section named exactly `## Regression verdict`,
populated with the following fields. Snippet in
`.agent/templates/regression_verdict_section.md` is the canonical
form; `.agent/templates/run_report_template.md` gets the section
appended so new RUN_REPORTs scaffolded from the helper include it by
default.

### Fields (canonical order)

- **regression_required**: `yes` | `no`
- **reason_required_or_not**: 1-3 sentences.
- **harness_used**: `yes` | `no`
- **harness_command**: e.g. `node scripts/report-regression-local.mjs`
  or the exact command line used.
- **fixture_ids**: comma-separated (`A` today; `A, B, C…` later).
- **target_environment**: e.g. `http://localhost:3000` or
  `unavailable`.
- **latest_run_id**: e.g. `20260713T014957Z_fixture-A` or `n/a`.
- **verdict**: `green` | `amber` | `red` | `unavailable` |
  `not_required` | `skipped_with_reason`.
- **exit_code**: integer (or `n/a`).
- **artifact_paths**: paths to
  `.agent/regression_runs/<run-id>/{metadata,structural_checks,verdict}.*`.
- **report_char_count**: integer (or `n/a`).
- **capture_scope**: string (e.g. `main section` · `body_fallback` ·
  `n/a`).
- **fallback_used**: `true` | `false` | `n/a`.
- **red_checks_failed**: count (default `0`).
- **amber_checks_failed**: count (default `0`).
- **cost_measured**: `yes` | `no`.
- **estimated_cost**: e.g. `≈ $0.05` (or `n/a`).
- **duration_ms**: integer (or `n/a`).
- **baseline_promoted**: `yes` | `no` (default `no` while baseline
  promotion is deferred).
- **production_target_used**: `yes` | `no` (must be `no` for the
  harness; `yes` only for future explicit production tests).
- **reviewer_action_required**: e.g. `human + ChatGPT review of amber`
  · `none` · `fix red before push`.
- **push_implication**: derived from §7 policy.

### Push implication rules (for §7 lookup)

- `regression_required=yes` AND `verdict=required_green` → **push
  eligible after human approval**.
- `verdict=required_amber` → **no push until reviewed**.
- `verdict=required_red` → **no push; fix or revert**.
- `verdict=unavailable` → **no automatic push; human decision required
  with recorded reason**.
- `regression_required=no` → **normal process; explain why not
  required**.
- `verdict=skipped_with_reason` → **only if human explicitly approved
  skip; include recorded reason in RUN_REPORT and DECISION**.

## 6. Codex planner schema integration

The Codex read-only daily planner (specified in AgentOps-3b) is not
yet implemented. When it lands, it MUST implement the following
regression protocol.

### Read-only inputs

- `.agent/regression_runs/<latest>/metadata.json` — canonical machine
  state (committed).
- `.agent/regression_runs/<latest>/structural_checks.json` — per-check
  detail (committed).
- `.agent/regression_runs/<latest>/verdict.md` — human-readable
  summary (committed).
- Latest RUN_REPORT's `## Regression verdict` section (if newer than
  the latest run directory).

### Rules

1. Codex must **read the latest regression state** if available.
2. Codex must **not mark regression `green`** if the state is
   `unavailable`, `skipped_with_reason`, or older than 24 hours for a
   report-affecting change queue.
3. Codex must **recommend fix or revert over new feature work** when
   the latest required regression is `red`.
4. Codex must **escalate `amber`** to the human daily planner header
   with an explicit "amber blocking push" flag.
5. Codex **may proceed** when regression is `not_required` for
   doc-only work (design memos, daily summaries, this kind of
   protocol change).
6. Codex must include **one line in each recommended next task**:
   `Regression requirement: required / not required / unavailable / skipped_with_reason` and a short reason.
7. Codex must include the **stop condition** in every daily planner
   report:
   `Do not push report-affecting changes without green regression or explicit human override.`
8. Codex must **treat committed `metadata.json` as authoritative** over
   human-written RUN_REPORT prose when they disagree — human prose is
   commentary; JSON is state.
9. Codex must **never trigger a regression run** itself. Regression is
   a human-initiated loop.
10. Codex must **flag drift**: if `metadata.json`'s
    `git_commit_sha` is older than the current `main` HEAD by more
    than one loop, note "regression state stale, next required loop
    should re-run" in the daily planner header.

Detailed guidance lives in
`.agent/templates/planner_regression_guidance.md`.

## 7. Push decision policy

| state | eligible for push? | reviewer_action_required |
|---|---|---|
| `required_green` + no other blockers | **yes** (after explicit human approval) | none beyond normal AgentOps checkpoints |
| `required_amber` | **no** | human + ChatGPT review; explicit override if push |
| `required_red` | **no** | fix or revert first; separate DECISION for any override |
| `unavailable` | **no automatic push** | human decides; record cause + intent |
| `not_required` | **yes** (normal process) | none beyond normal checkpoints; explain reason in RUN_REPORT |
| `skipped_with_reason` | **conditional** | only if human explicitly approved skip; recorded in RUN_REPORT + DECISION; queue follow-up regression |

This policy binds AI agents (Claude, Codex, future agents). It does not
override human authority — a human may always issue an explicit
override with a recorded reason in the DECISION file.

## 8. Baseline policy remains deferred

- **No baseline promotion in 3f.** The latest green run
  (`20260713T014957Z_fixture-A`) is a **validated run artifact**, not
  an official baseline yet.
- Baseline promotion requires its own separate TASK + RUN_REPORT +
  DECISION.
- Do NOT create a `baselines/` directory in this loop.
- Do NOT promote any run to `default_baseline` or `promoted_baseline`
  status in this loop.
- Once a baseline is promoted (a later loop), the harness may compare
  future runs against it. Until then, verdicts are self-standing.

## 9. Fixture expansion remains deferred

- Fixture A is validated green.
- Fixtures B-E have been **shipped as content** but **not yet real-run**
  through the harness.
- Do NOT run A-E full suite in 3f.
- Future expansion should be **gradual**: one new fixture at a time,
  each with its own TASK + RUN_REPORT + DECISION loop to catch
  fixture-specific issues.
- Recommended order: B (recommendation-heavy) → C (career-transition
  focus) → D (senior IC → lead) → E (product manager cross-in). Order
  can be revisited at the time.

## 10. Production testing remains deferred

- Harness remains **localhost-only**. `ALLOWED_HOSTS =
  {"localhost", "127.0.0.1"}`; any other host is a hard-reject.
- Production testing (against `ai-career-radar.vercel.app`) requires a
  **separate explicit DECISION** with:
  - Cost bounding (production calls may cost more than local).
  - Rate-limit awareness.
  - Read-only guarantee (never post an eval, never store PII).
  - Explicit human approval per session.
- No Vercel / production smoke automation in 3f.

## 11. Template changes proposed in this loop

- **`.agent/templates/run_report_template.md`** — append a new
  `## Regression verdict` section with all fields from §5. Existing
  sections unchanged.
- **`.agent/templates/regression_verdict_section.md`** (new) —
  standalone reusable snippet. Same field set + inline field-level
  guidance + push-implication rules. Any future RUN_REPORT that
  omits the section from its base template can copy this file in.
- **`.agent/templates/planner_regression_guidance.md`** (new) —
  Codex planner regression protocol (10-rule guidance from §6 above),
  formalized in a template so future Codex-planner implementation
  loops have a canonical source.
- **No** `.agent/policies/**` edits in this loop. If any protocol
  bit should promote to policy status, it will be captured in §12
  and deferred to a separate policy loop.

## 12. Open decisions

Recorded for future DECISION / policy loops — not for this DECISION.

1. **Mandatory vs conditional Regression verdict section**: Should
   the `## Regression verdict` section be mandatory in **every**
   RUN_REPORT, or only for RUN_REPORTs whose TASK is
   report-affecting? Current memo recommends **every RUN_REPORT
   includes it**, with `not_required` + reason for doc-only tasks —
   consistency over concision.
2. **Standardize harness command**: `node
   scripts/report-regression-local.mjs` is the current command.
   Should we alias it to `npm run regression:report` in
   `package.json`? Would require a separate TASK (touches
   `package.json`).
3. **"Validated run" vs "baseline"**: Should the latest green run be
   labeled `validated_run` (informal reference) in daily summaries
   until a baseline is officially promoted? Recommendation: yes,
   informal reference is fine as long as `default_baseline` remains
   unset.
4. **Codex planner input source**: Should Codex consume
   `metadata.json` directly (machine-readable JSON) or
   human-written RUN_REPORT prose? Memo §6 says **JSON is
   authoritative**; prose is commentary. Confirm at DECISION.
5. **Baseline promotion trigger**: When should baseline promotion
   happen? Options: (a) after N consecutive greens on Fixture A;
   (b) after Fixture A + B both green; (c) after all A-E green.
   Recommendation: **(b)** — first B green is a meaningful
   confidence step.
6. **B-E fixture activation cadence**: One fixture per week?
   One per loop? On-demand? Recommendation: **on-demand**, driven
   by real code changes touching different fixture archetypes.
7. **Amber override**: Should any AMBER ever be pushable with human
   override? Recommendation: **yes, with explicit written reason
   in DECISION**, but every AMBER override should queue a
   follow-up fix loop.
8. **Skip approval ownership**: Who owns the authority to approve
   `skipped_with_reason`? Recommendation: **Bohao only** for this
   project; no AI agent can approve a skip.

## 13. Recommendation

- **Approve protocol integration.** The four artifacts (memo +
  three template files) are ready for human + ChatGPT review.
- **Next loop after 3f DECISION** should be **one of**:
  - **A. Baseline promotion design/decision** — draft a proposal
    for promoting `20260713T014957Z_fixture-A` (or a fresh
    equivalent) to `default_baseline`; produce a design memo, then
    (later loop) actually create the baseline file. No run needed
    for the design step.
  - **B. One stability re-run of Fixture A** — sanity-check that
    the length band + capture strategy stay green across two
    runs before promoting a baseline. Yellow · single run · cheap.
  - **C. Gradual Fixture B run** — activate Fixture B with its own
    TASK + RUN_REPORT + DECISION. Yellow · single run.
- **Do NOT expand too fast.** Do not jump to A-E full suite. Do
  not enable CI. Do not promote a baseline without an explicit
  design step.
- **Do NOT turn on full automation yet.** Q10 automation pause
  remains in force. Codex planner remains a spec, not code.
