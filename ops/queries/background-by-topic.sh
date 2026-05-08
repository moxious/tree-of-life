#!/usr/bin/env bash
# background-by-topic.sh — Find background context notes grouped by topic map
# Usage: ./background-by-topic.sh [topic-map-name]
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TOPIC="${1:-}"

echo "=== Background Context Notes ==="
if [ -n "$TOPIC" ]; then
  echo "(filtered to topic: $TOPIC)"
  rg '^type: background' "$VAULT_DIR/notes/" --include="*.md" -l | xargs rg "\[\[$TOPIC\]\]" -l 2>/dev/null | while read -r f; do
    echo "  $(basename "$f" .md)"
    rg '^description:' "$f" | head -1 | sed 's/^description: */    /'
  done
else
  rg '^type: background' "$VAULT_DIR/notes/" --include="*.md" -l | while read -r f; do
    echo "  $(basename "$f" .md)"
    rg '^description:' "$f" | head -1 | sed 's/^description: */    /'
  done
fi
