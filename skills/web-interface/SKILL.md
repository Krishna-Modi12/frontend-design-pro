---
name: web-interface
description: UI review and audit — Vercel Web Interface Guidelines, copywriting, typography detail, contrast, touch targets, safe areas. Use when auditing or polishing existing UI rather than building new — design review, accessibility audit, copy review, typography and contrast passes, "make this feel more finished", "what's wrong with this component".
metadata:
  version: "14.12.0"
  core-deps:
    - core/design-tokens.md
    - core/accessibility-baseline.md
---

# Web Interface Review

## When to Use
Auditing or polishing existing UI rather than building new: design review, accessibility audit, copy review, typography and contrast passes, "make this feel more finished", "what's wrong with this component". This skill is mostly *rules to check against* rather than code to generate — but the craft rules have a worked example, cited below.

## Stack
Framework-agnostic review · applies to React 19 · Tailwind v4 output

## Core Rules
1. **Surface craft.** Layered shadows (ambient + direct, ≥2 layers), semi-transparent borders, concentric nested radii, hue-consistent borders/shadows on tinted backgrounds.
2. **Interaction increases contrast.** Hover, active and focus states must be *more* contrasted than rest — never less.
3. **Copy is UI.** Active voice ("Install the CLI"), second person, sentence case outside marketing, specific button labels ("Save API Key", never "Continue"), errors that state the fix rather than the failure.
4. **Numbers and units.** Numerals for counts ("8 deployments"), non-breaking space before units (`10&nbsp;MB`), consistent decimal places within a context, obviously-fake placeholders (`YOUR_API_TOKEN_HERE`).
5. **Typography detail.** `…` not `...` · curly quotes · loading copy ends with an ellipsis · `tabular-nums` in number columns · `text-wrap: balance` on headings.
6. **Overflow is handled.** `truncate`/`line-clamp`/`break-words` on text containers; flex children need `min-w-0` or truncation silently fails.
7. **Touch and safe areas.** `touch-action: manipulation`, `overscroll-behavior: contain` in overlays, `env(safe-area-inset-*)` on full-bleed layouts, intentional `-webkit-tap-highlight-color`.
8. **Images.** Explicit `width`/`height` (CLS), `loading="lazy"` below the fold, `priority` above it.
9. **Rendering artifacts.** Animate a wrapper rather than the text node (anti-aliasing shifts); use images not CSS gradients for long dark fades (banding).
10. **Locale.** `Intl.DateTimeFormat`/`NumberFormat`, never hardcoded formats; `translate="no"` on brand names and code tokens.

## Patterns
- **Audit output** — group by file, `file:line — rule — one-line fix`, terse, no preamble.
- **Contrast check** — WCAG 2.2 AA is the gate; APCA (Lc ≥75 body) is the tiebreaker when a colour passes 4.5:1 but still reads poorly.
- **Anti-pattern sweep** — `user-scalable=no`, blocked paste, `transition: all`, `outline:none` without replacement, `<div onClick>`, images without dimensions, `autoFocus` without justification.

## Live verification (rendered-DOM audit)
Every rule above checks source. **No gate in this pack renders anything** — a stylesheet that 404s, a 73px sideways scroll at 390px, a focus ring computing to 4.36:1, a reveal-on-scroll that died and left its text at `opacity:0` all pass a green chain. When the ask is "audit the **live site**", "check **how this actually looks**", or "does this look right **in the browser**", verify the rendered page, not just the source.

- **Hard dependency: Playwright MCP.** Rendered-DOM inspection has no source-only fallback. If the `browser_*` tools are not connected, say so and stop — never emit a source-only pass and call it a live audit.
- **Two layers, neither sufficient alone.** The 61 constraints (`scripts/test_constraints.py`) are Layer A; this rendered pass is Layer B. A page is verified only when both pass. Layer B never re-litigates what Layer A checks cleanly — it covers the render-only residue: computed contrast on arbitrary text, real overflow and overlap, dead reveals, console and network failures, focus order.
- **Engineering vs critique — never conflate them.** Objective findings (broken layout, a11y failure, console/network error, measured contrast below AA) are reported as failures. Design critique (weak hierarchy, clutter, timid spacing) is a separate, labelled section that never fails the audit.

Workflow, the confirmed tool surface, the findings schema, source-mapping, and what still cannot be measured: `references/live-verification.md`.

## Examples
`examples/good-audited-panel.tsx` is the worked craft pass: two shadow layers, hover states that *gain* contrast, `tabular-nums` on every numeric column, the `min-w-0` + `truncate` pair, `Intl` formatting and `translate="no"` on identifiers — all four states, no faked delay. Read it when the ask is "make this feel more finished".

The anti-examples are the other half — what a review rejects: `examples/bad-generic.tsx` (AI-slop layout and copy) · `examples/bad-inaccessible.tsx` (a11y failures) · `examples/bad-drive-by-refactoring.tsx` (scope violations).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Surface craft, copywriting, typography detail, safe areas, APCA | `references/web-interface-guidelines.md` |
| 200+ granular UX rules with Apple HIG / Material citations | `references/ux-deep-rules.md` |
| Core UX principles, animation rules, empty/error handling | `references/ux-guidelines.md` |
| Live-browser rendered audit — workflow, tool surface, findings schema, source-mapping | `references/live-verification.md` |

## Constraints
Report findings, don't silently rewrite — respect surgical scope (`BEHAV-01`). Any code you do produce still meets the full baseline: OKLCH tokens, WCAG 2.2 AA, four states, `prefers-reduced-motion`, TypeScript strict.
