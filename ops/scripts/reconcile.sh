#!/usr/bin/env bash
# reconcile.sh — Run condition-based invariant checks (idempotent workboard reconciliation)
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "=== Workboard Reconciliation ==="
echo "Checking invariants..."
echo ""

# 1. Inbox pressure
INBOX_COUNT=$(find "$VAULT_DIR/inbox" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
if [ "$INBOX_COUNT" -gt 3 ]; then
  echo "  FIRE: inbox_pressure — $INBOX_COUNT items in inbox (threshold: 3)"
  echo "        Action: run /pipeline or /reduce"
else
  echo "  OK: inbox_pressure ($INBOX_COUNT items)"
fi

# 2. Orphan notes
ORPHANS=$(bash "$VAULT_DIR/ops/scripts/orphan-notes.sh" 2>/dev/null | grep "^  ORPHAN:" | wc -l | tr -d ' ')
if [ "$ORPHANS" -gt 0 ]; then
  echo "  FIRE: orphan_notes — $ORPHANS orphan notes"
  echo "        Action: run /reflect to add connections"
else
  echo "  OK: orphan_notes (0 orphans)"
fi

# 3. Observations
OBS=$(find "$VAULT_DIR/ops/observations" -name "*.md" 2>/dev/null | xargs grep -l "^status: pending" 2>/dev/null | wc -l | tr -d ' ')
if [ "$OBS" -ge 10 ]; then
  echo "  FIRE: observation_accumulation — $OBS pending observations (threshold: 10)"
  echo "        Action: run /rethink"
else
  echo "  OK: observation_accumulation ($OBS pending)"
fi

# 4. Tensions
TENSIONS=$(find "$VAULT_DIR/ops/tensions" -name "*.md" 2>/dev/null | xargs grep -l "^status: pending" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TENSIONS" -ge 5 ]; then
  echo "  FIRE: tension_accumulation — $TENSIONS pending tensions (threshold: 5)"
  echo "        Action: run /rethink"
else
  echo "  OK: tension_accumulation ($TENSIONS pending)"
fi

echo ""
echo "Reconciliation complete."
