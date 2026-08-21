"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { RULES, SNIPPETS, runRules } from "../lib/checkerRules";
import { cardShell, cardInset, focusRing, tapTarget } from "../lib/tokens";

/**
 * The live constraint checker — ported from `.github/pages/app.js`'s
 * `initChecker`. Paste (or edit) a component and the findings re-run as you
 * type, debounced at 180ms so a fast typist isn't running the whole rule set
 * on every keystroke.
 */
export function CheckerPanel(): ReactElement {
  const [code, setCode] = useState<string>(SNIPPETS.bad);
  const [active, setActive] = useState<"bad" | "good">("bad");
  const findings = useMemo(() => runRules(code), [code]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${cardShell} flex flex-col`}>
        <div className={`${cardInset} flex flex-wrap items-center gap-2 border-b border-border`}>
          {(["bad", "good"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={active === key}
              data-snippet={key}
              onClick={() => {
                setActive(key);
                setCode(SNIPPETS[key]);
              }}
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
        <label className={`${cardInset} flex flex-1 flex-col`}>
          <span className="text-sm font-medium text-text-secondary">
            Edit it — the checks re-run as you type
          </span>
          <textarea
            value={code}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            onChange={(e) => setCode(e.target.value)}
            data-check-input
            className={`${focusRing} mt-2 min-h-[22rem] flex-1 resize-none rounded-lg border border-border-strong bg-bg-elevated p-4 font-mono text-sm text-text-primary`}
          />
        </label>
      </div>

      <div className={`${cardShell} ${cardInset}`}>
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

        <div className="mt-4 space-y-3" data-findings>
          {findings.length === 0 ? (
            <article className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-bg-surface px-1.5 py-0.5 text-xs font-semibold text-text-muted">
                  PASS
                </span>
                <span className="text-xs text-text-muted">component mode</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Nothing here trips the constraints ported to the browser. The full chain adds
                the AST half and the page-scoped rules on top of these.
              </p>
            </article>
          ) : (
            findings.map((found) => (
              <article key={found.rule.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <span data-metric className="finding-id rounded bg-accent-glow px-1.5 py-0.5 text-xs font-semibold text-text-primary">
                    {found.rule.id}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-text-muted">
                    {found.rule.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{found.rule.desc}</p>
                <code className="mt-2 block [overflow-wrap:anywhere] rounded bg-bg-surface px-2 py-1 font-mono text-xs text-text-primary">
                  {found.evidence.trim().slice(0, 160)}
                </code>
              </article>
            ))
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          <strong className="text-text-secondary">{RULES.length} of the 43 regex checks</strong> run here.
          The rest need a compiler or a filesystem: the other half of the suite walks a
          TypeScript AST, and eight page-scoped rules are deliberately excluded because they
          are right about a screen and wrong about a fragment pasted into a text box. Their
          IDs are absent here rather than approximated.
        </p>
      </div>
    </div>
  );
}

export default CheckerPanel;
