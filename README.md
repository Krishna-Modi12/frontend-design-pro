# frontend-design-pro

**Your AI agent already writes React. This makes it write React that doesn't look AI-generated.**

A machine-enforced frontend UI/UX skill pack — 19 auto-routing skills, 94 on-demand references, and 53 constraints that a build script actually runs.

**9 release-blocking gates · 17 semantic AST checks · 36 syntactic checks · strict TypeScript compilation · a 1:1 test for every gold example.**

Most prompt packs tell an agent what good UI looks like. This one proves it: every example compiles under `tsc --strict`, passes AST analysis, and ships with a test — and no archive can be built unless all of that is green.

## What actually changes in your output

These are not style preferences. Each row is a check that fails a build, with the constraint ID that enforces it.

| What agents reach for by default | What this pack enforces | Enforced by |
|---|---|---|
| `Inter` / `Poppins` / `DM Sans` as the display face | A face with a point of view, system stack as fallback | `TYP-02` |
| Purple → pink → blue gradient | One accent, derived from the brand | `COL-03` |
| `bg-[#0F1419]`, raw hex everywhere | OKLCH tokens only | `COL-04`, `TOK-01` |
| `min-h-screen` | `min-h-[100dvh]` — the mobile viewport is not the screen | `RES-01` |
| `setTimeout(() => setLoading(false), 1500)` | Loading state driven by real async, never faked | `DELAY-01-AST` |
| `ease-in` on an entrance | Ease-out to arrive, ease-in to leave | `MOTION-02` |
| A `scroll` listener calling `setState` | Re-render per frame is a bug, not a technique | `ANI-04` |
| "John Doe", "$99.99", "Elevate your workflow" | Real-shaped names, organic figures (47.2%, $12,847) | `SLOP-01`, `SLOP-02`, `SLOP-04` |
| `aria-label` mentioned in a comment | Real JSX attributes, or it doesn't count | `A11Y-01` |
| Equal-height card grid, 3 across | Asymmetry, hierarchy, one showpiece per viewport | anti-slop wall |
| A component with only a happy path | All four states — loading, empty, error, success | `STA-01`, `STA-02` |

The full list of 53 lives in [`core/validate-checklist.md`](core/validate-checklist.md). Ten deliberate **anti-examples** (`skills/*/examples/bad-*.tsx`) exist to prove the checks fire — the suite asserts they fail.

## Install in 30 seconds

If your agent keeps its rules in a file — Cursor, Copilot, Windsurf, Continue.dev, Aider — the installer writes it for you:

```bash
unzip frontend-design-pro-v*.skill -d ./   # pack lands at ./frontend-design-pro/
bash frontend-design-pro/setup.sh          # detects the agent, writes its native rules file
```

`setup.sh --list` names every adapter, `setup.sh cursor` skips detection, `--dry-run` shows what it would write, and nothing is overwritten without `--force`. `setup.ps1` is the PowerShell port. The files it copies live in [`install/`](install/) if you would rather place them yourself.

Then just ask for what you want, in plain language:

```
Build a pricing section for a developer tool. Dark mode, three tiers,
annual/monthly toggle. Not the usual three equal cards.
```

The agent matches your wording against the registry, loads **one** skill plus its dependencies, and builds. **No slash commands, no prefixes** — routing is on natural-language trigger keywords.

### Per-host setup

The remaining hosts need a web UI or a merge into a file your repo owns, so they stay manual. Every row is the real setup path, not an approximation.

