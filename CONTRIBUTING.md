# Contributing

Thanks for looking. This repo has an unusually high bar for merging, and almost
all of it is mechanical — the gate chain will tell you exactly what is wrong. This
document exists so you find that out before you write the patch rather than after.

## What this repo is

`frontend-design-pro` is a **skill pack for AI agents**, not an application. The
deliverable is a `.skill` archive — markdown plus TypeScript examples — that a host
agent unzips and reads. Nothing here "runs" in the usual sense except
`demo/showcase/`.

The project's whole claim is that it is **verified rather than asserted**: every
number in the docs is derived from a green gate chain, and every example is
machine-checked against 61 constraints.

That produces the one rule everything else follows from:

> **When a change and a gate disagree, the gate is right. If a change requires
> relaxing a gate to land, the change is wrong.**

If you believe a gate is genuinely wrong, say so in the PR and leave it failing.
An argued red build is welcome. A green build bought by weakening a check is not.

## Setup

```bash
npm install
git config core.hooksPath .githooks   # per-clone, cannot be committed — see "Git" below
```

Python 3 is required for the gate chain. No virtualenv is needed; the scripts use
only the standard library.

## The one command

```bash
npm run gates
```

That is `python scripts/build_release.py --dry-run` — the full chain, building
nothing. **If it is green, your change is mergeable.** Run it before you open a PR
and paste the tail into the description.

It takes about two minutes. Narrower checks while you iterate:

```bash
npm test             # 229 tests across 45 files, ~23s
npm run typecheck    # tsc --noEmit strict over every example
npm run constraints  # the 44 regex constraints over skills/
npm run figures      # every documented count and token figure vs. the filesystem
npm run evals        # 22 eval cases
npm run regression   # 16 parser-vs-regex divergence cases
```

Single file, fastest loop of all:

```bash
node scripts/parser_constraints.js skills/<id>/examples/good-x.tsx   # 17 AST constraints
python scripts/test_constraints.py skills/<id>/examples/good-x.tsx   # 44 regex constraints
```

## Things that will surprise you

### Examples are fixtures, not illustrations

`skills/*/examples/good-*.tsx` are the files the constraint suites run against.
They must pass all 61 checks (17 AST via the TypeScript compiler API + 44 regex).
`bad-*.tsx` are deliberate anti-examples that **must fail** — the suite asserts
both directions, so "fixing" a `bad-*.tsx` breaks the build.

Model new golds closely on an existing one;
`skills/landing-pages/examples/good-landing.tsx` is the fullest. The recurring
requirements: OKLCH only (no raw hex, no `[#...]`), `min-h-[100dvh]` never
`min-h-screen`, a declared font — never Inter/Roboto/Poppins as the display face —
all four states with no `setTimeout` fake loader, a working `useReducedMotion`,
ease-out for entrances, a skip link on anything with `<nav>`/`<header>`, 44px touch
targets, organic data values, an exported `*Props` interface that is actually used
as a type, and `…` rather than `...`.

Every `good-*.tsx` needs a 1:1 `good-*.test.tsx`, and both must compile strict.

### Don't hand-edit numbers in the docs

Counts and token figures hardcoded across ~30 documents going stale silently is the
single most repeated defect in this project's history; several releases exist only
to correct it. `scripts/check_figures.py` now recomputes every figure from the
filesystem and fails the build on any document that disagrees.

So: change the code, run `npm run figures`, and fix what it names. Do not update a
figure because you think it moved — and do not argue with the gate before running
it.

It also checks that stated deltas subtract: `A → B … C tokens` where `B - A ≠ C` is
the shape that kept slipping through when a substitution moved an endpoint and left
the delta behind.

**Leave `docs/CHANGELOG.md` history and `docs/RELEASE_NOTES-*` alone.** They were
accurate when cut; rewriting them falsifies the record, and the gate exempts them
for exactly that reason.

### No gate renders anything

