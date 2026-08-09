# Image Palette Extraction

Deriving a usable palette from a photograph. The whole difficulty is that the
obvious approach — average the pixels — is guaranteed to fail.

## Never average

The mean of a natural image is always the same desaturated brown-grey, because
averaging sums colours from opposite sides of the wheel and they cancel. A sunset
and a forest average to nearly the same value.

The extreme case makes it obvious: an image that is exactly half pure red and
half pure blue averages to a muddy purple that appears nowhere in it and
represents neither half.

Cluster instead. The answer to "what colours are in this image" is a set of
groups, not a centre of mass.

## Reading the pixels

```ts
export function samplePixels(img: HTMLImageElement, maxSide = 160): Uint8ClampedArray | null {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null; // SSR, jsdom, lost GPU process

  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}
```

Downscale first. A 4000×3000 photo is 12 million pixels and clustering it changes
the answer by nothing — 160px on the long edge is plenty, and it turns a
multi-second operation into a few milliseconds. The browser's own image scaler
does the averaging that *is* appropriate here: within a local neighbourhood.

**`getImageData` taints on a cross-origin image** and throws a `SecurityError`.
Set `img.crossOrigin = "anonymous"` before `src`, and serve the image with
`Access-Control-Allow-Origin`. Without both, extraction works locally and fails
in production — the classic version of this bug.

## Median cut

Simple, deterministic, no iteration count to tune. Repeatedly split the box of
colours along its longest axis at the median.

```ts
interface Box { pixels: number[][] }

function medianCut(pixels: number[][], depth: number): number[][] {
  if (depth === 0 || pixels.length === 0) return [centroid(pixels)];

  // Longest axis of the bounding box — the dimension with the most variance.
  let axis = 0, widest = -1;
  for (let i = 0; i < 3; i++) {
    let lo = 255, hi = 0;
    for (const p of pixels) {
      const v = p[i] ?? 0;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (hi - lo > widest) { widest = hi - lo; axis = i; }
  }

  const sorted = [...pixels].sort((a, b) => (a[axis] ?? 0) - (b[axis] ?? 0));
  const mid = sorted.length >> 1;
  return [
    ...medianCut(sorted.slice(0, mid), depth - 1),
    ...medianCut(sorted.slice(mid), depth - 1),
  ];
}
```

Depth `n` yields `2^n` colours: depth 3 gives 8, which is about right for
picking three from. Splitting at the median rather than the midpoint is what
makes it robust — it follows where the pixels actually are, so a large flat sky
does not dominate the split.

## k-means

Better clusters, at the cost of iteration and a seed:

1. Seed `k` centroids — k-means++ (choose each new seed with probability
   proportional to squared distance from the nearest existing one) rather than
   at random, which regularly produces two centroids inside the same cluster.
2. Assign every pixel to its nearest centroid.
3. Move each centroid to the mean of its members.
4. Repeat until movement falls below a threshold, or ~10 iterations.

Cluster in OKLab, not RGB. Euclidean distance in RGB does not match perceived
difference — the same numeric gap is a large visible step in green and a small
one in blue — so RGB clustering merges colours that look distinct and separates
colours that do not. Converting first makes "nearest" mean what the word implies.

For a UI palette, median cut is usually the right choice: deterministic output
matters more than optimal clusters, because a palette that shifts between page
loads on the same image reads as a bug.

## Choosing three from the clusters

Cluster size alone gives you three near-identical greys from any photo with a
large sky. Score instead:

```ts
const scored = clusters.map((rgb) => {
  const { l, c, h } = rgbToOklch(rgb[0], rgb[1], rgb[2]);
  return { l, c, h, weight: rgb[3], score: c * Math.log(rgb[3] + 1) };
});

// Accent: the most colourful cluster that is still usable as a colour.
const accent = scored
  .filter((s) => s.c > 0.04 && s.l > 20 && s.l < 85)
  .sort((a, b) => b.score - a.score)[0];

// Surface: darkest low-chroma cluster for a dark theme, lightest for a light one.
const surface = scored.filter((s) => s.c < 0.06).sort((a, b) => a.l - b.l)[0];
```

The `c > 0.04` filter is what stops a near-grey winning the accent slot on sheer
pixel count. The lightness window excludes near-black and near-white, which are
common, large, and useless as accents.

Weight by the log of cluster size, not size itself — otherwise the background
always wins, and a photograph's background is rarely its subject.

## Normalising into the theme

Extracted colours are *inputs*, not tokens. Take the hue and discard the rest:

```ts
const { h } = rgbToOklch(accent.r, accent.g, accent.b);
const tokens = generateTheme(h, isDark); // fixed lightness ramp, clamped chroma
```

This is the step that keeps a generated theme usable. An image's own lightness
and chroma are whatever the photographer's exposure happened to be, and adopting
them directly produces a theme that fails contrast on some images and looks
washed out on others. Taking only the hue keeps the *identity* of the image and
imposes the ramp you already know works.

Emit OKLCH strings. Never round-trip back to hex — the whole reason to work in
this space is to keep reasoning about lightness and chroma downstream.

## Verify before shipping

Every generated pair still has to be measured (see
`accessibility-aware-schemes.md`). Extraction produces a *candidate*; contrast
decides whether it becomes a token. If the pair fails, adjust lightness on the
fixed ramp — never abandon the check.
