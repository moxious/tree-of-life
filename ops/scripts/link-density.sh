#!/usr/bin/env bash
# link-density.sh — Measure average outgoing links per note
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
NOTES_DIR="$VAULT_DIR/notes"

echo "=== Link Density ==="
TOTAL_LINKS=0
TOTAL_NOTES=0

for file in "$NOTES_DIR"/*.md; do
  [ -f "$file" ] || continue
  links=$(grep -o '\[\[[^\]]*\]\]' "$file" 2>/dev/null | wc -l | tr -d ' ')
  TOTAL_LINKS=$((TOTAL_LINKS + links))
  TOTAL_NOTES=$((TOTAL_NOTES + 1))
done

if [ "$TOTAL_NOTES" = "0" ]; then
  echo "No notes found in notes/"
  exit 0
fi

AVG=$((TOTAL_LINKS / TOTAL_NOTES))
echo "Notes: $TOTAL_NOTES"
echo "Total links: $TOTAL_LINKS"
echo "Average links per note: $AVG"

if [ "$AVG" -lt 2 ]; then
  echo ""
  echo "WARNING: Link density below 2 — graph is sparse. Run /reflect to add connections."
elif [ "$AVG" -ge 3 ]; then
  echo ""
  echo "HEALTHY: Link density >= 3"
fi
