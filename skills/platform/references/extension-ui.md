# Extension UI Reference (VS Code Webviews + Browser Extension Popups)

Source: code.visualstudio.com/api (UX Guidelines, Webview API, Webview UI
Toolkit), developer.chrome.com/docs/extensions (Manifest V3, user interface).
Read 2026-08-24. No code copied; principles restated for this pack's stack.

Load this when the target is an extension surface, not a normal web page: a
VS Code webview panel or sidebar view, or a browser (Chrome/Edge/Firefox MV3)
popup, side panel, or options page. These share three constraints nothing else
in this pack assumes:

1. **The theme is not yours.** The host (the editor, the browser chrome)
   already has a light/dark/high-contrast choice the user made once; the
   extension renders inside it and must follow, not offer its own toggle.
2. **The viewport is fixed and small**, and you don't control its size.
3. **The CSP forbids patterns this pack otherwise treats as normal** — no
   remote script/style, no `eval`, and (MV3 default) no runtime-injected
   `<style>` tags, which rules out any CSS-in-JS library that works by
   inserting `<style>` at runtime rather than shipping compiled CSS.

## VS Code webviews

- **Theme via CSS custom properties, not hardcoded color.** VS Code adds a
  class to `<body>` — `vscode-light`, `vscode-dark`, or
  `vscode-high-contrast` — and exposes the active theme's colors as
  `--vscode-*` CSS variables (`--vscode-editor-background`,
  `--vscode-foreground`, `--vscode-button-background`, etc). Style every
  surface from these variables. A component with a literal `#fff` background
  is correct in exactly one of the three states and broken in the other two —
  the same class of bug `core/design-tokens.md`'s OKLCH-only rule exists to
  prevent, applied to a palette you don't own.
- **Webview UI Toolkit** (`@vscode/webview-ui-toolkit`) ships the same
  controls — button, dropdown, text field, checkbox, progress ring, data grid
  — pre-wired to the variables above, as web components usable from any
  framework. Reach for it before hand-rolling a control that has to track
  three themes itself.
- **Host communication is `postMessage`, not a fetch.** A webview has no
  direct access to the extension's Node-side state; call
  `acquireVsCodeApi()` once, keep the returned object (calling it twice
  throws), and pass data both directions as serializable messages
  (`vscode.postMessage({...})` out, a `window.addEventListener('message', ...)`
  handler in). Persist UI state the user would expect to survive a panel
  being hidden/reopened via `vscode.setState()` — a webview is torn down and
  rebuilt more aggressively than a browser tab.
- **CSP is nonce-based, not "unsafe-inline".** Every `<script>` needs a
  per-load nonce matching the panel's `Content-Security-Policy` meta tag;
  there is no blanket allow. Inline `onclick=` handlers don't work here —
  attach listeners in the nonce'd script instead.
- **Accessibility still applies in full** — contrast, ARIA, full keyboard
  operation (`core/accessibility-baseline.md` is unchanged by being inside a
  webview) — but a webview is explicitly *not* guaranteed to look or behave
  like the rest of the editor chrome; that consistency is the extension
  author's job, not something the host provides for free.

## Browser extension popups (Manifest V3)

- **Design for ~400px wide**, taller content scrolls. This is a practical
  ceiling Chrome/Edge popups render at, not a CSS breakpoint you set — treat
  it like the fixed frame it is rather than adding a responsive breakpoint
  that will never fire.
- **Default CSP forbids remote code and `eval`**, and forbids
  runtime-injected `<style>` — a styled-components/emotion setup that injects
  `<style>` tags at render time silently fails or needs a relaxed CSP most
  reviewers will reject. Prefer a kit that compiles to static CSS ahead of
  time (Tailwind, or a component library that ships compiled CSS) over one
  that generates styles in the browser.
- **Popup vs. side panel vs. content script are different surfaces with
  different rules**, not three names for the same UI: a popup is transient
  (closes on outside click, loses all local state) and best for a quick
  action; a side panel persists across navigation and suits anything with
  state worth keeping open; a content script renders into the host page's own
  DOM and inherits its cascade — expect the host page's CSS to fight yours
  and scope selectors defensively.
- **Options page owns persisted settings**, not the popup — use
  `chrome.storage.sync` (or `.local` for anything too large or too sensitive
  to sync) rather than component state, since the popup instance is
  recreated from scratch every time it opens.
- **Keyboard and focus discipline is not optional here**: full tab-order
  navigation, a visible focus ring on every interactive element, and no
  focus traps — a popup a keyboard user can't drive past its first control is
  a common, easy-to-miss failure since it's so rarely tested at all outside
  screen-reader users.

## What doesn't change

Four states, `prefers-reduced-motion`, OKLCH tokens for anything you *do*
control (badges, custom icons, non-themed decoration), 44px touch targets on
any surface that might render on a touchscreen laptop — the baseline in
`core/accessibility-baseline.md` and `core/design-tokens.md` still applies.
What's different here is narrower than it looks: where the color and chrome
come from, how big the canvas is, and which script/style mechanisms the host
will actually let you run.
