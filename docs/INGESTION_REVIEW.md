# Source ingestion review

Eight upstream repositories have been read against this pack: a theme catalogue, a
primitive library, seven typography projects, Anthropic's own skill-authoring
skill, and two packs of interface-motion skills (emil, ibelick). This is what each
one turned out to be, what was taken, what was rejected and why, and what is still
open.

It is written down because the rejections are the expensive part to re-derive. A
future reader who finds `theme-factory-addon` and wonders why a hundred ready-made
themes are not in here deserves the reasoning, not a second week of reading.

## Contents

- [The method, and the mistake it corrects](#the-method-and-the-mistake-it-corrects)
- [xiaopu-ai/web-design](#xiaopu-aiweb-design)
- [radix-ui/primitives](#radix-uiprimitives)
- [patrickkrebs/theme-factory-addon](#patrickkrebstheme-factory-addon)
- [The seven typography repositories](#the-seven-typography-repositories)
- [anthropics/skills — skill-creator](#anthropicsskills--skill-creator)
- [emilkowalski/skills](#emilkowalskiskills)
- [ibelick/ui-skills](#ibelickui-skills)
- [The emil / ibelick decision table](#the-emil--ibelick-decision-table)
- [What is still open](#what-is-still-open)
- [Things that are true across every read](#things-that-are-true-across-every-read)

---

## The method, and the mistake it corrects

The first pass over these repositories was a grep for topic overlap: does the
pack already have a file about this? Where the answer was yes, the upstream file
was rejected as covered.

That pass was wrong twice over. It was wrong against the brief, which asked for
extraction and got a curated subset. And it was **worse at its own job**: reading
the same files line by line afterwards surfaced seven defects that would have
shipped, none of which a topic-overlap check can see, because every one of them
sat inside a file whose *subject* was already covered:

- `.reveal { opacity: 0 }` in a stylesheet, so content is invisible with JS off
- a text-reveal built with `innerHTML` and interpolated element text — markup in
  copy executes
- a scroll progress bar computing `scaleX(Infinity)` on a page shorter than the
  viewport
- a counter on `setInterval(…, 16)` shipping `0` in the served markup
- a pinned narrative assigning its left column from a JS array, so three quarters
  of the section is absent from the HTML
- `transition: all`
- a CJK text reveal split per glyph, against this pack's own motion budget

The lesson generalises past this ingestion: **"we already cover that" is a claim
about a table of contents, and defects live in the body.** Every correction in
this document was found by reading source, and none by any gate.

---

## xiaopu-ai/web-design

MIT. A Chinese-language web-design skill with reference material, two Python
tools, and a complete worked specification for its own site.

**Taken** — nine topical references and three tools, across PRs #88 and #89:
`interaction-patterns.md`, `scroll-story-patterns.md`, `style-seeds.md`,
`design-md-template.md`, `design-md-checklist.md`, `lucide-index.md`,
`scripts/extract_design_tokens.py`, `scripts/crawl_website.py`,
`scripts/fetch_unsplash_images.py`, and `docs/examples/DESIGN.example.md`.

**Corrected on the way in.** The seven defects above, plus: every colour
converted to OKLCH, banned display faces substituted (Space Grotesk → Clash
Display, Inter → Geist/Manrope/Archivo, DM Sans → Satoshi/General Sans), the
WebGL example rewritten from imperative Three.js to R3F with a capped `dpr` and
a delta-driven `useFrame`, `aria-hidden` added to every icon example, and
upstream's `--*-rgb` companion variables replaced with `oklch(from …)`.

**The one thing deliberately not corrected** is `docs/examples/DESIGN.example.md`,
which ships with upstream's raw hex, DM Sans, CDN script tags and global custom
cursor intact, behind a preface listing what this pack would do differently. A
sanitised worked example teaches the format but hides the judgement, and the
judgement is the transferable part. That file's placement is load-bearing:
`check_references.py` rglobs all of `skills/`, so the same file under
`skills/*/examples/` would be scanned by Gate 10 and fail `COL-04` on its own
honesty.

**Not taken:** the Chinese-language duplicates of files already translated, and
the site's own build config.

---

## radix-ui/primitives

MIT, © WorkOS. Read to check `radix-primitives.md` rather than to extend it, and
that turned out to be the right instinct — the file had two claims that were
wrong at the source, both sitting under the words "verified against the Slot
source".

**Corrected (PR pending):**

1. **A fragment child does not throw.** The file said two children, a string or a
   fragment all throw. `React.isValidElement()` returns `true` for `<>…</>`, so
   Slot accepts it as the single child and never reaches the throw — and then
   *deliberately skips the ref*, guarded by
   `slottableElement.type !== React.Fragment` for React 19 compatibility. Nothing
   crashes and Radix emits no warning. The failure mode is a primitive that
   cannot measure or focus its trigger, which is strictly harder to debug than
   the error the file promised.
2. **The primitive count was a dependency count.** `radix-ui` lists 55
   dependencies and re-exports 35 namespaces; the other 20 are internal
   plumbing. The distinction is not pedantry — it decides which package you
   install. `import { FocusScope } from "radix-ui"` does not exist, so anyone
   building a custom primitive on Radix's internals installs those packages
   individually.

   That sentence also has a tripwire in it, worth recording because it cost a
   silent falsification here. Gate 11's `CORE-FILES` figure claims the shape
   `<digits> primitives` for *this pack's* core count, so writing another
   library's primitive count in that exact form makes the gate rewrite it to
   ours. The line in `radix-primitives.md` had survived for exactly the wrong
   reason — it was written with bold markers between the number and the noun,
   and the pattern needs them adjacent. Removing the emphasis while correcting
   the number exposed it, the sweep dutifully replaced it, and the result was a
   confident wrong figure in a paragraph about a confident wrong figure. Phrase
   counts of *other* projects so no bare digit sits directly before `primitives`.
3. **The Dialog `Title` rule lost its backstop.** Radix shipped a dev-only console
   warning for a missing `Title`; it was removed in `react-dialog` 1.1.17 and
   `WarningProvider` survives as a documented no-op. There is now no warning, no
   error, and no `aria-labelledby`. The rule needed to read as more load-bearing,
   not less.

**A routing gap, also fixed.** `shadcn init` now defaults new projects to Base UI
rather than Radix, and only `radix-primitives.md` carried that warning — while
`shadcn.md` opened by asserting shadcn is "built on Radix UI primitives". A
request routed to `shadcn.md` never loads `radix-primitives.md`, so the reader
most likely to be on Base UI was the one guaranteed not to be told. Both files
now say it.

**Not taken:** full sections for ContextMenu, Menubar, NavigationMenu and
ScrollArea. These are structurally different enough to need real depth rather
than a table row, and that is new-reference territory the freeze argues against
by default. Avatar, AspectRatio, AccessibleIcon, Label, Progress and Direction
are thin wrappers with no meaningful state contract and are not worth the depth
at all.

---

## patrickkrebs/theme-factory-addon

Apache-2.0. A hundred hand-curated themes across fourteen categories.

**It is not a theme engine.** It is a static lookup table with two documentation
renderers. There is no computation at apply time: no contrast check, no OKLCH, no
token emission. "Role" means rank in the palette's own brightness order — colours
are sorted by relative luminance and zipped against a fixed ladder — so there is
no border, focus-ring or destructive role to inherit. Fonts are assigned per
*category*, so four themes in one category share a pairing regardless of their
palettes. Each theme is a single mode with no paired counterpart.

**The genuinely interesting finding is an axis.** `color-palettes.md` indexes by
industry; `style-seeds.md` says in its own opening that it is the other axis,
mood. This addon is neither — its categories answer *whose visual language is
this*: a named brand, a named painter, a named cinematographer. That is a
citation, not a mood.

And this pack had **already reasoned about that third axis without populating
it**. `brand-extraction.md` § "Sourcing a palette from something that is not a
brand" names this very addon as prior art, and independently arrives at the same
three-way split (painting / film grade / editor theme) and the same
"derived from, not reproduction" labelling rule. So the addon is not a new axis
for us. It is a hundred instances of an axis we designed the rules for and never
filled in.

**Taken:** an interop warning appended to that existing citation. The section
recommended the addon's method with nothing saying its output needs conversion
before use — an agent could read it and apply a theme literally. It now names the
three things that do not transfer: hex to OKLCH (and several themes use pure
`#FFFFFF`/`#000000` as surface extremes, against rule 3), brightness-rank roles
that are not semantic slots, and per-category fonts that need checking against
`font-pairings.md`.

**Not taken: the hundred themes.** Importing them would force this repo's first
`NOTICE` file, duplicate with less depth the brand coverage
`brand-design-systems.md` already has for three of the fourteen Iconic Brands,
and need real editorial correction on a third of the set. The addon also sourced
its brand hex by cross-checking third-party colour listicles — exactly the
practice `brand-extraction.md`'s own protocol rejects as non-authoritative. Any
future brand additions should re-run that protocol against official brand pages,
not copy these values.

**A licensing note worth acting on separately.** This pack cites an Apache-2.0
source (`designer-workflow.md`) with a one-line inline credit and no `NOTICE`
reproduction anywhere. That is a pre-existing gap, not one this ingestion
created, and none of the actions above make it worse — they all route around the
addon's authored layer. But if any Apache-2.0 *content* is ever vendored here,
the honest move is a root `NOTICE` file first.

---

## The seven typography repositories

Named as sources "for developing canvas typography". They are not, and the
correction matters because it changes where the material belongs.

**Exactly one of them is canvas work.** `typexperiments` is a per-glyph canvas
animation engine. The other five named repos touch no `<canvas>` element and no
`CanvasRenderingContext2D` anywhere in their source:

| Repo | Canvas? | What it actually is |
|---|---|---|
| typexperiments | **Yes** | Per-glyph canvas animation engine |
| awesome-typography | No | A link list (CC0), no source code |
| astro-theme-typography | No | An Astro blog theme |
| typography.js | No | Injects a `<style>` tag |
| tailwindcss-typography | No | A Tailwind plugin |
| react-native-typography | No | React Native `StyleSheet` — not even web |

So four of the six contribute nothing to `canvas-typography`; they are
`design-system` material, and most were already cited there. The seventh named
item resolved to duplicate copies rather than a distinct repo — but those copies
carried three real projects nobody named: `compass-vertical-rhythm`,
`modularscale-js` and `modularscale-km`, which are `typography.js`'s own runtime
dependencies. Those turned out to be the most useful material in the set.

Two claims in `astro-theme-typography`'s README did not survive checking: it
advertises typography "derived from prevalent Chinese typographic norms", and its
stylesheet is 22 lines with zero CJK-specific rules — no `kinsoku`, no
`hanging-punctuation`, no `text-justify`, no `word-break`. The mechanism is
UnoCSS's generic `presetTypography`. Nothing was taken from it.

**Corrected:** `typographic-finishing.md` claimed `@tailwindcss/typography`'s size
modifiers scale "the whole vertical rhythm and the measure together". They do
not. `maxWidth: '65ch'` is declared once in that plugin's 1,400-line stylesheet,
inside `DEFAULT`; no size variant overrides it. The measure holds at 65
characters at every size and only its pixel width moves. What *does* differ is
the rhythm, and not by a constant — leading is authored on a 4px grid
(14/24, 16/28, 18/32, 20/36, 24/40), so the ratio drifts and then falls back at
the top.

**Taken:**

- **Grapheme splitting** in `text-on-path-scramble.md`. It used `[...target]`,
  which iterates code points, not grapheme clusters — so a combining accent
  becomes its own slot, an emoji ZWJ sequence explodes into its members, and a
  flag becomes two letters. `Intl.Segmenter` is the correct primitive and is a
  browser built-in.
- **Baseline rhythm**, a new section in `typographic-finishing.md`: the half-line
  rounding and cramped-line guard from `compass-vertical-rhythm`, reimplemented
  in a few lines rather than vendored, with the two caveats that matter — it is a
  fixed-size technique that `clamp()` defeats, and it constrains margins too.
- **The modular-scale formula stated explicitly**, plus the caveat that
  `typography.js`'s advertised ratios of 2 to 2.45 are not per-level ratios: it
  assigns fractional exponents per heading (`r^1`, `r^0.6`, `r^0.4`, `r^0`,
  `r^-0.2`, `r^-0.3`), so the number is the span from body to `h1`. Reading one
  convention as the other is how a scale ends up absurd.

**Not taken:** a variable-font axis catalogue and a canvas text-metrics reference,
both of which the brief proposed. Nothing in these repositories supports either —
`awesome-typography` only links out to axis demos, and this pack's existing
`canvas-2d-typography.md` is already more rigorous on metrics than anything here.
Building them would be original authorship dressed as extraction.

---

## anthropics/skills — skill-creator

The compliance question resolved cleanly, and then a larger divergence appeared
behind it.

**We pass.** `quick_validate.py` was run read-only against all twenty `SKILL.md`
files: all valid, exit 0. The `metadata:` nesting is correct — the validator
subtracts only top-level keys against its allowlist and never recurses into
`metadata`'s value. Descriptions are far inside the 1024-character limit, every
skill body is well under the 500-line guideline, and every reference over 300
lines carries a `## Contents` index as its progressive-disclosure guidance asks.

**A calibration point on that validator.** The same run against
`mattpocock/skills` — a well-regarded, actively maintained pack — fails 14 of 32
files on `disable-model-invocation`, a real and currently-supported Claude Code
frontmatter key that predates the validator's allowlist. Four more crash it
outright with a `UnicodeDecodeError`, because it reads files with the platform
default encoding rather than UTF-8 and Windows hands it cp1252. Only 13 of 32
pass. That does not change our compliance; it does mean "passes
`quick_validate.py`" is a weaker proxy for "correct" than it sounds.

**The real divergence is the eval system, and it is architectural.**
skill-creator's loop measures whether *having the skill loaded* improves a fresh
agent's output: it spawns with-skill and without-skill subagents in the same
turn, has a grader subagent produce `grading.json`, aggregates to `benchmark.json`
and generates a review page. None of that machinery exists here in any form — no
workspace, no grading or benchmark artifacts, no with/without delta, ever.

What exists instead answers a different question. `run_evals.py` regression-tests
hand-authored gold files against fixed constraints, headlessly, in CI, with no
browser and no network. Our `evals.json` uses typed, machine-executable
`assertions` where skill-creator's schema expects plain-string `expectations` for
a grader to read. Neither system is a subset of the other, and reformatting the
schema would not bridge it — the gap is that one needs a live orchestrating
session and the other must run in CI.

This is a deliberate difference and should be recorded as one, not closed. The
pack's whole claim is that it is verified rather than asserted, and a
deterministic gate chain serves that better than a benchmark that cannot run
unattended. What should *not* stand is the one place we make a claim we cannot
show: `evals/trigger-queries.md` reports 20/20 against Anthropic's own harness,
and no `results.json` or report is checked in. That claim currently rests on
prose.

---

## emilkowalski/skills

MIT, © Emil Kowalski. Twelve flat markdown skills — no app, no build — carrying
one author's taste for interface motion. **Already a cited source here:**
`skills/animations/references/animation-framework.md` opens
"Source: emilkowalski/skill", ingested in an earlier pass. So this was a delta
read, not a first ingest, and the question for each of the twelve was narrower:
is there a technique in here that this pack's animation depth does not already
carry?

**The decision axis that did most of the work.** emil's skills split cleanly
into *taste* — what good motion feels like, which durations, when not to animate —
and *technique*, the code that produces one specific feel. The taste is largely
already here, restated across `animation-framework.md`, `motion-budget.md` and
`motion-direction.md`. The technique that is not here concentrates in two skills:
`apple-design` (gesture physics — velocity handoff, momentum projection,
rubber-banding) and `find-animation-opportunities` (a forward sweep for motion
that is *missing*). Those two became new references. Everything else folded into
a file an agent already loads for that task, or was declined.

**Taken — two new references in `animations`:**

- `references/native-motion-physics.md`, from `apple-design`. Springs
  parameterised by feel rather than by raw stiffness and damping, velocity
  handoff from a gesture into a spring, momentum projection to a snap point,
  rubber-banding at limits, grab offset, and the "one gesture owns the frame"
  rule. Route: motion that has to feel like a physical object under the user's
  finger.
- `references/finding-motion.md`, from `find-animation-opportunities`.
  The inverse of a motion budget — a structured pass over a built interface for
  state changes that happen instantly and should not, gated by four questions so
  it does not relicense the whole screen as animatable, and required to list its
  rejected candidates.

**Folded into existing references** (per-row status in the decision table below):

| Upstream skill | Folded into | What it adds |
|---|---|---|
| `emil-design-eng` | `animations/references/animation-framework.md` | clip-path as an animation primitive (`inset()` wipes, tab indicator, scroll reveal); hold-to-confirm with an asymmetric `inset()` press/release; the tooltip warm-up / skip-delay pattern |
| `review-animations` | `web-interface/references/live-verification.md` | ten motion standards as an animation-specific Layer B residue checklist |
| `animation-vocabulary` | `animations/references/motion-direction.md` | a "naming motion" glossary appendix — shared terms for the review conversation |
| `pick-ui-library` | `react-components/references/shadcn-ecosystem.md` | opinionated non-shadcn picks and a mismatch-detection table (hand-built toast → Sonner, hand-rolled select → a real listbox) |
| `animate-expo` | `platform/references/react-native.md` | RN motion decision gate; `.get()`/`.set()` worklet safety; same-frame haptics; ProMotion `CADisableMinimumFrameDurationOnPhone`; tool selection |

**Declined:**

- `animate` — its decision framework *is* `animation-framework.md`'s subject;
  this is the file already credited to emil.
- `improve-animations` — a review loop over existing motion. `web-interface`'s
  Layer B (rendered-DOM audit) already owns "audit what shipped", and
  `review-animations`' checklist folds into it.
- `write-swift` — native Swift authoring, outside a frontend design pack.
- `prototype` — a working style (build the smallest thing that answers the
  question) rather than transferable UI knowledge.
- `ask-sonner` — one library's API surface, narrow enough that
  `shadcn-ecosystem.md`'s Sonner coverage plus the `pick-ui-library` fold covers
  it.

**What was corrected on the way in.** `apple-design` asserts that Framer Motion's
`x`/`y` are not hardware-accelerated and must be swapped for `transform`. That
was true of an old Framer version and is contradicted by this pack's own
`motion.md` §10 and Motion 12's compositor handling — `native-motion-physics.md`
records the omission in its "What was corrected" table rather than carrying the
claim. It also did not carry `apple-design`'s `bounce: 0.8` spring (MOTION-02R
territory, and too loose for the "physical object" feel the file is about), and
converted the colour examples to OKLCH.

---

## ibelick/ui-skills

MIT, © Julien Thibeaut. An Astro app that serves a set of UI-fixing skills plus
a long playbook of interface lessons. **Per the brief, only the skill content
was read** — `astro.config.mjs`, `wrangler.*`, `bin/`, `src/` and `package.json`
were out of scope, and nothing routing- or infra-shaped was taken.

**What it is.** Seven task-scoped skills (`fixing-motion-performance`,
`fixing-accessibility`, `fixing-metadata`, `baseline-ui`, `improve-ui`,
`create-design-md`, and the routing root) plus `playbook.md` — roughly 47 short
numbered interface lessons. The skills are framed as "the model already knows
UI, here is the taste it is missing"; most of that taste this pack already
carries at more depth and with machine-checked examples.

**Taken — two folds** (per-row status in the decision table below):

| Upstream | Folded into | What it adds |
|---|---|---|
| `fixing-motion-performance` | `animations/references/animation-pitfalls.md` | animated `filter: blur()` radius capped near 8px; the composite / paint / layout property split; batch layout reads before writes, stated as the FLIP measure order; prefer a Scroll/View Timeline over a scroll-event listener |
| `playbook.md` (5 of 47) | `web-interface/references/ux-deep-rules.md` | scroll-edge mask fade; peek-the-next-item 16–32px; inset full-width buttons off the viewport edge; icon-state crossfade instead of swap; blur during a label morph |

The tooltip warm-up / skip-delay pattern was the sixth playbook candidate; it
folded into `animations/references/animation-framework.md` instead, alongside the
`emil-design-eng` material. The other playbook items were already covered by
`interaction-patterns.md`, `ux-deep-rules.md`, `motion-budget.md` or the
anti-slop wall, or were too situational to state as a rule.

**Declined — all KEEP OURS:**

- `baseline-ui` / `improve-ui` — "make a generic UI good" is `design-principles`
  plus the anti-slop wall plus `component-patterns`, at more depth.
- `create-design-md` — `design-research/references/design-md-template.md` and
  `design-md-checklist.md` (ingested from xiaopu-ai) already own this, with a
  worked `DESIGN.example.md`.
- `fixing-accessibility` — covered by `forms`, `web-interface`'s Layer B, and the
  A11Y constraints in the gate suite.
- `fixing-metadata` — `platform/references/seo.md` already covers Open Graph,
  Twitter cards, canonical URLs and the favicon set.
- the routing root and `topics.ts` — this pack has its own registry; a second
  router is exactly what the brief said not to import.

---

## The emil / ibelick decision table

Every upstream skill, its disposition, and where it stands. `shipped` means the
file is on `main`; `queued` means it is a Phase 4 change with its own branch and
figure sweep, not yet merged.

| Source | Upstream skill | Decision | Target / reason | Status |
|---|---|---|---|---|
| emil | `apple-design` | NEW REF | `animations/references/native-motion-physics.md` | **shipped** |
| emil | `find-animation-opportunities` | NEW REF | `animations/references/finding-motion.md` | **shipped** |
| emil | `emil-design-eng` | FOLD | `animations/references/animation-framework.md` | **shipped** |
| emil | `review-animations` | FOLD | `web-interface/references/live-verification.md` | **shipped** |
| emil | `animation-vocabulary` | FOLD | `animations/references/motion-direction.md` | **shipped** |
| emil | `pick-ui-library` | FOLD | `react-components/references/shadcn-ecosystem.md` | **shipped** |
| emil | `animate-expo` | FOLD | `platform/references/react-native.md` | **shipped** |
| emil | `animate` | DECLINE | already `animation-framework.md` | — |
| emil | `improve-animations` | DECLINE | `web-interface` Layer B | — |
| emil | `write-swift` | DECLINE | out of scope | — |
| emil | `prototype` | DECLINE | working style, not UI knowledge | — |
| emil | `ask-sonner` | DECLINE | too narrow | — |
| ibelick | `fixing-motion-performance` | FOLD | `animations/references/animation-pitfalls.md` | **shipped** |
| ibelick | `playbook.md` (≈6 items) | FOLD | `web-interface/references/ux-deep-rules.md` | queued |
| ibelick | `baseline-ui` | DECLINE | `design-principles` + anti-slop wall | — |
| ibelick | `improve-ui` | DECLINE | `design-principles` + `component-patterns` | — |
| ibelick | `create-design-md` | DECLINE | `design-md-template.md` | — |
| ibelick | `fixing-accessibility` | DECLINE | `forms` / Layer B / A11Y gates | — |
| ibelick | `fixing-metadata` | DECLINE | `platform/references/seo.md` | — |
| ibelick | routing root + `topics.ts` | DECLINE | this pack has its own registry | — |

Net: **0 new skills, 2 new references, 7 folds, 12 declines.** The queued rows
are the Phase 4 build order; each lands as its own gate-clean PR off updated
`origin/main` with the figure sweep in the same commit.

---

## What is still open

Ranked by value over cost. Nothing here is committed work; it is the queue.

The two cheapest items are already done and are listed here only so the queue
reads honestly: the `assertions` / `expectations` divergence is now written up in
`docs/TESTING.md`, and `evals/trigger-queries.md` now carries the command to
re-run its own measurement plus a plain statement that its 20/20 is a recorded
run rather than a gated figure. Neither needed the upstream artifacts checked in
— saying which number is not verifiable was the honest fix, and it cost nothing.

| # | Action | Cost | Note |
|---|---|---|---|
| 3 | Per-glyph spring physics as a cheaper alternative to pixel-sampled particles | Low | `particle-text-systems.md` only covers sample-then-spring. Moving the *letters* needs no `getImageData` at all. Technique only — `typexperiments` publishes no licence |
| 4 | Worked instances on the lineage axis in `brand-extraction.md` | Medium | One painting, one film grade, one editor theme — OKLCH-native, contrast-checked. The method is written and has zero examples |
| 5 | Radix `Form` disambiguation from shadcn's RHF+Zod `Form` | Low | Same word, unrelated architectures — native `ValidityState` vs a resolver |
| 6 | A root `NOTICE` file | Low | Pre-existing Apache-2.0 gap; required before vendoring any Apache-2.0 content |
| 7 | Toast/NavigationMenu/ScrollArea rows in the data-state table | Low | Genuinely new, low urgency — this pack recommends Sonner over Radix Toast anyway |
| 8 | Material's Dense/Tall script categories | Deferred | Real and MIT, but it is DOM/CSS and belongs to a CJK scope discussion, not canvas |

**Explicitly rejected, with reasons above:** importing the hundred themes; a
variable-font axis catalogue; a canvas text-metrics reference; full sections for
the four uncovered Radix primitives; and rebuilding `run_evals.py` to spawn live
subagents in CI.

---

## Things that are true across every read

**Reading beats matching topics.** Every correction in this document — seven
shipping defects, two wrong Radix claims, one wrong Tailwind claim, one
unsubstantiated README, one silent grapheme bug — came from reading source. A
topic-overlap pass found none of them and actively argued against the reading
that did.

**A verification note is a claim, and it ages.** The two Radix errors sat under
the words "verified against the Slot source". They were true when written. The
sentence that says a thing was checked does not re-check it.

**Upstream guardrails are worth reading before overriding.** The Unsplash helper
looked like exactly what this pack's anti-slop wall exists to prevent, and turned
out to refuse to run without a declared use case and an explicit acknowledgement
flag — a better-designed guardrail than most tools of its kind carry. The
reflex to reject it on its name would have been wrong.

**Most of what looked like a gap was a routing problem.** The Base UI warning
existed and was in the file nobody on Base UI would load. The lineage axis was
designed and unpopulated. The addon was cited and uncaveated. In each case the
pack knew the thing and failed to put it where it would be read.
