# AgentOps-5d-cosmetic · Harness CLI safety + verdict.md artifact-list honesty · findings memo

> Harness-only cleanup · **$0** · no generation · no dev server · no
> browser · no Playwright · no LLM/API · no threshold mutation · no
> baseline mutation · no product change.

## 1 · Purpose

Two small independent fixes on `scripts/report-regression-local.mjs`:

1. Make `--help` / `-h` print usage and exit 0 **before** any I/O
   side effect (no run dir · no dev server · no browser · no
   generation · no API call).
2. Reject unknown CLI flags, missing / unsupported / conflicting
   `--fixture` values, and unexpected positional arguments with a
   clear error, usage to stderr, and exit code 2.
3. Fix `verdict.md ## Artifacts` line so it lists only files
   actually written for that run.

## 2 · Approved scope

Per `.agent/decisions/2026-07-23_run_03_DECISION.md` (5d-b-timeout-
diagnostics approve · recommended next loop is 5d-cosmetic).
**$0. No generation. No baseline mutation. Preserve everything else.**

## 3 · Existing CLI problem

`parseArgs()` was a "tiny" parser that:

- Recognized `--fixture <ID>` only.
- **Silently ignored** any other flag (loop had no `else` branch).
- Defaulted to Fixture A when no `--fixture` was provided.

Consequence documented in AgentOps-5d findings §14:
`node scripts/report-regression-local.mjs --help` accidentally
executed Fixture A. Cost was ~$0 that time (dev server was down),
but the same accident with dev server up would have burned an
unintended generation.

Also: `parseArgs()` was called AFTER `assertLocalhost(BASE_URL)`.
Not a large hole in practice, but ordering did not enforce
"no side effects before validation".

## 4 · Existing artifact-list problem

`verdict.md ## Artifacts` line hard-coded the full policy list:

```
- Committed: `.agent/regression_runs/<runId>/{metadata.json,structural_checks.json,verdict.md,quote_integrity_summary.json,network_diagnostics.json}`
```

This is a **policy** list, not a **truth** list. On
`blocked_no_report` runs, the QI wrapper does NOT write
`quote_integrity_summary.json` (5c-integrate failure-handling
design). The verdict.md line was cosmetically incorrect for those
runs.

## 5 · CLI parser design

Rewrote `parseArgs()` as a strict, deterministic function that
returns `{ fixtureId }` on success and calls `process.exit()`
directly on help/error paths. Added `printUsage(stream)` and
`fatalCli(message)` helpers.

Also moved `parseArgs()` call to the very top of `main()` — BEFORE
`assertLocalhost(BASE_URL)`. That guarantees:

- `--help` / `-h` exits BEFORE any I/O side effect.
- Invalid CLI exits 2 BEFORE any side effect too.

## 6 · Help behavior

```
Usage:
  node scripts/report-regression-local.mjs [--fixture A|B]

Options:
  --fixture <id>   Run one supported regression fixture (A, B)
  -h, --help       Show this help and exit
```

Written to `process.stdout`. Exit code `0`.

## 7 · Unknown-flag behavior

Any unknown flag (e.g. `--unknown`, `--foo=bar`) →
`report-regression-local: Unknown flag: <flag>` + usage → exit `2`.
Written to `process.stderr`.

## 8 · Fixture-validation behavior

- `--fixture` with no value → error, exit 2.
- `--fixture Z` (unsupported id) → error, exit 2.
- `--fixture A --fixture B` (conflict) → error, exit 2.
- `--fixture A --fixture A` (same value) → accepted (no conflict).

## 9 · Side-effect prevention

All CLI validation happens **before** `assertLocalhost` /
`mkdir(runDir)` / `chromium.launch()` / `page.goto()` / any API
call. Verified by side-effect audit after all 7 CLI test cases:
no new regression run directory, no dev server started, no browser
launched, no repository files changed except intended
TASK/harness/memo.

## 10 · Artifact-list implementation

Replaced hard-coded artifact string with a small IIFE inside the
verdict.md template that computes the list from `existsSync()`:

