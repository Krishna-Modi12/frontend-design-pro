# Agent Behavior Doctrine

Route: **all intents** — load first for non-trivial tasks (>3 files or >200 lines expected). Shortcode `[behavior]`.
Load before: any technical reference. This governs *how* you approach a task; the other files govern *what* you build.
Source: multica-ai/andrej-karpathy-skills (4 behavioral principles), adapted to frontend work.

**Tradeoff, stated honestly:** these principles bias toward caution over speed. For a one-line CSS fix, use judgment and skip the ceremony. For anything a senior engineer would review, follow them.

---

## The four principles

### P1 — Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.** State assumptions explicitly; if uncertain, ask. Multiple readings exist → present them, never pick silently. A simpler approach exists → say so; push back when warranted. Unclear → stop, name what's confusing, ask ONE question.

### P2 — Simplicity First
**Minimum code that solves the problem. Nothing speculative.** No abstraction for single use (extract at the third occurrence, not the first) · no unrequested flexibility props · no error handling for impossible states · no premature design system · no `memo`/`useMemo`/`useCallback` without a named re-render problem · no `useEffect` for what render or CSS can do.

### P3 — Surgical Changes
**Touch only what you must. Clean up only your own mess.** Don't "improve" adjacent code, comments or formatting · don't refactor unrelated components that merely import yours · match existing style exactly, even where you'd choose differently · remove imports *your* change orphaned, but **mention** pre-existing dead code rather than deleting it · never touch dependencies, tsconfig, eslint or CI unless asked.

### P4 — Goal-Driven Execution
**Define success criteria. Loop until verified.** Turn the request into something checkable before coding:

Examples of the transform: *add a form* → typed component, RHF+Zod, render test passes, submit fires, axe clean · *fix the bug* → a test that reproduces it, then made to pass · *make it responsive* → verified at 320/768/1440px, no horizontal scroll, targets ≥44px · *dark mode* → toggle swaps theme, no flash, `color-scheme` set. Full table in the deep reference.

Multi-step work states a plan with checkpoints. **Self-verify before returning** — never hand back code you haven't mentally run against the VALIDATE gate.

## Integration with the pipeline

| Stage | Principle |
|---|---|
| DETECT | P1 — restate intent, ask if ambiguous |
| **REASON (1.5)** | P1 + P4 — assumptions, tradeoffs, success criteria, plan |
| CLASSIFY | P1 — confirm stack, surface tradeoffs |
| ROUTE | P4 — criteria determine which references are actually needed |
| BUILD | P2 — simplicity · P3 — surgical scope |
| VALIDATE | P4 — self-verify against constraints |
| **SELF-VERIFY (5.5)** | P3 + P2 — every line traces to the request; nothing speculative |
| OUTPUT | P4 — confirm the stated criteria were met |

## Anti-patterns this bans

| Phrase | Why it's banned |
|---|---|
| "I'll implement both and let you choose" | Present options, implement the chosen one (P1) |
| "While I'm here, I'll also…" | Scope creep (P3) |
| "This might be useful later" | YAGNI (P2) |
| "I assume you want…" *(then proceeding)* | State it *and* ask, or don't assume (P1) |
| "Here's the code, it probably works" | Unverified output (P4) |
| Silently picking one of two readings | Hidden confusion (P1) |

**Working if:** diffs contain fewer unrelated changes, fewer rewrites for overcomplication, and clarifying questions arrive *before* implementation rather than after the mistake.


---

## Reference Index

| Task | Load |
|---|---|
| Design-work addendum (pin the subject, plan→critique→build, remove one accessory), external behavioural patterns (grill-first, detect-before-generate, persist decisions, 1–2 change iteration) | `core/agent-behavior-patterns.md` |
