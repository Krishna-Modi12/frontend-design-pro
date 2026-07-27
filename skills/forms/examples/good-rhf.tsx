// EXAMPLE: Reference-quality multi-step React Hook Form + Zod wizard
// Intent: CREATE_COMPONENT · Product: b2b-saas · Dials: DV=4 MI=3 VD=4
// Key principles on display:
//   • useForm + zodResolver with per-step Zod schemas
//   • Controller for <select> and custom inputs
//   • Multi-step state (step / currentStep) with animated progress indicator
//   • aria-describedby linking each input to its error message
//   • aria-invalid set dynamically from formState.errors
//   • All 4 states: loading skeleton, form entry, submitting, success
//   • 44px+ touch targets, focus-visible rings, dark mode classes
//   • prefers-reduced-motion respected
//   • OKLCH color palette — no hex surfaces
//   • Manrope font via @import
//   • Organic content: real job titles, real budget ranges, real timeline values

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Zod schemas — one per step ───────────────────────────────────────────────

const stepOneSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name is too long."),
  workEmail: z
    .string()
    .email("That email address doesn't look right — check the format."),
  role: z.string().min(1, "Please select your role."),
});

const stepTwoSchema = z.object({
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters.")
    .max(120, "Company name is too long."),
  budgetRange: z.string().min(1, "Please select a budget range."),
  timeline: z.string().min(1, "Please select a timeline."),
  projectGoal: z
    .string()
    .min(20, "Describe your goal in at least 20 characters.")
    .max(600, "Keep it under 600 characters."),
});

const ROLES = [
  { value: "", label: "Select your role…" },
  { value: "engineering-lead", label: "Engineering Lead" },
  { value: "product-manager", label: "Product Manager" },
  { value: "design-director", label: "Design Director" },
  { value: "cto", label: "CTO / VP Engineering" },
  { value: "founder", label: "Founder / Co-founder" },
  { value: "other", label: "Other" },
];

const BUDGETS = [
  { value: "", label: "Select a range…" },
  { value: "under-25k", label: "Under $25,000" },
  { value: "25k-75k", label: "$25,000 – $74,999" },
  { value: "75k-150k", label: "$75,000 – $149,999" },
  { value: "150k-350k", label: "$150,000 – $349,999" },
  { value: "350k-plus", label: "$350,000 and above" },
];

const TIMELINES = [
  { value: "", label: "Select a timeline…" },
  { value: "under-6w", label: "Under 6 weeks" },
  { value: "6-12w", label: "6 – 12 weeks" },
  { value: "3-6m", label: "3 – 6 months" },
  { value: "6-12m", label: "6 – 12 months" },
  { value: "ongoing", label: "Ongoing partnership" },
];

const STEPS = ["Personal Info", "Project Details", "Review & Submit"];

// ─── Sub-components ────────────────────────────────────────────────────────────

