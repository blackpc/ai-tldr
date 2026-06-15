# SWEEP_MEMORY — caveman log

Read before touch sweep. Write here when sweep break.

## Rule 1. Read this. Then touch.

Many fix tried before. Same fix break new way. Don't repeat.

## Rule 2. Add entry when sweep break.

Format: `YYYY-MM-DD-X — what break. cause. fix. status.`
Short. Caveman words. No prose.

## Solved patterns. Don't break.

- **Same item twice = bad.** Script check id, normId, url. Agent must
  also check title meaning. Two different urls, same release = still
  bad. Agent eye look at `existing[].title`. Then add.
- **Old release ≠ news.** `date` more than 72h old, no ship. Even if
  HN still talk. `finalize-sweep.ts` enforce. No exception.
- **Cadence rule become quota. Quota make padding.** Don't tell agent
  "category empty" or "video gap N hours." Agent will fill with junk.
  `sweep-context.ts` give only `now`, `feedSize`, `existing[]`. No
  more.
- **Seismic = rare.** SOTA model from top lab + named flagship +
  community talk now. ALL three. Pricing, breach, M&A, restructure =
  major. Never seismic. Target 0–2 per week.
- **Awesome-list, old repo, stale video = not news.** "Got pushed
  today" mean PR merged. Repo from 2024 with stars = not news.
  "Tweet today as just-shipped?" If no, drop.

## Change log

### 2026-06-12-A — titles became super long

Break. User: "titles for all articles became SUPER LONG." Confirmed:
pre-`f549ca4` (the 6.1.0 rewrite, 2026-04-28) titles averaged 68 chars
(max 114). After, they ballooned to 150–322 chars — whole story crammed
into the headline (metrics, names, quotes, dates, two em-dashes). 365 of
712 live items over 90 chars.

Cause. The 912→380 line 6.1.0 rewrite dropped ALL title guidance.
Neither prompt nor schema ever constrained `title` length/style — old
prompt just happened to model short titles via examples elsewhere; the
rewrite removed those, so the agent drifted to summary-as-title. (The
6.1.0 entry above claimed "no padding" — it watched dedup/staleness, not
title length, so this slid through.)

Fix.
- `prompts/update-releases.md`: added a dedicated `### title` rule —
  ≤80 chars (hard cap 90), "headline not the whole story", format
  `<Name/claim> — <short descriptor>`, with good/bad examples. Detail
  goes in `summary`/`explainer`, never the title.
- `src/data/schema.ts`: doc comment on `title` mirroring the cap.
- `scripts/finalize-sweep.ts`: SOFT warning (not hard-fail) when any new
  item title > 90 chars. Soft on purpose — a long title is cosmetic, not
  a fabrication; hard-failing an unattended cron would drop real news.

Status. applied — prompt/schema/guard fixed for future sweeps. Existing
365 long titles NOT yet backfilled (pending user decision; content-
sensitive, zero-hallucination so meaning must be preserved). Watch next
cron run for the title-length warning count trending to 0 on new items.

### 2026-06-12-B — titles too hard to read (headline-journalese)

Break. User (non-native English speaker): titles use complex/fancy words
that are hard to read. Confirmed in feed: "rebuffs", "carve-out",
"overbroad", "rips", "slams", "touts", "unveils", "doubles down",
"cohort" — newsroom headline-ese.

Cause. No readability guidance in the prompt; agent defaulted to a
journalistic register.

Fix. Added "Plain, readable English" section to
`prompts/update-releases.md` (applies to title/summary/explainer):
target CEFR B2 / grade 8–10, common words over fancy synonyms, one idea
per sentence, plus a swap table (rebuffs→rejects, rips/slams→criticizes,
touts→promotes, unveils→announces/launches, etc.). Word choice only —
all facts/numbers/names kept. Cross-referenced from title + summary
sections. NOT a finalize-sweep guard (can't reliably detect "fancy" in
code without false positives). Soft-warned summary>240 chars while here.

Status. applied. Watch next cron's new titles for plainer wording.
Existing items not backfilled.

### 2026-04-28-A — same item three times

