# Metrics Baseline — pre-launch

Snapshot taken before any public distribution (no HN/Twitter/Reddit posts yet). Every number here is a real `gh` query result, not an estimate.

**Taken:** 2026-07-30, via `gh repo view` / `gh issue list` / `gh pr list` / `gh release view`.
**Re-queried:** 2026-08-01, same commands.

| Metric | 2026-07-30 | 2026-08-01 |
|---|---|---|
| Stars | 0 | 0 |
| Forks | 0 | 0 |
| Watchers | 0 | 0 |
| Open issues | 0 | **3** — all maintainer-authored, see below |
| Open PRs | 0 | 0 |
| Latest release published | 2026-07-30 | 2026-08-01 |
| `.skill` archive downloads | 0 | **2** |
| HN post | not posted | not posted |
| Reddit post | not posted | not posted |
| Twitter/X thread | not posted | not posted |

Two things moved, and neither is traction.

The **two downloads** are the first non-zero number this project has recorded. With nothing
posted anywhere, they are almost certainly the maintainer or a crawler — written down precisely
so that when a real distribution event happens, the delta is attributable to it.

The **three open issues** were filed on 2026-08-01 from findings made during the v14.3.0 source
ingestion. They are labelled **`documentation`**, deliberately, so they do not appear in either
threshold query below. They are self-reported maintenance notes, not field evidence, and
counting them would make the freeze trigger measure our own sprint. If a real user later
confirms one, relabel it then and it counts honestly.

Zero across the board is the point. It is the only honest starting line, and it means every later number is attributable to something specific rather than to ambient drift.

## Freeze thresholds

The freeze in [MAINTENANCE.md](MAINTENANCE.md) lifts on the first of these. Update this table weekly while the freeze is active.

| Threshold | Target | Current | As of |
|---|---|---|---|
| Distinct feature requests for one capability | 10 | 0 | 2026-08-01 |
| Confirmed reproducible bugs | 5 | 0 | 2026-08-01 |
| Days of actively monitored time | 14 | 0 | 2026-08-01 |

Both label queries were re-run on 2026-08-01 and both returned **0**, with three issues open —
which is the point of labelling them `documentation`. Verify at any time:

```bash
gh issue list --repo Krishna-Modi12/frontend-design-pro --state all --label bug         --json number -q 'length'  # 0
gh issue list --repo Krishna-Modi12/frontend-design-pro --state all --label enhancement --json number -q 'length'  # 0
```

Days-monitored stays at 0 on purpose. It measures attention — issues being read and answered —
and running a label query from a script is not that. Only the maintainer can move that row, and
so far there has been nothing filed by anyone else to answer.

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
