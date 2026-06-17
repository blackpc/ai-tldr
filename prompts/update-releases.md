---
prompt-id: tldr.update-releases
prompt-version: 6.8.0
output-target: src/data/releases.json (via finalize-sweep.ts)
schema: src/data/schema.ts
invoke-as: subagent
---

# AI/TLDR — Release Sweep

Single source of truth for refreshing `src/data/releases.json`. Invoked
on cron (every 2h) and manually. The agent's output is `sweep-draft.json`
at the repo root; deterministic scripts merge that into the data files.

## Mission

Surface what shipped in AI today that the community is talking about.
Real, recent, non-vapour. If nothing shipped in the last 72h that meets
the bar, ship zero items — that is a successful sweep, not a failure.
Padding to fill a perceived gap is the bug. Three iterations of the
same padding bug live in `SWEEP_MEMORY.md` (entries 2026-04-28-A, B, C).
Read that file before changing anything.

## The pipeline (one canonical path, no alternative)

You write a draft. Scripts validate and merge. You do **NOT** edit
`releases.json` or `sweeps.json` directly under any circumstance.

1. **Briefing.** `bun scripts/sweep-context.ts > /tmp/ctx.json`. Output
   shape: `{ now, feedSize, existing[] }` where each `existing[i]` is
   `{ id, normId, url, title }`. This is the no-add-twice list.
2. **Discovery.** Search the sources listed below. For each candidate,
   apply the inclusion bar + the importance scale + the dedup check.
