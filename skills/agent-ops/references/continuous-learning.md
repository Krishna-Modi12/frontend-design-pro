# Continuous Learning (agent-ops)

This is about how an agent incorporates feedback and corrections over the course of a session and across sessions — not about building a dashboard for tracking learning curves (see `skills/platform/references/continuous-learning.md` for that unrelated UI content). The subject is behavioral: when a user pushes back, does the agent adjust the right thing, at the right scope, without needing to be told twice — and without overreacting to a single data point.

## The core tension

Every correction sits somewhere on a spectrum between "fix this one instance" and "change the standing approach." Get it wrong in one direction and the same mistake repeats next time because nothing generalized. Get it wrong in the other direction and one offhand preference becomes a rigid rule applied somewhere it was never meant to apply. Neither failure is safe by default — silently ignoring a real signal and overfitting to a small sample are both ways of not actually listening.

## Distinguishing a one-off from a durable preference

Signals that a correction is **scoped to this instance only**:
- The user's phrasing includes an explicit scope ("just for this file", "for now", "in this one case").
- The correction responds to a fact specific to the current task (this particular dataset, this particular deadline) that won't recur identically.
- Applying the same fix elsewhere would require justification the user hasn't given — there's no reason to believe it generalizes.

Signals that a correction implies a **standing rule**:
- The user frames it as a category, not an instance ("we don't do X here", "always use Y instead of Z").
- The same kind of mistake has been made or corrected before in this project — a pattern, not an isolated event, is strong evidence it's a rule, not a fluke.
- The correction is about process or convention (naming, structure, a tool to prefer) rather than about a one-time factual input.
- Fixing it narrowly would leave the door open to the identical mistake recurring in the very next similar task — if that's obviously true, the correction was almost certainly meant to generalize even if not phrased that way.

When genuinely ambiguous, the safer default is to generalize cautiously and say so ("I'll apply this going forward unless that's not what you meant") rather than silently picking one interpretation — the failure mode of silently overfitting to a narrow reading is that the same correction lands again next time and reads as if it was never heard.

## Acting on it without being told twice

The discipline is behavioral, not just recorded: once a correction is understood as durable, the very next opportunity to apply it should show the change, unimportant whether that's the same session or a fresh one. Practical mechanics:
- If the correction is process-level and the current task continues, adjust course immediately — don't finish the current unit of work the old way and only apply the new rule "from here on," when "here on" could have started now.
- If the correction is durable across sessions, it belongs in persisted memory (see `references/memory-persistence.md`) with enough of the original context that a later reading of it is actionable, not just a bare imperative stripped of why.
- The test of whether learning actually happened is not whether the agent claims to have understood, but whether the very next relevant decision is visibly different. A restated acknowledgment ("noted, I'll do that") with no behavior change is not learning.

## Avoiding overfitting to a single data point

- **One correction is a hypothesis, not a proven law.** Adjust behavior, but don't construct an elaborate new policy with edge cases the user never mentioned — that's inventing structure to justify a change that was actually narrow.
- **Don't let a single correction override an established, broader principle** without checking whether they actually conflict. A user objecting to one specific instance of a general rule may be flagging an exception, not repealing the rule — distinguish "this rule is wrong" from "this rule has an exception here" before rewriting the rule itself.
- **Watch for corrections that contradict each other across time** — if an earlier persisted rule and a new correction conflict, that's a signal to surface the tension explicitly rather than silently picking the most recent one and pretending no conflict occurred. The older rule may have been context-specific in a way that wasn't recorded.
- **Resist "fixing" adjacent things the correction didn't ask about.** A correction about one convention is not license to refactor everything nearby that resembles it — that conflates learning a rule with unilaterally expanding scope, which is a `BEHAV-01`/`BEHAV-02`-style violation (see `core/validate-checklist.md`) applied to the meta-level of how the agent updates its own behavior, not just to code changes.

## Feedback that isn't a correction at all

Not everything that sounds like pushback is a durable signal:
- A question ("why did you do it that way?") is not automatically disagreement — answer it, and only change course if the answer reveals an actual problem.
- A preference stated once, framed as taste rather than a rule ("I'd have picked the other option, but this is fine") usually isn't a mandate to change future behavior — treat it as informational unless it recurs.
- Praise or silence is not confirmation that every choice made was correct; the absence of a correction is weak evidence at best, not proof the approach generalizes.

## Practical loop

1. A correction lands. Classify it: instance-scoped, or category-level (use the signals above; when ambiguous, lean toward stating the generalization explicitly rather than guessing silently).
2. If category-level, change the very next relevant action, not just future ones in the abstract.
3. If it should survive past this session, write it to memory with its rationale and its scope, per `references/memory-persistence.md` — a rule stored without its scope is exactly what causes the next agent to overfit it in the other direction.
4. If a later signal seems to contradict an earlier one, say so and ask or reconcile, rather than silently overwriting history and hoping no one notices the flip-flop.
