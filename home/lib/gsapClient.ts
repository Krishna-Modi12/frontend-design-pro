"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One registration point. `gsap.registerPlugin` is idempotent, but centralizing
 * it means every consumer imports from here rather than each registering its
 * own copy — the pattern `demo/landing-page` uses for its own single-purpose
 * lib modules.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