Break. Feed had `anthropic-claude-opus-4-7` ×3, `openai-gpt-5-5` ×2,
DeepSeek V4 ×2, more. Agent re-add with new title, new publishDate.

Cause. Dedup was line buried in rules. No script check. No example.
Plus "trending beats recency" said "still hot, add again."

Fix.
- Big "🚫 NEVER RE-ADD" block in prompt.
- `scripts/check-feed.ts` validator. Hard-fail on dup id.
- Wire into `bun run typecheck`.
- Dedupe data: 267 → 254 (kept oldest publishDate per id).

Status. applied → solved → reinforced 2026-04-28-G.

### 2026-04-28-B — too many papers, no videos

Break. 11 of 108 recent items were arXiv-trending papers. Zero videos
in 6 days.

Cause. No paper bar above arXiv-trending. No video pursuit.

Fix.
- Paper bar: needs 2-of-N (code, demo, HN traction, named author,
  newsletter pickup).
- "≥1 video per day" cadence. (← became 2026-04-28-C bug)
- Soft cap 2 papers/sweep.

Status. partially solved → cadence rule reverted in 2026-04-28-C.

### 2026-04-28-C — agent shipped 6-day-old Fireship video

Break. Agent saw `hoursSinceLastVideo: 205` in briefing. Treated
cadence rule as quota. Picked best available, shipped 6d-old video as
"news."

Cause. Cadence rule without freshness gate. `sweep-context.ts` leaked
gap signals. Same shape as 2026-04-28-A.

Fix.
- Hard 72h upload-date bar for video. `scripts/yt-meta.ts` returns
  `freshFor72hBar`. False = drop.
- Cadence framed as aspiration, not quota. (← still leaked. See -G.)
- Dropped Fireship item.

Status. applied → reinforced and simplified in 2026-04-28-G.

### 2026-04-28-D — agent shipped 3.4K-star awesome-list as news

Break. `composio-awesome-codex-skills` shipped because
`starvedCategoriesLast7d` listed `resource`.

Cause. Same shape as -C. Gap signal in `sweep-context.ts` =
quota in agent brain. Curated list "freshly pushed today" ≠ news.

Fix.
- Dropped item.
- Identified pattern: ALL gap signals are quotas. Plan: strip
  sweep-context.ts to only `now` + `existing[]`. (Done in -G.)

Status. solved in 2026-04-28-G.

### 2026-04-28-E — Mythos added 17 days late

Break. User browsed feed. Saw "Claude Mythos" date 2026-04-07.
Sweep ran 2026-04-26.

Cause. Prompt said "trending beats recency, 5-day-old releases are
news if hot now." Agent stretched 5 days → 17 days.

Fix.
- "Trending beats recency" deleted from prompt.
- Hard 72h cap on `date` field.
- Script enforcement added in -G (`finalize-sweep.ts` rejects old
  `date`).

Status. solved in 2026-04-28-G.

### 2026-04-28-F — seismic inflation

Break. 13 seismics in 7 days. User: "seismic = SOTA models, NOT
'Claude Deleted DB' or breach."

Cause. Auto-memory `feedback_catch_the_hype.md` taught
"frontier-lab pricing = always seismic." Prompt had auto-seismic
triggers for pricing / breach / multi-outlet. Agent followed.

Fix.
- Importance scale rewritten: seismic needs ALL of (a) SOTA model,
  (b) top lab, (c) community talk now. Pricing/breach/M&A = major.
- Auto-memory rewritten — no more auto-seismic-on-pricing.
- 5 existing items demoted to major. 1 to rumor.
- Target 0–2 seismics per week.

Status. solved in 2026-04-28-G.

### 2026-04-28-G — prompt rewrite (consolidation)

Break. After many patches, `prompts/update-releases.md` was 912 lines
with ~13 contradictions. Pricing said "auto-seismic" line 320 AND
"capped at major" line 46. Two STEP 0s. Manual write-files instructions
duplicating finalize-sweep.ts. Ghost CLI flags `--since`/`--max`/
`--reverify` (no parser). "Kabnan" coding agent (hallucinated).

Cause. Layered patches. Each fix added new text without auditing old
text. Reviewer subagent called it: "the prompt actively misleads."

