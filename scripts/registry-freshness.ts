#!/usr/bin/env bun
/**
 * Seeds the DAILY registry/tools maintenance sweep (prompts/maintain-registry.md).
 *
 * It does NOT decide anything — it just shows the agent the current state so it
 * knows where to look:
 *   - per maker, the line's current flagship + its date (→ "is there a newer GA
 *     release than this?")
 *   - the most-popular open-source tools we DON'T list yet (from
 *     discover-landscape-gaps.ts → .claude/tmp/landscape-gaps.json)
 *
 * This is read-only CONTEXT, framed as "where to look", explicitly NOT a quota:
 * recording our current flagship can never pressure an add. If a maker has
 * shipped nothing newer, the agent adds nothing — a no-op day is correct. (Same
 * scar discipline as sweep-context.ts for the feed; see SWEEP_MEMORY.)
 *
 * Writes .claude/tmp/registry-context.json (the agent reads it) and prints a
 * human summary (→ the GitHub Actions run summary).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { ModelRegistry } from "../src/data/models/schema";
import type { ReleaseFeed } from "../src/data/schema";
import type { Landscape } from "../src/data/learn/schema";
import { githubRepoOf, isToolItem } from "./tool-repo";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(
  readFileSync(join(ROOT, "src/data/models/registry.json"), "utf8"),
) as ModelRegistry;

const dkey = (d?: string) => (!d ? "" : d.length === 7 ? `${d}-01` : d);

interface LineState {
  line: string;
  lineTitle: string;
  current: string;
  currentDate: string;
  versions: number;
}
interface MakerState {
  maker: string;
  makerTitle: string;
  homepage?: string;
  lines: LineState[];
}

const makers: MakerState[] = registry.makers.map((mk) => ({
  maker: mk.id,
  makerTitle: mk.title,
  homepage: mk.homepage,
  lines: mk.lines.map((l) => {
    const cur =
      l.versions.find((v) => v.current) ??
      [...l.versions].sort((a, b) => dkey(b.date).localeCompare(dkey(a.date)))[0];
    return {
      line: l.id,
      lineTitle: l.title,
      current: cur?.name ?? "(none)",
      currentDate: cur?.date ?? "(undated)",
      versions: l.versions.length,
    };
  }),
}));

// Optional: the open-source tools we're missing (run discover-landscape-gaps
// --json first; this file is best-effort and may be absent on a local run).
let toolGaps: { repo: string; stars: number; desc: string }[] = [];
const GAPS = join(ROOT, ".claude/tmp/landscape-gaps.json");
if (existsSync(GAPS)) {
  try {
    toolGaps = (JSON.parse(readFileSync(GAPS, "utf8")) as typeof toolGaps).slice(0, 30);
  } catch {
    /* ignore a malformed/absent gaps file */
  }
}

// Feed-sourced tool gaps: tool/repo items OUR OWN NEWS FEED carried in the
// last 30 days whose GitHub repo is not a landscape tile, or is tile-only
// (no detail page). The star-threshold finder above cannot see these — a
// launch-week repo has ~2k★, not 15k — and until 2026-09-05 nothing else
// did either (SWEEP_MEMORY 2026-09-05-A). The 2h sweep is now gated on its
// own tool items; this list is the backstop that drains what slipped
// through before the gate existed. Newest first, capped.
interface FeedToolGap {
  id: string;
  title: string;
  date: string;
  repo: string;
  importance: string;
  /** Set when a tile exists but has no detail page ("write the page"). */
  tileOnly?: string;
}
let feedToolGaps: FeedToolGap[] = [];
{
  const feed = JSON.parse(readFileSync(join(ROOT, "src/data/releases.json"), "utf8")) as ReleaseFeed;
  const landscape = JSON.parse(readFileSync(join(ROOT, "src/data/learn/landscape.json"), "utf8")) as Landscape;
  const tileByRepo = new Map<string, string>();
  for (const c of landscape.categories)
    for (const s of c.subcategories)
      for (const t of s.tools) if (t.repo) tileByRepo.set(t.repo.toLowerCase(), t.slug);
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const seen = new Set<string>();
  for (const item of feed.items) {
    if (item.publishDate < since || !isToolItem(item)) continue;
    const repo = githubRepoOf(item);
    if (!repo || seen.has(repo.toLowerCase())) continue;
    const slug = tileByRepo.get(repo.toLowerCase());
    if (slug && existsSync(join(ROOT, `src/data/learn/tools/${slug}.json`))) continue;
    seen.add(repo.toLowerCase());
    feedToolGaps.push({
      id: item.id,
      title: item.title,
      date: item.date,
      repo,
      importance: item.importance,
      ...(slug ? { tileOnly: slug } : {}),
    });
  }
  feedToolGaps = feedToolGaps.slice(0, 40);
}

const totalModels = registry.makers.reduce(
  (n, mk) => n + mk.lines.reduce((m, l) => m + l.versions.length, 0),
  0,
);

const out = { generatedFor: "daily-registry-maintenance", totalModels, makers, feedToolGaps, toolGaps };
const OUT_DIR = join(ROOT, ".claude/tmp");
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "registry-context.json"), JSON.stringify(out, null, 2) + "\n");

// ---- human summary (GitHub run summary) -----------------------------------
const fmt = (n: number) =>
  n < 1000 ? String(n) : n < 1e6 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : (n / 1e6).toFixed(2) + "M";

console.log(`Registry: ${totalModels} models across ${makers.length} makers.\n`);
console.log("Current flagship per line (look for anything NEWER + GA than this):");
for (const mk of makers) {
  console.log(`\n  ${mk.makerTitle}${mk.homepage ? ` — ${mk.homepage}` : ""}`);
  for (const l of mk.lines)
    console.log(`    ${l.lineTitle.padEnd(28)} current: ${l.current} (${l.currentDate}, ${l.versions} version${l.versions === 1 ? "" : "s"})`);
}
if (feedToolGaps.length) {
  console.log(`\nTools OUR FEED covered in the last 30 days that the catalogue lacks (add these FIRST — the feed already judged them notable):`);
  for (const g of feedToolGaps)
    console.log(
      `  ${g.date}  ${g.importance.padEnd(7)}  ${g.repo.padEnd(38)}  ${g.tileOnly ? `tile-only (${g.tileOnly}) → write the detail page` : "no tile → add tile + detail"}  [${g.id}]`,
    );
}
if (toolGaps.length) {
  console.log(`\nTop open-source tools we do NOT list yet (≥ threshold★):`);
  for (const t of toolGaps)
    console.log(`  ${fmt(t.stars).padStart(7)}★  ${t.repo}  —  ${(t.desc ?? "").slice(0, 80)}`);
} else {
  console.log(`\n(no tool-gap file — run discover-landscape-gaps.ts --json first for tool candidates)`);
}
console.log(`\nNOT a quota: if a maker shipped nothing newer and no tool gap is worth adding, change nothing.`);
