# Accessibility-Aware Schemes

A generated colour is a candidate. Contrast is what turns it into a token.

## WCAG 2.x is the standard you must meet

Whatever its flaws, WCAG 2.1/2.2 contrast ratio is what conformance is measured
against, what auditors check, and what the law references in most jurisdictions.
Ship against it.

| Content | Minimum (AA) | Enhanced (AAA) |
|---|---|---|
| Body text | 4.5:1 | 7:1 |
| Large text (≥24px, or ≥18.66px bold) | 3:1 | 4.5:1 |
| UI components, focus indicators, graphics | 3:1 | — |

```ts
function relativeLuminance(r: number, g: number, b: number): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a.r, a.g, a.b);
  const lb = relativeLuminance(b.r, b.g, b.b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
```

Ratios run 1:1 (identical) to 21:1 (black on white). The `+ 0.05` models ambient
screen flare, and it is why pure black on pure white is 21 rather than infinite.

## Where WCAG 2.x is wrong, and what APCA does

The formula is known to misjudge two cases badly:

- **Dark themes.** It systematically overstates contrast for light text on dark
  backgrounds, so a pair that passes 4.5:1 can still be genuinely hard to read.
- **Thin type.** It ignores weight and size below the crude "large text"
  threshold, so 300-weight 16px and 700-weight 16px are scored identically.

APCA (Accessible Perceptual Contrast Algorithm), the candidate for WCAG 3,
accounts for polarity and for the fact that perceived contrast depends on which
colour is the text. It reports `Lc` from about -108 to 106, where sign encodes
direction: positive is dark text on light, negative is light text on dark.

| Use | Minimum Lc |
|---|---|
| Body text | 75 |
| Large text and headings | 60 |
| Non-text UI, boundaries | 45 |

The pragmatic position for a theme engine: **generate against APCA, verify
against WCAG 2.x, ship only what passes both.** APCA gives better perceptual
results, especially for the dark themes a generator will produce; WCAG is what
conformance is judged on. A pair that satisfies both is defensible either way.

Do not report APCA numbers as WCAG conformance. They are different scales, and
`Lc 75` is not "4.5:1".

## Fixing a failing pair

The pair failed. Change lightness — not hue, not chroma:

```ts
export function ensureContrast(fg: Oklch, bg: Oklch, target = 4.5): Oklch {
  const direction = fg.l > bg.l ? 1 : -1; // push further the way it already leans
  let candidate = { ...fg };

  for (let i = 0; i < 40; i++) {
    if (contrastRatio(oklchToRgb(candidate), oklchToRgb(bg)) >= target) return candidate;
    const next = candidate.l + direction * 2;
    if (next <= 0 || next >= 100) break;
    candidate = { ...candidate, l: next };
  }
  return candidate; // caller decides: accept, or reject the anchor hue entirely
}
```

Lightness is the axis contrast actually responds to. Adjusting hue changes the
identity of the colour for a negligible contrast gain; adjusting chroma changes
how vivid it is and barely moves the ratio at all.

Step in the direction the pair already leans. Dragging light text *down* toward a
dark background to "fix" it makes things worse — the loop must diverge the two
lightnesses, not converge them.

Return the best effort and let the caller decide. A generator that silently
returns black-on-white whenever the brand hue is awkward has thrown away the
brand rather than reported a problem.

## `prefers-contrast`

```css
@media (prefers-contrast: more) {
  :root {
    --color-text: oklch(8% 0.01 248);
    --color-surface: oklch(100% 0 0);
    --color-border: oklch(35% 0.01 248);
  }
}
```

Users who ask for more contrast should get a genuinely different set of tokens —
lightness pushed to the extremes, borders darkened until they are unmistakable —
not the same palette nudged by 3%.

`prefers-contrast: less` exists too and is rarer; leaving it unhandled is fine.
Windows High Contrast Mode is a separate mechanism (`forced-colors: active`)
which replaces your colours entirely. There, the correct response is to stop
fighting: use `forced-color-adjust` only on decorative elements, and make sure
nothing depends on a colour you no longer control.

## Colour is never the only channel

A generated palette cannot know that red means destructive. It can only know the
hue is 25°.

Every colour-coded state needs a second signal — a label, an icon, a shape, a
weight. Roughly 8% of men have some form of colour-vision deficiency; a
red/green status dot conveys nothing to them, and no amount of contrast fixes
that, because contrast and hue discrimination are different problems.

```tsx
<span className="inline-flex items-center gap-1.5">
  <CheckIcon aria-hidden="true" />
  <span>Verified</span>
</span>
```

The icon *and* the word. Either alone is a guess.

## Test what you generate

A theme generator is one of the few places where accessibility is genuinely
testable in CI, because both colours are known values in code:

```ts
it("keeps every generated text/surface pair above 4.5:1", () => {
  for (let hue = 0; hue < 360; hue += 15) {
    for (const dark of [true, false]) {
      const t = generateTheme(hue, dark);
      expect(contrastRatio(parse(t.text), parse(t.surface))).toBeGreaterThanOrEqual(4.5);
    }
  }
});
```

Sweep the whole hue wheel. A generator tested against one brand colour is tested
against nothing — the failures live at specific hues (blues and violets go dark
fast, yellows stay light), and only a sweep finds them.
