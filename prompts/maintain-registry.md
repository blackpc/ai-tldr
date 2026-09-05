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
it, with every fact verified. For MODELS, if nothing has shipped you change
nothing — a no-op is correct. For TOOLS, a no-op is correct ONLY when
`.claude/tmp/tool-gaps.json` has an empty `fromFeed`: every entry there is a
tool our own feed already covered and the catalogue still lacks. The run
summary prints how many remain and whether you added pages or recorded
skips; nothing blocks or retries — the next run just gets the same list, so
the number only goes down if you work it.

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
3. **No padding — but the feed backlog is not padding.** Never invent a "new"
   model, and never add a GitHub-sourced tool just to have done something:
   those you judge (real tool? maintained? used?). Feed-sourced tool gaps are
   different: each one is a story we already published about that tool, so
   notability is settled — adding every real tool in `fromFeed` is catching up,
   not padding. The only reason to leave one out is that it is not a tool
   (dataset, benchmark, proof, paper artefact), and that ruling is recorded in
   `src/data/learn/catalogue-skips.json` so it stops resurfacing.
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

At most ~3 new models, ~8 new tools, and a handful of updates per run (the
job runs every 6 hours; a tool page is ~5 minutes of work). If more is
pending, do the newest feed-sourced gaps first and note the rest — the next
run picks them up. Never pad to reach a cap; never stop short of it while
`fromFeed` still has real tools in it.

---

## Pipeline

### 0. Read your context

- `cat .claude/tmp/registry-context.json` — our current flagship per model line.
- `cat .claude/tmp/tool-gaps.json` — THE tool candidate list: `fromFeed`
  (tools our feed covered that we don't list — add every real one, newest
  first) and `fromGitHub` (≥1k★ repos at the head of each AI topic or created
  in the last year — judge these). Written by `bun scripts/tool-gaps.ts`.
- `cat src/data/learn/catalogue-skips.json` — repos already ruled "not a
  tool"; they are excluded from the candidates automatically.
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

> If you ever add a BRAND-NEW maker (rare), give it a `logo`: download its
> official brand symbol (Wikimedia Commons SVG or the brand's app-icon) into
> `public/models-logos/<makerId>.<ext>` and set `maker.logo` to that path.
> `check-models` requires the file to exist. Existing makers already have logos.

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

### 2. Add missing tools (this is where most of your time goes)

Work `.claude/tmp/tool-gaps.json` top to bottom:

**a. `fromFeed` first, newest first — add every one that IS a tool.** Each
entry is a story our feed already shipped about that repo; the catalogue
lacks it (no tile) or lists it tile-only (no detail page). Notability is
settled. For each: confirm the repo (`bun scripts/gh-repo-meta.ts owner/repo`
or `gh api repos/owner/repo`), read its README, then add the tile + write the
detail page (tile-only → just the page), and make the feed item the FIRST
`changelog` entry: `{ date: <item date>, version?: <if the story is a
versioned release>, note, releaseId: <the id in brackets>, url: <one of the
feed item's links> }`. Model releases never appear here (excluded by
category). If an entry is genuinely not a tool — a dataset, benchmark, proof,
paper artefact, demo — record it in `src/data/learn/catalogue-skips.json`:
`"owner/repo": { "reason": "not-a-tool", "why": "<one sentence>", "date":
"<today>", "by": "daily" }` and move on; it will not resurface. Not valid
reasons: "reference implementation", "unmaintained", "small", "unsure where
it goes".

**b. Then `fromGitHub`, as capacity allows** — ≥1k★ repos at the head of each
AI topic or created in the last year, not yet listed. These you judge: a real
tool people install and run, with a README that says what it does. Skip
awesome-lists, courses, papers-with-code dumps, model-weight repos, forks.
There is no star floor to argue about; the question is only "is it a tool".

The 2h feed sweep is gated on its own new tool items
(`scripts/check-catalogue-sync.ts`); you are the backstop that drains what
landed before the gate and what the sweep skipped with a reason.

For each tool you add:

**a. Add the tile** to the right category → subcategory in `landscape.json`
(`name`, `slug`, `repo` as `owner/repo`, `homepage` if non-GitHub, one-sentence
`description`, plus `access` for non-OSS tools). Stars are NOT stored — they're
refreshed elsewhere.

> **Categorize by what the tool IS, not what it is used WITH.** Categories are
> function-first; a tool's PRIMARY function decides its home. A
> documentation/retrieval/data/eval/gateway tool that agents happen to call is
> NOT an agent — e.g. Context7 (serves up-to-date library docs to an LLM) is
> `retrieval-knowledge/rag-frameworks`, never `agents`. An MCP server is not a
> category; classify the underlying function it exposes. License
> (open-source / commercial / enterprise) is the `access` field and a chip
> filter — NEVER a category. When unsure, pick the subcategory whose siblings
> share the tool's core job. Run the `audit-tool-categories` workflow
> (`.claude/tmp/audit-categories.mjs`) after any bulk add to catch slips.

> **When NO subcategory fits, create one — the taxonomy is yours to grow.**
> Categories and subcategories are plain data in `landscape.json` (nothing in
> the UI is hard-coded to their ids); `check-landscape` only requires a
> category to have `id` (kebab-case), `title`, `blurb` (one line) and ≥1
> subcategory, and a subcategory to have `id`, `title` and ≥1 tool. Create a
> subcategory when a tool's core job is one that ≥2 tools share (or clearly
> will) and none of the existing siblings do it — e.g. a wave of "agent
> skills" registries, "evaluation harnesses for computer-use agents", "LLM
> cost/FinOps". Create a whole category only when a new subcategory fits under
> none of the existing category headings. Never create one for a single
> oddball when a neighbouring subcategory is a reasonable home, and never for
> a vendor, a licence or a model family (Anthropic-tools, open-core, Llama-x
> are not categories). When you create one, move the existing tools that
> obviously belong in it (re-sync each moved detail file's `category` /
> `subcategory` / `categoryTitle` / `subcategoryTitle`), and say so in your
> summary. Function-first ids and titles, matching the neighbours' style.

