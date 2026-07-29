#!/usr/bin/env python3
"""
Frontend Design Pro — Automated Constraint Tests
Runs programmatic assertions against generated components.

Usage:
  python test_constraints.py <component_file>     # test one file
  python test_constraints.py --dir <directory>    # test all .jsx/.tsx/.html in dir
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
        description="No banned display font (Inter/Roboto/Arial/Poppins as sole display font)",
        severity="high",
        check=lambda c: (
            # Allowed as fallback in font stacks, banned as only/primary font
            not bool(re.search(
                r"""font[-_]?family\s*[:=]\s*["']?(Inter|Roboto|Arial|Poppins|DM Sans)["']?\s*[,;)]?\s*(?!.*Manrope|.*Geist|.*Satoshi|.*Plus Jakarta)""",
                c, re.IGNORECASE
            )),
            "Banned font used as sole display font (Inter/Roboto/Arial/Poppins/DM Sans without a premium fallback)"
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
            _has(r'animate-pulse|isLoading|skeleton|Skeleton', c),
            "No loading state (animate-pulse / skeleton) found"
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
        description="No placeholder names (John Doe, Jane Doe)",
        severity="high",
        check=lambda c: (
            _lacks(r'John Doe|Jane Doe', c),
            "Placeholder names found — use realistic diverse names"
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
        description="Organic data values (not all-round numbers like 50%, $10,000)",
        severity="medium",
        check=lambda c: (
            # Pass if there are some non-round values OR no numeric data at all
            _has(r'\d+\.\d+%|\$\d+,\d{3}(?!\d)|\b\d{1,2},\d{3}\b', c)
            or _lacks(r'\b(50%|100%|\$10,000|\$100,000)\b', c),
            "Only round-number data values found — use organic values (47.2%, $12,847)"
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
        check=lambda c: (
            _has(r'min-h-\[44|h-11|size-11|min-h-11|min-w-\[44|p-3|py-3', c),
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
            # Scan inside :root{}, @theme{}, --color-* definitions for hex values
            not bool(re.search(
                r'(?:--color-[^:]+|--shadow-[^:]+)\s*:\s*[^;]*#[0-9A-Fa-f]{3,6}\b',
                c
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
            not bool(re.search(
                r'@theme\s*\{[^}]*#[0-9A-Fa-f]{3,6}',
                c, re.DOTALL
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


    # ── Vercel Web Interface Guidelines ──────────────────────────
    Constraint(
        id="COPY-02", category="Copy",
        description="Loading/saving copy uses the ellipsis character (…) not three dots",
        severity="medium",
        check=lambda c: (_lacks(r"(Loading|Saving|Uploading|Processing|Deleting)\.\.\.", c),
                         "Use 'Loading…' (U+2026), not 'Loading...'")),
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


def run_constraints(code: str) -> List[TestResult]:
    results = []
    for c in CONSTRAINTS:
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
    return {"status": status, "rate": rate, "passed": len(passed), "failed": len(failed), "total": total}


# ─────────────────────────────────────────────
# Self-test fixtures
# ─────────────────────────────────────────────

FIXTURE_GOOD = """
import { useState, useEffect } from 'react';
// @import url('https://fonts.googleapis.com/css2?family=Manrope&display=swap')

interface DashboardProps { isLoading?: boolean }
type Metric = { label: string; value: string }

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
    <div style={{ fontFamily: 'Inter', background: '#FFFFFF' }}>
      <button>✕</button>
      <input type="text" />
      <p>Hello John Doe, welcome to our platform. Elevate your experience!</p>
      <p>Growth: 50% Revenue: $10,000</p>
      <img src="/img.png" />
      <div className="animate-spin duration-1000" />
    </div>
  );
}
"""


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


PARSER_CHECK_IDS = ["A11Y-01", "A11Y-02", "A11Y-03", "MOTION-01", "MOTION-02", "TS-01-AST",
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
    args = [a for a in args if a not in ("--json", "--recursive", "--project")]

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
                files_to_check.extend(d.glob(f"*/examples/{ext}"))   # v13: skills/*/examples
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
    # demo/showcase is a real, standalone Next.js app (own package.json/tsconfig/
    # installed deps), not this repo's stub-typed demo convention — it is never
    # in scope for these constraint suites.
    files_to_check = [f for f in files_to_check if not str(f).endswith(".d.ts") and not str(f).endswith(".test.tsx")
                       and "showcase" not in f.parts]
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
            results = run_constraints(code)
            r = report(label, results, json_out=json_output)
            all_results.append({"file": label, **r})
    else:
        for filepath in sorted(files_to_check):
            code = filepath.read_text(encoding="utf-8")
            results = run_constraints(code)
            r = report(str(filepath), results, json_out=json_output)
            all_results.append({"file": str(filepath), **r})

    if json_output:
        print(json.dumps(all_results, indent=2))

    gold = [r for r in all_results if "bad-" not in r["file"]]
    gold_clean = sum(1 for r in gold if r["rate"] == 100)
    n_regex = len(CONSTRAINTS)
    unit = "demo projects" if project_mode else "gold examples"
    print(f"\n[REGEX]  {gold_clean}/{len(gold)} {unit} passed {n_regex}/{n_regex} syntactic checks")
    print(f"TOTAL: {n_regex + len(PARSER_CHECK_IDS)} constraints ({len(PARSER_CHECK_IDS)} parser + {n_regex} regex, incl. DELAY-01 string fallback)")

    # Exit code: 0 if all pass at 90%+, else 1
    all_pass = all(r["rate"] >= 90 for r in all_results if "bad-" not in r["file"])  # anti-examples fail by design
    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