```
const written = ["metadata.json", "structural_checks.json", "verdict.md"];
if (existsSync(path.join(runDir, "quote_integrity_summary.json"))) {
  written.push("quote_integrity_summary.json");
}
if (existsSync(path.join(runDir, "network_diagnostics.json"))) {
  written.push("network_diagnostics.json");
}
return written.join(",");
```

Placement: the IIFE evaluates when the verdict.md string template
runs, which is **after** the metadata/structural writes and the
network-diagnostics write. `existsSync` is authoritative at that
moment.

`metadata.artifact_policy.committed` is intentionally NOT modified
— it is a **policy declaration**, not a per-run truth-list. Truth
is in verdict.md. Prior verdict.md files are NOT retroactively
rewritten.

## 11 · Static validation commands

```
node --check scripts/report-regression-local.mjs

node scripts/report-regression-local.mjs --help          # expect: usage, exit 0
node scripts/report-regression-local.mjs -h              # expect: usage, exit 0
node scripts/report-regression-local.mjs --unknown       # expect: error, exit 2
node scripts/report-regression-local.mjs --fixture       # expect: error, exit 2
node scripts/report-regression-local.mjs --fixture Z     # expect: error, exit 2
node scripts/report-regression-local.mjs unexpected-positional  # expect: error, exit 2
node scripts/report-regression-local.mjs --fixture A --fixture B  # expect: error (conflict), exit 2
```

**Explicitly NOT run**: `--fixture A` · `--fixture B` (would
trigger generation).

## 12 · Validation results

- `node --check` → **OK**.
- `--help` → exit **0** · usage on stdout · no side effects.
- `-h` → exit **0** · usage on stdout · no side effects.
- `--unknown` → exit **2** · `Unknown flag: --unknown` · no side
  effects.
- `--fixture` (no value) → exit **2** ·
  `--fixture requires a value (one of: A, B)` · no side effects.
- `--fixture Z` → exit **2** ·
  `Unknown fixture: Z. Supported: A, B` · no side effects.
- `unexpected-positional` → exit **2** ·
  `Unexpected positional argument: unexpected-positional` · no side
  effects.
- `--fixture A --fixture B` → exit **2** ·
  `Conflicting --fixture values: A vs B` · no side effects.

**Side-effect audit after all 7 cases**:

- `.agent/regression_runs/` count: **11 before** → **11 after** (no
  new run dir created).
- Dev server on `localhost:3000`: **down before** → **down after**.
- Git status: only `scripts/report-regression-local.mjs` (modified)
  + `.agent/tasks/2026-07-23_run_04_TASK.md` (untracked). No
  accidental artifacts.

**Artifact-list truth**: verified by code inspection. On a
`blocked_no_report` run, `quote_integrity_summary.json` does not
exist on disk, so the IIFE will NOT list it. On a successful run
all 5 files exist and are listed. Deterministic and honest.

## 13 · Generation / API confirmation

- **No** Playwright launched.
- **No** dev server started.
- **No** Anthropic / OpenAI call.
- **No** `/api/generate-report` or `/api/classify` invocation.
- **No** report.md written · **no** screenshot captured.
- **No** new `.agent/regression_runs/<runId>/` directory created.

## 14 · Files changed

- `scripts/report-regression-local.mjs` (modified · +73 / −15 ·
  strict `parseArgs()` + `printUsage()` + `fatalCli()` helpers +
  parseArgs moved to top of `main()` + verdict.md artifact-list
  IIFE)
- `.agent/tasks/2026-07-23_run_04_TASK.md` (new · TASK)
- `.agent/design_memos/2026-07-23_AgentOps-5d-cosmetic.md` (this
  memo)
- `.agent/run_reports/2026-07-23_run_04_RUN_REPORT.md` (created by
  helper · to be filled + committed after this memo)

## 15 · What was intentionally not changed

- `HARD_LATENCY_MS = 240_000` unchanged.
- `SOFT_LATENCY_MS = 120_000` unchanged.
- No retry behavior added.
- No `src/**` change.
- No API route change.
- No `scripts/quote-integrity-check.mjs` change.
- No `.agent/scripts/**` change (hard rule per AgentOps-2c Q3-Q8).
- No baseline mutation / promotion.
- No prior `.agent/regression_runs/**` mutation.
- No prior `.agent/quote_integrity_runs/**` mutation.
- No pipeline change (`b019786` 起终一致).
- No `package.json` / lockfile / GH Actions / `.env*` /
  `vercel.json` / Codex-Claude config change.
