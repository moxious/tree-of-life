---
description: How to adjust your progressive context database via config.yaml and /architect
type: manual
generated_from: "arscontexta-0.8.0"
---

# Configuration

## ops/config.yaml

The live operational configuration. Edit to adjust dimensions without re-running /setup.

Key fields:

```yaml
processing:
  depth: standard          # deep | standard | quick
  chaining: suggested      # manual | suggested | automatic
  extraction:
    selectivity: moderate  # strict | moderate | permissive

provenance: full           # full | minimal | off
```

**Processing depth:**
- `deep` — Fresh context per phase, maximum quality. For important research sources.
- `standard` — Sequential phases, balanced attention. Regular use (default).
- `quick` — Compressed pipeline, combined phases. High-volume catch-up.

**Chaining modes:**
- `manual` — Skills output "Next: /skill [target]" — you decide
- `suggested` — Adds next step to task queue (default)
- `automatic` — Next phase runs immediately

## Using /architect

For guided configuration changes backed by research:

```
/arscontexta:architect "I want to adjust processing depth"
/arscontexta:architect "Should I enable self-space?"
/arscontexta:architect "What dimension changes would help with [problem]?"
```

/architect reads ops/derivation.md, ops/methodology/, and accumulated observations to give research-backed recommendations. It proposes changes — never implements them without approval.

## What Your Configuration Includes

This vault was configured with the **Research** preset:
- Atomic granularity (one claim per file)
- Flat organization with topic map overlay
- Explicit + implicit linking (semantic search)
- Heavy processing (full pipeline)
- 3-tier navigation
- Condition-based maintenance
- Moderate schema
- Full automation

See ops/derivation.md for the complete rationale and ops/methodology/derivation-rationale.md for the narrative explanation.

---

See [[manual]] for all manual pages.
