# Response Templates

Copy-paste responses for incoming issues/PRs during the launch window. Every claim here is grounded in the docs linked — if a doc changes, this file goes stale with it.

> **No version number is hardcoded below on purpose** — this repo ships patches fast, and a frozen digit here would go stale by the next one. Before pasting Template C, check `metadata.json`'s `version` field for the exact current release.

---

## Template A: Bug Report

````text
Thanks for filing this — reports like this are exactly what the launch window is for.

A few things that'll help track it down fast:

1. **Which agent/host are you running this with?** (Claude Code, Claude Desktop,
   Claude.ai, Cursor, ChatGPT, OpenAI API, Copilot, Gemini — see
   docs/AGENT_COMPATIBILITY.md if you're not sure which bucket you're in; behavior
   genuinely differs by host.)
2. **Which skill file got routed?** e.g. `skills/forms/SKILL.md`. If you don't
   know, ask the agent "which skill did you load, and what did it cost?" —
   that also confirms routing happened at all rather than the agent improvising.
3. **The exact error or broken output** — paste the actual text/output, not a
   paraphrase. For a code-quality issue, the generated snippet itself is more
   useful than a description of what's wrong with it.

If this looks like something the constraint suite should have caught, naming the
gate helps: **[Gate #N — name, once diagnosed]**. Full list for reference:

1. Pre-flight · 2. Frontmatter · 3. Compile (`tsc --noEmit` strict) ·
4. Semantic (17 AST constraints) · 5. Syntactic (42 regex constraints) ·
6. Pipeline · 7. Evals + coverage · 8. Budget + registry · 9. Showcase build

(What each one asserts: docs/ARCHITECTURE.md.)

If we confirm this is a real defect, it gets fixed and shipped as a patch release
once it's green across the full gate chain — not held for a future feature
release.
````

---

## Template B: Feature Request (During Freeze)

````text
Thanks for the suggestion — writing it down here so it's counted rather than lost.

Short version: the pack is under a **feature freeze** (see `docs/MAINTENANCE.md`
for exactly which release introduced it). Nothing beyond bug fixes, typo
fixes, or broken-link fixes ships until one of three
things happens — 10 distinct requests for the same specific feature, 5
confirmed bugs, or two weeks of actively-monitored silence (rationale and exact
thresholds: docs/MAINTENANCE.md). That's a "not yet," not a "no" — the freeze
exists because churn is the actual risk to a pack this size, not a shortage of
ideas.

This request is currently at **[N/10]** toward the distinct-request threshold
for "[name the specific feature]." If you know others asking for the same
thing, point them at this issue instead of opening a duplicate — it keeps the
count honest and traceable.

If/when this clears the threshold, the natural home for it is
`skills/{id}/references/` — a new reference file cited from that skill's
Reference Index, plus a gold example if it's substantial enough to warrant one.
A PR scoped that way now, ready to open the moment the freeze lifts on this
specific item, is genuinely useful groundwork even before the count gets there.
````

---

## Template C: Installation Help

````text
Thanks for trying it out — install issues are almost always one of a handful of
things, so let's narrow it down.

**The 3-step install:**

1. Download the `.skill` archive attached to the latest release from [Releases](https://github.com/Krishna-Modi12/frontend-design-pro/releases)
2. Unzip it into your agent's skills directory — for Claude Code that's
   `~/.claude/skills/` (or `.claude/skills/` inside a repo for a project-scoped
   install instead of global); other hosts differ, see the per-agent doc below
3. If your host supports a system prompt, set `AGENT_SYSTEM_PROMPT.md` as it —
   this makes the loading protocol and validation contract explicit rather than
   relying on `SKILL.md` alone

**Per-agent setup docs** (each covers how that specific host actually loads and
routes the pack, which differs more than you'd expect):

- Claude (Code / Desktop / Claude.ai) — `docs/CLAUDE_SETUP.md`
- Cursor — `docs/CURSOR_SETUP.md`
- ChatGPT (Custom GPT or plain) — `docs/CHATGPT_SETUP.md`
- OpenAI API — `docs/OPENAI_API_SETUP.md`
- GitHub Copilot — `docs/COPILOT_SETUP.md`
- Gemini (API / AI Studio / Code Assist) — `docs/GEMINI_SETUP.md`

If it's still not working after matching your setup to the right doc, open an
issue with the **exact error text** (or exact symptom — "ignores the skill
entirely," "loads every skill at once," "cites a file it can't open") plus
which agent/host you're on. Most install failures come down to `SKILL.md` not
sitting at the root of the unzipped folder, or the host summarizing the rules
file instead of reading it directly — both are covered in the troubleshooting
tables in the docs above.
````

---

## Template D: Agent Compatibility Question

````text
Full matrix, kept current: docs/AGENT_COMPATIBILITY.md — trust that over this
comment if the two ever disagree; this template can go stale and that file is
the source of truth.

Short honest version, in its own framing: the one fact that decides how well
this pack works on a given host is "can the agent decide, mid-conversation, to
open one specific file it wasn't given up front?" **Claude Code is the only
host with a real filesystem for that.** Everywhere else, lazy loading degrades
to retrieval search, manual `@`-referencing, or pasting — routing and the
anti-slop wall survive the trip, on-demand depth does not.

Per-host, quoting the actual table (Lazy loading / Reference depth):

- **Claude Code** — "Yes" / "Full, on demand"
- **Claude Desktop** — "No — retrieval" / "Whatever retrieval surfaces"
- **Claude.ai** (no project) — "No — paste" / "None"
- **Cursor** — "Partial — `@`-ref" / "Full, if you `@`-reference it"
- **ChatGPT** (Custom GPT) — "No — retrieval" / "Capped — 20 knowledge files
  per GPT" (that cap is sourced to OpenAI's file-uploads FAQ in
  docs/CHATGPT_SETUP.md, which also notes platform limits like this move over
  time — worth re-checking if it's load-bearing for you)
- **OpenAI API** — "Only with a file-read tool" (one you build) / "Full, via
  your tool"
- **Copilot** — "No — always-on file" / "Only what you paste"
- **Gemini** — "Only with function calling" / "Selected files, or full via
  tool"

On Gemini specifically, since it comes up: its real advantage is context-window
size, not tool access. Without a filesystem tool wired in, it can't fetch one
reference file on demand — the practical pattern is pasting a larger static
slice up front and letting a big window absorb the cost. docs/GEMINI_SETUP.md
calls that "a real tradeoff, not a strict downgrade," but it is *not* full
support of the registry's on-demand loading model, and deliberately doesn't
assert a specific context-window number — that's shifted across model tiers
and would go stale here.

Validation-by-self-check is "Yes" on every host. Validation-by-actual-gate-
scripts (`scripts/build_release.py`, the AST/regex constraints) is not: "Yes —
shell" only for Claude Code; "No" for Desktop, Claude.ai, Cursor, ChatGPT and
Copilot; possible only if *you* wire the scripts in as a callable tool, for the
OpenAI API and Gemini. An agent telling you code "passes A11Y-01" without
running anything is a claim, not a verified result — run `npm run gates`
yourself if enforcement matters.
````

---

## Template E: PR Review (Green)

````text
Thanks for this — nice to review a PR where the gate chain does most of the
talking.

CI ran the full chain and it's green:

- `tsc --noEmit` strict (+ `noImplicitAny`) over the changed examples
- 17 AST/semantic constraints via the TypeScript compiler API
- 42 regex/syntactic constraints
- token budget (every skill ≤3,000 tokens alone, ≤8,000 with its core deps)
- path integrity (every reference this PR cites resolves on disk)
- *(if this PR touches `demo/showcase`)* Gate 9 — a real `next build` against
  its actual installed dependencies, not the stub-typed convention the other
  demos use

That's what's machine-checked; I'll still read through for fit with the
surrounding skill file and the anti-slop wall before merging. Aiming to get
this in within [timeframe] — will follow up here if anything needs a second
look.
````

---

## Template F: PR Review (Needs Work)

````text
Thanks for the PR — CI caught a few things before this could merge, which is
exactly what the gate chain is for.

Gate failures from this run:

```
[paste the exact CI output / failing gate name(s) + constraint ID(s) here]
```

Each constraint ID in that output maps to a specific rule with pass criteria in
`core/validate-checklist.md`, if the "why" isn't obvious from the message.

Once you've got a fix, please push it to this same branch/PR rather than
opening a new one — keeps the review thread and the CI run attached to one
place instead of split across two.

Happy to help narrow down a specific failure if the output isn't
self-explanatory — paste the relevant chunk and name the file it's pointing at.
````

---

# Public thread replies

Templates A–F answer people who have already found the repo. These answer people who have not —
HN, Reddit, X — where the reply is read by hundreds who will never comment, and an overclaim is
permanent. Same rule as above: every number here is measured, and the honest caveat ships with
the number rather than after someone finds it.

Figures below are gate-reported and re-checkable with `python scripts/build_release.py --dry-run`.

---

## Template G: "How is this different from <other skill pack>?"

````text
Mainly the loading model. Most packs are one large file you load in full. This one
loads a 2,088-token registry that does nothing but route, then pulls in the single
skill your request matched — measured 5,794–7,394 tokens all-in, including that
skill's shared core dependencies. Reference depth sits behind that and is only read
when the skill file points at it for your specific task.

That is enforced rather than intended: a gate fails the build if any skill exceeds
3,000 tokens on its own or 8,000 with its dependencies, so the budget can't quietly
rot as content gets added.

The other difference is that the quality claims are machine-checked — 59 constraints
(17 AST checks through the TypeScript compiler API, 42 regex) across 11 release-blocking
gates. If a gate fails, no archive is produced.

Whether that's better for you depends on your host. Real lazy loading needs an agent
that can open a file mid-conversation, and Claude Code is the only one that genuinely
does. Elsewhere it degrades to retrieval or pasting — the routing and the constraints
survive, the on-demand depth doesn't. Full per-host matrix is in
docs/AGENT_COMPATIBILITY.md.
````

---

## Template H: "Why would I trust AI-generated code?"

````text
You shouldn't, and the pack doesn't ask you to. It is a constraint system, not a
quality guarantee.

What's actually verified on every release: gold examples compile under `tsc --noEmit`
with strict and noImplicitAny; 17 semantic constraints run over the AST; 42 regex
constraints run over the source; the showcase demo gets a real `next build` against
its actually-installed dependencies. Eleven gates, all release-blocking — a failure
means no archive gets built at all.

What is not verified, stated plainly because you'd find it anyway: the suite runs
against hand-written stubs, not the real peer libraries — the pack installs none of
them. So it proves the examples mount, expose the roles and labels they claim, respond
to interaction and survive axe; it does not prove they work against the real `three` or
`react-hook-form`. That limit is written into docs/ARCHITECTURE.md rather than left for
you to discover.

An agent telling you code "passes A11Y-01" without running anything is a claim, not a
result. Run the gates yourself if enforcement matters to you.
````

---

## Template I: "Does this work with Cursor / <my agent>?"

````text
Yes for Cursor, with one caveat worth knowing up front.

Install: run `setup.sh` (or `setup.ps1` on Windows) from the repo — it detects Cursor
from `.cursor/` and drops in `.cursor/rules/frontend-design-pro.mdc`. It won't
overwrite an existing file without `--force`. Manual steps and troubleshooting are in
docs/CURSOR_SETUP.md.

The caveat: Cursor does lazy loading only partially — you get full reference depth if
you `@`-reference the file you want, but it won't reach for one on its own the way
Claude Code does. Routing and the anti-slop rules work regardless.

Adapters also exist for Copilot, Windsurf, Continue.dev, Aider, Claude, ChatGPT,
Gemini and Codex CLI, under `install/`. Four of those (Windsurf, Continue, Aider,
Codex CLI) follow each host's documented rules format but are not in the tested
matrix, and are marked untested wherever they're mentioned — docs/AGENT_COMPATIBILITY.md
is the honest version, and I'd rather you trust that than this comment.
````

---

## Template J: "Is this free? What's the catch?"

````text
MIT licensed, and that's the whole story — the repo and the `.skill` archive attached
to each release are both free. There's no paid tier, no account, no telemetry in the
pack.

The only thing it costs you is whatever your agent already charges for tokens, and the
loading model is built to keep that small: ~2,000 tokens to route, ~5k for a typical
request rather than pulling the entire pack into context.
````

---

## Template K: "Link?" / one-line reply

````text
https://github.com/Krishna-Modi12/frontend-design-pro — MIT, and the README's claims are the ones the gate chain actually checks.
````
