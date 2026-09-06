/* ANTI-EXAMPLE — study the violations, never imitate.
 * Deliberately breaks: PERF-01 (barrel import), PERF-02 (numeric && renders "0"),
 * PERF-04 (transition: all), A11Y-03 (img without dimensions), COPY-01 ("..." in UI copy).
 * See references/react-performance.md and references/web-interface-guidelines.md. */
import { Button } from "@/components";          // ✗ PERF-01 barrel import

type BadProps = { items: string[]; avatar: string };

export default function BadPerformance({ items, avatar }: BadProps) {
  return (
    <div className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8">
      <img src={avatar} alt="User" />           {/* ✗ A11Y-03 no width/height → CLS */}
      <p className="transition-all">Loading...</p>  {/* ✗ PERF-04 + ✗ COPY-01 */}
      {items.length && (                         /* ✗ PERF-02 renders a literal 0 */
        <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
      )}
      <Button>Continue</Button>
    </div>
  );
}
