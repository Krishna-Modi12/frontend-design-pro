// EXAMPLE: Reference-quality authentication page
// Intent: CREATE_PAGE · Product: saas · Dials: DV=4 MI=4 VD=7
// This is what the skill should produce for auth flows. Use as gold-standard reference.
// Key principles on display:
//   • Premium font (Manrope) declared via @import — NOT Inter as display
//   • Three modes via useState: "login" | "signup" | "magic"
//   • OAuth buttons (Google + GitHub) with real SVG paths and aria-label
//   • Client-side validation with aria-invalid + aria-describedby
//   • Skeleton loading on initial mount (~400ms) with animate-pulse
//   • All 4 states: skeleton, idle, submitting (spinner), error (role="alert"), success
//   • 44px+ touch targets (h-11) on every interactive element
//   • Focus rings consistent (focus-visible:ring-indigo-500)
//   • prefers-reduced-motion via CSS @media block
//   • Organic stat — non-round number "2,847 engineers"
//   • Realistic diverse names (Priya Shah, Kenji Tanaka) — no generic placeholders
//   • No AI-slop copy — generic marketing buzzwords are absent throughout
//   • bg-[oklch(98.5%_0.001_106.4)] page surface — never use the raw white utility class as outer bg

import { useState, useEffect } from "react";

export type AuthMode = 'login' | 'signup' | 'magic'
export type AuthStatus = 'idle' | 'submitting' | 'success'
export interface AuthPageProps {
  /** Initial tab shown; deep-link e.g. /auth?mode=signup */
  defaultMode?: AuthMode
  /** Skeleton state — drive from real session/bootstrap loading; never an artificial delay. */
  isLoading?: boolean
}

