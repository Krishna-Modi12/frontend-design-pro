#!/usr/bin/env python3
"""Proof that Gate 11's figure patterns read the prose forms people write.

Gate 11 recomputes every published figure from the filesystem, but it can only
correct a claim it recognises as one. Three times now a figure has gone stale in
a form no pattern matched, and the gate reported the file clean:

  * `35 regex` / `constraints` split over a hard wrap — a public triage document
    sat seven wrong for as long as the gate had existed.
  * `SKILL.md is 2,018 tokens` — docs prose backticks a filename and launch
    prose does not, so all three tracked launch documents shipped the superseded
    router size while the gate called them clean.
  * `5,665 to 7,266 tokens`, and the same band split across two sentences as
    "the heaviest … the lightest …" — neither is a dashed pair, so neither was
    a range as far as the gate was concerned.

Each of those was a *detection* failure, not a data failure, and none of them
was visible in a green run. This file is what makes them visible: fixed prose
fixtures judged against a synthetic truth table, asserting in both directions.

The negative cases matter as much as the positive ones. A pattern widened until
it matches everything is not a stricter gate, it is a broken one — the anchor
here once reached out of `skills/{id}/SKILL.md` and read the per-skill router
range as the registry size, which would have failed two correct tables.

Truth is synthetic and far apart on purpose. A test pinned to today's real
figures would fail on every release that grows the pack, and would be deleted
the first time it did.

Run: python scripts/figure_pattern_test.py   (or `npm run figures:test`)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import check_figures as cf  # noqa: E402

# Synthetic, and deliberately far apart: `_expect_range` classifies a range by
# which known low endpoint it sits nearest to, so overlapping fixtures would
# test the classifier's tie-breaking rather than the patterns.
TRUTH = {
    "registry_tokens": 1111,
    "router_low": 100, "router_high": 200,
    "dep_low": 500, "dep_high": 600,
    "band_low": 2222, "band_high": 3333,
    "skills": 19, "reference_files": 101, "release_gates": 11,
    "core_files": 8, "example_files": 55, "anti_examples": 10,
    "test_files": 45, "parser_constraints": 17, "regex_constraints": 42,
    "ci_constraints": 59, "reference_depth_tokens": 349445,
}

# (figure id, prose, must_flag, why)
CASES = [
    # ── REGISTRY ────────────────────────────────────────────────────────────
    ("REGISTRY", "SKILL.md is 1,000 tokens — identity and a routing table.",
     True, "bare filename: how launch copy writes it, and the form that shipped stale"),
    ("REGISTRY", "2/ SKILL.md is 1,000 tokens. That's all that's always loaded.",
     True, "bare filename with the qualifier in the *next* sentence"),
    ("REGISTRY", "The `SKILL.md` registry is 1,000 tokens.",
     True, "backticked: docs prose, the only form the pattern used to read"),
    ("REGISTRY", "the registry is 1,000 tokens",
     True, "anchored on the word rather than the filename"),
    ("REGISTRY", "SKILL.md is 1,111 tokens.",
     False, "correct value — a gate that flags the truth is noise"),
    ("REGISTRY", "| `skills/{id}/SKILL.md` | One skill file | 843–1,718 tokens |",
     False, "path-qualified: this row states the PER-SKILL range, not the registry"),
    ("REGISTRY", "Gate 1 asserts SKILL.md ≤6,000 tokens.",
     False, "a bound the gate enforces is not a measurement of the file"),
    ("REGISTRY", "The two skills grew SKILL.md from 1,895 to 1,000 tokens.",
     False, "narrates a change; the endpoint is history, not the current size"),

    # ── RANGE ───────────────────────────────────────────────────────────────
    ("RANGE", "Measured per-request load: **1,000 to 9,000 tokens.**",
     True, "written out in words — the form three launch documents used"),
    ("RANGE", "A request loads 1,000–9,000 tokens.",
     True, "dashed pair"),
    ("RANGE", "A request loads 2,222–3,333 tokens.",
     False, "correct band"),
    ("RANGE", "The two skills took the registry from 1,000 to 9,000.",
     False, "`from A to B` narrates a change and must not read as a band"),

    # ── BAND-HIGH / BAND-LOW ────────────────────────────────────────────────
    ("BAND-HIGH", "Measured, not estimated: the heaviest possible request loads 9,999 tokens.",
     True, "the band's top edge, stated alone"),
    ("BAND-HIGH", "Heaviest possible request: 9,999 tokens.",
     True, "sentence-initial capital — the pattern must not be case-bound"),
    ("BAND-HIGH", "The heaviest possible request loads 3,333 tokens.",
     False, "correct top edge"),
    ("BAND-LOW", "The lightest loads 9,999. A gate fails the build above 8,000.",
     True, "bottom edge with the unit carried by the previous sentence"),
    ("BAND-LOW", "The lightest loads 2,222.",
     False, "correct bottom edge"),

    # ── GATES ───────────────────────────────────────────────────────────────
    ("GATES", "Verified by 9 release-blocking gates.",
     True, "plain form"),
    ("GATES", "Verified by *9* release-blocking gates.",
     True, "emphasis between the number and its noun — the house style writes this"),
    ("GATES", "Verified by **11** release-blocking gates.",
     False, "correct count, emphasised"),

    # ── CONSTRAINT HALVES ───────────────────────────────────────────────────
    # A section heading inverts the order the sentence forms assume: the noun
    # comes first and the count sits in brackets after it. `core/validate-
    # checklist.md` carried "## Regex-enforced (36)" against a real 42, two
    # lines above a total that spelled 42 correctly, and the gate read 0 drift.
    ("CONSTRAINTS-REGEX", "## Regex-enforced (36)",
     True, "heading form: noun first, count bracketed — the shape that shipped stale"),
    ("CONSTRAINTS-REGEX", "## Regex-enforced (42)",
     False, "correct count in the heading form"),
    ("CONSTRAINTS-REGEX", "the 36 regex constraints run over every reference",
     True, "sentence form, still read"),
    ("CONSTRAINTS-AST", "## Parser-enforced (AST — 12)",
     True, "heading form carrying a qualifier between the bracket and the count"),
    ("CONSTRAINTS-AST", "## Parser-enforced (AST — 17)",
     False, "correct count behind a qualifier"),
    ("CONSTRAINTS-AST", "Gate 5 runs 42 regex constraints, not AST ones.",
     False, "the regex count is not the AST count — each half owns its own noun"),
]


def flags(figure_id: str, text: str) -> bool:
    """True when `figure_id` reports drift on `text`, by the shipped logic."""
    fig = next((f for f in cf.FIGURES if f.id == figure_id), None)
    if fig is None:
        raise SystemExit(f"no figure named {figure_id!r} — was it renamed?")
    return any(cf._drift(fig, text, m, TRUTH) for m in re.finditer(fig.pattern, text))


def main() -> int:
    failures = []
    for figure_id, text, must_flag, why in CASES:
        got = flags(figure_id, text)
        if got != must_flag:
            verb = "missed" if must_flag else "false-flagged"
            failures.append(f"  {figure_id} {verb}: {why}\n      {text}")

    print(f"[FIGURE-PATTERNS] {len(CASES)} prose fixtures over "
          f"{len({c[0] for c in CASES})} figures")
    if failures:
        print(f"\n[FIGURE-PATTERNS] {len(failures)} failure(s):\n")
        print("\n".join(failures))
        return 1
    print("[FIGURE-PATTERNS] pass — every form caught, every non-claim spared")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
