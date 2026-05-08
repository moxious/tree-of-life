---
engine_version: "0.2.0"
research_snapshot: "2026-02-10"
generated_at: "2026-05-08T00:00:00Z"
platform: claude-code
kernel_version: "1.0"

dimensions:
  granularity: atomic
  organization: flat
  linking: explicit+implicit
  processing: heavy
  navigation: 3-tier
  maintenance: condition-based
  schema: moderate
  automation: full

active_blocks:
  - wiki-links
  - processing-pipeline
  - atomic-notes
  - mocs
  - semantic-search
  - schema
  - maintenance
  - self-evolution
  - methodology-knowledge
  - session-rhythm
  - templates
  - ethical-guardrails
  - helper-functions
  - graph-analysis

coherence_result: passed

vocabulary:
  # Level 1: Folder names
  notes: "notes"
  inbox: "inbox"
  archive: "archive"
  ops: "ops"

  # Level 2: Note types
  note: "note"
  note_plural: "notes"

  # Level 3: Schema field names
  description: "description"
  topics: "topics"
  relevant_notes: "relevant notes"

  # Level 4: Navigation terms
  topic_map: "topic map"
  hub: "index"

  # Level 5: Process verbs
  reduce: "reduce"
  reflect: "reflect"
  reweave: "reweave"
  verify: "verify"
  validate: "validate"
  rethink: "rethink"

  # Level 6: Command names
  cmd_reduce: "/reduce"
  cmd_reflect: "/reflect"
  cmd_reweave: "/reweave"
  cmd_verify: "/verify"
  cmd_rethink: "/rethink"

  # Level 7: Extraction categories
  extraction_categories:
    - name: "claims"
      what_to_find: "Direct assertions about the domain"
      output_type: "note"
    - name: "patterns"
      what_to_find: "Recurring structures across sources"
      output_type: "note"
    - name: "background-context"
      what_to_find: "Domain knowledge useful for future tasks"
      output_type: "note"
    - name: "contradictions"
      what_to_find: "Conflicting claims across sources"
      output_type: "tension note"
    - name: "open-questions"
      what_to_find: "Things worth investigating further"
      output_type: "note with type: question"
    - name: "methodology-notes"
      what_to_find: "Ways of working or processing that are worth remembering"
      output_type: "note with type: methodology"
    - name: "design-patterns"
      what_to_find: "Structural patterns applicable across domains"
      output_type: "note"

platform_hints:
  context: fork
  allowed_tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
  semantic_search_tool: "mcp__qmd__deep_search"
  semantic_search_autoapprove:
    - mcp__qmd__search
    - mcp__qmd__vector_search
    - mcp__qmd__deep_search
    - mcp__qmd__get
    - mcp__qmd__multi_get
    - mcp__qmd__status

personality:
  warmth: clinical
  opinionatedness: neutral
  formality: formal
  emotional_awareness: task-focused
---
