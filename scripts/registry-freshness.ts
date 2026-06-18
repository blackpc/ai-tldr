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

const totalModels = registry.makers.reduce(
  (n, mk) => n + mk.lines.reduce((m, l) => m + l.versions.length, 0),
  0,
);

const out = { generatedFor: "daily-registry-maintenance", totalModels, makers, toolGaps };
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
if (toolGaps.length) {
  console.log(`\nTop open-source tools we do NOT list yet (≥ threshold★):`);
  for (const t of toolGaps)
    console.log(`  ${fmt(t.stars).padStart(7)}★  ${t.repo}  —  ${(t.desc ?? "").slice(0, 80)}`);
} else {
  console.log(`\n(no tool-gap file — run discover-landscape-gaps.ts --json first for tool candidates)`);
}
console.log(`\nNOT a quota: if a maker shipped nothing newer and no tool gap is worth adding, change nothing.`);
