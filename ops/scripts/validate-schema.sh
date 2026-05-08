#!/usr/bin/env bash
# validate-schema.sh — Validate notes against schema requirements
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
NOTES_DIR="$VAULT_DIR/notes"

echo "=== Schema Validation ==="
PASS=0
WARN=0
FAIL=0

for file in "$NOTES_DIR"/*.md; do
  [ -f "$file" ] || continue
  title=$(basename "$file" .md)
  issues=()

  # Check description
  if ! grep -q "^description:" "$file"; then
    issues+=("FAIL: missing description")
    FAIL=$((FAIL + 1))
  else
    desc=$(grep "^description:" "$file" | head -1 | sed 's/^description: *//')
    if [ -z "$desc" ] || [ "$desc" = '""' ]; then
      issues+=("FAIL: empty description")
      FAIL=$((FAIL + 1))
    elif [ "${#desc}" -lt 20 ]; then
      issues+=("WARN: description too short (< 20 chars)")
      WARN=$((WARN + 1))
    fi
  fi

  # Check Topics footer
  if ! grep -q "^Topics:" "$file"; then
    issues+=("WARN: missing Topics footer")
    WARN=$((WARN + 1))
  fi

  if [ ${#issues[@]} -eq 0 ]; then
    PASS=$((PASS + 1))
  else
    echo ""
    echo "  $title:"
    for issue in "${issues[@]}"; do
      echo "    $issue"
    done
  fi
done

echo ""
echo "Results: PASS=$PASS  WARN=$WARN  FAIL=$FAIL"
