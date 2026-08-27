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
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-16 transition-colors duration-300 ease-out motion-reduce:transition-none ${
        scrolled ? "border-b border-border bg-bg-page/80 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-8">
        <a href="#top" data-metric className={`${focusRing} rounded text-sm font-semibold text-text-primary`}>
          {PRODUCT}
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`${tapTarget} ${focusRing} inline-flex items-center rounded-lg px-3 text-sm text-text-secondary transition-colors duration-150 ease-out hover:text-text-primary motion-reduce:transition-none`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span data-metric className="hidden rounded-full border border-border px-2.5 py-1 text-xs text-text-muted sm:inline-block">
            v{version}
          </span>
          <a
            href={REPO_URL}
            rel="noreferrer"
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded-lg border border-border-strong px-4 text-sm font-medium text-text-primary transition-colors duration-150 ease-out hover:border-accent hover:text-accent motion-reduce:transition-none`}
          >
            GitHub
          </a>

          <details ref={detailsRef} data-disclosure className="relative sm:hidden">
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
                    className={`${focusRing} rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors duration-150 ease-out hover:bg-bg-surface hover:text-text-primary motion-reduce:transition-none`}
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
