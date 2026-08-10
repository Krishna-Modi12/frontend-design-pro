# Release Notes — frontend-design-pro v14.5.1

**Date:** 2026-08-10
**Pipeline wall-clock:** 73.1s (dry run)

A correctness patch. Two audit findings from the v14.5.0 sweep, plus one dependency
gap documented rather than closed. No new skills, no new references, no behaviour
change for anything that was already routing correctly.

## Contents

19 skills · 8 core files · 94 references (332,974 tokens of on-demand depth) ·
54 examples (44 gold + 10 anti-examples) · 44 tests · 53 constraints
(17 semantic + 36 syntactic)

Registry (`SKILL.md`) is 1,998 tokens and is the only file always loaded.

## Gate Results

| Gate | Result | Detail |
|------|--------|--------|
| Compile | PASS | All 54 gold examples compile under tsc --noEmit (strict) · 15 demo files clean |
| Semantic | PASS | 59/59 files (44 golds + 15 demo) pass 17/17 parser checks |
| Syntactic | PASS | gold examples clean, anti-examples fail as designed (36/36) · demos clean |
| Pipeline | PASS | 16/16 checks (stages · architecture · cited paths) |
| Evals | PASS | 22/22 self-test |
| Test coverage | PASS | 44/44 golds have a 1:1 test; all compile strict; 44/44 files · 192/192 tests pass |
| Regression | PASS | 13/13 synthetic cases |

Plus pre-flight, frontmatter, path integrity, and per-skill budget gates — all blocking.
Gate 9 (showcase build) is covered by the `showcase` CI job.

## What changed

### Trigger-keyword collisions

`bento`, `avatar` and `contrast` each appeared in two registry rows. The registry's
contract is that a keyword resolves to one skill; with a keyword in two rows, routing
between them was undefined rather than decided by specificity. The broader owner keeps
the bare term and the narrower one is rescoped: `component-patterns` → `bento-card`,
`iconography` → `avatar-icon`, `web-interface` → `contrast-check`.

All 204 registry keywords now resolve to exactly one row.

### Five byte-identical gold examples

Five skills shipped a gold that was byte-for-byte identical to another skill's. The
effect was worse than redundancy: four of the five skills had no example of their own
subject. `iconography` demonstrated a data table. `ai-ui-generation` and
`component-patterns` both demonstrated the same compound-component pattern.
`design-principles` shipped a landing page.

Each duplicate was replaced rather than deleted. In four of the five cases the skill
holding the copy had no other gold, so deletion would have left it with none.

| Skill | New gold | What it now demonstrates |
|---|---|---|
| `iconography` | `good-icon-button.tsx` | icon-only controls with accessible names, `1em` glyph sizing, weight scale |
| `component-patterns` | `good-spotlight-card.tsx` | pointer position in CSS custom properties, coalesced into one rAF, never state |
| `ai-ui-generation` | `good-registry-renderer.tsx` | JSON → UI via a closed allow-list, `unknown`-narrowed props, bounded depth |
| `design-principles` | `good-visual-hierarchy.tsx` | rank on size + weight + colour together, one primary action |
| `data-tables` | *(none — copy dropped)* | canonical `good-dark-mode.tsx` stays in `design-system` |

`example_files` 55 → 54, `test_files` 45 → 44. Gold-to-test parity holds at 44/44 and
the suite grew from 124 to 192 tests.

## Known gaps

See [ARCHITECTURE.md](ARCHITECTURE.md#known-gaps) for the standing gaps (the suite runs
against `test/stubs/`, not the examples' real peer libraries). New in this release:

### Development dependencies — documented, not bumped

Both available fixes require a major bump, and every advisory is development- or
build-time only. None reaches a consumer of the `.skill` archive: `node_modules/` is
not in the archive manifest, and the pack installs none of its examples' peer
dependencies by design. The published v14.5.0 archive was verified by download at
359 files with zero sensitive entries — no `.env`, `.pem`, `.key`, or `node_modules`.

**Root — 5 advisories (1 critical, 1 high, 3 moderate).** One chain:
`esbuild → vite → @vitest/mocker + vite-node → vitest`. GHSA-67mh-4wv8-2f99 lets any
website send requests to a running esbuild **development server** and read the
response. Nothing here starts one: `vitest` runs headless in CI and via
`npx vitest run` locally, and no port is bound. The fix is `vitest@4.1.10` from
`2.1.9` — a two-major bump that touches the config surface, browser mode, and the
`test/stubs/` alias resolution that already has three documented silent failures
against it. That is not a patch-release change.

**`demo/showcase` — 3 high.** GHSA-fxqj-rqcc-2cmp (postcss: attacker-controlled
`sourceMappingURL` reads arbitrary `.map` files when `from` is unset) and
GHSA-f88m-g3jw-g9cj (sharp < 0.35.0: inherited libvips CVE-2026-33327 / 33328 / 35590 /
35591). Both are build-time. The fix is `next@16.3.0` from `15.5.23`. v14.5.0 already
moved these apps 15.3.9 → 15.5.23 to clear the previous HIGH advisories, and that bump
alone regenerated `next-env.d.ts` in a way that failed Stage 4.5 on a clean runner and
cost two release attempts.

Both are scheduled as their own change, each with a full `next build` and
`npm run demos:verify` on a clean checkout.

### `web-interface` ships no gold example

Surfaced by the same audit and **not fixed here**. `web-interface` has three
anti-examples and no gold. It passes Gate 8b because that gate globs `examples/*.tsx`,
which counts `bad-*.tsx` — so "every skill has an example" is enforced and "every skill
has a *gold*" is not. Writing one is a content change, not a patch fix.
