#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat << 'EOF'
Usage:
  scripts/compute-next-release-version.sh <current-version> <release-type>

Release types:
  patch | minor | major | beta

Examples:
  scripts/compute-next-release-version.sh 0.5.1 patch      -> 0.5.2
  scripts/compute-next-release-version.sh 0.5.1 beta       -> 0.5.2-beta.1
  scripts/compute-next-release-version.sh 0.6.0-beta.2 beta -> 0.6.0-beta.3
  scripts/compute-next-release-version.sh 0.6.0-beta.2 patch -> 0.6.0
EOF
}

if [[ $# -ne 2 || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 1
fi

CURRENT_VERSION="$1"
RELEASE_TYPE="$2"

if [[ ! "$CURRENT_VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-beta\.([0-9]+))?$ ]]; then
  echo "Invalid current version: $CURRENT_VERSION"
  echo "Expected: X.Y.Z or X.Y.Z-beta.N"
  exit 1
fi

MAJOR="${BASH_REMATCH[1]}"
MINOR="${BASH_REMATCH[2]}"
PATCH="${BASH_REMATCH[3]}"
BETA_NUM="${BASH_REMATCH[5]:-}"

if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major|beta)$ ]]; then
  echo "Invalid release type: $RELEASE_TYPE"
  echo "Expected one of: patch, minor, major, beta"
  exit 1
fi

case "$RELEASE_TYPE" in
  major)
    echo "$((MAJOR + 1)).0.0"
    ;;
  minor)
    echo "${MAJOR}.$((MINOR + 1)).0"
    ;;
  patch)
    if [[ -n "$BETA_NUM" ]]; then
      echo "${MAJOR}.${MINOR}.${PATCH}"
    else
      echo "${MAJOR}.${MINOR}.$((PATCH + 1))"
    fi
    ;;
  beta)
    if [[ -n "$BETA_NUM" ]]; then
      echo "${MAJOR}.${MINOR}.${PATCH}-beta.$((BETA_NUM + 1))"
    else
      echo "${MAJOR}.${MINOR}.$((PATCH + 1))-beta.1"
    fi
    ;;
esac
