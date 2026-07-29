"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "../components/LoginForm";
import type { OAuthProvider } from "../components/OAuthButtons";
import type { AuthOutcome, LoginValues } from "../lib/validation";

const WORKSPACE_PATH = "/workspace";

interface SessionFact {
  readonly term: string;
  readonly detail: string;
}

const SESSION_FACTS: ReadonlyArray<SessionFact> = [
  {
    term: "Sessions last 14 days",
    detail:
      "Two weeks idle and every device is signed out. There are no long-lived tokens sitting in your browser.",
  },
  {
    term: "“Keep me signed in” is per browser",
    detail:
      "It stores one trusted-device token for 30 days, on this browser only. Signing out anywhere revokes it.",
  },
  {
    term: "New devices get an email",
    detail:
      "The first sign-in from an unrecognised device sends you a notice with the time, city and IP address.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  /** Never throws: every failure comes back as a branch the form can render. */
  async function authenticate(values: LoginValues): Promise<AuthOutcome> {
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.status === 401) {
        return { status: "rejected" };
      }
      if (response.status === 429) {
        const retryAfter = Number.parseInt(response.headers.get("Retry-After") ?? "", 10);
        return {
          status: "rate-limited",
          retryAfterSeconds: Number.isNaN(retryAfter) ? 300 : retryAfter,
        };
      }
      if (!response.ok) {
        return { status: "unavailable" };
      }
      return { status: "success", email: values.email };
    } catch {
      // fetch() rejects only on a transport error — report it as offline.
      return { status: "offline" };
    }
  }

  async function startOAuth(provider: OAuthProvider): Promise<void> {
    const response = await fetch(`/api/auth/oauth/${provider}`, { method: "POST" });
    if (!response.ok) {
      throw new Error(`Provider handshake failed with status ${response.status}`);
    }
    const handoff: { authorizeUrl: string } = await response.json();
    window.location.assign(handoff.authorizeUrl);
  }

  function handleAuthenticated(email: string): void {
    setSignedInEmail(email);
    router.replace(WORKSPACE_PATH);
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-surface)] font-[Manrope,ui-sans-serif,system-ui] text-[var(--color-ink)]">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-10 focus-visible:rounded-lg focus-visible:bg-[var(--color-surface-raised)] focus-visible:px-4 focus-visible:py-3 focus-visible:text-sm focus-visible:font-semibold focus-visible:shadow-[var(--shadow-card)]"
      >
        Skip to main content
      </a>

      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8">
        <p className="flex items-center gap-2 text-base font-extrabold tracking-[-0.01em]">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2 3 20h4.4L12 10.6 16.6 20H21z"
              fill="var(--color-brand)"
            />
          </svg>
          Arclight
        </p>
        <a
          href="/support"
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[var(--color-ink-muted)] transition-colors duration-150 ease-out hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none"
        >
          Trouble signing in?
        </a>
      </header>

      <main
        id="main-content"
        className="mx-auto grid max-w-5xl scroll-mt-8 gap-10 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[minmax(0,27rem)_1fr] lg:gap-16 lg:pb-24 lg:pt-12"
      >
        {signedInEmail === null ? (
          <LoginForm
            onAuthenticate={authenticate}
            onAuthenticated={handleAuthenticated}
            onOAuthSelect={startOAuth}
          />
        ) : (
          <section
            role="status"
            aria-labelledby="signed-in-heading"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-card)] sm:p-8"
          >
            <h1
              id="signed-in-heading"
              className="text-balance text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl"
            >
              You’re signed in
            </h1>
            <p className="mt-2 text-pretty text-sm leading-6 text-[var(--color-ink-muted)]">
              Taking you to your workspace as{" "}
              <strong className="font-semibold text-[var(--color-ink)]">{signedInEmail}</strong>.
            </p>
            <div
              aria-hidden="true"
              className="mt-6 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-sunken)]"
            >
              <div className="h-full w-2/5 animate-pulse rounded-full bg-[var(--color-brand)] motion-reduce:animate-none" />
            </div>
            <a
              href={WORKSPACE_PATH}
              className="mt-6 inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-[var(--color-brand)] underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Continue to your workspace
            </a>
          </section>
        )}

        <aside aria-labelledby="session-policy-heading" className="lg:pt-2">
          <h2
            id="session-policy-heading"
            className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]"
          >
            How your session works
          </h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {SESSION_FACTS.map((fact: SessionFact) => (
              <div
                key={fact.term}
                className="border-s-2 border-[var(--color-border)] ps-4 lg:max-w-md"
              >
                <dt className="text-sm font-semibold text-[var(--color-ink)]">{fact.term}</dt>
                <dd className="mt-1 text-pretty text-sm leading-6 text-[var(--color-ink-muted)]">
                  {fact.detail}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col gap-3 border-t border-[var(--color-border)] px-5 py-8 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© 2026 Arclight Systems</p>
        <ul className="flex flex-wrap items-center gap-x-5">
          <li>
            <a
              href="/status"
              className="inline-flex min-h-11 items-center font-semibold underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              System status
            </a>
          </li>
          <li>
            <a
              href="/security"
              className="inline-flex min-h-11 items-center font-semibold underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Security
            </a>
          </li>
          <li>
            <a
              href="/privacy"
              className="inline-flex min-h-11 items-center font-semibold underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Privacy
            </a>
          </li>
        </ul>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        :root {
          --font-display: "Manrope", ui-sans-serif, system-ui, sans-serif;
          --color-surface: oklch(97.4% 0.005 236.4);
          --color-surface-raised: oklch(99.1% 0.003 236.4);
          --color-surface-sunken: oklch(94.2% 0.009 236.4);
          --color-ink: oklch(21.6% 0.024 251.8);
          --color-ink-muted: oklch(49.2% 0.019 251.8);
          --color-border: oklch(89.4% 0.009 236.4);
          --color-border-strong: oklch(79.8% 0.014 236.4);
          --color-brand: oklch(48.6% 0.106 226.7);
          --color-brand-hover: oklch(41.2% 0.094 226.7);
          --color-on-brand: oklch(98.6% 0.008 226.7);
          --color-focus: oklch(57.2% 0.128 226.7);
          --color-danger: oklch(50.8% 0.184 25.6);
          --color-danger-surface: oklch(96.2% 0.026 25.6);
          --shadow-card: 0 1px 2px oklch(21.6% 0.024 251.8 / 0.06), 0 18px 44px -24px oklch(21.6% 0.024 251.8 / 0.22);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --color-surface: oklch(18.2% 0.019 251.8);
            --color-surface-raised: oklch(22.4% 0.021 251.8);
            --color-surface-sunken: oklch(27.6% 0.023 251.8);
            --color-ink: oklch(96.4% 0.006 236.4);
            --color-ink-muted: oklch(74.6% 0.015 236.4);
            --color-border: oklch(32.6% 0.021 251.8);
            --color-border-strong: oklch(43.4% 0.026 251.8);
            --color-brand: oklch(74.2% 0.104 226.7);
            --color-brand-hover: oklch(81.4% 0.092 226.7);
            --color-on-brand: oklch(18.2% 0.028 226.7);
            --color-focus: oklch(79.2% 0.112 226.7);
            --color-danger: oklch(73.6% 0.142 25.6);
            --color-danger-surface: oklch(28.6% 0.064 25.6);
            --shadow-card: 0 1px 2px oklch(4% 0.01 251.8 / 0.5), 0 18px 44px -24px oklch(4% 0.01 251.8 / 0.7);
          }
        }

        body {
          font-family: var(--font-display);
          background-color: var(--color-surface);
          color: var(--color-ink);
          -webkit-font-smoothing: antialiased;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
