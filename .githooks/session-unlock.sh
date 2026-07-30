#!/usr/bin/env bash
# Release this repo's commit lock.
# Safe to run any time: the lock is a convenience guard, not a consistency
# mechanism, and the pre-commit hook re-claims on the next commit.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
. ".githooks/session-guard.sh"

if [ ! -f "$LOCKFILE" ]; then
  printf 'No lock held.\n'; exit 0
fi
OWNER="$(guard_read owner)"; OWNER_PID="$(guard_read pid)"
if [ "$OWNER" != "$(guard_identity)" ] && guard_alive "$OWNER_PID"; then
  printf 'WARNING: releasing a lock held by a LIVE session: %s (pid %s).\n' "$OWNER" "$OWNER_PID" >&2
  printf 'Only do this if you are certain that session is finished.\n' >&2
fi
rm -f "$LOCKFILE"
printf 'Lock released (was %s).\n' "$OWNER"
