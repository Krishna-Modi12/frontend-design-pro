# Live verification — the rendered-DOM audit (Layer B)

`web-interface`'s rules, and all 61 CI constraints, read source. This file is the
procedure for the half no gate covers: loading the page in a real browser and
auditing what actually rendered. It **supplements** the source checks — it does
not replace them.

## 1. Purpose and dependency

A source check can only prove a rule about the *code*. It cannot see:

- computed contrast on real text — especially text over a gradient or an image
- a real horizontal scrollbar, or two elements visually colliding
- a layout that breaks at one width but not the others
- a stylesheet or font that 404s, a hydration mismatch, a console exception
- a scroll-reveal whose observer never fired, leaving content at `opacity: 0`
- keyboard focus order, and a focus ring that vanishes behind an overlay

**Hard dependency: Playwright MCP.** Every step below calls a `browser_*` tool
(some hosts expose them as `mcp__playwright__browser_*`). There is no source-only
fallback for rendered-DOM inspection — if those tools are not connected, report
that and stop. Do not substitute a second reading of the source and present it
as a live audit.

**Layer A still runs.** A page is "verified" only when the 61 constraints
(`scripts/test_constraints.py`, Layer A) pass *and* this pass (Layer B) is clean.
Neither is sufficient alone. Layer B does not re-check anything Layer A already
covers cleanly; its scope is the render-only residue in §3.

## 2. Confirmed Playwright MCP tool surface

Read from `microsoft/playwright-mcp` at its current release. The MCP tool set
drifts between versions — confirm against the tools actually offered in-session
before relying on any of them, the same way this pack treats a missing compiler.

**Available, and how each is used:**

| Tool | Use here |
|---|---|
| `browser_navigate` | load the URL / route |
| `browser_resize` | the 320 / 390 / 768 / 1920 width sweep |
| `browser_snapshot` | accessibility tree; pass `boxes: true` for per-node `getBoundingClientRect` in CSS px |
| `browser_take_screenshot` | evidence — `fullPage`, element-scoped, or `scale` |
| `browser_evaluate` | the workhorse: computed styles, contrast math, `document.createRange()` text rects, axe injection, scrolling |
| `browser_console_messages` | console errors / warnings, hydration strings |
| `browser_network_requests` | non-2xx responses, missing assets |
| `browser_click` / `browser_hover` / `browser_type` / `browser_press_key` | targeted interaction |
| `browser_wait_for` | settle on text appearing / disappearing, or a fixed pause |
| `browser_find` | locate text / regex in the a11y snapshot |

**Absent — worked around, never assumed:**

| Gap | Workaround |
|---|---|
| no `browser_scroll` | `browser_evaluate` with `window.scrollTo`, or `browser_press_key` `PageDown` / `End` |
| no network-idle wait | wait for a content selector, then poll `browser_network_requests`; never block on `networkidle` against a Next server |
| no axe / a11y tool | inject `axe-core` (this repo vendors 4.12.1) via `browser_evaluate`; a strict CSP on a third-party origin can block the injection — note it if it does |
| no visual-diff tool | pixel diffing stays with `tools/screenshots/visual-regression.mjs` and its committed baselines; MCP does not replace it |

## 3. What to audit — the render-only scope

### 3a. Constraints whose source check is only a proxy — verify the real thing

| ID | Rendered check |
|---|---|
| COL-01 | `getComputedStyle(document.body).backgroundColor` → convert to OKLCH → assert lightness above the near-black floor |
| COL-02-AST | same for the page-surface container; catches white delivered via a CSS var, inline style, or a parent |
| RES-02 | measure the computed box of every interactive target after padding / line-height; assert at least 44×44 CSS px |
| A11Y-06 | focus each interactive element; assert a visible indicator exists, is not clipped by `overflow: hidden`, and is not covered |
| TYP-03 | computed `color` of body-sized text is not transparent from a `background-clip: text` treatment |
| FORM-01 | computed `font-size` of every input / textarea / select at 390px width is at least 16px |

