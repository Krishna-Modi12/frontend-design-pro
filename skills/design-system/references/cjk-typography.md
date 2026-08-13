# CJK Typography — the rules Latin type does not have

Route: any interface carrying Chinese, Japanese or Korean text, mixed Han/Latin
running copy, or a locale switch that includes a CJK locale. Shortcode `[cjk]`.
Source: `alchaincyf/huashu-design` (MIT), §4 of its typography reference.

`references/font-pairings.md` and the type scale in `design-system/SKILL.md`
assume Latin text, and most of that assumption does not survive contact with
Han characters. **Latin typography has a century of tooling behind it and CJK
does not**, so the common failure is not ignorance — it is applying a Latin rule
that inverts.

Cross-reference `platform/references/i18n.md` for routing, message catalogues and
RTL; this file is only about how the text renders once the locale is resolved.

## The fallback chain is the primary lever, and its order is counter-intuitive

**Put the Latin face first and the CJK face second.**

```css
font-family: "Geist", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
font-family: "Newsreader", "Noto Serif SC", "Songti SC", serif; /* serif stack */
```

`font-family` resolves **per character**, not per element. A Latin face contains
no Han codepoints, so Han characters fall through it to the CJK face
automatically — while Latin letters and digits are caught by the face actually
designed for them. Write the CJK font first and it swallows the Latin text too,
since CJK fonts ship their own Latin glyphs and those are usually the weakest
part of the file. The pairing then does nothing.

Two corrections that follow from mixing scripts at all:

**Size compensation.** At the same `font-size`, Latin lowercase looks smaller —
x-height is about half the em, where a Han character fills it. Either normalise
it or choose around it:

```css
:root { font-size-adjust: from-font; }  /* Chrome 127+, Firefox, Safari 17+ */
```

The alternative is picking a Latin face with a tall x-height (Geist, Inter,
Source Sans), which costs nothing and degrades gracefully on older engines.

**Numerals always belong to the Latin face** — the chain above already guarantees
it. In any table, add `font-variant-numeric: tabular-nums`, or `1` and `8` take
different widths and the column jitters on every re-render.

**Do not insert spaces between Han and Latin by hand.** The spacing should come
from the faces' own sidebearings; a literal space inserted in content is a string
that has to be maintained, breaks search and selection, and doubles up wherever
a real space already exists.

## Chinese has no italic

There is no italic tradition in Han letterforms. `font-style: italic` therefore
produces a **faux italic**: the browser mechanically shears the glyph, distorting
strokes that were drawn on a square grid.

Fit a fuse first, globally:

```css
:root { font-synthesis: none; }  /* refuse synthetic italic and synthetic bold */
```

Then emphasise with something Han typography actually has:

| Latin habit | CJK substitute |
|---|---|
| Italic for emphasis | A heavier weight — `font-weight: 600`, provided the family really ships it |
| Italic for titles/quotes | A highlighter underlay: `background: linear-gradient(transparent 60%, var(--color-highlight) 60%)` |
| Italic for a block quote | Change face — set the quotation in a Kai (楷) face, which reads as quotation in Chinese the way italic does in English |
| Italic for proper nouns | `text-emphasis: dot` — the 着重号, the native Han emphasis mark, and now broadly supported |

## Punctuation has hard rules, not preferences

| Rule | Do | Why |
|---|---|---|
| Quotation marks | 「」 and 『』, not `""` | Curly quotes occupy a full-width slot with a Latin shape, so they float visually in a Han line |
| Line breaking | `line-break: strict` | Enforces kinsoku: a full stop or comma may not open a line, an opening bracket may not end one. This is the floor of CJK setting, not a refinement |
| Hanging punctuation | `hanging-punctuation: first allow-end` (Safari); elsewhere `text-indent: -0.5em` on the paragraph | An un-hung opening quote makes the first line look indented by half a character and breaks the left edge |
| Consecutive full-width marks | `font-feature-settings: "halt"` | Adjacent full-width punctuation (`）。`) leaves a gap of roughly one and a half characters. `halt` narrows it |

## Letter-spacing inverts

| Context | Range | Why |
|---|---|---|
| Body | `0` to `0.05em` | A little air helps; past `0.05em` word shapes dissolve and reading slows |
| Headings (24–48px) | `0` | Han characters are square and already evenly spaced — Latin-style tracking corrections have nothing to correct |
| Display (>60px) | `-0.02em` to `0` | Large sizes magnify the gaps between glyph faces; tighten slightly, and no further or strokes collide |
| All-caps Latin labels | `0.08em` to `0.15em` | The one place wide tracking is right, and it applies only to the Latin run |

**Never carry the Latin display habit of `-0.05em` into Han text.** Latin display
tracking exploits the sidebearings around variable-width letters. Han glyphs are
drawn to fill the square, so negative tracking puts strokes into each other.

## Making a display moment without a display-face ecosystem

CJK has nothing like the Latin range of Ultra Thin to Black display families —
each weight is thousands of drawn glyphs — so drama comes from reasoning rather
than from font choice:

- **Weight contrast is the main instrument.** Heavy 900 against Light 300 *within
  one family* is more forceful than switching families, and costs no extra load.
- **Stroke density sets the minimum usable size.** A high-contrast face with thin
  horizontals (a Song/Ming serif) breaks up below roughly 24px; body text must
  return to a Hei (sans) or a medium-stroke face.
- **It inverts at the top too.** A heavy face at very large sizes over-inks: the
  difference between a two-stroke character and a twenty-stroke one is magnified,
  so a dense headline may need a lighter weight rather than a heavier one.
- **Vertical setting is a CJK-only move.** `writing-mode: vertical-rl` gives
  spine-style titles and pull quotes Latin cannot do. Inside it, set Latin runs
  and numerals with `text-orientation: upright`, or `text-combine-upright: all`
  to stack a two-digit number into one square.

## Weight and budget

**A CJK font file is 5–15 MB — one is roughly ten Latin faces.** Two consequences
that override the usual pairing advice:

1. **At most two CJK families on a page**, for loading cost and for coherence.
2. **Body copy comes from Song (宋), Hei (黑) or Kai (楷) only.** Everything else
   in the CJK catalogue is a display face; setting a paragraph in one is tiring
   to read regardless of how well it suits the headline.

Subset aggressively where the content is known, and prefer a family that ships
the weights you need over pulling a second family to get one more weight — the
second family costs another 5–15 MB to buy what a weight change gives free.
