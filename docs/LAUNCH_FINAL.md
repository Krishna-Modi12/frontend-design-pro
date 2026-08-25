# Launch Final — post these

The four posts, final wording, nothing to substitute. Paste and send.

Flat derivative of [LAUNCH_KIT.md](LAUNCH_KIT.md), which stays **canonical** — it carries the rationale, the verified-figures line, and the do-not-say list. If the two disagree, that file wins, and a numbers change has to touch both. [LAUNCH_READY.md](LAUNCH_READY.md) is the earlier extraction this supersedes; it differs only in the two edits below.

**What changed from LAUNCH_READY.md**

<!-- figures:historical — quotes the superseded 1,857/1,837 and 5,512/5,482 readings in order to record that they were wrong and were corrected; updating them would erase the correction this passage exists to document -->

- **Token figures are the LF/git-index measurement**, which is what CI measures and what a reader who downloads the archive can reproduce. The earlier copy quoted a Windows working-tree measurement that reads marginally higher — registry 1,857 vs 1,837, ceiling 5,512 vs 5,482. The published release notes already print the LF numbers, so the old copy contradicted them in public. See the measurement note in [ARCHITECTURE.md](ARCHITECTURE.md).
<!-- /figures:historical -->
- **Every post now names the installer.** One command, ten agents, each in its own native rules format — the most concrete adoption story the pack has, and it appeared in none of the four posts.
- The "no screenshot of the showcase" limitation was **false** and is replaced with the caveat that is real: the screenshot is captured by hand, not in CI, so it can go stale.

Figures below were verified against a green `python scripts/build_release.py --dry-run`: 19 skills · 8 core files · 111 references · 401,382 tokens of lazy depth · 55 examples (45 gold + 10 anti-examples) · 45 test files, 229 tests · 17 semantic + 43 syntactic = 60 constraints · 11 gates · registry 2,112 tokens · heaviest request 7,598 tokens.

**Two claims to avoid** — both circulated in draft copy and neither survives checking: that the TypeScript compiler "found 8 bugs 30 regexes certified as clean" (no record of it exists in the repo), and "42 gold examples" (there are 45 golds plus 10 deliberate anti-examples = 55 files). A launch audience fact-checks.

---

## 1 · Hacker News

**Title**

```
Show HN: Frontend skill pack for AI agents, with machine-enforced quality gates
```

**Body**

```
Most agent skill packs are one big markdown file. That design has a hard
ceiling: the pack competes with the user's prompt for context, and a pack
worth having is bigger than the window it has to fit in.

frontend-design-pro is a registry instead of a document. SKILL.md is 2,112
tokens — identity, an anti-slop wall, and a 19-row routing table. It matches
your request against trigger keywords, loads exactly one skill plus the core
primitives that skill declares, and leaves the other 401,382 tokens of
reference material on disk.

Measured, not estimated: the heaviest possible request loads 7,598 tokens.
The lightest loads 5,999. A gate fails the build if any skill exceeds 8,000
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

Installing it is one command. Ten agents get their own native rules file —
Cursor's .cursor/rules/*.mdc, Copilot's .github/copilot-instructions.md,
Windsurf, Continue.dev, Aider — written out in the format that agent actually
reads, rather than a paragraph of setup instructions you follow by hand:

    unzip frontend-design-pro-v*.skill -d ./
    bash frontend-design-pro/setup.sh

It detects the agent from the project, refuses to guess when two match, and
never overwrites a file you already have without --force. The four hosts that
need a web UI instead (Claude Desktop, ChatGPT, Gemini, Codex CLI) get a card
with the real steps rather than a script pretending to automate one.

It also includes agent-ops, a 16th skill covering the agent's own
operating discipline rather than UI — token budgeting, cross-session memory,
verification loops, subagent orchestration. And a demo that actually proves
the "runnable" claim: demo/showcase is a real Next.js 15 + React 19 app with
its own package.json, real installed deps (R3F, RHF+Zod), and a dev server
that boots — not the ambient-stub-typed convention every other demo/ folder
uses. CI runs a real `next build` against it on every push. The exact prompt
that generated it is in the repo; copy it into any agent and compare output.

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

## 2 · Twitter / X

Post as a thread — each numbered block is one tweet.

```
1/ Most AI agent skill packs are one giant markdown file.

They load 30–50k tokens into the context window and leave no room for the
thing you actually asked for.

I built frontend-design-pro as a registry instead. 🧵

2/ SKILL.md is 2,112 tokens. That's all that's always loaded.

It's a routing table. Match trigger keywords → load ONE skill + the core
primitives it declares.

Heaviest possible request: 7,598 tokens.
Reference material available: 401,382 tokens.

3/ The economics of this are the whole point.

Adding the 17th skill grew the always-loaded registry by 51 tokens.

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

7/ Things in here that most packs skip:

· motion direction — what an animation *communicates*, not just how to write it
· AI-generated UI treated as untrusted input, same 60 constraints, no exemptions
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

10/ Also in there: agent-ops, a 16th skill — but this one is for the
agent's own discipline, not UI. Token budgeting, cross-session memory,
verification loops, subagent orchestration.

Plus a showcase demo that's a REAL Next.js app — installed deps, a dev
server that boots, CI running `next build` against it. Not stub-typed
fantasy code. Copy the generating prompt from the repo and try it.

11/ Install is one command:

unzip frontend-design-pro-v*.skill -d ./
bash frontend-design-pro/setup.sh

