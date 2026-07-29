# Parallelization (agent-ops)

This is about deciding when an agent should run work concurrently — multiple tool calls in one turn, multiple subagents dispatched together — versus serially, and how to avoid races when it does. It is not about rendering parallel-computation UI (see `skills/react-performance/references/parallelization.md` for that unrelated content).

## The question to ask first

Parallelization is a means to an end (finishing sooner, or gathering independent information faster), not a default posture. Before batching anything, ask: does subtask B depend on any output of subtask A, and do A and B touch the same file or mutable state? If either answer is yes, they are not independent, and running them concurrently doesn't save time — it introduces a race whose outcome depends on scheduling, which is strictly worse than a slower, deterministic serial execution.

## Identifying truly independent subtasks

**Genuinely parallelizable:**
- Multiple read-only lookups with no relationship between their answers (checking three unrelated files' contents, searching for two unrelated symbols, fetching status from two independent systems).
- Multiple subagents each assigned a disjoint set of files or a disjoint area of a codebase, where neither's output is an input to the other's task.
- Independent research questions whose answers will be combined only at the end, by the dispatcher, after both return.

**Not parallelizable — has a hidden dependency:**
- Two edits to the same file, even if they're conceptually about "different things" — the second edit's correctness depends on the first one's exact result (line numbers shift, adjacent context changes), so they must serialize.
- A read that's meant to confirm a write — the read is meaningless run concurrently with the write it's supposed to check, because it may execute before the write lands.
- Two subagents whose tasks both plausibly touch a shared integration file (a router, a shared config, an index that both would need to register into) — even if each agent's stated task doesn't mention the other, if both are likely to need to edit the same file, that's a shared-file conflict waiting to happen. The safer structure is one owner integrating both, not two agents racing to edit the same file (see `references/subagent-orchestration.md`).
- Any two steps where the second was written under the assumption that the first already happened (a request that will only succeed after a resource the first step creates exists).

The test isn't "do these feel like separate tasks" — it's "if these ran in the opposite order, or the exact same instant, would anything be different or broken." If yes, they're not independent.

## Batching parallel tool calls

When multiple independent tool calls are identified, issue them together in a single turn rather than spreading them across sequential turns waiting on each one — that's the entire point of having recognized them as independent in the first place. Spreading independent calls across turns for no reason is not "being careful," it's paying a serial-latency cost for no safety benefit, since nothing about running them one-at-a-time makes any individual call more correct.

Conversely, a call that depends on a previous call's result must wait for that result — batching it anyway (issuing it before the dependency has returned) doesn't parallelize the work, it just runs it against stale or missing input.

## Avoiding races on shared state

- **File writes never parallelize with anything else touching the same file.** Two concurrent edits to one file is a corruption risk regardless of how well-intentioned each edit is individually — the file's on-disk state after both complete is not a well-defined function of either edit alone.
- **Shared configuration or registry files are a single-owner resource.** If a task is split across several workers and more than one might need to add a row to the same registry file, that file's edits should be reserved for the dispatcher to apply after collecting each worker's proposed addition — not left for multiple workers to edit directly and hope the edits don't collide.
- **Read-then-write sequences must not be split across concurrent branches.** If one branch of parallel work reads a value in order to compute a subsequent write, and another concurrent branch might change that value first, the read is stale by the time the write happens. This is the same hazard as a database race condition, applied to files and shared task state instead of rows.
- **Order-dependent side effects (a counter, an append-only log meant to stay chronological) are not parallelizable** even if each individual append looks independent — the guarantee being relied upon (order) is exactly what concurrency breaks.

## When serial is actually faster or safer

Parallelizing has real overhead: dispatching a subagent costs the time and tokens for it to re-derive context it doesn't share with the dispatcher (see `references/subagent-orchestration.md` on grounding prompts), and reconciling multiple concurrent results costs an integration step that a serial approach never needs. Serial is the better choice when:
- The task is small enough that the cost of dispatching and later reconciling multiple workers exceeds the cost of just doing it directly, in order.
- The subtasks are not actually independent but were mis-classified as such under time pressure — better to discover that before parallelizing than after a race has already corrupted something.
- The result of the first subtask meaningfully changes how the second should be approached (not just "what value goes in field X" but "should this even be attempted the way currently planned") — parallelizing here throws away the option to course-correct cheaply after the first result lands.
- Debuggability matters more than speed — a serial chain of operations is trivial to reason about after the fact; a set of concurrent operations that produced a bad outcome requires reconstructing an interleaving that may not be reproducible.

## Practical checklist before batching

1. List the candidate subtasks and, for each pair, ask whether swapping their order or running them simultaneously would change the outcome.
2. Identify every file or piece of mutable state each subtask touches; if any file appears under more than one subtask, that subtask pair serializes (or one owner absorbs both edits — see `references/subagent-orchestration.md`).
3. For the subtasks that remain independent, batch their dispatch or their tool calls in a single turn.
4. For the rest, order them explicitly and let each depend on the previous one's confirmed (not just claimed) result.
