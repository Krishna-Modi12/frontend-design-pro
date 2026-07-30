# Nexus — showcase

This is the one example in `demo/` that is not a stub-typed reference file. Every other
folder under `demo/` (`landing-page/`, `dashboard/`, `auth-form/`) is a `.tsx` file compiled
only against the ambient `declare module` stubs in `demo/_stubs.d.ts` — never installed,
never run. `demo/showcase/` is the opposite: a real, standalone Next.js 15 (App Router) +
React 19 + TypeScript + Tailwind v4 project, with its own `package.json`, real installed
dependencies, and a dev server that actually boots. It exists to prove the skill pack
produces a working application, not just type-checked snippets.

It's a cinematic dark-mode SaaS landing page for a fictional AI analytics product, "Nexus."

## Running it

```bash
cd demo/showcase
npm install
npm run dev
```

Then open `http://localhost:3000`.

> Note: on very recent Node versions (Node 25+) that ship an experimental global
> `localStorage` by default, the dev server can throw
> `TypeError: localStorage.getItem is not a function` during SSR. If you hit that, run:
> `NODE_OPTIONS="--no-experimental-webstorage" npm run dev` (this is a Node runtime quirk,
> unrelated to this app's code).

Type-check with:

```bash
npm run typecheck
```

## Screenshot

`screenshot.png` — 1920×1080, above the fold, default viewport, reduced motion off, captured from a headless Chromium driving this dev server. It is linked from the **See It In Action** section of the root [`README.md`](../../README.md).

**If you change anything under `demo/showcase/`, recapture it.** A stale screenshot is a worse failure than a missing one: a missing image is an honest gap, while a stale one actively misrepresents the app to everybody who never runs it. The capture spec is in [`.github/SCREENSHOT_CONTRIBUTION.md`](../../.github/SCREENSHOT_CONTRIBUTION.md) — reduced motion off so the particle hero actually renders, dark mode, default viewport, no retouching.

## What's in here

- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — App Router entry, Manrope +
  JetBrains Mono via `next/font/google`, Tailwind v4's CSS-based `@theme` setup.
- `lib/tokens.ts` — OKLCH color tokens (near-black background, single acid-green accent).
- `lib/validation.ts` — Zod schemas for the contact form and newsletter signup.
- `hooks/use-reduced-motion.ts` — functional `prefers-reduced-motion` hook (matchMedia-based).
- `components/Hero3D.tsx` — WebGL particle hero, React Three Fiber + `<Canvas dpr={[1, 2]}>`,
  rotation driven by `useFrame` (no raw `requestAnimationFrame`), skipped when reduced motion
  is requested.
- `components/BentoGrid.tsx` — asymmetric feature grid with a cursor-tracked spotlight glow.
- `components/Pricing.tsx` — 3-tier table, `tabular-nums`, working monthly/annual toggle.
- `components/Testimonials.tsx` — carousel using the View Transitions API where supported,
  with a CSS fade-in fallback (`.testimonial-fade` in `globals.css`).
- `components/ContactForm.tsx` / `components/Newsletter.tsx` — React Hook Form + Zod,
  real `aria-describedby` wiring to inline error messages.
- `components/Footer.tsx`.

## The prompt that would generate this

This is the natural-language brief you could paste into an AI coding agent using this
skill pack to produce this exact demo:

> Build a cinematic dark-mode SaaS landing page for a fictional AI analytics platform
> called "Nexus." Use a near-black background defined as real OKLCH tokens (e.g.
> `oklch(12% 0.01 260)`) — no pure `#000` or `bg-black` literals, and no ad hoc hex
> anywhere in components. Use a single accent color, acid green
> (`oklch(70% 0.25 145)`), sparingly — CTAs and key highlights only, never washed across
> the whole page. Typography is Manrope for display/body and JetBrains Mono for numbers
> and data labels — no Inter, Roboto, Poppins, DM Sans, or Space Grotesk. Do not use
> purple-to-pink-to-blue gradients, equal-height/equal-weight card grids (make the bento
> grid deliberately asymmetric), `min-h-screen` (use `min-h-[100dvh]` instead), or any
> placeholder/lorem-ipsum copy or suspiciously round numbers in stats. Design mobile-first.
>
> Build these as real React components: a `Hero3D` WebGL particle hero using React Three
> Fiber and drei with an actual `<Canvas>` scene, that functionally respects
> `prefers-reduced-motion` (a real matchMedia-based hook, not a comment); a `BentoGrid`
> asymmetric feature grid with a cursor-tracked spotlight/glow hover effect; a `Pricing`
> component with a 3-tier table, `tabular-nums` for all numbers, and a working
> monthly/annual toggle; a `Testimonials` carousel using the View Transitions API (with a
> documented CSS fallback); a `ContactForm` validated with React Hook Form and Zod, with
> real `aria-describedby` JSX attributes wiring inputs to their error messages; a
> `Newsletter` email signup with validation; and a `Footer`. Wire it all together in
> `app/page.tsx` and `app/layout.tsx`, with design tokens in `lib/tokens.ts`, global styles
> in `app/globals.css`, and Zod schemas in `lib/validation.ts`.
>
> This should be a real, installable, runnable Next.js 15 App Router project — not a
> stub-typed reference file — with its own `package.json`, real dependency versions, and a
> dev server I can actually start. Hold the result to this skill pack's full
> `core/validate-checklist.md`: exported, used `*Props` interfaces (no dead types),
> correct `forwardRef(props, ref)` usage where applicable, OKLCH-only colors with no raw
> hex in component files, `min-h-[100dvh]` not `min-h-screen`, no bare `ease-in` on
> entrance animations, no numeric `&&` in JSX, no `transition-all`, no barrel-file imports,
> `<Canvas dpr={...}>` declared, no raw `requestAnimationFrame` in R3F files, memoized
> manual Three.js geometry/materials, `…` instead of `...` in copy, and no
> placeholder/lorem/AI-slop copy anywhere.
