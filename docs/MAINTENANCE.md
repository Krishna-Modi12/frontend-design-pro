# Maintenance policy

**Status: FEATURE FREEZE.** In effect from the release that introduced this file — see the top entry in [CHANGELOG.md](CHANGELOG.md). Deliberately not version-pinned here: a policy that needs editing on every patch bump is a policy that goes stale, and the version-leak gate would fail the build for it anyway.

The pack is done. 16 skills, 76 references, 305,784 tokens of on-demand depth, 51 machine-enforced constraints, 9 release-blocking gates, one runnable demo app. Adding a 17th skill would grow the always-loaded registry for a routing target almost nobody asks for; adding a 77th reference would add depth nobody has hit the bottom of. The remaining risk to this project is not missing features. It is churn — every commit is a chance to break something that currently works.

So the default answer to "should we build X" is **no, not yet**, and the burden is on evidence.

## What lifts the freeze

Any **one** of these:

| Trigger | Threshold |
|---|---|
| Users asking for the same specific thing | **10 distinct requests** for one feature |
| Real defects reported from real use | **5 confirmed bugs** |
| Time with the project actually being watched | **2 weeks** of active monitoring from the freeze release |

"Active monitoring" means issues are being read and answered. Two weeks of silence because nobody looked does not count and does not lift anything.

Counting requires something to count from, so [METRICS_BASELINE.md](METRICS_BASELINE.md) records the pre-launch state — stars, forks, issues, PRs and release downloads, all zero, with the `gh` commands to re-query them. Without a baseline, "10 requests" is a feeling.

Note what is *not* on that list: a good idea, a new library worth supporting, a competitor shipping something, or boredom. Those are the reasons packs like this rot — each one is individually reasonable and collectively fatal.

## What may still be committed during the freeze

- **README and doc typo fixes.** Free.
- **Broken link fixes.** Free, and the link checker should be run before each one.
- **Critical bug fixes** — but only for a bug someone actually reported, and only with the gate chain green.

That is the whole list. In particular: no refactors "while we're in there", no dependency bumps without a reported reason, no new gates, no rewording of the anti-slop wall because a better phrasing occurred to someone.

## The bar for a freeze-period commit

Same as always, because the gates do not care about policy:

```bash
python scripts/build_release.py --dry-run     # all 9 gates
```

A fix that cannot pass the chain is not a fix. If a change requires relaxing a gate to land, the change is wrong — that is the entire premise of the repo, and the freeze is not an exception to it.

## Releasing during the freeze

Patch releases only:

```bash
python scripts/build_release.py --bump-patch  # bumps, gates, builds, smoke-tests
```

Write the changelog entry yourself before running it; the bump leaves an existing `## [x.y.z]` header alone and only stubs one when you have not. Then tag and push — CI re-runs every gate on a clean runner and attaches the archive.

## Being a maintainer instead of a builder

The work that actually matters now is not in this repo:

- Answer the issues. A question answered in an hour is worth more than a feature shipped in a week.
- Watch for the pattern. One person asking for something is noise; ten is a signal, and the table above is how you tell them apart without arguing about it.
- Let the gates do the arguing. When someone proposes a change, the question is not whether it sounds good — it is whether it passes, and what it costs the always-loaded budget.

The pack's whole claim is that it is verified rather than asserted. A freeze is what that claim looks like once you believe it.
