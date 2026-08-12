# Desktop patterns — the rules that invert when the pointer is precise

Source: `AThevon/genjutsu` (MIT), reconciled against Apple HIG (macOS), Microsoft
Fluent 2 and the GNOME HIG. No code copied; principles restated for the web.

Load this when the target is a desktop-class surface: an Electron or Tauri app, a
`@media (pointer: fine)` branch that matters, an internal tool nobody opens on a
phone, or any brief naming keyboard shortcuts, multiple windows, or dense tables.

**Do not load it for responsive web.** `references/mobile-patterns.md` plus
`core/accessibility-baseline.md` are the whole answer there. Most of this pack is
written mobile-first and touch-first, and that default is correct — this file is
the exception list, not a replacement.

## Three of our own rules read differently here

This is the reason the file exists. A desktop brief does not relax the pack; it
changes which end of a range is right.

| Our default | On desktop | Why |
|---|---|---|
| Targets ≥44×44px | **24×24px is the AA floor** | 44 is WCAG **2.5.5** (AAA). **2.5.8** (AA) requires 24×24 CSS px, or smaller with 24px of clear spacing. A pointer is not a thumb |
| 4pt scale, no exceptions | Step by **8**, not 4 | The scale is unchanged — `4·8·12·16·24·32·48·64·96`. Density is a choice of step within it, not a new scale |
| Hover is an enhancement | **Hover is the primary affordance** | The inverse of touch. A pointer resting on a control with no feedback reads as broken |

Keep 44×44 wherever a surface can be touched — laptops have touchscreens and
`pointer: fine` is not a promise. Drop to the 24px floor only for pointer-only
chrome: toolbar rows, table row actions, window controls. State which you chose
and why, because both are defensible and silence looks like an accident.

## Hover carries the affordance

Every clickable surface needs a distinct hover state, and the transition wants to
sit around 100–200ms — fast enough to feel attached to the pointer, slow enough
to perceive.

```css
.toolbar-button {
  background: var(--color-surface);
  transition: background-color 120ms ease-out, translate 120ms ease-out;
}
.toolbar-button:hover  { background: var(--color-surface-raised); translate: 0 -1px; }
.toolbar-button:active { translate: 0 0; }
```

Two rules that keep it honest. **Hover is never the only route to the
information** — anything reachable only by hovering is unreachable by keyboard
and by touch, so pair it with focus and with a persistent affordance. And
**animate the property, not `all`**: `transition-all` on a hovered row costs
layout on every pointer move, which is the one place a desktop user notices jank.

## Fitts's Law has a desktop corollary

`design-principles/references/laws-of-ux.md` already states the law and that
screen edges are effectively infinite targets. The desktop consequence it does
not draw: **edges and corners are zero-overshoot acquisition**, because the
cursor stops there no matter how hard it is thrown. That is why the macOS menu
bar and the Windows taskbar are edge-anchored, and it is a reason to put
high-frequency global controls against an edge rather than floating them 40px
inside one.

The same law is why a magnetic or cursor-following effect on a *button* is a
defect rather than delight: it moves the target out from under a pointer already
travelling toward it.

## Keyboard shortcuts are table stakes

Missing `⌘F` in a list-heavy app is not restraint, it is a missing feature.
Match the platform rather than inventing:

| Action | macOS | Windows / Linux |
|---|---|---|
| New | `⌘N` | `Ctrl+N` |
| Save | `⌘S` | `Ctrl+S` |
| Find | `⌘F` | `Ctrl+F` |
| Close window | `⌘W` | `Ctrl+W` |
| Quit | `⌘Q` | `Alt+F4` |
| Preferences | `⌘,` | `Ctrl+,` |
| Command palette | `⌘K` | `Ctrl+K` |

The modifier differs per platform and must be resolved at runtime, not assumed:

```ts
// `navigator.platform` is deprecated; userAgentData is not universal yet.
const isApple = typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);

export function isCommandModifier(e: KeyboardEvent): boolean {
  return isApple ? e.metaKey : e.ctrlKey;
}
```

Three obligations that travel with any shortcut: it is **discoverable** (printed
in the menu item and the tooltip that names the action), it **does not fire while
a text field has focus** unless it is a text command, and it is **listed
somewhere a user can read** — a `?` overlay or a settings page. An undiscoverable
shortcut helps only the person who wrote it.

## Multiple windows

A second window is right when the user needs both contexts at once: comparing two
documents, watching a long export while working, or a document-based app where
each document is a peer. It is wrong for confirmations, brief settings and
anything a popover or sheet holds — a window the user must dismiss to continue is
a modal with extra chrome.

**Windows are views over one model, never copies of it.** Duplicating state per
window means reconciling divergent copies, which is the bug that eats the feature.
Hold the source of truth once and let each window subscribe.

## Density, and the fatigue that limits motion

Desktop users sit at a large display with a precise pointer and a full keyboard,
and they can parse more per viewport than a phone allows. That buys persistent
sidebars instead of bottom tabs, a command palette for repeat actions, and real
data tables where the data warrants one. It does not buy crowding: density is
earned by information, not by shrinking padding.

The constraint the mobile-first parts of this pack never state: **a desktop app is
stared at for hours, so motion is judged on its hundredth repetition, not its
first.** A 600ms springy hover is charming in a demo and exhausting by lunchtime.
Routine interaction motion belongs under 200ms, on opacity and small translations,
with no overshoot. Save expressive motion for one-shot moments — first run, a
completed import — where it happens once.

```css
/* Bad — every hover overshoots for 600ms. Never on a repeated interaction. */
.card { transition: scale 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.card:hover { scale: 1.05; }
```

```css
/* Good — near-subliminal, survives the hundredth repeat */
.card { opacity: 0.92; transition: opacity 100ms ease-out; }
.card:hover { opacity: 1; }
```

This does not weaken `prefers-reduced-motion`; it narrows what ships before the
query is even consulted.

## Anti-patterns

**A hamburger at 1440px.** Collapsing navigation the viewport has room for trades
a free affordance for a click. Persistent sidebar, collapsible if the user asks.

**Primary actions with no shortcut.** If creating a thing takes three clicks and
no key, the app is slower than the tool it replaced.

**`outline: none` with nothing behind it.** Constraint `A11Y-06` fails this, and
it is worth restating here because desktop is where keyboard navigation is the
main input. `:focus-visible` keeps the ring off mouse clicks and on for keyboard —
that is the whole point of the pseudo-class.

**Touch idioms transplanted whole.** Pull-to-refresh, swipe-to-delete and bottom
sheets have no pointer equivalent. A refresh button, a row action and a dialog do.