export default function AuthPage({ defaultMode = 'login', isLoading = false }: AuthPageProps = {}) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  type AuthFields = { email: string; password: string; name: string }
  type AuthErrors = Partial<Record<'email' | 'password' | 'name', string>>
  const [fields, setFields] = useState<AuthFields>({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const isMounted = !isLoading;

  function validate() {
    const e: AuthErrors = {};
    if (mode === "signup" && !fields.name.trim()) {
      e.name = "Please enter your full name.";
    }
    if (!fields.email.trim()) {
      e.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      e.email = "That email doesn't look right — check the format.";
    }
    if (mode !== "magic") {
      if (!fields.password) {
        e.password = "Please enter your password.";
      } else if (mode === "signup" && fields.password.length < 8) {
        e.password = `Password is too short — needs ${8 - fields.password.length} more characters.`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    setServerError("");
    try {
      // Simulated submission — replace with real endpoint
      await new Promise((r) => setTimeout(r, 1200));
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setServerError((err instanceof Error ? err.message : "") || "Something went wrong on our end. Try again in a moment.");
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setErrors({});
    setServerError("");
    setStatus("idle");
    setFields({ email: fields.email, password: "", name: "" });
  }

  // ── Skeleton loading state ───────────────────────────────────────────────
  if (!isMounted) {
    return (
      <div className="min-h-[100dvh] bg-[oklch(98.5%_0.001_106.4)] flex items-center justify-center p-4 font-[Manrope,system-ui,sans-serif]">
        <div className="w-full max-w-sm space-y-4">
          <div className="animate-pulse bg-slate-200 rounded-xl h-8 w-40 mx-auto" />
          <div className="animate-pulse bg-slate-200 rounded-2xl h-12 w-full" />
          <div className="animate-pulse bg-slate-200 rounded-2xl h-12 w-full" />
          <div className="animate-pulse bg-slate-200 rounded-2xl h-12 w-full" />
          <div className="animate-pulse bg-slate-200 rounded-2xl h-11 w-full" />
          <div className="animate-pulse bg-slate-200 rounded-xl h-5 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  // ── Success state (magic link sent) ─────────────────────────────────────
  if (status === "success" && mode === "magic") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-[100dvh] bg-[oklch(98.5%_0.001_106.4)] flex items-center justify-center p-4 font-[Manrope,system-ui,sans-serif]"
      >
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="size-14 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
            ✉
          </div>
          <h2 className="text-2xl font-bold text-[oklch(18.8%_0.013_248.5)] tracking-tight">Check your inbox</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            We sent a sign-in link to{" "}
            <span className="font-semibold text-[oklch(18.8%_0.013_248.5)]">{fields.email}</span>. It expires in
            10 minutes.
          </p>
          <button
            type="button"
            onClick={() => { setStatus("idle"); setMode("login"); }}
            className="h-11 px-5 inline-flex items-center font-semibold rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Back to sign in
          </button>
        </div>
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // ── Success state (login / signup) ──────────────────────────────────────
  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-[100dvh] bg-[oklch(98.5%_0.001_106.4)] flex items-center justify-center p-4 font-[Manrope,system-ui,sans-serif]"
      >
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="size-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-[oklch(18.8%_0.013_248.5)] tracking-tight">
            {mode === "signup" ? "Account created" : "Signed in"}
          </h2>
          <p className="text-slate-600 text-sm">Redirecting you to your dashboard…</p>
        </div>
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    );
  }

  const isSubmitting = status === "submitting";

  const modeConfig = {
    login: { heading: "Welcome back", cta: "Sign in", subLabel: "No account?" },
    signup: { heading: "Create your account", cta: "Create account", subLabel: "Already have one?" },
    magic: { heading: "Sign in without a password", cta: "Send magic link", subLabel: "Use password instead?" },
  };

  const { heading, cta, subLabel } = modeConfig[mode];

  return (
    <main className="min-h-[100dvh] bg-[oklch(98.5%_0.001_106.4)] font-[Manrope,system-ui,sans-serif] text-[oklch(18.8%_0.013_248.5)]">
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}

      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-[oklch(98.5%_0.001_106.4)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-indigo-500 focus:z-50"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200/80 bg-[oklch(98.5%_0.001_106.4)]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-bold tracking-tight text-lg">Atlas</span>
          </div>
          <nav aria-label="Authentication options">
            <a
              href="#auth-form"
              className="h-11 px-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-[oklch(18.8%_0.013_248.5)] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg"
            >
              Sign in
            </a>
          </nav>
        </div>
      </header>

      <section
        id="auth-form"
        className="flex flex-col items-center justify-center px-4 py-12 sm:py-20 lg:py-28"
      >
        {/* Social proof */}
        <p className="text-xs font-medium text-slate-500 mb-6 tracking-wide uppercase">
          2,847 engineers joined this month
        </p>

        <div className="w-full max-w-sm bg-[oklch(96.8%_0.007_247.9)] sm:bg-[oklch(98.5%_0.001_106.4)] rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm p-6 sm:p-8">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[oklch(18.8%_0.013_248.5)]">
              {heading}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "login" && "Good to have you back, Priya."}
              {mode === "signup" && "Join Kenji Tanaka and 2,847 others."}
              {mode === "magic" && "We'll email a one-click sign-in link."}
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm"
            >
              <p className="font-semibold mb-0.5">Sign in failed.</p>
              <p>{serverError}</p>
            </div>
          )}

          {/* OAuth buttons — only on login/signup */}
          {mode !== "magic" && (
            <div className="space-y-3 mb-6">
              <button
                type="button"
                aria-label="Continue with Google"
                disabled={isSubmitting}
                className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-[oklch(98.5%_0.001_106.4)] hover:bg-slate-100 font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Brand asset: the four fills below are Google's specified
                    colours, one of the three raw-hex exceptions the anti-slop
                    wall sanctions. Re-expressing them in OKLCH would round the
                    values and ship a subtly wrong Google logo. */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                aria-label="Continue with GitHub"
                disabled={isSubmitting}
                className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-[oklch(98.5%_0.001_106.4)] hover:bg-slate-100 font-medium text-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
              </button>

              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium shrink-0">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>
          )}

          {/* Auth form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name — signup only */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fields.name}
                  onChange={(e) => setFields({ ...fields, name: e.target.value })}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "auth-name-error" : undefined}
                  disabled={isSubmitting}
                  placeholder="Priya Shah"
                  className={`w-full h-11 px-4 bg-[oklch(98.5%_0.001_106.4)] text-[oklch(18.8%_0.013_248.5)] border-2 rounded-xl outline-none transition-colors focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                    errors.name ? "border-rose-400" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                {errors.name && (
                  <p id="auth-name-error" role="alert" className="mt-1.5 text-sm text-rose-600">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-1.5"
              >
                Email address
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={fields.email}
                onChange={(e) => setFields({ ...fields, email: e.target.value })}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "auth-email-error" : undefined}
                disabled={isSubmitting}
                placeholder="you@company.com"
                className={`w-full h-11 px-4 bg-[oklch(98.5%_0.001_106.4)] text-[oklch(18.8%_0.013_248.5)] border-2 rounded-xl outline-none transition-colors focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                  errors.email ? "border-rose-400" : "border-slate-200 hover:border-slate-300"
                }`}
              />
              {errors.email && (
                <p id="auth-email-error" role="alert" className="mt-1.5 text-sm text-rose-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password — login/signup only */}
            {mode !== "magic" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password"
                    className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)]"
                  >
                    Password
                  </label>
                  {mode === "login" && (
                    <a
                      href="#forgot"
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={fields.password}
                  onChange={(e) => setFields({ ...fields, password: e.target.value })}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "auth-password-error" : undefined}
                  disabled={isSubmitting}
                  className={`w-full h-11 px-4 bg-[oklch(98.5%_0.001_106.4)] text-[oklch(18.8%_0.013_248.5)] border-2 rounded-xl outline-none transition-colors focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                    errors.password ? "border-rose-400" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                {errors.password && (
                  <p id="auth-password-error" role="alert" className="mt-1.5 text-sm text-rose-600">
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 inline-flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-wait mt-2"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"
                    aria-hidden="true"
                  />
                  {mode === "magic" ? "Sending link…" : mode === "signup" ? "Creating account…" : "Signing in…"}
                </>
              ) : (
                cta
              )}
            </button>
          </form>

          {/* Terms — signup mode */}
          {mode === "signup" && (
            <p className="mt-4 text-xs text-slate-500 text-center leading-relaxed">
              By creating an account you agree to our{" "}
              <a href="#terms" className="underline hover:text-[oklch(18.8%_0.013_248.5)] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="underline hover:text-[oklch(18.8%_0.013_248.5)] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded">
                Privacy Policy
              </a>
              .
            </p>
          )}

          {/* Mode toggle */}
          <div className="mt-5 text-center text-sm text-slate-500">
            {subLabel}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : mode === "signup" ? "login" : "login")}
              className="font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
            >
              {mode === "login" && "Create one"}
              {mode === "signup" && "Sign in"}
              {mode === "magic" && "Sign in with password"}
            </button>
          </div>

          {/* Magic link toggle */}
          {mode !== "magic" && (
            <div className="mt-2 text-center text-sm">
              <button
                type="button"
                onClick={() => switchMode("magic")}
                className="text-slate-500 hover:text-[oklch(18.8%_0.013_248.5)] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
              >
                Sign in with magic link instead
              </button>
            </div>
          )}
        </div>

        {/* Testimonials strip */}
        <div className="mt-10 w-full max-w-sm lg:max-w-lg flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-slate-500 text-center">
          <figure className="flex-1">
            <blockquote className="italic leading-relaxed">
              &ldquo;Exactly the tool our team needed — no extra fluff.&rdquo;
            </blockquote>
            <figcaption className="mt-1 font-semibold text-[oklch(18.8%_0.013_248.5)]">Kenji Tanaka, Staff Eng @ Vercel</figcaption>
          </figure>
          <div className="hidden sm:block w-px h-10 bg-slate-200" />
          <figure className="flex-1">
            <blockquote className="italic leading-relaxed">
              &ldquo;Shipped 3.2× faster after switching. Our velocity chart looks wild.&rdquo;
            </blockquote>
            <figcaption className="mt-1 font-semibold text-[oklch(18.8%_0.013_248.5)]">Ana Ngugi, CTO @ Fathom</figcaption>
          </figure>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

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