It detects your agent and writes its native rules file — Cursor, Copilot,
Windsurf, Continue.dev, Aider. Won't overwrite anything without --force.

MIT licensed.

https://github.com/Krishna-Modi12/frontend-design-pro
```

---

## 3 · Reddit — r/webdev

**Title**

```
frontend-design-pro — a registry-routed frontend skill pack for AI agents (MIT)
```

**Body** (Reddit accepts the markdown as-is)

```
**The problem**

Most skill packs are monolithic markdown. They dump 30–50k tokens into the
context window and leave no room for your actual prompt. Comprehensiveness
and usability are in direct conflict.

**The approach**

A registry rather than a document:

- `SKILL.md` — 2,112 tokens, always loaded. Routing table + anti-slop wall.
- 19 skills, 848–1,722 tokens each. **One** loads per request.
- 8 core primitives (tokens, a11y baseline, component API, agent behaviour,
  validation checklist, intake). A skill declares the 3–4 it needs.
- 111 references, 401,382 tokens. Loaded only when a skill routes to one.

Measured per-request load: **5,999 to 7,598 tokens.** A gate fails the build
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

**Install**

```
unzip frontend-design-pro-v*.skill -d ./
bash frontend-design-pro/setup.sh
```

Ten agents get their own native rules file, written in the format that agent
actually reads — `.cursor/rules/*.mdc` for Cursor, `.github/copilot-instructions.md`
for Copilot, plus Windsurf, Continue.dev and Aider. `setup.sh` detects which one
from the project, refuses to guess when two match, and never overwrites a file you
already have without `--force`. `setup.ps1` is the PowerShell port. The hosts that
need a web UI (Claude Desktop, ChatGPT, Gemini, Codex CLI) get a card with the real
steps instead of a script pretending to automate one.

**Also in there**

A demo that's actually installed and run: `demo/showcase` is a real
Next.js 15 + React 19 app (own `package.json`, real deps — R3F, RHF+Zod),
not the ambient-stub-typed convention the rest of `demo/` uses. CI runs a
real `next build` against it on every push (Gate 9 below). The exact prompt
that generated it is documented in the repo — copy it into any agent and
compare the output. Setup docs also now cover ChatGPT, the OpenAI API,
GitHub Copilot, and Gemini alongside the existing Claude/Cursor guides,
with an honest compatibility matrix (`docs/AGENT_COMPATIBILITY.md`) that
says plainly which agents get true on-demand loading versus which have to
front-load everything.

**Known limitations, up front**

- The suite runs against hand-written stubs, not the real peer libraries —
  the pack installs none of them. It proves the examples mount, expose their
  roles and labels, respond to interaction and pass axe; it doesn't prove they
  work against the real `three` or `react-hook-form`.
- Reference depth is uneven — `design-system` has 15 references, the newest
  skills have 2.
- The showcase screenshot is captured by hand, not in CI. It is committed and
  current as of this release, but a change to `demo/showcase` could make it
  stale before anyone notices. `.github/SCREENSHOT_CONTRIBUTION.md` has the
  exact recapture spec; the app itself is verified on every push by Gate 9,
  which runs a real `next build` against its real dependencies.

All of this is in `docs/ARCHITECTURE.md`. MIT licensed, contributions welcome.

https://github.com/Krishna-Modi12/frontend-design-pro
```

---

## 4 · Reddit — r/ClaudeAI

Same title and body as r/webdev above. The pack is agent-agnostic, so there is no Claude-specific variant to maintain — but do read each subreddit's self-promotion rules before posting, and consider leading the r/ClaudeAI comment with the Claude Code setup path (`docs/CLAUDE_SETUP.md`), since that is the host where lazy loading actually works.

Do not cross-post the two within minutes of each other. Space them, and reply to comments on the first before opening the second.

---

## Posting checklist

- [ ] CI green on `main` — a red badge on an HN front page is unrecoverable
- [ ] Latest release page loads and the `.skill` archive is attached
- [ ] Links in the body resolve (the repo URL and the `#see-it-in-action` anchor)
<!-- figures:historical — recounts the pre-launch mismatch using the figures as they stood that day; the numbers are the evidence, not a current claim -->

- [ ] Figures in the posts match the latest release notes. This is the one that
      bit before launch: the posts said 1,857 / 5,512 while the published notes
      said 1,837 / 5,482, and "Measured, not estimated" is the first line a
      reader checks. `grep 'Registry' docs/RELEASE_NOTES-v*.md | tail -1`
<!-- /figures:historical -->
- [ ] `bash setup.sh` works from the *published* archive, not just the repo —
      unzip a release download into a scratch project and run it
- [ ] Hacker News posted
- [ ] Twitter/X thread posted
- [ ] Reddit r/webdev posted
- [ ] Reddit r/ClaudeAI posted
- [ ] First 3 hours free to answer replies
- [ ] Broken links fixed immediately if reported — permitted under the freeze

## While the posts are live

Answer with what the repo can prove. `docs/RESPONSE_TEMPLATES.md` has prepared replies for the common incoming cases, `docs/FAQ.md` covers the questions answerable from the current build, and `docs/AGENT_COMPATIBILITY.md` is the honest per-host matrix — reach for that one rather than claiming parity across agents.

The most likely hostile question is what the test suite actually proves, given the examples' peer libraries are not installed. The answer is in the known-limitations block of every post above, which is why it is there rather than buried: the suite runs against hand-written stubs, so it proves the examples mount, expose the roles and labels they claim, respond to interaction and pass axe — not that they work against the real `three` or `react-hook-form`.
