#!/usr/bin/env bash
# frontend-design-pro — native adapter installer.
#
# Copies one agent's native rules/instructions file into YOUR project, so the
# agent routes through the registry without you hand-writing the file.
#
# It does NOT install the pack itself. Unzip the .skill archive first — the
# adapters reference `frontend-design-pro/SKILL.md`, so the pack has to be
# present at that path relative to the project root:
#
#   unzip frontend-design-pro-v*.skill -d ./
#
# Usage:
#   bash setup.sh                        auto-detect the agent from the target dir
#   bash setup.sh cursor                 install one adapter
#   bash setup.sh cursor --target ../app install into a directory other than $PWD
#   bash setup.sh --list                 every adapter and how it installs
#   bash setup.sh cursor --dry-run       print what would be written, write nothing
#   bash setup.sh cursor --force         overwrite files that already exist
#
# Nothing is overwritten without --force, because these are filenames other
# tools legitimately own: a project may already have a .cursor/rules/ entry or
# a CONVENTIONS.md, and silently replacing one to save a prompt is not a trade
# an installer gets to make.
set -euo pipefail

PACK_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
INSTALL_DIR="$PACK_ROOT/install"
TARGET="$PWD"
AGENT=""
FORCE=0
DRY_RUN=0

# Adapters whose payload is a file the installer can safely drop into a project.
# Everything else needs a web UI, a JSON merge, or a decision only the user can
# make, so those print their card instead of pretending to automate it.
AUTO_AGENTS=" cursor copilot windsurf aider continue "

c_ok=""; c_no=""; c_warn=""; c_dim=""; c_end=""
if [ -t 1 ]; then
  c_ok=$'\033[92m'; c_no=$'\033[91m'; c_warn=$'\033[93m'; c_dim=$'\033[2m'; c_end=$'\033[0m'
fi
ok()   { printf '%s  ok %s%s\n'   "$c_ok"   "$1" "$c_end"; }
bad()  { printf '%s  !! %s%s\n'   "$c_no"   "$1" "$c_end" >&2; }
note() { printf '%s     %s%s\n'   "$c_dim"  "$1" "$c_end"; }
warn() { printf '%s  -- %s%s\n'   "$c_warn" "$1" "$c_end"; }

die() { bad "$1"; exit 1; }

# The header comment block IS the help text. Printed by walking from line 2 to
# the first non-comment line rather than a fixed range, so editing the header
# cannot silently start leaking code into --help.
usage() {
  awk 'NR==1 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "${BASH_SOURCE[0]}"
}

# Every directory under install/ is an adapter. Derived, not hardcoded, so this
# cannot drift out of sync with what actually ships.
all_agents() {
  [ -d "$INSTALL_DIR" ] || die "install/ not found next to setup.sh (looked in $INSTALL_DIR)"
  find "$INSTALL_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort
}

is_auto() { case "$AUTO_AGENTS" in *" $1 "*) return 0 ;; *) return 1 ;; esac; }

# Detect from marker files the agent itself creates. Returns every match rather
# than the first: two markers means the answer is genuinely ambiguous, and
# guessing would write a file into a project on the strength of a coin flip.
detect_agents() {
  local d="$1" found=""
  if [ -d "$d/.cursor" ] || [ -f "$d/.cursorrules" ];                       then found="$found cursor";   fi
  if [ -d "$d/.windsurf" ] || [ -f "$d/.windsurfrules" ];                   then found="$found windsurf"; fi
  if [ -d "$d/.continue" ];                                                 then found="$found continue"; fi
  if [ -f "$d/.aider.conf.yml" ] || [ -f "$d/.aider.conf.yaml" ] \
     || [ -f "$d/.aider.input.history" ];                                   then found="$found aider";    fi
  if [ -f "$d/.github/copilot-instructions.md" ] || [ -d "$d/.github/instructions" ]; then found="$found copilot"; fi
  printf '%s' "${found# }"
}

list_agents() {
  printf '\nAdapters in install/:\n\n'
  local a
  for a in $(all_agents); do
    if is_auto "$a"; then
      printf '  %-10s bash setup.sh %s\n' "$a" "$a"
    else
      printf '  %-10s %smanual — see install/%s/README.md%s\n' "$a" "$c_dim" "$a" "$c_end"
    fi
  done
  printf '\nCompatibility matrix: docs/AGENT_COMPATIBILITY.md\n'
}