| Agent | Steps |
|---|---|
| **[Claude Code](docs/CLAUDE_SETUP.md)** | 1. Unzip the `.skill` into `~/.claude/skills/` (or project-scoped `.claude/skills/`) <br> 2. Start a new session — no system prompt needed <br> 3. Ask in plain language: *"Create a landing page for a developer tool"* |
| **[Claude Desktop](docs/CLAUDE_SETUP.md)** | 1. Unzip the `.skill` somewhere stable <br> 2. New Project → paste `AGENT_SYSTEM_PROMPT.md` into Project Instructions <br> 3. Upload the unzipped folder to Knowledge <br> ⚠️ No filesystem — retrieval-based, lazy loading degrades |
| **[Cursor](docs/CURSOR_SETUP.md)** | 1. Unzip into the workspace <br> 2. Create `.cursor/rules/*.mdc` with the routing instructions (legacy: `.cursorrules`) <br> 3. `@`-reference `SKILL.md` the first time in Chat/Composer <br> ⚠️ May paraphrase a reference instead of reading it — `@`-reference the specific file if output drifts generic |
| **[ChatGPT Custom GPT](docs/CHATGPT_SETUP.md)** | 1. Create a Custom GPT <br> 2. Upload `SKILL.md` + the `core/*.md` files a typical request needs + 2–3 relevant skill routers <br> 3. Paste routing instructions into Instructions <br> ⚠️ 20-file knowledge cap total — curate a subset, retrieval search not lazy loading |
| **[OpenAI API](docs/OPENAI_API_SETUP.md)** | 1. Put `SKILL.md` (+ known-relevant skill/core files) in the system message for a narrow integration <br> 2. Or build a function-calling loop that fetches pack files by path for real per-request loading <br> ⚠️ No built-in gate-script awareness — wire it in yourself if enforcement matters |
| **[GitHub Copilot](docs/COPILOT_SETUP.md)** | 1. Unzip into the repo <br> 2. Create `.github/copilot-instructions.md` with a *short* routing instruction (not the full `AGENT_SYSTEM_PROMPT.md`) <br> 3. Optional: path-scoped `.github/instructions/*.instructions.md` with `applyTo` <br> ⚠️ Always-loaded in full, not fetch-on-demand — the 94 references are out of reach unless pasted by hand |
| **[Gemini](docs/GEMINI_SETUP.md)** | 1. Put `SKILL.md` in the system instruction (add `core/*.md` + skill routers too for a broad integration — the large context window absorbs it) <br> 2. For true on-demand loading, wire function-calling to fetch pack files by path <br> ⚠️ Static context by default, not lazy loading — a big window makes the cost affordable, not free |

**Don't see your agent?** [`install/`](install/) adds adapters for Windsurf, Continue.dev, Aider and OpenAI Codex CLI — untested against the matrix, but following each host's documented rules format. [docs/AGENT_COMPATIBILITY.md](docs/AGENT_COMPATIBILITY.md) has the full matrix; [docs/INSTALL.md](docs/INSTALL.md) covers generic setup.

`SKILL.md` is self-contained, so no system-prompt setup is required. If your host supports a system prompt, [`AGENT_SYSTEM_PROMPT.md`](AGENT_SYSTEM_PROMPT.md) is a registry-native drop-in that makes the loading protocol and the validation contract explicit. Full guide: [docs/USAGE.md](docs/USAGE.md).

## The 19 skills

One skill loads per request. You never name it — the **Try saying** column is what actually routes there. Most specific wins: *"form validation"* goes to `forms`, not `react-components`.

### Building something new

| Skill | What it covers | Try saying |
|---|---|---|
| [`landing-pages`](skills/landing-pages/SKILL.md) | Heroes, pricing, testimonials, bento grids, logo walls, comparison tables, FAQ, CTAs, footers — plus empty states and onboarding | *"Build a landing page for a CI tool. Dark, technical, no stock-photo energy."* |
| [`react-components`](skills/react-components/SKILL.md) | One reusable component or a small family: button, card, modal, dropdown, tabs, accordion, tooltip, select, popover. shadcn/Radix, compound components, `forwardRef`, CVA | *"Build a Dialog with a compound API — Dialog.Root, Trigger, Content — that traps focus properly."* |
| [`forms`](skills/forms/SKILL.md) | Anything collecting input: contact, checkout, login, signup, password reset, OTP/MFA, multi-step wizards, settings. React Hook Form + Zod, Stripe PaymentElement | *"Multi-step checkout with Zod validation and errors wired to aria-describedby."* |
| [`data-tables`](skills/data-tables/SKILL.md) | Tabular and data-dense UI: sorting, filtering, pagination, row selection, KPI cards, charts, analytics dashboards, admin panels. TanStack Table/Query | *"Sortable, filterable users table with pagination and a loading skeleton."* |
| [`threejs-3d`](skills/threejs-3d/SKILL.md) | Browser 3D: scenes, GLTF/GLB models, shaders, post-processing, orbit controls, raycasting, Spline embeds, particle systems, 3D heroes | *"A subtle WebGL particle hero that doesn't tank LCP or run under reduced motion."* |

### Making it look right