type WizardValues = {
  fullName: string; workEmail: string; role: string; company: string;
  budgetRange: string; timeline: string; projectGoal: string;
}
// react-hook-form is ambient-stubbed for the compile check; a loose form handle keeps the demo honest.
type FormHandle = ReturnType<typeof useForm>

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const pct = Math.round((currentStep / (totalSteps - 1)) * 100);
  return (
    <nav aria-label="Application progress" className="mb-8">
      <ol className="flex items-center gap-0" role="list">
        {STEPS.map((label, idx) => {
          const isComplete = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={`
                    size-9 rounded-full flex items-center justify-center text-sm font-bold
                    transition-colors duration-300 ease-out
                    ${isComplete
                      ? "bg-[oklch(55%_0.18_250)] text-white"
                      : isActive
                      ? "bg-[oklch(68%_0.2_250)] text-white ring-4 ring-[oklch(68%_0.2_250)]/25"
                      : "bg-[oklch(94%_0.01_250)] text-[oklch(55%_0.04_250)] dark:bg-[oklch(28%_0.04_250)] dark:text-[oklch(70%_0.04_250)]"
                    }
                  `}
                >
                  {isComplete ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`mt-1.5 text-xs font-medium hidden sm:block ${isActive ? "text-[oklch(55%_0.18_250)] dark:text-[oklch(72%_0.18_250)]" : "text-[oklch(55%_0.04_250)] dark:text-[oklch(60%_0.04_250)]"}`}>
                  {label}
                </span>
              </div>
              {idx < totalSteps - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-12px] sm:mt-[-24px] rounded-full bg-[oklch(90%_0.01_250)] dark:bg-[oklch(30%_0.04_250)] overflow-hidden">
                  <div
                    className="h-full bg-[oklch(55%_0.18_250)] transition duration-500 ease-out"
                    style={{ width: isComplete ? "100%" : "0%" }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="sr-only" aria-live="polite">
        Step {currentStep + 1} of {totalSteps}: {STEPS[currentStep]}
      </div>
    </nav>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-[oklch(55%_0.22_25)] dark:text-[oklch(70%_0.2_25)]">
      {message}
    </p>
  );
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-[oklch(22%_0.03_250)] dark:text-[oklch(90%_0.02_250)] mb-1.5"
    >
      {children}
      {required && (
        <span className="text-[oklch(55%_0.22_25)] ml-0.5" aria-hidden="true">*</span>
      )}
    </label>
  );
}

// ─── Step 1: Personal Info ─────────────────────────────────────────────────────

function StepOne({ form }: { form: FormHandle }) {
  const { register, control, formState: { errors } } = form;
  return (
    <section aria-labelledby="step1-heading" className="space-y-5">
      <div>
        <h2 id="step1-heading" className="text-xl font-bold text-[oklch(22%_0.03_250)] dark:text-[oklch(92%_0.02_250)]">
          Tell us about yourself
        </h2>
        <p className="mt-1 text-sm text-[oklch(50%_0.03_250)] dark:text-[oklch(65%_0.03_250)]">
          We use this to personalise your onboarding experience.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <Label htmlFor="fullName" required>Full name</Label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-required="true"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          placeholder="Amara Osei-Bonsu"
          {...register("fullName")}
          className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm bg-[oklch(99%_0.004_250)] dark:bg-[oklch(18%_0.02_250)] text-[oklch(18%_0.03_250)] dark:text-[oklch(92%_0.02_250)] outline-none transition-colors duration-200 placeholder:text-[oklch(70%_0.02_250)] focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 ${
            errors.fullName
              ? "border-[oklch(55%_0.22_25)]"
              : "border-[oklch(88%_0.03_250)] dark:border-[oklch(35%_0.04_250)] hover:border-[oklch(75%_0.05_250)] dark:hover:border-[oklch(48%_0.06_250)]"
          }`}
        />
        <FieldError id="fullName-error" message={errors.fullName?.message} />
      </div>

      {/* Work Email */}
      <div>
        <Label htmlFor="workEmail" required>Work email</Label>
        <input
          id="workEmail"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-required="true"
          aria-invalid={!!errors.workEmail}
          aria-describedby={errors.workEmail ? "workEmail-error" : "workEmail-hint"}
          placeholder="amara@tectonic.io"
          {...register("workEmail")}
          className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm bg-[oklch(99%_0.004_250)] dark:bg-[oklch(18%_0.02_250)] text-[oklch(18%_0.03_250)] dark:text-[oklch(92%_0.02_250)] outline-none transition-colors duration-200 placeholder:text-[oklch(70%_0.02_250)] focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 ${
            errors.workEmail
              ? "border-[oklch(55%_0.22_25)]"
              : "border-[oklch(88%_0.03_250)] dark:border-[oklch(35%_0.04_250)] hover:border-[oklch(75%_0.05_250)] dark:hover:border-[oklch(48%_0.06_250)]"
          }`}
        />
        {errors.workEmail ? (
          <FieldError id="workEmail-error" message={errors.workEmail?.message} />
        ) : (
          <p id="workEmail-hint" className="mt-1.5 text-xs text-[oklch(55%_0.03_250)] dark:text-[oklch(60%_0.03_250)]">
            We send project updates here — no newsletters.
          </p>
        )}
      </div>

      {/* Role */}
      <div>
        <Label htmlFor="role" required>Your role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }: { field: Record<string, unknown> }) => (
            <select
              id="role"
              aria-required="true"
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? "role-error" : undefined}
              {...field}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm bg-[oklch(99%_0.004_250)] dark:bg-[oklch(18%_0.02_250)] text-[oklch(18%_0.03_250)] dark:text-[oklch(92%_0.02_250)] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 cursor-pointer ${
                errors.role
                  ? "border-[oklch(55%_0.22_25)]"
                  : "border-[oklch(88%_0.03_250)] dark:border-[oklch(35%_0.04_250)] hover:border-[oklch(75%_0.05_250)]"
              }`}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} disabled={r.value === ""}>
                  {r.label}
                </option>
              ))}
            </select>
          )}
        />
        <FieldError id="role-error" message={errors.role?.message} />
      </div>
    </section>
  );
}

// ─── Step 2: Project Details ───────────────────────────────────────────────────

function StepTwo({ form }: { form: FormHandle }) {
  const { register, control, watch, formState: { errors } } = form;
  const goalValue = watch("projectGoal") || "";
  return (
    <section aria-labelledby="step2-heading" className="space-y-5">
      <div>
        <h2 id="step2-heading" className="text-xl font-bold text-[oklch(22%_0.03_250)] dark:text-[oklch(92%_0.02_250)]">
          Project details
        </h2>
        <p className="mt-1 text-sm text-[oklch(50%_0.03_250)] dark:text-[oklch(65%_0.03_250)]">
          Help us scope the right engagement for your team.
        </p>
      </div>

      {/* Company */}
      <div>
        <Label htmlFor="company" required>Company</Label>
        <input
          id="company"
          type="text"
          autoComplete="organization"
          aria-required="true"
          aria-invalid={!!errors.company}
          aria-describedby={errors.company ? "company-error" : undefined}
          placeholder="Tectonic Labs Inc."
          {...register("company")}
          className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm bg-[oklch(99%_0.004_250)] dark:bg-[oklch(18%_0.02_250)] text-[oklch(18%_0.03_250)] dark:text-[oklch(92%_0.02_250)] outline-none transition-colors duration-200 placeholder:text-[oklch(70%_0.02_250)] focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 ${
            errors.company
              ? "border-[oklch(55%_0.22_25)]"
              : "border-[oklch(88%_0.03_250)] dark:border-[oklch(35%_0.04_250)] hover:border-[oklch(75%_0.05_250)]"
          }`}
        />
        <FieldError id="company-error" message={errors.company?.message} />
      </div>

      {/* Budget Range */}
      <div>
        <Label htmlFor="budgetRange" required>Budget range</Label>
        <Controller
          name="budgetRange"
          control={control}
          render={({ field }: { field: Record<string, unknown> }) => (
            <select
              id="budgetRange"
              aria-required="true"
              aria-invalid={!!errors.budgetRange}
              aria-describedby={errors.budgetRange ? "budgetRange-error" : undefined}
              {...field}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm bg-[oklch(99%_0.004_250)] dark:bg-[oklch(18%_0.02_250)] text-[oklch(18%_0.03_250)] dark:text-[oklch(92%_0.02_250)] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 cursor-pointer ${
                errors.budgetRange
                  ? "border-[oklch(55%_0.22_25)]"
                  : "border-[oklch(88%_0.03_250)] dark:border-[oklch(35%_0.04_250)] hover:border-[oklch(75%_0.05_250)]"
              }`}
            >
              {BUDGETS.map((b) => (
                <option key={b.value} value={b.value} disabled={b.value === ""}>
                  {b.label}
                </option>
              ))}
            </select>
          )}
        />
        <FieldError id="budgetRange-error" message={errors.budgetRange?.message} />
      </div>

      {/* Timeline */}
      <div>
        <Label htmlFor="timeline" required>Timeline</Label>
        <Controller
          name="timeline"
          control={control}
          render={({ field }: { field: Record<string, unknown> }) => (
            <select
              id="timeline"
              aria-required="true"
              aria-invalid={!!errors.timeline}
              aria-describedby={errors.timeline ? "timeline-error" : undefined}
              {...field}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm bg-[oklch(99%_0.004_250)] dark:bg-[oklch(18%_0.02_250)] text-[oklch(18%_0.03_250)] dark:text-[oklch(92%_0.02_250)] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 cursor-pointer ${
                errors.timeline
                  ? "border-[oklch(55%_0.22_25)]"
                  : "border-[oklch(88%_0.03_250)] dark:border-[oklch(35%_0.04_250)] hover:border-[oklch(75%_0.05_250)]"
              }`}
            >
              {TIMELINES.map((t) => (
                <option key={t.value} value={t.value} disabled={t.value === ""}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        />
        <FieldError id="timeline-error" message={errors.timeline?.message} />
      </div>

      {/* Project Goal */}
      <div>
        <Label htmlFor="projectGoal" required>Project goal</Label>
        <textarea
          id="projectGoal"
          rows={4}
          aria-required="true"
          aria-invalid={!!errors.projectGoal}
          aria-describedby={errors.projectGoal ? "projectGoal-error" : "projectGoal-hint"}
          placeholder="We need to re-architect our data pipeline to handle 3.7M daily events with sub-200ms query latency…"
          {...register("projectGoal")}
          className={`w-full px-4 py-3 rounded-xl border-2 text-sm bg-[oklch(99%_0.004_250)] dark:bg-[oklch(18%_0.02_250)] text-[oklch(18%_0.03_250)] dark:text-[oklch(92%_0.02_250)] outline-none transition-colors duration-200 placeholder:text-[oklch(70%_0.02_250)] focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 resize-y min-h-[120px] ${
            errors.projectGoal
              ? "border-[oklch(55%_0.22_25)]"
              : "border-[oklch(88%_0.03_250)] dark:border-[oklch(35%_0.04_250)] hover:border-[oklch(75%_0.05_250)]"
          }`}
        />
        {errors.projectGoal ? (
          <FieldError id="projectGoal-error" message={errors.projectGoal?.message} />
        ) : (
          <p id="projectGoal-hint" className="mt-1.5 text-xs text-[oklch(55%_0.03_250)] dark:text-[oklch(60%_0.03_250)]">
            {goalValue.length}/600 characters — describe the outcome, not the task.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Step 3: Review ────────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-[oklch(90%_0.02_250)] dark:border-[oklch(28%_0.04_250)] last:border-b-0">
      <dt className="text-sm text-[oklch(50%_0.03_250)] dark:text-[oklch(60%_0.03_250)] font-medium shrink-0 w-32">
        {label}
      </dt>
      <dd className="text-sm text-[oklch(22%_0.03_250)] dark:text-[oklch(88%_0.02_250)] text-right font-medium">
        {value || <span className="text-[oklch(65%_0.03_250)]">—</span>}
      </dd>
    </div>
  );
}

function StepReview({ allValues }: { allValues: Partial<WizardValues> }) {
  const roleLabel = ROLES.find((r) => r.value === allValues.role)?.label ?? allValues.role;
  const budgetLabel = BUDGETS.find((b) => b.value === allValues.budgetRange)?.label ?? allValues.budgetRange;
  const timelineLabel = TIMELINES.find((t) => t.value === allValues.timeline)?.label ?? allValues.timeline;

  return (
    <section aria-labelledby="step3-heading" className="space-y-5">
      <div>
        <h2 id="step3-heading" className="text-xl font-bold text-[oklch(22%_0.03_250)] dark:text-[oklch(92%_0.02_250)]">
          Review your application
        </h2>
        <p className="mt-1 text-sm text-[oklch(50%_0.03_250)] dark:text-[oklch(65%_0.03_250)]">
          Everything look right? Hit submit — we respond within one business day.
        </p>
      </div>

      <article
        aria-label="Application summary"
        className="rounded-xl border border-[oklch(88%_0.03_250)] dark:border-[oklch(30%_0.04_250)] bg-[oklch(98%_0.005_250)] dark:bg-[oklch(16%_0.02_250)] px-4 py-1"
      >
        <dl>
          <ReviewRow label="Name" value={allValues.fullName} />
          <ReviewRow label="Email" value={allValues.workEmail} />
          <ReviewRow label="Role" value={roleLabel} />
          <ReviewRow label="Company" value={allValues.company} />
          <ReviewRow label="Budget" value={budgetLabel} />
          <ReviewRow label="Timeline" value={timelineLabel} />
          <ReviewRow label="Goal" value={allValues.projectGoal} />
        </dl>
      </article>

      <div
        role="note"
        className="flex gap-3 p-3.5 rounded-xl bg-[oklch(96%_0.02_250)] dark:bg-[oklch(20%_0.04_250)] border border-[oklch(85%_0.06_250)] dark:border-[oklch(32%_0.06_250)]"
      >
        <svg className="shrink-0 mt-0.5 text-[oklch(55%_0.18_250)]" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-xs text-[oklch(38%_0.03_250)] dark:text-[oklch(70%_0.03_250)] leading-relaxed">
          By submitting you agree to our intake process. We never share your details with third parties. Our typical first-call rate is 94.3%.
        </p>
      </div>
    </section>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(97%_0.008_250)] dark:bg-[oklch(12%_0.02_250)] p-4" aria-busy="true" aria-label="Loading application form">
      <div className="w-full max-w-lg rounded-2xl border border-[oklch(90%_0.02_250)] dark:border-[oklch(28%_0.04_250)] bg-[oklch(99%_0.004_250)] dark:bg-[oklch(15%_0.02_250)] p-6 sm:p-8 space-y-5">
        <div className="flex gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="size-9 rounded-full animate-pulse bg-[oklch(90%_0.02_250)] dark:bg-[oklch(28%_0.04_250)]" />
              <div className="h-3 w-16 rounded animate-pulse bg-[oklch(92%_0.01_250)] dark:bg-[oklch(26%_0.03_250)]" />
            </div>
          ))}
        </div>
        <div className="h-7 w-52 rounded-lg animate-pulse bg-[oklch(90%_0.02_250)] dark:bg-[oklch(28%_0.04_250)]" />
        <div className="h-4 w-72 rounded animate-pulse bg-[oklch(93%_0.01_250)] dark:bg-[oklch(24%_0.03_250)]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 rounded animate-pulse bg-[oklch(92%_0.01_250)] dark:bg-[oklch(26%_0.03_250)]" />
            <div className="h-11 w-full rounded-xl animate-pulse bg-[oklch(93%_0.01_250)] dark:bg-[oklch(24%_0.03_250)]" />
          </div>
        ))}
        <div className="h-12 w-full rounded-xl animate-pulse bg-[oklch(88%_0.04_250)] dark:bg-[oklch(30%_0.06_250)]" />
      </div>
    </main>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────

