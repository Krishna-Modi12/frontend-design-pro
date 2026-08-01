# Architecture

Every number on this page was read off a green `python scripts/build_release.py --dry-run`, not estimated.

## The problem this solves

A skill pack is competing with the user's own prompt for context. Load everything and you win the argument about comprehensiveness and lose the one that matters: a monolithic pack with 305k tokens of frontend knowledge cannot be loaded at all, and even a 50k-token subset leaves no room to work in a 32k window.

So the pack is not a document. It is a **registry that routes**.

## Registry + lazy loading

| Layer | What it holds | Cost | When loaded |
|---|---|---|---|
| `SKILL.md` | Identity, behavioural preamble, anti-slop wall, 16-row routing table, loading protocol, failure table | **1,837 tokens** | always |
| `core/*.md` | 8 shared primitives — tokens, a11y baseline, component API, agent behaviour, validation checklist, intake | **2,073, 2,149 or 2,241 tokens** | the 3–4 a matched skill declares |
| `skills/{id}/SKILL.md` | One skill router | **789–1,572 tokens** | exactly one per request |
| `skills/{id}/references/*.md` | 76 deep references | **305,784 tokens** | only when a skill file points at one for the task at hand |

Measured per-request totals, every skill, registry + skill + declared deps:

```
iconography        4,714   ← lightest
landing-pages      4,765
testing            4,775
ai-ui-generation   4,786
web-interface      4,803
data-tables        4,809
forms              4,865
react-performance  4,881
design-system      4,883
threejs-3d         4,975
animations         4,980
platform           5,028
react-components   5,030
component-patterns 5,137
agent-ops          5,176
design-principles  5,482   ← heaviest
```

**Ceiling is 5,482 tokens against 305,784 available.** Gate 8a fails the build if any skill exceeds 3,000 tokens alone or 8,000 with dependencies, so this cannot silently regress.

> **How these are measured.** Every token figure in this repo is `file size in bytes ÷ 4`, taken from the **LF/git-index** copy — which is what CI measures and what the `.skill` archive contains. A Windows working tree with CRLF endings measures marginally higher (`SKILL.md` reads 1,857 there, 1,837 here — exactly the 82 CRLF bytes), so `build_release.py` run locally on Windows will print the larger numbers. The LF figure is the canonical one, for the same reason the 305,784 depth total is: it is what a reader who downloads the archive can reproduce. Do not "correct" these back to a local Windows measurement.

The registry is the reason adding skills is cheap: it went from 11 skills to 16 while `SKILL.md` grew 353 tokens. Marginal cost of a skill is **~71 tokens** of always-loaded context, plus however much on-demand depth you give it.

### Core file splitting

Two core files were over budget and got split into a thin essential plus a deep reference:

| Essential | Deep companion |
|---|---|
| `core/component-api.md` (904) | `core/component-api-deep.md` (1,527) |
| `core/agent-behavior.md` (996) | `core/agent-behavior-patterns.md` (947) |

That split cut the per-request dependency load from **4,143 → 2,073–2,241 tokens** without losing any content — the depth simply stopped being mandatory.

## Repo layout

One layout. `src/` — the pre-registry v12 tree — has been removed; nothing reads from it and 55 of its 61 reference files were byte-identical duplicates of their `skills/` counterparts.

```
SKILL.md                 registry — copied to archive root
AGENT_SYSTEM_PROMPT.md   optional drop-in system prompt (registry-native)
core/                    8 shared primitives
skills/{id}/
  ├── SKILL.md           router: rules, patterns, reference index
  ├── references/        deep docs, loaded on demand
  └── examples/          good-*.tsx + good-*.test.tsx + bad-*.tsx + *.d.ts
scripts/                 gate chain + scaffold
evals/                   22 eval cases
rules/                   v12 envelope JSON schema
docs/                    this directory
dist/                    build output, gitignored
```

