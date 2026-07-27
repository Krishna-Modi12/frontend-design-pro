# Component API — Deep Reference

Loaded on demand from `core/component-api.md`. Everything here is advanced or long-form; the essentials live in the thin core file.

## 6. Compound Components

Use when a parent has 3+ named children sharing implicit state:

```tsx
<Tabs defaultValue="overview">
  <TabsList><TabsTrigger value="overview">Overview</TabsTrigger></TabsList>
  <TabsContent value="overview">…</TabsContent>
</Tabs>
```

Share state via context keyed to the parent (see `react-patterns.md` for the createContext pattern). Export parts as named exports (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) — no dot-notation-only API (breaks tree-shaking and RSC). NEVER force compound structure on a single-element wrapper — a `Badge` takes props, not children parts.

## Anti-patterns

| Don't | Do |
|---|---|
| `onPress`, `handleClick` prop names | `onClick` |
| `type` as a variant prop on `<button>` | `variant` (`type` collides with native submit/button) |
| Boolean variant props (`primary`, `large`) | Single `variant` / `size` unions |
| `React.FC<Props>` | Plain function + explicit props interface |
| Spreading `{...props}` before your own props | Spread last (consumer wins) |
| `any` in public prop types | Generics or unions — `any` is banned |


---

## 7. Composition Patterns

*Source: vercel-labs/agent-skills · composition-patterns.*

**`architecture-avoid-boolean-props` (HIGH).** Boolean props multiply: `isCompact` + `hasIcon` + `isDestructive` = 8 implicit variants nobody tested. Compose instead of configuring.

```tsx
// ✗ boolean proliferation
<Card isCompact hasHeader hasFooter isInteractive />
// ✓ composition — the shape is visible at the call site
<Card><CardHeader/><CardBody/><CardFooter/></Card>
```

**`patterns-explicit-variants` (MEDIUM).** Prefer an explicit component (`<DangerButton>`) or a CVA variant over a boolean mode flag. Booleans that change *behavior* (not just style) should almost always be separate components.

**`state-lift-state` (MEDIUM).** When siblings need the same state, move it into a provider component rather than threading callbacks between them.

**`state-decouple-implementation` (MEDIUM).** The provider is the *only* place that knows how state is stored (useState, reducer, Zustand, URL). Consumers read a stable interface, so the storage can change without touching them.

**`state-context-interface` (MEDIUM).** Shape context as `{ state, actions, meta }` so it can be dependency-injected and mocked in tests:

```tsx
interface TabsContextValue {
  state: { activeId: string };
  actions: { select: (id: string) => void };
  meta: { orientation: "horizontal" | "vertical" };
}
```

**Avoiding prop drilling.** Never thread a prop through 3+ layers that don't use it. Escalate in this order: (1) restructure with composition — pass the rendered node as `children`; (2) context via a provider; (3) a store, only for genuinely global state. Composition is first because it needs no new abstraction.

**`patterns-children-over-render-props` (MEDIUM).** Use `children` for composition; reach for `renderX` props only when the consumer needs internal state (`render={({ isOpen }) => …}`).

**`architecture-compound-components` (HIGH).** See §6 — pair with the context interface above so `<TabsTrigger>` reads `activeId` from context rather than props.

## forwardRef — full template and rules

Every interactive component MUST forward its ref and extend the native element's props:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[oklch(60%_0.185_276)] text-[oklch(98%_0.005_240)] hover:bg-[oklch(54%_0.185_276)]",
        destructive: "bg-[oklch(55%_0.22_25)] text-[oklch(98%_0.005_240)]",
        outline: "border border-[oklch(90%_0.005_240)] hover:bg-[oklch(96%_0.005_240)]",
        ghost: "hover:bg-[oklch(96%_0.005_240)]",
      },
      size: { default: "h-11 px-5", sm: "h-9 px-3 text-sm", lg: "h-12 px-8" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    ButtonVariantProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
```

Rules: base type is `ComponentPropsWithoutRef<'element'>` (never re-declare `onClick`/`disabled` by hand); `displayName` set on every `forwardRef` component; rest-spread `{...props}` LAST so consumers can override; `className` merged via `cn()`, consumer classes win.

### React 19: `ref` as a prop

React 19 passes `ref` as an ordinary prop — `forwardRef` is no longer required, and Vercel's composition guidance (`react19-no-forwardref`) recommends dropping it in new React 19-only code:

```tsx
export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  ref?: React.Ref<HTMLButtonElement>;   // React 19: just a prop
}
export function Button({ ref, className, ...props }: ButtonProps) {
  return <button ref={ref} className={cn(className)} {...props} />;
}
```

**This skill's position:** both are correct; pick one per codebase and stay consistent.
- Use **`ref`-as-prop** for React 19-only code with no library consumers — less ceremony, no `displayName` bookkeeping.
- Keep **`forwardRef`** when supporting React 18, publishing a library, or extending shadcn/Radix primitives (which still ship `forwardRef`). The `COMP-01` constraint only validates `forwardRef` *when it is used* — it never forces it.
Also React 19: prefer `use(Context)` over `useContext(Context)`.
