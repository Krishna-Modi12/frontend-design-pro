---
name: react-components
description: Reusable React component APIs — buttons, cards, modals, tabs, dropdowns, shadcn/Radix primitives, compound components.
version: "14.7.4"
core-deps:
  - core/component-api.md
  - core/accessibility-baseline.md
---

# React Components

## When to Use
Building or refining a single reusable component or a small family of them: button, card, modal/dialog, dropdown, tabs, accordion, tooltip, badge, avatar, select, popover. Also any request mentioning shadcn/ui, Radix, compound components, `forwardRef`, CVA, or `asChild`. For a whole page use `landing-pages`; for inputs with validation use `forms`.

## Stack
React 19 · TypeScript strict · Tailwind v4 · shadcn/ui + Radix · Next.js App Router (default)

## Core Rules
1. **Prop taxonomy.** Behavioural props take native event names (`onClick`, `onSubmit`, `onOpenChange`) — never `onPress` on web. Stylistic props (`variant`, `size`) map to CVA variants. Compositional props are `children`, `asChild`, `render`.
2. **Ref forwarding.** React 19 passes `ref` as an ordinary prop; `forwardRef` remains correct for React 18 support and for anything extending shadcn/Radix. Pick one per codebase. When `forwardRef` is used it must take `(props, ref)`, return JSX, be exported, and set `displayName`.
3. **Base types from the element.** `interface XProps extends React.ComponentPropsWithoutRef<'button'>` — never re-declare `onClick`/`disabled` by hand.
4. **Spread last.** `{...props}` after your own attributes so consumers can override; merge `className` through `cn()` with consumer classes winning.
5. **Variants via CVA.** Export `VariantProps<typeof xVariants>` so wrappers can be typed. Discriminated string unions, never boolean soup (`primary`, `large`).
6. **Composition over configuration.** Three or more boolean props means the component should be compound instead. `<Card><CardHeader/><CardBody/></Card>`, not `<Card hasHeader hasBody/>`.
7. **Controlled contract.** Overlays use `open` + `onOpenChange` (+ `defaultOpen`). Inputs support both controlled and uncontrolled. State-heavy components are always controlled.
8. **`asChild` vs `as`.** `asChild` (Radix Slot) for behaviour wrappers; `as` only for typography/layout primitives. Never both on one component.
9. **Every interactive state.** default · hover · active · focus-visible · disabled · loading. Focus rings are `focus-visible:ring-2 ring-offset-2`, never `outline: none` without a replacement.

## Patterns
- **Compound + context** — parent owns state, parts read it via a `{ state, actions, meta }` context. Named exports, never dot-notation-only.
- **Slot composition** — `asChild` merges props onto the child element for triggers.
- **Polymorphic text** — `as` on `Heading`/`Text` changes the tag, not the behaviour.
- **Controlled/uncontrolled duality** — internal state falls back when the `value` prop is absent.

## Examples
`examples/good-composition-patterns.tsx` (compound Tabs, lifted state, asChild, CVA) · `examples/good-shadcn.tsx` (Dialog, Command, DataTable, Form) · `examples/good-react19.tsx` (useOptimistic, useActionState, Server Actions) · `examples/good-surgical-change.tsx` (scoped edit discipline).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Advanced composition, compound components, API anti-patterns, full forwardRef rules | `core/component-api-deep.md` |
| Hooks, context, error boundaries, React 19 APIs | `references/react-patterns.md` |
| shadcn component usage, theming, `cn()`, CLI | `references/shadcn.md` |
| Community components, MagicUI/Aceternity, registries | `references/shadcn-ecosystem.md` |
| Icons, avatars, icon sizing and a11y | `../iconography/SKILL.md` |
| OKLCH technique, 8 interactive states, anchor positioning | `references/impeccable-techniques.md` |

## Constraints
TypeScript strict, exported prop interfaces, no implicit `any` · OKLCH tokens, no raw hex · `COMP-01` forwardRef correctness · `TS-01-AST` declared Props must be used · `A11Y-01/02` real ARIA and focus-visible on interactive elements only · four states with no mount-time fake delays · `prefers-reduced-motion` respected.
