---
description: Human-readable view of the task queue — pipeline tasks and maintenance items
type: moc
---

# tasks

This is the human-readable view of the task queue. The machine-readable version is at `ops/queue/queue.json`.

## Current Queue

(empty — vault newly initialized)

## How to Use

- `/next` — get intelligent next-action recommendation from queue + condition reconciliation
- `/tasks` — view queue status
- `/pipeline` — process a batch from the queue
- `ops/scripts/queue-status.sh` — raw queue status

## Condition-Based Maintenance

Maintenance tasks appear automatically when conditions are violated. Fix the underlying issue and the task disappears on next `/next` invocation.

| Condition | Threshold | Priority |
|-----------|-----------|----------|
| Orphan notes | 1 | session |
| Dangling links | 1 | session |
| Inbox pressure | 3 items | session |
| Schema violations | 1 | session |
| Observations pending | 10 | slow |
| Tensions pending | 5 | slow |
| Topic map oversized | 40 notes | slow |
| Stale health check | 7 days | multi-session |
