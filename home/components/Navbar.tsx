"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { NAV, PRODUCT, REPO_URL } from "../lib/content";
import { cardShell, focusRing, tapTarget } from "../lib/tokens";

export interface NavbarProps {
  version: string;
}

export function Navbar({ version }: NavbarProps): ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  const closeMenu = (): void => {
    if (detailsRef.current !== null) detailsRef.current.open = false;
  };

  useEffect(() => {
    // Native <details> only closes on a link click or re-toggling the
    // hamburger — no Escape, no outside-click, which strands a mobile user
    // who taps elsewhere expecting the panel to dismiss like any other
    // overlay.
    const onPointerDown = (event: PointerEvent): void => {
      const node = detailsRef.current;
      if (node !== null && node.open && !node.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && detailsRef.current?.open) {
        closeMenu();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    // Coalesce a burst of scroll events into one read per frame: the listener
    // only schedules a frame, and the frame does the work. `scrolled` is a
    // boolean, so React already skips the re-render on every event but the two
    // that cross the threshold — the rAF guard keeps the handler itself from
    // doing more than that on a fast flick.
    let frame = 0;
    const onScroll = (): void => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 8);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-16 transition-colors duration-300 ease-out motion-reduce:transition-none ${
        scrolled ? "border-b border-border bg-bg-page/80 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-8">
        <a
          href="#top"
          data-metric
          className={`${tapTarget} ${focusRing} inline-flex items-center whitespace-nowrap rounded text-sm font-semibold text-text-primary`}
        >
          {PRODUCT}
        </a>

        {/* v2.2 measured the full row (logo + 6-item nav + badge + GitHub
            button) 90-190px over budget at 768px and moved the collapse point
            to lg: (1024px), where it had ~250px to spare — a real fix, but one
            that gave up the full nav across the whole 768-1023px tablet band.
            v2.3 claws part of that back instead of just re-measuring the same
            content at the same width: "Live check" shortened to "Checks" and
            each link's horizontal padding trimmed (px-3 → px-2.5) cut real
            width off the row itself, not just moved where it collapses. The
            version badge stays lg-only — it was never part of the 768px
            deficit since it was already hidden there.

            v2.3 didn't actually close the ~55px that remained — it stayed
            hidden as the logo link wrapping mid-word, because `whitespace`
            was still free to break. The fix for that wrap (#126) added
            `whitespace-nowrap` to the logo without removing `min-w-[44px]`
            (from the shared `tapTarget` class), and an explicit min-width
            overrides a flex item's automatic content-based minimum — so the
            same ~55px deficit just moved from "wraps onto two lines" to "the
            box shrinks 55px narrower than its own text and the text
            overflows it," which `pages:verify`'s per-element overflow check
            (not its page-level one — the row itself never grows past the
            viewport, only this one child's box does) now catches. This pass
            takes the lever named above: the GitHub button drops its visible
            label at md (icon + `aria-label` only) and returns it at lg
            (~35px), and nav item padding tightens once more, px-2.5 → px-2
            at md, restored at lg (~24px) — together enough to close the
            deficit without another wrap-vs-overflow trade. Re-verify with
            `pages:verify`'s 768px checks before trusting this fits; if it
            still clips, the version badge (already lg-only) and the logo's
            own `min-w-[44px]` floor are the remaining levers.

            v2.4 drops the nav to 5 items (`checks` removed from `NAV` in
            `lib/content.ts` — the section stays, only its own nav link is
            gone), so the padding trims above are now margin rather than the
            exact fit they were tuned for. Left as-is rather than re-widened:
            still correct, and re-loosening them is the first thing to try if
            a future nav item needs the room back. */}
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`${tapTarget} ${focusRing} inline-flex items-center whitespace-nowrap rounded-lg px-2 text-sm text-text-secondary transition-colors duration-150 ease-out hover:text-text-primary motion-reduce:transition-none lg:px-2.5`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span data-metric className="hidden rounded-full border border-border px-2.5 py-1 text-xs text-text-muted lg:inline-block">
            v{version}
          </span>
          <a
            href={REPO_URL}
            rel="noreferrer"
            aria-label="GitHub"
            className={`${tapTarget} ${focusRing} inline-flex items-center gap-2 rounded-lg border border-border-strong px-3 text-sm font-medium text-text-primary transition-colors duration-150 ease-out hover:border-accent hover:text-accent motion-reduce:transition-none lg:px-4`}
          >
            <GitHubIcon />
            <span className="hidden lg:inline">GitHub</span>
          </a>

          <details ref={detailsRef} data-disclosure className="relative md:hidden">
            <summary
              className={`${tapTarget} ${focusRing} flex items-center justify-center rounded-lg border border-border-strong text-text-primary`}
            >
              <span className="sr-only">Menu</span>
              <HamburgerIcon />
            </summary>
            <div className={`${cardShell} absolute right-0 top-full mt-2 w-56 p-2 shadow-lg`}>
              <nav aria-label="Sections" className="flex flex-col">
                {NAV.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={closeMenu}
                    className={`${focusRing} flex min-h-11 items-center rounded-lg px-3 text-sm text-text-secondary transition-colors duration-150 ease-out hover:bg-bg-surface hover:text-text-primary motion-reduce:transition-none`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div data-metric className="mt-1 border-t border-border px-3 pt-2.5 text-xs text-text-muted">
                v{version}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

/** Icon-only mark for the GitHub link at md; the label returns at lg once
    the row has room for it again (see the width-budget comment above). The
    link keeps `aria-label="GitHub"` at every width, so the icon never
    depends on the hidden text for its accessible name. */
function GitHubIcon(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/** Mobile-only nav trigger — paired with the `<details data-disclosure>`
    above it. Three static bars, never animates to an "X": the brief asks for
    restraint, not a state-change flourish on a control this small. */
function HamburgerIcon(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" strokeLinecap="round" />
    </svg>
  );
}

export default Navbar;
