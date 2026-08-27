#!/usr/bin/env python3
"""
Frontend Design Pro — Automated Constraint Tests
Runs programmatic assertions against generated components.

Usage:
  python test_constraints.py <component_file>     # test one file
  python test_constraints.py --dir <directory>    # test all .jsx/.tsx/.html in dir
  python test_constraints.py --dir <dir> --component
                                                  # ...as components, not pages:
                                                  # drops the page-scoped rules
                                                  # (a font import, a default
                                                  # export, landmarks, four
                                                  # states, breakpoints, a skip
                                                  # link) that a leaf component
                                                  # correctly does not have
  python test_constraints.py --self-test          # validate this script with built-in fixtures
"""

import sys
import re
import os
import json
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

# Windows consoles default to cp1252 and cannot encode this script's ✓/✗ glyphs.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

# ─────────────────────────────────────────────
# Constraint definitions
# ─────────────────────────────────────────────

@dataclass
class Constraint:
    id: str
    category: str
    description: str
    severity: str  # "critical" | "high" | "medium"
    check: callable  # fn(code: str) -> Tuple[bool, str]  (passed, evidence)


def _has(pattern: str, code: str, flags=0) -> bool:
    return bool(re.search(pattern, code, flags))

def _lacks(pattern: str, code: str, flags=0) -> bool:
    return not bool(re.search(pattern, code, flags))

# Comments are developer notes, not user-visible content. A rule about what a
# page *says* must not fire on a note explaining what the page deliberately
# avoids saying — `demo/landing-page/lib/content.ts` carries the JSDoc line
# "Invented for the sector. Not Acme, Cloudly, SmartFlow or Nexus.", which is
# the rule being obeyed out loud and would otherwise read as four violations.
#
# Deliberately conservative: block comments, and line comments only where `//`
# opens the line. A trailing `//` is left alone because `"https://…"` is far more
# common in this corpus than a trailing comment naming a banned string, and a
# stripper that eats string literals turns a gate into a source of false
# negatives — the one failure mode a gate may not have.
def _uncommented(code: str) -> str:
    code = re.sub(r"/\*.*?\*/", " ", code, flags=re.DOTALL)
    return re.sub(r"(?m)^[ \t]*//[^\n]*$", "", code)


