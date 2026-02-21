#!/usr/bin/env bash
# project-status.sh — Single-read project state summary for session start.
# Replaces per-file grepping that burns tokens on every new session.
#
# Usage: ./scripts/project-status.sh [--release]
#   --release   Show only items in the active release plan

set -euo pipefail

STORIES_DIR="docs/stories"
PLANS_DIR="docs/plans"
CHANGELOG="CHANGELOG.md"

# Colors (disabled if not terminal)
if [ -t 1 ]; then
  BOLD="\033[1m" DIM="\033[2m" GREEN="\033[32m" YELLOW="\033[33m"
  RED="\033[31m" BLUE="\033[34m" CYAN="\033[36m" RESET="\033[0m"
else
  BOLD="" DIM="" GREEN="" YELLOW="" RED="" BLUE="" CYAN="" RESET=""
fi

# --- Helpers ---

status_icon() {
  case "$1" in
    Done)         echo -e "${GREEN}✓${RESET}" ;;
    "In Progress") echo -e "${YELLOW}▶${RESET}" ;;
    Ready)        echo -e "${BLUE}○${RESET}" ;;
    Backlog)      echo -e "${DIM}·${RESET}" ;;
    Proposed)     echo -e "${DIM}?${RESET}" ;;
    *)            echo -e "${DIM}-${RESET}" ;;
  esac
}

# --- Current version ---
current_version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

# --- Git state ---
branch=$(git branch --show-current 2>/dev/null || echo "unknown")
commits_ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")
last_commit=$(git log --oneline -1 2>/dev/null || echo "unknown")

echo -e "${BOLD}=== Project Status ===${RESET}"
echo -e "Version: ${CYAN}${current_version}${RESET}  Branch: ${CYAN}${branch}${RESET}  Ahead: ${commits_ahead} commits"
echo -e "Last commit: ${DIM}${last_commit}${RESET}"
echo ""

# --- Story counts ---
declare -A counts
total=0
for f in "${STORIES_DIR}"/*.md; do
  [ -f "$f" ] || continue
  status=$(awk '/^## Status$/{getline; print; exit}' "$f")
  status="${status:-Unknown}"
  counts["$status"]=$(( ${counts["$status"]:-0} + 1 ))
  total=$((total + 1))
done

echo -e "${BOLD}Stories (${total} total)${RESET}"
for s in "Done" "In Progress" "Ready" "Backlog" "Proposed"; do
  c=${counts["$s"]:-0}
  [ "$c" -gt 0 ] && echo -e "  $(status_icon "$s") ${s}: ${c}"
done
echo ""

# --- In Progress ---
in_progress=$(for f in "${STORIES_DIR}"/*.md; do
  status=$(awk '/^## Status$/{getline; print; exit}' "$f")
  if [ "$status" = "In Progress" ]; then
    basename "$f" .md
  fi
done)

if [ -n "$in_progress" ]; then
  echo -e "${BOLD}${YELLOW}In Progress${RESET}"
  echo "$in_progress" | while read -r name; do
    echo -e "  ${YELLOW}▶${RESET} ${name}"
  done
  echo ""
fi

# --- Release items (if --release or release plan exists) ---
release_plan="${PLANS_DIR}/v0.6.0-release-plan.md"
if [ "$1" = "--release" ] 2>/dev/null || [ -f "$release_plan" ]; then
  echo -e "${BOLD}Release: 0.6.0${RESET}"

  # Items from the release plan with their actual status
  release_items=(
    "BUG-008-moonreader-name-shows-annotations"
    "BUG-007-section-list-flattens-heading-levels"
    "BUG-005-source-path-stale-after-file-move"
    "BUG-002-modal-title-navigation"
    "STORY-019-remove-filter-buttons-card-creation"
    "DEBT-007-flashcard-persistence-pattern"
    "BUG-012-card-creation-category-filter-regression"
  )

  release_labels=(
    "BUG-008: MoonReader name shows Annotations"
    "BUG-007: Section list flattens headings"
    "BUG-005: Source path stale after move"
    "BUG-002: Modal title doesn't update"
    "STORY-019: Remove filter buttons (card creation)"
    "DEBT-007: FlashcardNote persistence"
    "BUG-012: Card creation category filter"
  )

  release_tiers=(
    "T1-bug"
    "T1-bug"
    "T1-bug"
    "T1-bug"
    "T1-ux"
    "T2"
    "T1-bug"
  )

  for i in "${!release_items[@]}"; do
    item="${release_items[$i]}"
    label="${release_labels[$i]}"
    tier="${release_tiers[$i]}"
    file="${STORIES_DIR}/${item}.md"
    if [ -f "$file" ]; then
      status=$(awk '/^## Status$/{getline; print; exit}' "$file")
    else
      status="Missing"
    fi
    echo -e "  $(status_icon "$status") [${DIM}${tier}${RESET}] ${label} — ${status}"
  done
  echo ""
fi

# --- Test suite ---
echo -e "${BOLD}Quick Health${RESET}"
if command -v npm &>/dev/null; then
  test_count=$(npm test -- --listTests 2>/dev/null | wc -l || echo "?")
  echo -e "  Test suites: ${test_count}"
fi
echo -e "  Build: run ${DIM}npm run build${RESET} to verify"