3. **Helpers as needed:**
   - `bun scripts/yt-rss-scan.ts` — scans all 8 YouTube creator channels,
     returns a JSON array of SHIP-READY videos uploaded in the last 72h.
     Call this in step 5 of the first pass (not optional). Each record is
     `{ channelName, channelId, videoId, watchUrl, channelUrl,
     thumbnailUrl, title, publishedAt, uploadDate, ageHours,
     freshFor72hBar: true }`. **This is the authoritative, CI-safe
     freshness source** — it reads the upload date from the YouTube RSS
     feed, which works from GitHub Actions runners. Build the `video`
     item directly from these fields. Do NOT re-check freshness with a
     watch-page scrape (see below).
   - `bun scripts/yt-meta.ts <url> [channelId]` — returns
     `{ videoId, watchUrl, title, channelName, channelUrl, thumbnailUrl, uploadDate, uploadDateSource, ageHours, freshFor72hBar }`.
     Only needed for ad-hoc videos NOT already returned by the RSS scan.
     **Always pass the `channelId`** (it is in the scan output and in the
     watchUrl's channel) so the date comes from the RSS feed. Without a
     channelId it falls back to scraping the watch page, which YouTube
     bot-walls from CI runners → `uploadDate: null` →
     `freshFor72hBar: false` → the video is wrongly dropped. That exact
     bug killed every cron video for 5+ weeks (SWEEP_MEMORY 2026-06-13).
   - `bun scripts/og-image.ts <page-url>` — returns
     `{ pageUrl, imageUrl, contentType, source }` after verifying it's
     actually an image.
   - `bun scripts/gh-repo-meta.ts <owner>/<repo>` — returns stars,
     description, license, default branch, `ogImageUrl`, etc.
4. **Draft.** Write `sweep-draft.json` at the repo root:
   ```json
   {
     "newItems":   [ /* full ReleaseItem[] minus publishDate — stamped by finalize-sweep */ ],
     "updates":    [ { "id": "...", "patch": { ... }, "note": "..." } ],
     "removals":   [ { "id": "...", "reason": "..." } ],
     "summary":    "1–2 sentence sweep summary",
     "coverage":   ["model","repo",...],
     "notes":      { "<id>": "one-sentence why-included" }
   }
   ```
   `coverage` lists categories you actually queried this run. Entries
   MUST be values from the `categories` enum (model, repo, tool, video,
   dataset, …) — NOT source names like "youtube", "hn", "lab-blog",
   "tier1-press". Only list a category you genuinely searched for and
   would have added from; do not list a category just because you
   glanced at a page. (Historically `coverage` claimed "video"/"dataset"
   on sweeps that added zero of them for weeks — the listing was
   meaningless. Keep it honest.) Don't pad it.

   **ALWAYS fill `coverage`, ESPECIALLY on a zero-add sweep.** A zero-add
   sweep is a valid, successful result — but it must be AUDITABLE. List
   every category you genuinely searched so the record proves you looked
   across the board, not that you gave up early. An empty `coverage` on a
   zero-add sweep is indistinguishable from a short-circuit, which makes
   "are we missing real news?" impossible to answer from the log. Recording
   what you searched can NEVER pressure you to add an item — it is the
   opposite of a quota (you list the categories you queried; whether any
   item qualified is separate). So: searched 8 categories, none qualified →
   `coverage` has 8 entries and `newItems` is `[]`. That is the ideal empty
   sweep.
5. **Verify.**
   ```
   bun scripts/verify-draft.ts sweep-draft.json
   ```
   Hits every URL and image with timeouts + per-host concurrency.
   Hard-fails on any 4xx/5xx, non-image content-type at `image.url`,
   or schema gaps. Fix the draft until it passes.
6. **Finalize.**
   ```
   bun scripts/finalize-sweep.ts sweep-draft.json
   ```
   Sorts the feed by `date` DESC, dedups (id + normId + canonical
   URL), builds the `SweepReport`, appends to `sweeps.json`. Hard-fails
   on collision; soft-warns on coverage gaps.
   For non-cron runs override the source label:
   `--source manual-<reason>`. Default is `github-actions-sweep`.
7. **Build check.** `bun run typecheck && bun run build`. If the build
   breaks, fix; do not commit.
8. Stop. Don't commit, don't push (the workflow handles that).

## Hard rules (non-negotiable)

### 1. Zero hallucination

Every URL, every image, every metric, every claim must trace to a page
you fetched in this run. Working from memory is forbidden. Never invent
URL slugs, paper titles, author names, parameter counts, prices, or
benchmark numbers. If a source doesn't state it, leave it out. When in
doubt, drop the item.

### 2. 72h date cap

`date` (the actual public release date — when the thing shipped, not
when you found it) MUST be within **72 hours** of the sweep timestamp.
Old releases stay un-added even if HN is still chatting about them.
Mythos was added 17 days late under the old "trending beats recency"
rule (see SWEEP_MEMORY 2026-04-28). That rule is gone.

If the source page doesn't show an explicit date, use the earliest
verifiable timestamp: GitHub first-release tag, arXiv submission date,
blog post publish date, lab announcement timestamp.

### 3. Semantic dedup is YOUR job

The script catches three things only: exact id collisions, normalized-id
collisions (lowercase, alphanumeric-only), and canonical-URL collisions.
It cannot catch the same release with two different titles + two
different URLs (e.g. "Claude Mythos Preview" at `anthropic.com/news/...`
vs "Mythos / Project Glasswing" at `anthropic.com/glasswing`).

For every candidate, scan `existing[].title` and ask: "Is any existing
entry covering the SAME release — same model launch, same incident,
same product, same announcement?" If yes:
- Fresher framing of the same news → move to `updates[]` with the
  existing id.
- Otherwise → drop the candidate.

**Exception for `video` items:** A video by a listed creator is its own
item — a creator's breakdown of a release is NOT a semantic dupe of the
release itself. If `nvidia-lyra-2-0` is already in the feed and Two
Minute Papers uploads a fresh video about it, add the video as a new
`video` item. The existing release entry and the video coexist. Do NOT
use semantic dedup to block video items from being added.

The script will catch slug/url collisions you miss. The script CANNOT
do semantic dedup. That's on you, every candidate, every sweep.

### 4. No padding

Empty sweep is success. If the inclusion bar yields zero qualifying
items in any category, ship zero. Do not add an "okay-ish" item to fill
a slot. Specifically: do not pad video, do not pad paper, do not pad
"this category looks empty this week." Three padding bugs are documented
in SWEEP_MEMORY.

## Importance scale

Two separate questions: **Should this ship?** (inclusion bar) and
**What tier?** (importance). They are independent. A 936-point HN post
about a security breach passes the inclusion bar but is `major`, never
`seismic`.

| Tier | Meaning |
|------|---------|
| `seismic` | Reserved for SOTA model releases AND frontier-tech breakthroughs from a top lab (OpenAI, Anthropic, Google DeepMind, Meta, xAI, Mistral, Moonshot, Qwen, DeepSeek). All three of (a) named flagship or fundamentally new capability, (b) from a top lab, (c) active community discussion right now. Target 0–2 per week. |
| `major`   | Broad-impact news. Pricing changes, breaches, M&A, restructures, significant tooling launches, major feature ships, important repos with real adoption. The default tier for almost everything that isn't a model release. |
| `notable` | Solid release, narrow audience. |
| `rumor`   | Credible speculation from named journalists / insiders / leaked docs. Always paired with `categories: ["rumor", ...]`. |

**Concrete examples (from 2026-04-28 sweeps):**
- Claude Opus 4.7, GPT-5.5, DeepSeek V4, Kimi K2.6, Qwen3.6-27B → seismic.
- GitHub Copilot moves to token billing → major.
- Mercor 4TB voice-data breach → major.
- Microsoft–OpenAI partnership rewrite → major.
- SpaceX–Cursor acquisition rumor → major (or rumor).
- A new arXiv paper trending on HF Papers → notable, unless major lab + code + demo + discussion (then major).

If you find yourself emitting a 3rd seismic in a single sweep, you are
inflating. Demote.

## Inclusion bar

Ship a candidate only if it meets ALL of:

1. `date` is within 72h of sweep timestamp (Hard Rule 2).
2. It does not collide with anything in `existing[]` semantically (Hard
   Rule 3).
3. At least ONE of the following is true:
   - On HN front page top 30 right now with ≥150 points.
   - ≥2 tier-1 outlets covered it in last 48h (Verge, Ars, TechCrunch,
     Bloomberg, The Information, Stratechery, The Register, The
     New Stack).
   - On `github.com/trending` today with ≥500 stars in last 7d.
   - Top 10 on `huggingface.co/papers` or `huggingface.co/models`
     trending right now.
   - Posted on a top-lab blog in last 48h on the official domain
     (anthropic.com/news, openai.com/index, deepmind.google,
     ai.meta.com/blog, x.ai/blog, mistral.ai/news).
   - Hot on r/LocalLLaMA or r/MachineLearning with ≥500 upvotes.
4. You would post about it today as a "this just shipped" tweet.

## Sources to scan

**Search technical sources first.** Tier-1 press and business news are
last-resort, not first-resort. The feed exists to surface what shipped,
not what was funded or announced.

**Required first pass (always do these before anything else):**
1. **Lab blogs**: anthropic.com/news, openai.com/index, deepmind.google,
   ai.meta.com/blog, x.ai/blog, mistral.ai/news, cohere.com/blog,
   qwen.ai, moonshot.ai — model releases, API changes, new tools.
   Also check the Chinese frontier labs, which we under-cover: DeepSeek
   (deepseek.com), Zhipu / Z.ai (z.ai), MiniMax (minimax.io), plus Baidu
   ERNIE and ByteDance Seed — find their official release channel. Verify
   every URL as always; if a channel 404s, skip it.
2. **GitHub trending**: `github.com/trending?since=daily` filtered to AI/ML —
   new repos with real traction.
3. **HuggingFace**: `huggingface.co/models?sort=trending`,
   `huggingface.co/datasets?sort=trending`, and `huggingface.co/papers`
   top 10 — new models, notable open datasets, and papers with code. A
   trending open dataset with real adoption is a `dataset` item; a paper
   that introduces a named, reusable technique (not just a result) is
   also an `algorithm` item — tag it `["paper", "algorithm", ...]`.
   (`dataset` and `algorithm` are first-class categories that went 48
   days with zero automated adds — see SWEEP_MEMORY 2026-06-13-B —
   because nothing here pointed at their sources. This is where to look,
   NOT a quota: if nothing qualifies, add nothing.)
4. **HN**: front page top 30 and "Show HN" AI posts.
5. **YouTube fresh videos** — run:
   ```
   bun scripts/yt-rss-scan.ts
   ```
   This scans all 8 creator channels and returns a JSON array of
   ship-ready videos uploaded in the last 72h (freshness already
   confirmed from the RSS upload date — CI-safe). For each result, build
   a `video` item straight from its fields if the content is substantive
   AI/ML (not a Short, not a promo, not off-topic):
   `date` = `uploadDate` (YYYY-MM-DD part), `url` = `watchUrl`,
   `image.url` = `thumbnailUrl`, `org` = `channelName`,
   `author.profileUrl` = `channelUrl`. **Do NOT run `yt-meta.ts` just to
   re-confirm freshness** — the scan already did it from a source that
   works in CI; re-checking via the watch page returns `false` on the
   runner and silently drops every video. An empty array means no fresh
   videos — that is fine, move on (do not pad).

**Second pass (only if first pass yields <2 qualifying items):**
- **Coding agents**: Cursor, Claude Code, Windsurf, Cline, Aider,
  Continue, OpenCode, Codium, Tabnine, Codeium — watch for new releases.
- **Reddit**: r/LocalLLaMA hot, r/MachineLearning hot.
- **Influential voices** (for `article` items only): simonwillison.net,
  karpathy.ai, latent.space, interconnects.ai, lilianweng.github.io,
  eugeneyan.com, importai.substack.com, deeplearning.ai/the-batch.
- **Benchmarks & learning** (also under-covered, same no-quota caveat):
  new eval benchmarks / leaderboards with real adoption → `benchmark`;
  standout tutorials or hands-on guides (deeplearning.ai/the-batch, HF
  cookbook/blog) → `tutorial`. Only if something genuinely qualifies.

**Last resort (only after exhausting above with <2 items):**
- **Tier-1 AI press**: theverge.com/ai, arstechnica.com/ai,
  techcrunch.com/ai, bloomberg.com (AI beat), theinformation.com,
  stratechery.com. Use these to confirm a technical item you found
  above, or to find a genuinely structural ecosystem event — not as
  a primary discovery channel.

There is **no** "must search every category" rule — searching matters
when you have a reason to look, not as a quota.

## Item schema

Every item conforms to `ReleaseItem` in `src/data/schema.ts`. Required:
`id`, `categories`, `title`, `org`, `date`, `url`, `summary`, `tags`,
`importance`, `explainer`, `image`, `links`. Two date fields:
- `date` (YYYY-MM-DD) — the public release date. Shown on cards.
  YOU set this from WebFetch.
- `publishDate` (ISO timestamp) — when we ingested the item. Drives
  sort order. **DO NOT set this — `finalize-sweep.ts` stamps it.**

### Plain, readable English (applies to `title`, `summary`, `explainer`)

Write so a smart non-native English reader understands on the FIRST
pass. Target roughly CEFR B2 / U.S. grade 8–10 — clear and adult, NOT
dumbed down to a child's level, but NOT academic or newsroom-fancy
either. Tech terms (transformer, MoE, RAG, context window) are fine and
expected; everyday-word *showing off* is not.

Rules:
- Prefer the common word over the fancy synonym.
- One idea per sentence. Short sentences beat long ones.
- Avoid newspaper-headline verbs and idioms — they read as drama and
  confuse non-native speakers. Swap them for plain ones:

  | Don't write | Write |
  |---|---|
  | rebuffs, spurns | rejects |
  | rips, slams, blasts, lambasts | criticizes |
  | touts | promotes, claims |
  | unveils, debuts | announces, launches, releases |
  | doubles down on | reaffirms, repeats |
  | decries, excoriates | criticizes |
  | carve-out | exemption |
  | overbroad | too broad |
  | upends | disrupts, changes |
  | bolsters | strengthens |
  | eschews | avoids |
  | nascent | early, new |
  | myriad, plethora of | many |
  | leverages | uses |
  | albeit | although, even though |

  This table is illustrative, not exhaustive — the test is always "would
  a B2 reader stumble on this word?" If yes, use a simpler one.

This is about word choice and sentence length, NOT about removing real
facts. Keep every number, name, and claim — just say it plainly.

### Write so AI answer engines can quote you (GEO)

AI assistants (ChatGPT, Perplexity, Gemini, Copilot) answer a question by
LIFTING a self-contained sentence or two from a page. Write `summary` and
each `explainer` field so a single sentence, pulled out ALONE, still makes
sense and still names the thing.

- **Answer first, name the entity.** Open with the answer, not a wind-up.
  Write "GLM 5.2 is a 1T open-weight coding model that…", NOT "In this
  release…", "This video covers…", or "A new model was announced…". The
  first sentence must contain the product/model/org NAME — never start with
  "it", "this", or "they".
- **State verified facts definitively.** Drop empty hedges — "reportedly",
  "around", "is said to", "appears to" — when the number is confirmed from
  the source. Write "Kimi K2.6 scores 80.2% on SWE-bench", not "reportedly
  scores around 80%". (Our zero-hallucination rule means anything you'd have
  to hedge has already been dropped — so there is nothing left to soften.)
