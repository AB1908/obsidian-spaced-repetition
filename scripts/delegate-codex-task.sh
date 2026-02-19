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
  --base <branch>           Base branch for new worktree branch (default: main)
  --model <model>           Codex model override (optional)
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
BASE_BRANCH="main"
MODEL=""
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
      ;;
    --model)
      shift
      MODEL="${1:-}"
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

if [ -z "$WORKTREE" ]; then
  WORKTREE=".worktrees/${BRANCH//\//-}"
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
- Use strict TDD: make tests fail first, then implement, then verify green.
- Run required verification commands listed in the scope document.
- Commit only when acceptance criteria are met.
- Do not push, do not open PR, do not perform destructive git operations.
- Final output must include: changed files, tests run, and any deviations from scope.

Scope document contents:
$(cat "$SCOPE_FILE")
PROMPT

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

if [ "$DRY_RUN" -eq 1 ]; then
  echo "[dry-run] worktree command: $(printf '%q ' "${WORKTREE_CMD[@]}")"
  echo "[dry-run] codex command: $(printf '%q ' "${CODEX_CMD[@]}")"
  echo "[dry-run] prompt file: $PROMPT_FILE"
  exit 0
fi

"${WORKTREE_CMD[@]}"

if [ "$EXECUTE" -eq 1 ]; then
  "${CODEX_CMD[@]}"
else
  echo "Prepared worktree. Re-run with --execute to launch Codex."
  echo "Prompt file: $PROMPT_FILE"
fi
