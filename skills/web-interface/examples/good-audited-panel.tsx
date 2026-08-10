// GOLD: the craft pass — the Core Rules of this skill, all held at once.
//
// `web-interface` is a review skill, so its other three examples are all
// anti-examples: `bad-generic.tsx` (slop), `bad-inaccessible.tsx` (a11y) and
// `bad-drive-by-refactoring.tsx` (scope). Between them they show everything a
// review rejects and nothing it accepts, which leaves "make this feel more
// finished" with no worked answer. This is that answer, at component scale —
// the craft rules, not another landing page (`skills/landing-pages/` owns those).
//
// Source doctrine: references/web-interface-guidelines.md.
//   • Rule 1, surface craft — two shadow layers (ambient + direct), a border in
//     the surface's own hue rather than neutral grey, concentric radii.
//   • Rule 2, interaction increases contrast — every hover and focus state is
//     *more* contrasted than rest. A hover that dims is the common bug.
//   • Rule 5, typography detail — "…" not "...", `tabular-nums` on every numeric
//     column so digits stop jittering between rows, `text-balance` on headings.
//   • Rule 6, overflow is handled — a flex child needs `min-w-0` or `truncate`
//     silently does nothing. This is the single most frequent review finding.
//   • Rule 10, locale — `Intl` formatters, never hand-rolled date or size
//     strings; `translate="no"` on branch names and SHAs, which machine
//     translation will cheerfully rewrite into something that cannot resolve.
import * as React from "react";

/* ── data ─────────────────────────────────────────────────────────────────── */

export type DeploymentStatus = "ready" | "building" | "failed";

export interface Deployment {
  id: string;
  branch: string;
  sha: string;
  message: string;
  status: DeploymentStatus;
  bytes: number;
  durationMs: number;
  /** ISO 8601. Formatted at render by `Intl`, never stored pre-formatted. */
  at: string;
}

const DEPLOYMENTS: readonly Deployment[] = [
  {
    id: "dpl_7c41",
    branch: "main",
    sha: "a3f9c21",
    message: "Cache the registry lookup so cold starts stop reading the manifest twice",
    status: "ready",
    bytes: 4_217_344,
    durationMs: 47_200,
    at: "2026-08-10T14:12:09Z",
  },
  {
    id: "dpl_7c3f",
    branch: "release/pricing-table",
    sha: "b81e004",
    message: "Pricing figures render tabular-nums",
    status: "building",
    bytes: 4_198_912,
    durationMs: 12_400,
    at: "2026-08-10T13:58:44Z",
  },
  {
    id: "dpl_7c3a",
    branch: "fix/safe-area-inset-bottom",
    sha: "5d2ab77",
    message: "Bottom sheet clears the home indicator on iOS 18",
    status: "failed",
    bytes: 0,
    durationMs: 8_310,
    at: "2026-08-10T13:21:02Z",
  },
  {
    id: "dpl_7c2e",
    branch: "main",
    sha: "0f7c913",
    message: "Drop the intersection-observer polyfill",
    status: "ready",
    bytes: 4_186_720,
    durationMs: 44_050,
    at: "2026-08-10T11:04:37Z",
  },
];

/* ── Rule 10: format at the edge, in the user's locale ────────────────────── */

const decimal2 = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const decimal1 = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const clockFormat = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

// U+00A0 before the unit — Rule 4. Without it a narrow column breaks the line
// between "4.22" and "MB", which reads as two facts instead of one.
function formatSize(bytes: number): string {
  return `${decimal2.format(bytes / 1_000_000)} MB`;
}

function formatDuration(ms: number): string {
  return `${decimal1.format(ms / 1000)} s`;
}

/* ── Rule 2 + "never colour alone": tone carries a label, not just a hue ──── */

const statusTone: Record<DeploymentStatus, { dot: string; text: string; label: string }> = {
  ready: {
    dot: "bg-[oklch(62%_0.16_150)]",
    text: "text-[oklch(38%_0.12_150)]",
    label: "Ready",
  },
  building: {
    dot: "bg-[oklch(72%_0.15_85)]",
    text: "text-[oklch(40%_0.11_85)]",
    label: "Building…",
  },
  failed: {
    dot: "bg-[oklch(58%_0.20_25)]",
    text: "text-[oklch(40%_0.17_25)]",
    label: "Failed",
  },
};

