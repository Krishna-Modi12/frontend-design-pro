# Component API Doctrine

Route: `CREATE_COMPONENT`, `REFINE_COMPONENT`, BUILD → COMPONENT_API.
Load before: `react-patterns.md`, `shadcn.md`. This file defines the prop surface; those files define implementation patterns.

---

## 1. Prop Taxonomy

| Category | Examples | Rule |
|---|---|---|
| Behavioral | `onClick`, `onSubmit`, `onOpenChange`, `onValueChange` | Match the native DOM event name where one exists; never `onPress` on web. Custom events: `on<Noun><Verb>` (`onOpenChange`), value first, event second: `(value, event) => void`. |
| Stylistic | `variant`, `size`, `colorScheme` | MUST map to CVA variants (§4). `className` is a merge escape hatch (`cn()` last), never the primary styling API. |
| Compositional | `asChild`, `render`, `children` | Prefer `asChild` over `as` (§3). `render` props only when the consumer needs internal state (`render={({ isOpen }) => …}`). |

Naming rules: booleans read as predicates (`disabled`, `isLoading`, `defaultOpen` — no `notDisabled` negatives). The same concept keeps the same name across the whole system: `size`, never `scale` in one component and `size` in another. Never abbreviate (`onChange` not `onChg`).

## 2. forwardRef Policy

Every interactive component forwards its ref and extends the native element's props. React 19 also allows `ref` as an ordinary prop — pick one per codebase and stay consistent (`forwardRef` for React 18 support or shadcn/Radix extension).

```tsx
export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">, ButtonVariantProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
```

Base type is `ComponentPropsWithoutRef<'element'>` — never re-declare `onClick`/`disabled`. Rest-spread LAST so consumers can override. `className` merged via `cn()`, consumer wins. `displayName` on every forwardRef component.


## 3. Polymorphism Doctrine

- `asChild` (Radix Slot): the component is a **behavior wrapper** — Tooltip trigger, DialogTrigger, Link-wrapping Button. Renders the child element, merges props onto it. Base UI's equivalent is the `render` prop, not `asChild` — check which primitive library a project actually has installed before assuming Radix's name (`react-components/references/radix-primitives.md` has the detail).
- `as` (string tag): only in **typography/layout primitives** (Heading, Text, Box) where the tag changes but behavior doesn't (`<Heading as="h2">`).
- NEVER support both on one component. NEVER `as` on interactive components — behavior + tag swapping breaks a11y contracts.

## 4. CVA Integration

All stylistic variants go through `class-variance-authority`. Always export the variant type (`export type XVariantProps = VariantProps<typeof xVariants>`) so consumers can type wrappers. Variants are discriminated string unions — never boolean soup (`primary`, `destructive` props) and never free-form `color="#f00"`.

## 5. Controlled vs Uncontrolled

| Component class | API |
|---|---|
| Form inputs | Support both: `value` + `onChange` (controlled) and `defaultValue` (uncontrolled). Both omitted → dev-time `console.warn`. Never switch modes mid-lifecycle. |
| Overlays (Dialog, Popover, Sheet) | `open` + `onOpenChange` (+ `defaultOpen`) — Radix/shadcn convention. Never `isOpen` + `toggle`. |
| State-heavy (DataTable sorting/selection/pagination) | Always controlled — state belongs to the caller (often the URL, see `memory-persistence.md`). |

## Reference Index

| Task | Load |
|---|---|
| Compound components, composition patterns, boolean-prop avoidance, state lifting, context interface, API anti-patterns | `core/component-api-deep.md` |
