"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { WORLDS, getWorld, isWorldId, DEFAULT_WORLD_ID } from "../lib/worlds";
import type { WorldDef, WorldId } from "../lib/worlds";

interface WorldContextValue {
  world: WorldDef;
  reroll: () => void;
}

const WorldContext = createContext<WorldContextValue | null>(null);

export function useWorld(): WorldContextValue {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error("useWorld must be used within WorldProvider");
  return ctx;
}

export interface WorldProviderProps {
  children: ReactNode;
}

/**
 * Reads the world the blocking `<script>` in `layout.tsx` already picked and
 * applied to `document.documentElement` — no flicker, the DOM is already
 * correct by the time this mounts. Owns the reroll mechanic: picks a new
 * world excluding the current one and every id already shown this session
 * (Impeccable's own rule for "Deal again" — nothing comes back reworded —
 * until the catalog is exhausted, then the excluded set resets).
 */
export function WorldProvider({ children }: WorldProviderProps): ReactElement {
  const [world, setWorld] = useState<WorldDef>(() => {
    if (typeof document === "undefined") return getWorld(DEFAULT_WORLD_ID);
    const current = document.documentElement.getAttribute("data-world");
    return isWorldId(current) ? getWorld(current) : getWorld(DEFAULT_WORLD_ID);
  });
  const shownRef = useRef<Set<WorldId>>(new Set([world.id]));

  const reroll = useCallback(() => {
    let pool = WORLDS.filter((candidate) => !shownRef.current.has(candidate.id));
    if (pool.length === 0) {
      shownRef.current = new Set();
      pool = WORLDS.filter((candidate) => candidate.id !== world.id);
    }
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (!next) return; // pool is never empty (WORLDS has 4 entries), guard only satisfies noUncheckedIndexedAccess
    shownRef.current.add(next.id);

    const root = document.documentElement;
    // Reduced motion: apply the swap with no transition rule active at all —
    // matching every other reduced-motion behavior already in the Hero
    // (the shader freezes to one frame rather than animating, particles
    // don't mount, the GSAP stagger is skipped, not slowed). The transition
    // itself lives in `tokens.ts`, scoped to this attribute so it never
    // lingers as a permanent `transition` on every element on the page.
    //
    // Read live via `matchMedia` here, at the moment of the click, rather
    // than from `useReducedMotion()`'s own state: that hook starts `false`
    // until its first effect commits (documented on the hook itself), and a
    // real-browser check found a reroll landing inside that window — before
    // the effect's `setReduced(true)` had propagated to this callback's
    // closure — could set `data-world-transitioning` even under
    // `prefers-reduced-motion: reduce`. The DOM/browser already knows the
    // true media-query value synchronously; asking it directly here removes
    // the race instead of trying to win it.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      root.setAttribute("data-world-transitioning", "");
      window.setTimeout(() => root.removeAttribute("data-world-transitioning"), 300);
    }
    root.setAttribute("data-world", next.id);
    root.style.setProperty("--color-accent", next.accent);
    root.style.setProperty("--color-accent-ink", next.accentInk);
    root.style.setProperty("--color-accent-glow", next.accentGlow);
    try {
      sessionStorage.setItem("fdp-world", next.id);
    } catch {
      // sessionStorage can throw in a locked-down/private context — the
      // in-memory state below still updates; only cross-reload persistence
      // within the same tab is lost, which is an acceptable degrade.
    }
    setWorld(next);
  }, [world.id]);

  return <WorldContext.Provider value={{ world, reroll }}>{children}</WorldContext.Provider>;
}

export default WorldProvider;
