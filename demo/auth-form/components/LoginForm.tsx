"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, ShieldAlert } from "lucide-react";
import { OAuthButtons } from "./OAuthButtons";
import type { OAuthProvider } from "./OAuthButtons";
import { describeAuthFailure, loginSchema } from "../lib/validation";
import type { AuthOutcome, LoginValues } from "../lib/validation";

export interface LoginFormProps {
  /** Exchanges credentials for a session. Returns an outcome — never throws. */
  onAuthenticate: (values: LoginValues) => Promise<AuthOutcome>;
  /** Called with the accepted address once the session exists. */
  onAuthenticated: (email: string) => void;
  /** Hands a provider handshake to the page that owns navigation. */
  onOAuthSelect: (provider: OAuthProvider) => Promise<void>;
}

export function LoginForm({ onAuthenticate, onAuthenticated, onOAuthSelect }: LoginFormProps) {
  const uid = useId();
  const headingId = `${uid}-heading`;
  const emailId = `${uid}-email`;
  const emailErrorId = `${uid}-email-error`;
  const passwordId = `${uid}-password`;
  const passwordErrorId = `${uid}-password-error`;
  const rememberId = `${uid}-remember`;
  const rememberHintId = `${uid}-remember-hint`;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    formState: { errors: fieldErrors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // The only loading source is React Hook Form's own submit lifecycle, so the
  // spinner is on screen for exactly as long as the request is in flight.
  const isLoading: boolean = Boolean(isSubmitting);
  const emailError: string | undefined = fieldErrors.email?.message;
  const passwordError: string | undefined = fieldErrors.password?.message;

  const submit = handleSubmit(async (values: LoginValues): Promise<void> => {
    setError(null);
    const outcome = await onAuthenticate(values);
    if (outcome.status === "success") {
      onAuthenticated(outcome.email);
      return;
    }
    setError(describeAuthFailure(outcome));
  });

  const fieldClasses =
    "block h-12 w-full rounded-xl border bg-[var(--color-surface)] px-4 text-base text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-[var(--color-ink-muted)] focus-visible:border-[var(--color-focus)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

  return (
    <section
      aria-labelledby={headingId}
      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 font-[Manrope,ui-sans-serif,system-ui] shadow-[var(--shadow-card)] sm:p-8"
    >
      <h1
        id={headingId}
        className="text-balance text-2xl font-extrabold tracking-[-0.02em] text-[var(--color-ink)] sm:text-3xl"
      >
        Sign in to Arclight
      </h1>
      <p className="mt-2 text-pretty text-sm leading-6 text-[var(--color-ink-muted)]">
        Use the address your workspace invite was sent to, or continue with a provider you already
        have.
      </p>

      <div className="mt-7">
        <OAuthButtons isDisabled={isLoading} onProviderSelect={onOAuthSelect} />
      </div>

      <div className="my-7 flex items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          or use your email
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        {error !== null ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-surface)] px-4 py-3"
          >
            <ShieldAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-[var(--color-danger)]"
            />
            <p className="text-pretty text-sm leading-6 text-[var(--color-danger)]">{error}</p>
          </div>
        ) : null}

        <div>
          <label
            htmlFor={emailId}
            className="block text-sm font-semibold text-[var(--color-ink)]"
          >
            Email address
          </label>
          <input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="e.g. ana@arclight.io"
            disabled={isLoading}
            aria-invalid={emailError !== undefined}
            aria-describedby={emailError !== undefined ? emailErrorId : undefined}
            className={`mt-2 ${fieldClasses} ${
              emailError !== undefined
                ? "border-[var(--color-danger)]"
                : "border-[var(--color-border-strong)]"
            }`}
            {...register("email")}
          />
          {emailError !== undefined ? (
            <p
              id={emailErrorId}
              className="mt-2 text-sm font-medium text-[var(--color-danger)]"
            >
              {emailError}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <label
              htmlFor={passwordId}
              className="text-sm font-semibold text-[var(--color-ink)]"
            >
              Password
            </label>
            <a
              href="/reset-password"
              className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-[var(--color-brand)] underline decoration-2 underline-offset-4 transition-colors duration-150 ease-out hover:text-[var(--color-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <input
              id={passwordId}
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={isLoading}
              aria-invalid={passwordError !== undefined}
              aria-describedby={passwordError !== undefined ? passwordErrorId : undefined}
              className={`pe-14 ${fieldClasses} ${
                passwordError !== undefined
                  ? "border-[var(--color-danger)]"
                  : "border-[var(--color-border-strong)]"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((visible: boolean) => !visible)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              aria-pressed={isPasswordVisible}
              className="absolute end-0.5 top-0.5 grid size-11 place-items-center rounded-lg text-[var(--color-ink-muted)] transition-colors duration-150 ease-out hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none"
            >
              {isPasswordVisible ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
          {passwordError !== undefined ? (
            <p
              id={passwordErrorId}
              className="mt-2 text-sm font-medium text-[var(--color-danger)]"
            >
              {passwordError}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={rememberId}
            className="inline-flex min-h-11 cursor-pointer items-center gap-3 py-2 text-sm font-semibold text-[var(--color-ink)]"
          >
            <input
              id={rememberId}
              type="checkbox"
              disabled={isLoading}
              aria-describedby={rememberHintId}
              className="size-5 shrink-0 rounded-[0.3rem] border-2 border-[var(--color-border-strong)] accent-[var(--color-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              {...register("rememberMe")}
            />
            Keep me signed in
          </label>
          <p
            id={rememberHintId}
            className="text-xs leading-5 text-[var(--color-ink-muted)] sm:ps-8"
          >
            Stores a 30-day trusted-device token on this browser only. Leave it off on shared
            computers.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 text-sm font-bold text-[var(--color-on-brand)] transition-colors duration-150 ease-out hover:bg-[var(--color-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
        >
          {isLoading ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
            />
          ) : null}
          {isLoading ? "Signing you in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
        No workspace yet?{" "}
        <a
          href="/sign-up"
          className="inline-flex min-h-11 items-center font-semibold text-[var(--color-brand)] underline decoration-2 underline-offset-4 transition-colors duration-150 ease-out hover:text-[var(--color-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none"
        >
          Create one
        </a>
      </p>
    </section>
  );
}

export default LoginForm;
