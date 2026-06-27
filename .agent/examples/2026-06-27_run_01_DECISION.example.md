# DECISION · P1.7 premium detail pass

> Example DECISION — paired with the matching TASK + RUN_REPORT examples.
> Written by ChatGPT after reading the RUN_REPORT. In later AgentOps phases,
> the OpenAI API reviewer would produce the same structure automatically.

## Metadata

- **decision_id**: `2026-06-27_run_01`
- **based_on_run_report**: `.agent/run_reports/2026-06-27_run_01_RUN_REPORT.md`

## Verdict

`open_next_task`

## Reasoning summary

RUN_REPORT shows a clean execution: 3 commits on a branch, 7 files changed
within the allowed list, build green, all 15 screenshots captured, no
forbidden or red-zone files touched. The visual changes match the
P1.7 objective and the new `/sample-report` page is correctly labelled as
fictional. Risk surface is small and the executor's two flagged risks are
both low severity and self-contained. Approving and queuing a small
follow-up to capture the new baseline screenshots so future visual
regressions are detectable.

## Risks found

- Shared `SiteChrome.tsx` is now a 4-page blast-radius file. Severity: low.
  Mitigation: any future TASK that edits it should require an explicit
  screenshot diff across all 4 pages.
- The new `/sample-report` page is reachable from the homepage hero. Make
  sure the executive summary copy never claims any live numbers — current
  copy is correct ("fictional sample"). Severity: low.

## Red-zone flags

`none`

## Required fixes

`n/a` — verdict is `open_next_task`, not `request_changes`.

## Next task prompt for Claude

```markdown
# TASK · P1.7b · baseline screenshot capture + visual diff harness

## Metadata
- **task_id**: `2026-06-27_run_02`
- **date**: `2026-06-27`
- **run_number**: `02`
- **title**: Capture the post-P1.7 baseline + wire `npm run screenshot:diff` against it.
- **repo**: `/Users/bohaoli/Desktop/ai-career-radar-web`

## Objective
Save the 15 screenshots from the previous run as the authoritative baseline
under `temporary/screenshots/baseline/`, and add an `npm run screenshot:diff`
script that compares a fresh capture to that baseline and exits non-zero on
visible regressions.

## Allowed files
- `scripts/screenshot.mjs`
- `scripts/screenshot-diff.mjs` (new)
- `package.json` (npm script add — non-dep change, see policy §4)

## Forbidden files
- Everything under `src/` (no app code changes this run)
- `.github/workflows/*`
- All other red-zone files per policy §4

## Risk level
`yellow`

## Constraints
- No new dependencies (use existing `playwright`).
- Pixel-diff threshold: 0.1% of pixels per page (configurable via env var).
- Baseline is committed; diff script is committed; CI integration is out of scope.

## Acceptance criteria
- [ ] `temporary/screenshots/baseline/{desktop,tablet,mobile}/` populated with the 15 P1.7 screenshots.
- [ ] `npm run screenshot:diff` exits 0 immediately after baseline is set.
- [ ] `npm run build` still passes.
- [ ] `package.json` change is npm-script-only (no `dependencies`/`devDependencies` edit).

## Validation commands
```bash
cd /Users/bohaoli/Desktop/ai-career-radar-web
git status
npm run build
npm run screenshot
npm run screenshot:diff
git diff -- package.json   # must show only `"scripts"` block touched
git status
```

## Expected output
- Diff output: `0 regressions detected across 15 pages`.

## Rollback plan
- Branch `agent/2026-06-27_run_02`; discard with `git branch -D`.

## Requires human approval
`no`

## Max runtime minutes
`45`

## Stop conditions
- Stop if `package.json` diff touches anything outside `"scripts"`.
- Stop if any red-zone file appears in `git status`.
- Stop if `npm run build` fails.
```

## Human approval needed

`no`

> Yellow task, no red-zone files touched, build pass, screenshots clean.
> Proceed to the queued follow-up task above. Human can intervene at any
> time but no explicit sign-off is required.
