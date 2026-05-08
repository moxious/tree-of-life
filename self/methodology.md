---
description: How I process, connect, and maintain the progressive context database
type: moc
---

# methodology

## Principles

- **Prose-as-title:** Every note is a proposition. The title IS the claim — expressed in the words that capture it precisely, even if that takes a full sentence.
- **Wiki links:** Connections as graph edges. Every link carries semantic weight via the surrounding prose that explains the relationship.
- **Topic maps:** Attention management hubs. Created when 5+ related notes accumulate, not speculatively.
- **Capture fast, process slow:** Speed of capture beats precision of filing. Processing happens in fresh context with focused attention.
- **Provenance chain:** Research query → inbox file (with YAML metadata) → /reduce → notes/. Every extracted note links back to its source.

## My Process

### Session Start
1. Read vault structure (tree injection via session-orient.sh hook)
2. Check ops/goals.md for active threads
3. Check ops/reminders.md for time-bound items
4. Run /next to surface highest-priority queue items and fired conditions
5. If 10+ pending observations or 5+ pending tensions, run /rethink before other work

### Processing Incoming Research
1. Research results land in inbox/ with provenance YAML
2. /reduce extracts atomic notes — one claim per file, prose-as-title
3. /reflect finds connections — forward pass to existing notes + topic map updates
4. /reweave handles backward pass — older notes updated with new connections
5. /verify checks quality — description, schema, link health
6. Task queue tracks each note through the pipeline

### Connection-Finding Standards
- Not "related to" but "extends X by adding Y" or "contradicts X because Z"
- Semantic search before claiming no duplicates exist
- Bidirectional linking when genuine relationship exists in both directions
- Every note lands in at least one topic map with a context phrase

### Quality Gates
- Description must add information beyond the title (cold-read test)
- Claim must be specific enough to disagree with
- Wiki links must point to real files (no dangling links)
- Source field links back to inbox file for research-derived notes

---

Topics:
- [[identity]]
