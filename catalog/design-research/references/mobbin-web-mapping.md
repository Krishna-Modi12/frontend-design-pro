# Mobbin → Web Interaction Mapping

## Philosophy

Mobbin documents shipped native iOS and Android apps. Their value is that the patterns are *proven under real usage* — someone measured the conversion on that onboarding flow. Their liability is that the affordances they rest on (gestures, haptics, system chrome, guaranteed touch input) are not the web's affordances.

The job is to extract the **interaction model** — what the user is trying to do and how the app makes that legible — and then rebuild it with web primitives. A faithful port of an iOS pattern to a browser produces something that feels like a website pretending to be an app, which is a worse experience than either.

## Pattern Mapping

| Native pattern | Web equivalent | Implementation notes |
|---|---|---|
| Bottom tab bar | Bottom nav on small screens, top nav on desktop | `md:hidden` / `hidden md:flex`; real `<nav>` with `aria-current` |
| Pull-to-refresh | Explicit refresh control plus revalidation on focus | No native pull gesture; do not hijack overscroll to fake one |
| Swipeable card stack | Drag carousel with scroll-snap | CSS `scroll-snap-type: x mandatory` first; a JS carousel only if snap cannot do it. Keyboard arrows must work |
| Bottom sheet | Dialog or drawer | Native `<dialog>` or a drawer primitive; focus trap, `Esc` to close, restore focus on exit |
| Long-press context menu | Right-click plus a visible trigger button | Long-press alone is undiscoverable on desktop and invisible to keyboard |
| Segmented control | Radio group styled as a toggle bar | Real radios, roving tabindex, not buttons with a selected class |
| Haptic feedback | Visual acknowledgement | `transform: scale(0.98)` on `:active`; the point is confirmation, and pixels can confirm |
| Swipe-to-delete | Visible delete affordance plus undo | Destructive actions need a visible control and a reversal path |
| Floating action button | Contextual primary action in the flow | The FAB solves a thumb-reach problem the desktop does not have |
| Picker wheels | `<input type="date">` or an accessible listbox | Never rebuild a spinning wheel with divs |
| Face ID / Touch ID | WebAuthn | Out of scope for a UI skill; note it and move on |
| Push notification | Web Push | Out of scope for a UI skill |
| Native share sheet | Web Share API with a custom fallback | `navigator.share` is not universally available; the fallback is the real implementation |

## Density Translation

- Native captures are at device resolution. CSS pixels are not device pixels — do not read dimensions off a screenshot and use them directly.
- The 44pt touch target is a real constraint and it carries over: `min-height: 44px; min-width: 44px` on anything tappable.
- Native apps can be denser than the web because the user is closer to the screen and the app owns the whole viewport. Loosen density when scaling a mobile pattern to desktop rather than stretching it.
- Safe-area insets (`env(safe-area-inset-*)`) matter only for installed PWAs. In a browser tab they are noise.

## Scroll Behaviour

| Native | Web |
|---|---|
| Momentum scroll inside a panel | `overscroll-behavior: contain` on the scroll container |
| Elastic bounce at the page edge | `overscroll-behavior-y: none` on the body if it interferes; otherwise leave the platform alone |
| Snapping list | `scroll-snap-type: y mandatory` with `scroll-snap-align` on children |
| Sticky section headers | `position: sticky; top: 0` — genuinely equivalent, one of the clean ports |
| Parallax hero | Scroll-linked transform, gated behind `prefers-reduced-motion` |

Resist reimplementing native scroll physics in JavaScript. Browser scrolling is on the compositor; a JS reimplementation is not, and it will drop frames on exactly the low-end devices the pattern was supposed to help.

## Do Not Port

- **System back-swipe** — the browser owns navigation history. Intercepting it breaks the back button, which is the single most used control on the web.
- **App-store review prompts** — no equivalent, no reason.
- **Splash screens** — a native splash covers app launch. A web splash covers nothing and delays LCP.
- **Tutorial coach-mark overlays** — heavy, usually skipped, and an accessibility problem. If the interface needs a tour, the interface needs work.
- **Tab bars with more than five items** — the constraint exists because of thumb reach; on desktop it just becomes a bad top nav.

## Checklist Before Using a Mobbin Pattern

- [ ] Named the user goal the pattern serves, not just the visual
- [ ] Identified the web primitive that serves that goal
- [ ] Keyboard path exists and is not an afterthought
- [ ] Pointer-only affordances have a visible alternative
- [ ] Desktop layout is designed, not stretched
- [ ] Nothing depends on a gesture the browser does not deliver
