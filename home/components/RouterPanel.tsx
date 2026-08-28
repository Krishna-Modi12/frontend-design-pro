"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { route } from "../lib/router";
import { ROUTER_DEFAULT_REQUEST, ROUTER_EXAMPLES } from "../lib/content";
import type { SkillRecord, Figures } from "../lib/data.types";
import { cardInset, focusRing, tapTarget } from "../lib/tokens";
import SkillPreviewThumbnail from "./SkillPreviewThumbnail";
import useTokenCountdown from "../lib/useTokenCountdown";

export interface RouterPanelProps {
  skills: SkillRecord[];
  figures: Figures;
}

const fmt = new Intl.NumberFormat("en-US");

/**
 * The live registry router — ported from `.github/pages/app.js`'s
 * `initRouter`, which this page's `#router` section carried before `home/`
 * replaced it. Same contract, restated for React: this runs the REAL
 * registry (trigger keywords, deps, budgets are generated from the
 * repository, not written for the demo), and it does the part most demos
 * skip — no keyword match, and it refuses to guess.
 */
export function RouterPanel({ skills, figures }: RouterPanelProps): ReactElement {
  const [request, setRequest] = useState(ROUTER_DEFAULT_REQUEST);
  const result = useMemo(() => route(skills, request), [skills, request]);

  return (
    <div className="overflow-hidden">
      <div className={`${cardInset} border-b border-border bg-bg-surface`}>
        <label className="block">
          <span className="text-sm font-medium text-text-secondary">
            What are you asking your agent to build?
          </span>
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            data-route-input
            className={`${focusRing} mt-2 w-full rounded-lg border border-border-strong bg-bg-elevated px-4 py-3 text-base text-text-primary`}
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Try</span>
          {ROUTER_EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => setRequest(example.request)}
              data-example={example.request}
              className={`${tapTarget} ${focusRing} rounded-full border border-border px-3 py-1 text-sm text-text-secondary transition-colors duration-150 ease-out hover:border-accent hover:text-text-primary motion-reduce:transition-none`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cardInset} data-route-output data-route-kind={result.kind} aria-live="polite">
        <RouteOutput result={result} figures={figures} />
      </div>
    </div>
  );
}

function RouteOutput({
  result,
  figures,
}: {
  result: ReturnType<typeof route>;
  figures: Figures;
}): ReactElement {
  if (result.kind === "none") {
    return (
      <Ask message="No trigger keyword matched, so the pack asks one clarifying question rather than guessing — step 7 of the loading protocol, and the behaviour is the contract, not a gap. Name a surface and it will route: a form, a table, a hero, a theme, a 3D scene." />
    );
  }

  if (result.kind === "ambiguous") {
    const [a, b] = result.between;
    return (
      <Ask
        message={`Two skills match equally well — ${a.id} and ${b.id}. The pack states which it picked and why, or asks which you meant. It does not choose silently.`}
      />
    );
  }

  const { skill, hits } = result;
  const depth = figures.referenceDepthTokens || 0;
  const pct = depth ? Math.round((skill.budget / depth) * 1000) / 10 : 0;
  const fillPct = Math.max(pct, 0.4);
  const countdownRef = useTokenCountdown([depth, figures.registryTokens, skill.budget]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2.5">
          <SkillPreviewThumbnail group={skill.group} />
          <span data-metric data-route-id className="text-lg font-semibold text-accent">
            {skill.id}
          </span>
        </span>
        <span className="text-xs uppercase tracking-wide text-text-muted">
          one skill · most specific wins
        </span>
      </div>
      <p className="mt-2 text-sm text-text-secondary">{skill.covers}</p>

      <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
        <span className="uppercase tracking-wide">narrowing the cost</span>
        <span data-metric ref={countdownRef} className="font-mono text-sm font-semibold text-accent">
          {fmt.format(depth)}
        </span>
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">What loads</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            <FileRow tag="registry" path="SKILL.md" />
            <FileRow tag="skill" path={skill.path} />
            {skill.deps.map((dep) => (
              <FileRow key={dep} tag="core" path={dep} />
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">What it costs</h4>
          <p className="mt-2">
            <span data-metric className="text-2xl font-medium text-text-primary">
              {fmt.format(skill.budget)}
            </span>{" "}
            <span className="text-sm text-text-muted">tokens — {pct}% of the depth available</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent" style={{ width: `${fillPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-text-muted">
            this request <span data-metric className="font-medium text-text-secondary">{fmt.format(skill.budget)}</span> of{" "}
            {fmt.format(depth)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {hits.length === 1 ? "Matched on this trigger" : "Matched on these triggers"}
        </h4>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {hits.map((k) => (
            <span key={k} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary">
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FileRow({ tag, path }: { tag: string; path: string }): ReactElement {
  return (
    <li className="flex items-center gap-2">
      <span className="rounded border border-border px-1.5 py-0.5 text-xs uppercase tracking-wide text-text-muted">
        {tag}
      </span>
      <span data-metric className="text-text-secondary">
        {path}
      </span>
    </li>
  );
}

function Ask({ message }: { message: string }): ReactElement {
  return (
    <p className="text-sm leading-relaxed text-text-secondary">
      <span className="mr-2 rounded-full border border-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent">
        asks
      </span>
      {message}
    </p>
  );
}

export default RouterPanel;
