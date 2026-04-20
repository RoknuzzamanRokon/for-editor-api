#!/bin/bash
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

PROJECT_DIR="/var/www/for-editor-api"
FRONTEND_DIR="$PROJECT_DIR/frontend"
FRONTEND_SERVICE="convaterpro-frontend.service"
BRANCH="master"

echo "Starting deployment..."

cd "$PROJECT_DIR"
git fetch origin
git reset --hard "origin/$BRANCH"

cd "$FRONTEND_DIR"

NPM_BIN="$(command -v npm)"

echo "Installing dependencies..."
"$NPM_BIN" ci

echo "Building project..."
"$NPM_BIN" run build

echo "Restarting service..."
systemctl restart "$FRONTEND_SERVICE"

echo "Deployment completed successfully"