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
| Correct outcome | 40 skills registered | **1** skill registered — the router |

Our `SKILL.md` sits at the **repo root**, beside `core/` and `skills/`. It is the
registry, it is the only file always read, and it is what does the routing. A
pointer at `./skills/` would hand a host the nineteen it is meant to route
between, turning a 2,088-token registry into nineteen skills competing to match
each request — the same inversion `docs/INSTALL.md` tells people never to trigger
with `--full-depth`, arriving by a different door.

So the pointer is `./`, the directory whose top-level `SKILL.md` is the router.

## What this is not

**Not verified.** A manifest is a declaration; it does not specify what a host
does on load, and nothing in the surveyed material documents load semantics. The
evidence is strong — a 40-skill plugin from the vendor of the runtime is a
shipped, working configuration, which an eagerly-loading host would make unusable
— but strong evidence is not proof.

**Committing this file publishes nothing.** A marketplace listing is a separate,
explicit submission. Test locally first:

```
/plugin marketplace add /path/to/frontend-design-pro
```

Then confirm the host registers **one** skill and not nineteen. If it registers
nineteen, this file is wrong and the correct response is to withdraw it, not to
adjust the architecture around it.

## The version field

`version` here is the fourth place this pack's version lives, after
`metadata.json`, `docs/CHANGELOG.md` and all 19 `skills/*/SKILL.md`.
`bump_patch()` in `scripts/build_release.py` rewrites it and Gate 2 asserts it
matches — because `.claude-plugin/` is on the version-leak allowlist, nothing
else would ever notice it going stale.

See [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) for the registry model
and [`../docs/INSTALL.md`](../docs/INSTALL.md) for the other install routes.
