---
name: agent-ops
description: Agent operating discipline — token budgeting, cross-session memory, self-improvement loops, self-verification, parallel work, and subagent orchestration.
version: "14.2.0"
core-deps:
  - core/agent-behavior.md
  - core/validate-checklist.md
---

# Agent Ops

## When to Use
Any task where the work is the agent's own process, not the UI it produces: deciding what context to load, persisting facts across sessions, incorporating a correction so it sticks, verifying a change actually works before reporting done, deciding whether to parallelize, or dispatching/integrating subagent work. This skill governs how the agent operates — it does not describe dashboards or persistence UI (those live in other skills' reference files and are out of scope here).

## Core Rules
1. **Load lazily, cite precisely.** Read a reference file because the current task needs it, not "just in case." Re-reading a file already in context wastes the same tokens twice.
2. **Persist decisions and corrections, not scratch state.** A durable project fact (a naming convention, a rejected approach) belongs in memory; a task's intermediate variables do not survive the task.
3. **A correction changes the rule, not just the instance.** If a user fixes the same class of mistake once, update the standing approach — do not wait to be told a second time, and do not overfit a whole new policy to a single data point.
4. **"I wrote it" is not "it works."** Verification is a separate, explicit step — compile, run, or re-read the diff — before the work is reported as done.
5. **Parallelize only disjoint work.** Independent subtasks with no shared file and no ordering dependency can run concurrently; anything touching the same file or state serializes.
6. **Own the integration point.** When work is split across subagents, the human-facing owner personally merges, verifies, and reconciles conflicts — that step is never delegated away.

## Patterns
- **Budget before you read.** State what the task needs before opening files; skip references whose content the task doesn't touch.
- **Summarize, don't hoard.** Once a long tool result has served its purpose, keep the conclusion and drop the raw output from further reasoning.
- **Memory has a shelf life.** Every persisted fact needs an implicit or explicit expiry condition — a fact tied to a file that no longer exists is stale, not true.
- **Verify at the seam.** Run the actual compiler/linter/test command; do not infer a pass from having made a plausible-looking edit.
- **Batch independent calls, serialize dependent ones.** Multiple read-only lookups in one turn; a write followed by a read of that same write in two turns.
- **Ground subagent prompts in facts, not vibes.** Give a dispatched agent the concrete file paths, line numbers, and constraints already known — never "figure it out yourself" when the answer is already in hand.

## Examples
`examples/good-agent-status-panel.tsx` — a token-budget meter and subagent task-queue status panel: shows per-reference token cost, a load/skip decision per file, and per-subagent state (queued/running/verified/failed), illustrating token budgeting, parallel dispatch, and the "verified" distinction as rendered UI state.

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Deciding what to load/skip, measuring cost, avoiding re-reads, caching | `references/token-optimization.md` |
| What to persist across sessions, memory file shape, staleness/invalidation | `references/memory-persistence.md` |
| Incorporating feedback durably without overfitting to one correction | `references/continuous-learning.md` |
| Self-verification before reporting done — compile/lint/test, diff re-reads | `references/verification-loops.md` |
| Identifying independent work, batching tool calls, avoiding shared-state races | `references/parallelization.md` |
| Decomposing tasks across subagents, grounding prompts, owning integration | `references/subagent-orchestration.md` |

## Constraints
No claim of "done" without a run/compile/test step actually executed · no persisted memory fact without a staleness signal · no parallel dispatch across tasks that share a file or mutable state · no subagent prompt that omits facts already known to the dispatcher · no re-reading a file already fully in context without a stated reason.
