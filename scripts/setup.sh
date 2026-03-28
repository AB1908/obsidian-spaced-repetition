#!/usr/bin/env bash
# Bootstrap a fresh clone to a working dev environment.
# Run this once after cloning before using npm test or npm run check.

set -euo pipefail

echo "Installing dependencies..."
npm ci

if [[ ! -f node_modules/.bin/jest ]]; then
    echo "ERROR: jest binary not found after npm ci" >&2
    exit 1
fi

echo "Setup complete. Run 'npm run check' to verify the environment."
