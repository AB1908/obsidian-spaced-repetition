#!/bin/bash

set -euo pipefail

usage() {
    cat <<'USAGE'
Usage: scripts/wave-runner.sh <plan-file> [options]

Options:
  --list               List discovered waves and tracks (default)
  --prepare-wave N     Print/create worktrees and agent prompts for wave N
  --merge-wave N       Merge wave N branches into main with per-branch approvals
  --dry-run            Print actions without side effects

Examples:
  scripts/wave-runner.sh docs/plans/DEBT-011-source-model-seam-repair.md --list
  scripts/wave-runner.sh docs/plans/DEBT-011-source-model-seam-repair.md --prepare-wave 1 --dry-run
  scripts/wave-runner.sh docs/plans/DEBT-011-source-model-seam-repair.md --merge-wave 1 --dry-run
USAGE
}

if [ $# -lt 1 ]; then
    usage
    exit 1
fi

PLAN_FILE="$1"
shift

if [ ! -f "$PLAN_FILE" ]; then
    echo "Error: Plan file '$PLAN_FILE' not found."
    exit 1
fi

MODE="list"
WAVE=""
DRY_RUN=0

while [ $# -gt 0 ]; do
    case "$1" in
        --list)
            MODE="list"
            ;;
        --prepare-wave)
            MODE="prepare"
            shift
            if [ $# -eq 0 ]; then
                echo "Error: --prepare-wave requires a wave number."
                exit 1
            fi
            WAVE="$1"
            ;;
        --merge-wave)
            MODE="merge"
            shift
            if [ $# -eq 0 ]; then
                echo "Error: --merge-wave requires a wave number."
                exit 1
            fi
            WAVE="$1"
            ;;
        --dry-run)
            DRY_RUN=1
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Error: Unknown option '$1'."
            usage
            exit 1
            ;;
    esac
    shift
done

if [ "$MODE" != "list" ] && [ -z "$WAVE" ]; then
    echo "Error: a wave number is required for $MODE mode."
    exit 1
fi

extract_waves() {
    grep -E '^### Wave [0-9]+([[:space:]].*)?$' "$PLAN_FILE" \
        | sed -E 's/^### Wave ([0-9]+).*/\1/' \
        | awk '!seen[$0]++'
}

extract_wave_rows() {
    local target_wave="$1"
    awk -v wave="$target_wave" '
        BEGIN { in_wave = 0; in_table = 0 }
        $0 ~ "^### Wave " wave "([^0-9]|$)" { in_wave = 1; in_table = 0; next }
        in_wave && /^### / { in_wave = 0; in_table = 0 }
        in_wave && /^\| Track \| Branch \| PR \| Scope \|/ { in_table = 1; next }
        in_table && /^\|---/ { next }
        in_table && /^\| [^|]+ \|/ {
            line = $0
            sub(/^\| /, "", line)
            sub(/ \|$/, "", line)
            n = split(line, parts, " \\| ")
            if (n >= 4) {
                track = parts[1]
                branch = parts[2]
                gsub(/`/, "", branch)
                pr = parts[3]
                scope = parts[4]
                printf "%s|%s|%s|%s\n", track, branch, pr, scope
            }
            next
        }
        in_table && !/^\|/ { in_table = 0 }
    ' "$PLAN_FILE"
}

require_clean_main_checkout() {
    local current_branch
    current_branch="$(git rev-parse --abbrev-ref HEAD)"
    if [ "$current_branch" != "main" ]; then
        echo "Error: merge mode must run from main branch (current: $current_branch)."
        exit 1
    fi

    if [ -n "$(git status --porcelain)" ]; then
        echo "Error: working tree is dirty. Commit or stash before merge mode."
        exit 1
    fi
}

print_prompt() {
    local track="$1"
    local branch="$2"
    local scope="$3"

    printf 'Prompt [%s]: Implement wave track %s on branch %s from plan %s. Scope: %s. Run project tests before handoff.\n' \
        "$track" "$track" "$branch" "$PLAN_FILE" "$scope"
}

list_mode() {
    local waves
    local rows
    waves="$(extract_waves)"
    if [ -z "$waves" ]; then
        echo "No waves found in plan file."
        exit 1
    fi

    echo "--- Wave Runner: $PLAN_FILE ---"
    while IFS= read -r wave; do
        [ -z "$wave" ] && continue
        echo "Wave $wave"
        rows="$(extract_wave_rows "$wave")"
        if [ -z "$rows" ]; then
            echo "  (no tracks found)"
            continue
        fi
        while IFS='|' read -r track branch pr scope; do
            printf '  [%s] %s (%s): %s\n' "$track" "$branch" "$pr" "$scope"
        done <<< "$rows"
    done <<< "$waves"
}

prepare_mode() {
    local rows
    rows="$(extract_wave_rows "$WAVE")"
    if [ -z "$rows" ]; then
        echo "Error: no tracks found for wave $WAVE."
        exit 1
    fi

    echo "Preparing wave $WAVE from $PLAN_FILE"
    while IFS='|' read -r track branch pr scope; do
        local worktree_path
        worktree_path=".worktrees/${branch//\//-}"

        echo "[$track] $branch ($pr): $scope"
        if git show-ref --verify --quiet "refs/heads/$branch"; then
            cmd=(git worktree add "$worktree_path" "$branch")
        else
            cmd=(git worktree add "$worktree_path" -b "$branch" main)
        fi

        if [ "$DRY_RUN" -eq 1 ]; then
            printf '  DRY-RUN: %s\n' "$(printf '%q ' "${cmd[@]}")"
        else
            "${cmd[@]}"
        fi

        print_prompt "$track" "$branch" "$scope"
        echo
    done <<< "$rows"
}

merge_mode() {
    local rows
    rows="$(extract_wave_rows "$WAVE")"
    if [ -z "$rows" ]; then
        echo "Error: no tracks found for wave $WAVE."
        exit 1
    fi

    if [ "$DRY_RUN" -eq 0 ]; then
        require_clean_main_checkout
    fi

    echo "Merging wave $WAVE from $PLAN_FILE"
    while IFS='|' read -r track branch pr scope; do
        echo "[$track] Candidate merge: $branch ($pr): $scope"
        echo "  Review command: git log --oneline main..$branch"

        if [ "$DRY_RUN" -eq 1 ]; then
            echo "  DRY-RUN: approval prompt for $branch"
            echo "  DRY-RUN: git merge --ff-only $branch"
            echo "  DRY-RUN: npm test -- --runInBand"
            echo
            continue
        fi

        read -r -p "Merge $branch into main now? [y/N] " reply
        case "$reply" in
            [yY]|[yY][eE][sS])
                git merge --ff-only "$branch"
                npm test -- --runInBand
                ;;
            *)
                echo "Skipped $branch"
                ;;
        esac
        echo
    done <<< "$rows"
}

case "$MODE" in
    list)
        list_mode
        ;;
    prepare)
        prepare_mode
        ;;
    merge)
        merge_mode
        ;;
    *)
        echo "Error: unsupported mode '$MODE'."
        exit 1
        ;;
esac
