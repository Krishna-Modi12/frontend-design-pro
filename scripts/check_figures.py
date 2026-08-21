#!/usr/bin/env python3
"""
Frontend Design Pro — Figure Gate (Gate 11)

The blind spot this closes
--------------------------
`CLAUDE.md` names it in its own words:

    No gate validates prose. Skill/reference/example counts and token figures
    are hardcoded across ~30 documents and go stale silently — this is the
    single most repeated defect in this repo's history.

Every other gate reads code. The defect that keeps shipping is arithmetic in
markdown, and until this gate existed the only defence was remembering to sweep
~30 files by hand after every change that moved a count. That defence failed
often enough to be the stated reason for several releases.

What it costs to leave unguarded is not cosmetic. On the run that produced this
gate, the per-request token band was wrong in **17 live files**, two of which
(`README.md`, `AGENT_SYSTEM_PROMPT.md`) ship inside the archive — so the file
that tells an agent its own token budget shipped the wrong number. A second,
rounder band (`5,000–6,300`) was circulating in three more places, already
disagreeing with the first before either went stale. `docs/ARCHITECTURE.md`
printed a nineteen-row per-skill budget table in which every row was wrong, under
a heading announcing "Nine named gates" above a table with ten rows.

Design
------
**Truth is computed from the filesystem, never read from `metadata.json`.**
`metadata.json` is itself a claim, and check 3 below is what audits it. A gate
that trusted it would agree with the drift instead of finding it.

**Token figures are LF-normalised.** `build_release.py` uses `stat().st_size`,
which reads high on a CRLF checkout; `.gitattributes` normalises the repo to LF,
so the canonical figure — the one CI measures and the one a reader who downloads
the archive can reproduce — is the LF byte count. Normalising here means this
gate reports the same numbers on Windows and on ubuntu-latest, which a gate whose
whole job is arithmetic has to do.

Four checks
-----------
1. **Anchored figures.** Each `Figure` is a regex whose captures must equal a
   computed value. The pattern matches the *shape and context* of a figure, not
   a list of known-stale literals — so it catches the next drift, not only this
   one. A figure nobody has written yet is caught the first time someone writes
   it wrong.

2. **Arithmetic consistency.** Finds `A → B … C tokens` triples and asserts
   `B - A == C`. This is the check that catches a partial sweep: a blanket
   substitution that updates an endpoint and leaves the delta behind produces a
   sentence that is individually plausible and collectively impossible.
   `docs/ARCHITECTURE.md` claimed two skills grew the registry "from 1,895 to
   2,018 tokens — 103 tokens for both". That subtracts to 123.

3. **`metadata.json` vs the filesystem.** Every `stats` key that can be derived
   is derived and compared.

4. **`metadata.json` changelog vs `docs/CHANGELOG.md`.** These two records of
   the same history drifted apart across two concurrent-session merges — the
   dict silently lost its 14.7.1 and 14.7.2 entries while the markdown kept
   both — and passed a green chain twice, because nothing compared them.

Scope, and why it is a list rather than everything
--------------------------------------------------
`SCAN` is the set of surfaces that make claims *about the pack*. Reference files
are excluded by default: `chart-types.md` saying an axis runs `1,000 – 10,000` is
content, not a claim, and a gate that flagged it would be noise. The one
exception is `skills/agent-ops/references/token-optimization.md`, which quotes
the pack's own budget and is named in `CLAUDE.md`'s sweep list for that reason,
along with `context-engineering.md`, which opens on the same claim.

Historical records are exempt wholesale. `docs/CHANGELOG.md` and
`docs/RELEASE_NOTES-*` were accurate when cut, and `CLAUDE.md` forbids rewriting
them — a gate that demanded they match today's figures would be demanding the
record be falsified.

Release notes inside a live document have the same need in miniature: naming the
figure that was wrong is the point of a correction. That is handled by a marked
region rather than a file-wide exemption, so the suppression stays visible in the
diff and cannot quietly cover the rest of the file — see `_historical_lines`. A
marker without a stated reason, or without a close, is itself a finding.

Usage:
  python scripts/check_figures.py           # all four checks
  python scripts/check_figures.py --truth   # print the computed truth table
  python scripts/check_figures.py --json    # machine-readable findings
"""

import json
import re
import sys
from pathlib import Path
from typing import Callable, Dict, List, NamedTuple, Sequence

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"

# Dash characters that appear in ranges across these docs: en dash, em dash,
# hyphen. Written once so a new doc using a different dash cannot slip a figure
# past the scan.
DASH = r"[–—-]"


# ── Truth, computed ──────────────────────────────────────────────────────────

def tokens(path: Path) -> int:
    """LF-normalised token count: bytes ÷ 4, the repo's canonical measure.

    Deliberately not `stat().st_size`. See the module docstring — a CRLF
    working tree reads high, and this gate must produce identical numbers on
    every platform or it will "correct" the docs to a local artefact.
    """
    return len(path.read_bytes().replace(b"\r\n", b"\n")) // 4


# The canonical gate roster. Imported rather than counted, because the gates are
# not uniformly shaped in `build_release.py`: some print their own `GATE n`
# header, seven are recorded inside `gate_chain()`, and 8a/8b are one numbered
# gate in two halves. Counting headers would give 4. This list is the definition
# and `docs/ARCHITECTURE.md`'s table must match it row for row.
GATE_ROSTER: Sequence[str] = (
    "Pre-flight",
    "Frontmatter",
    "Compile",
    "Semantic",
    "Syntactic",
    "Pipeline",
    "Evals + coverage",
    "Budget + registry",
    "Showcase build",
    "References",
    "Figures",
)

BASE_DEPS = {"core/accessibility-baseline.md", "core/validate-checklist.md"}


def _core_deps(router: Path) -> set:
    """The core files a skill loads: its declared `core-deps` plus the two
    charged to every skill regardless of declaration."""
    m = re.search(r"core-deps:\s*\n((?:\s*-\s*\S+\n)+)", router.read_text(encoding="utf-8"))
    declared = set(re.findall(r"-\s*(\S+)", m.group(1))) if m else set()
    return BASE_DEPS | declared


