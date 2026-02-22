#!/usr/bin/env bash
set -euo pipefail

ARCHIVE=true

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-archive)
      ARCHIVE=false
      shift
      ;;
    -*)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

if [ $# -lt 1 ]; then
  echo "Usage: scripts/safe-merge.sh [--no-archive] <source-branch> [base-branch]" >&2
  exit 1
fi

SOURCE_BRANCH="$1"
BASE_BRANCH="${2:-main}"

CURRENT_BRANCH="$(git branch --show-current)"
if [ "${CURRENT_BRANCH}" != "${BASE_BRANCH}" ]; then
  echo "safe-merge: current branch is '${CURRENT_BRANCH}', expected '${BASE_BRANCH}'." >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "safe-merge: working tree is dirty; commit/stash first." >&2
  exit 1
fi

scripts/require-history-curation.sh "${BASE_BRANCH}" "${SOURCE_BRANCH}" "${SOURCE_BRANCH}"

echo "safe-merge: history curation gate passed. Running merge..."
git merge --ff-only "${SOURCE_BRANCH}"

# Auto-archive merged branch
if [ "${ARCHIVE}" = true ]; then
  ARCHIVE_DATE="$(date +%Y-%m-%d)"
  ARCHIVE_NAME="archive/${SOURCE_BRANCH}-${ARCHIVE_DATE}"

  echo "safe-merge: archiving '${SOURCE_BRANCH}' as '${ARCHIVE_NAME}'..."
  git branch "${ARCHIVE_NAME}" "${SOURCE_BRANCH}"
  git branch -d "${SOURCE_BRANCH}"

  echo "safe-merge: ✓ merged and archived '${SOURCE_BRANCH}'"
  echo "safe-merge:   archive branch: ${ARCHIVE_NAME}"
else
  echo "safe-merge: ✓ merged '${SOURCE_BRANCH}' (branch preserved)"
fi
