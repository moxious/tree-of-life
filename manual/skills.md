---
description: Complete reference for every available command in the progressive context database
type: manual
generated_from: "arscontexta-0.8.0"
---

# Skills

All skills are available immediately. Restart Claude Code after /setup to activate them.

## Processing Skills

| Skill | Purpose | Example |
|-------|---------|---------|
| `/reduce` | Extract atomic notes from source material | `/reduce inbox/research-results.md` |
| `/reflect` | Find connections between notes, update topic maps | `/reflect "note title"` |
| `/reweave` | Backward pass — update older notes with new connections | `/reweave "note title"` |
| `/verify` | Quality check: description, schema, links | `/verify "note title"` |
| `/validate` | Schema validation across notes | `/validate notes/` |

## Orchestration Skills

| Skill | Purpose | Example |
|-------|---------|---------|
| `/seed` | Orchestrated full-pipeline from source to verified note | `/seed inbox/source.md` |
| `/ralph` | Research pipeline with provenance tracking | `/ralph "topic to research"` |
| `/pipeline` | Run a full processing batch from queue | `/pipeline` |
| `/tasks` | View and manage task queue state | `/tasks` |

## Navigation Skills

| Skill | Purpose | Example |
|-------|---------|---------|
| `/stats` | Vault metrics and progress visualization | `/stats` |
| `/graph` | Interactive graph analysis | `/graph triangles` |
| `/next` | Intelligent next-action recommendations from queue | `/next` |

## Growth Skills

| Skill | Purpose | Example |
|-------|---------|---------|
| `/learn` | Research a topic and grow your graph | `/learn "topic"` |
| `/remember` | Capture friction and methodology learnings | `/remember "observation"` |

## Evolution Skills

| Skill | Purpose | Example |
|-------|---------|---------|
| `/rethink` | Review accumulated observations and tensions | `/rethink` |
| `/refactor` | Restructure notes and topic maps | `/refactor` |

## Plugin Commands (/arscontexta:*)

| Command | Purpose |
|---------|---------|
| `/arscontexta:reduce` | Alias: extract insights from source material |
| `/arscontexta:reflect` | Alias: find connections |
| `/arscontexta:health` | Check your knowledge system |
| `/arscontexta:help` | See all available commands |
| `/arscontexta:next` | Get intelligent next-action recommendations |
| `/arscontexta:learn` | Research a topic and grow your graph |
| `/arscontexta:ask` | Query the bundled research knowledge base |
| `/arscontexta:architect` | Research-backed configuration advice |
| `/arscontexta:rethink` | Review observations and tensions |
| `/arscontexta:remember` | Capture friction and learnings |

See [[workflows]] for how skills chain together, [[meta-skills]] for detailed meta-skill docs.

---

See [[manual]] for all manual pages.
