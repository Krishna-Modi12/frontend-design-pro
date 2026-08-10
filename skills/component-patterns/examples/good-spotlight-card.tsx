// GOLD: Spotlight card — pointer-reactive surface without a render per frame.
// Source doctrine: references/aceternity.md, references/interaction-patterns.md.
//   • The pointer position lives in two CSS custom properties, not in state.
//     Setting state on pointermove re-renders the subtree at input frequency —
//     120Hz on a modern trackpad — and turns a decoration into a jank source.
//   • Writes are batched into one rAF. A raw pointermove handler that touches
//     style forces layout on every event; one frame's worth is enough.
//   • Reduced motion removes the effect, it does not slow it down. The card is
//     still a card, and the border still moves focus.
//   • The whole effect is decorative: it lives on an aria-hidden layer, and
//     every card remains a plain focusable link with real text under it.
import * as React from "react";

/** Live media-query subscription — `prefers-reduced-motion` can change mid-session. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export interface SpotlightCardProps extends React.ComponentPropsWithoutRef<"article"> {
  /** Radius of the highlight in px. */
  radius?: number;
}

export const SpotlightCard = React.forwardRef<HTMLElement, SpotlightCardProps>(
  function SpotlightCard({ radius = 320, className = "", children, ...props }, ref) {
    const inner = React.useRef<HTMLElement | null>(null);
    const frame = React.useRef<number | null>(null);
    const next = React.useRef({ x: 0, y: 0 });
    const reduced = useReducedMotion();

    // Merge the forwarded ref with the local one — the effect needs the node,
    // and the consumer is still entitled to it.
    const setRefs = React.useCallback(
      (node: HTMLElement | null) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [ref],
    );

    const flush = React.useCallback(() => {
      frame.current = null;
      const node = inner.current;
      if (!node) return;
      node.style.setProperty("--spot-x", `${next.current.x}px`);
      node.style.setProperty("--spot-y", `${next.current.y}px`);
    }, []);

    const onPointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLElement>) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        next.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        // Coalesce: many events, one style write per frame.
        if (frame.current === null) frame.current = requestAnimationFrame(flush);
      },
      [reduced, flush],
    );

    React.useEffect(() => {
      return () => {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
      };
    }, []);

    return (
      <article
        ref={setRefs}
        onPointerMove={onPointerMove}
        className={`group relative overflow-hidden rounded-2xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] p-6 transition-colors duration-200 motion-reduce:transition-none focus-within:border-[oklch(60%_0.185_276)] ${className}`}
        {...props}
      >
        {!reduced && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:hidden"
            style={{
              background: `radial-gradient(${radius}px circle at var(--spot-x, 50%) var(--spot-y, 50%), oklch(60% 0.185 276 / 0.12), transparent 70%)`,
            }}
          />
        )}
        <div className="relative">{children}</div>
      </article>
    );
  },
);

/* ── demo ─────────────────────────────────────────────────────────────────── */
interface Integration {
  id: string;
  name: string;
  summary: string;
  installs: string;
}

export interface IntegrationGridProps {
  integrations?: Integration[];
  isLoading?: boolean;
  /** Non-null renders the recoverable error branch. */
  error?: string | null;
}

const SEED: Integration[] = [
  {
    id: "int-1",
    name: "Postgres",
    summary: "Branch a database per pull request and tear it down on merge.",
    installs: "18,402",
  },
  {
    id: "int-2",
    name: "Sentry",
    summary: "Map a stack trace back to the deploy and the commit that shipped it.",
    installs: "11,927",
  },
  {
    id: "int-3",
    name: "Resend",
    summary: "Transactional mail with the templates versioned alongside the app.",
    installs: "6,318",
  },
];

export default function IntegrationGrid({
  integrations = SEED,
  isLoading = false,
  error = null,
}: IntegrationGridProps = {}) {
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8" aria-busy="true">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-[oklch(93%_0.005_240)]" />
          ))}
        </div>
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
            Integrations are unavailable
          </h2>
          <p className="mt-1 text-sm text-[oklch(45%_0.060_25)]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8 font-[Manrope,system-ui,sans-serif]">
      <h1 className="text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        Integrations
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((it) => (
          <SpotlightCard key={it.id}>
            <h2 className="text-base font-semibold text-[oklch(14%_0.012_240)]">{it.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[oklch(45%_0.010_240)]">
              {it.summary}
            </p>
            <p className="mt-4 text-xs text-[oklch(55%_0.010_240)]">{it.installs} installs</p>
            <a
              href={`#${it.id}`}
              className="mt-4 inline-flex h-11 items-center rounded-lg px-3 text-sm font-semibold text-[oklch(45%_0.170_276)] transition-colors duration-150 motion-reduce:transition-none hover:text-[oklch(35%_0.180_276)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.185_276)]"
            >
              Configure
            </a>
          </SpotlightCard>
        ))}
      </div>
    </main>
  );
}
