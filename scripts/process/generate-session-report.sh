#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat << 'USAGE_EOF'
Usage:
  scripts/process/generate-session-report.sh --story STORY_ID [options]

Required:
  --story STORY_ID            Story or task ID (example: DEBT-008)

Options:
  --base REF                  Base ref for diff/log analysis (default: origin/main)
  --head REF                  Head ref for analysis (default: HEAD)
  --allowed-file PATH         Allowed file path (repeatable)
  --allowed-files-file PATH   File containing allowed paths (one per line)
  --out PATH                  Output markdown path
  --prompts-file PATH         Optional notes/prompts file to embed
  --tests "CMD1;CMD2"         Semicolon-separated test commands for checklist
  --help                      Show this help
USAGE_EOF
}

STORY_ID=""
BASE_REF="origin/main"
HEAD_REF="HEAD"
OUT_PATH=""
PROMPTS_FILE=""
TEST_COMMANDS="yarn test -- tests/api.test.ts tests/api.clippings.test.ts;yarn test"

declare -a ALLOWED_FILES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --story)
      STORY_ID="${2:-}"
      shift 2
      ;;
    --base)
      BASE_REF="${2:-}"
      shift 2
      ;;
    --head)
      HEAD_REF="${2:-}"
      shift 2
      ;;
    --allowed-file)
      ALLOWED_FILES+=("${2:-}")
      shift 2
      ;;
    --allowed-files-file)
      while IFS= read -r line; do
        [[ -z "$line" || "$line" == \#* ]] && continue
        ALLOWED_FILES+=("$line")
      done < "${2:-}"
      shift 2
      ;;
    --out)
      OUT_PATH="${2:-}"
      shift 2
      ;;
    --prompts-file)
      PROMPTS_FILE="${2:-}"
      shift 2
      ;;
    --tests)
      TEST_COMMANDS="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$STORY_ID" ]]; then
  echo "--story is required" >&2
  usage >&2
  exit 1
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Base ref not found: $BASE_REF" >&2
  exit 1
fi

if ! git rev-parse --verify "$HEAD_REF" >/dev/null 2>&1; then
  echo "Head ref not found: $HEAD_REF" >&2
  exit 1
fi

DATE_DIR="$(date +%F)"
DEFAULT_OUT="docs/process/sessions/${DATE_DIR}/${STORY_ID}.md"
OUT_PATH="${OUT_PATH:-$DEFAULT_OUT}"
OUT_DIR="$(dirname "$OUT_PATH")"
mkdir -p "$OUT_DIR"

RANGE="${BASE_REF}..${HEAD_REF}"
TRIPLE_RANGE="${BASE_REF}...${HEAD_REF}"

COMMITS_RAW="$(git rev-list --reverse --no-merges "$RANGE" || true)"
if [[ -z "$COMMITS_RAW" ]]; then
  COMMIT_COUNT=0
  COMMITS_TEXT="(no commits in range)"
else
  COMMIT_COUNT="$(wc -l <<< "$COMMITS_RAW" | tr -d ' ')"
  COMMITS_TEXT="$(git log --reverse --pretty=format:'- `%h` %s' "$RANGE")"
fi

FILE_LIST="$(git diff --name-only "$TRIPLE_RANGE" || true)"
if [[ -z "$FILE_LIST" ]]; then
  CHANGED_FILES_COUNT=0
else
  CHANGED_FILES_COUNT="$(wc -l <<< "$FILE_LIST" | tr -d ' ')"
fi

