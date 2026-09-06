# Frontend Optimization Workflow (agent-ops)

`core/agent-behavior.md` gives the general task pipeline — detect intent,
reason about tradeoffs, route to the right references, build, verify. This file
is the frontend-optimisation instance of it: the order to work in when the ask
is "make this faster / smoother / more responsive", and the shape of the report
that comes out.

It exists because performance work has a characteristic failure mode — the
agent fixes the first slow thing it can name, from memory, without measuring,
and reports a percentage nobody can reproduce. The steps below are the guard
against that.

## Phase 1 — Inspect before touching anything

Map the system as it is. Changing architecture you have not understood is how a
working page regresses.

- **Stack.** Framework and version, build tool, router, rendering model (SSR /
  SSG / SPA / RSC), styling approach, state and data-fetching libraries.
- **What loads.** The JavaScript bundle graph, third-party scripts and tags,
  fonts, the largest images, anything blocking first paint.
- **What moves.** Existing animation and its implementation, scroll handling,
  the interaction patterns.
- **Where the cost is.** Read a profile or a Lighthouse run *first*. The
  bottleneck is usually not where intuition points — `react-performance.md`
  §"Audit output format" and `rendering-performance.md` §"Seeing it" cover the
  tools.

Write down what you found. The report's later sections are built from this.

## Phase 2 — Research against the observed problem

Not generic performance advice — research the specific thing the profile
showed. If the problem is a 400 ms interaction, research input latency and
task-splitting; if it is a 5 MB image payload, research responsive images and
modern formats.

- Prefer a configured research tool or an MCP browser over an unqualified
  `web_search` for anything time-sensitive (`core/agent-behavior.md`).
- Authoritative sources first: the framework's own docs, web.dev, MDN, the
  relevant spec. Treat engineering blogs and forum threads as supporting
  evidence, not as the answer.
- When studying a repository or a live site for how they solved it, extract the
  *pattern* — the architecture, the tradeoff they accepted — not the code.
  Check the licence before any code moves.
- The pack's own references are the first stop for a technique that is already
  documented — `platform/references/responsive-layout.md`,
  `react-performance/references/`, `animations/references/motion-budget.md`.

## Phase 3 — Brainstorm one step past the obvious

Before implementing, ask what *else* the same profile implies. A request
waterfall is rarely the only issue on a page that has one. Scan deliberately
across: bundle and code-splitting, rendering and re-renders, the critical path,
loading and perceived performance, interaction latency, layout stability,
accessibility of the loading states, and whether any fix trades away
maintainability.

Then cut the list down. The goal is a short set of high-value changes, not
every optimisation that is technically possible. An unmeasured "optimisation"
is speculative complexity (`core/agent-behavior.md` P2).

## Phase 4 — Implement in priority order

- **Preserve working functionality.** Every change is a chance to break
  something that currently works — the standing risk this pack cares about most.
- **Highest impact first**, where impact is **user-visible effect × how many
  users hit the path × how reliably the fix holds**. A 2 s saving on the most
  common navigation outranks a 200 ms saving on a settings page.
- **Targeted, not a rewrite.** Change the bottleneck; do not refactor around it
  (`core/agent-behavior.md` P3). No "while I'm here" cleanup.
- **Validate after each significant change** — re-profile, re-run the metric,
  confirm the number moved. `verification-loops.md`: "I made the edit" and "the
  edit is correct" are different claims.
- **Remove an optimisation that did not measurably help.** Kept "just in case",
  it is complexity with no payer.

## Metrics — connect them to experience, never optimise blind

| Metric | What the user feels |
|---|---|
| LCP | How long until the page looks loaded |
| CLS | Whether things jump while they read or tap |
| INP | Whether taps and clicks respond |
| TTFB | How long the server took to start replying |
| FCP | How long the screen stayed blank |
| TBT / LoAF | How much the main thread was blocked during load |

A metric is a proxy. Moving LCP from 3.1 s to 2.9 s to cross a threshold, with
no perceptible change, is gaming the number. State the metric *and* the
experience it stands for.

## Never fabricate a measurement

This is the pack's central claim applied to performance: a number in the
report is either something a tool produced and you read, or it is not in the
report. "Roughly 30% faster" without a before-and-after from the same tool on
the same conditions is an invented figure — worse than saying nothing, because
it reads as evidence.

If profiling was not possible — no production-like environment, no field data,
a change whose effect only shows at scale — say so plainly. "Not measured:
expected to reduce main-thread work during filter, unverified" is an honest
line. A confident percentage is not.

## The report

When the work is done, produce these sections. Omit one only if it genuinely
does not apply, and say why.

1. **Executive summary** — the main problems found and the overall strategy, in
   a few sentences.
2. **Research findings** — what the authoritative sources and any studied
   implementations established, with links.
3. **Problems found** — grouped: responsiveness, rendering, load, interaction,
   stability, accessibility. Each as `file:line — issue — one-line fix`
   (`react-performance.md`'s audit format).
4. **Changes made** — what changed and why, tied back to a problem.
5. **Performance strategy** — how the changes reduce rendering, script,
   network, layout and paint cost.
6. **Responsive strategy** — how the UI now behaves across the width range.
7. **Validation** — what was measured, with which tool, before and after; and
   what remains unverified. No invented numbers.
8. **Further opportunities** — the next highest-value changes, ranked, for a
   later pass.

## After the obvious fix

Do one proactive review pass: "what performance, responsiveness, stability or
accessibility problem is likely to surface next, directly downstream of this
change?" Fix what is clearly connected — a new lazy boundary that needs a
loading state, a virtualised list that lost keyboard scroll. Do not expand into
unrelated work; that is the scope creep P3 exists to stop.
