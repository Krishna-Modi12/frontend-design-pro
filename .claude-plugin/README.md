# Plugin manifest — why `"skills": ["./"]`, and why the catalog is not named `skills/`

JSON carries no comments, and this one field is load-bearing enough that changing
it would disprove the product. It is written down here instead.

Two things are recorded below: what the manifest field does, and the structural
change the pack made to stop a host convention from inverting its architecture.
The second one is the reason the catalog directory is called `catalog/`.

## The pointer

Every plugin manifest surveyed uses a **directory pointer**, never an
enumeration — `microsoft/agent-skills` ships **40** `SKILL.md` behind a single
`"skills": ["./skills/"]` entry. Nobody lists their skills one by one, so nobody
would have listed our nineteen.

But the pointer they use is not the pointer we want, because our directory layout
means the opposite of theirs. Their `skills/` holds the skills they want
registered. Ours holds the nineteen the router exists to choose *between*.

Our `SKILL.md` sits at the **repo root**, beside `core/` and `catalog/`. It is
the registry, it is the only file always read, and it is what does the routing.
Registering the nineteen alongside it turns a 2,154-token registry into nineteen
skills competing to match each request — the same inversion `docs/INSTALL.md`
tells people never to trigger with `--full-depth`, arriving by a different door.

So the pointer is `./`, the directory whose top-level `SKILL.md` is the router.

## The part that was reasoned, then run — and was wrong

The section above is inference from other people's manifests. On **2026-09-05**
it was executed for the first time, against `v14.14.1`, when the catalog was
still a directory named `skills/`:

```text
Component inventory
  Skills (20)  agent-ops, ai-ui-generation, animations, canvas-typography,
               color-themes, component-patterns, data-tables, design-principles,
               design-research, design-system, forms, frontend-design-pro,
               iconography, landing-pages, platform, react-components,
               react-performance, testing, threejs-3d, web-interface

Projected token cost
  Always-on:   ~1,991 tok   added to every session
```

**Twenty.** Every sub-skill registered as a peer of the router, each paying its
description as always-on cost — the exact inversion this file argued `./skills/`
would cause, arriving through `./`. The central architectural claim did not hold
under a real plugin host, and no amount of manifest editing could fix it.

### Why: `skills/` is a host convention, and the manifest cannot subtract

The field only ever *adds* paths. Measured against a throwaway plugin declaring
`"skills": ["./"]` and nothing else. Paths below are that fixture's, not this
repo's:

```text
SKILL.md                        REGISTERED   via the "./" entry
skills/alpha/SKILL.md           REGISTERED   auto-discovered, named nowhere
packs/beta/SKILL.md             ignored      wrong directory name
catalog/gamma/SKILL.md          ignored      wrong directory name
nested/skills/gamma/SKILL.md    ignored      not at the plugin root
skills/lib/delta/SKILL.md       ignored      one level too deep
```

Discovery is **exactly one directory level beneath a top-level `skills/` at the
plugin root, and it is unconditional.** Two confirmations from this repo itself:
`"skills": []` and `"skills": ["./SKILL.md"]` both still registered the nineteen,
and both *dropped* the router — strictly worse. There was no manifest value that
produced one skill.

## The fix: the catalog is not called `skills/`

Since discovery keys on the literal directory name, the fix is structural — the
top-level directory named `skills/` must not exist at the plugin root. It is now
**`catalog/`**, which is the word the project already used for the collection of
nineteen (`CATALOG_COPY` on the home page), leaving *registry* to mean the
router's routing table, as it always has.

Re-measured the same way, after the rename:

```text
Component inventory
  Skills (1)  frontend-design-pro

Projected token cost
  Always-on:   ~176 tok   added to every session
```

**One skill, and always-on cost falls from ~1,991 tokens to ~176** — an eleven-
fold drop, because what is loaded into every session is now one router
description instead of twenty. The registry model holds under a real plugin host.

`["./"]` stays as the pointer. It now means what this file always claimed.

### What the rename cost

Roughly 130 files referenced `skills/` — the registry rows in the root
`SKILL.md`, the loading protocol, Gate 8b, `test_constraints.py --dir catalog`,
the release script, the CI workflow, `prose_paths()`'s addressing forms, and
every host-adapter file under `install/`. Two things it did **not** touch, and
must never: `~/.claude/skills/` and its per-host equivalents, which are the
*host's* directory and unrelated to ours; and `docs/CHANGELOG.md` plus
`docs/RELEASE_NOTES-*`, which are the historical record and were accurate when
written.

It also moved the token figures, which is worth knowing before attempting it.
`catalog/` is one character longer than `skills/`, so every path citation in the
pack grew, nudging the registry size, the per-request band and the reference
depth all at once. Gate 11 caught the drift across every claim surface that
quotes them; re-derive from `--truth` rather than reasoning about the delta.

## What this is not

**Committing this file publishes nothing.** A marketplace listing is a separate,
explicit submission, and none has ever been made. The standing instruction not to
submit one existed because the route was broken; that blocker is gone, but
submitting remains the owner's call and an outward-facing act, not a consequence
of this change.

Reproduce either measurement with:

```
claude plugin marketplace add /path/to/frontend-design-pro
claude plugin install frontend-design-pro@frontend-design-pro
claude plugin details frontend-design-pro@frontend-design-pro
```

`claude plugin marketplace remove frontend-design-pro` undoes it. Always remove
it afterwards — left installed, a local marketplace loads the plugin into every
session on that machine.

## The version field

`version` here is one of the **six** places this pack's version lives, alongside
`metadata.json`'s `version` and its own `changelog` map, `docs/CHANGELOG.md`,
all 19 `catalog/*/SKILL.md`, and the `## What's new in vX` heading in
`README.md`. `bump_patch()` in `scripts/build_release.py` rewrites this one and
Gate 2 asserts it matches — because `.claude-plugin/` is on the version-leak
allowlist, nothing else would ever notice it going stale.

See [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) for the registry model
and [`../docs/INSTALL.md`](../docs/INSTALL.md) for the other install routes.
