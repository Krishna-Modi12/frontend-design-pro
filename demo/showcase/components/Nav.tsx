"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

interface NavLink {
  id: string;
  label: string;
}

const NAV: NavLink[] = [
  { id: "product", label: "Product" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Customers" },
];

const LINK =
  "inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-text-muted outline-none transition-colors duration-150 ease-out hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base motion-reduce:transition-none";

/**
 * The page had no persistent nav at all — the hero's own two CTAs
 * (`#pricing`, `#contact`) were the only way to move around, and once a
 * visitor scrolled past them there was nothing to jump back with. This is
 * `home/`'s and Bellwether's shared pattern (sticky header, `md:` full nav,
 * `<details>` disclosure below it) rebuilt against Wavelet's own dark tokens
 * rather than a shared component, since the three apps don't share a
 * component layer.
 */
export function Nav(): ReactElement {
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
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ease-out motion-reduce:transition-none ${
        scrolled ? "border-border bg-bg-base/85 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#"
          className="rounded font-mono text-lg font-semibold tracking-tight text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
        >
          wavelet
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={LINK}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-bg-base outline-none transition-colors duration-150 ease-out hover:bg-accent-dim focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base motion-reduce:transition-none md:inline-flex"
          >
            Talk to the team
          </a>

          <details ref={detailsRef} className="relative md:hidden">
            <summary
              className={`${LINK} min-w-11 justify-center rounded-lg border border-border px-0 [&::-webkit-details-marker]:hidden`}
            >
              <span className="sr-only">Menu</span>
              <HamburgerIcon />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-bg-surface p-2 shadow-lg">
              <nav aria-label="Sections" className="flex flex-col">
                {NAV.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={closeMenu}
                    className="flex min-h-11 items-center rounded-lg px-3 text-sm text-text-muted outline-none transition-colors duration-150 ease-out hover:bg-bg-raised hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={closeMenu}
                  className="mt-1 flex min-h-11 items-center rounded-lg bg-accent px-3 text-sm font-semibold text-bg-base"
                >
                  Talk to the team
                </a>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

/** Three static bars, never animates to an "X" — restraint on a control this small. */
function HamburgerIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M3 5.5h14M3 10h14M3 14.5h14" strokeLinecap="round" />
    </svg>
  );
}

export default Nav;
