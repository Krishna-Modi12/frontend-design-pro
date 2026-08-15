#!/usr/bin/env python3
"""
Gold Example TypeScript Compile Check

Runs `tsc --noEmit` (strict) against all examples/*.tsx.
Compilation errors are BLOCKERS; the regex constraint suite covers style.

Usage:
  python scripts/typecheck_golds.py [--skill-root PATH]

Requires: npm install typescript @types/react @types/react-dom
(anywhere on the resolution path, or globally via npx).

Exit codes: 0 = clean · 1 = tsc errors · 2 = tsc unavailable (skipped)
"""

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

TSCONFIG = {
    "compilerOptions": {
        "strict": True,
        "noImplicitAny": True,
        "jsx": "react-jsx",
        "moduleResolution": "bundler",
        "target": "ES2022",
        "module": "ESNext",
        "esModuleInterop": True,
        "skipLibCheck": True,
        "noEmit": True,
        "types": ["react", "react-dom"],
    },
    "include": ["skills/*/examples/*.tsx", "skills/*/examples/*.d.ts"],
    "exclude": ["skills/*/examples/*.test.tsx"],
}


def find_tsc(root: Path):
    """Prefer a local node_modules tsc anywhere up the tree, then PATH/npx.

    On Windows the extensionless `.bin/tsc` is a POSIX shell script; invoking it
    via subprocess raises WinError 193. The `.cmd` shim is the executable one.
    """
    names = ("tsc.cmd", "tsc") if sys.platform == "win32" else ("tsc",)
    for base in [root, *root.parents]:
        for name in names:
            cand = base / "node_modules" / ".bin" / name
            if cand.exists():
                return [str(cand)]
    # Return what `which` resolved, not the bare name. `subprocess.run` without
    # a shell hands the string straight to CreateProcess, which does not apply
    # PATHEXT — so a bare "npx" that `which` happily finds as `npx.cmd` still
    # raises WinError 2. That turned the no-node_modules path, which is exactly
    # what a fresh install looks like, into an unhandled traceback.
    resolved = shutil.which("tsc")
    if resolved:
        return [resolved]
    resolved = shutil.which("npx")
    if resolved:
        # `npx --yes tsc` does NOT fetch the TypeScript compiler. It fetches the
        # npm package literally named `tsc` — an unrelated wrapper, deprecated
        # since 2016 — and runs it, which then prints "This is not the tsc
        # command you are looking for" and exits non-zero. The gate read that as
        # a compilation failure. Name the package that owns the binary.
        return [resolved, "--yes", "--package=typescript", "tsc"]
    return None


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    if "--skill-root" in sys.argv:
        root = Path(sys.argv[sys.argv.index("--skill-root") + 1]).resolve()

    # --check/--dry-run accepted (script is already side-effect free)
    tsc = find_tsc(root)
    if tsc is None:
        print("SKIP: tsc not found. Run: npm install typescript @types/react @types/react-dom")
        return 2

    cfg = TSCONFIG.copy()
    n = len([p for p in root.glob("skills/*/examples/*.tsx") if not p.name.endswith(".test.tsx")])
    with tempfile.NamedTemporaryFile(
        "w", suffix=".json", dir=root, prefix="tsconfig.golds.", delete=False
    ) as f:
        json.dump(cfg, f, indent=2)
        cfg_path = Path(f.name)

    try:
        proc = subprocess.run(
            [*tsc, "--noEmit", "--project", str(cfg_path)],
            capture_output=True, text=True, cwd=root,
        )
    except OSError as exc:
        # Degrade rather than lie: a compiler we cannot launch is the same
        # situation as one we could not find, and the caller already knows how
        # to continue without it. A traceback here reads as a broken pack.
        print(f"SKIP: could not launch {tsc[0]} ({exc}). "
              "Run: npm install typescript @types/react @types/react-dom")
        return 2
    finally:
        cfg_path.unlink(missing_ok=True)

    out = (proc.stdout + proc.stderr).strip()
    if proc.returncode == 0:
        print(f"All {n} gold examples compile under tsc --noEmit (strict)")
        return 0
    errs = [l for l in out.splitlines() if "error TS" in l]
    # TS2688 is "cannot find type definition file for X", raised against the
    # `types` array in compilerOptions. It means @types/* was never installed —
    # an empty toolchain, not a defect in anybody's code. Reporting it as
    # "compilation errors are blockers" sent a new user hunting a bug that was
    # not there. If that is the *only* thing tsc found, say what is missing.
    if errs and all("error TS2688" in l for l in errs):
        missing = sorted({m for l in errs
                          for m in re.findall(r"type definition file for '([^']+)'", l)})
        print(f"SKIP: type definitions missing ({', '.join(missing) or 'unknown'}) — "
              "nothing was type-checked. Run: npm install typescript @types/react @types/react-dom")
        return 2
    print(out)
    print(f"\n{len(errs)} error(s) across examples/ — compilation errors are blockers.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
