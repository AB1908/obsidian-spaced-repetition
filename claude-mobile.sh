#!/bin/bash

# --- CONFIGURATION ---
# Set CLAUDE_NTFY_TOPIC in your environment for push notifications via ntfy.sh
NTFY_TOPIC="${CLAUDE_NTFY_TOPIC:-}"
PROJECT_DIR="${1:-$(pwd)}"
PROJ_KEY=$(echo "$PROJECT_DIR" | sed 's|^/||; s|/|-|g')
SESSION_STORE="$HOME/.claude/projects/$PROJ_KEY"

# --- SESSION RESUME ---
last_session() {
    ls -t "$SESSION_STORE"/*.jsonl 2>/dev/null | head -1 | xargs -I{} basename {} .jsonl
}

LAST=$(last_session)
RESUME_FLAG=""
if [ -n "$LAST" ]; then
    echo "Last session: $LAST"
    printf "Resume? [y/N] "
    read -r ans
    [ "$ans" = "y" ] && RESUME_FLAG="--resume $LAST"
fi

# --- DISPLAY ---
clear
echo "──────────────────────────────────────"
echo "📱 CLAUDE MOBILE"
echo "Project: $PROJECT_DIR"
if [ -n "$NTFY_TOPIC" ]; then
    echo "Notify:  https://ntfy.sh/$NTFY_TOPIC"
    if command -v qrencode > /dev/null 2>&1; then
        qrencode -t ANSIUTF8 "https://ntfy.sh/$NTFY_TOPIC"
    fi
fi
[ -n "$LAST" ] && echo "Session: $LAST"
echo "──────────────────────────────────────"
echo ""

# --- RUN ---
cd "$PROJECT_DIR" || exit 1
# shellcheck disable=SC2086
CLAUDE_NTFY_TOPIC="$NTFY_TOPIC" claude $RESUME_FLAG

# --- RECORD LAST SESSION ---
FINAL=$(last_session)
if [ -n "$FINAL" ]; then
    echo ""
    echo "Session ended: $FINAL"
    echo "Resume with:   ./claude-mobile.sh  (will offer to resume)"
    echo "$FINAL" > "$HOME/.claude-last-session"
fi
