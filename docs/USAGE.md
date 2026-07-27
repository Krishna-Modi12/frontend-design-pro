# Usage — Getting Full Value From frontend-design-pro

## How invocation actually works

**There are no slash commands.** The skill routes on **trigger keywords** in your natural request. You write a normal sentence; the agent reads the registry in `SKILL.md`, matches your words against the keyword column, and loads exactly one skill plus its dependencies.

```
You:    "Build a pricing page for a developer tool"
Agent:  matches "pricing" → loads skills/landing-pages/SKILL.md + core/design-tokens.md
        (~4,700 tokens, not the 295,000 available)
```

You never name a skill. If you *want* to force one, say its name — "use the data-tables skill" — and the agent will honour it.

> Some skill files mention bracket aliases like `[3d]` or `[dash]` inherited from earlier versions. The registry's keyword matching is authoritative; the aliases still work as keywords because they contain the trigger words, but you don't need them.

---

## The 15 skills and how to trigger each

| Say something containing… | Loads | Use it for |
|---|---|---|
| design, ux, laws, principles, hierarchy, contrast, gestalt, cognitive load, **why**, critique | `design-principles` | Justifying a layout, critiquing a design, naming *why* something is wrong, matching an existing visual identity |
| component library, pattern, animated text, background effect, magnetic, spotlight, tilt, react bits, aceternity, cult ui, bento | `component-patterns` | Pulling a pattern from a third-party library and making it accessible + tokenized |
| component, button, card, modal, dialog, dropdown, tabs, accordion, tooltip, badge, avatar, shadcn, radix, compound | `react-components` | Building a reusable component with a proper prop API |
| landing, hero, pricing, testimonials, bento, marketing, saas, homepage, features, cta, social proof, empty state, onboarding | `landing-pages` | Whole marketing pages and their sections |
| form, validation, contact, checkout, auth, login, signup, register, newsletter, rhf, zod, otp, mfa, payment | `forms` | Anything that collects input |
| table, grid, data, list, pagination, sort, filter, tanstack, datatable, chart, dashboard, kpi, analytics | `data-tables` | Tabular and data-dense UI |
| 3d, three.js, r3f, scene, shader, webgl, canvas, model, gltf, glb, geometry, spline, raycast | `threejs-3d` | Anything 3D in the browser |
| tokens, theme, colors, palette, typography, design system, dark mode, spacing, brand, font, figma | `design-system` | Token systems, theming, brand direction |
| animation, motion, transition, framer, gsap, animate, scroll, parallax, view transition | `animations` | Motion of any kind, including *what* a motion should communicate |
| icon, phosphor, lucide, svg, icon button, icon size, icon weight, avatar, initials | `iconography` | Icon sizing, weight, colour, and SVG accessibility |
| ai generate, prompt to ui, json to ui, generative interface, component registry, openui, tambo, morphic, llm ui | `ai-ui-generation` | Building or safely consuming AI-generated UI |
| performance, optimize, waterfall, bundle, memo, lazy, dynamic import, preload, rsc, core web vitals | `react-performance` | Making it fast, or auditing why it isn't |
| test, vitest, testing, rtl, playwright, axe, coverage, storybook, story | `testing` | Writing or augmenting tests |
| review, audit, guidelines, wig, copywriting, microcopy, contrast, a11y audit, ux rules | `web-interface` | Reviewing existing UI rather than building new |
| mobile, pwa, react native, expo, i18n, locale, rtl, seo, metadata, email, stripe, ai chat, streaming | `platform` | Platform-specific surfaces |

**When two skills match, the more specific wins.** "form validation" → `forms`, not `react-components`.

---

## Getting full value — the six things that matter most

### 1. Answer the intake questions
For any website, page or app, the agent loads `core/user-intake.md` and asks what's load-bearing — purpose and audience, brand and tone, **content volume (3 items or 300?)**, motion feel, hard constraints, and reference sites. The content-volume answer changes the architecture more than any other. Answering these once produces better output than three rounds of correction.

### 2. Give it a reference, not adjectives
"Make it look like Linear" beats three paragraphs of description. A screenshot or URL carries fonts, spacing, colour, rhythm and icon style simultaneously. With a reference, the agent can run a Design DNA extraction and generate from a spec rather than a vibe.

### 3. State constraints as bans
Negative constraints shape output far more than positive adjectives. "No gradients, no card grid, mobile-first, WCAG AA" does more work than "modern and clean".

### 4. Name the aesthetic, or let it name one
Eight philosophies are available (Dieter Rams, Swiss, Japanese Ma, Brutalist, Scandinavian, Art Deco, Neo-Memphis, Editorial). Name one and the agent follows its parameters. Say nothing and it picks from context **and tells you which** — so you can redirect in one word instead of a rewrite.

### 5. Iterate by changing 1–2 things
Variants beat rerolls. "Same layout, warmer palette, tighter type" preserves what worked. "Try again" discards it.

### 6. Ask for the test
Every gold example ships with one. Say "with tests" and you get a `.test.tsx` with a render assertion, a role-based interaction, and a jest-axe pass.

---

## What you get automatically

Whether or not you ask, generated code is checked against **51 constraints**:

- **TypeScript strict**, exported prop interfaces, no implicit `any`
- **OKLCH tokens** — never raw hex in component code
- **WCAG 2.2 AA** — real `aria-*` attributes, focus-visible on interactive elements only, ≥44×44px targets, keyboard paths
- **All four states** — loading (skeleton from a real loading input, never a fake `setTimeout`), empty, error, success
- **`prefers-reduced-motion`** functional, not merely mentioned
- **Anti-slop** — no equal-card grids, no banned display fonts, no purple→pink→blue gradients, no `min-h-screen`, no placeholder copy, organic data values
- **Performance** — no barrel imports, no `transition: all`, images sized, no numeric `&&` in JSX

## The anti-slop wall — what it will refuse

The agent will push back rather than silently comply if you ask for: an equal-height card grid on a landing page · Inter/Roboto/Poppins as a display face · a purple→pink→blue gradient · `min-h-screen` · raw hex in components · `ease-in` on entrances · a fake loading delay · placeholder copy or round data values · one of the three AI-design defaults (cream+serif+terracotta, near-black+acid accent, broadsheet hairline) when the brief left that axis free.

It proposes an alternative rather than just refusing. If you genuinely want the banned thing, say so explicitly — a stated brief always wins.

---

## Example prompts

```
Build a pricing page for a developer tool. Three tiers, annual toggle,
minimal aesthetic. No gradients. With tests.

Review this component for accessibility and copy problems.        → web-interface

Why does this dashboard feel cluttered?                            → design-principles

Add a shared-element transition from the card to the detail page.  → animations

Create an OKLCH token system with dark mode for a fintech product. → design-system

This page loads slowly — audit it.                                 → react-performance

Make a 3D product viewer with orbit controls and a loading state.  → threejs-3d
```

## Token budget

| Layer | Cost |
|---|---|
| Registry (always) | ~1,770 |
| One skill | 800–1,600 |
| Core deps | ~2,100 |
| **Typical request** | **~4,600–5,200** |
| Available depth (loaded only on demand) | **295,000** |

If you're on a small context window, say "keep it brief" — the agent will skip deep references and note the omission.
