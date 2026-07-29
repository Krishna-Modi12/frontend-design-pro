"use client";

import { useRef, useState, type PointerEvent } from "react";

export interface BentoFeature {
  id: string;
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
  span: "wide" | "tall" | "large" | "small";
}

export interface BentoGridProps {
  features: BentoFeature[];
}

function SpotlightCard({ feature }: { feature: BentoFeature }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const spanClasses: Record<BentoFeature["span"], string> = {
    wide: "sm:col-span-2",
    tall: "sm:row-span-2",
    large: "sm:col-span-2 sm:row-span-2",
    small: "",
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-bg-surface p-6 sm:p-8 ${spanClasses[feature.span]}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(circle 220px at ${position.x}% ${position.y}%, var(--color-accent-glow), transparent 70%)`,
        }}
      />
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary sm:text-xl">{feature.title}</h3>
          <p className="mt-2 text-sm text-text-muted sm:text-base">{feature.description}</p>
        </div>
        {feature.stat ? (
          <div>
            <span className="font-mono text-3xl tabular-nums text-accent sm:text-4xl">
              {feature.stat}
            </span>
            {feature.statLabel ? (
              <span className="mt-1 block text-xs uppercase tracking-wide text-text-faint">
                {feature.statLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Asymmetric feature grid — deliberately unequal card spans, each with a
 * cursor-tracked spotlight glow driven by pointer position, not CSS :hover alone.
 */
export function BentoGrid({ features }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:auto-rows-[minmax(160px,auto)]">
      {features.map((feature) => (
        <SpotlightCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
