"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { ReferenceRecord } from "../lib/data.types";

export interface HeroCorpusRingProps {
  references: ReferenceRecord[];
  /** The reference the resting state lights. Named by the hero's caption. */
  litSkill: string;
  litName: string;
  onHoverChange?: (record: ReferenceRecord | null) => void;
  className?: string;
}

/**
 * The reference corpus, drawn to scale, closed into a ring.
 *
 * **What replaced what, and why this is the fourth hero visual.** The first
 * sampled the headline into a particle field; the second extruded the 119
 * references as strata of a WebGL slab; the third laid the same 119 marks out
 * as a flowing block of set type. The third was right about the medium and
 * wrong about two things a screenshot showed immediately.
 *
 * The first is that it did not render at all. `Hero.tsx` ran
 * `gsap.from(marks, { opacity: 0, scaleX: 0, delay: 0.3 })` over all 119
 * `<rect>`s while this component set each mark's `opacity` as an SVG
 * presentation attribute and transitioned it in CSS. Two systems owned one
 * property. Measured against the shipped production build: **0 of 119 marks
 * were visible at 500ms, and still 0 at 8s** — the tween wrote its `from`
 * state and never advanced, so every reader with motion enabled met an empty
 * half-hero and a caption describing marks that were not there. Under
 * `prefers-reduced-motion` the effect returned early, never touched the marks,
 * and the hero looked correct — which is exactly why it passed every check.
 *
 * The rule this component is built to keep: **one owner per property.** No
 * animation library touches a mark. Every value a mark renders with comes from
 * React state, and the only motion is a CSS transition on a property nothing
 * else writes. There is no `useRef` into this subtree and no `gsap.context`
 * around it.
 *
 * The second thing was composition. Set flush left as a block, the corpus sat
 * in the right half of a two-column hero as an unshaped grey rectangle — an
 * arbitrary silhouette that had to be captioned to be understood.
 *
 * **A ring is not decoration here; it is the claim's own shape.** What the
 * sentence beside it says is a *ratio*: one skill loads, the rest stay on
 * disk. A ratio is a part against a whole, and a closed loop is the one figure
 * that shows a whole without needing a scale printed under it — you can see
 * that the lit tick is one of many because the many close back around to it.
 * A flush-left block has a beginning and an end and shows neither.
 *
 * Same data, same rules as the block it replaces. One tick per real file under
 * a skill's `references/` directory; **tick length proportional to that file's
 * real token count**, linear and unsmoothed, so the handful of long files read as
 * long and the median reads as short — which is the truth about this corpus,
 * and prettier curves would be a lie about it. A wider angular gap at each of
 * the 19 skill boundaries, so the groups read as groups. Nothing sampled,
 * rounded or invented: `tokens` is the repo's canonical measure and the
 * generator asserts both the count and the sum against `check_figures.py
 * --truth` before writing the JSON, so this drawing cannot disagree with the
 * figures in the sentence next to it.
 *
 * **The loop is traversed once, not spun forever.** A read head — a short
 * accent arc — travels the full circle on load and comes to rest on the lit
 * tick, which is what a request actually does to this corpus. It is one CSS
 * transition on one `stroke-dashoffset`, so when it finishes the page
 * schedules no further work. That restraint is not taste, it is this repo's
 * own measurement: a previous hero carried a slow perpetual rotation and cost
 * a 29.9ms median frame against a 16.7ms baseline for a drift no reader would
 * notice. Nothing here animates at rest.
 *
 * Pointing at any tick moves the read head to it and prices it. That is the
 * architecture demonstrated rather than asserted: every one of these is a file
 * the agent did *not* load, and the reader can cost each one by touching it.
 *
 * **It is one image to a screen reader, not 119 tab stops.** A hero that puts
 * 119 focusable nodes ahead of the primary action is hostile whatever its
 * intentions, so the figure carries a text alternative stating the real
 * numbers and the pointer behaviour is an enhancement. The same facts are in
 * the paragraph beside it and in `#how-it-works` below.
 */

/** Virtual layout box. The SVG scales; these are ratios, not pixels. */
const BOX = 400;
const CENTRE = BOX / 2;
/**
 * Ticks hang INWARD from a fixed outer edge rather than growing outward from a
 * fixed inner one. Both are honest about the same numbers; only one of them
 * reads. Grown outward, 119 ticks varying from 614 to 16,369 tokens draw a
 * spiky asterisk with no boundary — a sunburst, which is a shape about
 * radiance and says nothing about a whole. Hung inward, the outer edge is a
 * clean unbroken circle (that is the corpus, and it is closed) and every
 * variation reads on the inside, where the eye is already going. The figure
 * the composition needs is a part against a whole; a whole needs an edge.
 */
