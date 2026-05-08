#!/usr/bin/env bash
# queue-status.sh — View task queue status
VAULT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
QUEUE_FILE="$VAULT_DIR/ops/queue/queue.json"

echo "=== Queue Status ==="

if [ ! -f "$QUEUE_FILE" ]; then
  echo "No queue file found at ops/queue/queue.json"
  exit 0
fi

if ! command -v python3 &>/dev/null; then
  echo "python3 not available — showing raw queue:"
  cat "$QUEUE_FILE"
  exit 0
fi

python3 << EOF
import json
with open('$QUEUE_FILE') as f:
    q = json.load(f)

tasks = q.get('tasks', [])
if not tasks:
    print("Queue is empty.")
else:
    pending = [t for t in tasks if t.get('status') == 'pending']
    done = [t for t in tasks if t.get('status') == 'done']

    print(f"Total tasks: {len(tasks)}")
    print(f"  Pending: {len(pending)}")
    print(f"  Done: {len(done)}")
    print()

    if pending:
        print("Pending tasks:")
        for t in pending[:10]:
            phase = t.get('current_phase', '?')
            target = t.get('target', t.get('id', '?'))[:50]
            print(f"  [{phase}] {target}")
        if len(pending) > 10:
            print(f"  ... and {len(pending) - 10} more")
EOF
