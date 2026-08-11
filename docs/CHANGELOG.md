# Frontend Design Pro — Changelog

All notable changes to this skill package. Follows [Semantic Versioning](https://semver.org/).

---

## [14.8.0] — 2026-08-11

**Gate 11 — the figure gate.** `CLAUDE.md` has named the same defect as this
repo's worst for several releases:

> No gate validates prose. Skill/reference/example counts and token figures are
> hardcoded across ~30 documents and go stale silently — this is the single most
> repeated defect in this repo's history.

Every gate read code. The thing that kept breaking was arithmetic in markdown,
defended only by remembering to sweep a list of files after every change that
moved a count.

### What the gate does

`scripts/check_figures.py` recomputes every figure from the filesystem — never
from `metadata.json`, which it audits instead — and fails the build on any
document that disagrees. Token figures are LF-normalised, so it reports the same
numbers on Windows and on ubuntu-latest; a gate whose entire job is arithmetic
cannot have a platform-dependent answer.

Four checks:

1. **Anchored figures.** Each is a regex matching the *shape and context* of a
   figure, not a list of known-stale literals — so the next drift is caught, not
   only this one.
2. **Arithmetic consistency.** `A → B … C tokens` must satisfy `B - A = C`. This
   is the shape a partial sweep leaves behind: an endpoint updated, a delta not.
3. **`metadata.json` against the tree.** Twelve derivable stats.
4. **`metadata.json`'s changelog against this file.** The two drifted apart once
   already and passed a green chain twice, because nothing compared them.

### What the first run found — 64 drifts

- **The per-request band was wrong in 17 live files**, two of them shipped inside
  the archive. `AGENT_SYSTEM_PROMPT.md` told an agent its own budget was
  5,511–7,112 when it was 5,665–7,266.
- **A second, rounder band was circulating in five more files** — 5,000–6,300,
  including on the product's own homepage — already disagreeing with the first
  before either went stale.
- **`ARCHITECTURE.md`'s per-skill budget table was wrong in all 19 rows**, and
  had been hand-re-derived *twice in the preceding release*, by commits whose
  messages read "re-derive every figure". It was stale again the moment that
  release shipped. That is the argument for the gate rather than a footnote to
  it: the manual process was performed correctly, twice, and still produced a
  wrong table.
- **Three documents claimed two skills grew the registry by 103 tokens** between
  endpoints that subtract to 107 and 123. A blanket substitution had moved the
  endpoints and left the deltas; only this file kept the self-consistent
  original, because `CLAUDE.md` forbids rewriting it.
- **"Nine named gates" sat above a ten-row table.** Gates 2 and 8 reported 17/17
  for 19 skills, gate 5 reported 39/39 for 45 golds, path integrity claimed 87
  cited references against 95, `GEMINI_SETUP.md` said "the 17 routers",
  `audit-report.html` said 56 constraints, and the rounded "~320k" depth was 4%
  low against 333,709.

All fixed. Second run: 0.

### Boundaries

Exemptions carry a written reason, per file and per figure — an exemption
without one is indistinguishable from a bug someone silenced. Historical records
are exempt wholesale: this file and `docs/RELEASE_NOTES-*` were accurate when
cut, and a gate demanding they match today's figures would be demanding the
record be falsified.

What it still cannot see: figures spelled as words ("nine gates"), and any
document outside its `SCAN` list.

Gates 10 → **11**. No constraint behaviour changed; no skill, reference or
example was added.

---

## [14.7.3] — 2026-08-10

Competitor survey widened from four packs to eight, and `metadata.json`'s
changelog restored.

### The survey

Packs read **at source**: impeccable, ui-ux-pro-max-skill, `anthropics/skills`
frontend-design, taste-skill, rohitg00/awesome-claude-design,
vercel-labs/web-interface-guidelines, emilkowalski/skill.

The question is narrow and falsifiable: **does the project run its own design
rules over its own shipped guidance?** Not "does it have tests".

| Pack | Rules enforced? | Own material gated? |
|---|---|---|
| frontend-design-pro | 59 | **Yes** — Gate 10, blocks the archive |
| impeccable | 46 detectors | No — `test:detector` runs against `tests/fixtures/antipatterns` |
| ui-ux-pro-max-skill | No | No — `validate:csv` is schema validation |
| `anthropics/skills` frontend-design | No | No — `SKILL.md` + `LICENSE.txt` |
| taste-skill, awesome-claude-design, web-interface-guidelines, emilkowalski/skill | No | No — zero CI, zero test files, all four |

### Correction owed to impeccable

Earlier notes here described its detectors as pointing "outward" as though the
project were untested. **It is not** — 14 test targets including detector,
framework, e2e and live-agent suites, more test infrastructure than this pack
has. It tests that its detector *works*; what it does not do is point that
detector at `skill/reference/*.md`. That narrower distinction is the one that
holds.

### What the survey does not establish

`README.md` now says it outright: "best" is not a property a repository can
have. ui-ux-pro-max ships far more styles and palettes; impeccable's retrofit
commands and its live browser loop have no equivalent here.

### Fixed — a drift no gate can see

`metadata.json`'s changelog dict had lost its `14.7.1` and `14.7.2` entries
across two concurrent merges, while `docs/CHANGELOG.md` kept both. **No gate
compares the two** — pre-flight checks `metadata.version` against this file's
top header, and both agreed every time — so it passed clean twice. Both
restored.

No constraint behaviour changed.

---

## [14.7.2] — 2026-08-10

A review pass: everything here was found by judging what already shipped,
not by building something new.

It is a patch on 14.7.1 rather than part of it. The work was written against
14.7.1 and merged to `main`, but 14.7.1 had already been tagged and published
from an earlier commit by a concurrent session, so its archive contains none
of the below. Re-pointing a published tag would falsify a release somebody
may already hold.

### Added — `web-interface` finally has a gold example

The skill shipped three anti-examples and no positive one, so *"make this feel
more finished"* — the request it exists to answer — had no worked answer
anywhere in the pack. Gate 8b globs `examples/*.tsx`, which counts `bad-*.tsx`,
so "every skill has an example" was enforced and "every skill has a **gold**"
was not, and no gate checked the second.

`examples/good-audited-panel.tsx` is the craft pass at component scale, not
another landing page: two shadow layers, hover states that *gain* contrast
rather than lose it, `tabular-nums` on every numeric column, the `min-w-0` +
`truncate` pair the rule set names as its most frequent finding, `Intl`
formatting and `translate="no"` on identifiers. All four states, no faked delay.

### Fixed — an entrance eased the wrong way, inside a comment no gate can read

`skills/animations/examples/good-view-transitions.tsx` ships its view-transition
CSS in a `// --- Required CSS (add to global.css) ---` block for the reader to
paste. `::view-transition-new(.slide-up)` used `ease-in` — an entrance easing
the opposite way from ban 6, and from the four sibling rules in the same block.

Gate 10 closed the blind spot on reference files. This is the same blind spot one
layer down: **prescribed code inside a comment in an example file is read by no
suite**, because every suite parses the file as TypeScript and a comment is not
TypeScript. The gates check the code an example *runs*, never the code it *tells
you to copy*.

### Fixed — the default avatar palette broke ban 3

`skills/iconography/references/icons-avatars.md` prescribes a deterministic
gradient for initials avatars. Three of its eight entries were `violet→indigo`,
`fuchsia→pink` and `indigo→purple`. Purple→pink is banned by name, and a default
palette is the worst place to break a ban, because every avatar in the product
inherits it. Replaced with a warm→cool ramp that skips the corridor.

### Fixed — the no-raw-hex rule named none of its three real exceptions

Three golds must use hex and always did: the Google "G" in
`skills/forms/examples/good-auth.tsx` (colours its owner specifies), React Native
`StyleSheet` in `good-react-native.tsx`, and a three.js material in `good-3d.tsx`
— none of the three parse `oklch()`. The wall said "OKLCH only" with no
exceptions, so an agent following it literally ships a subtly wrong Google logo,
which is worse than the violation. The exceptions are now named in
`AGENT_SYSTEM_PROMPT.md` and the root `SKILL.md`, and each site carries its
reason. The three.js material also stopped being indigo `#4f46e5`: the hex was
unavoidable, the AI-slop purple was not.

### Fixed — figure drift, including two files that contradicted themselves

`AGENT_SYSTEM_PROMPT.md` disagreed with itself four lines apart: the correct
parser and regex totals on one line, "Semantic (16 AST)" and "Syntactic (35
regex)" on the next two. `docs/ARCHITECTURE.md` disagreed with `README.md` about
the test-suite figure — in a product whose entire claim is that its numbers are
derived from a green chain. Its per-skill budget table was stale in all 19 rows,
and its core-dependency range had not been re-derived since the core files were
split.

Neither file is on any sweep list, and no gate reads prose.

### Added — `docs/REVIEW_PROTOCOL.md`

The spot check, the list of things no gate can see, and the severity ladder.
Tracked rather than kept in `.claude/`, which is gitignored — a protocol that
lives there cannot reach a second session working the same tree. `CLAUDE.md`
points at it.

One trap it records, because it cost a build here: Stage 1's version-leak scan is
`ROOT.rglob("*")`, a filesystem walk that does not read `.gitignore`. Any
untracked scratch file containing the current version string fails pre-flight —
and an `_ingestion/` directory named after the version fails it by its own name.

## [14.7.1] — 2026-08-10

A correction. v14.7.0 described its three new constraints as covering
"defects the field ships and nobody checks", and claimed no competing pack
enforced any of them. **That was asserted, not verified** — which is precisely
the failure mode this pack exists to make impossible. It has now been checked
against source.

### What the check found

| Constraint | Enforced elsewhere? |
|---|---|
| `A11Y-06` — `outline-none` with no indicator | **No.** Zero matches for `outline` across impeccable's 46 detector rules. ui-ux-pro-max carries "Focus states visible for keyboard nav" as a self-graded pre-delivery checklist line with no machine check behind it |
| `TYP-03` — gradient text on body copy | **Yes — the claim was wrong.** impeccable ships a `gradient-text` detector firing on `background-clip: text` plus a gradient (and the Tailwind `bg-clip-text` + `bg-gradient-to-` pair) |
| `FORM-01` — inputs below 16px | **No.** impeccable's font-size floor for interactive text is **11px**, so a 14px input passes it. Its iOS-zoom note lives in `skill/reference/harden.md` as prose, enforced by nothing |

Sources read: impeccable's `scripts/detector/rules/checks.mjs` (46 rule IDs),
ui-ux-pro-max-skill, taste-skill, and `anthropics/skills` frontend-design —
which is a single `SKILL.md` with no enforcement mechanism of any kind.

### What is still true, stated precisely

`TYP-03` and impeccable's `gradient-text` are not the same rule. Impeccable's
fires **unconditionally**, including on a display heading, where gradient text
is a legitimate choice rather than a defect. `TYP-03` is scoped to body-sized
text. That is a real difference in precision — it is not the absence of a
competitor, and the docs no longer say it is.

No constraint behaviour changed. `README.md` and `core/validate-checklist.md`
corrected.

## [14.7.0] — 2026-08-10

Three constraints for defects the whole field ships and nobody checks — found by
sweeping both suites for gaps, not by adding rules that sounded good.

### Added — `A11Y-06`, unpaired `outline-none`

`A11Y-02` (AST) already checks that a `focus-visible` class sits on an
interactive element. That catches the ring being in the *wrong place*. It cannot
catch the outline being removed and replaced with **nothing**, which is the far
commoner defect and the one that costs every keyboard user the page.

Either `focus:` or `focus-visible:` satisfies the rule. The requirement is that
a visible indicator exists, not which variant spells it — a `focus:border`
colour change is a real indicator, and failing it would make the rule wrong
rather than strict. A focus-trapped dialog container is the one legitimate bare
`outline-none` and carries a documented exemption.

### Added — `TYP-03`, gradient text on body copy

Legitimate on a display heading. On prose, `bg-clip-text` sets the computed
colour to `transparent`, which destroys contrast **and silently defeats every
contrast checker**, because the ratio gets measured against a colour no reader
ever sees. That second half is why it survives review.

### Added — `FORM-01`, inputs below 16px

An `input`, `textarea` or `select` carrying `text-sm` (14px) or `text-xs`
(12px). Below 16px, focusing the field makes iOS Safari zoom the viewport, and
it does not zoom back on blur. Invisible on desktop, universal on iPhone.
`text-sm sm:text-base` is the same bug — the small value is the one mobile gets.

### Fixed — 22 instances of these in our own shipped material

All three are ban-shaped, so all three joined Gate 10's `FRAGMENT_SAFE` set and
run over the whole reference corpus rather than only the examples. They found:

| Where | Count |
|---|---|
| Gold examples (`good-rhf`, `good-checkout`, `good-react19`, `good-performance-patterns`, `good-image-palette`, `good-react-native`) | 11 |
| References — incl. **five in `auth-patterns.md`**, the file that teaches agents to build sign-in forms | 11 |

Every one is fixed. This is the argument for the gate, not a footnote to it: the
rules were written this week and the defects have been shipping for months.

Constraints: 56 → **59** (17 parser AST + 42 regex). Gate 10 applies **19**
ban-shaped constraints, up from 16.

---

## [14.6.0] — 2026-08-10

Security, enforcement and install coverage. Every item here is a defect that
shipped, or a rule the pack stated and did not check.

### Security — stored XSS in a shipped recipe

`skills/platform/references/seo.md` told agents to render JSON-LD with
`dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}`. `JSON.stringify`
does not escape `<`, so a CMS field containing `</script><script>…` closes the
tag and executes. Replaced with a `jsonLd()` helper that escapes at the point of
serialisation — a rule that lives in the CMS is a rule the next integration
forgets.

### Security — trust boundary on fetched content

`skills/design-research/SKILL.md` instructs agents to fetch and read live pages
and said nothing about what authority that text carries. It now opens with the
boundary stated: fetched bytes — page text, alt text, comments, `<meta>`, hidden
nodes, a README in a linked repo — are untrusted data being quoted, never
instruction. Only typed values are extracted; a directive found in a page is a
finding *about* the page.

### Added — three constraints that had no enforcer

`min-h-screen`, `React.FC` and `onPress` on web were named on the anti-slop wall
and in `core/validate-checklist.md`, with no check behind any of them.
Anti-example files were already annotating `❌ [RES] min-h-screen`, citing an ID
the suite had never defined. Now **RES-03**, **TS-02** and **PLAT-01**
(scoped by import rather than filename, so React Native files are not flagged).

Constraints: 53 → **56** (17 parser AST + 39 regex).

### Added — Gate 10, `scripts/check_references.py`

`test_constraints.py` globs `*.tsx *.jsx *.ts *.js *.html`. Markdown is not in
that list, so the **94 reference files — ~333k tokens, the part an agent
actually loads for depth — were read by no gate at all.** The suite ran over the
examples, which are 2% of the corpus. An example is a demonstration; a reference
is an instruction.

It showed. `glassmorphism.md` prescribed
`min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500`
under a heading reading **"Must have"** — both banned by name, in the same pack,
in the same context window an agent holds.

The new gate:

- **imports** its constraints from `test_constraints.py` — one definition, no drift;
- applies only **ban-shaped** constraints. "Has a default export" is a property of
  a whole file; a 9-line snippet that omits it is correct, not defective, and a
  noisy gate gets muted;
- **skips anti-example blocks** — a reference showing `React.FC` under `// Bad —`
  is teaching the rule;
- carries a **per-file, per-constraint reason** on every exemption (React Native
  has no OKLCH; Outlook ignores `@font-face`; `figma-to-code.md`'s subject *is*
  converting hex).

First run: 20 violations. All fixed. Second run: 0. Gates: 9 → **10**.

### Fixed — adapters installed as silent no-ops

`AUTO_AGENTS` was a hardcoded list of 5 while adapter discovery was derived from
the `install/` directory, so any adapter added without editing that constant
installed as a no-op with no error. Both `setup.sh` and `setup.ps1` now derive
auto-vs-manual from a `.manual` marker file, verified in parity with a real
nested-dotfile install.