const R_OUTER = 178;
const LEN_MIN = 14;
const LEN_MAX = 62;
/** The read head rides just outside that clean edge, circling the corpus. */
const R_SWEEP = R_OUTER + 9;
const TICK_WIDTH = 2.6;
/** The lit tick is drawn heavier, or it is one hairline among 119. */
const TICK_WIDTH_LIT = 3.6;
/**
 * How far the lit tick overshoots the outer edge. Weight and colour alone did
 * not find it: on the rendered page a heavier accent tick among 118 neighbours
 * at the same radius still had to be hunted for. Breaking the circle is the
 * one move the eye cannot miss, because the edge everywhere else is unbroken —
 * and it says the right thing, since the whole claim is that this is the file
 * that came out.
 */
const LIT_OVERSHOOT = 9;
/** Half the read head's arc, so it centres on its tick instead of trailing it. */
const HEAD_ARC = 0.055;
/**
 * Extra angular slots inserted at each skill boundary, in tick-widths. Large
 * enough that 19 groups are countable, small enough that the ring still reads
 * as one continuous body rather than 19 separate arcs.
 */
const GROUP_GAP_UNITS = 1.4;
/** Twelve o'clock, so the ring starts where a reader starts. */
const START_DEG = -90;

/**
 * Rounded, and the rounding is load-bearing rather than tidiness.
 *
 * Every coordinate here is computed on the server and again in the browser,
 * and `Math.cos`/`Math.sin` are not required to agree to the last bit across
 * V8 builds. They do not: Node emitted y=45.64271425367454 for one tick and
 * Chromium 45.64271425367457, and React reported a hydration mismatch on a
 * drawing that was pixel-identical. Three decimals on a 400-unit viewBox is
 * about a thousandth of a pixel — far below anything that can be seen — and it
 * removes the whole class rather than this one instance of it. Any SSR'd SVG
 * whose geometry comes out of trigonometry has this problem waiting in it.
 */
const round = (n: number): number => Math.round(n * 1000) / 1000;

interface Tick {
  ref: ReferenceRecord;
  /** Degrees clockwise from twelve o'clock. */
  angle: number;
  /** Fraction of one full turn, for the read head's dash offset. */
  turn: number;
  length: number;
}

function layout(references: ReferenceRecord[]): Tick[] {
  if (references.length === 0) return [];

  const maxTokens = references.reduce((m, r) => Math.max(m, r.tokens), 0);

  // One slot per reference, plus GROUP_GAP_UNITS extra at every skill change
  // — including the wrap from the last skill back to the first, so the ring
  // closes on a gap rather than butting two groups together.
  const skillAt = (i: number): string =>
    references[((i % references.length) + references.length) % references.length]?.skill ?? "";

  let slots = references.length;
  for (let i = 0; i < references.length; i += 1) {
    if (skillAt(i - 1) !== skillAt(i)) slots += GROUP_GAP_UNITS;
  }
  const step = 360 / slots;

  const ticks: Tick[] = [];
  let cursor = 0;
  for (let i = 0; i < references.length; i += 1) {
    const ref = references[i];
    if (ref === undefined) continue;
    if (skillAt(i - 1) !== ref.skill) cursor += GROUP_GAP_UNITS;
    const turn = (cursor * step) / 360;
    ticks.push({
      ref,
      angle: round(START_DEG + cursor * step),
      turn: round(turn),
      // Affine, not strictly proportional, and worth naming precisely
      // because this repo does not get to be loose about a drawing that
      // claims to be a measurement: length is LEN_MIN plus a share of the
      // remaining range, so the ORDER and the RELATIVE SPACING of the 119
      // files are exact while the shortest file still has a mark you can
      // see. A strictly proportional map puts the smallest at 2.3 units
      // against the largest at 62 and the bottom quartile disappears, which
      // would be a truer ratio and a worse drawing of it.
      length: round(LEN_MIN + (ref.tokens / maxTokens) * (LEN_MAX - LEN_MIN)),
    });
    cursor += 1;
  }
  return ticks;
}

const pointAt = (angleDeg: number, radius: number): [number, number] => {
  const rad = (angleDeg * Math.PI) / 180;
  return [round(CENTRE + radius * Math.cos(rad)), round(CENTRE + radius * Math.sin(rad))];
};

