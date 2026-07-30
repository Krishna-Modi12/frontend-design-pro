#!/usr/bin/env bash
# Claim this repo's commit lock for the current session.
# Optional: the pre-commit hook self-claims on first commit. Run this to claim
# up front, so a second session is blocked before it has written anything.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
. ".githooks/session-guard.sh"

ME="$(guard_identity)"
if [ -f "$LOCKFILE" ]; then
  OWNER="$(guard_read owner)"; OWNER_PID="$(guard_read pid)"
  if [ "$OWNER" = "$ME" ]; then
    printf 'Already held by you (%s).\n' "$ME"; exit 0
  fi
  if guard_alive "$OWNER_PID"; then
    printf 'Held by a LIVE session: %s (pid %s, since %s).\n' "$OWNER" "$OWNER_PID" "$(guard_read since)" >&2
    printf 'Close it, or run .githooks/session-unlock.sh if you know it is finished.\n' >&2
    exit 1
  fi
  printf 'Taking over stale lock from %s (pid %s is gone).\n' "$OWNER" "$OWNER_PID"
fi
guard_write_lock
printf 'Lock claimed:\n'; cat "$LOCKFILE"
