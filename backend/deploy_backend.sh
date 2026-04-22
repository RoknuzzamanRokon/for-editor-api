#!/bin/bash
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

PROJECT_DIR="/var/www/for-editor-api"
BACKEND_DIR="$PROJECT_DIR/backend"
BACKEND_SERVICE="convaterPro.service"
BRANCH="master"
LOG_PREFIX="[deploy-backend]"

log() {
  echo "$LOG_PREFIX $1"
}

fail() {
  echo "$LOG_PREFIX ERROR: $1" >&2
  exit 1
}

run_step() {
  local message="$1"
  shift
  log "$message"
  "$@" || fail "$message failed"
}

on_error() {
  local exit_code="$1"
  local line_no="$2"
  echo "$LOG_PREFIX ERROR: deployment failed at line $line_no with exit code $exit_code" >&2
}

trap 'on_error $? $LINENO' ERR

log "Starting deployment..."

# command -v git >/dev/null 2>&1 || fail "git is not installed"
command -v systemctl >/dev/null 2>&1 || fail "systemctl is not installed"
command -v pipenv >/dev/null 2>&1 || fail "pipenv is not installed"

[ -d "$PROJECT_DIR/.git" ] || fail "Project directory is not a git repository: $PROJECT_DIR"
[ -f "$BACKEND_DIR/Pipfile" ] || fail "Missing Pipfile in $BACKEND_DIR"
[ -f "$BACKEND_DIR/alembic.ini" ] || fail "Missing alembic.ini in $BACKEND_DIR"

cd "$PROJECT_DIR"

# if [ -n "$(git status --porcelain)" ]; then
#  fail "Working tree has uncommitted changes. Refusing to deploy."
# fi

# run_step "Fetching latest code" git fetch origin
# run_step "Checking out branch $BRANCH" git checkout "$BRANCH"
# run_step "Pulling latest code" git pull --ff-only origin "$BRANCH"

cd "$BACKEND_DIR"

PIPENV_BIN="$(command -v pipenv)"

# run_step "Installing dependencies" "$PIPENV_BIN" install --deploy --ignore-pipfile

# run_step "Running migrations" "$PIPENV_BIN" run alembic upgrade head

run_step "Restarting service" systemctl restart "$BACKEND_SERVICE"
run_step "Checking service status" systemctl is-active --quiet "$BACKEND_SERVICE"

log "Deployment completed successfully"
