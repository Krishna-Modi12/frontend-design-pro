"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { ReferenceRecord } from "../lib/data.types";

export interface HeroCorpusProps {
  references: ReferenceRecord[];
  /** The reference the default state lights. Named by the hero's caption. */
  litSkill: string;
  litName: string;
  onHoverChange?: (record: ReferenceRecord | null) => void;
  className?: string;
}

/**
 * The reference corpus, drawn to scale.
 *
 * **What replaced what, and why.** This is the third hero visual, and the
 * second built from this same data. The one before it extruded the 119
 * references as strata of a WebGL slab: same idea, and it did not survive
 * contact with a reader. Three failures, all of them visible in a screenshot:
 * the object rendered as an anonymous grey brick with no material and no
 * ground, so it read as unfinished; its strata were sub-pixel at most sizes
 * and shimmered, which reads as a rendering fault rather than a texture; and
 * critically, nothing about it was legible AS the corpus — you could not tell
 * it was 119 files, could not tell one from another, and could not read the
 * claim the sentence beside it was making. It cost a whole `three` runtime to
 * communicate nothing.
 *
 * The concept was never the problem. The medium was. So the strata stayed and
 * the slab went.
 *
 * **The composition is a page of type seen from across a room.** Marks flow
 * left to right and wrap, one per reference, width proportional to that
 * file's real token count, with a wider gap between skills so the 19 groups
 * read as paragraphs. That shape is not decoration: this pack's whole claim is
 * that it is a *document* an agent reads a fraction of, and a block of set
 * text is what that looks like. Nothing here is sampled, rounded or invented —
 * `tokens` is the repo's canonical measure and the generator asserts both the
 * count and the sum against `check_figures.py --truth` before writing the
 * JSON, so this drawing cannot disagree with the figures in the sentence next
 * to it.
 *
 * **One mark is lit, and you can point at any of the others.** The default
 * state lights the single reference the caption names. Hovering any other mark
 * lights that one instead and reports its real cost, which is the honest
 * demonstration of the architecture: every one of these is a file the agent
 * did *not* load, and the reader can price each one by touching it.
 *
 * **It is one image to a screen reader, not 119 tab stops.** A hero that
 * inserts 119 focusable nodes ahead of the primary action is hostile whatever
 * its intentions, so the figure carries a text alternative stating the real
 * numbers and the hover is a pointer-only enhancement. The same facts are in
 * the paragraph beside it and in `#how-it-works` below, reachable without ever
 * touching this graphic.
 */

/** Virtual layout box. The SVG scales; these are ratios, not pixels. */
const BOX_W = 400;
const BAR_H = 7;
const LINE_PITCH = 15;
const GAP_WITHIN = 4;
const GAP_BETWEEN = 14;
/** Tokens per virtual pixel. Chosen so the whole corpus fills the track. */
const SCALE = 40;
const MIN_W = 5;

interface Mark {
  ref: ReferenceRecord;
  x: number;
  y: number;
  w: number;
}

function layout(references: ReferenceRecord[]): { marks: Mark[]; height: number } {
  const marks: Mark[] = [];
  let x = 0;
  let line = 0;
  let previousSkill: string | null = null;

  for (const ref of references) {
    const w = Math.max(MIN_W, ref.tokens / SCALE);
    const gap = previousSkill === null ? 0 : previousSkill === ref.skill ? GAP_WITHIN : GAP_BETWEEN;

    // A mark never breaks across lines — a reference is one file, so it is one
    // unbroken bar. When the remainder of a line cannot hold it, the line ends
    // there, exactly the way a word sets.
    if (x + gap + w > BOX_W && x > 0) {
      line += 1;
      x = 0;
      marks.push({ ref, x, y: line * LINE_PITCH, w });
      x = w;
    } else {
      const at = x === 0 ? 0 : x + gap;
      marks.push({ ref, x: at, y: line * LINE_PITCH, w });
      x = at + w;
    }
    previousSkill = ref.skill;
  }

  return { marks, height: (line + 1) * LINE_PITCH - (LINE_PITCH - BAR_H) };
}

export function HeroCorpus({
  references,
  litSkill,
  litName,
  onHoverChange,
  className = "",
}: HeroCorpusProps): ReactElement {
  const { marks, height } = useMemo(() => layout(references), [references]);
  const [hovered, setHovered] = useState<string | null>(null);

  const total = useMemo(
    () => references.reduce((sum, ref) => sum + ref.tokens, 0),
    [references],
  );

  const keyOf = (ref: ReferenceRecord): string => `${ref.skill}/${ref.name}`;
  const defaultKey = `${litSkill}/${litName}`;
  const activeKey = hovered ?? defaultKey;

  const setActive = (ref: ReferenceRecord | null): void => {
    setHovered(ref === null ? null : keyOf(ref));
    onHoverChange?.(ref);
  };

  return (
    <svg
      viewBox={`0 0 ${BOX_W} ${height}`}
      className={className}
      role="img"
      aria-label={
        `The pack's ${references.length} reference files drawn to scale, ` +
        `${total.toLocaleString("en-US")} tokens in total, grouped into ` +
        `${new Set(references.map((r) => r.skill)).size} skills. One is lit: ` +
        `${litSkill}/${litName}. The rest stay on disk until a request asks for them.`
      }
      onPointerLeave={() => setActive(null)}
    >
      {marks.map((mark) => {
        const key = keyOf(mark.ref);
        const isActive = key === activeKey;
        return (
          <rect
            key={key}
            x={mark.x}
            y={mark.y}
            width={mark.w}
            height={BAR_H}
            rx={1}
            data-corpus-mark
            data-lit={isActive ? "" : undefined}
            fill={isActive ? "var(--color-accent)" : "var(--color-text-primary)"}
            opacity={isActive ? 1 : 0.22}
            // Pointer-only: see the component note. `onPointerEnter` rather
            // than `onMouseEnter` so a stylus and a trackpad behave alike, and
            // a touch tap lights a mark without needing a separate handler.
            onPointerEnter={() => setActive(mark.ref)}
            className="transition-[opacity,fill] duration-200 ease-out motion-reduce:transition-none"
          />
        );
      })}
    </svg>
  );
}

export default HeroCorpus;
