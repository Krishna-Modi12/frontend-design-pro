import type { ReactElement } from "react";
import { sectionShell, sectionSpacing } from "../lib/tokens";

export interface EnforcedRule {
  /** The constraint ID the suite actually reports. Printed, so it can be checked. */
  id: string;
  /** Which of the two suites owns it — the AST parser, or the regex pass. */
  enforcer: "AST" | "regex";
  rule: string;
  detail: string;
}

export interface ConstraintWallProps {
  rules: EnforcedRule[];
  /** Total machine-enforced constraints, so the sample is not read as the whole. */
  totalConstraints: number;
}

/**
 * Every ID here was read out of `core/validate-checklist.md` and matched against
 * the suite that reports it — three from `scripts/parser_constraints.js`, three
 * from `scripts/test_constraints.py`. Nothing is listed that the chain does not
 * actually enforce: a wall of invented rule IDs on a page whose whole argument
 * is "verified rather than asserted" would disprove the argument.
 */
export default function ConstraintWall({
  rules,
  totalConstraints,
}: ConstraintWallProps): ReactElement {
  return (
    <section id="rules" className={sectionShell}>
      <div className={sectionSpacing}>
        <div className="rounded-2xl border border-surface-border bg-surface-elevated p-8 lg:p-12">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Machine-enforced rules
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-ink-muted">
            Six of {totalConstraints}. They run on every example in the pack, and on
            this page — the ID beside each one is what the suite prints when it
            fails, so you can run it yourself and compare.
          </p>

          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {/* One <div> per group, holding a <dt> and its <dd>s and nothing
                else. The mark lives inside the <dt> rather than beside it: a
                <div> inside a <dl> may only contain term groups, so an <svg>
                sitting next to that wrapper takes every <dt> and <dd> under it
                out of the list as far as a screen reader is concerned. */}
            {rules.map((rule: EnforcedRule) => (
              <div key={rule.id}>
                <dt className="flex items-start gap-3 text-sm font-semibold text-ink">
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  >
                    <path
                      d="M2 8l4 4 8-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {rule.rule}
                </dt>
                <dd className="mt-1.5 ps-7 text-xs leading-relaxed text-ink-muted">
                  {rule.detail}
                </dd>
                <dd className="mt-2 flex items-center gap-2 ps-7">
                  <code
                    data-metric="true"
                    className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs text-accent"
                  >
                    {rule.id}
                  </code>
                  <span className="text-xs text-ink-faint">{rule.enforcer}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