- **BUT keep attribution for opinions and predictions.** "Andrej Karpathy
  argues…", "the paper claims…", "Nathan Lambert predicts…". Removing the
  verb there would turn an opinion into a fake fact and break
  zero-hallucination. Be definitive about OBJECTIVE facts (specs, prices,
  dates, benchmark numbers); stay attributed on subjective claims.
- **Repeat the name instead of pronouns** across `whatIsIt` / `howItWorks`
  / `whyItMatters`, so any one of them still makes sense quoted on its own.

### `title`

**≤ 80 chars. A headline, not the whole story.** Format:
`<Name or short claim> — <one short descriptor>`. The em-dash clause
is a brief qualifier, NOT a second sentence packed with metrics,
names, dates, quotes, or sub-clauses. Hard cap 90 chars; aim for 60–80.

The detail (numbers, people, benchmarks, quotes, context) belongs in
`summary` and `explainer` — NEVER cram it into the title. If you find
yourself adding a comma-spliced list or a second "—", you are writing
a summary, not a title. Cut it.

Good (short, scannable):
- `Claude Opus 4.7 — Anthropic's new flagship for agentic coding`
- `OpenAI Shuts Down Sora — $1M/day video AI discontinued after 17 months`
- `Kimi K2.6 — 1T multimodal MoE hits 80.2% on SWE-bench`

