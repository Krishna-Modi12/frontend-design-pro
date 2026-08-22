import type { ReactElement, ReactNode } from "react";
import { cardShell } from "../lib/tokens";

/**
 * Six small, CSS-only preview cards — no React state per card, per the
 * brief's hard boundary. Each is a cheap illustrative mockup of a surface
 * this pack's other skills produce, built from the same OKLCH tokens as the
 * rest of the page. The "3D hero" card is a CSS `perspective()`/`rotate3d()`
 * illusion, not a second WebGL canvas — Three.js stays confined to the real
 * hero background.
 */
export function MockUIGallery(): ReactElement {
  return (
    <div data-mock-gallery className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <GalleryCard label="Landing page">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="h-2.5 w-3/5 rounded-full bg-bg-page" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-4/5 rounded-full bg-bg-page/70" />
            <div className="h-1.5 w-3/5 rounded-full bg-bg-page/70" />
          </div>
          <div className="h-6 w-20 rounded-full bg-accent" />
        </div>
      </GalleryCard>

      <GalleryCard label="Dashboard">
        <div className="grid h-full grid-rows-[1fr_auto] gap-1.5 p-4">
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded-md bg-bg-page" />
            <div className="rounded-md bg-bg-page" />
            <div className="rounded-md bg-bg-page" />
          </div>
          <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points="0,25 15,18 30,22 45,8 60,14 75,4 100,10"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </GalleryCard>

      <GalleryCard label="Kinetic type">
        <div className="flex h-full items-center justify-center overflow-hidden">
          <span className="flex gap-1.5">
            {["K", "I", "N", "E", "T", "I", "C"].map((letter, i) => (
              <span
                key={`${letter}-${i}`}
                data-display
                className="text-lg font-semibold text-text-primary [animation:kinetic-rise_2.4s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
      </GalleryCard>

      <GalleryCard label="Accessible form">
        <div className="flex h-full flex-col justify-center gap-2.5 p-4">
          <div className="h-1.5 w-1/3 rounded-full bg-text-muted/40" />
          <div
            className="h-7 rounded-md border-2 bg-bg-elevated"
            style={{ borderColor: "var(--color-accent)", boxShadow: "0 0 0 3px var(--color-accent-glow)" }}
          />
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded border-2 border-accent bg-accent">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
                <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="h-1.5 w-1/4 rounded-full bg-text-muted/40" />
          </div>
        </div>
      </GalleryCard>

      <GalleryCard label="3D hero">
        <div className="flex h-full items-center justify-center [perspective:400px]">
          <div className="relative h-14 w-14 [transform-style:preserve-3d] [animation:card-spin-3d_6s_linear_infinite]">
            <div className="absolute inset-0 rounded-lg bg-accent [transform:rotateY(0deg)_translateZ(20px)]" />
            <div className="absolute inset-0 rounded-lg bg-accent/60 [transform:rotateY(90deg)_translateZ(20px)]" />
            <div className="absolute inset-0 rounded-lg bg-accent/30 [transform:rotateX(90deg)_translateZ(20px)]" />
          </div>
        </div>
      </GalleryCard>

      <GalleryCard label="Color theme">
        <div className="flex h-full flex-col justify-center gap-3 p-4">
          <div className="flex gap-1.5">
            {[
              "oklch(30% 0.02 80)",
              "oklch(50% 0.12 45)",
              "oklch(65% 0.18 45)",
              "oklch(80% 0.1 60)",
              "oklch(94% 0.02 80)",
            ].map((color) => (
              <span key={color} className="h-6 flex-1 rounded-md" style={{ background: color }} />
            ))}
          </div>
          <div className="h-5 w-12 self-end rounded-full border border-border bg-bg-page" />
        </div>
      </GalleryCard>
    </div>
  );
}

function GalleryCard({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <div className={`${cardShell} flex h-[200px] flex-col overflow-hidden`}>
      <div aria-hidden="true" className="flex-1">
        {children}
      </div>
      <p className="border-t border-border px-3 py-2 text-xs text-text-muted">{label}</p>
    </div>
  );
}

export default MockUIGallery;
