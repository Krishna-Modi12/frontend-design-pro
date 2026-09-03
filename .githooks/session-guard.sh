#!/usr/bin/env bash
# Shared logic for the concurrent-session guard. Sourced by pre-commit and by
# session-lock.sh / session-unlock.sh so there is exactly one implementation.
#
# WHY THIS EXISTS
# Two Claude Code sessions ran against this working directory at the same time
# and cost a bad release: one swept the other's mid-edit files into a release
# commit and pushed a tag while verification was still running. See
# docs/MAINTENANCE.md -> "Unattended writers".
#
# WHY IT LIVES HERE AND NOT IN .claude/
# `.claude/` is gitignored, so anything placed there is untracked and absent
# from a fresh clone. The scripts are tracked here; only the runtime lockfile
# lives under `.claude/`, which is exactly what should not be committed.

LOCKFILE=".claude/SESSION_LOCK"

# A session's identity. CLAUDE_CODE_SESSION_ID is the real variable name — it is
# a stable UUID for the life of one session and differs between concurrent ones.
# (CLAUDE_SESSION_ID, without CODE, does not exist; keying on it would make this
# whole guard a silent no-op, and keying on git user.name is worse still, because
# concurrent sessions share one git identity.)
guard_identity() {
  if [ -n "${CLAUDE_CODE_SESSION_ID:-}" ]; then
    printf 'claude:%s' "$CLAUDE_CODE_SESSION_ID"
  else
    printf 'manual:%s' "$(git config user.email 2>/dev/null || printf 'unknown')"
  fi
}

guard_pid() {
  printf '%s' "${CLAUDE_PID:-$$}"
}

# Is a pid still running? MSYS/Git-Bash `kill -0` operates on MSYS pids, not the
# native Windows pids CLAUDE_PID reports, so it silently reports every Windows
# pid as dead. Use tasklist there.
guard_alive() {
  [ -n "$1" ] || return 1
  case "$(uname -s 2>/dev/null)" in
    MINGW*|MSYS*|CYGWIN*) tasklist //FI "PID eq $1" 2>/dev/null | grep -q "\b$1\b" ;;
    *)                    kill -0 "$1" 2>/dev/null ;;
  esac
}

guard_write_lock() {
  mkdir -p "$(dirname "$LOCKFILE")" 2>/dev/null || return 0
  {
    printf 'owner=%s\n' "$(guard_identity)"
    printf 'pid=%s\n'   "$(guard_pid)"
    printf 'since=%s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    printf 'cwd=%s\n'   "$(pwd)"
  } > "$LOCKFILE"
}

guard_read() { sed -n "s/^$1=//p" "$LOCKFILE" 2>/dev/null | head -1; }

# Every path this tree is dirty in that the pending commit does NOT fully
# capture. The rule is one column wide: in `git status --porcelain` X is the
# index and Y is the working tree, so a non-blank Y means the file on disk still
# differs from what is about to be committed. `M ` (staged, tree clean) is
# excluded by that rule and `MM` (staged, then edited again) is not — and `MM`
# is the whole point, because it reads as committed and is not.
#
# It lives here rather than inline in pre-commit so the hook and
# `scripts/hook_status_test.sh` read one definition. The first version was
# written inline as `^( M|\?\?|( )D)` and saw 3 of the 11 dirty states: `MM`,
# `AM`, `RM`, `MD`, `AD`, ` T`, `MT` and `UU` all passed it silently, including
# ` T` (an unstaged typechange), which is not even a partially-staged case.
# Match the column, never a list of spellings.
guard_dirty_outside_commit() {
  git status --porcelain 2>/dev/null | grep -E '^.[^ ]' | sed 's/^...//' || true
}
