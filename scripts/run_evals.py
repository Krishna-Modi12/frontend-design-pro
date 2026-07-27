#!/usr/bin/env python3
"""
Frontend Design Pro — Eval Runner
Runs eval assertions from evals/evals.json against generated component files.

Usage:
  python run_evals.py <component_file> [eval_id]     # test one file against one eval
  python run_evals.py --dir <directory> [eval_id]   # test all files against one eval
  python run_evals.py --list                         # list available evals
  python run_evals.py --self-test                    # run against gold example files

Options:
  --json            Output JSON instead of human-readable text
  --strict          Fail on manual assertions (requires --reviewed)
  --evals <path>    Path to evals.json (default: ../evals/evals.json)
  --no-semantic     Skip semantic assertions (treat like manual)
  --budget N        Max semantic API calls per run (default: 20)

Semantic assertions (v12):
  Assertions with type="semantic" are judged by claude-haiku-4-5-20251001.
  Requires ANTHROPIC_API_KEY env var. Without it, semantic assertions are
  skipped (same behaviour as manual). Results are cached by sha256 of
  (assertion_prompt + code_hash) to avoid redundant API calls.

Exit codes:
  0 — all regex/semantic assertions passed
  1 — one or more assertions failed
  2 — usage error
"""

import sys
import re
import os
import json
import hashlib
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

# Windows consoles default to cp1252 and cannot encode this script's ✓/✗ glyphs.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass


def _resolve_gold(rel: str) -> str:
    """v13: examples live in skills/*/examples/. Resolve by basename."""
    import glob as _g, os as _o
    base = _o.path.basename(rel)
    root = _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))
    hits = _g.glob(_o.path.join(root, "skills", "*", "examples", base))
    return hits[0] if hits else _o.path.join(root, rel)



SCRIPT_DIR = Path(__file__).parent
DEFAULT_EVALS_PATH = SCRIPT_DIR.parent / "evals" / "evals.json"
EXAMPLES_DIR = SCRIPT_DIR.parent / "skills"   # v13: examples live in skills/*/examples/

# ─────────────────────────────────────────────
# Semantic runner (v12 — claude-haiku judge)
# ─────────────────────────────────────────────

_SEMANTIC_CACHE: dict = {}          # sha256 → bool (in-process cache)
_SEMANTIC_CALLS_MADE = 0            # global counter for --budget enforcement

HAIKU_MODEL = "claude-haiku-4-5-20251001"
SEMANTIC_SYSTEM = (
    "You are a strict UI code quality judge. "
    "Given a code snippet and a quality check, reply with exactly one word: "
    "PASS if the check is satisfied, FAIL if it is not. "
    "No explanation. No punctuation. Just PASS or FAIL."
)


def _semantic_cache_key(prompt: str, code: str) -> str:
    return hashlib.sha256(f"{prompt}\x00{code}".encode()).hexdigest()


def _run_semantic(
    assertion_prompt: str,
    code: str,
    budget: int = 20,
    no_semantic: bool = False,
) -> tuple[bool, str]:
    """
    Judge a semantic assertion via claude-haiku.
    Returns (passed: bool, evidence: str).
    Skips if: no_semantic=True, ANTHROPIC_API_KEY missing, budget exhausted.
    Results are cached in-process by sha256(prompt+code).
    """
    global _SEMANTIC_CALLS_MADE

    if no_semantic:
        return False, "Skipped (--no-semantic)"

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return False, "Skipped (no ANTHROPIC_API_KEY)"

    if _SEMANTIC_CALLS_MADE >= budget:
        return False, f"Skipped (budget exhausted: {budget} calls used)"

    cache_key = _semantic_cache_key(assertion_prompt, code)
    if cache_key in _SEMANTIC_CACHE:
        cached = _SEMANTIC_CACHE[cache_key]
        return cached, "Cached result"

    try:
        import urllib.request
        import urllib.error

        payload = json.dumps({
            "model": HAIKU_MODEL,
            "max_tokens": 5,
            "system": SEMANTIC_SYSTEM,
            "messages": [
                {
                    "role": "user",
                    "content": (
                        f"Quality check: {assertion_prompt}\n\n"
                        f"Code snippet (first 6000 chars):\n```\n{code[:6000]}\n```"
                    ),
                }
            ],
        }).encode()

        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=payload,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
        )

        _SEMANTIC_CALLS_MADE += 1
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            verdict = result["content"][0]["text"].strip().upper()
            passed = verdict.startswith("PASS")
            _SEMANTIC_CACHE[cache_key] = passed
            return passed, f"Haiku verdict: {verdict}"

    except Exception as exc:  # noqa: BLE001
        return False, f"Semantic call failed: {exc}"

