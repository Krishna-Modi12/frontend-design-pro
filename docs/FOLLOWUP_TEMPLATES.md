# Follow-Up Post Templates

> These are skeletons to fill in with real numbers once there's real post-launch data — nothing has launched yet (see `docs/METRICS_BASELINE.md`: 0 stars, 0 issues, 0 PRs, 0 downloads), so every bracket below is a placeholder, not a draft figure. Do not post with the brackets still in them.

---

## Day 2 post (~24 hours after launch)

Post to: a Twitter/X update, and a reply comment on the original Show HN thread.

### Twitter/X

```
24 hours in on frontend-design-pro.

[STARS] stars · [FORKS] forks · [ISSUES_OPENED] issues opened · [ISSUES_RESOLVED] resolved · [DOWNLOADS] .skill downloads

Most common question so far: [TOP_QUESTION]

Feature freeze from docs/MAINTENANCE.md: [FREEZE_STATUS]

[BIGGEST_SURPRISE]
```

Optional paragraph — include only if something genuinely needed fixing in the first 24h, omit the block entirely otherwise:

```
Already fixed: [ALREADY_FIXED]
```

### HN comment (reply on the original Show HN thread)

```
Quick update, ~24h in: [STARS] stars, [ISSUES_OPENED] issues opened ([ISSUES_RESOLVED]
resolved so far), [DOWNLOADS] downloads of the .skill archive.

The most common question has been: [TOP_QUESTION]

The feature freeze (docs/MAINTENANCE.md) is [FREEZE_STATUS] — [10 distinct requests /
5 confirmed bugs / 2 weeks monitored, whichever is relevant] hasn't been hit yet.

[BIGGEST_SURPRISE]

Thanks for the [feedback / reports] — still reading and answering everything in this
thread.
```

Optional paragraph — include only if something genuinely needed fixing in the first 24h, omit entirely otherwise:

```
One thing already fixed: [ALREADY_FIXED]
```

---

## Day 7 post (one week after launch)

Post to: a Twitter/X thread, and an update comment on the original Reddit post (r/ClaudeAI or r/webdev, whichever was used).

### Twitter/X thread

```
1/ One week of frontend-design-pro being public. Numbers, what broke, what's next.

2/ Weekly stats:

[STARS] stars ([STARS_DELTA] this week)
[FORKS] forks
[WATCHERS] watchers
[ISSUES_OPENED] issues opened total, [ISSUES_RESOLVED] resolved
[DOWNLOADS] .skill downloads

3/ Top 3 issues this week:

1. [TOP_ISSUE_1]
2. [TOP_ISSUE_2]
3. [TOP_ISSUE_3]

4/ Top 3 feature requests:

1. [TOP_REQUEST_1]
2. [TOP_REQUEST_2]
3. [TOP_REQUEST_3]

(Freeze thresholds from docs/MAINTENANCE.md: 10 distinct requests for the same
feature, or 5 confirmed bugs, lifts it. Current count against those: [FREEZE_PROGRESS])

5/ What shipped in patches this week:

[PATCHES_SHIPPED]

6/ What's next:

[WHATS_NEXT]

7/ [CLOSING_REFLECTION]

https://github.com/Krishna-Modi12/frontend-design-pro
```

### Reddit update comment (on the original post)

```
One-week update.

**Stats:** [STARS] stars ([STARS_DELTA] this week), [FORKS] forks, [ISSUES_OPENED]
issues opened / [ISSUES_RESOLVED] resolved, [DOWNLOADS] downloads.

**Top 3 issues reported:**
1. [TOP_ISSUE_1]
2. [TOP_ISSUE_2]
3. [TOP_ISSUE_3]

**Top 3 feature requests:**
1. [TOP_REQUEST_1]
2. [TOP_REQUEST_2]
3. [TOP_REQUEST_3]

**Shipped in patches this week:** [PATCHES_SHIPPED]

**What's next:** [WHATS_NEXT]

**Feature freeze status:** [FREEZE_STATUS] — see docs/MAINTENANCE.md for the exact
thresholds ([FREEZE_PROGRESS] against them so far).

[CLOSING_REFLECTION]
```

---

## Before posting either one

- Re-run the same `gh` queries `docs/METRICS_BASELINE.md` used for the pre-launch snapshot (`gh repo view … stargazerCount,forkCount,watchers`, `gh issue list --state open`, `gh pr list --state open`, `gh release view … downloadCount`) and diff against that baseline rather than estimating.
- Check the real freeze status against the three triggers in `docs/MAINTENANCE.md` (10 distinct requests for one feature / 5 confirmed bugs / 2 weeks of active monitoring) before writing `[FREEZE_STATUS]` — don't guess it.
- Confirm every bracket has been replaced. A placeholder left in a public post is worse than a post sent a few minutes late.
