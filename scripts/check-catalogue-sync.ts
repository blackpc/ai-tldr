#!/usr/bin/env bun
/**
 * check-catalogue-sync.ts — the mechanical gate behind prompt step 7
 * ("Catalogue sync"). Run by the sweep agent at the end of step 7 and by
 * the workflow right before the commit step.
 *
 * WHY THIS EXISTS: between 2026-08-30 and 2026-09-05 the 2h sweep shipped
 * 27 tool/repo items and touched the tools catalogue once. Every run's
 * summary said "catalogue sync: no-op, correctly". The prompt's tool rule
 * was "when in doubt SKIP — the daily job is the backstop"; the daily job
 * only searches GitHub for ≥15k★ repos, so a launch-week tool never reached
 * the catalogue from either side (SWEEP_MEMORY 2026-09-05-A). Prompt
 * wording did not hold; a validator does — same lesson as source-in-links.
 *
 * THE RULE, per `tool`/`repo` item this sweep added that links a GitHub repo:
 *   - the repo is a landscape tile WITH a detail page whose `changelog` has
 *     an entry with `releaseId` = the item id  (added, or updated), OR
 *   - the sweep report carries a declared `catalogue.skipped` entry for the
 *     item with reason `not-a-tool` (nothing to install/run) or
 *     `not-about-a-change` (catalogued tool, but the item isn't a release of
 *     it — rejected when the title carries a version number).
 * Anything else FAILS (exit 1) with an actionable line per item. Items
 * without a GitHub repo are reported for information only.
 *
 * Which sweep(s): the reports in sweeps.json that are NOT yet in HEAD (i.e.
 * what this run produced). `--sweep <id>` checks one specific report.
 * `--write` records the verified resolution into the report (audit trail).
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import type {
  ReleaseFeed,
  ReleaseItem,
  SweepLog,
  SweepReport,
  SweepCatalogueResolution,
} from "../src/data/schema.ts";
import type { Landscape, LandscapeToolDetail } from "../src/data/learn/schema.ts";
import { githubRepoOf, isToolItem } from "./tool-repo.ts";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);
const opt = (n: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};

const SWEEPS = "src/data/sweeps.json";
const RELEASES = "src/data/releases.json";
const LANDSCAPE = "src/data/learn/landscape.json";
const TOOLS_DIR = "src/data/learn/tools";
const VERSION_RE = /\bv?\d+\.\d+(?:\.\d+)?\b/;

const log = JSON.parse(readFileSync(SWEEPS, "utf8")) as SweepLog;
const feed = JSON.parse(readFileSync(RELEASES, "utf8")) as ReleaseFeed;
const landscape = JSON.parse(readFileSync(LANDSCAPE, "utf8")) as Landscape;

const items = new Map(feed.items.map((i) => [i.id, i]));

/** repo (lowercase) → slug, and name → slug, over the working-tree landscape. */
const tileByRepo = new Map<string, { slug: string; name: string }>();
const tiles: { slug: string; name: string; repo?: string }[] = [];
for (const c of landscape.categories)
  for (const s of c.subcategories)
    for (const t of s.tools) {
      tiles.push({ slug: t.slug, name: t.name, repo: t.repo });
      if (t.repo) tileByRepo.set(t.repo.toLowerCase(), { slug: t.slug, name: t.name });
    }

/** Repos that were already tiles in HEAD — distinguishes "added" from "updated". */
function headRepos(): Set<string> | null {
  try {
    const raw = execSync(`git show HEAD:${LANDSCAPE}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
    const head = JSON.parse(raw) as Landscape;
    const set = new Set<string>();
    for (const c of head.categories)
      for (const s of c.subcategories)
        for (const t of s.tools) if (t.repo) set.add(t.repo.toLowerCase());
    return set;
  } catch {
    return null;
  }
}

/** The reports this run produced: everything after HEAD's last report. */
function targetReports(): SweepReport[] {
  const one = opt("--sweep");
  if (one) {
    const r = log.sweeps.find((s) => s.id === one);
    if (!r) {
      console.error(`catalogue-sync: no sweep report with id ${one}`);
      process.exit(2);
    }
    return [r];
  }
  let headLastId: string | undefined;
  try {
    const raw = execSync(`git show HEAD:${SWEEPS}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
    headLastId = (JSON.parse(raw) as SweepLog).sweeps.at(-1)?.id;
  } catch {
    /* no git / no HEAD copy — fall through to "last report" */
  }
  if (headLastId) {
    const idx = log.sweeps.findIndex((s) => s.id === headLastId);
    if (idx >= 0) return log.sweeps.slice(idx + 1);
  }
  const last = log.sweeps.at(-1);
  return last ? [last] : [];
}

const reports = targetReports();
if (reports.length === 0) {
  console.log(
    "catalogue-sync: no new sweep report vs HEAD — nothing to gate (pass --sweep <id> to check a specific one)",
  );
  process.exit(0);
}

/** Tiles whose name shares a word with the repo's name — the "you already
 *  list this product under a homepage-only tile" hint. */
function likelyExistingTiles(repo: string): string[] {
  const words = repo
    .split("/")[1]
    .toLowerCase()
    .split(/[-_.]/)
    .filter((w) => w.length >= 4 && !["agent", "agents", "cli", "app", "core", "main"].includes(w));
  if (words.length === 0) return [];
  return tiles
    .filter((t) => !t.repo && words.some((w) => t.name.toLowerCase().includes(w)))
    .map((t) => `${t.slug} ("${t.name}")`)
    .slice(0, 3);
}

function readDetail(slug: string): LandscapeToolDetail | null {
  const p = `${TOOLS_DIR}/${slug}.json`;
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as LandscapeToolDetail;
  } catch {
    return null;
  }
}

