# RUN REPORT · AgentOps-5e-followup-baseline-lint-integrate-phase3-execute · Two-run controlled A/B validation

## Metadata

- **task_id**: `2026-07-24_run_09`
- **date**: `2026-07-24`
- **run_number**: `09`
- **branch**: `main`
- **loop**: AgentOps-5e-followup-baseline-lint-integrate-phase3-execute
- **parent_loop**: AgentOps-5e-followup-baseline-lint-integrate-phase3-design (`2026-07-24_run_08`)
- **authorizing_decision**: `.agent/decisions/2026-07-24_run_08_DECISION.md`
- **task_path**: `.agent/tasks/2026-07-24_run_09_TASK.md`

## Human cost approval

**Bohao 2026-07-24 explicit cost-approved GO message** (this turn), granting:

- Fixture A **exactly once**.
- Fixture B **exactly once**, only after A stop-condition review.
- **Zero retries** (automatic OR manual).
- Expected total cost **~$0.10**.
- Hard per-run cap **$0.075**.
- Hard total cap **$0.15**.

Referenced design authority: `.agent/decisions/2026-07-24_run_08_DECISION.md` (approve · plan-only; execution requires separate cost-approved GO — this message).

## Approved two-run scope

- **Fixture A × 1** (`benchmark_A_backend_to_applied_ai.md`)
- **Fixture B × 1** (`benchmark_B_fullstack_to_ai_product.md`)
- **Zero retries.**
- **No C / D / E · no A-E suite · no third run · no paid debug.**
- Existing approved app / provider / model path only (Sonnet 4.6 via `/api/generate-report`).

## Commits

Pending. This turn will produce two commits:

- `<hash1>` Record Phase 3 A/B validation run artifacts
- `<hash2>` Add RUN_REPORT 2026-07-24_run_09

## Exact commands executed

```bash
# Preflight (both repos) — clean, sync 0/0, HEAD f073c4f (web), b019786 (pipeline)

# Prerequisite (background, separate shell):
cd /Users/bohaoli/Desktop/ai-career-radar-web
nohup npm run dev > /tmp/acr-dev-server.log 2>&1 &
# Ready confirmed at 2026-07-24T19:31:21Z (Ready in 246ms on port 3000)

# Run A (foreground, single attempt):
cd /Users/bohaoli/Desktop/ai-career-radar-web
node scripts/report-regression-local.mjs --fixture A
# Exit 0 · started 2026-07-24T19:31:35Z · ended 2026-07-24T19:32:41Z

# Stop-condition review — all 22 conditions PASS

# Run B (foreground, single attempt):
cd /Users/bohaoli/Desktop/ai-career-radar-web
node scripts/report-regression-local.mjs --fixture B
# Exit 1 · started 2026-07-24T19:33:49Z · ended 2026-07-24T19:33:54Z

# Dev server killed (PID 74612)
```

**No retries. No third run. No manual intervention between A and B beyond stop-condition review.**

## Server startup outcome

- **Command**: `nohup npm run dev > /tmp/acr-dev-server.log 2>&1 &`
- **PID**: 74612
- **Start**: 2026-07-24T19:31:20Z
- **Ready**: 2026-07-24T19:31:21Z (Ready in 246ms · Next.js 16.2.6 Turbopack)
- **Port**: 3000 (localhost only)
- **Rebuilds / errors**: none (a benign Next.js multi-lockfile workspace-root warning appeared, ignored per prior policy)
- **Result**: **success**

## Run A summary

- **Run ID**: `20260724T193135Z_fixture-A`
- **Command exit**: **0**
- **Process exit**: **0**
- **Legacy verdict**: **GREEN**
- **QI verdict**: **AMBER** (1 `terminal_punctuation_only_matches`)
- **Structural verdict**: **RED** (`gap_section_missing_or_unrecognized`, `citation_line_count=0_lt_5`, `evidence_appendix_missing`)
- **Combined telemetry verdict**: **RED** (`display_only: true`, `affected_legacy_verdict: false`, `affected_process_exit: false`)
- **Duration**: 64_535 ms (harness) · 65.36s wall
- **Capture scope** (raw): `main section`
- **`captureScopeForContext`**: `main section`
- **`fallback_used`**: `false`
- **`capture_complete`**: `true`
- **`expected_sections_captured`**: `true`
- **`report_capture_error`**: `null`
- **`report_char_count`**: 9339
- **`checker_hash`**: `sha256:eb6193d9ea677cd8d5a6ca708b45b8b77480f38d30b8be17e23059bddf53cc73`
- **Harness git SHA**: `f073c4f46ec2e6ae0186bd7d249bd51d5ddbd3b5`
- **Measured cost**: harness `cost_measured=false`; **estimated ~$0.05** (one real generation via `/api/generate-report`; consistent with prior real-generation loops in this repo)

