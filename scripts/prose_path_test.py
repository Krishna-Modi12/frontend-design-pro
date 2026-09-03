#!/usr/bin/env python3
"""Proof that Stage 3's prose-path check resolves the forms people write.

`markdown_links()` strips inline code spans so that prose *quoting* a bad link
is not read as making one. The cost of that rule was a blind spot the size of
the corpus: this pack cites its own files in backticks far more often than in
link form, and until `prose_paths()` existed not one of those pointers was read
by anything. Fourteen were dead when the check was written — three in
`payments.md` alone, pointing at another skill's directory since the day it was
authored, and four more found by hand in `motion-budget.md` and `react-bits.md`.

The hard half is not detection, it is not crying wolf. A citation resolves under
six different forms the pack genuinely uses, and a check that understood only
one of them would have shouted about ~250 correct sentences on its first run —
which is how a gate gets muted and then deleted.

So the negatives here carry as much weight as the positives:

  * a bare `motion.md` is shorthand for "the reference named motion", resolved
    by the reader against the skill's own Reference Index. It is not a path and
    must never be judged as one.
  * `frontend-design-pro/SKILL.md` is where the pack lives after the archive is
    unzipped. Every install document says it, and none of them is wrong.
  * `_meta/CHANGELOG.md` is real — in the archive. `build_release.py` relocates
    `docs/CHANGELOG.md` there, so the citation is correct and the repo path
    simply is not the shipped one.
  * `skills/{id}/SKILL.md` and `references/foo.md` are schema slots in prose
    about the layout. They name files that are not supposed to exist.

Fixtures are synthetic paths against a synthetic tree, not today's real files:
a test pinned to the live corpus would fail on the first release that renames a
reference, and would be deleted the first time it did.

Run: python scripts/prose_path_test.py   (or `npm run paths:test`)
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import build_release as br  # noqa: E402

# A miniature pack, laid out exactly as the real one is.
TREE = [
    "SKILL.md",
    "core/agent-behavior.md",
    "docs/ARCHITECTURE.md",
    "docs/CHANGELOG.md",
    "skills/animations/SKILL.md",
    "skills/animations/references/motion.md",
    "skills/animations/references/motion-budget.md",
    "skills/design-system/references/styles/soft.md",
    "skills/forms/references/auth-patterns.md",
]

# (citing file, cited path, must_resolve, why)
CASES = [
    # ── the six accepted forms ──────────────────────────────────────────────
    ("skills/animations/references/motion.md", "core/agent-behavior.md",
     True, "pack-rooted: a core file cited from inside a reference"),
    ("skills/animations/references/motion.md", "docs/ARCHITECTURE.md",
     True, "pack-rooted: a docs file cited from inside a reference"),
    ("skills/forms/references/auth-patterns.md", "animations/references/motion.md",
     True, "skill-rooted: cross-skill, the form 63 sites already use"),
    ("skills/animations/references/motion.md", "references/motion-budget.md",
     True, "skill-dir: this skill's own references/, written from inside it"),
    ("skills/animations/references/motion.md", "../../forms/references/auth-patterns.md",
     True, "relative: the older spelling, still resolvable and left alone"),
    ("docs/ARCHITECTURE.md", "frontend-design-pro/SKILL.md",
     True, "install-rooted: where the pack lives once the archive is unzipped"),
    ("docs/ARCHITECTURE.md", "_meta/CHANGELOG.md",
     True, "archive: docs/CHANGELOG.md is relocated there by build_release.py"),
    ("skills/animations/references/motion.md",
     "design-system/references/styles/soft.md",
     True, "skill-rooted into a NESTED references dir — design-system has one"),

    # ── placeholders: prose about the layout, not citations ─────────────────
    ("docs/ARCHITECTURE.md", "skills/new-skill/SKILL.md",
     True, "the worked example in 'how to add a skill'"),
    ("skills/animations/references/motion.md", "references/foo.md",
     True, "'read references/foo.md only once you know the task needs foo'"),
    ("skills/animations/references/motion.md", "skills/a/b/c/SKILL.md",
     True, "illustrating nesting depth, not naming a file"),

    # ── the defects it exists to catch ──────────────────────────────────────
    ("skills/forms/references/auth-patterns.md", "references/motion.md",
     False, "cross-skill written in the same-skill spelling — the payments.md bug"),
    ("skills/animations/references/motion.md", "styles/soft.md",
     False, "nested dir with the owning skill dropped — the phosphor.md bug"),
    ("docs/ARCHITECTURE.md", "references/motion.md",
     False, "'references/x.md' means nothing from docs/ — no skill in scope"),
    ("skills/animations/references/motion.md", "animations/references/gone.md",
     False, "well-formed and skill-rooted, but the file was deleted"),
    ("skills/animations/references/motion.md", "design-research/references/motion.md",
     False, "right filename, wrong skill named — the INGESTION_REVIEW.md bug"),
    ("docs/ARCHITECTURE.md", "frontend-design-pro/core/gone.md",
     False, "install-rooted at a file the archive will not contain"),
    ("skills/animations/references/motion.md", "docs/architecture.md",
     False, "wrong case — resolves on Windows/macOS, 404s on the Linux that "
            "reads the archive; `docs/install.md` shipped exactly this way"),
    ("skills/animations/references/motion.md", "animations/References/motion.md",
     False, "wrong case in a middle segment, not just the filename"),

    # ── load-bearing negatives: things that must NOT be judged ──────────────
    ("skills/animations/references/motion.md", "motion-budget.md",
     None, "bare sibling filename — not path-shaped, never judged"),
    ("skills/animations/references/motion.md", "harden.md",
     None, "bare name that resolves nowhere — still not path-shaped"),
    ("docs/ARCHITECTURE.md", "SKILL.md",
     None, "20 files share this name; judging it would be a coin flip"),
    ("docs/ARCHITECTURE.md", "skills/{id}/SKILL.md",
     None, "a `{...}` slot is a template, not a path — braces never resolve"),
]


def build(root: Path) -> None:
    for rel in TREE:
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text("x", encoding="utf-8")


def main() -> int:
    failures: list[str] = []
    with tempfile.TemporaryDirectory() as td:
        root = Path(td).resolve()
        build(root)
        original = br.ROOT
        br.ROOT = root
        try:
            for citing, cited, must_resolve, why in CASES:
                f = root / citing
                shaped = bool(br._PROSE_PATH.search(f"`{cited}`"))
                if must_resolve is None:
                    if shaped:
                        failures.append(
                            f"  judged a non-path: `{cited}`\n      {why}")
                    continue
                if not shaped:
                    failures.append(
                        f"  not recognised as a path: `{cited}`\n      {why}")
                    continue
                got = br._resolve_prose_path(cited, f) is not None
                if got != must_resolve:
                    verb = "called dead" if must_resolve else "wrongly resolved"
                    failures.append(
                        f"  {verb}: `{cited}` cited from {citing}\n      {why}")
        finally:
            br.ROOT = original

    forms = sum(1 for c in CASES if c[2] is True)
    dead = sum(1 for c in CASES if c[2] is False)
    skipped = sum(1 for c in CASES if c[2] is None)
    print(f"[PROSE-PATHS] {len(CASES)} citation fixtures — "
          f"{forms} resolvable, {dead} dead, {skipped} not path-shaped")
    if failures:
        print(f"\n[PROSE-PATHS] {len(failures)} failure(s):\n")
        print("\n".join(failures))
        return 1
    print("[PROSE-PATHS] pass — every form resolved, every dead pointer caught, "
          "every shorthand spared")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
