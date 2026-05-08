#!/usr/bin/env bash
# find-triangles.sh — Find synthesis opportunities (open triadic closures)
# A links to B, A links to C, but B and C don't link to each other
VAULT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
NOTES_DIR="$VAULT_DIR/notes"

echo "=== Triangle Detection (synthesis opportunities) ==="
echo "Note: This is computationally intensive on large vaults."
echo ""

for fileA in "$NOTES_DIR"/*.md; do
  [ -f "$fileA" ] || continue
  noteA=$(basename "$fileA" .md)

  # Get all outgoing links from A
  linksA=$(grep -o '\[\[[^\]]*\]\]' "$fileA" 2>/dev/null | sed 's/\[\[//g; s/\]\]//g' | sort -u)

  # For each pair of A's links (B, C), check if B links to C
  while IFS= read -r noteB; do
    while IFS= read -r noteC; do
      [ "$noteB" = "$noteC" ] && continue
      fileB=$(find "$NOTES_DIR" -name "${noteB}.md" 2>/dev/null | head -1)
      [ -z "$fileB" ] && continue

      # Does B link to C?
      if ! grep -q "\[\[$noteC\]\]" "$fileB" 2>/dev/null; then
        echo "  OPPORTUNITY: [[${noteA}]] connects to both [[${noteB}]] and [[${noteC}]]"
        echo "    but [[${noteB}]] and [[${noteC}]] are not yet directly linked"
      fi
    done <<< "$linksA"
  done <<< "$linksA"
done | head -20

echo ""
echo "(Showing first 20 opportunities)"
