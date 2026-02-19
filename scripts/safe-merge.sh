#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: scripts/safe-merge.sh <source-branch> [base-branch]" >&2
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
