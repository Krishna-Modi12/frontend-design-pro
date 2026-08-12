# `demo/landing-page` — Switchyard

A dark-mode SaaS landing page for **Switchyard**, a fictional release-orchestration
product. It is sample output: the page the pack produces from the prompt recorded
in [`docs/DEMO_PROMPTS.md`](../../docs/DEMO_PROMPTS.md), built under the pack's own
rules, with nothing on it hand-waved.

Switchyard does not exist. The quotes on the page are invented, and the page says
so. It is the same arrangement as [`demo/showcase/`](../showcase/), which is a
page for the fictional "Nexus".

## Run it

```bash
cd demo/landing-page
npm install
npm run dev            # http://localhost:3000
```

```bash
npm run typecheck      # tsc --noEmit, strict, with noUncheckedIndexedAccess
npm run build          # server build — what `next start` and the harnesses need
npm start
```

The parent repo installs none of these dependencies. This app has its own
`package.json` and its own lockfile, and `demo/tsconfig.json` excludes it from
the stub-typed regime the other demos use, so it type-checks against real
vendor typings.

## Four things that will bite you

**The static export is opt-in, and must stay that way.**

```bash
NEXT_OUTPUT_EXPORT=1 npm run build     # static export in out/
```

`tools/screenshots/lib/next-server.mjs` starts every demo with `next start`, and
`next start` refuses to run at all against an exported build. An unconditional
export takes down `npm run screenshots` and `npm run demos:verify` together —
the only two checks in this repo that render anything. Everything else reads
source.

The other half of that problem is solved rather than avoided: an export drops
*dynamic* route handlers, so `/api/site/overview` would 404 and leave the page in
its error state permanently. The handler is `force-static`, so Next evaluates it
at build time and writes the response into the output. `next dev` still re-reads
`screenshot-fixture.json` per request — verified, not assumed — so editing the
fixture still shows up on reload.

**A deployed build serves from a sub-path, and `fetch` does not know that.**
Next rewrites its own asset URLs from `basePath` but not the URLs you hand to
`fetch`. `app/page.tsx` reads `NEXT_PUBLIC_BASE_PATH` for exactly this reason; a
root-anchored `/api/site/overview` would 404 under a sub-path deploy and render
as a convincing imitation of a broken endpoint. `next.config.ts` takes the
private `NEXT_BASE_PATH` — a client component can only read the public one.

**PostCSS names `@tailwindcss/postcss`, not `tailwindcss`.** The plugin moved out
of the main package in Tailwind v4; the v3 key fails the build outright. There is
no `autoprefixer` either — v4 prefixes through Lightning CSS.

**`tokens.css` is separate from `lib/tokens.ts`, and the split is load-bearing.**
`@theme` is a Tailwind compiler directive, not CSS. It has to live in a stylesheet
the build reads, or every utility built from it — `bg-surface-page`,
`text-ink-muted`, `ring-accent` — silently resolves to nothing, with no error
anywhere. `lib/tokens.ts` carries only plain CSS that is valid at runtime, and
reads the palette back as `var(--color-*)` rather than restating it.

Lifting the palette into another project means taking `tokens.css` and importing
it **after** Tailwind. Import order in `app/globals.css` is deliberate and
commented.

## Where the page's own rules come from

Every constraint the page holds itself to is one the pack enforces on its
examples, and the suite runs on this directory too:

```bash
python scripts/test_constraints.py --dir demo --recursive --project
node scripts/parser_constraints.js demo/landing-page/components/*.tsx
```

The visible ones: no equal-height card grid — the bento runs 2+1+1 over 1+2+1 and
the metric strip on a `2fr 1fr 1fr 1fr` track; OKLCH only, no hex; Geist rather
than Inter; `min-h-[100dvh]` rather than the `screen` variant; ease-out on every
transition; `tabular-nums` on every figure; a real fetch with four real states
rather than a `setTimeout` skeleton; `forwardRef` on the one interactive control
that needs it rather than on every wrapper.

The figures come from [`screenshot-fixture.json`](screenshot-fixture.json), served
by the demo's own `/api/site/overview`, so the capture is deterministic and a
recapture only moves pixels when the UI actually changed.

**No figure on this page describes `frontend-design-pro`.** The version before
this one quoted the pack's own counts and two of them drifted — it rendered
"Six of 53" against a real count of 59, and a gate count that was one behind, on
a screenshot linked from the repo README. A page about a fictional product has
nothing to keep in step.

## Recapture

```bash
npm run screenshots -- landing-page
```

1920×1080 above the fold plus a full-page pass, quantised under a 500 KB cap.
Details in [`.github/SCREENSHOT_CONTRIBUTION.md`](../../.github/SCREENSHOT_CONTRIBUTION.md).
