#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat << 'EOF'
Usage:
  scripts/prepare-release.sh <version>

Examples:
  scripts/prepare-release.sh 0.5.2
  scripts/prepare-release.sh 0.6.0-beta.1

Behavior:
  - Updates manifest.json version to <version>
  - Updates versions.json only for stable versions (X.Y.Z)
  - Runs build with OBSIDIAN_PLUGIN_DIR=. (one-off override)
  - Validates version consistency

This script does not commit, tag, or push.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -ne 1 ]]; then
  usage
  exit 1
fi

VERSION="$1"

is_stable_version() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

is_valid_version() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]
}

if ! is_valid_version "$VERSION"; then
  echo "Invalid version: $VERSION"
  echo "Expected: X.Y.Z or X.Y.Z-beta.N"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed."
  exit 1
fi

if ! git diff --quiet -- manifest.json versions.json; then
  echo "Release files already have unstaged changes. Commit/stash first."
  exit 1
fi

TMP_MANIFEST="$(mktemp)"
jq --arg version "$VERSION" '.version = $version' manifest.json > "$TMP_MANIFEST"
mv "$TMP_MANIFEST" manifest.json

if is_stable_version "$VERSION"; then
  MIN_APP_VERSION="$(jq -r '.minAppVersion' manifest.json)"
  TMP_VERSIONS="$(mktemp)"
  jq --arg version "$VERSION" --arg minApp "$MIN_APP_VERSION" \
    '. + {($version): $minApp}' versions.json > "$TMP_VERSIONS"
  mv "$TMP_VERSIONS" versions.json
fi

MANIFEST_VERSION="$(jq -r '.version' manifest.json)"
if [[ "$MANIFEST_VERSION" != "$VERSION" ]]; then
  echo "manifest.json version mismatch after update"
  exit 1
fi

if is_stable_version "$VERSION"; then
  if [[ "$(jq -r --arg version "$VERSION" '.[$version] // empty' versions.json)" == "" ]]; then
    echo "versions.json missing stable version mapping for $VERSION"
    exit 1
  fi
fi

echo "Running build with local output override..."
OBSIDIAN_PLUGIN_DIR=. npm run build

echo "Release files prepared for $VERSION"
echo "Next steps:"
echo "  git add manifest.json versions.json"
echo "  git commit -m \"chore(release): $VERSION\""
echo "  git tag -a $VERSION -m \"$VERSION\""
echo "  git push origin main"
echo "  git push origin $VERSION"
