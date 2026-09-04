# Demo Prompts

Copy any of these into your agent with `frontend-design-pro` loaded to reproduce the corresponding demo.

Two of these are verbatim and two are not, which is worth knowing before you compare output against the demo.

`demo/showcase/` is quoted exactly from `demo/showcase/README.md`, which documented it from the start. `demo/landing-page/` is quoted exactly from the brief that rebuilt it. For the two stub-typed demos — `dashboard` and `auth-form` — no verbatim record survives, because subagent prompts were never part of the committed history; what's here is a prompt that reproduces what is in each demo's source today, checked against it rather than recalled.

---

## `demo/landing-page/`

**Prompt:**

> Build a landing page for Bellwether — a fictional tool that rehearses a pending database schema change against a mirror of production traffic and reports what it would lock before it reaches the primary.
>
> Make it dark, tight and alive. Near-black at a single hue, one deep cobalt accent — and I am asking for that on purpose, so the wall's exemption applies. Earn it: cobalt, not an acid neon; one hue for every neutral; and measure every pair on all three surfaces rather than eyeing it.
>
> Geist for everything, Geist Mono for figures and code only. No editorial serif — a high-contrast display serif over a schema-migration product reads as a magazine cover about databases. Never Inter, Roboto, Poppins, DM Sans or Space Grotesk.
>
> The hero fills the screen below the header and the report takes the wider track — 5:7, not the usual way round. Render what the product actually produces: a rehearsal report for one migration, carrying the statement, rows touched, traffic replayed, lock duration, an hourly write profile marking the window it recommends, and a verdict in prose. Not a terminal window, and not a syntax-coloured code panel either — both show the input the reader already knows how to write.
>
> Then a four-figure metric strip on an uneven track, fed by a real route handler with genuine loading, error and empty branches; a three-step sequence on an uneven track, numbered in mono because it is a real sequence; a four-cell bento where the heights follow the content; two testimonials at two widths; a centred CTA with risk-reversal microcopy; and a footer that says on the page that Bellwether is not real.
>
> One scroll-driven fade-up as each section enters view, 700ms, ease-out, and nothing else moving. Check the reduced-motion preference before observing anything, not after — a reveal that starts at zero opacity strands its content for the reader who asked for less motion.
>
> No equal-height card grids. No gradient on a heading. No raw hex. Organic figures — and not the ones the rules themselves use as examples. WCAG 2.2 AA, verified in a browser rather than asserted.

**Skills loaded:** `landing-pages` + `core/design-tokens.md`

**What it demonstrates:** A near-black OKLCH palette at a single hue with contrast measured on all three surfaces, an accent split into a fill and a text weight because one value cannot do both jobs, an asymmetric bento whose heights follow its content, a tabular-nums metric strip on an uneven track, a skip link, four real states behind a real fetch, and a scroll reveal with a defined answer for every path that could otherwise hide content.

**This prompt takes an exemption the previous one declined, and that is the demonstration.** The anti-slop wall bans three AI-design defaults *unless the brief asks for them*. This page has now been near-black-with-acid, then light porcelain, then near-black-with-cobalt, and the sequence is the argument: the first brief asked for the exemption and got a page that broke no rule and still looked generated, because an exemption had been *arrived at* rather than *chosen*. The second declined it outright. This one takes it deliberately and has to earn it — cobalt rather than neon, six failed contrast pairs found and fixed before anything shipped, and density and motion carrying the page instead of a bright colour doing it alone.

**The product is fictional.** "Bellwether" does not exist; the page says so on itself rather than only in a source comment. The bans in the prompt are the pack's own wall restated by the user, and the page is checked against them by `python scripts/test_constraints.py --dir demo --recursive --project` rather than trusted to have obeyed — which caught a violation in this very rebuild, in a code comment that named a banned utility while explaining why it was banned.

---

## `demo/dashboard/`

**Prompt:**

> Create an analytics dashboard with a collapsible sidebar nav, a row of KPI cards, a revenue chart, and a sortable/searchable accounts table. The chart is the heaviest dependency on the page and nothing above the fold needs it — load it as a separate chunk with a reserved-height, accessible loading fallback so the KPI row and table never shift when it arrives.

**Skills loaded:** `data-tables` + `react-performance` + `core/component-api.md`

**What it demonstrates:** Sortable table with all four states, `next/dynamic` chart, `content-visibility`.

---

## `demo/auth-form/`

**Prompt:**

> Create a login page: email/password form with OAuth provider buttons, real client-side validation, and accessible error messages. Include a short explanation of the session model (session length, what "keep me signed in" actually does, new-device notifications) so the security posture isn't a mystery to the user.

**Skills loaded:** `forms` + `core/component-api.md`

**What it demonstrates:** RHF + Zod, `aria-describedby` errors, OAuth, jest-axe test.

---

## `demo/showcase/`