Fix.
- Audit subagent ran ground truth on every script (`AUDIT.md`).
- Reviewer subagent listed 13 issues (`REVIEW.md`).
- Prompt rewritten 912 → 380 lines as version 6.1.0:
  - 4 hard rules: zero-hallucination, 72h date cap, semantic dedup,
    no padding.
  - Single canonical pipeline (sweep-context → draft → verify →
    finalize). No direct-write path.
  - Strict importance scale.
  - One inclusion bar (six signals).
  - One dedup section instead of three.
  - All ghost CLI flags removed. "Kabnan" removed. "blockedIds" →
    "existing[]" everywhere.
- `scripts/finalize-sweep.ts` now hard-fails on `date > 72h`. Test
  confirmed: 519h-old item rejected, files unchanged.
- `scripts/sweep-context.ts` stripped to `{now, feedSize, existing[]}`.
- `check-feed.ts` checks id + normId + canonical URL.
- Auto-memory `feedback_catch_the_hype.md` rewritten.

Test sweep result: 4 items added, all `major`, zero seismic, zero
padding. Mercor breach correctly REJECTED for being 27d old (would
have repeated -E). Awesome-lists correctly absent. Stale videos
correctly absent.

Status. applied. Watch next cron run.

## Open watch-list

- Next 7 days of cron sweeps: confirm zero dups, zero stale items,
  zero seismic inflation, zero padding.
- If any of A–F fail again, the pipeline regressed. Don't patch —
  audit the contradiction first.

---

## 2026-05-05-G — ecosystem over-inclusion / technical content starvation

**Trigger:** User observed 2-3 items per day, majority ecosystem/news,
very few model/repo/paper/tool items. Category breakdown over last 40
sweeps: ecosystem 29%, tool 27%, repo 15%, model only 6%.

**Root cause (two compounding issues):**
1. `ecosystem` gate was being ignored. "NOT ALLOWED: funding rounds
   without product impact" was in the prompt but agent kept adding
   IPO filings, valuations, revenue forecasts (Sierra $950M, Cerebras
   IPO, OpenAI CFO, Huawei chip forecast, KKR spinout).
2. Sources were searched in wrong order. Tier-1 press (full of business
   news) was being hit early, filling the 2-3 item quota before
   GitHub/HuggingFace/lab-blogs were checked for technical content.

**Changes (prompt v6.1.0 → v6.2.0):**
- `ecosystem` section: added concrete rejected-item examples, added
  "ecosystem gate test" (developer must have a concrete action),
  added hard cap of max 1 ecosystem-primary item per sweep.
- Sources section: reordered into required-first-pass (lab blogs,
  GitHub trending, HuggingFace, HN) + second pass + last-resort
  (tier-1 press). Press is now last-resort, not first-resort.
- Self-check question 9 added: ecosystem items must name a concrete
  dev action, and must not be the 2nd ecosystem-primary this sweep.

**Status:** Applied. Watch next 10 cron runs for category balance shift.

---

## 2026-05-05-H — zero videos ever added (asked 3 times, never fixed)

**Trigger:** User confirmed zero video items have ever been added by any
cron sweep. The v6.x prompt listed YouTube creators by name only — no
URLs, no channel IDs, no fetch mechanism. Agent had no way to discover
fresh videos and was in the "second pass" bucket, so it never tried.

**Root cause:** The YouTube section was purely decorative. "Two Minute
Papers, AI Explained, ..." are meaningless without a fetchable URL.
The agent cannot browse youtube.com channel pages reliably. RSS feeds
are the correct mechanism but were never wired in.

**Change (v6.2.0 → v6.3.0):**
- Added 8 verified YouTube RSS feed URLs directly in the prompt
  (channel_id confirmed via `feeds/videos.xml` for each):
  Two Minute Papers, AI Explained, Yannic Kilcher, Fireship,
  Matthew Berman, Sam Witteveen, 1littlecoder, Wes Roth.
- Moved YouTube to the **required first pass** (step 5), not second pass.
- Instruction: fetch all feeds every sweep, check `<published>` date,
  run `yt-meta.ts` on any ≤72h video, ship if `freshFor72hBar: true`.

