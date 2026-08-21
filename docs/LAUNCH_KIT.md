# Launch Kit

Copy-paste posts for the current release. Every body already carries the real repo URL — nothing to substitute before posting.

**Every number below is verified** against a green `python scripts/build_release.py --dry-run`: 19 skills · 8 core files · 104 references · 371,905 tokens of lazy depth · 55 examples (45 gold + 10 anti-examples) · 45 test files, 229 tests · 17 semantic + 43 syntactic = 60 constraints · 22 evals · 14 regression cases · registry 2,099 tokens · heaviest request 7,530 tokens.

> **Two claims to avoid.** They circulated in draft copy and neither survives checking:
> - *"The TypeScript compiler found 8 bugs that 30 regexes certified as clean."* No record of this exists anywhere in the repo. The defensible version is below: 14 regression cases where AST and regex disagree, in both directions.
> - *"42 gold examples."* There are 45 golds plus 10 deliberate anti-examples = 55 files. Say 45 golds, or 55 examples — not 42 golds.
>
> A launch audience fact-checks. Ship the number you can reproduce on demand.

---

## Hacker News

**Title** (79 chars — HN's field caps at 80 and truncates silently, so do not lengthen it):

```
Show HN: Frontend skill pack for AI agents, with machine-enforced quality gates
```

**url:** `https://github.com/Krishna-Modi12/frontend-design-pro` — and leave the text box **blank**.

HN's submit form takes a url *or* text, not both: fill the url and whatever you typed into text is discarded. A Show HN submitted as text is a discussion post, and the repo link is then one click further away than it should be. Submit the url, then post the body below as your own first comment, immediately.

```
Most agent skill packs are one big markdown file. That design has a hard
ceiling: the pack competes with the user's prompt for context, and a pack
worth having is bigger than the window it has to fit in.

frontend-design-pro is a registry instead of a document. SKILL.md is 2,099
tokens — identity, an anti-slop wall, and a 19-row routing table. It matches
your request against trigger keywords, loads exactly one skill plus the core
primitives that skill declares, and leaves the other 371,905 tokens of
reference material on disk.

Measured, not estimated: the heaviest possible request loads 7,530 tokens.
The lightest loads 5,965. A gate fails the build if any skill exceeds 8,000
with its dependencies, so it can't quietly regress. Adding the 17th skill
grew the always-loaded registry by 51 tokens.

What's enforced, rather than asserted:

- 55 examples compile under `tsc --noEmit` strict + noImplicitAny
- 17 semantic constraints run through the TypeScript compiler API, on every
  gold example — a comment reading `// aria-describedby` is not accessibility,
  and no regex vocabulary catches a fake loading delay spelled `setPhase`
- 43 regex constraints for what regex is genuinely good at: banned display
  fonts, raw hex, min-h-screen, placeholder copy
- 14 regression cases where the AST check and the regex it replaced disagree.
  Half of them exist to kill false positives — a blanket `&&` ban flags
  correct React, a blanket `...` ban flags every rest-spread in the pack.
  Constraints that cry wolf get switched off, so precision matters.
- 11 blocking gates, and the archive is unzipped and re-verified against its
  own extracted copy before release. No manual builds.

The two newest skills are both generative — design computed at runtime rather
than authored once. canvas-typography covers particle text, variable-font axis
animation and scramble reveals, and the rule it enforces is not the effect but
what the effect must never cost: the real string stays in the DOM, the canvas
is aria-hidden decoration, and getContext("2d") is null-guarded because it
returns null under SSR and under a headless test runner. color-themes does
OKLCH generation from one anchor hue with chroma clamped to the sRGB gamut,
plus palette extraction that clusters rather than averages — the mean of any
photograph is the same muddy brown-grey, because opposite hues cancel. Its
contrast is verified across all 24 hue steps in both polarities, since the
failures live at specific hues and a single-hue test proves nothing.

Adding both cost 103 tokens of always-loaded context. That is the architecture
argument in one number: ~51 per skill, which is what the figure derived from a
single skill predicted, and the 65,000 tokens of reference depth they brought
are never loaded unless a request routes there.

There is also a demo that proves the "runnable" claim: demo/showcase is a real
Next.js 15 + React 19 app with its own package.json, real installed deps
(R3F, RHF+Zod), and a dev server that boots — not the ambient-stub-typed
convention every other demo/ folder uses. CI runs a real `next build` against
it on every push. The exact prompt that generated it is in the repo; copy it
into any agent and compare output.

Known gaps are in docs/ARCHITECTURE.md rather than left for you to find. The
biggest: the suite runs against hand-written stubs, not the real peer libraries
— the pack installs none of its examples' ~25 dependencies. So it proves the
examples mount, expose the roles and labels they claim, respond to interaction
and survive axe; it doesn't prove they work against the real `three` or
`react-hook-form`. Running it for the first time found a gold that crashed on
any stable React build, which is the argument for having done it.

One thing I'd flag as a lesson rather than a feature: the drop-in system prompt
sat three architecture versions out of date for months. 28 of the 31 file paths
it cited didn't exist. The gate that was supposed to guard it checked that its
section headings were present — which they were, the whole time. Structural
checks don't catch semantic rot. The gate now resolves every path the prompt
cites, and I verified it fails against the old file before trusting it.

MIT. Feedback from anyone building agent tooling very welcome — particularly
on the routing table, which is where this lives or dies.

https://github.com/Krishna-Modi12/frontend-design-pro
Demo prompt: https://github.com/Krishna-Modi12/frontend-design-pro#see-it-in-action
```

---

## Twitter / X

```
1/ Most AI agent skill packs are one giant markdown file.

They load 30–50k tokens into the context window and leave no room for the
thing you actually asked for.

I built frontend-design-pro as a registry instead. 🧵

2/ SKILL.md is 2,099 tokens. That's all that's always loaded.

It's a routing table. Match trigger keywords → load ONE skill + the core
primitives it declares.

Heaviest possible request: 7,530 tokens.
Reference material available: 371,905 tokens.

3/ The economics of this are the whole point.

The two newest skills grew the always-loaded registry by 103 tokens. Both of
them, combined.

Marginal cost of a new skill: ~51 tokens of permanent context.
Depth is free because it's lazy.

4/ Quality is machine-enforced, not asserted.

11 blocking gates. 55 examples compile under tsc strict. 17 semantic
constraints run through the TypeScript compiler API. 43 regex constraints.
22 evals.

No gate passes → no archive exists.

5/ Why AST checks and not just regex:

A comment reading `// aria-describedby` is not accessibility.
`bg-white` on a <button> is not a design violation.
A fake loading delay spelled `setPhase` has no regex vocabulary at all.

6/ And the half nobody mentions — regex has too MANY hits, not too few.

A blanket `&&` ban flags `isOpen && <Panel/>`, which is correct React.
A blanket `...` ban flags every rest-spread.

Constraints that cry wolf get turned off. Precision is a feature.

7/ Things most packs skip:

· motion direction — what an animation *communicates*, not how to code it
· AI-generated UI as untrusted input — same 60 constraints
· a 6-question intake: content volume (3 items or 300?) drives the rest
· icons as typography: hit area ≠ glyph size

8/ A lesson that cost me a release:

The drop-in system prompt was 3 architecture versions stale. 28 of the 31 paths
it cited didn't exist.

The gate guarding it checked that its section HEADINGS existed. They did — the
whole time.

Structural checks don't catch semantic rot.

9/ So the gate now resolves every path the prompt cites.

And I verified it FAILS against the old file before trusting it. A guardrail
you haven't seen fail is a guardrail you haven't tested.

Known gaps are all in ARCHITECTURE.md. Shipping the caveats is part of
shipping.

10/ Newest two are generative — design computed, not authored.

canvas-typography: particle text, variable fonts, scramble. The real string
stays in the DOM — the canvas is decoration.

color-themes: OKLCH from one hue, gamut-clamped. Palettes clustered, never
averaged.

11/ Both cost 103 tokens of always-loaded context. Combined.

~51 per skill, which is exactly what the number derived from ONE skill
predicted. The 65k of depth they added loads only if you ask for it.

That's the whole architecture argument in one measurement.

12/ MIT licensed. Works with Claude, Cursor, or anything that reads skill files.

https://github.com/Krishna-Modi12/frontend-design-pro
```

---

## Reddit — r/ClaudeAI and r/webdev

One body, posted to both. **Check each subreddit's rules first** — r/webdev
restricts "here's a thing I built" posts to its Showoff Saturday thread, so a
weekday self-post there is liable to be removed no matter how good it is.

**Title:** `frontend-design-pro — a registry-routed frontend skill pack for AI agents (MIT)`

```
**The problem**

Most skill packs are monolithic markdown. They dump 30–50k tokens into the
context window and leave no room for your actual prompt. Comprehensiveness
and usability are in direct conflict.

**The approach**

A registry rather than a document:

- `SKILL.md` — 2,099 tokens, always loaded. Routing table + anti-slop wall.
- 19 skills, 848–1,722 tokens each. **One** loads per request.
- 8 core primitives (tokens, a11y baseline, component API, agent behaviour,
  validation checklist, intake). A skill declares the 3–4 it needs.
- 104 references, 371,905 tokens. Loaded only when a skill routes to one.

Measured per-request load: **5,965 to 7,530 tokens.** A gate fails the build
if any skill exceeds 8,000 with dependencies.

**What's actually enforced**

11 blocking gates in `scripts/build_release.py`, ~45 seconds:

1. Pre-flight — token ceiling, version consistency across three files
2. Frontmatter — 17/19 skills declare deps that exist
3. Compile — 55 examples, `tsc --noEmit` strict + noImplicitAny
4. Semantic — 17 AST constraints via the TypeScript compiler API
5. Syntactic — 43 regex constraints; anti-examples must FAIL
6. Pipeline — stage markers
7. Evals + coverage — 22 evals; every gold has a 1:1 test
8. Budget + registry — every row resolves, every skill in budget
9. Showcase build — the real Next.js demo builds clean under `next build`

Then the archive gets unzipped and gates 3 and 4 re-run against the extracted
copy. If that fails the archive is deleted.

**Contents**

Landing pages · forms (RHF + Zod, auth, OTP, checkout) · data tables and
dashboards · 3D (R3F, drei, shaders) · animations · design systems (OKLCH
tokens, dark mode) · iconography · AI UI generation · React performance ·
testing (Vitest, jest-axe, Playwright) · design principles (29 UX laws,
Gestalt) · platform (mobile, PWA, RN, i18n, SEO, payments) · agent-ops
(token budgeting, memory persistence, verification loops, subagent
orchestration — for the agent's own discipline, not UI).

**The newest pieces**

Two generative skills — design computed at runtime rather than authored once:

- `canvas-typography` — particle text, kinetic type, variable-font axis
  animation, scramble/decode reveals. What it enforces is not the effect but
  what the effect must never cost: the real string stays in the DOM, the
  canvas is `aria-hidden` decoration, and `getContext("2d")` is null-guarded,
  because it returns `null` under SSR and under a headless test runner. Every
  example degrades to plain readable type rather than a blank rectangle.
- `color-themes` — OKLCH token generation from one anchor hue with chroma
  clamped to the sRGB gamut, harmonic schemes, and palette extraction that
  clusters rather than averages (the mean of any photograph is the same muddy
  brown-grey — opposite hues cancel). Contrast is verified across all 24 hue
  steps in both polarities, because the failures live at specific hues.

Adding both grew the always-loaded registry by **103 tokens** — ~51 each,
which is what the marginal-cost figure derived from a single skill predicted.
The 65,000 tokens of reference depth they brought load only on demand.

There's also a demo that's actually installed and run: `demo/showcase` is a
real Next.js 15 + React 19 app (own `package.json`, real deps — R3F,
RHF+Zod), not the ambient-stub-typed convention the rest of `demo/` uses. CI
runs a real `next build` against it on every push (Gate 9 below). Setup docs
cover ChatGPT, the OpenAI API, GitHub Copilot, and Gemini alongside the
Claude/Cursor guides, with an honest compatibility matrix
(`docs/AGENT_COMPATIBILITY.md`) that says plainly which agents get true
on-demand loading versus which have to front-load everything.

**Known limitations, up front**

- The suite runs against hand-written stubs, not the real peer libraries —
  the pack installs none of them. It proves the examples mount, expose their
  roles and labels, respond to interaction and pass axe; it doesn't prove they
  work against the real `three` or `react-hook-form`.
- Reference depth is uneven — `design-system` has 15 references, the newest
  skills have 2.
- Screenshots are captured by hand, not in CI. The build now checks that every
  one of them reaches the archive — it does not check that any of them still
  matches the app, so a change to `demo/showcase` can make one stale before
  anyone notices. `.github/SCREENSHOT_CONTRIBUTION.md` has the recapture spec;
  the app itself is verified on every push by Gate 9, which runs a real
  `next build` against its real dependencies.

All of this is in `docs/ARCHITECTURE.md`. MIT licensed, contributions welcome.

https://github.com/Krishna-Modi12/frontend-design-pro
```

---

## Pre-post checklist

- [ ] `npm run gates` green on a clean checkout
- [ ] `.skill` archive attached to the GitHub release
- [ ] CI green on `main` before the post goes up — a red badge on an HN front page is unrecoverable
- [ ] Free for the first 3 hours to answer comments
