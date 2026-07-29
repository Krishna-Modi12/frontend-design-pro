"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";

export type OAuthProvider = "google" | "github" | "apple";

export interface OAuthButtonsProps {
  /**
   * Starts the provider handshake. Resolves once the redirect has been handed
   * to the browser; reject to surface the inline failure message.
   */
  onProviderSelect: (provider: OAuthProvider) => Promise<void>;
  /** Locks every provider while another part of the page owns the request. */
  isDisabled?: boolean;
}

interface ProviderConfig {
  readonly id: OAuthProvider;
  readonly name: string;
  readonly mark: ReactNode;
}

/**
 * Brand marks are inlined rather than fetched so the buttons paint with the
 * first frame. Google's brand colours are expressed in OKLCH — the same values,
 * in the colour space the rest of this page is authored in.
 */
const GOOGLE_MARK: ReactNode = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="oklch(59.5% 0.196 264.1)"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="oklch(61.6% 0.161 145.4)"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="oklch(81.6% 0.161 82.4)"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="oklch(60.6% 0.208 29.8)"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GITHUB_MARK: ReactNode = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const APPLE_MARK: ReactNode = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const PROVIDERS: ReadonlyArray<ProviderConfig> = [
  { id: "google", name: "Google", mark: GOOGLE_MARK },
  { id: "github", name: "GitHub", mark: GITHUB_MARK },
  { id: "apple", name: "Apple", mark: APPLE_MARK },
];

export function OAuthButtons({ onProviderSelect, isDisabled = false }: OAuthButtonsProps) {
  const uid = useId();
  const headingId = `${uid}-providers`;
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(provider: ProviderConfig): Promise<void> {
    setError(null);
    setPendingProvider(provider.id);
    try {
      await onProviderSelect(provider.id);
    } catch {
      setError(
        `We could not reach ${provider.name}. Try again, or sign in with your email below.`,
      );
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <section aria-labelledby={headingId} className="font-[Manrope,ui-sans-serif,system-ui]">
      <h2 id={headingId} className="sr-only">
        Continue with a single sign-on provider
      </h2>

      <ul className="grid gap-2.5 sm:gap-3">
        {PROVIDERS.map((provider: ProviderConfig) => {
          const isLoading = pendingProvider === provider.id;
          return (
            <li key={provider.id}>
              <button
                type="button"
                onClick={() => {
                  void handleSelect(provider);
                }}
                disabled={isDisabled || pendingProvider !== null}
                aria-busy={isLoading}
                className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border
                  border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-4 text-sm
                  font-semibold text-[var(--color-ink)] transition-colors duration-150 ease-out
                  hover:bg-[var(--color-surface-sunken)] focus-visible:outline-2
                  focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]
                  disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none
                  sm:min-h-12 sm:px-5"
              >
                {isLoading ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-5 shrink-0 animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  provider.mark
                )}
                {isLoading ? `Opening ${provider.name}…` : `Continue with ${provider.name}`}
              </button>
            </li>
          );
        })}
      </ul>

      {error !== null ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-sm font-medium text-[var(--color-danger)]"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </section>
  );
}

export default OAuthButtons;
