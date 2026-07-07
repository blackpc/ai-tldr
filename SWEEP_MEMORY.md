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

## 2026-06-17-A — "too many empty sweeps?" — NOT over-filtering; empty sweeps were un-auditable

**Trigger:** User asked whether the many empty sweeps mean we filter out too
much. Data: 181/535 all-time sweeps empty (34%); 12/50 recent (24%). EVERY
empty sweep showed `coverage: []`, while every productive sweep had a full
coverage list.

**Root cause (proven from a real CI run log, not guessed):** Empty sweeps are
LEGITIMATE. Pulled the 2026-06-17T03:25 CI run (→ the 03:37 "+0 cov:[]"
sweep). The agent DID search and reasoned in its own draft: "Lab blogs are
quiet: Anthropic/Meta/Mistral/Moonshot have no new…", then correctly shipped
zero. So it is NOT short-circuiting and NOT over-filtering — the opposite of
the padding scars (04-28-A/B/C). Two real findings instead:
1. The prompt told the agent `coverage` was "informational only — omit or pass
   an empty array" on zero-add sweeps. So empty sweeps recorded `cov:[]`,
   making them indistinguishable from a short-circuit — you literally cannot
   answer "did we miss news?" from the log.
2. GitHub THROTTLES the schedule: 30 recent runs landed ~every 4–5h, not the
   configured 2h (scheduled-workflow drop under load). So there are genuinely
   fewer sweeps than 12/day — not a filtering issue, a GH platform limit.

**Change (prompt only — NO filter/bar/72h-cap change, those are scar-protected):**
- `prompts/update-releases.md`: `coverage` is now REQUIRED on every sweep,
  ESPECIALLY zero-add ones (list every category genuinely queried → proves
  breadth-of-search). Framed explicitly as NOT a quota: recording what you
  searched can never pressure an add. Empty-sweep `summary` must now name the
  sources checked + why nothing qualified.
- Did NOT loosen the inclusion bar or 72h cap, and did NOT add any cadence/gap
  signal — that is exactly what caused the 04-28 padding scars. Over-filtering
  was the user's hypothesis; the data refuted it.

