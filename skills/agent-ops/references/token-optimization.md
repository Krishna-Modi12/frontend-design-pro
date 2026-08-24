# Token Optimization (agent-ops)

This is about the agent's own working memory — the context window it reasons in — not about building a UI that visualizes token usage. Every file read, every tool result, every subagent report competes for the same finite budget as the user's own prompt and the task's actual content.

## Why this matters

A context window is not a queue that quietly overflows — it is a resource that degrades reasoning quality well before it is technically full. Irrelevant content dilutes attention, pushes load-bearing facts further from where they're used, and increases the chance a stale or contradictory fact from an early tool call still influences a decision much later. Treating context as free is the single most common way an agent talks itself into a wrong answer despite having "read everything."

The registry pattern this repo uses at the meta level is the same discipline applied to files: per `docs/ARCHITECTURE.md`, a 2,018-token `SKILL.md` routes to 373,600 tokens of references, and no single request pays for material it doesn't touch. An agent reading "just in case" is doing the thing the registry exists to prevent, one level down.

## Eager vs. lazy: what to load and when

**Load eagerly (before or at the start of a task):**
- The specific file(s) the user named or that are unambiguously the target of the request.
- A router/index file whose entire purpose is to tell you what else exists — reading it is cheap and its job is exactly to save you from guessing.
- Anything already known to be small and universally relevant (a project's top-level conventions file, a schema the whole task depends on).

**Load lazily (only once a concrete sub-question requires it):**
- Deep reference material behind a router — read `references/foo.md` only once you know the task actually needs foo, not because it might.
- Adjacent files "for context" when the task doesn't touch their content. Curiosity is not a budget line item.
- Full file contents when a targeted search (grep, a specific line range) would answer the question. Read whole files when you need to understand structure or write into them; search when you need to confirm or locate a fact.
- Historical/log-style content (past run output, prior conversation transcripts) beyond the portion relevant to the current decision.

**Never load:**
- The same file twice in one task without a stated reason (the file changed since the last read, or the first read was partial and this one needs a different range).
- A file solely because a subagent or tool result mentioned its name, without first confirming it's relevant to the open question.

## Measuring cost, not guessing at it

"This feels big" is not a budget. Concrete signals to use instead:
- Line count and rough token-per-line ratio (markdown prose runs close to 1 token per 4-5 characters; dense code or JSON is denser). A 1,200-line reference file is a very different cost than a 1,200-line generated data dump.
- Whether a tool result is being read for a single fact (a version number, a boolean) versus its full structure — if it's a single fact, prefer a search that returns just that line over a full read.
- The number of files already read this task. Three deep reads is a reasonable investigation; fifteen is a sign the search strategy itself has failed and is substituting volume for precision.
- Whether the content will still be needed several turns from now, or only to answer the immediate question. Content needed once should be summarized and released, not carried at full fidelity.

This repo's own build makes the measurement explicit rather than impressionistic: Gate 1 asserts `SKILL.md` ≤6,000 tokens, Gate 8a asserts each skill ≤3,000 tokens alone and ≤8,000 with its declared core-deps, and `docs/ARCHITECTURE.md` reports the actual per-skill numbers (5,978–7,598 tokens) rather than an estimate. Hold your own reads to the same standard: state what a read is expected to cost and what question it answers.

## Avoiding redundant re-reads

The most common waste is re-deriving something already established:
- If a file was read in full earlier in the same task and hasn't been edited since, do not read it again to "double check" — that impulse is usually anxiety, not new information. If a specific line needs re-verification after an edit, target that line or use the edit tool's own confirmation rather than a full re-read.
- If a subagent or tool already returned a synthesized answer to a question, use that answer. Re-running the same investigation because the summary "might have missed something" should be a deliberate decision (e.g., the summary is suspiciously confident, or the stakes are high enough to warrant independent verification — see `references/verification-loops.md`), not a default habit.
- When multiple files might contain the answer to one question, search broadly first (grep/glob) to narrow to the 1-2 candidates, then read those.
- Track, at least implicitly, what's already "paid for" in the current context so a later step doesn't re-fetch it under a different name or phrasing.

## Summarization discipline

Long tool output (a full test run, a large diff, a verbose subagent report) should be compressed to its conclusion once that conclusion is reached, rather than left in context at full length for the remainder of the task:
- Extract the actionable fact (three tests failed, here are their names and error strings) and let the raw scrollback fall out of active reasoning.
- When reporting to a caller, give the conclusion and the load-bearing evidence, not the transcript of how it was reached — push detail into cited file paths instead of pasted content.
- Don't summarize away the specific facts a decision depends on (an error message's exact text, a line number) — summarization removes redundancy and noise, not the evidence itself.
- Multi-stage tasks benefit from periodically re-stating a short working summary ("so far: X changed, Y still open, Z verified") rather than relying on the full history remaining legible at the same fidelity as it recedes.

## Prompt caching awareness

Systems that support prompt caching reward a stable prefix — content that doesn't change between calls sits at the front and is cheap to reuse; content that changes goes at the end.
- Keep large, stable material (a system prompt, a router file, a set of core-dep files) ordered before small, per-request material (the specific user ask, this turn's tool results) so a caching layer can actually exploit the repetition.
- Avoid gratuitously touching or reordering content that was previously stable — inserting a small edit in the middle of an otherwise-static block invalidates the cache for everything after it, not just the edited line.
- When a task repeats the same large reference across many turns (iterating on one file with the same core-deps loaded), that repetition is what caching is for: include it consistently rather than dropping and re-adding it opportunistically, which defeats the cache.

## Anti-patterns

- Reading an entire deep reference to answer a one-line factual question a grep would have answered directly.
- Pulling in adjacent skills' reference files because they seem thematically close, without a concrete sub-question that needs them.
- Carrying a full multi-thousand-line tool result in context for the rest of a long task instead of extracting its conclusion.
- Re-reading a file after every small edit when the edit tool already confirms success and the risk of silent corruption is low.
- Treating token budgeting as someone else's problem because the window is technically large enough — large-but-wasted is still wasted, and quality degrades before the hard limit is hit.
