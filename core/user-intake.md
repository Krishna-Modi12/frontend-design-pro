# User Intake Protocol (core)

Load before BUILD whenever the task is a **website, page, app, dashboard, or significant UI feature** — anything where a wrong assumption costs more than the question. Skip for a one-line fix or a clearly-specified component.

This is P1 (Think Before Coding) made concrete. Ask, then build once.

## How to ask

**Ask what is actually load-bearing, not all six.** If the user already told you the audience, don't ask again — that wastes their patience and yours. Batch the genuinely open questions into **one** message; never interrogate serially. If they answer partially, state your assumption for the rest explicitly and proceed.

## The six questions

**Q1 — Purpose & audience.** "What is this page for, and who uses it?"
→ Determines layout type, content density, accessibility depth, performance priority.

**Q2 — Brand & tone.** "Existing brand colours, fonts, or design system? Tone: corporate, playful, minimal, luxurious, technical?"
→ Determines palette, typography, animation style, spacing philosophy. No answer → propose a direction and name it rather than defaulting to generic.

**Q3 — Content & data.** "What content appears here? Real data or placeholders? Static or dynamic? Three items or three hundred?"
→ Determines component architecture, pagination vs infinite scroll, virtualization, skeleton strategy. **The 3-vs-300 answer changes the build more than any other.**

**Q4 — Interaction & motion.** "Snappy and utilitarian, or smooth and cinematic? Any specific transitions in mind?"
→ Determines easing, duration, motion library, and whether motion-graphics loads at all.

**Q5 — Constraints.** "Target devices, browser support, accessibility level (AA/AAA), performance budget, existing stack?"
→ Determines responsive strategy, a11y depth, performance gates, framework version.

**Q6 — References.** "Any sites or designs to match — or to avoid?"
→ Determines aesthetic direction and anti-patterns. A "match this" answer should trigger a Design DNA extraction (`skills/design-principles/references/design-dna.md`).

## Routing from the answers

| Answer | Also load |
|---|---|
| Q1 = marketing / landing | `skills/landing-pages/` |
| Q1 = dashboard **and** Q3 = lots of data | `skills/data-tables/` + `skills/react-performance/` |
| Q2 = playful / animated, or Q4 = cinematic | `skills/animations/` |
| Q2 = corporate / minimal | `skills/design-principles/` + `skills/web-interface/` |
| Q3 = real API data | `skills/data-tables/` (fetching, states) |
| Q5 = mobile-first / native | `skills/platform/` |
| Q6 = "match this site" | `skills/design-principles/` (DNA extraction) → `skills/design-system/` |

## What not to do

Don't ask questions whose answer wouldn't change the output — that is ceremony, not diligence. Don't ask all six when two are open. Don't proceed silently on an assumption you had to invent (that is the P1 violation this protocol exists to prevent). And don't ask, then ignore the answer: if the user says "minimal", a bento grid with gradient mesh is a broken promise.