CONSTRAINTS: List[Constraint] = [

    # ── Typography ──────────────────────────────────────────────────────────
    Constraint(
        id="TYP-01",
        category="Typography",
        description="Font declared in file (import, next/font, or @theme)",
        severity="critical",
        check=lambda c: (
            _has(r"@import url\(|next/font|@theme.*--font|Font:|font-family:|Manrope|Geist|Satoshi|Plus Jakarta|Outfit|Clash Display", c),
            "Look for @import url(, next/font, @theme, or font-family declaration"
        )
    ),
    Constraint(
        id="TYP-02",
        category="Typography",
        description="No banned display font (Inter/Roboto/Arial/Poppins/DM Sans/Space Grotesk as sole display font)",
        severity="high",
        check=lambda c: (
            # Allowed as fallback in font stacks, banned as only/primary font.
            # The banned set matches the prose: AGENT_SYSTEM_PROMPT.md §6, core/design-tokens.md,
            # skills/design-system/SKILL.md and font-pairings.md all name Space Grotesk.
            # Plus Jakarta Sans is NOT an escape hatch — aesthetic-direction.md and
            # font-pairings.md's Convergence Watch both ban it.
            # Left of the `:`/`=`: a `font-family` / `fontFamily` declaration, OR a
            # Tailwind v4 `--font-*` theme variable (`--font-sans: "Inter"`).
            not bool(re.search(
                r"""(?:font[-_]?family|--font-[\w-]+)\s*[:=]\s*["']?(Inter|Roboto|Arial|Poppins|DM Sans|Space Grotesk)["']?\s*[,;)]?\s*(?!.*Manrope|.*Geist|.*Satoshi)""",
                _uncommented(c), re.IGNORECASE
            )),
            "Banned font used as sole display font (Inter/Roboto/Arial/Poppins/DM Sans/Space Grotesk without a premium fallback)"
        )
    ),

    # ── Color ───────────────────────────────────────────────────────────────
    Constraint(
        id="COL-01",
        category="Color",
        description="No #000000 as surface/background color",
        severity="high",
        check=lambda c: (
            _lacks(r'(?:bg|background|surface)[^\n]*#000000', c, re.IGNORECASE),
            "Found #000000 used as background/surface — use #0F1419 instead"
        )
    ),
    Constraint(
        id="COL-03",
        category="Color",
        description="No pure purple-pink-blue AI gradient (unless in a comment/brand token)",
        severity="medium",
        check=lambda c: (
            _lacks(r'purple.*pink|pink.*blue|#[89abcde][0-9a-f]{5}.*#[ef][0-9a-f]{5}.*#[4-9a-b][0-9a-f]{5}', c, re.IGNORECASE),
            "Generic AI gradient pattern detected (purple→pink→blue)"
        )
    ),

    # ── Accessibility ────────────────────────────────────────────────────────
    Constraint(
        id="A11Y-07",
        category="Accessibility",
        description="aria-label on icon-only interactive elements",
        severity="critical",
        check=lambda c: (
            # Pass if no icon-only buttons exist, or if aria-label is present
            not _has(r'<button[^>]*>(?:\s*<(?:svg|Icon|icon)[^>]*>[^<]*</(?:svg|Icon|icon)>|{[^}]+Icon[^}]+})\s*</button>', c)
            or _has(r'aria-label', c),
            "Icon-only button found without aria-label"
        )
    ),
    Constraint(
        id="A11Y-08",
        category="Accessibility",
        description="All form inputs have associated labels (htmlFor/for)",
        severity="critical",
        check=lambda c: (
            not _has(r'<input', c) or _has(r'htmlFor=|<label', c),
            "Form inputs present but no label association (htmlFor / <label>) found"
        )
    ),
    Constraint(
        id="A11Y-04",
        category="Accessibility",
        description="Skip navigation link present on full pages",
        severity="medium",
        check=lambda c: (
            # Only required for full pages (which have <nav> or <header>)
            not _has(r'<nav|<header', c)
            or _has(r'skip.*content|sr-only.*focus|#main-content', c, re.IGNORECASE),
            "Full page with nav/header but no skip navigation link"
        )
    ),
    Constraint(
        id="A11Y-05",
        category="Accessibility",
        description="Images have alt attributes",
        severity="critical",
        check=lambda c: (
            not _has(r'<img(?![^>]*alt=)', c) and not _has(r'<Image(?![^>]*alt=)', c),
            "Image element found without alt attribute"
        )
    ),

    # ── Animation ────────────────────────────────────────────────────────────
    Constraint(
        id="ANI-03",
        category="Animation",
        description="No animation duration over 800ms (unless page transition)",
        severity="medium",
        check=lambda c: (
            not _has(r'duration[^\n]*[89]\d\d|duration[^\n]*[1-9]\d{3}', c)
            or _has(r'page.*transition|route.*transition', c, re.IGNORECASE),
            "Animation duration over 800ms found — UI animations should be ≤600ms"
        )
    ),

    # ── State Coverage ───────────────────────────────────────────────────────
    Constraint(
        id="STA-01",
        category="State",
        description="Loading skeleton or animate-pulse present",
        severity="high",
        check=lambda c: (
            # isSubmitting/isPending are the idiomatic names react-hook-form and
            # React 19 transitions give the same state; aria-busy is how it reaches
            # a screen reader. A form that disables its button and says "Sending…"
            # has a loading state whether or not it renders a grey rectangle.
            _has(r'animate-pulse|isLoading|isSubmitting|isPending|aria-busy|skeleton|Skeleton', c),
            "No loading state (animate-pulse / skeleton / isSubmitting / aria-busy) found"
        )
    ),
    Constraint(
        id="STA-02",
        category="State",
        description="Error state handled",
        severity="high",
        check=lambda c: (
            _has(r'\berror\b|\bError\b', c),
            "No error state handling found"
        )
    ),

    # ── Anti-AI-Slop ──────────────────────────────────────────────────────────
    Constraint(
        id="SLOP-01",
        category="Anti-AI-Slop",
        description="No placeholder names or stock values (John Doe, user123, $99.99)",
        severity="high",
        check=lambda c: (
            # The wall names these in one breath — "lorem ipsum", "John Doe",
            # "user123", "$99.99" — and only the first two were enforced. The
            # other two are the tells that a demo was filled in rather than
            # written: nobody's handle is `user123` and nothing costs $99.99
            # except a price invented to look like a price.
            _lacks(r'John Doe|Jane Doe|\buser123\b|\$99\.99\b', _uncommented(c)),
            "Placeholder names or stock values found — use realistic diverse "
            "names and organic prices"
        )
    ),
    Constraint(
        id="SLOP-02",
        category="Anti-AI-Slop",
        description="No AI-slop copywriting (Elevate/Seamless/Unleash/Revolutionize)",
        severity="high",
        check=lambda c: (
            _lacks(r'\b(Elevate|Seamless|Unleash|Revolutionize|Transform your|Game.changer)\b', c, re.IGNORECASE),
            "AI-generic marketing copy detected"
        )
    ),
    Constraint(
        id="SLOP-03",
        category="Anti-AI-Slop",
        description="No placeholder comments (// ... or // TODO)",
        severity="medium",
        check=lambda c: (
            _lacks(r'//\s*\.\.\.|//\s*TODO|//\s*Add\b|/\*\s*TODO', c),
            "Placeholder comments found — output must be complete"
        )
    ),
    Constraint(
        id="SLOP-04",
        category="Anti-AI-Slop",
        # Catches bare placeholder-round comma-figures (10,000 / $10,000 / 100,000+).
        # Percent literals (50%, 100%) are deliberately NOT checked: bare 50%/100%
        # are common, legitimate CSS (oklch(50%_...), calc(50%-12px), Tailwind
        # arbitrary values, inline width:"100%") and a regex can't reliably tell
        # that apart from marketing copy — verified against all 137 example files,
        # where any percent-inclusive version produced false positives a comma-only
        # check does not. It does not evaluate whether the actual figures in a file
        # are plausible for their domain — a file full of clean-but-fabricated
        # numbers passes. Agent judgment is still required for realistic-looking
        # invented data and for round percentages; do not cite this as coverage
        # for either.
        description="No bare placeholder-round comma-figures (10,000, $10,000, 100,000+) — percent literals and other fabricated figures are not evaluated",
        severity="medium",
        check=lambda c: (
            # Pass if there are some non-round values OR no numeric data at all.
            # _uncommented() so illustrative "don't do X" comments (e.g. a JSDoc
            # example citing "4,217 not 10,000+") don't count as live evidence.
            _has(r'\d+\.\d+%|\$(?!10,000\b)(?!100,000\b)\d+,\d{3}(?!\d)|(?<![\d.])(?!10,000\b)(?!100,000\b)\d{1,2},\d{3}\b', _uncommented(c))
            or _lacks(r'\$?(?<![\d.])(?:10,000|100,000)\+?(?!\d)', _uncommented(c)),
            "Only round-number data values found — use organic values (47.2%, $12,847)"
        )
    ),
    Constraint(
        id="SLOP-05",
        category="Anti-AI-Slop",
        description="No placeholder brand names (Acme, Cloudly, SmartFlow, Nexus)",
        severity="high",
        check=lambda c: (
            _lacks(r'\b(Acme|Cloudly|SmartFlow|Nexus)\b', _uncommented(c)),
            "Placeholder brand name found — invent one that fits the sector"
        )
    ),
    Constraint(
        id="SLOP-06",
        category="Anti-AI-Slop",
        # The wall bans "custom mouse cursors" outright — unlike the three AI-design
        # defaults named in the same line, there is no "unless the brief asks for
        # them" carve-out for this one, so a hard ban is the right shape here.
        # `cursor-none` is checked because it is the mechanism a custom-cursor
        # follower needs (hide the real pointer, then render a tracking element in
        # its place) and has no other common legitimate use in this pack's
        # component code; `cursor: url(...)` is the other real mechanism, a raw
        # CSS/inline-style custom pointer image. Neither pattern occurs anywhere in
        # this repo's own corpus today (skills/, demo/, home/, core/ — checked
        # before shipping), so this has no real-corpus false-positive evidence
        # either way; if a legitimate `cursor-none` use surfaces later (e.g. a
        # canvas/game surface that hides the pointer without replacing it), add a
        # documented exemption rather than loosening the pattern.
        description="No custom mouse cursors (cursor-none / cursor: url(...))",
        severity="medium",
        check=lambda c: (
            _lacks(r'\bcursor-none\b|cursor\s*:\s*url\(', _uncommented(c)),
            "Custom mouse cursor found — the anti-slop wall bans this outright, no brief exemption"
        )
    ),

    # ── Responsive ───────────────────────────────────────────────────────────
    Constraint(
        id="RES-01",
        category="Responsive",
        description="Responsive breakpoints present (sm:/md:/lg:)",
        severity="high",
        check=lambda c: (
            _has(r'(?:sm|md|lg|xl):', c),
            "No responsive breakpoints found — component will not adapt to screen size"
        )
    ),
    Constraint(
        id="RES-02",
        category="Responsive",
        description="Touch targets ≥ 44px on interactive elements",
        severity="high",
        # "on interactive elements" was in the description and in nobody's code:
        # the check asked every file for a 44px class, including files with
        # nothing to touch. A presentational badge failed a rule about thumbs.
        # Absent anything interactive the rule has no subject, so it passes —
        # this can only turn a false failure into a pass, never the reverse.
        check=lambda c: (
            (not _has(r'<button|<a\s|<input|<select|<textarea|<summary'
                      r'|onClick=|onPointerDown=|role="button"|role="link"'
                      r'|role="tab"|role="menuitem"|role="switch"|role="checkbox"', c))
            or _has(r'min-h-\[44|h-11|size-11|min-h-11|min-w-\[44|p-3|py-3', c),
            "No 44px minimum touch target found — mobile interactive elements need min 44×44px"
        )
    ),

    # ── Token Hygiene ─────────────────────────────────────────────────────────
    Constraint(
        id="TOK-01",
        category="Token Hygiene",
        description="No hex values in CSS token/variable definitions (use OKLCH)",
        severity="high",
        check=lambda c: (
            # Any CSS custom property whose value carries a hex is using hex as a
            # colour — `--color-*`, `--shadow-*`, and the bare Tailwind-v4 / shadcn
            # semantic tokens (`--background: #0a0a0a`, `--ring:`, `--border:` …).
            not bool(re.search(
                r'--[A-Za-z_][\w-]*\s*:\s*[^;{}]*#[0-9A-Fa-f]{3,8}\b',
                _uncommented(c)
            )),
            "Hex value found in CSS token definition — convert to oklch() per impeccable-techniques.md"
        )
    ),
    Constraint(
        id="TOK-02",
        category="Token Hygiene",
        description="No raw hex as Tailwind @theme values (use OKLCH)",
        severity="medium",
        check=lambda c: (
            # `@theme {`, `@theme inline {`, `@theme static {`, `@theme inline static {`
            # — the ` inline` option is the dominant Tailwind-v4 / shadcn form.
            not bool(re.search(
                r'@theme(?:\s+[a-z]+)*\s*\{[^}]*#[0-9A-Fa-f]{3,8}',
                _uncommented(c), re.DOTALL
            )),
            "Hex value found inside @theme block — use oklch() values"
        )
    ),

    # ── Code Quality ──────────────────────────────────────────────────────────
    Constraint(
        id="QUA-01",
        category="Code Quality",
        description="Default export present",
        severity="critical",
        check=lambda c: (
            _has(r'export default', c),
            "No default export found"
        )
    ),
    Constraint(
        id="QUA-02",
        category="Code Quality",
        description="Semantic HTML elements used",
        severity="high",
        check=lambda c: (
            _has(r'<nav|<main|<section|<article|<header|<footer|<aside', c),
            "No semantic HTML elements found — use nav, main, section, article, header, footer"
        )
    ),
    Constraint(
        id="QUA-03",
        category="Code Quality",
        description="No Lorem Ipsum placeholder content",
        severity="medium",
        check=lambda c: (
            _lacks(r'Lorem ipsum|lorem ipsum', c),
            "Lorem ipsum placeholder text found"
        )
    ),

    # ── TypeScript + hex-ban additions ──────────────────────────────────────────────────
    Constraint(
        id="COL-04",
        category="Color",
        description="No arbitrary hex colors in component code ([#hex]) — OKLCH only (token definition files exempt)",
        severity="high",
        check=lambda c: (
            _lacks(r"\[#[0-9a-fA-F]{3,8}\]", c),
            "Arbitrary hex color found (e.g. bg-[#0F1419]) — use oklch() arbitrary values or semantic tokens"
        )
    ),


    Constraint(
        id="DELAY-01",
        category="Anti-slop",
        description="[secondary to DELAY-01-AST] No artificial mount-time loading delay (string fallback)",
        severity="high",
        check=lambda c: (
            _lacks(r"useEffect\([\s\S]{0,160}?setTimeout\([\s\S]{0,100}?set\w*([Ll]oading|[Mm]ounted)\w*\((false|true)\)", c),
            "Mount-time fake delay found — drive skeletons from real loading state (isLoading prop / real fetch)"
        )
    ),


    # ── Anti-slop wall items that had no enforcer ────────────────────────────
    # Each of these is named in SKILL.md's wall and in core/validate-checklist.md,
    # and each was, until now, checked by nobody. The anti-examples had already
    # started annotating `❌ [RES] min-h-screen` — citing an ID the suite did not
    # define. A rule stated in three documents and enforced in none is the exact
    # gap this pack exists to close.
    Constraint(
        id="RES-03", category="Responsive",
        description="No min-h-screen — use min-h-[100dvh] (svh/dvh survive mobile URL bars)",
        severity="high",
        check=lambda c: (_lacks(r"\bmin-h-screen\b", c),
                         "min-h-screen found — 100vh ignores the mobile toolbar; use min-h-[100dvh]")),
    Constraint(
        id="TS-02", category="TypeScript",
        description="No React.FC — it erases children typing and blocks generic components",
        severity="high",
        check=lambda c: (_lacks(r"\bReact\.FC\b|\bReact\.FunctionComponent\b", c),
                         "React.FC found — annotate props directly: ({ a }: Props) => …")),
    Constraint(
        id="PLAT-01", category="Platform",
        description="No onPress on web (React Native files exempt)",
        severity="high",
        # Scoped by import, not by filename: a good-react-native.tsx gold legitimately
        # uses onPress, and a rule that fails it would be wrong rather than strict.
        check=lambda c: (
            _has(r"""from\s+["']react-native["']|from\s+["']expo""", c)
            or _lacks(r"\bonPress(?:In|Out)?\s*=", c),
            "onPress on a web component — the web handler is onClick")),

    # ── Defects the field ships and nobody checks ────────────────────────────
    # Three rules that survived a sweep of both suites: none of the 56 existing
    # constraints catches any of them, and no competing pack enforces them at
    # all. Each is ban-shaped, so each is inherited by Gate 10 over the whole
    # reference corpus for free — a rule that only holds in examples is a rule
    # that does not hold where the agent actually reads.
    Constraint(
        id="A11Y-06", category="Accessibility",
        description="outline-none must be paired with a visible focus-visible ring",
        severity="critical",
        # A11Y-02 (AST) checks that focus-visible sits on an interactive element —
        # it catches the ring being in the wrong place. It cannot catch the far
        # commoner defect: removing the outline and replacing it with nothing.
        # Tailwind's focus-visible:outline-none is the legitimate reset (the ring
        # utility supplies the replacement), so only the unqualified form is banned.
        #
        # `focus:` counts as well as `focus-visible:`. The rule is "there is a
        # visible indicator", not "the indicator uses the newer variant" — a
        # focus:border colour change is a real indicator, and failing it would
        # make the rule wrong rather than strict.
        check=lambda c: (
            not _has(r"(?<!focus-visible:)(?<!focus:)\boutline-none\b", c)
            or _has(r"focus(?:-visible)?:(?:ring|outline|border|shadow)", c),
            "outline-none with no focus/focus-visible indicator — keyboard users lose the page"
        )
    ),
    Constraint(
        id="TYP-03", category="Typography",
        description="No gradient text on body copy (bg-clip-text is display-only)",
        severity="high",
        # Legitimate on a display heading. On prose it sets the computed colour to
        # transparent, which destroys contrast and silently defeats every contrast
        # checker — the ratio is measured against a colour no reader ever sees.
        check=lambda c: (
            _lacks(
                r"(?:text-(?:xs|sm|base|lg)|leading-relaxed|prose)[^\"'`]{0,120}\bbg-clip-text\b"
                r"|\bbg-clip-text\b[^\"'`]{0,120}(?:text-(?:xs|sm|base|lg)|leading-relaxed|prose)",
                c),
            "bg-clip-text on body-sized text — the computed colour is transparent, so contrast is unmeasurable"
        )
    ),
    Constraint(
        id="FORM-01", category="Forms",
        description="Inputs are ≥16px on mobile — smaller zooms iOS Safari and never zooms back",
        severity="high",
        # text-sm is 14px and text-xs is 12px. Below 16px, focusing an input makes
        # iOS Safari zoom the viewport, and it does not restore on blur. Invisible
        # on desktop, universal on iPhone. Responsive forms (text-sm sm:text-base)
        # are the same bug: the small value is the one mobile gets.
        check=lambda c: (
            _lacks(r"<(?:input|textarea|select|Input|Textarea|Select)\b[^>]{0,400}?\btext-(?:xs|sm)\b", c),
            "input/textarea below 16px — iOS Safari zooms the viewport on focus and does not zoom back"
        )
    ),

    # ── Vercel Web Interface Guidelines ──────────────────────────
    Constraint(
        id="COPY-02", category="Copy",
        description="Loading/saving copy uses the ellipsis character (…) not three dots",
        severity="medium",
        check=lambda c: (_lacks(r"(Loading|Saving|Uploading|Processing|Deleting)\.\.\.", c),
                         "Use 'Loading…' (U+2026), not 'Loading...'")),
    Constraint(
        id="MOTION-02R", category="Animation",
        description="[widens MOTION-02 AST] No bounce/elastic/back easing — overshoot reads dated",
        severity="medium",
        # Anchored on the easing PROPERTY, never the bare word: `animate-bounce` is a
        # legitimate Tailwind utility (typing-indicator dots) and `dragElastic` is a
        # Framer drag-physics prop. Neither is an easing curve.
        check=lambda c: (
            # (?![a-z]) instead of \b so camelCase `backOut` is caught while
            # `background` / `backdrop` are not. Deliberately case-SENSITIVE:
            # under re.IGNORECASE the [a-z] class also matches the uppercase O in
            # `backOut`, which would defeat the lookahead. GSAP and Framer both
            # write these keywords lowercase.
            _lacks(r"""\b(?:ease|easing)\s*[:=]\s*["'`][^"'`]*\b(?:bounce|elastic|back)(?![a-z])""", c)
            and _lacks(r"""\bbounce\s*:\s*(?:0?\.[4-9]\d*|[1-9])""", c),
            "Bounce/elastic/back easing (or spring bounce > 0.4) — use power/expo/cubic-bezier easing; overshoot reads dated"
        )),
    Constraint(
        id="TOUCH-01", category="Touch",
        description="Modals/drawers/sheets contain overscroll (overscroll-behavior: contain)",
        severity="medium",
        check=lambda c: (
            not _has(r'role="dialog"|<Drawer|<Sheet|<Dialog\b', c) or _has(r"overscroll-(behavior|contain)", c),
            "Overlay present without overscroll-behavior: contain — scroll chaining leaks to the page")),
    Constraint(
        id="SAFE-01", category="Touch",
        description="Full-bleed / fixed-bottom layouts respect safe-area insets",
        severity="medium",
        check=lambda c: (
            not _has(r"fixed\s+(inset-x-0\s+)?bottom-0|position:\s*fixed[^;]*bottom", c) or _has(r"env\(safe-area-inset|safe-area|pb-safe", c),
            "Fixed bottom layout without env(safe-area-inset-*) — clipped by the home indicator")),
    Constraint(
        id="PERF-04R", category="Performance",
        description="[secondary to PERF-04 AST] No transition: all / transition-all",
        severity="medium",
        check=lambda c: (_lacks(r"\btransition-all\b|transition:\s*all\b", c),
                         "transition: all — list animated properties explicitly")),
    Constraint(
        id="IMG-01", category="Performance",
        description="[secondary to A11Y-03 AST] <img> declares width/height (or fill)",
        severity="medium",
        check=lambda c: (
            not _has(r"<img\b", c) or _has(r"<img[^>]*\b(width|fill)\b", c),
            "<img> without explicit dimensions — causes CLS")),


    # ── Behavioral (Karpathy layer) ────────────────────────────────────────
    Constraint(
        id="BEHAV-05", category="Behavior",
        description="No TODO/FIXME/HACK/XXX markers in shipped code (extends SLOP-03 beyond // TODO)",
        severity="high",
        check=lambda c: (_lacks(r"\b(FIXME|HACK|XXX)\b|\bTODO\b", c),
                         "Unfinished-work marker in shipped code — finish it or ask, don't ship a marker")),
    Constraint(
        id="BEHAV-06", category="Behavior",
        description="No speculative future-proofing comments (P2 — YAGNI)",
        severity="medium",
        check=lambda c: (
            _lacks(r"(?://|/\*)[^\n]*\b(for future use|might need|could be useful|placeholder for|eventually we|will be needed|in case we)\b", c, re.IGNORECASE),
            "Speculative 'might need later' comment — build it when it is needed (P2)")),


    # ── 3D / R3F ───────────────────────────────────────────────────────────
    Constraint(
        id="3D-04", category="3D",
        description="R3F Canvas container is either labelled (aria-label) or explicitly decorative (aria-hidden)",
        severity="critical",
        check=lambda c: (
            not _has(r"<Canvas\b", c) or _has(r"aria-label=", c) or _has(r'aria-hidden=["{]?\s*"?true', c),
            "<Canvas> container is neither labelled nor marked decorative — a canvas is opaque to screen readers; "
            "use aria-label for meaningful scenes or aria-hidden=\"true\" for purely decorative ones")),
    Constraint(
        id="3D-05", category="3D",
        description="No raw hex in THREE.Color — use OKLCH/CSS color strings",
        severity="high",
        check=lambda c: (_lacks(r"new\s+THREE\.Color\(\s*0x[0-9a-fA-F]{3,8}", c),
                         'new THREE.Color(0x…) — use new THREE.Color("oklch(60% 0.185 276)")')),
    Constraint(
        id="3D-06", category="3D",
        description="useFrame animation is delta-driven, not frame-counted",
        severity="high",
        check=lambda c: (
            not _has(r"useFrame\(", c) or _lacks(r"useFrame\(\s*\(\s*\)\s*=>", c),
            "useFrame(() => …) with no state/delta — drive motion by delta for frame-rate independence")),
    Constraint(
        id="3D-07", category="3D",
        description="3D asset loading uses Suspense/useProgress, not a setTimeout fake delay",
        severity="high",
        check=lambda c: (
            not _has(r"useGLTF|useTexture|useFBX|useKTX2", c) or _lacks(r"setTimeout[^\n]{0,80}set\w*(Loading|Loaded|Ready)", c),
            "Asset loader present with a setTimeout-driven loading flag — use <Suspense> + useProgress")),

]