Bad (this is a summary stuffed into the title — DO NOT do this):
- `Google Ships DiffusionGemma — Apache-2.0 26B/3.8B-Active Mixture-of-Experts That Denoises 256 Tokens in Parallel via Discrete Block Diffusion, Hits 1,000+ Tokens/Sec on H100 and 700+ on RTX 5090 While Posting 77.6% MMLU Pro...`

Same banned words as `summary`, same plain-English rule above. No
emoji, no exclamation marks.

### `id`

`<org-kebab>-<short-slug>`. Lowercase, hyphens. Examples:
`anthropic-claude-opus-4-7`, `openai-gpt-5-5`, `deepseek-v4`. Use
the existing convention if a prior entry covered the same org.

### `categories`

Array of one or more from: `model`, `repo`, `tool`, `article`, `video`,
`rumor`, `security`, `tutorial`, `showcase`, `resource`, `algorithm`,
`paper`, `dataset`, `benchmark`, `ecosystem`. First entry is primary
(drives the badge). Multi-category is encouraged when honest:
`["paper", "algorithm", "repo"]` for a paper with a named technique
and code.

### `summary`

≤ 240 chars, plain English (see the plain-English rule above — common
words, short sentences, no headline-ese). Banned words: "revolutionary",
"groundbreaking", "game-changing", "unprecedented", "next-generation",
"cutting-edge". No emoji, no exclamation marks.

