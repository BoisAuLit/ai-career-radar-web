# DECISION · AgentOps-5d-cosmetic · Harness CLI safety + verdict.md artifact-list honesty

> Authored by Claude Code (executor) in checkpoint mode, per Bohao's
> explicit DECISION spec (2026-07-23 UTC). Standing in for the
> ChatGPT reviewer while the human review completes.

## Metadata

- **decision_id**: `2026-07-23_run_04_DECISION`
- **based_on_run_report**: `.agent/run_reports/2026-07-23_run_04_RUN_REPORT.md`
- **task**: `.agent/tasks/2026-07-23_run_04_TASK.md`
- **loop**: `AgentOps-5d-cosmetic`
- **parent_loop**: `AgentOps-5d-b-timeout-diagnostics` (`2026-07-23_run_03`)
- **impl_commit**: `7b8af76` (Harden regression harness CLI)
- **run_report_commit**: `2d9d67c` (Add RUN_REPORT 2026-07-23_run_04)
- **files_reviewed**:
  - `.agent/tasks/2026-07-23_run_04_TASK.md`
  - `scripts/report-regression-local.mjs` (modified · +73 / −15 ·
    strict `parseArgs()` + `printUsage()` + `fatalCli()` +
    parseArgs moved to top of `main()` + verdict.md
    `## Artifacts` IIFE via `existsSync()`)
  - `.agent/design_memos/2026-07-23_AgentOps-5d-cosmetic.md`
    (18-section findings memo)
  - `.agent/run_reports/2026-07-23_run_04_RUN_REPORT.md`
    (dogfoods 3f Regression verdict · 7-case CLI validation table
    · no-side-effect audit)
  - `.agent/decisions/2026-07-23_run_03_DECISION.md`
    (5d-b-timeout-diagnostics approve · read-only)

## Verdict

**`approve`**

## Human approval needed

**`yes`** — DECISION confirms the CLI-safety + artifact-list cleanup
and shapes the AgentOps-5e scope. No push, no deploy pending
explicit human approval per turn.

## Required fixes

**`none`**

## Reasoning summary

AgentOps-5d-cosmetic successfully hardened the local regression
harness CLI and corrected `verdict.md` artifact-list honesty
**without running generation or changing product / runtime
behavior**. The harness now recognizes `--help` and `-h` **before
any run setup** and exits successfully after printing usage.
Unknown flags, missing fixture values, unsupported fixture IDs,
unexpected positional arguments, and conflicting fixture values
now fail with exit code **2** and clear messages. **Seven CLI
cases were validated with no side effects**: no regression run
directory was created, no dev server started, no browser or
Playwright ran, and no generation or LLM/API call occurred. The
`verdict.md ## Artifacts` section now lists
`quote_integrity_summary.json` and `network_diagnostics.json` only
when those files were actually written, while prior run artifacts
remain untouched. Existing fixture behavior, diagnostics, timeout
thresholds, quote-integrity integration, telemetry-only semantics,
and legacy verdict behavior were preserved. **No `src`, checker,
API route, prompt, model, baseline, pipeline, package, workflow,
deployment, or production changes occurred.**

## Approved direction

- **Approve AgentOps-5d-cosmetic.**
- **Accept the strict `parseArgs()` implementation.**
- **Accept `printUsage()` and `fatalCli()` helpers.**
- **Accept early argument validation** before run setup and side
  effects.
- **Accept `--help` and `-h` as successful no-side-effect
  operations.**
- **Accept exit code 2 for malformed or unsupported arguments.**
- **Accept truth-based verdict artifact listing.**
- **Do NOT retroactively rewrite prior `verdict.md` artifacts.**
- **Preserve no-argument default Fixture A behavior** only as the
  existing intentional contract.
- **Preserve valid `--fixture A` and `--fixture B` behavior.**
- **Preserve diagnostics implementation.**
- **Preserve `HARD_LATENCY_MS` and `SOFT_LATENCY_MS`.**
- **Preserve quote-integrity telemetry-only behavior.**
- **Do NOT mutate or promote baselines.**
- **Do NOT introduce OpenAI API.**
- **Do NOT use LLM judge or edit-distance matching.**

## CLI validation summary · 7 cases · all pass

1. `node scripts/report-regression-local.mjs --help`
   - **exit_code**: **0**
   - usage printed to stdout
   - no side effects
