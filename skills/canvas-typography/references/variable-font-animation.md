# Variable Font Animation

A variable font carries continuous axes instead of discrete cuts. Animating one
is the cheapest kinetic typography there is: no canvas, real selectable text,
and the accessibility story is free because the words never leave the DOM.

## The axes

| Tag | Name | Typical range | Reads as |
|---|---|---|---|
| `wght` | Weight | 100–900 | emphasis, arrival, pressure |
| `wdth` | Width | 75–125 | space, compression, tension |
| `slnt` | Slant | -15–0 | motion, speed |
| `ital` | Italic | 0–1 | a discrete switch, not a slider |
| `opsz` | Optical size | 8–144 | should track the rendered size, not be animated |

**Ranges are per font.** Nothing warns you when you exceed them — the browser
clamps to the nearest supported value and the animation appears to stall partway.
Read the real range from the foundry's specimen, or in DevTools' Fonts pane, and
never assume 100–900 because that is common.

`opsz` is the odd one out: it exists to compensate for rendering size and should
follow `font-size`, which `font-optical-sizing: auto` already does. Animating it
independently is a bug that looks like a design choice.

## Declaring it

```css
@font-face {
  font-family: "Manrope";
  src: url("/fonts/Manrope.woff2") format("woff2-variations");
  font-weight: 200 800;  /* the real range — this is what makes wght animatable */
  font-display: swap;
}
```

The range on `font-weight` is what tells the browser the face is variable across
that span. Declare a single value and every intermediate weight snaps.

## Animating

Prefer the high-level property. `font-weight` is animatable and, on a variable
face, interpolates continuously:

```css
.headline {
  font-weight: 300;
  transition: font-weight 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
.headline:hover { font-weight: 750; }
```

Reach for `font-variation-settings` only for axes with no CSS property of their
own — custom axes, or `wdth` where you want explicit control:

```css
.headline {
  font-variation-settings: "wght" 300, "wdth" 100;
  transition: font-variation-settings 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

Two rules about `font-variation-settings`, both of which cause silent failures:

1. **It is one property.** Setting it anywhere replaces every axis, so omitting
   `"wdth"` in a later rule resets width to default. Always restate the full set.
2. **It overrides `font-weight`.** If both are present, the settings string wins,
   and the `font-weight` declaration next to it does nothing. Pick one mechanism
   per element.

Interpolation between two settings strings only works if both list the same axes
in the same order. `"wght" 300` → `"wght" 700, "wdth" 90` does not interpolate;
it jumps.

## Driving from scroll

```ts
const el = ref.current;
if (!el) return;

let raf = 0;
const onScroll = () => {
  if (raf) return;                       // coalesce to one update per frame
  raf = requestAnimationFrame(() => {
    raf = 0;
    const r = el.getBoundingClientRect();
    const p = 1 - Math.min(Math.max(r.top / window.innerHeight, 0), 1);
    el.style.fontWeight = String(Math.round(200 + p * 600));
  });
};

window.addEventListener("scroll", onScroll, { passive: true });
return () => {
  window.removeEventListener("scroll", onScroll);
  cancelAnimationFrame(raf);
};
```

`{ passive: true }` matters — a non-passive scroll listener blocks the compositor
and makes the whole page feel heavy, which is a steep price for a weight axis.

Round the value. Sub-integer weights force a re-shape for a difference nobody can
see.

Scroll-driven animations in CSS (`animation-timeline: view()`) do this off the
main thread where supported, and degrade to no animation where not — which is an
acceptable resting state for an effect like this.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .headline {
    transition: none;
    font-weight: 700; /* the resting/settled value */
  }
}
```

The rule is the same as everywhere else: land on the final state, immediately.
Freezing at the *initial* value is the common mistake — a headline stuck at 200
because that was the from-state reads as a rendering bug, not as respect.

For JS-driven axes, check the query before attaching the listener at all, and
subscribe to its `change` event so the page responds if the preference flips
while open.

## Performance

Weight changes re-shape and re-raster the text. That is fine for a headline and
expensive for a paragraph — the cost scales with glyph count, so animating the
axis on body copy visibly drops frames.

`will-change: font-variation-settings` is almost never right; it promotes a layer
for something that is not composited anyway. Leave it off.

Variable fonts are one file instead of six, which is usually a net win — but a
full variable face with many axes can be larger than the two static cuts a page
actually uses. Subset the axes as well as the glyphs.

## What the motion should say

Weight increasing on entrance reads as arrival and settling. Weight increasing on
hover reads as response to the pointer. Weight oscillating continuously reads as
a broken font loader — the one pattern to avoid, however impressive the demo.

One axis per gesture. `wght` and `wdth` moving together is not twice the
expression; it is a headline that appears to breathe, which is distracting on
every read after the first.
