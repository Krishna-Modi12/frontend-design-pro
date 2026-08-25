# Worked example — a complete DESIGN.md

`skills/design-system/references/design-md-template.md` gives the nine-section
shape. This is that shape filled in properly, for a real site: the design
specification `xiaopu-ai/web-design` wrote for its own landing page, translated
from the Chinese.

It is here because a template with no completed instance is hard to judge. This
one shows the level of detail the format expects — CSS that runs rather than
prose that describes, every component with all its states, eight named signature
moments with their code, and a difference audit against the site it took its
starting point from.

**Presented as its authors wrote it.** The colours are hex, the body face is
DM Sans, the dependencies are CDN tags, and there are `--*-rgb` companion
variables. This pack would decide several of those differently, and the point of
leaving them is that you can see a real document rather than a sanitised one.
Where our rules differ:

| Their choice | Ours | Why |
|---|---|---|
| Hex throughout | OKLCH | `COL-04`. Perceptually uniform, so a fixed lightness step looks even across hues |
| DM Sans as the primary face | A substitute | Rule 8 bans it as a display face — it is the reflex choice, not a bad face |
| `--bg-rgb`, `--accent-cool-rgb` | `oklch(from … / α)` | A second copy of every colour drifts from the first |
| CDN `<script>` for GSAP, Lenis, Three | npm packages | No tree-shaking, a third-party origin in the CSP, unpinned |
| Imperative Three.js, `0xffffff`, bare `tick()` | R3F, OKLCH, `useFrame` | `3D-05`, `3D-02`, `3D-06` |
| Global custom cursor | Don't | On this pack's anti-slop wall. Their mitigation — `mix-blend-mode` and a `(hover: none)` opt-out — is better than most |
| `clamp(48px, 6vw, 84px)` | A `rem` term in the middle | Pure `vw` ignores the reader's browser font-size setting |
| Blanket reduced-motion override | Render the destination state | Collapsing durations is a safety net, not a strategy |

Read it for the *structure and the specificity*, which are exemplary, and take
the token values from your own system.

Source: `xiaopu-ai/web-design` (MIT, Copyright © 2026 KAOPU-XiaoPu).

---

# DESIGN.md

> Specification first, code second. — a page designed for the methodology itself.

**Project**: the web-design SKILL open-source introduction page
**Position**: have AI build web pages, and produce a design specification
(DESIGN.md) that is readable, editable and transferable
**Reference starting point**: hueapp.io (dark editorial, restrained soft light) —
its skeleton is kept, while the accent colours and type pairing are changed to
establish a separate identity.

---

## 1. Visual Theme & Atmosphere

**Style**: Dark Editorial × Design System × Cinematic Scroll
**Keywords**: restrained, editorial, methodical, soft-lit, documentary, precise,
readable, credible, cinematic
**Tone**: dark but not cold, technical but not cyber — **Stripe-level information
density + Apple-level signature motion + Linear-level skeleton** — NOT neon,
punk, ornate or salesy
**Feel**: an open dark technical manual, where every turned page holds one visual
moment worth pausing on — but it is still a book, not a game.

**Interaction tier**: **L3 immersive · cinematic scroll-story** (narrative density
benchmarked against doubao.com/about, keeping the dark editorial skeleton)
**Dependencies**: GSAP 3 + ScrollTrigger + Lenis + **Three.js** (the WebGL
signature moment) + OGL (aurora background) + CSS `@property` + CSS 3D transforms

**Scroll-story coverage** (against `references/scroll-story-patterns.md`):

- **Pattern 1, card constellation hero** → twelve DESIGN.md sample cards floating in 3D
- **Pattern 2, card collapse transition** → hero cards converge into a single card entering the Why section
- **Pattern 3, left pin / right swap** → used twice, for Three Inputs and for Phase A→B→C
- **Pattern 4, WebGL signature** → a Three.js iridescent torus knot replaces the CSS cube in "What's Inside"
- **Pattern 5, title bloom** → section headings carry a `::before` ghost
- **Pattern 6, abstract art top** → feature cards open with a mesh gradient

**Motion library selection** (ported directly from `vue-bits`, MIT):

