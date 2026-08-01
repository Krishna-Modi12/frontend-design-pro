# Subagent Orchestration (agent-ops)

This covers dispatching work to subagents and integrating what comes back — decomposition, grounding, ownership of shared files, and verification of results — as an operational discipline for a dispatching agent. It is not about UI for visualizing multi-agent systems (see `skills/platform/references/subagent-orchestration.md` for that unrelated content).

## Decomposing a task into disjoint units

The first and most important decision is the split itself. A good decomposition has units that are:
- **File-disjoint.** Each subagent's assigned files do not overlap with another's. Overlap is the single most common cause of lost work — two subagents editing the same file concurrently produce a result that is a function of scheduling, not intent (see `references/parallelization.md`).
- **Independently completable.** A unit shouldn't require the output of another unit mid-flight. If unit B genuinely needs a decision unit A will make, either sequence them (A first, then B with A's result available) or fold both into one unit — don't dispatch them concurrently and hope B guesses correctly.
- **Self-contained enough to brief.** If explaining a unit's task requires re-explaining most of the whole project's context, the decomposition is probably too fine-grained — the overhead of grounding each subagent independently can exceed the benefit of splitting the work at all.

A task that resists clean decomposition (everything touches one shared file, or every piece depends on every other) is a signal to do it directly rather than force an artificial split — see `references/parallelization.md` on when serial is actually the better call.

## Grounding subagent prompts with concrete facts

A subagent starts cold: it has not seen the conversation that led to the task and cannot infer the dispatcher's accumulated context from the task description alone. A prompt that hands over a goal without the supporting facts forces it to re-derive — at real token and time cost — information the dispatcher already has for free.

A well-grounded prompt states, concretely:
- **What the subagent's slice actually is** — specific file paths, specific line numbers or symbols, not "the relevant files" left for the subagent to locate itself when the dispatcher already knows exactly where they are.
- **What's already been tried, ruled out, or decided**, so the subagent doesn't re-explore a dead end the dispatcher already closed off.
- **The boundary of its slice** — which files or concerns are explicitly out of scope, especially any file another subagent or the dispatcher itself owns (see below). An unbounded subagent will happily "helpfully" touch something outside its assigned area.
- **What form the result should take** — a direct edit, a report back, a specific format — so the dispatcher isn't left reconciling three subagents that each interpreted "let me know what you find" differently.
- **Enough of the "why"** that the subagent can make a reasonable judgment call on an edge case its literal instructions didn't anticipate, rather than either freezing or guessing blindly.

A prompt that says "fix the bug" pushes the actual understanding of the bug onto the subagent. A prompt that says "the null check at line 42 of `foo.ts` is missing for the case where the API returns an empty array — add a guard there consistent with the pattern at line 30" hands over understanding already reached, and leaves the subagent to execute rather than re-diagnose.

## Owning shared and integration files personally

Any file more than one subagent might plausibly need to touch — a shared registry, a router, a barrel index, a top-level config — should not be edited by the subagents themselves. The dispatcher:
- Has each subagent report what it would add or change in the shared file (a proposed registry row, a proposed export), rather than editing that file directly.
- Personally applies all such changes to the shared file in one place, in one pass, after collecting the proposals — this is the only way to guarantee no conflicting concurrent edit ever occurs, since a single owner making sequential edits cannot race with itself.
- Reviews the aggregate result of the shared file after integration, not just each individual proposed addition in isolation — two individually-reasonable additions can still conflict with each other (duplicate keys, contradictory config) in a way visible only once combined.

The concrete form of this: give each agent one directory to work inside, and reserve the registry file (`SKILL.md`) for the dispatcher alone.

## Verifying subagent output rather than trusting the summary

