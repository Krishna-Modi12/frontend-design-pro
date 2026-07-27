#!/usr/bin/env python3
"""
V12 Pipeline Smoke Test
Validates that SKILL.md contains all 6 event-driven stage markers.

Usage:
  python test_v12_pipeline.py <skill_md_path>

Exit codes:
  0 — all 6 stages found
  1 — one or more stages missing
"""

import sys
import re
from pathlib import Path

# Windows consoles default to cp1252 and cannot encode this script's ✓/✗ glyphs.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass


# ─────────────────────────────────────────────
# Stage marker patterns (case-insensitive)
# ─────────────────────────────────────────────

STAGE_CHECKS = [
    (
        "detect",
        r"(?:##\s*DETECT|###\s*DETECT|##\s*Stage\s*1|—\s*DETECT)",
        "detect stage: ## DETECT, ### DETECT, ## Stage 1, or — DETECT",
    ),
    (
        "classify",
        r"(?:##\s*CLASSIFY|###\s*CLASSIFY|—\s*CLASSIFY)",
        "classify stage: ## CLASSIFY, ### CLASSIFY, or — CLASSIFY",
    ),
    (
        "route",
        r"(?:##\s*ROUTE|###\s*ROUTE|—\s*ROUTE)",
        "route stage: ## ROUTE, ### ROUTE, or — ROUTE",
    ),
    (
        "build",
        r"(?:##\s*BUILD|###\s*BUILD|—\s*BUILD)",
        "build stage: ## BUILD, ### BUILD, or — BUILD",
    ),
    (
        "validate",
        r"(?:##\s*VALIDATE|###\s*VALIDATE|—\s*VALIDATE)",
        "validate stage: ## VALIDATE, ### VALIDATE, or — VALIDATE",
    ),
    (
        "output",
        r"(?:##\s*OUTPUT|###\s*OUTPUT|—\s*OUTPUT)",
        "output stage: ## OUTPUT, ### OUTPUT, or — OUTPUT",
    ),
]

EXTRA_CHECKS = [
    (
        "[json] shortcode",
        r"\[json\]",
        "[json] shortcode present anywhere in file",
    ),
    (
        "MIGRATION FROM v11 section",
        r"MIGRATION FROM v11",
        "MIGRATION FROM v11 section heading present",
    ),
    (
        "DESIGN.md round-trip in build stage",
        r"DESIGN\.md",
        "DESIGN.md mentioned (round-trip reference)",
    ),
]


def check_marker(content: str, pattern: str, flags=re.IGNORECASE) -> bool:
    return bool(re.search(pattern, content, flags))


def run_checks(content: str) -> list[tuple[str, bool, str]]:
    """Return list of (label, passed, hint) for every check."""
    results = []

    for name, pattern, hint in STAGE_CHECKS:
        passed = check_marker(content, pattern)
        results.append((f"Stage: {name.upper()}", passed, hint))

    for name, pattern, hint in EXTRA_CHECKS:
        passed = check_marker(content, pattern)
        results.append((name, passed, hint))

    return results


def main() -> int:
    args = sys.argv[1:]

    if args and args[0] in ("-h", "--help"):
        print(__doc__)
        return 0

    args = [a for a in args if a not in ("--check", "--dry-run")]
    skill_md_path = Path(args[0]) if args else Path(__file__).resolve().parent.parent / "AGENT_SYSTEM_PROMPT.md"
    if not skill_md_path.exists():
        print(f"ERROR: File not found: {skill_md_path}")
        return 1

    content = skill_md_path.read_text(encoding="utf-8")

    print()
    print("=" * 60)
    print("V12 Pipeline Smoke Test")
    print("=" * 60)
    print(f"File : {skill_md_path}")
    print("-" * 60)

    results = run_checks(content)

    all_stage_passed = True
    any_failed = False

    for label, passed, hint in results:
        status = "PASS" if passed else "FAIL"
        mark = "✓" if passed else "✗"
        print(f"  {mark} [{status}] {label}")
        if not passed:
            print(f"         Expected: {hint}")
            any_failed = True
        # Track whether all 6 stage markers passed
        if label.startswith("Stage:") and not passed:
            all_stage_passed = False

    print("-" * 60)

    stage_results = [(l, p) for l, p, _ in results if l.startswith("Stage:")]
    stages_found = sum(1 for _, p in stage_results if p)
    stages_total = len(stage_results)
    extra_results = [(l, p) for l, p, _ in results if not l.startswith("Stage:")]
    extras_found = sum(1 for _, p in extra_results if p)
    extras_total = len(extra_results)

    print(f"  Stages : {stages_found}/{stages_total} found")
    print(f"  Extras : {extras_found}/{extras_total} found")

    if not any_failed:
        print("\n  ✓ ALL CHECKS PASSED — v12 pipeline structure is complete.")
    elif not all_stage_passed:
        missing = stages_total - stages_found
        print(f"\n  ✗ FAILED — {missing} stage marker(s) missing from SKILL.md.")
    else:
        print("\n  ~ Stage markers OK, but some extra checks failed.")

    print("=" * 60)
    print()

    # Exit 0 only if all 6 stage markers are present
    return 0 if all_stage_passed else 1


if __name__ == "__main__":
    sys.exit(main())
