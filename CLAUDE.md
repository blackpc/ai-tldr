# CLAUDE.md

## Project

AI/TLDR — a high-volume AI release tracker. Single-page React app powered by
a JSON feed that an automated agent refreshes every 8 hours.

## Quick commands

```bash
bun install        # install deps
bun dev            # dev server
bun run typecheck  # type-check
bun run build      # production build (vite + scripts/prerender.ts)
```

## Routing

Path-based, not hash-based:
- `/` → feed home
- `/influencers` → influencers page
- `/releases/<id>` → feed with the modal open for that release

`src/App.tsx` parses `window.location.pathname`. Modal open/close uses
`pushState` / `replaceState` — no page reloads. Legacy hash URLs
(`#<id>`, `#influencers`) still work as a fallback for old bookmarks.

## Build pipeline

`bun run build` runs three steps in order:

1. `tsc -b` — type-check the whole project
2. `vite build` — bundle the SPA into `dist/index.html` + assets
3. `bun scripts/prerender.ts` — post-processes `dist/` to generate:
   - `dist/index.html` (homepage with correct meta tags)
   - `dist/influencers/index.html`
   - `dist/releases/<id>/index.html` — one per release, with
     per-item `<title>`, `<meta>`, OG tags, Twitter card, and
     Article JSON-LD injected from `src/data/releases.json`
   - `dist/sitemap.xml` (all URLs)
   - `dist/robots.txt`

The prerender script is the **single source of truth for SEO**. It
reads `releases.json` directly, so whenever the agent updates the
feed, the next build produces a fresh static HTML file for every new
release without any manual work.

`public/_redirects` tells Cloudflare Pages to fall back to
`/index.html` with a 200 for any path that doesn't match a generated
file, so the SPA's client-side router handles unknown paths.

To override the base URL used in canonical tags + sitemap, set the
`SITE_URL` env var before running `bun run build`. Default is
`https://ai-tldr.dev` (the public domain).

## Key conventions

### Feed ordering

Two sort modes, toggled via the header switcher in `FilterBar`:

- **`publish` (default)** — orders by `publishDate` DESC (when we added the
  item to the feed). Newly ingested sweep items surface at the top and get
  a `NEW` badge for ~36h. This is what users see by default.
- **`release`** — orders by `date` DESC (original public release date).
  Useful for seeing the actual chronological release timeline.

Sort mode is session-only React state (not URL-stateful). Switching modes
resets scroll position and the visible-count slice. There is NO grouping by
importance. Card size (grid span) is driven by the `importance` field
(seismic = large, major = medium, notable = small), but all items flow
together in one date-ordered list.

### Dates: `date` vs `publishDate`

Each item has two dates:

- `date` — the **original public release date** (YYYY-MM-DD), always shown
  on the card and in meta/Article JSON-LD. Retroactive additions (e.g. a
  cool tool from months ago) keep their real release date here.
- `publishDate` — optional (YYYY-MM-DD). When the agent added the item to
  our feed. Defaults to `date` if omitted (backwards-compat for pre-2026-04
  entries). Used for the default sort and for the `NEW` badge (`isFresh`).

Every cron sweep that adds an item MUST set `publishDate` to the sweep's
day, so new additions float to the top under the default sort regardless
of how old their `date` is.

### Content updates

All content lives in `src/data/releases.json`. The agent prompt is
`prompts/update-releases.md` — that file is the single source of truth for
how the feed gets updated. The agent must use web search/fetch and verify
every URL. No hallucination.

### Zero-hallucination policy

Every URL, image, metric, and claim must be fetched and verified. If it
can't be verified, drop the item.
