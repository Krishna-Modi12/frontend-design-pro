# Particle Text Systems

Letters made of moving points. The effect is cheap to describe and easy to get
wrong in ways that only show up on someone else's hardware.

## Sampling: text to targets

Do not parse glyph outlines. Draw the string once to an offscreen canvas, read
the pixels, and take every sufficiently opaque one as a target position.

```ts
const STEP = 4; // sample every 4th pixel in both axes

function sampleText(text: string, font: string, w: number, h: number): Target[] {
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return [];

  octx.font = font;
  octx.textAlign = "center";
  octx.textBaseline = "middle";
  octx.fillStyle = "#fff";
  octx.fillText(text, w / 2, h / 2);

  const { data } = octx.getImageData(0, 0, w, h);
  const targets: Target[] = [];
  for (let y = 0; y < h; y += STEP) {
    for (let x = 0; x < w; x += STEP) {
      if (data[(y * w + x) * 4 + 3] > 128) targets.push({ x, y });
    }
  }
  return targets;
}
```

`STEP` is the density dial and it is quadratic: 4 → 2 does not double the
particle count, it quadruples it. Derive the value from the sampled area and a
ceiling rather than hard-coding it:

```ts
const MAX_PARTICLES = 4000;
let step = 4;
while (estimateCount(step) > MAX_PARTICLES) step += 1;
```

A fixed count tuned on a desktop renders as an unreadable smear on a phone,
where the same string occupies a quarter of the pixels.

Re-sample when the text changes, when the canvas resizes, or when the font
finishes loading — and at no other time. Sampling is the expensive operation in
the whole system.

## Physics

Each particle carries a position, a velocity, and its target. Three forces are
enough for every effect worth shipping.

```ts
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number; // target
}
```

**Spring to target** — what assembles the text:

```ts
const dx = p.tx - p.x;
const dy = p.ty - p.y;
p.vx += dx * STIFFNESS * dt;
p.vy += dy * STIFFNESS * dt;
```

**Damping** — what lets it settle instead of oscillating forever:

```ts
p.vx *= DAMPING; // 0.85–0.92; below ~0.8 looks gluey, above ~0.95 never settles
p.vy *= DAMPING;
```

**Pointer repulsion** — the interaction people actually notice:

```ts
const mx = p.x - pointer.x;
const my = p.y - pointer.y;
const d2 = mx * mx + my * my;
if (d2 < RADIUS * RADIUS) {
  const d = Math.sqrt(d2) || 1;
  const force = (1 - d / RADIUS) * REPEL;
  p.vx += (mx / d) * force;
  p.vy += (my / d) * force;
}
```

Compare squared distances and only take the square root inside the branch — the
`Math.sqrt` is the per-particle cost that shows up at scale.

Then integrate, scaled by elapsed time so the effect runs at the same speed on
every display:

```ts
p.x += p.vx * dt;
p.y += p.vy * dt;
```

`dt` is the RAF delta normalised to a nominal frame (`delta / 16.67`). Without
it, a 144Hz monitor runs the animation at 2.4× the speed of a 60Hz one and the
spring constants that felt right on your machine are wrong on everyone else's.

## Pooling

Allocate once, at the largest size you will need, and reuse:

```ts
const pool: Particle[] = [];
function ensure(n: number) {
  while (pool.length < n) pool.push({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
}
```

Then rebind `tx`/`ty` when the text changes and only iterate the first `n`.
Creating objects per frame hands the garbage collector thousands of short-lived
allocations per second; the symptom is a rhythmic stutter every few seconds that
profiles as GC, not as draw time.

Keep the array monomorphic — same properties, same order, same types, always
numbers. A particle that sometimes carries an extra field forces the engine to
deoptimise the hot loop.

## Drawing

```ts
ctx.clearRect(0, 0, w, h);
ctx.fillStyle = accent;      // set ONCE, outside the loop
for (let i = 0; i < n; i++) {
  const p = pool[i];
  ctx.fillRect(p.x, p.y, SIZE, SIZE);
}
```

One `fillStyle` assignment for the whole pass. Per-particle colour means a state
change per particle, which costs more than the fill.

`fillRect` rather than `arc` + `fill`: at 2–3px nobody can tell a square from a
circle in motion, and the square is several times cheaper.

If particles must vary in colour, sort by colour and draw in runs, or encode the
variation in alpha via `globalAlpha` — still a state change, but a cheaper one.

## Colour

Take the accent from the design tokens rather than the sampled pixels. Sampling
colour from the offscreen canvas returns whatever you filled with, which is
meaningless, and sampling from a source image gives muddy averages.

Particles are small, moving, and often thin against the background — exactly the
case where contrast matters most and is hardest to guarantee. Since the DOM text
behind the canvas is the accessible copy, the contrast obligation is met there.
The particles themselves should still read clearly, or the effect looks broken
rather than subtle.

## Reduced motion

Skip the loop entirely and paint the resolved state:

```ts
if (prefersReducedMotion) {
  ctx.fillStyle = accent;
  for (const t of targets) ctx.fillRect(t.x, t.y, SIZE, SIZE);
  return; // no RAF at all
}
```

The words appear, fully formed, with no motion. Hiding the canvas instead would
remove the visual entirely, which is a different and worse outcome.

## Budget

| Particles | Realistic on |
|---|---|
| ≤1,500 | anything, including low-end phones |
| ~4,000 | mid-range laptops and modern phones |
| ~10,000 | desktop GPUs, and only if the loop is tight |
| >10,000 | move to WebGL — 2D canvas is the wrong tool |

The ceiling is per-particle work × count × 60. Past roughly 10,000 the fixed cost
of a draw call per particle dominates and no amount of micro-optimisation in the
loop recovers it; instancing on the GPU is the answer, not a faster `for`.