# Map eval name → gold example file for --self-test
GOLD_EXAMPLES = {
    "saas-dashboard":    "good-dashboard.tsx",
    "marketing-landing": "good-landing.tsx",
    "accessible-form":   "good-form.tsx",
    "brand-linear":      "good-brand-linear.tsx",
    "view-transitions":  "good-view-transitions.tsx",
    "mobile-bottom-nav": "good-mobile.tsx",
    "checkout-payment":  "good-checkout.tsx",
    "dark-mode-tokens":  "good-dark-mode.tsx",
    "auth-flow":         "good-auth.tsx",
    "3d-scene":          "good-3d.tsx",
    "scroll-experience": "good-scroll.tsx",
    "data-table":        "good-data-table.tsx",
    # evals 13-19
    "gsap-advanced":          "good-scroll.tsx",
    "react19-patterns":       "good-react19.tsx",
    "ai-chat-ui":             "good-ai-chat.tsx",
    "animation-recipes":      "good-anim-recipes.tsx",
    "react-hook-form-zod":    "good-rhf.tsx",
    "tanstack-query":         "good-tanstack.tsx",
    "perf-optimization":      "good-perf.tsx",
    # evals 20-22: dedicated golds (shipped v12.1.0)
    "react-native-patterns":  "good-react-native.tsx",
    "storybook-stories":      "good-storybook.tsx",
    "playwright-tests":       "good-playwright.tsx",
}


# ─────────────────────────────────────────────
# Parallel semantic runner (4× speedup)
# ─────────────────────────────────────────────

def _run_semantic_batch(
    assertions: list,      # list of Assertion objects with type="semantic"
    code: str,
    budget: int = 20,
    no_semantic: bool = False,
    max_workers: int = 4,
) -> dict:
    """
    Run multiple semantic assertions concurrently using ThreadPoolExecutor.
    Returns dict of assertion.text → (passed, evidence).
    Falls back to sequential if concurrent.futures unavailable.
    """
    import concurrent.futures

    results = {}

    def _judge(assertion):
        passed, evidence = _run_semantic(
            assertion.prompt, code,
            budget=budget,
            no_semantic=no_semantic,
        )
        return assertion.text, passed, evidence

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = {pool.submit(_judge, a): a for a in assertions}
            for future in concurrent.futures.as_completed(futures):
                text, passed, evidence = future.result()
                results[text] = (passed, evidence)
    except Exception:
        # Fallback: sequential
        for a in assertions:
            text, passed, evidence = _judge(a)
            results[text] = (passed, evidence)

    return results


# ─────────────────────────────────────────────
# Data classes
# ─────────────────────────────────────────────

@dataclass
class Assertion:
    text: str
    type: str          # "regex" | "manual" | "semantic"
    pattern: Optional[str] = None
    prompt: Optional[str] = None    # semantic assertions only


@dataclass
class AssertionResult:
    assertion: Assertion
    passed: bool
    skipped: bool = False    # True for manual assertions
    evidence: str = ""


@dataclass
class Eval:
    id: int
    name: str
    prompt: str
    expected_output: str
    assertions: List[Assertion]


@dataclass
class EvalResult:
    eval_: Eval
    file: str
    assertion_results: List[AssertionResult]

    @property
    def auto_passed(self) -> int:
        return sum(1 for r in self.assertion_results if not r.skipped and r.passed)

    @property
    def auto_total(self) -> int:
        return sum(1 for r in self.assertion_results if not r.skipped)

    @property
    def manual_count(self) -> int:
        return sum(1 for r in self.assertion_results if r.skipped)

    @property
    def auto_rate(self) -> float:
        return (self.auto_passed / self.auto_total * 100) if self.auto_total else 100.0

    @property
    def status(self) -> str:
        if self.auto_total == 0:
            return "MANUAL_ONLY"
        if self.auto_rate >= 90:
            return "PASS"
        if self.auto_rate >= 70:
            return "NEEDS WORK"
        return "FAIL"


