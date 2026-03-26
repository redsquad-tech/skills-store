#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_FILE="$ROOT_DIR/bundle.yml"

info() {
  echo "[bundle-verify] $1"
}

warn() {
  echo "[bundle-verify][WARN] $1"
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

info "Starting verification..."

if [ -f "$BUNDLE_FILE" ]; then
  info "bundle.yml found"
else
  warn "bundle.yml is missing"
fi

for cmd in git node python3; do
  if command_exists "$cmd"; then
    info "$cmd found"
  else
    warn "$cmd is missing"
  fi
done

for dir in           vault           vault/mail/raw           vault/mail/threads           vault/events           vault/contacts           vault/orgs           vault/projects           vault/docs/source           vault/docs/derived-md           vault/tasks/todo           vault/tasks/done           vault/drafts/email           vault/drafts/meeting           vault/tmp/screens
do
  if [ -d "$ROOT_DIR/$dir" ]; then
    info "$dir exists"
  else
    warn "$dir is missing"
  fi
done

info "Verification finished."