def compute_truth() -> Dict[str, object]:
    registry = tokens(ROOT / "SKILL.md")
    routers = sorted((ROOT / "skills").glob("*/SKILL.md"))

    budgets: Dict[str, int] = {}
    router_tokens: List[int] = []
    dep_totals: List[int] = []
    for r in routers:
        st = tokens(r)
        dt = sum(tokens(ROOT / d) for d in _core_deps(r) if (ROOT / d).exists())
        budgets[r.parent.name] = registry + st + dt
        router_tokens.append(st)
        dep_totals.append(dt)

    # rglob, not glob: design-system nests references/styles/, and a flat glob
    # undercounts by 5. The published figure has always been the rglob one.
    refs = [p for d in (ROOT / "skills").glob("*/references") for p in d.rglob("*.md")]
    examples = [p for p in (ROOT / "skills").glob("*/examples/*.tsx")
                if not p.name.endswith(".test.tsx")]

    # Constraint counts come from the suites themselves — the same derivation
    # `build_release.constraint_counts()` uses, for the same reason: these were
    # hardcoded once and drifted three versions.
    parser = len(set(re.findall(r'checks\["([A-Z0-9-]+)"\]',
                                (SCRIPTS / "parser_constraints.js").read_text(encoding="utf-8"))))
    regex = len(set(re.findall(r'id="([A-Z0-9-]+)"',
                               (SCRIPTS / "test_constraints.py").read_text(encoding="utf-8"))))

    return {
        "registry_tokens": registry,
        "band_low": min(budgets.values()),
        "band_high": max(budgets.values()),
        "budgets": budgets,
        "router_low": min(router_tokens),
        "router_high": max(router_tokens),
        "dep_low": min(dep_totals),
        "dep_high": max(dep_totals),
        "dep_distinct": sorted(set(dep_totals)),
        "skills": len(routers),
        "reference_files": len(refs),
        "reference_depth_tokens": sum(tokens(p) for p in refs),
        "core_files": len(list((ROOT / "core").glob("*.md"))),
        "example_files": len(examples),
        "anti_examples": len(list((ROOT / "skills").glob("*/examples/bad-*.tsx"))),
        "test_files": len(list((ROOT / "skills").glob("*/examples/*.test.tsx"))),
        "release_gates": len(GATE_ROSTER),
        "parser_constraints": parser,
        "regex_constraints": regex,
        "ci_constraints": parser + regex,
        # Imported inside the function, not at module scope: figure_pattern_test
        # imports this module, and by the time anything calls compute_truth()
        # this module is fully loaded, so the cycle never closes. Counted rather
        # than written down because the release that added those fixtures
        # published "17 prose fixtures over 4 figures" in three documents and
        # then grew to 20 over 5 before it shipped — an ungated figure, in the
        # release note about ungated figures.
        **_fixture_counts(),
    }


def _fixture_counts() -> Dict[str, object]:
    if str(SCRIPTS) not in sys.path:
        sys.path.insert(0, str(SCRIPTS))
    try:
        import figure_pattern_test as fpt
    except ImportError:                      # the proof script is not installed
        return {}                            # in the archive; skip rather than fail
    return {
        "regression_cases": len(re.findall(
            r'^\s{2}\{\s*$',
            (ROOT / "scripts" / "parser_regression_test.js").read_text(encoding="utf-8"),
            re.M)),
        "figure_fixtures": len(fpt.CASES),
        "figure_fixture_figures": len({c[0] for c in fpt.CASES}),
    }


# ── Check 1 — anchored figures ───────────────────────────────────────────────

class Figure(NamedTuple):
    id: str
    description: str
    pattern: str
    # Given the truth table, return the tuple of strings the captures must equal.
    # For RANGE this is resolved per-match instead; see `_expect_range`.
    expect: Callable[[Dict[str, object]], tuple]
    # Regex tested against the ~50 characters preceding a match. If it fires,
    # the match is not a claim about the pack and is skipped.
    forbid: str = ""


def _n(v) -> str:
    return f"{v:,}"


_ONES = ("zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
         "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
         "sixteen", "seventeen", "eighteen", "nineteen")
_TENS = ("", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
         "eighty", "ninety")

# Alternation used by the *-WORD figures. Longest-first so "seventeen" is not
# matched as "seven", which would capture a wrong value and report a wrong
# expectation.
_WORD_ALT = "|".join(sorted(
    set(_ONES) | {f"{t}{sep}{o}" for t in _TENS[2:] for o in _ONES[1:10] for sep in ("-",)}
    | set(_TENS[2:]),
    key=len, reverse=True,
))


