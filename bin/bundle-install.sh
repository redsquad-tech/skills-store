#!/usr/bin/env bash

set -e

COMMAND=${1:-help}
TARGET=${2:-}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_FILE="$ROOT_DIR/bundle.yml"

info() {
  echo "[bundle-install] $1"
}

warn() {
  echo "[bundle-install][WARN] $1"
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

ensure_core() {
  info "Checking core tools..."
  for tool in git node python3; do
    if command_exists "$tool"; then
      info "$tool found"
    else
      warn "$tool is not installed"
    fi
  done
}

ensure_vault() {
  info "Ensuring vault structure..."

  mkdir -p "$ROOT_DIR/vault/mail/raw"
  mkdir -p "$ROOT_DIR/vault/mail/threads"
  mkdir -p "$ROOT_DIR/vault/events"
  mkdir -p "$ROOT_DIR/vault/contacts"
  mkdir -p "$ROOT_DIR/vault/orgs"
  mkdir -p "$ROOT_DIR/vault/projects"
  mkdir -p "$ROOT_DIR/vault/docs/source"
  mkdir -p "$ROOT_DIR/vault/docs/derived-md"
  mkdir -p "$ROOT_DIR/vault/tasks/todo"
  mkdir -p "$ROOT_DIR/vault/tasks/done"
  mkdir -p "$ROOT_DIR/vault/drafts/email"
  mkdir -p "$ROOT_DIR/vault/drafts/meeting"
  mkdir -p "$ROOT_DIR/vault/tmp/screens"

  info "Vault structure is ready"
}

ensure_tool() {
  case "$1" in
    core)
      ensure_core
      ;;
    vault)
      ensure_vault
      ;;
    qmd)
      command_exists qmd && info "qmd found" || warn "qmd is not installed"
      ;;
    markitdown)
      command_exists markitdown && info "markitdown found" || warn "markitdown is not installed"
      ;;
    weavmail)
      command_exists weavmail && info "weavmail found" || warn "weavmail is not installed"
      ;;
    sogcli)
      command_exists sogcli && info "sogcli found" || warn "sogcli is not installed"
      ;;
    rclone)
      command_exists rclone && info "rclone found" || warn "rclone is not installed"
      ;;
    gogcli)
      command_exists gogcli && info "gogcli found" || warn "gogcli is not installed"
      ;;
    *)
      warn "Unknown ensure target: $1"
      exit 1
      ;;
  esac
}

show_help() {
  echo "Usage:"
  echo "  ./bin/bundle-install.sh ensure core"
  echo "  ./bin/bundle-install.sh ensure vault"
  echo "  ./bin/bundle-install.sh ensure qmd"
  echo "  ./bin/bundle-install.sh ensure markitdown"
  echo "  ./bin/bundle-install.sh verify"
  echo
  echo "bundle.yml: $BUNDLE_FILE"
}

if [ ! -f "$BUNDLE_FILE" ]; then
  warn "bundle.yml not found: $BUNDLE_FILE"
fi

case "$COMMAND" in
  ensure)
    if [ -z "$TARGET" ]; then
      warn "Specify ensure target, for example: ensure core"
      exit 1
    fi
    ensure_tool "$TARGET"
    ;;
  verify)
    bash "$ROOT_DIR/bin/bundle-verify.sh"
    ;;
  *)
    show_help
    ;;
esac
