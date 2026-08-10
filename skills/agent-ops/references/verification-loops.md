# Verification Loops (agent-ops)

This is about an agent verifying its own work before reporting it done — compiling, running, re-reading — not about building verification-flow UI (see `skills/forms/references/verification-loops.md` for that unrelated content). The discipline: "I made the edit" and "the edit is correct" are two different claims, and only the second one belongs in a completion report.

## The core distinction

"I did X" describes an action taken. "X is verified true" describes an outcome confirmed. An agent that reports the first as if it were the second is making a claim it hasn't earned — the edit could be syntactically broken, could fail the very test it was meant to pass, could have missed a second call site. The gap between the two is exactly where undetected regressions live, and closing that gap is not optional polish on top of "real" work — it is part of the work.

This repo's own gate chain formalizes the same distinction at the level of an entire release: `docs/ARCHITECTURE.md` describes eight named blocking gates, among them compile, semantic AST checks, syntactic regex checks, pipeline validation, evals, and budget — every one of them an actual command that runs and produces a pass/fail, not a description of what the code is supposed to do. Gate 6 in that same document is the clearest cautionary tale available: `AGENT_SYSTEM_PROMPT.md` had been "guarded" by a structural check that only confirmed section headings were present, which they were — while 28 of 31 cited paths didn't exist. The check looked like verification and wasn't. The lesson generalizes past that one file: a check that confirms structure ("the sections are there," "the function was called") is not the same as a check that confirms the actual claim ("the paths resolve," "the output is what was expected").

## When to actually run something vs. claim it works

**Run it, don't infer it, when:**
- The change touches logic with a plausible failure mode (a conditional, a type change, a new dependency) rather than pure formatting.
- There's a command that directly tests the claim (a compiler, a linter, a test suite, a runnable script) and it's available. If the tool to check the claim exists and wasn't run, the claim is unverified, full stop — availability of a check that goes unused is a choice to skip verification, not a reason it wasn't needed.
- The task's own definition of done includes a check (a test file must pass, a build must succeed) — that's not optional context, it's the acceptance criterion.
- Multiple related call sites could be affected by a change, and it's not obvious from the diff alone whether all of them were caught.

**Reasoning-based confidence is acceptable, stated as such, when:**
- No runnable check exists for the specific claim and building one would be disproportionate to the task, or one was run but exercises a materially different code path than the actual concern (in either case, the report should say so plainly rather than imply confirmation).
- The change is small enough that a careful re-read of the diff itself constitutes real verification (a typo fix, a comment update) — but "careful re-read" must actually happen, not be skipped and asserted.
- The claim is inherently about future/external behavior (a UI will look good to a specific user, a performance change will matter at production scale) that no available tool can settle — the honest move is naming the limitation, not silently reporting confidence as certainty.

## Compile / lint / test gates as the minimum bar

For code changes specifically, three checks are cheap enough that skipping them is rarely justified:
- **Compile.** If the language has a compiler or type checker, run it against the changed file(s) at minimum. A change that "should type-check" and wasn't checked is a guess wearing the clothes of a fact. This pack's own `scripts/typecheck_golds.py` runs `tsc --noEmit --strict` over every gold example precisely because "the code looks right" was never accepted as a substitute for the compiler actually agreeing.
- **Lint / static constraints.** Where a project defines its own machine-enforced rules (this pack's 59 constraints across `scripts/parser_constraints.js` and `scripts/test_constraints.py`, per `core/validate-checklist.md`), run them against changed files rather than eyeballing compliance. A rule that's machine-checkable and wasn't machine-checked is being taken on faith when it didn't need to be.
- **Tests.** Run the existing suite touching the changed area, and add or update the test that would have caught the introduced change's specific failure mode. A change with no test exercising it is a change nobody has verified — including the person who wrote it.

## Re-reading diffs

Before reporting a change complete, re-read the actual diff, not the mental model of the intended change:
- Confirm the edit landed where intended and didn't silently also touch adjacent lines (a bad match in a find-replace, an over-eager multi-occurrence edit).
- Confirm the change didn't leave a half-applied state — an old code path removed but a caller still referencing it, an import added but the corresponding usage missing.
- Check that nothing outside the stated scope moved — an unrelated formatting change or reordering that crept in alongside the intended edit is itself a violation worth catching before it's reported as "just the requested change."
- When a tool (an editor, a formatter) reports success, that confirms the mechanical operation succeeded — it does not confirm the result is semantically correct. Both checks matter and neither substitutes for the other.

## Verifying subagent output specifically

A subagent's summary describes what it intended to do, not necessarily what it actually did — this is true even of an accurate, well-intentioned summary, because a summary is inherently lossy and can miss what actually landed in the files. Before relaying a subagent's "done" as the parent's own "done":
- Read the actual changed files, not just the subagent's prose description of them.
- Run the same compile/lint/test checks against the subagent's output as would be run against work done directly — a subagent's output is not exempt from verification just because it came with a confident-sounding report attached.
- If the subagent's summary and the actual file contents disagree, trust the file contents and treat the discrepancy itself as a finding worth noting, not a detail to quietly paper over.

See `references/subagent-orchestration.md` for the corresponding dispatch-side discipline — verification on the receiving end is the other half of that same practice, not a separate concern.

## Reporting the result honestly

A completion report should distinguish, in its own language, between what was confirmed and what was assumed:
- "Tests pass" means a test command was run and its output checked — not "tests exist" or "tests should pass."
- "Compiles" means the compiler was invoked against the actual changed files — not "the syntax looks valid."
- If a check couldn't be run (missing dependency, environment limitation), say that plainly rather than omitting it and letting silence imply the check happened. An honest "not verified: X" is worth more than an unearned "done."