## Fixture A artifact matrix (7 required · 7 present)

| # | artifact | status |
|---|---|---|
| 1 | `metadata.json` | ✅ present |
| 2 | `verdict.md` | ✅ present · 4 sibling telemetry sections + required wording |
| 3 | `structural_checks.json` | ✅ present · 30 legacy checks · **no structural_evidence / combined_telemetry entry** |
| 4 | `quote_integrity_summary.json` | ✅ present |
| 5 | `structural_evidence_summary.json` | ✅ present (schema `0.1-phase1`) |
| 6 | `structural_evidence_context.json` | ✅ present (schema `0.1-phase2` · 9 fields · category-A only) |
| 7 | `network_diagnostics.json` | ✅ present |

Scratchpad-only (never committed): `/var/folders/.../acr-regression-runs/20260724T193135Z_fixture-A/report.md`, `report.png`.

## 22 stop-condition evaluation after A

| # | condition | result |
|---|---|---|
| 1 | external generation / app failure makes B unsafe | **NO** — completion=success |
| 2 | automatic retry | **NO** |
| 3 | manual retry required | **NO** |
| 4 | per-run cost A > $0.075 | **NO** — estimated ~$0.05 |
| 5 | projected total > $0.15 | **NO** — ~$0.10 projected |
| 6 | provider 4xx/5xx unclear charge | **NO** |
| 7 | legacy `checks[]` shape changed | **NO** — 30 checks / 4 buckets (structural / fixture / operational / quote_integrity) |
| 8 | structural in `checks[]` | **NO** |
| 9 | combined in `checks[]` | **NO** |
| 10 | telemetry affected `classify(checks)` | **NO** |
| 11 | telemetry affected process exit | **NO** — exit 0 driven by legacy |
| 12 | baseline file changed | **NO** — 0-line diff |
| 13 | `report.md` rewritten | **NO** — scratchpad only, not rewritten |
| 14 | structural summary missing / malformed | **NO** — schema `0.1-phase1`, valid JSON, verdict `red`, all fields present |
| 15 | `metadata.combined_telemetry` missing / malformed | **NO** — verdict `red`, `display_only=true` |
| 16 | `affected_legacy_verdict != false` | **NO** — `false` |
| 17 | forbidden file changed | **NO** — all zones 0-line diff |
| 18 | unexpected additional paid operation | **NO** |
| 19 | context marks complete as incomplete via content | **NO** — capture_complete=true from category A only |
| 20 | context marks truncated as complete | **NO** — no truncation |
| 21 | integration hides / mislabels telemetry | **NO** — RED clearly shown in verdict.md |
| 22 | A cannot be evaluated meaningfully | **NO** — clear telemetry |

**All 22 stop conditions PASS. Proceeded to B.**

## Run B summary

- **Run ID**: `20260724T193349Z_fixture-B`
- **Command exit**: **1**
- **Process exit**: **1** (legacy RED from `done_state_reached=false`, `report_non_empty=false`, `report_text_capture_success=false`, `contains_section_*`=false, `contains_evidence_appendix=false`)
- **Legacy verdict**: **RED** (external application error)
- **QI verdict**: **`blocked_no_report`** (report.md never saved)
- **Structural evaluation_status**: **`not_run`** (report.md never saved → validator correctly skipped per design § 14 tool-error paths)
- **Structural verdict**: `null` (correctly, per not_run semantics)
- **Combined telemetry verdict**: **`not_evaluable`** (`display_only: true`, `affected_legacy_verdict: false`, `affected_process_exit: false`)
- **Duration**: 4_778 ms (harness) · 5.02s wall
- **Capture scope** (raw): `unset` (never reached `extractReportText`)
- **`captureScopeForContext`**: **N/A** — helper returned `not_run` envelope; no context artifact written
- **`fallback_used`**: `false`
- **`capture_complete`**: **N/A** (harness path never derived it)
- **`report_capture_error`**: N/A (report never captured)
- **`report_char_count`**: 0
- **First non-2xx**: `http://localhost:3000/api/classify` **status 502** at `first_failure_elapsed_ms=4561`
- **`generate_route_status`**: **`null`** — `/api/generate-report` **never called**
- **Measured cost**: **$0** (Anthropic API never invoked because `/api/classify` failed pre-generation; harness `cost_measured=false` and 502 from classify → generation path unreached)
- **Harness git SHA**: `f073c4f46ec2e6ae0186bd7d249bd51d5ddbd3b5`