export interface StatusBadgeProps {
  status: DeploymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = statusTone[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${tone.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
      {tone.label}
    </span>
  );
}

/* ── row ──────────────────────────────────────────────────────────────────── */

export interface DeploymentRowProps {
  deployment: Deployment;
  onRedeploy?: (id: string) => void;
}

export const DeploymentRow = React.forwardRef<HTMLLIElement, DeploymentRowProps>(
  function DeploymentRow({ deployment, onRedeploy }, ref) {
    const { id, branch, sha, message, status, bytes, durationMs, at } = deployment;
    return (
      <li
        ref={ref}
        // Concentric radii: 12px inside the panel's 16px. Equal radii on nested
        // surfaces read as a mistake even when nobody can name why.
        className="rounded-xl border border-[oklch(93%_0.006_255)] bg-[oklch(100%_0_0)] p-3 transition-colors duration-150 motion-reduce:transition-none hover:border-[oklch(78%_0.012_255)] hover:bg-[oklch(98.5%_0.004_255)] sm:p-4"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Rule 6. `min-w-0` is load-bearing — a flex child defaults to
              min-width:auto, refuses to shrink below its content, and `truncate`
              on the child below then does nothing at all. */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[oklch(24%_0.014_255)]">{message}</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-[oklch(52%_0.010_255)]">
              {/* Rule 10: an identifier is not prose. Machine translation will
                  rewrite "main" into the target language and break the link. */}
              <span translate="no" className="truncate font-mono">
                {branch}
              </span>
              <span aria-hidden="true">·</span>
              <span translate="no" className="shrink-0 font-mono tabular-nums">
                {sha}
              </span>
            </p>
          </div>

          {/* Rule 5: `tabular-nums` so the digits sit in the same columns from
              row to row. Without it the sizes visibly shimmy as you scan down. */}
          <dl className="hidden shrink-0 gap-6 text-right text-xs tabular-nums text-[oklch(46%_0.010_255)] sm:flex">
            <div>
              <dt className="sr-only">Bundle size</dt>
              <dd>{status === "failed" ? "—" : formatSize(bytes)}</dd>
            </div>
            <div>
              <dt className="sr-only">Build duration</dt>
              <dd>{formatDuration(durationMs)}</dd>
            </div>
            <div>
              <dt className="sr-only">Deployed at</dt>
              <dd>
                <time dateTime={at}>{clockFormat.format(new Date(at))}</time>
              </dd>
            </div>
          </dl>

          <div className="flex shrink-0 items-center gap-3">
            <StatusBadge status={status} />
            {/* 44px hit area, and Rule 3: the label names the action, not
                "Continue". `touch-action: manipulation` drops the 300ms
                double-tap wait on touch devices. */}
            <button
              type="button"
              onClick={() => onRedeploy?.(id)}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-[oklch(90%_0.008_255)] px-3 text-xs font-medium text-[oklch(44%_0.012_255)] transition-colors duration-150 [touch-action:manipulation] motion-reduce:transition-none hover:border-[oklch(70%_0.016_255)] hover:text-[oklch(18%_0.020_255)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.16_255)] focus-visible:ring-offset-2"
            >
              Redeploy
              <span className="sr-only"> {sha}</span>
            </button>
          </div>
        </div>
      </li>
    );
  },
);

/* ── panel: four states, none of them faked ───────────────────────────────── */

export interface DeploymentPanelProps {
  deployments?: readonly Deployment[];
  /** Driven by a real request, never a mount-time timer. */
  isLoading?: boolean;
  error?: string | null;
  onRedeploy?: (id: string) => void;
  onRetry?: () => void;
}

