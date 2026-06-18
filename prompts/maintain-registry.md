# AI/TLDR — daily LLMs + Tools maintenance sweep

You keep two EVERGREEN catalogs accurate and complete:

- **LLMs** — the model registry at `/models`
  (`src/data/models/registry.json` + one detail file per model in
  `src/data/models/models/<slug>.json`).
- **Tools** — the open-source tooling directory at `/learn/landscape`
  (`src/data/learn/landscape.json` + one detail file per tool in
  `src/data/learn/tools/<slug>.json`).

This is NOT the news feed. It runs once a day. Your job is to make sure that
when a new model or tool has shipped — or a tracked one has materially changed
(a price cut, a new official benchmark, a deprecation) — the catalog reflects
it, with every fact verified. If nothing has changed, you change nothing. **A
no-op day is a correct day.**

---

## 4 hard rules (read SWEEP_MEMORY.md before you touch anything)

1. **ZERO-HALLUCINATION.** Every spec, benchmark number, price, context window,
   date, and URL must be fetched and verified from a primary source THIS run.
   If you cannot verify it, omit the field — never guess, never estimate, never
   carry a number you "remember". Your training data predates today; trust
   WebFetch and the system clock, not memory.
2. **Every benchmark/price `source` MUST be a link in that page's `links[]`.**
   `check-models.ts` FAILS THE BUILD otherwise. Same for tools and
   `check-landscape.ts`. This is the mechanical guard — you cannot render a
   number without pointing at where it came from.
3. **No padding. The catalog is not a quota.** Don't invent a "new" model or
   add a tool just to have done something. `registry-context.json` shows you our
   current flagships and missing-tool candidates as *where to look* — it can
   never pressure an add. Add ONLY genuinely-new, genuinely-notable, fully-
   verified entries.
4. **Evergreen wording — never time-relative.** These pages live forever. NEVER
   write "current", "latest", "newest", "most recent", "now the", "brand-new",
   or "just released" in a blurb / tagline / overview. Say what it IS and DATE
   it ("Opus-tier flagship, released May 2026"), not where it sits in time. The
   `current` badge is DERIVED at build time — you do not set it by hand.

---

## What counts as a change worth making

- **A new model version shipped (GA or public preview).** E.g. a maker released
  a newer Gemini Flash / GPT / Llama / DeepSeek than the one
  `registry-context.json` lists as current for that line. Add it.
