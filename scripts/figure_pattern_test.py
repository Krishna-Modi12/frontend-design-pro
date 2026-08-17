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

    # ── CONSTRAINT SPLIT, and the three shapes it could not read ────────────
    # The split had exactly one readable form, "(17 AST + 42 regex)". Twelve
    # surfaces wrote it one of the other three ways and carried a stale half
    # through a sweep that corrected everything the gate could see.
    ("CONSTRAINT-SPLIT", "All 59 constraints (17 parser + 39 regex, unique IDs)",
     True, "no 'AST' between the count and the plus — the commonest written form"),
    ("CONSTRAINT-SPLIT", "All 59 constraints (17 parser + 42 regex, unique IDs)",
     False, "same shape, correct halves"),
    ("CONSTRAINT-SPLIT", "pass all 59 checks (17 AST via the TypeScript compiler API + 39 regex)",
     True, "a whole clause sits between the first half and the plus"),
    ("CONSTRAINT-SPLIT", "pass all 59 checks (17 AST via the TypeScript compiler API + 42 regex)",
     False, "same interposed clause, correct halves"),
    ("CONSTRAINT-SPLIT", "17 semantic + 39 syntactic = 59 checks across 59 distinct IDs",
     True, "no brackets at all, and both nouns are the other synonym"),
    ("CONSTRAINT-SPLIT", "17 semantic + 42 syntactic = 59 checks across 59 distinct IDs",
     False, "same bracketless form, correct halves"),
    ("CONSTRAINT-SPLIT", "Constraints 53 → 56 (17 AST + 39 regex).",
     False, "an arrow makes both endpoints history — correcting it would delete "
            "what that release actually did"),

    # ── CONSTRAINTS, counted as checks or as IDs ────────────────────────────
    ("CONSTRAINTS", "they must pass all 56 checks",
     True, "the total written as a count of checks, not of constraints"),
    ("CONSTRAINTS", "they must pass all 59 checks",
     False, "same noun, correct total"),
    ("CONSTRAINTS", "= **56 checks across 56 distinct IDs**",
     True, "both halves of the identity restate the same total"),
    ("CONSTRAINTS", "= **59 checks across 59 distinct IDs**",
     False, "same identity, correct total"),
    ("CONSTRAINTS", "Gate 7 runs 22 checks against the eval set.",
     False, "a bare check count belongs to some other suite — claiming it would "
            "flag every gate, eval and CI job that counts anything"),

    # ── The qualifier that sat between the digits and the noun ──────────────
    # README's opening sentence — the first line anyone reads — carried
    # "machine-checked" between the count and "constraints", and the pattern
    # required them adjacent. The figure stayed stale through the sweep that
    # corrected the checklist it was quoting.
    ("CONSTRAINTS", "**56 machine-checked constraints, 11 release gates.**",
     True, "qualifier between the digits and the noun — the front-door shape that shipped stale"),
    ("CONSTRAINTS", "**59 machine-checked constraints, 11 release gates.**",
     False, "same qualifier, correct total"),

    # ── A total stated immediately before its own split ─────────────────────
    # CONSTRAINT-SPLIT validates the halves and is satisfied by a correct pair,
    # so a row reading "59 (17 AST + 43 regex)" passed while contradicting
    # itself on one line — 17 + 43 is 60. The total needs reading in its own
    # right; arithmetic alone would miss the case where all three are stale
    # together and still consistent.
    ("CONSTRAINTS", "| **frontend-design-pro** | 56 (17 AST + 42 regex) | Yes |",
     True, "the halves are right and the total is not, on the same line"),
    ("CONSTRAINTS", "| **frontend-design-pro** | 59 (17 AST + 42 regex) | Yes |",
     False, "same row, total agrees with its halves"),
    ("CONSTRAINTS", "Constraints 53 → 56 (17 AST + 42 regex).",
     False, "an arrow makes the total history as well as the halves — the split "
            "fixture above says the same thing for the other half of the sentence"),
    ("CONSTRAINTS", "the per-request budget is 3,333 (1,111 registry + 200 router + deps)",
     False, "a total before a *token* split — this branch is anchored to the "
            "constraint split's own nouns, not to any 'total (a + b)' arithmetic"),
    ("CONSTRAINTS", "the parser walks 56 (17 AST nodes) per file",
     False, "a parenthesised AST breakdown that is not a constraint split — the "
            "lookahead requires the regex half too, or this branch would fail "
            "Gate 11 on a sentence about something else entirely"),
    ("CONSTRAINTS", "56 (17 semantic layers deep)",
     False, "same shape with the other synonym and no split at all"),

    # ── The halves, counted as checks ───────────────────────────────────────
    ("CONSTRAINTS-REGEX", "the 39 regex checks run on the project",
     True, "'checks' is the other noun the corpus uses for the same quantity"),
    ("CONSTRAINTS-REGEX", "the 42 regex checks run on the project",
     False, "same noun, correct count"),
    ("CONSTRAINTS-REGEX", "- 39 regex/syntactic constraints",
     True, "the slashed pair names one quantity, not two"),
    ("CONSTRAINTS-REGEX", "- [ ] **Syntactic (39 regex)** — the checklist is authoritative",
     True, "checklist-heading form with no '-enforced' suffix, in the always-loaded prompt"),
    ("CONSTRAINTS-REGEX", "- [ ] **Syntactic (42 regex)** — the checklist is authoritative",
     False, "same heading form, correct count"),
    ("CONSTRAINTS-AST", "the 12 AST checks on every authored file",
     True, "the AST half, counted as checks"),
    ("CONSTRAINTS-AST", "the 17 AST checks on every authored file",
     False, "same noun, correct count"),

    # ── REFERENCES, and the two shapes that hid eight stale claims ──────────
    # This figure read `N references` and nothing else. Two forms escaped it and
    # both were carrying live, consumer-facing numbers ten short of the corpus:
    # a table row where the preceding cell's backticked path tripped the
    # per-file suppressor, and `N reference files`, which the install adapters
    # prefer. The negatives are the load-bearing half here — the reason `files`
    # was never widened bare is the platform cap in the fourth case.
    ("REFERENCES",
     "| `skills/{id}/references/*.md` | 99 deep references | **349,445 tokens** |",
     True, "table row: a backticked path in the PRECEDING CELL must not suppress "
           "a corpus claim — this row's token count was swept while its file "
           "count sat stale"),
    ("REFERENCES", "The 99 reference files reach the model only if you paste one in by hand.",
     True, "`N reference files` — the noun four shipped install adapters use"),
    ("REFERENCES", "you are choosing a subset of 99 reference files before the conversation starts",
     True, "same shape mid-sentence, no backticks anywhere near it"),
    ("REFERENCES", "A Custom GPT accepts at most 20 knowledge files for the lifetime of that GPT.",
     False, "a platform cap, not the corpus — widening to a bare `files` would "
            "flag this, which is precisely why it stayed unmatched for so long"),
    ("REFERENCES", "| `skills/{id}/references/*.md` | 101 deep references |",
     False, "correct value in the table row the fix opened up"),
    ("REFERENCES", "The 101 reference files reach the model only if you paste one in.",
     False, "correct value in the newly-read shape"),
    ("REFERENCES", "`design-system` has 15 references, the newest of them",
     False, "per-skill count — the skill-name suppressor still has to hold"),
    ("REFERENCES", "22 shipped files carried 137 references to `docs/*.md`",
     False, "counts pointers, not reference files"),
    ("REFERENCES", "the pack has 8 core files, 19 skill routers and 101 references",
     False, "correct value; `8 core files` on the same line must stay unclaimed"),

    # ── DEPTH-K ─────────────────────────────────────────────────────────────
    # The whole point of this figure is the line it refuses to cross. The
    # `k`-rounded family names two quantities; only the ones whose own noun
    # says "references" or "depth" are claimed here. The negative cases are
    # load-bearing — widening this to match "pack" would demand a whole-pack
    # total that nothing computes, and fail README for telling the truth.
    ("DEPTH-K", "references are ~344k tokens and are the part an agent opens for depth",
     True, "noun first, then the rounded figure"),
    ("DEPTH-K", "references are ~349k tokens",
     False, "correct to the nearest thousand"),
    ("DEPTH-K", "It does not scale to 344k tokens of references.",
     True, "figure first, noun after"),
    ("DEPTH-K", "a request loads 7,476 against ~344k of available depth",
     True, "a qualifier sits between the figure and its noun"),
    ("DEPTH-K", "A monolithic pack of ~344k tokens cannot be loaded at all.",
     False, "names the whole pack — a different quantity, and nothing computes it"),
    ("DEPTH-K", "a monolithic 330k-token pack could not be loaded",
     False, "same claim, hyphenated: 'pack' is not 'depth'"),
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
