# AGENTS.md

## Frontend UI/UX work routes through frontend-design-pro

Before writing or editing anything a user sees in a browser — components, pages,
layouts, styles, animation, forms, dashboards — read
`frontend-design-pro/SKILL.md` first.

It is a registry, not a document. Do not read the whole pack; it is ~333k tokens
and loading it is neither possible nor the intent.

## Loading protocol

1. Read `frontend-design-pro/SKILL.md` (~2k tokens). Always.
2. Match the request against its **Trigger keywords** column and pick exactly
   **one** skill. Most specific wins — "form validation" routes to `forms`, not
   `react-components`.
3. Read `frontend-design-pro/skills/{id}/SKILL.md`.
4. Read the `core/*.md` files that skill declares in its frontmatter `core-deps`,
   plus `frontend-design-pro/core/accessibility-baseline.md` and
   `frontend-design-pro/core/validate-checklist.md` whenever the task produces code.
5. Read a `frontend-design-pro/skills/{id}/references/*.md` file **only** when the
   routed skill's Reference Index points at it for this specific task. Open it —
   do not paraphrase it from memory.
6. Budget **8,000 tokens**. A correctly routed request lands near 5,794–7,394.

Before building a page, site, app or dashboard, read
`frontend-design-pro/core/user-intake.md` and ask what is load-bearing. Building
on an invented assumption is the most expensive mistake available.

No keyword match? Ask one clarifying question. Never guess the route.

## The anti-slop wall is absolute

`frontend-design-pro/SKILL.md` contains a list of banned patterns. It overrides
style preferences, house habits and your own defaults. Follow it as written —
do not summarise it, and do not restate it here, because one copy is the only
reason it cannot drift.

## Before returning code

Self-check against `frontend-design-pro/core/validate-checklist.md`, and name the
skill id you routed to. Stack default: React 19 · TypeScript strict · Tailwind v4
· shadcn/ui + Radix · Next.js App Router.

Routing is on natural-language trigger keywords. There are no slash commands.

## Where the pack lives

Everything above assumes the pack sits at `frontend-design-pro/` in this project.
If those paths do not resolve, say so rather than working from memory — an
approximated rule is worse than an absent one.
