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
