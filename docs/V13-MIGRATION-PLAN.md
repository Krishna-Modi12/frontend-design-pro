# v13.0.0 Migration Plan — Skill Registry + Lazy Loading

**Stage 1 (done, this session):** structure, registry, core files, reference distribution.
**Stage 2 (next session):** author 11 skill files, relocate examples, rewrite script paths, release.

---

## Corrected budget math (supersedes the sprint spec)

The spec allowed 5,000 tokens per skill file. That breaks the 8k budget:

```
registry SKILL.md          1,474
core/component-api.md      2,116   (heaviest dep)
core/accessibility-baseline.md 641 (loaded whenever code is produced)
core/validate-checklist.md   558
                          ------
subtotal                   4,789
budget                     8,000
→ real per-skill cap       3,000   (not 5,000)
```

**Skill files must be routers, not encyclopedias.** Each one carries its own rules and points at `skills/{id}/references/*.md` for depth, loaded only when the specific task needs it. That is what keeps the cap reachable — and it is why per-skill `references/` was the right call over inlining.

## Stage 1 delivered

- `core/` — 5 files: `design-tokens.md` (639), `accessibility-baseline.md` (641), `component-api.md` (2,116), `agent-behavior.md` (1,486), `validate-checklist.md` (558).
- `SKILL.md` — **1,474 tokens** (was 5,458). Registry of 11 skills, behavioural preamble, anti-slop wall, loading protocol, failure handling.
- `skills/{id}/references/` — **all 58 reference files distributed, zero orphans**, plus the 5 style presets under `design-system/references/styles/`.
- 11 skill directories with `references/` and `examples/` scaffolded.

## Stage 2 — remaining work, in order

### 2.1 Author 11 skill files (~3k each, ~33k total)

Template: frontmatter (`name`, `description`, `version`, `core-deps`) → When to Use → Stack → Core Rules → Patterns → Examples → Constraints. Each ends with a **reference index** mapping task → which of its own `references/*.md` to load.

| Skill | Owns references | Primary source for the skill file |
|---|---|---|
| `react-components` | 5 | react-patterns, shadcn |
| `landing-pages` | 6 | design-patterns (P-01…P-08), landing-patterns |
| `forms` | 3 | react-hook-form, auth-patterns |
| `data-tables` | 3 | design-patterns (P-09…P-12), chart-types, tanstack-query |
| `threejs-3d` | 4 | threejs-fundamentals/advanced/interaction |
| `design-system` | 9 (+5 styles) | color-palettes, dark-mode, font-pairings |
| `animations` | 6 | animation-framework, framer-motion, gsap, view-transitions |
| `testing` | 3 | testing |
| `web-interface` | 3 | web-interface-guidelines, ux-deep-rules |
| `react-performance` | 5 | react-performance, vercel-ui-rules |
| `platform` | 9 | mobile-patterns, i18n, seo, payments, email-templates |

### 2.2 Relocate 32 examples + 32 tests

| Skill | Examples to move |
|---|---|
| react-components | good-shadcn, good-composition-patterns, good-react19, good-surgical-change |
| landing-pages | good-landing, good-design-md-round-trip, good-brand-linear |
| forms | good-form, good-rhf, good-auth, good-checkout, good-storybook |
| data-tables | good-data-table, good-tanstack, good-dashboard, good-dark-mode |
| threejs-3d | good-3d, good-3d-scene, good-3d-interaction, good-3d-loader, good-3d-shader, good-hero-spline, bad-3d-practices |
| animations | good-anim-recipes, good-scroll, good-view-transitions, good-vt-shared-element, bad-animated |
| testing | good-playwright + all `*.test.tsx` stay beside their component |
| react-performance | good-perf, good-performance-patterns, bad-performance |
| platform | good-mobile, good-react-native, good-ai-chat |
| web-interface | bad-generic, bad-inaccessible, bad-drive-by-refactoring |

Rule: a `.test.tsx` always sits beside the `.tsx` it tests. `_stubs.d.ts` and `_r3f-jsx.d.ts` are **duplicated into every** `skills/*/examples/` (they are compile-only ambient stubs; duplication is correct here).

### 2.3 Rewrite script paths (four files)

| Script | Change |
|---|---|
| `typecheck_golds.py` | `include` becomes `skills/*/examples/*.tsx` + `skills/*/examples/*.d.ts`; exclude `*.test.tsx` |
| `test_constraints.py` | `--dir` walks `skills/*/examples/` recursively; parser gate unchanged per-file |
| `parser_constraints.js` | No change — it already takes a single file path |
| `build_release.py` | `ARCHIVE_FROM_SRC` → `core`, `skills`, `scripts`, `evals`, `rules`, `_meta`, `metadata.json`; path-integrity resolves registry rows + `core-deps`; **new Gate 2** validates every `skills/*/SKILL.md` frontmatter; **new Gate 8** asserts registry paths resolve and every skill has ≥1 example |

### 2.4 New gates

- **Frontmatter gate** — every `skills/*/SKILL.md` parses and declares `name`, `description`, `version`, `core-deps`.
- **Budget gate** — for each skill: `tokens(SKILL.md) + tokens(registry) + tokens(core-deps) ≤ 8,000`. Fails the build, not a warning.
- **Registry gate** — every path in the registry table resolves; every `core-deps` entry exists; orphan skill directories warn.

### 2.5 Examples the spec named that do not exist

`good-button`, `good-card`, `good-modal`, `good-tabs`, `good-accordion`, `good-pricing`, `good-testimonials`, `good-contact`, `good-chart`, `good-analytics`, `good-animated`. **Do not create eleven new golds to satisfy a naming list** — each must earn its place. Existing examples already cover these patterns (`good-shadcn` has Dialog/Command/DataTable; `good-composition-patterns` has Tabs; `good-landing` has hero/pricing/testimonials). Create only where a genuine gap is proven, and only with a matching test.

## Rollback

`frontend-design-pro-v12.6.0.skill` remains the last verified release. The v13 tree is additive — `src/` is untouched — so stage 2 can be abandoned without losing v12.6.0.
