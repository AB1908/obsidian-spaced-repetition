#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage:
  $0 <FOCUS> [options]

Options:
  --story <ref>        Story reference (e.g., docs/stories/DEBT-025-...md or DEBT-025)
  --plan <ref>         Plan reference (e.g., docs/plans/....md)
  --decision <text>    Decision note (repeatable)
  --assumption <text>  Assumption note (repeatable)
  --question <text>    Open question note (repeatable)
  --next <text>        Next action note (repeatable)
  --at <HH:MM>         Override checkpoint time (default: current local time)
  --print-path         Print target session file path after writing
  -h, --help           Show this help

Examples:
  $0 DEBT-025 --story DEBT-025 --plan docs/plans/DEBT-025-session-checkpoint-contract.md \\
     --decision "Use optional checkpoint flow" --next "Run full tests"
USAGE
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

focus=""
story_ref=""
plan_ref=""
checkpoint_time="$(date +%H:%M)"
print_path=0

declare -a decisions assumptions questions next_actions
decisions=()
assumptions=()
questions=()
next_actions=()

focus="$1"
shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    --story)
      story_ref="$2"
      shift 2
      ;;
    --plan)
      plan_ref="$2"
      shift 2
      ;;
    --decision)
      decisions+=("$2")
      shift 2
      ;;
    --assumption)
      assumptions+=("$2")
      shift 2
      ;;
    --question)
      questions+=("$2")
      shift 2
      ;;
    --next)
      next_actions+=("$2")
      shift 2
      ;;
    --at)
      checkpoint_time="$2"
      shift 2
      ;;
    --print-path)
      print_path=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

append_items() {
  local heading="$1"
  shift
  local -a items=("$@")

  echo "#### $heading"
  if [[ ${#items[@]} -eq 0 ]]; then
    echo "- (none)"
  else
    local item
    for item in "${items[@]}"; do
      echo "- $item"
    done
  fi
  echo ""
}

slug_focus="$(printf '%s' "$focus" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
if [[ -z "$slug_focus" ]]; then
  echo "Focus produced an empty slug; use alphanumeric focus text." >&2
  exit 1
fi

date_stamp="$(date +%F)"
sessions_dir="docs/sessions"
session_file="$sessions_dir/${date_stamp}-${slug_focus}.md"

mkdir -p "$sessions_dir"

if [[ ! -f "$session_file" ]]; then
  {
    echo "# Session: $focus — $date_stamp"
    echo ""
    echo "## Story"
    if [[ -n "$story_ref" ]]; then
      echo "- $story_ref"
    else
      echo "- (add story reference)"
    fi
    echo ""
    echo "## Goal"
    echo "- periodic checkpoint capture"
    echo ""
  } > "$session_file"
fi

{
  echo "## Checkpoint $checkpoint_time"
  if [[ -n "$story_ref" || -n "$plan_ref" ]]; then
    echo "### Active Links"
    if [[ -n "$story_ref" ]]; then
      echo "- Story: $story_ref"
    fi
    if [[ -n "$plan_ref" ]]; then
      echo "- Plan: $plan_ref"
    fi
    echo ""
  fi

  if [[ ${#decisions[@]} -gt 0 ]]; then
    append_items "Decisions" "${decisions[@]}"
  else
    append_items "Decisions"
  fi

  if [[ ${#assumptions[@]} -gt 0 ]]; then
    append_items "Assumptions" "${assumptions[@]}"
  else
    append_items "Assumptions"
  fi

  if [[ ${#questions[@]} -gt 0 ]]; then
    append_items "Open Questions" "${questions[@]}"
  else
    append_items "Open Questions"
  fi

  if [[ ${#next_actions[@]} -gt 0 ]]; then
    append_items "Next Actions" "${next_actions[@]}"
  else
    append_items "Next Actions"
  fi
} >> "$session_file"

if [[ "$print_path" -eq 1 ]]; then
  echo "$session_file"
else
  echo "Appended checkpoint to $session_file"
fi
