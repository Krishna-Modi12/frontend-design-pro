# Web Interface Guidelines (Vercel)

Route: `CREATE_PAGE`, `REFINE_COMPONENT`, `IMPROVE_UX` → +web-interface-guidelines. Shortcode `[wig]`.
Load after: `ux-deep-rules.md`, `ux-guidelines.md`.
Source: vercel-labs/web-interface-guidelines. **Only rules not already covered elsewhere in this skill** — accessibility, focus, touch, safe-area, `min-w-0`, `tabular-nums`, `text-wrap`, virtualization, and `Intl.*` live in `ux-deep-rules.md` / `ux-guidelines.md` and are not repeated here.

## 1. Surface craft

| Rule | Detail |
|---|---|
| **Layered shadows** | Mimic ambient + direct light with ≥2 shadow layers. `0 1px 2px oklch(0% 0 0/.06), 0 8px 24px oklch(0% 0 0/.08)` — never a single blurry drop shadow. |
| **Crisp borders** | Combine border *and* shadow. Semi-transparent borders (`oklch(0% 0 0/.08)`) read cleaner over varied backgrounds than opaque ones. |
| **Nested radii** | Child radius ≤ parent radius, and concentric: `child = parent − padding`. A 16px card with 8px padding takes an 8px inner radius so the curves stay parallel. |
| **Hue consistency** | On a non-neutral background, tint borders, shadows and muted text toward the *same* hue. In OKLCH keep the H channel constant and move L/C. |
| **Interactions increase contrast** | `:hover`, `:active`, `:focus-visible` must each be *more* contrasted than rest — never less. |
| **Browser UI matches page** | `<meta name="theme-color" content="…">` per color scheme so the mobile browser chrome matches the surface. |

## 2. Rendering artifacts

- **Text anti-aliasing:** scaling text changes glyph smoothing mid-animation. Animate a *wrapper*, not the text node. If artifacts persist add `translateZ(0)` or `will-change: transform` — and remove it when the animation ends.
- **Gradient banding:** fading to dark with a CSS gradient/mask bands on 8-bit displays. Use a background image (or dithered PNG/SVG noise) for long dark fades.
- **Native `<select>`:** set explicit `background-color` and `color` or Windows dark mode renders unreadable options.

## 3. Copywriting (new category)

Voice and grammar:
- **Active voice** — "Install the CLI", not "The CLI will be installed".
- **Action-oriented** — "Install the CLI…", not "You will need the CLI…".
- **Second person**, never first — "your project", never "my projects" or "we".
- **Clear and concise** — as few words as carry the meaning.
- **Consistent nouns** — if it's a "project" in the nav it is not a "workspace" in the modal.
- **Case:** Title Case (Chicago) for marketing headings and buttons; sentence case everywhere else.
- **`&` over "and"** in space-constrained labels.

Numbers and units:
- **Numerals for counts** — "8 deployments", not "eight deployments".
- **Number + unit gets a non-breaking space** — `10&nbsp;MB`, `⌘&nbsp;K`.
- **Currency:** 0 or 2 decimal places consistently within a context — never mix `$12` and `$12.00` in one table.
- **Placeholders:** strings `YOUR_API_TOKEN_HERE`, numbers `0123456789` — consistent and obviously fake.

Errors and labels:
- **Positive framing** — "Something went wrong — try again", not "Your deployment failed".
- **Errors guide the exit** — state the fix or next step, not just the problem.
- **Labels are specific** — "Save API Key", not "Continue". A button label should make sense read aloud with no surrounding context.

## 4. Typography details

`…` not `...` · curly quotes `“ ” ’` not straight `" '` · loading copy ends with an ellipsis (`Loading…`, `Saving…`) · non-breaking spaces inside brand names and shortcuts.

## 5. Forms (additions)

- `autocomplete="off"` on non-auth fields so password managers don't fire on unrelated inputs.
- Warn before navigating away with unsaved changes (`beforeunload` or a router guard).
- Placeholders end with `…` and show an example pattern (`name@company.com…`), never restate the label.
- Never block paste (`onPaste` + `preventDefault`) — it breaks password managers and 2FA codes.
- Submit stays enabled until the request starts; spinner *inside* the button during the request.
- Focus the first invalid field on submit.

## 6. Images

- `<img>` needs explicit `width` and `height` (or `fill`) — prevents CLS.
- Below the fold: `loading="lazy"`. Above the fold and critical: `priority` / `fetchpriority="high"`.

## 7. Animation (additions)

- **Never `transition: all`** — list properties explicitly; `all` animates unknown future properties and forces needless style recalculation.
- Set an intentional `transform-origin`.
- SVG: put transforms on a `<g>` wrapper with `transform-box: fill-box; transform-origin: center`.
- Animations must be **interruptible** — a mid-flight animation responds to new input rather than finishing first.

## 8. Contrast: APCA

WCAG 2 contrast ratios under-predict readability for light text on dark backgrounds and over-predict for mid-tones. Where tooling supports it, prefer **APCA** (Lc) perceptual contrast: body text ≥ Lc 75, large text ≥ Lc 60, non-text UI ≥ Lc 45. **WCAG 2.2 AA remains the shipping gate** for this skill (it is what audits and law reference); treat APCA as the tiebreaker when a color passes 4.5:1 but still reads poorly.

## Anti-patterns to flag

`user-scalable=no` / `maximum-scale=1` · `onPaste` + `preventDefault` · `transition: all` · `outline: none` without a `:focus-visible` replacement · `<div onClick>` instead of `<button>` · images without dimensions · hardcoded date/number formats · `autoFocus` without justification (desktop, single primary input, never mobile).
