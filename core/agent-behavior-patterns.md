# Agent Behaviour — Deep Patterns

Loaded on demand from `core/agent-behavior.md`. The four principles live in the thin core file; this holds their extended application.

## Design-work addendum (Anthropic `frontend-design`)

When the task is visual design rather than mechanical implementation, P1 and P4 take a specific form:

- **Pin the subject before designing.** If the brief doesn't name the product, audience and the page's single job, name them yourself and *state the choice*. Designing against an unnamed subject is the P1 violation that produces templated output.
- **Plan, then critique the plan, then build.** Produce the token system first (palette, type roles, layout concept, signature element). Before writing code, work through a similar brief and check whether you'd arrive somewhere similar — if so, revise and say what changed and why. This is P4's "define success criteria" applied to aesthetics.
- **Self-critique during the build**, not after. Screenshot if the environment allows: a picture is worth 1000 tokens.
- **Remove one accessory before shipping.** The last decoration added is usually the first that should go (P2).
- **Keep notes on what you've tried** so later passes push somewhere new rather than re-deriving the same defaults.

## External behavioural patterns

*Sources: `julianoczkowski/designer-skills`, `MengTo/Skills`.*

- **Grill before you build.** Interrogate the plan until every decision is resolved. An unresolved decision that reaches the build becomes an invented assumption (P1).
- **Detect before you generate.** Inspect the codebase for existing tokens, theme, components, Storybook and font loading before creating anything. Generating a second Button because you didn't look is the most common P3 violation in design work.
- **Persist decisions.** Write briefs, IA and reviews to `.design/{feature}/` so a later session resumes instead of re-deriving. Design decisions deserve versioning as much as code does.
- **Change 1–2 things per iteration.** Variants beat rerolls; a reroll discards what worked and re-rolls the parts that didn't need it.
- **Say which aesthetic you picked.** If the user didn't name one and you chose from context, state the choice — an unstated choice is an unstated assumption (P1/BEHAV-04).
- **References beat paragraphs.** Ask for a screenshot before writing three paragraphs describing a look. One image carries fonts, spacing, colour, rhythm and icon style simultaneously.
- **Negative prompts do real work.** Naming what to avoid constrains output more sharply than more adjectives describing what you want.


## Principle applications (moved from the core file)

*Frontend specifics:* name the stack if it changes the output · surface the tradeoff ("compound, flexible, ~80 lines vs configured, rigid, ~30 — which?") · push back when the request conflicts with the anti-slop wall and propose the alternative. Always worth a question: unspecified breakpoints, mock-vs-real data, "make it look better" with no reference, component-vs-page.

*The test:* would a senior engineer call this overcomplicated? 200 lines that could be 50 is 50.

*Scope boundary:* "fix the button" means the button — not the card containing it, the page rendering it, or the theme styling it.
*The test:* every changed line traces directly to the request. Can't draw the line? Revert it.

### P4 — request → verifiable criteria

| User says | Becomes |
|---|---|
| "Add a form" | Typed component, RHF + Zod, render test passes, submit fires, axe clean |
| "Fix the bug" | A test that reproduces it, then made to pass |
| "Make it responsive" | Verified at 320/768/1440px, no horizontal scroll, targets ≥44px |
| "Add dark mode" | Toggle swaps theme, no flash on load, `color-scheme` set, tokens swap |
