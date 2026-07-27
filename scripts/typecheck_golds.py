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
    if shutil.which("tsc"):
        return ["tsc"]
    if shutil.which("npx"):
        return ["npx", "--yes", "tsc"]
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
    finally:
        cfg_path.unlink(missing_ok=True)

    out = (proc.stdout + proc.stderr).strip()
    if proc.returncode == 0:
        print(f"All {n} gold examples compile under tsc --noEmit (strict)")
        return 0
    print(out)
    errs = [l for l in out.splitlines() if "error TS" in l]
    print(f"\n{len(errs)} error(s) across examples/ — compilation errors are blockers.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