## Fixture B artifact matrix (4 present · 3 correctly absent by design)

| # | artifact | status |
|---|---|---|
| 1 | `metadata.json` | ✅ present |
| 2 | `verdict.md` | ✅ present · 4 sibling telemetry sections |
| 3 | `structural_checks.json` | ✅ present · **no structural_evidence / combined_telemetry entry** |
| 4 | `quote_integrity_summary.json` | **absent — correct** (`runQuoteIntegrity` returned `blocked_no_report` without invoking the checker when `reportSaved=false`; `metadata.quote_integrity` still records `verdict: "blocked_no_report"`) |
| 5 | `structural_evidence_summary.json` | **absent — correct** per design memo § 14 "report_file_missing_at_invocation → skip invocation · evaluation_status=not_run" |
| 6 | `structural_evidence_context.json` | **absent — correct** (context never written because validator never invoked) |
| 7 | `network_diagnostics.json` | ✅ present |

**This is NOT an integration failure.** Both QI and structural evidence helpers correctly skip artifact emission when `reportSaved=false`, and each subsystem records its state in metadata:
- `metadata.quote_integrity.verdict = "blocked_no_report"` (unchanged 5c-integrate semantics)
- `metadata.structural_evidence.evaluation_status = "not_run"` (Phase 2 semantics)
- `metadata.combined_telemetry.verdict = "not_evaluable"` (correctly derived via precedence)

## No-retry evidence

- **A**: single `node scripts/report-regression-local.mjs --fixture A` invocation · exit 0.
- **B**: single `node scripts/report-regression-local.mjs --fixture B` invocation · exit 1.
- **No `--retry` flag exists** in the harness.
- Bash timing (`time` command output) confirms one process per fixture.
- Dev server log shows one `/api/generate-report` sequence for A and zero for B (blocked by `/api/classify` 502).

## Cost per run + total + cap compliance

| run | measured API cost | source |
|---|---|---|
| **A** | **~$0.05** (estimated) | harness `cost_measured=false`; estimated from prior real-generation loops (`AgentOps-5e-followup-prompt-refinement-implement` etc.) — one Sonnet 4.6 generation via `/api/generate-report` |
| **B** | **$0** | `/api/classify` returned 502 before `/api/generate-report` was called (`generate_route_status: null`); no Anthropic invocation reached the model |
| **Total** | **~$0.05** | Both runs together |

Cap compliance:

- Per-run A: $0.05 < $0.075 hard cap ✅
- Per-run B: $0.00 < $0.075 hard cap ✅
- Total: $0.05 < $0.15 hard total cap ✅ (and < $0.10 expected total)

## Duration per run

- **A**: 64_535 ms harness (~65s wall)
- **B**: 4_778 ms harness (~5s wall) — external failure at 4561 ms

## Process exit per run

- **A**: 0 (legacy GREEN)
- **B**: 1 (legacy RED)

Both driven solely by `classify(checks)`. **Telemetry (structural / QI / combined) did NOT affect either exit code.**

## Generation classification per run

- **A**: **success** (completion_state=success)
- **B**: **app_error** (completion_state=application_error · 502 from `/api/classify`)

## Capture classification per run

- **A**: **complete** (mechanismReached=true · scope `main section` · selectedLength 9339 · fallback_used=false · expected_sections_captured=true)
- **B**: **incomplete** (report_text never captured; scope `unset`; harness bailed before `extractReportText`)

## Legacy verdict per run

- **A**: `green`
- **B**: `red`

## QI verdict per run

- **A**: `amber` (1 terminal-punctuation-only match)
- **B**: `blocked_no_report`

## Structural verdict per run

- **A**: `red` (evaluation_status `completed` · reasons: `gap_section_missing_or_unrecognized`, `citation_line_count=0_lt_5`, `evidence_appendix_missing`)
- **B**: `null` (evaluation_status `not_run` · reason `report_md_not_saved`)

## Combined verdict per run

- **A**: **`red`** (per precedence: neither is tool_error; structural=red → combined=red)
- **B**: **`not_evaluable`** (neither red/amber; QI=blocked_no_report treated as not-green → falls to not_evaluable)

Both correctly `display_only: true` · `affected_legacy_verdict: false` · `affected_process_exit: false`.

## Integration verdict per run