2. `node scripts/report-regression-local.mjs -h`
   - **exit_code**: **0**
   - usage printed to stdout
   - no side effects
3. `node scripts/report-regression-local.mjs --unknown`
   - **exit_code**: **2**
   - clear unknown-flag error
   - no side effects
4. `node scripts/report-regression-local.mjs --fixture`
   - **exit_code**: **2**
   - clear missing-value error
   - no side effects
5. `node scripts/report-regression-local.mjs --fixture Z`
   - **exit_code**: **2**
   - clear unsupported-fixture error
   - no side effects
6. `node scripts/report-regression-local.mjs unexpected-positional`
   - **exit_code**: **2**
   - clear unexpected-positional error
   - no side effects
7. `node scripts/report-regression-local.mjs --fixture A --fixture B`
   - **exit_code**: **2**
   - clear conflicting-fixture error
   - no side effects

## Side-effect verification

- Regression run directory count remained **11 before → 11 after**
- `localhost:3000` remained **down**
- **No dev server** started
- **No Playwright / browser** launched
- **No `/api/generate-report`** call
- **No `/api/classify`** call
- **No Anthropic** call
- **No OpenAI** call
- **No `report.md`**
- **No screenshot**
- **No `network_diagnostics.json`** generated
- **No `quote_integrity_summary.json`** generated

## Artifact-list fix

- `metadata.json` remains listed according to existing convention
- `structural_checks.json` remains listed according to existing
  convention
- `verdict.md` remains listed according to existing convention
- **`quote_integrity_summary.json` is listed only when actually
  written**
- **`network_diagnostics.json` is listed only when actually
  written**
- `blocked_no_report` no longer falsely lists
  `quote_integrity_summary.json`
- `checker_error` no longer falsely lists
  `quote_integrity_summary.json`
- Diagnostic artifact is absent from the list when not written
- `report.md` is not presented as a committed artifact
- **Prior `verdict.md` files are not rewritten**
- `metadata.artifact_policy.committed` remains a policy declaration
  and was **intentionally unchanged**

## Preservation confirmation

- `HARD_LATENCY_MS` remains **240 000**
- `SOFT_LATENCY_MS` remains **120 000**
- Network `requestfailed` diagnostics **unchanged**
- Non-2xx `response` diagnostics **unchanged**
- Fail-fast success / error selector race **unchanged**
- Safe-header allowlist **unchanged**
- Sanitized response-excerpt handling **unchanged**
- Quote-integrity checker **unchanged**
- Quote-integrity wrapper **unchanged**
- **Quote integrity remains telemetry-only**
- Legacy 25-check verdict semantics **unchanged**
- Valid Fixture A / B behavior **unchanged**

## What worked

- CLI validation now happens **before** run setup.
- **Help cannot silently trigger Fixture A.**
- **Unknown CLI options cannot trigger generation.**
- **Malformed fixture arguments fail honestly.**
- **Seven validation cases passed.**
- **No-side-effect validation was explicit.**
- **Artifact listing now reflects actually written files.**
- **No prior artifacts were modified.**
- **Cost remained $0.**

## Risks remaining · 10

1. No-argument invocation still defaults to Fixture A as an
   existing contract and therefore remains generation-capable.
2. Valid Fixture A / B commands were intentionally not executed
   in this loop.
3. Error-state fail-fast branch from the prior diagnostics loop
   remains dynamically unexercised.
4. Exact origin of prior transient 502 remains unknown.
5. Quote integrity remains telemetry-only.
6. NVIDIA `jd_000201` R1 grammar-bridging issue remains
   unresolved.
7. A/B baselines remain `quote_integrity_not_evaluated`
   conceptually.
8. C/D/E have not yet received real generated regression runs.
9. Uploaded PDFs remain out of scope.
10. BLK-0001 / BLK-0002 / BLK-0003 remain `open`.

## Recommended next loop

**AgentOps-5e baseline quote-integrity schema fold —
inspection / design first.**

### Initial 5e scope

- **$0 inspection-only first pass.**
- **Do NOT generate reports.**
- **Do NOT mutate baselines in the inspection pass.**
- Inspect how current A/B baseline metadata represents:
  - `quote_integrity_not_evaluated`
  - schema version
  - grandfathered baseline status
  - telemetry-only policy
- Determine whether the baseline metadata / schema should
  explicitly carry quote-integrity evaluation status for future
  promotion decisions.
- Produce a design memo and recommendation **before any baseline
  / schema mutation**.
