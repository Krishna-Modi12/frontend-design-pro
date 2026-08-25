# Style Seeds

Ten starting token sets, each keyed to a mood rather than to a sector. Load one
when a brief arrives as an adjective — "warm but professional", "dark but
restrained", "something with a bit of ink to it" — and you need a concrete
palette, type pairing and motion tier to put in front of the user within a
minute.

These are **seeds, not themes.** Confirm the direction with the user, then derive
the full ramp with `../../color-themes/references/oklch-theme-engine.md` and
measure every pair against the contrast floors. `color-palettes.md` indexes the
same problem by industry; this file is the other axis.

## Contents

- [How to use a seed](#how-to-use-a-seed)
- [1 — Cream Editorial](#1--cream-editorial)
- [2 — Dark Tech](#2--dark-tech)
- [3 — Minimal Pure](#3--minimal-pure)
- [4 — Warm Professional](#4--warm-professional)
- [5 — Playful Creative](#5--playful-creative)
- [6 — Ink and Paper](#6--ink-and-paper)
- [7 — Cyberpunk](#7--cyberpunk)
- [8 — Organic Natural](#8--organic-natural)
- [9 — Swiss Grid](#9--swiss-grid)
- [10 — Glassmorphism](#10--glassmorphism)
- [Mixing seeds](#mixing-seeds)
- [What was changed on the way in](#what-was-changed-on-the-way-in)
- [Sources](#sources)

---

## How to use a seed

Each entry gives keywords, the character in one line, a palette in OKLCH, a type
pairing, radius and shadow character, and the motion tier from
`../../animations/references/motion-budget.md` that suits it.

Two standing caveats apply to every one of them.

**Pure white and pure black are not surfaces here.** Several upstream seeds
specify `#FFFFFF` or `#000000` for a surface. Rule 3 of this skill bans both,
because an untinted surface reads as unfinished next to any tinted neighbour.
Where a seed's own background is already tinted, its surface should carry the
same hue at higher lightness — the conversions below keep the original value in a
comment so you can see what moved and why.

**Every accent still needs measuring.** A seed's accent against a seed's
background is a starting guess, not a verified pair. Nothing here has been
contrast-checked against your actual type sizes.

---

## 1 — Cream Editorial

**Keywords** — warm, editorial, magazine, restrained, papery
**Character** — a well-set magazine opening on screen.

```css
--color-background:     oklch(92.9% 0.013 82.4);  /* was #ECE7DE */
--color-surface:        oklch(97.5% 0.008 82.4);  /* upstream #FFFFFF, tinted to match */
--color-border:         oklch(85.9% 0.013 82.4);  /* was #D5D0C7 */
--color-border-strong:  oklch(28.5% 0 0);         /* was #2A2A2A */
--color-text:           oklch(21.8% 0 0);         /* was #1A1A1A */
--color-text-muted:     oklch(51.1% 0.011 62.4);  /* was #6B6560 */
--color-accent:         oklch(66.6% 0.175 43.2);  /* was #E8682A */
```

**Type** — Playfair Display 900 for display, **Satoshi** 400–700 for body
(upstream pairs DM Sans, which rule 8 bans as a display or primary face; Satoshi
is the closest geometric-humanist match and is already endorsed in
`font-pairings.md`). JetBrains Mono for code.
**Radius** 16px · **Shadow** on hover only · **Tier** L1.

---

## 2 — Dark Tech

**Keywords** — deep, neon, future, technical, cyber
**Character** — a control console in a dark room, information glowing.

```css
--color-background:     oklch(15.2% 0.009 285.3);          /* was #0B0B0F */
--color-surface:        oklch(100% 0 0 / 0.03);            /* translucent lift */
--color-border:         oklch(100% 0 0 / 0.08);
--color-text:           oklch(95.5% 0 0);                  /* was #F0F0F0 */
--color-text-muted:     oklch(63.7% 0 0);                  /* was #8B8B8B */
--color-brand:          oklch(80.4% 0.146 219.5);          /* was #00D4FF */
--color-accent:         oklch(60.6% 0.219 292.7);          /* was #8B5CF6 */
```

**Type** — **Clash Display** 700 for headings, **Geist** 400–600 for body
(upstream specifies Space Grotesk and Inter, both on rule 8's ban list; Clash
Display keeps the wide technical character and Geist keeps the neutral screen
face). Fira Code for code.
**Radius** 12px · **Shadow** glow rather than drop · **Tier** L2–L3.
**Signature** glassmorphism panels, a drifting gradient field.

Note the brand cyan and the violet accent sit close to the purple→pink→blue ramp
this pack's anti-slop wall bans. Two stops from different families are fine; a
three-stop gradient across them is the exact pattern the wall exists for.

---

## 3 — Minimal Pure

**Keywords** — clean, white space, precise, quiet, expensive
**Character** — one line of type on a gallery wall.

```css
--color-background:     oklch(98.5% 0 0);        /* was #FAFAFA */
--color-surface:        oklch(99.4% 0.002 250);  /* upstream #FFFFFF, faintly cooled */
--color-border:         oklch(93.1% 0 0);        /* was #E8E8E8 */
--color-text:           oklch(21.8% 0 0);        /* was #1A1A1A */
--color-text-muted:     oklch(51.0% 0 0);        /* was #666666 */
--color-accent:         oklch(56.3% 0.241 260.8);/* was #0066FF — links only */
```

**Type** — Instrument Serif 400 for display, **General Sans** 400–500 for body
(upstream pairs DM Sans). No third face.
**Radius** 8px · **Shadow** barely there · **Tier** L1.
**Signature** hierarchy comes from size contrast alone; decoration is the thing
this seed refuses.

---

## 4 — Warm Professional

**Keywords** — professional, trustworthy, rounded, friendly, mature
**Character** — a company you would not worry about wiring money to.

```css
--color-background:     oklch(99.2% 0.002 248);  /* upstream #FFFFFF, tinted */
--color-surface:        oklch(98.4% 0.003 247.9);/* was #F8FAFC */
--color-border:         oklch(92.9% 0.013 255.5);/* was #E2E8F0 */
--color-text:           oklch(27.9% 0.037 260.0);/* was #1E293B */
--color-text-muted:     oklch(44.6% 0.037 257.3);/* was #475569 */
--color-brand:          oklch(54.6% 0.215 262.9);/* was #2563EB */
--color-accent:         oklch(76.9% 0.165 70.1); /* was #F59E0B */
```

**Type** — Plus Jakarta Sans throughout, 700–800 for headings and 400–500 for
body. A single-family system is part of the character here, not a shortcut.
**Radius** 12px · **Shadow** soft and layered · **Tier** L1–L2.

---

## 5 — Playful Creative

**Keywords** — bold, fun, young, bouncy, handwritten
**Character** — a designer friend's birthday invitation.

```css
--color-background:     oklch(98.2% 0.013 71.3); /* was #FFF8F0 */
--color-surface:        oklch(99.5% 0.006 71.3); /* upstream #FFFFFF, tinted */
--color-border:         oklch(92.7% 0.044 54.9); /* was #FFE0CC */
--color-text:           oklch(29.7% 0 0);        /* was #2D2D2D */
--color-text-muted:     oklch(51.0% 0 0);        /* was #666666 */
--color-brand:          oklch(65.6% 0.235 13.3); /* was #FF3366 */
--color-accent:         oklch(88.7% 0.182 95.3); /* was #FFD700 */
--color-accent-alt:     oklch(74.6% 0.168 160.4);/* was #00CC88 */
```

**Type** — Sora 700–800 for headings, Nunito 400–600 for body, Caveat for
handwritten annotation only.
**Radius** 16–24px, deliberately large · **Shadow** coloured, not grey ·
**Tier** L2–L3. **Signature** blob shapes, handwritten margin notes, springy easing.

The yellow accent at 88.7% lightness will not carry text on the light background —
it is a fill and a highlight, never a foreground colour.

---

## 6 — Ink and Paper

**Keywords** — literary, restrained, scholarly, eastern, spacious
**Character** — a letter written on good paper.

```css
--color-background:     oklch(98.0% 0.005 78.3); /* was #FAF8F5 */
--color-surface:        oklch(99.4% 0.003 78.3); /* upstream #FFFFFF, tinted */
--color-border:         oklch(91.1% 0.014 67.7); /* was #E8E0D8 */
--color-text:           oklch(29.3% 0 0);        /* was #2C2C2C */
--color-text-muted:     oklch(47.5% 0 0);        /* was #5C5C5C */
--color-brand:          oklch(59.7% 0.141 37.7); /* was #C45C3C — ochre */
--color-accent:         oklch(45.7% 0.060 219.7);/* was #2C5F6E */
```

**Type** — Noto Serif SC 700 for headings, Noto Sans SC 400–500 for body, LXGW
WenKai for decorative passages.
**Radius** 4px, almost none · **Shadow** minimal · **Tier** L1.
**Signature** line-height 1.8 or more, letter-spacing near 0.02em, an 800px
measure, first-line indent of two characters.

This seed is CJK-first, and CJK typography has its own rules that override the
generic advice elsewhere in this skill — fallback-chain order, the absence of
real italics, kinsoku line-breaking and a font budget measured in megabytes. Read
`cjk-typography.md` before shipping it.

---

## 7 — Cyberpunk

**Keywords** — glitch, grid, harsh, underground, data
**Character** — neon data running in a hacker's terminal.

```css
--color-background:     oklch(14.5% 0 0);        /* was #0A0A0A */
--color-surface:        oklch(17.8% 0 0);        /* was #111111 */
--color-border:         oklch(25.2% 0 0);        /* was #222222 */
--color-text:           oklch(86.9% 0.278 144.5);/* was #00FF41 */
--color-text-muted:     oklch(62.7% 0 0);        /* was #888888 */
--color-brand:          oklch(64.5% 0.260 2.5);  /* was #FF0080 */
--color-accent:         oklch(90.5% 0.155 194.8);/* was #00FFFF */
```

**Type** — Orbitron 700–900 for headings, IBM Plex Mono 400 for body.
**Radius** 0 · **Shadow** neon glow · **Tier** L3.
**Signature** glitch displacement, scanlines, data-stream motion, typewriter reveals.

Two warnings this seed needs more than the others. Phosphor-green body text at
0.278 chroma is genuinely tiring to read for more than a short burst — keep long
copy on the muted grey and save the green for headings, labels and terminal
output. And a monospace body face costs roughly a third more horizontal space, so
the measure guidance in `typographic-finishing.md` needs re-checking rather than
copying.

---

## 8 — Organic Natural

**Keywords** — earth, handmade, soft, breathing, sustainable
**Character** — hand-milled soap at a country market.

```css
--color-background:     oklch(95.8% 0.009 67.7); /* was #F5F0EB */
--color-surface:        oklch(99.2% 0.005 78.3); /* was #FEFCF9 */
--color-border:         oklch(87.6% 0.017 76.1); /* was #DDD5CA */
--color-text:           oklch(32.6% 0.023 64.1); /* was #3D3228 */
--color-text-muted:     oklch(54.5% 0.026 71.5); /* was #7A6E60 */
--color-brand:          oklch(59.2% 0.092 143.9);/* was #5B8C5A — moss */
--color-accent:         oklch(70.4% 0.081 63.4); /* was #C4956A — terracotta */
```

**Type** — Fraunces 600–700 for display, with its optical-size axis actually
driven rather than left at default, and Source Sans 3 400–500 for body.
**Radius** 20px and up · **Shadow** warm and very soft · **Tier** L1–L2.
**Signature** hand-drawn texture, irregular edges, gentle gradients.

Fraunces is a variable face with a real `opsz` axis — see the optical-sizing
section of `typographic-finishing.md`, since letting it track the rendered size is
most of what makes this seed look considered rather than merely warm.

---

## 9 — Swiss Grid

**Keywords** — grid, rules, rational, black and white, red
**Character** — a poster in a Bauhaus corridor.

```css
--color-background:     oklch(99.5% 0 0);        /* upstream #FFFFFF, softened */
--color-surface:        oklch(97.0% 0 0);        /* was #F5F5F5 */
--color-border:         oklch(12.0% 0 0);        /* upstream #000000, softened */
--color-text:           oklch(14.0% 0 0);        /* upstream #000000, softened */
--color-text-muted:     oklch(45.0% 0 0);        /* was #555555 */
--color-accent:         oklch(62.8% 0.258 29.2); /* was #FF0000 — punctuation only */
```

**Type** — **Archivo** 700 for headings and 400 for body (upstream specifies
Helvetica Neue falling back to Inter; Inter is banned as a display face and
Helvetica Neue is not web-licensable by default. Archivo is the grotesque in this
family that ships under an open licence and holds the same rational character).
**Radius** 0 · **Shadow** none · **Tier** L1.
**Signature** a strict grid, heavy rules, large negative space, asymmetric
composition.

This is the seed where the pure-black rule bites hardest, because true black is
part of the Swiss idiom. The softening to 14% lightness is deliberate and small:
it survives on a screen, where an untinted `#000` against `#FFF` produces halation
that the printed original never had.

---

## 10 — Glassmorphism

**Keywords** — transparent, blurred, light, layered, dreamlike
**Character** — sunlight through frosted glass onto a desk.

```css
--color-gradient-from:  oklch(62.7% 0.164 271.5);/* was #667EEA */
--color-gradient-to:    oklch(50.1% 0.138 304.7);/* was #764BA2 */
--color-surface:        oklch(100% 0 0 / 0.15);
--color-border:         oklch(100% 0 0 / 0.2);
--color-text:           oklch(100% 0 0);
--color-text-muted:     oklch(100% 0 0 / 0.7);
```

**Type** — Outfit 600–700 for headings, **Manrope** 400–500 for body (upstream
pairs Inter).
**Radius** 16px · **Shadow** large and diffuse · **Tier** L2.
**Signature** `backdrop-filter: blur(12px)`, translucent stacking, light-play motion.

The failure mode is contrast. White text on a translucent panel over a gradient
has a contrast ratio that changes with whatever is behind it, so it must be
measured against the *lightest* part of the gradient, not the average. A
`background-color` floor under the translucency is the usual fix, and it is also
what saves the panel on browsers where `backdrop-filter` is unavailable.

---

## Mixing seeds

Briefs rarely land on one seed. The rule for combining them is the one
`brand-design-systems.md` states for mixing brand profiles, and it holds here
unchanged: **take palette and type from one seed, behaviour and decoration from
another. Never mix two palettes.**

| Brief | Reading |
|---|---|
| "dark but restrained" | Dark Tech palette, Minimal Pure's motion tier and decoration rules |
| "warm but fun" | Warm Professional palette, Playful Creative's radius and easing |
| "CJK with a technical edge" | Ink and Paper type and CJK rules, Dark Tech palette |
| "Swiss but modern" | Swiss Grid grid and monochrome, larger radius, L2 motion |

Two palettes averaged together do not read as a hybrid. They read as a redesign
someone abandoned halfway.

---

## What was changed on the way in

| What | Upstream | Why |
|---|---|---|
| Every palette | hex | `COL-04` bans raw hex. Converted through linear sRGB and OKLab, arithmetic in the repo's converter, original kept in a comment |
| Cream Editorial body | DM Sans | Rule 8 ban list → Satoshi |
| Minimal Pure body | DM Sans | Rule 8 ban list → General Sans |
| Dark Tech heading | Space Grotesk | Rule 8 ban list → Clash Display |
| Dark Tech body | Inter | Rule 8 ban list → Geist |
| Glassmorphism body | Inter | Rule 8 ban list → Manrope |
| Swiss Grid | Helvetica Neue / Inter | Inter banned; Helvetica Neue not openly licensable → Archivo |
| Six `#FFFFFF` surfaces | pure white | Rule 3 — tinted to each seed's own hue |
| Swiss Grid text and border | pure black | Rule 3 — softened to 12–14% lightness |
| Seed 6 name | "Chinese Elegant" | Renamed "Ink and Paper" — it describes a typographic tradition, not a nationality, and the palette suits any long-form serif setting |

The banned faces may still appear inside a fallback stack — `font-family:
Satoshi, "DM Sans", sans-serif` is legitimate and often correct, since the point
of the ban is that these faces are the reflex *choice*, not that they render
badly.

## Sources

Translated from the Chinese original in `xiaopu-ai/web-design`
(MIT, Copyright © 2026 KAOPU-XiaoPu). The ten seeds, their keywords and the
mixing concept are upstream's. The OKLCH conversions were computed rather than
estimated, the font substitutions and surface tinting are required by this
skill's own rules, and the contrast warnings on the Cyberpunk, Playful and
Glassmorphism seeds are ours.
