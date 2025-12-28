#!/usr/bin/env bash
set -euo pipefail
# Small helper to activate venv and run Django dev server from repo root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
if [ ! -x "$VENV_DIR/bin/python" ]; then
  echo "Virtualenv not found at $VENV_DIR. Create it with: python3 -m venv $VENV_DIR"
  exit 1
fi
export VIRTUAL_ENV="$VENV_DIR"
export PATH="$VENV_DIR/bin:$PATH"
"$VENV_DIR/bin/python" "$SCRIPT_DIR/manage.py" runserver 0.0.0.0:8000