### `tags`

Lowercase, hyphenated, as many as honestly apply. No cap. Stop where
the next tag is noise.

### `date`

YYYY-MM-DD. The actual public release date from the source page. ≤72h
before sweep timestamp (Hard Rule 2; `finalize-sweep.ts` hard-fails
on items older than that).

### `metrics` (optional)

`Record<string, string | number>`. Concrete numbers from the source:
SWE-bench score, parameter count, GitHub stars, context window, price
per million tokens. Every key/value must trace to a fetched source —
no estimates. Omit the field rather than guess. The UI surfaces
metrics as small chips under the title.

### `quickFacts` (optional — strongly preferred for `seismic`/`major`)

`{ label, value }[]`, 3–7 rows. A LABELED facts table — AI answer engines
lift a labeled table far more readily than the same facts buried in prose.
Use only VERIFIED values from the source. Good labels: "Maker", "License",
"Context window", "Price (input)", "Price (output)", "Availability",
"What's new". Keep each value short and concrete ("$3 / 1M tokens",
"200K tokens", "Apache-2.0", "API + open weights"). Omit a row rather than
guess. Skip the whole field for `notable`/`rumor` items.

### `faq` (optional — strongly preferred for `seismic`/`major`)

`{ q, a }[]`, 3–5 entries (cap 7). Each `q` is a LITERAL follow-up question
a person would type — "How much does <X> cost?", "Is <X> open source?",
"How does <X> compare to <Y>?". Each `a` is a self-contained 40–75 word
answer that NAMES the entity (never starts with "it"/"this") so it still
makes sense quoted on its own. Every answer must be grounded in the fetched
source — same zero-hallucination rule as `summary`. This drives a visible
FAQ on the release page plus FAQPage structured data (what AI engines quote
for the literal sub-question).

