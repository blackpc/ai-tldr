# CLAUDE.md

## Project

AI/TLDR — a high-volume AI release tracker. Single-page React app powered by
a JSON feed that an automated agent refreshes every 8 hours.

## Quick commands

```bash
bun install        # install deps
bun dev            # dev server
bun run typecheck  # type-check
bun run build      # production build
```

## Key conventions

### Feed ordering

The feed is a **single chronological stream sorted by release date DESC**.
There is NO grouping by importance. Card size (grid span) is driven by the
`importance` field (seismic = large, major = medium, notable = small), but
all items flow together in one date-ordered list.

### Dates are real release dates

The `date` field on every item is the **original public release date**, not
the date the agent discovered it. Retroactive additions (e.g. a cool tool
from months ago) appear at their correct chronological position, not at the
top of the feed.

### Content updates

All content lives in `src/data/releases.json`. The agent prompt is
`prompts/update-releases.md` — that file is the single source of truth for
how the feed gets updated. The agent must use web search/fetch and verify
every URL. No hallucination.

### Zero-hallucination policy

Every URL, image, metric, and claim must be fetched and verified. If it
can't be verified, drop the item.