**Status:** Applied. Next sweep should surface videos for the first time.

---

## 2026-06-13-A — STILL zero videos in CI (the real RCA, 4th attempt)

**Trigger:** User: videos work when the sweep is run locally but the cron
(GitHub Actions) adds ZERO. Asked several times, never fixed. Confirmed
from data: last video added 2026-05-06 (a residential/manual backfill —
all share publishDate `2026-05-06T21:17:51.354Z`). Every CI sweep since =
0 videos, despite "video"/"youtube" appearing in `coverage`. finalize
warned "919h since last video added".

**Root cause (proven from the 2026-06-13T07:40 CI run log, not guessed):**
The RSS scan was never the problem. `yt-rss-scan.ts` hits
`youtube.com/feeds/videos.xml` — that endpoint IS reachable from GitHub
Actions datacenter IPs; in CI it returned 6 fresh videos (ages 0–60h).
The killer was the SECOND step: `yt-meta.ts`'s `fetchUploadDate()`
scrapes the YouTube **watch page** (`/watch?v=…`) for `uploadDate`.
YouTube bot-walls the watch page from datacenter IPs and serves a
consent page with no date, so in CI **every** `yt-meta` call returned
`uploadDate: null` → `freshFor72hBar: false`. The prompt made that field
the hard gate ("false → drop, no exceptions"), so the agent correctly
dropped all 6 fresh videos. Its own CI log: *"YouTube videos dropped
because … `yt-meta.ts` returned `freshFor72hBar: false` … oembed page
scrape returning null uploadDate in CI."* Locally (residential IP) the
watch page returns the date → videos pass → "works locally."

Prior fix 2026-05-05-H added the RSS feeds but left the watch-page scrape
as the freshness gate, so it only ever worked from a residential IP.

**Fix (prompt v6.6.0 → v6.7.0 + 3 scripts):**
- `yt-rss-scan.ts`: each record is now SHIP-READY and authoritative —
  added `uploadDate` (== RSS `<published>`), `freshFor72hBar: true`
  (only ≤72h returned), `thumbnailUrl`, `channelUrl`. The RSS upload
  date is the freshness source; it works in CI.
- `yt-meta.ts`: new optional `<channelId>` arg → reads the date from the
  channel RSS feed (datacenter-safe) instead of the watch page. Watch-page
  scrape kept only as a fallback for ad-hoc videos with no channelId.
  Added `uploadDateSource` to the output for debugging.
- `verify-draft.ts`: YouTube watch URLs are now validated via the oembed
  endpoint (datacenter-safe, canonical "exists + embeddable" check)
  instead of GETting the bot-walled watch page — pre-empts a 2nd CI
  blocker where a real video's `url` would 4xx on the runner. Still
  rejects bogus video ids (oembed 404).
- `prompts/update-releases.md`: video flow now builds the item straight
  from `yt-rss-scan.ts` fields and forbids using a bare watch-page scrape
  as the freshness gate. yt-meta is optional and must be passed channelId.

**Why this won't regress:** the freshness decision no longer touches any
endpoint that YouTube blocks from datacenter IPs. RSS feed + oembed +
i.ytimg.com thumbnails are all proven-200 from CI.

**Do NOT reintroduce** a watch-page (`/watch?v=`) HTML scrape as a
freshness or verification gate — it is the exact thing that breaks in CI.

**Status:** Applied. Verified locally: scan emits ship-ready records;
`yt-meta … <channelId>` resolves date via `source: rss`; verify-draft
passes a real video (oembed) and fails a bogus id; typecheck green.
Watch the next cron run (and `coverage`/feed) for a video actually
landing — the 919h counter should reset.

---

## 2026-06-13-B — video wasn't the only dead category (audit follow-up)

**Trigger:** After the video-in-CI fix, a multi-agent audit of all 510
sweep reports asked "what ELSE repeats?" Found that `dataset` and
`algorithm` were ALSO silently dead — zero AUTOMATED adds for 48 days
(last auto-add 2026-04-26; the apparent "2026-05-06 add" was a manual
backfill). `paper` had gone 14d dry. Undiagnosed because the only
drought alarm in finalize-sweep.ts watched `'video'` and nothing else.