- **A notable open-source tool is missing.** From the tool-gap list (popular
  repos we don't list). Add the genuinely notable ones; skip awesome-lists,
  courses, leaks, generic infra.
- **A material change to an existing entry.** A verified price change, a new
  official benchmark table, a status change (preview → GA, or deprecated/
  retired). Update the entry + its source links.

NOT worth a change: a minor point-release with no new public facts, a blog
restating old numbers, a rumor, an unverifiable leak.

## Caps (bound the blast radius — these are ceilings, NOT targets)

At most ~3 new models, ~3 new tools, and a handful of updates per run. If more
than that is genuinely pending, do the most important and note the rest in your
summary for tomorrow. Never pad to reach a cap.

---

## Pipeline

### 0. Read your context

- `cat .claude/tmp/registry-context.json` — our current flagship per model line
  + the missing-tool candidates.
- Skim `SWEEP_MEMORY.md` (scar history) and these schema files so you write
  VALID data:
  - `src/data/models/schema.ts` — `ModelEntry` (registry tile) + `ModelDetail`.
  - `src/data/learn/schema.ts` — `LandscapeTool` (tile) + `LandscapeToolDetail`.
- Look at one existing detail file of each kind as a template, e.g.
  `src/data/models/models/claude-opus-4-8.json` and
  `src/data/learn/tools/langchain.json`.

### 1. Check each maker for a newer model

For each maker in the context, visit its OFFICIAL source (model page / blog /
docs / model card; `huggingface.co` for open-weight) and check whether a model
NEWER than our listed current for any of its lines has shipped. Use WebSearch +
WebFetch; verify on the maker's own pages, not third-party recaps.

If yes and you can verify the facts:

**a. Add the registry tile** to the correct maker → line in
`registry.json` as the FIRST entry of that line's `versions` (newest-first), with:
`name`, `slug` (globally unique, lowercase-kebab), `blurb` (one DATED sentence,
no time-relative words), `tags` (from the controlled vocabulary in schema.ts),
and `date` (YYYY-MM-DD). Do NOT set `current` — it is derived. Optionally
`contextWindow`, `license`.

**b. Write the detail file** `src/data/models/models/<slug>.json` matching
`ModelDetail`. Required: `slug`, `name`, `maker`, `makerTitle`, `line`,
`lineTitle`, `tagline`, `seoTitle` (≤60 chars), `metaDescription` (≤165),
`license`, `openWeights`, `modalities`, `overview` (≥1 para), `tags`, `links`
(≥1, every benchmark/pricing source MUST be among them). Include `benchmarks`,
`pricing`, `apis`, `parameters`, `contextWindow`, `releaseDate`, `status`,
`faq`, and `versionHistory` ONLY with verified values; omit any you can't cite.
Benchmark `score` must be 0–`max` (no Elo/throughput in the bar chart).

**c. Fix the superseded sibling.** The previous flagship's `current` badge is
demoted automatically. But edit its blurb/overview if it used time-relative
wording ("Current Flash…") so it now reads as a dated fact.

**d. Add the published benchmark COMPARISON.** A lone benchmark bar ("84%") is
weak — what readers want is this model vs the field, which is exactly what the
maker publishes at launch. Capture whichever of these the source actually has
(both is best), each source cited in `links[]`:

- `comparisonTable` (PREFERRED — reliable + crawlable): the maker's comparison
  transcribed as numbers. `{ models: [<names incl. this one>], subject: <index
  of this model>, rows: [{ benchmark, unit?, scores: [aligned 1:1 with models,
  null for a blank cell] }], source }`. Transcribe ONLY figures that literally
  appear in the cited source — never fill a competitor cell from memory. If you
  can't read an exact number, use null.
- `comparisonFigures`: the maker's OWN published chart image(s).
  `[{ url, alt, caption?, credit, source }]`. `url` is either a self-hosted
  `/models-media/<slug>-cmp-N.<ext>` (download the real chart with
  `curl` into `public/models-media/` first) or a verified **https** vendor/CDN
  image that you confirmed is live AND is the benchmark chart (not a hero/og
  image, logo, or screenshot of prose). `check-models.ts` requires self-hosted
  files to exist and every `source` to be in `links[]`.

Skipping is fine when the maker published no comparison — never fabricate one.

### 2. Add missing notable tools

From the tool-gap candidates, pick the genuinely notable open-source tools we
lack. For each: confirm the repo via the GitHub API
(`bun -e "fetch('https://api.github.com/repos/<owner>/<repo>')..."` or a Bash
`curl`/`gh`), read its README, then:

**a. Add the tile** to the right category → subcategory in `landscape.json`
(`name`, `slug`, `repo` as `owner/repo`, `homepage` if non-GitHub, one-sentence
`description`). Stars are NOT stored — they're refreshed elsewhere.

**b. Write the detail file** `src/data/learn/tools/<slug>.json` matching
`LandscapeToolDetail`: overview (≥2 paras), feature bullets, a README-grounded
getting-started walkthrough with REAL commands/code, use cases, license,
language. Ground every step in the project's own docs.

### 3. Update materially-changed entries

Apply verified price/benchmark/status changes to existing detail files, keeping
every new number's source in `links[]`. If a flagship you're already touching
has benchmarks but no `comparisonTable`/`comparisonFigures`, backfill the
published comparison (step 1.d) while you're there — but don't go hunting beyond
the entries this run already touches.

### 4. Validate (this is your gate — do NOT skip)

```bash
bun scripts/check-models.ts
bun scripts/check-landscape.ts
bun run build
```

All must pass. `check-models` re-derives the `current` flag + `count.json`;
`build` regenerates other derived files (fine — the workflow discards them).
If a check fails, FIX THE DATA (usually a missing source link or an over-cap
SEO field), never relax the rule. If you cannot make it valid with verified
facts, drop that entry.

### 5. Stop. Do NOT commit or push.

The workflow commits the allow-listed files and pushes. In your final message,
list what you added/updated and why (with the sources), and name what you
checked but found nothing newer for — so an empty day is auditable.
