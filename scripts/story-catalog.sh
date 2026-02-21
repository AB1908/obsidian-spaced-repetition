#!/usr/bin/env bash
set -euo pipefail

STORIES_DIR="${STORIES_DIR:-docs/stories}"

usage() {
  cat <<'EOF'
Usage:
  scripts/story-catalog.sh list
  scripts/story-catalog.sh check
  scripts/story-catalog.sh next-id <PREFIX>
  scripts/story-catalog.sh suggest <query>

Notes:
  - This script reads stories directly from docs/stories (no committed index cache).
  - PREFIX examples: STORY, BUG, DEBT, SPIKE, IDEA
EOF
}

if [ ! -d "${STORIES_DIR}" ]; then
  echo "story-catalog: missing directory: ${STORIES_DIR}" >&2
  exit 1
fi

normalize_ws() {
  sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//'
}

story_key_from_file() {
  local file="$1"
  local b
  b="$(basename "$file")"
  if [[ "${b}" =~ ^([A-Z]+-[0-9]+[a-z]?)\- ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  return 1
}

story_title_from_file() {
  local file="$1"
  awk 'NR==1{sub(/^# /,""); print; exit}' "$file" | normalize_ws
}

story_status_from_file() {
  local file="$1"
  awk '/^## Status$/{getline; print; found=1; exit} END{if (!found) print "Unknown"}' "$file" | normalize_ws
}

story_epic_from_file() {
  local file="$1"
  awk '/^## Epic$/{getline; print; found=1; exit} END{if (!found) print "None"}' "$file" | normalize_ws
}

list_cmd() {
  trap 'exit 0' PIPE
  shopt -s nullglob
  local files=("${STORIES_DIR}"/*.md)
  if [ "${#files[@]}" -eq 0 ]; then
    exit 0
  fi

  printf "KEY|STATUS|TITLE|FILE|EPIC\n" 2>/dev/null || return 0
  printf "%s\n" "${files[@]}" | LC_ALL=C sort | while IFS= read -r file; do
    local key title status epic
    key="$(story_key_from_file "$file" || true)"
    [ -n "$key" ] || continue
    title="$(story_title_from_file "$file")"
    status="$(story_status_from_file "$file")"
    epic="$(story_epic_from_file "$file")"
    printf "%s|%s|%s|%s|%s\n" "$key" "$status" "$title" "$file" "$epic" 2>/dev/null || return 0
  done
}

next_id_cmd() {
  local prefix="${1:-}"
  if [ -z "$prefix" ]; then
    echo "story-catalog: next-id requires <PREFIX>" >&2
    exit 2
  fi
  if ! [[ "$prefix" =~ ^[A-Z]+$ ]]; then
    echo "story-catalog: invalid prefix '${prefix}' (expected uppercase letters, e.g. STORY)" >&2
    exit 2
  fi

  local max=0
  shopt -s nullglob
  local files=("${STORIES_DIR}"/*.md)
  local f b n
  for f in "${files[@]}"; do
    b="$(basename "$f")"
    if [[ "$b" =~ ^${prefix}-([0-9]+)[a-z]?\- ]]; then
      n=$((10#${BASH_REMATCH[1]}))
      if [ "$n" -gt "$max" ]; then
        max="$n"
      fi
    fi
  done
  printf "%03d\n" $((max + 1))
}

suggest_cmd() {
  local query="${1:-}"
  if [ -z "$query" ]; then
    echo "story-catalog: suggest requires <query>" >&2
    exit 2
  fi

  local hits
  hits="$(rg -n -i -- "$query" "${STORIES_DIR}"/*.md 2>/dev/null || true)"
  if [ -z "$hits" ]; then
    echo "No matches for query: ${query}"
    exit 0
  fi

  echo "Matches for query: ${query}"
  echo "$hits" \
    | awk -F: '{count[$1]++} END {for (f in count) printf "%05d|%s\n", count[f], f}' \
    | sort -r \
    | cut -d'|' -f2 \
    | while IFS= read -r file; do
        local key title status
        key="$(story_key_from_file "$file" || true)"
        title="$(story_title_from_file "$file")"
        status="$(story_status_from_file "$file")"
        printf "  - %s [%s] %s (%s)\n" "$key" "$status" "$title" "$file"
      done
}

check_cmd() {
  shopt -s nullglob
  local files=("${STORIES_DIR}"/*.md)
  local fail=0

  declare -A seen_key_to_file=()

  local f b key title_line base
  for f in "${files[@]}"; do
    b="$(basename "$f")"

    if [[ "${b}" =~ ^([A-Z]+-[0-9]+[a-z]?)\-plan\.md$ ]]; then
      echo "story-catalog: move plan out of docs/stories/: ${f}" >&2
      fail=1
      continue
    fi
    if [[ "${b}" =~ ^([A-Z]+-[0-9]+[a-z]?)\-session-notes\.md$ ]]; then
      echo "story-catalog: move session notes out of docs/stories/: ${f}" >&2
      fail=1
      continue
    fi

    key="$(story_key_from_file "$f" || true)"
    if [ -z "$key" ]; then
      echo "story-catalog: invalid story filename format: ${f}" >&2
      fail=1
      continue
    fi

    if [ -n "${seen_key_to_file[$key]:-}" ]; then
      echo "story-catalog: duplicate story key ${key}:" >&2
      echo "  - ${seen_key_to_file[$key]}" >&2
      echo "  - ${f}" >&2
      fail=1
    else
      seen_key_to_file["$key"]="$f"
    fi

    title_line="$(awk 'NR==1{print; exit}' "$f" | normalize_ws)"
    if ! [[ "${title_line}" =~ ^#\ ${key}: ]]; then
      echo "story-catalog: title key mismatch in ${f}" >&2
      echo "  expected first line to start with: # ${key}:" >&2
      fail=1
    fi
  done

  # Suffix keys (e.g. STORY-010a) are only valid when the base key exists.
  for key in "${!seen_key_to_file[@]}"; do
    if [[ "$key" =~ ^([A-Z]+-[0-9]+)[a-z]$ ]]; then
      base="${BASH_REMATCH[1]}"
      if [ -z "${seen_key_to_file[$base]:-}" ]; then
        echo "story-catalog: suffix key without base story: ${key}" >&2
        echo "  missing base key: ${base}" >&2
        fail=1
      fi
    fi
  done

  if [ "$fail" -ne 0 ]; then
    exit 1
  fi
}

cmd="${1:-}"
case "$cmd" in
  list)
    shift
    list_cmd "$@"
    ;;
  check)
    shift
    check_cmd "$@"
    ;;
  next-id)
    shift
    next_id_cmd "$@"
    ;;
  suggest)
    shift
    suggest_cmd "$@"
    ;;
  -h|--help|help|"")
    usage
    ;;
  *)
    echo "story-catalog: unknown command: ${cmd}" >&2
    usage >&2
    exit 2
    ;;
esac
