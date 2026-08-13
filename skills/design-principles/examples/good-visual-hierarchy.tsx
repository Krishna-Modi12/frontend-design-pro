// GOLD: Visual hierarchy — one focal point, ranked by size, weight, and space.
// Source doctrine: references/visual-hierarchy.md, references/laws-of-ux.md (Von Restorff, Similarity, Gestalt).
//   • Exactly one primary action on the screen. Two equally-weighted buttons is
//     not a choice offered to the user, it is a decision the designer declined
//     to make, and it measurably slows both.
//   • Rank is carried by three dials at once — size, weight, and colour value.
//     One dial alone reads as an accident; a 2px size difference is noise.
//   • Grouping is spacing, not borders. Gestalt proximity does the work a
//     divider is usually reached for: related rows sit closer to each other
//     than to the next group, and the box disappears.
//   • Contrast is a ratio, not a vibe. Secondary text drops chroma and raises
//     lightness — it never drops below the body-text floor just to look calm.
import * as React from "react";

/** Live media-query subscription — the preference can change mid-session. */
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

/* ── the scale: each step is a ratio, not a guess ─────────────────────────── */
const rank = {
  // 1.5 between adjacent steps — far enough apart to read as intentional.
  primary: "text-3xl font-bold tracking-tight text-[oklch(14%_0.012_240)] sm:text-4xl",
  secondary: "text-lg font-semibold tracking-tight text-[oklch(22%_0.012_240)]",
  body: "text-sm leading-relaxed text-[oklch(38%_0.010_240)]",
  // Lightness rises and chroma falls together; this is still ~7:1 on the surface.
  meta: "text-xs text-[oklch(52%_0.008_240)]",
} as const;
export type Rank = keyof typeof rank;

export interface StatProps {
  label: string;
  value: string;
  /** The one stat that earns emphasis. Everything else recedes. */
  emphasis?: boolean;
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, emphasis = false },
  ref,
) {
  return (
    <div ref={ref}>
      <dt className={rank.meta}>{label}</dt>
      <dd
        className={
          emphasis
            ? "mt-1 font-mono text-2xl text-[oklch(14%_0.012_240)]"
            : "mt-1 font-mono text-base text-[oklch(38%_0.010_240)]"
        }
      >
        {value}
      </dd>
    </div>
  );
});

interface Change {
  id: string;
  title: string;
  author: string;
  age: string;
}

export interface ReleaseSummaryProps {
  changes?: Change[];
  isLoading?: boolean;
  /** Non-null renders the recoverable error branch. */
  error?: string | null;
}

const SEED: Change[] = [
  { id: "c-1", title: "Cache resolved routes between builds", author: "Priya Raman", age: "2h" },
  { id: "c-2", title: "Drop the duplicate zod schema in checkout", author: "Tomas Bergqvist", age: "5h" },
  { id: "c-3", title: "Fix focus loss when the drawer closes", author: "Amara Okonkwo", age: "yesterday" },
];

export default function ReleaseSummary({
  changes = SEED,
  isLoading = false,
  error = null,
}: ReleaseSummaryProps = {}) {
  const reduced = useReducedMotion();

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8" aria-busy="true">
        <div className="h-10 w-80 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-8 h-20 max-w-lg animate-pulse rounded-xl bg-[oklch(93%_0.005_240)]" />
        <div className="mt-8 h-40 max-w-lg animate-pulse rounded-xl bg-[oklch(93%_0.005_240)]" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8">
        <div
          role="alert"
          className="max-w-lg rounded-xl border border-[oklch(80%_0.090_25)] bg-[oklch(97%_0.020_25)] p-4"
        >
          <h2 className="text-sm font-semibold text-[oklch(38%_0.170_25)]">
            The release summary could not be loaded
          </h2>
          <p className="mt-1 text-sm text-[oklch(45%_0.060_25)]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] px-6 py-12 font-[Manrope,system-ui,sans-serif] sm:px-8">
      <div className="mx-auto max-w-lg">
        {/* Focal point: the largest, heaviest, darkest thing on the page. */}
        <h1 className={`${rank.primary} text-balance`}>Release 2026.8 is ready to ship</h1>
        <p className={`mt-3 max-w-[60ch] ${rank.body}`}>
          Every gate is green and the archive has been rebuilt. Publishing makes it public
          immediately.
        </p>

        {/* One primary action. The secondary is a link, not a second button —
            the weight difference is the hierarchy. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            className={`inline-flex h-11 items-center rounded-xl bg-[oklch(45%_0.170_276)] px-5 text-sm font-semibold text-[oklch(99%_0.004_255)] transition-colors duration-150 hover:bg-[oklch(38%_0.175_276)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.185_276)] focus-visible:ring-offset-2 ${
              reduced ? "" : "ease-out"
            } motion-reduce:transition-none`}
          >
            Publish release
          </button>
          <a
            href="#diff"
            className="inline-flex h-11 items-center text-sm font-medium text-[oklch(45%_0.010_240)] underline-offset-4 transition-colors duration-150 motion-reduce:transition-none hover:text-[oklch(14%_0.012_240)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.185_276)]"
          >
            Review the diff
          </a>
        </div>

        {/* Proximity: three stats grouped tightly, separated from the list by a
            gap roughly 3× the internal one. No divider needed. */}
        <dl className="mt-12 grid grid-cols-3 gap-x-4">
          <Stat label="Commits" value="34" />
          <Stat label="Coverage" value="91.4%" emphasis />
          <Stat label="Bundle" value="284.7 kB" />
        </dl>

        <section className="mt-12">
          <h2 className={rank.secondary}>Included changes</h2>
          <ul className="mt-4 space-y-4">
            {changes.map((c) => (
              <li key={c.id}>
                <p className="text-sm font-medium text-[oklch(20%_0.012_240)]">{c.title}</p>
                <p className={`mt-0.5 ${rank.meta}`}>
                  {c.author} · {c.age}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