- **No C/D/E · No A-E full suite · No uploaded PDFs**
- **No OpenAI API · No LLM judge · No edit-distance**
- **No `src/**` changes · No pipeline changes**
- **Keep quote integrity telemetry-only**
- **Do NOT start AgentOps-5f-promote.**

## Possible later loops

1. **Prompt / format tuning**:
   - address R1 grammar bridging
   - improve evidence-quote faithfulness
   - validate with controlled A + B runs
2. **C/D/E generated regression**:
   - only after explicit scope and cost approval
3. **AgentOps-5f-promote**:
   - only after schema + prompt / format + broader fixture evidence
   - separate design memo and DECISION required

## Non-blocking followups

- **Push AgentOps-5d-cosmetic after human approval.**
- **Update daily summary after push.**
- **Then start AgentOps-5e inspection / design.**
- Do NOT run generation during cleanup.
- Do NOT mutate baselines.
- Do NOT promote quote integrity.
- Do NOT run C/D/E yet.
- Do NOT ingest uploaded PDFs.
- Do NOT introduce OpenAI API.
- Do NOT modify `src/**`.
- Do NOT modify pipeline.

## Next task prompt for Claude

After this DECISION is committed, **stop and wait for explicit human
approval to push**. Do NOT push. Do NOT deploy. Do NOT start
AgentOps-5e. Do NOT run harness generation. Do NOT run Playwright.
Do NOT run report generation. Do NOT call Anthropic/OpenAI. Do NOT
run C/D/E. Do NOT run A-E full suite. Do NOT ingest uploaded PDFs.
Do NOT modify baselines. Do NOT modify fixtures. Do NOT modify
pipeline. Do NOT modify `.agent/scripts/**`. Do NOT modify
`src/**`. Do NOT mutate the harness hard threshold. Do NOT
introduce retry behavior. Do NOT revert diagnostics or CLI-safety
changes. Do NOT promote quote integrity to blocking. Do NOT
implement Codex planner. Do NOT create `.agent/planner_reports/`.
Do NOT run collector. Do NOT refresh corpus. Do NOT modify GitHub
Actions. Do NOT resolve BLK-0001 / BLK-0002 / BLK-0003. Do NOT
start G2.1d. Recommended next task after push/cleanup is
**AgentOps-5e** (baseline quote-integrity schema fold ·
inspection / design first · $0 · no generation · no baseline
mutation · design memo before any schema change).

## Boundary confirmations · 28 items

| item | status |
|---|---|
| No push | ✅ |
| No deploy | ✅ |
| No generation | ✅ |
| No Playwright or dev server | ✅ |
| No LLM / API calls | ✅ |
| No threshold mutation | ✅ (`HARD_LATENCY_MS=240000` · `SOFT_LATENCY_MS=120000`) |
| No retry behavior | ✅ |
| No `src/**` changes | ✅ |
| No checker changes | ✅ (`scripts/quote-integrity-check.mjs` unchanged) |
| No baseline mutation | ✅ (A + B `current` untouched · grandfathered) |
| No baseline promotion | ✅ |
| No prior-artifact mutation | ✅ (prior `regression_runs/**` and `quote_integrity_runs/**` untouched · verdict.md not retroactively rewritten) |
| No C/D/E | ✅ |
| No A-E full suite | ✅ |
| No uploaded PDFs | ✅ |
| No OpenAI API | ✅ (BLK-0003 unchanged) |
| No LLM judge | ✅ |
| No edit-distance | ✅ |
| No `.agent/scripts/**` changes | ✅ (hard rule per AgentOps-2c Q3-Q8) |
| No pipeline changes | ✅ (`b019786` 起终一致) |
| No production target | ✅ |
| **Quote integrity remains telemetry-only** | ✅ |
| **No blocking promotion** | ✅ (still requires separate DECISION) |
| BLK-0001 / BLK-0002 / BLK-0003 remain `open` | ✅ |
| QUEUE-0002 G2.1d remains `blocked_pending_human` | ✅ |
| Q10 automation-infra pause unchanged | ✅ |
| Codex planner remains spec-only | ✅ |
| `.agent/planner_reports/` remains empty | ✅ |
| Cost for this DECISION loop | ✅ **$0** |

## Stop condition

DECISION written. **Awaiting explicit human approval to push.** No
follow-up action is authorized until Bohao says
"push AgentOps-5d-cosmetic".