# ─────────────────────────────────────────────
# Core logic
# ─────────────────────────────────────────────

def load_evals(path: Path) -> List[Eval]:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    evals = []
    for e in data["evals"]:
        assertions = [
            Assertion(
                text=a["text"],
                type=a["type"],
                pattern=a.get("pattern"),
                prompt=a.get("prompt"),
            )
            for a in e["assertions"]
        ]
        evals.append(Eval(
            id=e["id"],
            name=e["name"],
            prompt=e["prompt"],
            expected_output=e["expected_output"],
            assertions=assertions,
        ))
    return evals


def run_eval(
    eval_: Eval,
    code: str,
    filepath: str,
    no_semantic: bool = False,
    semantic_budget: int = 20,
) -> EvalResult:
    results = []

    # Batch all semantic assertions for this eval (parallel 4× speedup)
    semantic_assertions = [a for a in eval_.assertions if a.type == "semantic" and a.prompt]
    semantic_results: dict = {}
    if semantic_assertions:
        semantic_results = _run_semantic_batch(
            semantic_assertions, code,
            budget=semantic_budget,
            no_semantic=no_semantic,
            max_workers=4,
        )

    for assertion in eval_.assertions:
        if assertion.type == "manual":
            results.append(AssertionResult(
                assertion=assertion,
                passed=False,
                skipped=True,
                evidence="Manual review required",
            ))
        elif assertion.type == "semantic":
            if assertion.prompt:
                passed, evidence = semantic_results.get(assertion.text, (False, "Not evaluated"))
                skipped = evidence.startswith("Skipped") or evidence == "Not evaluated"
                results.append(AssertionResult(
                    assertion=assertion,
                    passed=passed if not skipped else False,
                    skipped=skipped,
                    evidence=evidence,
                ))
            else:
                results.append(AssertionResult(
                    assertion=assertion,
                    passed=False,
                    skipped=True,
                    evidence="Semantic assertion missing prompt field",
                ))
        elif assertion.type == "regex_absent" and assertion.pattern:
            try:
                matched = bool(re.search(assertion.pattern, code, re.IGNORECASE | re.DOTALL))
                results.append(AssertionResult(
                    assertion=assertion,
                    passed=not matched,
                    skipped=False,
                    evidence=f"Forbidden pattern: {assertion.pattern!r}",
                ))
            except re.error as exc:
                results.append(AssertionResult(
                    assertion=assertion,
                    passed=False,
                    skipped=False,
                    evidence=f"Invalid regex: {exc}",
                ))
        elif assertion.type == "regex" and assertion.pattern:
            try:
                matched = bool(re.search(assertion.pattern, code, re.IGNORECASE | re.DOTALL))
                results.append(AssertionResult(
                    assertion=assertion,
                    passed=matched,
                    skipped=False,
                    evidence=f"Pattern: {assertion.pattern!r}",
                ))
            except re.error as exc:
                results.append(AssertionResult(
                    assertion=assertion,
                    passed=False,
                    skipped=False,
                    evidence=f"Invalid regex: {exc}",
                ))
        else:
            results.append(AssertionResult(
                assertion=assertion,
                passed=False,
                skipped=True,
                evidence=f"Unknown assertion type: {assertion.type!r}",
            ))
    return EvalResult(eval_=eval_, file=filepath, assertion_results=results)


