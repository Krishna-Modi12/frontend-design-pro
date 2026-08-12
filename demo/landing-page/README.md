# demo/landing-page

The product homepage for this pack, built under the pack's own rules.

It is not a template with the names swapped. Every figure on the page traces to a
file in this repo, the code panel in the hero is nine unedited lines of
`SKILL.md`, and each rule on the constraint wall prints the ID that the suite
actually reports when it fails. If a claim on the page cannot be checked against
the repo in under a minute, it does not belong on the page.

## Run it

```bash
cd demo/landing-page
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run typecheck   # tsc --noEmit, strict + noUncheckedIndexedAccess
npm run build       # next build
```

This app has its own `package.json` and installed dependencies, so it is excluded
from the stub-typed regime the other demos share — `demo/tsconfig.json` and
`tools/screenshots/tsconfig.json` both skip it. It is **not** exempt from the
content rules: the 17 AST constraints run on every file here, and the 42 regex
constraints run on the project.

## Where the numbers come from

| On the page | Source |
|---|---|
| 19 skills · 59 constraints · 11 blocking gates | `metadata.json` → `stats.skills`, `stats.ci_constraints`, `stats.release_gates` |
| 334,051 reference tokens across 94 files | `metadata.json` → `stats.reference_depth_tokens`, `stats.reference_files` |
| 5,665–7,266 tokens loaded per request | `docs/AGENT_COMPATIBILITY.md` |
| Six skill descriptions | each `skills/{id}/SKILL.md` frontmatter, verbatim |
| Six constraint IDs | `core/validate-checklist.md`, cross-checked against `scripts/parser_constraints.js` and `scripts/test_constraints.py` |
| The hero code panel | `SKILL.md` lines 60–68, unedited |
| Install commands | `README.md` → Install in 30 seconds |
| Fourteen adapters, ten automatic | the `install/` directory — `mode` is whether `install/{id}/.manual` exists, the same marker both setup scripts read — and its README's own untested column |

**The hero's line numbers move when the registry table above them does.** The two
most recently added skills pushed the loading protocol down by two lines, from
58–66 to 60–68. Re-check `ROUTER_EXCERPT` in `components/Hero.tsx` against
`SKILL.md` before recapturing.

There is deliberately no test-suite figure on the page, though the reason has
changed. It used to be that the sources disagreed — `metadata.json`, `README.md`
and `docs/TESTING.md` each named a different count, so any number on the homepage
would have contradicted the repo. They now agree: **45 test files, 229 tests**.
The figure stays off because four metrics is what the strip is sized for and the
constraint count is the one that carries the argument, not because it is unsafe
to state.

The four figures cross the network from `/api/site/overview`; everything else is
structural and lives in `lib/content.ts`. **When a stat changes, update
`screenshot-fixture.json` as well as `metadata.json`** — `CLAUDE.md` names
drifting counts as this repo's single most repeated defect, and this page is now
one more place for one to drift.

## Four things that will bite you

**The static export is opt-in, and must stay that way.** `NEXT_OUTPUT_EXPORT=1`
turns on `output: "export"` for the GitHub Pages deploy; nothing else sets it.
Making it the default breaks the screenshot and verify harnesses outright —
`tools/screenshots/lib/next-server.mjs` starts every demo with `next start`,
which refuses to run against an exported build, and those are the only two
checks in this repo that render anything.

The other half of that problem is solved rather than avoided: an export drops
*dynamic* route handlers, so `/api/site/overview` used to 404 and leave the page
in its error state permanently. The handler is now `force-static`, so Next
evaluates it at build time and writes the response into the output. `next dev`
still re-reads `screenshot-fixture.json` per request — verified, not assumed, so
editing the fixture still shows up on reload.

**A deployed build serves from a sub-path, and `fetch` does not know that.**
Next rewrites its own asset URLs from `basePath` but not the URLs you hand to
`fetch`. `app/page.tsx` reads `NEXT_PUBLIC_BASE_PATH` for exactly this reason; a
root-anchored `/api/site/overview` would 404 under the deploy and render as a
convincing imitation of a broken endpoint.

**The PostCSS plugin is `@tailwindcss/postcss`, not `tailwindcss`.** The plugin
moved out of the main package in Tailwind v4. The v3 spelling fails the build
with an error that does not mention the rename.

**Import order in `app/globals.css` is load-bearing.** Tailwind, then
`../tokens.css`, then the `@theme inline` font block — and `inline` is required
on that last one, because `--font-geist-sans` does not exist until the `geist`
package sets it on `<html>` at runtime. Plain `@theme` there bakes in an
unresolved reference and the page silently falls back to the system stack.

## Notes on the components

`forwardRef` appears once, on `CtaButton`. `core/component-api.md` scopes that
requirement to interactive components; a `<section>` wrapper is reached by its
`id`, so forwarding a ref to one is ceremony. The pack version is deliberately
absent from the footer: `demo/landing-page/` is not on the version-leak allowlist
in `scripts/build_release.py`, so printing the current version fails a blocking
gate.
