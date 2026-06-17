#!/usr/bin/env bun
/**
 * Precompute the AI Release Index (/stats) into src/data/stats.json.
 *
 * Runs BEFORE tsc in both `build` and `typecheck` (the StatsPage + prerender
 * import the generated JSON). Mirrors the learn/count.json pattern: the heavy
 * source data (releases.json + landscape.json + github-stars.json) is read
 * here at build time and distilled into a tiny JSON, so the main bundle never
 * imports the landscape taxonomy.
 *
 * Every figure is derived from the verified feed + landscape — zero
 * hallucination, recomputed on every build (so it tracks the 8h sweep).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { ReleaseItem } from "../src/data/schema";
import type { StatsData, StatLab, StatTool } from "../src/data/stats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "src", "data");

const feed = JSON.parse(readFileSync(join(DATA, "releases.json"), "utf8")) as {
  items: ReleaseItem[];
};
const landscape = JSON.parse(
  readFileSync(join(DATA, "learn", "landscape.json"), "utf8"),
) as {
  categories: {
    title: string;
    subcategories: { tools: { name: string; slug: string; repo: string }[] }[];
  }[];
};
const stars = JSON.parse(
  readFileSync(join(DATA, "learn", "github-stars.json"), "utf8"),
) as Record<string, number>;
const learnCount = JSON.parse(
  readFileSync(join(DATA, "learn", "count.json"), "utf8"),
) as { articles: number };

const items = feed.items;
const DAY = 86_400_000;
const now = Date.now();
const parse = (d: string) => Date.parse(d);

// --- totals -------------------------------------------------------------
const within = (days: number) =>
  items.filter((i) => {
    const t = parse(i.date);
    return Number.isFinite(t) && t >= now - days * DAY;
  }).length;

const labCounts = new Map<string, number>();
for (const i of items) labCounts.set(i.org, (labCounts.get(i.org) ?? 0) + 1);

const ossTools = landscape.categories.reduce(
  (n, c) => n + c.subcategories.reduce((m, s) => m + s.tools.length, 0),
  0,
);

// --- top labs -----------------------------------------------------------
const topLabs: StatLab[] = [...labCounts.entries()]
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  .slice(0, 12);

// --- by category --------------------------------------------------------
const catCounts = new Map<string, number>();
for (const i of items) {
  const c = i.categories[0] ?? "other";
  catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
}
const byCategory = [...catCounts.entries()]
  .map(([category, count]) => ({ category, count }))
  .sort((a, b) => b.count - a.count);

// --- by importance ------------------------------------------------------
const IMPORTANCE_ORDER = ["seismic", "major", "notable", "rumor"];
const impCounts = new Map<string, number>();
for (const i of items) impCounts.set(i.importance, (impCounts.get(i.importance) ?? 0) + 1);
const byImportance = IMPORTANCE_ORDER.filter((k) => impCounts.has(k)).map((importance) => ({
  importance,
  count: impCounts.get(importance) ?? 0,
}));

// --- releases per week (last 12 buckets, oldest → newest) ---------------
const WEEKS = 12;
const buckets = Array.from({ length: WEEKS }, (_, i) => ({
  start: now - (WEEKS - i) * 7 * DAY,
  count: 0,
}));
for (const i of items) {
  const t = parse(i.date);
  if (!Number.isFinite(t)) continue;
  for (const b of buckets) {
    if (t >= b.start && t < b.start + 7 * DAY) {
      b.count++;
      break;
    }
  }
}
const perWeek = buckets.map((b) => ({
  weekStart: new Date(b.start).toISOString().slice(0, 10),
  count: b.count,
}));

// --- top OSS tools by stars --------------------------------------------
const toolRows: StatTool[] = [];
for (const c of landscape.categories) {
  for (const s of c.subcategories) {
    for (const t of s.tools) {
      const n = stars[t.repo.toLowerCase()];
      if (typeof n === "number") {
        toolRows.push({ name: t.name, slug: t.slug, stars: n, category: c.title });
      }
    }
  }
}
const topTools = toolRows.sort((a, b) => b.stars - a.stars).slice(0, 15);

const data: StatsData = {
  generatedAt: new Date(now).toISOString().slice(0, 10),
  totals: {
    releases: items.length,
    thisWeek: within(7),
    thisMonth: within(30),
    ossTools,
    labs: labCounts.size,
    learnArticles: learnCount.articles,
  },
  topLabs,
  byCategory,
  byImportance,
  perWeek,
  topTools,
};

writeFileSync(join(DATA, "stats.json"), JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(
  `[build-stats] stats.json → ${data.totals.releases} releases, ${data.totals.labs} labs, ${topTools.length} top tools`,
);
