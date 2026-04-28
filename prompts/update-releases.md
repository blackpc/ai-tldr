---
prompt-id: tldr.update-releases
prompt-version: 6.1.0
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
   - `bun scripts/yt-meta.ts <url>` — returns
     `{ videoId, watchUrl, title, channelName, channelUrl, thumbnailUrl, uploadDate, ageHours, freshFor72hBar }`.
     For any video, ship only if `freshFor72hBar: true`.
   - `bun scripts/og-image.ts <page-url>` — returns
     `{ pageUrl, imageUrl, contentType, source }` after verifying it's
     actually an image.
   - `bun scripts/gh-repo-meta.ts <owner>/<repo>` — returns stars,
     description, license, default branch, `ogImageUrl`, etc.
4. **Draft.** Write `sweep-draft.json` at the repo root:
   ```json
   {
     "newItems":   [ /* full ReleaseItem[] */ ],
     "updates":    [ { "id": "...", "patch": { ... }, "note": "..." } ],
     "removals":   [ { "id": "...", "reason": "..." } ],
     "summary":    "1–2 sentence sweep summary",
     "coverage":   ["model","repo",...],
     "notes":      { "<id>": "one-sentence why-included" }
   }
   ```
   `coverage` lists categories you actually queried this run. Don't
   pad it. On a zero-add sweep, omit `coverage` entirely or pass an
   empty array — the soft warning is informational only.
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

Search whichever sources fit the candidate type. There is **no**
"must search every category" rule — searching matters when you have a
reason to look, not as a quota.

- **HN**: front page top 30, "Show HN" AI posts.
- **GitHub trending**: filter to AI/ML, `?since=daily`.
- **HuggingFace**: `/papers` and `/models?sort=trending`.
- **Lab blogs**: anthropic.com/news, openai.com/index, deepmind.google,
  ai.meta.com/blog, x.ai/blog, mistral.ai/news, cohere.com/blog,
  qwen.ai, moonshot.ai.
- **Coding agents** (watch for new releases / blog posts): Cursor,
  Claude Code, Windsurf, Cline, Aider, Continue, OpenCode, Codium,
  Tabnine, Codeium.
- **Tier-1 AI press**: theinformation.com, bloomberg.com (AI beat),
  theverge.com/ai, theregister.com/AI, arstechnica.com/ai,
  techcrunch.com/ai, stratechery.com.
- **Reddit**: r/LocalLLaMA hot, r/MachineLearning hot, r/artificial top.
- **Influential voices** (for `article` items only): simonwillison.net,
  karpathy.ai, latent.space, interconnects.ai, lilianweng.github.io,
  eugeneyan.com, importai.substack.com, deeplearning.ai/the-batch.
- **YouTube** (for `video` items only): Two Minute Papers, AI Explained,
  Yannic Kilcher, Fireship, Matthew Berman, Sam Witteveen, 1littlecoder,
  Wes Roth.

## Item schema

Every item conforms to `ReleaseItem` in `src/data/schema.ts`. Required:
`id`, `categories`, `title`, `org`, `date`, `url`, `summary`, `tags`,
`importance`, `explainer`, `image`, `links`. There is only ONE date
field — `date` (the public release date, YYYY-MM-DD). It drives both
ordering and what readers see.

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

≤ 240 chars, plain English. Banned words: "revolutionary",
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

72h freshness bar enforced via `yt-meta.ts`'s `freshFor72hBar` flag.
If false → drop. No "almost fresh" exceptions.

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
deprecations that break downstream users.

NOT ALLOWED: funding rounds without product impact, hires/departures,
roadmap announcements, conference dates.

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
must produce a draft with `newItems: []` (and a `summary` describing
what you searched). Empty sweep is success.
