# Release Notes — frontend-design-pro v14.4.3

**Date:** 2026-08-06
**Archive:** `frontend-design-pro-v14.4.3.skill` — 1910 KB, 319 files, ~393,422 tokens of markdown, root `frontend-design-pro/`
**Pipeline wall-clock:** 96.3s

## Contents

17 skills · 8 core files · 86 references (320,891 tokens of on-demand depth) · 45 examples (39 gold + 6 anti-examples) · 39 tests · 53 constraints (17 semantic + 36 syntactic)

Registry (`SKILL.md`) is 1,895 tokens and is the only file always loaded.

## Gate Results

| Gate | Result | Detail |
|------|--------|--------|
| Compile | PASS | All 45 gold examples compile under tsc --noEmit (strict) · 14 demo files clean |
| Semantic | PASS | 53/53 files (39 golds + 14 demo) pass 17/17 parser checks |
| Syntactic | PASS | gold examples clean, anti-examples fail as designed (36/36) · demos clean |
| Pipeline | PASS | 16/16 checks (stages · architecture · cited paths) |
| Evals | PASS | 22/22 self-test |
| Test coverage | PASS | 39/39 golds have a 1:1 test; all compile strict; 39/39 files · 124/124 tests pass |
| Regression | PASS | 13/13 synthetic cases |

Plus pre-flight, frontmatter, path integrity, and per-skill budget gates — all blocking.

## Known gaps

See [ARCHITECTURE.md](ARCHITECTURE.md#known-gaps). Summary: the suite runs against
`test/stubs/`, not the examples' ~25 real peer libraries, so it proves the components
mount, expose the roles they claim and survive axe — not that they work against the
real `three` or `react-hook-form`; and reference depth is unevenly distributed across
skills.

## What this release fixes

A distribution hotfix. The v14.4.2 gate chain was green and the archive it produced was
internally perfect — and shipped defects already fixed on `main` two commits earlier,
because the tag was cut from `d48546c`, which was never `main`'s head.

- **The archive is now built from a commit the public can fetch.** Stage 4.5 fetches
  `origin` and refuses to build unless `HEAD` is exactly `origin/main` with a clean tree.
- **`README.md` no longer claims its own test suite is broken.** It read *"partially
  executable — 20 of 39 files pass … not run in CI"*. Real figure: 39/39 files, 124/124
  tests, in CI on every push.
- **Install step 1 is no longer a dead link.** `../../releases` 404s from inside `docs/`.
- **"What's new" no longer announces the wrong version.** Stage 6 now reads the archive's
  prose, not just its code, and all seven demo images are asserted present — three of them
  had never reached a release.
- **`rtl` no longer means two things.** It sat on both the `testing` row (React Testing
  Library) and the `platform` row (right-to-left).

## Known issues, carried forward

Found by the senior-developer audit that produced this release. None is a regression;
all are scheduled for v14.5.0.

- **3 high-severity CVEs in `demo/showcase`** — `sharp <0.35.0` / libvips
  (CVE-2026-33327/33328/35590/35591). The archive ships `demo/showcase/package-lock.json`,
  so a user's `npm install` reproduces them. `npm audit fix --force` wants
  `next@15.5.22`, outside the stated range, so it is a deliberate bump rather than a
  hotfix. The pack itself has **zero production dependencies**.
- **`@react-three/drei@10.7.7` is declared but unused** in `demo/showcase`, and the README
  names it as used.
- **Five style presets are routed by a glob**, not named rows — `references/styles/*.md`
  (~44 KB: soft, minimalist, brutalist, glassmorphism, neo-brutalism). Under lazy loading
  a glob makes the agent guess; every other routing row names a file and says when to load it.
- **`docs/` is not in the archive manifest**, so `INSTALL.md` and the per-host setup guides
  are reachable only from the repo. The README's install instructions ship; its `docs/*.md`
  links do not resolve inside an unzipped copy.
- **Renderer checks are not in CI.** `demos:verify` needs a browser and two Next servers,
  so it stays developer-only — yet it is the only check that catches the rendering class
  and found four real defects on its first run.

## Install

```bash
unzip frontend-design-pro-v14.4.3.skill -d ~/.claude/skills/
```

See [INSTALL.md](INSTALL.md) and [USAGE.md](USAGE.md).

---

All gates passed. No manual changes were made after gate passage — the archive is a
deterministic product of a clean `origin/main` checkout (Stage 4.5 refuses to build from
anything else), re-verified against its own unzipped copy for both compilation and
content (Stage 6).

Released by: build_release.py