**b. Write the detail file** `src/data/learn/tools/<slug>.json` matching
`LandscapeToolDetail`: overview (≥2 paras), feature bullets, a README-grounded
getting-started walkthrough with REAL commands/code, use cases, license,
language. Ground every step in the project's own docs. `logo` only when a
brand file already exists under `public/tools-logos/` (a missing file fails
the build); otherwise leave it out — a monogram renders.

### 3. Update materially-changed entries

Apply verified price/benchmark/status changes to existing detail files, keeping
every new number's source in `links[]`.

**Tool changelogs.** When you materially update a TOOL's detail file (or add a
tool because a fresh version/change shipped), also prepend an entry to its
`changelog` array (newest first; see `ToolChangelogEntry` in
`src/data/learn/schema.ts`):
`{ date, version?, note, releaseId?, url }` — `date` is the change's public
date, `note` is 1–2 plain sentences, `url` is the official release-notes/
changeset link you verified this run, and `releaseId` is set ONLY when the
AI/TLDR feed has an item covering it (its real `id` from
`src/data/releases.json`). `check-landscape.ts` validates all of this and
fails the build on a fake `releaseId`, a non-https `url`, or wrong ordering.
Routine star drift is NOT a changelog entry; a version release, price/license
change, rename, or deprecation is. If a flagship you're already touching
has benchmarks but no `comparisonTable`/`comparisonFigures`, backfill the
published comparison (step 1.d) while you're there — but don't go hunting beyond
the entries this run already touches.

### 4. Validate (this is your gate — do NOT skip)

```bash
bun scripts/check-models.ts
bun scripts/check-landscape.ts
bun scripts/tool-gaps.ts --check --no-github
bun run build
```

`tool-gaps --check` reports (exit 1, informational) when feed-sourced
candidates remain and this run neither added a tool page nor recorded a skip.
It is a progress line, not a loop: one round, then stop.

All must pass. `check-models` re-derives the `current` flag + `count.json`;
`build` regenerates other derived files (fine — the workflow discards them).
If a check fails, FIX THE DATA (usually a missing source link or an over-cap
SEO field), never relax the rule. If you cannot make it valid with verified
facts, drop that entry.

### 5. Stop. Do NOT commit or push.

The workflow commits the allow-listed files and pushes. In your final message,
list what you added/updated and why (with the sources), and name what you
checked but found nothing newer for — so an empty day is auditable.