| Category | Choice | Where it lands |
|---|---|---|
| Background (atmosphere) | **Aurora** | Full-screen hero background — soft drifting light, the default for dark editorial |
| Text — hero H1 | **SplitText** + **ShinyText** | H1 staggers in per character; the key words take a metallic sweep |
| Text — section H2 | **ScrollFloat** | Each section's H2 floats in per character on entry |
| Text — body / label | **ScrollReveal** (paragraphs) + **ScrambleText** (eyebrow labels) + **TextType** (install block) | Three granularities covering body, label and code |
| Element-level | **Magnet** + **GlareHover** + **ClickSpark** | Magnetic CTA; light sweep on card hover; particle burst on click |
| Components | **CardSwap** (hero 3D card stack) + **SpotlightCard** (What's Inside) + **InfiniteScroll** (showcase strip) + **MagicBento** (Why comparison grid) | Four components carrying four narrative beats |

**Cumulative signature moments: 10+** (three in the hero, one at the phase pin,
one or two per section).

> This pack would cut that number. `motion-budget.md` caps L3 at six to eight
> signature moments and one WebGL surface; ten or more is over the ceiling.

---

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds — half a step darker than hueapp, to push "dark manual" over "product page" */
  --bg: #0a0b0e;
  --bg-2: #07080b;
  --surface-1: #111217;
  --surface-2: #171921;
  --surface-3: #1f222d;
  --surface-hover: #242836;

  /* Borders */
  --border: rgba(67, 70, 81, 0.5);
  --border-strong: rgba(67, 70, 81, 0.9);
  --border-accent: rgba(94, 234, 212, 0.3);

  /* Text — four levels */
  --text-1: #ebecef;
  --text-2: #c6c9d2;
  --text-3: #8d909c;
  --text-4: #60636f;

  /* Accent — cool teal + warm orange (specification × warmth) */
  --accent-cool: #5EEAD4;
  --accent-cool-hover: #8CF5E3;
  --accent-cool-soft: rgba(94, 234, 212, 0.12);

  --accent-warm: #FB923C;
  --accent-warm-hover: #FDB874;
  --accent-warm-soft: rgba(251, 146, 60, 0.12);

  /* Gradient — for decorating key words only, never general use */
  --gradient-key: linear-gradient(135deg, #5EEAD4 0%, #FB923C 100%);

  /* RGB variants */
  --bg-rgb: 10, 11, 14;
  --accent-cool-rgb: 94, 234, 212;
  --accent-warm-rgb: 251, 146, 60;

  /* Semantic */
  --success: #5EEAD4;
  --error: #F87171;
  --warning: #FB923C;
}
```

**Colour rules:**

- Every colour is referenced through a custom property; hard-coded hex is
  forbidden in components.
- Teal and orange appear **only in emphasis positions** — calls to action, key
  words, selected states, hover support. Large areas always take a surface.
- **The gradient is for one or two core words only** — never more than one place
  per screen.
- One accent family dominates any given section; where cool and warm both
  appear, whitespace separates them.
- Text colour follows the hierarchy: headings `--text-1`, body `--text-2`,
  supporting `--text-3`, labels `--text-4`.

---

## 3. Typography Rules

**Font stack:**

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

--font-ui:    'DM Sans', system-ui, -apple-system, 'Segoe UI', 'Noto Sans SC', sans-serif;
--font-serif: 'Instrument Serif', 'Noto Serif SC', Georgia, serif;
--font-mono:  'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
```

| Role | Font | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Hero H1 | DM Sans | `clamp(48px, 6vw, 84px)` | 700 | 1.05 | -0.02em |
| Hero serif accent | Instrument Serif (italic) | inherit | 400 | 1.05 | 0 |
| Section H2 | DM Sans | `clamp(28px, 3.2vw, 42px)` | 700 | 1.15 | -0.015em |
| H3 | DM Sans | 22px | 600 | 1.3 | -0.01em |
| Eyebrow label | DM Sans | 13px | 500 | 1.4 | 0.08em (uppercase) |
| Body large | DM Sans | 17px | 400 | 1.6 | 0 |
| Body | DM Sans | 15px | 400 | 1.65 | 0 |
| Small | DM Sans | 13px | 500 | 1.5 | 0 |
| Micro | DM Sans | 11px | 500 | 1.4 | 0.06em (uppercase) |
| Code / mono | JetBrains Mono | 14px | 500 | 1.5 | 0 |
| Serif quote | Instrument Serif | 28–36px | 400 (italic) | 1.3 | 0 |

**Typography rules:**

- Every heading is DM Sans. **Instrument Serif is only for italic decoration of
  key words**, never more than three instances on a page.
- Heading weight ≥ 600, hero 700.
- For Chinese content the stack falls back to Noto Sans SC, line height ≥ 1.7,
  tracking 0.02em.
- **Never use**: Arial, Times New Roman, Comic Sans, or any novelty face.

**Text decoration** (decided against `text-decoration-rules.md`):

- Hero H1 — key words filled with `--gradient-key`, **no shadow** (a dark ground
  and large type do not need one).
- Section H2 — flat `--text-1`, no gradient, no shadow.
- H3 and body — flat, no decoration of any kind.

---

## 4. Component Stylings

### Buttons

```css
/* Primary — teal fill, for the key call to action */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 9999px;
  background: var(--accent-cool);
  color: var(--bg);
  font: 500 14px/1 var(--font-ui);
  letter-spacing: -0.005em;
  border: 1px solid var(--accent-cool);
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(.2,0,0,1),
              background 0.12s cubic-bezier(.2,0,0,1),
              box-shadow 0.22s cubic-bezier(.2,0,0,1);
}
.btn-primary:hover {
  background: var(--accent-cool-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(var(--accent-cool-rgb), 0.25);
}
.btn-primary:active { transform: translateY(0); }
.btn-primary:focus-visible { outline: 2px solid var(--accent-cool); outline-offset: 3px; }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

/* Ghost — outlined, secondary call to action */
.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 19px;
  border-radius: 9999px;
  background: transparent;
  color: var(--text-1);
  border: 1px solid var(--border-strong);
  font: 500 14px/1 var(--font-ui);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, transform 0.22s;
}
.btn-ghost:hover { background: var(--surface-2); border-color: var(--text-3); transform: translateY(-1px); }
.btn-ghost:active { transform: translateY(0); }
.btn-ghost:focus-visible { outline: 2px solid var(--accent-cool); outline-offset: 3px; }

/* Pill — small label button, used by the three-step summary */
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-2);
  font: 500 12px/1 var(--font-mono);
}
```

### Cards

```css
.card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  transition: background 0.22s cubic-bezier(.2,0,0,1),
              border-color 0.22s cubic-bezier(.2,0,0,1),
              transform 0.22s cubic-bezier(.2,0,0,1);
}
.card:hover {
  background: var(--surface-2);
  border-color: var(--border-strong);
  transform: translateY(-2px);
}
.card:focus-within { border-color: var(--accent-cool); }

.card .card-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: var(--accent-cool-soft);
  color: var(--accent-cool);
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.card .card-title { font: 600 18px/1.3 var(--font-ui); color: var(--text-1); margin: 0 0 6px; }
.card .card-body  { font: 400 14px/1.6 var(--font-ui); color: var(--text-3); margin: 0; }
```

### Navigation

```css
.nav {
  position: sticky; top: 0; z-index: 50;
  padding: 14px 0;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background 0.22s, border-color 0.22s, backdrop-filter 0.22s;
}
.nav.is-scrolled {
  background: rgba(var(--bg-rgb), 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom-color: var(--border);
}
.nav-link {
  color: var(--text-3);
  font: 500 14px/1 var(--font-ui);
  transition: color 0.12s;
}
.nav-link:hover { color: var(--text-1); }
.nav-link.is-active { color: var(--accent-cool); }
```

### Links

```css
.link {
  color: var(--accent-cool);
  text-decoration: none;
  background-image: linear-gradient(var(--accent-cool), var(--accent-cool));
  background-size: 0% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.28s cubic-bezier(.2,0,0,1), color 0.12s;
}
.link:hover { background-size: 100% 1px; color: var(--accent-cool-hover); }
.link:focus-visible { outline: 2px solid var(--accent-cool); outline-offset: 3px; border-radius: 2px; }
```

### Tags and badges

```css
.tag {
  display: inline-flex; align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--accent-cool-soft);
  color: var(--accent-cool);
  font: 500 11px/1.4 var(--font-mono);
  letter-spacing: 0.04em;
}
.tag.tag-warm    { background: var(--accent-warm-soft); color: var(--accent-warm); }
.tag.tag-neutral { background: var(--surface-2); color: var(--text-3); border: 1px solid var(--border); }
```

### Code block / install command

```css
.codeblock {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  font: 500 14px/1 var(--font-mono);
  color: var(--text-2);
}
.codeblock .prompt { color: var(--text-4); user-select: none; }
.codeblock .copy-btn {
  margin-left: auto;
  padding: 6px 10px;
  font: 500 11px/1 var(--font-mono);
  color: var(--text-3);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s;
}
.codeblock .copy-btn:hover { color: var(--accent-cool); border-color: var(--accent-cool); }
.codeblock .copy-btn.is-copied { color: var(--accent-cool); }
```

### Step indicator

```css
.steps { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
.step {
  display: inline-flex; align-items: center; gap: 8px;
  font: 400 13px/1 var(--font-mono);
  color: var(--text-3);
}
.step .step-num { color: var(--text-4); letter-spacing: 0.04em; }
.step .step-sep { color: var(--text-4); margin: 0 4px; }
```

---

## 5. Layout Principles

**Container**

- `max-width: 1120px`
- Side padding `clamp(20px, 4vw, 40px)`
- Narrow variant, for body copy and the install block: `max-width: 720px`

**Spacing scale** (the same 4→128 progression as the reference site)

```
--sp-1: 4px    --sp-6: 32px
--sp-2: 8px    --sp-7: 48px
--sp-3: 12px   --sp-8: 64px
--sp-4: 16px   --sp-9: 96px
--sp-5: 24px   --sp-10: 128px
```

- Section vertical padding: 96–128px desktop, 64–80px mobile
- Card padding: 24px
- Component gap: 16–24px
- Hero internal rhythm: a 16 / 24 / 32 progression

**Grid**

```css
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 900px) { .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .grid-3, .grid-4 { grid-template-columns: 1fr; } }
```

---

## 6. Depth & Elevation

In a dark context, use surface levels rather than shadows.

| Level | Treatment | Used for |
|---|---|---|
| Flat | no border, no shadow | background decoration, large colour fields |
| Bordered | `1px solid var(--border)` | default cards, inputs |
| Bordered hover | `1px solid var(--border-strong)` + `translateY(-2px)` | card hover |
| Glow (CTA hover only) | `box-shadow: 0 8px 24px rgba(var(--accent-cool-rgb), 0.25)` | primary button hover |
| Blurred overlay | `backdrop-filter: blur(14px)` over a translucent background | sticky nav, scrolled state |

Stacked shadows and large blurs are not used.

---

## 7. Animation & Interaction

**Motion philosophy**: an editorial skeleton with cinematic signature moments.
Most of the page stays quiet; **two or three signature moments carry the
impact**. Motion serves the narrative — the hero establishes atmosphere, Phase
A→B→C explains the method, the showcase presents output.
**Tier**: L3 immersive.

### Dependencies

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
```

### Timing tokens

```css
--ease:         cubic-bezier(.2, 0, 0, 1);
--ease-soft:    cubic-bezier(.2, .8, .2, 1);
--ease-cinema:  cubic-bezier(.16, 1, .3, 1);
--dur-fast:      0.12s;
--dur-mid:       0.22s;
--dur-slow:      0.36s;
--dur-reveal:    0.8s;
--dur-signature: 1.4s;
```

### Base setup — Lenis + GSAP

```js
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

gsap.to('.scroll-progress', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
});
```

### Entrance

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); filter: blur(6px); }
  to   { opacity: 1; transform: translateY(0); filter: blur(0); }
}
.reveal { opacity: 0; }
.reveal.in-view { animation: fadeUp 0.8s var(--ease-cinema) forwards; }

.reveal.in-view > * { animation: fadeUp 0.8s var(--ease-cinema) backwards; }
.reveal.in-view > *:nth-child(1) { animation-delay: 0.00s; }
.reveal.in-view > *:nth-child(2) { animation-delay: 0.08s; }
.reveal.in-view > *:nth-child(3) { animation-delay: 0.16s; }
.reveal.in-view > *:nth-child(4) { animation-delay: 0.24s; }
.reveal.in-view > *:nth-child(5) { animation-delay: 0.32s; }
```

