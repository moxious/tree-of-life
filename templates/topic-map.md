---
_schema:
  entity_type: "topic-map"
  applies_to: "notes/*-map.md notes/index.md"
  required:
    - description
  optional:
    - type
    - created
  enums:
    type:
      - moc
  constraints:
    description:
      max_length: 200
      format: "One sentence describing what this topic map covers"

# --- Topic map frontmatter starts below ---

description: ""
type: moc
created: YYYY-MM-DD
---

# [topic map name]

Brief orientation — 2-3 sentences explaining what this topic covers and how to use this map.

## Core Ideas

- [[note]] — context explaining why this matters here
- [[note]] — what this adds to the topic

## Tensions

Unresolved conflicts — intellectual work, not bugs. What questions remain open? Where do ideas clash?

## Open Questions

What is unexplored. Research directions, gaps in understanding, areas that need attention.
