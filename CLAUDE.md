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

Single sort: `publishDate` DESC (when we added the item to the feed).
Newly ingested sweep items surface at the top. There is NO grouping by
importance and NO user-facing sort switcher. Card size (grid span) is
driven by the `importance` field (seismic = large, major = medium,
notable = small), but all items flow together in one date-ordered list.

### Dates: `date` vs `publishDate`

Each item has two dates:

- `date` — the **original public release date** (YYYY-MM-DD), always shown
  on the card and in meta/Article JSON-LD. Retroactive additions (e.g. a
  cool tool from months ago) keep their real release date here.
- `publishDate` — optional (YYYY-MM-DD). When the agent added the item to
  our feed. Defaults to `date` if omitted (backwards-compat for pre-2026-04
  entries). Used for feed ordering.

Every cron sweep that adds an item MUST set `publishDate` to the sweep's
day, so new additions float to the top regardless of how old their
`date` is.

### Content updates

All content lives in `src/data/releases.json`. The agent prompt is
`prompts/update-releases.md` — that file is the single source of truth for
how the feed gets updated. The agent must use web search/fetch and verify
every URL. No hallucination.

**Before running OR modifying the sweep agent, read
[SWEEP_MEMORY.md](SWEEP_MEMORY.md).** That file is the persistent history
of sweep tunings — what we tried, what failed, what stuck, and why. If
the user is unsatisfied with sweep output, append a new entry to
`SWEEP_MEMORY.md` describing the trigger, root cause, change, and status
**before** declaring the fix done. Do not re-introduce a pattern flagged
as broken there. Do not re-fix something already solved unless you can
explain why the previous fix didn't hold.

### Zero-hallucination policy

Every URL, image, metric, and claim must be fetched and verified. If it
can't be verified, drop the item.

## UI work: verify in the browser

**`bun run typecheck` does NOT mean a UI change is done.** Types are
satisfied ≠ the feature still works. Layout bugs, z-index/stacking
regressions, `overflow: hidden` clipping, popover positioning, mobile
breakpoints, and "I accidentally hid a button I didn't touch" problems
all pass typecheck cleanly.

For any non-trivial UI change (anything touching layout, CSS positioning,
responsive breakpoints, header, filter bar, card structure, modal, or
z-index), before calling the task done:

1. **Start `bun dev` and load the page in a browser.** Verify the
   feature you changed works.
2. **Regression-check neighbouring UI.** Explicitly check features that
   share the same container / stacking context / breakpoint that you
   touched. Header refactor → check cards. Card CSS change → check
   modal. Mobile CSS change → check both mobile and desktop widths.
3. **Resize the browser** between desktop (≥1100px), tablet (~900px),
   mobile (~400px). Each major breakpoint has its own media query and
   can regress independently.
4. **Open DevTools and confirm the DOM is what you expect** for the
   specific element you were working on. If an element is "gone", check
   computed style for `display: none`, `visibility`, `opacity`, and the
   element's bounding box — it may be rendered but clipped / offscreen.
5. **If you can't verify in a browser**, say so explicitly to the user
   rather than claiming done. Don't substitute "typecheck passes" for
   "I watched it work."

### Known regression hotspots

- **`.card` has `overflow: hidden`** — absolute-positioned children that
  extend beyond card bounds get clipped. When adding a new popover
  inside a card, render it in a portal or move it outside.
- **`position: relative` on a new parent** creates a new stacking
  context — `z-index: 6` children inside it no longer compete with
  `z-index: 10` elements outside. Check every time you add
  `position: relative` to a container.
- **Mobile drawers / popovers with `position: absolute`** anchor to the
  nearest positioned ancestor. If you refactor the header, double-check
  the drawer still anchors to the right element.
- **`flex-wrap` on `.page-head`** — the header layout depends on items
  fitting on one line. Changing `flex-wrap` on any parent can cascade
  rows in unexpected ways.
