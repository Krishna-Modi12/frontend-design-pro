# Brand Asset Extraction (design-system)

Route: any work that must match a **real, existing brand** rather than pick an archetype.
Source: `alchaincyf/huashu-design`.

`brand-core.md` / `brand-extended.md` give you nine archetypes to *choose* from when the brand
is yours to invent. This file covers the opposite case: the brand already exists, someone owns
it, and getting its colours wrong is a factual error rather than a taste disagreement.

## The rule this file exists for

**Never reproduce a brand's colours, type or logo from memory.** Model recall of brand hex
values is confidently wrong at a rate that matters — close enough to look deliberate, far
enough to be visibly off in a side-by-side. Brand values are facts to be looked up, not
aesthetics to be inferred.

## Extraction protocol

1. **Ask first.** "Do you have brand guidelines, a design token file, or a style guide?" A
   supplied token file ends the protocol immediately and beats anything scraped.
2. **Go to the official brand surface.** In order: `<brand>.com/brand`, `brand.<brand>.com`,
   `<brand>.com/press`, `<brand>.com/media-kit`. These pages exist precisely to be
   authoritative; a blog post or a third-party "brand colors of X" listicle is not.
3. **Pull the assets** — logo SVG/PNG, any published palette, the font stack. Three fallbacks
   in order: the brand page's own download, the site's CSS custom properties, then computed
   styles on the live site.
4. **Extract values programmatically.** Grep the assets and CSS for `#xxxxxx`, then discard
   pure blacks, pure whites and neutral greys — what remains is the brand-identifying set.
   Reading hex out of a file cannot hallucinate; eyeballing a screenshot can.
5. **Record what you found, with provenance.** Write a `brand-spec.md` capturing each value,
   where it came from, and the date. Convert to OKLCH tokens at that point, keeping the source
   hex in a comment so the conversion stays auditable:

```css
@theme {
  /* source: brand.example.com/palette, retrieved 2026-08-01, #1B4DFF */
  --color-brand-primary: oklch(52% 0.24 264);
}
```

## Tooling — do the fetch with a script, not by eye

`scripts/extract_design_tokens.py` in this repo automates the mechanical half of
the protocol above. Standard library only, no install:

```bash
python scripts/extract_design_tokens.py --url https://example.com
python scripts/extract_design_tokens.py --file page.html --format json
```

It fetches the page, follows and merges its linked stylesheets, and reports
colours by frequency, font families and sizes, the spacing values actually used,
border radii, shadows, animations, custom properties, page structure and image
assets. That is the evidence the protocol asks for, gathered in one command
rather than by reading devtools and typing values into a document.

Three things it does not do, and one of them matters more each year:

- **Its colour detection is hex-centric.** A site written in `oklch()`, `lab()`
  or `color-mix()` reports few colours or none, because the regex looks for hex.
  The values still appear under CSS VARIABLES when they are custom properties,
  but the frequency ranking that nominates a "primary" is unreliable there — and
  the sites most worth extracting from are exactly the ones that have moved.
- **It sees server HTML.** A client-rendered application gives it very little.
  Upstream ships a Playwright crawler for that case, which this repo did not
  vendor: it would be our first Python third-party dependency and it downloads a
  browser. Install it separately when you need it rather than expecting it here.
- **Frequency is not hierarchy.** The most repeated colour on a page is usually a
  border. The tool produces a census; deciding which value is the brand is still
  yours, and still needs the semantic mapping the protocol describes.

Run the tool, then do the judgement. The rule at the top of this file is about
where values come from, and a script satisfies it in a way that recalling a brand
from memory never will.

## When extraction fails

If the brand publishes nothing and the site is unreadable, **say so and ask** — do not fill the
gap from memory. The honest options, in order of preference: request the guidelines from the
user, work from a screenshot they supply, or agree on an archetype from `brand-core.md` as an
explicit stand-in. Silently inventing a palette and presenting it as the brand's is the failure
this whole protocol prevents.

## Sourcing a palette from something that is not a brand