### Hover and focus

- Every button, card and link has hover and focus-visible.
- Card hover: surface lightens, border deepens, `translateY(-2px)`, icon grows slightly.
- Primary button hover: 1px rise, teal glow, magnetic follow within ±8px.
- Link hover: underline slides from 0% to 100%.

### Magnetic button

```js
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  const strength = 0.35;
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * strength;
    const y = (e.clientY - r.top - r.height / 2) * strength;
    gsap.to(btn, { x, y, duration: 0.4, ease: 'power3.out' });
  });
  btn.addEventListener('pointerleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});
```

### Custom cursor (dot + ring)

```css
* { cursor: none; }
@media (hover: none) { * { cursor: auto; } .cursor-dot, .cursor-ring { display: none; } }
.cursor-dot, .cursor-ring {
  position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999;
  border-radius: 50%; transform: translate(-50%, -50%);
  mix-blend-mode: difference;
}
.cursor-dot  { width: 6px;  height: 6px;  background: #fff; transition: transform 0.08s linear; }
.cursor-ring { width: 36px; height: 36px; border: 1px solid #fff; transition: transform 0.2s var(--ease-cinema), width 0.22s, height 0.22s; }
.cursor-ring.is-hover { width: 60px; height: 60px; border-color: var(--accent-cool); }
```

