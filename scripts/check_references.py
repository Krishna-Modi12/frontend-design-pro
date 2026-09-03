#!/usr/bin/env python3
"""
Frontend Design Pro — Reference Constraint Gate (Gate 10)

The blind spot this closes
--------------------------
`test_constraints.py` globs `*.jsx *.tsx *.html *.js *.ts`. Markdown is not in
that list, so until this gate existed the reference files — the overwhelming
majority of the pack by volume, and the part an agent actually loads for depth —
were read by no gate at all. The constraints ran over the example files, which
are a low single-digit percentage of the corpus.

(Counts are deliberately not stated here. This docstring is not one of Gate 11's
claim surfaces, so a figure written into it goes stale silently — which is what
happened to the two that used to be in this paragraph.)

That is backwards. An example is a demonstration; a reference is an instruction.
When `glassmorphism.md` prescribed `min-h-screen bg-gradient-to-br
from-violet-500 via-purple-500 to-pink-500` under a heading reading "Must have",
an agent held that text and SKILL.md's wall banning both in the same context
window, and had to pick a side. This gate makes the corpus agree with the wall.

What it checks, and what it deliberately does not
-------------------------------------------------
Constraints are imported from `test_constraints.py` — one definition, no drift.
Only the BAN-shaped ones are applied (see FRAGMENT_SAFE): a rule like "has a
default export" or "declares a font" is a property of a whole file, and a 9-line
snippet that omits it is correct, not defective. Running presence checks against
fragments would produce noise, and a noisy gate gets muted.

Anti-example blocks are skipped. A reference that shows `React.FC` under
`// Bad —` is teaching the rule, not breaking it, and flagging it would invert
the lesson. A block carrying both a bad and a good half is skipped whole: that
loses a little coverage and costs no false positives, which is the right trade
for a gate meant to stay trusted.

Usage:
  python scripts/check_references.py            # every reference + skill + core file
  python scripts/check_references.py --json     # machine-readable
  python scripts/check_references.py <file.md>  # one file
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, NamedTuple

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_constraints import CONSTRAINTS  # noqa: E402  single source of truth

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

REPO = Path(__file__).resolve().parent.parent

# Ban-shaped constraints only. Each of these can be violated by a fragment;
# none can be failed by a fragment merely for being short.
FRAGMENT_SAFE = {
    "TYP-02",    # banned display font
    "COL-01",    # #000000 as surface
    "COL-03",    # purple→pink→blue gradient
    "COL-04",    # arbitrary [#hex]
    "TOK-01",    # hex in token definition
    "TOK-02",    # hex inside @theme
    "RES-03",    # min-h-screen
    "TS-02",     # React.FC
    "PLAT-01",   # onPress on web
    "SLOP-01",   # John/Jane Doe
    "SLOP-02",   # Elevate/Seamless/Unleash
    "QUA-03",    # lorem ipsum
    "DELAY-01",  # mount-time fake loader
    "MOTION-02R",  # bounce/elastic/back easing
    "PERF-04R",  # transition-all
    "COPY-02",   # "Loading..." instead of "Loading…"
    "A11Y-06",   # outline-none with no focus indicator
    "TYP-03",    # bg-clip-text on body copy
    "FORM-01",   # input below 16px — iOS zoom trap
}

# Fenced languages that carry shippable UI code. `bash`, `json`, `text`, `diff`
# and `css`-in-prose are not component code and are not judged as such.
CODE_LANGS = {"tsx", "jsx", "ts", "js", "typescript", "javascript", "html"}

# Blocks whose lesson IS the violation.
ANTI_MARKERS = re.compile(
    r"❌|✗|//\s*Bad\b|/\*\s*Bad\b|\bBad\s*[—–-]|\bAnti-?pattern|\bNever\b|\bWrong\b"
    r"|\bAvoid\b|\bDon't\b|\bDo not\b|\bInstead of\b|\bbroken\b",
    re.IGNORECASE,
)

# Exemptions are per-file and per-constraint, and every one carries the reason it
# is not a defect. A blanket file skip would hide real findings in the same file.
EXEMPT: Dict[str, Dict[str, str]] = {
    "skills/platform/references/mobile-patterns.md": {
        "A11Y-06": "Vaul Drawer.Content is a focus-trapped dialog container: it takes "
                   "programmatic focus on open so the trap works, and a ring on the "
                   "sheet itself is noise. The indicator belongs on the controls inside, "
                   "which carry their own focus-visible styles",
    },
    "skills/platform/references/react-native.md": {
        "COL-04": "React Native StyleSheet has no OKLCH and no Tailwind arbitrary values; hex is the only expressible form",
        "TOK-01": "same — RN colour literals are not CSS custom properties",
        "PLAT-01": "onPress IS the React Native handler; the wall bans it on web",
        "RES-03": "no Tailwind screen utilities in RN; any match is prose",
    },
    "skills/platform/references/email-templates.md": {
        "COL-04": "HTML email renders in Outlook/Gmail, which support neither OKLCH nor CSS custom properties; hex is required",
        "TOK-01": "same — inline hex is the only portable colour in email",
        "TYP-02": "Outlook ignores @font-face, so Arial/Helvetica are the correct choice here rather than the lazy one",
    },
    "skills/design-system/references/brand-core.md": {
        "COL-04": "documentary — records the hex real design systems publish; converting it would falsify the citation",
    },
    "skills/design-system/references/brand-extended.md": {
        "COL-04": "documentary — see brand-core.md",
    },
    "skills/design-system/references/brand-design-systems.md": {
        "COL-04": "documentary — see brand-core.md",
    },
    "skills/design-system/references/figma-to-code.md": {
        "COL-04": "hex is the INPUT side of the translation; Figma emits hex and the file's subject is converting it",
        "TOK-01": "same",
    },
}


class Finding(NamedTuple):
    file: str
    line: int
    constraint: str
    severity: str
    evidence: str


class Block(NamedTuple):
    line: int
    lang: str
    code: str


def extract_blocks(text: str) -> List[Block]:
    """Fenced code blocks, with the 1-indexed line the fence opens on."""
    blocks: List[Block] = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        m = re.match(r"^\s*```+\s*([A-Za-z0-9+#-]*)\s*$", lines[i])
        if not m:
            i += 1
            continue
        lang = m.group(1).lower()
        start = i
        i += 1
        body: List[str] = []
        while i < len(lines) and not re.match(r"^\s*```+\s*$", lines[i]):
            body.append(lines[i])
            i += 1
        i += 1  # step past the closing fence
        if lang in CODE_LANGS:
            blocks.append(Block(line=start + 1, lang=lang, code="\n".join(body)))
    return blocks


def is_anti_example(text: str, block: Block) -> bool:
    """True when the block, or the prose introducing it, marks it as the wrong way."""
    lines = text.splitlines()
    lead_start = max(0, block.line - 5)
    lead = "\n".join(lines[lead_start : block.line - 1])
    head = "\n".join(block.code.splitlines()[:4])
    return bool(ANTI_MARKERS.search(lead) or ANTI_MARKERS.search(head))


def check_file(path: Path) -> List[Finding]:
    rel = path.relative_to(REPO).as_posix()
    text = path.read_text(encoding="utf-8")
    exempt = EXEMPT.get(rel, {})
    findings: List[Finding] = []

    for block in extract_blocks(text):
        if is_anti_example(text, block):
            continue
        for c in CONSTRAINTS:
            if c.id not in FRAGMENT_SAFE or c.id in exempt:
                continue
            passed, evidence = c.check(block.code)
            if not passed:
                findings.append(
                    Finding(rel, block.line, c.id, c.severity, evidence)
                )
    return findings


def targets() -> List[Path]:
    paths: List[Path] = []
    paths.extend(sorted((REPO / "skills").rglob("*.md")))
    paths.extend(sorted((REPO / "core").glob("*.md")))
    return [p for p in paths if "node_modules" not in p.parts]


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--json"]
    json_out = "--json" in sys.argv[1:]

    files = [Path(a).resolve() for a in args] if args else targets()

    findings: List[Finding] = []
    for f in files:
        findings.extend(check_file(f))

    if json_out:
        print(json.dumps([f._asdict() for f in findings], indent=2))
    else:
        print(f"\n[REFS] scanning {len(files)} markdown files for shippable code blocks\n")
        if not findings:
            print("  ✓ no constraint violations in prescriptive reference code")
        else:
            by_file: Dict[str, List[Finding]] = {}
            for f in findings:
                by_file.setdefault(f.file, []).append(f)
            for name in sorted(by_file):
                print(f"  {name}")
                for f in by_file[name]:
                    print(f"    ✗ line {f.line:>5}  [{f.constraint}] {f.evidence}")
                print()
        n_exempt = sum(len(v) for v in EXEMPT.values())
        print(
            f"\n[REFS] {len(findings)} violation(s) · "
            f"{len(FRAGMENT_SAFE)} ban-shaped constraints applied · "
            f"{n_exempt} documented exemption(s)"
        )

    sys.exit(1 if findings else 0)


if __name__ == "__main__":
    main()
