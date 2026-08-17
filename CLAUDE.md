# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`frontend-design-pro` is a **skill pack for AI agents**, not an application. The deliverable is a `.skill` archive (a zip of markdown + TypeScript examples) that a host agent unzips and reads. Nothing here "runs" in the usual sense except `demo/showcase/`.

The product's entire claim is that it is **verified rather than asserted**: every number in the docs is derived from a green gate chain, and every example is machine-checked against 60 constraints. When a change and a gate disagree, the gate is right. If a change requires relaxing a gate to land, the change is wrong.

Because of that claim, the standing posture here is **judge before building**. Read [`docs/REVIEW_PROTOCOL.md`](docs/REVIEW_PROTOCOL.md) at the start of a session: it carries the five-minute spot check, the list of things no gate can see, and the severity ladder. Every release this project has had to correct was corrected for prose, not for code.

## Commands

```bash
npm run gates        # python scripts/build_release.py --dry-run  — all 11 gates, builds nothing. THE check.
npm run build        # full gated release: gates + archive + smoke test + release notes
npm run typecheck    # Gate 3 only — tsc --noEmit strict over every example
npm run constraints  # Gate 5 only — 43 regex constraints over skills/
npm run figures      # Gate 11 only — every documented count/token figure vs the filesystem
npm run figures:test # proof that Gate 11's patterns read the prose forms people write
npm run evals        # 22 eval cases, self-test
npm run regression   # 13 synthetic parser-vs-regex divergence cases
npm test             # Gate 7's runtime half — 45 files, 232 tests, ~35s
```

Renderer-level checks, for when you touch anything under `demo/`. These need a
browser and real vendor libraries, so they live in `tools/screenshots/` (its own
package.json, absent from the archive manifest) and are **not** in CI:

```bash
npm run demos:verify     # page errors · console errors · hydration · axe WCAG 2.1 AA
                         # · overflow at 390/768/1920 — dev AND production, both schemes
npm run demos:typecheck  # the demos against REAL vendor typings, not demo/_stubs.d.ts
npm run screenshots      # regenerate every image README.md links
```

Single-file checks while iterating on an example (much faster than the full chain):

```bash
node scripts/parser_constraints.js skills/<id>/examples/good-x.tsx   # 17 AST constraints, one file
python scripts/test_constraints.py skills/<id>/examples/good-x.tsx   # 43 regex constraints, one file
python scripts/test_constraints.py --dir <path> --component          # consumer mode: drops the 8 page-scoped rules
python scripts/build_release.py --bump-patch                          # patch bump + gates + build
```

**`npm test` (vitest) runs and must stay green** — Gate 7 runs it, so a red suite blocks the build. The examples' ~25 peer libraries are still not installed; `test/stubs/` supplies one runtime module per specifier and `vitest.config.ts` aliases them.

Three rules from `test/stubs/README.md`, because each was learned from a silent failure:

- **One file per specifier.** A module has one `default` export (`gsap` and `@splinetool/react-spline` both want it), a namespace import reads every name in the file (`import * as z from 'zod'`), and `vi.mock` keys on the *resolved* path — so aliasing three specifiers to one file makes their mocks collide.
- **Never return a bare `new Proxy({}, { get })` from a `vi.mock` factory.** The trap answers `then`, so `await factory()` treats it as a thenable, calls it, and never settles. The module never loads and the worker is killed — reported as `Error: Worker exited unexpectedly`, which reads like memory pressure and is not.
- **If a stub takes an ARIA role, it owns that role's name.** `role="dialog"` without `aria-labelledby` is an axe violation the real Radix component does not have, and emitting one fails a gold for a defect that exists only in the stub.

`docs/TESTING.md` carries the per-file history and what the suite does and does not prove.

`scripts/build_release.py` is the **only supported way** to produce an archive. Do not zip by hand.

## No gate renders anything

Every gate reads source. None of them starts a browser, and the gap is not
theoretical — a stylesheet that silently did nothing, a resolver typed as `any`,
a page that scrolled 73px sideways at 390px and a chart hidden from screen
readers but still in the tab order all passed a green 9/9 chain. `npm run
demos:verify` is what catches that class, and it is the check to run when a demo
changes.

The same blindness applies to `demo/_stubs.d.ts`. Its job is to type OUR code
without vendoring libraries, but a stub loose enough to accept anything makes the
gate that uses it decorative: `z.infer` once resolved to `any`, which forced a
hand-written duplicate of a zod schema's output type, which then drifted from it.
When a stub covers a seam where two things have to agree — a schema and a form, a
resolver and its values — model the relationship. `demo/auth-form/lib/validation.contract.ts`
asserts the result at compile time, `IsAny` tripwire included.

