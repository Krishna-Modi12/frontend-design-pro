# Release Notes — frontend-design-pro v12.3.0

**Date:** 2026-07-26
**Archive:** `frontend-design-pro-v12.3.0.skill` (721 KB, 140 files, ~184,720 tokens)
**Pipeline wall-clock:** 39.3s

## Gate Results

| Gate | Result | Detail |
|------|--------|--------|
| Compile | PASS | All 27 gold examples compile under tsc --noEmit (strict) |
| Semantic | PASS | 24/24 golds pass 8/8 parser checks |
| Syntactic | PASS | gold examples clean, anti-examples fail as designed (24/24) |
| Pipeline | PASS | 9/9 stage markers |
| Evals | PASS | 22/22 self-test |
| Test coverage | PASS | 24/24 golds present + compile strict (vitest exec needs `npm i -D vitest`) |
| Regression | PASS | 7/7 synthetic cases |

All gates passed. No manual changes were made after gate passage — the archive is a
deterministic product of the working tree, re-verified against its own unzipped copy
(Stage 6).

Released by: build_release.py v1.0
