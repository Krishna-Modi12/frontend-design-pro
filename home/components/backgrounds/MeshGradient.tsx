import type { ReactElement } from "react";

/**
 * Hero's `mesh` world ground — layered `color-mix(in oklch, …)` radial
 * gradients, no canvas at all, so unlike the hero's object (gated behind a
 * 640px `matchMedia`, which the WebGL hero object used to carry) this
 * renders at every viewport
 * width. It is the ground the object stands on, not a hero of its own — that
 * split is what lets all four worlds share one object. Reads the
 * CURRENT `--color-accent` live, so it always matches whichever world set
 * that variable; no hardcoded hex or rgba anywhere in this file. Drift is a
 * single `background-position` keyframe (`mesh-drift`, in `lib/tokens.ts`).
 * The page's global reduced-motion rule already clamps it to one 1ms frame;
 * `motion-reduce:` below states the same intent locally too — the same
 * belt-and-braces pairing `Hero.tsx`'s own scroll-indicator icon uses
 * (`animate-bounce motion-reduce:animate-none`).
 */
export function MeshGradient(): ReactElement {
  return (
    <div
      className="absolute inset-0 animate-[mesh-drift_22s_ease-in-out_infinite] motion-reduce:animate-none"
      style={{
        backgroundImage: [
          "radial-gradient(42% 46% at 18% 22%, color-mix(in oklch, var(--color-accent) 55%, transparent), transparent 70%)",
          "radial-gradient(36% 40% at 82% 14%, color-mix(in oklch, var(--color-accent) 38%, transparent), transparent 70%)",
          "radial-gradient(48% 52% at 55% 88%, color-mix(in oklch, var(--color-accent) 26%, transparent), transparent 70%)",
        ].join(", "),
        backgroundSize: "160% 160%",
        backgroundPosition: "0% 0%",
      }}
    />
  );
}

export default MeshGradient;