## Architecture: registry + lazy loading

A monolithic pack of ~344k tokens cannot be loaded at all, so the pack is not a document — it is a **registry that routes**.

| Tier | Loaded |
|---|---|
| `SKILL.md` (root) | **Always.** Identity, anti-slop wall, the routing table, loading protocol. |
| `core/*.md` (8 files) | The 3–4 a matched skill declares in its frontmatter `core-deps`. |
| `skills/{id}/SKILL.md` | Exactly one per request, chosen by trigger-keyword match. |
| `skills/{id}/references/*.md` | Only when the skill file's own Reference Index points at one. |

A request loads roughly 5,961–7,525 tokens against ~349k of available depth. **Gate 8a hard-fails the build** if any skill exceeds 3,000 tokens alone or 8,000 with deps, so the budget is not advisory. Token count is `file size in bytes ÷ 4`.

`AGENT_SYSTEM_PROMPT.md` is an optional drop-in system prompt scored by the Pipeline gate (`scripts/test_v12_pipeline.py`) — it checks stage markers, architecture claims, and that every path it cites resolves. Edit it only with that gate in mind.

## Adding or changing a skill — the contract

Five requirements, each enforced by a different gate. Missing any one fails the build:

1. **Frontmatter** must declare `name`, `description`, `version`, `core-deps`, and `version` must **exactly equal `metadata.json`'s version** (Gate 2). A new skill declares the *current* version, not the version you plan to release under.
2. **A registry row** in the root `SKILL.md`, matching this shape exactly — the parser regex requires the deps cell to hold **exactly one** backticked `core/*.md`. Two deps in that cell means the row is not parsed and the skill silently becomes an orphan:
   `| `id` | `skills/id/SKILL.md` | keywords | `core/one-dep.md` |`
   (The skill's own YAML `core-deps:` may still list several.)
3. **`skills/{id}/examples/` must contain at least one `*.tsx`** (Gate 8b). A markdown-only examples directory fails.
4. **Every `good-*.tsx` needs a 1:1 `good-*.test.tsx`** (Gate 7), and both must compile strict.
5. **Every `references/*.md` must be cited** in that skill's Reference Index, or path integrity warns about an orphan — a reference nothing routes to can never be loaded, so it ships as dead weight.

Copy `_stubs.d.ts` and `_r3f-jsx.d.ts` into a new `examples/` directory from any existing skill.

`python scripts/scaffold.py <intent>` generates differentiated component boilerplate by intent type.

## The rules no gate reads

The 60 constraints check code. **Each skill's own "Core Rules" section is checked
by nothing**, and one of them was contradicted by the very example the skill
names first: `data-tables` rule 5 says filters, sort and page live in the URL,
and `good-data-table.tsx` held all three in `useState` for its whole life while
passing 42/42 and 17/17. That matters more than a stale figure, because
`CLAUDE.md` tells you to write new golds by modelling closely on an existing
one — so the gold is the thing that actually propagates. It is fixed and has
three tests asserting the rule, but nothing stops the next one drifting.

**When you add or edit a Core Rule, read the skill's golds against it.** A rule
demonstrated wrong is worse than a rule not written down: the prose gets skimmed,
the example gets copied.

**The always-loaded wall was enforced by nothing for half its contents.** The ban
list in `SKILL.md` names four placeholder brand names — Acme, Cloudly, SmartFlow,
Nexus — and no constraint read them, so two gold examples shipped "Acme Inc." and
`skills/platform/references/email-templates.md` taught it seventeen times, in a
worked example built to be copied. `SLOP-05` reads them now; `SLOP-01` picked up
`user123` and `$99.99`, which the wall names in the same breath as John Doe.
Still unenforced from that same line, and worth a manual look: equal-height card
grids, gradient fills on large headings, custom cursors, `<div>`-built fake
screenshots, and numbered `01/02/03` markers on content that is not a sequence.
**Before widening a rule to a reference file, note that the suites read
`.tsx/.ts/.js/.jsx/.html` only** — 349,467 tokens of markdown depth is outside
every content check except Gate 10's 19 ban-shaped fragments.

## Examples are gate-bearing artifacts

`skills/*/examples/good-*.tsx` are not illustrations — they are the fixtures the constraint suites run against, and they must pass all 60 checks (17 AST via the TypeScript compiler API + 43 regex). `bad-*.tsx` are deliberate anti-examples that **must fail**; the suite asserts both directions.

Write new golds by modelling closely on an existing one (`skills/landing-pages/examples/good-landing.tsx` is the fullest). The recurring requirements: OKLCH only (no raw hex, no `[#...]`), `min-h-[100dvh]` never `min-h-screen`, a declared font (`Manrope`/system stack — never Inter/Roboto/Poppins as the display face), all four states with no `setTimeout` fake loader, a functional `useReducedMotion`, ease-out for entrances, a skip link on anything with `<nav>`/`<header>`, 44px touch targets, organic data values, an exported `*Props` interface that is actually *used* as a type, and `…` not `...`.

`demo/showcase/` is the exception to everything above: a real, installed Next.js app verified by Gate 9 running `next build` against actual vendor typings. `demo/tsconfig.json` deliberately excludes it from the stub-typed regime.

## Traps that will fail your build

- **Version-leak scan.** Pre-flight fails if the *current* version string appears in any file outside an allowlist: `metadata.json`, `README.md`, `package.json`, `docs/CHANGELOG.md`, anything under `skills/`, `.github/workflows/`, `demo/showcase/`, and any `RELEASE_NOTES-*`. **This file is not on that list** — never write the current version literal into `CLAUDE.md`, `docs/MAINTENANCE.md`, or any other doc. A *branch name* containing the version counts as a leak too.
- **Version bumps touch five places**, and this entry said *three* through the two releases that were burned by the fourth and fifth. Gates 1–2 fail on any being out of step: `metadata.json`, a new top `## [x.y.z]` header in `docs/CHANGELOG.md`, the `version:` line in **every** `skills/*/SKILL.md`, `.claude-plugin/plugin.json`, and the `## What's new in vX` heading in `README.md`. `--bump-patch` writes the first four and deliberately leaves the README heading alone — a stub there would put a new version above the previous release's prose, which reads as current and is a worse lie than a stale heading. It prints what it did not do; read that line. **Only Stage 6 checks the README heading, and Stage 6 does not run under `--dry-run`**, so an 11/11 dry run cannot catch this one.
- **Published figures are LF/git-index measurements**, not Windows working-tree ones. A CRLF checkout measures marginally higher, so `build_release.py` run locally on Windows prints larger numbers than the canonical ones. Do not "correct" the docs back to a local Windows reading.
- **Documented figures are gated now — run `npm run figures` before you argue with it.** Counts and token figures hardcoded across ~30 documents going stale silently was the single most repeated defect in this repo's history, and several releases exist only to correct it. Gate 11 (`scripts/check_figures.py`) recomputes every figure from the filesystem and fails the build on any document that disagrees, so a count change no longer depends on remembering the sweep list. It also checks that stated deltas subtract correctly — `A → B … C tokens` where `B - A ≠ C` is the shape that kept slipping through, when a blanket substitution moved an endpoint and left the delta behind. (Writing that example with real numbers fails the gate, which is the gate working.) It reads **across hard wraps** — prose here is wrapped at ~80 characters, and a line-by-line scan cannot see `35 regex` / `constraints` split over the fold, which is how a *public* triage document sat seven wrong while the gate called it clean. It also catches gate counts **spelled as words**. What it still cannot see: anything in a document outside `SCAN`, and spelled-out counts for nouns other than gates — a deliberate omission, since "when two skills match" and "adding two skills cost 103 tokens" mean subsets, not the corpus, and a gate that shouts about those gets muted. **A figure it cannot see is worse than one it gets wrong, because a green run reads as proof.** That has now happened three times, and the third time all three tracked launch documents held a superseded router size while the gate reported 0 drift. `scripts/figure_pattern_test.py` (`npm run figures:test`) is what holds the patterns to the prose forms people actually write — 59 prose fixtures over 10 figures, asserting in both directions, blocking in the chain. **Extend it in the same commit as any pattern change**, and keep the negative cases: a widening that flags a correct file is a regression wearing a fix's clothes, and one of these fixtures exists because the registry anchor briefly read the *per-skill* router range out of `skills/{id}/SKILL.md`.

- **The constraint roster is checked against the suites now, and `--self-test` is not where that check lives.** `core/validate-checklist.md` is the list an agent is told to self-check against, and it is maintained by hand. It drifted twice: a `## Regex-enforced (N)` heading six short of the real count, then — in the commit that fixed *that* — a corrected heading above a roster still ending one ID early, and a closing `**Total:**` line still carrying the previous release's numbers in a prose shape ("machine-enforced", not "constraints") no figure pattern matches. `roster_check()` in `test_constraints.py` compares the listed IDs and all four numbers in that Total line against `CONSTRAINTS` and `PARSER_CHECK_IDS`, and runs on **every** invocation rather than under `--self-test`, because `test_constraints.py --self-test` is not in the release chain. Only IDs above `## Self-checks` are compared; `BEHAV-01`–`04` are correctly listed there and enforced by nothing.

- **A waived constraint prints its waiver on every run.** `GRANDFATHERED` in `test_constraints.py` carries `demo/showcase` → `SLOP-05`, because the showcase is named Nexus and the rename is deferred for the reason written in its own README (sixteen files including `package-lock.json`, plus a screenshot only the out-of-CI browser harness can regenerate). The waiver is echoed with its reason in the summary line so it cannot quietly become permanent. Delete the entry with the rename.

**Blind spots still open, each found with a stale figure sitting in it, so check these by hand after any sweep:** a figure written `N files` rather than `N references` is unmatched (widening it to `files` would catch "20 knowledge files per GPT" on the same row, which is why it was not); the `REFERENCES` forbid reads a 50-character window backwards and so misfires on a *table row* whose preceding cell ends in a backticked path, suppressing a real corpus claim; the per-skill budget table in `docs/ARCHITECTURE.md` lists values one per line, which no range pattern can read (`RANGE` now matches `A to B` as well as a dashed pair, but not a column); `DEPTH`'s trailing `(?![\d,])` — there to avoid biting into a longer number — also drops any depth figure a sentence happens to follow with a comma; and the `k`-rounded depth figure is now gated by `DEPTH-K` **only where the noun says so** — "references" or "depth" resolves to `reference_depth_tokens`; "a monolithic pack of ~Nk tokens" is deliberately left unclaimed, because nothing computes a whole-pack total and a pattern that grabbed it would fail `README.md` for telling the truth. Two negative fixtures hold that line. This entry previously said the whole family was ungateable; that was true of the family and false of six of its members, one of which was `AGENT_SYSTEM_PROMPT.md`. **The constraint split had one readable form and the corpus writes four** — `(P parser + R regex)` with no `AST`, `P semantic + R syntactic = T` with no brackets, and `(P AST via the TypeScript compiler API + R regex)` with a clause in the middle were all invisible, and twelve surfaces carried a stale half through the sweep that corrected everything the gate could read. All four are matched now, along with the halves counted as `checks` and the `**Syntactic (R regex)**` heading form. **Two further shapes were closed after they shipped stale on the front door itself**: a qualifier sitting between the digits and the noun (`N machine-checked constraints` — the README's opening sentence), and a **total stated immediately before its own split** (`N (P AST + R regex)`), where the split validated cleanly while contradicting the total printed beside it on the same line. Both had survived the sweep that corrected the checklist they were quoting, which is the recurring shape of this defect: the gate reads the source of a figure and not the sentence that repeats it. Deliberately still unclaimed: a **bare** `N checks`, because gate chains, evals and CI jobs all count checks and a pattern that grabbed those would shout on every one; the comma-separated split (`P AST …, R regex`) had one instance and was reworded to `+` instead of widened for. **Write shapes, not digits, when documenting a pattern** — the three examples above were first written with real numbers and the gate flagged this file, correctly. **Leave `docs/RELEASE_NOTES-*` and prior `CHANGELOG.md` entries alone** — they were accurate when cut, rewriting them falsifies the record, and the gate exempts them for that reason.

