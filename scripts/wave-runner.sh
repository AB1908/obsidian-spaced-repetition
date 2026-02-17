#!/bin/bash

# Level 1/2 Wave Runner Helper
# Usage: ./scripts/wave-runner.sh <plan-file>

PLAN_FILE=$1

if [ -z "$PLAN_FILE" ]; then
    echo "Usage: $0 <plan-file>"
    exit 1
fi

if [ ! -f "$PLAN_FILE" ]; then
    echo "Error: Plan file '$PLAN_FILE' not found."
    exit 1
fi

echo "--- Wave Runner: $PLAN_FILE ---"

# Extract waves
WAVES=$(grep "### Wave" "$PLAN_FILE" | sed 's/### //')

if [ -z "$WAVES" ]; then
    echo "No waves found in plan file."
    exit 1
fi

echo "Available Waves:"
echo "$WAVES"
echo ""

# For now, let's just extract and print the Wave 1 table as an example
echo "Available Tracks:"
grep "^| [A-Z] | \`" "$PLAN_FILE" | while IFS='|' read -r _ TRACK BRANCH _ SCOPE _; do
    TRACK=$(echo "$TRACK" | xargs)
    BRANCH=$(echo "$BRANCH" | tr -d '` ' | xargs)
    SCOPE=$(echo "$SCOPE" | xargs)
    echo "[$TRACK] $BRANCH: $SCOPE"
    echo "   gemini --print \"Implement PR ($TRACK) in $BRANCH based on $PLAN_FILE. Scope: $SCOPE.\""
done
