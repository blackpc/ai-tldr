#!/usr/bin/env bun
/**
 * Seeds the DAILY registry/tools maintenance sweep (prompts/maintain-registry.md).
 *
 * It does NOT decide anything — it just shows the agent the current state so it
 * knows where to look:
 *   - per maker, the line's current flagship + its date (→ "is there a newer GA
 *     release than this?")
 *   (Tool candidates live in .claude/tmp/tool-gaps.json, written by
 *   scripts/tool-gaps.ts — one list for both catalogue jobs.)
 *
 * This is read-only CONTEXT, framed as "where to look", explicitly NOT a quota:
 * recording our current flagship can never pressure an add. If a maker has
 * shipped nothing newer, the agent adds nothing — a no-op day is correct. (Same
 * scar discipline as sweep-context.ts for the feed; see SWEEP_MEMORY.)
 *
 * Writes .claude/tmp/registry-context.json (the agent reads it) and prints a
 * human summary (→ the GitHub Actions run summary).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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

const totalModels = registry.makers.reduce(
  (n, mk) => n + mk.lines.reduce((m, l) => m + l.versions.length, 0),
  0,
);

const out = { generatedFor: "daily-registry-maintenance", totalModels, makers, toolCandidates: ".claude/tmp/tool-gaps.json" };
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
console.log(`\nTool candidates: see .claude/tmp/tool-gaps.json (bun scripts/tool-gaps.ts).`);
console.log(`\nModels are NOT a quota: if a maker shipped nothing newer, add no model.`);
