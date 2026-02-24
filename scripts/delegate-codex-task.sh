#!/bin/bash

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/delegate-codex-task.sh --branch <branch> --scope-file <path> [options]

Required:
  --branch <branch>         Target branch for delegated task
  --scope-file <path>       Markdown file containing full plan/test/execution scope

Options:
  --worktree <path>         Worktree path (default: .worktrees/<branch-with-dashes>)
  --base <branch>           Base branch/ref for new worktree branch (default: current branch or main)
  --model <model>           Codex model override (optional)
  --test-contract <path>    Test contract file to verify after delegated run (optional)
  --log-file <path>         Capture full codex terminal transcript to this file (optional)
  --semantic-log <path>     Write compact semantic execution log markdown (optional)
  --dry-run                 Print commands and generated prompt only
  --execute                 Run codex exec (non-interactive)

Behavior:
  - Creates or attaches a git worktree for the branch.
  - Generates a scoped delegation prompt from --scope-file.
  - Launches Codex in the worktree with full permissions only when --execute is set.
USAGE
}

BRANCH=""
SCOPE_FILE=""
WORKTREE=""
BASE_BRANCH=""
BASE_EXPLICIT=0
MODEL=""
TEST_CONTRACT=""
LOG_FILE=""
SEMANTIC_LOG=""
DRY_RUN=0
EXECUTE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --branch)
      shift
      BRANCH="${1:-}"
      ;;
    --scope-file)
      shift
      SCOPE_FILE="${1:-}"
      ;;
    --worktree)
      shift
      WORKTREE="${1:-}"
      ;;
    --base)
      shift
      BASE_BRANCH="${1:-}"
      BASE_EXPLICIT=1
      ;;
    --model)
      shift
      MODEL="${1:-}"
      ;;
    --test-contract)
      shift
      TEST_CONTRACT="${1:-}"
      ;;
    --log-file)
      shift
      LOG_FILE="${1:-}"
      ;;
    --semantic-log)
      shift
      SEMANTIC_LOG="${1:-}"
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    --execute)
      EXECUTE=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
  shift
done

if [ -z "$BRANCH" ] || [ -z "$SCOPE_FILE" ]; then
  usage
  exit 1
fi

if [ ! -f "$SCOPE_FILE" ]; then
  echo "Error: scope file not found: $SCOPE_FILE"
  exit 1
fi

if [ -n "$TEST_CONTRACT" ] && [ ! -f "$TEST_CONTRACT" ]; then
  echo "Error: test contract file not found: $TEST_CONTRACT"
  exit 1
fi

# Block if the scope file or test contract for THIS delegation are uncommitted.
# Worktrees branch from HEAD — uncommitted files will be absent, causing Codex
# to operate with stale or missing context.
# Scoped to the specific files being delegated; other draft docs are not our concern.
dirty_contracts=""
for f in "$SCOPE_FILE" "$TEST_CONTRACT"; do
  [ -z "$f" ] && continue
  if git status --porcelain "$f" 2>/dev/null | grep -q .; then
    dirty_contracts="$dirty_contracts\n  $f"
  fi
done
if [ -n "$dirty_contracts" ]; then
  printf "[delegate] ERROR: Scope/contract files for this delegation are uncommitted:%b\n" "$dirty_contracts"
  echo "[delegate] These files will not be present in the worktree."
  echo "[delegate] Commit them before delegating."
  exit 1
fi

if [ -z "$WORKTREE" ]; then
  WORKTREE=".worktrees/${BRANCH//\//-}"
fi

if [ -z "$BASE_BRANCH" ]; then
  BASE_BRANCH="$(git branch --show-current 2>/dev/null || true)"
  if [ -z "$BASE_BRANCH" ]; then
    BASE_BRANCH="main"
  fi
fi

if [ "$EXECUTE" -eq 1 ] && [ "$DRY_RUN" -eq 1 ]; then
  echo "Error: use either --dry-run or --execute, not both."
  exit 1
fi

PROMPT_FILE="$(mktemp)"
cat > "$PROMPT_FILE" <<PROMPT
You are delegated to execute one scoped task autonomously in this repository.

Execution contract:
- Work only on branch: $BRANCH
- Worktree path: $WORKTREE
- Follow the scope document exactly: $SCOPE_FILE
- Follow the test contract exactly: ${TEST_CONTRACT:-"(not provided)"}
- Use strict TDD: make tests fail first, then implement, then verify green.
- Run required verification commands listed in the scope document.
- Commit only when acceptance criteria are met.
- Do not push, do not open PR, do not perform destructive git operations.
- Final output must include: changed files, tests run, and any deviations from scope.
${BASE_DIVERGENCE_NOTE:+
$BASE_DIVERGENCE_NOTE}

Scope document contents:
$(cat "$SCOPE_FILE")

$(if [ -n "$TEST_CONTRACT" ]; then
    echo ""
    echo "Test contract contents:"
    cat "$TEST_CONTRACT"
  fi)
PROMPT

require_path_in_ref() {
  local ref="$1"
  local path="$2"
  local label="$3"
  if ! git cat-file -e "${ref}:${path}" 2>/dev/null; then
    echo "Error: ${label} '${path}' does not exist in ref '${ref}'."
    echo "Hint: pass --base <branch-with-plan-files> or merge planning/tooling branch first."
    exit 1
  fi
}