export const DeploymentPanel = React.forwardRef<HTMLElement, DeploymentPanelProps>(
  function DeploymentPanel(
    { deployments = DEPLOYMENTS, isLoading = false, error = null, onRedeploy, onRetry },
    ref,
  ) {
    const headingId = React.useId();

    function body() {
      if (isLoading) {
        return (
          <ul className="space-y-2" aria-busy="true">
            {["a", "b", "c"].map((key) => (
              <li
                key={key}
                className="h-[4.5rem] animate-pulse rounded-xl bg-[oklch(95%_0.005_255)] motion-reduce:animate-none"
              />
            ))}
          </ul>
        );
      }

      if (error !== null) {
        return (
          // Rule 3: an error names the fix, not the failure. "Request failed"
          // tells the reader something they already knew from the red box.
          <div
            role="alert"
            className="rounded-xl border border-[oklch(85%_0.06_25)] bg-[oklch(97%_0.02_25)] p-4"
          >
            <p className="text-sm font-medium text-[oklch(38%_0.16_25)]">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex h-11 items-center rounded-lg border border-[oklch(80%_0.07_25)] px-3 text-xs font-medium text-[oklch(38%_0.16_25)] transition-colors duration-150 [touch-action:manipulation] motion-reduce:transition-none hover:border-[oklch(62%_0.12_25)] hover:text-[oklch(26%_0.18_25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.16_25)]"
            >
              Load deployments again
            </button>
          </div>
        );
      }

      if (deployments.length === 0) {
        return (
          <div className="rounded-xl border border-dashed border-[oklch(88%_0.008_255)] p-8 text-center">
            <p className="text-sm font-medium text-balance text-[oklch(28%_0.014_255)]">
              Nothing has shipped from this project yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-balance text-[oklch(52%_0.010_255)]">
              Push to any branch and the first build starts on its own. Production
              promotes from <span translate="no" className="font-mono">main</span>.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex h-11 items-center rounded-lg bg-[oklch(28%_0.02_255)] px-4 text-xs font-medium text-[oklch(99%_0_0)] transition-colors duration-150 [touch-action:manipulation] motion-reduce:transition-none hover:bg-[oklch(18%_0.02_255)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.16_255)] focus-visible:ring-offset-2"
            >
              Connect a repository
            </button>
          </div>
        );
      }

      return (
        <ul className="space-y-2 overscroll-contain">
          {deployments.map((deployment) => (
            <DeploymentRow key={deployment.id} deployment={deployment} onRedeploy={onRedeploy} />
          ))}
        </ul>
      );
    }

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        // Rule 1: ambient + direct, and a border tinted with the same hue as the
        // surface. A neutral-grey border on a tinted panel is the tell that the
        // shadow and the border were chosen by different people.
        className="rounded-2xl border border-[oklch(91%_0.008_255)] bg-[oklch(99%_0.003_255)] p-2 shadow-[0_1px_2px_oklch(20%_0.02_255/0.06),0_12px_32px_-16px_oklch(20%_0.02_255/0.20)] sm:p-3"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-2 pb-3 pt-1">
          <h2
            id={headingId}
            className="text-balance text-sm font-semibold text-[oklch(20%_0.016_255)]"
          >
            Recent deployments
          </h2>
          <p className="text-xs tabular-nums text-[oklch(54%_0.010_255)]">
            98.4% build-cache hit rate
          </p>
        </div>
        {body()}
      </section>
    );
  },
);

/* ── demo ─────────────────────────────────────────────────────────────────── */

export interface AuditedPanelDemoProps {
  isLoading?: boolean;
  error?: string | null;
  deployments?: readonly Deployment[];
}

export default function AuditedPanelDemo({
  isLoading = false,
  error = null,
  deployments,
}: AuditedPanelDemoProps) {
  return (
    <main className="min-h-[100dvh] bg-[oklch(97%_0.004_255)] p-4 font-[Manrope,system-ui,sans-serif] sm:p-8 lg:p-12">
      <div className="mx-auto max-w-3xl pb-[env(safe-area-inset-bottom)]">
        <DeploymentPanel isLoading={isLoading} error={error} deployments={deployments} />
      </div>
    </main>
  );
}
