# Memory Persistence (agent-ops)

This covers what an agent should carry forward across sessions and turns — decisions, corrections, and durable project facts — not how to build a UI that displays persisted state (that UI concern lives elsewhere, e.g. `skills/data-tables/references/memory-persistence.md`, and is out of scope here). The subject here is the agent's own operating memory.

## Why cross-session memory is different from context

Within a single task, everything relevant is (ideally) already in context. Across sessions, the context resets — a new conversation, a new agent instance, sometimes a new subagent with no shared history — and anything not written down is gone. The question this reference answers is: what is worth the cost of writing down, where does it live, and how does an agent know when a written fact has gone stale.

Persisting too little means re-deriving the same conclusion every session (re-discovering a naming convention, re-triggering a mistake already corrected once). Persisting too much means the memory store itself becomes a liability — stale, contradictory, or so bulky that reading it back costs more than re-deriving the fact would have. Both failure modes are common; the discipline is choosing correctly, not maximizing volume in either direction.

## What's worth persisting

**Durable and worth writing down:**
- **Decisions with a rationale.** Not just "we chose X" but why — the alternative considered and rejected, and the condition under which it would be revisited. A decision without its rationale is a trap for a future agent that re-litigates it without the original context.
- **Corrections that generalize.** If a user fixed a mistake once and the fix implies a standing rule (not just "don't do this exact thing again" but "here's the category of thing to avoid"), that generalization belongs in memory. See `references/continuous-learning.md` for how to tell a one-off from a generalizable correction before writing it down.
- **Project-specific facts that aren't discoverable by reading the code** — a deploy quirk, a why-this-file-is-structured-oddly note, a "don't touch this, it's load-bearing for reason Y" flag. Facts that a fresh read of the codebase would reveal on its own don't need a memory entry; facts that live only in someone's head or in a past conversation do.
- **Standing preferences stated explicitly** ("always use tabs here", "never touch the generated directory") — these are cheap to store and expensive to keep re-triggering violations of.

**Not worth persisting:**
- **Ephemeral task state** — the specific plan for finishing the task at hand, intermediate variable values, a scratch list of files still to check. This dies with the task; writing it to durable memory just adds noise for the next session, which starts a new task with its own scratch state.
- **Anything already true from reading the repo.** If a fact is derivable by looking at a file (the current version number, the current list of dependencies), storing a copy of it in memory creates a second source of truth that can silently diverge from the first — prefer citing where to look over caching the answer.
- **One-off exceptions the user explicitly scoped ("just for this file", "just this once").** Storing these as if they were standing rules is exactly the overfitting failure mode described in `references/continuous-learning.md`.
- **Speculative future needs.** Don't write down a fact because it might matter someday; write it down because a concrete instance already showed it matters.

## Memory file structure

A workable structure keeps entries small, dated or versioned, and independently droppable — a memory store that must be read in full and can't be partially trusted is close to worthless. Practical shape:

```
memory/
  decisions.md       — durable architectural/process decisions with rationale
  corrections.md     — generalized rules learned from user corrections
  project-facts.md   — non-obvious facts about this specific codebase/project
```

Each entry should carry, at minimum:
- **The fact or rule itself**, stated as an instruction an agent can act on, not a narrative.
- **The condition that would invalidate it** (a file path it depends on, a version constraint, an assumption about the environment) — this is what makes staleness detectable later instead of silent.
- **When it was established**, so a much later re-reading agent can judge whether it's plausible the world has moved on.

Avoid one giant undifferentiated memory blob — it becomes something every session must read in full (defeating the point of lazy loading, see `references/token-optimization.md`) and something no one wants to prune because deleting from a monolith feels riskier than deleting one entry from a small file.

## Staleness and invalidation

A persisted fact is a claim about the world at the time it was written, not a permanent truth. It goes stale when:
- The file or component it references has been deleted, renamed, or substantially rewritten.
- The condition that justified it (a library version, a temporary workaround) no longer holds.
- A newer, contradictory decision has since been made and the old entry was never removed.

Practical discipline:
- **Check the invalidation condition before trusting an old entry**, not after acting on it. If a memory entry says "don't touch `foo.ts`, it's fragile" and `foo.ts` no longer exists, the entry is stale, not still binding on whatever replaced it.
- **Prune on discovery, not on a schedule.** The moment a stale entry is noticed, correct or remove it rather than leaving it for a hypothetical future cleanup pass — a memory store that accumulates unpruned dead entries becomes untrustworthy as a whole, not just in the stale parts.
- **Prefer facts with a built-in expiry** (tied to a file path, a version number, an explicit date) over vague ones ("recently we decided...") that can't be mechanically checked for staleness at all.

## Avoiding memory bloat

- **One rule, one entry.** Don't restate the same standing preference in three different files because it came up three times — that's a sign the memory is being written reactively instead of maintained.
- **Merge, don't append, when a new entry supersedes an old one.** An append-only memory store that never reconciles contradictions is worse than no memory, because a reader can no longer tell which entry is authoritative.
- **Weigh the cost of storing against the cost of re-deriving.** A fact that takes ten seconds to re-derive by reading a file doesn't need a permanent memory entry; a fact that took an entire investigation (or a user's explicit correction) to establish does.
- **Keep entries actionable, not archival.** A memory file is a working reference for future behavior, not a diary of everything that happened — the "why" belongs when it changes what a future agent should do, not as a complete history for its own sake.

## Retrieval in tiers, not in one read

The failure mode a memory store hits at scale is not storing too much — it is being forced to
read everything to find one thing. The fix is to make lookup and hydration separate steps with
very different costs:

| Tier | Returns | Cost per result |
|---|---|---|
| Search | matching IDs plus a one-line label | ~50–100 tokens |
| Timeline | what happened around a point in time, chronologically | ~50–100 tokens |
| Fetch | the full stored observation | ~500–1,000 tokens |

Search first, decide from the labels, then hydrate only the entries that survived. Filtering
before fetching is roughly a **10× reduction** against reading full entries to find the
relevant ones — the same eager-vs-lazy discipline `references/token-optimization.md` applies
to reference files, applied to memory.

The rule that follows: **never expose a memory store that can only be read whole.** If the only
retrieval operation returns full entries, the store's cost grows linearly with everything ever
written, and the practical response is to stop writing to it.

## Capture points and exclusion

Persistence is worth wiring to specific moments rather than done ad hoc. The lifecycle points
that carry signal:

| Point | What is worth capturing |
|---|---|
| Session start | load prior context before the first action, not after a mistake |
| User prompt submitted | the stated intent, which is the thing most often lost by the next session |
| After a tool call | outcomes and corrections — the observations with the most durable value |
| Stop / session end | what was concluded, what was left unfinished |

Two mechanics matter more than the storage engine:

- **Explicit exclusion.** Sensitive content needs a way to be marked non-persistable at the
  point it appears (`<private>`-style tagging), not filtered afterwards. A memory store that
  can only be cleaned retroactively has already written the secret to disk.
- **Hybrid lookup.** Keyword search alone misses paraphrased recall; semantic search alone
  returns plausible-but-wrong neighbours. Running both and merging is what makes tier-1 search
  cheap enough to trust as a filter.

Storage engine is an implementation detail — the contract that matters is: cheap search, exact
IDs, hydrate on demand, exclude at capture time.