| Skill | What it covers | Try saying |
|---|---|---|
| [`design-system`](skills/design-system/SKILL.md) | Design tokens, OKLCH palettes, typography and spacing scales, theming, dark mode, brand systems, font pairing, Figma handoff | *"Build me a token system from this brand colour, with a dark mode that isn't just inverted."* |
| [`design-principles`](skills/design-principles/SKILL.md) | The *why*: visual hierarchy, Gestalt grouping, Fitts/Hick/Miller, cognitive load, choice architecture, perceived performance, design-DNA extraction | *"Critique this layout. Why does it feel cluttered, and what's the actual fix?"* |
| [`design-research`](skills/design-research/SKILL.md) | Live web research — browse Dribbble, Mobbin, Aceternity, Motion.dev, React Bits, 21st.dev, extract palettes and easing curves, convert them to typed constraints **before** any code | *"Build a hero inspired by this Dribbble shot: <url> — dark, developer tool."* |
| [`animations`](skills/animations/SKILL.md) | Entrance/exit transitions, micro-interactions, hover states, scroll-driven sequences, parallax, route transitions, shared-element morphs, stagger, reduced motion | *"Add a staggered reveal to these cards — subtle, and respect prefers-reduced-motion."* |
| [`component-patterns`](skills/component-patterns/SKILL.md) | Patterns from third-party libraries — animated text, magnetic/tilt/spotlight effects, ambient canvas backgrounds, carousels, docks, bento — with the a11y and perf rules they omit | *"Give me an animated headline like Aceternity's, but keyboard-accessible."* |
| [`iconography`](skills/iconography/SKILL.md) | Icon sizing, weight matching, colour inheritance, hit areas, SVG accessibility, avatars and initials, empty-state illustration | *"These icons look off next to the text — fix the sizing and optical alignment."* |
| [`canvas-typography`](skills/canvas-typography/SKILL.md) | Type rendered as a system: particle text, kinetic type, variable-font axis animation, scramble/decode reveals, text on a path — with the real string always left in the DOM | *"A hero headline that assembles from particles on mouse-over, and still reads fine with JS off."* |
| [`color-themes`](skills/color-themes/SKILL.md) | Colour computed rather than chosen: OKLCH token generation from one hue, harmonic schemes, palettes extracted from an image, light/dark/auto architecture, contrast measured before a token ships | *"Generate a full dark theme from this brand blue, and prove the text passes AA."* |

### Making it work well

| Skill | What it covers | Try saying |
|---|---|---|
| [`react-performance`](skills/react-performance/SKILL.md) | Request waterfalls, bundle size, RSC boundaries, memoization, re-renders, long lists, lazy loading, prefetching, Core Web Vitals | *"This page has a 4s LCP. Find the waterfall and fix it."* |
| [`web-interface`](skills/web-interface/SKILL.md) | Auditing and polishing what already exists — design review, a11y audit, copy review, typography and contrast passes, touch targets, safe areas | *"Review this component. What's wrong with it that I'm not seeing?"* |
| [`testing`](skills/testing/SKILL.md) | Vitest, Testing Library, jest-axe accessibility assertions, Playwright e2e, Storybook stories, mock policy | *"Write tests for this form — including the validation errors and an axe pass."* |
| [`platform`](skills/platform/SKILL.md) | Platform surfaces rather than generic components: mobile/PWA, React Native/Expo, i18n and RTL, SEO/metadata, Stripe, transactional email, AI chat and streaming UI | *"Make this work as a PWA with proper safe-area handling on iOS."* |

### Meta

| Skill | What it covers | Try saying |
|---|---|---|
| [`ai-ui-generation`](skills/ai-ui-generation/SKILL.md) | Prompt-to-UI, JSON/schema-driven rendering, server-driven UI, component registries, and the guardrails generated markup must pass before it ships | *"Render components from this JSON schema, and validate before it hits the DOM."* |
| [`agent-ops`](skills/agent-ops/SKILL.md) | The agent's own process: token budgeting, cross-session memory, self-verification loops, parallel work, subagent orchestration | *"You keep re-reading the same files. Set up a context budget."* |

**No keyword match?** The agent asks one clarifying question rather than guessing — that behaviour is part of the contract, not a fallback.

## Architecture — registry + lazy loading

The pack is not a document. It is a **registry that routes**: a monolithic 320k-token pack could not be loaded at all.

