# Review protocol

The default posture on this repo is **judge before building**. It has 19 skills,
101 references and a gate chain that is green almost all of the time — so the
failure mode is no longer "the build breaks", it is "everything passes and the
docs say something untrue". Every release in this project's history that had to
be corrected was corrected for prose, not for code.

This file is tracked on purpose. `.claude/` is gitignored, so a protocol that
lives there cannot reach a second session working the same tree.

---

## 1. Spot check — five minutes, before touching anything

```bash
python scripts/build_release.py --dry-run 2>&1 | tail -20   # 11 gates
git status --short | wc -l
git fetch origin && git log --oneline -1 origin/main         # are you even current?
```

- **Gates red → stop.** Fix that before anything else.
- **Tree dirty → find out whose.** `git diff origin/main --stat` tells you what is
  actually unmerged, which is usually far less than `git status` implies. A tree
  can show 80 changed paths and contain zero unmerged content when the branch is
  simply behind.
- **`_ingestion/` or any scratch file inside the repo → move it out.** Stage 1's
  version-leak scan is `ROOT.rglob("*")`: a raw filesystem walk that does not read
  `.gitignore`. Any untracked file containing the current version string fails
  pre-flight, and a directory named after the version fails it by its own name.

Then measure the newest skill. Under ~1,000 tokens with fewer than 3 references
is a depth flag, not a pass.

## 2. Where drift actually hides

Counts and token figures are hardcoded across ~30 documents and go stale
silently. Re-derive from a green `--dry-run`; never hand-edit. Sweep `README.md`,
`docs/ARCHITECTURE.md`, `docs/FAQ.md`, `docs/USAGE.md`, `docs/INSTALL.md`,
`docs/LAUNCH_*.md`, `docs/MAINTENANCE.md`, `install/*/README.md`,
`skills/agent-ops/references/token-optimization.md`, `metadata.json` — **and
`CLAUDE.md` and `AGENT_SYSTEM_PROMPT.md`**, which are the two most-read files in
the repo and are on nobody's sweep list.

Leave `docs/CHANGELOG.md` entries for shipped versions and every
`docs/RELEASE_NOTES-*` alone. They were true when cut; rewriting them falsifies
the record. An **unreleased** top entry is fair game — appending to it is how you
document work that has not shipped yet.

The single highest-value check: **does the newest release actually exist?**

```bash
gh release list --limit 3
grep -n "^## What's new in" README.md
```

If `README.md` announces a version with no published release, the repo's front
page is advertising a build nobody can download. No gate catches this — Stage 6
only checks that the archive README matches the tag *being built*.

## 3. What the gates cannot see

Assume nothing is checked unless you can name the gate that checks it.

- **No gate renders anything.** A stylesheet that silently did nothing, a page
  that scrolled 73px sideways at 390px and a chart hidden from screen readers all
  passed a green chain. `npm run demos:verify` is the check for that class.
- **No gate reads prose.** Every figure in every `.md` is unverified.
- **No gate reads comments.** Every suite parses examples as TypeScript, so
  prescribed code inside a `/* … */` or `// --- Required CSS ---` block — code the
  example explicitly tells the reader to copy — is invisible to all 59
  constraints. Grep comment blocks by hand when you touch one.
- **Gate 8b counts `bad-*.tsx`.** It globs `examples/*.tsx`, so "every skill has an
  example" is enforced and "every skill has a **gold**" is not.

## 4. Taste criteria

Verify the anti-slop wall is *enforced*, not merely stated. Scope every grep to
golds — the anti-examples violate these on purpose, and a check that always
returns 30 hits gets muted:

```bash
git grep -nE '#[0-9a-fA-F]{6}\b' -- 'skills/*/examples/good-*.tsx'
git grep -n  'min-h-screen'      -- 'skills/*/examples/good-*.tsx'
git grep -nE 'ease-in[^-]'       -- 'skills/*/examples/good-*.tsx'   # exits only
```

Raw hex has exactly three sanctioned exceptions — brand assets, React Native
`StyleSheet`, three.js/WebGL materials — and each must carry its reason at the
site. Anything else is a violation.

Then judge, which no grep does for you:

- **Motion** — does it communicate direction, hierarchy or causality, or does it
  merely occur? Entrances `ease-out`; `ease-in` only for exits.
- **Colour** — one purposeful accent per aesthetic, not a rainbow. Check
  *prescribed defaults* hardest: a palette in a reference propagates to every
  product that follows it.
- **Type** — display faces chosen for personality, `text-balance` on headings,
  `tabular-nums` on anything numeric.
- **Layout** — asymmetric beats symmetric; whitespace is structural; no cards
  inside cards.
- **The portfolio test** — pick a gold at random. Would you screenshot it? If not,
  the skill needs a better example, not another reference.

## 5. Severity and what it earns

| Severity | Examples | Action |
|---|---|---|
| **Critical** | Gate failure, broken archive, leaked secret, a shipped recipe with an injection hole | Stop. Fix now. Hotfix release |
| **High** | Stale figures, keyword collisions, a skill with no gold, copy describing an unreleased build | Next patch |
| **Medium** | Shallow skill, missing reference, competitor gap | Stage in `_ingestion/` **outside the repo**, merge next minor |
| **Low** | Typo, slow gate, a constraint with a narrow evasion | Batch |

Before proposing anything new, in order: does a user need it (not "would it be
cool")? Can an existing skill absorb it? Does it fit the budget — skill ≤3,000
tokens, ≤8,000 with deps? Does it make the registry harder to navigate? Any *no*
means document the idea and wait for a real request. `docs/MAINTENANCE.md` holds
the freeze and its lift thresholds.

## 6. Hard boundaries

- No commits without green gates.
- Never `git add -A`. Stage explicit paths. Check `.claude/SESSION_LOCK` and
  `git log --oneline -1 origin/main` before every commit, tag and push.
- No version bump without artifact verification — download the published
  `.skill`, unzip it, confirm it matches the tree.
- No launch-copy change without a character count: HN title ≤80, tweets ≤280.

## 7. End every session with a review card

```
## Review Card — [date]

### Health
| Gates | Live-doc drift | Newest skill | Status |

### Findings
| # | File | Issue | Severity | Fix |

### Checked and cleared
(so the next session does not re-audit them)

### Next action
One sentence. One fix — not a sprint.
```

The "checked and cleared" section is the one people skip and the one that
compounds. A finding that was investigated and dismissed costs the same to
re-investigate as it did the first time.

## 8. Done

Not "50 skills". Done is: a first-time user generates a portfolio-worthy page in
five minutes; every generated component passes `tsc --strict` *and* looks
designed rather than assembled; the anti-slop wall is complete enough that slop
is statistically unlikely; and someone else says *"I use this because it makes my
agent produce better UI than I would write myself."*
