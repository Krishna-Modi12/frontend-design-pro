# Architecture

Every number on this page was read off a green `python scripts/build_release.py --dry-run`, not estimated.

## The problem this solves

A skill pack is competing with the user's own prompt for context. Load everything and you win the argument about comprehensiveness and lose the one that matters: a monolithic pack with 320k tokens of frontend knowledge cannot be loaded at all, and even a 50k-token subset leaves no room to work in a 32k window.

So the pack is not a document. It is a **registry that routes**.

## Registry + lazy loading

| Layer | What it holds | Cost | When loaded |
|---|---|---|---|
| `SKILL.md` | Identity, behavioural preamble, anti-slop wall, 17-row routing table, loading protocol, failure table | **1,895 tokens** | always |
| `core/*.md` | 8 shared primitives — tokens, a11y baseline, component API, agent behaviour, validation checklist, intake | **2,236, 2,312 or 2,404 tokens** | the 3–4 a matched skill declares |
| `skills/{id}/SKILL.md` | One skill router | **789–1,572 tokens** | exactly one per request |
| `skills/{id}/references/*.md` | 86 deep references | **320,865 tokens** | only when a skill file points at one for the task at hand |

Measured per-request totals, every skill, registry + skill + declared deps:

```
iconography        4,935   ← lightest
landing-pages      4,986
testing            4,996
web-interface      5,024
data-tables        5,030
ai-ui-generation   5,043
forms              5,086
react-performance  5,102
design-system      5,134
threejs-3d         5,196
animations         5,235
platform           5,249
react-components   5,251
component-patterns 5,358
agent-ops          5,455
design-principles  5,703
design-research    6,235   ← heaviest
```

`design-research` is the heaviest only because it declares two core deps (`design-tokens` + `component-api`) where every other skill declares one; its own router is mid-pack at 1,200 tokens.

**Ceiling is 6,235 tokens against 320,865 available.** Gate 8a fails the build if any skill exceeds 3,000 tokens alone or 8,000 with dependencies, so this cannot silently regress.

> **How these are measured.** Every token figure in this repo is `file size in bytes ÷ 4`, taken from the **LF/git-index** copy — which is what CI measures and what the `.skill` archive contains. A Windows working tree with CRLF endings measures marginally higher (`SKILL.md` reads 1,915 there, 1,895 here — exactly the 83 CRLF bytes), so `build_release.py` run locally on Windows will print the larger numbers. The LF figure is the canonical one, for the same reason the 320,865 depth total is: it is what a reader who downloads the archive can reproduce. Do not "correct" these back to a local Windows measurement.

The registry is the reason adding skills is cheap: the 17th skill grew `SKILL.md` from 1,837 to 1,888 tokens. Marginal cost of a skill is **~51 tokens** of always-loaded context, plus however much on-demand depth you give it. (It reads 1,895 today; the extra 7 tokens went on disambiguating a trigger keyword, not on a skill.)

### Core file splitting

Two core files were over budget and got split into a thin essential plus a deep reference:

| Essential | Deep companion |
|---|---|
| `core/component-api.md` (904) | `core/component-api-deep.md` (1,527) |
| `core/agent-behavior.md` (996) | `core/agent-behavior-patterns.md` (947) |