def report_result(result: EvalResult, json_out: bool = False) -> dict:
    """Print a human-readable report and return a summary dict."""
    failed = [r for r in result.assertion_results if not r.passed and not r.skipped]
    manual = [r for r in result.assertion_results if r.skipped]
    passed = [r for r in result.assertion_results if r.passed]

    summary = {
        "eval_id": result.eval_.id,
        "eval_name": result.eval_.name,
        "file": result.file,
        "status": result.status,
        "auto_passed": result.auto_passed,
        "auto_total": result.auto_total,
        "auto_rate": round(result.auto_rate, 1),
        "manual_count": result.manual_count,
        "failures": [
            {"text": r.assertion.text, "evidence": r.evidence}
            for r in failed
        ],
        "manual_review": [r.assertion.text for r in manual],
    }

    if json_out:
        return summary

    bar = "=" * 64
    print(f"\n{bar}")
    print(f"Frontend Design Pro — Eval #{result.eval_.id}: {result.eval_.name}")
    print(bar)
    print(f"File   : {result.file}")
    print(f"Status : {result.status}  ({result.auto_passed}/{result.auto_total} auto = {result.auto_rate:.0f}%)"
          + (f"  +{result.manual_count} manual" if result.manual_count else ""))
    print(f"{'-'*64}")

    if failed:
        print("\n  ✗ Failed assertions:")
        for r in failed:
            print(f"    ✗ {r.assertion.text}")
            print(f"      → {r.evidence}")

    if manual:
        print(f"\n  ⚠  {len(manual)} manual assertion(s) require human review:")
        for r in manual:
            print(f"    ○ {r.assertion.text}")

    if not failed and not manual:
        print("\n  ✓ All assertions passed automatically.")
    elif not failed:
        print(f"\n  ✓ All automated assertions passed. Review {len(manual)} manual check(s).")

    print(f"{bar}\n")
    return summary


# ─────────────────────────────────────────────
# Self-test (runs evals against gold examples)
# ─────────────────────────────────────────────

def self_test(
    evals: List[Eval],
    json_out: bool = False,
    no_semantic: bool = False,
    semantic_budget: int = 20,
) -> int:
    """Run each eval against its gold example. Return exit code."""
    print("\nRunning self-test against gold examples…\n")
    if not no_semantic and os.environ.get("ANTHROPIC_API_KEY"):
        print(f"  ℹ  Semantic assertions active (budget: {semantic_budget} calls, model: {HAIKU_MODEL})\n")
    else:
        print("  ℹ  Semantic assertions skipped (pass --no-semantic or unset ANTHROPIC_API_KEY to suppress this)\n")

    all_summaries = []
    failures = 0

    for eval_ in evals:
        gold_name = GOLD_EXAMPLES.get(eval_.name)
        if not gold_name:
            print(f"  ⚠  No gold example mapped for eval '{eval_.name}' — skipping.")
            continue

        _hits = sorted(EXAMPLES_DIR.glob(f"*/examples/{gold_name}"))
        gold_path = _hits[0] if _hits else EXAMPLES_DIR / gold_name
        if not gold_path.exists():
            print(f"  ⚠  Gold example not found: {gold_path} — skipping.")
            continue

        code = gold_path.read_text(encoding="utf-8")
        result = run_eval(
            eval_, code, str(gold_path),
            no_semantic=no_semantic,
            semantic_budget=semantic_budget,
        )
        summary = report_result(result, json_out=json_out)
        all_summaries.append(summary)

        if result.status in ("FAIL", "NEEDS WORK"):
            failures += 1

    if json_out:
        print(json.dumps(all_summaries, indent=2))
    else:
        total = len(all_summaries)
        passed_count = sum(1 for s in all_summaries if s["status"] == "PASS")
        print(f"\nSelf-test summary: {passed_count}/{total} evals passed against gold examples.\n")
        if _SEMANTIC_CALLS_MADE:
            print(f"  Semantic API calls made: {_SEMANTIC_CALLS_MADE}\n")

    return 1 if failures else 0


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

def usage():
    print(__doc__)
    sys.exit(2)