### Added — universal install coverage

**14 adapters, 10 automatic (was 5), 4 manual.**

| Adapter | Writes | Covers |
|---|---|---|
| `agents` | `AGENTS.md` | Codex, Jules, Devin, Factory, Amp, OpenHands, JetBrains Junie, VS Code |
| `cline` | `.clinerules/` | Cline |
| `roo` | `.roo/rules/` | Roo Code |
| `zed` | `.rules` | Zed |
| `gemini` | `GEMINI.md` | Gemini CLI |

`AGENTS.md` is the one to install if you install only one — an open spec donated
to the Linux Foundation's Agentic AI Foundation, 60k+ repos, the only rules
format read by more than one vendor. Gemini CLI gets its own file because it
reads `GEMINI.md` and *not* `AGENTS.md`.

Kilo Code is deliberately **not** shipped: its docs URL 404s and sources disagree
on `.kilo/rules` vs `.kilocode/rules`. A guessed path is worse than no adapter.

### Added — `docs/audit-report.html`

This audit, rendered by giving the pack the same brief you would give it for a
client. The generating prompt is quoted verbatim in `README.md` and
`docs/DEMO_PROMPTS.md`. The brief names "near-black with one acid accent" — a
look this pack has shipped, and one of the three AI-design defaults its own wall
bans — to find out whether the pack follows its own rule when the easy answer is
sitting right there. It declines.

---

## [14.5.1] — 2026-08-10

A correctness patch on top of v14.5.0. No new capability: two audit findings that
made routing and examples quietly lie about themselves, and one documented gap.

### Fixed — trigger-keyword collisions

Three keywords each appeared in two registry rows, so routing between them was
undefined rather than "most specific wins". The broader owner keeps the bare term;
the narrower one is rescoped:

| Keyword | Kept by | Rescoped |
|---|---|---|
| `bento` | `landing-pages` | `component-patterns` → `bento-card` |
| `avatar` | `react-components` | `iconography` → `avatar-icon` |
| `contrast` | `design-principles` | `web-interface` → `contrast-check` |

204 registry keywords now resolve to exactly one row each.

### Fixed — five byte-identical gold examples

Five skills shipped a gold that was a byte-for-byte copy of another skill's, so four
skills had no example of their own subject. Each duplicate was replaced rather than
deleted — in four of the five cases the skill holding the copy had no other gold, and
deleting would have left it with nothing:

- `iconography/good-icon-button.tsx` — icon-only controls that carry an accessible
  name, `1em` glyph sizing so the icon tracks the text rather than the box, and a
  weight scale. Replaces a copy of the shadcn data table.
- `component-patterns/good-spotlight-card.tsx` — pointer position written to CSS
  custom properties and coalesced into one rAF, never to state. Replaces a copy of
  the compound-component example.
- `ai-ui-generation/good-registry-renderer.tsx` — JSON to UI through a closed
  allow-list registry, `unknown`-narrowed props, bounded recursion depth, and an
  unknown node that renders visibly instead of vanishing. No prop can carry a handler.
  Replaces a copy of the same compound-component example.
- `design-principles/good-visual-hierarchy.tsx` — rank expressed on size, weight and
  colour together, exactly one primary action, grouping by spacing. Replaces a copy of
  `landing-pages/good-landing.tsx`.
- `data-tables` — dropped its copy of `good-dark-mode.tsx`; the canonical one stays in
  `design-system`.

Stats: `example_files` 55 → 54, `test_files` 45 → 44. Gold-to-test parity holds at
44/44 and the suite grew 124 → 192 tests.

### Known gap — development dependencies

`npm audit` reports 5 advisories at the root (one `esbuild → vite → vitest` chain) and
3 in `demo/showcase` (postcss, sharp, via `next`). Both fixes require a major bump —
`vitest` 2 → 4 and `next` 15 → 16 — and every advisory is development- or build-time
only. None of it reaches a consumer of the `.skill` archive: `node_modules/` is not in
the manifest and the pack installs none of its examples' peer dependencies by design.
Deferred to its own change after launch rather than carried into a patch release. See
`docs/RELEASE_NOTES-v14.5.1.md`.

## [14.5.0] — 2026-08-09

Two new skills, and the first release in a while that adds capability rather than closing a gap. Both are **generative**: they cover design that is computed at runtime rather than authored once — type rendered as a system, colour derived as a function. Nothing in the pack covered that.

### Added — `canvas-typography` (18th skill)

Particle text, kinetic type, variable-font axis animation, scramble/decode reveals, and text on an SVG path. Four references, three gold examples, two anti-examples, three test files.

The discipline the skill enforces is not the effect, it is what the effect must never cost: **the real string always stays in the DOM**, the canvas is `aria-hidden` decoration, and `getContext("2d")` is null-guarded — it returns `null` under SSR, under jsdom, and when a GPU process dies. Every gold degrades to plain readable type rather than a blank rectangle. `prefers-reduced-motion` paints the settled final state and never starts a loop; motion is driven by elapsed time, so a 144Hz display and a throttled tab agree.

### Added — `color-themes` (19th skill)

OKLCH theme generation from a single anchor hue, harmonic schemes (complementary, split, triadic, analogous), median-cut palette extraction from an image, and a light/dark/auto control. Four references, three gold examples, two anti-examples, three test files.

Three rules the examples exist to demonstrate. **Chroma is clamped to the sRGB gamut** at each lightness, so two generated colours cannot silently clip to the same rendered one. **Palettes are clustered, never averaged** — the mean of any photograph is the same muddy brown-grey, because colours from opposite sides of the wheel cancel. And the theme control **persists the choice, not a resolved boolean**: storing `isDark` silently pins anyone who picked "follow the system" to whatever the system was on their first visit.

The generator's contrast is verified across all 24 hue steps in both polarities rather than at one brand colour — the failures live at specific hues, so a single-hue test proves nothing.

### Fixed — dependency advisories in both runnable demos

`demo/showcase` was pinned to Next 15.3.9, which `npm audit` reports against a long list of HIGH advisories: SSRF in Server Actions and in rewrites, DoS in Server Components and via Cache Components, and a Middleware/Proxy bypass in App Router. Bumped to 15.5.23, a patch within 15.x. `demo/landing-page` follows, 15.5.22 → 15.5.23, so the two apps do not drift.

Not fixed, and stated rather than left to be found: `postcss` and `sharp` remain flagged inside Next's own dependency tree, and npm's only offered remedy is Next 16 — a major, and not a change to make on the eve of a release.

### Fixed — the test environment had no `localStorage`

`window.localStorage` arrives in the vitest jsdom environment as a bare object with no methods on it, so every `getItem`/`setItem` throws. This is worse than it sounds: the *correct* implementation wraps storage in `try/catch` for Safari private mode, so a broken stub does not fail loudly — it silently takes the catch path, and a test asserting "the preference was saved" passes for the wrong reason. `vitest.setup.ts` now polyfills it alongside the existing `matchMedia`, `ResizeObserver` and `document.fonts` shims.

### Stats

19 skills · 8 core files · 94 references (332,974 tokens of on-demand depth) · 55 examples (45 gold + 10 anti-examples) · 45 tests · 53 constraints (17 semantic + 36 syntactic) · 22 evals · 13 regression cases · 9 gates.

Registry (`SKILL.md`) is 1,998 tokens, up from 1,895 — **+103 for two skills, about 51 each**, which is the marginal cost this architecture has claimed all along. A request now loads 5,038 tokens at the lightest and 6,338 at the heaviest, against 332,974 available.

---

## [14.4.3] — 2026-08-06

A distribution hotfix. The gate chain was green for v14.4.2 and the archive it produced was internally perfect — and shipped defects that had already been fixed on `main` two commits earlier. Nothing in this release changes a skill, a reference, an example or a constraint. Every entry below closes a gap between what this repo contains and what a download delivers.

### Fixed — the archive was built from source no one could fetch

`v14.4.2` was tagged from `d48546c`, which was never `main`'s head; the pull request that fixed the demos merged as `dc55237`. So the published archive carried a `@theme` block inside a runtime style string (which browsers discard, leaving `landing-page` unstyled), no `tokens.css`, and the hand-written `LoginValues` interface that breaks a consumer's `next build`. All three were fixed before the tag existed.

Every gate passed, including the post-build smoke test, because none of them was wrong: the archive was a *faithful product of stale source*. The smoke test cannot catch this by construction — it verifies the archive against itself.

**Stage 4.5, release source guard.** Fetches `origin` and refuses to build unless `HEAD` is exactly `origin/main` with a clean working tree. The fetch is the point: a stale `origin/main` ref passes the comparison trivially while proving nothing, which is the state the bad release was cut in. Release-path only — `--dry-run` is the CI contract and runs on branches where being behind `main` is normal. Override with `FDP_ALLOW_UNPUBLISHED_BUILD=1` for a local-only archive.

### Fixed — the README told visitors the test suite was broken

It read *"partially executable — 20 of 39 files pass … not run in CI"*. The real figure is **39 of 39 files, 124 of 124 tests**, and CI has run the full chain on every push and pull request to `main` since v14.4.2 closed that gap. `docs/TESTING.md` and `docs/ARCHITECTURE.md` were both already correct; `README.md` was the last file still wrong, and it is the first one anyone reads.

### Fixed — install step 1 was a dead link

`docs/INSTALL.md` and `docs/RESPONSE_TEMPLATES.md` linked `[Releases](../../releases)`. That resolves from a root README and 404s from anything inside `docs/` — GitHub sends it to `/tree/releases`. Both now use an absolute URL.

### Fixed — the "What's new" heading announced the wrong version

`README.md` still read *"What's new in v14.4.0"* at version 14.4.2 — the exact defect v14.4.1 was cut to correct, regressed and live in the published archive.

**The post-build smoke test now reads the archive's prose**, not just its code: the version the README announces, the version `_meta/CHANGELOG.md` tops out at, and that every `demo/**/*.png` in the source reached the archive. The screenshot expectation is derived from the source tree rather than hardcoded — a literal would be one more figure to go stale. Three of the four screenshots had been committed two versions earlier and never reached a release.

### Changed — `rtl` meant two unrelated things

The trigger keyword appeared on both the `testing` row (React Testing Library) and the `platform` row (right-to-left), so *"add RTL support for Arabic"* could route to the test skill. Every `rtl` occurrence in `skills/` is right-to-left, all of it in `platform/references/i18n.md`; `testing` was keyed to content it does not have. `platform` keeps `rtl` and gains `right-to-left`; `testing` takes `testing library`, which matches what it actually covers.

### Changed — figures re-derived

The routing-table edit grew `SKILL.md` by 7 tokens, and the registry is added to every request. Registry **1,888 → 1,895**; per-request band **4,928–6,228 → 4,935–6,235**, uniformly +7. Reference depth is unchanged at **320,865**. Swept across 14 live documents; historical release notes and prior changelog entries left alone, as they were accurate when cut.

## [14.4.2] — 2026-08-05

The first known gap in [ARCHITECTURE.md](ARCHITECTURE.md) — *"the vitest suite does not execute end-to-end"* — is closed. It had been published for four minor versions, in that file plus every launch draft and response template, because it was true: the examples' ~25 peer libraries existed only as ambient `declare module` declarations, so `vitest run` could not resolve them and 29 of 39 test files failed at import.

### Added — `test/stubs/`, one runtime module per specifier

Twenty-seven small modules, aliased in `vitest.config.ts`. Test-only; the archive ships `core/ skills/ scripts/ evals/ rules/ install/` and four root files, and `test/` is in none of them.

