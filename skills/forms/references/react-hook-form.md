# React Hook Form Reference

Source: react-hook-form/react-hook-form (official docs synthesis)

---

## Contents

- [1. Setup](#1-setup)
- [2. register vs Controller](#2-register-vs-controller)
- [3. Zod Schema Patterns](#3-zod-schema-patterns)
- [4. Error Display](#4-error-display)
- [5. Field Arrays (useFieldArray)](#5-field-arrays-usefieldarray)
- [6. Dynamic / Conditional Fields](#6-dynamic--conditional-fields)
- [7. Multi-Step Wizard](#7-multi-step-wizard)
- [8. File Upload Validation](#8-file-upload-validation)
- [9. Async Validation](#9-async-validation)
- [10. Server Actions Integration (Next.js)](#10-server-actions-integration-nextjs)
- [11. Reset + Programmatic Control](#11-reset--programmatic-control)
- [12. Performance](#12-performance)
- [13. Anti-Patterns](#13-anti-patterns)

---

## 1. Setup

### Installation

```bash
npm install react-hook-form @hookform/resolvers zod
```

### Basic useForm with zodResolver

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Infer TypeScript type directly from Zod schema — single source of truth
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await signIn(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} type="email" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register("password")} type="password" />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
```

---

## 2. register vs Controller

### When to use register

Use `register` for **native HTML inputs** — it spreads `ref`, `name`, `onChange`, `onBlur` directly onto the element. Zero overhead.

- `<input type="text" />`
- `<input type="email" />`
- `<input type="password" />`
- `<input type="checkbox" />`
- `<input type="radio" />`
- `<textarea />`
- `<select />` (native, not custom)

```tsx
const schema = z.object({
  username: z.string().min(3),
  bio: z.string().max(500).optional(),
  role: z.enum(["admin", "editor", "viewer"]),
  newsletter: z.boolean(),
  plan: z.enum(["free", "pro", "enterprise"]),
});

type FormValues = z.infer<typeof schema>;

function NativeInputsForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      bio: "",
      role: "viewer",
      newsletter: false,
      plan: "free",
    },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* Text input */}
      <input {...register("username")} type="text" placeholder="Username" />
      {errors.username && <span>{errors.username.message}</span>}

      {/* Textarea */}
      <textarea {...register("bio")} rows={4} />

      {/* Native select */}
      <select {...register("role")}>
        <option value="admin">Admin</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>

      {/* Checkbox */}
      <label>
        <input {...register("newsletter")} type="checkbox" />
        Subscribe to newsletter
      </label>

      {/* Radio group */}
      <label>
        <input {...register("plan")} type="radio" value="free" /> Free
      </label>
      <label>
        <input {...register("plan")} type="radio" value="pro" /> Pro
      </label>
      <label>
        <input {...register("plan")} type="radio" value="enterprise" /> Enterprise
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}
```

### When to use Controller

Use `Controller` for **custom/third-party components** that don't expose a native `ref` or have non-standard change events. Controller provides `field` (value, onChange, onBlur, ref, name) and `fieldState` (error, isTouched, isDirty).

- shadcn/ui `<Select>`, `<Checkbox>`, `<RadioGroup>`
- `react-datepicker` / shadcn `<DatePicker>`
- Custom number inputs, rich text editors, file pickers
- Any component where `onChange` receives a non-event value

```tsx
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  country: z.string().min(1, "Country is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms",
  }),
});

type FormValues = z.infer<typeof schema>;

function CustomComponentsForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: "",
      acceptTerms: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* shadcn Select */}
      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="gb">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.country && <p>{errors.country.message}</p>}

      {/* Date Picker */}
      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onSelect={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {errors.startDate && <p>{errors.startDate.message}</p>}

      {/* shadcn Checkbox */}
      <Controller
        name="acceptTerms"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label htmlFor="terms">I accept the terms and conditions</label>
          </div>
        )}
      />
      {errors.acceptTerms && <p>{errors.acceptTerms.message}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 3. Zod Schema Patterns

### String validations

```ts
const stringSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(100, "Max 100 characters"),
  email: z.string().email("Invalid email"),
  website: z.string().url("Must be a valid URL").optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  bio: z.string().max(500).optional().or(z.literal("")),
});
```

### Number coercion (form inputs are always strings)

```ts
const numberSchema = z.object({
  // z.coerce.number() parses "42" → 42; handles empty string → NaN → caught by .positive()
  age: z.coerce.number().int().positive("Must be a positive integer").max(120),
  price: z.coerce.number().min(0, "Price cannot be negative").multipleOf(0.01),
  quantity: z.coerce.number().int().min(1).max(999),
});
```

### Optional fields

```ts
const optionalSchema = z.object({
  required: z.string().min(1),
  // Three ways to express optional:
  optionalString: z.string().optional(),              // string | undefined
  nullableString: z.string().nullable(),              // string | null
  optionalOrEmpty: z.string().optional().or(z.literal("")), // handles empty inputs
});
```

### Discriminated union for conditional forms

```ts
const paymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardNumber: z.string().length(16, "Must be 16 digits"),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/),
    cvv: z.string().length(3),
  }),
  z.object({
    method: z.literal("bank"),
    accountNumber: z.string().min(8).max(12),
    routingNumber: z.string().length(9),
  }),
  z.object({
    method: z.literal("paypal"),
    paypalEmail: z.string().email(),
  }),
]);

type PaymentFormValues = z.infer<typeof paymentSchema>;
```

### Cross-field validation with refine (passwords match)

```ts
const registrationSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error appears on confirmPassword field
  });

// superRefine for multiple cross-field checks
const advancedSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
    minAge: z.coerce.number(),
    maxAge: z.coerce.number(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }
    if (data.maxAge <= data.minAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Max age must be greater than min age",
        path: ["maxAge"],
      });
    }
  });
```

---

## 4. Error Display

### Field-level errors with aria-describedby

```tsx
function AccessibleInput({
  id,
  label,
  registration,
  error,
}: {
  id: string;
  label: string;
  registration: ReturnType<UseFormRegister<any>>;
  error?: FieldError;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        {...registration}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "border rounded px-3 py-2 w-full",
          error && "border-red-500 focus:ring-red-500"
        )}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

// Usage
function FormWithAccessibleErrors() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <AccessibleInput
        id="email"
        label="Email address"
        registration={register("email")}
        error={errors.email}
      />
      <AccessibleInput
        id="password"
        label="Password"
        registration={register("password")}
        error={errors.password}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Form-level error summary for accessibility

Announce all errors at once for screen reader users — place at top of form, auto-focus when errors appear.

```tsx
import { useEffect, useRef } from "react";
import { FieldErrors } from "react-hook-form";

function ErrorSummary<T extends Record<string, unknown>>({
  errors,
}: {
  errors: FieldErrors<T>;
}) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorList = Object.entries(errors).filter(([, v]) => v?.message);

  useEffect(() => {
    if (errorList.length > 0) {
      summaryRef.current?.focus();
    }
  }, [errorList.length]);

  if (errorList.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="rounded border border-red-300 bg-red-50 p-4 mb-4 focus:outline-none"
    >
      <h2 className="text-sm font-semibold text-red-800 mb-2">
        Please fix the following errors:
      </h2>
      <ul className="list-disc list-inside space-y-1">
        {errorList.map(([field, error]) => (
          <li key={field} className="text-sm text-red-700">
            <a href={`#${field}`} className="underline">
              {field}
            </a>
            : {(error as FieldError).message}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Usage inside form
function FormWithSummary() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "" },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <ErrorSummary errors={errors} />
      <input id="email" {...register("email")} type="email" />
      <input id="name" {...register("name")} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 5. Field Arrays (useFieldArray)

### Basic append / remove

```tsx
import { useForm, useFieldArray } from "react-hook-form";

const schema = z.object({
  team: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
      })
    )
    .min(1, "Add at least one team member")
    .max(10, "Maximum 10 members"),
});

type FormValues = z.infer<typeof schema>;

function TeamForm() {
  const { register, control, handleSubmit, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        team: [{ name: "", email: "" }],
      },
    });

  const { fields, append, remove, move, swap } = useFieldArray({
    control,
    name: "team",
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, index) => (
        // CRITICAL: use field.id as key, NOT index — preserves identity during reorder
        <div key={field.id} className="flex gap-2 mb-2">
          <input
            {...register(`team.${index}.name`)}
            placeholder="Full name"
          />
          {errors.team?.[index]?.name && (
            <span>{errors.team[index].name?.message}</span>
          )}

          <input
            {...register(`team.${index}.email`)}
            type="email"
            placeholder="Email"
          />
          {errors.team?.[index]?.email && (
            <span>{errors.team[index].email?.message}</span>
          )}

          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            Remove
          </button>

          {/* Move up/down */}
          <button
            type="button"
            onClick={() => move(index, index - 1)}
            disabled={index === 0}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(index, index + 1)}
            disabled={index === fields.length - 1}
          >
            ↓
          </button>
        </div>
      ))}

      {errors.team?.root && <p>{errors.team.root.message}</p>}

      <button
        type="button"
        onClick={() => append({ name: "", email: "" })}
        disabled={fields.length >= 10}
      >
        Add member
      </button>

      <button type="submit">Save team</button>
    </form>
  );
}
```

### Drag-to-reorder with @dnd-kit

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({
  id,
  index,
  register,
  remove,
}: {
  id: string;
  index: number;
  register: UseFormRegister<FormValues>;
  remove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2">
      <button type="button" {...attributes} {...listeners} className="cursor-grab">
        ⠿
      </button>
      <input {...register(`team.${index}.name`)} placeholder="Name" />
      <button type="button" onClick={() => remove(index)}>
        ✕
      </button>
    </div>
  );
}

function DraggableTeamForm() {
  const { register, control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { team: [{ name: "", email: "" }] },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "team" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableItem key={field.id} id={field.id} index={index} register={register} remove={remove} />
          ))}
        </SortableContext>
      </DndContext>
      <button type="button" onClick={() => append({ name: "", email: "" })}>Add</button>
      <button type="submit">Save</button>
    </form>
  );
}
```

---

## 6. Dynamic / Conditional Fields

### watch() to show/hide fields

```tsx
const schema = z.discriminatedUnion("contactMethod", [
  z.object({ contactMethod: z.literal("email"), email: z.string().email() }),
  z.object({ contactMethod: z.literal("phone"), phone: z.string().min(10) }),
  z.object({ contactMethod: z.literal("mail"), address: z.string().min(5) }),
]);

type FormValues = z.infer<typeof schema>;

function ConditionalForm() {
  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { contactMethod: "email", email: "" } as FormValues,
    });

  // watch re-renders this component when contactMethod changes
  const contactMethod = watch("contactMethod");

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <select {...register("contactMethod")}>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="mail">Mail</option>
      </select>

      {contactMethod === "email" && (
        <input {...register("email")} type="email" placeholder="your@email.com" />
      )}
      {contactMethod === "phone" && (
        <input {...register("phone")} type="tel" placeholder="+1 555 000 0000" />
      )}
      {contactMethod === "mail" && (
        <textarea {...register("address")} placeholder="Mailing address" />
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### useWatch for performance (isolates re-renders)

```tsx
import { useWatch, Control } from "react-hook-form";

// This child component re-renders when 'plan' changes — parent does NOT re-render
function PlanSummary({ control }: { control: Control<FormValues> }) {
  const plan = useWatch({ control, name: "plan" });

  const prices: Record<string, string> = {
    free: "$0/mo",
    pro: "$19/mo",
    enterprise: "Custom",
  };

  return (
    <div className="rounded bg-blue-50 p-3 text-sm">
      Selected plan: <strong>{plan}</strong> — {prices[plan] ?? "—"}
    </div>
  );
}

function PricingForm() {
  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: { plan: "free" },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <select {...register("plan")}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>

      {/* Only PlanSummary re-renders when plan changes */}
      <PlanSummary control={control} />

      <button type="submit">Select plan</button>
    </form>
  );
}
```

### setValue and trigger for programmatic control

```tsx
function AddressForm() {
  const { register, handleSubmit, setValue, trigger, formState: { errors } } =
    useForm<AddressValues>({
      resolver: zodResolver(addressSchema),
      defaultValues: { street: "", city: "", state: "", zip: "" },
    });

  // Auto-fill city/state when zip changes
  async function handleZipBlur(e: React.FocusEvent<HTMLInputElement>) {
    const zip = e.target.value;
    if (zip.length === 5) {
      const location = await lookupZip(zip);
      if (location) {
        setValue("city", location.city, { shouldValidate: true, shouldDirty: true });
        setValue("state", location.state, { shouldValidate: true, shouldDirty: true });
        // Manually trigger validation on programmatically set fields
        await trigger(["city", "state"]);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register("street")} placeholder="Street address" />
      <input {...register("zip")} onBlur={handleZipBlur} placeholder="ZIP code" maxLength={5} />
      <input {...register("city")} placeholder="City" />
      <input {...register("state")} placeholder="State" />
      <button type="submit">Save address</button>
    </form>
  );
}
```

---

## 7. Multi-Step Wizard

```tsx
import {
  FormProvider,
  useForm,
  useFormContext,
  SubmitHandler,
} from "react-hook-form";

const wizardSchema = z.object({
  // Step 1
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  // Step 2
  company: z.string().min(1),
  role: z.string().min(1),
  // Step 3
  plan: z.enum(["free", "pro", "enterprise"]),
  billingEmail: z.string().email(),
});

type WizardValues = z.infer<typeof wizardSchema>;

const STEPS = [
  { title: "Personal Info", fields: ["firstName", "lastName", "email"] as const },
  { title: "Work Details", fields: ["company", "role"] as const },
  { title: "Choose Plan",  fields: ["plan", "billingEmail"] as const },
];

// Step 1 component reads from FormProvider context
function Step1() {
  const { register, formState: { errors } } = useFormContext<WizardValues>();
  return (
    <div>
      <input {...register("firstName")} placeholder="First name" />
      {errors.firstName && <p>{errors.firstName.message}</p>}
      <input {...register("lastName")} placeholder="Last name" />
      {errors.lastName && <p>{errors.lastName.message}</p>}
      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}
    </div>
  );
}

function Step2() {
  const { register, formState: { errors } } = useFormContext<WizardValues>();
  return (
    <div>
      <input {...register("company")} placeholder="Company" />
      {errors.company && <p>{errors.company.message}</p>}
      <input {...register("role")} placeholder="Job title" />
      {errors.role && <p>{errors.role.message}</p>}
    </div>
  );
}

function Step3() {
  const { register, formState: { errors } } = useFormContext<WizardValues>();
  return (
    <div>
      <select {...register("plan")}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <input {...register("billingEmail")} type="email" placeholder="Billing email" />
      {errors.billingEmail && <p>{errors.billingEmail.message}</p>}
    </div>
  );
}

const StepComponents = [Step1, Step2, Step3];

export function MultiStepWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    // All defaultValues up front — prevents uncontrolled→controlled warnings
    defaultValues: {
      firstName: "", lastName: "", email: "",
      company: "", role: "",
      plan: "free", billingEmail: "",
    },
    // Validate only on submit by default; trigger() handles per-step validation
    mode: "onTouched",
  });

  const isLastStep = currentStep === STEPS.length - 1;

  async function handleNext() {
    const fields = STEPS[currentStep].fields;
    // Validate only the current step's fields before advancing
    const valid = await methods.trigger(fields);
    if (valid) setCurrentStep((s) => s + 1);
  }

  const onSubmit: SubmitHandler<WizardValues> = async (data) => {
    await submitRegistration(data);
  };

  const StepComponent = StepComponents[currentStep];

  return (
    <FormProvider {...methods}>
      {/* Progress indicator */}
      <nav aria-label="Form progress" className="flex gap-2 mb-6">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              "flex-1 h-2 rounded",
              index <= currentStep ? "bg-blue-500" : "bg-gray-200"
            )}
            aria-current={index === currentStep ? "step" : undefined}
          />
        ))}
      </nav>

      <h2>{STEPS[currentStep].title}</h2>
      <p className="text-sm text-gray-500">
        Step {currentStep + 1} of {STEPS.length}
      </p>

      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <StepComponent />

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
          >
            Back
          </button>

          {isLastStep ? (
            <button type="submit" disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? "Submitting..." : "Complete"}
            </button>
          ) : (
            <button type="button" onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
```

---

## 8. File Upload Validation

```tsx
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const fileSchema = z.object({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "File is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_SIZE_MB * 1024 * 1024,
      `Max file size is ${MAX_SIZE_MB}MB`
    )
    .refine(
      (files) => ACCEPTED_TYPES.includes(files?.[0]?.type),
      "Only JPEG, PNG, WebP, and PDF files are accepted"
    ),
  attachments: z
    .custom<FileList>()
    .refine((files) => files?.length <= 5, "Maximum 5 files allowed")
    .refine(
      (files) =>
        Array.from(files ?? []).every((f) => f.size <= MAX_SIZE_MB * 1024 * 1024),
      "Each file must be under 5MB"
    )
    .optional(),
});

type FileFormValues = z.infer<typeof fileSchema>;

function FileUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, watch } =
    useForm<FileFormValues>({ resolver: zodResolver(fileSchema) });

  // Create preview URL for avatar
  const avatarFiles = watch("avatar");
  useEffect(() => {
    if (avatarFiles?.[0]) {
      const url = URL.createObjectURL(avatarFiles[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url); // cleanup
    }
  }, [avatarFiles]);

  const attachmentFiles = watch("attachments");
  useEffect(() => {
    if (attachmentFiles) {
      setAttachmentNames(Array.from(attachmentFiles).map((f) => f.name));
    }
  }, [attachmentFiles]);

  const onSubmit = async (data: FileFormValues) => {
    const formData = new FormData();
    formData.append("avatar", data.avatar[0]);
    if (data.attachments) {
      Array.from(data.attachments).forEach((file) =>
        formData.append("attachments", file)
      );
    }
    await fetch("/api/upload", { method: "POST", body: formData });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Single file with preview */}
      <div>
        <label htmlFor="avatar">Profile photo</label>
        <input
          id="avatar"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          {...register("avatar")}
        />
        {preview && (
          <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2" />
        )}
        {errors.avatar && (
          <p className="text-red-600 text-sm">{errors.avatar.message as string}</p>
        )}
      </div>

      {/* Multiple files */}
      <div>
        <label htmlFor="attachments">Attachments (max 5)</label>
        <input
          id="attachments"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          {...register("attachments")}
        />
        {attachmentNames.length > 0 && (
          <ul className="mt-1 text-sm">
            {attachmentNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
        {errors.attachments && (
          <p className="text-red-600 text-sm">{errors.attachments.message as string}</p>
        )}
      </div>

      <button type="submit">Upload</button>
    </form>
  );
}
```

---

## 9. Async Validation

### Debounced username availability check

```tsx
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

// Simple debounce utility
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

function UsernameForm() {
  const [checkingUsername, setCheckingUsername] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "" },
    mode: "onChange",
  });

  const checkUsername = useDebounce(async (value: string) => {
    if (value.length < 3) return;
    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
      const { available } = await res.json();
      if (!available) {
        setError("username", {
          type: "manual",
          message: "This username is already taken",
        });
      } else {
        clearErrors("username");
      }
    } finally {
      setCheckingUsername(false);
    }
  }, 400);

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <div className="relative">
        <input
          {...register("username", {
            onChange: (e) => checkUsername(e.target.value),
          })}
          placeholder="Username"
        />
        {checkingUsername && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            Checking...
          </span>
        )}
        {!checkingUsername && !errors.username && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs">
            ✓ Available
          </span>
        )}
      </div>
      {errors.username && <p className="text-red-600 text-sm">{errors.username.message}</p>}

      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}

      <button type="submit" disabled={checkingUsername}>
        Register
      </button>
    </form>
  );
}
```

### async validate in rules (without zodResolver)

```tsx
// When not using zodResolver, async validate goes in register rules
const { register } = useForm<{ username: string }>();

<input
  {...register("username", {
    required: "Username is required",
    validate: async (value) => {
      const res = await fetch(`/api/check-username?u=${value}`);
      const { available } = await res.json();
      return available || "Username is already taken";
    },
  })}
/>
```

---

## 10. Server Actions Integration (Next.js)

### handleSubmit with Server Action

```tsx
// app/actions.ts
"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function submitContact(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = contactSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await db.contact.create({ data: result.data });
  return { success: true, errors: null };
}
```

```tsx
// app/contact/form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContact } from "../actions";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));

    const result = await submitContact(formData);

    if (!result.success && result.errors) {
      // Map server errors back to form fields
      Object.entries(result.errors).forEach(([field, messages]) => {
        setError(field as keyof FormValues, {
          type: "server",
          message: messages?.[0],
        });
      });
      return;
    }

    reset();
  };

  if (isSubmitSuccessful) {
    return <p className="text-green-600">Message sent! We'll be in touch soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Your name" />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}

      <textarea {...register("message")} rows={5} placeholder="Your message" />
      {errors.message && <p>{errors.message.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
```

### Progressive enhancement with useFormState

```tsx
// For forms that must work without JavaScript
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitContact } from "../actions";

// Server action must accept (prevState, formData) signature
export async function submitContactAction(
  prevState: { success: boolean; error: string | null },
  formData: FormData
) {
  // ... same logic as above
  return { success: true, error: null };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send"}
    </button>
  );
}

export function ProgressiveContactForm() {
  const [state, formAction] = useFormState(submitContactAction, {
    success: false,
    error: null,
  });

  return (
    <form action={formAction}>
      <input name="name" required placeholder="Name" />
      <input name="email" type="email" required placeholder="Email" />
      <textarea name="message" required minLength={10} rows={5} />
      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.success && <p className="text-green-600">Message sent!</p>}
      <SubmitButton />
    </form>
  );
}
```

---

## 11. Reset + Programmatic Control

```tsx
function ProfileForm({ user }: { user: User }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setFocus,
    setError,
    getValues,
    formState: { isDirty, dirtyFields },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio ?? "",
    },
  });

  // reset() — restore to defaultValues (or new values)
  function handleCancel() {
    reset(); // back to current defaultValues
  }

  // reset with new values — e.g., after fetching updated user
  async function handleRefresh() {
    const freshUser = await fetchUser(user.id);
    reset({
      name: freshUser.name,
      email: freshUser.email,
      bio: freshUser.bio ?? "",
    });
  }

  // setFocus — move cursor to a field programmatically
  function focusFirstError() {
    setFocus("name");
  }

  // getValues — read current values without subscribing (e.g., for multi-step)
  function handleSaveDraft() {
    const values = getValues(); // snapshot without triggering render
    localStorage.setItem("draft", JSON.stringify(values));
  }

  // setValue — set a field value imperatively
  function applyTemplate(template: Partial<ProfileValues>) {
    Object.entries(template).forEach(([key, value]) => {
      setValue(key as keyof ProfileValues, value as string, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  }

  const onSubmit = async (data: ProfileValues) => {
    try {
      await updateProfile(data);
      reset(data); // reset dirty state to new saved values
    } catch (err) {
      // Map server-returned errors back to form fields
      if (err instanceof ApiError && err.fieldErrors) {
        err.fieldErrors.forEach(({ field, message }) => {
          setError(field as keyof ProfileValues, {
            type: "server",
            message,
          });
        });
        // Focus the first errored field
        const firstError = err.fieldErrors[0]?.field as keyof ProfileValues;
        if (firstError) setFocus(firstError);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      <input {...register("email")} type="email" />
      <textarea {...register("bio")} />

      <div className="flex gap-2">
        <button type="submit" disabled={!isDirty}>Save changes</button>
        <button type="button" onClick={handleCancel} disabled={!isDirty}>Cancel</button>
        <button type="button" onClick={handleSaveDraft}>Save draft</button>
      </div>

      {isDirty && (
        <p className="text-sm text-amber-600">
          You have unsaved changes in:{" "}
          {Object.keys(dirtyFields).join(", ")}
        </p>
      )}
    </form>
  );
}
```

---

## 12. Performance

### shouldUnregister (default: false — why this matters)

```tsx
// shouldUnregister: false (default)
// When a field unmounts, its VALUE is preserved in form state.
// This is correct for multi-step wizards and conditional fields.

const methods = useForm<WizardValues>({
  shouldUnregister: false, // default — values survive unmount
  defaultValues: { step1Field: "", step2Field: "" },
});

// shouldUnregister: true
// When a field unmounts, its value AND validation are removed.
// Use only when you WANT unmounted field data cleared — rare.
const strictMethods = useForm({
  shouldUnregister: true, // values purged on unmount
});
```

### defaultValues — critical for controlled inputs

```tsx
// WRONG — no defaultValues causes uncontrolled→controlled React warning
// and breaks isDirty tracking (can't diff against "nothing")
const bad = useForm<{ name: string; age: number }>();

// CORRECT — always provide defaultValues matching your schema shape
const good = useForm<{ name: string; age: number }>({
  defaultValues: {
    name: "",      // string fields → ""
    age: 0,        // number fields → 0 (or undefined + z.coerce)
  },
});

// For async defaultValues (pre-populating from API):
const { reset } = useForm<UserValues>({ defaultValues: { name: "", bio: "" } });

useEffect(() => {
  async function load() {
    const user = await fetchUser(id);
    reset(user); // populate after fetch; also resets isDirty baseline
  }
  load();
}, [id, reset]);

// Or use the async form of defaultValues (RHF 7.48+):
const form = useForm<UserValues>({
  defaultValues: async () => {
    const user = await fetchUser(id);
    return { name: user.name, bio: user.bio };
  },
});
```

### useWatch vs watch for expensive renders

```tsx
// watch() — subscribes the CALLING component to all watched value changes.
// Every change re-renders the component containing the useForm call.
function ParentForm() {
  const { watch, register } = useForm<FormValues>();
  const name = watch("name"); // ParentForm re-renders on every keystroke
  return <div>...</div>;
}

// useWatch() — isolates the subscription to a separate component.
// Only the component calling useWatch re-renders; the parent stays stable.
function NameDisplay({ control }: { control: Control<FormValues> }) {
  const name = useWatch({ control, name: "name" }); // only THIS re-renders
  return <span>Hello, {name || "stranger"}</span>;
}

function ParentForm() {
  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: { name: "" },
  });
  // ParentForm does NOT re-render on name changes
  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register("name")} />
      <NameDisplay control={control} />
    </form>
  );
}

// useWatch with defaultValue for SSR / initial render
const value = useWatch({
  control,
  name: "quantity",
  defaultValue: 1, // avoids undefined on first render
});
```

---

## 13. Anti-Patterns

### 1. Missing defaultValues — uncontrolled→controlled warning

```tsx
// BAD — React warns "A component is changing an uncontrolled input to be controlled"
// because undefined → "" is a controlled/uncontrolled switch
function BadForm() {
  const { register } = useForm<{ name: string }>(); // no defaultValues!
  return <input {...register("name")} />;
}

// GOOD
function GoodForm() {
  const { register } = useForm<{ name: string }>({
    defaultValues: { name: "" }, // explicit empty string
  });
  return <input {...register("name")} />;
}
```

### 2. Not using zodResolver — manual validation pain

```tsx
// BAD — manual rules are verbose, don't compose, can't do cross-field validation
function BadForm() {
  const { register } = useForm<{ email: string; password: string }>();
  return (
    <form>
      <input
        {...register("email", {
          required: "Email is required",
          pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
        })}
      />
      <input
        {...register("password", {
          required: "Password required",
          minLength: { value: 8, message: "Min 8 chars" },
          // Cross-field check is impossible here without watch()
        })}
      />
    </form>
  );
}

// GOOD — Zod handles all validation in one place, types flow through automatically
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars"),
});

function GoodForm() {
  const { register } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  return (
    <form>
      <input {...register("email")} type="email" />
      <input {...register("password")} type="password" />
    </form>
  );
}
```

### 3. Registering inputs inside useEffect

```tsx
// BAD — register inside useEffect causes race conditions and missed registrations
function BadDynamicForm() {
  const { register } = useForm();

  useEffect(() => {
    // NEVER do this — register is not meant to be called from effects
    register("dynamicField", { required: true });
  }, [register]);

  return <input name="dynamicField" />;
}

// GOOD — register in JSX, use useFieldArray for dynamic lists
function GoodDynamicForm() {
  const { register, control } = useForm<{ items: { value: string }[] }>({
    defaultValues: { items: [] },
  });
  const { fields, append } = useFieldArray({ control, name: "items" });

  return (
    <form>
      {fields.map((field, i) => (
        <input key={field.id} {...register(`items.${i}.value`)} />
      ))}
      <button type="button" onClick={() => append({ value: "" })}>Add</button>
    </form>
  );
}
```

### 4. Using watch() in the root of an expensive component

```tsx
// BAD — entire form re-renders on every keystroke in any watched field
function ExpensiveFormBad() {
  const { watch, register, control } = useForm<FormValues>();
  const allValues = watch(); // subscribes to EVERYTHING — maximum re-renders
  return <ExpensiveChart data={allValues} />;
}

// GOOD — push the subscription down
function ChartWrapper({ control }: { control: Control<FormValues> }) {
  const values = useWatch({ control }); // only ChartWrapper re-renders
  return <ExpensiveChart data={values} />;
}
```

### 5. Not cleaning up object URLs from file previews

```tsx
// BAD — memory leak; object URL is never revoked
function BadPreview() {
  const [preview, setPreview] = useState<string>();
  const { register, watch } = useForm<{ file: FileList }>();
  const files = watch("file");

  useEffect(() => {
    if (files?.[0]) {
      setPreview(URL.createObjectURL(files[0])); // leaked!
    }
  }, [files]);

  return preview ? <img src={preview} /> : null;
}

// GOOD — revoke previous URL before creating new one
function GoodPreview() {
  const [preview, setPreview] = useState<string>();
  const { register, watch } = useForm<{ file: FileList }>({
    defaultValues: {},
  });
  const files = watch("file");

  useEffect(() => {
    if (!files?.[0]) return;
    const url = URL.createObjectURL(files[0]);
    setPreview(url);
    return () => URL.revokeObjectURL(url); // cleanup on next change or unmount
  }, [files]);

  return preview ? <img src={preview} alt="Preview" /> : null;
}
```
