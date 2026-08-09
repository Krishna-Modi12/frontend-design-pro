# Dark / Light / Auto Architecture

Three states, one class, no flash. Most of the difficulty here is not colour —
it is server rendering and storage.

## Three states, not a boolean

```ts
export type ThemeChoice = "light" | "dark" | "auto";
```

Persisting a resolved `isDark: true` throws away the user's actual intent. Someone
who chose "follow my system" gets silently pinned to whatever the system was the
first time they visited, and never tracks it again. Store the choice; resolve it
at render.

```ts
function resolve(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "auto") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
```

Subscribe to that query while the choice is `auto`. The system theme flips on a
schedule for many people, and a page open across the boundary should follow.

## Tokens as custom properties

```css
:root {
  color-scheme: light;
  --color-surface: oklch(98.5% 0.002 248);
  --color-elevated: oklch(100% 0 0);
  --color-border: oklch(91% 0.004 248);
  --color-text: oklch(18.8% 0.013 248);
  --color-accent: oklch(58% 0.19 248);
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --color-surface: oklch(17.4% 0.012 248);
  --color-elevated: oklch(20.1% 0.014 248);
  --color-border: oklch(26.8% 0.014 248);
  --color-text: oklch(96.2% 0.005 248);
  --color-accent: oklch(72.4% 0.14 248);
}
```

One attribute on `<html>` swaps every token at once — no re-render, no prop
drilling, and it works for CSS that React never sees.

**`color-scheme` is not decorative.** It is what tells the browser to render form
controls, scrollbars, and the canvas behind your page in the matching scheme.
Without it you get a dark page with light native scrollbars and a white flash
between navigations.

## Never transition the theme switch

```css
/* Wrong. */
:root { transition: background-color 300ms, color 300ms; }
```

Every element resolving its colour on its own schedule reads as a rendering
fault. Worse, transitions on inherited properties cascade unevenly, so text
arrives before its background and is briefly invisible.

Suppress transitions for the duration of the switch instead:

```ts
function setTheme(next: ThemeChoice) {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  root.setAttribute("data-theme", resolve(next));
  // Two frames: one for the attribute, one for the style recalc it triggers.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-theme-switching"))
  );
}
```

```css
[data-theme-switching] * { transition: none !important; }
```

`View Transitions` can animate the swap properly if you want one — a circular
wipe from the toggle is the idiom — but the default should be instant, and it
must respect `prefers-reduced-motion`.

## The flash of wrong theme

The failure everyone ships at least once: the server renders light, the client
reads `localStorage`, and the page flashes. React cannot fix this, because the
flash happens before hydration.

The only reliable fix is a blocking inline script in `<head>`, before any
stylesheet:

```html
<script>
  (function () {
    try {
      var c = localStorage.getItem("theme") || "auto";
      var d = c === "dark" || (c === "auto" &&
        matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.setAttribute("data-theme", d ? "dark" : "light");
      document.documentElement.style.colorScheme = d ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

Three details, each load-bearing:

- **Blocking, inline, and first.** `defer` or `async` runs after first paint,
  which is the flash you were preventing. In Next.js App Router this is a
  `<script dangerouslySetInnerHTML>` in the root layout.
- **`try/catch`.** `localStorage` throws in Safari private mode and under some
  cookie-blocking configurations. Unhandled, it takes out the theme *and*
  everything after it in the script.
- **Set `colorScheme` too**, so native UI matches from the first frame.

Because the server cannot know the theme, anything server-rendered must be
theme-agnostic. A toggle that renders "🌙" or "☀️" from state will mismatch during
hydration — render both and let CSS show one, or render the control only after
mount.

## Storage

```ts
const KEY = "theme";

export function loadChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" || v === "auto" ? v : "auto";
  } catch {
    return "auto";
  }
}
```

Validate on read. `localStorage` is user-writable and survives deploys, so a value
your code stopped supporting three versions ago is still out there.

Default to `auto`, not to `light`. The system preference is a real signal the user
already expressed.

## The toggle itself

A three-way choice is a radio group, not a checkbox — a two-state toggle cannot
express "auto" at all.

```tsx
<fieldset>
  <legend className="sr-only">Colour theme</legend>
  {(["light", "dark", "auto"] as const).map((option) => (
    <label key={option} className="inline-flex h-11 items-center gap-2 px-3">
      <input
        type="radio"
        name="theme"
        value={option}
        checked={choice === option}
        onChange={() => setTheme(option)}
      />
      <span className="capitalize">{option}</span>
    </label>
  ))}
</fieldset>
```

If you must use buttons, `aria-pressed` on each, and the group needs an
accessible name. Icon-only controls need `aria-label` — a moon glyph alone is not
a name, and "🌙" is announced as "crescent moon" by some screen readers.

44px minimum on every target. A theme control is small, frequently at the edge of
a header, and often the first thing a motor-impaired user reaches for.