## Git discipline

Two concurrent agent sessions against this working directory caused three bad releases; the whole story is in `docs/MAINTENANCE.md` § "Unattended writers". Consequences that bind you:

- **Never `git add -A`.** Stage explicit paths.
- `.githooks/pre-commit` blocks any commit adding **5+ new files** and prints the list, so you cannot sweep another writer's work in by accident. It fires for the lock owner too — that is the point. Override with `FDP_ALLOW_CONCURRENT=1 git commit …` only after confirming every listed path is yours. Install with `git config core.hooksPath .githooks` (per-clone, cannot be committed).
- `git fetch` and check `git log --oneline -1` before every commit, tag and push.

Releases: tag must be annotated (`git tag -a`). Pushing a `v*` tag fires `.github/workflows/release.yml`, which re-runs all 11 gates on a clean runner and publishes a public GitHub Release with the archive attached — so the tag push is the irreversible step, not the commit.

## Policy

`docs/MAINTENANCE.md` holds a feature freeze with explicit lift thresholds (10 distinct enhancement requests, 5 confirmed bugs, or a date). It is currently **overridden by owner directive**, recorded in that file. The default answer to "should we build X" is still *no, not yet*, and the burden is on evidence — new skills, references, examples, constraints and gates are the named forbidden category during a freeze.

`install/` holds **consumer-facing adapters** (`.cursor/rules/*.mdc`, `copilot-instructions.md`, etc.) that ship inside the archive for other hosts. They are shipped artifacts, not rules governing development of this repo.