if [[ ${#ALLOWED_FILES[@]} -gt 0 ]]; then
  ALLOWED_SORTED="$(printf '%s\n' "${ALLOWED_FILES[@]}" | sed '/^$/d' | sort -u)"
  OUT_OF_SCOPE=""
  while IFS= read -r changed; do
    [[ -z "$changed" ]] && continue
    if ! grep -Fxq "$changed" <<< "$ALLOWED_SORTED"; then
      OUT_OF_SCOPE+="$changed"$'\n'
    fi
  done <<< "$FILE_LIST"
else
  ALLOWED_SORTED=""
  OUT_OF_SCOPE=""
fi

OUT_OF_SCOPE_CLEAN="$(printf '%s' "$OUT_OF_SCOPE" | sed '/^$/d')"
if [[ -n "$OUT_OF_SCOPE_CLEAN" ]]; then
  OUT_OF_SCOPE_COUNT="$(printf '%s\n' "$OUT_OF_SCOPE_CLEAN" | sed '/^$/d' | wc -l | tr -d ' ')"
else
  OUT_OF_SCOPE_COUNT=0
fi

if (( COMMIT_COUNT <= 2 )); then
  COMMIT_SHAPE="Good (1-2 commits)"
elif (( COMMIT_COUNT <= 5 )); then
  COMMIT_SHAPE="Needs cleanup (3-5 commits)"
else
  COMMIT_SHAPE="Noisy (6+ commits)"
fi

if (( OUT_OF_SCOPE_COUNT == 0 )); then
  SCOPE_STATUS="Clean"
else
  SCOPE_STATUS="Scope drift detected"
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

PROMPTS_SECTION=""
if [[ -n "$PROMPTS_FILE" && -f "$PROMPTS_FILE" ]]; then
  PROMPTS_SECTION=$(cat <<PROMPTS_EOF
## Prompt Notes

Source: \`$PROMPTS_FILE\`

\`\`\`text
$(cat "$PROMPTS_FILE")
\`\`\`
PROMPTS_EOF
)
fi

IFS=';' read -r -a TEST_ARRAY <<< "$TEST_COMMANDS"
TEST_CHECKLIST=""
for cmd in "${TEST_ARRAY[@]}"; do
  trimmed="$(echo "$cmd" | sed 's/^ *//;s/ *$//')"
  [[ -z "$trimmed" ]] && continue
  TEST_CHECKLIST+="- [ ] \`$trimmed\` — _not run yet_"$'\n'
done

if [[ -n "$FILE_LIST" ]]; then
  CHANGED_FILES_SECTION="$(printf '%s\n' "$FILE_LIST" | sed 's/^/- `/; s/$/`/')"
else
  CHANGED_FILES_SECTION="- (no changed files)"
fi

ALLOWED_SECTION=""
SCOPE_SECTION=""
if [[ -n "$ALLOWED_SORTED" ]]; then
  ALLOWED_SECTION=$(cat <<ALLOWED_EOF
## Allowed Files
$(printf '%s\n' "$ALLOWED_SORTED" | sed 's/^/- `/; s/$/`/')
ALLOWED_EOF
)

  if [[ -n "$OUT_OF_SCOPE_CLEAN" ]]; then
    SCOPE_LIST="$(printf '%s\n' "$OUT_OF_SCOPE_CLEAN" | sed '/^$/d; s/^/- `/; s/$/`/')"
  else
    SCOPE_LIST="- None"
  fi

  SCOPE_SECTION=$(cat <<SCOPE_EOF
## Scope Drift
$SCOPE_LIST
SCOPE_EOF
)
fi

cat > "$OUT_PATH" <<REPORT_EOF
# Session Report: ${STORY_ID}

## Metadata
- Date: $(date +%F)
- Branch: \`${CURRENT_BRANCH}\`
- Base ref: \`${BASE_REF}\`
- Head ref: \`${HEAD_REF}\`
- Commit count in range: ${COMMIT_COUNT}
- Changed files count: ${CHANGED_FILES_COUNT}

## Summary Signals
- Commit shape: **${COMMIT_SHAPE}**
- Scope status: **${SCOPE_STATUS}**
- Out-of-scope file count: **${OUT_OF_SCOPE_COUNT}**

## Commit Log
${COMMITS_TEXT}

## Changed Files
${CHANGED_FILES_SECTION}

${ALLOWED_SECTION}

${SCOPE_SECTION}

## Test Evidence
${TEST_CHECKLIST}

## What Went Well
- [ ] _Fill in after review_

## What Went Wrong
- [ ] _Fill in after review_

## Proposed Guardrails
- [ ] _Fill in after review_

## Tradeoffs
- [ ] _Fill in after review_

## Actions for Meta PR
- [ ] Update rolling meta PR iteration log with this session.
- [ ] Decide whether guidance changes are policy-worthy or experimental only.
- [ ] Link this report in the meta PR body.

${PROMPTS_SECTION}
REPORT_EOF

echo "Wrote session report: $OUT_PATH"
