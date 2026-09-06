# Subagent Orchestration in UI

How to build React/Next.js interfaces that coordinate multiple AI agents, background tasks, and multi-step workflows. Every pattern here assumes real complexity: agents that fail, tasks that take minutes, outputs that need human judgment.

---

## Contents

- [1. Multi-Step AI Workflow UI](#1-multi-step-ai-workflow-ui)
- [2. Agent Status Components](#2-agent-status-components)
- [3. Background Job UI](#3-background-job-ui)
- [4. Parallel Agent Output](#4-parallel-agent-output)
- [5. Human-in-the-Loop UI](#5-human-in-the-loop-ui)
- [6. Tool Call Visualization](#6-tool-call-visualization)
- [7. Streaming Output Composition](#7-streaming-output-composition)
- [8. Error Recovery UI](#8-error-recovery-ui)
- [9. Agent Memory UI](#9-agent-memory-ui)
- [10. Anti-Patterns](#10-anti-patterns)
- [Composition Reference](#composition-reference)

---

## 1. Multi-Step AI Workflow UI

Long-running LLM pipelines need visible progress. Users must know which step is running, which have completed, and roughly how much remains. Never use a single spinner for a 5-step pipeline.

### Step pipeline with Vercel AI SDK streaming

```tsx
// lib/pipeline.ts
export type PipelineStep =
  | 'research'
  | 'outline'
  | 'draft'
  | 'review'
  | 'finalize';

export interface StepState {
  id: PipelineStep;
  label: string;
  status: 'idle' | 'running' | 'done' | 'error';
  output?: string;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

const STEP_ORDER: PipelineStep[] = [
  'research', 'outline', 'draft', 'review', 'finalize',
];

// app/api/pipeline/route.ts
import { createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // v4's createDataStreamResponse + dataStream.writeData() is now
  // createUIMessageStream + writer.write({ type: 'data-*' }).
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      for (const step of STEP_ORDER) {
        writer.write({ type: 'data-step-start', data: { step }, transient: true });

        const result = streamText({
          model: openai('gpt-5'),
          prompt: buildPromptForStep(step, prompt),
        });

        for await (const chunk of result.textStream) {
          writer.write({ type: 'data-step-chunk', data: { step, chunk }, transient: true });
        }

        writer.write({ type: 'data-step-done', data: { step }, transient: true });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

```tsx
// components/PipelineProgress.tsx
'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import type { StepState, PipelineStep } from '@/lib/pipeline';

const STEP_LABELS: Record<PipelineStep, string> = {
  research: 'Researching sources',
  outline: 'Building outline',
  draft: 'Writing draft',
  review: 'Reviewing quality',
  finalize: 'Finalizing output',
};

export function PipelineProgress({ prompt }: { prompt: string }) {
  const [steps, setSteps] = useState<StepState[]>(
    (['research', 'outline', 'draft', 'review', 'finalize'] as PipelineStep[]).map(
      (id) => ({ id, label: STEP_LABELS[id], status: 'idle' })
    )
  );

  const { sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/pipeline' }),
    // Transient data parts arrive here, not in message history
    onData: (part) => {
      if (part.type === 'data-step-start') {
        const { step } = part.data as { step: PipelineStep };
        setSteps((prev) =>
          prev.map((s) => (s.id === step ? { ...s, status: 'running', startedAt: Date.now() } : s))
        );
      } else if (part.type === 'data-step-chunk') {
        const { step, chunk } = part.data as { step: PipelineStep; chunk: string };
        setSteps((prev) =>
          prev.map((s) => (s.id === step ? { ...s, output: (s.output ?? '') + chunk } : s))
        );
      } else if (part.type === 'data-step-done') {
        const { step } = part.data as { step: PipelineStep };
        setSteps((prev) =>
          prev.map((s) => (s.id === step ? { ...s, status: 'done', completedAt: Date.now() } : s))
        );
      }
    },
  });
  const busy = status === 'submitted' || status === 'streaming';

  const currentStep = steps.find((s) => s.status === 'running');
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const progressPct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="space-y-4">
      {/* Overall progress bar */}
      <div role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>{currentStep?.label ?? (busy ? 'Starting…' : 'Complete')}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <ol className="space-y-1" aria-label="Pipeline steps">
        {steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </ol>

      <button
        onClick={() => sendMessage({ text: prompt })}
        disabled={busy}
        className="btn-primary"
      >
        {busy ? 'Running…' : 'Run Pipeline'}
      </button>
    </div>
  );
}

function StepRow({ step }: { step: StepState }) {
  const icons = {
    idle: <span className="text-muted-foreground">○</span>,
    running: <span className="animate-spin text-primary">◌</span>,
    done: <span className="text-green-500">✓</span>,
    error: <span className="text-red-500">✗</span>,
  };

  const elapsed =
    step.startedAt && step.completedAt
      ? `${((step.completedAt - step.startedAt) / 1000).toFixed(1)}s`
      : step.startedAt
      ? 'running'
      : null;

  return (
    <li className="flex items-center gap-2 text-sm py-0.5">
      {icons[step.status]}
      <span className={step.status === 'idle' ? 'text-muted-foreground' : ''}>{step.label}</span>
      {elapsed && <span className="ml-auto text-xs text-muted-foreground">{elapsed}</span>}
    </li>
  );
}
```

---

## 2. Agent Status Components

Each agent in a multi-agent system needs a live status indicator. These must be accessible — screen readers should announce state changes without requiring a page refresh.

### SSE-driven status store

```tsx
// hooks/useAgentStatus.ts
import { useEffect, useReducer } from 'react';

export type AgentStatus = 'pending' | 'running' | 'done' | 'error';

export interface AgentState {
  id: string;
  name: string;
  status: AgentStatus;
  message?: string;
  progress?: number; // 0–100
}

type Action =
  | { type: 'upsert'; agent: AgentState }
  | { type: 'reset' };

function reducer(state: Record<string, AgentState>, action: Action) {
  if (action.type === 'reset') return {};
  return { ...state, [action.agent.id]: action.agent };
}

export function useAgentStatus(runId: string) {
  const [agents, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    if (!runId) return;
    const es = new EventSource(`/api/runs/${runId}/status`);

    es.addEventListener('agent', (e) => {
      const agent: AgentState = JSON.parse(e.data);
      dispatch({ type: 'upsert', agent });
    });

    es.addEventListener('done', () => es.close());
    es.onerror = () => es.close();

    return () => es.close();
  }, [runId]);

  return Object.values(agents);
}
```

```tsx
// components/AgentStatusPanel.tsx
import { useAgentStatus, type AgentState, type AgentStatus } from '@/hooks/useAgentStatus';

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending',  color: 'text-yellow-700', bg: 'bg-yellow-100' },
  running: { label: 'Running',  color: 'text-blue-700',   bg: 'bg-blue-100'   },
  done:    { label: 'Done',     color: 'text-green-700',  bg: 'bg-green-100'  },
  error:   { label: 'Error',    color: 'text-red-700',    bg: 'bg-red-100'    },
};

export function AgentStatusPanel({ runId }: { runId: string }) {
  const agents = useAgentStatus(runId);

  return (
    <section aria-label="Agent status">
      {/* aria-live announces status changes to screen readers */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        id="agent-status-live"
      >
        {agents
          .filter((a) => a.status === 'running')
          .map((a) => `${a.name} is running`)
          .join('. ')}
      </div>

      <ul className="divide-y divide-border" role="list">
        {agents.map((agent) => (
          <AgentRow key={agent.id} agent={agent} />
        ))}
        {agents.length === 0 && (
          <li className="py-4 text-center text-sm text-muted-foreground">
            No agents active
          </li>
        )}
      </ul>
    </section>
  );
}

function AgentRow({ agent }: { agent: AgentState }) {
  const cfg = STATUS_CONFIG[agent.status];

  return (
    <li className="flex items-center gap-3 py-3">
      <StatusDot status={agent.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{agent.name}</p>
        {agent.message && (
          <p className="text-xs text-muted-foreground truncate">{agent.message}</p>
        )}
        {agent.status === 'running' && agent.progress != null && (
          <div
            role="progressbar"
            aria-valuenow={agent.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${agent.name} progress`}
            className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden"
          >
            <div
              className="h-full bg-blue-500 transition-[width]"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        )}
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
        {cfg.label}
      </span>
    </li>
  );
}

function StatusDot({ status }: { status: AgentStatus }) {
  return (
    <span aria-hidden="true" className="relative flex h-2.5 w-2.5 shrink-0">
      {status === 'running' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          status === 'running' ? 'bg-blue-500'
          : status === 'done'    ? 'bg-green-500'
          : status === 'error'   ? 'bg-red-500'
          :                        'bg-yellow-400'
        }`}
      />
    </span>
  );
}
```

---

## 3. Background Job UI

Background jobs — file processing, batch inference, embedding generation — need queue visualization and polling. TanStack Query handles the polling lifecycle cleanly.

```tsx
// hooks/useJobQueue.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  progress?: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchJobs(): Promise<Job[]> {
  const res = await fetch('/api/jobs');
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

async function submitJob(payload: { type: string; input: unknown }): Promise<Job> {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit job');
  return res.json();
}

const TERMINAL_STATUSES: JobStatus[] = ['completed', 'failed'];

export function useJobQueue() {
  const qc = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    // Poll every 2 s only while there are active jobs
    refetchInterval: (query) => {
      const jobs = query.state.data ?? [];
      const hasActive = jobs.some((j) => !TERMINAL_STATUSES.includes(j.status));
      return hasActive ? 2000 : false;
    },
  });

  const submit = useMutation({
    mutationFn: submitJob,
    onMutate: async (payload) => {
      // Optimistic: add a pending job immediately
      await qc.cancelQueries({ queryKey: ['jobs'] });
      const prev = qc.getQueryData<Job[]>(['jobs']) ?? [];
      const optimistic: Job = {
        id: `opt-${Date.now()}`,
        type: payload.type,
        status: 'queued',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      qc.setQueryData<Job[]>(['jobs'], [...prev, optimistic]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['jobs'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });

  return { jobs, isLoading, submit };
}
```

```tsx
// components/JobQueuePanel.tsx
import { useJobQueue, type Job, type JobStatus } from '@/hooks/useJobQueue';
import { formatDistanceToNow } from 'date-fns';

const STATUS_ICON: Record<JobStatus, string> = {
  queued:    '○',
  running:   '◌',
  completed: '✓',
  failed:    '✗',
};

export function JobQueuePanel() {
  const { jobs, submit } = useJobQueue();

  const counts = {
    running:   jobs.filter((j) => j.status === 'running').length,
    queued:    jobs.filter((j) => j.status === 'queued').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed:    jobs.filter((j) => j.status === 'failed').length,
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{counts.running} running</span>
        <span>{counts.queued} queued</span>
        <span>{counts.completed} done</span>
        {counts.failed > 0 && (
          <span className="text-red-500 font-medium">{counts.failed} failed</span>
        )}
      </div>

      <ul className="divide-y divide-border text-sm" role="list" aria-label="Job queue">
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
      </ul>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span
        aria-hidden="true"
        className={`font-mono ${
          job.status === 'running'   ? 'text-blue-500 animate-spin'
          : job.status === 'completed' ? 'text-green-500'
          : job.status === 'failed'    ? 'text-red-500'
          :                              'text-muted-foreground'
        }`}
      >
        {STATUS_ICON[job.status]}
      </span>
      <span className="flex-1 truncate">
        <span className="font-medium">{job.type}</span>
        <span className="text-muted-foreground"> · {job.id.slice(0, 8)}</span>
      </span>
      {job.status === 'running' && job.progress != null && (
        <span className="text-xs text-muted-foreground w-10 text-right">
          {job.progress}%
        </span>
      )}
      <span className="text-xs text-muted-foreground shrink-0">
        {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
      </span>
    </li>
  );
}
```

---

## 4. Parallel Agent Output

When running multiple agents on the same input, you need to display their outputs side by side and let users pick or merge results.

```tsx
// components/ParallelOutputs.tsx
'use client';
import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';

interface AgentConfig {
  id: string;
  label: string;
  systemPrompt: string;
}

const AGENTS: AgentConfig[] = [
  { id: 'concise',   label: 'Concise Agent',   systemPrompt: 'Be as brief as possible.' },
  { id: 'detailed',  label: 'Detailed Agent',  systemPrompt: 'Be thorough and comprehensive.' },
  { id: 'creative',  label: 'Creative Agent',  systemPrompt: 'Use vivid, creative language.' },
];

export function ParallelOutputs({ prompt }: { prompt: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [merged, setMerged] = useState('');

  const agents = AGENTS.map((cfg) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { completion, complete, isLoading } = useCompletion({
      api: '/api/complete',
      body: { systemPrompt: cfg.systemPrompt },
    });
    return { ...cfg, completion, complete, isLoading };
  });

  function runAll() {
    agents.forEach((a) => a.complete(prompt));
  }

  return (
    <div className="space-y-4">
      <button onClick={runAll} className="btn-primary">
        Run All Agents
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`rounded-lg border p-4 space-y-2 cursor-pointer transition-colors ${
              selected === agent.id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => setSelected(agent.id)}
            role="radio"
            aria-checked={selected === agent.id}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(agent.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{agent.label}</h3>
              {agent.isLoading && (
                <span className="text-xs text-muted-foreground animate-pulse">Generating…</span>
              )}
            </div>
            <div className="text-sm min-h-[6rem] whitespace-pre-wrap">
              {agent.completion || (
                <span className="text-muted-foreground italic">No output yet</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Merge editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Merged output (edit freely)</label>
        <textarea
          className="w-full rounded-md border border-border p-3 text-base min-h-[120px] resize-y"
          value={merged}
          onChange={(e) => setMerged(e.target.value)}
          placeholder="Paste or drag sections from agents above…"
        />
        <div className="flex gap-2">
          {selected && (
            <button
              onClick={() => {
                const agent = agents.find((a) => a.id === selected);
                if (agent?.completion) setMerged(agent.completion);
              }}
              className="btn-secondary text-sm"
            >
              Use selected as base
            </button>
          )}
          <button
            onClick={() => {
              const combined = agents
                .filter((a) => a.completion)
                .map((a) => `## ${a.label}\n${a.completion}`)
                .join('\n\n');
              setMerged(combined);
            }}
            className="btn-secondary text-sm"
          >
            Merge all
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Human-in-the-Loop UI

Agents that take irreversible actions — sending email, deleting records, making API calls — must pause for human confirmation. Undo buffers handle recoverable operations.

```tsx
// components/ApprovalGate.tsx
'use client';
import { useState, useRef } from 'react';

export interface AgentAction {
  id: string;
  type: string;
  description: string;
  payload: unknown;
  irreversible: boolean;
  risk: 'low' | 'medium' | 'high';
}

interface ApprovalGateProps {
  action: AgentAction;
  onApprove: (actionId: string) => void;
  onReject: (actionId: string, reason?: string) => void;
}

export function ApprovalGate({ action, onApprove, onReject }: ApprovalGateProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const approveRef = useRef<HTMLButtonElement>(null);

  const RISK_STYLES = {
    low:    'border-yellow-300 bg-yellow-50',
    medium: 'border-orange-300 bg-orange-50',
    high:   'border-red-300 bg-red-50',
  };

  return (
    <div
      role="alertdialog"
      aria-labelledby={`action-title-${action.id}`}
      aria-describedby={`action-desc-${action.id}`}
      className={`rounded-lg border-2 p-4 space-y-3 ${RISK_STYLES[action.risk]}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-lg mt-0.5">
          {action.risk === 'high' ? '⚠️' : action.risk === 'medium' ? '⚡' : 'ℹ️'}
        </span>
        <div className="flex-1">
          <h3 id={`action-title-${action.id}`} className="font-semibold text-sm">
            Agent wants to: {action.type}
          </h3>
          <p id={`action-desc-${action.id}`} className="text-sm text-muted-foreground mt-0.5">
            {action.description}
          </p>
          {action.irreversible && (
            <p className="text-xs font-medium text-red-600 mt-1">
              This action cannot be undone.
            </p>
          )}
        </div>
      </div>

      {/* Payload preview */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          View action details
        </summary>
        <pre className="mt-2 p-2 bg-black/5 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(action.payload, null, 2)}
        </pre>
      </details>

      <div className="flex gap-2 flex-wrap">
        <button
          ref={approveRef}
          onClick={() => onApprove(action.id)}
          className="btn-primary btn-sm"
          autoFocus
        >
          Approve
        </button>
        {!showRejectInput ? (
          <button
            onClick={() => setShowRejectInput(true)}
            className="btn-secondary btn-sm"
          >
            Reject
          </button>
        ) : (
          <div className="flex gap-2 items-center flex-1">
            <input
              type="text"
              placeholder="Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="flex-1 text-sm border rounded px-2 py-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onReject(action.id, rejectReason);
                if (e.key === 'Escape') setShowRejectInput(false);
              }}
              autoFocus
            />
            <button
              onClick={() => onReject(action.id, rejectReason)}
              className="btn-destructive btn-sm"
            >
              Confirm reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Undo buffer for recoverable operations

```tsx
// hooks/useUndoBuffer.ts
import { useState, useCallback, useRef } from 'react';

interface UndoEntry<T> {
  id: string;
  description: string;
  snapshot: T;
  timestamp: number;
}

const UNDO_WINDOW_MS = 10_000; // 10 seconds to undo

export function useUndoBuffer<T>(apply: (state: T) => void) {
  const [undoStack, setUndoStack] = useState<UndoEntry<T>[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const push = useCallback(
    (description: string, snapshot: T) => {
      const id = crypto.randomUUID();
      setUndoStack((prev) => [...prev, { id, description, snapshot, timestamp: Date.now() }]);

      // Auto-commit after window expires
      const timer = setTimeout(() => {
        setUndoStack((prev) => prev.filter((e) => e.id !== id));
        timersRef.current.delete(id);
      }, UNDO_WINDOW_MS);
      timersRef.current.set(id, timer);

      return id;
    },
    []
  );

  const undo = useCallback(
    (id: string) => {
      const entry = undoStack.find((e) => e.id === id);
      if (!entry) return;
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
      setUndoStack((prev) => prev.filter((e) => e.id !== id));
      apply(entry.snapshot);
    },
    [undoStack, apply]
  );

  return { undoStack, push, undo };
}
```

```tsx
// components/UndoToast.tsx
import { useUndoBuffer } from '@/hooks/useUndoBuffer';

function UndoToast({ entry, onUndo }: { entry: { id: string; description: string; timestamp: number }; onUndo: (id: string) => void }) {
  const elapsed = Date.now() - entry.timestamp;
  const remaining = Math.max(0, 10 - Math.round(elapsed / 1000));

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg text-sm">
      <span>{entry.description}</span>
      <button onClick={() => onUndo(entry.id)} className="font-semibold underline hover:no-underline">
        Undo ({remaining}s)
      </button>
    </div>
  );
}
```

---

## 6. Tool Call Visualization

When an agent uses tools (web search, code execution, database queries), show exactly what it did. Collapsible cards prevent information overload while preserving auditability.

```tsx
// components/ToolCallCard.tsx
'use client';
import { useState } from 'react';

export interface ToolCall {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

const TOOL_ICONS: Record<string, string> = {
  web_search:    '🔍',
  read_file:     '📄',
  write_file:    '✏️',
  run_code:      '⚡',
  database_query:'🗄️',
  send_email:    '📧',
  http_request:  '🌐',
};

export function ToolCallCard({ call }: { call: ToolCall }) {
  const [open, setOpen] = useState(false);
  const duration = call.completedAt
    ? `${((call.completedAt - call.startedAt) / 1000).toFixed(2)}s`
    : 'running';
  const icon = TOOL_ICONS[call.toolName] ?? '🔧';
  const hasError = Boolean(call.error);

  return (
    <div
      className={`rounded-md border text-sm font-mono ${
        hasError ? 'border-red-300' : 'border-border'
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={open}
        aria-controls={`tool-call-${call.id}`}
      >
        <span aria-hidden="true">{icon}</span>
        <span className="font-semibold">{call.toolName}</span>
        <span className="text-muted-foreground font-normal truncate flex-1">
          {summarizeArgs(call.args)}
        </span>
        <span className={`text-xs shrink-0 ${hasError ? 'text-red-500' : 'text-muted-foreground'}`}>
          {duration}
        </span>
        <span aria-hidden="true" className="shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div id={`tool-call-${call.id}`} className="border-t border-border">
          <div className="p-3 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-sans font-medium uppercase tracking-wide">Input</p>
              <CodePreview value={call.args} />
            </div>
            {call.result !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-sans font-medium uppercase tracking-wide">Output</p>
                <CodePreview value={call.result} />
              </div>
            )}
            {call.error && (
              <div>
                <p className="text-xs text-red-500 mb-1 font-sans font-medium uppercase tracking-wide">Error</p>
                <pre className="bg-red-50 text-red-700 p-2 rounded text-xs overflow-auto max-h-40">
                  {call.error}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CodePreview({ value }: { value: unknown }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return (
    <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-48 whitespace-pre-wrap break-words">
      {text}
    </pre>
  );
}

function summarizeArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args);
  if (entries.length === 0) return '(no args)';
  const [key, val] = entries[0];
  const preview = typeof val === 'string' ? val.slice(0, 60) : JSON.stringify(val).slice(0, 60);
  return entries.length === 1 ? `${key}="${preview}"` : `${key}="${preview}" +${entries.length - 1}`;
}
```

---

## 7. Streaming Output Composition

When multiple agents stream simultaneously, compose their outputs into a single coherent UI without race conditions or flicker.

```tsx
// app/api/compose/route.ts — server side
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessageStreamWriter } from 'ai';

export async function POST(req: Request) {
  const { query } = await req.json();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Fan out to two agents in parallel, annotate chunks with source
      const [streamA, streamB] = await Promise.all([
        fetchAgentStream('agent-a', query),
        fetchAgentStream('agent-b', query),
      ]);

      await Promise.all([
        pipeAnnotated(streamA, 'agent-a', writer),
        pipeAnnotated(streamB, 'agent-b', writer),
      ]);
    },
  });

  return createUIMessageStreamResponse({ stream });
}

async function pipeAnnotated(
  stream: ReadableStream<string>,
  agentId: string,
  writer: UIMessageStreamWriter
) {
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      writer.write({ type: 'data-agent-done', data: { agentId }, transient: true });
      break;
    }
    writer.write({ type: 'data-agent-chunk', data: { agentId, text: value }, transient: true });
  }
}
```

```tsx
// hooks/useComposedStreams.ts
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

interface StreamSlice {
  agentId: string;
  text: string;
  done: boolean;
}

export function useComposedStreams(query: string) {
  const [slices, setSlices] = useState<Record<string, StreamSlice>>({});
  const { sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/compose' }),
    onData: (part) => {
      if (part.type === 'data-agent-chunk') {
        const { agentId, text } = part.data as { agentId: string; text: string };
        setSlices((prev) => ({
          ...prev,
          [agentId]: {
            agentId,
            text: (prev[agentId]?.text ?? '') + text,
            done: false,
          },
        }));
      } else if (part.type === 'data-agent-done') {
        const { agentId } = part.data as { agentId: string };
        setSlices((prev) => ({
          ...prev,
          [agentId]: { ...prev[agentId], done: true },
        }));
      }
    },
  });

  function run() {
    setSlices({});
    sendMessage({ text: query });
  }

  return {
    slices: Object.values(slices),
    run,
    isStreaming: status === 'submitted' || status === 'streaming',
  };
}
```

---

## 8. Error Recovery UI

When a pipeline step fails, users need actionable options: retry the step, skip it, or override the input manually. Never just show a red banner and call it done.

```tsx
// components/StepErrorRecovery.tsx
'use client';
import { useState } from 'react';
import type { StepState, PipelineStep } from '@/lib/pipeline';

interface StepErrorRecoveryProps {
  step: StepState;
  onRetry: (stepId: PipelineStep) => void;
  onSkip:  (stepId: PipelineStep) => void;
  onOverride: (stepId: PipelineStep, value: string) => void;
}

export function StepErrorRecovery({
  step, onRetry, onSkip, onOverride,
}: StepErrorRecoveryProps) {
  const [mode, setMode] = useState<'idle' | 'override'>('idle');
  const [overrideValue, setOverrideValue] = useState('');

  if (step.status !== 'error') return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3"
    >
      <div>
        <p className="font-semibold text-sm text-red-700">
          Step failed: {step.label}
        </p>
        {step.error && (
          <p className="text-xs text-red-600 mt-1 font-mono">{step.error}</p>
        )}
      </div>

      {mode === 'idle' ? (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onRetry(step.id)}
            className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 rounded px-3 py-1"
          >
            Retry step
          </button>
          <button
            onClick={() => onSkip(step.id)}
            className="btn-sm bg-white text-muted-foreground hover:bg-muted border border-border rounded px-3 py-1"
          >
            Skip step
          </button>
          <button
            onClick={() => setMode('override')}
            className="btn-sm bg-white text-muted-foreground hover:bg-muted border border-border rounded px-3 py-1"
          >
            Override manually
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-red-700">
            Provide manual output for this step
          </label>
          <textarea
            className="w-full rounded border border-red-300 p-2 text-base font-mono min-h-[80px] resize-y bg-white"
            value={overrideValue}
            onChange={(e) => setOverrideValue(e.target.value)}
            placeholder={`Paste expected output for "${step.label}"…`}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (overrideValue.trim()) {
                  onOverride(step.id, overrideValue.trim());
                  setMode('idle');
                }
              }}
              disabled={!overrideValue.trim()}
              className="btn-sm bg-red-600 text-white hover:bg-red-700 rounded px-3 py-1 disabled:opacity-50"
            >
              Apply override
            </button>
            <button
              onClick={() => setMode('idle')}
              className="btn-sm text-muted-foreground hover:bg-muted rounded px-3 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Agent Memory UI

Long-running agent sessions accumulate context. Users need to see what the agent "knows", edit it, and reset when context has gone stale.

```tsx
// components/AgentMemoryPanel.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MemoryEntry {
  id: string;
  type: 'fact' | 'instruction' | 'context' | 'goal';
  content: string;
  importance: 'low' | 'medium' | 'high';
  createdAt: string;
}

async function fetchMemory(agentId: string): Promise<MemoryEntry[]> {
  const res = await fetch(`/api/agents/${agentId}/memory`);
  return res.json();
}

async function deleteMemoryEntry(agentId: string, entryId: string) {
  await fetch(`/api/agents/${agentId}/memory/${entryId}`, { method: 'DELETE' });
}

async function clearMemory(agentId: string) {
  await fetch(`/api/agents/${agentId}/memory`, { method: 'DELETE' });
}

const TYPE_COLORS: Record<MemoryEntry['type'], string> = {
  fact:        'bg-blue-100 text-blue-700',
  instruction: 'bg-purple-100 text-purple-700',
  context:     'bg-gray-100 text-gray-700',
  goal:        'bg-green-100 text-green-700',
};

export function AgentMemoryPanel({ agentId }: { agentId: string }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<MemoryEntry['type'] | 'all'>('all');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['agent-memory', agentId],
    queryFn: () => fetchMemory(agentId),
    staleTime: 30_000,
  });

  const deleteEntry = useMutation({
    mutationFn: (entryId: string) => deleteMemoryEntry(agentId, entryId),
    onMutate: async (entryId) => {
      await qc.cancelQueries({ queryKey: ['agent-memory', agentId] });
      const prev = qc.getQueryData<MemoryEntry[]>(['agent-memory', agentId]);
      qc.setQueryData<MemoryEntry[]>(
        ['agent-memory', agentId],
        (old) => old?.filter((e) => e.id !== entryId) ?? []
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['agent-memory', agentId], ctx.prev);
    },
  });

  const clearAll = useMutation({
    mutationFn: () => clearMemory(agentId),
    onSuccess: () => qc.setQueryData(['agent-memory', agentId], []),
  });

  const visible = filter === 'all' ? entries : entries.filter((e) => e.type === filter);
  const tokenEstimate = entries.reduce((sum, e) => sum + Math.ceil(e.content.length / 4), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm">Agent Memory</h3>
          <p className="text-xs text-muted-foreground">
            {entries.length} entries · ~{tokenEstimate.toLocaleString()} tokens
          </p>
        </div>
        <button
          onClick={() => clearAll.mutate()}
          disabled={entries.length === 0 || clearAll.isPending}
          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Type filter */}
      <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by type">
        {(['all', 'fact', 'instruction', 'context', 'goal'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            aria-pressed={filter === t}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filter === t
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Memory list */}
      <ul className="space-y-1.5 max-h-[360px] overflow-y-auto" aria-label="Memory entries">
        {isLoading && (
          <li className="text-sm text-muted-foreground py-2">Loading…</li>
        )}
        {visible.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start gap-2 rounded-md border border-border p-2.5 bg-background text-sm"
          >
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${TYPE_COLORS[entry.type]}`}>
              {entry.type}
            </span>
            <span className="flex-1 text-xs leading-relaxed">{entry.content}</span>
            <button
              onClick={() => deleteEntry.mutate(entry.id)}
              aria-label={`Remove memory: ${entry.content.slice(0, 40)}`}
              className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </li>
        ))}
        {!isLoading && visible.length === 0 && (
          <li className="text-sm text-muted-foreground py-2 text-center">No entries</li>
        )}
      </ul>
    </div>
  );
}
```

---

## 10. Anti-Patterns

These are the failure modes that make agent UIs frustrating or dangerous.

### Blocking UI during agent runs

```tsx
// BAD: disables the entire page while the agent runs
export function BadAgentUI() {
  const [running, setRunning] = useState(false);
  return (
    // Disabling a form wrapper blocks ALL interactivity — tab, copy, scroll
    <fieldset disabled={running}>
      <button onClick={() => setRunning(true)}>Run</button>
    </fieldset>
  );
}

// GOOD: only disable irrelevant controls; keep cancel, copy, and scroll active
export function GoodAgentUI() {
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function start() {
    abortRef.current = new AbortController();
    setRunning(true);
    runAgent(abortRef.current.signal).finally(() => setRunning(false));
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return (
    <div>
      <button onClick={start} disabled={running}>Run</button>
      {running && <button onClick={cancel}>Cancel</button>}
      {/* Output is always scrollable and copyable */}
      <OutputPane />
    </div>
  );
}
```

### No cancellation mechanism

```tsx
// BAD: fire-and-forget with no way to stop
async function runAgentBad(prompt: string) {
  const res = await fetch('/api/agent', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}

// GOOD: pass AbortSignal, clean up streams on cancel
async function runAgentGood(prompt: string, signal: AbortSignal) {
  const res = await fetch('/api/agent', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    signal,
  });
  if (!res.body) return;

  const reader = res.body.getReader();
  const cleanup = () => reader.cancel();
  signal.addEventListener('abort', cleanup, { once: true });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done || signal.aborted) break;
      yield new TextDecoder().decode(value);
    }
  } finally {
    signal.removeEventListener('abort', cleanup);
    reader.cancel();
  }
}
```

### Overwhelming users with raw agent logs

```tsx
// BAD: dumps every token, tool call, and internal state directly into the DOM
function RawLogDump({ events }: { events: unknown[] }) {
  return (
    <pre className="text-xs overflow-auto h-96">
      {JSON.stringify(events, null, 2)}
    </pre>
  );
}

// GOOD: progressive disclosure — summary first, details on demand
function StructuredAgentOutput({ events }: { events: AgentEvent[] }) {
  const summary = extractSummary(events);       // final answer
  const toolCalls = extractToolCalls(events);   // collapsible
  const thoughts = extractThoughts(events);     // hidden by default

  return (
    <div className="space-y-3">
      {/* Primary output — always visible */}
      <div className="prose prose-sm max-w-none">{summary}</div>

      {/* Tool calls — collapsed by default */}
      {toolCalls.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            {toolCalls.length} tool call{toolCalls.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2">
            {toolCalls.map((call) => (
              <ToolCallCard key={call.id} call={call} />
            ))}
          </div>
        </details>
      )}

      {/* Raw trace — opt-in only */}
      {thoughts.length > 0 && (
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Show agent reasoning
          </summary>
          <div className="mt-2 text-xs font-mono bg-muted p-3 rounded space-y-1">
            {thoughts.map((t, i) => (
              <p key={i} className="text-muted-foreground">{t}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
```

### Polling without backoff (hammers the server)

```tsx
// BAD: fixed-interval polling forever
useEffect(() => {
  const id = setInterval(() => refetch(), 1000);
  return () => clearInterval(id);
}, []);

// GOOD: TanStack Query with conditional polling + exponential backoff on error
const { data } = useQuery({
  queryKey: ['job', jobId],
  queryFn: () => fetchJob(jobId),
  refetchInterval: (query) => {
    // Stop polling once terminal
    if (['completed', 'failed'].includes(query.state.data?.status ?? '')) return false;
    // Back off on consecutive errors: 2s, 4s, 8s, max 30s
    const errorCount = query.state.fetchFailureCount;
    return Math.min(2000 * 2 ** errorCount, 30_000);
  },
  refetchIntervalInBackground: false, // stop when tab is hidden
});
```

### No loading skeleton for streamed content

```tsx
// BAD: blank space until first token arrives — layout shift
function AgentAnswer({ completion }: { completion: string }) {
  if (!completion) return null;
  return <div>{completion}</div>;
}

// GOOD: skeleton matches final layout, swaps out once content arrives
function AgentAnswer({ completion, isLoading }: { completion: string; isLoading: boolean }) {
  if (isLoading && !completion) {
    return (
      <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading response">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    );
  }
  return (
    <div className="prose prose-sm max-w-none">
      {completion}
      {isLoading && <span className="animate-pulse">▋</span>}
    </div>
  );
}
```

---

## Composition Reference

| Need | Tool / Pattern |
|---|---|
| Multi-step streaming | `createUIMessageStream` + `writer.write({ type: 'data-*' })` (Vercel AI SDK) |
| Live agent status | `EventSource` + `useReducer` + `aria-live="polite"` |
| Job polling | TanStack Query `refetchInterval` with conditional return |
| Parallel outputs | Fan-out in route handler, annotate chunks with agent ID |
| Human approval | `role="alertdialog"`, `autoFocus` on primary action, reject reason input |
| Tool call audit | Collapsible `<details>` card, JSON preview, duration display |
| Undo | Timed snapshot stack, `setTimeout` auto-commit, toast with countdown |
| Error recovery | Retry / skip / manual override per step, not global reset |
| Memory management | Type-filtered list, per-entry delete, token estimate, clear-all |
| Cancellation | `AbortController`, pass `signal` to `fetch`, clean up reader on abort |