Everything above assumes the target is a company with a published palette. The
adjacent case — "make it feel like a Vermeer", "give me the Blade Runner
grade" — has no authoritative surface to fetch, and the protocol above has
nothing to say about it. `patrickkrebs/theme-factory-addon` (Apache-2.0) works
this way at scale, and the useful part is its honesty about what the result is.

**A palette derived from a painting or a film is an evocation, not a
reproduction, and must be labelled as one.** There is no canonical hex spec for a
canvas: the pigment, the photograph of it, and the screen all disagree. Say
"derived from" and name the work.

Three sources that behave differently and are worth distinguishing:

| Source | What you get | The catch |
|---|---|---|
| **A painting** | Hand-picked dominant colours from the work | No canonical values. Check the work is public domain before naming it in shipped copy — most pre-1930 painters are; the *photograph* of a work may not be |
| **A film still or a grade** | A mood with a deliberate cast, already colour-graded for a screen | Cinematography is authored and recent work is in copyright. Evoke the palette, never ship the frame |
| **An editor or terminal theme** | A palette already proven at small type on a dark surface, with contrast tested by daily use | Built for syntax tokens, not for UI roles. It gives you a ramp, not a semantic mapping |

The mechanical step is the same as `references/color-palettes.md` teaches for an
image: sample by median cut, never by averaging — averaging a six-colour painting
returns mud. Then map the extracted ramp onto semantic roles deliberately, since
the source has no notion of "surface" or "danger", and check every pair against
the contrast floors before calling it a theme.

Pairing the palette with type in the same artefact is the part worth copying:
a theme that names a display face and a body face beside its ramp is usable
immediately, where a bare palette still needs `references/font-pairings.md`.

**If you are reading one of that addon's themes, three things do not transfer.**
It is cited above for its method, not as a drop-in source, and applying a theme
from it verbatim breaks rules this pack enforces elsewhere:

- **The hex is hex.** Convert to OKLCH before use (`COL-04`). Several themes also
  use `#FFFFFF` and `#000000` as background and text extremes, which is a direct
  hit on rule 3 — pure black and white are never surfaces here.
- **"Role" there means brightness rank, not a semantic slot.** Roles are assigned
  by sorting each palette by relative luminance and zipping it against a fixed
  ladder, so the ladder has exactly as many rungs as the palette has colours.
  There is no border, focus-ring or destructive role to inherit; you still do the
  semantic mapping yourself, exactly as the paragraph above says.
- **Fonts are assigned per category, not per theme**, so four themes sharing a
  category share a type pairing whatever their palettes look like. Check the pair
  against `references/font-pairings.md` — at least one category pairs a display
  face this pack bans outright, and several more use faces on its Convergence
  Watch.

Each theme is also a single mode, light or dark, with no paired counterpart. The
`color-themes` skill treats `auto` as a third state, so a theme taken from there
gives you one half of what you need to ship.

## Additional AI-design tells

Three patterns not on the registry's anti-slop wall, each a reliable signal that a layout was
generated rather than designed:

| Tell | Why it reads as generated |
|---|---|
| **Emoji as interface icons** | Emoji render differently per platform, carry no weight relationship to adjacent text, and cannot inherit colour — a real icon set does all three. Use Lucide or Phosphor (`skills/iconography/`). |
| **Rounded card + coloured left-border accent** | The default "callout" shape of every LLM-generated component. Distinctive layouts express category through type, spacing or position, not a 4px stripe. |
| **Generic SVG face illustrations** | The undifferentiated flat-vector person. Reads as clip-art filler; use real photography, initials avatars (`skills/iconography/references/icons-avatars.md`), or nothing. |

## Critique dimensions

When reviewing branded work, score against five axes rather than a general impression — the
first and last are the ones a checklist-driven review usually skips:

1. **Philosophical coherence** — does every choice serve one stated idea, or is it several good ideas colliding?
2. **Visual hierarchy** — does the eye land where the brief says it should?
3. **Detail execution** — optical alignment, consistent radii, no orphaned states.
4. **Functionality** — does it work at 320px, under keyboard, with reduced motion?
5. **Innovation** — is there one decision here that a template would not have produced?
