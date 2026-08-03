# Screenshot contribution

`demo/showcase/screenshot.png` exists and is linked from the root `README.md`'s **See It In Action** section — captured above-the-fold, default viewport, reduced motion off, via a headless Chromium driving the real dev server on a machine that actually had one available.

This doc stays because the screenshot *will* go stale the next time `demo/showcase`'s UI changes, and a stale screenshot is a worse failure mode than a missing one — it actively misrepresents the current app. If you change anything under `demo/showcase/`, recapture it using the spec below.

The app's own docs are [`demo/showcase/README.md`](../demo/showcase/README.md) — what each component demonstrates, the Node 25 `localStorage` caveat, and the exact prompt that generated it.

## Running it

```bash
cd demo/showcase
npm install
npm run dev      # http://localhost:3000
```

You should get a dark, near-black page: a WebGL particle hero that tracks the cursor, an asymmetric six-card bento grid with a spotlight hover, a three-tier pricing table with a working annual toggle, a testimonial carousel, and a validated contact form. Acid green appears only on the primary actions. If it looks like a purple gradient with an even card grid, something is wrong — open an issue.

## Recapturing the image

Open a PR replacing `demo/showcase/screenshot.png` — 1920×1080, under 500 KB, above-the-fold (the current one is; it's the more honest crop than full-page). The `README.md` reference doesn't need to change unless the filename does.

Please capture it with:

- **Reduced motion off**, so the hero renders its particle field rather than the static fallback.
- **Dark mode**, which is the only mode the showcase implements.
- The default viewport width — no zoomed-out full-page capture that shrinks the type past legibility.

## What not to do

- Don't add the image reference without the image, or vice versa. Either half alone is a broken promise.
- Don't stage the screenshot with edited copy, invented metrics, or a different brand. The point is to show what the pack actually generates; a retouched screenshot makes the whole verification story worthless.
- Don't commit the `.next/` build output that `npm run dev` creates. It is gitignored — leave it that way.

## Why this matters more than it looks

Everything else in this repository is machine-checked: 9 release-blocking gates, 53 constraints, a `next build` on this very app in CI. None of that is visible to somebody deciding in ten seconds whether to install the pack. One honest screenshot does work that no gate can.
