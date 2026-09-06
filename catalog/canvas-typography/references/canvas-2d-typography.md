# Canvas 2D Typography

Setting type on a `<canvas>` is not setting type in the DOM. Nothing about it is
accessible, selectable, translatable or indexable. Everything here assumes the
real string is already in the DOM and the canvas is `aria-hidden="true"`.

## The context can be null

```ts
const ctx = canvas.getContext("2d");
if (!ctx) return; // SSR, jsdom, lost GPU process, too many live contexts
```

This is not defensive noise. `getContext` returns `null` in four ordinary
situations: during a server render there is no canvas element at all; jsdom (what
most test runners use) implements the element but not the 2D context unless the
`canvas` native package is installed; a crashed GPU process invalidates existing
contexts; and browsers cap the number of simultaneous contexts, quietly returning
`null` past the limit. Code that writes `canvas.getContext("2d")!` fails in test
before it ever fails in production.

## Device pixel ratio

A canvas has two sizes: the CSS box, and the backing store measured in device
pixels. Set only the first and the browser upscales a low-resolution bitmap —
text renders visibly soft on every phone and retina laptop.

```ts
const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2: 3x costs 2.25x the fill rate for no visible gain
const rect = canvas.getBoundingClientRect();

canvas.width = Math.round(rect.width * dpr);
canvas.height = Math.round(rect.height * dpr);
canvas.style.width = `${rect.width}px`;
canvas.style.height = `${rect.height}px`;

ctx.setTransform(1, 0, 0, 1, 0, 0); // reset before scaling — resize handlers compound otherwise
ctx.scale(dpr, dpr);
```

After `ctx.scale(dpr, dpr)` every coordinate you pass is a CSS pixel. Mixing the
two coordinate spaces is the most common source of "it's offset on my monitor
but not yours".

Re-run this on resize. `ResizeObserver` on the canvas's parent is better than a
`window` resize listener: it fires for layout changes that do not resize the
window, and it does not fire for ones that do not affect the element.

## Fonts must load before you measure

```ts
await document.fonts.ready;              // every face used by the document
await document.fonts.load('600 48px Manrope'); // one face — much faster
```

`measureText` and `fillText` do not wait. Called before the webfont arrives they
use the fallback face, so every width, every glyph origin and every sampled pixel
is computed against a typeface that is about to be replaced. The layout then
looks correct for one frame and wrong afterwards.

`document.fonts.load()` needs a full CSS font shorthand including a size — the
size is not optional, and a string without one silently resolves to nothing.

## measureText

```ts
ctx.font = '600 48px Manrope, system-ui, sans-serif';
const m = ctx.measureText("Assemble");

const width = m.width;
const ascent = m.actualBoundingBoxAscent;   // ink above the baseline
const descent = m.actualBoundingBoxDescent; // ink below it
const inkHeight = ascent + descent;
```

`width` is the advance width — where the next glyph would start — and includes
side bearings. The `actualBoundingBox*` values describe the ink itself. For
centring a headline optically, use the ink box; for laying out runs of text, use
the advance.

`fontBoundingBoxAscent`/`Descent` describe the *font's* metrics rather than this
string's, and are what you want for a baseline grid that stays put when the copy
changes.

## Offscreen canvases for sampling and caching

Anything derived from rendered text — particle targets, a mask, a per-glyph
alpha map — should be drawn once to an offscreen canvas and read back, not
recomputed per frame.

```ts
const off = document.createElement("canvas");
off.width = w;
off.height = h;
const octx = off.getContext("2d", { willReadFrequently: true });
if (!octx) return;

octx.font = ctx.font;
octx.textBaseline = "middle";
octx.fillStyle = "#fff";       // sampling only reads alpha; colour here is irrelevant
octx.fillText(text, x, y);

const { data } = octx.getImageData(0, 0, w, h); // RGBA, 4 bytes per pixel
```

`willReadFrequently: true` tells the browser to keep the surface in system memory
rather than on the GPU. Without it, every `getImageData` forces a readback across
the bus and the first sample can cost tens of milliseconds.

Read alpha, not colour: `data[i + 3] > 128` is the standard "this pixel is
covered" test, and it is independent of what you filled with.

`OffscreenCanvas` is the same API off the main thread. It is worth reaching for
only when sampling is genuinely blocking — a large string re-sampled on every
keystroke. For a headline sampled once, a detached `<canvas>` is simpler and
available everywhere.

## The render loop

```ts
let raf = 0;
let last = performance.now();

const frame = (now: number) => {
  const delta = Math.min(now - last, 32); // clamp: a backgrounded tab returns a huge delta
  last = now;

  ctx.clearRect(0, 0, rect.width, rect.height);
  // ...draw using `delta` milliseconds, never a fixed per-frame step
  raf = requestAnimationFrame(frame);
};

raf = requestAnimationFrame(frame);
return () => cancelAnimationFrame(raf);
```

The clamp matters. Return to a tab that has been hidden for a minute and `delta`
is 60,000ms; anything integrating over it teleports. Clamping to roughly two
frames means the animation resumes rather than jumps.

Always return the cancel from a React effect. A leaked loop keeps drawing to a
detached canvas — invisible, but still burning a frame's work forever.

## Reduced motion

```ts
const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
if (mq.matches) {
  drawFinalState(ctx); // assembled, settled, at rest
  return;              // no loop at all
}
```

Reduced motion means *skip to the end*, not *show nothing*. Draw the resolved
composition once and never start the loop. Subscribe to the query's `change`
event too — it can flip while the page is open.

## Performance

- `clearRect` only the region that changed when the effect is localised. Full
  clears are fine for full-bleed effects and simpler to reason about.
- Batch by state: set `fillStyle` once and draw every particle sharing it. State
  changes are the expensive part of a 2D context, not the draws.
- For many small identical marks, `fillRect` beats `arc`; a 2px square and a 2px
  circle are indistinguishable in motion and the square costs far less.
- Cache anything static — a background, a rule, a repeated glyph — into a second
  canvas and `drawImage` it, rather than re-stroking every frame.
