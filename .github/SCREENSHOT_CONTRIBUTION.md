# Screenshot contribution

Four demo screenshots are linked from the root `README.md` — one per project in `demo/`:

| Image | Linked from | Surface |
|---|---|---|
| `demo/showcase/screenshot.png` | **See It In Action** | dark |
| `demo/landing-page/screenshot.png` (+ `-full`) | **Demos → What they look like** | dark |
| `demo/dashboard/screenshot.png` (+ `-full`) | same | light |
| `demo/auth-form/screenshot.png` (+ `-full`) | same | light |

These exist because everything else in this repository is machine-checked — 11 release-blocking gates, 59 constraints, a `next build` on the showcase in CI — and none of that is visible to somebody deciding in ten seconds whether to install the pack. One honest screenshot does work that no gate can.

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

`landing-page` is the second real app, and is captured the same way — from its own directory, on its own port, against its own installed dependencies. `dashboard` and `auth-form` are **stub-typed**: they compile against the ambient `declare module` blocks in `demo/_stubs.d.ts` and install no dependencies, so they do not run as they stand. [`tools/screenshots/`](../tools/screenshots/) is the harness that renders those two — a small Next.js app with the real libraries installed, importing each demo where it lives rather than copying it:

```bash
npm run screenshots                    # every demo it covers: build, capture, compress
npm run screenshots -- landing-page    # one
npm run screenshots -- showcase        # opt-in, see below
```

Its own [README](../tools/screenshots/README.md) covers how it is assembled and the traps inside it. Two things matter when reading a capture:

- **`landing-page` compiles `demo/landing-page/tokens.css` itself.** It addresses its palette through named utilities (`bg-surface-page`, `text-ink-muted`, `border-surface-border`, `ring-accent`), and Tailwind only emits those for tokens registered at build time — which is why that file is imported by the app's own `globals.css` rather than restated anywhere. `@theme` is a compiler directive: shipped in a runtime `<style>` it is dropped as an unknown at-rule and every one of those utilities silently resolves to nothing. A capture cannot drift from what the demo ships.
- **`dashboard` and `auth-form` need nothing.** Both address their palettes through arbitrary `bg-[var(--color-surface)]` utilities against a `:root` block they inject themselves. Registering tokens on their behalf would let the harness flatter them into looking better than they are.

`showcase` is opt-in: its hero is a WebGL particle field seeded at random, so every capture differs and running it by default would dirty that file on every run. The other three regenerate near-deterministically — a multi-kilobyte diff means something really moved, a few bytes is antialiasing noise.

If you touch a demo, run the renderer as well as the gates. It checks what no gate can:

```bash
npm run demos:verify    # page errors, console errors, hydration mismatches,
                        # axe WCAG 2.1 AA, overflow at 390/768/1920 —
                        # in dev and production, in both colour schemes
```

## The landing-page fixture

`demo/landing-page/app/page.tsx` fetches `/api/site/overview` on mount for its metric strip. The demo serves that endpoint itself, from [`demo/landing-page/screenshot-fixture.json`](../demo/landing-page/screenshot-fixture.json) — so the capture is deterministic and a recapture only moves pixels when the UI actually changed.

The fixture is committed for one reason: a screenshot nobody can reproduce is asserted, not verified, and that is the thing this repo refuses to do everywhere else. Its shape is fixed by the demo's own exported `PlatformMetric` type in `MetricsStrip.tsx`.

Every figure in it is copied from a file in this repo — `metadata.json` for the skill, token and gate counts, `docs/TESTING.md` for the test figures — and each entry names its own source. **A stat that moves has to move in both places**, and the image has to be recaptured in the same commit.

## What not to do

- Don't add the image reference without the image, or vice versa. Either half alone is a broken promise.
- Don't stage a screenshot with edited copy, invented metrics, or a different brand. The point is to show what the pack actually generates; a retouched screenshot makes the whole verification story worthless. The fixture above is the one piece of supplied data in the set, and it is committed precisely so it is checkable rather than invented.
- Don't commit the `.next/` build output that `npm run dev` creates. It is gitignored — leave it that way.
- Don't hand-edit an image, or capture one by any route other than `npm run screenshots`. The harness is committed so that "reproducible" is a fact about the repo rather than a claim in this file; a one-off capture puts that back to a claim.
