---
_schema:
  entity_type: "research-note"
  applies_to: "notes/*.md"
  required:
    - description
  optional:
    - type
    - created
    - source
    - confidence
    - status
  enums:
    type:
      - insight
      - pattern
      - background
      - fact
      - question
      - tension
      - methodology
    confidence:
      - high
      - medium
      - speculative
    status:
      - preliminary
      - open
      - active
      - archived
  constraints:
    description:
      max_length: 200
      format: "One sentence adding context beyond the title, no trailing period"

# --- Note frontmatter starts below ---

description: ""
type: insight
created: YYYY-MM-DD
source: "[[]]"        # link to inbox source file (delete if not research-derived)
confidence: high      # high | medium | speculative (delete if not needed)
---

# [prose-as-title: a complete claim, not a topic label]

[Content. This note argues that [title]. The reasoning is...]

---

Relevant Notes:
- [[related note]] — relationship context

Topics:
- [[topic-map-name]]
