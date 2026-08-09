# Text on a Path, and Scramble Reveals

Two effects that share one property: the letters stay real text in the DOM, so
neither costs anything in accessibility if built correctly, and both become
inaccessible the moment they are moved onto a canvas.

## Text on a path — use SVG

```html
<svg viewBox="0 0 600 200" aria-hidden="true" focusable="false">
  <path id="arc" d="M 20 160 Q 300 20 580 160" fill="none" />
  <text>
    <textPath href="#arc" startOffset="50%" text-anchor="middle">
      Durable execution
    </textPath>
  </text>
</svg>
<span class="sr-only">Durable execution</span>
```

`<textPath>` is the whole feature. The browser handles spacing, kerning and
rotation along the curve, and the text remains selectable and readable by
assistive technology — provided you give the `<svg>` an accessible name via
`<title>`, or mark it `aria-hidden` and put the string in the DOM alongside, as
above. Do not do both; a duplicated name is read twice.

`startOffset` positions the run along the path; with `text-anchor="middle"`,
`50%` centres it. `side="right"` flips text to the inside of a curve, which is
what you want for the lower half of a circular badge — otherwise it renders
upside down.

The path must have an `id` and live in the same document. Referencing a path in
an external file works in no browser worth supporting.

### When you genuinely need canvas

Per-character control the layout engine will not give you — each glyph on its own
timeline, or a path that changes per frame:

```ts
const path = svgPathElement;
const len = path.getTotalLength();

let travelled = 0;
for (const ch of text) {
  const w = ctx.measureText(ch).width;
  const pt = path.getPointAtLength(travelled + w / 2);
  const ahead = path.getPointAtLength(Math.min(travelled + w / 2 + 1, len));
  const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x);

  ctx.save();
  ctx.translate(pt.x, pt.y);
  ctx.rotate(angle);
  ctx.fillText(ch, -w / 2, 0);
  ctx.restore();
  travelled += w;
}
```

`getPointAtLength` on a detached, never-rendered `<path>` works and is the usual
way to do this — the element does not need to be visible, only in the document.

Advance by each glyph's own measured width, not by `total / count`. Fixed
advances space `l` and `W` identically, which looks wrong immediately.

The tangent comes from sampling one unit ahead. Sampling *behind* lags the
rotation by a glyph and the text appears to peel off the curve.

Cache `getTotalLength()`. It is not free and the path rarely changes.

## Scramble / decode

Each character cycles through random glyphs, then locks to its final value. The
effect works because of the stagger — simultaneous resolution reads as a flicker.

```ts
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface Slot { to: string; start: number; end: number; shown: string }

// Build once, per reveal:
const slots: Slot[] = [...target].map((to, i) => ({
  to,
  start: i * 40,              // stagger — this is the whole effect
  end: i * 40 + 260 + Math.random() * 200,
  shown: "",
}));
```

Per frame, advance an elapsed clock and resolve each slot:

```ts
for (const s of slots) {
  if (elapsed >= s.end) s.shown = s.to;
  else if (elapsed >= s.start) s.shown = CHARS[(Math.random() * CHARS.length) | 0];
  else s.shown = "";
}
setText(slots.map((s) => s.shown).join(""));
```

Drive `elapsed` from the RAF timestamp. `setInterval` at 30ms drifts against the
display, keeps running in a hidden tab, and cannot be cancelled on a frame
boundary.

Preserve spaces and punctuation rather than scrambling them — word boundaries are
what make a half-resolved string still read as language instead of noise.

Total duration should stay under about 800ms. Longer and it stops reading as a
reveal and starts reading as a page that has not loaded.

### Layout stability

Scrambling changes glyph widths every frame, so the line reflows continuously and
drags everything below it. Two fixes:

- `font-variant-numeric: tabular-nums` if the content is numeric.
- Reserve the final width up front: render the resolved string in a hidden
  element and set `min-width` from it, or use a monospace face for the duration.

### Accessibility

The scrambling text must not be what a screen reader reads — a stream of random
characters announced letter by letter is actively hostile.

```html
<span aria-hidden="true">{scrambled}</span>
<span class="sr-only">{target}</span>
```

Never put `aria-live` on the scrambling element. Every intermediate frame would
be announced.

Under `prefers-reduced-motion: reduce`, render the target string immediately and
never start the loop. Not a faster scramble — no scramble.

```ts
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setText(target);
  return;
}
```

## Cleanup

Both effects hold a RAF handle, and the scramble usually holds timers too. React
effects must return a cleanup that cancels every one of them:

```ts
return () => {
  cancelAnimationFrame(raf);
  mq.removeEventListener("change", onChange);
};
```

A leaked loop calling `setState` after unmount is the classic version of this
bug: it keeps the component's whole subtree alive in memory, and in development
it surfaces as a warning that people learn to ignore.
