# Radix Primitives

`references/shadcn.md` covers the *styled* layer. This file covers what is
underneath it, because shadcn/ui has been a thin wrapper over Radix for most of
its life and every hard question — why the exit animation does not play, why
focus jumps, why the dropdown is clipped, why the dialog fails an audit — is a
Radix question wearing a shadcn class list.

**That is no longer the only underneath.** As of shadcn/ui's July 2026 update,
`shadcn init` defaults new projects to Base UI over Radix — the project's own
numbers say new `shadcn/create` projects now pick Base UI roughly 2:1. Radix is
**not deprecated** and every update still ships for both; `shadcn init -b radix`
keeps the old default. This file, `references/shadcn.md`, and this pack's own
gold examples are all written against Radix — a legitimate, still fully
supported and still current choice, not a stale one. But if you land in a
project that already ran `shadcn init` after July 2026 without that flag, it is
on Base UI, and forcing Radix's contract onto it produces confidently wrong
code. The one prop rename that matters most: Radix's `asChild` is Base UI's
`render`. See "`asChild` and the Slot contract" below for what Radix's version
actually guarantees; Base UI's own docs (`base-ui.com`) are the source for its
version of the same contract — this file does not carry both.

Radix ships behaviour and accessibility with no styling at all. That is the whole
product: it implements the WAI-ARIA pattern, keyboard model, focus management and
dismissal for a primitive, and hands you unstyled DOM plus a set of data
attributes to style against.

## Contents