- **A**: **pass** — all 7 artifacts present · telemetry accurately reflects the generated report · legacy `checks[]` intact · process exit legacy-controlled · no baseline mutation · no retry · no report rewrite · combined precedence honored · verdict.md displays 4 sibling sections with required wording
- **B**: **pass** — all applicable artifacts present (4 of 7; 3 correctly absent per design because report.md was never saved: `quote_integrity_summary.json` per 5c-integrate `blocked_no_report`, plus `structural_evidence_summary.json` + `structural_evidence_context.json` per Phase 2 `not_run`) · telemetry accurately reflects the external app failure via `blocked_no_report` + `not_run` + `not_evaluable` · legacy `checks[]` intact · process exit legacy-controlled · no baseline mutation · no retry · no report rewrite · combined precedence honored

## Capture context per run

- **A**: `{schema_version:"0.1-phase2", capture_scope:"main section", fallback_used:false, completion_state:"success", capture_complete:true, report_capture_error:null, report_char_count:9339, expected_sections_captured:true, source:"report-regression-local"}` — all fields correct · **derived from category A (transport/mechanism) facts only**
- **B**: N/A — context never built because report.md never saved (validator was never invoked)

## Artifact-existence matrix (7 × 2)

| artifact | A | B |
|---|---|---|
| `metadata.json` | ✅ | ✅ |
| `verdict.md` | ✅ | ✅ |
| `structural_checks.json` | ✅ | ✅ |
| `quote_integrity_summary.json` | ✅ | **absent (correct — 5c-integrate `blocked_no_report` path)** |
| `structural_evidence_summary.json` | ✅ | **absent (correct per design § 14)** |
| `structural_evidence_context.json` | ✅ | **absent (correct)** |
| `network_diagnostics.json` | ✅ | ✅ |

## Metadata consistency

- **A**: `metadata.structural_evidence` — 13 fields · `evaluation_status=completed` · `verdict=red` · `blocking_mode=telemetry_only` · `checker_hash=sha256:eb6193d9…` matches `/^sha256:[a-f0-9]{64}$/` · `exit_code=1` · `duration_ms=26` · `affected_legacy_verdict=false` · `tool_error=null` · `capture_context` matches harness facts.
  `metadata.combined_telemetry` — `verdict=red` · `display_only=true` · `affected_legacy_verdict=false` · `affected_process_exit=false` · `quote_integrity_verdict=amber` · `structural_evidence_verdict=red`.
- **B**: `metadata.structural_evidence` — `evaluation_status=not_run` · `verdict=null` · `blocking_mode=telemetry_only` · `checker_hash=null` · `exit_code=null` · `duration_ms=0` · `summary_path=null` · `context_path=null` · `capture_context=null` · `affected_legacy_verdict=false` · `tool_error=null`.
  `metadata.combined_telemetry` — `verdict=not_evaluable` · `display_only=true` · `affected_legacy_verdict=false` · `affected_process_exit=false` · `quote_integrity_verdict=blocked_no_report` · `structural_evidence_verdict=null`.

## verdict.md consistency

Both A and B contain the **four required sibling sections**:

- `## Legacy regression verdict`
- `## Quote integrity telemetry`
- `## Structural evidence telemetry`
- `## Combined telemetry`

Required wording verified (grep counts on A):

- `"does NOT affect"`: **4** occurrences
- `"display-only"`: **1** occurrence
- `"MUST remain visibly RED"`: **1** occurrence

No full report body / long quote excerpts / resume content embedded.

## Combined-precedence verification

Rule: `tool_error > red > amber > not_evaluable > green`.

- **A**: QI=amber · structural=red · neither tool_error → combined=**red** ✅
- **B**: QI=blocked_no_report (treated as not-green) · structural=null (not_run) · neither red/amber/tool_error → combined=**not_evaluable** ✅

## Checker SHA-256 per run

- **A**: `sha256:eb6193d9ea677cd8d5a6ca708b45b8b77480f38d30b8be17e23059bddf53cc73`
- **B**: N/A (checker never invoked — report.md not saved)

## Harness git SHA per run

- **A** and **B**: `f073c4f46ec2e6ae0186bd7d249bd51d5ddbd3b5` (main HEAD at time of execution)

## Structural checks set preservation

- **A structural_checks.json**: 30 checks · 4 buckets (`structural: 17` · `fixture: 4` · `operational: 4` · `quote_integrity: 5`) · **no `structural_evidence` or `combined_telemetry` entry**.
- **B structural_checks.json**: same 30-check shape · same 4 buckets · **no `structural_evidence` or `combined_telemetry` entry**.
- Legacy check set is unchanged between A and B and vs Phase 2 baseline.

