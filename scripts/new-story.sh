#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/new-story.sh <PREFIX> <slug> [--title "Title"] [--status Proposed|Backlog|Ready] [--epic "None"] [--dry-run]

Examples:
  scripts/new-story.sh BUG markdown-next-navigation-regression --title "Markdown next navigation misses cross-heading annotation"
  scripts/new-story.sh DEBT story-intake-standardization --epic "None"
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ] || [ "${1:-}" = "help" ]; then
  usage
  exit 0
fi

prefix="${1:-}"
raw_slug="${2:-}"
shift 2 || true

if [ -z "$prefix" ] || [ -z "$raw_slug" ]; then
  usage >&2
  exit 2
fi

if ! [[ "$prefix" =~ ^[A-Z]+$ ]]; then
  echo "new-story: invalid prefix '${prefix}' (use uppercase letters, e.g. BUG/STORY/DEBT)" >&2
  exit 2
fi

title=""
status="Proposed"
epic="None"
dry_run=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --title)
      title="${2:-}"
      shift 2
      ;;
    --status)
      status="${2:-}"
      shift 2
      ;;
    --epic)
      epic="${2:-}"
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    *)
      echo "new-story: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

slug="$(echo "$raw_slug" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
if [ -z "$slug" ]; then
  echo "new-story: slug normalized to empty; choose a more specific slug" >&2
  exit 2
fi

if [ -z "$title" ]; then
  title="$(echo "$slug" | tr '-' ' ')"
fi

next_id="$(scripts/story-catalog.sh next-id "$prefix")"
key="${prefix}-${next_id}"
file="docs/stories/${key}-${slug}.md"

echo "Candidate matches before creating ${key}:"
scripts/story-catalog.sh suggest "$slug" || true
if [ -n "$title" ]; then
  scripts/story-catalog.sh suggest "$title" || true
fi
echo ""
echo "Allocated key: ${key}"
echo "Target file: ${file}"

if [ "$dry_run" -eq 1 ]; then
  echo "Dry run: no files written."
  exit 0
fi

if [ -e "$file" ]; then
  echo "new-story: file already exists: ${file}" >&2
  exit 1
fi

today="$(date +%F)"
cat > "$file" <<EOF
# ${key}: ${title}

## Status
${status}

## Epic
${epic}

## User Story
As a user, I want <goal>, so that <benefit>.

## Acceptance Criteria
- [ ] Define expected behavior.
- [ ] Add or update tests.
- [ ] Document edge cases or follow-up debt.

## Context
Created via \`scripts/new-story.sh\` on ${today}.

## Related
- Add related stories/plans/guides here.
EOF

echo "Created ${file}"
scripts/story-catalog.sh check