That split cut the per-request dependency load from **4,143 → 2,236–2,404 tokens** without losing any content — the depth simply stopped being mandatory.

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
test/stubs/              runtime stubs for the examples' peer libs — test-only, never shipped
docs/                    this directory
dist/                    build output, gitignored
```

`build_release.py` copies `SKILL.md`, `AGENT_SYSTEM_PROMPT.md`, `README.md`, `LICENSE` to the archive root, `docs/CHANGELOG.md` to `_meta/CHANGELOG.md`, and `core/ skills/ scripts/ evals/ rules/ metadata.json` verbatim. The archive root folder is `frontend-design-pro/`, asserted before the zip is accepted.

## The gate chain

`scripts/build_release.py` is the only supported way to produce a `.skill`. Nine named gates, all blocking, plus four stages around them. Runtime ~2min (the ninth gate installs and builds a real Next.js app).

| # | Gate | Asserts | Current result |
|---|---|---|---|
| 1 | Pre-flight | `SKILL.md` ≤6,000 tokens · `metadata.json` version == top `docs/CHANGELOG.md` header · current version appears in no file outside the allowlist | 1,895 tokens; version consistent; no leaks |
| 2 | Frontmatter | every skill declares `name`/`description`/`version`/`core-deps`; version matches `metadata.json`; every declared dep exists on disk | 17/17 |
| 3 | Compile | `tsc --noEmit` strict + `noImplicitAny` over every example, plus the three stub-typed demo projects | 45/45 golds · 14/14 demo files |
| 4 | Semantic | 17 AST constraints via the TypeScript compiler API, on every gold and stub-typed demo file | 53/53 files × 17/17 |
| 5 | Syntactic | 36 regex constraints; golds must be clean **and** anti-examples must fail; stub-typed demos judged per-project | 36/36 · 3/3 demo projects |
| 6 | Pipeline | `AGENT_SYSTEM_PROMPT.md`: 6 stage markers · 5 architecture checks · every cited path resolves, no pre-registry prefixes, no bare reference filenames; the documented `[json]` envelope and the schema's own examples validate against `rules/v12-envelope.schema.json` | 16/16 |
| 7 | Evals + coverage | 22 eval cases self-test; every gold has a 1:1 `.test.tsx`; every test file compiles strict; **the suite runs and passes** | 22/22 · 39/39 files · 124/124 tests |
| 8 | Budget + registry | every skill ≤3,000 alone and ≤8,000 with deps; every registry row resolves and has examples | 17/17 |
| 9 | Showcase build | `demo/showcase/` — a real, installed Next.js 15 app, deliberately outside the stub-typed convention above — builds clean under `next build` against its actual vendor typings | clean |

Then, non-negotiable but not numbered: **path integrity** (87 skill-cited references resolve), **reference-depth audit**, a **release source guard**, **archive build reproducible per-platform** (CI produces a byte-identical archive for its own environment; a local build differs by ~400 bytes because `.gitattributes` normalises line endings to LF in the repo while Windows checkouts hold CRLF), and a **post-build smoke test** that unzips the archive and re-runs gates 3 and 4 against the extracted copy — deleting the archive if either fails.

The source guard fetches `origin` and refuses to build an archive unless `HEAD` is exactly `origin/main` with a clean working tree. It exists because a green chain does not prove the *source* was current: v14.4.2 was tagged from a commit that was never main's head, so the archive was a faithful product of stale source and passed every gate including the smoke test. The smoke test cannot catch that by construction — it verifies the archive against itself, and the archive was not the thing that was wrong. Only a real release build runs the guard; `--dry-run` is the CI contract and runs on branches where being behind main is normal.

The smoke test also reads the archive's prose: that the README's "What's new" heading names the version being shipped, that `_meta/CHANGELOG.md` tops out at it, and that every `demo/**/*.png` in the source reached the archive. The version-heading mismatch shipped twice before this check existed, and the screenshot expectation is derived from the source tree rather than hardcoded — a literal would be one more figure to go stale.

A parser-regression proof runs alongside gate 4: 13 synthetic cases, each proving a semantic check catches something the regex it replaced could not.

### Why parser checks

Regex sees strings; the AST sees meaning. A comment reading `// aria-describedby` is not accessibility. `bg-white` on a `<button>` is not a design violation. A fake loading delay spelled `setPhase` instead of `setLoading` has no regex vocabulary at all.

`scripts/parser_regression_test.js` holds **13 synthetic divergence cases**, each a file where the AST check and the regex it replaced disagree — and the suite asserts both verdicts, so the improvement is proven in both directions:

| Case | Regex | Parser | Why the parser is right |
|---|---|---|---|
| `comment_aria.tsx` | pass | **fail** | `// aria-describedby` in a comment is not accessibility |
| `barrel_import.tsx` | pass | **fail** | a regex for `import` cannot tell a barrel from a module |
| `img_no_dims.tsx` | pass | **fail** | matching `<img` cannot check whether `width`/`height` are present |
| `boolean_and_ok.tsx` | **fail** | pass | `isOpen && <Panel/>` is idiomatic; only a numeric left side renders a literal `0` |
| `spread_not_copy.tsx` | **fail** | pass | `...props` is code, not UI copy — the AST scopes the rule to JSX text |
| `scroll_throttled_ok.tsx` | **fail** | pass | a throttled scroll handler is correct code; only an un-batched `setState` inside one re-renders every frame |

Note the bottom two: half the value is **removing false positives**. A blanket `...` ban flags every rest-spread in the pack; a blanket `&&` ban flags correct React. Constraints that cry wolf get switched off, so precision is a feature and not a nicety.

The two suites are complementary, not redundant — 17 semantic + 36 syntactic = **53 checks across 53 distinct IDs**. Every ID belongs to exactly one suite, so a bare ID in a report is unambiguous about which layer flagged it. Regex still owns what regex is good at: `TYP-01` a font is actually declared, `TOK-01` no hex in token definitions, `QUA-03` no lorem ipsum, `SLOP-01`/`SLOP-02` no placeholder names or AI-slop copy.

## Adding to the pack

**A new skill:**

