# Screenshot capture harness

Regenerates every image `README.md` links, from the committed demo sources.

```bash
npm ci                              # AT THE REPO ROOT — see below, this is required
cd tools/screenshots
npm ci
npx playwright install chromium     # once
npm run capture
```

**The root install is not optional.** React is deliberately absent from this
package (see the first trap below), so `next` resolves it by walking up to the
repo root. Install here only and the dev server has no React at all.

Or, from the repo root, which does both: `npm run screenshots`.

Targets can be narrowed, and the Next build skipped when only the capture logic
changed:

```bash
npm run screenshots -- landing-page
npm run screenshots -- --skip-build
```

Output is written straight over `demo/*/screenshot.png` and `screenshot-full.png`.

**`showcase` is opt-in** — `npm run screenshots -- showcase`. Its hero is a WebGL
particle field seeded at random, so every capture differs from the last; running
it by default would dirty that file on every run and bury real changes in noise.
Recapture it deliberately, when the showcase UI actually changed.

The other three are near-deterministic: re-running against unchanged sources
reproduces `auth-form` byte for byte and the rest within a few bytes of
antialiasing noise. So review `git diff --stat -- 'demo/**/*.png'` before
committing — a multi-kilobyte change means something really moved, and a
few-byte change is nothing.

## Visual regression

```bash
npm run visual-regression                    # check home/, demo/landing-page and demo/showcase
npm run visual-regression -- --update-baselines
```

Or from the repo root: `npm run visual-regression`.

Diffs `home/`, `demo/landing-page` and `demo/showcase` against committed
baselines under `baselines/` (3 viewports each, one color scheme per target —
see the doc comment at the top of `visual-regression.mjs` for why).

`demo/showcase` was excluded at first, and the reason is worth keeping: its hero
is a WebGL particle field seeded at random, so every capture differs from the
last and a pixel diff would have failed on every run regardless of any real
change. It is included now because the capture freezes the seed via
`?particleSeed=`, which pins particle position and rotation for a byte-identical
repeat capture. Real users are unaffected.

Baselines should come from CI, not a local machine: font rendering differs
enough across platforms that a Windows- or macOS-captured baseline produces
false diffs against the Linux runner this also runs on. `--update-baselines`
is for local iteration; review what it reports before committing a baseline
it produced.

Runs in CI as `visual-regression` in `.github/workflows/ci.yml`, informational
only (`continue-on-error: true`) until it has proven stable enough to block a
merge.

## Why this is a separate package

The pack ships no runtime — that is the whole architecture, and `demo/`'s three
stub-typed projects compile against ambient declarations rather than installed
libraries. Rendering them needs the real packages, so those live here instead of
in the root manifest, where they would imply the pack depends on them.

`tools/` is absent from `ARCHIVE_FROM_SRC` in `scripts/build_release.py`, so none
of this reaches the `.skill`. Nothing needs excluding by hand.

## How it works

The demos are **imported where they live** (`../../demo/<name>/app/page`), never
copied. A copy is a second source of truth that goes stale silently, and a
screenshot taken from a stale copy is exactly the failure this repo exists to
avoid.

`app/globals.css` imports `demo/landing-page/tokens.css` — the demo's own token
file, not a restatement of it. That import is load-bearing: `landing-page` is the
one demo that addresses its palette through named utilities (`bg-surface-page`,
`bg-surface-elevated`, `text-ink-muted`, `border-surface-border`, `ring-accent`),
and Tailwind only emits those for tokens registered at build time. `dashboard` and `auth-form` are
deliberately not imported: both use arbitrary `bg-[var(--color-surface)]`
utilities against a `:root` block they inject themselves, so they need nothing
here — and registering tokens on their behalf would let this harness flatter them
into looking better than they are.

`app/api/site/overview/route.ts` serves `demo/landing-page/screenshot-fixture.json`
by reading the committed file, so the image and the data behind it cannot drift.

## Traps worth knowing

Every one of these cost real time here:

- **React must exist exactly once in the repo.** The root installs it for vitest;
  `next` lists it as a peer and npm installs peers automatically, which would give
  this package a second copy. Files under `demo/` then resolve the root's React
  while files here resolve their own, and a tree spanning two instances dies in
  dev with `Cannot read properties of undefined (reading
  'recentlyCreatedOwnerStacks')`. Production stays green throughout, so the
  symptom looks nothing like the cause. `.npmrc` suppresses the peer install.
  Two near-misses, both tempting: aliasing `react` to this package's copy moves
  the breakage into Next's own devtools, and *prepending* `node_modules` to
  `resolve.modules` shadows Next's internal resolution — which is why the
  fallback in `next.config.ts` is appended.
- **Killing a Next server means killing its tree.** `shell: true` puts a shell
  between us and `npx`, and `npx` puts another process between that and `next`,
  so `child.kill()` leaves the server holding its port. The next run then fails
  with "server never became ready" against a port that is very much in use.
  `lib/next-server.mjs` handles this; use it rather than spawning directly.
- **`dev` and `start` share one `.next` and disagree about it.** A dev pass on
  top of a production build serves 500s on every route. `verify.mjs` clears it.
- **`waitUntil: "networkidle"` never fires against a Next server.** It holds a
  socket open, so the navigation times out instead of settling. Wait for content.
- **A sharp-encoded buffer must be written with `writeFileSync`.** Passing it back
  through `sharp().toFile()` re-encodes at defaults, discards the palette, and
  silently puts the file back over the size cap — while the in-memory check that
  chose the encoding still reports success.

## Verifying the demos

`npm run verify` (or `npm run demos:verify` from the root) renders every demo in
**both** dev and production, in both colour schemes, and checks what no gate can:
uncaught page errors, console errors, React hydration mismatches, serious and
critical axe violations against WCAG 2.1 AA, and horizontal overflow at 390 /
768 / 1920. Fifty assertions. It found four real defects the day it was written.

## Live-audit harness

`npm run live-audit:fixtures` runs `live-audit.mjs` — the deterministic,
headless half of `web-interface`'s Layer B (`skills/web-interface/references/live-verification.md`).
It implements the measurement primitives that workflow relies on — a
320/390/768/1920 viewport sweep, real horizontal overflow, computed text
contrast (including text over a gradient, resolved from screenshot pixels),
console and network failures, dead scroll-reveals, heading font resolution and
type-ramp collapse (critique), one focus-restoration interaction — and emits the
reference's findings schema.

```bash
npm run live-audit:fixtures                 # 5 golden fixtures, assert every *.expected.md
npm run live-audit -- fixreverify           # e-contrast fixture: FOUND -> FIXED -> VERIFIED
npm run live-audit -- url <URL> [--json] [--out report.json]
```

Fixtures live in `skills/web-interface/examples/live-audit/`. Running from
another checkout: set `LV_FIXTURE_DIR` to that path.

The interactive steps of the workflow — real user journeys, judgement on a
`NEEDS_REVIEW` finding — stay with the MCP-driven pass; this script is the part a
regression test can own. Not shipped in the archive, not in CI.

## Adding a demo

Add a route re-export under `app/<name>/page.tsx` and an entry to `SITES` in
`capture.mjs`. If the new demo uses named token utilities, import its `tokens.css`
in `globals.css` and add an `@source` line so Tailwind scans it. If it uses
arbitrary `var()` utilities, it needs neither.
