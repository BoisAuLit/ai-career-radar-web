#!/usr/bin/env python3
"""Generate the next .agent/run_reports/YYYY-MM-DD_run_XX_RUN_REPORT.md
from the template.

Local-only, standard-library-only, no side effects beyond writing one file.
Same shape as new_task.py; designed to be invoked at the end of a TASK run
to scaffold the matching RUN_REPORT.

Usage:
    python .agent/scripts/new_run_report.py --task-id 2026-06-28_run_01
    python .agent/scripts/new_run_report.py --date 2026-06-28 --run 1

Refuses to overwrite an existing RUN_REPORT file. Prints the created file
path on stdout (one line) on success. Never invokes git/npm/vercel/gh/
Claude/OpenAI/HTTP or any external process. Does not commit.
"""
import argparse
import pathlib
import re
import sys

from _common import resolve_task_id

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
TEMPLATE_PATH = REPO_ROOT / ".agent" / "templates" / "run_report_template.md"
REPORTS_DIR = REPO_ROOT / ".agent" / "run_reports"


def render(template_text: str, *, task_id: str, date: str, run_number: int) -> str:
    """Substitute the RUN_REPORT metadata block. Leave the rest untouched."""
    out = template_text
    out = re.sub(
        r"- \*\*task_id\*\*: `[^`]+`(?: \(must match the TASK file\))?",
        f"- **task_id**: `{task_id}` (must match the TASK file)",
        out,
        count=1,
    )
    out = re.sub(r"- \*\*date\*\*: `[^`]+`", f"- **date**: `{date}`", out, count=1)
    out = re.sub(
        r"- \*\*run_number\*\*: `[^`]+`",
        f"- **run_number**: `{run_number:02d}`",
        out,
        count=1,
    )
    out = re.sub(
        r"- \*\*branch\*\*: `[^`]+`(?: \(or the actual branch if different — say so\))?",
        f"- **branch**: `agent/{task_id}` (or the actual branch if different — say so)",
        out,
        count=1,
    )
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Scaffold the next AgentOps RUN_REPORT from the template.",
        epilog="Local-only. Never invokes git, npm, vercel, or any external command.",
    )
    parser.add_argument("--task-id", help="YYYY-MM-DD_run_NN (mutually exclusive with --date/--run)")
    parser.add_argument("--date", help="YYYY-MM-DD (use with --run)")
    parser.add_argument("--run", type=int, metavar="NN", help="Run number 1..99 (use with --date)")
    args = parser.parse_args(argv)

    resolved = resolve_task_id(args)
    if resolved is None:
        return 2
    task_id, date_str, run_number = resolved

    if not TEMPLATE_PATH.is_file():
        print(f"error: template not found at {TEMPLATE_PATH}", file=sys.stderr)
        return 2

    target = REPORTS_DIR / f"{task_id}_RUN_REPORT.md"
    if target.exists():
        print(f"error: refuse to overwrite existing {target}", file=sys.stderr)
        return 2

    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    rendered = render(template_text, task_id=task_id, date=date_str, run_number=run_number)

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(rendered, encoding="utf-8")
    print(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
