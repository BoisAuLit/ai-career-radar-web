#!/usr/bin/env python3
"""Generate the next .agent/decisions/YYYY-MM-DD_run_XX_DECISION.md
from the template.

Local-only, standard-library-only, no side effects beyond writing one file.
Same shape as new_task.py and new_run_report.py; designed to be invoked
after Claude has produced a RUN_REPORT, so a reviewer can fill in the
DECISION.

Usage:
    python .agent/scripts/new_decision.py --task-id 2026-06-28_run_01
    python .agent/scripts/new_decision.py --date 2026-06-28 --run 1

Pre-fills the `based_on_run_report` field with the conventional path
.agent/run_reports/{task_id}_RUN_REPORT.md. Refuses to overwrite an
existing DECISION file. Prints the created file path on stdout (one
line) on success. Never invokes git/npm/vercel/gh/Claude/OpenAI/HTTP
or any external process. Does not commit.
"""
import argparse
import pathlib
import re
import sys

from _common import resolve_task_id

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
TEMPLATE_PATH = REPO_ROOT / ".agent" / "templates" / "decision_template.md"
DECISIONS_DIR = REPO_ROOT / ".agent" / "decisions"


def render(template_text: str, *, task_id: str) -> str:
    """Substitute the DECISION metadata block. Leave the rest untouched."""
    decision_id = f"{task_id}_DECISION"
    run_report_path = f".agent/run_reports/{task_id}_RUN_REPORT.md"
    out = template_text
    out = re.sub(
        r"- \*\*decision_id\*\*: `[^`]+`(?: \(matches the TASK \+ RUN_REPORT\))?",
        f"- **decision_id**: `{decision_id}` (matches the TASK + RUN_REPORT)",
        out,
        count=1,
    )
    out = re.sub(
        r"- \*\*based_on_run_report\*\*: `[^`]+`",
        f"- **based_on_run_report**: `{run_report_path}`",
        out,
        count=1,
    )
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Scaffold the next AgentOps DECISION from the template.",
        epilog="Local-only. Never invokes git, npm, vercel, or any external command.",
    )
    parser.add_argument("--task-id", help="YYYY-MM-DD_run_NN (mutually exclusive with --date/--run)")
    parser.add_argument("--date", help="YYYY-MM-DD (use with --run)")
    parser.add_argument("--run", type=int, metavar="NN", help="Run number 1..99 (use with --date)")
    args = parser.parse_args(argv)

    resolved = resolve_task_id(args)
    if resolved is None:
        return 2
    task_id, _date_str, _run_number = resolved

    if not TEMPLATE_PATH.is_file():
        print(f"error: template not found at {TEMPLATE_PATH}", file=sys.stderr)
        return 2

    target = DECISIONS_DIR / f"{task_id}_DECISION.md"
    if target.exists():
        print(f"error: refuse to overwrite existing {target}", file=sys.stderr)
        return 2

    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    rendered = render(template_text, task_id=task_id)

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(rendered, encoding="utf-8")
    print(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
