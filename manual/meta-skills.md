---
description: Deep guide to /ask, /architect, /rethink, and /remember for the progressive context database
type: manual
generated_from: "arscontexta-0.8.0"
---

# Meta-Skills

Meta-skills are for reasoning about the system itself, not for processing knowledge.

## /ask

Query the bundled research knowledge base (249 methodology notes) plus your local methodology.

```
/ask "why does my system use atomic notes?"
/ask "what are the trade-offs of condition-based maintenance?"
/ask "how should I handle sources that span multiple domains?"
```

/ask consults two layers:
- **Local methodology** (ops/methodology/) — "How does MY system work?" questions
- **Research graph** (249 bundled notes) — "Why is this a good idea in general?" questions

## /architect

Research-backed configuration advice. Reads ops/derivation.md, ops/methodology/, and accumulated observations. Proposes changes with reasoning — never implements without approval.

```
/arscontexta:architect "I'm getting too many orphan notes — what should I change?"
/arscontexta:architect "Should I enable semantic search?"
/arscontexta:architect "My inbox is always full — help me think about this"
```

Best used after 50+ notes when friction patterns have had time to emerge.

## /rethink

Reviews accumulated observations and tensions. Triggered automatically by /next when:
- 10+ pending observations in ops/observations/
- 5+ pending tensions in ops/tensions/

For each pending item, /rethink decides: PROMOTE (to notes/), IMPLEMENT (update context file or methodology), ARCHIVE, or KEEP PENDING.

This is the scientific method applied to your knowledge system: observe, accumulate evidence, evaluate when patterns emerge, revise.

```
/arscontexta:rethink               # review all pending
/arscontexta:rethink drift         # check for methodology drift
```

## /remember

Rule Zero: methodology as canonical specification. /remember is how operational corrections get formalized.

```
/arscontexta:remember "always check for duplicates before creating a note about X"
/arscontexta:remember "sources from domain Y should be tagged with confidence: speculative"
```

/remember writes to ops/methodology/ as its primary action. The methodology folder is the source of truth for system behavior.

Session capture also detects friction automatically from transcripts — /remember is for explicit, immediate capture.

---

See [[manual]] for all manual pages.
