#!/usr/bin/env python3
"""
Frontend Design Pro — Security scan

The gap this closes
--------------------
`docs/AUDIT.md` (2026-08-10) found a real stored-XSS bug in shipped reference
prose — unescaped `<` in `JSON.stringify`'d JSON-LD, `skills/platform/references/seo.md`
— by manual, one-time LLM audit. It was fixed as a prose edit. No rule was ever
added to catch that class of bug again, and no `SEC-*` category exists anywhere
in `scripts/test_constraints.py` or `scripts/parser_constraints.js`.

This is that missing check, shipped deliberately OUTSIDE `CONSTRAINTS` and the
`ci_constraints: 60` figure the release gates track: adding entries there means
recomputing that count across ~18 documents that cite it (README, ARCHITECTURE,
CHANGELOG, every per-agent setup doc, ...), which is disproportionate to what
four narrow, high-confidence patterns are worth on their own. It runs as its
own check instead — same shape as `tools/screenshots/visual-regression.mjs`:
real, gated, verifiable, and honest about not being one of the numbered 60.

What it checks, and what it deliberately does not
---------------------------------------------------
Three literal, low-ambiguity patterns:

  SEC-02  a `javascript:` URL scheme in a string literal
  SEC-03  postMessage(..., "*") — wildcard target origin
  SEC-04  raw `.innerHTML =` assignment (vanilla DOM, not JSX)

A fourth was attempted and dropped: `dangerouslySetInnerHTML` without a
nearby `DOMPurify.sanitize`/`sanitizeHtml` call. Running it against this
repo's own corpus produced 6 findings, and every one was a false positive —
`home/app/page.tsx` injects build-time-generated CSS text into a `<style>`
tag (no sanitizer call needed; nothing user-controlled ever reaches it), and
`skills/ai-ui-generation/examples/good-registry-renderer.tsx` only mentions
the API name inside a comment *warning* about it, which a naive substring
match cannot distinguish from a real JSX attribute. The AUDIT.md bug this
was meant to generalize from was fixed by escaping `<` before interpolating
into a JSON-LD `<script>` tag — a mitigation this pattern would never
recognize either, since it only ever looks for a sanitizer-library call.
Whether a `dangerouslySetInnerHTML` value is trusted, static, and
build-time-generated (safe) or user-controlled (not) is exactly the kind of
judgment a static regex cannot make — the same class of limitation that
kept 4 WCAG 2.2 SCs out of `test_constraints.py` this pass (see
docs/CAPABILITY_MATRIX.md, docs/RESEARCH.md). Left as a human-review item
rather than shipped as a rule that would be noisy from day one.

Anti-example files (`bad-*.tsx`) and fenced code blocks that teach the
anti-pattern (preceded by a heading/line containing "bad", "don't", or
"insecure") are skipped — flagging them would invert the lesson, the same
reasoning `check_references.py` (Gate 10) already applies.

Usage:
  python scripts/check_security.py            # skills/ + core/ + demo/ + home/
  python scripts/check_security.py --json
  python scripts/check_security.py <path>      # one file or directory
"""

import json
import re
import sys
from pathlib import Path
from typing import List, NamedTuple

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

ROOT = Path(__file__).resolve().parent.parent

SOURCE_GLOBS = ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"]
SOURCE_DIRS = ["skills", "core", "demo", "home", "tools"]
EXCLUDE_DIR_PARTS = {"node_modules", ".next", "dist", "baselines", "__pycache__"}

JS_URL = re.compile(r"""["'`]\s*javascript:""", re.IGNORECASE)
POSTMESSAGE_WILDCARD = re.compile(r"""\.postMessage\([^)]*,\s*["']\*["']""")
RAW_INNERHTML = re.compile(r"\.innerHTML\s*=(?!=)")

ANTI_EXAMPLE_HEADING = re.compile(r"\b(bad|don'?t|insecure|wrong|vulnerable)\b", re.IGNORECASE)