install_agent() {
  local agent="$1" src="$INSTALL_DIR/$1"
  [ -d "$src" ] || die "no adapter for '$agent' — run: bash setup.sh --list"

  if ! is_auto "$agent"; then
    printf '\n%s needs manual setup — there is no file to drop in.\n\n' "$agent"
    note "steps: install/$agent/README.md"
    return 0
  fi

  local copied=0 skipped=0 rel dest
  # Everything under install/<agent>/ is laid out exactly as it should appear at
  # the project root. README.md is the install card, not payload.
  while IFS= read -r f; do
    rel="${f#"$src/"}"
    [ "$rel" = "README.md" ] && continue
    dest="$TARGET/$rel"

    if [ -e "$dest" ] && [ "$FORCE" -eq 0 ]; then
      warn "exists, left alone: $rel"
      skipped=$((skipped + 1))
      continue
    fi
    if [ "$DRY_RUN" -eq 1 ]; then
      ok "would write: $rel"
      copied=$((copied + 1))
      continue
    fi
    mkdir -p "$(dirname "$dest")"
    cp "$f" "$dest"
    ok "wrote: $rel"
    copied=$((copied + 1))
  done < <(find "$src" -type f | sort)

  if [ "$skipped" -gt 0 ] && [ "$copied" -eq 0 ]; then
    printf '\nNothing written — every target already exists. Re-run with --force to replace them.\n'
    return 0
  fi
  [ "$skipped" -gt 0 ] && note "$skipped file(s) skipped; --force replaces them"

  if [ "$DRY_RUN" -eq 1 ]; then
    printf '\nDry run — nothing was written.\n'
    return 0
  fi

  printf '\nNext: put the pack where the adapter expects it, if it is not there already.\n\n'
  note "unzip frontend-design-pro-v*.skill -d $TARGET/"
  printf '\nThe adapter references frontend-design-pro/SKILL.md relative to the project\n'
  printf 'root, so that unzip has to land beside the file just written.\n\n'
  note "detail + troubleshooting: install/$agent/README.md"
}

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)  usage; exit 0 ;;
    -l|--list)  list_agents; exit 0 ;;
    --force)    FORCE=1 ;;
    --dry-run)  DRY_RUN=1 ;;
    --target)   [ $# -ge 2 ] || die "--target needs a directory"; TARGET="$2"; shift ;;
    --target=*) TARGET="${1#--target=}" ;;
    -*)         die "unknown option: $1 (try --help)" ;;
    *)          [ -z "$AGENT" ] || die "more than one agent given: '$AGENT' and '$1'"; AGENT="$1" ;;
  esac
  shift
done

[ -d "$TARGET" ] || die "target is not a directory: $TARGET"
TARGET="$(cd "$TARGET" && pwd -P)"

# The footgun this guard exists for: running `bash setup.sh` from inside the
# pack itself. This repo contains a .github/ directory, so detection would
# match copilot and write an adapter into the pack rather than into a project.
if [ "$TARGET" = "$PACK_ROOT" ]; then
  bad "target is the pack directory itself: $TARGET"
  note "run this from your project, or pass one:"
  note "  cd /path/to/your/project && bash $PACK_ROOT/setup.sh"
  note "  bash setup.sh --target /path/to/your/project"
  exit 1
fi

if [ -z "$AGENT" ]; then
  matches="$(detect_agents "$TARGET")"
  count=$(printf '%s' "$matches" | wc -w | tr -d ' ')
  case "$count" in
    1) AGENT="$matches"; printf 'Detected: %s  %s(in %s)%s\n' "$AGENT" "$c_dim" "$TARGET" "$c_end" ;;
    0) printf 'No agent detected in %s — nothing here identifies one.\n\n' "$TARGET"
       list_agents
       exit 1 ;;
    *) printf 'Ambiguous — markers for more than one agent in %s: %s\n\n' "$TARGET" "$matches"
       printf 'Name the one you want rather than letting this guess:\n\n'
       for a in $matches; do note "bash setup.sh $a"; done
       exit 1 ;;
  esac
fi

install_agent "$AGENT"
