# Frontend UI/UX conventions

Before writing or editing frontend code, read `frontend-design-pro/SKILL.md`.

It is a registry, not a document. Match the request against its routing table,
then use exactly one `frontend-design-pro/skills/{id}/SKILL.md` plus the core
dependencies that skill declares under `frontend-design-pro/core/`. Every skill
also inherits `frontend-design-pro/core/accessibility-baseline.md` and
`frontend-design-pro/core/validate-checklist.md` whenever the task produces
code. Most specific match wins — "form validation" routes to `forms`, not
`react-components`. Load one skill, not all nineteen.

Routing is on natural-language trigger keywords. There are no slash commands.

Aider only sees files that are in the chat. Add the ones a route calls for as
read-only, never with `/add` — they are reference material, not edit targets:

```
/read-only frontend-design-pro/SKILL.md
/read-only frontend-design-pro/skills/forms/SKILL.md
```

State which skill id you matched before generating code.

Follow the anti-slop rules in `frontend-design-pro/SKILL.md` as written — do not
summarise them. Self-check against
`frontend-design-pro/core/validate-checklist.md` before returning a diff.

Depth lives in `frontend-design-pro/skills/{id}/references/`. If the routed
skill points at one, name it and ask for it to be added read-only rather than
approximating its contents.

Stack default: React 19 · TypeScript strict · Tailwind v4 · shadcn/ui + Radix ·
Next.js App Router.
