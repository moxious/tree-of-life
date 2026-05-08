#!/usr/bin/env bash
# auto-commit.sh — PostToolUse (Write) async hook for progressive context database vault
# Auto-commits vault changes after writes

VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MARKER="$VAULT_DIR/.arscontexta"

if [ ! -f "$MARKER" ]; then
  exit 0
fi

# Check git config flag
if command -v python3 &>/dev/null; then
  GIT_ENABLED=$(python3 -c "
import sys, re
try:
    content = open('$MARKER').read()
    m = re.search(r'^git:\s*(true|false)', content, re.MULTILINE)
    print(m.group(1) if m else 'true')
except:
    print('true')
" 2>/dev/null)
else
  GIT_ENABLED="true"
fi

if [ "$GIT_ENABLED" = "false" ]; then
  exit 0
fi

cd "$VAULT_DIR" || exit 0

# Only commit if this is a git repo
if [ ! -d ".git" ]; then
  exit 0
fi

# Stage all changes in vault
git add -A . 2>/dev/null

# Only commit if there are staged changes
if git diff --cached --quiet; then
  exit 0
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "vault: auto-commit $TIMESTAMP" --quiet 2>/dev/null

exit 0
