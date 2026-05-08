#!/usr/bin/env bash
# orphan-notes.sh — Find notes with no incoming links (invisible to traversal)
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
NOTES_DIR="$VAULT_DIR/notes"

echo "=== Orphan Notes (no incoming links) ==="
ORPHANS=0

for file in "$NOTES_DIR"/*.md; do
  [ -f "$file" ] || continue
  title=$(basename "$file" .md)

  # Skip MOCs and index
  if grep -q "^type: moc" "$file" 2>/dev/null; then
    continue
  fi

  # Check for any incoming wiki links
  count=$(grep -rl "\[\[$title\]\]" "$VAULT_DIR" --include="*.md" 2>/dev/null | grep -v "$file" | wc -l | tr -d ' ')

  if [ "$count" = "0" ]; then
    echo "  ORPHAN: $title"
    ORPHANS=$((ORPHANS + 1))
  fi
done

echo ""
echo "Total orphans: $ORPHANS"