class Finding(NamedTuple):
    rule: str
    path: str
    line: int
    detail: str


def is_anti_example(path: Path) -> bool:
    return path.name.startswith("bad-")


def scan_text(text: str, rule: str, pattern: re.Pattern, path: str, detail: str, findings: List[Finding]) -> None:
    for i, line in enumerate(text.splitlines(), start=1):
        if pattern.search(line):
            findings.append(Finding(rule, path, i, detail))


def scan_source_file(path: Path, findings: List[Finding]) -> None:
    if is_anti_example(path):
        return
    text = path.read_text(encoding="utf-8", errors="ignore")
    rel = str(path.relative_to(ROOT)).replace("\\", "/")

    scan_text(text, "SEC-02", JS_URL, rel, "javascript: URL scheme in a string literal", findings)
    scan_text(text, "SEC-03", POSTMESSAGE_WILDCARD, rel, 'postMessage(..., "*") — wildcard target origin', findings)
    scan_text(text, "SEC-04", RAW_INNERHTML, rel, "raw .innerHTML assignment — prefer textContent or a sanitized setter", findings)


FENCE = re.compile(r"^```(?:tsx|jsx|ts|js)\s*$", re.MULTILINE)


def scan_markdown_file(path: Path, findings: List[Finding]) -> None:
    text = path.read_text(encoding="utf-8", errors="ignore")
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    lines = text.splitlines()

    in_block = False
    block_start = 0
    block_lines: List[str] = []
    for i, line in enumerate(lines):
        if re.match(r"^```(tsx|jsx|ts|js)\s*$", line):
            if not in_block:
                in_block = True
                block_start = i
                block_lines = []
            else:
                in_block = False
                preceding = "\n".join(lines[max(0, block_start - 3):block_start])
                if not ANTI_EXAMPLE_HEADING.search(preceding):
                    offset = block_start + 1
                    for j, bl in enumerate(block_lines):
                        if JS_URL.search(bl):
                            findings.append(Finding("SEC-02", rel, offset + j, "javascript: URL scheme in a string literal"))
                        if POSTMESSAGE_WILDCARD.search(bl):
                            findings.append(Finding("SEC-03", rel, offset + j, 'postMessage(..., "*") — wildcard target origin'))
                        if RAW_INNERHTML.search(bl):
                            findings.append(Finding("SEC-04", rel, offset + j, "raw .innerHTML assignment"))
            continue
        if in_block:
            block_lines.append(line)


def iter_files() -> List[Path]:
    files: List[Path] = []
    for d in SOURCE_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for glob in SOURCE_GLOBS:
            for p in base.glob(glob):
                if EXCLUDE_DIR_PARTS.intersection(p.parts):
                    continue
                files.append(p)
        for p in base.glob("**/*.md"):
            if EXCLUDE_DIR_PARTS.intersection(p.parts):
                continue
            files.append(p)
    return sorted(set(files))


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv

    if args:
        target = ROOT / args[0]
        targets = [target] if target.is_file() else [
            p for p in target.rglob("*")
            if p.suffix in (".tsx", ".ts", ".jsx", ".js", ".md") and not EXCLUDE_DIR_PARTS.intersection(p.parts)
        ]
    else:
        targets = iter_files()

    findings: List[Finding] = []
    for path in targets:
        if path.suffix == ".md":
            scan_markdown_file(path, findings)
        else:
            scan_source_file(path, findings)

    if as_json:
        print(json.dumps([f._asdict() for f in findings], indent=2))
        return 1 if findings else 0

    if not findings:
        print(f"[SECURITY] 0 finding(s) · {len(targets)} files scanned")
        return 0

    print(f"[SECURITY] {len(findings)} finding(s) across {len({f.path for f in findings})} file(s):\n")
    for f in findings:
        print(f"  {f.rule}  {f.path}:{f.line}")
        print(f"          {f.detail}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