```js
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let rx = 0, ry = 0, dx = 0, dy = 0;
window.addEventListener('pointermove', (e) => {
  dx = e.clientX; dy = e.clientY;
  dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
});
(function followRing() {
  rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
  ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
  requestAnimationFrame(followRing);
})();
document.querySelectorAll('a, button, [data-magnetic], .card, .codeblock .copy-btn').forEach(el => {
  el.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
  el.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
});
```

### Hero background — animated mesh gradient, CSS only

```css
@property --grad-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes gradRotate { to { --grad-angle: 360deg; } }
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(60% 50% at 30% 20%, rgba(var(--accent-cool-rgb), 0.18), transparent 70%),
    radial-gradient(50% 40% at 75% 35%, rgba(var(--accent-warm-rgb), 0.14), transparent 65%),
    conic-gradient(from var(--grad-angle) at 50% 50%,
      rgba(var(--accent-cool-rgb), 0.08),
      rgba(var(--accent-warm-rgb), 0.08),
      rgba(var(--accent-cool-rgb), 0.08));
  filter: blur(40px) saturate(120%);
  animation: gradRotate 30s linear infinite;
  opacity: 0.85;
}
.hero-bg::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 100%, var(--bg) 0%, transparent 70%);
}
```

### Signature 1 — hero card constellation