### `explainer` (REQUIRED)

The heart of the card. If you can't fill these from the source, drop
the item.

- `tagline` — one sentence, ≤140 chars, plain. Elevator pitch.
- `whatIsIt` — what it is in plain language. Reader has heard of LLMs,
  not this specific thing. 2–4 sentences.
- `howItWorks` — actual mechanism. Name the technique, describe what
  the system does. No marketing.
- `whyItMatters` — practical impact. What does this unblock? Who saves
  time/money/pain?
- `forWho` — optional, one short phrase ("indie devs", "ML researchers").
- `tryIt` — optional, one line: a CLI command, pip install, model id,
  or URL. Concrete and runnable.

Same banned words as `summary`.

### `image` (REQUIRED)

Object: `{ url, alt, fit?, credit? }`. The image must be fetched in
this run and confirmed to return 200 + `image/*` content-type
(`verify-draft.ts` enforces).

Sources, in priority order:
1. `og:image` from the canonical URL — use `bun scripts/og-image.ts <url>`.
2. GitHub auto-OG: `https://opengraph.githubassets.com/1/<owner>/<repo>`
   (returned by `gh-repo-meta.ts` as `ogImageUrl`).
3. HuggingFace model card banner (`cdn-uploads.huggingface.co/...`).
4. arXiv figure 1 from the abstract page.
5. Wikimedia Commons for stable brand logos as last resort.

Avoid hotlink-blocked hosts: `scontent.fbcdn.net`, `pbs.twimg.com`,
`*.licdn.com`, anything behind `instagram.com`. Prefer the org's own
CDN.

`alt` — required, ≤120 chars, no "image of".
`fit` — default `"contain"`. Use `"cover"` only for true full-bleed photos.
`credit` — optional figure/photo credit.

If you cannot find a verified image, drop the item. No image = no card.

### `links` (REQUIRED, ≥2)

Each: `{ label, url }`. Aim for 3–5 entries when relevant. Cover these
facets in priority order:

1. Announcement (blog post / press release).
2. Paper (arXiv / conference PDF).
3. Code / repo (GitHub / GitLab).
4. Docs (API reference, quickstart, model card).
5. Demo (hosted demo, playground, video).
6. Pricing / license.

Every link must be **directly relevant to this specific release**.
NOT homepages, NOT search-result pages, NOT blog indices unless the
index IS the announcement. Labels Title Case, ≤24 chars.

`verify-draft.ts` fetches every link in this run and confirms 200.

## Per-category notes

Most categories are obvious from the table above. These need extra
clarity:

### `article` — influential voices, not random blogs

`org` = the author's name or publication (e.g. "Simon Willison",
"Interconnects AI"), NEVER "Medium" or "Substack". `author` field
required: `{ name, handle?, profileUrl, avatarUrl? }`. `name` and
`profileUrl` are hard-required; `avatarUrl` is optional (the UI falls
back to a tinted initial). For GitHub-using authors,
`https://github.com/<user>.png` is the easiest avatar source.

### `video` — top creators only, fresh only

72h freshness bar applies to the **video upload date** — the date the
creator published the video on YouTube. It does NOT apply to any
research paper, model, or product the video happens to cover. A video
uploaded today reviewing a 30-day-old paper is FRESH. Use
`yt-rss-scan.ts`'s `uploadDate` (== `publishedAt`) as `date`; its records
are already inside the 72h window, so they ARE the freshness gate.

The freshness decision MUST come from the RSS feed (`yt-rss-scan.ts`, or
`yt-meta.ts` WITH a `channelId`), never from a bare watch-page scrape.
YouTube serves a bot/consent page with no upload date to GitHub Actions
runners, so a watch-page `freshFor72hBar` is `false` in CI for valid
fresh videos and drops them all. This is the documented 2026-06-13 bug
("919h since last video"). Do not reintroduce a watch-page freshness
gate.