target_ref_for_scope="$BASE_BRANCH"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  target_ref_for_scope="$BRANCH"
fi

require_path_in_ref "$target_ref_for_scope" "$SCOPE_FILE" "scope file"
if [ -n "$TEST_CONTRACT" ]; then
  require_path_in_ref "$target_ref_for_scope" "$TEST_CONTRACT" "test contract file"
fi

# Check if base is behind origin — warn but do not override.
# The parent session controls what base the worktree starts from.
BASE_DIVERGENCE_NOTE=""
if ! git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git fetch origin "$BASE_BRANCH" 2>/dev/null || true
  if git show-ref --verify --quiet "refs/remotes/origin/$BASE_BRANCH"; then
    local_sha="$(git rev-parse "$BASE_BRANCH" 2>/dev/null || echo "")"
    remote_sha="$(git rev-parse "origin/$BASE_BRANCH" 2>/dev/null || echo "")"
    if [ -n "$local_sha" ] && [ -n "$remote_sha" ] && [ "$local_sha" != "$remote_sha" ]; then
      echo "[delegate] NOTE: local $BASE_BRANCH ($local_sha) differs from origin/$BASE_BRANCH ($remote_sha)"
      echo "[delegate] Using local $BASE_BRANCH as base (parent session controls the base)."
      BASE_DIVERGENCE_NOTE="NOTE: The base branch ($BASE_BRANCH) differs from origin/$BASE_BRANCH. Local commits not yet pushed are intentionally included. Flag any unexpected state."
    fi
  fi
fi

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  WORKTREE_CMD=(git worktree add "$WORKTREE" "$BRANCH")
else
  WORKTREE_CMD=(git worktree add "$WORKTREE" -b "$BRANCH" "$BASE_BRANCH")
fi

CODEX_CMD=(codex exec --cd "$WORKTREE" --dangerously-bypass-approvals-and-sandbox)
if [ -n "$MODEL" ]; then
  CODEX_CMD+=(--model "$MODEL")
fi
CODEX_CMD+=("$(cat "$PROMPT_FILE")")

echo "[delegate] branch: $BRANCH"
echo "[delegate] worktree: $WORKTREE"
echo "[delegate] base: $BASE_BRANCH"
if [ "$BASE_EXPLICIT" -eq 0 ]; then
  echo "[delegate] note: --base not provided, inferred from current branch."
fi
if [ -n "$TEST_CONTRACT" ]; then
  echo "[delegate] test contract: $TEST_CONTRACT"
fi
if [ -n "$LOG_FILE" ]; then
  echo "[delegate] log file: $LOG_FILE"
fi
if [ -n "$SEMANTIC_LOG" ]; then
  echo "[delegate] semantic log: $SEMANTIC_LOG"
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo "[dry-run] worktree command: $(printf '%q ' "${WORKTREE_CMD[@]}")"
  echo "[dry-run] codex command: $(printf '%q ' "${CODEX_CMD[@]}")"
  echo "[dry-run] prompt file: $PROMPT_FILE"
  exit 0
fi

"${WORKTREE_CMD[@]}"

if [ "$EXECUTE" -eq 1 ]; then
  run_status="passed"
  contract_status="skipped"

  if [ -n "$LOG_FILE" ]; then
    mkdir -p "$(dirname "$LOG_FILE")"
    if command -v script >/dev/null 2>&1; then
      CODEX_SHELL_CMD="$(printf '%q ' "${CODEX_CMD[@]}")"
      if ! script -qefc "$CODEX_SHELL_CMD" "$LOG_FILE"; then
        run_status="failed"
      fi
    else
      if ! "${CODEX_CMD[@]}" 2>&1 | tee "$LOG_FILE"; then
        run_status="failed"
      fi
    fi
  else
    if ! "${CODEX_CMD[@]}"; then
      run_status="failed"
    fi
  fi

  if [ "$run_status" = "passed" ] && [ -n "$TEST_CONTRACT" ]; then
    if scripts/verify-test-contract.sh "$TEST_CONTRACT" --repo-root "$WORKTREE" --run-required-commands; then
      contract_status="passed"
    else
      contract_status="failed"
      run_status="failed"
    fi
  fi

  if [ "$run_status" = "failed" ] && [ "$contract_status" = "skipped" ] && [ -n "$TEST_CONTRACT" ]; then
    contract_status="not-run-due-to-run-failure"
  fi

  if [ -z "$SEMANTIC_LOG" ]; then
    timestamp="$(date +%Y-%m-%d-%H%M%S)"
    SEMANTIC_LOG="docs/executions/semantic/${timestamp}-${BRANCH//\//-}.md"
  fi

  if [ -x scripts/semantic-exec-log.sh ]; then
    scripts/semantic-exec-log.sh \
      --branch "$BRANCH" \
      --worktree "$WORKTREE" \
      --base "$BASE_BRANCH" \
      --scope-file "$SCOPE_FILE" \
      --status "$run_status" \
      --contract-status "$contract_status" \
      --test-contract "${TEST_CONTRACT:-}" \
      --raw-log "${LOG_FILE:-}" \
      --output "$SEMANTIC_LOG"
  fi

  if [ "$run_status" = "failed" ]; then
    echo "[delegate] run failed"
    exit 1
  fi
else
  echo "Prepared worktree. Re-run with --execute to launch Codex."
  echo "Prompt file: $PROMPT_FILE"
fi
