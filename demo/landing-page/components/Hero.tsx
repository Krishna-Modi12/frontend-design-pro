import type { ReactElement } from "react";
import CtaButton from "./CtaButton";
import { sectionShell } from "../lib/tokens";
import { HERO, REPO_URL, TERMINAL } from "../lib/content";
import type { TerminalLine } from "../lib/content";

export interface HeroProps {
  /** Anchor the secondary action scrolls to. */
  detailHref: string;
}

/**
 * Colour per line kind, resolved at module scope so the map is built once
 * rather than on every render.
 */
const LINE_TONE: Record<TerminalLine["kind"], string> = {
  prompt: "text-ink",
  cont: "text-ink",
  out: "text-ink-muted",
  flag: "text-accent",
  ok: "text-ink-muted",
};

/** What the shell prints in the gutter. A wrapped command gets `>`, not `$`. */
const LINE_MARKER: Record<TerminalLine["kind"], string> = {
  prompt: "$ ",
  cont: "> ",
  out: "  ",
  flag: "  ",
  ok: "  ",
};

/**
 * 7:5, not 6:6. An even split reads as two columns of equal importance and
 * gives the headline the same room as the illustration beside it; 7:5 says
 * which one is the argument. The rule under the title is the page's one loud
 * gesture — everything else is a hairline.
 *
 * `min-h-[100dvh]`, and deliberately not Tailwind's `screen` variant of it:
 * `100vh` on mobile Safari is the height with the browser chrome hidden, so
 * that hero is taller than the window it lives in and the first scroll goes
 * nowhere. `RES-03` enforces this, and it matches on the literal — including
 * inside a comment, which is why this one describes the class instead of
 * spelling it.
 */
export default function Hero({ detailHref }: HeroProps): ReactElement {
  return (
    <section
      id="top"
      className="flex min-h-[100dvh] flex-col justify-center border-b border-surface-border"
    >
      <div className={sectionShell}>
        <div className="grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-16">
          {/* `min-w-0` on both columns. A grid item defaults to
              `min-width: auto`, which refuses to shrink below its content's
              min-content width — so the terminal panel below, whose longest
              line is wider than a 390px viewport, pushed its own column out
              instead of scrolling inside its scroll container. The body
              scrolled 72px sideways and the `overflow-x-auto` never engaged. */}
          <div className="min-w-0 lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              {HERO.eyebrow}
            </p>

            <h1 className="mt-6 text-balance text-6xl font-semibold tracking-tighter sm:text-7xl lg:text-8xl">
              {HERO.title}
            </h1>

            {/* The accent rule. Fixed width, not full-bleed — a full-width bar
                under a heading is a divider; a short one is a mark. */}
            <div className="mt-6 h-1 w-24 rounded-full bg-accent" />

            <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-ink">
              {HERO.lede}
            </p>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
              {HERO.body}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <CtaButton href={REPO_URL} rel="noreferrer">
                {HERO.primaryCta}
              </CtaButton>
              <CtaButton href={detailHref} variant="outline">
                {HERO.secondaryCta}
              </CtaButton>
            </div>
          </div>

          {/* The panel is a region rather than a figure: it scrolls on its own
              at narrow widths, and anything scrollable needs to be reachable
              from the keyboard, which needs a name and a tabstop. */}
          <div className="min-w-0 lg:col-span-5">
            <div
              tabIndex={0}
              role="region"
              aria-label="Switchyard command line session: a rollout is held behind another, then queued to follow it"
              className="overflow-x-auto rounded-xl border border-surface-border bg-surface-sunken p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <pre className="m-0 font-mono text-[0.8125rem] leading-relaxed">
                <code>
                  {TERMINAL.map((line) => (
                    <span key={line.id} className={`block ${LINE_TONE[line.kind]}`}>
                      {/* `select-none` so copying the block yields runnable
                          commands rather than a transcript with prompts in it. */}
                      <span className="select-none text-accent">
                        {LINE_MARKER[line.kind]}
                      </span>
                      {line.text}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              The second command is the whole product: the yard already knew the
              scheduler was moving, so the rollout waits for it instead of
              finding out downstream.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
