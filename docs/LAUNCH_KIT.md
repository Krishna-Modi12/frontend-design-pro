# Launch Kit

Copy-paste posts for the current release. Replace `[link]` with the repo URL before posting.

**Every number below is verified** against a green `python scripts/build_release.py --dry-run`: 16 skills · 8 core files · 76 references · 305,784 tokens of lazy depth · 44 examples (38 gold + 6 anti-examples) · 38 tests · 16 semantic + 35 syntactic = 51 constraints · 22 evals · 11 regression cases · registry 1,857 tokens · heaviest request 5,512 tokens.

> **Two claims to avoid.** They circulated in draft copy and neither survives checking:
> - *"The TypeScript compiler found 8 bugs that 30 regexes certified as clean."* No record of this exists anywhere in the repo. The defensible version is below: 11 regression cases where AST and regex disagree, in both directions.
> - *"42 gold examples."* There are 37 golds plus 6 deliberate anti-examples = 43 files. Say 37 golds, or 43 examples — not 42 golds.
>
> A launch audience fact-checks. Ship the number you can reproduce on demand.

---

## Hacker News

**Title:** `Show HN: frontend-design-pro – a registry-routed frontend skill pack for AI agents`

```
Most agent skill packs are one big markdown file. That design has a hard
ceiling: the pack competes with the user's prompt for context, and a pack
worth having is bigger than the window it has to fit in.

frontend-design-pro is a registry instead of a document. SKILL.md is 1,800
tokens — identity, an anti-slop wall, and a 16-row routing table. It matches
your request against trigger keywords, loads exactly one skill plus the core
primitives that skill declares, and leaves the other 305,000 tokens of
reference material on disk.

Measured, not estimated: the heaviest possible request loads 5,512 tokens.
The lightest loads 4,744. A gate fails the build if any skill exceeds 8,000
with its dependencies, so it can't quietly regress. Going from 11 skills to
15 grew the always-loaded registry by 296 tokens.

What's enforced, rather than asserted:

- 44 examples compile under `tsc --noEmit` strict + noImplicitAny
- 16 semantic constraints run through the TypeScript compiler API, on every
  gold example — a comment reading `// aria-describedby` is not accessibility,
  and no regex vocabulary catches a fake loading delay spelled `setPhase`
- 35 regex constraints for what regex is genuinely good at: banned display
  fonts, raw hex, min-h-screen, placeholder copy
- 11 regression cases where the AST check and the regex it replaced disagree.
  Half of them exist to kill false positives — a blanket `&&` ban flags
  correct React, a blanket `...` ban flags every rest-spread in the pack.
  Constraints that cry wolf get switched off, so precision matters.
- 9 blocking gates, and the archive is unzipped and re-verified against its
  own extracted copy before release. No manual builds.

Known gaps are in docs/ARCHITECTURE.md rather than left for you to find. The
biggest: the vitest suite doesn't run end-to-end, because examples import ~25
peer libraries that exist only as ambient type stubs. That's what makes strict
compilation cheap and it's also why runtime execution can't resolve them, so
the test gate asserts 1:1 coverage plus strict compilation and says exactly
that, instead of implying the suite ran.

One thing I'd flag as a lesson rather than a feature: the drop-in system prompt
sat three architecture versions out of date for months. 28 of the 31 file paths
it cited didn't exist. The gate that was supposed to guard it checked that its
section headings were present — which they were, the whole time. Structural
checks don't catch semantic rot. The gate now resolves every path the prompt
cites, and I verified it fails against the old file before trusting it.

MIT. Feedback from anyone building agent tooling very welcome — particularly
on the routing table, which is where this lives or dies.

[link]
```

---

## Twitter / X

```
1/ Most AI agent skill packs are one giant markdown file.

They load 30–50k tokens into the context window and leave no room for the
thing you actually asked for.

I built frontend-design-pro as a registry instead. 🧵

2/ SKILL.md is 1,857 tokens. That's all that's always loaded.

It's a routing table. Match trigger keywords → load ONE skill + the core
primitives it declares.

Heaviest possible request: 5,512 tokens.
Reference material available: 305,784 tokens.

3/ The economics of this are the whole point.