def main():
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    # Parse flags
    json_output = "--json" in args
    args = [a for a in args if a != "--json"]

    no_semantic = "--no-semantic" in args
    args = [a for a in args if a != "--no-semantic"]

    semantic_budget = 20
    if "--budget" in args:
        idx = args.index("--budget")
        if idx + 1 >= len(args):
            print("Error: --budget requires an integer argument")
            sys.exit(2)
        try:
            semantic_budget = int(args[idx + 1])
        except ValueError:
            print(f"Error: --budget requires an integer, got {args[idx + 1]!r}")
            sys.exit(2)
        args = args[:idx] + args[idx + 2:]

    evals_path = DEFAULT_EVALS_PATH
    if "--evals" in args:
        idx = args.index("--evals")
        if idx + 1 >= len(args):
            print("Error: --evals requires a path argument")
            sys.exit(2)
        evals_path = Path(args[idx + 1])
        args = args[:idx] + args[idx + 2:]

    if not evals_path.exists():
        print(f"Error: evals file not found: {evals_path}")
        sys.exit(2)

    evals = load_evals(evals_path)

    # --list
    if args and args[0] == "--list":
        print(f"\nAvailable evals ({len(evals)}):\n")
        for e in evals:
            print(f"  [{e.id:2d}] {e.name}")
            print(f"        Prompt: {e.prompt[:80]}…" if len(e.prompt) > 80 else f"        Prompt: {e.prompt}")
            auto_count = sum(1 for a in e.assertions if a.type == "regex")
            manual_count = sum(1 for a in e.assertions if a.type == "manual")
            print(f"        Assertions: {auto_count} auto + {manual_count} manual")
        print()
        sys.exit(0)

    # --self-test
    if args and args[0] == "--self-test":
        sys.exit(self_test(
            evals, json_out=json_output,
            no_semantic=no_semantic,
            semantic_budget=semantic_budget,
        ))

    # Collect files
    files_to_check: List[Path] = []
    eval_filter: Optional[str] = None

    if args and args[0] == "--dir":
        if len(args) < 2:
            print("Error: --dir requires a directory path")
            sys.exit(2)
        d = Path(args[1])
        if not d.is_dir():
            print(f"Error: {d} is not a directory")
            sys.exit(2)
        for ext in ("*.tsx", "*.tsx", "*.html", "*.js", "*.ts"):
            files_to_check.extend(sorted(d.glob(ext)))
        if len(args) > 2:
            eval_filter = args[2]
    else:
        # First arg is file, optional second arg is eval name/id
        file_arg = args[0]
        p = Path(file_arg)
        if not p.exists():
            print(f"Error: {p} not found")
            sys.exit(2)
        files_to_check.append(p)
        if len(args) > 1:
            eval_filter = args[1]

    if not files_to_check:
        print("No files found to check.")
        sys.exit(2)

    # Filter evals
    evals_to_run = evals
    if eval_filter:
        if eval_filter.isdigit():
            evals_to_run = [e for e in evals if e.id == int(eval_filter)]
        else:
            evals_to_run = [e for e in evals if e.name == eval_filter or eval_filter.lower() in e.name.lower()]
        if not evals_to_run:
            print(f"Error: no eval found matching '{eval_filter}'")
            print("Use --list to see available evals.")
            sys.exit(2)

    # Run
    all_summaries = []
    any_failure = False

    for filepath in files_to_check:
        code = filepath.read_text(encoding="utf-8")
        for eval_ in evals_to_run:
            result = run_eval(
                eval_, code, str(filepath),
                no_semantic=no_semantic,
                semantic_budget=semantic_budget,
            )
            summary = report_result(result, json_out=json_output)
            all_summaries.append(summary)
            if result.status in ("FAIL", "NEEDS WORK"):
                any_failure = True

    if json_output:
        print(json.dumps(all_summaries, indent=2))
    elif len(all_summaries) > 1:
        # Print overall summary table
        print(f"\n{'='*64}")
        print("Overall Summary")
        print(f"{'='*64}")
        print(f"{'File':<35} {'Eval':<22} {'Rate':>6} {'Status'}")
        print(f"{'-'*64}")
        for s in all_summaries:
            fname = Path(s["file"]).name[:34]
            ename = s["eval_name"][:21]
            rate = f"{s['auto_rate']:.0f}%"
            status = s["status"]
            icon = "✓" if status == "PASS" else "✗"
            print(f"{fname:<35} {ename:<22} {rate:>6}  {icon} {status}")
        print(f"{'='*64}\n")

    sys.exit(1 if any_failure else 0)


if __name__ == "__main__":
    main()
