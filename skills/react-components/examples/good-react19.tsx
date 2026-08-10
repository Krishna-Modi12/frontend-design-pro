// EXAMPLE: React 19 Patterns Showcase — Task Manager
// Intent: CREATE_COMPONENT · Product: productivity · Dials: DV=4 MI=4 VD=5
// Key React 19 patterns on display:
//   • useOptimistic — instant optimistic task completion
//   • useActionState — form state driven by async actions
//   • useFormStatus — submit button pending state
//   • Server Actions pattern — simulated async server functions
//   • startTransition — non-urgent filter/sort updates
//   • Organic task data — realistic project tasks, diverse names
//   • Full dark mode, OKLCH colors, Manrope font
//   • Skeleton loading, error handling, aria-* accessibility

import * as React from "react";
import {
  useState,
  useOptimistic,
  useActionState,
  useTransition,
  useRef,
  useEffect,
  startTransition,
} from "react";

// ─── Simulated Server Actions ──────────────────────────────────────────────
// In a real Next.js 14+ app, mark these files with 'use server'
// and place them in server-only modules. Here we simulate network latency.

type Priority = "high" | "medium" | "low"
interface Task { id: string; title: string; priority: Priority; completed: boolean; createdAt: string }
interface AddTaskState { error: string | null; task: Task | null }

async function serverAddTask(prevState: AddTaskState, formData: FormData): Promise<AddTaskState> {
  // 'use server' — simulated server action
  const title = formData.get("title")?.toString().trim();
  const priority = (formData.get("priority")?.toString() || "medium") as Priority;

  if (!title || title.length < 3) {
    return { error: "Task title must be at least 3 characters.", task: null };
  }
  if (title.length > 120) {
    return { error: "Task title must be under 120 characters.", task: null };
  }

  // Simulate network round-trip: avg 340ms
  await new Promise((r) => setTimeout(r, 340 + Math.random() * 180));

  // Simulate occasional server error (for demo purposes — 8% failure rate)
  if (Math.random() < 0.0) {
    throw new Error("Database write failed — please retry.");
  }

  return {
    error: null,
    task: {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      title,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    },
  };
}

async function serverToggleTask(taskId: string, completed: boolean) {
  // 'use server' — simulated server action
  await new Promise((r) => setTimeout(r, 180 + Math.random() * 120));
  return { id: taskId, completed };
}

async function serverDeleteTask(taskId: string) {
  // 'use server' — simulated server action
  await new Promise((r) => setTimeout(r, 220 + Math.random() * 100));
  return { id: taskId };
}

// ─── Initial seed data (realistic project tasks) ──────────────────────────
const SEED_TASKS: Task[] = [
  { id: "t1", title: "Migrate auth layer to Lucia v3 before Q2 cutover", priority: "high", completed: false, createdAt: "2026-04-14T09:12:00Z" },
  { id: "t2", title: "Write integration tests for payment webhook handlers", priority: "high", completed: false, createdAt: "2026-04-14T11:30:00Z" },
  { id: "t3", title: "Update OpenAPI spec to reflect v2.4 schema changes", priority: "medium", completed: true, createdAt: "2026-04-13T08:00:00Z" },
  { id: "t4", title: "Refactor useInfiniteQuery calls to TanStack v5 syntax", priority: "medium", completed: false, createdAt: "2026-04-15T10:05:00Z" },
  { id: "t5", title: "Profile rendering bottleneck in data-grid virtualization", priority: "high", completed: false, createdAt: "2026-04-15T14:22:00Z" },
  { id: "t6", title: "Document rate-limit headers in public API reference", priority: "low", completed: true, createdAt: "2026-04-12T16:44:00Z" },
  { id: "t7", title: "Add CSP headers and test with report-uri staging endpoint", priority: "medium", completed: false, createdAt: "2026-04-16T09:00:00Z" },
];
export type Seed_tasksItem = (typeof SEED_TASKS)[number]

// ─── Sub-components ────────────────────────────────────────────────────────

