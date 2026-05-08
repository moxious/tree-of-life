#!/usr/bin/env bash
# session-orient.sh — SessionStart hook for progressive context database vault
# Injects vault orientation at session start

VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MARKER="$VAULT_DIR/.arscontexta"

# Only run if this is an ars contexta vault
if [ ! -f "$MARKER" ]; then
  exit 0
fi

SESSION_ID="${CLAUDE_CONVERSATION_ID:-$(date +%Y%m%d-%H%M%S)}"
SESSION_FILE="$VAULT_DIR/ops/sessions/current.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Initialize session tracking
mkdir -p "$VAULT_DIR/ops/sessions"
cat > "$SESSION_FILE" << EOF
{
  "session_id": "$SESSION_ID",
  "start_time": "$TIMESTAMP",
  "notes_created": [],
  "notes_modified": [],
  "discoveries": [],
  "last_activity": "$TIMESTAMP"
}
EOF

# Tree injection — vault orientation
echo "=== VAULT ORIENTATION ==="
echo ""
echo "Vault: $VAULT_DIR"
echo "Date: $(date '+%Y-%m-%d')"
echo ""

# Show vault structure
if command -v tree &>/dev/null; then
  tree "$VAULT_DIR" -L 2 --noreport -I 'node_modules|.git|dist' 2>/dev/null
else
  find "$VAULT_DIR" -maxdepth 2 -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/dist/*' | sort
fi

echo ""

# Check vault state
NOTE_COUNT=$(find "$VAULT_DIR/notes" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
INBOX_COUNT=$(find "$VAULT_DIR/inbox" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
OBS_COUNT=$(find "$VAULT_DIR/ops/observations" -name "*.md" 2>/dev/null | grep -l "^status: pending" 2>/dev/null | wc -l | tr -d ' ')
TENSION_COUNT=$(find "$VAULT_DIR/ops/tensions" -name "*.md" 2>/dev/null | grep -l "^status: pending" 2>/dev/null | wc -l | tr -d ' ')

echo "--- Vault State ---"
echo "Notes: $NOTE_COUNT"
echo "Inbox: $INBOX_COUNT items"
echo "Pending observations: $OBS_COUNT"
echo "Pending tensions: $TENSION_COUNT"
echo ""

# Check maintenance triggers
if [ "$OBS_COUNT" -ge 10 ] 2>/dev/null; then
  echo "⚠ ACTION NEEDED: $OBS_COUNT pending observations — run /rethink"
fi
if [ "$TENSION_COUNT" -ge 5 ] 2>/dev/null; then
  echo "⚠ ACTION NEEDED: $TENSION_COUNT pending tensions — run /rethink"
fi
if [ "$INBOX_COUNT" -gt 10 ] 2>/dev/null; then
  echo "⚠ INBOX PRESSURE: $INBOX_COUNT items — run /pipeline or /reduce"
fi

# Check reminders
if [ -f "$VAULT_DIR/ops/reminders.md" ]; then
  TODAY=$(date '+%Y-%m-%d')
  DUE=$(grep "^\- \[ \] " "$VAULT_DIR/ops/reminders.md" 2>/dev/null | awk -F: '{print $2}' | tr -d ' ' | sort | head -3)
  if [ -n "$DUE" ]; then
    echo ""
    echo "--- Reminders Due ---"
    echo "$DUE"
  fi
fi

# Check for pending activation of skills (recently created)
if grep -q "Recently Created Skills (Pending Activation)" "$VAULT_DIR/CLAUDE.md" 2>/dev/null; then
  PENDING=$(grep "^- /" "$VAULT_DIR/CLAUDE.md" 2>/dev/null | head -3)
  if [ -n "$PENDING" ]; then
    echo ""
    echo "--- Skills Pending Activation (restart required) ---"
    echo "$PENDING"
  fi
fi

echo ""
echo "=== Session: $SESSION_ID ==="
echo ""
echo "Read ops/goals.md for current threads. Run /next for queue state."
