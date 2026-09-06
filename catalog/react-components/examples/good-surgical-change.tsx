// GOLD: P3 Surgical Changes — references/agent-behavior.md
//
// Scenario: the user asked for exactly one thing — "add an error state to the email input."
// What changed: the `error` prop, its two ARIA wires, and the message node. Nothing else.
// What was deliberately NOT touched, though the agent noticed it:
//   • The file uses double quotes and no semicolon-free style — matched, not "improved".
//   • `formatLabel` below is dead code that predates this change — mentioned here, not deleted (P3).
//   • The wrapper div's spacing is inconsistent with the rest of the form — left alone; not the ask.
//   • No useMemo added, no variant prop invented, no design tokens extracted (P2).
import * as React from "react";

// NOTE (pre-existing, not introduced by this change): `formatLabel` appears unused in this file.
// Flagged for the owner rather than removed — deleting pre-existing dead code is out of scope.
export function formatLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export interface EmailFieldProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** Validation message. When present the field is marked invalid and the message is announced. */
  error?: string;
}

export const EmailField = React.forwardRef<HTMLInputElement, EmailFieldProps>(function EmailField(
  { value, onChange, error, id = "email", className = "", ...props },
  ref,
) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[oklch(14%_0.012_240)]">
        Work email
      </label>
      <input
        ref={ref}
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 rounded-lg border px-3 text-sm transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)] ${
          error
            ? "border-[oklch(55%_0.22_25)] bg-[oklch(99%_0.01_25)]"
            : "border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)]"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span id={errorId} role="alert" className="text-sm text-[oklch(48%_0.20_25)]">
          {error}
        </span>
      ) : null}
    </div>
  );
});

/* Demo host — shows the field's four states without inventing scope beyond the ask. */
export interface EmailFieldDemoProps {
  /** Skeleton state — drive from real loading; never an artificial delay. */
  isLoading?: boolean;
}
export default function EmailFieldDemo({ isLoading = false }: EmailFieldDemoProps = {}) {
  const [value, setValue] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const error =
    submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Enter a valid email — for example ana@arclight.io"
      : undefined;

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-8" aria-busy="true">
        <div className="h-5 w-24 animate-pulse rounded bg-[oklch(90%_0.005_240)]" />
        <div className="mt-2 h-11 w-full max-w-sm animate-pulse rounded-lg bg-[oklch(92%_0.005_240)]" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-6 lg:p-8 font-[Manrope,system-ui,sans-serif]">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        Invite a teammate
      </h1>
      <form
        className="max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <EmailField value={value} onChange={setValue} error={error} />
        <button
          type="submit"
          className="mt-4 h-11 w-full rounded-lg bg-[oklch(60%_0.185_276)] px-5 text-sm font-semibold text-[oklch(98%_0.005_240)] transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Send Invite
        </button>
      </form>
    </main>
  );
}