export function HeroCorpusRing({
  references,
  litSkill,
  litName,
  onHoverChange,
  className = "",
}: HeroCorpusRingProps): ReactElement {
  const ticks = useMemo(() => layout(references), [references]);
  const [hovered, setHovered] = useState<string | null>(null);

  /**
   * The read head's entrance. It starts one full turn behind its resting
   * place and arrives there — so the transition IS the traversal, with no
   * keyframes and no second state to keep in sync.
   *
   * `entered` flips in an effect rather than during render because the server
   * must emit the pre-entrance offset: a reader with JavaScript disabled then
   * keeps the ring, the ticks and the lit mark, and simply never sees the
   * head move. Motion is a layer here, never a gate.
   */
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = useMemo(
    () => references.reduce((sum, ref) => sum + ref.tokens, 0),
    [references],
  );

  const keyOf = (ref: ReferenceRecord): string => `${ref.skill}/${ref.name}`;
  const defaultKey = `${litSkill}/${litName}`;
  const activeKey = hovered ?? defaultKey;
  const active = ticks.find((t) => keyOf(t.ref) === activeKey) ?? ticks[0];

  const setActive = (ref: ReferenceRecord | null): void => {
    setHovered(ref === null ? null : keyOf(ref));
    onHoverChange?.(ref);
  };

  // `pathLength={1}` normalises the circle so the dash numbers are turns, not
  // user units — the geometry can change without the motion needing to.
  // The dash begins at path position `-offset`, so centring the head on its
  // tick means starting it half an arc early. It trailed the tick by a full
  // arc-length before this, which read as the head having overshot and stopped
  // just past what it was pointing at.
  const restingTurn = active === undefined ? 0 : active.turn;
  const restingOffset = round(HEAD_ARC / 2 - restingTurn);
  const offset = entered ? restingOffset : restingOffset - 1;

  return (
    <svg
      viewBox={`0 0 ${BOX} ${BOX}`}
      className={className}
      role="img"
      aria-label={
        `The pack's ${references.length} reference files drawn to scale as a ring, ` +
        `${total.toLocaleString("en-US")} tokens in total, grouped into ` +
        `${new Set(references.map((r) => r.skill)).size} skills. One is lit: ` +
        `${litSkill}/${litName}. The rest stay on disk until a request asks for them.`
      }
      onPointerLeave={() => setActive(null)}
    >
      {/* The track the read head rides. Hairline, decorative, and the only
          thing in this drawing that is not a measurement. */}
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={R_SWEEP}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={1}
      />

      {/* The read head. One property, one transition, one owner. The 0.055
          turn is its arc length — long enough to read as a direction of
          travel, short enough to point at a single tick when it stops. */}
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={R_SWEEP}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${HEAD_ARC} ${1 - HEAD_ARC}`}
        strokeDashoffset={offset}
        transform={`rotate(${START_DEG} ${CENTRE} ${CENTRE})`}
        className="[transition:stroke-dashoffset_1600ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      />

      {ticks.map((tick) => {
        const key = keyOf(tick.ref);
        const isActive = key === activeKey;
        const [x1, y1] = pointAt(tick.angle, isActive ? R_OUTER + LIT_OVERSHOOT : R_OUTER);
        const [x2, y2] = pointAt(tick.angle, R_OUTER - tick.length);
        return (
          <line
            key={key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeWidth={isActive ? TICK_WIDTH_LIT : TICK_WIDTH}
            data-corpus-mark
            data-lit={isActive ? "" : undefined}
            stroke={isActive ? "var(--color-accent)" : "var(--color-text-primary)"}
            // 0.3, not 0.22. At 0.22 against this warm ground the corpus read
            // as a smudge and the lit tick had nothing to be lit against;
            // measured on the rendered page, not chosen from the palette.
            strokeOpacity={isActive ? 1 : 0.34}
            // Pointer-only: see the component note. `onPointerEnter` rather
            // than `onMouseEnter` so a stylus and a trackpad behave alike, and
            // a touch tap lights a tick without needing a separate handler.
            onPointerEnter={() => setActive(tick.ref)}
            // `x1`/`y1` transition too, so the overshoot grows out of the
            // edge as the head arrives rather than snapping.
            className="transition-[stroke-opacity,stroke,stroke-width,x1,y1] duration-200 ease-out motion-reduce:transition-none"
          />
        );
      })}

      {/* What the head is pointing at, priced. Small on purpose — this is a
          label for the drawing, not a statistic competing with the headline,
          and every figure in it is read from the same JSON the ring is. */}
      {active !== undefined ? (
        <text
          x={CENTRE}
          y={CENTRE}
          textAnchor="middle"
          className="fill-text-muted font-mono text-[13px]"
        >
          <tspan x={CENTRE} dy="-0.35em" className="fill-text-primary">
            {active.ref.tokens.toLocaleString("en-US")}
          </tspan>
          <tspan x={CENTRE} dy="1.6em">
            tokens
          </tspan>
        </text>
      ) : null}
    </svg>
  );
}

export default HeroCorpusRing;