A subagent's final report describes what it believes it did; it is not evidence the work is correct (see `references/verification-loops.md`). Before treating a subagent's work as complete:
- **Read the actual files it changed.** A confident summary and an actually-correct diff are correlated but not identical — the only way to know which one occurred is to look.
- **Re-run whatever verification the task calls for** (compile, lint, test, the project's own constraint checks) against the subagent's output, exactly as would be done for work performed directly. A subagent is not a trusted authority that exempts its output from the checks everything else goes through.
- **Check the subagent stayed inside its assigned boundary.** A subagent that "helpfully" touched a file outside its slice has reintroduced the shared-file risk the decomposition was designed to avoid; catch and reconcile that touch rather than accepting it because the overall result looks fine.
- **When a subagent's summary and its actual output disagree, the output is the ground truth**, and the discrepancy itself is worth flagging rather than quietly reconciling in the report as if nothing happened — a subagent that reports success on work that didn't land is a signal about that subagent's reliability going forward, not just a one-off to paper over.

## Grounded example: three-way split with an owned integration point

Suppose a task decomposes into: (1) write reference content for topic A, (2) write reference content for topic B, (3) update a shared registry row pointing at both. The correct structure is two subagents dispatched in parallel for (1) and (2) — genuinely file-disjoint, genuinely independent — with the dispatcher itself performing (3) after both return, having read both actual files rather than trusting each subagent's claim that its file is done. Dispatching a third subagent for the registry update, running concurrently with the other two, would risk that subagent editing the registry before subagent 1 or 2's file exists yet — a classic hidden dependency masquerading as a parallel task (see `references/parallelization.md`).

## Practical checklist before dispatching

1. Confirm the split is file-disjoint and dependency-free between units (or explicitly sequence the ones that aren't).
2. Write each subagent's prompt with concrete paths, facts already known, explicit scope boundaries, and the required output form — assume zero shared memory with the dispatcher.
3. Identify any shared/integration file up front and reserve its edits for the dispatcher alone.
4. After each subagent returns, read its actual changed files and re-run the task's real verification steps before relying on its summary.
5. Apply shared-file integration personally, reviewing the combined result, not just each individual contribution.

## Review in two passes, not one

Reviewing delegated work in a single pass conflates two different questions and reliably lets
one of them through:

1. **Spec compliance** — does this do what the task said? Judged against the written task
   only, ignoring style entirely. Fails here mean the work is wrong, not merely rough.
2. **Code quality** — is it well made? Judged only once pass 1 is clean.

Running them together produces the familiar failure: a reviewer polishes naming and structure
on a change that does not implement the requested behaviour. Separate the passes and pass 1
becomes cheap to answer and hard to skip.

Report issues **by severity**, not in file order. A reviewer listing findings top-to-bottom
buries the blocking one among nits.

## Size the unit before dispatching

Delegated tasks should be **small enough to state in one sentence and finish in a few minutes**
of agent work. The forcing function matters more than the exact number: a task that cannot be
described in a sentence has not been decomposed yet, and a task that runs long accumulates
context the reviewer does not have.

The reason is verification, not throughput. A small unit's output can be checked against its
own task statement; a large one has to be checked against the whole plan, which is when
reviewers start trusting summaries — the failure the rest of this file exists to prevent.

## Dispatch fresh, not continued

Give each unit a **fresh agent with the facts it needs**, rather than continuing one long-lived
agent through a sequence of tasks. A continued agent carries prior context that makes its
output harder to attribute — when something is wrong, you cannot tell whether the task was
misstated or an earlier turn poisoned it. Fresh dispatch keeps the input to each unit explicit
and therefore auditable, which is the same reason the existing file insists on grounding
prompts with concrete facts rather than references to earlier conversation.

## Check for an applicable process before starting

Before a non-trivial task, check whether an established procedure already covers it and follow
that instead of improvising. Improvised process is where verification steps get quietly
dropped — not through disagreement, but because nobody wrote them down at the moment they were
due. This is the orchestration-level form of the same discipline `verification-loops.md`
applies to individual changes.