# ─────────────────────────────────────────────
# Runner
# ─────────────────────────────────────────────

@dataclass
class TestResult:
    constraint: Constraint
    passed: bool
    evidence: str


# Constraints that describe a *page*, not a unit of code. Each one is correct
# against `skills/*/examples/`, where every gold is a whole self-contained
# screen — and wrong against a real codebase, where a status pill is a status
# pill. Pointed at four correctly-factored components, the suite reported 0/4
# and every failure in that report was an artefact of this: a badge asked for a
# loading skeleton, a font import and a landmark element.
#
# `check_references.py` already learned this lesson for markdown fragments and
# carries FRAGMENT_SAFE. This is the same insight applied to the entry point a
# user actually points at their own code.
PAGE_SCOPED = {
    "TYP-01": "a font is declared once per app, not once per component",
    "QUA-01": "a default export — named exports are the convention this pack's "
              "own core/component-api.md demonstrates, and PERF-01 bans the "
              "barrel files that make default exports ergonomic",
    "QUA-02": "landmark elements (nav/main/header/footer) belong to the page "
              "that composes the component, not to the component",
    "STA-01": "a loading state — a presentational component has no async of its own",
    "STA-02": "an error state, for the same reason",
    "RES-01": "responsive breakpoints — a leaf component may legitimately have none",
    "RES-02": "44px touch targets, which this rule also asks of files that "
              "contain nothing interactive",
    "A11Y-04": "a skip link, which belongs to the page shell",
}


