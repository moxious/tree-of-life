---
description: Why each configuration dimension was chosen for this progressive context database
category: derivation-rationale
created: 2026-05-08
status: active
---

# derivation rationale for progressive context database

## Context

This vault was initialized on 2026-05-08 as a general research tool: a system that fetches background knowledge for tasks and builds a progressive context database over time. The core insight driving all architectural choices is that this is a **compounding system** — every research task adds notes, every note adds potential connections, and every connection makes existing notes more findable and valuable.

## Dimension Choices

**Granularity: atomic**

The signal was "context database" — discrete knowledge units that accumulate and compound. Atomic granularity (one claim per note) is essential because it maximizes composability: each note can be linked independently, compared across sources, and retrieved precisely. Moderate granularity (per-topic notes) would bundle claims and make cross-source comparison harder. For a research tool designed to build up background knowledge, atomicity is the correct choice.

**Organization: flat**

Research preset default, and research-validated. Flat organization with wiki links and topic maps prevents domain silos. As the vault covers more topics (fetching background from diverse domains), folder-per-domain would create barriers to cross-domain connection — exactly what this system is designed to surface.

**Linking: explicit+implicit (semantic search active)**

The signal was cross-domain research. Different domains use different vocabulary for related concepts — "context window limits" and "attention span constraints" might refer to similar phenomena described in different registers. Keyword search misses these. Semantic search (qmd, when installed) finds them. Explicit wiki links handle known connections; semantic search handles vocabulary divergence.

**Processing: heavy**

The system fetches background knowledge — it is an active research tool. Heavy processing (full pipeline: reduce → reflect → reweave → verify) is appropriate because:
1. Research results require transformation to become usable notes
2. High creation volume needs systematic quality gates
3. The compounding value requires careful connections, not just storage

**Navigation: 3-tier**

"Progressive accumulation over time" implies growing volume. At low volume (50 notes), 2-tier navigation suffices. But this system is designed to grow — fetching knowledge across many domains, many tasks, over many sessions. 3-tier navigation (hub → domain topic maps → topic topic maps → notes) scales to hundreds of notes.

**Maintenance: condition-based with tight thresholds**

Accumulation over time + heavy processing generates maintenance targets faster than lax conditions catch. Tight thresholds (orphan detection fires on any orphan, rethink triggers at 10 observations) keep the system clean as volume grows.

**Schema: moderate**

Research queries benefit from: source (provenance chain), confidence (epistemics), type (enables filtering by claim type), created (temporal queries). Dense schema (many required fields) would slow capture; minimal schema (just description) would lose queryability. Moderate schema balances both.

**Automation: full**

Claude Code platform + tool context (not a personal journal) = full automation. All skills, all hooks, all pipeline mechanisms are active from day one.

## Coherence Validation

Hard constraints checked: none violated.

Soft constraints:
- atomic + heavy processing → compatible (heavy processing IS the mechanism that keeps atomic notes connected)
- explicit+implicit linking + semantic search → compatible once qmd is installed; system falls back to keyword search + topic map traversal without it
- 3-tier navigation + condition-based maintenance → compatible; maintenance conditions include topic map oversizing

Compensating mechanisms: semantic search compensates for cross-domain vocabulary divergence.

## Failure Mode Risks

1. **Collector's Fallacy (HIGH)** — fetching background knowledge creates easy accumulation; WIP limits and inbox processing discipline are critical
2. **Orphan Drift (HIGH)** — high creation volume requires mandatory /reflect after every processing batch
3. **Verbatim Risk (HIGH)** — research results tempt storage over transformation; generation effect discipline is essential
4. **Productivity Porn (HIGH)** — building the database about building the database; content/system ratio matters

---

Topics:
- [[methodology]]