`build_release.py` copies `SKILL.md`, `AGENT_SYSTEM_PROMPT.md`, `README.md`, `LICENSE` to the archive root, `docs/CHANGELOG.md` to `_meta/CHANGELOG.md`, and `core/ skills/ scripts/ evals/ rules/ metadata.json` verbatim. The archive root folder is `frontend-design-pro/`, asserted before the zip is accepted.

## The gate chain

`scripts/build_release.py` is the only supported way to produce a `.skill`. Nine named gates, all blocking, plus four stages around them. Runtime ~2min (the ninth gate installs and builds a real Next.js app).

| # | Gate | Asserts | Current result |
|---|---|---|---|
| 1 | Pre-flight | `SKILL.md` ≤6,000 tokens · `metadata.json` version == top `docs/CHANGELOG.md` header · current version appears in no file outside the allowlist | 1,857 tokens; version consistent; no leaks |
| 2 | Frontmatter | every skill declares `name`/`description`/`version`/`core-deps`; version matches `metadata.json`; every declared dep exists on disk | 16/16 |
| 3 | Compile | `tsc --noEmit` strict + `noImplicitAny` over every example, plus the three stub-typed demo projects | 44/44 golds · 14/14 demo files |
| 4 | Semantic | 16 AST constraints via the TypeScript compiler API, on every gold and stub-typed demo file | 52/52 files × 16/16 |
| 5 | Syntactic | 35 regex constraints; golds must be clean **and** anti-examples must fail; stub-typed demos judged per-project | 35/35 · 3/3 demo projects |
| 6 | Pipeline | `AGENT_SYSTEM_PROMPT.md`: 6 stage markers · 5 architecture checks · every cited path resolves, no pre-registry prefixes, no bare reference filenames; the documented `[json]` envelope and the schema's own examples validate against `rules/v12-envelope.schema.json` | 16/16 |
| 7 | Evals + coverage | 22 eval cases self-test; every gold has a 1:1 `.test.tsx`; every test file compiles strict | 22/22 · 38/38 |
| 8 | Budget + registry | every skill ≤3,000 alone and ≤8,000 with deps; every registry row resolves and has examples | 16/16 |
| 9 | Showcase build | `demo/showcase/` — a real, installed Next.js 15 app, deliberately outside the stub-typed convention above — builds clean under `next build` against its actual vendor typings | clean |

Then, non-negotiable but not numbered: **path integrity** (75 skill-cited references resolve), **reference-depth audit**, **archive build reproducible per-platform** (CI produces a byte-identical archive for its own environment; a local build differs by ~400 bytes because `.gitattributes` normalises line endings to LF in the repo while Windows checkouts hold CRLF), and a **post-build smoke test** that unzips the archive and re-runs gates 3 and 4 against the extracted copy — deleting the archive if either fails.

A parser-regression proof runs alongside gate 4: 11 synthetic cases, each proving a semantic check catches something the regex it replaced could not.

### Why parser checks

Regex sees strings; the AST sees meaning. A comment reading `// aria-describedby` is not accessibility. `bg-white` on a `<button>` is not a design violation. A fake loading delay spelled `setPhase` instead of `setLoading` has no regex vocabulary at all.

`scripts/parser_regression_test.js` holds **11 synthetic divergence cases**, each a file where the AST check and the regex it replaced disagree — and the suite asserts both verdicts, so the improvement is proven in both directions:

| Case | Regex | Parser | Why the parser is right |
|---|---|---|---|
| `comment_aria.tsx` | pass | **fail** | `// aria-describedby` in a comment is not accessibility |
| `barrel_import.tsx` | pass | **fail** | a regex for `import` cannot tell a barrel from a module |
| `img_no_dims.tsx` | pass | **fail** | matching `<img` cannot check whether `width`/`height` are present |
| `boolean_and_ok.tsx` | **fail** | pass | `isOpen && <Panel/>` is idiomatic; only a numeric left side renders a literal `0` |
| `spread_not_copy.tsx` | **fail** | pass | `...props` is code, not UI copy — the AST scopes the rule to JSX text |

