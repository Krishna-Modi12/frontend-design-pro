import type { ReactElement } from "react";

/**
 * The light the corpus is read by — crossing beams, in CSS.
 *
 * **Where this came from, and what was kept.** The brief was React Bits'
 * `<Beams />` (reactbits.dev/backgrounds/beams): crossing ribbons of light,
 * raked from one side, noise-displaced. The *idea* belongs in this hero. The
 * *implementation* could not ship here, so the idea came across on its own.
 * What the real component costs, measured rather than assumed:
 *
 * - `three@^0.180.0`, `@react-three/fiber@^9.3.0`, `@react-three/drei@^10.7.4`
 *   — three runtime dependencies, in an app that removed `three` outright and
 *   records why in `README.md`: an R3F build of a ONE-MESH scene gzipped to
 *   ~174KB against this pack's own ">50KB, find a lighter alternative"
 *   ceiling. Beams is more than one mesh, plus drei on top.
 * - Run through this repo's own suites it is a BLOCKER, not a warning:
 *   `3D-03` twice (`new THREE.ShaderMaterial()` and `new THREE.BufferGeometry()`
 *   in a component body, rebuilt every render) and `TS-01-AST` once. The
 *   parser gate halts there, so its `lightColor="#ffffff"` never even reached
 *   `COL-04`.
 * - `frameloop="always"`: a full-screen fragment shader redrawn forever, in an
 *   app that deleted a slow idle rotation for measuring 29.9ms median against
 *   a 16.7ms baseline.
 *
 * All of which is the same argument twice — so this is **zero new
 * dependencies and no JavaScript at all**: two rakes of `repeating-linear-gradient`
 * crossed at unequal angles, one soft source, and a mask.
 *
 * **Why it earns a place rather than decorating.** A beam field behind a
 * headline is ornament, and this hero already paid for learning that. The
 * `HeroBackground` of two rewrites ago painted a full-bleed accent wash and
 * then had to cover it with a solid radial scrim of `bg-page`, because
 * `pages:verify`'s axe pass kept catching intermittent `color-contrast`
 * failures — intermittent because they depended on what colour happened to be
 * under the text that frame. The scrim worked, and it became the largest shape
 * on screen: a bug fix that read as the design.
 *
 * So this never goes near the type. It is masked to the right of the
 * composition, behind `HeroCorpusRing`, and it is there to be the light that
 * ring's read head is reading by. Until now the hero asserted a read — a
 * travelling accent arc — with no light anywhere in the picture to do it.
 * Ornament explains nothing; this explains the accent.
 *
 * **Below `lg:` it does not render, and that is the contrast rule, not a
 * breakpoint preference.** At `lg` the hero is two tracks and the mask is cut
 * past the measured end of the copy track, so beams and text cannot overlap at
 * any width. Below it the grid collapses to one column, the copy goes full
 * width, and "the right 42%" is no longer empty — it is the middle of a
 * paragraph. There is no opacity low enough to make
 * text over a gradient a safe bet at every viewport, which is exactly what the
 * scrim was built to prove and what deleting the scrim was meant to stop
 * repeating.
 *
 * **Hue-agnostic by construction, like every other ground here.** Every colour
 * is `color-mix(in oklch, var(--color-accent) N%, transparent)` — the
 * technique `MeshGradient` already uses — so all four worlds tint it correctly
 * with no per-hue maths and no hex in this file.
 *
 * **Nothing animates.** Not on load, not at rest. The beams are ground; the
 * one authored motion in this hero is the read head's traversal, and a second
 * moving thing would take that from it. There is no `motion-reduce:` escape
 * hatch below because there is nothing to escape.
 */
export function HeroBeams(): ReactElement {
  return (
    <div
      aria-hidden="true"
      data-hero-beams
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      style={{
        // Two masks, intersected, and both are load-bearing.
        //
        // The linear one keeps every band clear of the type column, and 58% is
        // measured rather than judged by eye. The hero's grid is
        // `[minmax(0,1fr) minmax(0,28rem)]` inside a centred `max-w-6xl` with
        // `px-8` and `gap-12`, so the copy track ends at 48.4% of the viewport
        // at 1024, 53.8% at 1280, 53.3% at 1440 and 52.5% at 1920 — the
        // fraction rises and then falls as the container stops growing, so
        // there is no width where extrapolating from one breakpoint is safe.
        // The first draft of this file started the ramp at 42% and would have
        // put beams under the last line of the headline at every one of them.
        //
        // The radial one stops the field ending on a hard vertical edge at the
        // viewport boundary, which reads as a panel that has been placed
        // rather than as light falling.
        maskImage:
          "linear-gradient(to right, transparent 0%, transparent 58%, black 84%, black 100%), radial-gradient(64% 78% at 80% 46%, black 0%, black 45%, transparent 84%)",
        maskComposite: "intersect",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, transparent 58%, black 84%, black 100%), radial-gradient(64% 78% at 80% 46%, black 0%, black 45%, transparent 84%)",
        WebkitMaskComposite: "source-in",
      }}
    >
      {/* Two crossing families rather than one rake, because a single set of
          parallel bands reads as a texture and the crossing is the whole
          difference — it is what says "light through something" instead of
          "stripes". The angles are deliberately not complementary: 18deg
          against -64deg, so the intersections drift across the field instead
          of settling into a regular lattice. Different periods (92 and 150)
          for the same reason. */}
      <div
        className="absolute -inset-[40%]"
        style={{
          background:
            "repeating-linear-gradient(18deg," +
            " transparent 0px," +
            " transparent 46px," +
            " color-mix(in oklch, var(--color-accent) 7%, transparent) 46px," +
            " color-mix(in oklch, var(--color-accent) 7%, transparent) 92px)",
        }}
      />
      <div
        className="absolute -inset-[40%]"
        style={{
          background:
            "repeating-linear-gradient(-64deg," +
            " transparent 0px," +
            " transparent 88px," +
            " color-mix(in oklch, var(--color-accent) 5%, transparent) 88px," +
            " color-mix(in oklch, var(--color-accent) 5%, transparent) 150px)",
        }}
      />

      {/* One soft source, off the top-right, so the beams read as coming FROM
          somewhere. Without it the crossed bands are evenly lit end to end,
          and even lighting is the tell that separates a pattern from a lit
          object. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 62% at 88% 12%," +
            " color-mix(in oklch, var(--color-accent) 13%, transparent) 0%," +
            " transparent 68%)",
        }}
      />
    </div>
  );
}

export default HeroBeams;
