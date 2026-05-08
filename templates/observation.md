---
_schema:
  entity_type: "observation"
  applies_to: "ops/observations/*.md"
  required:
    - description
    - category
    - status
    - observed
  optional: []
  enums:
    category:
      - friction
      - surprise
      - process-gap
      - methodology
    status:
      - pending
      - promoted
      - implemented
      - archived
  constraints:
    description:
      format: "What happened and what it suggests"

# --- Observation frontmatter starts below ---

description: ""
category: friction      # friction | surprise | process-gap | methodology
status: pending
observed: YYYY-MM-DD
---

# [the observation as a complete sentence]

What happened, why it matters, and what might change.
