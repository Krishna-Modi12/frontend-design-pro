# Metrics Baseline — pre-launch

Snapshot taken before any public distribution (no HN/Twitter/Reddit posts yet). Every number here is a real `gh` query result, not an estimate.

**Taken:** 2026-07-30, via `gh repo view` / `gh issue list` / `gh pr list` / `gh release view`.
**Re-queried:** 2026-08-01, same commands. Only the download count moved.

| Metric | 2026-07-30 | 2026-08-01 |
|---|---|---|
| Stars | 0 | 0 |
| Forks | 0 | 0 |
| Watchers | 0 | 0 |
| Open issues | 0 | 0 |
| Open PRs | 0 | 0 |
| Latest release published | 2026-07-30 | 2026-08-01 |
| `.skill` archive downloads | 0 | **2** |
| HN post | not posted | not posted |
| Reddit post | not posted | not posted |
| Twitter/X thread | not posted | not posted |

The two downloads are the first non-zero number this project has ever recorded. With no post
made anywhere, they are almost certainly the maintainer or a crawler — worth writing down
precisely so that when a real distribution event happens, the delta is attributable.

Zero across the board is the point. It is the only honest starting line, and it means every later number is attributable to something specific rather than to ambient drift.

## Freeze thresholds

The freeze in [MAINTENANCE.md](MAINTENANCE.md) lifts on the first of these. Update this table weekly while the freeze is active.

| Threshold | Target | Current | As of |
|---|---|---|---|
| Distinct feature requests for one capability | 10 | 0 | 2026-08-01 |
| Confirmed reproducible bugs | 5 | 0 | 2026-08-01 |
| Days of actively monitored time | 14 | 0 | 2026-08-01 |

The first two are `gh` label queries and were re-run on 2026-08-01 — both still zero, because
no issue of any kind exists yet. The third is deliberately left at 0: it measures attention,
and running a label query from a script is not the same as reading and answering issues. Only
the maintainer can move that row, and there has been nothing to answer.

Three issues drafted during the v14.3.0 ingestion are held in `_ingestion/issues/` rather than
filed. They are maintainer-authored findings, not field reports — filing them would add rows to
the label queries above without adding a single distinct requester, and this table exists so
the thresholds stay a query rather than a feeling.

Earliest possible lift on the time trigger: **2026-08-13**. "Actively monitored" means issues were read and answered during those days — days where nobody looked do not count toward the 14, so this figure can legitimately lag the calendar.

## Re-checking

```bash
gh repo view Krishna-Modi12/frontend-design-pro --json stargazerCount,forkCount,watchers \
  -q '{stars: .stargazerCount, forks: .forkCount, watchers: .watchers.totalCount}'
gh issue list --repo Krishna-Modi12/frontend-design-pro --state open --json number -q 'length'
gh pr list   --repo Krishna-Modi12/frontend-design-pro --state open --json number -q 'length'

# Toward the freeze thresholds — label-based, so counting is a query not a judgement
gh issue list --repo Krishna-Modi12/frontend-design-pro --state all --label enhancement --json number -q 'length'
gh issue list --repo Krishna-Modi12/frontend-design-pro --state all --label bug         --json number -q 'length'

# Download counts, latest release
gh release view --repo Krishna-Modi12/frontend-design-pro --json tagName,assets \
  -q '"\(.tagName): " + (.assets[] | "\(.name) \(.downloadCount)")'
```

The release query deliberately omits a tag so it follows the latest one instead of going stale on the next patch.

## What to watch that these numbers do not show

- **Which skill people actually load.** Stars measure interest; the routing table is where the pack lives or dies. A bug report naming a skill id is worth more than fifty stars.
- **Whether anyone runs the gates.** A PR with pasted `--dry-run` output means somebody trusted the verification story enough to test it.
- **Whether the showcase screenshot stays current.** One exists now (captured pre-launch — see [SCREENSHOT_CONTRIBUTION.md](../.github/SCREENSHOT_CONTRIBUTION.md)), but it goes stale the moment `demo/showcase`'s UI changes. A PR that touches the showcase without recapturing it is worth flagging.
