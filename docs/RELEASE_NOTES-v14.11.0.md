# Release Notes — frontend-design-pro v14.11.0

**Date:** 2026-08-21
**Archive:** `frontend-design-pro-v14.11.0.skill` — 2069 KB, 406 files, ~511,838 tokens of markdown, root `frontend-design-pro/`
**Pipeline wall-clock:** 117.2s

> Those archive figures describe the file **this run produced**, on the machine it ran on.
> A local build can differ from the published one — line endings and any untracked working-tree
> file move the byte count and the file count. The asset attached to the GitHub release is the
> authoritative artifact; where the two disagree, believe the asset. Everything below this line
> is recomputed from the repository and is identical either way.

## Contents

19 skills · 8 core files · 104 references (371,905 tokens of on-demand depth) · 55 examples (45 gold + 10 anti-examples) · 45 tests · 60 constraints (17 semantic + 43 syntactic)

Registry (`SKILL.md`) is 2,099 tokens and is the only file always loaded.

## Gate Results

| Gate | Result | Detail |
|------|--------|--------|
| Compile | PASS | All 55 gold examples compile under tsc --noEmit (strict) · 20 demo files clean |
| Semantic | PASS | 65/65 files (45 golds + 20 demo) pass 17/17 parser checks |
| Syntactic | PASS | gold examples clean, anti-examples fail as designed (43/43) · demos clean |
| References | PASS | 19 ban-shaped constraints over fenced code in every reference, skill and core file (0 violations) |
| Figures | PASS | 96 claim surfaces, figures derived from the filesystem (0 drifts) |
| Pipeline | PASS | 16/16 checks (stages · architecture · cited paths) |
| Evals | PASS | 22/22 self-test |
| Test coverage | PASS | 45/45 golds have a 1:1 test; all compile strict; 45/45 files · 232/232 tests pass |
| Regression | PASS | 14/14 synthetic cases |
| Figure patterns | PASS | 76 prose fixtures, both directions |

Plus pre-flight, frontmatter, path integrity, and per-skill budget gates — all blocking.

## Known gaps

See [ARCHITECTURE.md](ARCHITECTURE.md#known-gaps). Summary: the suite runs against
`test/stubs/`, not the examples' ~25 real peer libraries, so it proves the components
mount, expose the roles they claim and survive axe — not that they work against the
real `three` or `react-hook-form`; and reference depth is unevenly distributed across
skills.

## Install

```bash
unzip frontend-design-pro-v14.11.0.skill -d ~/.claude/skills/
```

See [INSTALL.md](INSTALL.md) and [USAGE.md](USAGE.md).

---

All gates passed. No manual changes were made after gate passage — the archive is a
deterministic product of a clean `origin/main` checkout (Stage 4.5 refuses to build from
anything else), re-verified against its own unzipped copy for both compilation and
content (Stage 6).

Released by: build_release.py
