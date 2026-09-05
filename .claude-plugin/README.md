# Plugin manifest — why `"skills": ["./"]` and not `["./skills/"]`

JSON carries no comments, and this one field is load-bearing enough that changing
it would disprove the product. It is written down here instead.

## The pointer

Every plugin manifest surveyed uses a **directory pointer**, never an
enumeration — `microsoft/agent-skills` ships **40** `SKILL.md` behind a single
`"skills": ["./skills/"]` entry. That retired the objection that held this file
back for three research batches: nobody lists their skills one by one, so nobody
would have listed our nineteen.

But the pointer they use is not the pointer we want, because our directory layout
means the opposite of theirs.

| | Behind their `./skills/` | Behind our `./skills/` |
|---|---|---|
| What is there | The skills they want registered | The 19 skills the router hides |
| Correct outcome | all 40 of theirs registered | **1** skill registered — the router |

Our `SKILL.md` sits at the **repo root**, beside `core/` and `skills/`. It is the
registry, it is the only file always read, and it is what does the routing. A
pointer at `./skills/` would hand a host the nineteen it is meant to route
between, turning a 2,149-token registry into nineteen skills competing to match
each request — the same inversion `docs/INSTALL.md` tells people never to trigger
with `--full-depth`, arriving by a different door.

So the pointer is `./`, the directory whose top-level `SKILL.md` is the router.

## What a host actually does — measured, 2026-09-05

The section above reasoned from other people's manifests. It has now been run,
and **the inference was wrong.**

`claude plugin marketplace add` against this repo at `v14.14.0`, then
`claude plugin details`:

```
Component inventory
  Skills (20)  agent-ops, ai-ui-generation, animations, canvas-typography,
               color-themes, component-patterns, data-tables, design-principles,
               design-research, design-system, forms, frontend-design-pro,
               iconography, landing-pages, platform, react-components,
               react-performance, testing, threejs-3d, web-interface

Projected token cost
  Always-on:   ~1,991 tok   added to every session
```

**Twenty.** All nineteen sub-skills register as peers, plus the router, and each
pays its description as always-on cost. This is precisely the inversion the table
above says `./skills/` would cause — it happens with `./` too. The
always-on figure is the sum of twenty skill descriptions, not the router.

### Why: `skills/` is a host convention, and the manifest cannot subtract

The field only ever *adds* paths. Measured against a throwaway five-case plugin
declaring `"skills": ["./"]` and nothing else. Paths below are that fixture's,
not this repo's:

```text
SKILL.md                        REGISTERED   via the "./" entry
skills/alpha/SKILL.md           REGISTERED   auto-discovered, named nowhere
packs/beta/SKILL.md             ignored      wrong directory name
nested/skills/gamma/SKILL.md    ignored      not at the plugin root
skills/lib/delta/SKILL.md       ignored      one level too deep
```

So discovery is exactly one level of directory beneath a top-level `skills/` at
the plugin root, and it is unconditional. Two confirmations from this repo itself: `"skills": []`
and `"skills": ["./SKILL.md"]` both still register the nineteen — and both *drop*
the router, which is strictly worse.

**`["./"]` therefore stays.** Not because it produces the documented behaviour,
but because it is the only value that at least registers the router alongside the
nineteen. There is no manifest value that produces one skill.

### The fix is structural, and is not made here

The top-level directory literally named `skills/` must not exist at the plugin
root. Renaming it is a real cascade — **130 files** reference `skills/`,
including the registry rows in the root `SKILL.md`, the loading protocol, Gate 8b,
`test_constraints.py --dir skills`, the release script, the CI workflow, and
`prose_paths()`'s addressing forms. That is an architecture decision with an
owner-sized blast radius, not a manifest edit, so it is recorded rather than
taken.

**Until it is resolved, do not submit a marketplace listing.** That is this
file's own prior instruction, and it stands: the response to "it registers
nineteen" is to withdraw the listing, not to adjust the architecture around it.
Nothing has been submitted; adding a marketplace locally publishes nothing.

## What this is not

**Committing this file publishes nothing.** A marketplace listing is a separate,
explicit submission. Reproduce the measurement above with:

```
claude plugin marketplace add /path/to/frontend-design-pro
claude plugin install frontend-design-pro@frontend-design-pro
claude plugin details frontend-design-pro@frontend-design-pro
```

`claude plugin marketplace remove frontend-design-pro` undoes it.

## The version field

`version` here is one of the **six** places this pack's version lives, alongside
`metadata.json`'s `version` and its own `changelog` map, `docs/CHANGELOG.md`,
all 19 `skills/*/SKILL.md`, and the `## What's new in vX` heading in `README.md`.
`bump_patch()` in `scripts/build_release.py` rewrites this one and Gate 2 asserts
it matches — because `.claude-plugin/` is on the version-leak allowlist, nothing
else would ever notice it going stale.

See [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) for the registry model
and [`../docs/INSTALL.md`](../docs/INSTALL.md) for the other install routes.
