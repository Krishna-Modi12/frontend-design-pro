# Tracepoint — landing page

A real, standalone Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 app.
It has its own `package.json`, real installed dependencies and a dev server that boots —
it is not one of the stub-typed reference files under `demo/`.

```bash
npm install
npm run dev   # http://localhost:3000
```

```bash
npm run typecheck   # tsc --noEmit, strict + noUncheckedIndexedAccess
npm run build       # next build
```

It's a landing page for a fictional durable-execution product, "Tracepoint": near-black
OKLCH surface held to a single hue, one acid-green accent, Geist Sans and Geist Mono,
an asymmetric hero with a workflow code panel, a metric strip on an uneven track, a bento
feature grid, three-tier pricing with an annual toggle, testimonials and a minimal footer.

## The data it reads

`app/page.tsx` fetches `/api/site/overview` once on mount for the metric strip, the price
book, testimonial verifications and the region status. That endpoint belongs to the
fictional product, so `app/api/site/overview/route.ts` serves
[`screenshot-fixture.json`](screenshot-fixture.json) — the same file the committed
screenshots were captured against.

One request feeds every section because they share one failure: if the control plane is
down, a live pricing table beside a broken metric strip is worse than both reading as
unavailable. Every consumer therefore renders four states — loading, error with a retry,
ready, and empty — and none of them is faked with a `setTimeout`. To see one, edit the
fixture or point the route somewhere that fails.

## Tokens

[`tokens.css`](tokens.css) is the palette, and `app/globals.css` imports it **after**
`@import "tailwindcss"`, then re-exports the display and mono faces through `@theme inline`.
The order is load-bearing: the palette is addressed through named utilities (`bg-surface`,
`text-ink`, `border-hairline`, `ring-accent`), and Tailwind only emits those for tokens
registered at build time. Lift the page into a project and `tokens.css` goes with it.

Metric figures carry `data-metric`, which `lib/tokens.ts` maps to the mono face with
`font-variant-numeric: tabular-nums`, so a digit changing on a re-read cannot reflow a row.

## Notes for anyone extending it

- **No static export.** `output: "export"` drops route handlers, so `/api/site/overview`
  would 404 and the page would render its error state permanently. `next.config.ts` says so
  in a comment; don't add it back without also removing the fetch.
- **Tailwind v4 PostCSS.** `postcss.config.mjs` names `@tailwindcss/postcss`, not
  `tailwindcss` — the plugin moved out of the main package in v4 and naming it the v3 way
  fails the build outright.
- **`forwardRef` where it earns its place.** `CtaButton` forwards a ref because the page
  returns focus to it when the quickstart disclosure closes. Section wrappers aren't
  interactive and don't.

Recapture instructions for the images README links:
[`.github/SCREENSHOT_CONTRIBUTION.md`](../../.github/SCREENSHOT_CONTRIBUTION.md).
