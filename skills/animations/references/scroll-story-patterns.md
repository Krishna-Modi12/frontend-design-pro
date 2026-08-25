# Scroll-Story Patterns

Six scene-level composites for pages that have to *narrate* as they scroll —
brand statements, product manifestos, methodology pages. Each is built from a
mechanic `scroll-experience.md` already teaches; what this file adds is the
composition, the numbers that make it read as authored rather than busy, and the
degradation path.

Load it only after `motion-budget.md` has put the page at L3. At any lower tier
these are over-budget by definition.

## Contents

- [When a page earns this tier](#when-a-page-earns-this-tier)
- [Pattern 1 — Card constellation hero](#pattern-1--card-constellation-hero)
- [Pattern 2 — Card collapse transition](#pattern-2--card-collapse-transition)
- [Pattern 3 — Pinned narrative with swapping scenes](#pattern-3--pinned-narrative-with-swapping-scenes)
- [Pattern 4 — The WebGL signature moment](#pattern-4--the-webgl-signature-moment)
- [Pattern 5 — Ghosted section title](#pattern-5--ghosted-section-title)
- [Pattern 6 — Abstract gradient card tops](#pattern-6--abstract-gradient-card-tops)
- [Degradation and performance](#degradation-and-performance)
- [What was corrected on the way in](#what-was-corrected-on-the-way-in)
- [Sources](#sources)

---

## When a page earns this tier

Upstream states the trigger as any of: the brief names a cinematic reference
site; the brief says the current page is "plain", "flat", or asks for
scroll-driven or 3D treatment; or the page's job is a *position* — brand,
methodology, manifesto — rather than delivering information.

It then sets a floor: an L3 page should carry at least three of the four
structural moves below, and no more than two screens should pass without a
signature moment.

| Move | Minimum |
|---|---|
| Pin-and-scrub scene — a section holds while its content transforms | ≥ 1 |
| Container swap — one side pinned, the other cycling scenes | ≥ 1 |
| Converge or disperse transition — elements merging into the next section | ≥ 1 |
| A genuine 3D signature moment, not CSS 3D | ≥ 1 |

Treat that as upstream's house style, not as this pack's rule. It is a useful
counterweight to a page that reveals a hundred things identically, and it
conflicts with `motion-budget.md` the moment it is read as a quota: our ceiling
is six to eight signature moments at L3, exactly one WebGL surface per page, and
at most three GSAP timelines. **The ceiling wins.** A page that satisfies the
floor and breaches the ceiling is over-animated, not thorough.

---

## Pattern 1 — Card constellation hero

Ten to fifteen sample cards floating at different depths, rotations and blurs
around a central claim, with the whole field parallaxing on pointer movement.
Each card should be a real artefact — a screenshot, an output sample — because
the pattern's entire argument is "here is what this makes".

Built from: `scroll-experience.md` § Framer Motion — parallax layers, extended
into three dimensions. **Costs one signature moment**, plus one *heavy
continuous* slot for the idle float.

```css
.constellation {
  position: relative;
  perspective: 1400px;
  transform-style: preserve-3d;
  block-size: 100dvh;
}

.star-card {
  position: absolute;
  inset-block-start: calc(50% + var(--y, 0) * 1px);
  inset-inline-start: calc(50% + var(--x, 0) * 1px);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 14px;
  transform-style: preserve-3d;
  transform:
    translate3d(-50%, -50%, var(--z, 0px))
    rotateX(var(--rx, 0deg))
    rotateY(var(--ry, 0deg))
    rotateZ(var(--rz, 0deg));
  filter: blur(var(--blur, 0px));
  opacity: calc(1 - var(--blur, 0) * 0.08);
  box-shadow: 0 20px 50px oklch(0% 0 0 / 0.3);
  transition: filter 500ms var(--ease-cinema);
}
```

Position each card by writing the custom properties, not by writing a transform —
that keeps one source of truth for depth, which the parallax handler below reads
back.

```ts
const cards = gsap.utils.toArray<HTMLElement>(".star-card");
const still = window.matchMedia("(prefers-reduced-motion: reduce)");
const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

// Idle breathing — each card on its own period so the field never pulses in unison.
if (!still.matches) {
  cards.forEach((card) => {
    gsap.to(card, {
      y: `+=${gsap.utils.random(-16, 16)}`,
      rotate: `+=${gsap.utils.random(-4, 4)}`,
      duration: gsap.utils.random(4, 7),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  });
}

// Pointer parallax — depth-weighted, so near cards move more than far ones.
const stage = document.querySelector<HTMLElement>(".constellation");
if (stage && fine.matches && !still.matches) {
  stage.addEventListener("pointermove", (e) => {
    const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    cards.forEach((card) => {
      const depth = Number.parseFloat(card.style.getPropertyValue("--z") || "0") / 200;
      gsap.to(card, { x: dx * 20 * depth, y: dy * 20 * depth, duration: 0.8, ease: "power3.out" });
    });
  }, { passive: true });
}
```

**The numbers that make it read as depth rather than as clutter:**

| Layer | `--z` | `--blur` |
|---|---|---|
| Foreground | 0 to 100 | 0 — must stay legible |
| Mid | −200 to −400 | 2–4px |
| Far | −500 to −700 | 6–10px |

Rotations stay within ±15° on every axis; past that the field reads as torn paper
rather than as cards in space. Vary the card sizes (roughly 180×220 up to
320×400) — a constellation of identical rectangles is a grid that happens to be
crooked.

**The cost nobody budgets for.** `filter: blur()` on a dozen positioned elements
is repainted on every parallax frame. Keep blurred cards non-interactive, do not
also give them `will-change: filter` (which promotes each to its own layer and
multiplies memory), and drop the blur entirely on the mobile path below.

---

## Pattern 2 — Card collapse transition

The constellation's scattered cards fly to the centre and merge into the single
container that opens the next section. It is what makes two sections read as one
continuous move rather than as a cut.

Built from: `scroll-experience.md` § GSAP ScrollTrigger — section reveal.
**Costs one signature moment and one timeline.**

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: ".constellation",
    start: "bottom 80%",
    end: "bottom top",
    scrub: 1,
    invalidateOnRefresh: true,
  },
})
  .to(".star-card", {
    x: 0, y: 0, z: 0,
    rotateX: 0, rotateY: 0, rotateZ: 0,
    filter: "blur(0px)",
    scale: 0.05,
    opacity: 0,
    stagger: { amount: 0.6, from: "random" },
    ease: "power2.in",
  })
  .from(".next-section .hero-panel", {
    scale: 0.7, opacity: 0, duration: 1, ease: "power3.out",
  }, "-=0.4");
```

Three things decide whether this lands. The convergence point must be the next
section's actual container — cards that vanish into nothing read as a bug.
`from: "random"` on the stagger matters more than it sounds: a uniform stagger
produces a visible wave, and the point is leaves in wind. And the scroll distance
needs to be long, 80–100vh, or the collapse is a snap rather than a gather.

Note the `scale: 0.05` rather than upstream's `scale: 0`. This skill does not
animate to zero scale, because a zero-scale element is a singularity the compositor
handles inconsistently; at 0.05 with `opacity: 0` the card is already invisible.

---

## Pattern 3 — Pinned narrative with swapping scenes

A section pins. The left column — heading, body, call to action — holds still
while the right column cycles three or four scenes as the scroll progresses. It
is the workhorse of this tier: one pin buys you four beats of narrative.

Built from: `scroll-experience.md` § GSAP — Pinned storytelling sequence.
**Costs one signature moment and one timeline**, regardless of scene count.

```html
<section class="pin-swap">
  <div class="pin-swap-inner">
    <div class="left">
      <!-- Every scene's copy ships in the markup. Only visibility changes. -->
      <div class="copy" data-scene="0">
        <h2>Writing</h2><p>…</p><a class="pin-cta" href="/write">Try it</a>
      </div>
      <div class="copy" data-scene="1" hidden>
        <h2>Drawing</h2><p>…</p><a class="pin-cta" href="/draw">Try it</a>
      </div>
    </div>
    <div class="right">
      <div class="scene" data-scene="0">…</div>
      <div class="scene" data-scene="1" hidden>…</div>
    </div>
  </div>
</section>
```

```css
.pin-swap { block-size: 400dvh; }             /* one viewport per scene */
.pin-swap-inner {
  position: sticky;
  inset-block-start: 0;
  block-size: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  align-items: center;
}
.right { position: relative; }
.scene { position: absolute; inset: 0; opacity: 0; transition: opacity 400ms ease-out; }
.scene.is-active { opacity: 1; }
```

```ts
const scenes = gsap.utils.toArray<HTMLElement>(".scene");
const copies = gsap.utils.toArray<HTMLElement>(".copy");
let current = -1;

ScrollTrigger.create({
  trigger: ".pin-swap",
  start: "top top",
  end: "bottom bottom",
  scrub: 0.5,
  invalidateOnRefresh: true,
  onUpdate: (self) => {
    const idx = Math.min(Math.floor(self.progress * scenes.length), scenes.length - 1);
    if (idx === current) return;                 // only touch the DOM on a real change
    current = idx;
    scenes.forEach((s, i) => {
      s.classList.toggle("is-active", i === idx);
      s.hidden = i !== idx;
    });
    copies.forEach((c, i) => { c.hidden = i !== idx; });
  },
});
```

**Why the copy is markup rather than a string array.** Upstream drives the left
column by assigning `textContent` from a JavaScript array. That leaves only the
first scene's words in the served HTML, so a crawler, a reader-mode view and a
client that never hydrates all see one quarter of the section; it also mutates
text under a screen reader with no announcement. Shipping every scene and
toggling `hidden` costs nothing and fixes both.

The guard on `idx === current` is not micro-optimisation. `onUpdate` fires on
every scroll tick, and without it you rewrite the DOM dozens of times per second
to produce the same result.

Design notes: give each transition a beat, so the swap feels like arriving rather
than page-flipping. Make consecutive scenes genuinely different — a different
product surface, not the same screenshot with new labels. The call to action may
stay fixed or retarget per scene, but if it retargets, the label should say so.

---

## Pattern 4 — The WebGL signature moment

One centred three-dimensional object — glass, metallic, or shader-driven —
rotating and deforming with scroll, usually with orbital particles and a bloom.

**Costs the page's entire WebGL allowance.** `motion-budget.md` permits exactly
one such surface per page, and the reason is not aesthetic: a second WebGL
context on a mid-range phone competes for the same GPU and both degrade.

This pack writes React Three Fiber rather than imperative Three.js, drives frames
through `useFrame` rather than a bare render loop, and takes colour from OKLCH
tokens — `3D-02`, `3D-05` and `3D-06` are enforced over every code block in this
corpus, so the imperative upstream version would fail the build as written.

```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import type { Mesh } from "three";

function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function SignatureObject({ scroll }: { scroll: React.RefObject<number> }): React.ReactElement {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => new THREE.TorusKnotGeometry(1, 0.3, 180, 32), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        transmission: 0.92,
        thickness: 1.5,
        roughness: 0.15,
        iridescence: 1,
        iridescenceIOR: 1.3,
        clearcoat: 1,
        color: new THREE.Color("oklch(100% 0 0)"),
      }),
    [],
  );

  useFrame((_state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.z += delta * 0.12;           // delta-driven, not per-frame constant
    mesh.current.rotation.y = (scroll.current ?? 0) * Math.PI * 2;
    mesh.current.rotation.x = (scroll.current ?? 0) * Math.PI;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

export function SignatureScene({ scroll }: { scroll: React.RefObject<number> }): React.ReactElement {
  const cool = readToken("--color-accent-cool", "oklch(82% 0.11 182)");
  const warm = readToken("--color-accent-warm", "oklch(75% 0.16 55)");

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 45, position: [0, 0, 5] }}
      aria-hidden="true"
    >
      <hemisphereLight args={[new THREE.Color("oklch(100% 0 0)"), new THREE.Color("oklch(20% 0 0)"), 1]} />
      <pointLight position={[3, 3, 3]} intensity={4} distance={20} color={new THREE.Color(cool)} />
      <pointLight position={[-3, -2, 3]} intensity={4} distance={20} color={new THREE.Color(warm)} />
      <SignatureObject scroll={scroll} />
    </Canvas>
  );
}
```

`dpr={[1, 2]}` caps the pixel ratio — `3D-01` requires it, because rendering a
transmission material at a phone's native 3× is the single fastest way to drop to
fifteen frames per second. `aria-hidden` marks the canvas decorative, which
`3D-04` requires unless it is labelled; the words the scene illustrates must exist
in the DOM regardless.

Feed `scroll` from a ScrollTrigger that writes a ref rather than React state — a
state update per frame re-renders the tree sixty times a second.

Practical guidance from upstream, which holds: keep the camera field of view
between 40° and 55° and the object three to five units away, since closer reads
as fisheye distortion; `transmission` combined with `iridescence` on
`MeshPhysicalMaterial` is the glass recipe these reference sites use; and fifty
to two hundred small sprites around the object give the dust that sells the
depth.

**Dependency weight.** Three.js core is roughly 150 KB gzipped. OGL is about
15 KB but you write the shaders yourself. Take Three.js unless the bundle is the
binding constraint — the mature material and loader ecosystem is worth the size,
and `threejs-3d/references/threejs-fundamentals.md` covers the R3F setup in full.

---

## Pattern 5 — Ghosted section title

A large section heading with a blurred, offset, low-opacity copy of itself
behind, giving the type physical depth. Cheap, static, and the highest
ratio of effect to cost in this file.

```css
.ghost-title {
  position: relative;
  font-size: clamp(3.5rem, 2rem + 6vw, 7.5rem);
  font-weight: 900;
  line-height: 1.05;
  color: var(--color-text);
}
.ghost-title::before {
  content: attr(data-ghost);
  position: absolute;
  inset-block-start: 4px;
  inset-inline-start: 4px;
  z-index: -1;
  color: var(--color-accent-warm);
  opacity: 0.3;
  filter: blur(8px);
}
```

The `clamp()` middle term carries a `rem` component. Upstream writes
`clamp(56px, 8vw, 120px)`, which is pure viewport width and therefore ignores the
reader's browser font-size setting entirely — an accessibility regression that
looks perfect in every screenshot. See
`../../design-system/references/typographic-finishing.md`.

Because the ghost is generated content, some screen readers announce it, so the
heading is read twice. Where that matters, render the ghost as a real
`aria-hidden` span instead of a pseudo-element.

---

## Pattern 6 — Abstract gradient card tops

A feature card whose upper portion is an abstract field — mesh gradient, ribbon,
particles — with the text below. Static, so it costs nothing from the motion
budget unless you animate it.

```css
.art-card {
  position: relative;
  background: var(--color-surface-raised);
  border-radius: 16px;
  overflow: hidden;
}

.art-top {
  aspect-ratio: 4 / 3;
  background:
    radial-gradient(circle at 30% 40%, var(--color-accent-cool) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, var(--color-accent-warm) 0%, transparent 45%),
    radial-gradient(circle at 50% 80%, var(--color-accent-alt) 0%, transparent 40%);
  filter: saturate(140%);
}

@media (prefers-reduced-motion: no-preference) {
  .art-top.animated {
    background-size: 200% 200%;
    animation: artShift 18s ease-in-out infinite alternate;
  }
  @keyframes artShift { to { background-position: 100% 100%; } }
}
```

The third stop is a token rather than upstream's literal `#c084fc`; a hard-coded
purple in a card top is exactly how a themed page ends up with one element that
never follows the theme.

The riveted-edge treatment — small rotated squares at the corners, imitating an
old photographic print or an identity card — is what stops the card reading as a
generic gradient box:

```css
.rivet {
  position: absolute;
  inline-size: 6px;
  block-size: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transform: rotate(45deg);
}
.rivet-tl { inset-block-start: 8px; inset-inline-start: 8px; }
.rivet-tr { inset-block-start: 8px; inset-inline-end: 8px; }
.rivet-bl { inset-block-end: 8px; inset-inline-start: 8px; }
.rivet-br { inset-block-end: 8px; inset-inline-end: 8px; }
```

Real elements rather than upstream's mix of pseudo-elements and classes, so the
set stays symmetrical and `::before`/`::after` remain free for anything else the
card needs.

---

## Degradation and performance

Everything above assumes a desktop with a discrete-ish GPU and a user who wants
motion. Each of those assumptions needs an explicit fallback.

| Condition | What changes |
|---|---|
| `prefers-reduced-motion: reduce` | Every pin-and-scrub becomes a plain fade to the finished state; WebGL is not mounted at all |
| Viewport under 640px | Constellation drops to three or four static cards with no blur; pinned narrative keeps the layout but plays its scenes once on entry instead of scrubbing; WebGL swaps to a still image |
| `navigator.hardwareConcurrency < 4` | No WebGL, no `filter: blur`, no cursor effects |
| Measured frame rate below 40 | Drop blur filters first — they are the most expensive thing here per pixel |

```ts
type PerfFlags = {
  isSmall: boolean;
  isLowCore: boolean;
  reduceMotion: boolean;
  noHover: boolean;
};

export function detectPerf(): PerfFlags {
  return {
    isSmall: matchMedia("(max-width: 640px)").matches,
    isLowCore: (navigator.hardwareConcurrency ?? 8) < 4,
    reduceMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    noHover: !matchMedia("(hover: hover)").matches,
  };
}

export function applyPerfFlags(flags: PerfFlags): void {
  const root = document.documentElement;
  for (const [key, on] of Object.entries(flags)) {
    root.dataset[key] = String(on);
  }
}
```

```css
[data-is-small="true"] .star-card { filter: none; }
[data-reduce-motion="true"] .scene { opacity: 1; transition: none; }
```

Upstream serialises the whole flag object into a single `data-perf` attribute and
matches it from CSS with substring selectors. That works until a flag name
becomes a prefix of another one, and it is unreadable in devtools. One attribute
per flag costs nothing and selects cleanly.

`reduceMotion` deserves the reminder from `motion-budget.md`: it means render the
destination, not render nothing. A pinned narrative under reduced motion should
show all four scenes stacked and readable, not one scene and three empty
containers.

---

## What was corrected on the way in

Every pattern survives; the code changed where it broke a rule enforced over this
corpus.

| Pattern | Upstream | Why it changed |
|---|---|---|
| WebGL scene | imperative Three.js, `THREE.Color(0xffffff)`, bare `requestAnimationFrame` loop, CDN module import | `3D-05` bans raw hex, `3D-02` bans raw rAF, `3D-06` requires delta-driven frames, `3D-01` requires a capped `dpr`; rewritten as R3F with OKLCH tokens |
| Card collapse | `scale: 0` | This skill never scales to zero — it reads as a glitch and composites inconsistently |
| Pinned narrative | left copy assigned from a JS array | Only scene one ships in the HTML; text mutates silently under assistive tech. All scenes now in markup, toggled with `hidden` |
| Pinned narrative | DOM written on every `onUpdate` | Guarded so it writes only when the scene index actually changes |
| Ghost title | `clamp(56px, 8vw, 120px)` | No `rem` term, so browser font-size settings are ignored |
| Gradient card top | literal `#c084fc` | `COL-04` — and a hard-coded hue is the element that never follows the theme |
| All shadows and tints | `rgba()` | OKLCH, via relative colour syntax |
| Decorative gradient loop | bare `infinite` | Wrapped in `prefers-reduced-motion: no-preference` |
| Viewport units | `100vh` / `400vh` | `100dvh` / `400dvh` — mobile browser chrome crops the static unit |
| Perf flags | one JSON `data-perf` attribute matched by substring | One attribute per flag; substring matching breaks when one name prefixes another |
| Scroll triggers | no `invalidateOnRefresh` | Pinned distances computed at load are wrong after a font swap or rotation |

The structural floor upstream sets — three of four moves, a signature moment
every couple of screens — is recorded above as its house style and explicitly
subordinated to `motion-budget.md`'s ceilings, which this pack enforces.

## Sources

Translated from the Chinese original in `xiaopu-ai/web-design`
(MIT, Copyright © 2026 KAOPU-XiaoPu) and adapted. The patterns are documented
there as observations of `doubao.com/about`, `apple.com/vision-pro`,
`stripe.com`, `tome.app`, `readme.com` and `igloo.inc` — they describe a
technique, not those companies' code, and the palettes and copy are yours to
supply. The R3F rewrite, the accessibility and SSR corrections, the budget
reconciliation and the cross-references are ours.
