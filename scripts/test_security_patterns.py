#!/usr/bin/env python3
"""
Proof that check_security.py's three patterns actually fire — and that they
leave real, common code alone. Same reasoning as scripts/figure_pattern_test.py:
a check that has never been run against a positive case is a check that has
never been proven to work, and this repo's own history (SLOP-04,
docs/CHANGELOG.md) is the concrete example of what shipping one unproven
looks like.

Usage: python scripts/test_security_patterns.py
"""

import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_security as cs  # noqa: E402

POSITIVE = [
    ("SEC-02", 'const href = "javascript:alert(1)";'),
    ("SEC-02", "window.location = 'javascript:void(0)'"),
    ("SEC-03", 'window.opener.postMessage(payload, "*");'),
    ("SEC-03", "iframeRef.current.contentWindow.postMessage(data, '*')"),
    ("SEC-04", "el.innerHTML = userComment;"),
    ("SEC-04", "container.innerHTML = renderMarkdown(text)"),
]

NEGATIVE = [
    # Real, common, safe code that must NOT trigger any rule.
    'const href = "https://example.com";',
    'window.postMessage(payload, "https://trusted-origin.example.com");',
    "el.textContent = userComment;",
    '<style dangerouslySetInnerHTML={{ __html: tokenStyles }} />',
    "// a hallucinated dangerouslySetInnerHTML or onClick string becomes an execution path",
]


def run_source(text: str):
    findings = []
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / "fixture.tsx"
        p.write_text(text, encoding="utf-8")
        # scan_source_file resolves paths relative to ROOT for reporting only;
        # point it at a real temp file and swap ROOT so relative_to doesn't throw.
        original_root = cs.ROOT
        cs.ROOT = Path(d)
        try:
            cs.scan_source_file(p, findings)
        finally:
            cs.ROOT = original_root
    return findings


def main() -> int:
    failures = 0

    for rule, snippet in POSITIVE:
        findings = run_source(snippet)
        hit = any(f.rule == rule for f in findings)
        status = "✓" if hit else "✗"
        if not hit:
            failures += 1
        print(f"  {status} {rule} fires on: {snippet!r}")

    for snippet in NEGATIVE:
        findings = run_source(snippet)
        clean = len(findings) == 0
        status = "✓" if clean else "✗"
        if not clean:
            failures += 1
            print(f"  {status} false positive on: {snippet!r} -> {findings}")
        else:
            print(f"  {status} silent on: {snippet!r}")

    print(f"\n[SECURITY PATTERN PROOF] {len(POSITIVE) + len(NEGATIVE) - failures}/{len(POSITIVE) + len(NEGATIVE)} passed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
