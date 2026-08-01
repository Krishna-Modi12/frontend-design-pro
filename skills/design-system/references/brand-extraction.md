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

## When extraction fails

If the brand publishes nothing and the site is unreadable, **say so and ask** — do not fill the
gap from memory. The honest options, in order of preference: request the guidelines from the
user, work from a screenshot they supply, or agree on an archetype from `brand-core.md` as an
explicit stand-in. Silently inventing a palette and presenting it as the brand's is the failure
this whole protocol prevents.

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
