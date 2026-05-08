---
description: First session guide — creating your first note and building connections in the progressive context database
type: manual
generated_from: "arscontexta-0.8.0"
---

# Getting Started

## What to Expect in Your First Session

Your vault starts empty. The first session establishes your working patterns. You will:
1. Orient to the system structure
2. Fetch or provide some source material
3. Run /reduce to extract your first note
4. Run /reflect to find connections (the first note won't have many, but the habit matters)
5. Verify the note with /verify

## Creating Your First Note

The right way: place source material in inbox/ with provenance metadata, then run /reduce.

```
inbox/2026-05-08-first-research.md:
---
source_type: manual
research_prompt: "initial context database setup"
generated: "2026-05-08T00:00:00Z"
---
[content here]
```

Then: `/reduce inbox/2026-05-08-first-research.md`

The skill will extract atomic notes to notes/ with proper schema and queue them for the next pipeline phases.

## How Connections Work

Every note should connect to at least one topic map and ideally to other notes directly. Connection quality standard: not "related to" but "extends X by adding Y" or "provides the foundation for Z."

Topic maps live in notes/ with descriptive names. The hub is notes/index.md.

## The Session Rhythm

Every session: **Orient → Work → Persist**

- Orient: read ops/goals.md, check /next for queue state and fired maintenance conditions
- Work: the actual research and processing
- Persist: update ops/goals.md, commit changes

## Where to Go Next

- [[workflows]] — The full processing pipeline explained
- [[skills]] — Every command you can run

---

See [[manual]] for all manual pages.