### 3b. Partial constraints — the residue worth a rendered look

- **MOTION-01** — a reduced-motion guard present in source but ineffective at runtime
- **RES-01** — the layout actually reflows without overflow at each width
- **STA-01 / STA-02 / DELAY-01** — the loading and error states actually render
- **A11Y-04 / 05 / 07 / 08** — real accessible name, label association, working skip-link target
- **TYP-01 / TYP-02** — computed `font-family` on headings; a declared face that 404s falls back silently
- **IMG-01 / A11Y-03** — layout shift is a runtime metric, not a source property

### 3c. Covered by no constraint — the largest bucket

Computed contrast on arbitrary text (including over gradient / image) · visual
overlap and collision · real sideways scroll · a width that breaks layout · focus
order and keyboard traps · console errors · failed requests and 404s · hydration
mismatch · dead scroll-reveals · optical alignment and rhythm (glyph position,
not bounding box).

### 3d. Motion residue — run only when the surface animates

Layer A checks the *source* form of motion (`MOTION-01` / `-02` / `-02R`,
`PERF-04`, the `animations` Core Rules). Most of those rules have a runtime
residue that only shows when the animation actually plays. Emil Kowalski's ten
review standards (`emilkowalski/skills`, `review-animations`, MIT) map onto this
layer as the checks below — skip the whole pass if the surface has no non-trivial
motion.

| Standard | What to observe in the running page |
|---|---|
| Reduced motion is a state, not `none` | Emulate `prefers-reduced-motion: reduce`, reload, re-run the reveal scroll: every headline, counter and image sits at its final value. A `0` counter or empty hero here is the most common motion defect there is. |
| Interruptibility | Fire the same animation 3–4× faster than its duration (`browser_click` in a loop). It must retarget from the current position, not restart from zero or queue. |
| Frequency-appropriate | Watch a tab switch, a toggle, a filter apply. Motion on a 100+/day action is a finding even when it looked fine in isolation. |
| GPU-only properties | Select the animated node, record a Performance trace over one play: no `Layout` and no large `Paint` on that node — `transform` / `opacity` only. |
| Origin correctness | A popover, dropdown or tooltip scales *from its trigger*, not from its own centre — visible at 0.25× playback. |
| Entrance floor | Nothing pops in from `scale(0)` or full transparency; entrances start at `scale(0.9–0.97)` + opacity. |
| Responsive easing | Entrances decelerate (ease-out); nothing important eases *in* on entry. |
| Sub-300ms UI | Time a representative UI transition frame-by-frame; over ~300ms with no reason (modal, page transition) is a finding. |
| Asymmetric enter/exit | Dismiss what you opened — exit is perceptibly faster than enter, not symmetric. |
| Cohesion | The motion's personality matches the rest of the product. `critique`-class — advisory, never fails the run. |

## 4. Workflow

1. **Inspect.** Read `package.json` for framework and dev command. Probe for a
   server already running (`:3000` for home/ or a demo, `:3311` for the
   screenshot harness, or the deployed URL you were given). Prefer an existing
   server — never start one that competes for a port.
2. **Navigate.** `browser_navigate` to the URL. Settle: wait for a content
   selector (`main`, `h1`), then `document.fonts.ready`, then poll
   `browser_network_requests` until nothing is pending. Never wait on
   `networkidle`.