const before = headRepos();
const failures: string[] = [];
const info: string[] = [];
const okLines: string[] = [];
let toolItems = 0;

for (const report of reports) {
  const declared = new Map((report.catalogue?.skipped ?? []).map((s) => [s.id, s]));
  const resolved: SweepCatalogueResolution[] = [];

  for (const added of report.added) {
    const item: ReleaseItem | undefined = items.get(added.id);
    if (!item) {
      failures.push(`${added.id}: in sweep report but not in releases.json`);
      continue;
    }
    if (!isToolItem(item)) continue;
    toolItems++;
    const repo = githubRepoOf(item);
    const skip = declared.get(item.id);

    if (!repo) {
      info.push(
        `${item.id}: tool item with no GitHub repo link — if it is a real product, it belongs in the landscape as a homepage tile (not enforced)`,
      );
      continue;
    }

    const tile = tileByRepo.get(repo.toLowerCase());
    if (!tile) {
      if (skip?.reason === "not-a-tool") {
        okLines.push(`${item.id}: skipped — not-a-tool: ${skip.why}`);
        resolved.push({ id: item.id, repo, action: "skipped" });
        continue;
      }
      const hint = likelyExistingTiles(repo);
      failures.push(
        `${item.id}: ${repo} is NOT in the tools catalogue → add a tile in landscape.json + write ${TOOLS_DIR}/<slug>.json (first changelog entry: releaseId "${item.id}"), or declare catalogue.skip "not-a-tool" in the draft` +
          (hint.length
            ? `\n      possible existing homepage-only tile for the same product — add \`repo\` there instead of a second tile: ${hint.join(", ")}`
            : "") +
          (skip ? `\n      (declared skip "${skip.reason}" does not apply to an uncatalogued repo)` : ""),
      );
      continue;
    }

    const detail = readDetail(tile.slug);
    if (!detail) {
      failures.push(
        `${item.id}: ${repo} is tile "${tile.slug}" but has NO detail page → write ${TOOLS_DIR}/${tile.slug}.json (a tool in the news deserves its page) with a changelog entry for releaseId "${item.id}"`,
      );
      continue;
    }

    const hasEntry = (detail.changelog ?? []).some((c) => c.releaseId === item.id);
    if (hasEntry) {
      const action = before && !before.has(repo.toLowerCase()) ? "added" : "updated";
      okLines.push(`${item.id}: ${action} — ${tile.slug}`);
      resolved.push({ id: item.id, repo, slug: tile.slug, action });
      continue;
    }
    if (skip?.reason === "not-about-a-change") {
      if (VERSION_RE.test(item.title)) {
        failures.push(
          `${item.id}: declared "not-about-a-change" but the title carries a version number ("${item.title}") — that IS a change; prepend a changelog entry to ${TOOLS_DIR}/${tile.slug}.json`,
        );
        continue;
      }
      okLines.push(`${item.id}: skipped — not-about-a-change: ${skip.why}`);
      resolved.push({ id: item.id, repo, slug: tile.slug, action: "skipped" });
      continue;
    }
    failures.push(
      `${item.id}: ${TOOLS_DIR}/${tile.slug}.json has no changelog entry with releaseId "${item.id}" → prepend { date, version?, note, releaseId, url } (newest first), or declare catalogue.skip "not-about-a-change" in the draft` +
        (skip ? `\n      (declared skip "${skip.reason}" does not apply — the tool IS catalogued)` : ""),
    );
  }

  // Declared skips for ids that aren't tool items of this sweep are a sign
  // the agent mis-targeted the escape hatch — surface them.
  for (const s of declared.values()) {
    const it = items.get(s.id);
    if (!it || !report.added.some((a) => a.id === s.id) || !isToolItem(it))
      failures.push(`${s.id}: catalogue.skip declared for an id that is not a tool/repo item of sweep ${report.id}`);
  }

  if (flag("--write") && failures.length === 0 && toolItems > 0) {
    report.catalogue = { ...(report.catalogue ?? {}), resolved };
  }
}

for (const l of okLines) console.log(`  ok    ${l}`);
for (const l of info) console.log(`  info  ${l}`);

if (failures.length > 0) {
  console.error(`\ncatalogue-sync FAILED — ${failures.length} tool item(s) not reflected in the tools catalogue:`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    `\nRule (prompts/update-releases.md step 7): every tool/repo item this sweep shipped is a landscape tile with a detail page whose changelog links the item, or carries an explicit catalogue.skip. "Reference implementation", "unmaintained", "unsure of category", "the daily job will get it" are not skip reasons.`,
  );
  process.exit(1);
}

if (flag("--write") && toolItems > 0) {
  writeFileSync(SWEEPS, JSON.stringify(log, null, 2) + "\n");
}
console.log(
  `catalogue-sync ok — ${reports.length} sweep(s), ${toolItems} tool item(s): ${okLines.length} resolved, ${info.length} without a repo`,
);