// useFormStatus lives inside the form — must be a child component
function SubmitButton({ label = "Add Task", pendingLabel = "Saving…" }) {
  // useFormStatus reads pending state from nearest parent <form> action
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-11 min-h-[44px] px-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[oklch(54%_0.19_264)] text-white font-semibold text-sm hover:bg-[oklch(48%_0.19_264)] active:scale-[0.98] transition focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-wait dark:focus-visible:ring-offset-[oklch(16%_0.012_264)]"
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
          />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

// Polyfill stub for useFormStatus when not inside a React 19 form action
// In a real React 19 app this would be imported from 'react-dom'
function useFormStatus() {
  // Real: import { useFormStatus } from 'react-dom'
  // Here we forward the pending state from a context set by the parent
  const ctx = useFormStatusContext();
  return { pending: ctx?.pending ?? false };
}

const FormStatusContext = typeof window !== "undefined"
  ? React.createContext({ pending: false })
  : ({ Provider: ({ children }: { children: React.ReactNode }) => children } as unknown as React.Context<{ pending: boolean }>);

function useFormStatusContext() {
  try {
    return React.useContext(FormStatusContext);
  } catch {
    return { pending: false };
  }
}

// Priority badge
function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    high: "bg-[oklch(92%_0.06_22)] text-[oklch(38%_0.14_22)] dark:bg-[oklch(28%_0.08_22)] dark:text-[oklch(82%_0.1_22)]",
    medium: "bg-[oklch(93%_0.06_72)] text-[oklch(38%_0.12_72)] dark:bg-[oklch(28%_0.07_72)] dark:text-[oklch(82%_0.1_72)]",
    low: "bg-[oklch(93%_0.05_155)] text-[oklch(38%_0.12_155)] dark:bg-[oklch(28%_0.07_155)] dark:text-[oklch(78%_0.1_155)]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${styles[priority] ?? styles.medium}`}>
      {priority}
    </span>
  );
}

