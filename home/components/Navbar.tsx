"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { NAV, PRODUCT, REPO_URL } from "../lib/content";
import { focusRing, tapTarget } from "../lib/tokens";

export interface NavbarProps {
  version: string;
}

export function Navbar({ version }: NavbarProps): ReactElement {
  const [scrolled, setScrolled] = useState(false);

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
        </div>
      </div>
    </header>
  );
}

export default Navbar;
