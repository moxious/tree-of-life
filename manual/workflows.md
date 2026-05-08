---
description: Processing pipeline, maintenance cycle, and session rhythm for the progressive context database
type: manual
generated_from: "arscontexta-0.8.0"
---

# Workflows

## The Processing Pipeline

Every piece of content flows through the same path:

```
Research / Fetch → inbox/ → /reduce → notes/ → /reflect → /reweave → /verify
```

**1. Capture:** Research results land in inbox/ with provenance YAML metadata. No structuring at capture time — just get it in with the source tracked.

**2. /reduce:** Extract atomic notes from inbox content. One claim per file, titled as a prose proposition. Selectivity gate: extract only what adds genuine insight.

**3. /reflect:** Find connections — forward pass to existing notes, topic map updates. Connection quality: "extends X by adding Y" not just "related to."

**4. /reweave:** Backward pass — update older notes that should now link to the new ones. Asks: "If I wrote this older note today, what would be different?"

**5. /verify:** Quality check — cold-read test on description, schema compliance, link health.

### Batch Processing

For multiple notes, use /pipeline or /seed to orchestrate the full pipeline with task queue tracking. Each note gets one queue entry progressing through phases.

For high-volume catch-up: switch to `depth: quick` in ops/config.yaml.

## Session Rhythm

```
Orient → Work → Persist
```

**Orient:** Read ops/goals.md, run /next to see queue state and fired maintenance conditions. If 10+ pending observations or 5+ pending tensions, run /rethink first.

**Work:** The actual research and processing. Every note earns its place in the graph by having connections and a quality description.

**Persist:** Update ops/goals.md with current threads. Commit changes. Session-end hooks capture the transcript to ops/sessions/ automatically.

## Maintenance Cycle

Maintenance is condition-based, not scheduled. /next evaluates conditions on every invocation:

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Orphan notes | Any | Connect or archive |
| Dangling links | Any | Fix or remove |
| Inbox pressure | >3 days old | Process |
| Observations pending | >=10 | Run /rethink |
| Tensions pending | >=5 | Run /rethink |
| Topic map oversized | >40 notes | Split |

See [[configuration]] for adjusting thresholds, [[meta-skills]] for /rethink and /remember details.

---

See [[manual]] for all manual pages.
