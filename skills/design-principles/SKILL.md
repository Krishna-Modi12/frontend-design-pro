---
name: design-principles
description: UX laws and design reasoning — cognitive load, Gestalt grouping, Fitts/Hick/Miller, visual hierarchy, and extracting a visual identity into a reusable spec. Use when deciding why a layout should be one way rather than another, or justifying a critique — hierarchy, grouping, spacing rationale, nav structure, cognitive load, perceived performance — and when matching an existing visual identity. Not for rule-checking finished UI (web-interface).
version: "14.8.1"
core-deps:
  - core/design-tokens.md
  - core/accessibility-baseline.md
---

# Design Principles

## When to Use
Deciding *why* a layout should be one way rather than another, or justifying a critique: visual hierarchy, grouping, spacing rationale, nav structure, choice architecture, cognitive load, perceived performance. Also when matching an existing visual identity ("make it look like X"). For rule-checking finished UI use `web-interface`; for section anatomy use `landing-pages`.

## Stack
Framework-agnostic reasoning · applied to React 19 · Tailwind v4 output

## Core Rules
1. **Name the law, not a feeling.** "11 nav items — Miller's Law says chunk to ≤7" is arguable and testable; "feels cluttered" is neither. Every critique cites a mechanism.
2. **Spacing is grouping** (Proximity). Set relationships with whitespace before reaching for borders or boxes. A label 4px from its input and 24px from the next field needs no divider.
3. **One emphasised thing per view** (Von Restorff). If everything is emphasised nothing is. Exactly one primary CTA.
4. **Reduce choices before improving them** (Hick, Choice Overload). Three tiers, not six. A recommended default beats an empty picker.
5. **Absorb complexity in code, not in the user's head** (Tesler). Smart defaults, inferred values, format-on-blur, liberal input parsing (Postel).
6. **Stay under ~400ms** (Doherty). Optimistic UI and skeletons exist for this. Past 1s show progress; past 10s allow backgrounding. Never fake a delay to seem thorough.
7. **Targets scale with distance** (Fitts). ≥44×44px, primary actions in thumb reach, and remember screen edges are effectively infinite targets.
8. **Match convention unless you can pay for the difference** (Jakob). Logo top-left home, search top-right, cart with badge. Novel navigation is a tax.
9. **Invest in the peak and the end** (Peak-End). The success state and the error recovery are what users remember — not the average screen.
10. **Beauty buys tolerance, not usability** (Aesthetic-Usability). Polish masks real problems in testing; never let it replace a task-based test.
11. **Avoid the three AI-design defaults** unless the brief explicitly asks: cream `#F4F1EA` + serif + terracotta · near-black + single acid accent · broadsheet hairline columns. They appear regardless of subject, which is what makes them defaults rather than choices.
12. **The hero is a thesis** — open with the most characteristic thing in the subject's world. A big number with a small label and a gradient accent is the template answer.
13. **Structure must encode truth.** Numbered markers (01/02/03) only when the content genuinely is a sequence. Eyebrows, dividers and labels carry information or they go.
14. **Spend boldness in one place.** One signature element; everything around it quiet. Then remove one accessory before shipping.
15. **Detect before you generate.** Check for existing CSS variables, Tailwind config, framework theme, component dirs, Storybook, token files and font loading *before* creating anything. Extend what exists; if nothing exists, say so before inventing a system.
16. **Name the aesthetic, even when the user didn't.** If they name a philosophy, follow its parameters; if they describe a vibe, map it to the nearest; if they say nothing, pick one from context **and tell them which**. Silent defaulting is how output becomes generic.
17. **Iterate by changing 1–2 things.** Variants beat rerolls — a reroll throws away what already worked.
18. **Plan before code, then critique the plan.** Palette (4–6 named values), type roles, layout concept with ASCII wireframes, and the signature — reviewed against the brief for genericness *before* any implementation.

## Patterns
- **Hierarchy in threes** — primary → secondary → tertiary; never more than three levels of visual weight per page.
- **Progressive disclosure** — show the minimum needed to decide; detail goes behind hover, accordion, or the next screen.
- **Endowed progress** — pre-complete the first step so the goal gradient pulls users forward.
- **Design DNA extraction** — turn "make it look like that" into a filled JSON profile across system/style/effects, then generate from it.
- **Polish iteration** — re-attach the reference and audit hierarchy, ornamentation, typographic rhythm, motion, materiality; ornamentation and materiality are what first passes miss.
- **Two-pass design plan** — build a token system (colour/type/layout/signature), critique it for genericness, then implement it exactly.
- **Orchestrated moment over scattered effects** — one well-directed page-load sequence beats micro-interactions sprinkled everywhere; scattered motion reads as AI-generated.

## Examples
`examples/good-visual-hierarchy.tsx` is the worked case (rank by size + weight + colour together, one primary action, grouping by spacing). `examples/good-landing.tsx` in `skills/landing-pages/` applies the same rules at page scale. This skill is reasoning, not code — its output is decisions and critique, which the other skills implement.

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| The 31 UX laws as decision rules with UI consequences | `references/laws-of-ux.md` |
| Extracting a visual identity into a reusable spec; polish iteration | `references/design-dna.md` |
| **Anti-slop reasoning, the three AI-design clusters, two-pass process, writing-as-design** | **`references/anthropic-frontend-design.md`** |
| Design flow (grill→brief→IA→tokens→tasks→build→review), existing-code detection, 8 aesthetic philosophies, prompt order | `references/designer-workflow.md` |
| Tone vocabulary, background effects, Design Thinking protocol | `../design-system/references/aesthetic-direction.md` |
| Section anatomy and layout formulas | `../landing-pages/references/design-patterns.md` |

## Constraints
This skill produces reasoning and critique; any code it justifies still meets the full baseline — TypeScript strict, OKLCH tokens, `min-h-[100dvh]`, WCAG 2.2 AA, four states, `prefers-reduced-motion`. Cite the law when you make a design claim (`BEHAV-04`: assumptions stated explicitly).
