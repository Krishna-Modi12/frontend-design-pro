#!/usr/bin/env bash
# Validate every demo against the same gates the gold examples face.
# Usage: bash demo/validate.sh [subdir]   e.g. bash demo/validate.sh landing-page
set -u
cd "$(dirname "$0")/.."
TARGET="${1:-}"
SCOPE="demo${TARGET:+/$TARGET}"
echo "── compile (tsc --noEmit strict) ─────────────────────────────"
./node_modules/.bin/tsc.cmd -p demo/tsconfig.json 2>/dev/null || ./node_modules/.bin/tsc -p demo/tsconfig.json
TSC=$?
echo "tsc exit: $TSC"
echo "── parser (16 AST constraints) ───────────────────────────────"
PFAIL=0
for f in $(find "$SCOPE" -name '*.tsx' ! -name '*.test.tsx'); do
  node scripts/parser_constraints.js "$f" >/dev/null 2>&1 || { echo "  FAIL $f"; node scripts/parser_constraints.js "$f" 2>&1 | head -5; PFAIL=1; }
done
[ $PFAIL = 0 ] && echo "  all files pass 16/16"
# The regex suite judges a whole project, not a file: the font lives in the page
# shell and the error branch in one component, so it always runs over all of
# demo/ even when the parser loop above is scoped to one subdirectory.
echo "── regex (35 constraints, one report per project) ────────────"
python scripts/test_constraints.py --dir demo --recursive --project 2>&1 | tail -6
echo "── done: tsc=$TSC parser=$PFAIL ──"