def _word(v) -> str:
    """Spell a count the way prose does: 11 -> eleven, 42 -> forty-two."""
    n = int(v)
    if n < 20:
        return _ONES[n]
    if n < 100:
        return _TENS[n // 10] + (f"-{_ONES[n % 10]}" if n % 10 else "")
    return str(n)          # nobody writes a three-digit count in words


# Context that makes a number something other than a current measurement.
# Applied to every figure, because each of these produced a false positive on
# the first run and each would produce one again in a document not yet written.
GLOBAL_FORBID = re.compile(
    # A transition arrow means the sentence is narrating a change. Both endpoints
    # are then historical by construction — `Constraints 53 → 56 (17 AST + 39
    # regex)` records a step that really happened and must not be "corrected".
    r"(?:→|->)\s*\*{0,2}[\d,]*\*{0,2}\s*[\w\s]{0,12}$"
    # A bound is not a measurement. Gate 1 asserting `SKILL.md` ≤6,000 tokens
    # says nothing about how large SKILL.md actually is.
    r"|(?:≤|≥|<=|>=|<|>|under|at most|up to|max|maximum|budget:?|exceeds|over|no more than)\s*\**$"
    # `component-patterns has 2 references` is a per-skill count, not the total.
    r"|(?:has|and|only|just|each|per)\s+$"
    # `the 2–3 skill routers a request needs` — a span, not the roster size.
    r"|[\d,]\s*[–—-]\s*$",
    re.IGNORECASE,
)


def _suppressed(line: str, start: int, forbid: str) -> bool:
    window = line[max(0, start - 50):start]
    if GLOBAL_FORBID.search(window):
        return True
    return bool(forbid and re.search(forbid, window, re.IGNORECASE))


def _is_rounding(found: str, truth: int) -> bool:
    """Allow an explicit approximation: a value rounded to a round number and
    within 1% of the truth. `~2,000 tokens` for 2,018 and `not 333,000` for
    333,709 are honest prose, and a gate that demanded `~2,018` would be making
    the documents worse in the name of precision they never claimed.
    """
    try:
        v = int(found.replace(",", ""))
    except ValueError:
        return False
    trailing_zeros = len(str(v)) - len(str(v).rstrip("0"))
    return trailing_zeros >= 3 and abs(v - truth) <= max(1, truth * 0.01)


FIGURES: Sequence[Figure] = (
    Figure(
        "RANGE",
        "a published range — request band, core-dep load, or router size",
        # One pattern for all three, because prose context does not reliably
        # separate them ("a figure in the 5,511–7,112 range" names nothing) and
        # a context guess that misfires is worse than no context at all. The
        # match is classified by which known range its low endpoint is nearest
        # to, then required to equal that one exactly. The three are far apart
        # — 789 / 2,843 / 5,665 — so the classification is unambiguous; if two
        # ever converge, split this figure rather than loosening it.
        #
        # `to` is accepted alongside the dash because launch prose writes the
        # band out in words — "Measured per-request load: 5,665 to 7,266
        # tokens" sat in three tracked documents, stale, while a dash-only
        # pattern called them clean. The `from` suppressor is what keeps that
        # from swallowing a transition: "grew the registry from 1,895 to 1,998"
        # narrates a change and its endpoints are history, not a band.
        rf"(?<![\d,])(\d{{3}}|\d,\d{{3}})\s*(?:{DASH}|to)\s*(\d,\d{{3}})(?![\d,])",
        lambda t: (),  # resolved per-match by _expect_range
        r"\bfrom\s+$",
    ),
    Figure(
        "REGISTRY",
        "always-loaded registry (SKILL.md) size",
        # The character class excludes comparison operators so the anchor word
        # cannot reach across a bound: `Gate 1 asserts \`SKILL.md\` ≤6,000
        # tokens` states a ceiling the gate enforces, not the file's size, and
        # the operator sits inside the match where the context suppressor
        # cannot see it.
        # `(?<!to )` is the worded form of the arrow suppressor: "grew SKILL.md
        # from 1,895 to 1,998 tokens" narrates a change, and its endpoint is
        # history rather than the file's current size.
        #
        # The backticks are optional because docs prose backticks a filename and
        # launch prose does not — "SKILL.md is 2,018 tokens" is how you write it
        # for strangers, and it is the form that shipped stale in all three
        # tracked launch documents while this gate reported them clean. The
        # anchor must be the *root* file, hence `(?<![/\w-])`: without it,
        # `skills/{id}/SKILL.md` reaches forward and reads the per-skill router
        # range as if it were the registry, which flags two correct tables.
        r"(?:registry|`?(?<![/\w-])SKILL\.md`?)[^.\n≤≥<>]{0,60}?\*{0,2}(?<![\d,])(?<!to )(\d,\d{3})\*{0,2}[ -]tokens?\b"
        r"|(?<![\d,])(\d,\d{3})\*{0,2}[ -]tokens?\b(?=[^.\n]{0,30}(?:always|registry))",
        lambda t: (_n(t["registry_tokens"]),),
    ),
    # The band's two edges, each written on its own — "the heaviest possible
    # request loads 7,266 tokens. The lightest loads 5,665." is the same claim
    # as the dashed pair RANGE reads, split across two sentences so that no
    # range pattern can see it. Both edges sat stale in three documents.
    # Anchored on the superlative rather than on "request", because the noun
    # varies ("request", "skill", "route") and the superlative does not.
    Figure(
        "BAND-HIGH",
        "the heaviest per-request load",
        r"(?i:heaviest)[^.\n≤≥<>]{0,40}?\*{0,2}(?<![\d,])(\d,\d{3})\*{0,2}(?=[ -]tokens?\b|[.,;:)]|\*{2})",
        lambda t: (_n(t["band_high"]),),
    ),
    Figure(
        "BAND-LOW",
        "the lightest per-request load",
        # No `tokens` requirement: the unit is carried by the preceding sentence
        # ("… loads 7,266 tokens. The lightest loads 5,665.") and demanding it
        # here would miss every real instance of this form.
        r"(?i:lightest)[^.\n≤≥<>]{0,40}?\*{0,2}(?<![\d,])(\d,\d{3})\*{0,2}(?=[ -]tokens?\b|[.,;:)]|\*{2})",
        lambda t: (_n(t["band_low"]),),
    ),
    # One pattern capturing both numbers, because "N figures" alone is far too
    # common a phrase in this repo to anchor on — it means the Figure table, a
    # published count, or the word in ordinary use, and a pattern that cannot
    # tell them apart would be muted within a release. Tied to the full phrase,
    # it is unambiguous.
    # The parser-regression count sat hardcoded on eight surfaces, three of them
    # launch documents, and `docs/LAUNCH_KIT.md` opens by calling every number in
    # it verified. Adding one case moved the truth and the gate reported 0 drift
    # — the fourth instance of this exact class, in the same documents as the
    # third. Counted from the harness rather than from prose.
    Figure(
        "REGRESSION",
        "synthetic parser-vs-regex divergence cases",
        r"(?<![\d,])(\d{1,3})\s+(?:synthetic\s+)?(?:parser-vs-regex\s+)?"
        r"(?:divergence\s+|regression\s+)cases\b"
        r"|(?<![\d,])(\d{1,3})\s+synthetic\s+cases\b",
        lambda t: (str(t.get("regression_cases", "")),),
    ),
    Figure(
        "FIXTURES",
        "prose fixtures in the figure-pattern proof, and the figures they cover",
        r"(?<![\d,])(\d{1,3})\s+prose fixtures over (\d{1,2}) figures\b",
        lambda t: (str(t.get("figure_fixtures", "")),
                   str(t.get("figure_fixture_figures", ""))),
    ),
    Figure(
        "SKILLS",
        "number of skills in the registry",
        r"(?<![\d,])(\d{1,3})\s*(?:auto-routing\s+|routing\s+|named\s+)?skills\b"
        r"|(?<![\d,])(\d{1,3})-row routing table"
        # `skill` optional: GEMINI_SETUP.md writes "the 17 routers", which the
        # stricter form missed while the count sat two skills behind.
        r"|\b(\d{1,3})\s+(?:skill\s+)?routers\b",
        lambda t: (str(t["skills"]),),
    ),
    Figure(
        "REFERENCES",
        "number of reference files",
        # Two digits minimum: every per-skill reference count in these docs is
        # single-digit or is guarded by the `has`/`and` suppressor, and the
        # total has been three digits since v14.1.
        # `(?!\s+to\b)` because "137 references to docs/*.md" counts pointers,
        # not reference files. A count followed by "to" always names what is
        # being pointed at, never the corpus.
        # The second alternate reads `N reference files`, which four shipped
        # install adapters and two setup docs use. This was recorded as
        # deliberately unmatched because widening to a bare `files` would also
        # grab "20 knowledge files per GPT" on the same row — but requiring the
        # word `reference` separates the two cleanly, and while the shape went
        # unread six live consumer-facing claims sat ten short.
        r"(?<![\d,])(\d{2,3})\s+(?:deep\s+|on-demand\s+)?references\b(?!\s+to\b)"
        r"|(?<![\d,])(\d{2,3})\s+reference\s+files\b",
        lambda t: (str(t["reference_files"]),),
        # `[^.|]` not `[^.]`: the backtick branch exists to suppress a per-file
        # claim like "`foo.md` has 12 references", where the path and the count
        # share a clause. A table PIPE between them means they are separate
        # cells and the count is the corpus — which is how
        # `| `skills/{id}/references/*.md` | N deep references |` hid a stale
        # figure while the row's own token count was being swept correctly.
        forbid=r"(?:`\S+`|design-system|platform|agent-ops)[^.|]{0,10}$",
    ),
    Figure(
        "DEPTH",
        "total reference depth in tokens",
        r"(?<![\d,])(\d{3},\d{3})(?![\d,])",
        lambda t: (_n(t["reference_depth_tokens"]),),
    ),
    # The `k`-rounded form was recorded as ungateable because the strings name
    # two different quantities: some mean reference depth, some mean the whole
    # pack, and one expected value cannot serve both. That was true of the
    # *family* and false of most of its members — the noun says which. This
    # figure claims only the ones whose own words say "references" or "depth";
    # "a monolithic pack of ~344k tokens" is deliberately left alone, because
    # nothing computes a whole-pack total yet. 344k against 349,445 is 1.56%
    # out, past _is_rounding's 1% tolerance, so the stale readings fail and a
    # correct 349k passes.
    Figure(
        "DEPTH-K",
        "reference depth rounded to thousands",
        r"(?:references?|depth)\s+(?:are|is)\s+~?(\d{3})k\b"
        r"|~?(\d{3})k[- ](?:tokens?\s+)?of\s+(?:\w+\s+){0,2}(?:references?|depth)\b",
        lambda t: (str(round(int(str(t["reference_depth_tokens"])) / 1000)),),
    ),
    Figure(
        "GATES",
        "number of release-blocking gates",
        # `\*{0,2}` because this repo bolds and italicises figures constantly,
        # and emphasis *between* the number and its noun breaks the `\s+`:
        # `*10* release-blocking gates` was invisible here while `10 gates` was
        # not. No instance existed in the corpus when this was widened — it is
        # future coverage for a form the house style produces by habit.
        r"(?<![\d,])\*{0,2}(\d{1,2})\*{0,2}\s+(?:release-)?(?:blocking\s+|named\s+)?gates\b"
        r"|\ball (\d{1,2}) gates\b",
        lambda t: (str(t["release_gates"]),),
    ),
    Figure(
        "CONSTRAINTS",
        "total constraint count",
        # The same total is also written as a count of *checks* or of *IDs* —
        # "all 59 checks", "= 59 checks across 59 distinct IDs" — in three
        # documents that describe the suites rather than quote a headline. Bare
        # "N checks" is deliberately not matched: gate chains, evals and CI jobs
        # all count checks too, and a pattern that claimed those would report
        # drift on numbers that have nothing to do with constraints.
        #
        # `machine-checked` joins `machine-enforced` and `CI` as a qualifier the
        # corpus uses for the same quantity. It was not a hypothetical: README's
        # opening line — the first sentence anyone reads — said "59
        # machine-checked constraints" for a full release after the count moved
        # to 60, because the qualifier sat between the digits and the noun and
        # this pattern required them adjacent.
        r"(?<![\d,])(\d{1,3})\s+(?:CI\s+|machine-(?:enforced|checked)\s+)?constraints\b"
        r"|\ball\s+\*{0,2}(\d{1,3})\*{0,2}\s+checks\b"
        r"|=\s*\*{0,2}(\d{1,3})\*{0,2}\s+checks\b"
        r"|(?<![\d,])(\d{1,3})\s+distinct\s+IDs\b"
        # A total stated immediately before its own split — "59 (17 AST + 43
        # regex)". CONSTRAINT-SPLIT below validates the two halves and was
        # perfectly happy, so the comparison table in README shipped a row whose
        # own parenthesis contradicted it: 17 + 43 is 60, printed beside a 59.
        # Reading the total here is stronger than an arithmetic cross-check,
        # because it catches the case where the halves *and* the total are
        # internally consistent and all three are stale.
        #
        # The lookahead demands the WHOLE split, not just its first half. An
        # earlier draft stopped after `(P AST` and would have claimed any
        # parenthesised AST breakdown — `56 (17 AST nodes)` — as a stale
        # constraint total, failing Gate 11 on a sentence about something else
        # entirely. A matcher that breaks correct files is not a fix; the
        # negative fixture for it is in `figure_pattern_test.py`.
        r"|(?<![\d,])\*{0,2}(\d{1,3})\*{0,2}\s*\("
        r"(?=\d{1,3}\s+(?:parser\s+)?(?:AST|parser|semantic)\b[^)+]{0,60}?"
        r"\+\s*\d{1,3}\s+(?:regex|syntactic)\b)",
        lambda t: (str(t["ci_constraints"]),),
    ),
    # The split had one shape: "(17 AST + 42 regex)". The corpus writes it four
    # ways, and the other three were unreadable — "(17 parser + 42 regex)" with
    # no AST, "17 semantic + 42 syntactic = 60" with no brackets, and "(17 AST
    # via the TypeScript compiler API + 42 regex)" with a clause in the middle.
    # Twelve surfaces carried a stale half through the sweep that corrected
    # every surface the gate could read, in the same session that widened this
    # gate twice for the same reason. The half a document happens to spell out
    # is not a signal about which half matters.
    Figure(
        "CONSTRAINT-SPLIT",
        "constraint split, AST/parser/semantic + regex/syntactic",
        r"\(\s*(\d{1,3})\s+(?:parser\s+)?(?:AST|parser|semantic)\b[^)+]{0,60}?"
        r"\+\s*(\d{1,3})\s+(?:regex|syntactic)\b"
        r"|(?<![\d,])(\d{1,3})\s+(?:semantic|parser|AST)\s*\+\s*"
        r"(\d{1,3})\s+(?:syntactic|regex)\b",
        lambda t: (str(t["parser_constraints"]), str(t["regex_constraints"])),
    ),
    Figure(
        "CORE-FILES",
        "number of shared core primitives",
        r"(?<![\d,])(\d{1,2})\s+(?:shared\s+)?(?:core\s+)?primitives\b"
        r"|`core/\*\.md`\s*\((\d{1,2})\s+files\)",
        lambda t: (str(t["core_files"]),),
    ),
    # CONSTRAINTS above only matches a bare or CI-qualified count, so a
    # *qualified* half — "35 regex constraints" — sailed past it while being
    # wrong by seven. Split counts get their own figures rather than a looser
    # CONSTRAINTS pattern, because 17, 42 and 59 are three different truths and
    # one pattern that matched all three could not say which was meant.
    # A third prose form, found by reading `core/validate-checklist.md` cold:
    # a *section heading* puts the noun first and the count in parentheses —
    # "## Regex-enforced (36)" — so neither pattern above could reach it. It
    # sat six wrong, in the pack's canonical constraint list, two lines above a
    # total that spelled the right number, while the gate reported 0 drift.
    # Same class as the registry-anchor gap the previous patch closed: not a
    # wrong figure, an unreadable one — and found the same way, by reading a
    # file cold rather than by trusting a green run.
    # The parenthetical may carry a qualifier ("AST — 17"), so the gap
    # before the digits is permissive but cannot cross the closing bracket.
    Figure(
        "CONSTRAINTS-REGEX",
        "regex/syntactic half of the constraint count",
        # `checks` and the slashed `regex/syntactic` are the other two nouns the
        # corpus uses for the same quantity — "the 42 regex checks on the
        # project", "42 regex/syntactic constraints". Both sat stale through a
        # sweep because only "constraints" was spelled out here.
        r"(?<![\d,])(\d{1,3})\s+(?:regex|syntactic|regex/syntactic)"
        r"\s+(?:constraints|checks)\b"
        # The checklist-heading form without the "-enforced" suffix:
        # "**Syntactic (42 regex)**" in the always-loaded agent prompt.
        r"|(?i:regex|syntactic)\s*\((\d{1,3})\s+regex\)"
        r"|(?i:regex|syntactic)-enforced\s*\([^)\d]{0,16}(\d{1,3})\)",
        lambda t: (str(t["regex_constraints"]),),
    ),
    Figure(
        "CONSTRAINTS-AST",
        "AST/semantic half of the constraint count",
        r"(?<![\d,])(\d{1,3})\s+(?:semantic|AST|parser)\s+(?:constraints|checks)\b"
        r"|(?i:parser|AST|semantic)-enforced\s*\([^)\d]{0,16}(\d{1,3})\)",
        lambda t: (str(t["parser_constraints"]),),
    ),
    # Figures spelled as words were a stated blind spot of this gate, and the
    # blind spot had something living in it: a public triage document said
    # "Nine gates, all release-blocking" long after there were eleven. A count
    # is no less a claim for being spelled out.
    #
    # Captures are lower-cased before comparison — see the `-WORD` branch in the
    # scan loop — so a sentence-initial "Eleven gates" is not a false positive.
    Figure(
        "GATES-WORD",
        "gate count, spelled out",
        rf"(?i)\b({_WORD_ALT})\s+(?:named\s+|blocking\s+|release-blocking\s+)?gates\b",
        lambda t: (_word(t["release_gates"]),),
    ),
)

# There is deliberately no SKILLS-WORD. It was written, and it produced eight
# false positives to one true one: "when two skills match, the more specific
# wins", "adding two skills cost 103 tokens", "routes to exactly one
# skills/{id}/SKILL.md". A spelled number before "skills" nearly always counts
# a subset or a step, not the corpus — whereas gates are a fixed roster, so
# "N gates" is a claim about all of them. The noun has to be one that only the
# total can occupy, or the gate gets muted for noise and stops being read.

# Surfaces that make claims about the pack. Reference files are content, not
# claims, and are excluded — see the module docstring for the one exception.
SCAN: Sequence[str] = (
    "README.md",
    "CLAUDE.md",
    "SKILL.md",
    "AGENT_SYSTEM_PROMPT.md",
    "core/*.md",
    "docs/*.md",
    "docs/*.html",
    "install/**/*.md",
    "demo/*/README.md",
    "demo/landing-page/components/*.tsx",
    "demo/landing-page/lib/*.ts",
    "demo/landing-page/*.json",
    "skills/agent-ops/references/token-optimization.md",
    # Its sibling qualifies under the same exception and was missed: the file
    # opens "This pack routes one skill per request out of ~Nk tokens of
    # depth", which is a claim about the pack, not content. It sat stale.
    "skills/agent-ops/references/context-engineering.md",
    # The screenshot harness is not shipped, but its header explains what the
    # gates do and does it in numbers — and being outside this list is exactly
    # why it drifted to "53 constraints" and stayed there. A file that states a
    # figure is a claim surface whether or not a consumer ever opens it.
    #
    # Widened from `tools/screenshots/` to every tool: `tools/readme-hero/`
    # arrived generating the image at the top of the README and would have
    # inherited the same blind spot on the same reasoning.
    "tools/*/*.mjs",
    # The plugin manifest was outside this list entirely, and its description is
    # what a marketplace listing renders — it shipped claiming 96 references
    # against a real 101. It holds no history, so the whole file is fair game.
    #
    # `metadata.json` is deliberately NOT here: its `changelog` block is 45
    # historical entries, the same content `docs/CHANGELOG.md` is exempted for
    # wholesale. Its prose `description` is a live claim and is audited by
    # `check_metadata` instead, field by field.
    ".claude-plugin/*.json",
    # The issue template asks a reporter which gate should have caught their bug
    # and then lists the gates; the workflows describe what they run. Both were
    # two gates behind — the template could not express "Gate 11 missed it"
    # because it stopped at 9.
    ".github/ISSUE_TEMPLATE/*.md",
    ".github/workflows/*.yml",
    # The gallery index served at the root of the Pages site. It carries no
    # figure today and is written to keep it that way, so this entry buys
    # nothing right now — which is the moment to add it rather than after
    # someone puts a count on the most public page this project has. The three
    # launch documents were outside SCAN on the same reasoning and held a
    # superseded router size in live prose while the gate reported no drift.
    ".github/pages/*.html",
    # NOT `.github/assets/*.svg`, and the attempt is recorded because it looked
    # obviously right and is not.
    #
    # The README banners carry figures, so adding them here seemed free — and the
    # first test agreed: the patterns match the skill count and the depth figure
    # inside the SVG exactly as they do in prose. The gate still passed a banner
    # whose skill count had been decremented by hand — the whole point of the
    # control. Every match is dropped by `_suppressed`, because each figure's
    # forbid window reads the preceding ~50 characters and in SVG those are always
    # attribute soup — `font-family="ui-monospace, SFMono-Regular, …"` sits before
    # every piece of text in the document.
    #
    # Widening the windows to accommodate markup would weaken them everywhere they
    # currently work, to protect two generated files. The banners are protected at
    # the source instead: `tools/readme-*/generate.mjs` read every figure from
    # `--truth`, and `--check` re-renders and diffs so a stale banner fails
    # loudly. That is byte-exact rather than pattern-based, which is strictly
    # stronger than what this list could have given them.
    # Added with the community health files, which quote the figures at a
    # contributor as instructions. A wrong count here sends someone to argue
    # with a gate that is right.
    "CONTRIBUTING.md",
    "SECURITY.md",
)

# Wholesale exemptions: records that were accurate when written. Rewriting them
# to match today's figures would falsify the history CLAUDE.md protects.
EXEMPT_FILES: Sequence[str] = (
    "docs/CHANGELOG.md",
    "docs/RELEASE_NOTES-",
)

# Per-file, per-figure exemptions. Every entry carries the reason it is safe,
# because an exemption without a reason is indistinguishable from a bug someone
# silenced.
EXEMPT: Dict[str, Dict[str, str]] = {
    "docs/METRICS_BASELINE.md": {
        "RANGE": "A dated baseline snapshot. Its whole function is to preserve "
                 "what the figures were on the day it was taken, so later runs "
                 "have something to be compared against.",
        "DEPTH": "Same — a baseline that tracked the current value would measure "
                 "nothing.",
        "SKILLS": "Same.",
    },
    "docs/REVIEW_PROTOCOL.md": {
        "SKILLS": 'The line reads: Not "50 skills". Done is: a first-time user '
                  "generates a portfolio-worthy page. It is naming a target the "
                  "project deliberately rejected, not counting anything.",
    },
}


# Release notes have to be able to name the figure that was wrong. "The band was
# 5,511–7,112 when it was 5,665–7,266" is a correction, and a gate that forced it
# to say 5,665 twice would delete the sentence's meaning — the same reason
# `docs/CHANGELOG.md` is exempt wholesale.
#
# A whole-file exemption is the wrong instrument for that: README is the single
# most important claims surface in the repo, and exempting it would let real
# drift live in the one place it does the most damage. So the suppression is
# scoped to a marked region, declared in the document, visible in a diff, and
# required to carry a reason:
#
#   <!-- figures:historical — quoting the pre-Gate-11 figures to record them -->
#   … prose naming the superseded numbers …
#   <!-- /figures:historical -->
_HIST_OPEN = re.compile(r"<!--\s*figures:historical\s*(?:—|--|-)?\s*(.*?)-->")
_HIST_CLOSE = re.compile(r"<!--\s*/figures:historical\s*-->")


def _historical_lines(lines: Sequence[str], rel: str) -> tuple:
    """Line numbers (1-indexed) inside a marked historical region, plus any
    structural complaint about the markers themselves."""
    inside: set = set()
    problems: List[str] = []
    open_at = None
    reason = ""
    for i, line in enumerate(lines, 1):
        if open_at is None:
            m = _HIST_OPEN.search(line)
            if m:
                open_at, reason = i, m.group(1).strip()
                if len(reason) < 12:
                    problems.append(f"{rel}:{i} historical marker carries no reason")
        elif _HIST_CLOSE.search(line):
            inside.update(range(open_at, i + 1))
            open_at = None
    if open_at is not None:
        problems.append(f"{rel}:{open_at} historical marker is never closed")
        inside.update(range(open_at, len(lines) + 1))
    return inside, problems


class Finding(NamedTuple):
    check: str
    file: str
    line: int
    figure: str
    found: str
    expected: str
    context: str


def _scan_files() -> List[Path]:
    seen: Dict[str, Path] = {}
    for pat in SCAN:
        for p in sorted(ROOT.glob(pat)):
            rel = p.relative_to(ROOT).as_posix()
            if any(rel.startswith(e) for e in EXEMPT_FILES):
                continue
            if not p.is_file():
                continue
            seen[rel] = p
    return [seen[k] for k in sorted(seen)]


def _expect_range(truth: Dict[str, object], got: tuple) -> tuple:
    """Classify a published range by its low endpoint, then demand exactness."""
    known = {
        "router": (truth["router_low"], truth["router_high"]),
        "dep": (truth["dep_low"], truth["dep_high"]),
        "band": (truth["band_low"], truth["band_high"]),
    }
    low = int(got[0].replace(",", ""))
    nearest = min(known.values(), key=lambda pair: abs(pair[0] - low))
    return (_n(nearest[0]), _n(nearest[1]))


def _drift(fig: Figure, text: str, m, truth: Dict[str, object]):
    """One match, judged. Returns (found, expected) when it is drift, else None.

    Module-level so the file walk and the manifest-description check below share
    one definition of drift. A figure that meant one thing in a markdown file
    and another in a JSON string would be worse than no check at all.
    """
    # A figure's pattern may hold alternates; the captures that actually
    # fired are the ones to judge.
    got = tuple(g for g in m.groups() if g is not None)
    if not got or _suppressed(text, m.start(), fig.forbid):
        return None
    word_figure = fig.id.endswith("-WORD")
    if word_figure:
        # "Eleven gates" opening a sentence is the same claim as
        # "eleven gates" inside one.
        got = tuple(g.lower() for g in got)
    expected = _expect_range(truth, got) if fig.id == "RANGE" else fig.expect(truth)
    if len(got) != len(expected) or got == expected:
        return None
    # Rounding tolerance is arithmetic and cannot apply to a word — and
    # int("eleven") would raise here.
    if (not word_figure and len(got) == 1
            and _is_rounding(got[0], int(expected[0].replace(",", "")))):
        return None
    return " / ".join(got), " / ".join(expected)


def check_anchored(truth: Dict[str, object]) -> List[Finding]:
    findings: List[Finding] = []
    for path in _scan_files():
        rel = path.relative_to(ROOT).as_posix()
        exemptions = EXEMPT.get(rel, {})
        lines = path.read_text(encoding="utf-8", errors="replace").split("\n")
        historical, problems = _historical_lines(lines, rel)
        for msg in problems:
            f, ln = msg.rsplit(":", 1)[0], int(msg.split(":")[1].split()[0])
            findings.append(Finding("marker", rel, ln, "HISTORICAL",
                                    msg.split(" ", 1)[1], "a closed marker with a stated reason", ""))
        def judge(fig: Figure, text: str, m, line_no: int, display: str):
            """One match, judged. Returns a Finding when it is drift, else None."""
            drift = _drift(fig, text, m, truth)
            if drift is None:
                return None
            return Finding("figure", rel, line_no, fig.id, drift[0], drift[1], display)

        for fig in FIGURES:
            if fig.id in exemptions:
                continue
            for i, line in enumerate(lines, 1):
                if i in historical:
                    continue
                for m in re.finditer(fig.pattern, line):
                    found = judge(fig, line, m, i, line.strip()[:150])
                    if found:
                        findings.append(found)
            # Second pass — figures that straddle a hard wrap.
            #
            # Prose here is wrapped at ~80 characters, and a line-by-line scan
            # cannot see a claim split across the fold. "35 regex" ended one line
            # and "constraints" began the next in a *public* triage document, so
            # that count sat seven wrong for as long as this gate had existed
            # while the gate called the file clean. Any figure is one unlucky
            # wrap away from the same fate, so this is not a special case.
            #
            # Only matches crossing the join are reported: anything contained in
            # either line was judged above, and reporting it twice teaches a
            # reader to skim the output.
            for i in range(1, len(lines)):
                if i in historical or i + 1 in historical:
                    continue
                first, second = lines[i - 1], lines[i]
                # A blank line ends a paragraph. Joining across one invents a
                # sentence nobody wrote.
                if not first.strip() or not second.strip():
                    continue
                # In a block comment every continuation line carries a leader,
                # so "obeys 53" / " * constraints" joins to "53  * constraints"
                # and no pattern matches across it. Stripped only for source
                # files: in markdown a leading "*" starts a list item, and
                # joining a sentence onto a bullet would invent a claim.
                if path.suffix not in {".md", ".html"}:
                    second = re.sub(r"^\s*(?:\*|//|#)\s?", "", second)
                joined = f"{first} {second}"
                for m in re.finditer(fig.pattern, joined):
                    if m.start() >= len(first) or m.end() <= len(first) + 1:
                        continue
                    found = judge(fig, joined, m, i, joined.strip()[:150])
                    if found:
                        findings.append(found)
    return findings


# ── Check 2 — arithmetic consistency ─────────────────────────────────────────

# `A → B` (or "A to B") followed closely by a stated delta. The lookahead is
# tight on purpose: a wide window starts pairing unrelated numbers, and a gate
# that cries wolf gets muted.
_TRANSITION = rf"(?<![\d,])(\d{{1,3}},\d{{3}})\s*(?:→|->|to)\s*\*{{0,2}}(\d{{1,3}},\d{{3}})\*{{0,2}}"
# `(?<![\d,])` on the delta matters: without it, `4,143 → 2,689–3,593 tokens`
# pairs the endpoints with the "593" tail of the second range and reports an
# impossible delta of its own making. `(?!\s*each)` matters for the same reason
# in the other direction — "about 51 tokens each" is a per-item figure, and
# reading it as the total makes the gate's message wrong even when its verdict
# is right.
# The `\b` after `tokens?` is load-bearing: without it the optional `s` lets
# the match end at "token", and the `each` lookahead then inspects "s each"
# instead of " each" and passes something it was written to reject.
_DELTA = r"\*{0,2}\+?(?<![\d,])(\d{1,4})\*{0,2}\s*(?:tokens?\b|for both)(?!\s*each)"

_ARITH = (
    # `1,895 → 2,018 … 103 tokens`
    re.compile(_TRANSITION + rf"[^.\n]{{0,60}}?{_DELTA}"),
    # `cost 103 tokens. The registry went 1,895 → 2,002` — the same claim
    # written backwards, which is how README states it. This one crosses a
    # sentence boundary, so the window is tighter to bound the risk of pairing
    # two numbers that were never about each other.
    re.compile(rf"{_DELTA}[^\n]{{0,50}}?{_TRANSITION}"),
)


def check_arithmetic() -> List[Finding]:
    findings: List[Finding] = []
    for path in _scan_files():
        rel = path.relative_to(ROOT).as_posix()
        if "ARITHMETIC" in EXEMPT.get(rel, {}):
            continue
        for i, line in enumerate(path.read_text(encoding="utf-8", errors="replace").split("\n"), 1):
            seen = set()
            for order, pat in enumerate(_ARITH):
                for m in pat.finditer(line):
                    g = m.groups()
                    claimed, a, b = (g[2], g[0], g[1]) if order == 0 else (g[0], g[1], g[2])
                    a, b, claimed = int(a.replace(",", "")), int(b.replace(",", "")), int(claimed)
                    if b - a == claimed or (a, b, claimed) in seen:
                        continue
                    seen.add((a, b, claimed))
                    findings.append(Finding(
                        "arithmetic", rel, i, "DELTA",
                        f"{a:,} → {b:,} stated as {claimed}", f"{b - a}",
                        line.strip()[:150],
                    ))
    return findings


# A pass ratio: "229 of 229 tests", "45/45 files", "22/22 eval cases". These
# documents only ever report a green run — the whole point of Gate 7 is that a
# red suite blocks the build, so a released document cannot honestly say some
# fraction passed. The two halves must therefore be equal, and that is checkable
# without knowing what the number should be.
_RATIO = re.compile(
    r"(?<![\d,])(\d{1,4})\s*(?:of|/)\s*(\d{1,4})\s+"
    r"(tests?|test files?|files|eval cases?|golds?)\b"
)

# …except when the ratio is narrating a failure, where an unequal one is the
# whole content. "29 of 39 files died before running a single assertion" and
# "28 of 37 test files fail at import time" are both true records of a red run;
# correcting them to 39/39 and 37/37 would erase the history the passage exists
# to keep. Both surfaced on the first run of this check.
_RATIO_OK_IF = re.compile(
    r"\b(fail\w*|died?|broke\w*|crash\w*|error\w*|regress\w*)\b|\b(?:did|could|would)\s+not\b",
    re.I,
)

# The suppressor is tested against a window around the match, not the whole
# line. These paragraphs run to 400 characters, and a line-wide test let
# "What the suite does and does not prove" — a clause 200 characters away about
# something else entirely — silence a genuinely wrong ratio in the README.
_RATIO_WINDOW = 40


def check_pass_ratios() -> List[Finding]:
    """
    Catch "205 of 229 tests" — a claim that 24 tests fail, in a document whose
    sentence says the suite passes.

    This is the shape a blanket substitution leaves behind. When the suite grew,
    a search-and-replace moved the total and left the numerator on the old
    value, and the result read as a two-thirds-green build in the README, in
    TESTING.md and twice in ARCHITECTURE.md. No anchored figure could catch it:
    the gate would have to know the true test count, and counting tests
    statically means parsing `it.each` and loops. Equality needs no such
    knowledge, and it is exactly the property that was violated.
    """
    findings: List[Finding] = []
    for path in _scan_files():
        rel = path.relative_to(ROOT).as_posix()
        if "RATIO" in EXEMPT.get(rel, {}):
            continue
        lines = path.read_text(encoding="utf-8", errors="replace").split("\n")
        historical, _ = _historical_lines(lines, rel)
        for i, line in enumerate(lines, 1):
            if i in historical:
                continue
            for m in _RATIO.finditer(line):
                passed, total, noun = m.group(1), m.group(2), m.group(3)
                if passed == total:
                    continue
                near = line[max(0, m.start() - _RATIO_WINDOW):m.end() + _RATIO_WINDOW]
                if _RATIO_OK_IF.search(near):
                    continue
                findings.append(Finding(
                    "ratio", rel, i, "PASS-RATIO",
                    f"{passed} of {total} {noun}", f"{total} of {total} {noun}",
                    line.strip()[:150],
                ))
    return findings


# ── Check 3 — metadata.json vs the filesystem ────────────────────────────────

def check_metadata(truth: Dict[str, object]) -> List[Finding]:
    meta = json.loads((ROOT / "metadata.json").read_text(encoding="utf-8"))
    stats = meta.get("stats", {})
    findings: List[Finding] = []
    for key in ("skills", "reference_files", "core_files", "example_files",
                "anti_examples", "test_files", "release_gates",
                "parser_constraints", "regex_constraints", "ci_constraints",
                "registry_tokens", "reference_depth_tokens"):
        if key not in stats:
            continue
        if stats[key] != truth[key]:
            findings.append(Finding(
                "metadata", "metadata.json", 0, key,
                str(stats[key]), str(truth[key]),
                f'"{key}": {stats[key]}',
            ))

    # The prose `description` — the string a host surfaces above every stat in
    # the block above, and the one nothing checked. It shipped inside the
    # archive claiming 94 references and *10* release-blocking gates while the
    # `stats` two keys below it read 101 and 11. Audited here rather than
    # through SCAN because the file's `changelog` is history and must not be
    # rewritten to match today's figures.
    for field in ("description",):
        prose = meta.get(field)
        if not isinstance(prose, str):
            continue
        for fig in FIGURES:
            for m in re.finditer(fig.pattern, prose):
                drift = _drift(fig, prose, m, truth)
                if drift:
                    findings.append(Finding(
                        "metadata", "metadata.json", 0, fig.id,
                        drift[0], drift[1], f'"{field}": …{m.group(0)}…',
                    ))
    return findings


# ── Check 3b — the landing page's fixture vs the source it cites ─────────────

_FIXTURE = Path("demo/landing-page/screenshot-fixture.json")
_STATS_KEY = re.compile(r"stats\.(\w+)")


def check_landing_fixture() -> List[Finding]:
    """`demo/landing-page` renders four figures from a committed fixture, and
    every entry names the `metadata.json` key it was copied from.

    That provenance is the whole check: read the key each entry cites and
    compare. Nothing else here could — the figure lives in a `"value"` string
    with its noun in a sibling `"label"`, so the prose patterns that catch
    "11 gates" in markdown see two unrelated JSON fields and pass. The fixture
    sat one behind on `release_gates` through the release that added Gate 11,
    and was published as the pack's own homepage saying so.
    """
    path = ROOT / _FIXTURE
    if not path.is_file():
        return []
    stats = json.loads((ROOT / "metadata.json").read_text(encoding="utf-8")).get("stats", {})
    fixture = json.loads(path.read_text(encoding="utf-8"))
    findings: List[Finding] = []

    for metric in fixture.get("metrics", []):
        key_match = _STATS_KEY.search(str(metric.get("source", "")))
        if not key_match or key_match.group(1) not in stats:
            continue
        key = key_match.group(1)
        shown = str(metric.get("value", "")).replace(",", "").strip()
        expected = str(stats[key])
        if shown != expected:
            findings.append(Finding(
                "fixture", _FIXTURE.as_posix(), 0, f'{metric.get("label", key)} ({key})',
                str(metric.get("value")), f"{int(expected):,}" if expected.isdigit() else expected,
                f'cites metadata.json → stats.{key}',
            ))
    return findings


# ── Check 3c — summary tables, read by their own header row ──────────────────

# Header cell -> the truth key that column is claiming. Only unambiguous names:
# a column headed "Files" or "Total" could mean anything and is skipped.
_TABLE_COLUMNS: Dict[str, str] = {
    "skills": "skills",
    "references": "reference_files",
    "depth": "reference_depth_tokens",
    "always loaded": "registry_tokens",
    "constraints": "ci_constraints",
    "gates": "release_gates",
    "core": "core_files",
    "examples": "example_files",
    "tests": "test_files",
}
_CELL_NUM = re.compile(r"(\d[\d,]*)")


def check_summary_tables(truth: Dict[str, object]) -> List[Finding]:
    """A markdown table states its figures in cells, and the noun is in the
    header row rather than beside the number.

    Every other check here keys on an adjacent word — "N gates", "N tokens of
    depth". That works in prose and fails completely on `| **19** | **94** |`,
    where the cell holds a bare number and the only thing identifying it sits a
    row above. The README's headline table carried two wrong figures — 94
    references and 2,018 registry tokens — through a green chain, in the most
    widely read table in the project, while the two cells beside them that
    happen to carry the word "tokens" were caught and corrected.

    So: read the header, map each column to a figure, and check the row beneath.
    """
    findings: List[Finding] = []
    for path in _scan_files():
        rel = path.relative_to(ROOT).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        lines = text.replace("\r\n", "\n").split("\n")
        # Marked historical regions are exempt here for the same reason they are
        # everywhere else: a table inside one is a record of what was true then.
        historical, _ = _historical_lines(lines, rel)
        for i, line in enumerate(lines):
            if line.count("|") < 3:
                continue
            heads = [c.strip().strip("*` ").lower() for c in line.strip().strip("|").split("|")]
            cols = {n: _TABLE_COLUMNS[h] for n, h in enumerate(heads) if h in _TABLE_COLUMNS}
            # Need at least two recognised columns; one is too weak a signal and
            # would fire on any table with a "Gates" column of prose.
            if len(cols) < 2 or i + 2 >= len(lines):
                continue
            if not set(lines[i + 1].strip()) <= set("|-: "):
                continue          # row after the header must be the separator
            if (i + 3) in historical:
                continue
            cells = [c.strip() for c in lines[i + 2].strip().strip("|").split("|")]
            for n, key in cols.items():
                if n >= len(cells) or key not in truth:
                    continue
                m = _CELL_NUM.search(cells[n])
                if not m:
                    continue
                shown = m.group(1).replace(",", "")
                expected = str(truth[key])
                if shown != expected:
                    findings.append(Finding(
                        "table", rel, i + 3, f"{heads[n]} ({key})",
                        m.group(1), f"{int(expected):,}",
                        lines[i + 2].strip()[:110],
                    ))
    return findings


# ── Check 4 — the two changelogs agree ───────────────────────────────────────

def check_changelog_sync() -> List[Finding]:
    """`metadata.json`'s changelog dict and `docs/CHANGELOG.md` are two records
    of one history. They drifted apart across two concurrent-session merges —
    the dict lost 14.7.1 and 14.7.2 while the markdown kept both — and the chain
    stayed green twice, because nothing compared them.
    """
    meta = json.loads((ROOT / "metadata.json").read_text(encoding="utf-8"))
    in_meta = set(meta.get("changelog", {}))
    md = (ROOT / "docs" / "CHANGELOG.md").read_text(encoding="utf-8")
    in_md = set(re.findall(r"^##\s*\[(\d+\.\d+\.\d+)\]", md, re.M))
    findings: List[Finding] = []
    if not in_meta or not in_md:
        return findings

    def key(v: str) -> tuple:
        return tuple(int(x) for x in v.split("."))

    # The dict is a selective summary of notable releases, not a full mirror —
    # it does not carry every patch back to 12.x and should not be made to. The
    # failure it actually suffered was narrower: it kept the first and last
    # entries of a patch series and silently lost the two in between, across two
    # concurrent-session merges. (Naming those versions here would trip the
    # pre-flight version-leak scan, which is its own kind of gate working.) So
    # the rule is contiguity within the *current minor series* plus the head,
    # which is exactly the shape of that failure and nothing wider.
    head_md = max(in_md, key=key)
    series = key(head_md)[:2]
    for v in sorted(in_md - in_meta, key=key):
        if key(v)[:2] == series:
            findings.append(Finding(
                "changelog", "metadata.json", 0, "changelog",
                f"{v} missing — a hole in the current {series[0]}.{series[1]}.x series",
                f"every {series[0]}.{series[1]}.x release recorded", f"## [{v}]",
            ))
    for v in sorted(in_meta - in_md, key=key):
        findings.append(Finding(
            "changelog", "docs/CHANGELOG.md", 0, "changelog",
            f"{v} recorded in metadata.json but absent from the changelog",
            "present in both", f'"{v}"',
        ))
    if head_md not in in_meta:
        findings.append(Finding(
            "changelog", "metadata.json", 0, "changelog",
            f"latest release {head_md} has no metadata.json changelog entry",
            "the head release is always recorded", f"## [{head_md}]",
        ))
    return findings


# ── Report ───────────────────────────────────────────────────────────────────

def main() -> None:
    truth = compute_truth()

    if "--truth" in sys.argv:
        budgets = truth.pop("budgets")
        print(json.dumps(truth, indent=2))
        print("\nper-skill request budgets (registry + skill + declared deps):")
        for name, v in sorted(budgets.items(), key=lambda kv: kv[1]):
            print(f"  {name:20} {v:>6,}")
        sys.exit(0)

    findings = (check_anchored(truth) + check_arithmetic() + check_pass_ratios()
                + check_metadata(truth) + check_landing_fixture()
                + check_summary_tables(truth) + check_changelog_sync())

    if "--json" in sys.argv:
        print(json.dumps([f._asdict() for f in findings], indent=2))
        sys.exit(1 if findings else 0)

    n_files = len(_scan_files())
    print(f"\n[FIGURES] {len(FIGURES)} anchored figures + arithmetic + metadata "
          f"+ landing fixture + summary tables + changelog sync, over "
          f"{n_files} claim surfaces\n")

    if findings:
        by_file: Dict[str, List[Finding]] = {}
        for f in findings:
            by_file.setdefault(f.file, []).append(f)
        for fname in sorted(by_file):
            print(f"  {fname}")
            for f in by_file[fname]:
                loc = f":{f.line}" if f.line else ""
                print(f"      {f.figure}{loc}  found {f.found}  ·  expected {f.expected}")
                if f.context:
                    print(f"          {f.context}")
            print()

    print(f"[FIGURES] {len(findings)} drift(s) · {n_files} files scanned · "
          f"registry {truth['registry_tokens']:,} · "
          f"band {truth['band_low']:,}–{truth['band_high']:,} · "
          f"{truth['skills']} skills · {truth['release_gates']} gates")
    sys.exit(1 if findings else 0)


if __name__ == "__main__":
    main()
