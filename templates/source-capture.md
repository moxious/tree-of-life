---
_schema:
  entity_type: "source-capture"
  applies_to: "inbox/*.md"
  required:
    - source_type
    - research_prompt
    - generated
  optional:
    - research_server
    - research_model
  enums:
    source_type:
      - research
      - web-search
      - manual
      - voice
      - import
  constraints:
    research_prompt:
      format: "The query or directive that generated this content"

# --- Source capture frontmatter starts below ---

source_type: research       # research | web-search | manual | voice | import
research_prompt: ""         # the query or directive that generated this content
research_server: ""         # exa | google | brave | manual
research_model: ""          # exa-research-pro | n/a
generated: "YYYY-MM-DDTHH:MM:SSZ"
---

# [source title or description]

[Raw content from research. This file is UNPROCESSED. Run /reduce to extract notes from it.]

## Raw Content

[paste content here]
