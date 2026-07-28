#!/usr/bin/env python3
"""
Pipeline Smoke Test — Gate 6.

Validates AGENT_SYSTEM_PROMPT.md (or any file passed as argv[1]) against:
  · 6 pipeline stage markers (DETECT → CLASSIFY → ROUTE → BUILD → VALIDATE → OUTPUT)
  · 5 architecture checks (registry routing, core deps, anti-slop wall, [json], DESIGN.md)
  · 3 path checks (cited paths resolve · no pre-registry prefixes · no bare reference names)
  · 2 envelope checks (the documented [json] example, and the schema's own examples,
    both validated against rules/v12-envelope.schema.json)

Usage:
  python test_v12_pipeline.py [path]

Exit codes:
  0 — every check passed
  1 — one or more checks failed (all checks are blocking)

Note: the filename still says v12. Renaming it would touch ci.yml and
build_release.py; see the Known gaps section of docs/ARCHITECTURE.md.
"""

import json
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

# Architecture checks. These replaced a "MIGRATION FROM v11" heading requirement,
# which was obsolete by v13 and had been failing silently ever since.
EXTRA_CHECKS = [
    (
        "[json] shortcode",
        r"\[json\]",
        "[json] shortcode present anywhere in file",
    ),
    (
        "DESIGN.md round-trip",
        r"DESIGN\.md",
        "DESIGN.md mentioned (round-trip reference)",
    ),
    (
        "registry loading protocol",
        r"skills/\{?id\}?/SKILL\.md|registry",
        "describes registry routing to skills/{id}/SKILL.md",
    ),
    (
        "core dependency loading",
        r"core/[\w-]+\.md",
        "cites at least one core/ dependency",
    ),
    (
        "anti-slop wall",
        r"anti-slop",
        "anti-slop wall present",
    ),
]

# Paths the prompt cites must exist. These are the checks that would have caught
# the 28 dead paths the pre-v13 prompt carried for three majors: the stage-marker
# headings stayed valid while the file's contents rotted underneath them.
#
# Three checks, because the rot took three forms and a single existence test on
# `skills/…`-prefixed paths catches none of them:
#   1. rooted paths that do not resolve
#   2. v12 dead prefixes — `references/…` and `_meta/…` are pre-registry layout
#   3. bare reference filenames — `design-patterns.md` with no directory is
#      unroutable now that every reference lives at skills/{id}/references/
CITED_PATH_RE = re.compile(r"`((?:skills|core|rules|evals|scripts|docs)/[\w./{}-]+\.\w+)`")
DEAD_PREFIX_RE = re.compile(r"`((?:references|_meta)/[\w./-]+\.\w+)`")
BARE_FILE_RE = re.compile(r"`([\w-]+\.(?:md|json))`")
# Placeholder segments are illustrative, not real paths.
PLACEHOLDER_RE = re.compile(r"\{[\w-]+\}")
# Repo-root files and user-supplied inputs may legitimately be cited bare.
BARE_ALLOWED = {
    "SKILL.md", "README.md", "LICENSE", "AGENT_SYSTEM_PROMPT.md", "CHANGELOG.md",
    "metadata.json", "package.json", "tsconfig.json",
    "DESIGN.md",  # user-supplied token file, not shipped
}


def _validate(node, schema, path="") -> list[str]:
    """Minimal JSON Schema validator — the subset rules/ actually uses.

    Deliberately stdlib-only: this project's Python scripts have no third-party
    dependencies, and `jsonschema` is not worth adding for one file. Covers
    type · required · additionalProperties · properties · items · enum · const ·
    pattern · minimum · maximum · minLength.
    """
    errs = []
    at = path or "<root>"
    t = schema.get("type")
    TYPES = {"object": dict, "array": list, "string": str, "boolean": bool, "integer": int}
    if t in TYPES:
        # bool is a subclass of int in Python; keep them distinct.
        if t == "integer" and isinstance(node, bool):
            return [f"{at}: expected integer, got boolean"]
        if not isinstance(node, TYPES[t]):
            return [f"{at}: expected {t}, got {type(node).__name__}"]
    if "const" in schema and node != schema["const"]:
        errs.append(f"{at}: expected const {schema['const']!r}, got {node!r}")
    if "enum" in schema and node not in schema["enum"]:
        errs.append(f"{at}: {node!r} not in enum")
    if isinstance(node, str):
        if "pattern" in schema and not re.search(schema["pattern"], node):
            errs.append(f"{at}: {node!r} does not match {schema['pattern']}")
        if "minLength" in schema and len(node) < schema["minLength"]:
            errs.append(f"{at}: shorter than minLength {schema['minLength']}")
    if isinstance(node, int) and not isinstance(node, bool):
        if "minimum" in schema and node < schema["minimum"]:
            errs.append(f"{at}: {node} < minimum {schema['minimum']}")
        if "maximum" in schema and node > schema["maximum"]:
            errs.append(f"{at}: {node} > maximum {schema['maximum']}")
    if isinstance(node, dict):
        props = schema.get("properties", {})
        for k in schema.get("required", []):
            if k not in node:
                errs.append(f"{at}: missing required key {k!r}")
        if schema.get("additionalProperties") is False:
            for k in node:
                if k not in props:
                    errs.append(f"{at}: additional property {k!r} not allowed")
        for k, v in node.items():
            if k in props:
                errs += _validate(v, props[k], f"{path}/{k}" if path else k)
    if isinstance(node, list) and "items" in schema:
        for i, item in enumerate(node):
            errs += _validate(item, schema["items"], f"{path}[{i}]")
    return errs


