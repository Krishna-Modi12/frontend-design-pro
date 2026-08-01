---
applyTo: "**/*.ts,**/*.tsx,**/*.jsx,**/*.css"
---

Route via `frontend-design-pro/SKILL.md` before generating or editing component
code. Use exactly one `frontend-design-pro/skills/{id}/SKILL.md` plus the core
deps it declares under `frontend-design-pro/core/`, and name the skill id you
matched before writing code.

Follow the anti-slop rules in `frontend-design-pro/SKILL.md` as written — do not
summarise them. Self-check against
`frontend-design-pro/core/validate-checklist.md` before returning code.

Reference depth under `frontend-design-pro/skills/{id}/references/` is not
reachable from here. Name the file you would want and ask for it rather than
approximating it.

This file applies *in addition to* `.github/copilot-instructions.md`, which
carries the full routing rule; it exists only to re-assert it on the file types
the pack covers. Deleting it changes nothing about which skill gets loaded.
