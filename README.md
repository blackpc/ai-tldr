# AI/TLDR

A comprehensive, real-time tracker of everything shipping in AI.

## What this is

AI/TLDR is **not** a curated newsletter that picks 10 highlights per week.
It is a **high-volume feed** that captures every notable AI release — models,
tools, repos, tutorials, datasets, benchmarks, showcases, and more. Think
Hacker News or Product Hunt, but specifically for AI.

The volume is high because AI moves fast. Dozens of things ship every day
across hundreds of labs and thousands of repos. The quality bar is "is this
real and verifiable" — not "is this one of the top 5 this week." Categories
and filters exist so users can navigate a large feed, not to limit what
goes in.

## Who it's for

AI enthusiasts, developers, ML practitioners, tinkerers — anyone who wants
to know what shipped today and what they can try tonight. The tone is
practical and social, not academic. Every release has a plain-English
explainer (what is it, how it works, why it matters) so you actually
understand what you're looking at.

## How it works

1. **Content lives in a single JSON file** (`src/data/releases.json`)
   that conforms to the schema in `src/data/schema.ts`.
2. **An automated agent** runs on a cron schedule (every 8 hours via
   GitHub Actions) and refreshes the feed by following the prompt in
   `prompts/update-releases.md`. The agent uses web search and fetch
   to discover and verify every release — no hallucination, no
   invented URLs, no made-up metrics.
3. **The frontend** is a Bun + Vite + React + TypeScript single-page
   app with a brutalist editorial design. The feed is a **single
   chronological stream sorted by release date** (newest first). Card
   size is driven by importance (seismic = large, notable = small) but
   there is no grouping — all items flow together. Cards are filterable
   by category and searchable. Clicking a card opens a detail modal
   with the full explainer and verified source links.

## Key design decisions

- **Flat chronological feed.** Items are sorted by real release date
  (newest first), never grouped by importance. Card size reflects
  importance visually, but the stream is continuous. Old discoveries
  (e.g. a cool tool from 6 months ago) land at their correct date
  position, not at the top.
- **Real release dates, not discovery dates.** The `date` field is
  always the original public release date from the primary source.
  This means retroactive additions appear in their correct place.
- **No quantity caps.** If 30 things ship in a day, the feed shows 30
  things. The agent does not skip releases to hit a target number.
- **Multi-category items.** Each release can belong to multiple
  categories (e.g. a trending GitHub repo that ships a working CLI is
  `["repo", "tool"]`). Filter chips match any category.
- **Zero-hallucination policy.** Every URL, image, metric, and claim
  in the feed must be fetched and verified by the agent in the run
  that produced it. If a URL can't be verified, the item gets dropped.
- **Diversity by design.** The agent checks for underrepresented
  categories after its first search pass and runs additional searches
  to fill gaps — no hardcoded product names or niche lists.
- **Explainers are the product.** Every item has a structured explainer
  (what is it / how it works / why it matters / who it's for / how to
  try it). This is the thing that makes the site worth visiting vs.
  just scrolling GitHub trending.

## Architecture

```
src/
  data/
    schema.ts          # TypeScript types (ReleaseItem, ReleaseFeed, Category, etc.)
    releases.json      # The content — written by the agent, rendered by the UI
    categories.ts      # Category metadata (labels, glyphs, blurbs)
    feed.ts            # Typed accessors, filters, sort helpers
  components/
    ReleaseCard.tsx     # Grid card with image, badges, tagline
    ReleaseModal.tsx    # 16:9 detail modal with explainer panels + sources
    ReleaseImage.tsx    # Image with onError fallback
    FilterBar.tsx       # Category chips + search input
  App.tsx               # Page shell, filter state, URL-driven modal
  App.css               # All layout + component styles
  index.css             # Global reset + CSS variables
  main.tsx              # React entrypoint

prompts/
  update-releases.md    # The agent prompt — single source of truth for content updates

.github/workflows/
  update-releases.yml   # Cron job that runs the agent every 8 hours
```

## Running locally

```bash
bun install
bun dev
```

## Adding a category

1. Add the value to the `Category` union and `CATEGORY_ORDER` in `src/data/schema.ts`.
2. Add a matching entry in `src/data/categories.ts`.
3. Done — filter chips, cards, and modal badges pick it up automatically.

## Updating content

The feed updates automatically via GitHub Actions. To trigger manually:

```bash
gh workflow run "Update releases (every 8h)" --repo blackpc/ai-tldr
```

Or run the agent locally by spawning a Claude Code subagent with
`prompts/update-releases.md` as the task prompt.

## License

MIT