3. **Snapshot the width sweep.** For each of 320×568, 390×844, 768×1024,
   1920×1080: `browser_resize` → `browser_snapshot` with `boxes: true` →
   `browser_take_screenshot`. 320 is included because a real overflow bug in
   home/ (#120) sat below the 390 floor — 320px is the narrowest phone width
   still in meaningful use.
4. **Structured inspection** via `browser_evaluate`:
   - computed contrast on every text node; where the background is a gradient or
     image, sample pixels from the screenshot instead
   - bounding-box overlap between siblings
   - `scrollWidth - clientWidth` at each width
   - `createRange()` rects on the first text node of each section for optical
     alignment
   - computed `font-family` on headings

   Then `browser_console_messages` (errors + a hydration-string regex),
   `browser_network_requests` (non-2xx). Inject axe-core, run WCAG 2.1 A + AA,
   keep serious / critical.
5. **Reveal and reduced-motion pass.** Scroll the document in instant jumps to
   fire every IntersectionObserver / scroll reveal, return to top, settle, then
   re-measure: any text still at `opacity: 0` or `visibility: hidden` is a dead
   reveal. Repeat under emulated `prefers-reduced-motion: reduce` — content must
   be visible and still. If the surface has real motion, run the §3d checklist
   here too.
6. **Targeted interaction — meaningful journeys only.** The primary CTA, the
   primary nav, one modal / drawer / toggle if present. Not every clickable
   element. After each: re-check console, overflow, and that focus returned to a
   sensible place.
7. **Findings.** Record against the schema in §5, engineering and critique
   separated from the start.
8. **Source-map.** Resolve each finding to a file and line — §6.
9. **Fix.** The smallest change that resolves the finding. Match the surrounding
   style; touch nothing else.
10. **Re-render and re-verify.** Re-run the specific check at the specific width.
    Move the finding to `VERIFIED`, or `NEEDS_REVIEW` if the fix is a judgement
    call.

## 5. Findings schema

Severity ladder is `docs/REVIEW_PROTOCOL.md`'s plus `POLISH`:
**BLOCKER · HIGH · MEDIUM · LOW · POLISH**. `BLOCKER` = the page does not render,
crashes, or breaks in a way equivalent to a failed gate.

```jsonc
{
  "id": "LV-001",                      // sequential within a run
  "class": "engineering",              // engineering | critique  (critique is never a failure)
  "category": "responsive-overflow",   // contrast | overflow | overlap | console-error | network-error
                                       //  | hydration | focus-order | reveal-dead | reduced-motion | motion
                                       //  | touch-target | font-load | hierarchy | rhythm | clutter
  "severity": "HIGH",                  // BLOCKER | HIGH | MEDIUM | LOW | POLISH
  "location": {
    "rendered": { "url": "…", "viewport": "390x844",
                  "selector": "section.hero > div:nth-child(2)" },
    "source":   { "file": "home/components/Hero.tsx", "line": 42 }  // null until source-mapped
  },
  "observation": "body scrolls 73px sideways at 390px",
  "why_it_matters": "horizontal scroll on mobile clips content; defeats RES-01's intent",
  "evidence": { "kind": "measurement",   // measurement | screenshot | console | network
                "value": "scrollWidth 463 vs clientWidth 390",
                "artifact": "audit/home-390-overflow.png" },
  "recommended_fix": "add min-w-0 to the flex child, or max-w-full on the image",
  "validation_state": "FOUND",         // FOUND | FIXED | VERIFIED | NEEDS_REVIEW
  "related_constraint": "RES-01"       // which of the 61 this is the render residue of, or null
}
```

**Text form** — mirrors `test_constraints.py`'s `✗ [ID] desc` / `→ evidence`:

```text
✗ [LV-001] body scrolls 73px sideways at 390px      (HIGH · engineering · responsive-overflow)
  → home/components/Hero.tsx:42 — scrollWidth 463 vs clientWidth 390 — audit/home-390-overflow.png
  → fix: add min-w-0 to the flex child (or max-w-full on the image)     [FOUND]
```

**Composed report** — a `layer: "B"` block beside the constraint results, reusing
`test_constraints.py`'s field names (`description` = `observation`) so a combined
reader needs no translation:

```jsonc
{ "file": "home/  (rendered @ <url>)", "layer": "B", "status": "NEEDS WORK",
  "engineering": [ { "id", "severity", "category", "description", "evidence",
                     "source", "validation_state", "related_constraint" } ],
  "critique":    [ { "id", "severity", "category", "description", "why_it_matters" } ] }
```

When blending into one pass/fail with Layer A: `BLOCKER`/`HIGH` → `critical`,
`MEDIUM` → `high`, `LOW` → `medium`, `POLISH` → advisory (never fails the run).
Every `critique`-class finding is advisory.

## 6. Source-mapping a rendered finding

1. From the finding's `selector`, take the most specific class or the visible
   text.
2. `grep` the running project's source for it — `home/components/*.tsx` for
   home/, or the demo's own tree. A Tailwind class usually resolves to one JSX
   element; visible copy resolves via its string literal.
3. Confirm by re-reading the component: does the element with that class produce
   the measured box?
4. The fix is the smallest edit at that site. Re-render the same width and
   confirm the measurement changed.

For a deployed static export (home/ on GitHub Pages), map through the committed
source that generated it — the class names survive the build.

## 7. Waivers

A rendered finding that is a deliberate, defensible choice is waived the way
Layer A waives a constraint: an entry keyed by the source path the finding maps
to, with `LV-<CATEGORY>` (the finding's `category`, upper-cased) as the rule key,
carrying the reason — mirroring `GRANDFATHERED` in `scripts/test_constraints.py`.

```text
{
  "home/components/ProblemComparison.tsx": {
    "LV-CONTRAST": "SlopPanel is a deliberate AI-slop anti-example, aria-hidden and
                    decorative — the low-contrast text IS the thing being illustrated.
                    Decided by <owner>, <date>."
  }
}
```

Two things make this the right call rather than a fix: the element is
`aria-hidden` and purely illustrative, and the component's own doc comment states
the intent. A waiver echoes its reason on every run so it cannot quietly become
permanent. There is no inline-comment waiver — a deployed page cannot carry one,
and every finding resolves to a source file a path-keyed dict already addresses.

A finding whose `class` is already `critique` (e.g. low contrast the audit found
inside an `aria-hidden` subtree) never fails the run in the first place; the
waiver just records that triage happened.

**Headless regression counterpart.** `tools/screenshots/live-audit.mjs` (not
shipped, not in CI — same status as the rest of `tools/screenshots/`) runs the
measurement primitives above against the golden fixtures and any URL, in the
vendored Playwright Chromium, and emits this schema. It is the deterministic
check for the parts of this workflow a script can own; the interactive steps
(meaningful-journey interaction, judgement on a NEEDS_REVIEW) stay with the
MCP-driven pass.

## 8. What still cannot be measured

State these plainly in any report; never imply the audit covered them.

- **Optical rhythm below the measurement threshold** — sub-pixel kerning, a
  baseline grid that is only *slightly* off. `createRange()` rects catch gross
  misalignment, not taste.
- **Anything requiring human judgement** — whether the hierarchy *feels* right,
  whether the motion has character, whether the copy lands.
- **Cross-browser rendering** — Playwright MCP drives Chromium only. Safari and
  Firefox text metrics, form controls, and backdrop filters differ.
- **Real-device touch** — an emulated viewport is not a finger on glass: no
  thumb-reach check, no real momentum scroll.
- **Performance under throttling** — no CPU or network throttle, so any timing
  metric here is an upper bound, not field data.
- **Content behind auth** — anything past a login the audit was not given
  credentials for.

## Sources

Layer B — the rendered-DOM audit, the Playwright MCP workflow, the findings
schema and the waiver model — is this pack's own design.

The **§3d motion residue checklist** was folded in on 2026-09-02 from
`emilkowalski/skills` (the `review-animations` skill — MIT, Copyright © Emil
Kowalski), which states ten motion-review standards. Integration type: fold into
an existing reference. Emil's skill reviews motion *source*; the fold keeps only
the subset that has a runtime residue and restates each as an observation against
the running page, because the source form is already Layer A's job
(`MOTION-01` / `-02` / `-02R`, `PERF-04`, the `animations` Core Rules). The
tiered Block/Approve verdict was not carried — this pack's severity ladder
(`BLOCKER · HIGH · MEDIUM · LOW · POLISH`, §5) already fills that role.
