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

run_install_cmd() {
  local cmd="$1"
  if command_exists sudo; then
    bash -lc "sudo $cmd"
  else
    bash -lc "$cmd"
  fi
}

install_with_os_pkg_manager() {
  local tool="$1"

  if command_exists apt-get; then
    case "$tool" in
      git) run_install_cmd "apt-get update && apt-get install -y git" ;;
      node) run_install_cmd "apt-get update && apt-get install -y nodejs npm" ;;
      python) run_install_cmd "apt-get update && apt-get install -y python3 python3-pip" ;;
      rclone) run_install_cmd "apt-get update && apt-get install -y rclone" ;;
      *) return 1 ;;
    esac
    return 0
  fi

  if command_exists dnf; then
    case "$tool" in
      git) run_install_cmd "dnf install -y git" ;;
      node) run_install_cmd "dnf install -y nodejs npm" ;;
      python) run_install_cmd "dnf install -y python3 python3-pip" ;;
      rclone) run_install_cmd "dnf install -y rclone" ;;
      *) return 1 ;;
    esac
    return 0
  fi

  if command_exists yum; then
    case "$tool" in
      git) run_install_cmd "yum install -y git" ;;
      node) run_install_cmd "yum install -y nodejs npm" ;;
      python) run_install_cmd "yum install -y python3 python3-pip" ;;
      rclone) run_install_cmd "yum install -y rclone" ;;
      *) return 1 ;;
    esac
    return 0
  fi

  if command_exists brew; then
    case "$tool" in
      git) brew install git ;;
      node) brew install node ;;
      python) brew install python ;;
      rclone) brew install rclone ;;
      *) return 1 ;;
    esac
    return 0
  fi

  return 1
}

install_tool() {
  local tool="$1"

  case "$tool" in
    git|node|python|rclone)
      install_with_os_pkg_manager "$tool" || {
        warn "No supported package-manager installation path for $tool"
        return 1
      }
      ;;
    uv)
      if command_exists python3; then
        python3 -m pip install --user -U uv || return 1
      elif command_exists python; then
        python -m pip install --user -U uv || return 1
      else
        warn "python is required to install uv"
        return 1
      fi
      ;;
    qmd)
      command_exists uv || install_tool uv || return 1
      uv tool install qmd || uv tool upgrade qmd || return 1
      ;;
    weavmail)
      command_exists uv || install_tool uv || return 1
      uv tool install weavmail || uv tool upgrade weavmail || return 1
      ;;
    markitdown)
      if command_exists python3; then
        python3 -m pip install --user -U "markitdown[all]" || return 1
      elif command_exists python; then
        python -m pip install --user -U "markitdown[all]" || return 1
      else
        warn "python is required to install markitdown"
        return 1
      fi
      ;;
    sogcli)
      warn "Automatic install for sogcli is not configured yet"
      return 1
      ;;
    gogcli)
      warn "Automatic install for gogcli is not configured yet"
      return 1
      ;;
    *)
      warn "Unknown install target: $tool"
      return 1
      ;;
  esac
}

ensure_tool_installed() {
  local tool="$1"
  local check_cmd="$2"

  if command_exists "$check_cmd"; then
    info "$tool found"
    return 0
  fi

  warn "$tool is not installed. Attempting installation..."
  if install_tool "$tool" && command_exists "$check_cmd"; then
    info "$tool installed successfully"
    return 0
  fi

  warn "$tool installation failed"
  return 1
}

ensure_core() {
  info "Ensuring core dependencies..."

  local failed=0
  ensure_tool_installed git git || failed=1
  ensure_tool_installed node node || failed=1
  ensure_tool_installed python python3 || ensure_tool_installed python python || failed=1
  ensure_tool_installed uv uv || failed=1
  ensure_tool_installed qmd qmd || failed=1
  ensure_tool_installed weavmail weavmail || failed=1
  ensure_tool_installed markitdown markitdown || failed=1
  ensure_tool_installed rclone rclone || failed=1

  if [ "$failed" -eq 1 ]; then
    warn "Core dependencies have unresolved issues"
    return 1
  fi

  info "Core dependencies are ready"
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
    qmd|markitdown|weavmail|sogcli|rclone|gogcli|uv)
      ensure_tool_installed "$1" "$1"
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
  echo "  ./bin/bundle-install.sh ensure weavmail"
  echo "  ./bin/bundle-install.sh ensure markitdown"
  echo "  ./bin/bundle-install.sh ensure uv"
  echo "  ./bin/bundle-install.sh ensure rclone"
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
