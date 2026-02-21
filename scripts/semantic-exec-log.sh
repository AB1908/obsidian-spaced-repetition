#!/bin/bash

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/semantic-exec-log.sh --branch <branch> --worktree <path> --base <ref> --scope-file <path> --status <passed|failed> [options]

Required:
  --branch <branch>         Delegated branch name
  --worktree <path>         Worktree path used during execution
  --base <ref>              Base branch/ref used to create worktree
  --scope-file <path>       Scope file path passed to delegate script
  --status <value>          Overall delegated run status

Options:
  --contract-status <value> Contract verification status
  --test-contract <path>    Test contract file path
  --raw-log <path>          Raw transcript log path
  --output <path>           Output markdown path
USAGE
}

BRANCH=""
WORKTREE=""
BASE_REF=""
SCOPE_FILE=""
STATUS=""
CONTRACT_STATUS="skipped"
TEST_CONTRACT=""
RAW_LOG=""
OUTPUT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --branch)
      shift
      BRANCH="${1:-}"
      ;;
    --worktree)
      shift
      WORKTREE="${1:-}"
      ;;
    --base)
      shift
      BASE_REF="${1:-}"
      ;;
    --scope-file)
      shift
      SCOPE_FILE="${1:-}"
      ;;
    --status)
      shift
      STATUS="${1:-}"
      ;;
    --contract-status)
      shift
      CONTRACT_STATUS="${1:-}"
      ;;
    --test-contract)
      shift
      TEST_CONTRACT="${1:-}"
      ;;
    --raw-log)
      shift
      RAW_LOG="${1:-}"
      ;;
    --output)
      shift
      OUTPUT="${1:-}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "semantic-exec-log: unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

if [ -z "$BRANCH" ] || [ -z "$WORKTREE" ] || [ -z "$BASE_REF" ] || [ -z "$SCOPE_FILE" ] || [ -z "$STATUS" ]; then
  usage
  exit 1
fi

if [ -z "$OUTPUT" ]; then
  ts="$(date +%Y-%m-%d-%H%M%S)"
  OUTPUT="docs/executions/semantic/${ts}-${BRANCH//\//-}.md"
fi

mkdir -p "$(dirname "$OUTPUT")"

worktree_head="unknown"
if git -C "$WORKTREE" rev-parse --verify HEAD >/dev/null 2>&1; then
  worktree_head="$(git -C "$WORKTREE" rev-parse --short HEAD)"
fi

merge_base=""
if git -C "$WORKTREE" rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  merge_base="$(git -C "$WORKTREE" merge-base HEAD "$BASE_REF" 2>/dev/null || true)"
fi

changed_files=""
if [ -n "$merge_base" ]; then
  changed_files="$(git -C "$WORKTREE" diff --name-status "$merge_base"..HEAD || true)"
fi

commit_list="$(git -C "$WORKTREE" log --oneline --decorate "$BASE_REF"..HEAD 2>/dev/null || true)"

raw_log_lines="0"
test_cmd_lines=""
contract_ok_lines=""
contract_fail_lines=""
if [ -n "$RAW_LOG" ] && [ -f "$RAW_LOG" ]; then
  raw_log_lines="$(wc -l < "$RAW_LOG" | tr -d '[:space:]')"
  test_cmd_lines="$(rg -n "^\[contract\]\[RUN\] " "$RAW_LOG" || true)"
  contract_ok_lines="$(rg -n "^\[contract\]\[OK\] command passed:" "$RAW_LOG" || true)"
  contract_fail_lines="$(rg -n "^\[contract\]\[FAIL\]" "$RAW_LOG" || true)"
fi

{
  echo "# Execution Semantic Log"
  echo
  echo "## Metadata"
  echo "- Date: $(date -Iseconds)"
  echo "- Branch: \`$BRANCH\`"
  echo "- Base: \`$BASE_REF\`"
  echo "- Worktree: \`$WORKTREE\`"
  echo "- Scope file: \`$SCOPE_FILE\`"
  if [ -n "$TEST_CONTRACT" ]; then
    echo "- Test contract: \`$TEST_CONTRACT\`"
  fi
  if [ -n "$RAW_LOG" ]; then
    echo "- Raw log: \`$RAW_LOG\`"
    echo "- Raw log lines: $raw_log_lines"
  fi
  echo
  echo "## Outcome"
  echo "- Delegated run status: $STATUS"
  echo "- Contract status: $CONTRACT_STATUS"
  echo "- Worktree HEAD: \`$worktree_head\`"
  echo
  echo "## Commits Since Base"
  if [ -n "$commit_list" ]; then
    echo '```text'
    echo "$commit_list"
    echo '```'
  else
    echo "(none)"
  fi
  echo
  echo "## Changed Files Since Base"
  if [ -n "$changed_files" ]; then
    echo '```text'
    echo "$changed_files"
    echo '```'
  else
    echo "(unable to compute or no changes)"
  fi
  echo
  echo "## Contract Commands"
  if [ -n "$test_cmd_lines" ]; then
    echo '```text'
    echo "$test_cmd_lines"
    echo '```'
  else
    echo "(no contract command lines found in raw log)"
    echo ""
    echo "Note: contract verification may run outside the raw PTY capture in delegate wrapper."
  fi
  echo
  echo "## Contract Command Results"
  if [ -n "$contract_ok_lines" ] || [ -n "$contract_fail_lines" ]; then
    echo '```text'
    if [ -n "$contract_ok_lines" ]; then
      echo "$contract_ok_lines"
    fi
    if [ -n "$contract_fail_lines" ]; then
      echo "$contract_fail_lines"
    fi
    echo '```'
  else
    echo "(no contract result lines found in raw log)"
    echo ""
    echo "Note: contract verification may run outside the raw PTY capture in delegate wrapper."
  fi
} > "$OUTPUT"

echo "[semantic-log] wrote: $OUTPUT"
