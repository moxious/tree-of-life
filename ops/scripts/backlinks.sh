#!/usr/bin/env bash
# backlinks.sh — Count and list incoming links to a note
# Usage: ./backlinks.sh "note title" [--count]
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET="$1"
MODE="${2:-list}"

if [ -z "$TARGET" ]; then
  echo "Usage: ./backlinks.sh \"note title\" [--count]"
  exit 1
fi

if [ "$MODE" = "--count" ]; then
  grep -rl "\[\[$TARGET\]\]" "$VAULT_DIR" --include="*.md" 2>/dev/null | wc -l | tr -d ' '
else
  echo "=== Backlinks to: $TARGET ==="
  grep -rl "\[\[$TARGET\]\]" "$VAULT_DIR" --include="*.md" 2>/dev/null | while read -r file; do
    echo "  $(basename "$file" .md)"
    grep -n "\[\[$TARGET\]\]" "$file" | head -2 | sed 's/^/    /'
  done
fi
