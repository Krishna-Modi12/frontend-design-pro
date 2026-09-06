# Visual Hierarchy — building a rank, not a set of sizes

Route: any brief where the question is *what should be noticed first*, or a
critique that has stalled on "this feels cluttered". Shortcode `[hierarchy]`.

`references/laws-of-ux.md` states the perception laws this rests on — Von
Restorff, Similarity, Proximity, Prägnanz, Serial Position — and they are not
repeated here. This file is the mechanical half: how a rank gets built, how it
gets tested, and the specific way it usually fails.

## Rank before you style

**Write the order first, in words, before choosing a single size.** Three lines
is enough:

```
1. The offer            — one line, must land in under a second
2. What it costs        — the number, findable without reading
3. Everything else      — nav, legal, secondary links
```

Hierarchy is a claim about *ranking*, and ranking is a decision about the content,
not about type. A layout that cannot state its rank in three lines has not
resolved what it is for, and no amount of scale will rescue it. This is the step
that gets skipped, and skipping it is why "make the heading bigger" never fixes
anything: it changes one element's weight without changing the order.

If two things tie for first, one of them is not first. Break the tie in the brief,
not in the CSS.

## Five devices, and the rule for spending them

Rank is expressed through five independent devices:

| Device | Ranks by |
|---|---|
| **Size** | Larger reads sooner |
| **Weight** | Heavier reads sooner at equal size |
| **Colour / contrast** | Higher contrast against the surface reads sooner |
| **Spacing** | Isolation reads sooner — whitespace *is* emphasis |
| **Position** | Earlier in reading order reads sooner |

**Spend one, at most two, per rank step.** This is the rule the whole file exists
for. The recognisable failure — the thing that reads as generated rather than
designed — is stacking all five on one element: the headline that is large *and*
bold *and* brand-coloured *and* centred *and* wrapped in a bordered card. Each
device is doing the same job, so four of them are wasted, and having spent
everything on rank 1 there is nothing left to separate rank 2 from rank 3.

Restraint here is not modesty. It is keeping devices in reserve so the rest of the
page can still be ranked.

**Prefer spacing first.** It is the cheapest device, it never fights the type
system, and it cannot fail a contrast check. `laws-of-ux.md`'s Law of Proximity is
the reason: a label 4px from its input and 24px from the next field needs no
border, no heading and no colour to be understood as grouped.

## Scale: fewer steps, bigger jumps

A type scale with many near-identical steps produces sizes a reader cannot rank —
18px against 20px is not perceived as a level, it is perceived as an inconsistency.

Use a **ratio**, not an increment, and keep the count small. A ~1.25 ratio suits
dense product UI; ~1.333 or ~1.5 suits marketing pages where levels must read from
across a room. Four to six steps is plenty:

```css
@theme {
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.25rem;
  --text-2xl:  1.875rem;
  --text-4xl:  3rem;
}
```

Two consequences worth stating. **A step you never use is not a step** — delete
it, or it will get used by accident to break a tie. And **the gap between body and
the next level up is the one that matters most**; if `--text-lg` is barely
distinguishable from `--text-base`, every subhead in the product is decorative.

## Contrast ranks text too

Text colour is a hierarchy device, and a three-tier text ramp does most of the
work a second font weight would:

```css
--color-text:           oklch(20% 0.01 260);  /* rank 1 — headings, key numbers */
--color-text-secondary: oklch(45% 0.01 260);  /* rank 2 — body */
--color-text-tertiary:  oklch(58% 0.01 260);  /* rank 3 — meta, timestamps */
```

**The floor is not negotiable and it is the whole difficulty.** Tertiary text is
still text: it clears 4.5:1 against its surface, or it is not a rank, it is a
legibility failure — see `core/accessibility-baseline.md`. Designers reach for
grey to demote something and keep going until it fails; if 4.5:1 is not enough
demotion, demote it with *size or position instead*, or cut it.

Colour is also the device that most often carries meaning elsewhere in the system.
Spending brand colour on hierarchy competes with spending it on affordance, and
the affordance usually needs it more.

## Two tests that make it checkable

**Squint at it.** Blur the screen until type is unreadable and only shapes and
values remain. The elements still visible are your actual rank. If it does not
match the three lines written at the start, the layout ranks something the brief
did not.

**Remove the device.** Take away the largest device on rank 1 — drop the size back
to body, or strip the colour. If the rank collapses entirely, it was carried by
one trick and will not survive translation, a longer headline, or a dark theme. A
sound hierarchy degrades: weaker, still correct.

Both tests are worth running before a critique, because they convert "this feels
cluttered" into a statement about which rank is missing.

## Anti-patterns

**Everything emphasised.** Four cards, each with a bold heading, a coloured icon,
a border and a shadow. Uniform emphasis is the same as none — this is Von Restorff
in `laws-of-ux.md` read backwards.

**Hierarchy by box.** Reaching for a card, border or background tint to signal
importance. A container is a claim about *grouping*, not about rank; using it for
rank produces pages of nested boxes with no order inside any of them.

**Centred everything.** Centring removes the shared left edge that lets the eye
scan a rank quickly. Centre the one thing that is genuinely singular; range the
rest.

**A hierarchy that exists only at desktop width.** Rank is not a layout — check
that the order survives at 390px, where position collapses to pure scroll order
and size is the only device left with room.

**Uppercase as emphasis.** It reduces word-shape cues and slows reading. It is a
*label* convention, useful for eyebrow text, and it is not a rank.
