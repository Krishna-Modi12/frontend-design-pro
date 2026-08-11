# Release Notes — frontend-design-pro v14.7.4

**Date:** 2026-08-11

A taste patch. Two High-severity defects found by the research layer, both in
reference prose, both the same shape: **the pack stated a rule and then shipped
code that broke it, inside the same skill.** No new skills, no new references, no
new constraints, no routing change.

Worth naming why these survived ten gates. Every gate reads source; none reads
reference *prose* for correctness, and `RES-03` matched the literal
`min-h-screen`, so a bare `h-screen` was invisible to it. Both defects were found
by diffing our references against external sources — comparison, not inspection.

## Contents

19 skills · 8 core files · 94 references (333,969 tokens of on-demand depth) ·
55 examples (45 gold + 10 anti-examples) · 45 test files, 205 tests ·
59 constraints (17 semantic + 42 syntactic) · 10 gates

Registry (`SKILL.md`) is 2,018 tokens and is the only file always loaded.
A request costs 5,665–7,266 tokens.

## What changed

### The reduced-motion snippet was the harmful form

Two references prescribed the blanket kill:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

`animation: none` does not shorten the animation — it removes it, so
**`animationend` and `transitionend` never fire.** Any component that gates
unmount, cleanup or a state transition on those events waits forever, and it
waits only for the users who asked for less motion. The failure is invisible in
testing unless you actually set the preference.

Replaced with the near-zero-duration form, which removes the motion and still
fires the event on the next frame:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

It was also a contradiction. `motion-direction.md` says *"replace movement with
opacity, or nothing"*; `scroll-experience.md` already did it correctly, naming
the element's resting state so it stays visible. Only `animation-framework.md`
and `animation-recipes.md` said kill everything. The surrounding prose now says
reduce rather than abolish, and points at scoped overrides as the better tool.

The typewriter recipe carried the same blanket rule and no class to hang a scoped
override on; it now has one, and names its settled state (full text, no caret).

**Gold examples were never affected** — they use `motion-reduce:` and
`useReducedMotion`, and both are gated. This was reference prose only, which is
the harder half to catch.

### `h-screen` — banned three times in prose, shipped five times in code

`RES-03` bans `min-h-screen` and Gate 10 applies it over reference code blocks.
A bare `h-screen` contains no `min-`, so it matched nothing, while three
references stated the ban in prose. Five prescribed blocks used it:

| Site | Now | Why |
|---|---|---|
| `scroll-experience.md` — parallax container | `h-[100svh]` | scroll-driven; `dvh` reflows mid-scroll |
| `scroll-experience.md` — sticky scrub video | `h-[100svh]` | same, and `sticky` needs a definite height |
| `spline.md` — hero wrapper | `h-[100dvh]` | child is `h-full` |
| `brand-core.md` — sidebar | `h-[100dvh]` | fixed-height rail |
| `brand-design-systems.md` — sidebar | `h-[100dvh]` | fixed-height rail |

All five are definite-height containers — children use `h-full`, or the element
is `sticky`. `min-h-[100dvh]` would have broken them. The defect was `screen`
(which resolves to `100vh` and ignores the mobile toolbar), not the `min-`.
`svh` is used where the container is scroll-driven, because `dvh` changes as
browser chrome collapses and that reflow lands mid-animation.

The deliberate `// WRONG` demonstration in `mobile-patterns.md` keeps `h-screen`
and now cites `RES-03` by name.

### Figures re-derived

Reference depth moved with the prose above (333,709 → **333,969**). Two figures
were already stale before this release and are corrected in the same sweep: a
request costs **5,665–7,266** tokens, documented as 5,511–7,112; and the registry
was quoted as both 2,002 and 2,018 in the same documents, of which **2,018** is
current. The two sentences recording the registry's historical growth from 1,895
were left alone — they were true when written.

## Known issues

Seven further findings from the same research pass, verified at the line and
deliberately **not** fixed here. This release was scoped to the two High-severity
defects; batching the rest into a taste patch would have made it unreviewable.

| # | Finding | Severity |
|---|---|---|
| F3 | `scroll-experience.md` bans `object-cover` cropping in prose, then uses it 32 lines later on a single-`src` video | Medium |
| F4 | The same component pairs one landscape poster with two orientation-specific encodes — a guaranteed repaint flash. The fix is to *extract* the poster from the rendered video's frame 0 rather than author it separately | Medium |
| F5 | `element.animate()` (WAAPI) has zero coverage pack-wide, and no row in the Library Decision Guide — despite being the only option that is hardware-accelerated, interruptible, scriptable and zero-bundle | Medium |
| F6 | No gesture physics anywhere: `setPointerCapture` has zero hits. We document the drag APIs and none of velocity-based dismissal, pointer capture, boundary damping or the multi-touch guard | Medium |
| F7 | An upstream claim that Framer Motion's `x`/`y` shorthands are not hardware-accelerated would, if true, invalidate ~40 of our snippets. **Unverified — needs a benchmark under CPU throttle.** A pack claiming "verified rather than asserted" cannot adopt a competitor's performance claim on authority | Medium |
| F8 | `animation-framework.md` bans bare `linear`/`ease` outright; `motion-direction.md` correctly permits `linear` inside progress bars. Constant-velocity motion that eases is a defect, not a refinement — the rule should carve out constant motion rather than forbid the keyword | Low |
| F9 | Stagger band documented as 30–60 ms against an upstream 30–80 ms. Ours is a deliberate tightening, recorded here so it is not "fixed" back | Low |

Two further gaps, neither a finding against the pack itself:

- **`RES-03` still keys on `min-h-screen`.** Widening it to `\bh-screen\b` is the
  obvious follow-up, but it would then fire on the deliberate `// WRONG` example
  in `mobile-patterns.md`, which teaches the violation on purpose. Anti-example
  exemption inside references has to come first, so this was left alone rather
  than half-done.
- **The `demo/landing-page` fixture quotes 333,610 reference tokens** where its
  own README traces the figure to `metadata.json`. Correcting it means
  regenerating screenshots, which needs a browser and is outside CI.

## Verification

All 10 gates green on a clean tree. Figures above were re-derived from that run,
with per-file byte counts normalised to LF — a Windows checkout reads marginally
higher, and the published numbers are the LF ones.