def check_envelope(content: str, root: Path) -> list[tuple[str, bool, str]]:
    """Validate the documented [json] envelope against the schema it cites.

    Nothing checked this, which is why the example drifted from the schema twice:
    once omitting a required key, once adding a forbidden one. Both the prompt's
    example and the schema's own `examples` are validated here.
    """
    rows = []
    schema_path = root / "rules/v12-envelope.schema.json"
    if not schema_path.exists():
        return [("Envelope schema present", False, f"missing {schema_path.name}")]
    schema = json.loads(schema_path.read_text(encoding="utf-8"))

    blocks = re.findall(r"```json\n(.*?)```", content, re.S)
    if not blocks:
        rows.append(("Envelope example present", False, "no ```json block in the prompt"))
        return rows
    try:
        example = json.loads(blocks[0])
    except json.JSONDecodeError as e:
        return [("Envelope example parses", False, f"invalid JSON: {e}")]

    errs = _validate(example, schema)
    rows.append((
        "Envelope example validates against schema",
        not errs,
        "; ".join(errs[:4]) + (f" (+{len(errs) - 4} more)" if len(errs) > 4 else "")
        if errs else "prompt's [json] envelope satisfies rules/v12-envelope.schema.json",
    ))

    self_errs = []
    for i, ex in enumerate(schema.get("examples", [])):
        self_errs += [f"examples[{i}]{e}" for e in _validate(ex, schema)]
    rows.append((
        "Schema's own examples validate",
        not self_errs,
        "; ".join(self_errs[:4]) + (f" (+{len(self_errs) - 4} more)" if len(self_errs) > 4 else "")
        if self_errs else f"{len(schema.get('examples', []))} embedded example(s) self-consistent",
    ))
    return rows


def check_cited_paths(content: str, root: Path) -> list[tuple[str, bool, str]]:
    """Three blocking rows: rooted paths resolve, no dead prefixes, no bare refs."""
    rows = []

    cited = sorted(set(CITED_PATH_RE.findall(content)))
    dead = [r for r in cited
            if not PLACEHOLDER_RE.search(r) and not (root / r).exists()]
    rows.append((
        f"Cited paths resolve ({len(cited)} cited)",
        not dead,
        f"dead path(s): {', '.join(dead)}" if dead else "every rooted path exists on disk",
    ))

    stale = sorted(set(DEAD_PREFIX_RE.findall(content)))
    rows.append((
        "No pre-registry path prefixes",
        not stale,
        f"references/ and _meta/ are v12 layout; found: {', '.join(stale[:6])}"
        f"{f' (+{len(stale) - 6} more)' if len(stale) > 6 else ''}"
        if stale else "no references/ or _meta/ prefixes",
    ))

    bare = sorted({b for b in BARE_FILE_RE.findall(content)
                   if b not in BARE_ALLOWED and not (root / b).exists()})
    rows.append((
        "No bare reference filenames",
        not bare,
        f"unroutable without skills/{{id}}/references/: {', '.join(bare[:8])}"
        f"{f' (+{len(bare) - 8} more)' if len(bare) > 8 else ''}"
        if bare else "no unrooted reference citations",
    ))

    return rows


def check_marker(content: str, pattern: str, flags=re.IGNORECASE) -> bool:
    return bool(re.search(pattern, content, flags))


def run_checks(content: str, root: Path) -> list[tuple[str, bool, str]]:
    """Return list of (label, passed, hint) for every check."""
    results = []

    for name, pattern, hint in STAGE_CHECKS:
        passed = check_marker(content, pattern)
        results.append((f"Stage: {name.upper()}", passed, hint))

    for name, pattern, hint in EXTRA_CHECKS:
        passed = check_marker(content, pattern)
        results.append((name, passed, hint))

    results.extend(check_cited_paths(content, root))
    results.extend(check_envelope(content, root))

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
    print("Pipeline Smoke Test — stage markers, architecture, cited paths")
    print("=" * 60)
    print(f"File : {skill_md_path}")
    print("-" * 60)

    results = run_checks(content, skill_md_path.resolve().parent)

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

    total_found = sum(1 for _, p, _ in results if p)
    total = len(results)

    print(f"  Stages : {stages_found}/{stages_total} found")
    print(f"  Extras : {extras_found}/{extras_total} found")
    # Machine-readable summary so callers report the real score instead of a
    # hardcoded label. build_release.py parses this line.
    print(f"  RESULT: {total_found}/{total} checks passed")

    if not any_failed:
        print("\n  ✓ ALL CHECKS PASSED — pipeline structure and cited paths are valid.")
    elif not all_stage_passed:
        missing = stages_total - stages_found
        print(f"\n  ✗ FAILED — {missing} stage marker(s) missing from {skill_md_path.name}.")
    else:
        print(f"\n  ✗ FAILED — {total - total_found} check(s) failed.")

    print("=" * 60)
    print()

    # Every check is blocking. Previously only the six stage markers gated the
    # exit code, so architecture and path rot could not fail the build.
    return 0 if not any_failed else 1


if __name__ == "__main__":
    sys.exit(main())
