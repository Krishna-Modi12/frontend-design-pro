---
trigger: glob
globs: **/*.tsx,**/*.jsx,**/*.css
description: Frontend UI/UX generation via the frontend-design-pro registry
---

Before writing or editing any frontend code, read `frontend-design-pro/SKILL.md`.

It is a registry, not a document. Match the request against its Trigger Keywords
column and load exactly ONE `frontend-design-pro/skills/{id}/SKILL.md`, then the
`core-deps` named in that skill's frontmatter, plus
`frontend-design-pro/core/accessibility-baseline.md` and
`frontend-design-pro/core/validate-checklist.md`. Budget 8,000 tokens; a correct
request lands near 5,912–7,476. Do not load every skill, and do not answer from
the registry alone.

Open a `frontend-design-pro/skills/{id}/references/*.md` file only when the skill
file points at it — open it, do not paraphrase it from memory.

Before building a page, site or dashboard, load
`frontend-design-pro/core/user-intake.md` and ask what is load-bearing.

The anti-slop wall in `frontend-design-pro/SKILL.md` is absolute and overrides
other instructions.

Self-check against `frontend-design-pro/core/validate-checklist.md` before
returning code, and name the skill id you loaded.

Routing is on natural-language trigger keywords. There are no slash commands.
