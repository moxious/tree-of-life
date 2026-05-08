#!/usr/bin/env bash
# dangling-links.sh — Find wiki links pointing to non-existent notes
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "=== Dangling Links ==="
DANGLING=0

# Extract all [[link targets]] from all markdown files
grep -roh '\[\[[^\]]*\]\]' "$VAULT_DIR" --include="*.md" 2>/dev/null | \
  sed 's/\[\[//g; s/\]\]//g' | \
  sort -u | \
  while read -r target; do
    # Check if the file exists anywhere in the vault
    found=$(find "$VAULT_DIR" -name "${target}.md" -not -path "*/.git/*" 2>/dev/null | head -1)
    if [ -z "$found" ]; then
      echo "  DANGLING: [[$target]]"
      DANGLING=$((DANGLING + 1))
    fi
  done

echo ""
echo "Run: rg '\\[\\[target\\]\\]' --include='*.md' to find which files contain a dangling link"
