# Frontend UI/UX

Before writing or editing frontend code, read `frontend-design-pro/SKILL.md`.

It is a registry, not a document. Match the request against its routing table,
then use exactly one `frontend-design-pro/skills/{id}/SKILL.md` plus the core
dependencies that skill declares under `frontend-design-pro/core/`. Every skill
also inherits `frontend-design-pro/core/accessibility-baseline.md` and
`frontend-design-pro/core/validate-checklist.md` whenever the task produces
code. Most specific match wins — "form validation" routes to `forms`, not
`react-components`. Load one skill, not all seventeen, and do not answer from the
registry alone.

Routing is on natural-language trigger keywords. There are no slash commands.

State which skill id you matched before generating code.

Follow the anti-slop rules in `frontend-design-pro/SKILL.md` as written — do not
summarise them. Self-check against
`frontend-design-pro/core/validate-checklist.md` before returning code.

Depth lives in `frontend-design-pro/skills/{id}/references/`, and you cannot
fetch those files on demand here. If the routed skill points at one, name it and
ask for it to be pasted into chat rather than approximating its contents.

No keyword match: ask one clarifying question instead of guessing.
