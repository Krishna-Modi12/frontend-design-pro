# Screenshot contribution

`demo/showcase/` is a real Next.js app and renders at `http://localhost:3000`, but this repo ships no screenshot of it. The reason is plain: the releases were cut by an agent with no browser, and a placeholder image or a `![](screenshot.png)` pointing at nothing would be worse than an honest gap — a broken image tells a visitor the project is unmaintained, which is the opposite of what a screenshot is for.

So the gap is left open, and documented here instead.

The app's own docs are [`demo/showcase/README.md`](../demo/showcase/README.md) — what each component demonstrates, the Node 25 `localStorage` caveat, and the exact prompt that generated it.

## Running it

```bash
cd demo/showcase
npm install
npm run dev      # http://localhost:3000
```

You should get a dark, near-black page: a WebGL particle hero that tracks the cursor, an asymmetric six-card bento grid with a spotlight hover, a three-tier pricing table with a working annual toggle, a testimonial carousel, and a validated contact form. Acid green appears only on the primary actions. If it looks like a purple gradient with an even card grid, something is wrong — open an issue.

## Contributing the image

Open a PR adding:

1. `demo/showcase/screenshot.png` — 1920×1080, under 500 KB. Full page or above-the-fold, either is useful; above-the-fold is generally the more honest one.
2. A reference to it from the **See It In Action** section of the root `README.md`.

Please capture it with:

- **Reduced motion off**, so the hero renders its particle field rather than the static fallback.
- **Dark mode**, which is the only mode the showcase implements.
- The default viewport width — no zoomed-out full-page capture that shrinks the type past legibility.

## What not to do

- Don't add the image reference without the image, or vice versa. Either half alone is a broken promise.
- Don't stage the screenshot with edited copy, invented metrics, or a different brand. The point is to show what the pack actually generates; a retouched screenshot makes the whole verification story worthless.
- Don't commit the `.next/` build output that `npm run dev` creates. It is gitignored — leave it that way.

## Why this matters more than it looks

Everything else in this repository is machine-checked: 9 release-blocking gates, 51 constraints, a `next build` on this very app in CI. None of that is visible to somebody deciding in ten seconds whether to install the pack. One honest screenshot does work that no gate can.
