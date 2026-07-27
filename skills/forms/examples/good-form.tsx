// EXAMPLE: Reference-quality accessible contact form
// Intent: CREATE_COMPONENT · Product: saas · Dials: DV=3 MI=3 VD=4
// This is what the skill should produce for "build a contact form."
// Key principles on display:
//   • Every input has htmlFor/id association
//   • aria-describedby links error to input (A11Y-06)
//   • aria-invalid set dynamically on validation failure
//   • All 4 states: empty (initial), loading (submitting), error (field+server), success
//   • File upload with native drag-drop + keyboard accessible
//   • 44px+ touch targets (h-12 on inputs, h-11 on buttons)
//   • Focus rings visible and consistent
//   • prefers-reduced-motion respected
//   • Real error messages with specific feedback (not "Invalid")
//   • aria-live for dynamic status announcements
//   • No framework lock-in — plain useState, works everywhere

import { useState, useRef, useEffect } from "react";

export interface ContactFormProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function ContactForm({ isLoading: initialLoading = false }: ContactFormProps = {}) {
  const [isLoading] = useState(initialLoading);
  interface FormFields { name: string; email: string; message: string; file: File | null }
  type FormErrors = Partial<Record<'name' | 'email' | 'message' | 'file', string>>
  const [fields, setFields] = useState<FormFields>({ name: "", email: "", message: "", file: null });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate() {
    const e: FormErrors = {};
    if (!fields.name.trim()) e.name = "Please enter your name.";
    else if (fields.name.trim().length < 2) e.name = "Name must be at least 2 characters.";

    if (!fields.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      e.email = "That email doesn't look right — check the format.";

    if (!fields.message.trim()) e.message = "Please add a short message.";
    else if (fields.message.trim().length < 10)
      e.message = `Message is too short — add ${10 - fields.message.trim().length} more characters.`;

    if (fields.file && fields.file.size > 5 * 1024 * 1024)
      e.file = "File must be under 5 MB.";

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
      await new Promise((r) => setTimeout(r, 1400));
      // Uncomment to demo error state: throw new Error("Server timeout");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError((err instanceof Error ? err.message : "") || "Something broke on our side. Try again in a moment.");
    }
  }

  function reset() {
    setFields({ name: "", email: "", message: "", file: null });
    setErrors({});
    setStatus("idle");
    setServerError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="max-w-lg mx-auto p-8 bg-[oklch(99.5%_0.004_255)] rounded-2xl border border-emerald-200 text-center font-[Manrope,system-ui,sans-serif]"
      >
        <div className="size-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-2xl mb-4">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-[oklch(18.8%_0.013_248.5)] tracking-tight">Thanks — we got it.</h2>
        <p className="mt-2 text-slate-600">
          We usually reply within one business day. You&apos;ll get a confirmation at{" "}
          <span className="font-medium text-[oklch(18.8%_0.013_248.5)]">{fields.email}</span>.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 h-11 px-5 inline-flex items-center font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Send another
        </button>
      </div>
    );
  }

  if (isLoading) return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(98.5%_0.001_106.4)] p-4">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-[oklch(99.5%_0.004_255)] p-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-200/70" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200/60" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200/60" />
        <div className="h-28 w-full animate-pulse rounded-xl bg-slate-200/60" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-300/70" />
      </div>
    </main>
  );

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(98.5%_0.001_106.4)] p-4">
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-lg p-6 sm:p-8 bg-[oklch(99.5%_0.004_255)] rounded-2xl border border-slate-200 font-[Manrope,system-ui,sans-serif]"
    >
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}

      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-[oklch(18.8%_0.013_248.5)]">Get in touch</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Usually a reply within one business day.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm"
        >
          <p className="font-semibold mb-1">Didn&apos;t send.</p>
          <p>{serverError}</p>
        </div>
      )}

      <div className="space-y-5">
        {/* NAME */}
        <div>
          <label htmlFor="cf-name" className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-1.5">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            disabled={status === "submitting"}
            className={`w-full h-12 px-4 bg-[oklch(99.5%_0.004_255)] text-[oklch(18.8%_0.013_248.5)] border-2 rounded-xl outline-none transition-colors focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              errors.name ? "border-rose-400" : "border-slate-200 hover:border-slate-300"
            }`}
          />
          {errors.name && (
            <p id="cf-name-error" role="alert" className="mt-1.5 text-sm text-rose-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <label htmlFor="cf-email" className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-1.5">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={fields.email}
            onChange={(e) => setFields({ ...fields, email: e.target.value })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "cf-email-error" : undefined}
            disabled={status === "submitting"}
            className={`w-full h-12 px-4 bg-[oklch(99.5%_0.004_255)] text-[oklch(18.8%_0.013_248.5)] border-2 rounded-xl outline-none transition-colors focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              errors.email ? "border-rose-400" : "border-slate-200 hover:border-slate-300"
            }`}
          />
          {errors.email && (
            <p id="cf-email-error" role="alert" className="mt-1.5 text-sm text-rose-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* MESSAGE */}
        <div>
          <label htmlFor="cf-message" className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-1.5">
            Message
          </label>
          <textarea
            id="cf-message"
            name="message"
            rows={5}
            value={fields.message}
            onChange={(e) => setFields({ ...fields, message: e.target.value })}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "cf-message-error" : "cf-message-hint"}
            disabled={status === "submitting"}
            className={`w-full px-4 py-3 bg-[oklch(99.5%_0.004_255)] text-[oklch(18.8%_0.013_248.5)] border-2 rounded-xl outline-none transition-colors focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y ${
              errors.message ? "border-rose-400" : "border-slate-200 hover:border-slate-300"
            }`}
          />
          {errors.message ? (
            <p id="cf-message-error" role="alert" className="mt-1.5 text-sm text-rose-600">
              {errors.message}
            </p>
          ) : (
            <p id="cf-message-hint" className="mt-1.5 text-xs text-slate-500">
              Minimum 10 characters. {fields.message.length}/10.
            </p>
          )}
        </div>

        {/* FILE UPLOAD */}
        <div>
          <label htmlFor="cf-file" className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-1.5">
            Attachment <span className="font-normal text-slate-500">(optional, max 5 MB)</span>
          </label>
          <input
            ref={fileInputRef}
            id="cf-file"
            name="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFields({ ...fields, file: e.target.files?.[0] || null })}
            aria-invalid={!!errors.file}
            aria-describedby={errors.file ? "cf-file-error" : undefined}
            disabled={status === "submitting"}
            className="block w-full text-sm text-slate-600 file:mr-3 file:h-11 file:px-4 file:border-0 file:rounded-lg file:bg-slate-100 file:text-[oklch(18.8%_0.013_248.5)] file:font-semibold hover:file:bg-slate-200 file:cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2"
          />
          {errors.file && (
            <p id="cf-file-error" role="alert" className="mt-1.5 text-sm text-rose-600">
              {errors.file}
            </p>
          )}
        </div>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={status === "submitting"}
        aria-live="polite"
        className="mt-6 w-full h-12 inline-flex items-center justify-center bg-[oklch(18.8%_0.013_248.5)] text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-slate-400 disabled:cursor-wait"
      >
        {status === "submitting" ? (
          <>
            <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>

      <p className="mt-4 text-xs text-slate-500 text-center">
        We read every message. Never share your email with anyone.
      </p>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </form>
    </main>
  );
}