1. `skills/new-skill/SKILL.md` with frontmatter (`name`, `description`, `version` matching `metadata.json`, `core-deps`)
2. References in `skills/new-skill/references/`, each cited in the skill's Reference Index — an uncited reference is flagged by the path-integrity stage
3. At least one example in `skills/new-skill/examples/` — Gate 8b fails a skill with none
4. One row in the `SKILL.md` registry table: id, path, trigger keywords, core dep
5. `npm run gates`

**A new gold example:** `skills/{id}/examples/good-*.tsx` **plus** a matching `good-*.test.tsx`. Gate 7 fails on any gold without a 1:1 test, and now also on a test that does not pass. If the example imports a peer library nothing else uses, add a stub for it — `test/stubs/README.md` has the rules, and the first one is that every specifier gets its own file.

**A new semantic rule:** a check in `scripts/parser_constraints.js` **and** a divergence case in `scripts/parser_regression_test.js` proving it beats regex. Gate labels read their counts from the suites themselves, so `51` updates on its own.

**A version bump:** `metadata.json`, a new top section in `docs/CHANGELOG.md`, and the `version` field in all 17 skill files. Gates 1 and 2 fail on any of the three being out of step.

## Known gaps

Honest list, all verified against the current release.

1. **What the suite runs against is stubs, not the real libraries.** The examples' ~25 peer dependencies are still not installed — `test/stubs/` supplies one hand-written module per specifier and `vitest.config.ts` aliases them. So the suite proves the components mount, expose the roles and labels they claim, respond to interaction, and survive axe. It does **not** prove they work against the real `three`, `motion/react` or `react-hook-form`, and it never will while those are absent. Two guards keep the stubs from flattering the golds: a stub renders the semantically correct element with props forwarded, so a missing `aria-label` still fails, and any ARIA relationship the real component wires (Radix labelling a dialog by its title) is modelled, so the stub cannot invent a violation either. Where jsdom simply has no answer — WebGL, layout, virtualisation — the stub renders nothing rather than something a user could not perceive.

2. **Reference depth is unevenly distributed.** `component-patterns` has 2 references (2,338 tokens) and `ai-ui-generation` 2 (2,626); `design-system` has 15 (55,455) and `platform` 9 (62,012). The newest skills are routers with little behind them.

3. **`rules/v12-envelope.schema.json` and `scripts/test_v12_pipeline.py` are named for an architecture two majors old.** Renaming them would touch `ci.yml` and `build_release.py`; the names were left alone and the contents corrected instead. The schema *is* now referenced by a gate — Gate 6 validates the documented envelope and the schema's own examples against it.

### Recently closed

**The vitest suite did not execute end-to-end** — for four minor versions the first known gap on this page read "28 of 37 test files fail at import time", because the examples' peer libraries existed only as ambient declarations. `test/stubs/` now ships one runtime module per specifier, and Gate 7 runs the suite instead of disclaiming it: **39/39 files, 124/124 tests**.

Running it found four things that compiling it could not, which is the argument for having done it:

- `good-view-transitions.tsx` destructured `React.ViewTransition` and rendered it directly. On any stable React build that is `undefined`, so the component threw `Element type is invalid` for every consumer, not only in tests. The `as unknown as` shim that kept it type-clean is exactly what hid it from `tsc`. Its sibling `good-vt-shared-element.tsx` already had the `?? fallback` form; now both do.
- Both copies of `good-shadcn.tsx` gave the action column `header: ''`, which renders `<th></th>` — an axe `empty-table-header` violation, and an unnamed column for a screen-reader user.
- Three generated tests queried `getAllByRole('button')` on controls whose `role="tab"` replaces the implicit one, so they matched nothing. They now assert that activating a tab moves `aria-selected`, which is the behaviour worth checking.
- Two more asserted that the clicked element was still in the document afterwards — on a gallery that swaps in a detail pane and a checkout that opens on a skeleton, so one was asserting the interaction had *not* worked and the other was reading the first frame.

Per-file causes, what the suite does and does not prove, and the measurement pitfall that made a hanging import look like memory pressure: [TESTING.md](TESTING.md).

**`design-system/references/brand-design-systems.md` was orphaned** — present on disk, absent from its skill's Reference Index, so nothing could route to it. A citation was added; 76/86 references now resolve with none orphaned.

**`AGENT_SYSTEM_PROMPT.md` was pre-registry** — 28 of the 31 paths it cited did not exist, and it had no concept of the registry. Rewritten. The lesson is worth keeping: **Gate 6 had been guarding it the whole time by checking that its section headings were present**, which they were. Structural checks do not catch semantic rot. Gate 6 now resolves every path the prompt cites, rejects pre-registry `references/` and `_meta/` prefixes, and rejects bare reference filenames — and that check was verified to *fail* against the old file before it was trusted.
