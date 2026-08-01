# Maintenance policy

**Status: FEATURE FREEZE.** In effect from the release that introduced this file — see the top entry in [CHANGELOG.md](CHANGELOG.md). Deliberately not version-pinned here: a policy that needs editing on every patch bump is a policy that goes stale, and the version-leak gate would fail the build for it anyway.

The pack is done. 16 skills, 76 references, 305,784 tokens of on-demand depth, 51 machine-enforced constraints, 9 release-blocking gates, one runnable demo app. Adding a 17th skill would grow the always-loaded registry for a routing target almost nobody asks for; adding a 77th reference would add depth nobody has hit the bottom of. The remaining risk to this project is not missing features. It is churn — every commit is a chance to break something that currently works.

So the default answer to "should we build X" is **no, not yet**, and the burden is on evidence.

## What lifts the freeze

Any **one** of these:

| Trigger | Threshold | Tracked by |
|---|---|---|
| Users asking for the same specific thing | **10 distinct requests** for one feature | GitHub issues labelled `enhancement` |
| Real defects reported from real use | **5 confirmed bugs** | GitHub issues labelled `bug`, confirmed reproducible |
| Time with the project actually being watched | **2 weeks** of active monitoring | Freeze began **2026-07-30**; earliest lift **2026-08-13** |

Both labels are applied automatically by the issue templates in [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE), so the count is a query rather than a judgement call:

```bash
gh issue list --state all --label enhancement --json number --jq 'length'   # toward 10
gh issue list --state all --label bug         --json number --jq 'length'   # toward 5
```

"Distinct requests" means ten people wanting the same capability, not ten issues. Three people asking for Svelte support is three; one person filing three issues about Svelte is one. "Confirmed" means reproduced — an unreproducible report does not count against the five, and closing it is not a judgement about the reporter.

"Active monitoring" means issues are being read and answered. Two weeks of silence because nobody looked does not count and does not lift anything: the clock measures attention, not elapsed time.

Counting requires something to count from, so [METRICS_BASELINE.md](METRICS_BASELINE.md) records the pre-launch state — stars, forks, issues, PRs and release downloads, all zero, with the `gh` commands to re-query them. Without a baseline, "10 requests" is a feeling.

Note what is *not* on that list: a good idea, a new library worth supporting, a competitor shipping something, or boredom. Those are the reasons packs like this rot — each one is individually reasonable and collectively fatal.

## What may still be committed during the freeze

- **README and doc typo fixes.** Free.
- **Broken link fixes.** Free, and the link checker should be run before each one.
- **Critical bug fixes** — but only for a bug someone actually reported, and only with the gate chain green.
- **Security fixes.** Exempt from the "someone reported it" requirement.

That is the whole list.

## What is forbidden during the freeze

- New skills, new references, new examples.
- New constraints, new gates.
- Any change to `skills/*/SKILL.md` or `core/*.md` that is not tied to a labelled `bug` issue. Those files are the product; editing them on a hunch is the failure mode this policy exists to stop.
- Refactors "while we're in there". Dependency bumps without a reported reason. Rewording the anti-slop wall because a better phrasing occurred to someone.

Each of those is individually reasonable, which is exactly why the list has to be written down.

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

## Unattended writers

A freeze is a policy, and a policy only binds the actors who read it. Across the three sprints leading up to the freeze, files kept appearing in this repo that no one in the active session had written: `demo/showcase/`, `skills/agent-ops/`, `docs/METRICS_BASELINE.md`, `docs/RESPONSE_TEMPLATES.md`, `docs/FAQ.md`, `docs/FOLLOWUP_TEMPLATES.md`, and the issue templates in `.github/`. Commits and tags were pushed that the session doing the work had not made.

**Cause, established rather than assumed:** two Claude Code sessions were running against this same working directory at the same time. Every commit here carries a `Co-Authored-By` trailer naming the model that made it, and the history splits cleanly along it — one set from an Opus 5 session, another from a Sonnet 5 session, interleaved minutes apart. Ruled out by inspection: no git hooks (`.git/hooks/` holds only samples), no embedded repositories, no scheduled task invoking git/node/python, no script in the repo that shells out to `git commit`/`push`, and no workflow that writes to the repo — `release.yml` holds `contents: write` but uses it to publish a release and attach the archive, never to commit.

**Why this is worse than it sounds.** Neither session was malicious and both produced good work, but `git add -A` does not know which agent authored a file:

- Commit `695f0f2` swept one session's mid-edit working tree into the other's release commit, and pushed a `v14.2.0` tag while verification was still in progress — publishing an artifact whose showcase carried three `TS-01-AST` violations and an unreachable reference, all of which were being fixed at that moment. `v14.2.1` exists only to correct that.
- Commit `dbf00b1` did the same in reverse: a one-line launch-kit fix silently carried three `.github/` templates the other session had just written, published under a commit message that did not mention them. They turned out to be good. Nobody had read them.

**Rules while any second writer might be active:**

