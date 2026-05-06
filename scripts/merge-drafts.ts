#!/usr/bin/env bun
/**
 * Merge multiple sweep draft files into one combined sweep-draft.json.
 *
 * Usage: bun scripts/merge-drafts.ts draft1.json draft2.json ... --out sweep-draft.json
 *
 * Deduplicates by id, keeping the first occurrence.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : "sweep-draft.json";
const draftPaths = args.filter((a, i) => {
  if (a.startsWith("--")) return false;
  if (outIdx >= 0 && i === outIdx + 1) return false;
  return true;
});

if (draftPaths.length === 0) {
  console.error("No draft files provided");
  process.exit(1);
}

interface DraftItem {
  id: string;
  [key: string]: unknown;
}
interface Draft {
  newItems?: DraftItem[];
  updates?: unknown[];
  removals?: unknown[];
  summary?: string;
  coverage?: string[];
  notes?: Record<string, string>;
}

const seenIds = new Set<string>();
const allItems: DraftItem[] = [];
const allUpdates: unknown[] = [];
const allRemovals: unknown[] = [];
const allCoverage = new Set<string>();
const allNotes: Record<string, string> = {};
const summaries: string[] = [];

for (const p of draftPaths) {
  if (!existsSync(p)) {
    console.warn(`Skipping missing draft: ${p}`);
    continue;
  }
  const draft = JSON.parse(readFileSync(p, "utf8")) as Draft;
  for (const item of draft.newItems ?? []) {
    if (seenIds.has(item.id)) {
      console.warn(`Dedup: skipping duplicate id ${item.id} from ${p}`);
      continue;
    }
    seenIds.add(item.id);
    allItems.push(item);
  }
  for (const u of draft.updates ?? []) allUpdates.push(u);
  for (const r of draft.removals ?? []) allRemovals.push(r);
  for (const c of draft.coverage ?? []) allCoverage.add(c);
  Object.assign(allNotes, draft.notes ?? {});
  if (draft.summary) summaries.push(draft.summary);
}

const merged: Draft = {
  newItems: allItems,
  updates: allUpdates,
  removals: allRemovals,
  coverage: [...allCoverage],
  notes: allNotes,
  summary: `Backfill sweep: ${allItems.length} items added across ${allCoverage.size} categories. ${summaries.join(" | ")}`,
};

writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n");
console.log(
  `Merged ${draftPaths.length} drafts → ${outPath}: ${allItems.length} new items, ${allUpdates.length} updates, ${allRemovals.length} removals`,
);
