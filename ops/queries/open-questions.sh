#!/usr/bin/env bash
# open-questions.sh — Find all open questions worth investigating
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
echo "=== Open Questions (type: question) ==="
rg '^type: question' "$VAULT_DIR/notes/" --include="*.md" -l | while read -r f; do
  echo "  $(basename "$f" .md)"
  rg '^description:' "$f" | head -1 | sed 's/^description: */    /'
done
