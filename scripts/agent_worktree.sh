#!/usr/bin/env bash
# Isolated git worktree per agent task, so parallel agents never share a working tree.
#
#   scripts/agent_worktree.sh new <task-name> [base-ref]   # default base: origin/master
#   scripts/agent_worktree.sh list
#   scripts/agent_worktree.sh sync-main                    # fast-forward main checkout when clean
#   scripts/agent_worktree.sh land <task-name>             # verify clean + null build_config, rebase, push, rm & sync-main
#   scripts/agent_worktree.sh rm <task-name>               # refuses if there is uncommitted work; syncs main checkout
#
# Creates  $AGENT_WORKTREE_ROOT/<task-name>  (default: <repo>/../ready_apologia-worktrees)
# on a new branch  agent/<task-name>, ready to build:
#   - node_modules is HARD-LINKED from the main checkout (fast, no extra disk). Do not symlink it:
#     Astro/Vite resolves the real path and the build fails.
#   - .env is copied if present (gitignored, so a fresh worktree would not have it).
set -euo pipefail

MAIN="$(git -C "$(dirname "$0")/.." worktree list --porcelain | awk 'NR==1{print $2}')"
ROOT="${AGENT_WORKTREE_ROOT:-$(dirname "$MAIN")/ready_apologia-worktrees}"

die() { echo "error: $*" >&2; exit 1; }
valid_name() { [[ "$1" =~ ^[a-z0-9][a-z0-9._-]*$ ]] || die "task name must be lowercase [a-z0-9._-], got '$1'"; }

require_worktree() {
  local dir="$1"
  [ -d "$dir" ] || die "no worktree at $dir"
}

assert_clean_worktree() {
  local dir="$1"
  if [ -n "$(git -C "$dir" status --porcelain --untracked-files=normal -- . ':!node_modules')" ]; then
    die "$dir has uncommitted changes; commit or discard them first"
  fi
}

assert_prod_build_config() {
  local cfg="$1/src/utils/build_config.js"
  [ -f "$cfg" ] || return 0
  grep -qE '^\s*export const BUILD_BOOKS\s*=\s*null\b' "$cfg" || die "$cfg: BUILD_BOOKS must be reset to null before landing"
  grep -qE '^\s*export const BUILD_SURAHS\s*=\s*null\b' "$cfg" || die "$cfg: BUILD_SURAHS must be reset to null before landing"
}

sync_main() {
  git -C "$MAIN" fetch --quiet origin
  local cur
  cur="$(git -C "$MAIN" rev-parse --abbrev-ref HEAD)"
  if [ "$cur" = "master" ] && [ -z "$(git -C "$MAIN" status --porcelain --untracked-files=normal -- . ':!node_modules')" ]; then
    if git -C "$MAIN" merge --ff-only origin/master >/dev/null 2>&1; then
      echo "synced main checkout $MAIN (master -> $(git -C "$MAIN" rev-parse --short HEAD))"
    else
      echo "warning: could not fast-forward $MAIN to origin/master; resolve manually" >&2
    fi
  else
    echo "warning: $MAIN is not clean on master (branch=$cur); skipped syncing main checkout" >&2
  fi
}

rm_worktree() {
  local name="$1"
  local dir="$ROOT/$name"
  local branch="agent/$name"
  require_worktree "$dir"
  assert_clean_worktree "$dir"
  cd "$MAIN"
  rm -rf "$dir/node_modules" "$dir/dist" "$dir/.astro"
  git -C "$MAIN" worktree remove "$dir"
  if git -C "$MAIN" branch --merged origin/master | grep -qx "  $branch"; then
    git -C "$MAIN" branch -d "$branch" >/dev/null && echo "deleted merged branch $branch"
  else
    echo "kept branch $branch (not merged into origin/master)"
  fi
  echo "removed $dir"
  sync_main
}

land_worktree() {
  local name="$1"
  local dir="$ROOT/$name"
  local branch="agent/$name"
  require_worktree "$dir"
  assert_clean_worktree "$dir"
  assert_prod_build_config "$dir"
  git -C "$dir" fetch --quiet origin
  local before after
  before="$(git -C "$dir" rev-parse HEAD)"
  git -C "$dir" rebase origin/master
  after="$(git -C "$dir" rev-parse HEAD)"
  if [ "$before" != "$after" ]; then
    die "rebased $branch onto newer origin/master; re-run build/checks in $dir, then re-run: $0 land $name"
  fi
  git -C "$dir" push origin HEAD:master
  rm_worktree "$name"
}

cmd="${1:-}"; shift || true
case "$cmd" in
  new)
    name="${1:-}"; [ -n "$name" ] || die "usage: $0 new <task-name> [base-ref]"
    valid_name "$name"
    base="${2:-origin/master}"
    dir="$ROOT/$name"; branch="agent/$name"
    [ -e "$dir" ] && die "$dir already exists (pick another name, or: $0 rm $name)"
    git -C "$MAIN" fetch --quiet origin
    mkdir -p "$ROOT"
    git -C "$MAIN" worktree add --quiet -b "$branch" "$dir" "$base"
    if [ -d "$MAIN/node_modules" ]; then
      cp -al "$MAIN/node_modules" "$dir/node_modules" 2>/dev/null || cp -a "$MAIN/node_modules" "$dir/node_modules"
    else
      echo "warning: no node_modules in $MAIN; run 'npm install' (or yarn) inside $dir" >&2
    fi
    [ -f "$MAIN/.env" ] && cp "$MAIN/.env" "$dir/.env"
    echo "worktree: $dir"
    echo "branch:   $branch (from $base)"
    echo "Run every command as:  cd $dir && <command>"
    ;;
  list)
    git -C "$MAIN" worktree list
    ;;
  sync-main)
    sync_main
    ;;
  land)
    name="${1:-}"; [ -n "$name" ] || die "usage: $0 land <task-name>"
    valid_name "$name"
    land_worktree "$name"
    ;;
  rm)
    name="${1:-}"; [ -n "$name" ] || die "usage: $0 rm <task-name>"
    valid_name "$name"
    rm_worktree "$name"
    ;;
  *)
    sed -n '2,15p' "$0"; exit 1
    ;;
esac
