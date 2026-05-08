---
description: How this knowledge system was derived -- enables architect and reseed commands
created: 2026-05-08
engine_version: "1.0.0"
---

# System Derivation

## Configuration Dimensions

| Dimension | Position | Conversation Signal | Confidence |
|-----------|----------|--------------------|--------------------|
| Granularity | atomic | "general research tool", "context database" — discrete knowledge units | High |
| Organization | flat | Research preset default; flat enables cross-domain linking | Inferred |
| Linking | explicit+implicit | "background knowledge for tasks" — cross-domain connections needed; implicit linking via semantic search | High |
| Processing | heavy | "fetches background knowledge for tasks" — active retrieval, extraction, and synthesis | High |
| Navigation | 3-tier | "progressive context database over time" — accumulation implies volume requiring deep hierarchy | High |
| Maintenance | condition-based | Accumulation over time requires condition-triggered maintenance | Medium |
| Schema | moderate | Research domain: description, source, topics, confidence fields needed | Inferred |
| Automation | full | Tool context (not personal journal), Claude Code platform | High |

## Personality Dimensions

| Dimension | Position | Signal |
|-----------|----------|--------|
| Warmth | clinical | No personal/emotional signals; research/tool context | default |
| Opinionatedness | neutral | Research tool — conclusions should be user's | default |
| Formality | formal | Professional tool context | default |
| Emotional Awareness | task-focused | Task-oriented tool, no emotional content | default |

Personality enabled: false (neutral-helpful default)

## Vocabulary Mapping

| Universal Term | Domain Term | Category |
|---------------|-------------|----------|
| notes | notes | folder |
| inbox | inbox | folder |
| archive | archive | folder |
| note (type) | note | note type |
| reduce | reduce | process phase |
| reflect | reflect | process phase |
| reweave | reweave | process phase |
| verify | verify | process phase |
| MOC | topic map | navigation |
| description | description | schema field |
| topics | topics | schema field |
| relevant_notes | relevant notes | schema field |
| source | source | schema field (domain-specific) |
| confidence | confidence | schema field (domain-specific) |
| orient | orient | session phase |
| persist | persist | session phase |

## Platform

- Tier: Claude Code
- Automation level: full
- Automation: full (default)

## Active Feature Blocks

- [x] wiki-links — always included (kernel)
- [x] processing-pipeline — always included (heavy processing)
- [x] atomic-notes — included (granularity = atomic)
- [x] mocs — included (3-tier navigation)
- [x] semantic-search — included (linking = explicit+implicit)
- [x] schema — included (moderate schema)
- [x] maintenance — always included
- [x] self-evolution — always included
- [x] session-rhythm — always included
- [x] templates — always included
- [x] ethical-guardrails — always included
- [x] helper-functions — always included
- [x] graph-analysis — always included
- [ ] personality — excluded (neutral-helpful default, no signals)
- [ ] self-space — excluded (research preset default; goals route to ops/)
- [ ] multi-domain — excluded (single domain)

## Coherence Validation Results

- Hard constraints checked: 3. Violations: none
- Soft constraints checked: 7. Auto-adjusted: none. User-confirmed: none
- Compensating mechanisms active: semantic search compensates for cross-domain vocabulary divergence

## Failure Mode Risks

1. Collector's Fallacy (HIGH) — "fetches background knowledge" = active ingestion risk; WIP limit needed
2. Orphan Drift (HIGH) — high creation volume requires mandatory connection phase
3. Verbatim Risk (HIGH) — fetching knowledge = risk of storing vs transforming
4. Productivity Porn (HIGH) — building the tool vs accumulating knowledge

## Generation Parameters

- Folder names: notes/, inbox/, archive/, self/, templates/, ops/
- Note template: note.md
- MOC template: topic-map.md
- Skills to generate: reduce, reflect, reweave, verify, validate, seed, ralph, pipeline, tasks, stats, graph, next, learn, remember, rethink, refactor
- Hooks to generate: session-orient.sh, session-capture.sh, validate-note.sh, auto-commit.sh
- Topology: full (skills + hooks + pipeline + orchestration)
- Extraction categories: claims, evidence, methodology-notes, contradictions, open-questions, design-patterns, background-context
