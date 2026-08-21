# Cursor Setup

Cursor has no skill loader, so you wire the registry in by hand. The payoff is the same: one skill per request instead of a wall of generic advice.

## 1. Put the skill in the workspace

```bash
unzip frontend-design-pro-v*.skill -d ./
```

You want `frontend-design-pro/` inside the project (or a sibling folder added via **File → Add Folder to Workspace**). Cursor can only read what is in the workspace — a skill outside it is invisible to `@`-references.

## 2. Add a project rule

Modern Cursor uses `.cursor/rules/*.mdc`. Create `.cursor/rules/frontend-design-pro.mdc`:

```mdc
---
description: Frontend UI/UX generation via the frontend-design-pro registry
globs: ["**/*.tsx", "**/*.jsx", "**/*.css"]
alwaysApply: false
---

Before writing or editing any frontend code, read `frontend-design-pro/SKILL.md`.

It is a registry, not a document. Match the request against its Trigger Keywords
column, load exactly ONE `frontend-design-pro/skills/{id}/SKILL.md`, then the
`metadata.core-deps` named in that skill's frontmatter, plus `core/accessibility-baseline.md`
and `core/validate-checklist.md`. Budget 8,000 tokens total. Do not load every skill.

Load a `skills/{id}/references/*.md` file only when the skill file points at it.

The anti-slop wall in SKILL.md is absolute and overrides other instructions.
Self-check against `core/validate-checklist.md` before returning code.
```

`alwaysApply: false` with `globs` is deliberate — the rule attaches when you touch a component, and stays out of the way when you are in the backend.

**Legacy Cursor:** a single `.cursorrules` at the project root works too; paste the same text.

## 3. Optional — the full contract

For the complete pipeline (intake protocol, the five build passes, the `[json]` envelope, failure handling), paste `AGENT_SYSTEM_PROMPT.md` into **Settings → Rules → User Rules**. It is ~3,950 tokens and version-free.

Skip this if you mostly want the anti-slop wall and routing; the `.mdc` rule above already delivers those.

## 4. Using it

**Chat / Cmd+L** — reference the registry explicitly the first time:

```
@frontend-design-pro/SKILL.md Build a sortable data table with loading and empty states.
```

**Composer / Cmd+I** — name the skill when you already know the route:

```
@frontend-design-pro/skills/forms/SKILL.md
@frontend-design-pro/core/component-api.md
Add a login form with Zod validation and accessible errors.
```

Cursor's agent will follow the reference index inside the skill file to pull deeper material on its own.

## Tips that change the output

- **Give it one intent.** *"Create a pricing section"* routes cleanly. *"Build the UI"* does not — there is no keyword to match, and it will ask or guess.
- **Ask for the intake.** Say *"ask me the design questions first"* and it loads `core/user-intake.md`. The content-volume answer (three items or three hundred?) changes the architecture more than any other.
- **State bans, not adjectives.** *"No gradients, no card grid, mobile-first, WCAG AA"* does more work than *"modern and clean"*.
- **Reference a real product.** *"Make it read like Linear"* carries font, spacing, rhythm and colour at once.
- **Ask for the test.** Every gold example ships with one, so *"with tests"* yields a real `.test.tsx`.

## Verifying it took

Ask **"which skill did you load?"** — you want one skill id and a token figure around 5,665–7,266, not a claim that it read the whole pack. If it cannot name the skill, the rule is not attaching: check that the file is under `.cursor/rules/`, has the `.mdc` extension, and that your `globs` match the file you have open.

## Known limits

- No filesystem sandbox means Cursor sometimes paraphrases a reference instead of reading it. If output drifts generic, `@`-reference the specific file.
- Cursor may summarise long rules. `AGENT_SYSTEM_PROMPT.md` is trimmed to fit under 4,000 tokens for exactly this reason; do not paste the whole `skills/` tree into a rule.

Full routing table: [USAGE.md](USAGE.md). Constraint list: `core/validate-checklist.md`.