Quoted exactly from [`demo/showcase/README.md`](../demo/showcase/README.md#the-prompt-that-would-generate-this):

> Build a cinematic dark-mode SaaS landing page for a fictional AI analytics platform called "Wavelet." Use a near-black background defined as real OKLCH tokens (e.g. `oklch(12% 0.01 260)`) — no pure `#000` or `bg-black` literals, and no ad hoc hex anywhere in components. Use a single accent color, acid green (`oklch(70% 0.25 145)`), sparingly — CTAs and key highlights only, never washed across the whole page. Typography is Manrope for display/body and JetBrains Mono for numbers and data labels — no Inter, Roboto, Poppins, DM Sans, or Space Grotesk. Do not use purple-to-pink-to-blue gradients, equal-height/equal-weight card grids (make the bento grid deliberately asymmetric), `min-h-screen` (use `min-h-[100dvh]` instead), or any placeholder/lorem-ipsum copy or suspiciously round numbers in stats. Design mobile-first.
>
> Build these as real React components: a `Hero3D` WebGL particle hero using React Three Fiber and drei with an actual `<Canvas>` scene, that functionally respects `prefers-reduced-motion` (a real matchMedia-based hook, not a comment); a `BentoGrid` asymmetric feature grid with a cursor-tracked spotlight/glow hover effect; a `Pricing` component with a 3-tier table, `tabular-nums` for all numbers, and a working monthly/annual toggle; a `Testimonials` carousel using the View Transitions API (with a documented CSS fallback); a `ContactForm` validated with React Hook Form and Zod, with real `aria-describedby` JSX attributes wiring inputs to their error messages; a `Newsletter` email signup with validation; and a `Footer`. Wire it all together in `app/page.tsx` and `app/layout.tsx`, with design tokens in `lib/tokens.ts`, global styles in `app/globals.css`, and Zod schemas in `lib/validation.ts`.
>
> This should be a real, installable, runnable Next.js 15 App Router project — not a stub-typed reference file — with its own `package.json`, real dependency versions, and a dev server I can actually start. Hold the result to this skill pack's full `core/validate-checklist.md`: exported, used `*Props` interfaces (no dead types), correct `forwardRef(props, ref)` usage where applicable, OKLCH-only colors with no raw hex in component files, `min-h-[100dvh]` not `min-h-screen`, no bare `ease-in` on entrance animations, no numeric `&&` in JSX, no `transition-all`, no barrel-file imports, `<Canvas dpr={...}>` declared, no raw `requestAnimationFrame` in R3F files, memoized manual Three.js geometry/materials, `…` instead of `...` in copy, and no placeholder/lorem/AI-slop copy anywhere.

**Skills loaded:** `landing-pages`, `threejs-3d`, `forms` — matched on *WebGL*, *bento*, *pricing*, *form* and *carousel* — each pulling `core/design-tokens.md` and `core/component-api.md` from their declared `core-deps`, plus the two universal deps (`core/accessibility-baseline.md`, `core/validate-checklist.md`). Nothing else is read.

**What it demonstrates:** A real, installed, dev-server-verified Next.js 15 + React 19 + Tailwind v4 app — R3F particle hero, asymmetric bento grid, tabular-nums pricing with a working toggle, view-transitions testimonials, an RHF+Zod contact form. Not a stub-typed reference file: it builds and runs.

**To run it yourself:**

```bash
cd demo/showcase
npm install
npm run dev
# http://localhost:3000
```

---

## `docs/audit-report.html`

The one page in this repo the pack was pointed at *itself* to produce — a hardening audit of `frontend-design-pro`, written as a test report rather than a landing page. Quoted verbatim from [`README.md`](../README.md#the-pack-pointed-at-itself):

> Build a single-page audit report for a developer tool that publishes machine-checked quality claims. It has to communicate three things in order: two security defects found in shipped reference material, three rules the product documented everywhere and enforced nowhere, and a gate that was missing entirely.
>
> Treat it as a test report, not a landing page. No hero. The reader is deciding whether to trust the tool, so findings and their IDs are the content — surface severity in form as well as words. Light and dark both.
>
> Constraints: this is our own repo, so obey our own wall. No near-black with one acid accent, no cream-and-serif, no purple gradients, no Inter. Semantic colour for severity must be separate from the brand accent. Tabular figures. No horizontal scroll at 390px.

**Skills loaded:** `design-principles`, `design-system`, `web-interface` — matched on *report*, *severity*, *dark* and *contrast* — each pulling `core/design-tokens.md`, plus the two universal deps. Roughly 5,900 tokens.

**What it demonstrates:** The escape-hatch case handled honestly. The brief names the near-black/acid-accent default the anti-slop wall bans, and the result declines it: ledger rows on cool paper, severity carried by an oxblood/ochre stripe that is *semantic*, held separate from the forest-green structural accent. Full light/dark token sets, `tabular-nums` on every constraint ID.

It is a single self-contained `.html` file in `docs/`, not `demo/` — `*.html` is inside the constraint suite's glob, and a static report has no default export and no four states, so it would fail component-oriented checks it was never meant to satisfy.

---

## On screenshots

`demo/showcase/screenshot.png` exists because that demo is a real running app. The three stub-typed demos above are not — they're `.tsx` files compiled against ambient stubs in `demo/_stubs.d.ts`, never installed, never run (see [`README.md`](../README.md)'s Demos section for that distinction). There's nothing to screenshot without first wiring one into a runnable shell of its own, which isn't part of what these demos are for.
