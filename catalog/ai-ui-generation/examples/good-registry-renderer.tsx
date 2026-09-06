// GOLD: JSON → UI through a closed component registry.
// Source doctrine: references/generative-ui-runtimes.md, references/generation-patterns.md.
//   • The registry is the allow-list. A generated payload names a component; it
//     never supplies one. Anything not in the map renders a visible fallback
//     instead of throwing, because a model WILL emit a node you did not ship.
//   • Props are validated per node before they reach a component. `spread the
//     model's object into JSX` is how a hallucinated `dangerouslySetInnerHTML`
//     or `onClick` string becomes an execution path.
//   • Depth is bounded. A self-referencing payload is a stack overflow, and the
//     generator is not a trusted author.
//   • No `any` anywhere: unknown data is `unknown` and gets narrowed, which is
//     the only difference between parsing and hoping.
import * as React from "react";

/* ── the node contract ────────────────────────────────────────────────────── */
export type NodeType = "stack" | "heading" | "text" | "metric" | "action";

export interface UINode {
  type: string;
  props?: Record<string, unknown>;
  children?: UINode[];
}

const MAX_DEPTH = 8;

/* ── narrowing helpers — parse, don't trust ───────────────────────────────── */
const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;

function isNode(v: unknown): v is UINode {
  return typeof v === "object" && v !== null && typeof (v as { type?: unknown }).type === "string";
}

/* ── the registry ─────────────────────────────────────────────────────────── */
interface RenderCtx {
  node: UINode;
  depth: number;
  children: React.ReactNode;
}

const registry: Record<NodeType, (ctx: RenderCtx) => React.ReactElement> = {
  stack: ({ node, children }) => {
    const gap = oneOf(node.props?.gap, ["sm", "md", "lg"] as const, "md");
    const gaps = { sm: "gap-2", md: "gap-4", lg: "gap-6" } as const;
    return <div className={`flex flex-col ${gaps[gap]}`}>{children}</div>;
  },
  heading: ({ node }) => {
    const level = oneOf(node.props?.level, ["1", "2"] as const, "2");
    const text = str(node.props?.text, "Untitled section");
    return level === "1" ? (
      <h1 className="text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        {text}
      </h1>
    ) : (
      <h2 className="text-base font-semibold text-[oklch(14%_0.012_240)]">{text}</h2>
    );
  },
  text: ({ node }) => (
    <p className="max-w-[65ch] text-sm leading-relaxed text-[oklch(45%_0.010_240)]">
      {str(node.props?.text)}
    </p>
  ),
  metric: ({ node }) => (
    <div className="rounded-xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] p-4">
      <span className="block text-xs uppercase tracking-wide text-[oklch(55%_0.010_240)]">
        {str(node.props?.label, "Metric")}
      </span>
      <span className="mt-1 block font-mono text-xl text-[oklch(14%_0.012_240)]">
        {str(node.props?.value, "—")}
      </span>
    </div>
  ),
  action: ({ node }) => (
    // href only. A generated payload never supplies a handler, so there is no
    // prop here that can carry one.
    <a
      href={str(node.props?.href, "#")}
      className="inline-flex h-11 items-center rounded-lg bg-[oklch(45%_0.170_276)] px-4 text-sm font-semibold text-[oklch(99%_0.004_255)] transition-colors duration-150 motion-reduce:transition-none hover:bg-[oklch(38%_0.175_276)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.185_276)] focus-visible:ring-offset-2"
    >
      {str(node.props?.label, "Continue")}
    </a>
  ),
};

const KNOWN = Object.keys(registry) as NodeType[];
const isKnown = (t: string): t is NodeType => (KNOWN as string[]).includes(t);

/* ── renderer ─────────────────────────────────────────────────────────────── */
export interface RenderNodeProps {
  node: UINode;
  depth?: number;
}

export function RenderNode({ node, depth = 0 }: RenderNodeProps): React.ReactElement {
  if (depth > MAX_DEPTH) {
    return (
      <p className="rounded-lg border border-dashed border-[oklch(80%_0.090_25)] p-3 text-xs text-[oklch(45%_0.060_25)]">
        Nesting limit reached — the rest of this branch was not rendered.
      </p>
    );
  }

  const kids = (node.children ?? []).filter(isNode);
  const rendered = kids.map((child, i) => (
    <RenderNode key={`${child.type}-${i}`} node={child} depth={depth + 1} />
  ));

  if (!isKnown(node.type)) {
    // Visible, not silent. An unrecognised node is a generator bug, and hiding
    // it makes the payload look like it rendered correctly.
    return (
      <div
        role="note"
        className="rounded-lg border border-dashed border-[oklch(85%_0.005_240)] p-3 text-xs text-[oklch(50%_0.010_240)]"
      >
        Unsupported block <code className="font-mono">{node.type}</code>
        {rendered.length > 0 && <div className="mt-2 flex flex-col gap-2">{rendered}</div>}
      </div>
    );
  }

  return registry[node.type]({ node, depth, children: rendered });
}

/* ── demo ─────────────────────────────────────────────────────────────────── */
export interface GeneratedPanelProps {
  payload?: UINode;
  isLoading?: boolean;
  /** Non-null renders the recoverable error branch. */
  error?: string | null;
}

const SEED: UINode = {
  type: "stack",
  props: { gap: "lg" },
  children: [
    { type: "heading", props: { level: "1", text: "Weekly delivery report" } },
    {
      type: "text",
      props: {
        text: "Merged 34 pull requests across 6 services. Median review time fell to 3h 12m from 5h 40m.",
      },
    },
    {
      type: "stack",
      props: { gap: "sm" },
      children: [
        { type: "metric", props: { label: "Deploys", value: "47" } },
        { type: "metric", props: { label: "Change failure rate", value: "2.1%" } },
        { type: "metric", props: { label: "p95 restore", value: "18m" } },
      ],
    },
    // Deliberately not in the registry — the fallback is part of the contract.
    { type: "sparkline", props: { series: "deploys" } },
    { type: "action", props: { label: "Open full report", href: "#report" } },
  ],
};

export default function GeneratedPanel({
  payload = SEED,
  isLoading = false,
  error = null,
}: GeneratedPanelProps = {}) {
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8" aria-busy="true">
        <div className="h-9 w-72 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-6 h-24 max-w-2xl animate-pulse rounded-xl bg-[oklch(93%_0.005_240)]" />
        <div className="mt-4 h-40 max-w-2xl animate-pulse rounded-xl bg-[oklch(93%_0.005_240)]" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8">
        <div
          role="alert"
          className="max-w-xl rounded-xl border border-[oklch(80%_0.090_25)] bg-[oklch(97%_0.020_25)] p-4"
        >
          <h2 className="text-sm font-semibold text-[oklch(38%_0.170_25)]">
            The layout could not be generated
          </h2>
          <p className="mt-1 text-sm text-[oklch(45%_0.060_25)]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8 font-[Manrope,system-ui,sans-serif]">
      <div className="max-w-2xl">
        <RenderNode node={payload} />
      </div>
    </main>
  );
}
