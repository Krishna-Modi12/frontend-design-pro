# Phosphor — the weight-variant set, and when it beats the default

Route: work that needs icon **weight** as a design variable, or any brief already
routed to Phosphor by an aesthetic direction. Shortcode `[phosphor]`.
Source: `@phosphor-icons/react` (MIT), read from the package README 2026-08-13.
`phosphoricons.com` is a client-rendered shell and returns nothing to a fetch —
the figures here come from the package, not the site.

**Lucide stays the pack default** (`references/icons-avatars.md`). Reach for
Phosphor for one reason: it ships **six weights** of the same glyph, so weight
becomes something you can design with rather than something you inherit. Two
style directions already override to it —
`design-system/references/styles/minimalist.md` and `design-system/references/styles/soft.md` — and when a
style file is in play it wins.

Generic sizing, colour, accessible-name and optical-alignment rules live in
`references/icon-systems.md` and are not repeated here. This file is what is true
of Phosphor specifically.

## The weight system

`thin · light · regular · bold · fill · duotone`, across 9,000+ icons.

```tsx
import { HeartIcon } from "@phosphor-icons/react";

<HeartIcon weight="fill" size={20} />
```

`icon-systems.md` already states the rule that matters — match the weight of the
text the icon sits with, and hold one weight per surface. The Phosphor-specific
consequence is that **the six weights are a trap as much as a feature**: a set
that makes weight easy to change invites changing it per icon, and a nav with a
bold home glyph beside a thin settings glyph reads as a rendering bug rather than
emphasis. Choose the weight for the *surface*, then use `fill` as a **state**, not
as decoration:

| Weight | Where it belongs |
|---|---|
| `regular` | Body-adjacent UI. The default and usually correct |
| `light` / `thin` | Large sizes only. Below ~24px the strokes thin out to grey mush |
| `bold` | Pairs with bold labels; also the accessible answer when a small glyph must stay legible |
| `fill` | **Selected / active state.** Outline for inactive, fill for active is the clearest tab-bar convention there is |
| `duotone` | Illustrative moments — empty states, feature grids. Not for controls |

**`duotone` breaks the colour assumption the rest of the set holds to.** Every
other weight is a single path inheriting `currentColor`; duotone renders a second
tone at partial opacity, so it will not track a token the way a `regular` glyph
does. Verify duotone contrast against the surface behind it rather than assuming
the parent's text colour carried.

## Setting defaults once

`IconContext.Provider` sets `weight`, `size` and `color` for everything below it,
which is how you hold one weight per surface without repeating a prop:

```tsx
import { IconContext } from "@phosphor-icons/react";

<IconContext.Provider value={{ weight: "regular", size: 20 }}>
  <Toolbar />
</IconContext.Provider>
```

Two things this does not survive. **A React portal escapes the provider** — a
dialog or dropdown rendered through one sits outside the tree and falls back to
Phosphor's own defaults, which is how a modal ends up with 16px regular icons
against a 20px toolbar. Wrap the portal's content too. And **a provider is not a
token** — the values here should read from the same scale as everything else, not
be a second source of truth for size.

## Import paths, and the one that costs a minute per rebuild

Three forms, and the difference is real:

```tsx
import { BellIcon } from "@phosphor-icons/react";                     // barrel
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";       // direct
import { BellIcon } from "@phosphor-icons/react/ssr";                 // RSC-safe
```

The barrel tree-shakes correctly in a production build, so the shipped bundle is
fine either way. The cost is in **development**: a dev server resolves the whole
barrel of 9,000+ icons on first compile, which is felt as a slow cold start
rather than as a bundle-size number — the failure mode is invisible to
`PERF-01`-style checks, which look at what ships. Prefer the direct path in any
file a dev server recompiles often.

The `/ssr` entry exists because icons rendered in a React Server Component must
not drag a client boundary behind them. In the Next.js App Router, use `/ssr` in
server components and the direct path in anything marked `"use client"`.

## `mirrored` — the RTL prop

```tsx
<ArrowRightIcon mirrored={isRTL} />
```

A prop no other common set gives you, and it belongs to the i18n rules in
`platform/references/i18n.md` rather than to taste. **Mirror what encodes
direction; never mirror what encodes meaning.** Arrows, chevrons, undo/redo,
list-indent and anything indicating forward or back flip in RTL. A clock, a
checkmark, a play triangle, a logo and any glyph containing a numeral do not —
mirroring a clock produces a clock that runs backwards.

Drive it from the resolved locale direction, not from a hand-maintained boolean
per icon.

## Do not mix Phosphor and Lucide in one surface

Phosphor draws on a **256×256 grid**; Lucide draws on 24×24 with a 2px stroke.
Rendered at the same pixel size the two families land at visibly different
optical weights, so a toolbar mixing them reads as inconsistent even to someone
who cannot name why.

`icon-systems.md` bans mixing *weights* within a family. The cross-family version
is stricter: **pick one family per surface.** If a needed glyph is missing from
the set you chose, draw it on that set's grid — 256×256 for Phosphor, strokes
stripped so `currentColor` is inherited — rather than importing one icon from the
other family.

## Anti-patterns

**`fill` used decoratively.** It is the strongest signal in the set. Spending it
on ornament means having nothing left to say "selected" with.

**`thin` at 16px.** It renders as a grey smudge and fails contrast on a light
surface. If the design calls for delicate, raise the size, not the weight.

**A `weight` prop chosen per icon.** The symptom of a set with six weights and no
decision. Set it once on the context and override only for state.

**Assuming duotone inherits the token.** See above — it is the one weight that
does not.