- No prompt / model selection change.
- No promotion of quote integrity to blocking.
- No revert of 5c-integrate QI wrapper or 5d-b-timeout-diagnostics
  additions.
- Existing FIXTURE_TABLE.A + FIXTURE_TABLE.B entries untouched.
- Default-to-Fixture-A contract preserved when no `--fixture`
  argument is passed (used by baseline commits).
- `metadata.artifact_policy.committed` policy declaration unchanged
  (only verdict.md is now truth-based).

## 16 · Risks

- **Behavior change on unknown flags**: any downstream automation
  or muscle-memory command that passes a typo (e.g. `--fixure A`)
  will now exit 2 instead of silently defaulting to Fixture A.
  This is intentional — the whole point of the fix is to fail
  loudly. Not a regression.
- **Behavior change on `--help`**: any downstream tool that
  invoked `--help` expecting generation now exits 0 with no side
  effect. Intentional too — accidental generation from `--help`
  was the observed bug.
- **Prior verdict.md files** still have the old hard-coded artifact
  list. Not retroactively rewritten (per TASK spec).
- **`metadata.artifact_policy.committed`** still lists all 5
  possibly-committed files, even for `blocked_no_report` runs.
  Intentional — policy declaration, not truth-list. Consumers who
  want truth read verdict.md.

## 17 · Recommended next loop

Executor preference (in order):

- **Handoff / pause**: natural checkpoint. Diagnostics landed,
  cosmetic-safety landed, harness has no known open sharp edges. A
  brief pause for human + ChatGPT review is reasonable before
  deciding the next AgentOps arc.
- **AgentOps-5e** — decide whether to fold `quote_integrity_*`
  fields into baseline metadata schema. Separate design memo
  first. $0 inspection loop.
- **AgentOps-5f-promote** — promote quote integrity to blocking.
  Only after (i) B timeout has been observed in the wild long
  enough or (ii) proper retry policy designed. Separate DECISION.
- **Prompt-tune loop** — R1 grammar bridging is the single largest
  QI RED signal. Carefully scoped prompt change + controlled A + B
  validation could eliminate R1 as routine RED. ~$0.10.

Explicit non-recommendations:

- Do NOT rerun any fixture in an ad-hoc loop.
- Do NOT mutate 240 s hard threshold.
- Do NOT introduce retry policy in `/api/generate-report` yet.
- Do NOT revert QI wrapper or diagnostics.
- Do NOT promote QI to blocking without prompt-tune or product-side
  fix for R1.
- Do NOT ingest 20 PDFs · run C/D/E · start G2.1d outside
  dedicated DECISION.

## 18 · Boundaries respected

- No push · no deploy · no manual `vercel deploy`.
- **No generation** happened.
- **No harness generation run** happened.
- **No Playwright** launched.
- **No dev server** started.
- **No LLM / API call** made.
- **No threshold mutation.**
- **No retry behavior added.**
- **No `src/**` change.**
- **No `.agent/scripts/**` change** (hard rule).
- **No `scripts/quote-integrity-check.mjs` change.**
- **No API route change · no prompt / model change.**
- **No baseline mutation / promotion.**
- **No prior `.agent/regression_runs/**` /
  `.agent/quote_integrity_runs/**` mutation.**
- **No pipeline change** (`b019786` 起终一致).
- **No `package.json` / lockfile / `.github/workflows/**` /
  `.env*` / `vercel.json` / Codex-Claude config change.**
- **No uploaded PDFs · no `report.md` · no `*.png` · no full
  report body · no long quote excerpts · no secrets · no auth
  headers · no cookies · no request payloads committed.**
- **No OpenAI API introduced · no LLM judge · no edit-distance.**
- **No production deploy · no C/D/E · no A-E full suite.**
- **`--help` is now safe.**
- **Quote integrity remained telemetry-only.**
- Cost: **$0**.
