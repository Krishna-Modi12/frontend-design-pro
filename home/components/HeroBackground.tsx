"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useWorld } from "./WorldProvider";
import MeshGradient from "./backgrounds/MeshGradient";
import GrainOverlay from "./backgrounds/GrainOverlay";
import DotGrid from "./backgrounds/DotGrid";

export interface HeroBackgroundProps {
  className?: string;
}

/**
 * The hero's ground — the world's texture, and nothing else.
 *
 * **What this no longer does.** The version this replaces also painted a
 * full-bleed `linear-gradient` accent wash and, over it, a large radial scrim
 * of solid `bg-page`. The scrim existed because the animated scene sat
 * directly behind the headline and `pages:verify`'s axe pass kept catching
 * intermittent `color-contrast` failures — intermittent because they depended
 * on whatever colour the shader happened to be under the text that frame. It
 * worked, and it became the largest shape in the composition: a bug fix that
 * read as the design.
 *
 * Both are gone rather than restyled. The object now lives in its own grid
 * track beside the copy (`HeroObject`, placed by `Hero.tsx`) instead of
 * behind it, so there is nothing animated under the text to protect it from.
 * That also removes the last gradient this component owned — `home/DESIGN.md`
 * §2's sanction is narrower after this change, not wider.
 *
 * `mounted` holds the world switch back until after hydration: `useWorld()`
 * is already correct on the first CLIENT render, because the blocking script
 * in `app/layout.tsx` sets `data-world` on `<html>` before hydration and
 * `WorldProvider` reads it straight from the DOM — but the SERVER render has
 * no `document` and always falls back to `DEFAULT_WORLD_ID`. Switching on
 * `world.id` directly would make the hydration pass disagree with the
 * server-rendered HTML whenever the resolved world isn't `signature`.
 *
 * `signature` renders no ground at all here: its grain is a below-hero
 * surface treatment (`lib/tokens.ts`'s `--world-texture` channel), and the
 * hero's own ground is the bare page.
 */
export function HeroBackground({ className }: HeroBackgroundProps): ReactElement {
  const { world } = useWorld();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div aria-hidden="true" data-hero-scene className={className}>
      {mounted && world.id === "mesh" ? <MeshGradient /> : null}
      {mounted && world.id === "grain" ? <GrainOverlay /> : null}
      {mounted && world.id === "grid" ? <DotGrid /> : null}
    </div>
  );
}

export default HeroBackground;
