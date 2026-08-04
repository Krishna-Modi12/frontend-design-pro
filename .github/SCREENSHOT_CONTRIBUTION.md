# Screenshot contribution

Four demo screenshots are linked from the root `README.md` — one per project in `demo/`:

| Image | Linked from | Surface |
|---|---|---|
| `demo/showcase/screenshot.png` | **See It In Action** | dark |
| `demo/landing-page/screenshot.png` (+ `-full`) | **Demos → What they look like** | dark |
| `demo/dashboard/screenshot.png` (+ `-full`) | same | light |
| `demo/auth-form/screenshot.png` (+ `-full`) | same | light |

These exist because everything else in this repository is machine-checked — 9 release-blocking gates, 53 constraints, a `next build` on the showcase in CI — and none of that is visible to somebody deciding in ten seconds whether to install the pack. One honest screenshot does work that no gate can.

**No gate checks these images.** They go stale silently the moment the UI under them changes, and a stale screenshot is a worse failure mode than a missing one: it actively misrepresents the current app. If you change anything under a `demo/` project, recapture its image in the same PR.

## The spec

Every image, regardless of which demo:

- **1920×1080**, above-the-fold, default viewport. No zoomed-out full-page capture that shrinks the type past legibility.
- **Under 500 KB.** Palette-quantised PNG at 256 colours holds the current set between 41 KB and 116 KB with no visible banding.
- **Reduced motion off**, so animated surfaces render their real state rather than the static fallback.
- The demo's **own** colour scheme — `landing-page` and `showcase` are dark; `dashboard` and `auth-form` default to light and ship a `prefers-color-scheme: dark` variant. Capture what the demo actually is.
- **No dev-server artifacts.** The Next.js dev-tools badge sits bottom-left and must not appear. Capture against a production build, or set `devIndicators: false`.

`screenshot-full.png` companions are linked, not inline: full-page, scaled to 1440 wide so they stay under the same cap.

## Running the demos

`demo/showcase/` is a real installed app and needs nothing special:

```bash
cd demo/showcase
npm install
npm run dev      # http://localhost:3000
```

You should get a dark, near-black page: a WebGL particle hero that tracks the cursor, an asymmetric six-card bento grid with a spotlight hover, a three-tier pricing table with a working annual toggle, a testimonial carousel, and a validated contact form. Acid green appears only on the primary actions. If it looks like a purple gradient with an even card grid, something is wrong — open an issue.

The other three are **stub-typed**: they compile against the ambient `declare module` blocks in `demo/_stubs.d.ts` and no dependency is installed, so they do not run as they stand. Rendering them takes a throwaway Next.js app outside this repo:

1. Scaffold an app and install what the three actually import — `next react react-dom lucide-react recharts react-hook-form @hookform/resolvers zod tailwindcss @tailwindcss/postcss`.
2. Copy each demo directory in whole and re-export its page from a route, so the demos' internal relative imports (`../components/Hero`) keep resolving against their own directory. Do not edit the demo files.
3. **Register the design tokens at build time.** Every one of the three declares its tokens at *runtime* — `dashboard` and `auth-form` in a `:root` block, `landing-page` in an `@theme` block the browser ignores outright because `@theme` is a Tailwind compiler directive, not CSS. Tailwind only emits a utility (`bg-surface`, `text-ink-muted`, `border-hairline`) for a token it saw at build time, so the union of their token names has to appear in an `@theme` block in your CSS entry or the pages render unstyled. The runtime blocks then supply each page's own values on cascade order.
4. Serve `landing-page`'s fixture — see below.
5. `next build && next start`, then drive it with headless Chromium at the spec above.

Type-checking that harness is not worth it: against **real** vendor typings `demo/auth-form`'s `zodResolver(loginSchema)` does not satisfy `Resolver<LoginValues>`, a mismatch the stub-typed regime cannot see because `_stubs.d.ts` types it as `any`. Runtime is unaffected.

## The landing-page fixture

`demo/landing-page/app/page.tsx` fetches `/api/site/overview` on mount for its metric strip, price book, testimonial verifications and region status. That endpoint belongs to the fictional product the page advertises; this repo ships the frontend only. With no backend the page renders its error state — correct behaviour, and not what a reader wants from a screenshot.

[`demo/landing-page/screenshot-fixture.json`](../demo/landing-page/screenshot-fixture.json) is the exact response `screenshot.png` was captured against. Serve it at that path and you reproduce the image. It is committed for one reason: a screenshot nobody can reproduce is asserted, not verified, and that is the thing this repo refuses to do everywhere else.

Its shape is fixed by the demo's own exported types — `PlatformMetric` in `Hero.tsx`, `PlanPrice` in `Pricing.tsx`, `RegionState` in `Footer.tsx`. `Pricing.tsx` already declares the tier names and copy; only the price book crosses the network. If you change the fixture, recapture the image in the same commit.

## What not to do

- Don't add the image reference without the image, or vice versa. Either half alone is a broken promise.
- Don't stage a screenshot with edited copy, invented metrics, or a different brand. The point is to show what the pack actually generates; a retouched screenshot makes the whole verification story worthless. The fixture above is the one piece of supplied data in the set, and it is committed precisely so it is checkable rather than invented.
- Don't commit the `.next/` build output that `npm run dev` creates. It is gitignored — leave it that way.
- Don't commit the throwaway capture harness. It is scaffolding; this document is what makes it reproducible.
