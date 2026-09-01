# Source Extraction Protocol

The rules that turn a browsed page into values you can type. Load when you are about to open a reference and need to know what to take from it.

## General Rules

1. **Never extract raster assets.** Recreate with CSS gradients, SVG, or nothing at all. A borrowed hero image is a licensing problem wearing a design decision's clothes.
2. **Never extract proprietary fonts.** Map to the system stack, or to a font the project already licenses. Record the *character* of the face — geometric, humanist, grotesque, mono — not its name.
3. **Convert every colour to OKLCH at the point of extraction.** Not later. Hex sampled and left as hex is hex that reaches the component file.
4. **Record the viewport you captured at.** A 1440px screenshot's spacing is not the mobile spacing, and a ratio extracted at one width is a claim about one width.
5. **Check the reduced-motion behaviour.** Open the site with the preference on. If the source has no fallback, you are inventing one — say so.
6. **Note what you rejected.** "Took the split ratio, dropped the parallax" is the useful half of a research note.

## Per Source Type

### Component libraries — Aceternity, Cult UI, Skiper, React Bits

Take:
- DOM structure — nesting depth, how many wrappers the effect actually needs
- CSS technique — `backdrop-filter`, `mask-image`, `conic-gradient`, pseudo-element borders
- Animation triggers — hover, scroll, mount, and which of those is doing the work
- Prop surface, if it is a React component — what is configurable tells you what varies

Leave:
- Exact colour values — derive these from the project's brand instead
- Exact pixel dimensions — snap to the spacing scale
- Third-party dependencies the effect does not need. Most "libraries" for a glow are two CSS properties.

These libraries ship raw hex, loose typing and no reduced-motion path. Assume all three are missing and add them on arrival.

### Design galleries — Dribbble, Behance, Godly

Take:
- Composition ratio — asymmetric split, rule of thirds, centred with generous gutters
- Palette, 3–5 colours maximum, converted to OKLCH
- Typography hierarchy — how many levels, and how much contrast between them
- Negative-space ratio — usually the actual reason the shot looks good

Leave:
- Decorative illustration that has no UI function
- Non-web contexts — print, packaging, app-store mockups
- Proportions that only exist because the artboard has no scrollbar and no browser chrome

See `dribbble-adaptation.md` for the full translation rules.

### Native pattern libraries — Mobbin, Screenlane

Take:
- Navigation model, translated: tab bar → bottom nav on small screens, sheet → dialog
- Gesture → pointer mapping: swipe → drag carousel, long-press → context menu
- Information density and how it should scale up to desktop
- Modal and sheet patterns, which port well

Leave:
- System chrome — status bars, home indicators, Android nav
- Gestures with no web equivalent
- Aspect ratios that assume a phone

See `mobbin-web-mapping.md` for the mapping table.

### Motion references — Motion.dev, GSAP examples, Codrops

Take:
- Easing curve — read the actual `cubic-bezier` or spring parameters, do not eyeball it
- Duration, split by role: entrance, exit, hover, all different numbers
- Stagger pattern — linear cascade, radial, or per-character
- Scroll coupling — scrub ratio, pin duration, what is pinned

Leave:
- Demo-only complexity: particle fields, physics sandboxes, cursor trails
- Page transitions built as one-offs — use the View Transitions API
- Effects that are GPU-cheap on a desktop demo and ruinous on a mid-range phone

See `motion-easing-catalog.md` for the values worth reusing.

### Landing & section galleries — Supahero, Land-book, BentoGrids

Curated captures of live marketing pages and page sections. The value is
composition at page scale; every component in the shot is someone else's brand.

Take:
- Section order and count — which section leads, which closes, how many the page
  spends before its primary CTA
- Above-the-fold budget — headline-to-CTA distance, how much shows before the first scroll
- Whitespace rhythm between sections, as a ratio to the content block rather than a pixel value
- Bento composition (BentoGrids) — cell span logic, which tile is largest and why, reading order across the grid

Leave:
- Copy voice and headline wording — `SLOP-01/02` bind research output the same as for any page
- Screenshot fidelity as a spec — these are marketing captures, frequently scaled or retouched
- Gradient-mesh and aurora backdrops shown as the whole design — one showpiece per page (`TYP-03`)
- Brand-specific type and illustration

### Design-system directories — Design Systems Surf

An index of shipped design systems and their component documentation. Read the
system, not the site chrome in front of it.

Take:
- Token architecture — how many steps in the colour, space and type scales, and the naming convention each system chose
- Component documentation order — what a component page covers and in what sequence (anatomy → states → usage → a11y is the common shape)
- Where a system draws the primitive/component line

Leave:
- The whole vocabulary — you are extracting one structural decision, not adopting a system
- Scale values that assume a different base unit (8pt vs 4pt) without re-deriving against ours

## Extraction Template

Fill one of these per source. This is the artefact you show the user before writing code.

```markdown
## Source: [URL]
**Type:** component-library | gallery | native | motion | design-system
**Viewport captured:** [width]
**Classification:** structure | mood | interaction
**Strictness:** starting point | close match

**Extracted:**
- Surface:      oklch(...)
- Surface alt:  oklch(...)
- Accent:       oklch(...)
- Grid:         [e.g. asymmetric 60/40, 12-col, breaks to stacked at md]
- Gap:          [scale value]
- Radius:       [scale value]
- Shadow:       [value, or none — most good sources use none]
- Entrance:     [easing, duration]
- Hover:        [easing, duration]
- Typography:   [stack, size steps, weight range]

**Adaptations for web:**
- [responsive behaviour the source does not have]
- [a11y the source is missing]
- [performance cost and how it is bounded]

**Rejected:**
- [what you did not take, and why]

**Checks:**
- [ ] Colours are OKLCH, no hex survived
- [ ] Contrast re-verified against *our* surfaces, not theirs
- [ ] Entrances use ease-out, not ease-in
- [ ] `prefers-reduced-motion` path defined
- [ ] No `min-h-screen`; `min-h-[100dvh]`
- [ ] No lifted assets or licensed fonts
```

## Failure Modes

| Symptom | Cause | Fix |
|---|---|---|
| Output looks like the reference but feels wrong | Copied values, skipped the ratios | Re-extract as relationships, not absolutes |
| Palette fails contrast in the build | Sampled from the source's background, applied to ours | Re-verify every pair after import |
| Animation feels sluggish | Took a hero-scale duration for a hover | Split durations by role |
| Layout breaks below 768px | Extracted from a desktop artboard only | Re-derive the grid with a stacked fallback |
| Cannot explain a decision to the user | Never wrote the research note | The template above is not optional |