**One file per specifier is a rule, not a preference.** Grouping them by domain is tidier and fails three ways, each silently: a module has exactly one `default` export (`gsap` and `@splinetool/react-spline` both want it, and the loser receives the winner's object); a namespace import reads every name in the file, so `import * as z from 'zod'` finds `Bell` and `ResponsiveContainer` but not `string`; and `vi.mock` keys on the *resolved* path, so three specifiers behind one file collide and the last factory registered wins. `test/stubs/README.md` records all three against the failure that produced them.

The stubs are held to two rules that keep them from flattering the golds. Props are forwarded, so a missing `aria-label` still fails. And any ARIA relationship the real component wires up is modelled — Radix labels a dialog by its title and names a `role="combobox"` explicitly, and a stub that takes the role without the name invents a violation the real component does not have. Where jsdom has no answer at all — WebGL, layout, virtualisation — the stub renders nothing, because a test that asserts on content no user can perceive is worse than one that skips it.

### Changed — Gate 7 runs the suite

It asserted 1:1 coverage plus strict compilation and said runtime execution was out of scope. It now also runs `vitest` and fails on a red suite: **39/39 files, 124/124 tests**. It still degrades honestly — a clone with no `npm install` has neither `tsc` nor `vitest`, and the gate names which layers actually ran rather than implying all of them did.

All 64 inline `vi.mock` factories are gone from the test files; the aliased stubs are the single source of truth. Eight of them returned a bare `new Proxy({}, { get })`, which is a thenable: `await factory()` calls the trap's `then`, which returns a JSX element and never resolves, so the module never loads and the worker is killed. It surfaces as `Error: Worker exited unexpectedly` — indistinguishable from memory pressure, and `vitest.config.ts` had already misattributed it to exactly that in a comment.

### Fixed — four defects that compiling could not have found

- **`good-view-transitions.tsx` crashed on every stable React build.** It destructured `React.ViewTransition` and rendered it directly; the API ships only in the experimental channel, so on React 19.2 it is `undefined` and the component threw `Element type is invalid` — for any consumer, not just under test. The `as unknown as` shim that kept it type-clean is precisely what hid it from `tsc`. It now resolves the API and falls back to rendering children unwrapped, which is the form its sibling `good-vt-shared-element.tsx` already used.
- **Both copies of `good-shadcn.tsx` shipped an unnamed table column.** The action column declared `header: ''`, rendering `<th></th>` — an axe `empty-table-header` violation and a column a screen-reader user cannot identify. It now carries an `sr-only` label.
- **Three generated tests queried a role their control does not have.** `getAllByRole('button')` matches nothing on a `<button role="tab">`, because the explicit role replaces the implicit one. They now assert that activating a tab moves `aria-selected`, which is the behaviour worth checking.
- **Two more asserted that a clicked element was still in the document.** On a gallery that swaps in a detail pane, that asserts the interaction did *not* happen; on a checkout that opens on a skeleton, it reads the first frame instead of waiting. Both now assert the outcome.

`document.fonts` joins `matchMedia`, `IntersectionObserver` and `ResizeObserver` in `vitest.setup.ts`: jsdom has no font pipeline, and a component that re-measures after webfonts settle is doing the right thing.

### Changed — every published figure re-derived

Two commits landed after `14.4.0` was cut and grew the reference corpus, which left every token figure in the live docs stale — the defect this repo keeps repeating. Re-measured from the git index (the LF copy CI and the archive see, not the CRLF working tree) and verified by reproducing the previous figures exactly at the release commit before trusting the method:

- Reference depth **320,375 → 320,865** across 13 files.
- Per-request totals **4,775–6,075 → 4,928–6,228**, every skill uniformly +153 from a shared core dependency, read off Gate 8a's own code against an LF checkout.
- Core dependency load **2,073/2,149/2,241 → 2,236/2,312/2,404**.

`docs/CHANGELOG.md` entries below and `docs/RELEASE_NOTES-*` are untouched: they were accurate when cut.

---

## [14.4.1] — 2026-08-05

A patch release for one reason: **the `v14.4.0` archive shipped a README that contradicted its own contents.**

The README fix landed one commit *after* the `v14.4.0` tag, so the published `.skill` carried a README announcing `## Skills (16)`, `## What's new in v14.2.3`, and an active feature freeze — while the pack inside it held 17 skills including `design-research`, which the README never mentioned. Nobody had downloaded it yet, which is luck rather than process. A pack whose entire claim is *verified rather than asserted* cannot distribute an artifact that disagrees with itself.

The existing release was left alone rather than rebuilt in place: moving a published tag is not a normal operation, and the honest fix for "we shipped the wrong file" is a new version, not a quiet swap.

### Changed — README rewritten around usage

Two problems, neither of them the figures.

**The skills section listed 17 skills and withheld the interface.** Routing happens on natural-language trigger keywords, so a reader who cannot guess the wording cannot reach the skill — and the table offered one line of jargon per skill. Every skill now carries what it covers, a link to its own router, and a *Try saying* prompt that actually routes there, grouped by intent (building something new · making it look right · making it work well · meta) rather than alphabetically.

**The pack asserted "no generic AI UI" without ever showing it.** A new section near the top lists eleven defaults agents reach for — `Inter` as the display face, the purple→pink→blue gradient, `min-h-screen`, `setTimeout` fake loaders, `ease-in` entrances, "John Doe" — against what the pack enforces instead and the constraint ID that fails the build for each. All fifteen cited IDs were checked against `parser_constraints.js` and `test_constraints.py`; a table of invented IDs would have been worse than no table.

The quickstart now shows a real prompt instead of stopping at install, and Verification states the vitest pass rate rather than leaving it implied. Nothing was dropped — every host row, demo, figure and link carried forward, and all 39 internal links resolve.

### Added — `docs/TESTING.md`, and an executable test suite

`npm test` could not run at all: gold examples import ~25 peer libraries the repo deliberately does not install, satisfied for `tsc` by ambient `declare module` blocks. Declaration files do not exist at runtime, so Vite could not resolve the specifiers and 29 of 39 files died at import. Expanding those `.d.ts` files cannot fix it — wrong layer — and `vi.mock` alone could not either.

`vitest.config.ts` now aliases 30 specifiers to runtime stubs under `test/stubs/`, taking the suite from **10 to 20 of 39 files**. A second cause was self-inflicted: 34 test files carried a hand-written `vi.mock('motion/react', …)` rendering every motion element as a `<div>`, which silently turned `motion.h1` into a non-heading. Removed from all 34; no gold component was touched.

The remaining 19 failures are listed by cause in [TESTING.md](TESTING.md) — 8 worker exits whose root cause is explicitly *not* established, 4 missing accessible roles, 7 assertions needing real Radix/TanStack/zod behaviour. `ARCHITECTURE.md`'s known-gaps entry claimed the suite "does not execute end-to-end"; that is no longer true in either direction, so it now states the measured number.

Gate 7 is unchanged and remains the blocking contract: 1:1 coverage plus strict compilation. `test/` and `vitest.config.ts` are in neither archive manifest and do not ship.

### Added — `CLAUDE.md`

Repo guidance for agent sessions: the gate traps that are not discoverable without reading `build_release.py` (the registry row regex accepts exactly one core dep; a registry skill must have at least one `examples/*.tsx`), the version-leak allowlist, the LF-vs-CRLF measurement convention, and the git discipline the concurrent-writer incidents produced.

### Fixed

- `metadata.json` stats were internally inconsistent: `ci_constraints: 53` against `parser_constraints: 16` + `regex_constraints: 35`. Now 17 + 36 = 53.

---

## [14.4.0] — 2026-08-02

**The feature freeze declared in `14.2.2` was overridden by owner directive on 2026-08-02.** None of its three lift thresholds — 10 distinct enhancement requests, 5 confirmed bugs, or 2026-08-13 — had been reached. Three branches of completed, gate-green work were held back by policy alone and were judged ready. The override, including what it cost, is recorded in [MAINTENANCE.md](MAINTENANCE.md#feature-freeze--overridden).

The version jumps 14.2.3 → 14.4.0 rather than 14.3.0 because the ingestion sprint had already claimed 14.3.0 on its staging branch; both merged here.

### Added — `design-research`, the seventeenth skill

Agents were already being handed URLs — "build it like this site", a Dribbble link, an Aceternity component. There was no protocol for that, so the behaviour was improvised: copy the pixels, or ignore the reference. `skills/design-research/` makes it a discipline. Research happens *before* the build, produces typed constraints rather than screenshots, and every finding lands as an OKLCH token, a grid definition, a `cubic-bezier`, or a step on the spacing scale. A finding that cannot be written as one of those was decoration, not a constraint.

Nine sources are registered with per-source extraction *and* rejection rules. Five references carry the depth: `source-extraction-protocol.md` (per-source-type rules, a fill-in template, failure modes), `dribbble-adaptation.md` (an artboard has no breakpoints — what survives translation and what does not), `mobbin-web-mapping.md` (native patterns to web primitives, and the five that should not be ported at all), `motion-easing-catalog.md` (easings, durations and stagger read off live sources), and `mcp-integration.md`.

That last one is deliberately unflattering: most design sites have **no MCP server**. Playwright MCP and browser-use are real and described accurately; 21st.dev, React Bits, Dribbble and Mobbin are documented as having none, with Playwright-DOM workarounds and, where the site is authenticated or bot-protected, an honest "the user has to do this part". When no browsing tool exists at all, the skill emits a research prompt and stops rather than inventing a palette and attributing it to a page it never opened.

Routing note: `component-patterns` already owned `aceternity`, `react bits` and `cult ui`. It still does. `design-research` fires on *referencing* intent — "inspired by", "like this site", a pasted URL — and hands off to `component-patterns` to build.

### Added — 50-source knowledge ingestion

Five new references, three appends to existing ones, six audit fixes from a second pass over the corpus, across `agent-ops`, `ai-ui-generation`, `animations`, `design-principles` and `design-system`. `reference_files` 76 → 86 across both merges.

### Fixed

- **`framer-motion` → `motion` package rename** across 71 files — 14 stub updates, 40 test mocks, 8 references (Issue #1). The upstream package was renamed and the pack still documented the dead import path.
- Two UX laws missing from `laws-of-ux.md` — Goal Gradient Effect, Design for Extremes (Issue #2).
- Skiper UI added to the component registry list in `shadcn-ecosystem.md` (Issue #3).

### Changed — every published figure re-derived

The three issues above were all "the docs claim something that stopped being true". Shipping a 17th skill while ~19 files still said "16 skills · 76 references · 305,771 tokens" would have manufactured the same defect at scale, so every count in every live document was recomputed from the git index — the LF measurement CI and the archive see, not the Windows working tree — and swept in the same commit series.

Current, verified against a green gate chain: **17 skills · 8 core files · 86 references (320,375 tokens of on-demand depth) · 45 examples (39 gold + 6 anti-examples) · 39 tests · 51 constraints · 9 gates · registry 1,888 tokens · heaviest request 6,075 tokens.**

`docs/RELEASE_NOTES-v14.2.*` and the changelog entries below are untouched — they are snapshots, correct as of their own dates.

---

## [14.2.3] — 2026-08-01

`## [14.2.2]` below called itself "last engineering release before the freeze. No features." This one ships a feature anyway — `install/` and `setup.sh`/`setup.ps1` were already substantially built, uncommitted, before the freeze took effect. Rather than let real, already-audited work rot uncommitted or discard it on a technicality, it ships once as a deliberate, explicit exception. The freeze resumes immediately after: no further features until it lifts on its own documented terms in `docs/MAINTENANCE.md`.

### Added — native per-agent adapters and a one-line installer

`install/` — one directory per agent, holding the file you'd otherwise write by hand after reading a setup doc: Cursor (`.cursor/rules/*.mdc`), Copilot (`copilot-instructions.md` + path-scoped instructions), Windsurf, Continue.dev and Aider (all four auto-installable). Claude, ChatGPT, Gemini and Codex CLI stay manual — there's no file an installer can safely drop in for a web-UI knowledge upload or a system-instruction field, so their cards give the real steps instead of pretending to automate one.

`setup.sh` / `setup.ps1` detect the agent from marker files already in the target directory (`.cursor/`, `.windsurf/`, `.continue/`, `.aider.conf.yml`, `.github/copilot-instructions.md`), refuse to guess when more than one matches, and never overwrite an existing file without `--force`/`-Force` — these are filenames other tools legitimately own.

Windsurf, Continue.dev, Aider and Codex CLI are marked **untested** everywhere they're mentioned: each adapter follows that host's own documented rules format, but none of the four is in `docs/AGENT_COMPATIBILITY.md`'s tested matrix. Honest about the gap rather than silently claiming parity with the six hosts that are.

`install/`, `setup.sh` and `setup.ps1` now ship inside the `.skill` archive itself (`scripts/build_release.py`'s `ARCHIVE_FROM_SRC`/`ARCHIVE_FROM_REPO`) — the archive is the transport layer for every host that isn't Claude Code, so an adapter that exists only in the git repo is unreachable to someone who downloaded the archive from Releases.

### Fixed

`metadata.json`'s top-level description still said "8 release-blocking gates" — the `stats.release_gates` field itself already said 9; only the prose had drifted.

---

## [14.2.2] — 2026-07-30

Last engineering release before the freeze. No features. Three defects, one honesty gap, one policy.

### Fixed — `--bump-patch` mangled the changelog it was editing

The `VERSION_TARGET` half was fixed in 14.2.1 but never exercised end to end, and testing it surfaced a second bug in the same function. `bump_patch()` anchored its insertion on the `#` heading and inserted immediately after it, which put the new release *above* the "All notable changes…" preamble and the `---` rule — stranding the preamble below the newest entry. It now anchors on the rule, which is what actually separates preamble from entries.

It also inserted unconditionally, so a release whose notes were written by hand got a duplicate header plus a "Patch release (auto-bumped)" stub contradicting the real entry directly beneath it. It now skips insertion when the version is already documented, which makes the flag usable for a real release rather than only for a contentless one.

**This release was cut with `--bump-patch` itself** — bump, 9 gates, archive, smoke test, release notes, in one command. That is the test, and it is the first time the flag has been run end to end.

### Fixed — `metadata.json` stats had drifted, and nothing reads them but people

The machine-readable stats block is the one file a consumer would parse to describe the pack, and no gate validates it. Five fields were wrong: `anti_examples` 3→**6**, `test_files` 37→**38**, `release_gates` 8→**9**, `registry_tokens` 1,770→**1,857**, `reference_depth_tokens` 295,152→**305,784**. All recomputed from disk rather than edited by hand.

The depth figure is worth a note: measured on the Windows working tree it comes to 305,801, because `build_release.py` floors `st_size // 4` per file and one reference had picked up CRLF endings. 305,784 is the LF measurement — the git index, and therefore what CI and the archive contain. Same root cause as the archive-size caveat in `docs/ARCHITECTURE.md`.

### Fixed — two stale figures the v14.2.0 sweep missed

`skills/agent-ops/references/token-optimization.md` cited `docs/ARCHITECTURE.md` for "a 1,800-token `SKILL.md` routes to 295,126 tokens" and "per-skill numbers (4,643–5,415 tokens)". Both were true when written and went stale in the same session that re-derived ARCHITECTURE's own numbers — a reference citing a doc is only as fresh as the sweep that touched them together. Now 1,857 / 305,784 / 4,744–5,512. Also `docs/INSTALL.md`: "all 43 examples" → **44**.

Deliberately **not** changed: the figures in `docs/RELEASE_NOTES-v14.1.*` and in historical `CHANGELOG` entries. They were accurate when cut, and editing shipped release notes to match today's build would be falsifying the record rather than correcting it.

### Added — the missing screenshot is documented instead of faked

`demo/showcase/` has no screenshot, because every release here was cut by an agent with no browser. Rather than ship a placeholder or a `![](screenshot.png)` pointing at nothing — a broken image says more about a project's health than a missing one does — the gap is stated in the README and `.github/SCREENSHOT_CONTRIBUTION.md` documents how to close it: 1920×1080, under 500 KB, reduced motion off so the particle hero actually renders, and no retouching, since a staged screenshot would make the whole verification story worthless.

### Added — `docs/MAINTENANCE.md`: feature freeze, effective now

The remaining risk to this project is churn, not missing features. The freeze lifts on **10 distinct requests for one feature**, **5 confirmed bugs**, or **2 weeks of actively monitored silence** — where "actively monitored" means issues are being read, not that nobody looked. Permitted meanwhile: typo fixes, broken-link fixes, and reported-bug fixes that pass the chain. Not permitted: refactors in passing, unprompted dependency bumps, or rewording the anti-slop wall because a better phrasing occurred to someone.

### Verified — no change needed

`docs/LAUNCH_KIT.md` was already accurate: 16 skills · 76 references · 305,784 tokens · 44 examples (38 gold + 6 anti) · 38 tests · 16 + 35 = 51 constraints · 9 gates · registry 1,857 · heaviest request 5,512. It also carries a do-not-say list that pre-emptively rejects two figures circulating in briefs for this sprint — "42 gold examples" and a fabricated claim about the compiler finding 8 bugs. One line was added to its known-limitations block for the absent screenshot.

## [14.2.1] — 2026-07-29

Verification pass over the v14.2.0 artifact. Everything below is a defect that existed in v14.2.0 and was found by making a check real rather than by reading the code again.

### Fixed — `demo/showcase/` was exempt from the content rules

It had been skipped by `test_constraints.py` on the same reasoning that justifies its compile exemption. That reasoning does not carry. OKLCH tokens, banned fonts, placeholder copy, state coverage and touch targets are properties of authored code, not of how it is type-checked — only the *compile* regime is special about this app. It is now the fourth demo project in the regex suite, and its nine authored `.tsx` files run through the parser. Vendored and generated trees (`node_modules/`, `.next/`, `next-env.d.ts`) are skipped, since those are not authored code.

**Four real defects surfaced on the first run**, which is the whole argument for running it:
- `app/layout.tsx` typed its props with an inline object literal rather than a named interface (`TS-01-AST`) — now `RootLayoutProps`.
- `app/page.tsx` declared no types at all and hand-repeated two nearly identical CTA anchors (`TS-01-AST`) — now a typed `HeroCta[]` with a tone map.
- `BentoGrid.tsx` had a `transition-opacity duration-300` with no `motion-reduce` escape (`MOTION-01`).
- `Footer.tsx` declared no types at all (`TS-01-AST`).

### Fixed — `STA-01` scored working forms as stateless

The check looked for `animate-pulse|isLoading|skeleton`, so a form that disables its submit button and renders "Sending…" counted as having no loading state. `isSubmitting` (react-hook-form), `isPending` (React 19 transitions) and `aria-busy` name the same state and now count. Still 51 checks across 51 distinct IDs; 38/38 golds and 4/4 demo projects pass, and the self-test's negative fixtures still fail as designed.

### Fixed — a reference nothing could reach

`skills/design-system/references/brand-design-systems.md` (68 public design systems across 9 categories) was on disk but absent from its own skill's Reference Index. Under lazy loading that is not cosmetic: a reference no skill file points at can never be loaded, so ~22k tokens shipped as dead weight. **76/76 references now resolve, none orphaned** — the reference-depth audit had been reporting 75.

### Fixed — `--bump-patch` could never pass its own gate chain

`VERSION_TARGET` was read at import time, so a run that bumped `metadata.json` and all 16 skill files mid-process then compared them against the *pre-bump* string and failed Gate 2 on every skill. Version is now read at call time. The flag has presumably never worked; every release to date was cut with the version bumped by hand beforehand.

## [14.2.0] — 2026-07-29

### Added — `skills/agent-ops/`
A 16th skill covering agent operating discipline rather than UI patterns: token/context budgeting, cross-session memory persistence, incorporating feedback without being told twice, self-verification before returning work, safe parallelization, and subagent dispatch/integration. Six references (`token-optimization.md`, `memory-persistence.md`, `continuous-learning.md`, `verification-loops.md`, `parallelization.md`, `subagent-orchestration.md`), one gold example (`good-agent-status-panel.tsx` — a token-budget meter + subagent task-queue status panel, all four states, 16/16 parser + 35/35 regex constraints) with its 1:1 test, and a router `SKILL.md` (`core-deps: core/agent-behavior.md, core/validate-checklist.md`). New registry row added to `SKILL.md`. Not to be confused with the pre-existing, unrelated UI-pattern references of the same base filenames under `data-tables/`, `forms/`, `platform/`, and `react-performance/` — those are about building interfaces *for* memory/orchestration/etc. concepts; this skill is about the agent's own operating discipline.

### Added — cross-agent setup docs
Five new docs alongside the existing `docs/CLAUDE_SETUP.md` and `docs/CURSOR_SETUP.md`: `docs/CHATGPT_SETUP.md`, `docs/OPENAI_API_SETUP.md`, `docs/COPILOT_SETUP.md`, `docs/GEMINI_SETUP.md`, and `docs/AGENT_COMPATIBILITY.md` (a feature-row matrix across seven surfaces — Claude Code, Claude Desktop, Claude.ai, Cursor, ChatGPT, OpenAI API, Copilot, Gemini — with rows for routing, lazy loading, reference depth, the anti-slop wall and validation). Every doc is explicit about the one fact that actually matters for this pack: whether the target agent has real on-demand file access (true lazy loading) or must front-load everything. Claude Code is the only host with a real filesystem; everywhere else the loading model degrades to retrieval, `@`-referencing or pasting, and each doc says which.

Platform limits are stated where they are verifiable and sourced, and described qualitatively where they are not. The one that changes a decision: a Custom GPT accepts **20 knowledge files for the lifetime of that GPT** ([OpenAI, File Uploads FAQ](https://help.openai.com/en/articles/8555545-file-uploads-faq)), against this pack's 8 core + 16 routers + 76 references. You must therefore curate in advance exactly the choice the registry was designed to defer until the request arrives — which is the honest headline for that platform, and had been omitted.

### Added — `demo/showcase/`
A deliberate, one-time departure from this repo's stub-typed demo convention (`demo/_stubs.d.ts`, never installed, never run): a real, standalone Next.js 15 + React 19 + TypeScript + Tailwind v4 app with its own `package.json`, real installed dependencies (`@react-three/fiber`/`@react-three/drei` on their React-19-native majors, `react-hook-form` + `zod`, real Tailwind v4), `npm install` actually run, `tsc --noEmit` actually clean against real package types (not ambient stubs), and a dev server actually started and curl-verified (200, real server-rendered HTML, no hydration errors). It's a cinematic dark-mode landing page for a fictional "Nexus" AI analytics product — OKLCH-only near-black + single acid-green accent, Manrope + JetBrains Mono, asymmetric bento grid, WebGL particle hero (R3F), tabular-nums pricing with a working annual toggle, a View-Transitions testimonial carousel, and an RHF+Zod contact form with real `aria-describedby` wiring. `demo/showcase/README.md` documents the exact prompt that generated it — the trust-building "copy this and try it yourself" artifact this release exists to ship.

### Changed
- `SKILL.md` registry: 16th row for `agent-ops`.
- All 16 skill files bumped to `version: "14.2.0"`.
- `metadata.json`: version, description, and stats recomputed against the actual current build (skills 15→16, new reference/example counts, showcase demo noted separately from the three stub-typed demos, since it is verified by a different regime — see Gate 9 below).
- `README.md`: new "See It In Action" section linking the showcase and its prompt; per-agent setup links extended to all six docs.

### Added — Gate 9: the showcase build is now release-blocking

`demo/showcase/` claims to be a *runnable* app. Nothing checked that, and an unchecked claim in a README is the exact rot this project exists to prevent — the pre-v13 system prompt cited 28 dead paths for three majors because only its headings were validated.

- **`gate_showcase()` runs `next build`** against the app's real installed dependencies and blocks the release on failure. It cannot use the stub tsconfig the other demos share: `demo/_stubs.d.ts` exists to declare *absent* libraries as `any`, so type-checking an app whose dependencies are genuinely installed reported errors about packages that were sitting in `node_modules`. That misdiagnosis is what `demo/tsconfig.json`'s new `exclude: ["showcase"]` fixes.
- **A dedicated `showcase` CI job** installs those dependencies on a clean runner and runs `tsc --noEmit` + `next build`. Locally the gate skips with a warning when `node_modules` is absent rather than pretending to have checked — a fresh clone has no showcase dependencies, and a gate that silently passes on missing input is worse than one that says why it abstained.

At this point the gate verified only that the app *builds*; holding it to the content rules came in 14.2.1, and immediately found four defects.

### Fixed — stale counts across the docs

Adding a 16th skill invalidated figures in eight files that no gate reads. Swept against a green `--dry-run`: **16 skills** (was 15), **76 references** (was 70), **305,784 tokens** of reference depth (was 295,126), registry **1,857 tokens** (was 1,800), per-request **4,744–5,512** (was 4,643–5,415), marginal cost of a skill **~71 tokens** (was ~43), **9 gates** (was 8). `docs/RELEASE_NOTES-v14.1.*` were left alone — they were accurate when cut, and rewriting shipped release notes would be falsifying the record rather than correcting it.

## [14.1.2] — 2026-07-28

### Fixed — the four issues carried from 14.1.1

- **CI ran on a deprecated Node.** `actions/setup-node` was pinned to `node-version: '20'`, which GitHub now force-upgrades to 24 with a warning on every run. Pinned to `'24'` in `ci.yml` and `release.yml`.
- **"Deterministic archive build" overclaimed.** The archive is reproducible *per-platform*: CI produces a byte-identical zip for its own environment, but a local Windows build differs by ~400 bytes because `.gitattributes` normalises the repo to LF while the working tree holds CRLF. `docs/ARCHITECTURE.md` now says exactly that instead of implying cross-platform byte equality.
- **The `A11Y-01`/`A11Y-02` ID collision is closed.** Each name had been attached to one parser rule *and a different regex rule*, so 51 checks covered only 49 distinct IDs. The two regex checks — icon-only `aria-label`, and input/label association — were renumbered to **`A11Y-07`** and **`A11Y-08`**. Now **51 checks across 51 distinct IDs**, every ID unique to one suite.

  *Deviation from the sprint brief, deliberately:* the brief specified renaming them to `A11Y-03` and `A11Y-04`. Both targets are already occupied — `A11Y-03` by a parser rule, `A11Y-04` by an existing regex rule — so that rename would have replaced one collision with two. `A11Y-03` and `A11Y-06` also belonged to checks retired in 12.1.3, so `07`/`08` are the first names never used. Every existing `A11Y-01`/`A11Y-02` citation in the skill files and docs refers to the *parser* sense and needed no change.
- **`AGENT_SYSTEM_PROMPT.md` trimmed 4,128 → 3,952 tokens**, under the 4,000 ceiling. Nothing was dropped: what went was text restating files the prompt already names as authoritative — the enumerated 16 AST rules (the loaded checklist has them), and VALIDATE checkboxes that repeated Passes 1, 3 and 5 verbatim. The prompt is a router; duplicating its own dependencies was the bug.

  *Measure it the way the pipeline does.* 3,952 is the shipped size — the git index, which is LF because `.gitattributes` normalises it, and therefore what CI and the archive contain. The same file on a Windows working tree measures **4,006** tokens, because 217 CRLF line endings add a byte each. `tokens()` in `build_release.py` reads `st_size`, so a local run and a CI run legitimately disagree by ~54 tokens on this file. Same root cause as the archive-size caveat above; worth knowing before anyone reports the budget as breached.

### Added — three dogfood demos

`demo/` holds three complete projects generated by routing through the registry, not hand-written to look good:

| Demo | Route | Demonstrates |
|---|---|---|
| `demo/landing-page/` | `landing-pages` + `core/design-tokens.md` | Dark OKLCH surface, asymmetric bento grid, tabular-nums pricing, skip link |
| `demo/dashboard/` | `data-tables` + `react-performance` + `core/component-api.md` | Sortable table with all four states, `next/dynamic` chart, `content-visibility` |
| `demo/auth-form/` | `forms` + `core/component-api.md` | RHF + Zod, `aria-describedby` errors, OAuth, jest-axe test |

- `demo/validate.sh` runs the compile, parser and regex suites over the demos; `demo/_stubs.d.ts` ambient-declares the peer libraries so `tsc --strict` checks *our* code rather than vendor typings, matching the gold-example convention.
- **Demo validation is wired into the gate chain**, not left as a script somebody remembers to run. A README that claims the demos pass the same 51 constraints would otherwise rot the moment a constraint changed — the same failure mode as the pre-v13 system prompt.
- **`test_constraints.py` gained `--recursive` and `--project`.** A gold example is one self-contained file, so every constraint can be answered from it. A demo is a project — the font lives in the page shell, the error branch in one component, the 44px targets in another — and judging each file alone would have demanded that `lib/data.ts` declare a font and render a loading skeleton. `--recursive` reaches the nested `app/`, `components/`, `lib/` layout; `--project` makes the unit of judgement one demo directory, reported once over its concatenated sources. The `--dir skills` path is untouched and still per-file.
- **`react-hook-form` and `zod` needed real stubs, not shorthand ones.** `useForm<LoginValues>()` and `z.infer<typeof schema>` both pass type arguments, which TypeScript refuses on a call typed `any` (TS2347). `demo/_stubs.d.ts` now declares both with generics, so the form's values stay checked end to end instead of collapsing to `any` at the first boundary. `LoginValues` is written out rather than inferred, because the stub's `infer` resolves to `any` and using it would silently untype `register`, `handleSubmit` and `onAuthenticate`.
- Demos are proof, not doctrine: where a demo and a skill rule disagree, the rule wins and the demo is the bug.

### Added — per-agent setup guides

- `docs/CLAUDE_SETUP.md` — Claude Code (skills directory, no system prompt needed — the `SKILL.md` frontmatter does the routing), Claude Desktop projects, and Claude.ai. Documents how lazy loading *degrades* without a filesystem, since Desktop retrieves chunks instead of reading paths, and gives a one-question test for whether routing actually took.
- `docs/CURSOR_SETUP.md` — `.cursor/rules/*.mdc` with globs so the rule attaches on component files and stays out of the backend, plus the legacy `.cursorrules` fallback and `@`-reference patterns for Chat and Composer.
- Both are linked from the README quick start and docs index.

---

## [14.1.1] — 2026-07-27

### Fixed — `AGENT_SYSTEM_PROMPT.md` rewritten for the registry architecture

The drop-in system prompt was pre-v13 and was the last launch blocker. It has been rewritten rather than patched.

- **28 of the 31 paths it cited did not exist.** Only `SKILL.md`, `metadata.json` and `rules/v12-envelope.schema.json` resolved. It routed to a flat `references/` directory that v13 replaced with `core/` + `skills/{id}/references/` — so an agent following it would fail to load `references/agent-behavior.md`, `references/component-api.md`, `references/testing.md`, `references/_index.md`, and every one of the 20 bare reference filenames in its shortcode table.
- **It had no concept of the registry.** Zero mentions of `skills/`, `core/`, or routing. It told the agent to read `SKILL.md` as a ~5.1k-token monolith containing the pipeline and checklist, then load references against an ≤8,000-token reference budget. The registry is 1,770 tokens and the budget is ≤8,000 for *everything*.
- **Its shortcode fast-path table is gone.** 20 bracket aliases (`[patterns]`, `[dash]`, `[rhf]`, …) mapped to files at paths that no longer exist. Routing is now trigger-keyword matching against the registry table, which is the single source of truth for keywords — the prompt no longer duplicates them and so cannot drift from them.
- **Its `[json]` envelope example violated its own schema.** `rules/v12-envelope.schema.json` requires `eval_ids_applicable` in `metadata`; the documented example omitted it, so a compliant agent would emit an invalid envelope.
- The prompt now references `core/agent-behavior.md` instead of restating its four principles, per the core-file split — behaviour has one home.
- Added: registry loading protocol, user-intake trigger, per-pass core-file citations, the four `BEHAV` self-checks, and the two v14 anti-slop bans (never silently default to an aesthetic; never put the LCP element behind a shader that must compile first).

### Fixed — the `[json]` envelope schema was stale and unvalidated

Found by validating the documented envelope against the schema it names. Nothing had ever done that, which is how the same drift recurred twice.

- **`constraints_passed`'s item pattern was `^[A-Z]+-[0-9]+$`, which rejects every ID the pack actually uses.** `[A-Z]+` cannot match the digits in `A11Y`, and there was no room for the `-AST` suffix — so `A11Y-01`, `3D-01`, `COL-02-AST`, `TS-01-AST` and `PERF-04R` all failed. The schema's own embedded example failed its own pattern in six places.
- **`constraints_checked` was capped at `maximum: 29`**, a v12 figure. The pack enforces 51. Raised.
- **`skills_loaded` was missing.** The registry routes to exactly one skill per request and the envelope had no way to report which — and `metadata.additionalProperties` is `false`, so adding it to the example without adding it to the schema made the documented output invalid. Added as a required property with a `^skills/[a-z0-9-]+/SKILL\.md$` pattern.
- **`intent` had no `TEST_COMPONENT`**, though the prompt has a whole test-generation mode. Added.
- **The schema's example used pre-v13 `references/…` paths** in `files_loaded` and ten constraint IDs that exist nowhere else in the repo. Regenerated against `core/validate-checklist.md`.
- **`$id` pointed at a username that does not own this repo.** Corrected.

**Gate 6 now validates both the envelope documented in `AGENT_SYSTEM_PROMPT.md` and every example embedded in the schema**, using a dependency-free JSON Schema subset validator (`type`/`required`/`additionalProperties`/`properties`/`items`/`enum`/`const`/`pattern`/`minimum`/`maximum`/`minLength`). Verified by negative test: injecting a forbidden key reports `metadata: additional property 'bogus_key' not allowed`, and an out-of-range value reports `metadata/constraints_checked: 99 > maximum 51`.

### Fixed — Gate 6 now verifies what it claims

- **Gate 6 reported `9/9 stage markers` while actually scoring 7/9.** Two of its three extra checks had been failing silently: it required a `MIGRATION FROM v11` heading, and a `DESIGN.md` mention. The count was a hardcoded string in `build_release.py`, the same defect class as the `8/8` and `24/24` labels fixed in 14.1.0. Counts are now derived from the checker's own output.
- **The obsolete `MIGRATION FROM v11` requirement was replaced** with checks that match the current architecture: the prompt must describe registry loading, cite `core/` dependencies, and carry the anti-slop wall.
- **Gate 6 now resolves every path the prompt cites** — and rejects pre-registry `references/`/`_meta/` prefixes and bare reference filenames, because the rot took all three forms and an existence test on `skills/…`-rooted paths alone catches *none* of them. Verified by running the new check against the old file before trusting it: it fails with 5 checks red and names all 28 dead paths. A guardrail nobody has watched fail is not a guardrail.
- **Every Gate 6 check is now blocking.** Previously only the six stage markers gated the exit code, so architecture and path rot could not fail a build even when detected.

### Fixed — measured token figures

- **`SKILL.md`'s own loading protocol overstated its costs by 2–3×** — it told agents a skill file is `~3–5k` and each core dep `~2k`, against measured 0.8–1.6k and 0.6–0.9k. An agent doing the arithmetic would conclude every code-producing request breaches the 8,000-token budget. Corrected to measured values.
- Registry is **1,800 tokens** (was documented as 1,770 before this release's edits); per-request load is **4,643–5,415**; skill files **801–1,588**. Every figure in `README.md`, `docs/USAGE.md`, `docs/ARCHITECTURE.md` and `docs/LAUNCH_KIT.md` re-derived from a green run.
- **`min-h-screen` and equal-card grids were described as regex-enforced** in the prompt's VALIDATE section and in `ARCHITECTURE.md`. Neither appears in `scripts/test_constraints.py` — they are anti-slop wall items the agent enforces, not tooling. Replaced with the real IDs (`TOK-01`, `TYP-01`, `SLOP-01`–`04`, `QUA-02`, `QUA-03`, `RES-01`, `TOUCH-01`).

### Known — two constraint IDs are ambiguous

`A11Y-01` and `A11Y-02` each name one parser rule **and** a different regex rule, so the headline 51 is **51 checks across 49 distinct IDs**. All 51 checks run; the collision only makes a bare ID ambiguous about which layer flagged it. Renaming touches both suites, `core/validate-checklist.md` and the skill files that cite them, so it is deferred and documented in `docs/ARCHITECTURE.md`.

---

## [14.1.0] — 2026-07-27

### Fixed — release engineering

The gate chain could not pass and no archive could be produced. Every item below was found by running it.

- **Gate 2 failed all 15 skills.** `VERSION_TARGET` in `build_release.py` was hardcoded to `13.0.0` while every skill declared `14.1.0`, so the chain aborted at the second gate. It now reads `metadata.json`, which is the single source of truth Gates 1 and 2 already share.
- **The pre-flight version-leak scan was a silent no-op.** `VERSION_RE` matched only `1[12].x.y`, so it could not see a 14.x string. Widened to any 1–2 digit major, with `skills/` and `.github/workflows/` exempted — Gate 2 *requires* skill files to carry the version.
- **Five scripts crashed on Windows** before running a single check: `cp1252` consoles cannot encode the `✓`/`✗`/`⚠` glyphs. `stdout`/`stderr` are now reconfigured to UTF-8, and subprocess capture decodes as UTF-8 with replacement.
- **`tsc` could not be invoked on Windows.** The extensionless `node_modules/.bin/tsc` is a POSIX script; only the `.cmd` shim is executable. Both call sites now prefer it on `win32`.
- **Gate 7 misreported what it verified.** It probed `ROOT.parent/node_modules` for vitest — the wrong directory — so the runtime branch never fired and a compile-only pass was reported as though the suite had run. The gate now states its real contract: 1:1 test coverage plus strict compilation of every test file. Runtime execution is out of scope and documented as such.
- **Gate labels were three versions stale**, printing `8/8` semantic and `24/24` syntactic against the documented 16 and 35. Both counts are now derived from the suites themselves.
- **`npm run gates` and `npm run build` ran the wrong script** — `package.json` still pointed at the pre-registry `src/scripts/` copies, and at `python3`, which is absent on most Windows installs.
- **`evals/` and `rules/` were never migrated to the root** in the v13 restructure. `run_evals.py` resolves `../evals/evals.json`, so Gate 7's eval half could not run, and `ARCHIVE_FROM_SRC` already expected both at the root — archives shipped without them. Moved.
- **`vitest.config.ts` had no `setupFiles`**, so `@testing-library/jest-dom` matchers were never registered and every DOM assertion failed with `Invalid Chai property`. Adding `vitest.setup.ts` took the suite from 32 to **43 of 50 tests passing**; it also still pointed `include` at the removed `src/examples`.
- **Root `tsconfig.json`** pointed at `src/examples`, type-checking a tree that no longer exists.
- **`release.yml` hardcoded `body_path: docs/RELEASE_NOTES-v14.1.0.md`**, which would break every subsequent tag. It now derives the path from the tag name.
- **`bump_patch()` wrote to `_meta/CHANGELOG.md`**, which does not exist at the root; it now uses the resolved `CHANGELOG` path.

### Removed

- **`src/` — the entire pre-registry v12 tree** (157 files, 2.6 MB). Nothing read from it and 55 of its 61 reference files were byte-identical to their `skills/` counterparts. `core/` + `skills/` + `scripts/` is now the only layout.
- **`skills/react-components/references/icons-avatars.md`** — byte-identical duplicate of the `iconography` copy, uncited by its own skill's Reference Index and flagged by the path-integrity stage. `react-components/SKILL.md` already delegates icons to `../iconography/SKILL.md`. This completes the ownership transfer this release claimed to have made, and restores the documented **70 references / 295,126 tokens**.
- **Root `CHANGELOG.md`** — 36 version entries, all 36 also present in this file's 44. `build_release.py` resolves the changelog to `docs/CHANGELOG.md`.
- **`SKILL-v13-registry.md`** — the v13 registry draft, superseded by `SKILL.md`.

### Documentation

- `docs/INSTALL.md` and `docs/ARCHITECTURE.md` rewritten — both still described the v12 layout (`src/` flattening, 7 gates, 8 AST checks, 24 regex checks) three majors after it was replaced.
- `docs/LAUNCH_KIT.md` added.
- `docs/ARCHITECTURE.md` gained a **Known gaps** section covering the pre-registry `AGENT_SYSTEM_PROMPT.md`, the non-executing vitest suite, the orphaned `brand-design-systems.md`, and uneven reference depth.
- Two unverifiable claims were removed from draft launch copy: *"the TypeScript compiler found 8 bugs that 30 regexes certified as clean"* (no record of this exists anywhere in the repo) and *"42 gold examples"* (there are 37 golds and 6 anti-examples).

### Added — Batch 6: two genuinely new categories (15 skills total)
- **`skills/iconography/`** (804) — icons treated as typographic, not decorative: `em` sizing (1em inline / 1.25em beside a label / 1.5em standalone), **hit area is independent of glyph size** (18px icon in a 44×44px target), weight must match text weight, `fill`/`duotone` as *state* not default (a shape change survives WCAG 1.4.1 where colour alone does not), `currentColor` inheritance, label-the-control-hide-the-glyph, individual imports only (`PERF-01`), optical alignment beats box alignment. New `references/icon-systems.md`; **took ownership of `icons-avatars.md`** from `react-components` rather than duplicating it.
- **`skills/ai-ui-generation/`** (800) — prompt-to-UI, JSON-to-UI and generative interfaces. Core position: **generated code is untrusted input** and passes the same 51 constraints with no exemptions. Registry pattern (closed, typed, Zod-validated — the registry is the safety boundary, a prompt is not), never `dangerouslySetInnerHTML` on model output, schema validation before render, documented fallback for unknown components, and the list of what generators always omit (four states, reduced motion, aria-labels, real prop interfaces). New `references/generation-patterns.md`.

### Skipped — pre-integrated (dedup before fetch)
- `microsoft/playwright-mcp` — `skills/testing/references/playwright.md` already covers role selectors, visual regression, axe, network mocking, CI.
- `emilkowalski/skills` — integrated at v10.x; `animation-framework.md` is built on it.

### Not reached (context budget) — carry to final catch-up
`thesysdev/openui`, `tambo-ai/tambo`, `miurla/morphic`, `vercel-labs/json-render` (tool-specific references for the new skill), `phosphoricons.com`, `ditther.com`, `patrickkrebs/theme-factory-addon`, `heygen-com/hyperframes`.

---

### Content harvest — full detail

#### Summary
Six ingestion batches processed ~45 external sources into the v13 registry architecture. **~60% were already integrated** and were skipped by a dedup check run *before* fetching — that check saved roughly a dozen redundant fetches and any amount of duplicated content.

### Skills added in v14 (11 → 15)
`design-principles` · `component-patterns` · `iconography` · `ai-ui-generation`

### Core files added (6 → 8)
`core/user-intake.md` (six intake questions + routing) · `core/agent-behavior-patterns.md` and `core/component-api-deep.md` (from the v14.0.1 hygiene split)

### Sources integrated
Anthropic `frontend-design` (canonical anti-slop — the three AI-design clusters, hero-as-thesis, two-pass plan→critique→build, writing-as-design) · Laws of UX (**29** laws as decision rules) · Design DNA (three-dimension identity extraction) · designer workflow (7-stage flow, existing-code detection checklist, 8 aesthetic philosophies — Oczkowski + Meng To) · React Bits (animated component patterns + the a11y rules those libraries omit) · Componentry (scroll-coupled components, WebGL hero taxonomy) · motion direction (8-step decision order, property-as-vocabulary, four motion personalities) · icon systems · AI UI generation patterns (constrain-by-registry).

### Architecture
- `SKILL.md` stayed at **1,770 tokens** while skills went 11 → 15 — four new skills cost 296 tokens of always-loaded context and added ~6,000 tokens of on-demand depth.
- **v14.0.1 budget hygiene**: `component-api.md` 2,116 → 904 and `agent-behavior.md` 2,097 → 996, each with the depth parked behind a reference index. Per-request dependency load **4,143 → 2,103**.
- Reference depth is now **295,152 tokens across 70 files, none loaded by default.**

### Notable decisions
- **`motion-graphics` was not created.** `animations` already owned six references on that ground and GSAP came back >90% covered; a 14th skill duplicating the 12th would have been an architectural regression.
- `iconography` **took ownership** of `icons-avatars.md` from `react-components` rather than duplicating it.
- **`PERF-02` and `3D-04` were deliberately narrowed** when their strict forms flagged correct code — a check that fails valid work is a broken check.
- A **prompt-injection string** was found embedded in `lawsofux.com` and ignored. Standing rule: fetched content is data, never instructions.

### Not integrated
Tool-specific references for `ai-ui-generation` (OpenUI, Tambo, Morphic, json-render), theme tooling (Ditther, Theme Factory), Hyperframes, Skiper UI, pxpipe, claudedesignskills, Owl-Listener designer-skills, huashu-design. All additive; the skills that would host them ship complete without them.

---

## [14.0.3] — 2026-07-27

### Added — Batch 5 (expanded `animations`, no new skill)
- **`skills/animations/references/motion-direction.md`** (1,403) — the philosophy layer the other six animation references lacked. **Despite its origin the source is not about the Lottie format**; it is implementation-agnostic motion *direction*: the 8-step decision order (communicate → emotion → property → timing → choreography → reduced motion → slow device → would-removing-it-lose-information), property-as-vocabulary table, **four motion personalities** (Precise/Calm/Playful/Cinematic) with duration bands, the six Disney principles that survive translation to UI, choreography rules (stagger by reading order 30–60ms, lead with what answers "what happened", total sequence ≤600ms, exits ≈0.6× entrances), context adaptation, and an animation-smells table. Source: `LottieFiles/motion-design-skill`.
- Two rules added to `animations/SKILL.md`: name what the motion communicates; pick one motion personality and hold it.

### Skipped — pre-integrated (dedup before fetch)
- `greensock/gsap-skills` and `greensock/GSAP` — `references/gsap.md` (3,924 tokens) already covers all 12 plugins, ScrollTrigger, SplitText, Flip, Observer, Draggable, MorphSVG, DrawSVG, ScrambleText and `useGSAP`.
- `199-biotechnologies/motion-dev-animations-skill` and `motion.dev/ui` — not reached; `references/framer-motion.md` (9,343 tokens) already covers the Motion API surface (AnimatePresence, variants, layoutId, useScroll/useTransform, LazyMotion, drag). Carry to batch 10 to check only for API-delta since the Framer Motion → Motion rename.

### Architectural note
The roadmap called for a new `skills/motion-graphics/`. **Not created** — `skills/animations/` already owned six references on exactly that ground, so a 14th skill would have duplicated the 12th. All batch-5 content expanded the existing skill, per the >50%-overlap rule.

---

## [14.0.2] — 2026-07-27

### Added — Batch 4
- **`skills/component-patterns/references/componentry.md`** (1,090) — scroll-coupled component patterns and a WebGL hero taxonomy, the two areas `react-bits.md` doesn't cover. Five categories with cost ratings; the scroll-coupled rules (scrub-coupled not time-based, ≤3-viewport pins, decoration may be scroll-gated but information may not, pinned→stacked under reduced motion); WebGL hero performance floor (DPR cap, IntersectionObserver pause, never put the LCP element over an uncompiled shader, static poster fallback); cursor-physics accessibility (pointer-only by definition — never the only affordance). Source: `componentry.dev` / `harshjdhv/componentry`, also available over MCP.
- Two new rules in `component-patterns/SKILL.md`: scroll-coupled means scrub-coupled; scroll-coupled reveal pattern.

### Skipped — pre-integrated (dedup before fetch)
- `ui.aceternity.com/components` and `21st.dev/community/components` — both catalogued in `shadcn-ecosystem.md` (v10.12.0).
- `reactbits.dev/get-started` — docs site for `DavidHDev/react-bits`, ingested in batch 3 as `react-bits.md`.

---

## [14.0.1] — 2026-07-27

### Changed — budget hygiene (refactor only, no new content)
- **`core/component-api.md` split 2,116 → 904** + new **`core/component-api-deep.md` (1,527)**. Thin file keeps the prop taxonomy, a minimal forwardRef template, the `asChild`/`as` doctrine, CVA integration and the controlled/uncontrolled table. Compound components, composition patterns, API anti-patterns and the full forwardRef rules moved to the deep file, reachable from both `core/component-api.md` and `skills/react-components/`.
- **`core/agent-behavior.md` split 2,097 → 996** + new **`core/agent-behavior-patterns.md` (947)**. Thin file keeps the four principles, the pipeline-stage table and the anti-pattern bans. The design-work addendum, external behavioural patterns and the per-principle applications moved to the deep file.
- **`skills/component-patterns/`** dropped `core/design-tokens.md` from `core-deps` — it *consumes* tokens, it doesn't define them. Token depth now loads on demand from `skills/design-system/`.

### Result
Per-skill dependency load **4,143 → 2,103 tokens**. Worst-case request budget:

| Skill | Before | After | Headroom |
|---|---|---|---|
| `component-patterns` | 6,818 | **4,814** | 3,186 |
| `react-components` | 6,867 | **4,827** | 3,173 |
| `threejs-3d` | 6,811 | **4,771** | 3,229 |
| `forms` | 6,701 | **4,661** | 3,339 |
| `data-tables` | 6,645 | **4,605** | 3,395 |

No rule was deleted — everything moved is reachable via a Reference Index. All 8 gates pass unchanged.

---

## [14.0.0] — 2026-07-26

### Added — Omnibus harvest, batch 1 (corrected list)
- **`skills/design-principles/`** (1,358 tokens) with three references:
  - **`anthropic-frontend-design.md`** (1,806) — the canonical anti-slop skill from `anthropics/skills`, extracted in full. The **three AI-design clusters** (cream+serif+terracotta · near-black+acid accent · broadsheet hairline), hero-as-thesis, structure-encodes-truth, orchestrated-moment-over-scattered-effects, the two-pass plan→critique→build process with ASCII wireframes and a named signature element, CSS-specificity warning, Chanel's remove-one-accessory rule, and writing-as-design-material.
  - **`laws-of-ux.md`** — 29 UX laws as decision rules with the interface consequence each forces.
  - **`design-dna.md`** — three-dimension identity extraction and the polish-iteration prompt.
- **`core/user-intake.md`** (772) — six intake questions with a routing table; asks only what is load-bearing, batched into one message.
- **`core/agent-behavior.md`** — design-work addendum: pin the subject, plan→critique→build, self-critique during the build, remove one accessory, keep notes across passes.
- **Anti-slop wall** gained the three AI-design defaults and the numbered-marker rule.
- Token-optimization layer and typography/canvas rules (see `skills/react-performance/references/token-optimization.md`, `core/design-tokens.md`).

### Skipped (already integrated — dedup rule)
- `pbakaus/impeccable` — integrated v10.9.0 as `impeccable-techniques.md`.
- `alchaincyf/huashu-design` — README returned empty; deferred to batch 2 for a retry.

### Batch 2 additions
- **`skills/design-principles/references/designer-workflow.md`** (1,267) — the 7-stage design flow (grill → brief → IA → tokens → tasks → build → review) with `.design/{feature}/` persistence · the **existing-code detection checklist** (CSS vars, Tailwind config, framework theme, component dirs, Storybook, token files, font loading, package.json) — P3 applied to design work · **8 aesthetic philosophies** (Rams, Swiss, Japanese Ma, Brutalist, Scandinavian, Art Deco, Neo-Memphis, Editorial) with the naming rule · Meng To's four working principles and the design-first prompt order (goal → format → layout → type → colour → constraints). Sources: `julianoczkowski/designer-skills`, `MengTo/Skills`.
- **`core/agent-behavior.md`** — External behavioural patterns: grill before building, detect before generating, persist decisions, change 1–2 things per iteration, state the aesthetic you picked, references beat paragraphs, negative prompts.
- Three new rules in `design-principles/SKILL.md` (detect-before-generate, name-the-aesthetic, iterate-by-1–2).

### Batch 2 skipped (pre-integrated)
- `nextlevelbuilder/ui-ux-pro-max-skill` — v10.7.0 → `ux-deep-rules.md` (5,268 tokens) + `landing-patterns.md`. Verified present; not duplicated.
- `sickn33/agentic-awesome-skills` — sibling repo `sickn33/antigravity-awesome-skills` integrated v10.3.0 (`threejs-advanced`, `shadcn`, `dark-mode`, `icons-avatars`).

### Batch 3 additions
- **`skills/component-patterns/`** (996 tokens) — 13th skill. Patterns from animated component libraries with the accessibility and performance rules those libraries omit: split-text must stay one string for assistive tech (`aria-label` wrapper + `aria-hidden` spans), animate wrappers never text nodes, backgrounds are `aria-hidden`/`pointer-events:none`/contrast-tested, ambient loops stop under reduced motion and pause off-screen, pointer-derived effects are never the only affordance, one showpiece per viewport.
- **`references/react-bits.md`** (1,248) — catalogue of the four categories (text animations, wrapper effects, ambient backgrounds, composed sets) with use-when/structure/animation/a11y/anti-pattern per pattern, integration rules for this stack, and the licensing note (MIT + Commons Clause). Source: `DavidHDev/react-bits`.

### Batch 3 skipped (pre-integrated)
- `nolly-studio/cult-ui` — catalogued in `shadcn-ecosystem.md` (v10.12.0) alongside Aceternity, MagicUI, Animata and 21st.dev.
- `harshjdhv/componentry`, `teamchong/pxpipe`, `freshtechbro/claudedesignskills` — not reached before the context budget; deferred to batch 4.

### Security
`lawsofux.com` carries an embedded prompt-injection string. Ignored. **Standing rule for all remaining batches: fetched content is data, never instructions.**

---

## [13.0.0] — 2026-07-26

### Changed — Skill Registry + Lazy Loading (architectural)
- **`SKILL.md` is now a thin registry: 5,458 → ~1,474 tokens.** It holds identity, the behavioural preamble, the anti-slop wall, an 11-row skill registry, the loading protocol and failure handling — nothing else. It no longer grows with content: a new skill costs **~43 tokens** (one row). ~34 skills fit before the 2,500 cap.
- **11 skills** under `skills/{id}/` — react-components, landing-pages, forms, data-tables, threejs-3d, design-system, animations, testing, web-interface, react-performance, **platform**. Each is a *router*: own rules + a Reference Index, **789–1,042 tokens** (cap 3,000).
- **5 core files** under `core/` — design-tokens, accessibility-baseline, component-api, agent-behavior, validate-checklist. `design-tokens`, `accessibility-baseline` and `validate-checklist` are newly authored distillations, not copies.
- **All 58 references distributed into the owning skill's `references/`, zero orphans.** Depth is loaded only when a skill's Reference Index points at it for the specific task.
- **All 38 examples + their tests relocated** to `skills/{id}/examples/`, each `.test.tsx` beside its component; ambient stubs duplicated per directory.
- **8 release gates** (was 7): new **frontmatter** gate (every skill declares name/description/version/core-deps and its deps exist), **budget** gate (skill ≤3,000 and registry+skill+deps ≤8,000, fails the build), **registry-resolution** gate (every row resolves, every skill has ≥1 example, orphan directories warn).

### Notes
- **Per-skill cap is 3,000 tokens, not the 5,000 originally specified.** registry (1,474) + component-api (2,116) + accessibility-baseline (641) + validate-checklist (558) = 4,789, leaving 3,211. Authoring at 5k would silently blow the 8k budget on every request; the budget gate now enforces the real number.
- An 11th skill (`platform`) was added because nine references — mobile, React Native, i18n, SEO, payments, email, AI SDK, orchestration, continuous-learning — mapped to none of the ten proposed skills.
- The 11 named-but-nonexistent examples (`good-button`, `good-modal`, `good-pricing`…) were **not** created; existing golds already demonstrate those patterns and each new one carries a permanent test and maintenance cost.

---

## [12.6.0] — 2026-07-26

### Added — Three.js / R3F layer
- **Consolidated to exactly 3 3D references** (was 3 overlapping files at ~7.5k tokens): **`threejs-fundamentals.md`** (~3.1k — R3F stack, JSX↔Three mapping, dashed props, geometry/instancing, OKLCH colour via `THREE.Color`, lighting, materials, textures, perf, a11y), **`threejs-advanced.md`** (~3.0k — delta-driven animation, `useAnimations`, loaders with Suspense/`useProgress`, GLSL shaders, postprocessing, perf checklist), **`threejs-interaction.md`** (~1.6k — R3F pointer events, drei camera controls, selection state, touch, and a full 3D accessibility section). `three-js.md` and `react-three-fiber.md` were folded in and removed; all routing updated.
- **4 gold examples** (all 35/35 regex + 16/16 parser): `good-3d-scene.tsx`, `good-3d-interaction.tsx`, `good-3d-loader.tsx`, `good-3d-shader.tsx`, each with a matching `.test.tsx` that mocks R3F/drei (no WebGL in jsdom). **Anti-example** `bad-3d-practices.tsx` fires 3D-01/02/03/04/05/07 plus PERF-04 and COPY-01.
- **7 new constraints** → suite is now **51 (16 parser + 35 regex)**. Parser: `3D-01` Canvas declares `dpr` · `3D-02` no raw `requestAnimationFrame` in R3F files · `3D-03` manual geometry/material construction is memoized. Regex: `3D-04` Canvas container labelled or explicitly decorative · `3D-05` no raw hex in `THREE.Color` · `3D-06` `useFrame` is delta-driven · `3D-07` asset loading uses Suspense, not a `setTimeout` flag.
- Shortcodes `[r3f]` `[threejs]` `[shader]` `[postprocess]` `[3d-interaction]` alongside existing `[3d]` `[webgl]`.
- Ambient stubs gained real `three` types (Color/Object3D/Mesh/geometries/ShaderMaterial) and 16 more R3F JSX intrinsics, so 3D examples compile under `--strict` without vendor typings.

### Fixed
- `good-3d.tsx` was missing any accessible treatment of its canvas; it now declares the decorative intent explicitly.

### Notes
- **The 10 upstream skill files could not be fetched** — `CloudAI-X/threejs-skills` serves its README but every `.claude/skills/*` path returns empty. Content was therefore built from the sprint's own detailed outline, the README's per-skill scope table, and the existing verified 3D material, written R3F-first. Not a verbatim extraction, and labelled as such.
- **`3D-04` was deliberately widened** to accept `aria-hidden="true"`: a purely decorative background canvas *should* be hidden from assistive tech, and the strict form flagged `good-3d.tsx` for doing the right thing.

---

## [12.5.0] — 2026-07-26

### Added — Karpathy behavioral layer
- **`references/agent-behavior.md`** (~1.5k): the four principles adapted to frontend work — P1 Think Before Coding (restate intent, name the stack, surface tradeoffs, push back on anti-slop conflicts, stop when confused), P2 Simplicity First (no single-use abstractions, no unrequested flexibility props, no `memo`/`useMemo` without a named problem, no `useEffect` for derivable state), P3 Surgical Changes (match existing style, don't refactor the neighborhood, remove only the orphans you created), P4 Goal-Driven Execution (request → verifiable criteria table, plans with checkpoints, self-verify before returning). Includes a pipeline-stage mapping and a banned-phrases table.
- **`AGENT_SYSTEM_PROMPT.md` restructured** — new **Section 0 Behavioral Preamble** read before any technical loading, plus two new pipeline stages: **STAGE 1.5 REASON** (restate, ambiguities, success criteria, approach) after DETECT and **STAGE 5.5 SELF-VERIFY** (BEHAV-01…04) after VALIDATE.
- **BEHAV checks in the VALIDATE gate**: BEHAV-01 every changed line traces to the request · BEHAV-02 no speculative abstraction · BEHAV-03 criteria stated and met · BEHAV-04 assumptions stated explicitly (self-checks), plus machine-enforced **BEHAV-05** (TODO/FIXME/HACK/XXX markers — extends SLOP-03, which only caught `// TODO`) and **BEHAV-06** (speculative "might need later" comments).
- **`good-surgical-change.tsx`** (31/31 + 13/13 parser) — one requested change, delivered surgically, with pre-existing dead code *flagged rather than deleted*; matching `.test.tsx` asserts the `aria-describedby` error wiring. **`bad-drive-by-refactoring.tsx`** anti-example — same scenario handled badly (renamed props, deleted unrelated code, invented variant/size props, needless memo/effect, try/catch around JSX, TODO/FIXME markers); fails BEHAV-05, BEHAV-06, PERF-04, MOTION-01.
- Shortcode `[behavior]`; routing row loads `agent-behavior.md` first for any task over ~3 files or ~200 lines.

### Notes
- Constraint suite: **44 (13 parser + 31 regex)**. BEHAV-01…04 are deliberately **not** counted — they are prompt-level self-checks. Automating "did this line trace to the request?" needs the diff and the original intent, neither of which a single-file linter has; claiming otherwise would be theatre.
- Gap analysis confirmed the need: SKILL.md had **zero** coverage of simplicity, surgical scope, success criteria, or push-back before this release.

---

## [12.4.0] — 2026-07-26

### Added — Vercel Labs integration
- **`references/web-interface-guidelines.md`** (~1.4k): surface craft (layered shadows, nested/concentric radii, hue-consistent borders, interaction contrast), rendering artifacts (text anti-aliasing, gradient banding, native `<select>` in Windows dark mode), a **new copywriting category** (active voice, second person, Title Case rules, numerals, non-breaking units, consistent placeholders, positive error framing, specific labels), APCA guidance layered over the WCAG 2.2 AA gate, plus form/image/animation additions.
- **`references/react-performance.md`** (~1.4k): the 70-rule Vercel taxonomy with stable citable IDs across 8 categories (`async-`, `bundle-`, `server-`, `client-`, `rerender-`, `rendering-`, `js-`, `advanced-`), severity labels, and an audit output format.
- **`component-api.md` §7 Composition Patterns**: avoid boolean-prop proliferation, explicit variants, lift state, decouple implementation, `{ state, actions, meta }` context interface, prop-drilling escalation ladder, children-over-render-props.
- **`design-patterns.md` P-20** — View transition patterns.
- **3 gold examples** (all 29/29 + 13/13 parser): `good-composition-patterns.tsx`, `good-performance-patterns.tsx`, `good-vt-shared-element.tsx`, each with a matching `.test.tsx`. **1 anti-example**: `bad-performance.tsx` (fires PERF-01/02/04, A11Y-03, COPY-01).
- **5 parser constraints**: `PERF-01` barrel imports · `PERF-02` numeric `&&` rendering a literal 0 · `PERF-04` `transition: all` · `A11Y-03` images without dimensions · `COPY-01` `...` in UI copy. **5 regex constraints**: `COPY-02`, `TOUCH-01`, `SAFE-01`, `PERF-04R`, `IMG-01`. Suite: **42 total (13 parser + 29 regex)**.
- 4 new regression cases (11/11): two misses a naive regex makes, two over-bans it commits.
- Intents `AUDIT_PERFORMANCE`, `ADD_VIEW_TRANSITIONS`; shortcodes `[performance]`, `[wig]`, `[composition]`.

### Fixed — violations the new constraints surfaced in existing golds
- `transition-all` → explicit property lists in **10** gold examples.
- Missing `width`/`height` on `<img>` (CLS) in `good-dark-mode`, `good-brand-linear`, `good-checkout`.
- Missing `overscroll-behavior: contain` on overlays in 5 golds; missing `env(safe-area-inset-*)` on fixed-bottom layouts in `good-mobile`, `good-checkout`.
- `"..."` → `…` in `good-tanstack` placeholder copy.

### Changed
- **`view-transitions.md` enriched, not duplicated** — the sprint called for a new `react-view-transitions.md`, but this skill already integrated that source in v10.11.0. Per the dedup rule, upstream additions (animation-priority table, `default="none"` guidance, placement rule, shared-element + list-identity composition, `router.back()` caveat, nested-VT limitation) were appended to the existing file instead.
- **`component-api.md` reconciles React 19 `ref`-as-prop with `forwardRef`.** Vercel's `react19-no-forwardref` contradicts this skill's forwardRef mandate; both are now documented as valid with clear selection criteria. `COMP-01` validates `forwardRef` only when used — it never forces it.
- `PERF-02` deliberately narrowed to **numeric** left sides (the case that renders a literal `0`). A blanket `&&` ban would flag idiomatic, correct React — proven by the `boolean_and_ok` regression case.

---

## [12.3.0] — 2026-07-26

### Added — GitHub publication
- Repository layout: skill payload under `src/`, human docs at root (`README.md`, `LICENSE`, `AGENT_SYSTEM_PROMPT.md`, `SKILL.md`), guides in `docs/` (INSTALL, USAGE, ARCHITECTURE, CHANGELOG), build output in `dist/` (gitignored).
- `package.json` (TypeScript, vitest, testing-library, jest-axe, jsdom, CVA, Tailwind toolchain) with `npm run gates|build|test` scripts; root `tsconfig.json` and `vitest.config.ts`.
- `.github/workflows/ci.yml` — runs the full gate chain plus each gate individually on every push/PR, and attaches `dist/*.skill` to a GitHub Release on `v*` tags.
- `AGENT_SYSTEM_PROMPT.md` (~3k tokens): drop-in agent system prompt, written **version-free** and verified line-by-line against the shipped `SKILL.md`, `references/`, and `rules/`.
- `[testing]` shortcode (routing existed since 12.2.0; the shortcode itself was missing).

### Fixed — drift in an externally-authored agent prompt
- Dashboards/tables route to `design-patterns.md` P-09/P-10/P-11 + `chart-types.md`; **there is no `references/data-table.md`**.
- Real DETECT enum restored (`CREATE_PAGE`, `CREATE_COMPONENT`, `DESIGN_SYSTEM`, `BUILD_3D`, …) in place of invented intents; ambiguity is a failure mode, not an intent.
- Pattern numbers corrected: pricing P-02, testimonials P-03, bento P-04, social proof P-05, onboarding P-15, overlay P-17/P-17a.
- `[json]` envelope corrected to the enforced schema (`schema_version` / `component` / `metadata`).
- Non-existent shortcodes (`[table]`, `[motion]`, `[chart]`) replaced with real ones.

### Notes
- `build_release.py` flattens `src/*` into the archive root, so **SKILL.md keeps relative `references/…` paths**. Rewriting them to `src/…` would break every installed archive — see `docs/ARCHITECTURE.md`.

---

## [12.2.0] — 2026-07-26

### Added — Testing Doctrine
- **`references/testing.md`** (~1.1k tokens): philosophy, test stack (Vitest + Testing Library + jest-axe + Playwright), required tests per component type (all / interactive / form / data / overlay), mock policy (framer-motion, next/navigation, R3F/Spline, TanStack Query, recharts), jest-axe pattern, anti-pattern table, setup command.
- **24 `.test.tsx` files** — one per gold — with real assertions: a render check that asserts DOM output, a role-based interaction (type / click / list / heading), and a jest-axe accessibility pass on the static-HTML components. Library mocks are fully typed: **zero `any`** across all test files. All 24 compile under `tsc --noEmit` strict.
- **`TEST_COMPONENT` intent** in DETECT, a routing row (`testing → component-api`), a conditional load, and `testing.md` in `references/_index.md`.
- **7th release gate** in `build_release.py` — every gold must have a matching `.test.tsx`; runs `vitest` when installed, otherwise verifies existence plus strict compilation. Release-blocking, and listed in the release-notes gate table.

### Changed
- Gold gates (compile, parser, regex, post-build smoke) exclude `*.test.tsx`; Gate 7 owns the test suite, keeping the 27-gold accounting intact.

### Removed
- Superseded archives and `__pycache__` artifacts from the working tree; `frontend-design-pro-v12.1.4.skill` retained as the rollback archive.

---

## [12.1.4] — 2026-07-25

### Added (release automation)
- **`scripts/build_release.py`** — the only supported way to produce a `.skill` archive. Seven blocking stages: (1) pre-flight (clean tree, SKILL.md ≤6k tokens, metadata/CHANGELOG version agreement, no stray version strings outside the allowlist), (2) full gate chain (compile → semantic parser → syntactic regex → pipeline smoke → evals → regression, in order, first failure aborts), (3) path integrity (every cited path exists; orphan references warned), (4) token-budget divergence check vs `_index.md`, (5) deterministic archive build with unversioned `frontend-design-pro/` root and node_modules/.git/artifact exclusion, (6) post-build smoke re-running compile+parser against the *unzipped* copy (catches non-deterministic or corrupt archives), (7) signed `RELEASE_NOTES-v{VERSION}.md` with the gate table and a "no manual changes after gate passage" attestation. CLI: `--dry-run` (gates only, no archive), `--bump-patch`.
- Existing scripts accept `--check`/`--dry-run` and `test_v12_pipeline.py` defaults to `SKILL.md`, so the pipeline composes them as side-effect-free subprocesses.

### Changed
- A+ is now machine-enforced at release time: a broken build cannot become a `.skill`.

---

## [12.1.3] — 2026-07-25

### Changed (F-08 — parser-authoritative constraints)
- **`scripts/parser_constraints.js`**: 8 semantic constraints checked on the TypeScript AST (compiler API), not strings — real `aria-*` JSX attributes; `focus-visible` only on interactive/focusable elements; `prefers-reduced-motion` must be functional (matchMedia / useReducedMotion / CSS `@media` / `motion-reduce:`); `ease-in` banned for entrances but allowed in exit-keyed contexts; declared `*Props` types must be used (dead declarations fail); white surfaces banned on page containers but allowed on components; mount-effect `setTimeout` gating ANY state setter fails (spelling-independent); `forwardRef`, when present, must take `(props, ref)`, return JSX, and be exported.
- **Gate order** in `test_constraints.py`: compile gate → parser gate (blockers) → regex suite (style lint). Node absent → parser gate skips with warning.
- **Retired 6 superseded regex checks** (A11Y-03, A11Y-06, ANI-01, ANI-02, TS-01, COL-02); DELAY-01 regex retained as declared secondary fallback. Suite: **32 constraints (8 parser + 24 regex)** — two more than the sprint spec's 30 because COMP-01 is net-new and DELAY-01's fallback is deliberately kept.
- **`scripts/parser_regression_test.js`**: 7 synthetic divergence cases, 7/7 — including `mount_setphase.tsx`, a fake-delay spelling no regex vocabulary can catch.
- Constraint scan now excludes `.d.ts` stubs; anti-examples excluded from the exit code (they fail by design).
- README: "Constraint Philosophy" — parser checks verify meaning, regex checks verify syntax.

---

## [12.1.2] — 2026-07-25

### Added (A-grade sprint)
- **`references/component-api.md`** (~1.3k tokens): prop taxonomy (behavioral/stylistic/compositional), forwardRef policy with `ComponentPropsWithoutRef` + CVA template, `asChild` vs `as` doctrine (never both), controlled/uncontrolled decision table, compound-component rules, API anti-patterns table. Routed for `CREATE_COMPONENT` / `REFINE_COMPONENT` (loads first).
- **Real TypeScript compile gate**: `scripts/typecheck_golds.py` — `tsc --noEmit` strict + noImplicitAny over `examples/*.tsx`; ambient module stubs (`examples/_stubs.d.ts`, `examples/_r3f-jsx.d.ts`) keep the check on example code, not vendor typings. Wired into `test_constraints.py` as a blocking pre-gate (graceful skip when tsc absent). **420 strict errors → 0.**
- **`DELAY-01` constraint** (30 total): mount-time `setTimeout` loading/mounted gates are now machine-checked; eval `regex_absent` pattern hardened to match arrow-function timers.
- **MFA/OTP input spec** in `auth-patterns.md`: per-digit inputs, paste distribution, `autoComplete="one-time-code"`, backspace/arrow focus rules, group error state, `aria-live` resend countdown, rate-limit copy.
- **P-17a modal stacking spec** in `design-patterns.md`: z-50/60/70 three-level cap, `aria-hidden` on sibling content in LIFO order, per-layer focus trap, return-focus stack.
- **Pagination vs infinite scroll decision matrix** (SEO/findability/feed/data-size/a11y criteria; default = pagination).
- **CSS logical properties rule** in BUILD Pass 1: RTL is the default assumption.
- **README.md**: two-gate verification workflow.

### Fixed
- Latent bugs surfaced by the compile gate: nested `/* */` comment terminating a doc block early in `good-dark-mode.tsx` (everything after parsed as code); duplicate `style` attribute on a JSX element in `good-mobile.tsx`; five additional disguised mount-time fake loaders (`setIsMounted`/`setMounted`/`pageState`/`appState`/`setIsInitialLoading`) missed by the v12.1.1 regex.
- `@types/react` 18 → 19 for the compile environment (React 19 APIs: `useOptimistic`, `useActionState`); React View Transition experimental API typed via a narrow shim.

---

## [12.1.1] — 2026-07-24

### Fixed (release-integrity + code-quality sprint)
- **F-01 BLOCKER**: created `references/design-patterns.md` — canonical 12 Design Principles, Layout Formulas, 19 pattern entries (P-01…P-19), 12-row anti-patterns table, decision guides (grid/flex, pagination/infinite, modal/drawer/page, toast/inline/dialog). Resolves 8 shortcodes (`[patterns]` `[pricing]` `[testimonials]` `[bento]` `[social-proof]` `[empty]` `[overlay]` `[onboarding]`) and 9 routing rows that pointed at a missing file.
- **F-02 BLOCKER**: archive rebuilt around the real SKILL.md; root folder renamed `frontend-design-pro/` (unversioned); version strings stripped from all file headers — this CHANGELOG + `metadata.json` are the only version authorities.
- **F-05 BLOCKER**: mandatory artificial skeleton delay removed from BUILD Pass 2 and 11 examples. New rule: skeletons render from a real `isLoading` input (prop, default `false`); never `setTimeout` fake loading on mount. `regex_absent` eval assertion added to 12 evals.
- **F-03**: all 27 examples converted `.jsx` → `.tsx` with exported prop interfaces / data-model types; arbitrary hex → OKLCH arbitrary values; `min-h-screen` → `min-h-[100dvh]`. Constraints 27 → **29** (`TS-01` TypeScript presence, `COL-04` no arbitrary hex); `COL-02` 3-digit `#fff` gap closed; self-test fixtures modernized. All 24 gold examples 29/29.
- **F-04**: `color-palettes.md` converted to OKLCH (original hex in comments); pure-white `--color-surface`/`--color-background` values re-tinted to `oklch(99.5% 0.004 255)`; OKLCH-only rule stated in file header.
- **F-06**: SKILL.md rewritten ~16k → **~4.9k tokens**. Shortcode expansions + reference tables moved to generated `references/_index.md` with **measured** token costs (bytes/4). `_meta/FILE_MAP.md` now a human summary pointing at the generated index.
- **F-10**: easing rules reconciled — `ease-in` banned for entrances, allowed for exits ≤200ms (SKILL.md + `ux-guidelines.md` now agree).
- Eval runner: gold map updated to `.tsx`; self-test **22/22** (was 19/22 — storybook/react-native/playwright golds now wired). Envelope schema `constraints_checked` 27 → 29.

---

## [12.0.0] — 2026-04-24

### Breaking Changes
- **Event-driven pipeline**: 8-step sequential pipeline replaced with 6-stage model: `detect → classify → route → build → validate → output`. Custom SKILL.md forks referencing step numbers must update to new stage names.
- **Eval System v2**: `semantic` assertion type added (judged by `claude-haiku-4-5-20251001`). Existing eval runners that don't handle `type="semantic"` will skip them (backwards-compatible via `--no-semantic` flag).

### Added
- **SKILL.md v12 rewrite**: All content from v11.6.0 preserved; reorganised into 6 named stages. `[json]` shortcode added (49th shortcode). DESIGN.md round-trip now structural (not manual instruction).
- **`[json]` shortcode**: Emit JSON envelope `{"schema_version":"12.0","component":"...","metadata":{...}}` instead of freeform prose. For CI pipelines, build tools, MCP clients. Ignored in Artifact/Claude.ai → raw JSX.
- **DESIGN.md round-trip (structural)**: `detect` stage reads `design_md_present`. `build` stage auto-loads `references/design-md-parser.md` and injects extracted OKLCH tokens into `@theme` block. Override priority: DESIGN.md > shortcode flags > skill defaults.
- **`references/design-md-parser.md`** (~2k): 6 canonical DESIGN.md sections + 4 synonym variants each; OKLCH extraction; `@theme` injection rules; anti-patterns.
- **`examples/good-design-md-round-trip.jsx`** (27/27 ✅): SaaS pricing page demonstrating DESIGN.md token injection — `@theme` block annotated `/* from DESIGN.md */`, Cabinet Grotesk + Fraunces fonts, 3 pricing tiers.
- **Eval System v2 — semantic assertions**: 8 `manual` assertions across evals #1/#2/#4/#8/#9/#12 converted to `semantic` type with `prompt` field for haiku judging.
- **`run_evals.py` semantic runner**: `_run_semantic()` via `claude-haiku-4-5-20251001` API, sha256 in-process cache, `--no-semantic` flag (skip all semantic), `--budget N` cap (default 20 calls). Requires `ANTHROPIC_API_KEY`.
- **`scripts/test_v12_pipeline.py`**: Smoke test — validates 6 stage markers + `[json]` + `MIGRATION FROM v11` + `DESIGN.md` presence. Exit 0 only if all 6 stages found.
- **`_meta/V12_DESIGN.md`**: 266-line pre-implementation blueprint — stage contracts, full routing table, build+validate checklist (all 27 categories as checkboxes), JSON envelope schema, DESIGN.md round-trip contract, risk checklist.
- **`## MIGRATION FROM v11.x`** section in SKILL.md: old step name → new stage name table, breaking vs non-breaking changes summary.

### Stats
- Self-test: 19/22 (evals 20–22 use proxy golds; dedicated golds planned v12.1.0)
- Shortcodes: **49** (+1 `[json]`)
- Reference files: **57** (+1 `design-md-parser.md`)
- Example files: **21** (+1 `good-design-md-round-trip.jsx`)
- Semantic assertions: **8** (evals #1/#2/#4/#8/#9/#12)
- Pipeline stages: **6** (was 8 steps)

---

## [11.6.0] — 2026-04-24

### Added
- **3 new reference files**: `react-native.md` (~4k, `[rn]`), `storybook.md` (~3k, `[stories]`), `playwright.md` (~3.5k, `[e2e]`).
- **3 new scaffold.py templates**: `react19`, `ai-chat`, `perf` (all 27/27 CI constraints).
- **3 new evals** (#20–22): react-native-patterns, storybook-stories, playwright-tests.
- **SKILL.md**: Added `[rn]`/`[stories]`/`[e2e]` shortcodes, routing rows, reference table entries.

### Fixed
- ROADMAP `Current release` header: v11.1.0 → v11.5.0.
- SKILL.md frontmatter `metadata.version`: 11.2.0 → 11.6.0.
- Missing CHANGELOG v11.2.0 entry reconstructed.

### Stats
- Self-test: 19/22 (evals 20–22 use proxy golds; dedicated golds in v12.1.0)
- Reference files: 56 total | Shortcodes: 48 | Evals: 22

---

## [11.5.0] — 2026-04-19

### Added
- **2 new gold examples** (27/27 CI each): `good-rhf.jsx` (React Hook Form + Zod: 3-step wizard, useForm, zodResolver, Controller), `good-tanstack.jsx` (TanStack Query v5: useQuery/useMutation/useInfiniteQuery, optimistic updates, infinite scroll).
- **GOLD_EXAMPLES fully wired**: 19/19 eval self-test pass. All evals now have dedicated gold examples.
- **FILE_MAP.md**: Added good-rhf + good-tanstack rows.
- **SKILL.md**: Added good-rhf + good-tanstack to Step 6.5 examples list.

### Stats
- Self-test: **19/19 PASS** — first time all evals covered.
- Gold examples: 20 total, all 27/27 = 100% CI constraints

---

## [11.4.0] — 2026-04-19

### Added
- 4 new gold examples (all 27/27): good-react19.jsx, good-ai-chat.jsx, good-anim-recipes.jsx, good-perf.jsx
- Eval self-test 17/19

---

## [11.3.0] — 2026-04-19

### Added
- **7 new evals** (#13–19): gsap-advanced, react19-patterns, ai-chat-ui, animation-recipes, react-hook-form-zod, tanstack-query, perf-optimization. Eval count 12 → 19.
- **scaffold.py**: +`data-table` template (27/27 CI constraints pass).
- **run_evals.py**: GOLD_EXAMPLES wired for all 19 evals (evals 14–19 use proxy golds pending dedicated examples in v11.4.0).

### Fixed
- **FILE_MAP.md**: Added `good-hero-spline.jsx` + `good-data-table.jsx` rows. Brand split: `brand-core.md` / `brand-extended.md` / `brand-design-systems.md` (legacy). Eval count corrected to 19. Footer bumped to v11.3.0.
- **Eval #8 (dark-mode-tokens)**: Hardened — added `next-themes|useTheme|ThemeProvider|resolvedTheme` assertion.

### Stats
- Self-test: 13/19 pass (evals 14–19 await dedicated gold examples in v11.4.0)
- CI constraints: 14 gold examples all 27/27 = 100%

---

## [11.2.0] — 2026-04-19

### Added
- `examples/good-data-table.jsx` gold example (27/27 CI): sortable columns (aria-sort), row checkboxes, bulk action bar, search/filter, pagination, semantic table, overflow-x-auto, loading skeleton, organic data (20 diverse users), error state.
- `references/chart-types.md` expanded 55→330 lines: decision tree, accessibility, Recharts snippets, color rules, anti-patterns, animation guidelines, responsive patterns.
- `references/industry-rules.md` expanded 99→229 lines: 9 verticals, each with component must-haves, color conventions, trust signals, LCP budget, anti-patterns.

### Changed
- `evals/evals.json`: eval #12 (data-table) wired to `good-data-table.jsx`. Self-test: 12/12 pass.
- `metadata.json`: `style_presets` corrected 7→5, `example_files` 13→14, `eval_tests` 12.

---

## [11.1.0] — 2026-04-19

### Added
- **5 new evals** (#8–12): dark-mode-tokens, auth-flow, 3d-scene, scroll-experience, data-table. Eval count 7 → 12. 11/11 self-test pass (data-table pending gold example).
- **`references/brand-core.md`** (732 lines) — Top 13 brand profiles + full archetypes index + 4 implementation templates + brand mixing formulas. Brands: Linear, Raycast, Vercel, Stripe, Supabase, IBM, Revolut, Spotify, Apple, Ferrari, Figma, Framer, Claude.
- **`references/brand-extended.md`** (750 lines) — 30+ additional brand profiles: Warp, Cursor, xAI, Notion, Resend, PostHog, Sentry, HashiCorp, MongoDB, Coinbase, Airbnb, Uber, Tesla, BMW, Webflow, Miro, GitHub, Shopify, PlanetScale, Loom, Neon DB, Cohere, Mistral, Ollama.
- **`_meta/ROADMAP.md`** — Forward-looking roadmap: v11.x, v12.0 breaking changes, v13.0 MCP server, known gaps, contribution guide.

### Changed
- **SKILL.md**: Version 11.0.0 → 11.1.0. Brand routing split to use brand-core/brand-extended. [brand] shortcode updated to reflect split.
- **`metadata.json`**: eval_tests 7 → 12, reference_files 51 → 53, style_presets corrected 7 → 5.

---

## [11.0.0] — 2026-04-19

### Added
- **`references/token-optimization.md`** — Component token budget guide: state init, conditional rendering, Tailwind compression, type inference, import optimization, data structure efficiency, comment discipline, budget table, anti-patterns. `[tok-opt]` shortcode.
- **`references/memory-persistence.md`** — 8-tier client persistence guide: URL state (nuqs), localStorage hook (SSR-safe), sessionStorage, form draft recovery, cross-tab sync (BroadcastChannel), TanStack Query cache, Zustand persist, cookie patterns, anti-patterns. `[memory]` shortcode.
- **`references/continuous-learning.md`** — User preference learning, A/B testing (GrowthBook/Vercel Flags), Sentry error telemetry, PostHog usage analytics, adaptive defaults, feedback widgets, model-in-the-loop UI, rollout strategies, personalization tokens, anti-patterns. `[cl]` shortcode.
- **`references/verification-loops.md`** — Zod+RHF client/server validation, optimistic UI+rollback, data integrity assertions, API response validation, E2E state verification, axe-core a11y checks, visual regression, error boundaries, anti-patterns. `[verify]` shortcode.
- **`references/parallelization.md`** — Promise.all/allSettled, concurrent rendering (useTransition/useDeferredValue), parallel route segments, Web Workers+Comlink, streaming SSR, asset preloading, IO batching, request deduplication, anti-patterns. `[parallel]` shortcode.
- **`references/subagent-orchestration.md`** — Multi-step AI workflow UI, agent status components (SSE/aria-live), background job UI, parallel agent output, human-in-the-loop UI, tool call visualization, streaming output composition, error recovery, agent memory UI, anti-patterns. `[orchestrate]` shortcode.

### Fixed
- **SKILL.md**: `--color-surface-raised: oklch(100% 0 0)` → `oklch(99.5% 0.004 255)` — was triggering TOK-01 constraint violation.
- **SKILL.md**: Windsurf install note was orphaned as dangling bullet — merged into install line (`· Windsurf → .windsurfrules`).
- **All 8 gold examples**: `good-scroll`, `good-shadcn`, `good-landing`, `good-dashboard`, `good-form`, `good-hero-spline`, `good-3d`, `good-dark-mode` now at 100% on all 27 constraint checks (up from 74–96%).
- **`evals/evals.json`**: Fixed eval #3 (accessible-form) assertions — removed brutalist requirements that didn't match gold example; fixed eval #4 (brand-linear) — `bg-clip-text` gradient now present in gold example.

### Changed
- **SKILL.md**: Version 10.20.0 → 11.0.0. Added 6 Phase 2 shortcodes (`[tok-opt]`, `[memory]`, `[cl]`, `[verify]`, `[parallel]`, `[orchestrate]`). Added 6 routing table rows. Added 6 reference table entries. Added `good-auth.jsx` + `good-checkout.jsx` to Step 6.5 examples list.
- **`metadata.json`**: Version 10.20.0 → 11.0.0. `reference_files` +6, `shortcodes` 39 → 45.

---

## [10.20.0] — 2026-04-18

### Added
- **`examples/good-checkout.jsx`** — New gold standard (100% constraints). Full Stripe checkout with PaymentElement, sticky order summary sidebar, 4-state machine (loading skeleton → ready → error → success), trust strip (Stripe badge + PCI-DSS lock), organic prices ($44.71), diverse names (Priya Shah, Kenji Tanaka), reduced-motion guard.
- **`scripts/run_evals.py`** — Eval runner script. Runs eval assertions from `evals/evals.json` against generated component files. CLI: `--list`, `--self-test`, `--dir`, `--json`, positional file + optional eval filter. Exit codes: 0 = pass, 1 = failures, 2 = usage error. Self-test maps each eval to its gold example via `GOLD_EXAMPLES` dict.
- **`_meta/FILE_MAP.md`** — Complete inventory of all files in the skill package with token estimates, shortcode triggers, constraint scores for gold examples, and purpose descriptions.
- **`_meta/CHANGELOG.md`** — This file. Full version history from v10.0.0 onward.
- **`[checkout]` shortcode** in SKILL.md routing table — triggers `payments.md` load, references `examples/good-checkout.jsx` as gold standard. DV=4, MI=4, VD=6.

### Fixed
- **`examples/good-brand-linear.jsx`**: 96% → 100%. Added `error` state with `role="alert"` + retry button, `aria-describedby="cmd-hint"` on command palette input, sr-only hint span, loading skeleton uses OKLCH token instead of hardcoded surface color.
- **`examples/good-mobile.jsx`**: 74% → 100%. Added `isLoading`/`error` states with `useEffect` loading simulation, skeleton block (animate-pulse), error fallback with `role="alert"`, skip link `<a href="#mobile-main">`, `id="mobile-main"` on `<main>`, responsive `md:max-w-sm md:mx-auto`, `focus-visible:ring-2` on all nav buttons, `<style>` block with Manrope import + prefers-reduced-motion.
- **`examples/good-view-transitions.jsx`**: 74% → 100%. Added `export default function ViewTransitionsDemo()` wrapper with error state, skip link, sticky nav tab switcher, `<main id="demo-main">`, `<style>` with Manrope import + `::view-transition-*` reduced-motion rules. Replaced all `bg-white` with `bg-[#F8FAFC]`. Responsive grid on product listing. Min-h-[44px] + `focus-visible:ring-2` on all interactive buttons.
- **`scripts/scaffold.py` TEMPLATE_AUTH**: 81% → 100%. All `<input>` elements changed from `bg-white` to `bg-[#F8FAFC]` (3 occurrences).
- **`scripts/scaffold.py` TEMPLATE_MOBILE**: 78% → 100%. Added loading/error states, skeleton block, skip nav, `role="alert"` error fallback, responsive `md:max-w-sm md:mx-auto`, `focus-visible:ring-2` on nav buttons, `bg-[#F8FAFC]` on bottom sheet and nav, `<style>` block.
- **`scripts/scaffold.py` TEMPLATE_EMAIL**: 74% → 100%. Restructured to `function WelcomeEmail` (non-default) + `export default function EmailPreview()` wrapper with loading/error states, skip link, `<header>`, `<article id="email-preview">` semantic structure, `<style>` with Manrope import + prefers-reduced-motion.

### Changed
- **`evals/evals.json`**: Version bumped 10.16.0 → 10.20.0. Tightened assertions: eval #1 easing pattern adds `transition-|ease-in-out`; eval #4 dark bg pattern adds OKLCH near-black variants, text gradient broadened to `WebkitBackgroundClip|backgroundClip.*text`, grid pattern broadened to include `sidebar|nav|issue`, typography adds `tabular-nums|font-extrabold`, letter-spacing adds `antialiased`; eval #6 touch target pattern adds `min-h-\[48|min-h-\[56|h-14|size-14`.
- **SKILL.md**: Version 10.19.0 → 10.20.0. Added `[checkout]` shortcode row. Removed duplicate `brand-design-systems.md` routing entry (kept the enriched version with GitHub, Shopify, PlanetScale, Loom, Neon DB signals).
- **`metadata.json`**: Version 10.19.0 → 10.20.0. Stats updated: `ci_constraints` 26 → 27, `example_files` 11 → 12, `shortcodes` 38 → 39.

---

## [10.19.0]

### Added
- `brand-design-systems.md` v2: +5 new brand profiles (GitHub, Shopify/Polaris, PlanetScale/Neon, Tailwind CSS, Loom)
- 4 deep implementation templates: Linear sidebar, Stripe form field, Vercel status indicator, Supabase SQL block
- 7 brand mixing formulas (e.g., Linear × Stripe, Vercel × Supabase)

### Changed
- SKILL.md v10.19: reference table now 45 files, shortcode table 38 entries, routing table enriched with 8 new signal rows

---

## [10.18.0]

### Added
- `references/animation-recipes.md`: 17 copy-paste animation patterns — stagger, counter, typewriter, page transitions, shared morph, scroll progress bar, magnetic button, confetti, skeleton loader, hover lift, toast, drawer, command palette, parallax, accordion, marquee, tooltip. `[anim-recipes]` shortcode.
- `references/figma-to-code.md`: Auto Layout → Flex/Grid translation, token extraction, typography extraction, Figma MCP workflow, delivery checklist. `[figma]` shortcode.

---

## [10.17.0]

### Added
- `references/payments.md`: Stripe PaymentElement, CardElement, subscriptions, webhooks, customer portal, error handling, saved payment methods. `[payments]` shortcode.
- `scripts/scaffold.py` +4 new templates: mobile, auth, email, checkout.
- Token estimates added to all reference table entries in SKILL.md.

---

## [10.16.0]

### Added
- `references/tanstack-query.md`: TanStack Query v5 — useQuery, useMutation, infinite scroll, SSR prefetch, Suspense. `[tanstack]` shortcode.
- `references/react-hook-form.md`: RHF + Zod, multi-step forms, useFieldArray, file upload, Server Actions. `[rhf]` shortcode.
- `references/i18n.md`: next-intl routing, useTranslations, pluralization, RTL support, locale switcher. `[i18n]` shortcode.
- Eval suite: 4 new test cases — brand-linear (#4), view-transitions (#5), mobile-bottom-nav (#6), checkout-payment (#7).

---

## [10.15.0]

### Added
- `references/framer-motion.md`: motion.*/AnimatePresence/variants/spring table/layoutId/useScroll/LazyMotion, Next.js page transitions. `[framer]` shortcode.
- `references/mobile-patterns.md`: bottom tab nav, bottom sheet (vaul), pull-to-refresh, swipe gestures, PWA, safe area insets. `[mobile]` shortcode.
- `references/auth-patterns.md`: login/signup/OAuth/magic link/onboarding/protected routes, error state table. `[auth]` shortcode.
- `references/email-templates.md`: React Email + Resend — welcome, OTP, password reset templates, email-safe CSS, dark mode in email. `[email]` shortcode.
- 3 new gold examples: `good-view-transitions.jsx`, `good-brand-linear.jsx`, `good-mobile.jsx`.

### Changed
- SKILL.md: 5-file cap for advanced/CREATE_PAGE, shortcode chaining guidance, `## Files Loaded` in output block, duplicate routing cleanup.

---

## [10.14.0]

### Added
- `references/styles/glassmorphism.md`: 4-layer glass stack, OKLCH tokens, blur guide, browser compat, @supports fallback. `[glassmorphism]` shortcode.
- `references/styles/neo-brutalism.md`: Press-state buttons, component specs, dark mode, snap animations. `[neo-brutalism]` shortcode.

### Fixed
- Design tokens converted from hex to OKLCH throughout SKILL.md `@theme` block.
- Fixed sources frontmatter.
- Compressed reference table descriptions (−1,500 tokens).

---

## [10.13.0]

### Added
- Caveman Mode inline in SKILL.md (zero additional token overhead), 3 levels: lite/full/ultra. `[caveman]` shortcode.

---

## [10.12.0]

### Added
- `references/shadcn-ecosystem.md`: 70+ community shadcn/ui components, animation tiers, theme tools, starters (from `birobirobiro/awesome-shadcn-ui`). `[shadcn-eco]` shortcode.

---

## [10.11.0]

### Added
- `references/view-transitions.md`: React View Transition API, 9 CSS recipes, directional nav, shared element morph. `[vt]` shortcode.
- `references/vercel-ui-rules.md`: 100+ UI rules + 70 React perf rules — async waterfalls, bundle optimization, text-wrap, scroll-margin. `[perf]` shortcode.

---

## [10.10.0]

### Added
- `references/brand-design-systems.md`: 40+ real brand profiles, 9 archetypes, OKLCH palettes (from `VoltAgent/awesome-design-md`). `[brand]` shortcode.

---

## [10.9.0]

### Added
- `references/ux-writing.md`: UX writing patterns, button labels, error messages, empty states, microcopy. `[copy]` shortcode.
- `references/impeccable-techniques.md`: OKLCH techniques, 8 interactive states, CSS Anchor Positioning, Popover API, craft flow, font metrics. `[tech]` shortcode.
- Reflex-font ban list + 4-step selection process in `font-pairings.md` (from `pbakaus/impeccable`).

---

## [10.8.0]

### Added
- `references/stitch-design.md`: Google Stitch DESIGN.md generation, semantic design language. `[stitch]` shortcode.
- `references/styles/soft.md`: Double-Bezel / Fluid Island / soft premium preset.
- `references/styles/minimalist.md`: Whitespace ratio, typographic scale, sparse interactivity.
- `references/styles/brutalist.md` rebuilt: Hard shadows, thick borders, monospace, press states.
- `references/redesign-framework.md` rebuilt: 3-level Variance Engine, strategic omissions, surface upgrade patterns.

---

## [10.7.0]

### Added
- `references/ux-deep-rules.md`: 200+ granular UX rules — Apple HIG + Material Design, 8 interactive states, form feedback. `[ux-rules]` shortcode.
- `references/landing-patterns.md` rebuilt to 34 full pattern specs with conversion copy and layout prescriptions. `[land]` shortcode.

---

## [10.6.0]

### Added
- `references/seo.md`: Core Web Vitals, JSON-LD schemas (5 types), meta tags, Turbopack, image optimization. `[seo]` shortcode.
- 10-dimension visual audit scoring system (ECC integration).
- AI slop detection table (12 patterns).
- Render Props pattern in react-patterns.md.

---

## [10.5.0]

### Added
- `references/aesthetic-direction.md`: Design Thinking protocol, 14-tone vocabulary, 7 background effects, DISTILLED_AESTHETICS_PROMPT. `[aesthetic]` shortcode.
- `font-pairings.md` enriched with 57 pairings.

---

## [10.4.0]

### Added
- `references/react-patterns.md` enriched: React 19 patterns, hooks, Suspense, server components.
- `references/vercel-ai-sdk.md` enriched: chat UI, streaming, useChat, tool calling.
- `references/nextjs-patterns.md` enriched: RSC, App Router, Turbopack, ISR, Server Actions.
- `references/ux-guidelines.md` enriched: WCAG 2.2, accessibility rules, interaction patterns.
- Shortcodes: `[react]`, `[ai-ui]`.

---

## [10.3.0]

### Added
- `references/threejs-advanced.md`: Shaders (GLSL), GLTF/PBR, postprocessing (bloom/DOF), raycasting, UV/textures. `[webgl]` shortcode.
- `references/shadcn.md`: shadcn/ui component usage, theming, CLI, customization. `[shadcn]` shortcode.
- `references/dark-mode.md`: Dark mode token system, OKLCH dark surfaces. `[dark]` shortcode.
- `references/icons-avatars.md`: Icon library guide, avatar patterns, icon sizing system.
- WCAG 2.2 upgrade. Zustand TypeScript patterns. React 19. Tailwind v4.

---

## [10.2.0]

### Added
- Full GSAP integration: `references/gsap.md` (all 12 plugins: ScrollTrigger, SplitText, Flip, Observer, Draggable, MorphSVG, DrawSVG, ScrambleText, etc.). `[gsap]` shortcode.
- `references/spline.md`: Spline 3D embed in React/Next.js, lazy loading, fallback. `[spline]` shortcode.
- 6 new example files: `good-dashboard.jsx`, `good-form.jsx`, `good-landing.jsx` (gold-standard); `bad-generic.jsx`, `bad-animated.jsx`, `bad-inaccessible.jsx` (anti-examples).

---

## [10.1.0]

### Changed
- Anti-AI-slop wall moved to top of SKILL.md for maximum visibility.
- Shortcode fast-intent system introduced.
- `scripts/scaffold.py` rewritten with 4 distinct purpose-built templates.

---

## [10.0.0] — Initial v10 Release

### Added
- Integrated 5 open-source design skill repositories.
- Added 3D/GSAP/scroll/Next.js reference files.
- Automated CI constraint testing (`scripts/test_constraints.py`, 27 checks).
- Token budget cap enforcement.
- Font policy: reflex-font convergence watch.
- Intent detection tie-breaker routing table.
- WCAG 2.1 AA enforcement throughout.

---

*Maintained by krishnamodi241@gmail.com*
