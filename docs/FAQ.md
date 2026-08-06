# FAQ

> Answers here are grounded in the repo's current state — check `metadata.json`'s `version` field if an exact release number matters for your question. If you hit something not covered, open an issue — real questions from real users will get added here.

## Q: Which agent has the best support?

A: There's no ranked "best" — see [`AGENT_COMPATIBILITY.md`](AGENT_COMPATIBILITY.md) for the full matrix across all eight host surfaces (Claude Code, Claude Desktop, Claude.ai, Cursor, ChatGPT, OpenAI API, Copilot, Gemini). The one fact that actually separates them, per that doc: *can the agent decide, mid-conversation, to open one specific file it wasn't given up front?*

**Claude Code is the only host with a real filesystem for that**, so it's the only one with true lazy loading — `SKILL.md`, the one matched skill, and its declared `core/*.md` deps load automatically per request (~4,935–6,235 tokens), leaving the other 320,865 tokens of reference depth untouched until the routing table points at something.

Everywhere else, that degrades — not uniformly, and not to zero:

- Claude Desktop and ChatGPT fall back to retrieval search rather than opening a named path.
- Claude.ai gets no reference depth without a project (you'd paste it in), and whatever retrieval surfaces with one.
- Cursor is "Partial" — it can read workspace files, but nothing decides what to open, so it often paraphrases a reference instead of reading it; you get full depth only if you explicitly `@`-reference the file.
- Copilot's instructions file is always-on with no loader; its reference depth is limited to whatever you've pasted into that file.
- OpenAI API and Gemini reach genuine per-request loading only if *you* build the tool-call/function-calling loop — there's no built-in skills feature on either raw API. ChatGPT's Custom GPT knowledge cap (20 files for the GPT's lifetime) means you're pre-selecting a subset of the 86 references before the conversation even starts.

What travels everywhere regardless of host: routing (in a "prompted" form off the main host) and the anti-slop wall, because both live in the small, always-loaded `SKILL.md`. What doesn't travel well is on-demand depth. Read the full table and the "Reading the table" notes in `AGENT_COMPATIBILITY.md` before picking a host if reference depth matters for your use case.

## Q: Can I use this without a system prompt?

A: Yes. `SKILL.md` carries the identity, behavioural preamble, anti-slop wall, the 17-row routing table and failure handling — it's a complete, self-contained registry at 1,895 tokens, and no system-prompt setup is required to use it (`README.md`, [`INSTALL.md`](INSTALL.md)).

`AGENT_SYSTEM_PROMPT.md` is optional. If your host happens to have a system-prompt field, pasting it in makes the loading protocol, the intake trigger, the per-pass core-file citations and the validation contract *explicit* rather than implicit — it's a registry-native drop-in, not a second copy of the pack's content. It's version-free, and every path it cites is checked by Gate 6 on every build, so it can't quietly go stale the way the pre-registry version did (see [`ARCHITECTURE.md`](ARCHITECTURE.md)'s "Known gaps" → "Recently closed" note — 28 of 31 cited paths didn't exist before that file was rewritten).

## Q: Why is there a feature freeze / no v14.3.0 yet?

A: Because the pack considers itself functionally done — 17 skills, 86 references, 320,865 tokens of on-demand depth, 53 machine-enforced constraints, 9 release-blocking gates, one runnable demo app — and at that point the biggest remaining risk is churn, not missing features ([`MAINTENANCE.md`](MAINTENANCE.md)). The freeze took effect with the release that introduced [`MAINTENANCE.md`](MAINTENANCE.md) — check that file's own note and the top entry of [`CHANGELOG.md`](CHANGELOG.md) for exactly which one, since a patch may have shipped since this was written — and covers everything after it: only typo fixes, broken-link fixes, and fixes for *reported* bugs (gate chain still green) are permitted. No refactors in passing, no unprompted dependency bumps, no rewording the anti-slop wall because a better phrasing occurred to someone.

The freeze lifts on any **one** of three documented, evidence-based triggers, quoted from `MAINTENANCE.md`:

| Trigger | Threshold |
|---|---|
| Users asking for the same specific thing | 10 distinct requests for one feature |
| Real defects reported from real use | 5 confirmed bugs |
| Time with the project actually being watched | 2 weeks of active monitoring from the freeze release |

Worth being precise about timing, since this doc is being written before any public launch: [`METRICS_BASELINE.md`](METRICS_BASELINE.md)'s pre-launch snapshot records 0 stars, 0 forks, 0 open issues, 0 open PRs, 0 release downloads. So the freeze isn't a response to feedback — it's a deliberate choice to launch already stable rather than launch and immediately start accumulating scope creep the moment real feedback shows up. None of the three triggers above have fired yet, because there is no public audience yet for them to fire from. There's no v14.3.0 because, as of this writing, nothing has told the maintainer there should be one — check `CHANGELOG.md`'s top entry for the current, real status whenever you're reading this.

## Q: The showcase demo won't build / `npm run dev` fails — what do I do?

A: Two environment-specific issues are already known and solved — check both before opening anything:

1. **Node 25+ and `localStorage` during SSR.** Very recent Node versions ship an experimental global `localStorage` by default, and the showcase's dev server can throw `TypeError: localStorage.getItem is not a function` during server-side rendering because of it — a Node runtime quirk, not a bug in the app's code (`demo/showcase/README.md`). Fix:

   ```bash
   NODE_OPTIONS="--no-experimental-webstorage" npm run dev
   ```

2. **Tailwind version.** `demo/showcase/package.json` pins `tailwindcss` and `@tailwindcss/postcss` to an exact `4.3.3` — not a caret range — so a plain `npm install` on a fresh clone resolves that exact, known-good build. If you've loosened that pin locally, or a lockfile resolved something else, re-pin both packages to `4.3.3` and reinstall before filing anything.

Beyond those two, the standard loop is:

```bash
cd demo/showcase
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # isolate a type error from a runtime one
```

This is the one demo in the repo that's actually installed and run (see the next question), and it's covered by a dedicated CI job on a clean runner plus Gate 9 in `scripts/build_release.py` — so a failure here on an otherwise-clean checkout is itself notable. If neither workaround above fixes it, that's exactly the kind of real bug report worth opening an issue for — include your Node and npm versions.

## Q: Can I add my own skill?

A: Yes — `ARCHITECTURE.md`'s "Adding to the pack" section is the exact, gate-checked recipe:

1. `skills/new-skill/SKILL.md` with frontmatter (`name`, `description`, `version` matching `metadata.json`, `core-deps`)
2. References in `skills/new-skill/references/`, each cited in that skill's Reference Index — an uncited reference gets flagged by the path-integrity stage (this is exactly how `brand-design-systems.md` was caught orphaned — see `CHANGELOG.md`'s v14.2.1 entry)
3. At least one example in `skills/new-skill/examples/` — Gate 8b fails a skill that ships with none
4. One new row in the `SKILL.md` registry table: id, path, trigger keywords, core dep
5. `npm run gates` — all 9 gates, must be green

Two related rules from the same doc, if your new skill also adds a gold example or a new kind of check: every `good-*.tsx` needs a matching `good-*.test.tsx` (Gate 7 fails a gold with no 1:1 test), and a genuinely new semantic rule needs both a check in `scripts/parser_constraints.js` and a divergence case in `scripts/parser_regression_test.js` proving it beats the regex it replaces.

One caveat regardless of the mechanics: the pack is currently under a feature freeze (see the previous question). A new skill is exactly the kind of change *not* on the permitted list during a freeze — typo, broken-link and reported-bug fixes only. The recipe above is real and works today for a fork or a local build; landing a new skill in this repo specifically needs the freeze to lift first (`MAINTENANCE.md`).

## Q: What's the difference between the stub-typed demos and `demo/showcase`?

A: `demo/landing-page/`, `demo/dashboard/` and `demo/auth-form/` are **stub-typed reference files** — `.tsx` files compiled only against the ambient `declare module` stubs in `demo/_stubs.d.ts`. They're never `npm install`ed and never run. `demo/validate.sh` type-checks them under `tsc --strict` and runs the same 17 AST + 36 regex constraint suites the gold examples get — but there's no real `package.json`, no real dependencies, and no dev server anywhere in that loop.

`demo/showcase/` is the opposite, deliberately: a real, standalone Next.js 15 + React 19 + Tailwind v4 project with its own `package.json`, real installed dependencies (`@react-three/fiber` + `@react-three/drei`, `react-hook-form` + `zod`), and a dev server that actually boots (`cd demo/showcase && npm install && npm run dev`). It's checked differently because it has to be: **Gate 9** in `scripts/build_release.py` runs `next build` against its real, installed vendor typings — not the ambient stubs; `demo/tsconfig.json` explicitly excludes `showcase` from that regime — and a dedicated CI job installs its dependencies on a clean runner and does the same. As of v14.2.1 it's also held to the same content rules as everything else: the 17 AST checks and 36 regex checks run over its nine authored `.tsx` files (vendored/generated trees like `node_modules/` and `.next/` are skipped, since those aren't authored code).

Short version: the three stub-typed demos prove the *code* type-checks and passes the content constraints; `demo/showcase` additionally proves the *app* actually installs, builds, and serves.
