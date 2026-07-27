# Release Notes — frontend-design-pro v14.1.0

**Date:** 2026-07-27
**Archive:** `frontend-design-pro-v14.1.0.skill` — 867 KB, 221 files, ~339,550 tokens of markdown, root `frontend-design-pro/`
**Pipeline wall-clock:** 66.2s

## Contents

15 skills · 8 core files · 70 references (295,126 tokens of on-demand depth) · 43 examples (37 gold + 6 anti-examples) · 37 tests · 51 constraints (16 semantic + 35 syntactic)

Registry (`SKILL.md`) is 1,770 tokens and is the only file always loaded.

## Gate Results

| Gate | Result | Detail |
|------|--------|--------|
| Compile | PASS | All 43 gold examples compile under tsc --noEmit (strict) |
| Semantic | PASS | 37/37 golds pass 16/16 parser checks |
| Syntactic | PASS | gold examples clean, anti-examples fail as designed (35/35) |
| Pipeline | PASS | 9/9 stage markers |
| Evals | PASS | 22/22 self-test |
| Test coverage | PASS | 37/37 golds have a 1:1 test; all test files compile strict (runtime exec out of scope — examples stub their peer deps) |
| Regression | PASS | 11/11 synthetic cases |

Plus pre-flight, frontmatter, path integrity, and per-skill budget gates — all blocking.

## Known gaps

See [ARCHITECTURE.md](ARCHITECTURE.md#known-gaps). Summary: `AGENT_SYSTEM_PROMPT.md`
predates the registry and `SKILL.md` supersedes it; the vitest suite does not execute
end-to-end because examples stub ~25 peer libraries, so Gate 7 asserts 1:1 coverage
plus strict compilation rather than implying more.

## Install

```bash
unzip frontend-design-pro-v14.1.0.skill -d ~/.claude/skills/
```

See [INSTALL.md](INSTALL.md) and [USAGE.md](USAGE.md).

---

All gates passed. No manual changes were made after gate passage — the archive is a
deterministic product of the working tree, re-verified against its own unzipped copy
(Stage 6).

Released by: build_release.py
