#!/usr/bin/env bash
# untraced-claims.sh — Find notes without source attribution (provenance gap)
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
echo "=== Notes Without Source Attribution ==="
rg -L '^source:' "$VAULT_DIR/notes/"*.md 2>/dev/null | while read -r f; do
  # Skip MOCs
  grep -q "^type: moc" "$f" 2>/dev/null && continue
  echo "  $(basename "$f" .md)"
done
echo ""
echo "These notes may lack provenance chain. Add source: field linking to inbox file."