**Root cause:** Half the first-class categories had NO discovery source
in the prompt. Required-first-pass only mapped lab-blogs→model/tool,
GitHub→repo, HF models+papers→model/paper, HN→article, YouTube→video.
`dataset`/`algorithm`/`benchmark`/`tutorial` were named in category
lists but never pointed at a feed, so they only ever entered via manual
backfill. `coverage[]` made this invisible: it claimed "video"/"dataset"
on sweeps that added none for weeks, and was polluted with non-enum
source names (youtube, hn, …) that always delivered 0.

**Change (prompt v6.7.0 → v6.8.0 + finalize-sweep.ts):**
- `finalize-sweep.ts`: replaced the video-only cadence warning with a
  GENERAL per-category drought alarm (DROUGHT_DAYS map; cadence axis =
  `publishDate`/ingest, not `date`). Soft warning only — never blocks,
  never feeds sweep-context, so it CANNOT become a quota (the 04-28-B/C
  scar). Catches the next silent-zero automatically.
- `prompts/update-releases.md`: added HF Datasets to the first-pass HF
  visit (→ `dataset`); noted technique-papers are also `algorithm`;
  added a second-pass benchmarks/tutorials lane; added the Chinese
  frontier labs (DeepSeek/Zhipu-Z.ai/MiniMax/Baidu/ByteDance) to the
  lab-blog list (Western-lab discovery had been narrowing: Chinese-lab
  share 15.7%→7.2% over 3 months). Every addition is framed as "where to
  look, NOT a quota — if nothing qualifies, add nothing." The inclusion
  bar still gates; this does not pressure padding.
- Tightened `coverage[]` rule: enum values only, no source-name
  pollution, no listing a category you didn't really query.

**Deliberately NOT changed here (need an editor decision, logged so they
aren't re-litigated blind):**
- The 368 over-cap titles (50.8% of feed) — backfill is content-
  sensitive (zero-hallucination); the title CAP itself is already
  working on new items (06-12/06-13 new items comply).
- Importance grade-inflation (major 39%→78%): the prompt currently
  DEFINES `major` as the default tier, so "inflation" may be working as
  written. Re-anchor the definition before adding any guard.

**Status:** Applied. Watch next ~10 crons: expect the drought alarm to
fire for paper/dataset/algorithm until their new sources land items, and
expect at least occasional dataset/algorithm/benchmark adds. Do NOT let
the alarm tempt padding — an empty category is still a valid sweep.

## 2026-06-15-A — landscape miss huge popular tools. discovery blind.

What break: user spot OpenClaw (378k★) + NousResearch/hermes-agent (194k★)
NOT in /learn/landscape. Scan show 230 popular AI repos (≥8k★) missing —
incl famous old ones: huggingface/transformers, langflow, gpt4all,
OpenHands, Flowise, gemini-cli, Continue, Quivr, khoj, composio,
gpt-researcher. Not just new tools. Build was never complete.

Cause: landscape DISCOVERY came from what research LLMs already knew
(training cutoff + ad-hoc web). Never diffed against GitHub TOP-BY-STARS.
So any tool the model not recall — even #1 on GitHub — never a candidate.
And `refresh-learn-stars.ts` only update stars of tools ALREADY listed; it
never DISCOVER new ones. Set frozen + incomplete from day one.

Fix: `scripts/discover-landscape-gaps.ts` — query GitHub top-starred AI
repos across the 9 categories' topics, drop awesome-lists/courses/books,
subtract what we list, print missing popular tools. Wired into the 2h
sweep (`update-releases.yml`, advisory step → run summary, never blocks).
Run manual: `GAP_MIN_STARS=15000 bun scripts/discover-landscape-gaps.ts`.

Don't repeat: never treat the landscape as "done". Discovery must pull
from GitHub popularity, not only model memory. When adding tools, still
README-ground each + verify repo via API (zero-hallucination) and filter
noise (skill-packs, prompt-leaks, generic DBs, courses).

Status: fix shipped. Backfill of the real missing tools = separate curated
pass (needs detail-page gen per tool + category placement).
