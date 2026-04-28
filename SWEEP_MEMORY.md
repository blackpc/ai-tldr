# Sweep Agent History & Lessons

This file is the **persistent memory of how the sweep agent has been
tuned over time**. Every time the user is unsatisfied with sweep
output, the fix gets recorded here — what was wrong, why it happened,
what we changed, and whether it stuck.

## How to use this file

**Before changing the sweep prompt, code, or behavior, READ THIS FILE
END TO END.** Many "fixes" have been tried before and either worked,
failed, or regressed. Do not re-introduce a pattern that's already
flagged here as broken. Do not re-fix something that's already solved
unless you can show why the previous fix didn't hold.

**After changing anything that affects sweep output**, append a new
entry to the "Change log" section below. Include:

1. **Date** (today's date — convert relative to absolute).
2. **Trigger** — what the user complained about, or what regression
   you observed.
3. **Root cause** — what was actually broken (be specific — file/line
   /prompt section).
4. **Change** — what you modified. Reference exact files and the
   nature of the edit.
5. **Status** — `applied / verified / reverted / superseded`.
6. **Notes** — anything subtle a future agent should know.

Don't write retrospectives in summary form here. Write **per-incident
entries** so the next agent can see the chain of cause and effect.

## Open issues / known watch-list

Items currently being monitored for regression. When a fix sticks for
≥ 2 weeks of sweeps, move it from here to "Solved patterns".

- *(none yet — first version of this file)*

## Solved patterns (do not re-break)

These are rules that came out of past incidents. Breaking them tends
to reproduce a known user complaint.

- **Dedup by `id` is mandatory and the agent has historically ignored
  it.** Multiple sweeps re-added `anthropic-claude-opus-4-7`,
  `openai-gpt-5-5`, `deepseek-v4`, `qwen3.6-27b`, `kimi-k2.6` etc.
  with fresh `publishDate` and boosted `importance`, making the same
  story appear 2–3 times in the feed. Fix: explicit "DO NOT RE-ADD"
  block in `prompts/update-releases.md`, plus the prerender script
  refuses to build if duplicate ids exist. See entry **2026-04-28-A**.
- **Old news must not be re-published as fresh.** A model from 2 weeks
  ago is not "trending news today" just because it's still being
  discussed. The hype window is real but bounded — once an item is in
  the feed, leave it. See entry **2026-04-28-A**.
- **Video category dies if not actively pursued.** Category coverage
  rule alone wasn't enough; agent kept "searching" but never adding.
  Fix: explicit minimum-cadence requirement on videos. See entry
  **2026-04-28-B**.
- **Paper-heavy sweeps feel like an academic feed, not a community
  feed.** Cap papers and require a notability bar above arXiv-trending.
  See entry **2026-04-28-B**.
- **Cadence rules become quotas if not paired with freshness bars.**
  After 2026-04-28-B introduced the "≥1 video per day" cadence rule,
  the next sweep padded the feed with a 6-day-old Fireship video to
  clear the cadence signal. Cadence is an aspiration, not a quota:
  it is OK to ship zero videos when nothing fresh exists. Hard
  freshness bar: video upload date ≤72h. `yt-meta.ts` returns
  `freshFor72hBar` so the agent can check programmatically. See
  entry **2026-04-28-C**.

## Change log

### 2026-04-28-A — Duplicate seismic items, old news re-published

**Trigger.** User: "we have a huge problem with our sweep cron agent
- i see same seismic news or Opus 4.7, Gpt 5.5, etc, etc OVER and
OVER again! It was released like weeks ago and we have published it
like 4 times!"

**Root cause.**
- `prompts/update-releases.md` had a "Deduplicate against the existing
  feed by id" line buried in "Hard rules" but no callout, no example,
  no enforcement. The agent kept emitting items with the same `id` and
  a slightly different title, and no validator caught it.
- The "Trending beats recency" clause encouraged re-surfacing — the
  agent interpreted it as "if it's still hot, add it again", instead
  of "if a 5-day-old item is hot, it's worth adding the *first* time".
- `releases.json` had real duplicate ids: `anthropic-claude-opus-4-7`
  ×3, `openai-gpt-5-5` ×2, `deepseek-v4` ×2, `qwen-qwen3-6-27b` ×2,
  `moonshot-kimi-k2-6` ×2, `tencent-hy3-preview` ×2,
  `safetensors-pytorch-foundation` ×2, `vista4d-cvpr-2026` ×2,
  `openai-privacy-filter` ×2, `qwen-qwen3-6-35b-a3b` ×2,
  `tencent-hy-world-2` ×2, `anthropic-claude-design` ×2.

**Change.**
1. Added a top-level "🚫 NEVER RE-ADD AN EXISTING ITEM" block to
   `prompts/update-releases.md` immediately after the MISSION section,
   with the exact failure mode spelled out.
2. Reframed "Trending beats recency" — it now says "an old item we
   *missed* can still be added once; an item we already have stays
   put".
3. Self-check now requires explicit "I checked existing ids" answer.
4. Deduped `src/data/releases.json` — kept the entry with the oldest
   `publishDate` per id (preserves original feed-entry timestamp).
5. Added `scripts/check-feed.ts` — fails the build if `releases.json`
   contains duplicate ids. Wired into `bun run typecheck`.

**Status.** applied (2026-04-28). Will verify on next 2-hour sweep —
expectation: zero new items with an id already present.

**Notes.**
- The `publishDate` ordering quirk: kept the OLDEST publishDate per id,
  not the newest. Newest would mask the bug (item floats to top); oldest
  preserves the truth that we only added it once.
- The build-time validator is the real safety net. Even if the prompt
  fails, the cron commit will fail typecheck and not push.

### 2026-04-28-B — No videos added, too many papers / niche items

**Trigger.** User: "Another issue - too many Papers and very Niche
news, AAND STIL NOT A SINGLE VIDEO WAS ADDED."

**Root cause.**
- Category coverage rule said "search every category" but had no
  inclusion floor for `video`. Result: 3 video items in entire feed,
  none added since 2026-04-20.
- 11 of 108 items added in last 6 days were `paper`-primary; many
  were arXiv-trending with no demo / no code / no community
  discussion — exactly the "academic feed" failure mode.

**Change.**
1. New rule in `prompts/update-releases.md`: **at least one `video`
   item per ~24h of sweeps** (calendar-day basis, not per-sweep). If
   no qualifying video found, sweep summary must explicitly say
   "checked YouTube channels [...], nothing qualified".
2. Tightened paper bar: arXiv-trending alone is NOT enough. A paper
   needs at least TWO of: code/repo, working demo, HN/Twitter
   discussion thread with traction, named author from influential
   list, or pickup by Simon Willison / TLDR / Interconnects.
3. Soft cap of **2 papers per sweep**. If you find more, cut to the
   top 2 by traction, drop the rest.

**Status.** applied (2026-04-28). Watch-list: video cadence and
paper-share over next 7 days of sweeps.

**Notes.**
- The YouTube oembed endpoint is the easy path — already documented
  in the prompt's `video` section. Use it. No excuse for "couldn't
  verify the channel".
- Don't conflate `tutorial` videos with the `video` category — those
  go under `tutorial`. The `video` category is for analysis /
  demos / news from established channels.

### 2026-04-28-C — Stale video padded into feed to clear cadence signal

**Trigger.** User on browsing the post-sweep feed: "video you added
is 6d old, dont think we can call it news right?"

**Root cause.**
- The cadence rule "≥1 video per calendar day" was added in
  2026-04-28-B without a paired freshness bar. The 48h freshness
  hint was buried in the channel-list paragraph and not enforced.
- The first real sweep after that change saw `hoursSinceLastVideo:
  205` in `sweep-context.ts`, treated cadence as a hard quota, and
  picked the most plausible candidate available — a Fireship video
  uploaded 6 days earlier. View count and channel matched, freshness
  did not.
- This is the same shape of failure as 2026-04-28-A (publishing old
  content as fresh news) but triggered by a different rule. Cadence
  rules without freshness bars become quotas the moment the agent
  sees a gap signal.

**Change.**
1. `prompts/update-releases.md` — replaced the "cadence floor" prose
   with a "cadence aspiration, NOT a quota" framing. Hard rule:
   video upload date ≤72h before sweep timestamp. Added explicit
   "ship zero videos and document the search" path when no fresh
   candidate exists.
2. `scripts/yt-meta.ts` — now scrapes the watch page for
   `uploadDate` / `datePublished`, computes `ageHours`, and emits
   `freshFor72hBar: boolean`. The agent uses this for programmatic
   gating, not vibes.
3. Bumped prompt to 5.5.0.
4. Removed `fireship-claude-another-superpower` from `releases.json`
   and adjusted the latest sweep entry in `sweeps.json` to reflect
   the corrected outcome (zero videos shipped, channel list
   documented).

**Status.** applied (2026-04-28). Watch-list: next sweep that
encounters a >24h `hoursSinceLastVideo` — does the agent now correctly
ship zero videos with a clean `videoSearch.reason` instead of padding?

**Notes.**
- The lesson generalises: any future "≥X items per day" rule needs a
  paired freshness or quality bar enforced via a script, otherwise it
  becomes a padding quota.
- Soft warning from `finalize-sweep.ts` for cadence is the right
  pressure level. Hard-failing the sweep on missing video would just
  reproduce this exact bug under different framing.