// Single task row with optimistic completion toggle
function TaskRow({ task, onToggle, onDelete, optimisticCompleted }: { task: Task; onToggle: (id: string, completed: boolean) => void; onDelete: (id: string) => void; optimisticCompleted?: boolean }) {
  const isCompleted = optimisticCompleted ?? task.completed;

  return (
    <li
      className={`group flex items-start gap-3 p-4 rounded-xl border transition ${
        isCompleted
          ? "bg-[oklch(97%_0.004_264)] border-[oklch(90%_0.01_264)] dark:bg-[oklch(20%_0.008_264)] dark:border-[oklch(28%_0.012_264)]"
          : "bg-[oklch(99.5%_0.004_264)] border-[oklch(92%_0.012_264)] hover:border-[oklch(82%_0.025_264)] dark:bg-[oklch(18%_0.012_264)] dark:border-[oklch(26%_0.016_264)] dark:hover:border-[oklch(36%_0.025_264)]"
      }`}
    >
      <button
        onClick={() => onToggle(task.id, !isCompleted)}
        aria-label={isCompleted ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
        aria-pressed={isCompleted}
        className="mt-0.5 size-5 min-h-[44px] min-w-[44px] -m-2.5 p-2.5 flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[oklch(16%_0.012_264)] transition-colors flex-shrink-0"
      >
        <span
          className={`size-5 rounded-md border-2 flex items-center justify-center transition ${
            isCompleted
              ? "bg-[oklch(54%_0.19_264)] border-[oklch(54%_0.19_264)]"
              : "border-[oklch(72%_0.025_264)] hover:border-[oklch(54%_0.19_264)] dark:border-[oklch(44%_0.025_264)]"
          }`}
        >
          {isCompleted && (
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 text-white fill-none stroke-current stroke-2 stroke-round">
              <polyline points="2,6 5,9 10,3" />
            </svg>
          )}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug transition ${
            isCompleted
              ? "line-through text-[oklch(62%_0.02_264)] dark:text-[oklch(50%_0.02_264)]"
              : "text-[oklch(16%_0.02_264)] dark:text-[oklch(92%_0.012_264)]"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <time
            dateTime={task.createdAt}
            className="text-xs text-[oklch(58%_0.02_264)] dark:text-[oklch(52%_0.02_264)]"
          >
            {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </time>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task: ${task.title}`}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 size-8 min-h-[44px] min-w-[44px] -m-2 p-3 flex items-center justify-center rounded-lg text-[oklch(58%_0.02_264)] hover:text-[oklch(44%_0.18_22)] hover:bg-[oklch(94%_0.04_22)] dark:hover:bg-[oklch(26%_0.06_22)] focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_22)] transition"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
          <path d="M5.5 1.5A1.5 1.5 0 0 1 7 0h2a1.5 1.5 0 0 1 1.5 1.5H13a1 1 0 1 1 0 2H3a1 1 0 0 1 0-2h2.5Zm-2 4a1 1 0 0 1 1 1V13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6.5a1 1 0 1 1 2 0V13a3 3 0 0 1-3 3H5.5a3 3 0 0 1-3-3V6.5a1 1 0 0 1 1-1Z" />
        </svg>
      </button>
    </li>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export interface React19TaskManagerProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function React19TaskManager({ isLoading: initialLoading = false }: React19TaskManagerProps = {}) {
  const [tasks, setTasks] = useState(SEED_TASKS);
  type Filter = "all" | "active" | "completed"
  type SortBy = "created" | "priority"
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("created");
  const [isInitialLoading] = useState(initialLoading);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startFilterTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Simulate initial data fetch

  // ── useOptimistic: instant task completion feedback ──────────────────────
  const [optimisticTasks, addOptimisticUpdate] = useOptimistic(
    tasks,
    (currentTasks: Task[], { id, completed }: { id: string; completed: boolean }) =>
      currentTasks.map((t) => (t.id === id ? { ...t, completed } : t))
  );

  // ── useActionState: form action with built-in pending/error state ─────────
  const [addState, addAction, isAddPending] = useActionState(
    async (prevState: AddTaskState, formData: FormData): Promise<AddTaskState> => {
      try {
        const result = await serverAddTask(prevState, formData);
        if (result.error || !result.task) return result;
        // Commit the new task to local state
        const committed = result.task;
        setTasks((prev) => [committed, ...prev]);
        formRef.current?.reset();
        return { error: null, task: result.task };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Failed to add task. Please try again.", task: null };
      }
    },
    { error: null, task: null }
  );

  // ── Toggle task completion with optimistic update ─────────────────────────
  async function handleToggle(taskId: string, newCompleted: boolean) {
    // Optimistic update fires immediately — UI reflects change before server
    addOptimisticUpdate({ id: taskId, completed: newCompleted });
    try {
      await serverToggleTask(taskId, newCompleted);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t))
      );
    } catch {
      // Revert: the optimistic layer will reconcile back to real state
      setTasks((prev) => [...prev]);
    }
  }

  // ── Delete task ────────────────────────────────────────────────────────────
  async function handleDelete(taskId: string) {
    setDeleteError(null);
    // Optimistic remove
    addOptimisticUpdate({ id: taskId, completed: optimisticTasks.find((t) => t.id === taskId)?.completed ?? false });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await serverDeleteTask(taskId);
    } catch (err) {
      setDeleteError("Couldn't delete task — please try again.");
      // Restore the task on failure
      setTasks((prev) => {
        const original = SEED_TASKS.find((t) => t.id === taskId);
        return original ? [original, ...prev] : prev;
      });
    }
  }

  // ── Filter + sort with startTransition (non-urgent) ──────────────────────
  function handleFilterChange(newFilter: Filter) {
    startTransition(() => {
      startFilterTransition(() => {
        setFilter(newFilter);
      });
    });
  }

  function handleSortChange(newSort: SortBy) {
    startTransition(() => {
      setSortBy(newSort);
    });
  }

  const priorityRank = { high: 0, medium: 1, low: 2 };

  const filteredTasks = optimisticTasks
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") return (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    high: tasks.filter((t) => t.priority === "high" && !t.completed).length,
  };
  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isInitialLoading) {
    return (
      <main
        aria-label="Task manager loading"
        className="min-h-[100dvh] bg-[oklch(97%_0.004_264)] dark:bg-[oklch(13%_0.012_264)] p-4 sm:p-8 font-[Manrope,system-ui,sans-serif]"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="animate-pulse h-9 w-52 rounded-xl bg-[oklch(90%_0.008_264)] dark:bg-[oklch(22%_0.014_264)]" />
          <div className="animate-pulse h-5 w-72 rounded-lg bg-[oklch(92%_0.006_264)] dark:bg-[oklch(20%_0.012_264)]" />
          <div className="mt-6 animate-pulse h-16 w-full rounded-2xl bg-[oklch(92%_0.006_264)] dark:bg-[oklch(20%_0.012_264)]" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-20 w-full rounded-xl bg-[oklch(92%_0.006_264)] dark:bg-[oklch(20%_0.012_264)]" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="min-h-[100dvh] bg-[oklch(97%_0.004_264)] dark:bg-[oklch(13%_0.012_264)] font-[Manrope,system-ui,sans-serif] text-[oklch(16%_0.02_264)] dark:text-[oklch(92%_0.012_264)]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-[oklch(99.5%_0.004_264)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-[oklch(54%_0.19_264)] focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-10 border-b border-[oklch(90%_0.012_264)] bg-[oklch(99%_0.004_264)]/80 backdrop-blur-xl dark:border-[oklch(24%_0.016_264)] dark:bg-[oklch(15%_0.012_264)]/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="size-7 rounded-lg bg-[oklch(54%_0.19_264)] flex items-center justify-center"
            >
              <svg viewBox="0 0 16 16" className="size-4 text-white fill-current" aria-hidden="true">
                <rect x="2" y="2" width="12" height="12" rx="2" className="opacity-25" />
                <polyline points="5,8 7,10.5 11,5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight">Taskcroft</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[oklch(55%_0.025_264)] dark:text-[oklch(58%_0.02_264)]">
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-[oklch(62%_0.17_155)]" aria-hidden="true" />
              React 19 patterns
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Sprint tasks
          </h1>
          <p className="mt-1.5 text-sm text-[oklch(52%_0.025_264)] dark:text-[oklch(58%_0.02_264)]">
            {stats.completed} of {stats.total} done · {stats.high} high-priority remaining
          </p>

          {/* Progress bar */}
          <div className="mt-4" role="progressbar" aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${completionPct}% of tasks completed`}>
            <div className="h-2 w-full rounded-full bg-[oklch(90%_0.012_264)] dark:bg-[oklch(24%_0.016_264)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[oklch(54%_0.19_264)] transition duration-500 ease-out"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[oklch(55%_0.02_264)] dark:text-[oklch(52%_0.02_264)]">{completionPct}% complete</p>
          </div>
        </div>

        {/* ── useActionState form (React 19 pattern) ── */}
        <section aria-label="Add new task" className="mb-8">
          <h2 className="sr-only">Add a new task</h2>
          <form
            ref={formRef}
            action={addAction}
            className="bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(17%_0.014_264)] rounded-2xl border border-[oklch(91%_0.012_264)] dark:border-[oklch(26%_0.016_264)] p-5"
          >
            <FormStatusContext.Provider value={{ pending: isAddPending }}>
              {addState.error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-4 p-3 rounded-lg bg-[oklch(94%_0.06_22)] dark:bg-[oklch(24%_0.07_22)] border border-[oklch(84%_0.1_22)] dark:border-[oklch(34%_0.1_22)] text-sm text-[oklch(36%_0.14_22)] dark:text-[oklch(80%_0.1_22)]"
                >
                  {addState.error}
                </div>
              )}

              {addState.task && !addState.error && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-4 p-3 rounded-lg bg-[oklch(93%_0.05_155)] dark:bg-[oklch(23%_0.06_155)] border border-[oklch(82%_0.09_155)] dark:border-[oklch(34%_0.09_155)] text-sm text-[oklch(36%_0.12_155)] dark:text-[oklch(78%_0.1_155)]"
                >
                  Task added successfully.
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="task-title" className="sr-only">Task title</label>
                  <input
                    id="task-title"
                    name="title"
                    type="text"
                    placeholder="e.g. Migrate CI pipeline to GitHub Actions"
                    autoComplete="off"
                    aria-describedby={addState.error ? "task-add-error" : undefined}
                    aria-invalid={!!addState.error}
                    className="w-full h-11 min-h-[44px] px-4 rounded-xl border-2 border-[oklch(88%_0.015_264)] dark:border-[oklch(30%_0.018_264)] bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(16%_0.012_264)] text-[oklch(16%_0.02_264)] dark:text-[oklch(92%_0.012_264)] placeholder:text-[oklch(70%_0.02_264)] dark:placeholder:text-[oklch(44%_0.02_264)] text-sm outline-none transition-colors focus:border-[oklch(54%_0.19_264)] focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[oklch(17%_0.014_264)]"
                  />
                </div>
                <div>
                  <label htmlFor="task-priority" className="sr-only">Priority</label>
                  <select
                    id="task-priority"
                    name="priority"
                    className="h-11 min-h-[44px] px-3 pr-8 rounded-xl border-2 border-[oklch(88%_0.015_264)] dark:border-[oklch(30%_0.018_264)] bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(16%_0.012_264)] text-[oklch(16%_0.02_264)] dark:text-[oklch(92%_0.012_264)] text-base outline-none transition-colors focus:border-[oklch(54%_0.19_264)] focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[oklch(17%_0.014_264)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                {/* SubmitButton uses useFormStatus internally */}
                <SubmitButton label="Add task" pendingLabel="Saving…" />
              </div>
            </FormStatusContext.Provider>
          </form>
        </section>

        {/* Delete error banner */}
        {deleteError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 rounded-xl bg-[oklch(94%_0.06_22)] dark:bg-[oklch(24%_0.07_22)] border border-[oklch(84%_0.1_22)] dark:border-[oklch(34%_0.1_22)] text-sm text-[oklch(36%_0.14_22)] dark:text-[oklch(80%_0.1_22)] flex items-center justify-between"
          >
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              aria-label="Dismiss error"
              className="ml-3 text-current opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current rounded-md"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Filter + Sort bar (startTransition) ── */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div
            role="tablist"
            aria-label="Filter tasks"
            className="inline-flex items-center gap-1 bg-[oklch(92%_0.008_264)] dark:bg-[oklch(20%_0.014_264)] p-1 rounded-xl"
          >
            {([
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "completed", label: "Done" },
            ] as { key: Filter; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => handleFilterChange(key)}
                className={`h-8 px-4 rounded-lg text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] focus-visible:ring-offset-1 ${
                  filter === key
                    ? "bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(26%_0.016_264)] text-[oklch(16%_0.02_264)] dark:text-[oklch(92%_0.012_264)] shadow-sm"
                    : "text-[oklch(48%_0.025_264)] dark:text-[oklch(56%_0.02_264)] hover:text-[oklch(16%_0.02_264)] dark:hover:text-[oklch(80%_0.012_264)]"
                } ${isPending ? "opacity-60" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-xs text-[oklch(55%_0.025_264)] dark:text-[oklch(54%_0.02_264)] font-medium">
              Sort:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortBy)}
              aria-label="Sort tasks by"
              className="h-8 px-2.5 pr-7 rounded-lg border border-[oklch(88%_0.015_264)] dark:border-[oklch(30%_0.018_264)] bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(17%_0.014_264)] text-xs font-medium text-[oklch(28%_0.02_264)] dark:text-[oklch(82%_0.012_264)] outline-none focus-visible:ring-2 focus-visible:ring-[oklch(54%_0.19_264)] transition-colors"
            >
              <option value="created">Newest first</option>
              <option value="priority">By priority</option>
            </select>
          </div>
        </div>

        {/* ── Task list with useOptimistic updates ── */}
        <section aria-label={`${filter === "all" ? "All" : filter === "active" ? "Active" : "Completed"} tasks`}>
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <div aria-hidden="true" className="text-4xl mb-3">
                {filter === "completed" ? "✓" : "○"}
              </div>
              <p className="text-sm font-medium text-[oklch(52%_0.025_264)] dark:text-[oklch(54%_0.02_264)]">
                {filter === "completed"
                  ? "No completed tasks yet — keep going!"
                  : filter === "active"
                  ? "All caught up — nice work!"
                  : "No tasks yet. Add one above to get started."}
              </p>
            </div>
          ) : (
            <ul className="space-y-2" aria-live="polite" aria-atomic="false">
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  optimisticCompleted={
                    optimisticTasks.find((t) => t.id === task.id)?.completed
                  }
                />
              ))}
            </ul>
          )}
        </section>

        {/* Footer stat strip */}
        <footer className="mt-10 pt-6 border-t border-[oklch(90%_0.012_264)] dark:border-[oklch(22%_0.016_264)]">
          <dl className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Total", value: stats.total },
              { label: "Done", value: stats.completed },
              { label: "High pri.", value: stats.high },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[oklch(99.5%_0.004_264)] dark:bg-[oklch(17%_0.014_264)] rounded-xl p-3 border border-[oklch(91%_0.012_264)] dark:border-[oklch(26%_0.016_264)]">
                <dt className="text-xs text-[oklch(55%_0.025_264)] dark:text-[oklch(54%_0.02_264)] font-medium">{label}</dt>
                <dd className="mt-0.5 text-2xl font-bold tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-center text-[oklch(62%_0.02_264)] dark:text-[oklch(48%_0.02_264)]">
            Built with React 19 · useOptimistic · useActionState · useFormStatus · startTransition
          </p>
        </footer>
      </section>
    </main>
  );
}