function SuccessScreen({ name, onReset }: { name: string; onReset: () => void }) {
  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-[oklch(97%_0.008_250)] dark:bg-[oklch(12%_0.02_250)] p-4"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[oklch(88%_0.03_250)] dark:border-[oklch(30%_0.04_250)] bg-[oklch(99%_0.004_250)] dark:bg-[oklch(15%_0.02_250)] p-8 text-center font-[Manrope,system-ui,sans-serif]">
        <div className="size-16 mx-auto rounded-full bg-[oklch(93%_0.08_165)] dark:bg-[oklch(30%_0.1_165)] flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12.5L9 17.5L20 7" stroke="oklch(42% 0.18 165)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-[oklch(22%_0.03_250)] dark:text-[oklch(92%_0.02_250)] tracking-tight">
          Application received, {name.split(" ")[0]}.
        </h2>
        <p className="mt-2.5 text-sm text-[oklch(50%_0.03_250)] dark:text-[oklch(65%_0.03_250)] max-w-sm mx-auto leading-relaxed">
          Our solutions team reviews every submission. You'll hear back within one business day — typically in under 6 hours.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            type="button"
            onClick={onReset}
            className="h-11 px-5 inline-flex items-center font-semibold text-sm rounded-xl border-2 border-[oklch(82%_0.05_250)] dark:border-[oklch(38%_0.06_250)] text-[oklch(30%_0.04_250)] dark:text-[oklch(82%_0.03_250)] hover:bg-[oklch(95%_0.01_250)] dark:hover:bg-[oklch(22%_0.04_250)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2"
          >
            Submit another
          </button>
        </div>
      </div>
    </main>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export interface ProjectApplicationWizardProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function ProjectApplicationWizard({ isLoading: initialLoading = false }: ProjectApplicationWizardProps = {}) {
  const [isLoading] = useState(initialLoading);
  const [step, setStep] = useState(0); // currentStep index: 0 | 1 | 2
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");
  const [collectedValues, setCollectedValues] = useState<Partial<WizardValues>>({});


  const schemas = [stepOneSchema, stepTwoSchema, null];

  const form = useForm({
    resolver: step < 2 ? zodResolver(schemas[step]) : undefined,
    defaultValues: {
      fullName: "",
      workEmail: "",
      role: "",
      company: "",
      budgetRange: "",
      timeline: "",
      projectGoal: "",
    },
    mode: "onTouched",
  });

  const { handleSubmit, getValues, formState: { errors, isValid } } = form;

  async function onNext(data: Partial<WizardValues>) {
    setCollectedValues((prev) => ({ ...prev, ...data }));
    if (step < 2) {
      setStep((s) => s + 1);
    }
  }

  async function onSubmit(data: Partial<WizardValues>) {
    const finalData = { ...collectedValues, ...data };
    setSubmitStatus("submitting");
    setServerError("");
    try {
      // Simulated async API call — replace with real endpoint
      await new Promise((resolve) => setTimeout(resolve, 1600));
      setCollectedValues(finalData);
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setServerError((err instanceof Error ? err.message : "") || "Something went wrong on our end. Please try again in a moment.");
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleReset() {
    form.reset();
    setStep(0);
    setSubmitStatus("idle");
    setServerError("");
    setCollectedValues({});
  }

  if (isLoading) return <Skeleton />;
  if (submitStatus === "success") {
    return <SuccessScreen name={collectedValues.fullName || "there"} onReset={handleReset} />;
  }

  const allValues = { ...collectedValues, ...getValues() };

  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-[oklch(97%_0.008_250)] dark:bg-[oklch(12%_0.02_250)] p-4 font-[Manrope,system-ui,sans-serif]"
    >
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[oklch(40%_0.18_250)] focus:text-white focus:font-semibold focus:text-sm focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)]"
      >
        Skip to main content
      </a>

      <div className="w-full max-w-lg">
        <header className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[oklch(22%_0.03_250)] dark:text-[oklch(92%_0.02_250)] tracking-tight">
            Start a project with us
          </h1>
          <p className="mt-1.5 text-sm text-[oklch(50%_0.03_250)] dark:text-[oklch(65%_0.03_250)]">
            Takes about 3 minutes — no obligations.
          </p>
        </header>

        <div id="main-content" className="rounded-2xl border border-[oklch(88%_0.03_250)] dark:border-[oklch(28%_0.04_250)] bg-[oklch(99%_0.004_250)] dark:bg-[oklch(15%_0.02_250)] p-6 sm:p-8">
          <ProgressBar currentStep={step} totalSteps={STEPS.length} />

          {submitStatus === "error" && serverError && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-xl bg-[oklch(97%_0.04_25)] dark:bg-[oklch(20%_0.06_25)] border border-[oklch(85%_0.1_25)] dark:border-[oklch(38%_0.12_25)] text-sm text-[oklch(38%_0.15_25)] dark:text-[oklch(78%_0.12_25)]"
            >
              <p className="font-semibold mb-0.5">Submission failed</p>
              <p>{serverError}</p>
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit(step === 2 ? onSubmit : onNext)}
          >
            {step === 0 && <StepOne form={form} />}
            {step === 1 && <StepTwo form={form} />}
            {step === 2 && <StepReview allValues={allValues} />}

            <div className="mt-7 flex gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitStatus === "submitting"}
                  className="h-11 px-5 inline-flex items-center font-semibold text-sm rounded-xl border-2 border-[oklch(82%_0.05_250)] dark:border-[oklch(38%_0.06_250)] text-[oklch(30%_0.04_250)] dark:text-[oklch(82%_0.03_250)] hover:bg-[oklch(95%_0.01_250)] dark:hover:bg-[oklch(22%_0.04_250)] transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={submitStatus === "submitting"}
                aria-live="polite"
                className="flex-1 h-11 inline-flex items-center justify-center font-semibold text-sm rounded-xl bg-[oklch(40%_0.18_250)] hover:bg-[oklch(34%_0.2_250)] dark:bg-[oklch(58%_0.2_250)] dark:hover:bg-[oklch(52%_0.22_250)] text-white transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[oklch(68%_0.2_250)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {submitStatus === "submitting" ? (
                  <>
                    <span
                      className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"
                      aria-hidden="true"
                    />
                    Submitting…
                  </>
                ) : step === 2 ? (
                  "Submit application"
                ) : (
                  "Continue"
                )}
              </button>
            </div>

            <p className="mt-4 text-xs text-[oklch(62%_0.02_250)] dark:text-[oklch(55%_0.03_250)] text-center">
              Step {step + 1} of {STEPS.length} — {Math.round((step / (STEPS.length - 1)) * 100)}% complete
            </p>
          </form>
        </div>
      </div>

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
