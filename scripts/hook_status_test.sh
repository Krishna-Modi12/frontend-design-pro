#!/usr/bin/env bash
# Fixtures for `guard_dirty_outside_commit` — the pre-commit hook's "dirty in
# this tree and NOT in this commit" listing.
#
# Why this exists: that listing shipped as a hand-written alternation of three
# porcelain spellings and saw 3 of the 11 dirty states. The eight it missed were
# not exotic — `MM` (staged, then edited again) is the single most misleading
# state git can report, because the file shows green in `git status` while the
# commit carries only the older half. Nothing tested the hook, so the gap was
# invisible until a reviewer read the regex.
#
# The test drives a real throwaway repository into each state and asserts BOTH
# directions: every dirty path is listed, and every fully-staged path is not. A
# widening that listed `M ` would make the block fire on every ordinary commit
# and get it switched off, so the negative cases matter as much as the positive.
#
#   bash scripts/hook_status_test.sh      # or: npm run hooks:test
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d 2>/dev/null || mktemp -d -t fdphook)"
trap 'rm -rf "$TMP"' EXIT

PASS=0; FAIL=0
fail() { FAIL=$((FAIL + 1)); printf '  x %s\n' "$1"; }
pass() { PASS=$((PASS + 1)); printf '  . %s\n' "$1"; }

mkdir -p "$TMP/repo/.githooks"
cp "$ROOT/.githooks/session-guard.sh" "$TMP/repo/.githooks/"
cd "$TMP/repo" || exit 1
git init -q .
git config user.email t@example.invalid
git config user.name  t
git config core.autocrlf false   # keep the fixture output free of CRLF warnings

# Baseline: eight tracked files, committed clean.
for f in staged_clean staged_then_edited staged_then_deleted edited_unstaged \
         deleted_unstaged renamed_then_edited staged_delete untouched; do
  printf 'v1\n' > "$f"
done
git add -A >/dev/null 2>&1
git commit -qm base >/dev/null 2>&1

# --- drive each porcelain state ------------------------------------------
printf 'v2\n' > staged_clean;        git add staged_clean          # M
printf 'v2\n' > staged_then_edited;  git add staged_then_edited
printf 'v3\n' > staged_then_edited                                 # MM
printf 'v2\n' > staged_then_deleted; git add staged_then_deleted
rm -f staged_then_deleted                                          # MD
printf 'v2\n' > edited_unstaged                                    #  M
rm -f deleted_unstaged                                             #  D
git mv renamed_then_edited renamed_new >/dev/null 2>&1
printf 'v2\n' > renamed_new                                        # RM
git rm -q staged_delete                                            # D
printf 'new\n' > added_clean;        git add added_clean           # A
printf 'new\n' > added_then_edited;  git add added_then_edited
printf 'newer\n' > added_then_edited                               # AM
printf 'x\n' > untracked_file                                      # ??

. ./.githooks/session-guard.sh
LISTED="$(guard_dirty_outside_commit)"

printf '\n[HOOK] porcelain states seen by the guard:\n'
git status --porcelain | sed 's/^/      /'
printf '\n[HOOK] paths the hook would list:\n'
printf '%s\n' "$LISTED" | grep -c . >/dev/null && printf '%s\n' "$LISTED" | sed 's/^/      /'
printf '\n[HOOK] assertions\n'

listed() { printf '%s\n' "$LISTED" | grep -qxF "$1"; }

# MUST be listed — the worktree still differs from what is being committed.
for c in "staged_then_edited|MM staged, then edited again — reads as committed, is not" \
         "staged_then_deleted|MD staged, then deleted" \
         "edited_unstaged| M edited, never staged" \
         "deleted_unstaged| D deleted, never staged" \
         "renamed_then_edited -> renamed_new|RM renamed, then edited — porcelain reports the PAIR, and the hook prints it that way on purpose: for a human reading the block, which file moved where is the useful half" \
         "added_then_edited|AM added, then edited again" \
         "untracked_file|?? untracked"; do
  p="${c%%|*}"; why="${c#*|}"
  if listed "$p"; then pass "listed   $p  ($why)"; else fail "NOT listed $p  ($why)"; fi
done

# MUST NOT be listed — fully staged, worktree matches the commit. A guard that
# named these would fire on every ordinary commit and be turned off.
for c in "staged_clean|M  staged, worktree clean" \
         "added_clean|A  new file, fully staged" \
         "staged_delete|D  deletion, fully staged" \
         "untouched|not dirty at all"; do
  p="${c%%|*}"; why="${c#*|}"
  if listed "$p"; then fail "listed     $p  (should be silent: $why)"; else pass "silent   $p  ($why)"; fi
done

printf '\n[HOOK] %s fixture(s) passed, %s failed\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ] || exit 1
