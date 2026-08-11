#!/usr/bin/env python3
"""
build_release.py — the ONLY supported way to produce frontend-design-pro-v{VERSION}.skill.

Runs every quality gate in order; if any fails, no archive is built, no version escapes.
A .skill archive produced by this script is, by construction, A+ compliant.

Usage:
  python scripts/build_release.py            # full gated release
  python scripts/build_release.py --dry-run  # run all gates + checks, build nothing
  python scripts/build_release.py --bump-patch  # increment patch in metadata.json + CHANGELOG, then release

Exit 0 only if every gate passed (and, unless --dry-run, an archive was built and smoke-tested).
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import zipfile
from pathlib import Path

# Windows consoles default to cp1252, which cannot encode the ✓/✗/⚠ glyphs below.
# Without this the script dies inside the first warn() call, before any gate runs.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent          # repo root (v13)
REPO = ROOT
SKILL_MD = REPO / "SKILL.md" if (REPO / "SKILL.md").exists() else ROOT / "SKILL.md"
CHANGELOG = (REPO / "docs/CHANGELOG.md") if (REPO / "docs/CHANGELOG.md").exists() else (ROOT / "_meta/CHANGELOG.md")
DIST = REPO / "dist"
SCRIPTS = ROOT / "scripts"
PY = sys.executable

C_OK, C_NO, C_WARN, C_END = "\033[92m", "\033[91m", "\033[93m", "\033[0m"
def ok_(m):   print(f"{C_OK}  ✓ {m}{C_END}")
def bad(m):  print(f"{C_NO}  ✗ {m}{C_END}")
def warn(m): print(f"{C_WARN}  ⚠ {m}{C_END}")
def hdr(m):  print(f"\n{'='*64}\n{m}\n{'='*64}")

# The current version may appear only in these files. Anything else is a leak.
ALLOWED_VERSION_FILES = {"metadata.json", "README.md", "package.json",
                         "docs/CHANGELOG.md", "CHANGELOG.md",
                         "_meta/CHANGELOG.md", "_meta/ROADMAP.md"}
# Exempt by design: Gate 2 *requires* every skill file to declare the current
# version in its frontmatter, and CI/release workflows pin the release notes path.
# Lockfiles are exempt too: they pin arbitrary third-party package versions that
# can coincidentally collide with this pack's own version string, which is not
# a leak of this pack's own version.
ALLOWED_VERSION_GLOBS = ("skills/", ".github/workflows/", "demo/showcase/")
ALLOWED_VERSION_FILENAMES = {"package-lock.json"}

# Single source of truth for the version every skill must declare. Previously
# hardcoded, which silently failed Gate 2 for every skill on each minor bump.
def _version() -> str:
    """
    Read at call time, not at import. `--bump-patch` rewrites metadata.json inside
    the same process, so a module-level constant would hold the pre-bump value and
    fail Gate 2 against the files the bump just rewrote — the bump could never
    pass its own gate chain.
    """
    return json.loads((ROOT / "metadata.json").read_text(encoding="utf-8"))["version"]
# Matches any 1–2 digit major so the leak scan keeps working past v12.
VERSION_RE = re.compile(r"\bv?\d{1,2}\.\d{1,2}\.\d{1,3}\b")
# SGR escape sequences. Node CLIs colour their output even when it is redirected
# to a pipe, and a regex written against the visible text matches nothing without
# this.
ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")


def run(cmd, **kw):
    kw.setdefault("cwd", ROOT)          # callers may override (gate_showcase runs in demo/showcase)
    return subprocess.run(cmd, capture_output=True, text=True,
                          encoding="utf-8", errors="replace", **kw)


def _find_bin(stem: str):
    """Locally installed CLI, preferring the Windows .cmd shim.

    The bare `node_modules/.bin/<name>` file is a POSIX shell script; on Windows
    only the `.cmd` shim is executable, and running the bare one fails with a
    WinError that reads like the tool is missing.
    """
    names = (f"{stem}.cmd", stem) if sys.platform == "win32" else (stem,)
    for base in [ROOT, *ROOT.parents]:
        for n in names:
            c = base / "node_modules/.bin" / n
            if c.exists(): return str(c)
    return None


def _find_tsc():
    return _find_bin("tsc")


def constraint_counts() -> tuple[int, int]:
    """Read the live constraint counts from the suites themselves.

    These were hardcoded ("8/8", "24/24") and drifted three versions behind the
    documented 16/35. Deriving them means the gate output cannot lie again.
    """
    sem = len(set(re.findall(r'checks\["([A-Z0-9-]+)"\]',
                            (SCRIPTS / "parser_constraints.js").read_text(encoding="utf-8"))))
    syn = len(set(re.findall(r'id="([A-Z0-9-]+)"',
                            (SCRIPTS / "test_constraints.py").read_text(encoding="utf-8"))))
    return sem, syn


def tokens(path: Path) -> int:
    return path.stat().st_size // 4


# ── Stage 1 — Pre-flight ─────────────────────────────────────────────────────
def preflight(version: str) -> bool:
    hdr("STAGE 1 — PRE-FLIGHT")
    passed = True

    # 1. clean tree (git if present, else no stray draft files)
    git = run(["git", "status", "--porcelain"])
    if git.returncode == 0:
        dirty = [l for l in git.stdout.splitlines() if l.strip()]
        if dirty:
            warn(f"git tree has {len(dirty)} uncommitted change(s) — allowed, but note them")
        else:
            ok_("git working tree clean")
    else:
        strays = [p for ext in ("*.tmp", "*.bak", "*.draft") for p in ROOT.rglob(ext)]
        if strays:
            bad(f"stray artifacts present: {[str(p.relative_to(ROOT)) for p in strays]}"); passed = False
        else:
            ok_("no .tmp/.bak/.draft artifacts")

    # 2. SKILL.md ≤ 6000 tokens
    skill = SKILL_MD
    if not skill.exists():
        bad("SKILL.md missing"); passed = False
    else:
        t = tokens(skill)
        (ok_ if t <= 6000 else bad)(f"SKILL.md {t} tokens (≤6000)"); passed &= t <= 6000

    # 3. metadata version == latest CHANGELOG header
    meta = json.loads((ROOT / "metadata.json").read_text(encoding="utf-8"))
    m = re.search(r"^##\s*\[([\d.]+)\]", CHANGELOG.read_text(encoding="utf-8"), re.M)
    changelog_v = m.group(1) if m else None
    if meta["version"] == changelog_v == version:
        ok_(f"version {version} consistent across metadata.json + CHANGELOG")
    else:
        bad(f"version mismatch: metadata={meta['version']} changelog={changelog_v} target={version}"); passed = False

    # 4. no stray version strings outside the allowlist
    leaks = []
    for p in ROOT.rglob("*"):
        # .next is Next.js build output for demo/showcase — generated, gitignored,
        # never shipped, and full of version strings the scan has no business reading.
        if not p.is_file() or {"node_modules", ".git", ".next"} & set(p.parts): continue
        rel = p.relative_to(ROOT).as_posix()
        if rel in ALLOWED_VERSION_FILES: continue
        if rel.startswith(ALLOWED_VERSION_GLOBS): continue
        if p.name in ALLOWED_VERSION_FILENAMES: continue
        if "RELEASE_NOTES-" in rel: continue  # generated, version by design
        if rel.endswith(".skill"): continue
        if p.suffix not in (".md", ".json", ".py", ".js", ".ts", ".tsx"): continue
        try: text = p.read_text(encoding="utf-8")
        except Exception: continue
        cur = version.lstrip("v")
        for ln, line in enumerate(text.splitlines(), 1):
            # Invariant: the CURRENT version must live only in the allowlist.
            # Historical version mentions in comments/docs are legitimate and ignored.
            for hit in VERSION_RE.findall(line):
                if hit.lstrip("v") == cur:
                    leaks.append(f"{rel}:{ln}: {hit}  ({line.strip()[:60]})")
    if leaks:
        bad(f"{len(leaks)} version string(s) leaked outside allowlist:")
        for l in leaks[:12]: print(f"      {l}")
        passed = False
    else:
        ok_("no version strings outside the allowlist")

    return passed



# ── v13 gates: frontmatter · budget · registry resolution ────────────────────
def _frontmatter(path):
    txt = path.read_text(encoding="utf-8")
    if not txt.startswith("---"): return None
    body = txt.split("---", 2)[1]
    fm, key = {}, None
    for line in body.splitlines():
        if line.strip().startswith("- ") and key: fm.setdefault(key, []).append(line.strip()[2:].strip())
        elif ":" in line:
            key, _, v = line.partition(":"); key = key.strip(); v = v.strip()
            fm[key] = v if v else []
    return fm

def gate_frontmatter():
    hdr("GATE 2 — SKILL FRONTMATTER")
    ok = True
    for sk in sorted(ROOT.glob("skills/*/SKILL.md")):
        fm = _frontmatter(sk)
        if not fm: bad(f"{sk.parent.name}: no YAML frontmatter"); ok = False; continue
        for k in ("name", "description", "version", "core-deps"):
            if k not in fm: bad(f"{sk.parent.name}: missing '{k}'"); ok = False
        target = _version()
        if fm.get("version", "").strip('"') != target:
            bad(f"{sk.parent.name}: version {fm.get('version')} != {target}"); ok = False
        for dep in fm.get("core-deps", []):
            if not (ROOT / dep).exists(): bad(f"{sk.parent.name}: core-dep missing {dep}"); ok = False
    if ok: ok_(f"all {len(list(ROOT.glob('skills/*/SKILL.md')))} skill files declare valid frontmatter")
    return ok

def gate_budget():
    hdr("GATE 8a — PER-SKILL TOKEN BUDGET (≤8,000)")
    reg = tokens(SKILL_MD); ok = True
    base_deps = ["core/accessibility-baseline.md", "core/validate-checklist.md"]
    for sk in sorted(ROOT.glob("skills/*/SKILL.md")):
        fm = _frontmatter(sk) or {}
        deps = set(fm.get("core-deps", [])) | set(base_deps)
        dt = sum(tokens(ROOT / d) for d in deps if (ROOT / d).exists())
        st = tokens(sk); total = reg + st + dt
        if st > 3000: bad(f"{sk.parent.name}: skill file {st} > 3000"); ok = False
        if total > 8000: bad(f"{sk.parent.name}: budget {total} > 8000"); ok = False
        else: print(f"      {sk.parent.name:20} skill {st:>5} + deps {dt:>5} + reg {reg:>5} = {total:>5}")
    if ok: ok_("every skill fits the 8,000-token request budget")
    return ok

def gate_registry():
    hdr("GATE 8b — REGISTRY RESOLUTION")
    import re as _re
    s = SKILL_MD.read_text(encoding="utf-8"); ok = True
    rows = _re.findall(r"\| `([\w-]+)` \| `(skills/[\w-]+/SKILL\.md)` \|[^|]*\| `(core/[\w./-]+\.md)` \|", s)
    if not rows: bad("no registry rows parsed from SKILL.md"); return False
    for sid, path, dep in rows:
        if not (ROOT / path).exists(): bad(f"{sid}: registry path missing {path}"); ok = False
        if not (ROOT / dep).exists(): bad(f"{sid}: core dep missing {dep}"); ok = False
        exs = list((ROOT / "skills" / sid / "examples").glob("*.tsx"))
        if not exs: bad(f"{sid}: no examples"); ok = False
    dirs = {p.name for p in (ROOT / "skills").iterdir() if p.is_dir()}
    for orphan in dirs - {r[0] for r in rows}: warn(f"skill directory not in registry: {orphan}")
    if ok: ok_(f"all {len(rows)} registry rows resolve; every skill has examples")
    return ok

# ── Stage 2 — Gate chain ─────────────────────────────────────────────────────
def gate_chain() -> tuple[bool, list]:
    hdr("STAGE 2 — GATE CHAIN")
    tsx = sorted(ROOT.glob("skills/*/examples/*.tsx"))
    golds = [f for f in tsx if not f.name.startswith("bad-") and not f.name.endswith(".test.tsx")]
    results = []

    def record(name, passed, detail):
        results.append((name, passed, detail))
        (ok_ if passed else bad)(f"{name}: {detail}")
        return passed

    all_ok = True
    n_sem, n_syn = constraint_counts()

    # The demo/ projects are held to the SAME suites as the gold examples, inside
    # the same gates. README claims they pass the 56 constraints; a claim checked
    # only by a script somebody remembers to run is the exact rot that left the
    # pre-v13 system prompt broken for three majors.
    # demo/showcase/ is excluded from the STUB COMPILE only. It is a standalone
    # Next.js app with its own package.json, tsconfig and installed dependencies;
    # type-checking it against demo/_stubs.d.ts — a file whose entire purpose is
    # to declare absent libraries as `any` — would report errors about packages
    # that are genuinely present. Its compile is verified by `next build` in
    # gate_showcase() instead, against the real vendor typings. It is NOT exempt
    # from the content rules: the regex suite below judges it like any other demo.
    demo_tsx = sorted(
        p for p in ROOT.glob("demo/*/**/*.tsx")
        if not p.name.endswith(".test.tsx") and "showcase" not in p.relative_to(ROOT / "demo").parts[:1]
    )
    demo_cfg = ROOT / "demo/tsconfig.json"

    r = run([PY, str(SCRIPTS / "typecheck_golds.py")])
    compile_detail = (r.stdout + r.stderr).strip().splitlines()[-1] if (r.stdout+r.stderr).strip() else "tsc"
    compile_ok = r.returncode == 0
    if r.returncode: print(r.stdout, r.stderr)
    if demo_cfg.exists() and demo_tsx:
        tsc = _find_tsc()
        if tsc:
            dr = run([tsc, "-p", str(demo_cfg)])
            if dr.returncode:
                compile_ok = False
                compile_detail += f" · demos FAILED"
                print(dr.stdout[-1500:])
            else:
                compile_detail += f" · {len(demo_tsx)} demo files clean"
        else:
            compile_detail += " · demos skipped (tsc absent)"
    all_ok &= record("Compile", compile_ok, compile_detail)

    # Semantic: parser on every gold and every demo file, all checks must pass on each
    sem_pass = 0; sem_fail = []
    for f in golds + demo_tsx:
        pr = run(["node", str(SCRIPTS / "parser_constraints.js"), str(f)])
        if pr.returncode == 0: sem_pass += 1
        else: sem_fail.append(f.name)
    sem_total = len(golds) + len(demo_tsx)
    all_ok &= record("Semantic", not sem_fail,
        f"{sem_pass}/{sem_total} files ({len(golds)} golds + {len(demo_tsx)} demo) pass {n_sem}/{n_sem} parser checks"
        + (f" (fail: {sem_fail})" if sem_fail else ""))

    r = run([PY, str(SCRIPTS / "test_constraints.py"), "--dir", "skills"])
    syn_ok = r.returncode == 0
    if r.returncode: print(r.stdout[-1500:], r.stderr[-500:])
    syn_detail = f"gold examples clean, anti-examples fail as designed ({f'{n_syn}/{n_syn}' if syn_ok else 'FAIL'})"
    if demo_tsx:
        dr = run([PY, str(SCRIPTS / "test_constraints.py"), "--dir", "demo", "--recursive", "--project"])
        if dr.returncode:
            syn_ok = False; syn_detail += " · demos FAILED"
            print(dr.stdout[-1500:])
        else:
            syn_detail += " · demos clean"
    all_ok &= record("Syntactic", syn_ok, syn_detail)

    # References — the gate that reads the other 98% of the pack.
    # Everything above this line judges skills/*/examples/*.tsx and demo/: 55 files.
    # The 94 reference files are ~333k tokens and are what an agent actually loads
    # for depth, and until this gate they were scanned by nothing, because
    # test_constraints.py globs code extensions and a reference is markdown. The
    # cost of that gap was measurable: a "Must have" background prescribing
    # min-h-screen with a violet→purple→pink gradient, both banned by name in the
    # wall the same agent had in context.
    r = run([PY, str(SCRIPTS / "check_references.py")])
    ref_ok = r.returncode == 0
    rf = re.search(r"\[REFS\] (\d+) violation\(s\) · (\d+) ban-shaped", r.stdout)
    ref_detail = (
        f"{rf.group(2)} ban-shaped constraints over fenced code in every reference, "
        f"skill and core file ({rf.group(1)} violations)"
        if rf else "reference checker produced no summary line"
    )
    if r.returncode: print(r.stdout[-2000:])
    all_ok &= record("References", ref_ok, ref_detail)

    # Figures — the gate for the defect this repo has shipped more often than any
    # other. Every gate above reads code; the thing that keeps going wrong is
    # arithmetic in markdown, and the only defence was remembering to sweep ~30
    # files by hand. On its first run it found the per-request band stale in 17
    # live files — two of them shipped inside the archive, so the file that tells
    # an agent its own token budget carried the wrong number — a 19-row per-skill
    # table in which every row was wrong, and a sentence claiming two skills cost
    # "103 tokens" between endpoints that subtract to 123.
    r = run([PY, str(SCRIPTS / "check_figures.py")])
    fig_ok = r.returncode == 0
    ff = re.search(r"\[FIGURES\] (\d+) drift\(s\) · (\d+) files", r.stdout)
    fig_detail = (
        f"{ff.group(2)} claim surfaces, figures derived from the filesystem "
        f"({ff.group(1)} drifts)"
        if ff else "figure checker produced no summary line"
    )
    if r.returncode: print(r.stdout[-3000:])
    all_ok &= record("Figures", fig_ok, fig_detail)

    r = run([PY, str(SCRIPTS / "test_v12_pipeline.py"), str(REPO / "AGENT_SYSTEM_PROMPT.md")])
    # The label was hardcoded "9/9 stage markers" while the checker actually
    # scored 7/9 — two extra checks had been failing silently for three majors.
    pl = re.search(r"RESULT: (\d+/\d+) checks passed", r.stdout)
    pl_detail = f"{pl.group(1)} checks (stages · architecture · cited paths)" if pl else "checker produced no RESULT line"
    all_ok &= record("Pipeline", r.returncode == 0, pl_detail)
    if r.returncode: print(r.stdout[-1200:])

    r = run([PY, str(SCRIPTS / "run_evals.py"), "--self-test", "--no-semantic"])
    ev = re.search(r"(\d+/\d+) evals passed", r.stdout)
    all_ok &= record("Evals", r.returncode == 0, (ev.group(1) if ev else "?") + " self-test")

    # Gate 7 — Test coverage. Contract: every gold has a 1:1 `.test.tsx`, every test
    # file compiles under strict TypeScript, AND the suite passes when it is run.
    #
    # Runtime execution used to be out of scope, and said so. Gold examples import
    # ~25 peer libraries (three, motion/react, react-hook-form, react-native…) that
    # exist only as ambient declarations in `_stubs.d.ts`, so `vitest run` could not
    # resolve them and 29 of 39 files failed at import. `test/stubs/` now supplies a
    # real module per specifier and `vitest.config.ts` aliases them, so the suite
    # executes — and a gate that can assert behaviour should not settle for
    # asserting that the file parses.
    #
    # It still degrades rather than lies. A fresh clone with no `npm install` has
    # neither tsc nor vitest, and the detail string names exactly which layers ran.
    import glob as _glob, json as _json
    golds_n = [f[:-4] for f in _glob.glob(str(ROOT / "skills/*/examples/good-*.tsx")) if not f.endswith(".test.tsx")]
    tests = {f[:-9] for f in _glob.glob(str(ROOT / "skills/*/examples/good-*.test.tsx"))}
    missing = sorted(set(golds_n) - tests)
    if missing:
        all_ok &= record("Test coverage", False, f"missing tests: {missing}")
    else:
        coverage_ok = True
        layers = [f"{len(tests)}/{len(golds_n)} golds have a 1:1 test"]

        cfg = {"compilerOptions": {"strict": True, "noImplicitAny": True, "jsx": "react-jsx",
               "moduleResolution": "bundler", "target": "ES2022", "module": "ESNext",
               "esModuleInterop": True, "skipLibCheck": True, "noEmit": True, "types": ["react", "react-dom"]},
               "include": ["skills/*/examples/*.test.tsx", "skills/*/examples/*.d.ts"]}
        cfgp = ROOT / "tsconfig.tests.json"; cfgp.write_text(_json.dumps(cfg))
        tsc = _find_tsc()
        if tsc:
            tr = run([tsc, "-p", str(cfgp)])
            if tr.returncode:
                coverage_ok = False; layers.append("strict compile FAILED"); print(tr.stdout[-1500:])
            else:
                layers.append("all compile strict")
        else:
            warn("tsc not found — strict compile of test files skipped; run `npm install`")
            layers.append("compile skipped (tsc absent)")
        cfgp.unlink(missing_ok=True)

        vitest = _find_bin("vitest")
        if vitest:
            # `basic` was deprecated in vitest 3 and REMOVED in 4, where an
            # unknown name is treated as a path to a custom reporter module —
            # so the flag failed with ERR_LOAD_URL from loadCustomReporterModule
            # and the gate reported "vitest FAILED" for a suite that was green.
            # `default` prints the same two summary lines the regexes below
            # match, and exists in every version this project has used.
            vr = run([vitest, "run", "--reporter=default"], timeout=900)
            # The summary carries SGR colour codes even when redirected, and the
            # reporter splits itself across both streams — so join them and strip
            # before matching. Reading the raw stdout matched nothing and reported
            # a green suite as a failure.
            blob = ANSI_RE.sub("", vr.stdout + vr.stderr)
            counts = re.search(r"Tests\s+(\d+) passed \((\d+)\)", blob)
            files = re.search(r"Test Files\s+(\d+) passed \((\d+)\)", blob)
            if vr.returncode == 0 and counts and files:
                layers.append(f"{files.group(1)}/{files.group(2)} files · {counts.group(1)}/{counts.group(2)} tests pass")
            elif vr.returncode == 0:
                # Exit 0 without a parseable summary means the reporter changed
                # shape, not that the suite is broken — say which it is.
                coverage_ok = False
                layers.append("vitest exited 0 but printed no summary to parse")
                print(blob[-2000:])
            else:
                coverage_ok = False
                layers.append("vitest FAILED")
                print(blob[-3000:])
        else:
            warn("vitest not found — suite not executed; run `npm install`")
            layers.append("suite not run (vitest absent)")

        all_ok &= record("Test coverage", coverage_ok, "; ".join(layers))

    r = run(["node", str(SCRIPTS / "parser_regression_test.js")])
    rg = re.search(r"(\d+/\d+) regression", r.stdout)
    all_ok &= record("Regression", r.returncode == 0, (rg.group(1) if rg else "?") + " synthetic cases")

    return all_ok, results


# ── Stage 3 — Path integrity ─────────────────────────────────────────────────
def path_integrity() -> bool:
    hdr("STAGE 3 — PATH INTEGRITY")
    ok = True
    # registry rows resolve
    reg = SKILL_MD.read_text(encoding="utf-8")
    rows = re.findall(r"\| `([\w-]+)` \| `(skills/[\w-]+/SKILL\.md)` \|[^|]*\| `(core/[\w./-]+\.md)` \|", reg)
    for sid, path, dep in rows:
        if not (ROOT / path).exists(): bad(f"registry path missing: {path}"); ok = False
        if not (ROOT / dep).exists(): bad(f"core dep missing: {dep}"); ok = False
    if ok: ok_(f"all {len(rows)} registry rows resolve")
    # every reference cited inside a skill file exists
    cited = missing = 0
    for sk in sorted(ROOT.glob("skills/*/SKILL.md")):
        txt = sk.read_text(encoding="utf-8")
        for rel in re.findall(r"`((?:\.\./[\w-]+/)?references/[\w./-]+\.md)`", txt):
            cited += 1
            target = (sk.parent / rel).resolve()
            if not target.exists(): bad(f"{sk.parent.name}: cited reference missing {rel}"); missing += 1; ok = False
    if not missing: ok_(f"all {cited} skill-cited references resolve")
    # orphan references (present on disk, never cited)
    for sk in sorted(ROOT.glob("skills/*/references")):
        txt = (sk.parent / "SKILL.md").read_text(encoding="utf-8")
        for ref in sk.glob("*.md"):
            if ref.name not in txt: warn(f"{sk.parent.name}: {ref.name} not cited in its Reference Index")
    # every relative markdown link in the repo resolves
    if not markdown_links(): ok = False
    return ok


# Directories that are not ours to police: vendored code, build output, caches.
_LINK_SKIP_DIRS = {"node_modules", ".git", "dist", "__pycache__", ".next", ".venv"}

# The historical record quotes broken things on purpose. `docs/CHANGELOG.md`
# describes the day `[Releases](../../releases)` 404'd and the day a
# `![](screenshot.png)` pointed at nothing — naming the defect is the entry's
# whole content. Demanding those resolve would demand the record be falsified,
# which is the same reason Gate 11 exempts these two surfaces.
_LINK_EXEMPT = ("docs/CHANGELOG.md", "docs/RELEASE_NOTES-")

_FENCE = re.compile(r"```.*?```|~~~.*?~~~", re.S)
_INLINE_CODE = re.compile(r"`[^`\n]*`")
_MD_LINK = re.compile(r"\[[^\]]*\]\(\s*([^)\s]+?)\s*(?:\"[^\"]*\")?\)")


def markdown_links() -> bool:
    """
    Does every relative link in the repo's markdown point at something real?

    Nothing checked this until now. The gates read code; `check_figures.py`
    reads the numbers in prose; no gate read the *pointers* in prose. That is
    the same blind spot that let the archive ship 137 dead `docs/*.md`
    references for eleven releases — a link is only ever exercised by a reader,
    and a reader is exactly who no gate simulates.

    Two parsing rules, each load-bearing:
      · fenced blocks are stripped, because a link inside ``` is sample text
      · inline code spans are stripped, because prose quoting a bad link —
        "`docs/INSTALL.md` linked `[Releases](../../releases)`" — is describing
        one, not making one. Both existing hits in this repo were that shape.

    This lives in Stage 3 rather than becoming Gate 12 on purpose. A twelfth
    gate would move a figure published in ~30 documents, and re-deriving that
    everywhere to add a check is a poor trade when the check is squarely path
    integrity, which is what Stage 3 already is.
    """
    files = [p for p in ROOT.rglob("*.md")
             if not (_LINK_SKIP_DIRS & set(p.parts))]
    broken: list[str] = []
    checked = 0
    for p in files:
        rel = p.relative_to(ROOT).as_posix()
        if any(rel.startswith(x) for x in _LINK_EXEMPT):
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        stripped = _INLINE_CODE.sub(" ", _FENCE.sub(" ", text))
        for m in _MD_LINK.finditer(stripped):
            target = m.group(1)
            if target.startswith(("http://", "https://", "mailto:", "#", "<")):
                continue
            checked += 1
            path = target.split("#", 1)[0]
            if not path:
                continue
            if not (p.parent / path).resolve().exists():
                broken.append(f"{rel}:{stripped[:m.start()].count(chr(10)) + 1} → {target}")
    if broken:
        for b in broken[:25]:
            bad(f"dead link: {b}")
        if len(broken) > 25:
            bad(f"… and {len(broken) - 25} more")
        return False
    ok_(f"all {checked} relative markdown links resolve across {len(files)} files")
    return True


# ── Stage 4 — Token budget ───────────────────────────────────────────────────
def token_budget() -> bool:
    hdr("STAGE 4 — REFERENCE DEPTH (informational)")
    total = 0
    for sk in sorted(ROOT.glob("skills/*/references")):
        t = sum(tokens(p) for p in sk.rglob("*.md")); total += t
        print(f"      {sk.parent.name:20} {len(list(sk.rglob('*.md'))):>2} refs  ~{t:>6} tokens (lazy)")
    ok_(f"{total:,} tokens of reference depth available, none loaded by default")
    return True


# ── Stage 5 — Archive build ──────────────────────────────────────────────────
def gate_showcase() -> bool:
    """
    demo/showcase/ is the one demo that claims to RUN, not merely to type-check.
    The README says so, so something has to check it — otherwise the claim rots
    exactly like the pre-v13 system prompt did.

    It cannot be verified by the stub tsconfig the other demos share: it has real
    installed dependencies, so `next build` against the real vendor typings is the
    only meaningful check. That needs its node_modules, which a fresh clone does
    not have. Rather than pretend, this gate reports honestly:
      · deps present  → build must pass, or the release is blocked
      · deps absent   → skipped with a warning; the ci.yml `showcase` job installs
                        them and runs the same build on every push
    """
    hdr("GATE 9 — SHOWCASE BUILD (demo/showcase)")
    app = ROOT / "demo/showcase"
    if not (app / "package.json").exists():
        warn("demo/showcase absent — nothing to build")
        return True
    # A `node_modules/` that exists is not the same as one that can build. A
    # partial or interrupted install leaves the directory behind without the
    # `next` binary, and the old check accepted that, so the gate reported
    # "`next` is not recognized" as a hard failure — indistinguishable from a
    # genuinely broken showcase, on a machine that had simply never finished
    # `npm install`. Probe for the binary the build actually invokes.
    next_bin = app / "node_modules" / ".bin" / ("next.cmd" if sys.platform == "win32" else "next")
    if not next_bin.exists():
        warn("demo/showcase dependencies not installed — build skipped here; ci.yml 'showcase' job covers it")
        return True
    npx = shutil.which("npx.cmd") if sys.platform == "win32" else shutil.which("npx")
    if not npx:
        warn("npx not found — showcase build skipped")
        return True
    r = run([npx, "next", "build"], cwd=app)
    if r.returncode:
        bad("demo/showcase failed `next build`")
        print((r.stdout + r.stderr)[-2500:])
        return False
    ok_("demo/showcase builds clean under `next build` (real deps, real vendor typings)")
    return True


# `install/` and the two setup scripts ship because the archive IS the transport
# layer for every host that is not Claude Code. An adapter that exists only in
# the git repo is unreachable to someone who downloaded a .skill from Releases —
# exactly the audience the adapters were written for.
ARCHIVE_FROM_SRC = ["metadata.json", "core", "skills", "scripts", "evals", "_meta", "rules", "demo", "install"]
ARCHIVE_FROM_REPO = ["SKILL.md", "AGENT_SYSTEM_PROMPT.md", "README.md", "LICENSE", "setup.sh", "setup.ps1"]

# The consumer-facing half of docs/. These ship because the archive told people
# to read them and then did not contain them: 22 shipped files carried 137
# references to docs/*.md, including all 14 install/*/README.md — the per-agent
# setup instructions — and the last line setup.sh prints. Anyone taking the
# gated-archive route the README recommends followed a pointer into nothing.
#
# The split is by audience, not by size. A consumer needs the compatibility
# matrix and their host's setup guide; they do not need MAINTENANCE.md's freeze
# policy, REVIEW_PROTOCOL.md's session checklist or the launch copy, and
# shipping those would be shipping the project's internal process to its users.
# Cost of the set below is ~89 KB against a ~1.9 MB archive.
ARCHIVE_DOCS = [
    "AGENT_COMPATIBILITY.md", "INSTALL.md", "USAGE.md", "ARCHITECTURE.md",
    "FAQ.md", "TESTING.md", "DEMO_PROMPTS.md",
    "CLAUDE_SETUP.md", "CURSOR_SETUP.md", "CHATGPT_SETUP.md",
    "COPILOT_SETUP.md", "GEMINI_SETUP.md", "OPENAI_API_SETUP.md",
]

# Links the archive cannot satisfy locally, rewritten to the tag they shipped
# under so they resolve and match the archive's own contents. Pinning to the tag
# rather than main matters: an archive is a snapshot, and pointing a v14.x reader
# at whatever main says today is how a document starts lying.
_REPO_URL = "https://github.com/Krishna-Modi12/frontend-design-pro/blob"
# _meta/CHANGELOG.md is exempt. It is the historical record, its links were
# correct in the repo where each entry was written, and rewriting it to suit the
# archive falsifies it — the same rule the figure gate follows.
_LINK_REWRITE_EXEMPT = {"_meta/CHANGELOG.md"}
EXCLUDE_TOP = {"src"}
EXCLUDE_PATTERNS = re.compile(r"(^|/)(\.git|node_modules|__pycache__|test_outputs|\.next|out)(/|$)|\.(tmp|bak|draft|pyc)$")

def build_archive(version: str) -> Path:
    hdr("STAGE 5 — ARCHIVE BUILD")
    staging = Path(tempfile.mkdtemp()) / "frontend-design-pro"
    staging.mkdir(parents=True)
    count = 0
    for item in ARCHIVE_FROM_REPO:                      # repo-root docs → archive root
        p_ = REPO / item
        if p_.exists():
            shutil.copy2(p_, staging / p_.name); count += 1
    if CHANGELOG.exists():                              # docs/CHANGELOG.md → _meta/ in archive
        (staging / "_meta").mkdir(parents=True, exist_ok=True)
        shutil.copy2(CHANGELOG, staging / "_meta/CHANGELOG.md")
    for name in ARCHIVE_DOCS:                           # consumer-facing docs/ → archive docs/
        src = REPO / "docs" / name
        if src.exists():
            (staging / "docs").mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, staging / "docs" / name); count += 1
    for item in ARCHIVE_FROM_SRC:                       # src/* flattened → archive root
        src = ROOT / item
        if not src.exists(): continue
        if src.is_file():
            shutil.copy2(src, staging / src.name); count += 1
        else:
            for p in src.rglob("*"):
                rel = p.relative_to(ROOT).as_posix()
                if EXCLUDE_PATTERNS.search(rel): continue
                if p.is_file():
                    dest = staging / p.relative_to(ROOT)
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(p, dest); count += 1
    # Any docs/ pointer the archive still cannot satisfy becomes an absolute,
    # tag-pinned URL. Everything in ARCHIVE_DOCS resolves locally and is left
    # alone, so this only touches the internal docs a consumer has no local copy
    # of — currently just README.md's citations of the freeze policy and the
    # review protocol.
    shipped_docs = {f"docs/{n}" for n in ARCHIVE_DOCS}
    # The changelog ships — just at a different path. Repointing beats linking
    # out to GitHub for a file the reader already has in their hand.
    RELOCATED = {"docs/CHANGELOG.md": "_meta/CHANGELOG.md"}
    rewritten = repointed = 0
    for p in list(staging.rglob("*.md")) + [staging / "setup.sh", staging / "setup.ps1"]:
        if not p.exists():
            continue
        rel = p.relative_to(staging).as_posix()
        if rel in _LINK_REWRITE_EXEMPT:
            continue
        text = original = p.read_text(encoding="utf-8")
        for old, new_path in RELOCATED.items():
            if old in text:
                repointed += text.count(old)
                text = text.replace(old, new_path)

        def _link(m):
            nonlocal rewritten
            target = m.group(1)
            if target in shipped_docs:
                return m.group(0)
            rewritten += 1
            return f"]({_REPO_URL}/v{version}/{target})"

        def _code(m):
            """A backticked path is still an instruction to go open something.
            Inline code cannot carry a URL, so it becomes a real link."""
            nonlocal rewritten
            target = m.group(1)
            if target in shipped_docs:
                return m.group(0)
            rewritten += 1
            return f"[`{target}`]({_REPO_URL}/v{version}/{target})"

        text = re.sub(r"\]\((docs/[A-Za-z_-]+\.md)\)", _link, text)
        text = re.sub(r"(?<!\[)`(docs/[A-Za-z_-]+\.md)`(?!\])", _code, text)
        if text != original:
            p.write_text(text, encoding="utf-8", newline="\n")
    if rewritten or repointed:
        print(f"      {rewritten} unshippable docs/ link(s) pinned to v{version}; "
              f"{repointed} repointed to their archive location")

    DIST.mkdir(exist_ok=True)
    archive = DIST / f"frontend-design-pro-v{version}.skill"
    if archive.exists(): archive.unlink()
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(staging.rglob("*")):
            if p.is_file():
                z.write(p, Path("frontend-design-pro") / p.relative_to(staging))
    # verify root folder name
    with zipfile.ZipFile(archive) as z:
        roots = {n.split("/")[0] for n in z.namelist()}
    if roots != {"frontend-design-pro"}:
        bad(f"archive root is {roots}, expected 'frontend-design-pro'"); archive.unlink(); sys.exit(1)
    ok_(f"archive built: {archive.name} ({count} files, {archive.stat().st_size//1024} KB, root='frontend-design-pro/')")
    shutil.rmtree(staging.parent)
    return archive


# ── Stage 4.5 — Release source guard ─────────────────────────────────────────
def release_source_guard() -> bool:
    """The archive must be reproducible from a commit the public can fetch.

    v14.4.2 shipped every demo defect the preceding pull request had already
    fixed. The tag was cut from d48546c, which was never main's head, so the
    archive was a *faithful* product of stale source — internally consistent,
    two commits behind, and green through every gate including Stage 6. Stage 6
    cannot catch this by construction: it verifies the archive against itself,
    and the archive was not the thing that was wrong.

    The fetch is the point. A stale `origin/main` ref passes this check
    trivially while proving nothing — during the audit that produced this
    function, the local ref read dc55237 while the real head was 57e9e5f, which
    is exactly the state in which the bad release was cut.

    It resolves main through `git fetch origin main` + FETCH_HEAD rather than the
    `origin/main` remote-tracking ref, because the ref is not always there. The
    release workflow is the most important place this runs — it is the last
    checkpoint before a public publish — and `actions/checkout` lands a shallow,
    detached checkout of the tag with a refspec narrowed to that one ref, so
    `git rev-parse origin/main` returns nothing. Reading the ref would have
    failed every tagged release closed.

    Only a real release build runs this. `--dry-run` is the CI contract and runs
    on every branch and pull request, where being behind main is normal and
    correct.
    """
    hdr("STAGE 4.5 — RELEASE SOURCE GUARD")

    if os.environ.get("FDP_ALLOW_UNPUBLISHED_BUILD") == "1":
        warn("FDP_ALLOW_UNPUBLISHED_BUILD=1 — source guard skipped; do not tag this archive")
        return True

    if run(["git", "rev-parse", "--git-dir"]).returncode != 0:
        warn("not a git repository — cannot verify the archive's source commit")
        return True

    if run(["git", "fetch", "origin", "main", "--quiet"]).returncode != 0:
        bad("could not fetch origin/main — freshness cannot be proven, so it is not assumed.\n"
            "      Reconnect, or set FDP_ALLOW_UNPUBLISHED_BUILD=1 for a local-only archive.")
        return False

    head = run(["git", "rev-parse", "HEAD"]).stdout.strip()
    upstream = run(["git", "rev-parse", "FETCH_HEAD"]).stdout.strip()
    if not head or not upstream:
        bad("could not resolve HEAD or the fetched main"); return False

    if head != upstream:
        # A shallow clone has no merge base, so rev-list can fail here. The
        # counts are diagnostics; their absence must not mask the real failure.
        behind = run(["git", "rev-list", "--count", f"{head}..{upstream}"]).stdout.strip() or "?"
        ahead = run(["git", "rev-list", "--count", f"{upstream}..{head}"]).stdout.strip() or "?"
        bad(f"HEAD is not the head of main — {ahead} ahead, {behind} behind\n"
            f"      HEAD          {head[:7]}\n"
            f"      origin/main   {upstream[:7]}\n"
            "      An archive built here would publish source no one can fetch. This is the\n"
            "      defect that shipped v14.4.2, where the tag named a commit two behind main.\n"
            "      Merge first, then build from main; on a tag, re-tag main's actual head.")
        return False

    dirty = [l for l in run(["git", "status", "--porcelain"]).stdout.splitlines() if l.strip()]
    if dirty:
        bad(f"working tree has {len(dirty)} uncommitted change(s); the archive would not "
            f"correspond to any commit:")
        for l in dirty[:8]: print(f"      {l}")
        return False

    ok_(f"building from main @ {head[:7]}, clean tree")
    return True


# ── Stage 6 — Post-build smoke ───────────────────────────────────────────────
def post_build_smoke(archive: Path, version: str) -> bool:
    hdr("STAGE 6 — POST-BUILD SMOKE (against unzipped copy)")
    tmp = Path(tempfile.mkdtemp())
    with zipfile.ZipFile(archive) as z: z.extractall(tmp)
    base = tmp / "frontend-design-pro"
    # Link node_modules beside the extracted copy so tsc/node resolve inside it.
    # This looked only in ROOT.parent, which is empty on any normal clone (deps
    # install into the repo) — so nothing was linked, every compile and parser
    # check failed, and the archive was deleted as "corrupt". Check ROOT first.
    nm = next((c for c in (ROOT / "node_modules", ROOT.parent / "node_modules")
               if c.exists()), None)
    if nm is None:
        warn("node_modules not found — smoke test cannot resolve deps; run `npm install`")
    else:
        link = base.parent / "node_modules"
        try:
            os.symlink(nm, link, target_is_directory=True)
        except OSError:
            # Windows symlinks need elevation or Developer Mode; directory
            # junctions do not. Fall back to one before giving up.
            if sys.platform == "win32":
                subprocess.run(["cmd", "/c", "mklink", "/J", str(link), str(nm)],
                               capture_output=True, text=True)
            if not link.exists():
                warn(f"could not link node_modules into {link.parent}")
    r1 = run([PY, str(base / "scripts/typecheck_golds.py")])
    r2_fail = []
    for f in sorted(base.glob("skills/*/examples/*.tsx")):
        if f.name.startswith("bad-") or f.name.endswith(".test.tsx"): continue
        if run(["node", str(base / "scripts/parser_constraints.js"), str(f)]).returncode: r2_fail.append(f.name)
    smoke_ok = r1.returncode == 0 and not r2_fail
    (ok_ if smoke_ok else bad)(f"unzipped compile {'clean' if r1.returncode==0 else 'FAILED'}; parser {'clean' if not r2_fail else r2_fail}")
    smoke_ok &= archive_content_checks(base, version)
    shutil.rmtree(tmp)
    if not smoke_ok:
        bad("archive is corrupt or non-deterministic — deleting"); archive.unlink()
    return smoke_ok


def archive_content_checks(base: Path, version: str) -> bool:
    """What the archive SAYS, not just that it compiles.

    Everything above this point proves the archive is well-formed. None of it
    reads a sentence. The README's "What's new" heading has shipped announcing
    the wrong version twice (v14.4.0's archive, and again in v14.4.2) because
    prose has no gate and a stale heading breaks nothing that executes.

    The screenshot check derives its expectation from the source tree rather
    than hardcoding a count. A literal here would be one more figure to go
    stale, which is the defect this repo has spent the most releases fixing.
    """
    ok = True

    readme = base / "README.md"
    if not readme.exists():
        bad("archive has no README.md"); return False
    m = re.search(r"^##\s*What's new in v([\d.]+)", readme.read_text(encoding="utf-8"), re.M)
    if not m:
        warn("archive README has no \"What's new\" heading — nothing to check")
    elif m.group(1) != version:
        bad(f"archive README announces v{m.group(1)} but this is v{version}"); ok = False
    else:
        ok_(f"archive README announces v{version}")

    changelog = base / "_meta/CHANGELOG.md"
    if changelog.exists():
        m = re.search(r"^##\s*\[([\d.]+)\]", changelog.read_text(encoding="utf-8"), re.M)
        if m and m.group(1) != version:
            bad(f"archive CHANGELOG tops out at {m.group(1)}, expected {version}"); ok = False
        elif m:
            ok_(f"archive CHANGELOG tops out at {version}")

    # Every local path a shipped file tells the reader to open must be in the
    # archive. This shipped broken for the pack's entire life: 22 files carried
    # 137 references to docs/*.md and the archive contained no docs/ at all —
    # including all 14 per-agent setup guides and the last line setup.sh prints,
    # on the gated-archive route the README recommends. A pointer into nothing
    # is worse than no pointer, because the reader assumes they unzipped it wrong.
    dead: list = []
    for p in sorted(base.rglob("*.md")) + [base / "setup.sh", base / "setup.ps1"]:
        if not p.exists():
            continue
        rel = p.relative_to(base).as_posix()
        if rel in _LINK_REWRITE_EXEMPT:
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        # Deliberately the same two shapes the archive rewriter handles, with
        # the same exclusions, so the check and the fix cannot disagree. The
        # lookarounds skip a backticked path used as a link's display text —
        # `[`docs/x.md`](https://…)` resolves via its URL and is not a dead
        # local pointer.
        cited = set(re.findall(r"\]\((docs/[A-Za-z_-]+\.md)\)", text))
        cited |= set(re.findall(r"(?<!\[)`(docs/[A-Za-z_-]+\.md)`(?!\])", text))
        for target in cited:
            if not (base / target).exists():
                dead.append(f"{rel} → {target}")
    if dead:
        bad(f"{len(dead)} reference(s) to files absent from the archive:")
        for d in sorted(dead)[:10]: print(f"      {d}")
        ok = False
    else:
        ok_(f"every docs/ path cited by a shipped file resolves inside the archive")

    # Same exclusions the archive itself applies, or generated build output
    # (a PNG under .next/ or node_modules/) would be "missing" by design and
    # fail a release for shipping exactly what it was told to ship.
    shipped = (p.relative_to(ROOT).as_posix() for p in ROOT.glob("demo/**/*.png"))
    want = {r for r in shipped if not EXCLUDE_PATTERNS.search(r)}
    missing = sorted(r for r in want if not (base / r).exists())
    if missing:
        bad(f"{len(missing)} of {len(want)} demo image(s) absent from the archive:")
        for r in missing[:8]: print(f"      {r}")
        ok = False
    elif want:
        ok_(f"all {len(want)} demo image(s) present in the archive")

    return ok


# ── Stage 7 — Release notes ──────────────────────────────────────────────────
def release_notes(version: str, archive: Path, gate_results, elapsed):
    hdr("STAGE 7 — RELEASE NOTES")
    with zipfile.ZipFile(archive) as z:
        infos = [i for i in z.infolist() if not i.is_dir()]
    # Tokens from *uncompressed* markdown, not the zip's compressed byte count —
    # the old figure divided the archive size by 4 and reported the result as
    # "tokens", which measured compression ratio rather than content.
    tok = sum(i.file_size for i in infos if i.filename.endswith(".md")) // 4
    n_sem, n_syn = constraint_counts()
    skills = sorted(ROOT.glob("skills/*/SKILL.md"))
    refs = list(ROOT.glob("skills/*/references/**/*.md"))
    ref_tok = sum(tokens(p) for p in refs)
    golds = [p for p in ROOT.glob("skills/*/examples/good-*.tsx") if not p.name.endswith(".test.tsx")]
    antis = list(ROOT.glob("skills/*/examples/bad-*.tsx"))
    tests = list(ROOT.glob("skills/*/examples/good-*.test.tsx"))
    from datetime import date
    table = "\n".join(f"| {n} | {'PASS' if p else 'FAIL'} | {d} |" for n, p, d in gate_results)
    notes = f"""# Release Notes — frontend-design-pro v{version}

**Date:** {date.today().isoformat()}
**Archive:** `frontend-design-pro-v{version}.skill` — {archive.stat().st_size//1024} KB, {len(infos)} files, ~{tok:,} tokens of markdown, root `frontend-design-pro/`
**Pipeline wall-clock:** {elapsed:.1f}s

## Contents

{len(skills)} skills · {len(list(ROOT.glob("core/*.md")))} core files · {len(refs)} references ({ref_tok:,} tokens of on-demand depth) · {len(golds) + len(antis)} examples ({len(golds)} gold + {len(antis)} anti-examples) · {len(tests)} tests · {n_sem + n_syn} constraints ({n_sem} semantic + {n_syn} syntactic)

Registry (`SKILL.md`) is {tokens(SKILL_MD):,} tokens and is the only file always loaded.

## Gate Results

| Gate | Result | Detail |
|------|--------|--------|
{table}

Plus pre-flight, frontmatter, path integrity, and per-skill budget gates — all blocking.

## Known gaps

See [ARCHITECTURE.md](ARCHITECTURE.md#known-gaps). Summary: the suite runs against
`test/stubs/`, not the examples' ~25 real peer libraries, so it proves the components
mount, expose the roles they claim and survive axe — not that they work against the
real `three` or `react-hook-form`; and reference depth is unevenly distributed across
skills.

## Install

```bash
unzip frontend-design-pro-v{version}.skill -d ~/.claude/skills/
```

See [INSTALL.md](INSTALL.md) and [USAGE.md](USAGE.md).

---

All gates passed. No manual changes were made after gate passage — the archive is a
deterministic product of a clean `origin/main` checkout (Stage 4.5 refuses to build from
anything else), re-verified against its own unzipped copy for both compilation and
content (Stage 6).

Released by: build_release.py
"""
    out = (REPO / "docs") if (REPO / "docs").exists() else (ROOT / "_meta")
    out = out / f"RELEASE_NOTES-v{version}.md"
    # Never clobber notes that are already committed. release.yml regenerates
    # them on the runner and then feeds the SAME path to the release body, so an
    # unconditional write silently replaces whatever a human curated — the
    # known-issues list, the migration note — with the generated subset, and the
    # published release says less than the repo does. Generate when the file is
    # absent; otherwise leave it and say so.
    if out.exists():
        warn(f"{out.name} exists and was left alone — delete it to regenerate")
    else:
        out.write_text(notes, encoding="utf-8")
        ok_(f"wrote {out.name}")


# ── main ─────────────────────────────────────────────────────────────────────
def bump_patch():
    meta = json.loads((ROOT / "metadata.json").read_text(encoding="utf-8"))
    a, b, c = meta["version"].split(".")
    new = f"{a}.{b}.{int(c)+1}"
    meta["version"] = new
    (ROOT / "metadata.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    # CHANGELOG insertion, two bugs deep.
    #
    # It used to anchor on the H1 and insert immediately after it, which put the
    # new entry ABOVE the "All notable changes…" intro and the `---` rule —
    # leaving the intro stranded below the newest release. Anchor on the rule
    # instead, which is what separates the preamble from the entries.
    #
    # And it inserted unconditionally, so a release whose notes were written by
    # hand first got a duplicate header plus a "Patch release (auto-bumped)"
    # stub contradicting the real entry directly beneath it. Skip if the version
    # is already documented — writing the notes yourself is the normal case for
    # anything worth releasing.
    cl = CHANGELOG
    from datetime import date
    text = cl.read_text(encoding="utf-8")
    header = f"## [{new}]"
    if header in text:
        print(f"CHANGELOG already documents {new} — leaving it alone")
    else:
        stub = f"{header} — {date.today().isoformat()}\n\n### Changed\n- Patch release (auto-bumped by build_release.py).\n\n"
        anchor = "---\n\n"
        if anchor in text:
            i = text.index(anchor) + len(anchor)
            text = text[:i] + stub + text[i:]
        else:                                   # no preamble rule — fall back to after the H1
            text = re.sub(r"(^# .*\n\n)", rf"\1{stub}", text, count=1, flags=re.M)
        cl.write_text(text, encoding="utf-8")
    # Gate 2 requires every skill file to declare the new version too; bumping
    # metadata alone would fail the very next gate run.
    for sk in sorted(ROOT.glob("skills/*/SKILL.md")):
        t = sk.read_text(encoding="utf-8")
        sk.write_text(re.sub(r'^version:\s*"?[\d.]+"?', f'version: "{new}"', t, count=1, flags=re.M),
                      encoding="utf-8")
    print(f"bumped to {new} (metadata + changelog + {len(list(ROOT.glob('skills/*/SKILL.md')))} skill files)")
    return new


def main():
    args = sys.argv[1:]
    dry = "--dry-run" in args
    if "--bump-patch" in args:
        bump_patch()
    version = _version()
    t0 = time.time()

    print(f"\n{'#'*64}\n# RELEASE PIPELINE — frontend-design-pro v{version}"
          f"{'  (DRY RUN)' if dry else ''}\n{'#'*64}")

    if not preflight(version): print(f"\n{C_NO}PRE-FLIGHT FAILED — no archive produced.{C_END}"); sys.exit(1)
    if not gate_frontmatter(): print(f"\n{C_NO}FRONTMATTER GATE FAILED.{C_END}"); sys.exit(1)
    gates_ok, gate_results = gate_chain()
    if not gates_ok: print(f"\n{C_NO}GATE CHAIN FAILED — no archive produced.{C_END}"); sys.exit(1)
    if not path_integrity(): print(f"\n{C_NO}PATH INTEGRITY FAILED — no archive produced.{C_END}"); sys.exit(1)
    token_budget()
    if not gate_budget(): print(f"\n{C_NO}BUDGET GATE FAILED.{C_END}"); sys.exit(1)
    if not gate_registry(): print(f"\n{C_NO}REGISTRY GATE FAILED.{C_END}"); sys.exit(1)
    if not gate_showcase(): print(f"\n{C_NO}SHOWCASE GATE FAILED.{C_END}"); sys.exit(1)

    if dry:
        print(f"\n{C_OK}DRY RUN — all gates passed. No archive built.{C_END}  ({time.time()-t0:.1f}s)")
        sys.exit(0)

    if not release_source_guard():
        print(f"\n{C_NO}RELEASE SOURCE GUARD FAILED — no archive produced.{C_END}"); sys.exit(1)

    archive = build_archive(version)
    if not post_build_smoke(archive, version):
        print(f"\n{C_NO}POST-BUILD SMOKE FAILED — archive deleted.{C_END}"); sys.exit(1)
    release_notes(version, archive, gate_results, time.time() - t0)

    print(f"\n{C_OK}{'#'*64}\n# RELEASE OK — {archive.name}  ({time.time()-t0:.1f}s)\n{'#'*64}{C_END}")


if __name__ == "__main__":
    main()
