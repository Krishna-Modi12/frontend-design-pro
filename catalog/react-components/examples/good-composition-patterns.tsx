// GOLD: Composition patterns — compound components, lifted state, asChild, CVA.
// Source doctrine: references/react-patterns.md §1, references/shadcn.md (vercel-labs/composition-patterns).
//   • No boolean-prop proliferation — structure is visible at the call site
//   • State lifted into a provider; no prop drilling
//   • Context shaped as { state, actions, meta } for dependency injection
//   • forwardRef on every interactive part (React 18-compatible; React 19 may use ref-as-prop)
//   • VariantProps exported so consumers can type their own wrappers
import * as React from "react";

/* ── variants (CVA-shaped; inlined so the example stays single-file) ──────── */
const triggerVariants = {
  base: "inline-flex items-center justify-center rounded-lg px-4 font-semibold transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)] disabled:opacity-50",
  size: { sm: "h-9 text-sm", md: "h-11 text-sm", lg: "h-12 text-base" },
  state: {
    active: "bg-[oklch(99.5%_0.004_255)] text-[oklch(14%_0.012_240)] shadow-sm",
    idle: "text-[oklch(45%_0.010_240)] hover:text-[oklch(14%_0.012_240)]",
  },
} as const;
export type TriggerVariantProps = { size?: keyof typeof triggerVariants.size };

/* ── context: state / actions / meta (state-context-interface) ───────────── */
interface TabsContextValue {
  state: { activeId: string };
  actions: { select: (id: string) => void };
  meta: { orientation: "horizontal" | "vertical"; baseId: string };
}
const TabsContext = React.createContext<TabsContextValue | null>(null);
function useTabs(): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs parts must be rendered inside <Tabs>");
  return ctx;
}

/* ── Tabs (provider owns the state — siblings read it, nothing is drilled) ── */
export interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue: string;
  value?: string;
  onValueChange?: (id: string) => void;
  orientation?: "horizontal" | "vertical";
}
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { defaultValue, value, onValueChange, orientation = "horizontal", className = "", children, ...props },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const activeId = value ?? uncontrolled;
  const baseId = React.useId();
  const select = React.useCallback(
    (id: string) => { if (value === undefined) setUncontrolled(id); onValueChange?.(id); },
    [value, onValueChange],
  );
  const ctx = React.useMemo<TabsContextValue>(
    () => ({ state: { activeId }, actions: { select }, meta: { orientation, baseId } }),
    [activeId, select, orientation, baseId],
  );
  return (
    <TabsContext.Provider value={ctx}>
      <div ref={ref} className={`flex flex-col gap-4 ${className}`} {...props}>{children}</div>
    </TabsContext.Provider>
  );
});

export interface TabsListProps extends React.ComponentPropsWithoutRef<"div"> {}
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className = "", children, ...props }, ref,
) {
  const { meta } = useTabs();
  return (
    <div ref={ref} role="tablist" aria-orientation={meta.orientation}
      className={`inline-flex gap-1 rounded-xl bg-[oklch(96%_0.005_240)] p-1 ${className}`} {...props}>
      {children}
    </div>
  );
});

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<"button">, TriggerVariantProps {
  value: string;
  /** Render the child element instead of a <button> (Radix-style slot composition). */
  asChild?: boolean;
}
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, size = "md", asChild = false, className = "", children, onClick, ...props }, ref,
) {
  const { state, actions, meta } = useTabs();
  const selected = state.activeId === value;
  const classes = `${triggerVariants.base} ${triggerVariants.size[size]} ${selected ? triggerVariants.state.active : triggerVariants.state.idle} ${className}`;
  const shared = {
    ref, role: "tab" as const, id: `${meta.baseId}-tab-${value}`,
    "aria-selected": selected, "aria-controls": `${meta.baseId}-panel-${value}`,
    tabIndex: selected ? 0 : -1, className: classes,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => { actions.select(value); onClick?.(e); },
    ...props,
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, shared);
  }
  return <button type="button" {...shared}>{children}</button>;
});

export interface TabsContentProps extends React.ComponentPropsWithoutRef<"div"> { value: string }
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, className = "", children, ...props }, ref,
) {
  const { state, meta } = useTabs();
  if (state.activeId !== value) return null;
  return (
    <div ref={ref} role="tabpanel" id={`${meta.baseId}-panel-${value}`}
      aria-labelledby={`${meta.baseId}-tab-${value}`} tabIndex={0}
      className={`rounded-xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] p-6 focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.185_276)] ${className}`} {...props}>
      {children}
    </div>
  );
});

/* ── demo ─────────────────────────────────────────────────────────────────── */
export interface DeploymentTabsProps {
  defaultTab?: string;
  /** Skeleton state — drive from real data loading; never an artificial delay. */
  isLoading?: boolean;
}
export default function DeploymentTabs({ defaultTab = "overview", isLoading = false }: DeploymentTabsProps = {}) {
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8" aria-busy="true">
        <div className="h-9 w-72 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-6 h-11 w-80 animate-pulse rounded-xl bg-[oklch(92%_0.005_240)]" />
        <div className="mt-4 h-40 max-w-3xl animate-pulse rounded-xl bg-[oklch(93%_0.005_240)]" />
      </main>
    );
  }
  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8 font-[Manrope,system-ui,sans-serif]">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance">
        Deployment&nbsp;bd-4471
      </h1>
      <Tabs defaultValue={defaultTab} className="max-w-3xl">
        <TabsList aria-label="Deployment details">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="build">Build Logs</TabsTrigger>
          <TabsTrigger value="runtime">Runtime</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-sm leading-relaxed text-[oklch(45%_0.010_240)]">
            Built in 47.2&nbsp;s from commit <code className="font-mono">a3f9e21</code> by Ana Ngugi.
            Bundle 284.7&nbsp;kB, 12 routes prerendered.
          </p>
        </TabsContent>
        <TabsContent value="build">
          <p className="text-sm leading-relaxed text-[oklch(45%_0.010_240)]">
            Compiled 1,284 modules. Cache hit rate 87.4%.
          </p>
        </TabsContent>
        <TabsContent value="runtime">
          <p className="text-sm leading-relaxed text-[oklch(45%_0.010_240)]">
            p95 latency 128&nbsp;ms across 4,912 invocations. No cold starts in the last hour.
          </p>
        </TabsContent>
      </Tabs>
    </main>
  );
}