# Known, declared violations — carried openly rather than quietly excluded.
#
# `demo/showcase` is named "Nexus", which SLOP-05 bans, and it has been for its
# whole life. The violation is already written down in `demo/showcase/README.md`
# with the reason the rename is deferred (sixteen files including
# `package-lock.json`, plus a committed screenshot that only the out-of-CI
# browser harness can regenerate). This entry is that same disclosure in a form
# the suite can read, so the rule can ship *now* and catch the next instance
# instead of waiting on a rename to catch none.
#
# The cost is stated on every run — an exemption nobody is reminded of is an
# exemption that becomes permanent. Delete this entry with the rename; the
# constraint is what makes deleting it possible to verify.
GRANDFATHERED = {
    "demo/showcase": {
        "SLOP-05": "named Nexus since before the rule existed — see "
                   "demo/showcase/README.md 'Known violation — the name'",
    },
}


def _grandfathered_for(path: str) -> dict:
    norm = str(path).replace("\\", "/")
    for prefix, waivers in GRANDFATHERED.items():
        if prefix in norm:
            return waivers
    return {}


def run_constraints(code: str, component_mode: bool = False,
                    path: str = "") -> List[TestResult]:
    results = []
    waived = _grandfathered_for(path)
    for c in CONSTRAINTS:
        if component_mode and c.id in PAGE_SCOPED:
            continue
        if c.id in waived:
            continue
        passed, evidence = c.check(code)
        results.append(TestResult(constraint=c, passed=passed, evidence=evidence))
    return results


