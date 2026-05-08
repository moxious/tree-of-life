#!/usr/bin/env bash
# validate-note.sh — PostToolUse (Write) hook for progressive context database vault
# Validates notes written to notes/ directory

VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MARKER="$VAULT_DIR/.arscontexta"

if [ ! -f "$MARKER" ]; then
  exit 0
fi

# Only validate files written to notes/
FILE="${CLAUDE_TOOL_RESULT:-}"
if [ -z "$FILE" ]; then
  exit 0
fi

# Check if the file is in notes/
if [[ "$FILE" != "$VAULT_DIR/notes/"* ]]; then
  exit 0
fi

# Must be a .md file
if [[ "$FILE" != *.md ]]; then
  exit 0
fi

if [ ! -f "$FILE" ]; then
  exit 0
fi

ISSUES=()

# Check 1: YAML frontmatter present
if ! grep -q "^---" "$FILE"; then
  ISSUES+=("Missing YAML frontmatter (---)")
fi

# Check 2: description field present
if ! grep -q "^description:" "$FILE"; then
  ISSUES+=("Missing required field: description")
fi

# Check 3: description not empty
DESC=$(grep "^description:" "$FILE" | head -1 | sed 's/^description: *//')
if [ -z "$DESC" ] || [ "$DESC" = '""' ] || [ "$DESC" = "''" ]; then
  ISSUES+=("description field is empty")
fi

# Check 4: Topics footer present
if ! grep -q "^Topics:" "$FILE"; then
  ISSUES+=("Missing Topics footer (note may be an orphan)")
fi

# Report
if [ ${#ISSUES[@]} -gt 0 ]; then
  FILENAME=$(basename "$FILE" .md)
  echo ""
  echo "=== Note Validation: $FILENAME ==="
  for issue in "${ISSUES[@]}"; do
    echo "  WARN: $issue"
  done
  echo "  Fix these before marking complete."
  echo ""
fi

exit 0