| Layer | What it is | Cost |
|---|---|---|
| `SKILL.md` | Registry, routing table, anti-slop wall | **1,998 tokens** — always loaded |
| `core/` | Shared primitives (tokens, a11y, component API, behaviour, checklist, intake) | 2,236–2,404 tokens — the deps one skill declares |
| `skills/{id}/SKILL.md` | One skill file | 789–1,572 tokens — one per request |
| `skills/{id}/references/` | Deep material | **332,974 tokens** — loaded only when a skill points at it |

**A typical request loads 5,038–6,338 tokens, not 333,000.** Adding a skill costs about 51 tokens of always-loaded context. The two skills in v14.5.0 took the registry from 1,895 to 1,998 — 103 tokens for both, which is the clearest confirmation of that figure the project has: it was derived from a single skill and held exactly when two were added at once. Their 8 new reference files added 65,000 tokens of depth, none of it loaded unless a request routes there. Gate 8a fails the build if any skill exceeds 3,000 tokens alone or 8,000 with dependencies, so this cannot silently regress.

## Core files (8)

Every skill inherits `accessibility-baseline` and `validate-checklist` whenever it produces code; the rest load only when a skill declares them.

| File | Purpose |
|---|---|
| `core/design-tokens.md` | OKLCH tokens, 4pt spacing, typography, canvas rules |
| `core/accessibility-baseline.md` | WCAG 2.2 AA floor — structure, keyboard, focus, contrast, states |
| `core/component-api.md` | Prop taxonomy, forwardRef, CVA, controlled/uncontrolled |
| `core/component-api-deep.md` | Compound components, composition patterns, API anti-patterns |
| `core/agent-behavior.md` | The four principles — think, simplify, stay surgical, verify |
| `core/agent-behavior-patterns.md` | Design-work addendum, external behavioural patterns |
| `core/validate-checklist.md` | All 53 constraints (17 parser + 36 regex, unique IDs) with pass criteria |
| `core/user-intake.md` | Six questions to ask before building a site — and when not to ask them |

## Demos

Four projects generated by the skill routing itself — the pack eating its own cooking. Copy the prompt for any of them from [docs/DEMO_PROMPTS.md](docs/DEMO_PROMPTS.md) and try it yourself.

