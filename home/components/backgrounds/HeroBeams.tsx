import type { ReactElement } from "react";

/**
 * The light the corpus is read by — shafts from one source, in CSS.
 *
 * **Where this came from, and what was kept.** The brief was React Bits'
 * `<Beams />` (reactbits.dev/backgrounds/beams): ribbons of light raked from
 * one side. The *idea* belongs in this hero. The *implementation* could not
 * ship here, so the idea came across on its own. What the real component
 * costs, measured rather than assumed:
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
 * So this is zero new dependencies and no JavaScript at all.
 *
 * **The first version of this file was two crossed `repeating-linear-gradient`
 * rakes, and a screenshot killed it.** The comment in that version claimed
 * that unequal angles and unequal periods would keep the crossings from
 * "settling into a regular lattice". They do not, and no choice of angle or
 * period would have: two periodic functions overlaid are periodic in both
 * directions, always, and what renders is a plaid. On the page it read as a
 * compression artefact — a checkerboard sitting behind the headline — not as
 * light. It was the worst thing in the composition, and it was the part that
 * had just been added.
 *
 * The fix is not a tuning of that idea; it is the other construction. Light
 * shafts are **few, wide, irregular, and share an origin**, so they are drawn
 * here as one `conic-gradient` with hand-placed angular stops around a source
 * off the top-right corner. Five shafts at irregular widths and intensities
 * inside a ~90° fan. A lattice is not merely avoided, it is unreachable:
 * there is one periodic axis, and its period is 360°.
 *
 * The lesson is the general one this repo keeps relearning — a rendered
 * screenshot is not a formality after the reasoning, it is the only thing that
 * checks the reasoning. Nothing in the gate chain draws a pixel.
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
 * paragraph. There is no opacity low enough to make text over a gradient a
 * safe bet at every viewport, which is exactly what the scrim was built to
 * prove and what deleting the scrim was meant to stop repeating.
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

/**
 * The source sits outside the frame, above the top-right corner.
 *
 * 87%/-8% rather than 94%/-14%, and the difference is a wide-viewport
 * measurement rather than a preference. The hero's aspect ratio changes a lot
 * across the ladder — 1024x768 is 1.33, 1920x1080 is 1.78 — and a conic fan
 * anchored near the corner sweeps a narrower slice of the box as the box gets
 * wider. At 1920 the shafts cleared the ring's right edge entirely: light in
 * the top corner, and the object it was supposed to be lighting sitting in the
 * dark below it, which is worse than no light at all because it looks like two
 * unrelated things.
 */
const ORIGIN = "87% -8%";

/**
 * One shaft, as `[start, peak, end, strength]`: three angles in degrees
 * clockwise from twelve o'clock (the sense CSS `conic-gradient` measures in)
 * and a `color-mix` percentage. Down-and-left from the origin is ~215°, so
 * the fan is authored either side of that.
 */
type Shaft = readonly [start: number, peak: number, end: number, strength: number];

/**
 * The fan. Widths and gaps are deliberately not a sequence — 15°, 11°, 19°,
 * 10°, 14° of shaft against gaps of 10°, 5°, 12°, 7°. Irregular by hand is the
 * whole difference between light and pattern, and it is precisely the thing a
 * repeating gradient cannot express.
 */
const SHAFTS: readonly Shaft[] = [
  [172, 179, 187, 6],
  [197, 203, 208, 11],
  [213, 222, 232, 7],
  [244, 249, 254, 12],
  [261, 267, 275, 5],
];

/** `color-mix` at a given strength, or nothing at all. */
const tint = (pct: number): string =>
  pct === 0 ? "transparent" : `color-mix(in oklch, var(--color-accent) ${pct}%, transparent)`;

/**
 * Each shaft ramps up to its peak and back down, so the edges are soft rather
 * than cut. `conic-gradient` interpolates between stops, so a shaft is four
 * stops: dark at `start`, lit at `peak`, lit again just past it, dark at
 * `end`. Gaps between shafts are explicit transparent stops, which is what
 * keeps the fan from smearing into one wash.
 */
function fan(): string {
  const stops: string[] = ["transparent 0deg"];
  for (const [start, peak, end, strength] of SHAFTS) {
    stops.push(`${tint(0)} ${start}deg`);
    stops.push(`${tint(strength)} ${peak}deg`);
    stops.push(`${tint(strength)} ${peak + 2}deg`);
    stops.push(`${tint(0)} ${end}deg`);
  }
  stops.push("transparent 360deg");
  return `conic-gradient(from 0deg at ${ORIGIN}, ${stops.join(", ")})`;
}

export function HeroBeams(): ReactElement {
  return (
    <div
      aria-hidden="true"
      data-hero-beams
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      style={{
        // Two masks, intersected, and both are load-bearing.
        //
        // The linear one keeps every shaft clear of the type column, and 58%
        // is measured rather than judged by eye. The hero's grid is
        // `[minmax(0,1fr) minmax(0,28rem)]` inside a centred `max-w-6xl` with
        // `px-8` and `gap-12`, so the copy track ends at 48.4% of the viewport
        // at 1024, 53.8% at 1280, 53.3% at 1440 and 52.5% at 1920 — the
        // fraction rises and then falls as the container stops growing, so
        // there is no width where extrapolating from one breakpoint is safe.
        // The first draft of this file started the ramp at 42% and would have
        // put beams under the last line of the headline at every one of them.
        //
        // The radial one is the inverse-square law, roughly: light falls off
        // with distance from its source, and a fan of even brightness end to
        // end is the tell that it is a shape rather than an illumination.
        maskImage:
          "linear-gradient(to right, transparent 0%, transparent 58%, black 84%, black 100%), radial-gradient(135% 150% at 86% -4%, black 0%, black 38%, transparent 92%)",
        maskComposite: "intersect",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, transparent 58%, black 84%, black 100%), radial-gradient(135% 150% at 86% -4%, black 0%, black 38%, transparent 92%)",
        WebkitMaskComposite: "source-in",
      }}
    >
      {/* The shafts. */}
      <div className="absolute inset-0" style={{ background: fan() }} />

      {/* The source itself: a soft bloom where the shafts converge, so the
          fan reads as coming FROM somewhere rather than as a shape that
          happens to be wedge-like. Without it the apex is the emptiest part
          of the picture, which is backwards. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(46% 40% at ${ORIGIN},` +
            ` color-mix(in oklch, var(--color-accent) 14%, transparent) 0%,` +
            ` color-mix(in oklch, var(--color-accent) 5%, transparent) 44%,` +
            " transparent 76%)",
        }}
      />
    </div>
  );
}

export default HeroBeams;
