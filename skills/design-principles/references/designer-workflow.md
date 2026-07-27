# Designer Workflow — Structured Design Process

Sources: `julianoczkowski/designer-skills` (Apache 2.0) · `MengTo/Skills` (MIT). Both encode *process* so an agent follows a path instead of producing random output. Use alongside `core/user-intake.md`, which covers the questioning half.

## 1. The design flow (Oczkowski)

A deliberate sequence — each stage's output is the next stage's input:

| # | Stage | Produces |
|---|---|---|
| 1 | **Grill** | Interrogate the plan until every design decision is resolved. No unresolved decision survives into build |
| 2 | **Design brief** | The grilling turned structured — *including codebase exploration so the AI respects what exists* |
| 3 | **Information architecture** | Navigation, content hierarchy, page structure, URL patterns, user flows |
| 4 | **Design tokens** | Full token system — colour, spacing, typography, motion — light *and* dark, derived from the chosen aesthetic |
| 5 | **Brief → tasks** | An ordered checklist of independently buildable **vertical slices** |
| 6 | **Build** | Implement with a named aesthetic philosophy. Mobile-first. Dark mode included |
| 7 | **Design review** | Structured critique against the brief — code or screenshot. On request, not automatic |

Any stage is usable alone. Stage 7 only makes sense once something exists.

**Persist the artifacts.** Write design docs to a `.design/{feature}/` folder — brief, IA, tasks, review — one subfolder per feature so nothing is overwritten and a later session can detect where you left off. Design decisions are as worth versioning as code.

## 2. Respect existing code (the detection checklist)

Before generating anything, detect what the project already has. This is P3 (Surgical Changes) applied to design work — it is what stops an agent generating a second Button or inventing a colour that clashes with the established palette.

Check for: **CSS custom properties · Tailwind config · UI framework theme (shadcn/MUI/Chakra) · component directories · Storybook stories · token files · font loading · `package.json` dependencies.**

Found something? Extend it. Not found? Say so before creating a new system.

## 3. Aesthetic philosophies as a menu

Eight named directions, each carrying concrete parameters for typography (families, scale, spacing), colour (palette approach, accent strategy), layout (grid, composition), spacing (base unit, density), motion (duration, easing, what animates) and detail (borders, shadows, texture):

**Dieter Rams** — less but better; no decoration without purpose · **Swiss / International Typographic** — grid-locked, strong hierarchy, objective · **Japanese Ma** — negative space *is* content; quiet, restrained · **Brutalist** — raw structure visible, anti-polish, content-first · **Scandinavian** — warmth plus restraint, rounded, accessible by default · **Art Deco** — geometric luxury, bold symmetry, statement type · **Neo-Memphis** — playful chaos, clashing colour, anti-corporate · **Editorial / Magazine** — content-led, display type, print-inspired.

**The naming rule:** if the user names a philosophy, follow its parameters. If they describe a vibe ("warm and clean"), map it to the closest one. If they say nothing, pick one from context **and tell them which you chose.** Silently defaulting is how output ends up generic.

These complement the five implementation presets in `skills/design-system/references/styles/` (soft, minimalist, brutalist, glassmorphism, neo-brutalism) — philosophies are direction, presets are CSS.

## 4. Working principles (Meng To)

1. **Prompts are assets.** Good once ⇒ reusable. Store, version, build libraries and stylecards.
2. **Specs beat vibes.** Consistent output comes from clear constraints, clear hierarchy, and **"change 1–2 things only" iteration**. Variants beat rerolls — a reroll discards what worked.
3. **References beat paragraphs.** A screenshot carries fonts, spacing, colour, layout rhythm and icon style at once; prose describing the same thing is longer and less precise.
4. **Skills are operating procedures.** A good skill says exactly when to use it, what to do first, what defaults to apply, and what mistakes to avoid.

**Design-first prompt order:** goal → format → layout → type → colour → constraints. Add negative prompts (what to avoid) — they do more work than adjectives.

## 5. Skill-authoring contract

Independent convergence with this package's own architecture, worth stating explicitly:

- The skill file is **procedural, not encyclopedic** — steps, patterns, guardrails.
- **Explicit triggers.** "Use when…" beats a vague description.
- **Prefer defaults** — durations, spacing, hierarchy, commands, acceptance checks.
- **Links live in a references file, long-form in an article** — the skill file stays lean.
- Portable: no secrets, no private paths, no hidden account assumptions.

This is the same conclusion as `skills/react-performance/references/token-optimization.md`: skill files are routers, depth loads on demand.