| Demo | Type | Route taken | What it demonstrates |
|---|---|---|---|
| [`demo/landing-page/`](demo/landing-page/) | Stub-typed | `landing-pages` + `core/design-tokens.md` | Dark OKLCH surface, asymmetric bento features, tabular-nums pricing, skip link |
| [`demo/dashboard/`](demo/dashboard/) | Stub-typed | `data-tables` + `react-performance` + `core/component-api.md` | Sortable table with all four states, `next/dynamic` chart, `content-visibility` |
| [`demo/auth-form/`](demo/auth-form/) | Stub-typed | `forms` + `core/component-api.md` | RHF + Zod, `aria-describedby` errors, OAuth, jest-axe test |
| [`demo/showcase/`](demo/showcase/) | **Runnable Next.js app** | `landing-pages` + `threejs-3d` + `forms` | R3F hero, bento grid, pricing, testimonials, validated form — see [See It In Action](#see-it-in-action) below |

The three stub-typed demos are checked by the same suites as the gold examples — `tsc --noEmit` strict, 17 AST constraints, 36 regex constraints:

```bash
bash demo/validate.sh              # all three
bash demo/validate.sh dashboard    # one
```

Those read source. Nothing in the gate chain starts a browser, so the demos are also rendered — dev and production, both colour schemes — and checked for uncaught errors, hydration mismatches, axe WCAG 2.1 AA violations and horizontal overflow at 390/768/1920:

```bash
npm run demos:verify
```

That check exists because it found four defects a green 9/9 chain had passed: a stylesheet that silently did nothing, a page that scrolled sideways on a phone, a `<dl>` with a stray `<p>` in it, and a chart hidden from screen readers but still in the tab order.

If you lift `demo/landing-page/` into a project, take [`tokens.css`](demo/landing-page/tokens.css) with it and import it after Tailwind — its palette is addressed through named utilities (`bg-surface`, `text-ink`), and Tailwind only emits those for tokens registered at build time. `dashboard` and `auth-form` carry their own tokens at runtime and need nothing.

Demos are proof, not doctrine. Where a demo and a skill rule disagree, **the rule wins and the demo is the bug.**

### What they look like

Rendered in a real browser rather than described. Each is above-the-fold at 1920×1080; the full pages are linked underneath. Capture spec and how to reproduce these exactly: [`.github/SCREENSHOT_CONTRIBUTION.md`](.github/SCREENSHOT_CONTRIBUTION.md).

**[`demo/landing-page/`](demo/landing-page/)** — near-black OKLCH surface at a single hue, one acid-green accent, Geist display face, tabular-nums metric strip.

![Tracepoint landing page — dark OKLCH surface, acid-green accent, workflow code panel and a tabular-nums metric strip](demo/landing-page/screenshot.png)

*[Full page](demo/landing-page/screenshot-full.png) — asymmetric bento features, three-tier pricing with an annual toggle, testimonials, footer.*

**[`demo/dashboard/`](demo/dashboard/)** — sortable accounts table, `next/dynamic` revenue chart, tabular-nums KPI cards, light surface.

![Ledgerline dashboard — KPI cards, a year-over-year revenue chart and a sortable accounts table with health badges](demo/dashboard/screenshot.png)

*[Full page](demo/dashboard/screenshot-full.png) — the table's sort, filter, empty and error states.*

**[`demo/auth-form/`](demo/auth-form/)** — React Hook Form + Zod, OAuth providers, show-password toggle, errors wired through `aria-describedby`.

![Arclight sign-in — OAuth provider buttons, email and password fields, and a panel explaining how sessions work](demo/auth-form/screenshot.png)

*[Full page](demo/auth-form/screenshot-full.png).*

`landing-page` reads its metric strip and price book from `/api/site/overview`, an endpoint belonging to the fictional product it advertises — this repo ships the frontend only. The image above was captured against [`demo/landing-page/screenshot-fixture.json`](demo/landing-page/screenshot-fixture.json), committed so the capture is reproducible rather than asserted. Without a backend the page renders its error state, which is correct behaviour and not what a reader wants from a screenshot.

## See It In Action

[`demo/showcase/`](demo/showcase/) is the one project in `demo/` that breaks the stub-typed convention above on purpose: a real, standalone Next.js 15 + React 19 + Tailwind v4 app — its own `package.json`, real installed dependencies (React Three Fiber + drei, React Hook Form + Zod), a dev server that actually boots. It's a cinematic dark-mode landing page for a fictional AI analytics product, "Nexus" — near-black OKLCH surface, single acid-green accent, an asymmetric bento grid, a WebGL particle hero, and a validated contact form.

```bash
cd demo/showcase
npm install
npm run dev   # http://localhost:3000
```

The exact prompt that generates it is documented in [`demo/showcase/README.md`](demo/showcase/README.md#the-prompt-that-would-generate-this) (also collected with the other three in [docs/DEMO_PROMPTS.md](docs/DEMO_PROMPTS.md)) — copy it into any agent set up per the docs above and compare the output.

**The route it takes.** The registry matches *WebGL*, *bento*, *pricing*, *form* and *carousel* against the trigger-keyword column and loads `landing-pages`, `threejs-3d` and `forms` in turn, each pulling `core/design-tokens.md` and `core/component-api.md` from its declared `core-deps`, plus the two universal deps (`core/accessibility-baseline.md`, `core/validate-checklist.md`). Nothing else is read. The bans in the prompt — no Inter, no purple gradient, no `min-h-screen`, no equal-weight card grid — are not politeness: they are the anti-slop wall restated, and the constraint suite fails the build if the output violates them.

**It is checked, not just shipped.** Unlike the three stub-typed demos above, the showcase has real dependencies, so it gets a real check: Gate 9 runs `next build` against the actual vendor typings, and CI installs its dependencies on a clean runner to do the same. It is held to the same content rules as everything else — the 17 AST checks on every authored file, the 36 regex checks on the project. A "runnable demo" that nobody runs is a claim with a shelf life.

![Nexus showcase — dark-mode analytics landing page with WebGL particle hero, asymmetric bento grid, and acid-green accents](demo/showcase/screenshot.png)

Above-the-fold, default viewport, reduced motion off, captured via a headless Chromium driving the real dev server — not staged, not retouched. If a future change to `demo/showcase` makes this stale, [`.github/SCREENSHOT_CONTRIBUTION.md`](.github/SCREENSHOT_CONTRIBUTION.md) has the exact recapture spec.

## What's new in v14.5.1

A correctness patch. No new capability — two audit findings that made routing and examples quietly lie about themselves.

- **Three trigger keywords resolved to two skills each.** `bento`, `avatar` and `contrast` each appeared in two registry rows, so routing between them was undefined rather than decided by specificity. The broader owner keeps the bare term and the narrower one is rescoped: `component-patterns` → `bento-card`, `iconography` → `avatar-icon`, `web-interface` → `contrast-check`. All 204 registry keywords now resolve to exactly one row.
- **Five gold examples were byte-for-byte copies of another skill's.** The effect was worse than redundancy: four skills had no example of their own subject — `iconography` demonstrated a data table, `design-principles` shipped a landing page, and `ai-ui-generation` and `component-patterns` shared one compound-component file. Each was replaced rather than deleted, because in four of the five cases the skill holding the copy had no other gold. The new ones are [`good-icon-button`](skills/iconography/examples/good-icon-button.tsx) (icon-only controls that carry an accessible name), [`good-spotlight-card`](skills/component-patterns/examples/good-spotlight-card.tsx) (pointer position in CSS custom properties, coalesced into one rAF, never state), [`good-registry-renderer`](skills/ai-ui-generation/examples/good-registry-renderer.tsx) (JSON to UI through a closed allow-list where no prop can carry a handler), and [`good-visual-hierarchy`](skills/design-principles/examples/good-visual-hierarchy.tsx) (rank on size, weight and colour together).
- **The suite grew 124 → 192 tests** while examples went 55 → 54 and tests 45 → 44. Gold-to-test parity holds at 44/44.
- **Dependency advisories are documented, not bumped.** Both available fixes need a major (`vitest` 2 → 4, `next` 15 → 16) and every advisory is development- or build-time only — `node_modules/` is not in the archive manifest. Recorded in [docs/RELEASE_NOTES-v14.5.1.md](docs/RELEASE_NOTES-v14.5.1.md) rather than carried silently.
- **One finding is reported and deliberately not fixed:** `web-interface` ships zero gold examples. It passes Gate 8b only because that gate globs `examples/*.tsx`, which counts anti-examples. Writing one is a content change, not a patch fix.

## Previously — v14.5.0

Two new skills, both **generative** — design computed at runtime rather than authored once. Type rendered as a system, colour derived as a function. Nothing in the pack covered that.

- **[`canvas-typography`](skills/canvas-typography/SKILL.md)** — particle text, kinetic type, variable-font axis animation, scramble/decode reveals, text on a path. The rule it enforces is not the effect but what the effect must never cost: **the real string stays in the DOM**, the canvas is `aria-hidden` decoration, and `getContext("2d")` is null-guarded — it returns `null` under SSR and under a headless test runner. Every example degrades to plain readable type rather than a blank rectangle, and the tests assert that degradation instead of mocking it away.
- **[`color-themes`](skills/color-themes/SKILL.md)** — OKLCH token generation from one anchor hue with chroma clamped to the sRGB gamut, harmonic schemes, palettes extracted from an image, and light/dark/auto architecture. Three things the examples exist to prove: never average pixels (the mean of any photograph is the same muddy brown-grey, because opposite hues cancel), never ship a colour pair nobody measured, and never persist a resolved `isDark` boolean — that silently pins anyone who chose "follow the system". Contrast is verified across all 24 hue steps in both polarities, because the failures live at specific hues.
- **Both skills are dependency-free.** Pure React and DOM APIs, with the OKLab conversion matrices written inline rather than pulling in a colour library. This pack installs none of its examples' peer dependencies by design, and this release does not become the exception.
- **The demo apps are off their vulnerable Next.** `demo/showcase` was pinned to 15.3.9, carrying HIGH advisories including SSRF in Server Actions and a Middleware/Proxy bypass in App Router; both runnable apps are now on 15.5.23. `postcss` and `sharp` remain flagged inside Next's own dependency tree, where the only remedy npm offers is Next 16 — that is recorded rather than quietly carried.
- **A test-environment gap that was hiding failures.** `window.localStorage` arrives in the suite as a bare object with no methods on it. That is worse than it sounds: correct code wraps storage in `try/catch` for Safari private mode, so the broken stub never threw — it silently took the catch path, and a test asserting "the preference was saved" would have passed for the wrong reason.
- **Adding two skills cost 103 tokens.** The registry went 1,895 → 1,998 — about 51 tokens each, which is exactly what the marginal-cost figure derived from a single skill predicted. Their 8 new reference files added 65,000 tokens of depth, none of it loaded unless a request routes there.

## Verification

Every release is produced by `scripts/build_release.py` with 9 blocking gates:

1. **Pre-flight** — clean tree, token budget, version consistency, no version-string leaks
2. **Frontmatter** — every skill declares `name`/`description`/`version`/`core-deps`, and its deps exist
3. **Compile** — `tsc --noEmit` strict + `noImplicitAny` over every example
4. **Semantic** — 17 AST constraints via the TypeScript compiler API
5. **Syntactic** — 36 regex constraints (tokens, fonts, spacing, anti-slop, 3D, copy)
6. **Pipeline** — `AGENT_SYSTEM_PROMPT.md` stage markers, architecture checks, and every path it cites resolves
7. **Evals + coverage** — 22 eval cases; every gold has a test
8. **Budget + registry** — every skill ≤3,000 tokens and ≤8,000 with deps; every registry row resolves
9. **Showcase build** — `demo/showcase/` (the real, installed Next.js app) builds clean under `next build` against its actual vendor typings

Then: path integrity, reference-depth audit, a **release source guard** that refuses to build unless `HEAD` is `origin/main` with a clean tree, archive build, and a post-build smoke test that re-runs the gates against the *unzipped* archive and checks what it claims — the version it announces, the changelog it tops out at, and that every demo image actually shipped.

```bash
npm install
npm run gates    # all 9 gates, no archive
npm run build    # gated archive → dist/
```

Gate 7 asserts 1:1 test coverage, strict compilation, **and that the suite passes**: **44 of 44 test files, 192 of 192 tests**. It runs in CI on every push and pull request to `main` — the same `build_release.py --dry-run` that refuses to build an archive when it is not true. Gate 7 degrades rather than lies: a fresh clone with no `npm install` has neither `tsc` nor `vitest`, and the gate names which layers actually ran instead of implying all three did. What the suite does and does not prove is in [docs/TESTING.md](docs/TESTING.md).

## Issues & contributing

Bugs first. [Open an issue](https://github.com/Krishna-Modi12/frontend-design-pro/issues) with the file path, the host you ran it on, and which of the 9 gates should have caught it — naming the gate that missed it is the most useful thing in the report. Feature requests are counted rather than closed: ten distinct ones for the same capability is a threshold, not a queue. The policy is in [docs/MAINTENANCE.md](docs/MAINTENANCE.md), and the triage replies are published in [docs/RESPONSE_TEMPLATES.md](docs/RESPONSE_TEMPLATES.md) rather than kept private.

Sending code:

- All changes must pass the 9 gates — CI runs them on every push and PR
- New depth → `skills/{id}/references/`; new skill → a directory plus one registry row
- New gold example → `skills/{id}/examples/` **with** a matching `.test.tsx` (Gate 7 blocks otherwise)
- New semantic rule → a check in `parser_constraints.js` **and** a divergence case in `parser_regression_test.js`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the repo-vs-archive layout, and [CLAUDE.md](CLAUDE.md) if you are pointing an agent at this repo.

**The pack was under a feature freeze from v14.2.2 through 2026-08-02**, when it was overridden by owner directive to ship the accumulated staging work. Future freezes observe the thresholds in [docs/MAINTENANCE.md](docs/MAINTENANCE.md) — 10 distinct requests for one feature, 5 confirmed bugs, or two actively monitored weeks — unless an override is documented the same way. Bug fixes and broken-link fixes are always welcome, freeze or not.

## Docs

**Setup** — [Claude](docs/CLAUDE_SETUP.md) · [Cursor](docs/CURSOR_SETUP.md) · [ChatGPT](docs/CHATGPT_SETUP.md) · [OpenAI API](docs/OPENAI_API_SETUP.md) · [Copilot](docs/COPILOT_SETUP.md) · [Gemini](docs/GEMINI_SETUP.md) · [Generic](docs/INSTALL.md) · [Compatibility matrix](docs/AGENT_COMPATIBILITY.md)

**Reference** — [Usage](docs/USAGE.md) · [Architecture](docs/ARCHITECTURE.md) · [Testing](docs/TESTING.md) · [Known gaps](docs/ARCHITECTURE.md#known-gaps) · [Maintenance policy](docs/MAINTENANCE.md) · [Demo prompts](docs/DEMO_PROMPTS.md) · [Changelog](docs/CHANGELOG.md)

## License

MIT — see [LICENSE](LICENSE).
