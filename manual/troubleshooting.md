---
description: Common issues and resolution patterns for the progressive context database
type: manual
generated_from: "arscontexta-0.8.0"
---

# Troubleshooting

## Orphan Notes

Notes with no incoming links are invisible to traversal.

**Detect:** `./ops/scripts/orphan-notes.sh`
**Fix:** Run /reflect on the orphaned note to find connections. Add it to at least one topic map via Topics footer.

## Dangling Links

Wiki links to non-existent notes.

**Detect:** `./ops/scripts/dangling-links.sh`
**Fix:** Either create the missing note, or remove the dangling link. Never leave dangling links as a permanent state.

## Stale Content

Notes not updated in 30+ days with sparse connections.

**Detect:** `rg '^created:' notes/ | sort -t: -k2 | head -20`
**Fix:** Run /reweave on old notes to check if newer notes should link back.

## Methodology Drift

System behavior diverging from methodology spec.

**Detect:** `/arscontexta:rethink drift`
**Fix:** Review ops/methodology/ — when methodology notes say "do X" and the system does Y, that's drift. Update either the methodology (if behavior is correct) or the behavior (if methodology is correct). Use /remember to capture corrections.

## Inbox Overflow

Too many items accumulating in inbox/.

**Detect:** `ls inbox/ | wc -l`
**Fix:** WIP limit enforcement — stop fetching, start processing. Run /pipeline or /seed on inbox items. If volume is unmanageable, switch `depth: quick` in ops/config.yaml temporarily.

## Pipeline Stalls

Tasks stuck in queue without progressing.

**Detect:** `./ops/scripts/queue-status.sh`
**Fix:** Run /next to surface stalled batches. Check the task file for the stalled note — the `current_phase` shows where it stopped. Re-run the appropriate skill.

## Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Writing directly to notes/ | Route through inbox/ → /reduce |
| Bare link lists in topic maps | Add context phrases explaining each entry |
| Titles that are topic labels | Rewrite as prose claims: "X does Y" not "X overview" |
| Missing description | Write descriptions that add info beyond the title |
| Skipping /reflect | Every note needs connections — run /reflect before moving on |

See [[meta-skills]] for /rethink and /remember, [[configuration]] for threshold adjustments.

---

See [[manual]] for all manual pages.
