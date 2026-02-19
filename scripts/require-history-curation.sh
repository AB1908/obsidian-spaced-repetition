#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-main}"
TARGET_REF="${2:-HEAD}"
BRANCH_HINT="${3:-}"
COMMIT_LIMIT="${COMMIT_LIMIT:-6}"

COUNT="$(git rev-list --count "${BASE_REF}..${TARGET_REF}")"
if [ "${COUNT}" -le "${COMMIT_LIMIT}" ]; then
  exit 0
fi

branch_for_key() {
  if [ -n "${BRANCH_HINT}" ]; then
    printf '%s\n' "${BRANCH_HINT}"
    return
  fi
  if [ "${TARGET_REF}" = "HEAD" ]; then
    git branch --show-current
    return
  fi
  git name-rev --name-only "${TARGET_REF}" 2>/dev/null || true
}

BRANCH_NAME="$(branch_for_key)"
KEY_RAW="$(printf '%s' "${BRANCH_NAME}" | grep -Eo '[A-Za-z]+-[0-9]+' | head -n1 || true)"
if [ -z "${KEY_RAW}" ] && [ -n "${BRANCH_HINT}" ]; then
  if printf '%s' "${BRANCH_HINT}" | grep -Eq '^[A-Za-z][A-Za-z0-9_-]*$'; then
    KEY_RAW="${BRANCH_HINT}"
  fi
fi

if [ -z "${KEY_RAW}" ]; then
  echo "history-guard: ${COUNT} commits over ${BASE_REF}; cannot infer story key from '${BRANCH_NAME}'." >&2
  exit 1
fi

KEY="$(printf '%s' "${KEY_RAW}" | tr '[:lower:]' '[:upper:]')"

find_doc_in_ref() {
  local dir="$1"
  local pattern="$2"
  git ls-tree -r --name-only "${TARGET_REF}" "${dir}" | grep -E "${pattern}" | head -n1 || true
}

CHECK_FILE="$(find_doc_in_ref docs/executions "^docs/executions/.*${KEY}.*\.md$")"
if [ -z "${CHECK_FILE}" ]; then
  CHECK_FILE="$(find_doc_in_ref docs/stories "^docs/stories/${KEY}.*\.md$")"
fi
if [ -z "${CHECK_FILE}" ]; then
  CHECK_FILE="$(find_doc_in_ref docs/plans "^docs/plans/${KEY}.*\.md$")"
fi

if [ -z "${CHECK_FILE}" ]; then
  echo "history-guard: ${COUNT} commits over ${BASE_REF}; missing ${KEY} execution/story/plan file in ${TARGET_REF}." >&2
  exit 1
fi

CONTENT="$(git show "${TARGET_REF}:${CHECK_FILE}")"

require_section() {
  local section="$1"
  if ! printf '%s\n' "${CONTENT}" | grep -q "^## ${section}$"; then
    echo "history-guard: missing section '## ${section}' in ${CHECK_FILE} (${TARGET_REF})." >&2
    exit 1
  fi
}

require_section "Planned Commit Topology"
require_section "Actual Commit Topology"
require_section "Final Curated Topology"

if ! printf '%s\n' "${CONTENT}" | grep -qi '^History Curation Approved:[[:space:]]*yes$'; then
  echo "history-guard: ${CHECK_FILE} (${TARGET_REF}) must include 'History Curation Approved: yes'." >&2
  exit 1
fi

echo "history-guard: ${COUNT} commits over ${BASE_REF}; curation approved in ${CHECK_FILE}."