11 skills → 16 skills grew the always-loaded registry by 353 tokens.

Marginal cost of a new skill: ~71 tokens of permanent context.
Depth is free because it's lazy.

4/ Quality is machine-enforced, not asserted.

9 blocking gates. 44 examples compile under tsc strict. 16 semantic
constraints run through the TypeScript compiler API. 35 regex constraints.
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

7/ Things in here that most packs skip:

· motion direction — what an animation *communicates*, not just how to write it
· AI-generated UI treated as untrusted input, same 51 constraints, no exemptions
· a 6-question intake protocol, because content volume (3 items or 300?)
  changes the architecture more than any other answer
· icons as typography: hit area independent of glyph size

8/ A lesson that cost me a release:

The drop-in system prompt was 3 architecture versions stale. 28 of the 31 paths
it cited didn't exist.

The gate guarding it checked that its section HEADINGS existed. They did — the
whole time.

Structural checks don't catch semantic rot.

9/ So the gate now resolves every path the prompt cites.

And I verified it FAILS against the old file before trusting it. A guardrail you
haven't seen fail is a guardrail you haven't tested.

Remaining known gaps are all in ARCHITECTURE.md. Shipping the caveats is part
of shipping.

10/ MIT licensed. Works with Claude, Cursor, or anything that reads skill files.

[link]
```

---

## Reddit — r/ClaudeAI or r/webdev

**Title:** `frontend-design-pro — a registry-routed frontend skill pack for AI agents (MIT)`

```
**The problem**

Most skill packs are monolithic markdown. They dump 30–50k tokens into the
context window and leave no room for your actual prompt. Comprehensiveness
and usability are in direct conflict.

**The approach**

A registry rather than a document:

- `SKILL.md` — 1,857 tokens, always loaded. Routing table + anti-slop wall.
- 16 skills, 801–1,588 tokens each. **One** loads per request.
- 8 core primitives (tokens, a11y baseline, component API, agent behaviour,
  validation checklist, intake). A skill declares the 3–4 it needs.
- 76 references, 305,784 tokens. Loaded only when a skill routes to one.

Measured per-request load: **4,744 to 5,512 tokens.** A gate fails the build
if any skill exceeds 8,000 with dependencies.

**What's actually enforced**

9 blocking gates in `scripts/build_release.py`, ~45 seconds:

1. Pre-flight — token ceiling, version consistency across three files
2. Frontmatter — 16/16 skills declare deps that exist
3. Compile — 43 examples, `tsc --noEmit` strict + noImplicitAny
4. Semantic — 16 AST constraints via the TypeScript compiler API
5. Syntactic — 35 regex constraints; anti-examples must FAIL
6. Pipeline — stage markers
7. Evals + coverage — 22 evals; every gold has a 1:1 test
8. Budget + registry — every row resolves, every skill in budget

Then the archive gets unzipped and gates 3 and 4 re-run against the extracted
copy. If that fails the archive is deleted.

**Contents**

Landing pages · forms (RHF + Zod, auth, OTP, checkout) · data tables and
dashboards · 3D (R3F, drei, shaders) · animations · design systems (OKLCH
tokens, dark mode) · iconography · AI UI generation · React performance ·
testing (Vitest, jest-axe, Playwright) · design principles (29 UX laws,
Gestalt) · platform (mobile, PWA, RN, i18n, SEO, payments).

**Known limitations, up front**

- The vitest suite doesn't execute end-to-end. Examples import ~25 peer libs
  that exist only as ambient type stubs; that's what makes strict compilation
  cheap and it's also why runtime resolution fails. The test gate asserts 1:1
  coverage + strict compilation, and says so rather than implying more.
- Reference depth is uneven — `design-system` has 14 references, the newest
  skills have 1–2.

All of this is in `docs/ARCHITECTURE.md`. MIT licensed, contributions welcome.

[link]
```

---

## Pre-post checklist

- [ ] `npm run gates` green on a clean checkout
- [ ] `[link]` replaced in the post you're using
- [ ] `.skill` archive attached to the GitHub release
- [ ] CI green on `main` before the post goes up — a red badge on an HN front page is unrecoverable
- [ ] Free for the first 3 hours to answer comments