1. **One session per working directory.** This is the whole mitigation. Everything below is damage limitation for when it is violated.
2. **Never `git add -A` on a repo another agent may be touching.** Stage explicit paths. The cost of typing them is one minute; the cost of not doing it was a bad release.
3. **`git fetch` and check `git log --oneline -1` immediately before every commit, tag, and push.** A tag is the expensive one — moving a published tag is not a normal operation.
4. **Read every file you are about to commit.** If a `git status` line is a file you did not write, read it or unstage it. Publishing unread content is publishing content you cannot vouch for.
5. **Prune agent worktree branches.** Three `worktree-agent-*` branches survived their deleted worktrees; they held no unique commits and were removed. `.claude/` is gitignored so the worktrees themselves cannot be committed again.

### The guard that enforces rule 1

Rules are advice. `.githooks/pre-commit` is the part that actually blocks:

```bash
git config core.hooksPath .githooks     # once per clone
```

Git config is per-clone by design and cannot be committed, so this line is the install step. Without it the hook sits inert in the repo.

**Behaviour.** The first session to commit claims `.claude/SESSION_LOCK` automatically — self-claiming, because a guard that needs someone to remember a setup command never engages. Commits from the owning session pass silently. A commit from a *different* session whose process is still alive is blocked, with the owner, its pid, and the three ways out. If the owning process is gone the lock is debris, not a claim, and the next commit takes it over and says so.

**Identity.** Keyed on `CLAUDE_CODE_SESSION_ID`, a stable per-session UUID. Two details that make or break this:

- The variable is `CLAUDE_CODE_SESSION_ID`, **not** `CLAUDE_SESSION_ID` — the latter does not exist. Keying on it would leave both sessions resolving to the same fallback string, and the guard would pass everything while appearing to work.
- It cannot key on `git config user.name`. Both colliding sessions committed as the same git identity; that is precisely the case it has to catch.

**Liveness.** `kill -0` in Git Bash operates on MSYS pids, not the native Windows pids `CLAUDE_PID` reports, and silently calls every live Windows process dead — which would turn every real lock into a stale one. The guard uses `tasklist` on Windows and `kill -0` elsewhere.

**Escape hatch.** `FDP_ALLOW_CONCURRENT=1 git commit …` skips the check for one commit. It exists because a guard that can block a permitted typo fix is worse than the collision it prevents. If you use it, stage explicit paths.

**Bias.** Fail closed only on a positively identified live foreign owner; fail open on anything unexpected — a missing hook file, an unreadable lock, a repo it cannot locate. CI is unaffected: a clean runner has no `core.hooksPath` set and no lockfile.

The lockfile itself is runtime state under the already-gitignored `.claude/`, so it is never committed. The scripts live in `.githooks/` for the same reason inverted: anything under `.claude/` would be untracked and absent from a fresh clone.

All eight branches of this were tested by watching them behave before the hook was trusted — including the one that matters, a foreign live lock sharing this session's git identity, which blocked as intended.

### The hole that guard had, and the third incident

It happened again on 2026-08-01, and the guard above could not have stopped it. Commit `30d7a90` swept 22 files a second session had written and had not yet committed, then `8c009d2` bumped, tagged and pushed the release — all while the session that authored those 22 files was still working and had not been asked.

**Why the guard was silent.** It answers exactly one question: *is the committer the lock owner?* The owner is waved through unconditionally. The sweeping session **held the lock**, so no check applied to it. The guard was built to stop a foreign session from committing; the failure mode is the lock holder committing a foreign session's files, which is the mirror image and was never covered.

**What was rejected, with the measurement.** The obvious fix — detect a second live session by counting Claude Code processes — does not work, and the numbers are recorded here so nobody spends an afternoon rediscovering it. One session spawns **11 `claude.exe` processes**, of which **2** have no `claude.exe` parent. A threshold of "more than one process" blocks every commit; "more than one root process" false-positives on a single session. Nothing readable from outside a process identifies which session it belongs to — `CLAUDE_CODE_SESSION_ID` lives in its environment, not in anything the hook can query.

**What was implemented.** Git records no authorship for a working-tree change, so the hook cannot ask *"did I write this?"* It asks the answerable question instead: **five or more newly-added files (`--diff-filter=A`) block the commit and print the full list**, requiring `FDP_ALLOW_CONCURRENT=1` to proceed. That turns rule 4 above — *read every file you are about to commit* — from advice into a step you cannot skip by accident. It fires for the lock owner too, which is the entire point.

Only added files count. Editing tracked files is ordinary work, and gating it would make the hook fire on every normal commit, which is how guards end up disabled.

**Its limits, stated rather than discovered later.** A sweep of four or fewer new files passes silently — `dbf00b1`, which carried three unread `.github/` templates, would still get through. It also cannot distinguish a legitimate 22-file feature commit from a 22-file sweep; both stop and show you the list, and that is the intended cost. This narrows the failure, it does not close it. **Rule 1 — one session per working directory — is still the only real mitigation.**

Five branches were tested by watching them behave: four new files commits cleanly; five blocks and lists them; the escape hatch overrides; a foreign live lock still blocks; a stale lock still reclaims.

## Being a maintainer instead of a builder

The work that actually matters now is not in this repo:

- Answer the issues. A question answered in an hour is worth more than a feature shipped in a week.
- Watch for the pattern. One person asking for something is noise; ten is a signal, and the table above is how you tell them apart without arguing about it.
- Let the gates do the arguing. When someone proposes a change, the question is not whether it sounds good — it is whether it passes, and what it costs the always-loaded budget.

The pack's whole claim is that it is verified rather than asserted. A freeze is what that claim looks like once you believe it.
