import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import data from "../lib/data.generated.json";
import type { GeneratedData } from "../lib/data.types";
import { DEFAULT_WORLD_ID, WORLDS } from "../lib/worlds";

/**
 * The world pick has to happen before hydration, not in a `useEffect` — this
 * app is a static export (see `next.config.ts`: `output: "export"` whenever
 * `NEXT_OUTPUT_EXPORT=1`, which the Pages deploy sets), so there is no server
 * at request time to read a cookie or a query param and render the right
 * world server-side. A post-hydration swap would flash the default world
 * first, which is worse here than typical dark-mode theming: the hero's scene
 * (the WebGL hero object this replaced) read `--color-accent` once at
 * construction, so a
 * late swap would need an extra imperative push just to take effect.
 *
 * This is the same technique `next-themes` uses to avoid a dark-mode flash:
 * a plain, synchronous `<script>` — not a module, not `next/script` — runs
 * during HTML parsing, before React hydrates, and sets `data-world` plus the
 * three accent custom properties directly on `document.documentElement`.
 * It's safe from a hydration-mismatch warning for the same reason
 * `next-themes`' own `class="dark"` is: nothing in this component tree
 * renders or reads `data-world` as a controlled attribute, so React's
 * reconciler has nothing to diff it against.
 *
 * Resolution order, highest precedence first: `?world=<id>` URL param (the
 * deterministic override every automated check and screenshot recapture
 * uses) → `sessionStorage` seed (picked once, stable for the visit) →
 * `DEFAULT_ID`. A first-run critique flagged the prior behaviour here — a
 * uniform random pick across all four worlds on every fresh session — as a
 * real defect, not a feature: `DESIGN.md` documents the accent as "one
 * chromatic hue," and three of the four worlds are not that hue, so a
 * returning visitor, a shared screenshot, or a README badge had a 75% chance
 * of disagreeing with what the page actually showed. The catalog and the
 * reroll mechanic below are unchanged — a visitor who wants a different world
 * still gets one, just by choosing it, not by chance. Wrapped in try/catch —
 * sessionStorage can throw in a locked-down/private context, and that must
 * never block paint.
 */
const WORLD_SCRIPT = `(function(){try{
var WORLDS=${JSON.stringify(
  WORLDS.map((world) => ({
    id: world.id,
    accent: world.accent,
    accentInk: world.accentInk,
    accentGlow: world.accentGlow,
  })),
).replace(/</g, "\\u003c")};
var DEFAULT_ID=${JSON.stringify(DEFAULT_WORLD_ID)};
function isValid(id){return WORLDS.some(function(w){return w.id===id;});}
var id=null;
var fromUrl=new URLSearchParams(window.location.search).get("world");
if(fromUrl&&isValid(fromUrl)){id=fromUrl;}
else{
  var stored=sessionStorage.getItem("fdp-world");
  if(stored&&isValid(stored)){id=stored;}
  else{id=DEFAULT_ID;}
}
sessionStorage.setItem("fdp-world",id);
var world=WORLDS.filter(function(w){return w.id===id;})[0]||WORLDS.filter(function(w){return w.id===DEFAULT_ID;})[0];
var root=document.documentElement;
root.setAttribute("data-world",world.id);
root.style.setProperty("--color-accent",world.accent);
root.style.setProperty("--color-accent-ink",world.accentInk);
root.style.setProperty("--color-accent-glow",world.accentGlow);
}catch(e){}})();`;

/**
 * Geist self-hosts, which is the property that matters here:
 * `next/font/google` reaches out to fonts.googleapis.com at build time, and
 * this app is built repeatedly in CI (the Pages deploy, the screenshot
 * harness, the verify harness) on runners where a cold font fetch is one more
 * thing that can fail for reasons unrelated to the page. `demo/landing-page`
 * made the same call for the same reason.
 */
/**
 * Composed from `data.generated.json` rather than typed out. Gate 11's `SCAN`
 * covers `home/components/*.tsx` and `home/lib/*.ts` but not `home/app/*.tsx`,
 * so a figure hand-written here is checked by nothing — and one was wrong:
 * this description claimed the output was held to 60 machine-checked
 * constraints against a real figure of 61, and shipped that way because the
 * only thing that could have caught it does not read this file. Building the
 * sentence from the payload removes the second copy of the number instead of
 * correcting it and waiting for the next drift.
 */
const { skills, ciConstraints, releaseGates } = (data as GeneratedData).figures;

export const metadata: Metadata = {
  title: "frontend-design-pro — the design rules an AI agent actually follows",
  description:
    `A skill pack an AI coding agent loads while it writes frontend code. It routes ` +
    `one of ${skills} skills per request, holds the output to ${ciConstraints} ` +
    `machine-checked constraints, and ships only when all ${releaseGates} gates pass. ` +
    `Route a request and run the checks in your browser.`,
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      {/* The `suppressHydrationWarning` above is required, not decorative —
          `WORLD_SCRIPT` mutates THIS element's own `data-world` attribute and
          inline `style` before hydration, and React's hydration pass diffs
          the live DOM's actual attribute list against this JSX regardless of
          whether anything reads them back, so those two script-added
          attributes read as a mismatch without it. This is the exact fix
          `next-themes` documents for its own `class="dark"` pattern — the
          suppression has to sit on the element the script touches, not on
          the `<script>` tag itself (that one suppresses nothing relevant,
          since a `<script>` element's own children/attributes never
          mismatch). Confirmed against a real dev-server console pass across
          all 4 worlds before this fix — see `lib/worlds.ts` for the catalog. */}
      <body className="bg-bg-page text-text-primary antialiased">
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: WORLD_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