Note the bottom two: half the value is **removing false positives**. A blanket `...` ban flags every rest-spread in the pack; a blanket `&&` ban flags correct React. Constraints that cry wolf get switched off, so precision is a feature and not a nicety.

The two suites are complementary, not redundant — 16 semantic + 35 syntactic = **51 checks across 51 distinct IDs**. Every ID belongs to exactly one suite, so a bare ID in a report is unambiguous about which layer flagged it. Regex still owns what regex is good at: `TYP-01` a font is actually declared, `TOK-01` no hex in token definitions, `QUA-03` no lorem ipsum, `SLOP-01`/`SLOP-02` no placeholder names or AI-slop copy.

## Adding to the pack

**A new skill:**

1. `skills/new-skill/SKILL.md` with frontmatter (`name`, `description`, `version` matching `metadata.json`, `core-deps`)
2. References in `skills/new-skill/references/`, each cited in the skill's Reference Index — an uncited reference is flagged by the path-integrity stage
3. At least one example in `skills/new-skill/examples/` — Gate 8b fails a skill with none
4. One row in the `SKILL.md` registry table: id, path, trigger keywords, core dep
5. `npm run gates`

**A new gold example:** `skills/{id}/examples/good-*.tsx` **plus** a matching `good-*.test.tsx`. Gate 7 fails on any gold without a 1:1 test.

**A new semantic rule:** a check in `scripts/parser_constraints.js` **and** a divergence case in `scripts/parser_regression_test.js` proving it beats regex. Gate labels read their counts from the suites themselves, so `51` updates on its own.

**A version bump:** `metadata.json`, a new top section in `docs/CHANGELOG.md`, and the `version` field in all 16 skill files. Gates 1 and 2 fail on any of the three being out of step.

## Known gaps

Honest list, all verified against the current release.

1. **The vitest suite does not execute end-to-end.** Gold examples import ~25 peer libraries (`three`, `motion/react`, `react-hook-form`, `react-native`, `@playwright/test`, …) that exist only as ambient declarations in `_stubs.d.ts`. That is what makes strict compilation cheap, and it is also why `vitest run` cannot resolve them: 28 of 37 test files fail at import time. Registering `@testing-library/jest-dom` via `vitest.setup.ts` took the suite from 32 to **43 of 50 tests passing**; the rest need real dependencies. Gate 7 therefore asserts the enforceable contract — 1:1 coverage plus strict compilation — and says so. Closing this means either adding the peer dependencies or shipping runtime stubs.

2. **Reference depth is unevenly distributed.** `ai-ui-generation` has 1 reference (992 tokens); `design-system` has 14 (53,659) and `platform` 9 (62,015). The newest skills are routers with little behind them.

3. **`rules/v12-envelope.schema.json` and `scripts/test_v12_pipeline.py` are named for an architecture two majors old.** Renaming them would touch `ci.yml` and `build_release.py`; the names were left alone and the contents corrected instead. The schema *is* now referenced by a gate — Gate 6 validates the documented envelope and the schema's own examples against it.

### Recently closed

**`design-system/references/brand-design-systems.md` was orphaned** — present on disk, absent from its skill's Reference Index, so nothing could route to it. A citation was added; 76/76 references now resolve with none orphaned.

**`AGENT_SYSTEM_PROMPT.md` was pre-registry** — 28 of the 31 paths it cited did not exist, and it had no concept of the registry. Rewritten. The lesson is worth keeping: **Gate 6 had been guarding it the whole time by checking that its section headings were present**, which they were. Structural checks do not catch semantic rot. Gate 6 now resolves every path the prompt cites, rejects pre-registry `references/` and `_meta/` prefixes, and rejects bare reference filenames — and that check was verified to *fail* against the old file before it was trusted.
