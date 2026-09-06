// EXAMPLE: Reference-quality light / dark / auto theme control
// Intent: CREATE_COMPONENT · Product: dev-tool · Dials: DV=4 MI=2 VD=5
// Illustrates color-themes discipline (dark-light-auto-architecture.md):
//   • THREE states stored, not a boolean — persisting `isDark` silently pins anyone who chose "auto"
//   • A radio group, because a two-state toggle cannot express a three-way choice
//   • The switch is INSTANT: transitions are suppressed for two frames, never animated across the page
//   • color-scheme is set alongside data-theme so native controls and scrollbars match from frame one
//   • localStorage reads are validated and wrapped — it throws in Safari private mode
// Key principles on display:
//   • All 4 states: empty (no options), loading, error, success
//   • 44px+ touch targets, a real <legend>, focus rings on every control
//   • Exported prop interfaces used as types; no `any`

import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "auto";

export interface ThemeToggleProps {
  /** Persisted choice, if the host already read it (e.g. from a cookie during SSR). */
  initialChoice?: ThemeChoice;
  /** Storage key. Exposed so an app can namespace it. */
  storageKey?: string;
  options?: ThemeChoice[];
  isLoading?: boolean;
  hasError?: boolean;
}

const DEFAULT_OPTIONS: ThemeChoice[] = ["light", "dark", "auto"];

const DESCRIPTIONS: Record<ThemeChoice, string> = {
  light: "Always light, whatever the system is set to",
  dark: "Always dark, whatever the system is set to",
  auto: "Follow the system setting, and keep following it",
};

function isChoice(value: string | null): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "auto";
}

export function loadChoice(storageKey: string): ThemeChoice {
  if (typeof window === "undefined") return "auto";
  try {
    const stored = window.localStorage.getItem(storageKey);
    // Validated on read: localStorage survives deploys, so values your code
    // stopped supporting three versions ago are still out there.
    return isChoice(stored) ? stored : "auto";
  } catch {
    // Safari private mode and some cookie-blocking configurations throw here.
    return "auto";
  }
}

export function resolveChoice(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "auto") return choice;
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle({
  initialChoice = "auto",
  storageKey = "theme",
  options = DEFAULT_OPTIONS,
  isLoading = false,
  hasError = false,
}: ThemeToggleProps = {}) {
  const [choice, setChoice] = useState<ThemeChoice>(initialChoice);
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Read storage after mount only. The server cannot know the choice, so reading
  // it during render would guarantee a hydration mismatch.
  useEffect(() => {
    const stored = loadChoice(storageKey);
    setChoice(stored);
    setResolved(resolveChoice(stored));
    setMounted(true);
  }, [storageKey]);

  // Track the system query while — and only while — the choice is "auto".
  useEffect(() => {
    if (choice !== "auto" || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setResolved(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  useEffect(() => {
    if (typeof document === "undefined" || !mounted) return;
    const root = document.documentElement;

    // Suppress transitions across the swap. A 300ms colour fade over a whole
    // document reads as a rendering fault, and inherited properties resolve
    // unevenly, so text can arrive before its own background.
    root.setAttribute("data-theme-switching", "");
    root.setAttribute("data-theme", resolved);
    root.style.colorScheme = resolved;

    // Two frames: one for the attribute, one for the recalc it triggers.
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => root.removeAttribute("data-theme-switching"));
    });
    return () => cancelAnimationFrame(outer);
  }, [resolved, mounted]);

  const select = useCallback(
    (next: ThemeChoice) => {
      setChoice(next);
      setResolved(resolveChoice(next));
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // Storage unavailable — the choice still applies for this session.
      }
    },
    [storageKey]
  );

  if (hasError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-md rounded-2xl border border-[oklch(63.7%_0.208_25.3)] bg-[oklch(20.1%_0.014_248)] p-6 font-[Manrope,system-ui,sans-serif]"
      >
        <h2 className="text-lg font-bold text-[oklch(96.2%_0.005_248)]">Couldn&rsquo;t load theme settings</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">
          Your saved preference didn&rsquo;t load. The system setting is being used instead.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md items-center justify-center p-6">
        <div className="w-full space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-[oklch(26.8%_0.014_248)]" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-[oklch(23.1%_0.013_248)]" />
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[oklch(31.6%_0.015_248)] bg-[oklch(20.1%_0.014_248)] p-8 text-center font-[Manrope,system-ui,sans-serif]">
        <h2 className="text-xl font-bold text-[oklch(96.2%_0.005_248)]">No themes available</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">Configure at least one theme option.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(17.4%_0.012_248)] p-4 font-[Manrope,system-ui,sans-serif]">
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}
      <section className="w-full max-w-md rounded-2xl border border-[oklch(26.8%_0.014_248)] bg-[oklch(20.1%_0.014_248)] p-6 sm:p-8">
        <fieldset className="border-0 p-0">
          <legend className="text-sm font-semibold text-[oklch(96.2%_0.005_248)]">Colour theme</legend>
          <p className="mt-1 text-sm text-[oklch(74.8%_0.017_248)]">
            {/* "auto" is a real choice, so it is named as one rather than implied
                by the absence of the other two. */}
            Auto keeps following your system for as long as it stays selected.
          </p>

          <div className="mt-4 space-y-2">
            {options.map((option) => (
              <label
                key={option}
                className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-[oklch(31.6%_0.015_248)] px-3 transition-colors duration-200 ease-out hover:border-[oklch(43.9%_0.018_248)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[oklch(72.4%_0.181_156.3)] motion-reduce:transition-none"
              >
                <input
                  type="radio"
                  name="colour-theme"
                  value={option}
                  checked={choice === option}
                  onChange={() => select(option)}
                  className="h-4 w-4 accent-[oklch(72.4%_0.181_156.3)]"
                />
                <span className="text-sm font-medium capitalize text-[oklch(96.2%_0.005_248)]">
                  {option}
                </span>
                <span className="ml-auto text-right text-[11px] text-[oklch(63.2%_0.019_248)]">
                  {DESCRIPTIONS[option]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Reported as a word, not only as the page's appearance. */}
        <p aria-live="polite" className="mt-4 text-sm text-[oklch(74.8%_0.017_248)]">
          Currently showing the <span className="font-semibold">{resolved}</span> theme
          {choice === "auto" ? ", following your system." : ", pinned by your choice."}
        </p>
      </section>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