def report(filename: str, results: List[TestResult], json_out: bool = False) -> dict:
    passed = [r for r in results if r.passed]
    failed = [r for r in results if not r.passed]
    total = len(results)
    rate = (len(passed) / total * 100) if total else 0
    status = "PASS" if rate >= 90 else "NEEDS WORK" if rate >= 70 else "FAIL"

    by_severity = {"critical": [], "high": [], "medium": []}
    for r in failed:
        by_severity[r.constraint.severity].append(r)

    if json_out:
        return {
            "file": filename,
            "status": status,
            "passed": len(passed),
            "failed": len(failed),
            "total": total,
            "rate": round(rate, 1),
            "failures": [
                {
                    "id": r.constraint.id,
                    "severity": r.constraint.severity,
                    "category": r.constraint.category,
                    "description": r.constraint.description,
                    "evidence": r.evidence,
                }
                for r in failed
            ]
        }

    print(f"\n{'='*64}")
    print(f"Frontend Design Pro — Constraint Test Report")
    print(f"{'='*64}")
    print(f"File   : {filename}")
    print(f"Status : {status}  ({len(passed)}/{total} = {rate:.0f}%)")
    print(f"{'-'*64}")

    for severity, color_label in [("critical", "🔴 CRITICAL"), ("high", "🟠 HIGH"), ("medium", "🟡 MEDIUM")]:
        failures = by_severity[severity]
        if failures:
            print(f"\n  {color_label} failures:")
            for r in failures:
                print(f"    ✗ [{r.constraint.id}] {r.constraint.description}")
                print(f"      → {r.evidence}")

    if not failed:
        print("\n  ✓ All constraints passed. Component is shippable.")
    else:
        print(f"\n  ⚠  {len(by_severity['critical'])} critical, {len(by_severity['high'])} high, {len(by_severity['medium'])} medium issues.")
        if by_severity["critical"]:
            print("  ❌ Critical failures must be fixed before shipping.")

    print(f"{'='*64}\n")
    return {"status": status, "rate": rate, "passed": len(passed), "failed": len(failed),
            "total": total, "failed_ids": [r.constraint.id for r in failed]}