**Deliberately NOT changed (logged so it isn't re-litigated):** the GH cron
frequency. Bumping `0 */2 * * *` → hourly to hedge GH's dropped runs would risk
queueing against the 65-min job cap + concurrency group, and may itself be
throttled. Left for an explicit editor decision.

**Status:** Applied. Watch next ~10 crons: empty sweeps should now carry a FULL
coverage array + an informative summary (the `coverage: 0/15` finalize warning
should stop firing on empty runs). If an empty sweep still shows `cov:[]`, the
agent ignored the rule — investigate, do NOT respond by loosening the bar.

## 2026-06-17-B — sweep COMMITTED but never PUSHED: rebase aborted on a dirty tree (generated stats.json)

**Trigger:** User: "your updated sweep failed in GH action" (run 27693045961).
The sweep DID its job — committed `9f265e7 feat(content): scheduled release
sweep 2026-06-17T13:51Z, 3 files changed` — then the push step died:
`error: cannot rebase: You have unstaged changes. Please commit or stash them.`
Exit 1. The whole sweep failed and that content was LOST (ephemeral runner).

**Root cause (confirmed from the run's "Show diff" step, not guessed):** the
commit stages only `$FILES = releases.json sweeps.json learn/github-stars.json`,
but `git status` showed a FOURTH dirty file: `src/data/stats.json`. The sweep's
validation `bun run build` starts with `bun scripts/build-stats.ts`, which
REGENERATES `src/data/stats.json` from the new feed (and check-learn rewrites
`learn/count.json` + `learn/article-images.json` when touched). Those derived,
TRACKED files were left unstaged → `git rebase FETCH_HEAD` refuses to run on a
dirty tree → exit 1. Not a content/filter problem; a push-mechanics regression
that surfaced once stats.json became build-regenerated AND feed-dependent.

**Change (`.github/workflows/update-releases.yml`, commit step only):** after
`git add $FILES && git commit`, added `git checkout -- . 2>/dev/null || true`
BEFORE the fetch/rebase/push loop. The intended files are already safe in the
commit; this discards every stray unstaged change (stats.json, count.json,
article-images.json, and any future generated file) so the rebase starts clean.
Reproduced the exact abort in a throwaway repo and confirmed the checkout
clears it and the rebase then succeeds.

**Why discard, not commit, the generated files:** Cloudflare's deploy build runs
`bun run build` (which starts with `build-stats`), so stats.json + the learn
JSON are regenerated FRESH from the pushed feed at deploy. Committing them from
the sweep would only add rebase-conflict risk on generated JSON for zero
production benefit. The committed copies are a dev/seed convenience; production
is always rebuilt.

**Deliberately NOT changed:** the `$FILES` list (didn't add stats.json — see
above), the build pipeline, the inclusion bar / 72h cap / coverage rule from
2026-06-17-A. Single-line, surgical push-step guard.

**Status:** Applied. Watch the next cron: it should commit AND push (look for
`pushed=true` + a new `feat(content): scheduled release sweep` commit on
master). If a sweep ever again commits-but-fails-to-push, check `git status`
in the "Show diff" step for a NEW generated tracked file — the checkout already
covers all of them, but a new write OUTSIDE the working tree reset would need
the same treatment.

## 2026-06-17-C — added OPTIONAL typed `benchmarks` + `pricing` fields (visual upgrade, source-gated)

**Trigger:** R7 "add more information and visuals to releases data". Built typed
benchmark comparison bars + pricing tables on release pages (modal + prerender)
+ SoftwareApplication offer JSON-LD from real prices.

**What shipped:** `Benchmark`/`Pricing` interfaces in schema.ts; `benchmarks?`
+ `pricing?` on ReleaseItem; `scripts/check-releases.ts` validator wired into
build+typecheck; field docs in this prompt; bench-bar + pricing-table UI.

**Scar discipline (why this is safe, given the 04-28 padding scars):** both
fields are OPTIONAL, source-GATED, and explicitly framed as NOT a quota:
- Every benchmark/pricing `source` MUST be a cited link (`links[]` or `url`).
  `check-releases.ts` FAILS THE BUILD if not — so you cannot render a bar or a
  price without pointing at where it came from. This is the same zero-
  hallucination invariant as `summary`, just enforced mechanically.
- The prompt says, in bold terms, "NOT a quota", "not expected on most items",
  "never invent or estimate". Open-weight/free releases have no pricing page →
  omit. No published eval table → omit. The UI renders nothing when the field
  is absent (graceful, like quickFacts/faq before backfill).
- Numbers are validated: `score ≤ max`, finite; exactly one highlighted row
  when there are competitors. A malformed chart fails the build, never ships.

**Why this does NOT repeat the padding scars:** the scars were about CADENCE/GAP
signals pressuring the agent to ADD low-value ITEMS. These fields add structured
DETAIL to items the agent already decided to include on their own merits — they
can never pressure an inclusion decision. Recording a benchmark you found is
like recording coverage (2026-06-17-A): it documents, it doesn't inflate.

**Deliberately NOT done:** did not make benchmarks/pricing required, did not tie
them to importance tier as a gate, did not add any "fill N benchmarks" target.

**Status:** Applied (schema+validator+UI+prompt). Backfilled a few recent
model/tool items so the UI isn't empty. Watch: if a sweep starts attaching
benchmarks/pricing to items WITHOUT a matching source link, the build will
fail in check-releases — that's the guard working; fix the data, don't relax
the source rule.

## 2026-06-17-D — LLM registry (/models) + automatic wiki-style cross-linking from releases

**Trigger:** user asked for an Artificial-Analysis-style registry of LLMs
(Miller columns + tags, per-model detail pages with benchmarks/costs/APIs/
version history) AND for new sweeps to auto-link any LLM named in a release to
that registry (and tools to the landscape), "wiki links style".

**What shipped:**
- New `/models` section: `src/data/models/` (schema, registry.json tree,
  per-model `models/<slug>.json`, count.json), `src/components/models/*`,
  `scripts/prerender-models.tsx` (hub CollectionPage + per-model
  SoftwareApplication/Breadcrumb/FAQ JSON-LD, `__MODELS_DATA__`,
  sitemap-models.xml), `scripts/check-models.ts` validator (wired into
  build+typecheck after check-landscape). 16 verified models / 12 makers seeded.
- **Cross-linking is BUILD-TIME + automatic, not an agent task.** The
  prerenderer's entity-linker (`linkifyEntities` + `matchedModels` /
  `matchedTools`) links the FIRST whole-word mention of any registry model →
  `/models/<slug>` and any landscape tool → `/learn/landscape/<slug>`, in the
  release prose, plus a "Learn more" footer list. The agent does nothing
  except NAME models/tools with their exact canonical spelling.

**Scar discipline (why this is safe):**
- The linker only fires on entities ALREADY matched in the item's own
  title/tags (whole-word, capped at 3 each), so it can't invent associations
  or pressure an inclusion decision. It documents what the agent already wrote.
- Model names are highly distinctive ("Claude Opus 4.8", "Llama 4 Maverick"),
  so false-positive risk is far below generic tool words; still whole-word
  bounded + first-mention-only (`used` set, namespaced keys tool:/model:).
- Zero-hallucination holds: every benchmark/pricing `source` on a model page
  MUST be present in that model's `links[]` or check-models FAILS THE BUILD —
  same mechanical guard as check-releases. A near-miss name simply doesn't link
  (no fake link is ever emitted).

**Prompt change:** added a GEO bullet — name models/tools EXACTLY so they
auto-link; do NOT hand-add these links; if a hot model isn't in the registry,
that's a signal to add it to `src/data/models/`, not to fake a link.

**Status:** Applied (registry + prerender + validator + cross-linking + prompt).
Watch: if a model page ships a benchmark/pricing source not in its links[], the
build fails in check-models — that's the guard; fix the data, don't relax it.

## 2026-06-18-A — registry/Tools went STALE: nothing maintained them after launch

**Trigger:** User: "does our sweep update LLMs/Tools when new is published? for
some models we write Latest/Current/etc — such things must be updated if a new
model arrives (or tool)." Correct: the 2h feed sweep only commits
`releases.json`/`sweeps.json`/`github-stars.json` and `git checkout -- .`
discards everything else — so it CANNOT maintain `/models` or `/learn/landscape`
content. Tool STARS auto-refresh; new tools were only flagged advisory; the
registry was untouched. 88 hand-set `current:true` flags + ~12 "Current/Latest"
blurbs would rot the moment a newer model shipped.

**Fix — a NEW separate daily job + structural anti-rot (NOT bolted onto the 2h
feed sweep — different rules: evergreen pages, no 72h cap):**
- `prompts/maintain-registry.md` — SSoT for the daily sweep. Adds newly-shipped
  models + notable missing OSS tools + verified price/benchmark/status changes.
  Same scar discipline as the feed sweep: zero-hallucination, source-in-links
  enforced by check-models/check-landscape, NO padding (a no-op day is correct),
  per-run caps are ceilings not targets, evergreen wording only.
- `.github/workflows/maintain-registry.yml` — daily `30 5 * * *` + dispatch.
  Discovers tool gaps → builds freshness context → runs Claude → `bun run build`
  GATE (invalid data fails the job, never commits) → commits ONLY the catalog
  allowlist (`registry.json`, `models/`, `landscape.json`, `tools/`,
  `github-stars.json`) then `git checkout -- .` (the 06-17-B discard guard) →
  rebase-with-retry push.
- `scripts/registry-freshness.ts` — read-only context seed (current flagship per
  line + tool gaps). Framed "where to look", explicitly NOT a quota (the 04-28
  padding scar): recording our current state can never pressure an add.
- `scripts/check-models.ts` — STRUCTURAL anti-rot: (1) `current` is now DERIVED
  per line at build (advance-only, **released-gated**: only a GA, non-future,
  strictly-newer sibling can take the badge — a naive newest-date rule promoted
  Preview/Announced/Superseded entries like gemini-3-5-pro / gpt-5-3-codex-spark,
  so it must check detail `status`). Adding a GA newer model now auto-demotes the
  old current. (2) Soft-WARN (never fail) when a registry blurb uses time-relative
  words ("current/latest/newest") — surfaces the ~10 rotting blurbs for the daily
  sweep to fix; cosmetic, so soft like the feed sweep's title-length warn.

**Deliberately NOT done:** did not give the 2h feed sweep write-access to the
catalog (keeps its blast radius tiny); did not hard-fail the build on
time-relative wording (would break the build on 10 existing blurbs — soft-warn
instead); did not auto-flip `current` by raw date (regresses curated flags —
released-gate required).

**Status:** Applied (prompt + workflow + 2 scripts). First run should be
triggered by hand (`workflow_dispatch`) and WATCHED before trusting the cron —
confirm it commits valid catalog data and the build gate holds. If the daily
sweep ever commits a model/tool whose benchmark/price has no source link, the
build gate fails — that's the guard; fix the data, never relax it.

## 2026-06-20-A — major releases shipping without faq/quickFacts (missing SEO structure)

**Trigger:** User saw Cursor 3.8 (`cursor-3-8`, `major`) live with weak content:
the explainer led with a wind-up ("Cursor 3.8 is the latest release of the
Cursor coding agent…") instead of the new feature, restated `/automate` in
nearly every field (4×), and carried NO `faq` and NO `quickFacts` — so the
release page had no labeled-facts table and no FAQPage JSON-LD. Not a one-off:
17/25 recent `major`/`seismic` items had `faq`, 18/25 had `quickFacts`, so this
was an inconsistent skip.

**Root cause:** the prompt framed `quickFacts` + `faq` as "optional — strongly
preferred for seismic/major". The agent read "optional" and skipped them. That
framing was copied from `pricing`/`benchmarks` (2026-06-17-C), but those need
PUBLISHED numbers and are legitimately absent; `quickFacts`/`faq` are ALWAYS
derivable from any major announcement, so "optional" was simply wrong for them.

**Change:**
- `prompts/update-releases.md`: `quickFacts` + `faq` are now **REQUIRED for
  seismic/major** (with the "always derivable, unlike pricing/benchmarks"
  rationale so the agent can't treat them as a judgment call). Added explainer
  rules: `whatIsIt` must LEAD with the new thing (no "X is the latest release…"
  wind-up), and each field must ADD information — repeat the entity NAME for
  quote-ability, never the same EXPLANATION.
- `scripts/finalize-sweep.ts`: new SOFT warning when a new `seismic`/`major`
  item lacks `faq` or `quickFacts`. **Soft, not hard** — hard-failing an
  unattended cron drops real news (the 06-12-A scar) and a hard gate would
  pressure fabricated FAQs to pass, which zero-hallucination forbids. Same
  pattern as the title-length/drought warnings.
- Backfilled `cursor-3-8`: rewrote the explainer (feature-first, `/automate`
  4→2, one entity-name per field), added 7 `quickFacts` + 4 `faq`, every fact
  verified against `cursor.com/changelog/06-18-26`.

**Deliberately NOT done:** did NOT hard-fail `check-releases` on missing
faq/quickFacts (drops news + fabrication pressure — see above). Did NOT
backfill the other older major items missing these (content-sensitive,
zero-hallucination → each needs a source re-fetch; separate pass if the editor
wants it).

**Status:** Applied (prompt + finalize-sweep + cursor-3-8 backfill). Watch the
next ~10 crons: the new "SEO structure" finalize warning should fire 0× on new
major items if the prompt lands. If it fires, the agent skipped required
structure — reinforce the prompt, do NOT convert it to a hard gate.

## 2026-07-05-A — biomedical / AI-for-science was invisible unless it hit a general venue

**Trigger:** Planning coverage for a biomedical-data-scientist reader segment
(ML for genomics & imaging, digital biomarkers, biosignal/speech analysis,
workflow automation). The feed HAS surfaced bio AI before (Claude Science,
GeneBench-Pro, LifeSciBench, Brain2Qwerty) — but only by luck, when the item
trended on HN / GitHub / HF. There was no biomedical-specific discovery source,
so anything that shipped on a specialist channel (Isomorphic Labs, Arc
Institute, EvolutionaryScale, Google/MS health research) was never seen.

**Root cause:** the inclusion bar is deliberately venue-based, not topic-based
(good — it's how we stay high-signal). But the source list only named
general/frontier AI venues, so an entire domain our audience cares about had
zero discovery pointers — the same failure mode as the video/dataset/algorithm
droughts (2026-05-05-H, 2026-06-13-B): a real category with nothing aimed at
its sources.

**Change:**
- `prompts/update-releases.md`: added an **"AI-for-science lane
  (biomedical / life-sciences)"** block in the second pass. Points at
  specialist org blogs (isomorphiclabs.com, evolutionaryscale.ai,
  arcinstitute.org/news, chaidiscovery.com, health.google,
  research.google/blog, MS Research Health Futures) + a gated
  community/aggregator lane (HF biology/medical trending, r/bioinformatics,
  Papers-with-Code Medical, and bioRxiv/medRxiv ONLY with code + HN/HF
  traction). Notes that the frontier labs already in the first pass ship bio
  work too (AlphaFold/AlphaGenome, GeneBench, Claude Science).
- **No bar relaxed**: same 72h cap, same dedup, same 2-of-N rule for anything
  paper-shaped (never a bioRxiv paper alone). Frontier-lab bio breakthroughs
  are seismic-eligible under the EXISTING "SOTA/frontier-tech from a top lab"
  rule — the block says so explicitly so the domain isn't softened.
- **Bounded**: capped at ~1 item from this lane per sweep unless genuinely
  seismic, so it can't crowd out core AI. Domain rides in `tags` (`genomics`,
  `medical-imaging`, `biomarker`, `bioinformatics`, `proteomics`,
  `clinical-nlp`) — NO new feed `category` (categories stay artifact-type).

**Deliberately NOT done:** did NOT add a `biomedical` feed category or touch
`src/data/schema.ts` (domain is a tag, not an artifact type — a new enum would
fragment the filter bar for a cross-cutting topic). Did NOT add bioRxiv/medRxiv
as a primary paper source (papers still need the 2-of-N signals; a bare
preprint firehose is exactly what the no-padding rule forbids). Did NOT give the
lane a quota — "this is where to look, not a must-fill" (same caveat as the
dataset/benchmark lanes).

**Status:** Applied (prompt only — no code change). Watch the next ~2 weeks:
the lane should produce the occasional bio item WITH a domain tag and NOT push
seismic/major inflation. If it never fires, the specialist channels may be
404ing at runtime (verify the URLs and update the domain list); if it over-fires
or crowds out core AI, tighten the ~1-per-sweep cap. Do NOT re-solve by adding a
category — that was considered and rejected here.

## 2026-07-07-A — biomedical/neuro news the bio lane STILL missed (COMPASS class + neuroscience)

**Trigger:** User asked why two real items weren't in the feed:
- COMPASS (Harvard / Zitnik Lab) — AI model predicting cancer-immunotherapy
  (ICI) response from tumor gene-expression, Nature Medicine 2026, public repo
  `mims-harvard/COMPASS` (~90 stars), covered by ~6 outlets. A genuine RELEASE
  that qualifies — but nothing surfaced it.
- MMCLE cortical-lesion detection (Buffalo / Genentech) — a Communications
  Medicine methods paper with NO released code/model/demo.
User then added: "also neuro AI news I want to have".

**Root cause:** 07-05-A fixed *which domains* we look at but kept the same
*discovery venues*, tuned for ≥500-star github-trending + HN front page + HF
trending. Applied academic clinical models ship differently — journal paper +
university PR + a small (~90-star) academic repo — so COMPASS cleared the
quality bar (released repo + Nature Medicine + multi-outlet) yet was invisible
by those metrics. Neuroscience/neurotech AI (BCIs, neural decoders,
neuroimaging) had no explicit pointer at all.

**Change (prompt only):**
- Expanded the lane to "biomedical, clinical & neuroscience".
- New **"Applied clinical / academic AI models (COMPASS class)"** bullet: a
  named model with a peer-reviewed journal + public repo + ≥3 independent
  outlets is a real release and clears 2-of-N — explicitly DO NOT gate this lane
  on star-trending (academic repos are small but real). Repo is the artifact →
  `["model","repo",<domain>]`.
- New **"Neuroscience / neurotech AI"** bullet: BCIs (Neuralink, Precision
  Neuroscience, Synchron), brain-to-text/speech decoding (Brain2Qwerty is the
  existing exemplar), neuroimaging / EEG / MEG DL. Frontier neural decoders are
  seismic-eligible.
- Added EurekAlert + Nature / Nature Medicine highlights as DISCOVERY pointers
  (verify the named model + repo directly; never cite the press release as the
  artifact). Extended domain tags: +`oncology`, `neuroscience`,
  `brain-computer-interface`, `neuroimaging`. Bumped the lane cap 1 → ~1–2/sweep
  (it now spans three sub-domains).
- Added COMPASS to the feed by hand via `propose-release.yml`.

**Deliberately NOT done:** did NOT add MMCLE — a finding paper with no artifact;
the "no papers alone" rule holds (adding it would turn the feed from a release
tracker into a clinical-AI-findings firehose). Did NOT lower the GLOBAL
github-trending star bar — the relaxation is scoped to THIS lane's
journal+repo+multi-outlet signal, so core AI discovery is unchanged. Did NOT add
a neuro/medical feed `category` (domain stays a tag).

**Status:** Applied (prompt + SWEEP_MEMORY; COMPASS added out-of-band). Watch:
the lane should now occasionally surface a COMPASS-class model or a neuro-AI
result WITH domain tags, still ≤1–2/sweep. If it starts posting finding-papers
with no code, the "no papers alone" line isn't landing — reinforce it, don't
gate harder.
