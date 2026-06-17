# CLAUDE.md

## Project

AI/TLDR — a high-volume AI release tracker. Single-page React app powered by
a JSON feed that an automated agent refreshes every 2 hours.

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
- `/learn` → Learn AI hub; `/learn/<cat>`, `/learn/<cat>/<sub>`,
  `/learn/<cat>/<sub>/<slug>` → category / subcategory / article pages

`src/App.tsx` parses `window.location.pathname`. Modal open/close uses
`pushState` / `replaceState` — no page reloads. Legacy hash URLs
(`#<id>`, `#influencers`) still work as a fallback for old bookmarks.

## Learn section (/learn)

A beginner-friendly AI encyclopedia. Three-level tree:
category → subcategory → article. Currently one foundational
("What is X") article per subcategory — 14 categories, 63
subcategories, 63 articles — deliberately expandable: add more article
files under a subcategory and append their refs to `taxonomy.json`.
Extra drafts from the initial run are parked in
`.claude/tmp/learn-archive/` for future expansion.

- **Taxonomy**: `src/data/learn/taxonomy.json` — the canonical tree.
  Every article's SEO metadata (`title`, `shortTitle`, `seoTitle`,
  `metaDescription`, `keywords`, `difficulty`, `oneLiner`) lives here AND
  in the article file; `scripts/check-learn.ts` fails the build if they
  differ.
- **Two titles per article**: `title` is the keyword-rich H1 + `<title>`
  source (SEO-bearing). `shortTitle` is a clean **bare-topic** label
  (no "What is…/How to…" framing — the cat + sub heading already gives
  context) shown on every listing card, breadcrumb leaf, related/prev-next
  link, and 3D-city tower. New articles MUST set both. check-learn caps
  `shortTitle` at 42 chars, forbids a leading interrogative or trailing
  `?`, and requires it be unique within its subcategory and ≠ the
  cat/sub title.
- **Articles**: one JSON file per article at
  `src/data/learn/articles/<cat>/<sub>/<slug>.json`. Articles are
  STRUCTURED (typed sections/blocks, see `src/data/learn/schema.ts`),
  not freeform markdown — the fixed block vocabulary (p / h3 / list /
  table / code / callout / diagram / image) is what keeps every page
  consistent. Canonical section flow: `in-plain-english` →
  `why-it-matters` → `how-it-works` (≥1 diagram) → free sections →
  `going-deeper` (last), plus FAQ (3–7), related (2–6), furtherReading.
- **Validation**: `bun scripts/check-learn.ts` (wired into typecheck +
  build) enforces every structural rule, slug uniqueness, internal-link
  liveness, SEO length limits, and regenerates
  `src/data/learn/count.json` (the nav badge — keeps the taxonomy out
  of the main bundle).
- **No duplicate topics (anti-cannibalization)**: check-learn fails the
  build if `title`, `shortTitle`, `seoTitle`, `metaDescription`, or
  `oneLiner` is reused by **any** other article (not just within a
  subcategory). Multiple articles per tool are fine BY DESIGN (an intro
  plus feature deep-dives) — but each must occupy a DISTINCT slot: its own
  H1, listing label, `<title>`, snippet, and promise. Before writing a new
  article, check whether the tool/concept is already covered and either
  pick a genuinely different angle or extend the existing page (see
  [the SEO memory](feedback_learn_seo_no_cannibalization.md)). A removed
  article must 301 to its survivor via `src/data/learn/redirects.json`
  (read by the Worker) and have its inbound `related` + inline links
  repointed.
- **Code splitting**: the SPA imports the whole section lazily
  (`LearnSection` chunk); each article JSON is its own vite chunk.
  Never import taxonomy/articles from main-bundle modules.
- **SEO**: `scripts/prerender-learn.tsx` (called by prerender.ts)
  renders every learn page to static HTML with the real React
  components — full content in `#root`, inlined learn.css, embedded
  `__LEARN_DATA__` payload, TechArticle/FAQPage/BreadcrumbList JSON-LD,
  and `sitemap-learn.xml`.
- **Content rules**: evergreen topics only, zero-hallucination policy
  applies (no invented features/URLs/benchmarks; external links
  verified). Diagrams use the fixed DSL in `schema.ts` — never raw
  SVG/HTML.

## Influencers page (/influencers)

A curated directory of AI people, in `src/data/influencers.ts`
(`InfluencersPage.tsx` + the `.inf-*` block in `App.css`).

- **Organised by ROLE, not raw reach.** Each person has a `category`
  (`labs` / `research` / `educators` / `engineering` / `tools` /
  `voices`); the page renders one section per category (see
  `CATEGORY_META` / `CATEGORY_ORDER`) with a role filter + search. Do
  **not** revert to a single follower-count-sorted list — sorting an
  *AI* directory by raw subscribers floats general megachannels
  (freeCodeCamp, NetworkChuck) above the actual AI-defining voices.
- **Reach is a coarse band, never a precise number.** `reach` is
  `"1m" | "500k" | "100k"` (or absent = niche). This is deliberate:
  exact counts go stale and can't be re-verified for 100+ people, which
  would violate the zero-hallucination policy. Don't re-introduce
  precise `followers`/`followersRaw` fields or a fake
  `interactionStatistic` in the JSON-LD.
- **Avatars**: `image?` is optional — a missing/404 image renders a
  deterministic monogram (`.inf-avatar-mono`). Drop real headshots into
  `public/influencers/<id>.{jpg,png,webp}` to replace a monogram.
- **Same rules as the feed**: every bio/handle/URL must be web-verified
  (roles change — e.g. people move between labs). The prerender injects
  a crawlable role-grouped `#root` body for SEO.

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

Single sort: `publishDate` DESC — the moment finalize-sweep ingested
the item. Newly-swept items always float to the top. There is NO
grouping by importance and NO user-facing sort switcher. Card size
(grid span) is driven by the `importance` field (seismic = large,
major = medium, notable = small), but all items flow together in
one publishDate-ordered list.

### Two date fields

Each item has two dates, with separate jobs:

- `date` (YYYY-MM-DD) — the public release date. Shown on cards,
  meta tags, Article JSON-LD. The agent sets this from WebFetch.
- `publishDate` (ISO timestamp) — when finalize-sweep ingested the
  item. Drives sort order. **Stamped automatically by
  `finalize-sweep.ts` — the agent must NOT set it.**

The 72h hard cap in `finalize-sweep.ts` is on `date`, not
`publishDate`: items with a `date` older than 72h are rejected.

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