# ─────────────────────────────────────────────
# Self-test fixtures
# ─────────────────────────────────────────────

FIXTURE_GOOD = """
import { useState, useEffect } from 'react';
// @import url('https://fonts.googleapis.com/css2?family=Manrope&display=swap')

interface DashboardProps { isLoading?: boolean }
type Metric = { label: string; value: string }

/** Brand invented for the sector. Not Acme, Cloudly, SmartFlow or Nexus. */
const BRAND = 'Halloway';

export default function Dashboard({ isLoading = false }: DashboardProps = {}) {
  const [error, setError] = useState(null);

  if (isLoading) return <div className="animate-pulse bg-slate-200 h-48 rounded-xl" />;
  if (error) return <div role="alert">Error: {error.message} <button onClick={retry}>Retry</button></div>;

  return (
    <main className="min-h-[100dvh] bg-[oklch(98.4%_0.003_247.9)] font-[Manrope,system-ui]">
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
      <nav aria-label="Main navigation">
        <button className="h-11 min-w-[44px] focus:ring-2 focus:ring-offset-2" aria-label="Open menu">
          <svg aria-hidden="true"><path /></svg>
        </button>
      </nav>
      <section id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[oklch(18.8%_0.013_248.5)]">Dashboard</h1>
        <p className="mt-4 text-lg text-[oklch(55.1%_0.023_264.4)]">Revenue: $12,847 — Growth: 47.2%</p>
        <img src="/chart.png" alt="Revenue chart for Q4 2024" loading="lazy" width="800" height="400" />
        <label htmlFor="search">Search</label>
        <input id="search" type="text" className="focus:ring-2 border-2 rounded-lg p-3" aria-describedby="search-error" />
        <span id="search-error" className="text-red-500">Error: search failed</span>
      </section>
      <style>{`
        :root { --surface: oklch(98% 0.003 248); --ring: oklch(62% 0.19 264); }
        @theme inline { --color-brand: oklch(62% 0.19 264); --font-sans: "Geist", system-ui; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </main>
  );
}
"""

FIXTURE_BAD = """
function Widget() {
  return (
    <div style={{ fontFamily: 'Inter', background: '#FFFFFF' }} className="cursor-none">
      <style>{`
        :root { --background: #0a0a0a; --font-sans: "Inter", sans-serif; }
        @theme inline { --color-brand: #6366f1; }
      `}</style>
      <button>✕</button>
      <input type="text" />
      <p>Hello John Doe (@user123), welcome to Acme. Elevate your experience!</p>
      <p>Growth: 50% Revenue: $10,000 — Pro plan $99.99/mo</p>
      <img src="/img.png" />
      <div className="animate-spin duration-1000" />
    </div>
  );
}
"""


# `core/validate-checklist.md` is the list an agent is told to self-check
# against, and it is maintained by hand. It has drifted twice: it read
# "## Regex-enforced (36)" against a real 42, and — one release later, in the
# commit that fixed that — the heading was corrected to 43 while the roster
# underneath still ended at SLOP-04.
#
# The figure gate reads the *number in the heading*. Nothing read the IDs. So
# the count and the list could disagree indefinitely, and the file an agent is
# pointed at could quietly stop naming a rule the suite enforces. That is worse
# than a wrong number: the agent obeys the list, and the gate fails it on a rule
# the list never mentioned.
#
# This runs on every invocation rather than only under --self-test, because
# --self-test is not in the release chain and this needs to be.
_ID_IN_PROSE = re.compile(
    r"`([A-Z0-9]{2,7}-[0-9]{2}(?:-AST)?[A-Z]?(?:/[0-9]{2}[A-Z]?)*)`")


