#!/usr/bin/env bash
# extract-links.sh — List all outgoing wiki links from a note
VAULT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET="$1"

if [ -z "$TARGET" ]; then
  echo "Usage: ./extract-links.sh \"note title\""
  exit 1
fi

FILE=$(find "$VAULT_DIR" -name "${TARGET}.md" -not -path "*/.git/*" 2>/dev/null | head -1)
if [ -z "$FILE" ]; then
  echo "Note not found: $TARGET"
  exit 1
fi

echo "=== Outgoing links from: $TARGET ==="
grep -o '\[\[[^\]]*\]\]' "$FILE" | sed 's/\[\[//g; s/\]\]//g' | sort -u | while read -r link; do
  # Check if target exists
  found=$(find "$VAULT_DIR" -name "${link}.md" -not -path "*/.git/*" 2>/dev/null | head -1)
  if [ -n "$found" ]; then
    echo "  -> [[$link]]"
  else
    echo "  -> [[$link]] (DANGLING)"
  fi
done
