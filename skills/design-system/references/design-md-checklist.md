# DESIGN.md Delivery Checklist

Run this after generating code against a DESIGN.md, before handing the work back.
It checks *compliance with the brief* — did the build do what the design document
said — which is a different question from whether the code is correct.

`../../../core/validate-checklist.md` owns the second question and is machine-enforced.
This one is a read-through, because most of what it asks cannot be checked by a
regex: whether a section count matches a reference site, whether a motion audit
happened, whether a font actually suits the scene.

## DESIGN.md compliance

- [ ] A DESIGN.md exists and is saved at the project root.
- [ ] All nine sections are present and none is a placeholder.
- [ ] Every colour in the code resolves through a custom property defined in
      DESIGN.md. No literal colour values in components.
- [ ] Type roles follow the table in section 3 — face, size, weight, line height
      and tracking, not just the face.
- [ ] The interaction tier built matches the tier declared. A page that declares
      L1 and ships parallax has broken its own contract.
- [ ] Nothing in the build violates section 8's Don't list.

## When a reference site was supplied

- [ ] Three inputs were used, not one: the experienced impression, extracted
      tokens, and a screenshot comparison. Any one alone misleads.
- [ ] The markup and stylesheets were actually fetched. A summary of a site
      written from memory is not extraction — see `brand-extraction.md`, which
      makes this the rule the file exists for.
- [ ] The reference's sections were counted, so the rebuild is not accidentally
      half the page.
- [ ] If the reference has scroll-linked motion, a motion audit was done —
      what moves, on what trigger, over what distance.
- [ ] An explicit difference audit was run against the reference after building,
      not just a glance.

## Typography

- [ ] Fonts come from DESIGN.md and ship with an `@import` and a fallback stack.
- [ ] The gradient-and-shadow decision was actually run for h1/h2/h3 rather than
      defaulted — see the decoration table in `typographic-finishing.md`.
- [ ] Sizes come from the scene, not from one global default. The scene table in
      `typographic-finishing.md` is the source; a dashboard and a landing page do
      not share a base size, and applying one to both is the single commonest
      way a build looks wrong while every value looks defensible.
- [ ] For CJK content: the stack contains a CJK family, line height is at least
      1.7, and tracking is around 0.02em. `cjk-typography.md` covers the rest.

## Visual system

- [ ] Every colour goes through a custom property.
- [ ] Icons come from one library, or are inline SVG — never emoji standing in
      for an icon. Upstream permits emoji as decoration in its playful direction;
      this pack does not make that exception, because emoji render as a different
      artwork on every platform and carry their own announcements.
- [ ] User-supplied assets were adapted rather than dropped in, and any mismatch
      with the direction was raised rather than silently absorbed.
- [ ] Image placeholders are real images. A flat colour block is not a
      placeholder, it is a missing image with the alarm switched off.

## Interaction

- [ ] Every interactive element has hover **and** focus-visible states.
- [ ] An entrance animation exists — at minimum an L1 fade.
- [ ] At L2 and above, the declared scroll behaviour is implemented: reveal,
      parallax, or the navigation state change.
- [ ] At L3, the signature moments are implemented, and the count is inside the
      ceiling in `../../animations/references/motion-budget.md` rather than merely
      above its floor.
- [ ] At L2 and above, `prefers-reduced-motion` renders the destination state.
      Not nothing, and not the animation at a shorter duration.

## Responsive

- [ ] Mobile (under 600px) and desktop are both handled.
- [ ] Navigation has a collapse strategy on mobile.
- [ ] No image or container overflows its viewport at any width.
- [ ] Touch targets meet the minimum size in
      `../../../core/accessibility-baseline.md`.

## Sources

Translated from the Chinese original in `xiaopu-ai/web-design`
(MIT, Copyright © 2026 KAOPU-XiaoPu). The checklist structure and the
reference-site parsing discipline are upstream's — that section in particular is
worth having, because "count the sections" and "run a difference audit after
building" are the two steps most often skipped. The emoji exception was removed,
the scene-sizing and motion-ceiling items now point at this pack's own files, and
the reduced-motion item was strengthened from "has a fallback" to "renders the
destination".
