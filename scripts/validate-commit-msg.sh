#!/bin/sh
# Shared commit message validation — called from both pre-commit and commit-msg hooks.
# Usage: validate-commit-msg.sh <msg-file> <branch> <enforcement: hard|soft>

COMMIT_MSG_FILE="$1"
BRANCH="$2"
ENFORCEMENT="${3:-soft}"

MESSAGE=$(grep -v '^#' "$COMMIT_MSG_FILE" | grep -v '^$')
LINE_COUNT=$(echo "$MESSAGE" | wc -l)
SUBJECT_LINE=$(echo "$MESSAGE" | head -n1)
SUBJECT_LENGTH=${#SUBJECT_LINE}
SHORTCODE_PATTERN='(\[)?(BUG|DEBT|STORY|SPIKE|IDEA|META)-[0-9]+[a-z]?(\])?'

if [ "$ENFORCEMENT" = "hard" ]; then
  echo "→ Validating commit message (main branch - hard enforcement)" >&2

  if [ "$LINE_COUNT" -gt 5 ]; then
    echo "" >&2
    echo "❌ ERROR: Commit message too long ($LINE_COUNT lines) on main branch" >&2
    echo "Commits should be 1-2 lines. Details go in documentation." >&2
    echo "To bypass: git commit --no-verify" >&2
    exit 1
  fi

  if [ "$SUBJECT_LENGTH" -gt 72 ]; then
    echo "" >&2
    echo "⚠️  WARNING: Subject line is $SUBJECT_LENGTH chars (recommended: <72)" >&2
    echo "Consider shortening: $SUBJECT_LINE" >&2
    echo "" >&2
  fi

  if echo "$SUBJECT_LINE" | grep -Eq "$SHORTCODE_PATTERN"; then
    echo "" >&2
    echo "❌ ERROR: Story short-codes are not allowed in commit subject lines" >&2
    echo "" >&2
    echo "Found in subject: $SUBJECT_LINE" >&2
    echo "Use a clean WHAT-style subject; keep BUG/STORY/DEBT IDs in docs or commit body." >&2
    echo "" >&2
    echo "Example:" >&2
    echo "  fix(nav): respect section boundary when finding next annotation" >&2
    echo "" >&2
    echo "To bypass (emergencies only): git commit --no-verify" >&2
    exit 1
  fi

  echo "✓ Commit message validated (main branch)"

else
  echo "→ Validating commit message (feature branch '$BRANCH' - soft enforcement)" >&2

  if [ "$SUBJECT_LENGTH" -gt 72 ]; then
    echo "⚠️  INFO: Subject line is $SUBJECT_LENGTH chars (recommended: <72)" >&2
  fi

  if echo "$SUBJECT_LINE" | grep -Eq "$SHORTCODE_PATTERN"; then
    echo "" >&2
    echo "❌ ERROR: Story short-codes are not allowed in commit subject lines" >&2
    echo "" >&2
    echo "Found in subject: $SUBJECT_LINE" >&2
    echo "Use a clean WHAT-style subject; keep BUG/STORY/DEBT IDs in docs or commit body." >&2
    echo "" >&2
    echo "To bypass (emergencies only): git commit --no-verify" >&2
    exit 1
  fi

  echo "✓ Commit message accepted (feature branch)"
fi
