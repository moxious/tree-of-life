#!/usr/bin/env bash
# speculative-claims.sh — Find notes with low confidence that may need verification
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
echo "=== Speculative Claims (confidence: speculative) ==="
rg '^confidence: speculative' "$VAULT_DIR/notes/" --include="*.md" -l | while read -r f; do
  echo "  $(basename "$f" .md)"
  rg '^description:' "$f" | head -1 | sed 's/^description: */    /'
done