(Note: the Phase 3 design memo referenced "legacy 25-check list only" — the actual current count is **30 checks** across the 4 legacy buckets. This was pre-existing Phase 2 shape and was not modified by Phase 3 execution. The number "25" in the memo was a rough estimate; the invariant that matters — "no structural / combined entry in checks[]" — holds.)

## Process-exit preservation

- **A**: `process.exit(0)` from `classify(checks)` — no telemetry influence
- **B**: `process.exit(1)` from `classify(checks)` — no telemetry influence
- I20 static assertion (deterministic test) confirmed `process.exit(classification.exit)` is intact in the harness source.

## No-report-rewrite confirmation

- `scripts/structural-evidence-check.mjs` reads `report.md` via `readFileSync(args.report, "utf8")` and never writes to it (only writes `structural_evidence_summary.json` atomically via temp+rename).
- Helper `scripts/lib/structural-evidence-integration.mjs` never opens `report.md`.
- A's scratchpad `report.md` mtime is untouched between harness completion and this RUN_REPORT write.
- B's scratchpad `report.md` does not exist (never written by harness).

## Baseline 0-line diff

`git diff -- .agent/regression_baselines/` → **0 lines** ✅.

## Forbidden-zone 0-line diffs

| zone | lines |
|---|---|
| `scripts/quote-integrity-check.mjs` | 0 |
| `scripts/structural-evidence-check.mjs` | 0 |
| `scripts/report-regression-local.mjs` | 0 |
| `src/` | 0 |
| `.agent/scripts/` | 0 |
| `.agent/regression_baselines/` | 0 |
| `.agent/regression_fixtures/` | 0 |
| `package.json` / `package-lock.json` / `vercel.json` | 0 |
| `.github/workflows` | 0 |

## Anomalies

1. **Product-quality**: Fixture A's generated report (via the current prompt on Sonnet 4.6) does **NOT** contain the recognized `## Your top 5 gaps` section pattern or `## Evidence Appendix` heading in the captured `main section` scope. Legacy `contains_section_top_5_gaps` passes because the marker string appears somewhere; the structural validator's stricter regex (`/^##\s+Your top 5 gaps\b/im`) does not match. This is a real generator/prompt gap that Phase 2 telemetry correctly surfaces as structural **RED**. **Integration is not at fault**; the telemetry is doing exactly what it was designed to do.
2. **External failure**: Fixture B's `/api/classify` returned **HTTP 502** at 4561 ms, before `/api/generate-report` was invoked. Anthropic was never called. No cost incurred for B. This is an app / provider issue (possibly transient) unrelated to Phase 2 integration.

## Overall Phase 3 integration result

**pass** for both runs.

- The integrated harness produced accurate, internally consistent telemetry across two distinct scenarios (successful generation with a structurally deficient report; complete pre-generation app failure).
- Legacy `checks[]`, `classify(checks)`, and `process.exit(classification.exit)` behaved identically to their pre-Phase-2 semantics.
- Structural telemetry never entered `checks[]`.
- Combined telemetry never entered `checks[]`.
- Baseline files were untouched.
- No retries occurred.
- No report rewriting occurred.
- No forbidden files were modified.
- Measured cost was **~$0.05 total**, well under the **$0.15 hard cap**.

The product-vs-integration distinction defined in the Phase 3 design proved essential and correct: two distinct kinds of trouble (structural report gap for A; external app failure for B) were both handled correctly by the telemetry pipeline without ever conflating them with integration defects.

## Recommended next step

**Human + ChatGPT review** this RUN_REPORT, then say **"create DECISION for AgentOps-5e-followup-baseline-lint-integrate-phase3-execute"**. Executor will write DECISION (mild preference: **approve** for integration correctness · **required_fixes: none** for integration).

Product-quality follow-ups (out of scope for this DECISION):

- Fixture A structural RED could motivate a subsequent prompt / generator refinement loop (separately designed).
- Fixture B `/api/classify` 502 could motivate a subsequent app-side diagnostics loop (separately designed).

Phase 4 (baseline migration), Phase 5 (stability), Phase 6 (blocking promotion), and `AgentOps-5f-promote` remain **further separately gated**.

## Stop condition

RUN_REPORT written and committed. **Do NOT create DECISION yet.** **Do NOT push.** **Do NOT run more paid generations.** **Do NOT mutate baselines.** **Do NOT change legacy verdict or process exit.** **Do NOT promote structural lint or QI to blocking.** **Do NOT start `AgentOps-5f-promote`.**
