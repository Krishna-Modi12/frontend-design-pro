---
name: Bug report
about: Something is broken in the skill pack
title: "[BUG] "
labels: bug
---

> Bugs are exempt from the [feature freeze](../../docs/MAINTENANCE.md) — a confirmed defect gets fixed, and five of them lift the freeze entirely. Report it even if you are not sure it is a bug.

## Which file is wrong?

Path to the skill, reference, or example (e.g. `skills/forms/SKILL.md`, `skills/design-system/references/brand-design-systems.md`, `skills/react-components/examples/good-modal.tsx`):

## What should it say/do?

## What does it actually say/do?

## Which gate catches this?

If you ran `python scripts/build_release.py --dry-run`, which of the 11 gates flagged it (or should have, but didn't)? Check all that apply.

- [ ] 1 — Pre-flight (`SKILL.md` token ceiling, version consistency, no version leaks)
- [ ] 2 — Frontmatter (`name`/`description`/`version`/`core-deps` on every skill)
- [ ] 3 — Compile (`tsc --noEmit` strict + `noImplicitAny` over examples and demo files)
- [ ] 4 — Semantic (AST constraints via the TypeScript compiler API)
- [ ] 5 — Syntactic (regex constraints; golds clean, anti-examples fail)
- [ ] 6 — Pipeline (`AGENT_SYSTEM_PROMPT.md` stage markers, architecture checks, path resolution)
- [ ] 7 — Evals + coverage (eval cases, 1:1 gold/test coverage)
- [ ] 8 — Budget + registry (token budget per skill, registry rows resolve)
- [ ] 9 — Showcase build (`demo/showcase/` builds clean under `next build`)
- [ ] 10 — References (the constraints run over `skills/*/references/*.md`, not just examples)
- [ ] 11 — Figures (every documented count and token figure recomputed from the filesystem)
- [ ] None of these / not sure

## Agent used

- [ ] Claude
- [ ] Cursor
- [ ] ChatGPT
- [ ] OpenAI API
- [ ] Copilot
- [ ] Gemini
- [ ] Other (name it):

## Screenshots

Optional — attach if the bug is visual (e.g. `demo/showcase/` rendering wrong).