Twelve DESIGN.md sample cards float in 3D space, each a slice of a real
specification: a palette, a type table, component CSS, a Do/Don't list. They
surround the central claim, parallax together on pointer movement, and each
breathes on its own period.

```css
.constellation {
  position: absolute; inset: 0;
  perspective: 1500px; transform-style: preserve-3d;
  pointer-events: none;               /* hero text stays clickable */
}
.star-card {
  position: absolute; top: 50%; left: 50%;
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  will-change: transform, filter;
  pointer-events: auto;
  transform:
    translate3d(calc(-50% + var(--x) * 1px), calc(-50% + var(--y) * 1px), var(--z, 0px))
    rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) rotateZ(var(--rz, 0deg));
  filter: blur(var(--blur, 0px));
  opacity: calc(1 - var(--blur, 0) * 0.06);
}
.star-card.near { --blur: 0; --z:    0; }
.star-card.mid  { --blur: 3; --z: -250; }
.star-card.far  { --blur: 7; --z: -500; opacity: 0.55; }
```

The twelve cards each carry a different kind of specification excerpt: palette
swatches with variable names; a type table; a button CSS fragment; a shadow
progression; a spacing scale; radius samples; a Do/Don't list; an easing curve
drawn in SVG; a grid preview; an icon set; a code block; responsive breakpoints.

```js
const positions = [
  { x: -380, y: -180, rx:  8, ry: -12, rz: -4, cls: 'near' },
  { x:  360, y: -200, rx: -6, ry:   8, rz:  6, cls: 'near' },
  { x: -460, y:   40, rx:  4, ry: -10, rz: -8, cls: 'mid'  },
  { x:  480, y:   60, rx: -4, ry:  10, rz:  8, cls: 'mid'  },
  { x: -280, y:  220, rx:  6, ry:  -6, rz: -2, cls: 'near' },
  { x:  320, y:  240, rx: -8, ry:   6, rz:  4, cls: 'near' },
  { x: -600, y: -100, rx:  2, ry: -14, rz: -6, cls: 'far'  },
  { x:  620, y: -120, rx: -2, ry:  14, rz:  6, cls: 'far'  },
  { x: -150, y: -260, rx: 10, ry:   4, rz: -2, cls: 'mid'  },
  { x:  180, y: -240, rx:-10, ry:  -4, rz:  2, cls: 'mid'  },
  { x:    0, y:  340, rx: -6, ry:   0, rz:  0, cls: 'far'  },
  { x:    0, y: -360, rx:  6, ry:   0, rz:  0, cls: 'far'  },
];
document.querySelectorAll('.star-card').forEach((el, i) => {
  const p = positions[i];
  el.classList.add(p.cls);
  ['x','y','rx','ry','rz'].forEach(k => el.style.setProperty(`--${k}`, p[k]));
});

gsap.utils.toArray('.star-card').forEach((c) => {
  gsap.to(c, {
    '--y':  `+=${gsap.utils.random(-18, 18)}`,
    '--rz': `+=${gsap.utils.random(-3, 3)}`,
    duration: gsap.utils.random(5, 8),
    ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
});

const stage = document.querySelector('.hero');
stage.addEventListener('pointermove', (e) => {
  const dx = (e.clientX - innerWidth/2) / (innerWidth/2);
  const dy = (e.clientY - innerHeight/2) / (innerHeight/2);
  gsap.utils.toArray('.star-card').forEach((c) => {
    const depth = Math.abs(parseFloat(c.style.getPropertyValue('--z') || 0)) / 500;
    gsap.to(c, { x: dx * 30 * (1-depth), y: dy * 30 * (1-depth), duration: 0.8, ease: 'power3.out' });
  });
});
```