Every gate reads source. None starts a browser. A stylesheet that silently did
nothing, a resolver typed as `any`, a page that scrolled 73px sideways at 390px and
a chart hidden from screen readers but still in the tab order all passed a fully
green chain.

If you touch anything under `demo/`, run the renderer-level checks. They need a
browser and real vendor libraries, so they live in `tools/screenshots/` with their
own `package.json` and are not in CI:

```bash
npm run demos:verify     # page + console errors · hydration · axe WCAG 2.1 AA · overflow
npm run demos:typecheck  # against REAL vendor typings, not demo/_stubs.d.ts
npm run screenshots      # regenerate every image README.md links
```

### Version bumps are not yours to make

Releases are cut by the maintainer. A version bump touches `metadata.json`, a new
top header in `docs/CHANGELOG.md`, and the `version:` line in **every**
`skills/*/SKILL.md` — and the pre-flight gate fails on any of them being out of
step. Open your PR against the current version and leave it alone.

Relatedly, the pre-flight **version-leak scan** fails if the current version string
appears in any file outside a small allowlist. A branch name containing the version
counts as a leak too.

## Adding a skill

Six requirements, each enforced by a different gate:

1. **Frontmatter** declaring `name` and `description`, plus `metadata.version` and `metadata.core-deps` nested under `metadata:` — where
   `version` exactly equals `metadata.json`'s current version.
2. **A registry row** in the root `SKILL.md`, in this exact shape. The parser
   requires the deps cell to hold *exactly one* backticked `core/*.md`; two deps
   there means the row is not parsed and the skill silently becomes an orphan:
   ``| `id` | `skills/id/SKILL.md` | keywords | `core/one-dep.md` |``
   (The skill's own YAML `metadata.core-deps:` may still list several.)
3. **At least one `*.tsx` in `skills/{id}/examples/`.** A markdown-only examples
   directory fails.
4. **A 1:1 test for every gold**, both compiling strict.
5. **Every `references/*.md` cited** in that skill's Reference Index. A reference
   nothing routes to can never be loaded, so it ships as dead weight.
6. **A `## Contents` index in every `references/*.md` over 300 lines**, with every
   anchor resolving. Anthropic's skill-creator asks for it, and an unindexed
   1,400-line file forces an agent to read all of it to find one section.

Copy `_stubs.d.ts` and `_r3f-jsx.d.ts` into a new `examples/` directory from any
existing skill. `python scripts/scaffold.py <intent>` generates boilerplate.

**Before proposing a new skill, read `docs/MAINTENANCE.md`.** It holds a feature
freeze with explicit lift thresholds, and new skills, references, examples and
constraints are the named category it restricts. The default answer to "should we
build X" is *not yet*, and the burden is on evidence.

## Git

Two concurrent agent sessions against one working directory caused three bad
releases here. The whole story is in `docs/MAINTENANCE.md` § "Unattended writers".
What binds you:

- **Never `git add -A`.** Stage explicit paths.
- `.githooks/pre-commit` blocks any commit adding **5 or more new files** and prints
  the list. It fires for everyone, deliberately. If every listed path really is
  yours, override with `FDP_ALLOW_CONCURRENT=1 git commit …`.
- `git fetch` and check `git log --oneline -1` before every commit and push.

## Opening the PR

- One concern per PR. A gate fix and a content change in the same branch makes both
  harder to judge.
- Paste the tail of a green `npm run gates` into the description.
- If you changed anything under `demo/`, say which renderer checks you ran.
- If a gate is failing and you think it is the gate's fault, leave it red and make
  the argument.

CI re-runs the whole chain on a clean Linux runner. **Published figures are LF
measurements** — the git index is LF (`.gitattributes` is `eol=lf`), and that is
what CI and the archive see. Both the build gate and the figure gate LF-normalise
their token counts, so local numbers match CI even when an editor has left a file
you touched with CRLF endings.

## Reporting things

- **Bugs and ideas** — open an issue.
- **Security** — do not open a public issue. See [SECURITY.md](SECURITY.md).

## Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
