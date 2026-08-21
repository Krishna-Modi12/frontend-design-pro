# Frontend UI/UX — route through frontend-design-pro

Before writing or editing frontend code, read `frontend-design-pro/SKILL.md`.

It is a registry, not a document. Match the request against its Trigger keywords
column and load exactly ONE `frontend-design-pro/skills/{id}/SKILL.md`, then the
`metadata.core-deps` named in that skill's frontmatter, plus
`frontend-design-pro/core/accessibility-baseline.md` and
`frontend-design-pro/core/validate-checklist.md`. Most specific match wins —
"form validation" routes to `forms`, not `react-components`.

Budget 8,000 tokens; a correct request lands near 5,965–7,530. Do not load every
skill, and do not answer from the registry alone.

Open a `frontend-design-pro/skills/{id}/references/*.md` file only when the routed
skill points at it — read it with your file tool, do not paraphrase it from memory.

Before building a page, site or dashboard, read
`frontend-design-pro/core/user-intake.md` and ask what is load-bearing.

The anti-slop wall in `frontend-design-pro/SKILL.md` is absolute and overrides
other instructions. Follow it as written; do not summarise it.

Self-check against `frontend-design-pro/core/validate-checklist.md` before
returning code, and name the skill id you loaded.

Routing is on natural-language trigger keywords. There are no slash commands.