### Signature 2 — card collapse transition

Between the hero and the Why section, the scattered cards fly to the centre and
merge into a single large DESIGN.md card.

```js
gsap.timeline({
  scrollTrigger: { trigger: '.hero', start: 'bottom 70%', end: 'bottom top', scrub: 1 },
})
.to('.star-card', {
  '--x': 0, '--y': 0, '--z': 0, '--rx': 0, '--ry': 0, '--rz': 0, '--blur': 0,
  scale: 0.2, opacity: 0,
  stagger: { amount: 0.8, from: 'random' },
  ease: 'power2.in',
})
.from('.why-hero-card', { scale: 0.6, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.5');
```

### Signature 3 — Phase A→B→C pinned scrollytelling

The central device. The section pins for roughly 1500px of scroll while
"inputs → DESIGN.md → code" transforms with the progress.

```js
const phaseTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.phase-scene',
    start: 'top top',
    end: '+=1500',
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  },
});

phaseTl
  // Phase A: three input icons drift in, then merge
  .from('.phase-input-prd',  { y: 40, opacity: 0, duration: 1 })
  .from('.phase-input-url',  { y: 40, opacity: 0, duration: 1 }, '-=0.7')
  .from('.phase-input-shot', { y: 40, opacity: 0, duration: 1 }, '-=0.7')
  .to(['.phase-input-prd', '.phase-input-url', '.phase-input-shot'], {
    x: (i) => [-40, 0, 40][i] * -1, y: 0, scale: 0.8, opacity: 0.3, duration: 1.2,
  })
  // Phase B: the DESIGN.md card floats in, token rows fill line by line
  .from('.phase-design-card', { x: 120, opacity: 0, duration: 1.2, ease: 'power3.out' }, '<')
  .from('.phase-token-row', { width: 0, opacity: 0, stagger: 0.12, duration: 0.6 }, '-=0.6')
  // Phase C: code lines flow out of the document
  .to('.phase-design-card', { x: -80, scale: 0.9, opacity: 0.5, duration: 1 }, '+=0.4')
  .from('.phase-code-line', { x: -40, opacity: 0, stagger: 0.05, duration: 0.5 }, '-=0.8')
  // Finally: the finished page thumbnail
  .from('.phase-final', { y: 40, opacity: 0, duration: 1 }, '+=0.3');
```

A progress bar runs down the left of the section, its three colour segments
(teal → teal-orange → orange) marking the phases.

### Signature 4 — WebGL iridescent knot

The visual lead of the "What's Inside" section. Three.js `TorusKnotGeometry`
with `MeshPhysicalMaterial` (transmission 0.92, iridescence 1, clearcoat 1),
rotation driven by scroll, teal and orange point lights, 150 particle sprites as
dust.

```js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('.knot-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 5;

const resize = () => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
};

const mat = new THREE.MeshPhysicalMaterial({
  transmission: 0.92, thickness: 1.5, roughness: 0.15,
  iridescence: 1, iridescenceIOR: 1.3, clearcoat: 1,
  color: 0xffffff,
});
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 180, 32), mat);
scene.add(knot);

scene.add(new THREE.HemisphereLight(0xffffff, 0x101020, 0.6));
const l1 = new THREE.PointLight(0x5EEAD4, 4, 20); l1.position.set(3, 3, 3); scene.add(l1);
const l2 = new THREE.PointLight(0xFB923C, 4, 20); l2.position.set(-3, -2, 3); scene.add(l2);

const pgeo = new THREE.BufferGeometry();
const positions = new Float32Array(150 * 3);
for (let i = 0; i < 150; i++) {
  positions[i*3]   = (Math.random()-0.5) * 8;
  positions[i*3+1] = (Math.random()-0.5) * 6;
  positions[i*3+2] = (Math.random()-0.5) * 4;
}
pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  pgeo,
  new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.03, transparent: true, opacity: 0.7 }),
);
scene.add(particles);

gsap.to(knot.rotation, {
  y: Math.PI * 2, x: Math.PI,
  scrollTrigger: { trigger: '.whats-inside', start: 'top 80%', end: 'bottom 20%', scrub: 1 },
});

function tick() {
  knot.rotation.z += 0.002;
  particles.rotation.y += 0.0008;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
resize(); tick();
new ResizeObserver(resize).observe(canvas);
```

The "What's Inside" cards still exist below the WebGL scene, presenting the six
asset classes, with Pattern 6 mesh-gradient tops.

### Signature 5 — Three Inputs, left pin / right swap