def _expand_ids(token: str) -> List[str]:
    """`SLOP-01/02/03/04/05` is five IDs written once. `MOTION-02R` is one."""
    head, _, rest = token.partition("-")
    return [f"{head}-{part}" for part in rest.split("/")]


def roster_check() -> bool:
    checklist = Path(__file__).resolve().parent.parent / "core" / "validate-checklist.md"
    if not checklist.exists():
        return True  # not shipped beside the suite; nothing to compare against
    text = checklist.read_text(encoding="utf-8")
    # BEHAV-01..04 live under "## Self-checks (not machine-enforceable)" and are
    # correctly absent from both suites. Only the sections above that heading
    # claim enforcement, so only those are compared.
    enforced_part, _, selfcheck_part = text.partition("## Self-checks")
    listed = set()
    for tok in _ID_IN_PROSE.findall(enforced_part):
        listed.update(_expand_ids(tok))
    defined = {c.id for c in CONSTRAINTS} | set(PARSER_CHECK_IDS)
    missing, extra = sorted(defined - listed), sorted(listed - defined)

    # The closing "**Total: N machine-enforced (P parser + R regex) + S
    # self-checks**" line restates all four numbers in a prose shape no figure
    # pattern matches — it says "machine-enforced", not "constraints" — so it
    # sat at 59/42 through the release that corrected every other surface.
    # Everything in it is derivable, so derive it.
    n_par, n_reg = len(PARSER_CHECK_IDS), len(CONSTRAINTS)
    # Table rows only — the prose that follows the Total line names half a dozen
    # enforced IDs while explaining the renumbering, and none of those is a
    # self-check.
    n_self = len(set(re.findall(r"(?m)^\|\s*`([A-Z0-9-]+)`\s*\|", selfcheck_part)))
    want = [n_par + n_reg, n_par, n_reg, n_self]
    total_line = next((l for l in text.splitlines() if l.startswith("**Total:")), "")
    got = [int(n) for n in re.findall(r"\d+", total_line)]
    total_bad = bool(total_line) and got[:4] != want

    if not missing and not extra and not total_bad:
        return True
    print(f"\n[ROSTER] {checklist.name} disagrees with the suites it documents.")
    if missing:
        print(f"  enforced but not listed: {', '.join(missing)}")
        print("  → an agent self-checking against that file is not told about these")
    if extra:
        print(f"  listed but not enforced: {', '.join(extra)}")
        print("  → the file promises a check that no longer exists")
    if total_bad:
        print(f"  the Total line reads {got[:4]}, the suites say {want}")
        print(f"  → {total_line.strip()}")
    return False


def self_test():
    print("\nRunning self-test with built-in fixtures...\n")

    good_results = run_constraints(FIXTURE_GOOD)
    good_passed = sum(1 for r in good_results if r.passed)
    good_total = len(good_results)
    print(f"✓ GOOD fixture: {good_passed}/{good_total} passed")
    good_failures = [r for r in good_results if not r.passed]
    if good_failures:
        for r in good_failures:
            print(f"  - [{r.constraint.id}] {r.constraint.description}")

    bad_results = run_constraints(FIXTURE_BAD)
    bad_failed = sum(1 for r in bad_results if not r.passed)
    bad_total = len(bad_results)
    print(f"✓ BAD fixture: {bad_failed}/{bad_total} failed (expected: many failures)")
    bad_passes = [r for r in bad_results if r.passed]
    if bad_passes:
        for r in bad_passes:
            print(f"  - [{r.constraint.id}] {r.constraint.description} (unexpectedly passed)")

    print(f"\nSelf-test complete. {len(CONSTRAINTS)} constraints defined.")


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────


def compile_check() -> bool:
    """Run the TypeScript compile gate (scripts/typecheck_golds.py) before regex checks.
    Compilation errors are BLOCKERS; regex constraints are style gates.
    Returns True to proceed: passes, or tsc unavailable (exit 2 → warn + continue)."""
    import subprocess, sys as _sys
    from pathlib import Path as _P
    script = _P(__file__).resolve().parent / "typecheck_golds.py"
    proc = subprocess.run([_sys.executable, str(script)], capture_output=True, text=True)
    out = (proc.stdout + proc.stderr).strip()
    if proc.returncode == 0:
        print(f"[compile gate] {out}")
        return True
    if proc.returncode == 2:
        print(f"[compile gate] {out} — continuing with regex checks only.")
        return True
    print("[compile gate] FAILED — compilation errors are blockers; fix before style checks:\n")
    print(out)
    return False


PARSER_CHECK_IDS = ["A11Y-01", "A11Y-02", "A11Y-03", "MOTION-01", "MOTION-02", "ANI-04", "TS-01-AST",
                    "COL-02-AST", "DELAY-01-AST", "COMP-01", "PERF-01", "PERF-02", "PERF-04", "COPY-01",
                    "3D-01", "3D-02", "3D-03"]

def parser_check(files) -> bool:
    """AST-based semantic gate (scripts/parser_constraints.js). Parser errors are
    BLOCKERS: they mean a rule is being faked (comment/string compliance) or a real
    anti-pattern is present. Returns True to proceed; graceful skip when node absent."""
    import shutil, subprocess, json as _json
    from pathlib import Path as _P
    if shutil.which("node") is None:
        print("[parser gate] node not found — skipping semantic checks (regex only). Install Node + `npm install typescript`.")
        return True
    script = _P(__file__).resolve().parent / "parser_constraints.js"
    tsx = [f for f in files if str(f).endswith(".tsx")]
    passed, failed = 0, []
    for f in tsx:
        proc = subprocess.run(["node", str(script), str(f)], capture_output=True, text=True)
        if proc.returncode == 3:
            # The parser told us it could not run at all. Every file would say
            # the same, so stop asking and say so once.
            print(f"[parser gate] {proc.stderr.strip()}")
            print("[PARSER] skipped — regex checks only.")
            return True
        try:
            data = _json.loads(proc.stdout)
        except Exception:
            failed.append((f, [{"check": "PARSER", "line": 0, "message": proc.stderr.strip()[:200]}])); continue
        if proc.returncode == 0:
            passed += 1
        else:
            failed.append((f, data.get("errors", [])))
    gold_failed = [x for x in failed if "bad-" not in str(x[0])]
    print(f"[PARSER] {passed}/{len(tsx)} files passed semantic checks ({len(PARSER_CHECK_IDS)} AST constraints)")
    for f, errs in failed:
        tagline = "(anti-example — expected)" if "bad-" in str(f) else "BLOCKER"
        print(f"  ✗ {f} {tagline}")
        for e in errs[:6]:
            print(f"      [{e['check']}] L{e['line']}: {e['message']}")
    if gold_failed:
        print("\n[parser gate] semantic BLOCKERS on gold files — fix before style checks run.")
        return False
    return True

