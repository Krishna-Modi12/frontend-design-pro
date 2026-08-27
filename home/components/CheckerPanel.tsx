"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactElement, UIEvent } from "react";
import { RULES, SNIPPETS, runRules } from "../lib/checkerRules";
import type { CheckerRule } from "../lib/checkerRules";
import { cardShell, cardInset, focusRing, tapTarget } from "../lib/tokens";
import { severityColor, severityRank } from "../lib/severity";
import FindingRow from "./FindingRow";

type SnippetKey = "bad" | "good";

export function CheckerPanel(): ReactElement {
  const [code, setCode] = useState<string>(SNIPPETS.bad);
  const [active, setActive] = useState<SnippetKey>("bad");
  const [justSwapped, setJustSwapped] = useState(false);
  const findings = useMemo(() => runRules(code), [code]);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => code.split("\n"), [code]);

  /* Presentation-only: which line each finding's matched evidence falls on,
     derived from `runRules()`'s existing output rather than changing its
     shape. A `source?: (code)=>string` rule (SLOP-01/05) strips comments
     before matching, but only replaces comment text with spaces — the
     matched evidence itself still appears verbatim in the raw `code`, so
     `indexOf` against the unstripped string still finds it. */
  const lineSeverity = useMemo(() => {
    const map = new Map<number, CheckerRule["severity"]>();
    for (const found of findings) {
      const idx = code.indexOf(found.evidence);
      if (idx === -1) continue;
      const lineNo = code.slice(0, idx).split("\n").length - 1;
      const existing = map.get(lineNo);
      if (!existing || severityRank(found.rule.severity) > severityRank(existing)) {
        map.set(lineNo, found.rule.severity);
      }
    }
    return map;
  }, [code, findings]);

  function swapTo(key: SnippetKey): void {
    setActive(key);
    setCode(SNIPPETS[key]);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      setJustSwapped(true);
      window.setTimeout(() => setJustSwapped(false), 260);
    }
  }

  function syncGutterScroll(e: UIEvent<HTMLTextAreaElement>): void {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }

  return (
    <div className={`${cardShell} flex flex-col`}>
      <div className={`${cardInset} flex flex-wrap items-center gap-2 border-b border-border`}>
        {(["bad", "good"] as SnippetKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={active === key}
            data-snippet={key}
            onClick={() => swapTo(key)}
            className={`${tapTarget} ${focusRing} rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150 ease-out motion-reduce:transition-none ${
              active === key
                ? "border-accent bg-accent-glow text-text-primary"
                : "border-border text-text-secondary hover:border-border-strong"
            }`}
          >
            {key === "bad" ? "What agents write" : "What the pack asks for"}
          </button>
        ))}
      </div>

      <label className={`${cardInset} flex flex-col border-b border-border`}>
        <span className="text-sm font-medium text-text-secondary">
          Edit it — the checks re-run as you type
        </span>
        <div
          className={`mt-2 flex min-h-[22rem] overflow-hidden rounded-lg border border-border-strong bg-bg-elevated transition-shadow duration-300 ease-out motion-reduce:transition-none ${
            justSwapped ? "ring-2 ring-accent" : ""
          }`}
        >
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="select-none overflow-hidden border-r border-border bg-bg-surface px-2 py-4 font-mono text-xs leading-6 text-text-muted"
          >
            {lines.map((_, i) => (
              <div key={i} className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: lineSeverity.has(i) ? severityColor(lineSeverity.get(i) as CheckerRule["severity"]) : "transparent",
                  }}
                />
                <span>{i + 1}</span>
              </div>
            ))}
          </div>
          <textarea
            value={code}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            onChange={(e) => setCode(e.target.value)}
            onScroll={syncGutterScroll}
            data-check-input
            className={`${focusRing} min-w-0 flex-1 resize-none whitespace-pre overflow-auto border-0 bg-transparent p-4 font-mono text-xs leading-6 text-text-primary`}
          />
        </div>
      </label>

      <div className={cardInset}>
        <div
          className={`flex items-baseline gap-2 rounded-lg border px-4 py-3 ${
            findings.length ? "border-accent/40 bg-accent-glow" : "border-border bg-bg-surface"
          }`}
          data-check-verdict
          aria-live="polite"
        >
          <span data-metric className="verdict-count text-2xl font-semibold text-text-primary">
            {findings.length}
          </span>
          <span className="text-sm text-text-secondary">
            {findings.length
              ? `${findings.length === 1 ? "check fails" : "checks fail"} of ${RULES.length} running here`
              : `all ${RULES.length} checks running here pass`}
          </span>
        </div>

        <div className="mt-4 space-y-2" data-findings>
          {findings.length === 0 ? (
            <article className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-bg-surface px-1.5 py-0.5 text-xs font-semibold text-text-muted">PASS</span>
                <span className="text-xs text-text-muted">component mode</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Nothing here trips the constraints ported to the browser.
              </p>
            </article>
          ) : (
            findings.map((found) => <FindingRow key={found.rule.id} finding={found} />)
          )}
        </div>

        <p className="mt-4 text-sm text-text-muted">
          <span data-metric>{RULES.length}</span> of 44 checks run in-browser — the rest need a compiler or filesystem.
        </p>
      </div>
    </div>
  );
}

export default CheckerPanel;