The section pins for 300vh. The left heading holds ("any starting point will
do") while the right container cycles three scenes: a PRD document, a reference
URL screenshot, a user's sketch. Each is an enlarged realistic card. Transitions
crossfade with a slight scale.

```js
const scenes = gsap.utils.toArray('.input-scene');
const labels = ['PRD document', 'Reference URL', 'Screenshot / sketch'];

ScrollTrigger.create({
  trigger: '.three-inputs',
  start: 'top top', end: 'bottom bottom',
  pin: '.three-inputs-inner',
  scrub: 0.5,
  onUpdate: (self) => {
    const idx = Math.min(Math.floor(self.progress * scenes.length), scenes.length - 1);
    scenes.forEach((s, i) => {
      gsap.to(s, { opacity: i === idx ? 1 : 0, scale: i === idx ? 1 : 0.94, duration: 0.4 });
    });
    document.querySelector('.input-label').textContent = labels[idx];
  },
});
```

### Signature 6 — section title bloom

```css
.section-h2 {
  position: relative; display: inline-block;
  font: 700 clamp(36px, 5vw, 64px)/1.1 var(--font-ui);
  color: var(--text-1);
}
.section-h2::before {
  content: attr(data-ghost);
  position: absolute; left: 0; top: 0;
  background: var(--gradient-key);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: blur(24px); opacity: 0.45;
  z-index: -1;
  transform: translate(6px, 6px);
}
```

### Signature 7 — abstract art tops on feature cards

```css
.art-card { background: var(--surface-1); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
.art-top {
  aspect-ratio: 4 / 3;
  background:
    radial-gradient(circle at 30% 40%, var(--accent-cool) 0%, transparent 48%),
    radial-gradient(circle at 72% 60%, var(--accent-warm) 0%, transparent 44%),
    radial-gradient(circle at 50% 85%, #c084fc 0%, transparent 40%);
  background-size: 200% 200%;
  filter: saturate(130%);
  animation: artShift 20s ease-in-out infinite alternate;
}
@keyframes artShift { to { background-position: 100% 100%; } }
.art-bottom { padding: 20px 22px 22px; }
```

### Signature 8 — showcase 3D perspective marquee

Two rows of work thumbnails flowing in opposite directions, the whole tilted in
3D (−8° on x) so the pieces appear to travel behind the plane of the page.

```css
.marquee {
  perspective: 1200px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
}
.marquee-track {
  display: flex; gap: 24px;
  transform: rotateX(-8deg) rotateZ(-2deg);
  animation: marqueeSlide 40s linear infinite;
}
.marquee.reverse .marquee-track { animation-direction: reverse; animation-duration: 50s; }
@keyframes marqueeSlide { to { transform: rotateX(-8deg) rotateZ(-2deg) translateX(-50%); } }
```

### Token assembly animation

Entering the viewport, twelve scattered colour chips fly into a grid and form a
`:root { … }` code block.

```js
ScrollTrigger.create({
  trigger: '.token-assemble',
  start: 'top 70%',
  onEnter: () => {
    gsap.from('.token-chip', {
      x: () => gsap.utils.random(-200, 200),
      y: () => gsap.utils.random(-100, 100),
      rotate: () => gsap.utils.random(-30, 30),
      opacity: 0, stagger: 0.05, duration: 1, ease: 'power3.out',
    });
    gsap.from('.token-code-line', { opacity: 0, x: -20, stagger: 0.06, duration: 0.5, delay: 0.8 });
  },
});
```

### Text scramble on eyebrow labels

Every eyebrow label runs an 0.8s scramble-to-settle when it enters the viewport.

```js
function scrambleText(el, duration = 800) {
  const final = el.dataset.scramble || el.textContent;
  el.dataset.scramble = final;
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    el.textContent = final.split('').map((c, i) => {
      if (p * final.length > i) return c;
      if (c === ' ') return ' ';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = final;
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll('[data-scramble]').forEach(el => {
  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { scrambleText(el); obs.unobserve(el); }
  }, { threshold: 0.8 }).observe(el);
});
```

### Hero key-word gradient drift

The gradient on the two key words is not static; it drifts across the letterforms
on an 18s cycle.

```css
.key-gradient {
  background: linear-gradient(135deg, var(--accent-cool), var(--accent-warm), var(--accent-cool));
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientSlide 18s linear infinite;
}
@keyframes gradientSlide { to { background-position: -300% 0; } }
```

### Scroll progress bar

```css
.scroll-progress {
  position: fixed; top: 0; left: 0; right: 0; height: 2px;
  background: var(--gradient-key);
  transform-origin: 0 50%; transform: scaleX(0);
  z-index: 100;
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .reveal { opacity: 1; animation: none; }
  .hero-bg, .cube, .marquee-track, .key-gradient { animation: none !important; }
  .stack-card { transform: none !important; }
  * { cursor: auto !important; }
  .cursor-dot, .cursor-ring { display: none !important; }
}
```

```js
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis.destroy?.();
  ScrollTrigger.getAll().forEach(t => t.kill());
}
```

---

## 8. Do's and Don'ts

### Do

- Keep the dark ground and four text levels, so information rhythm comes entirely
  from weight, spacing and hierarchy.
- Let teal and orange appear as a pair but always separated by whitespace; never
  butt them directly together.
- At most one gradient-decorated key word per screen — treat it as a pointer, not
  as ornament.
- Give every section the same three-part opening: eyebrow label (uppercase, open
  tracking), H2, and a sub.
- Use Instrument Serif italic on two or three key words to establish the
  documentary feel.
- Set code and commands in JetBrains Mono; never substitute body text.
- On card hover do only three things: lighten the surface, deepen the border,
  rise 2px. Do not change colour.
- Anything at L2 or above ships a `prefers-reduced-motion` fallback.

### Don't

- No neon, no saturated colour fields, no glowing borders. This is dark
  **editorial**, not cyber.
- No more than four colours. Teal, orange and four greys are the whole system.
- No gradient on body text, buttons or borders — only the one or two key words
  and the progress bar.
- No heavy card shadows. `box-shadow` is for the primary CTA hover and the 3D
  card stack only.
- No emoji; it does not suit a methodology product.
- **Pinning and the custom cursor belong only in declared signature areas.** Do
  not scroll-jack the whole page. This page pins once, at Phase A→B→C, and the
  custom cursor is global but stays quiet through `mix-blend-mode`.
- No serif for body copy; it decorates key words only.
- Never let a Latin face carry Chinese alone — the fallback must include Noto Sans SC.
- No hard-coded hex. Every colour goes through a custom property.
- No decoration inside the install command box; it should look like a real
  command, not a graphic.
- No sustained high-intensity 3D motion. Keep cycles long and amplitudes low, or
  the page reads as agitated.
- On low-capability devices — under 640px, or `navigator.hardwareConcurrency < 4`
  — drop the 3D and the complex pins to static cards.

---

## 9. Responsive Behavior

| Name | Width | Key changes |
|---|---|---|
| Desktop | ≥ 1024px | 3–4 column grids, two-line hero, 96–128px section padding |
| Tablet | 640–1023px | 2 column grids, hero still two lines at one size down, condensed nav |
| Mobile | < 640px | Single column, hero at the clamp floor, 64–80px section padding, steps stacked |

**Touch targets**: minimum 44×44px

**Collapsing strategy**

- Nav: full on desktop → secondary links hidden on tablet → hamburger on mobile,
  or just the logo and a GitHub icon.
- Grid: 3 → 2 → 1 columns.
- Hero three-step summary: horizontal → vertical.

```css
@media (max-width: 1023px) {
  :root { --sp-section: 80px; }
  .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
  .nav .nav-link-secondary { display: none; }
}

@media (max-width: 639px) {
  :root { --sp-section: 64px; }
  .container { padding-left: 20px; padding-right: 20px; }
  .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .steps { flex-direction: column; gap: 12px; }
  .hero-title { font-size: clamp(36px, 9vw, 48px); }
}
```

---

## Appendix — difference audit against the reference site

This is the section most design documents omit, and the reason to read this
example even if none of its choices suit you. Having taken a starting point from
another site, it states line by line what was changed and why — which is the
difference between reference and imitation.

| Dimension | hueapp.io | This page | Reasoning |
|---|---|---|---|
| Ground | `#0d0e12` | `#0a0b0e`, darker | Pushes "dark manual" over "product page" |
| Accents | cool blue `#63b3ed` + warm pink `#ec6cb9` | teal `#5EEAD4` + orange `#FB923C` | Avoids resemblance and echoes the "specification × warmth" idea |
| Type | DM Sans alone | DM Sans + Instrument Serif for decoration | Establishes the documentary identity |
| Hero size | 56–72px | 48–84px | Wider range, more impact |
| Section structure | Hero → Proofs → System → Install | Hero → Why DESIGN.md → Three inputs → A→B→C → Assets → Demo → Install | A different story: methodology rather than brand-to-UI |
| Motion tier | L1–L2 | L2 | Broadly the same |
| Distinctive move | horizontal showcase | comparison (AI straight to code vs specification first) | A methodology argument needs contrast; showing work is secondary |

> Note the internal inconsistency, left as written: section 1 declares L3 and
> claims ten or more signature moments, while this table records the tier as L2.
> A specification long enough to be useful is long enough to drift, which is an
> argument for generating the figures rather than typing them — the same reason
> this pack gates its own numbers.
