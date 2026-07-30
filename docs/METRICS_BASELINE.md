# Metrics Baseline — pre-launch

Snapshot taken before any public distribution (no HN/Twitter/Reddit posts yet). Every number here is a real `gh` query result, not an estimate.

**Taken:** 2026-07-30, via `gh repo view` / `gh issue list` / `gh pr list` / `gh release view v14.2.1`.

| Metric | Value |
|---|---|
| Stars | 0 |
| Forks | 0 |
| Watchers | 0 |
| Open issues | 0 |
| Open PRs | 0 |
| `v14.2.1` release published | 2026-07-29T06:23:16Z |
| `frontend-design-pro-v14.2.1.skill` downloads | 0 |

## Re-checking

```bash
gh repo view Krishna-Modi12/frontend-design-pro --json stargazerCount,forkCount,watchers -q '{stars: .stargazerCount, forks: .forkCount, watchers: .watchers.totalCount}'
gh issue list --repo Krishna-Modi12/frontend-design-pro --state open --json number -q 'length'
gh pr list --repo Krishna-Modi12/frontend-design-pro --state open --json number -q 'length'
gh release view v14.2.1 --repo Krishna-Modi12/frontend-design-pro --json assets -q '.assets[] | "\(.name): \(.downloadCount)"'
```