`org` = the channel name (e.g. "Two Minute Papers"), NEVER "YouTube".
`image.url` = `thumbnailUrl` from `yt-meta.ts` (the deterministic
`hqdefault.jpg` URL). `author` required: `{ name, profileUrl, ... }`
where `profileUrl` is the channel page. `avatarUrl` is optional —
YouTube channel avatars are JS-rendered and hard to extract reliably;
do not drop the video over a missing avatar.

### `rumor` — credible only

Categories includes `"rumor"`, importance is `rumor`. Source must be
named: known journalists (The Information, Bloomberg AI), insider
posts with track record, leaked docs/code. NOT anonymous Twitter
guesses, NOT "they filed a trademark so..." speculation. Explainer
must state source + confidence + what would confirm/deny.

### `paper` — bar above arXiv-trending

A paper qualifies only with at least TWO of: public code with
non-trivial stars; working demo or runnable model; HN front page or
viral X thread; named author from the influential-voices list; pickup
by Simon Willison / TLDR / Interconnects / The Batch.

arXiv-trending alone is not enough.

### `ecosystem` — structural news, used sparingly

ALLOWED: foundation moves (PyTorch Foundation, Linux Foundation AI),
license changes on widely-used projects, lab spinouts/shutdowns,
deprecations that break downstream users, regulatory changes with
direct technical consequences (e.g. a law that changes what models
can be deployed).

NOT ALLOWED: funding rounds, IPO filings, valuations, M&A rumours,
revenue forecasts, headcount news, conference dates, roadmap
announcements, government policy speculation without enacted change.

**Concrete rejected examples (items that slipped through in 2026-05):**
- "Cerebras Launches IPO Roadshow at $26.6B" → pure financial news, no product change
- "Sierra Raises $950M at $15B+" → funding round, no product shipped
- "OpenAI's CFO Pushes IPO to 2027" → corporate timeline, zero dev impact
- "KKR's $10B AI Data-Center Spinout" → infrastructure investment, not a release
- "Huawei Forecasts $12B in 2026 AI Chip Revenue" → revenue forecast, not a product

**Ecosystem gate test:** Before accepting an ecosystem item, answer:
*"What does a developer or researcher DO differently because of this?"*
If you can't answer with a concrete action (migrate off X, update
API key, stop using library Y), drop the item.

**Cap: max 1 ecosystem-primary item per sweep.** If you already have
one, demote additional candidates or drop them.

Almost always combines with another category (e.g. license change on
a model = `["ecosystem", "model"]`).

## Self-check before emitting

For every item, answer YES to all of:

1. Did I fetch `url` in this run with 200 + relevance to THIS specific
   release (not a homepage)?
2. Did I fetch every `links[].url` and `image.url` in this run?
3. Is `image.alt` non-empty and descriptive?
4. Is every claim in `summary` and `explainer` grounded in a fetched
   source? Every metric in `metrics`?
5. Does the item have ≥2 entries in `links` covering distinct facets?
6. Is `date` within 72h of the sweep timestamp?
7. Did I scan `existing[].title` for semantic collisions and confirm
   none?
8. Would I tweet about this today as "this just shipped"?
9. If `categories[0]` is `ecosystem`: Can I name a concrete developer action
   this triggers? If no → drop. Is this already the 2nd ecosystem-primary
   item this sweep? If yes → drop.

For seismic items specifically:
9. Is this a NEW SOTA model OR a fundamentally new capability from a
   top lab (OpenAI, Anthropic, Google DeepMind, Meta, xAI, Mistral,
   Moonshot, Qwen, DeepSeek)? If no → demote to `major`.

If any answer is NO → fix or drop.

## Output

Write `sweep-draft.json` at the repo root. The pipeline scripts (`verify-draft.ts` and `finalize-sweep.ts`) produce the actual `releases.json`
and `sweeps.json` updates from your draft. Do NOT edit those files
directly.

This prompt is idempotent: re-running with no new qualifying releases
must produce a draft with `newItems: []`, a FULL `coverage` array (every
category you searched), and a `summary` that names WHICH sources you
checked and WHY nothing qualified (e.g. "Searched lab blogs, GitHub
trending, HF, HN and 8 YouTube feeds; Anthropic/Meta/Mistral quiet, no
≤72h release met the bar."). Empty sweep is success — but a logged,
auditable success, not a blank `cov:[]` that hides whether you looked.
