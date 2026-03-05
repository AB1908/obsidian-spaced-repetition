#!/bin/bash

# --- CONFIGURATION ---
PROJECT_DIR="${1:-$(pwd)}"
# Load project .env if present (before reading env vars)
[ -f "$PROJECT_DIR/.env" ] && set -a && source "$PROJECT_DIR/.env" && set +a
# Set CLAUDE_NTFY_TOPIC in your environment or project .env for push notifications via ntfy.sh
NTFY_TOPIC="${CLAUDE_NTFY_TOPIC:-}"
PROJ_KEY=$(echo "$PROJECT_DIR" | sed 's|/|-|g')
SESSION_STORE="$HOME/.claude/projects/$PROJ_KEY"

# --- SESSION RESUME ---
last_session() {
    ls -t "$SESSION_STORE"/*.jsonl 2>/dev/null | head -1 | xargs -I{} basename {} .jsonl
}

pick_session() {
    local index="$SESSION_STORE/sessions-index.md"
    if [ ! -f "$index" ]; then
        # Fallback: just offer the last session
        local last
        last=$(last_session)
        [ -z "$last" ] && return
        echo "Last session: ${last:0:8}..." >&2
        printf "Resume? [y/N] " >&2
        read -r ans < /dev/tty
        [ "$ans" = "y" ] && echo "$last"
        return
    fi

    # Parse table rows via Python to avoid shell quoting/regex issues
    local parsed
    parsed=$(python3 - "$index" <<'PYEOF'
import sys, re
with open(sys.argv[1]) as f:
    for line in f:
        m = re.match(r'^\| (\d{4}-\d{2}-\d{2}) \| `([0-9a-f-]+)` \| [^|]+ \| ([^|]+) \| ([^|]+) \|', line)
        if m:
            date, uuid, title, resume = m.group(1), m.group(2), m.group(3).strip(), m.group(4).strip()
            print(f"{date}\t{uuid}\t{title}\t{resume}")
PYEOF
)

    [ -z "$parsed" ] && return

    local rows=()
    local uuids=()
    while IFS=$'\t' read -r date uuid title resume; do
        rows+=("$date  $title [$resume]")
        uuids+=("$uuid")
    done <<< "$parsed"

    echo "Sessions:" >&2
    for i in "${!rows[@]}"; do
        printf "  %2d) %s\n" "$((i+1))" "${rows[$i]}" >&2
    done
    echo "   0) New session" >&2
    printf "Pick [0]: " >&2
    read -r ans < /dev/tty
    ans="${ans:-0}"

    if [[ "$ans" =~ ^[0-9]+$ ]] && [ "$ans" -gt 0 ] && [ "$ans" -le "${#uuids[@]}" ]; then
        local short_uuid="${uuids[$((ans-1))]}"
        local full
        full=$(ls "$SESSION_STORE"/${short_uuid}*.jsonl 2>/dev/null | head -1 | xargs -I{} basename {} .jsonl)
        echo "$full"
    fi
}

RESUME_FLAG=""
PICKED=$(pick_session)
[ -n "$PICKED" ] && RESUME_FLAG="--resume $PICKED"

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
[ -n "$PICKED" ] && echo "Session: ${PICKED:0:8}..."
if command -v agent-queue > /dev/null 2>&1; then
    agent_status=$(agent-queue --count 2>/dev/null)
    [ -n "$agent_status" ] && echo "Agents:  $agent_status"
fi
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