def main():
    if "--self-test" not in sys.argv and not compile_check():
        sys.exit(1)
    if not roster_check():
        sys.exit(1)
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    if args[0] == "--self-test":
        self_test()
        sys.exit(0)

    json_output = "--json" in args
    # Demos nest as demo/<name>/<layer>/*.tsx, which neither of the flat --dir
    # globs below reaches; --recursive walks the whole tree instead.
    recursive = "--recursive" in args
    # --project judges each immediate subdirectory as one unit (see below).
    project_mode = "--project" in args
    # --component drops the page-scoped constraints (see PAGE_SCOPED). Point it
    # at a components/ directory; leave it off for pages and whole screens.
    component_mode = "--component" in args
    args = [a for a in args
            if a not in ("--json", "--recursive", "--project", "--component")]

    files_to_check: List[Path] = []

    if args[0] == "--dir":
        if len(args) < 2:
            print("Error: --dir requires a directory path")
            sys.exit(1)
        d = Path(args[1])
        if not d.is_dir():
            print(f"Error: {d} is not a directory")
            sys.exit(1)
        for ext in ("*.jsx", "*.tsx", "*.html", "*.js", "*.ts"):
            if recursive:
                files_to_check.extend(d.rglob(ext))
            else:
                files_to_check.extend(d.glob(ext))
                files_to_check.extend(d.glob(f"examples/{ext}"))     # --dir skills/<id>
                files_to_check.extend(d.glob(f"*/examples/{ext}"))   # --dir skills  (Gate 5)
    else:
        for path in args:
            p = Path(path)
            if not p.exists():
                print(f"Error: {p} not found")
                sys.exit(1)
            files_to_check.append(p)

    if not files_to_check:
        print("No files found to check.")
        sys.exit(1)

    all_results = []
    # demo/showcase differs from the other demos only in how it is COMPILED (real
    # installed deps vs demo/_stubs.d.ts). The rules below are about content —
    # OKLCH tokens, banned fonts, placeholder copy, states, touch targets — and
    # apply to it exactly as they do to everything else. Its vendored and
    # generated trees are skipped: they are not authored code.
    _GENERATED = {"node_modules", ".next", "out", "dist", ".turbo"}
    files_to_check = [f for f in files_to_check
                      if not str(f).endswith(".d.ts") and not str(f).endswith(".test.tsx")
                      and not _GENERATED & set(f.parts)
                      and f.name != "next-env.d.ts"]
    if not parser_check(files_to_check):
        sys.exit(1)

    if project_mode:
        # A gold example is one self-contained file, so every constraint can be
        # answered from it. A demo is a project: the font lives in the shell, the
        # error branch in one component, the touch targets in another. Checking
        # each file alone would demand that lib/data.ts declare a font. The unit
        # of judgement is therefore the project — one report per immediate
        # subdirectory, over its concatenated sources.
        groups: dict = {}
        base = Path(args[1])
        for f in files_to_check:
            try:
                name = f.relative_to(base).parts[0]
            except ValueError:
                name = f.parent.name
            groups.setdefault(name, []).append(f)
        for name in sorted(groups):
            code = "\n".join(p.read_text(encoding="utf-8") for p in sorted(groups[name]))
            label = f"{base}/{name} ({len(groups[name])} files)"
            results = run_constraints(code, component_mode, f"{base}/{name}")
            r = report(label, results, json_out=json_output)
            all_results.append({"file": label, **r})
    else:
        for filepath in sorted(files_to_check):
            code = filepath.read_text(encoding="utf-8")
            results = run_constraints(code, component_mode, str(filepath))
            r = report(str(filepath), results, json_out=json_output)
            all_results.append({"file": str(filepath), **r})

    if json_output:
        print(json.dumps(all_results, indent=2))

    gold = [r for r in all_results if "bad-" not in r["file"]]
    gold_clean = sum(1 for r in gold if r["rate"] == 100)
    n_regex = len(CONSTRAINTS) - (len(PAGE_SCOPED) if component_mode else 0)
    unit = ("demo projects" if project_mode
            else "components" if component_mode else "files")
    print(f"\n[REGEX]  {gold_clean}/{len(gold)} {unit} passed {n_regex}/{n_regex} syntactic checks")
    # A waiver that only shows up in a source file is a waiver nobody revisits.
    # Anything checked this run under a grandfathered exemption says so here,
    # every run, with the reason attached.
    for r in all_results:
        for cid, why in sorted(_grandfathered_for(r["file"]).items()):
            print(f"         {r['file']}: {cid} waived — {why}")
    if component_mode:
        print(f"         {len(PAGE_SCOPED)} page-scoped constraints skipped: "
              f"{', '.join(sorted(PAGE_SCOPED))}")
    else:
        # Tell a user the flag exists at the moment it would have helped, rather
        # than in a usage string nobody reads. Three page-scoped failures on one
        # file is the signature of a component being judged as a screen.
        confused = [r for r in gold
                    if len(set(r.get("failed_ids", [])) & set(PAGE_SCOPED)) >= 3]
        if confused:
            print(f"         {len(confused)} file(s) failed 3+ page-scoped constraints. "
                  "If these are components rather than whole pages, re-run with --component.")
    print(f"TOTAL: {n_regex + len(PARSER_CHECK_IDS)} constraints ({len(PARSER_CHECK_IDS)} parser + {n_regex} regex, incl. DELAY-01 string fallback)")

    # Exit code: 0 if all pass at 90%+, else 1
    all_pass = all(r["rate"] >= 90 for r in all_results if "bad-" not in r["file"])  # anti-examples fail by design
    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