- [Which package to install](#which-package-to-install)
- [Anatomy, and why `Portal` is its own part](#anatomy-and-why-portal-is-its-own-part)
- [`data-state` is the styling contract](#data-state-is-the-styling-contract)
- [Exit animations, and `forceMount`](#exit-animations-and-forcemount)
- [Controlled and uncontrolled](#controlled-and-uncontrolled)
- [`asChild` and the Slot contract](#aschild-and-the-slot-contract)
- [Focus and dismissal](#focus-and-dismissal)
- [Keyboard behaviour you would otherwise have to build](#keyboard-behaviour-you-would-otherwise-have-to-build)
- [Labelling, per primitive](#labelling-per-primitive)
- [Known rough edges](#known-rough-edges)
- [What Radix does not do](#what-radix-does-not-do)
- [Sources](#sources)

---

## Which package to install

Radix now publishes a single package that re-exports the whole set, alongside the
individual packages it has always published:

```ts
// Preferred for new code — one dependency, one version to track
import { Dialog, DropdownMenu, Tooltip } from "radix-ui"

// Still published and supported, versioned per primitive
import * as Dialog from "@radix-ui/react-dialog"
```

At the time of writing `radix-ui` is at **1.6.7**. It depends on 55 packages but
re-exports **35** namespaces — that is the surface you can actually import. The
other 20 are internal plumbing it uses to build the 35 (`react-popper`,
`react-presence`, `react-focus-scope`, `react-dismissable-layer`,
`react-roving-focus`, `react-collection`, `react-menu`, and the `use-*` hooks).
Counting the dependencies as primitives overstates what `import { X } from
"radix-ui"` gives you by twenty.

That distinction decides which package you install. **`radix-ui` is the right
default only if you are consuming finished primitives.** If you are building your
own on Radix's internals, the unified package cannot supply them at any price —
`import { FocusScope } from "radix-ui"` does not exist — and you install the
internal packages individually. They are published and not marked private, so
this is supported, just not through the meta-package.

The individual packages move on their own versions (`react-dialog` 1.1.23,
`react-select` 2.3.7, `react-tooltip` 1.2.16). Both routes are current — the
individual packages are **not deprecated**, so do not rewrite a working codebase
to chase the unified one. Prefer `radix-ui` for new consumer-facing work because
it ends the class of bug where two primitives resolve different copies of a
shared internal package.

React 19 is supported; the peer range is `^16.8 || ^17 || ^18 || ^19`.

## Anatomy, and why `Portal` is its own part

Primitives are compound by design. A typical overlay:

```tsx
<Dialog.Root>            {/* owns state, provides context */}
  <Dialog.Trigger />     {/* toggles it, wires aria-expanded/aria-controls */}
  <Dialog.Portal>        {/* moves the subtree to document.body */}
    <Dialog.Overlay />
    <Dialog.Content>     {/* focus scope + dismissal live here */}
      <Dialog.Title />
      <Dialog.Description />
      <Dialog.Close />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

`Portal` is a separate part rather than built into `Content` because portalling is
a trade-off you have to make, not a default. Rendering in place means any ancestor
with `overflow: hidden`, `transform`, `filter` or `contain` clips your popover —
the single most common "my dropdown is cut off" cause. Portalling to `body`
escapes that but leaves the CSS cascade of the original position, so
theme-scoped custom properties defined on a wrapper no longer reach the content.

The fix when portalling breaks your theme is to put the theme class on the portal
container, not to abandon the portal:

```tsx
<Dialog.Portal container={themeRoot}>
```

## `data-state` is the styling contract

This is the part people miss, and it is the reason Radix needs no styling API. The
primitives write their state onto the DOM as data attributes, so styling is CSS —
no `useState`, no render props, no class toggling. `data-state` appears in the
source **97** times, far more than any other hook.

```tsx
<Accordion.Content
  className="overflow-hidden data-[state=open]:animate-slide-down
             data-[state=closed]:animate-slide-up"
/>
```

The values you will style against most:

| Attribute | Values | On |
|---|---|---|
| `data-state` | `open` / `closed` | Dialog, Popover, DropdownMenu, Collapsible, Accordion item, HoverCard |
| `data-state` | `checked` / `unchecked` / `indeterminate` | Checkbox, Switch, RadioGroup item, Select item |
| `data-state` | `active` / `inactive` | Tabs trigger and content |
| `data-state` | `on` / `off` | Toggle, ToggleGroup item |
| `data-state` | `delayed-open` / `instant-open` / `closed` | Tooltip content — lets you skip the animation on a re-hover |
| `data-side` | `top` / `right` / `bottom` / `left` | Any popper content, after collision flipping |
| `data-align` | `start` / `center` / `end` | Any popper content |
| `data-orientation` | `horizontal` / `vertical` | Tabs, Slider, Separator, Toolbar, RadioGroup |
| `data-highlighted` | present / absent | Menu and Select items — keyboard *or* pointer focus |
| `data-disabled` | present / absent | Any disabled part |
| `data-placeholder` | present / absent | `Select.Value` with nothing chosen |

Two habits that follow from this:

- **Style the transform origin from `data-side`.** A popover that always scales
  from the top looks wrong the moment collision detection flips it to `bottom`.
  `data-[side=bottom]:origin-top data-[side=top]:origin-bottom` and it is right in
  every position.
- **Use `data-highlighted`, not `:hover` or `:focus`, for menu items.** Radix
  drives selection with a single highlight concept covering pointer and keyboard.
  Styling `:hover` separately produces two visibly different "current item" states
  and a menu where the keyboard and mouse disagree.

When you are unsure what a primitive exposes, open it and read the attributes in
devtools. That is faster than the docs and it is the ground truth.

## Exit animations, and `forceMount`

An exit animation needs the element to still be in the DOM while it plays, but
`Content` unmounts as soon as state flips to closed. Radix solves this internally
with its `Presence` component: it holds the node mounted, sets
`data-state="closed"`, and waits for the CSS animation to finish.

So exit animations work **if you use CSS animations** (`@keyframes`), because
Radix can hear `animationend`:

```css
@keyframes fade-out { from { opacity: 1 } to { opacity: 0 } }
.content[data-state="closed"] { animation: fade-out 150ms ease-in; }
```

A CSS *transition* on `[data-state=closed]` will not reliably play, because the
element can unmount before the transition is observed. If you want spring physics
or an interruptible exit, hand the mounting to a motion library instead:
`forceMount` keeps the part rendered permanently and you control visibility
yourself.

```tsx
<Dialog.Portal forceMount>
  <AnimatePresence>{open ? <motion.div … /> : null}</AnimatePresence>
</Dialog.Portal>
```

`forceMount` means *you* now own removing it from the accessibility tree. A
force-mounted closed dialog that is still focusable is a keyboard trap, so pair it
with your own conditional render as above rather than only hiding it visually.

## Controlled and uncontrolled

The naming rule is consistent across every primitive, which is why it is worth
learning once:

| Uncontrolled | Controlled | Change handler |
|---|---|---|
| `defaultOpen` | `open` | `onOpenChange` |
| `defaultValue` | `value` | `onValueChange` |
| `defaultChecked` | `checked` | `onCheckedChange` |
| `defaultPressed` | `pressed` | `onPressedChange` |

Passing both the controlled and default prop is the bug: the default is ignored
and the component is controlled, so if your state starts `undefined` the primitive
reads as closed and never opens. Pick one per instance.

## `asChild` and the Slot contract

`asChild` makes a part render *as* its child instead of emitting its own element,
merging the part's props and ref onto that child. It is how you keep semantics
while using your own component:

```tsx
<Dialog.Trigger asChild>
  <Button variant="primary">Open</Button>
</Dialog.Trigger>
```

Without `asChild` you get a `<button>` wrapping your `<Button>` — nested buttons,
which is invalid HTML and breaks the keyboard model.

The contract, verified against the Slot source:

- **Exactly one child, and it must be a valid element.** Two children, or a bare
  string or number, throws — *"failed to slot onto its children. Expected a
  single React element child or `Slottable`."* Older versions failed with a
  cryptic `React.Children.only` message; current versions throw a clearer error.
- **A fragment is the exception, and it fails silently instead.**
  `React.isValidElement()` returns `true` for `<>…</>`, so Slot accepts it as the
  single child and never reaches the throw. It then *deliberately* skips the ref:
  `if (slottableElement.type !== React.Fragment)` guards the assignment, for React
  19 compatibility. Nothing crashes and Radix emits no warning — you get a
  dev-only invalid-prop complaint from React itself, if anything. The primitive is
  left unable to measure or focus its trigger, which is the same end state as the
  ref failure below reached with no error to search for. Check for a stray
  fragment first when a popover lands at the origin.
- **The child must accept a ref.** A function component that neither forwards ref
  (React 18) nor takes `ref` as a prop (React 19) silently loses the ref, and the
  primitive then cannot measure or focus it — which shows up as a popover
  positioned at the origin.
- **Event handlers compose; Radix's runs first.** Your child's `onClick` still
  fires. If you `preventDefault()` in the child, you suppress Radix's behaviour —
  occasionally what you want, usually the cause of "the trigger does nothing".
- **`className` does not merge itself.** Slot passes the part's props through, so
  reconcile classes with `cn()` in your own component as `core/component-api.md`
  requires.

## Focus and dismissal

`Content` composes two internal primitives, and both are configurable:

**FocusScope** traps Tab inside while open and restores focus to the trigger on
close. Override the automatic behaviour with the two escape hatches:

```tsx
<Dialog.Content
  onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus() }}
  onCloseAutoFocus={(e) => e.preventDefault()}   /* only if you refocus yourself */
/>
```

Preventing `onCloseAutoFocus` without moving focus somewhere deliberate drops
focus to `<body>`, which strands keyboard users mid-page. That is a regression an
axe scan will not catch, because at rest the DOM is valid.

**DismissableLayer** handles Escape and outside pointer-down, and maintains a
stack so nested layers dismiss in order — a tooltip inside a popover inside a
dialog closes one level per Escape. To keep a layer open during an interaction
outside it, intercept rather than disable:

```tsx
onInteractOutside={(e) => { if (isInsideMyThing(e.target)) e.preventDefault() }}
```

## Keyboard behaviour you would otherwise have to build

`RovingFocusGroup` underlies Tabs, Toolbar, RadioGroup and the menus: the group is
**one** tab stop and arrow keys move within it. This is the correct pattern and it
is what makes a ten-tab bar take one Tab press instead of ten. It also means
putting `tabIndex={0}` on individual items breaks the model.

Menus and Select additionally implement typeahead — typing jumps to a matching
item — plus `Home`/`End`, wrap-around, and pointer/keyboard highlight unification.
Selects also handle the native mobile divergence. This is the strongest argument
for using the primitive rather than a `<div>` with click handlers.

## Labelling, per primitive

Radix wires `aria-*` between parts automatically, but only for parts you actually
render. Verified in the Dialog source: `aria-labelledby={context.titlePresent ?
context.titleId : undefined}`, where `titlePresent` is true only once a
`Dialog.Title` has actually mounted. **A dialog with no `Title` gets no
`aria-labelledby` at all** — it opens as an unnamed dialog.

This rule used to police itself and no longer does. Radix shipped a dev-only
console warning for a missing `Title` or `Description` and **removed it in
`react-dialog` 1.1.17**; the leftover `WarningProvider` in the source is now
marked `@deprecated Noop component to avoid breaking changes`. So there is
currently no signal of any kind: no warning, no thrown error, no `aria-labelledby`.
The only thing that catches it is your own axe run or a human opening the dialog
with a screen reader. Treat the rule as more load-bearing than it reads, not
less — the safety net that made it forgiving is gone.

- **Dialog / AlertDialog** need a `Title`. Always render one; if the design has no
  visible heading, wrap it: `<VisuallyHidden><Dialog.Title>…</Dialog.Title></VisuallyHidden>`.
  `Description` is optional but sets `aria-describedby` when present.
- **Icon-only Trigger, Close, ToggleGroup item** need an accessible name you
  supply — an `aria-label` or visually-hidden text. Radix cannot invent one.
- **Slider** needs `aria-label` per thumb on a multi-thumb range.
- **Separator** takes `decorative` — set it when the rule is purely visual, so it
  is not announced.

## Known rough edges

- **Scroll lock shifts the layout.** Removing the scrollbar widens the page by its
  width. Radix compensates on the body; your own `position: fixed` header needs the
  same treatment or it jumps on every dialog open. `scrollbar-gutter: stable` on
  `html` avoids the whole class.
- **Stacking contexts beat z-index.** A portalled layer under an ancestor that
  creates a stacking context cannot be raised by a bigger `z-index`. Find the
  ancestor rather than escalating the number.
- **Pointer events after close.** A layer mid-exit-animation can still swallow one
  click. Set `pointer-events: none` on the closing state.
- **Hydration.** Content is client-only; ids are generated. Do not assert on
  generated ids in tests — query by role and name.
- **A stub is not the component.** If you mock a primitive in tests, the stub owns
  the roles it claims: `role="dialog"` without a resolvable `aria-labelledby` is an
  axe violation the real primitive does not have. `test/stubs/README.md` records
  this having failed a gold for a defect that existed only in the stub.

## What Radix does not do

No styling, no theme, no layout, no data fetching, no form validation. It also
does not include a date picker, a rich text editor, a combobox with async loading,
or a table. Reach for the primitive when the hard part is keyboard and focus
semantics; reach for something else when the hard part is data.

Newer additions worth knowing exist: `one-time-password-field` and
`password-toggle-field` cover two patterns commonly hand-rolled badly.

## Sources

Package versions, the peer-dependency range, the 55-dependency / 35-namespace
split, the relative frequency of each data attribute, the Slot single-child
throw, the Fragment ref-drop and the Dialog labelling behaviour were all read
from `radix-ui/primitives` at the time of writing (MIT, © WorkOS). Attribute
value tables should be confirmed in devtools for the version you have installed.

Two claims in the Slot and Dialog sections were **wrong in earlier revisions of
this file and are corrected here**, both found by re-reading the source rather
than by anything failing. This file said a fragment child throws; it does not,
it is accepted and its ref is silently skipped (`slot.tsx`, the
`slottableElement.type !== React.Fragment` guard). And the Dialog section
described the missing-`Title` rule without noting that Radix's dev-only warning
for it was **removed in `react-dialog` 1.1.17** — `WarningProvider` survives as
a documented no-op — so the rule now has no runtime backstop at all. Both were
sitting under the words "verified against the source", which is the failure
worth remembering: a verification note is a claim like any other, and it ages.

The Base UI default switch, the 2:1 adoption figure, the non-deprecation
statement and the `-b radix` escape hatch are from shadcn/ui's own July 2026
changelog entry announcing it, read 2026-08-22.
