#!/usr/bin/env bash
# session-capture.sh — Stop hook for progressive context database vault
# Captures session state on session end

VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MARKER="$VAULT_DIR/.arscontexta"

if [ ! -f "$MARKER" ]; then
  exit 0
fi

SESSION_FILE="$VAULT_DIR/ops/sessions/current.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$VAULT_DIR/ops/sessions"

# Archive current session
if [ -f "$SESSION_FILE" ]; then
  SESSION_ID=$(python3 -c "import json,sys; d=json.load(open('$SESSION_FILE')); print(d.get('session_id','unknown'))" 2>/dev/null || echo "unknown")
  cp "$SESSION_FILE" "$VAULT_DIR/ops/sessions/${DATESTAMP}.json"
fi

# Create fresh session record placeholder
cat > "$SESSION_FILE" << EOF
{
  "session_id": "pending-${DATESTAMP}",
  "start_time": "$TIMESTAMP",
  "notes_created": [],
  "notes_modified": [],
  "discoveries": [],
  "last_activity": "$TIMESTAMP"
}
EOF

echo "Session captured: ops/sessions/${DATESTAMP}.json"
