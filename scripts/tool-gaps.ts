#!/usr/bin/env bun
/**
 * tool-gaps.ts — THE candidate list for the tools catalogue. One script, one
 * file, two sources, one exclusion list:
 *
 *   fromFeed    tool/repo items OUR OWN NEWS FEED shipped (default: last 180
 *               days) whose GitHub repo is not a landscape tile, or is
 *               tile-only (no detail page). Pre-vetted: the feed already
 *               judged them notable. No star floor — none.
 *   fromGitHub  top-starred AND recently-created repos across the AI topics
 *               the landscape covers (default floor 1,000★, pushed in the
 *               last 12 months, awesome-lists/courses excluded). The agent
 *               still judges notability for these.
 *   minus       catalogue-skips.json — repos a human or agent already ruled
 *               "not a tool" (with a reason), so they stop reappearing.
 *
 * Replaces discover-landscape-gaps.ts (GitHub-only, 15k★ floor — a
 * launch-week tool could never reach it) and the feedToolGaps block that
 * briefly lived in registry-freshness.ts. SWEEP_MEMORY 2026-09-05-B.
 *
 *   bun scripts/tool-gaps.ts                  # write .claude/tmp/tool-gaps.json + summary
 *   bun scripts/tool-gaps.ts --no-github      # feed + skips only (no token needed)
 *   bun scripts/tool-gaps.ts --check          # post-run gate for the daily job (see below)
 *   --feed-days 365  --min-stars 500          # overrides
 *
 * --check: exit 1 when feed-sourced gaps remain AND the working tree shows
 * the run added no tool page and recorded no skip — i.e. "a no-op day" with
 * real candidates pending. INFORMATIONAL: the workflow prints it in the run
 * summary and never fails or retries on it (editor's call, SWEEP_MEMORY
 * 2026-09-05-C) — the next run simply gets the same list. It never demands
 * a number; recording a skip with a reason is a valid outcome.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import type { ReleaseFeed } from "../src/data/schema.ts";
import type { Landscape } from "../src/data/learn/schema.ts";
import { githubRepoOf, isToolItem } from "./tool-repo.ts";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);
const opt = (n: string, d: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const FEED_DAYS = Number(opt("--feed-days", "180"));
const MIN_STARS = Number(opt("--min-stars", process.env.GAP_MIN_STARS ?? "1000"));
const OUT = ".claude/tmp/tool-gaps.json";
const SKIPS = "src/data/learn/catalogue-skips.json";
const TOOLS_DIR = "src/data/learn/tools";

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------
const landscape = JSON.parse(readFileSync("src/data/learn/landscape.json", "utf8")) as Landscape;
const tileByRepo = new Map<string, string>();
for (const c of landscape.categories)
  for (const s of c.subcategories)
    for (const t of s.tools) if (t.repo) tileByRepo.set(t.repo.toLowerCase(), t.slug);

interface Skip { reason: string; why: string; date: string; by?: string }
const skips: Record<string, Skip> = existsSync(SKIPS)
  ? (JSON.parse(readFileSync(SKIPS, "utf8")) as Record<string, Skip>)
  : {};
const skipped = new Set(Object.keys(skips).map((r) => r.toLowerCase()));

const hasDetail = (slug: string) => existsSync(`${TOOLS_DIR}/${slug}.json`);

// ---------------------------------------------------------------------------
// Source 1: our own feed
// ---------------------------------------------------------------------------
export interface FeedGap {
  id: string;
  title: string;
  date: string;
  repo: string;
  importance: string;
  /** Set when a tile exists but has no detail page ("write the page"). */
  tileOnly?: string;
}
function feedGaps(): FeedGap[] {
  const feed = JSON.parse(readFileSync("src/data/releases.json", "utf8")) as ReleaseFeed;
  const since = new Date(Date.now() - FEED_DAYS * 24 * 3600 * 1000).toISOString();
  const seen = new Set<string>();
  const out: FeedGap[] = [];
  for (const item of feed.items) {
    if (item.publishDate < since || !isToolItem(item)) continue;
    const repo = githubRepoOf(item);
    if (!repo) continue;
    const key = repo.toLowerCase();
    if (seen.has(key) || skipped.has(key)) continue;
    const slug = tileByRepo.get(key);
    if (slug && hasDetail(slug)) continue;
    seen.add(key);
    out.push({
      id: item.id,
      title: item.title,
      date: item.date,
      repo,
      importance: item.importance,
      ...(slug ? { tileOnly: slug } : {}),
    });
  }
  return out; // feed order = newest first
}

// ---------------------------------------------------------------------------
// Source 2: GitHub — the head of each AI topic, plus what was CREATED recently
// ---------------------------------------------------------------------------
const QUERIES = [
  "topic:llm", "topic:llmops", "topic:llm-inference", "topic:llm-serving",
  "topic:rag", "topic:retrieval-augmented-generation", "topic:vector-database",
  "topic:embeddings", "topic:ai-agents", "topic:ai-agent", "topic:agentic-ai",
  "topic:llm-agent", "topic:multi-agent", "topic:autonomous-agents",
  "topic:mcp", "topic:mcp-server", "topic:generative-ai", "topic:fine-tuning",
  "topic:prompt-engineering", "topic:ai-observability", "topic:llm-evaluation",
  "topic:text-to-image", "topic:text-to-speech", "topic:speech-recognition",
  "topic:computer-vision", "topic:web-scraping", "topic:coding-agent",
  "AI agent framework", "LLM framework", "RAG framework", "AI coding agent",
];
// Things we intentionally don't list: curated lists, courses, books, papers,
// raw model/dataset dumps, generic infra that isn't an AI tool.
const NON_TOOL =
  /(awesome|roadmap|tutorial|-?course|cookbook|handbook|guides?(?:$|[-_\s])|-guide|papers?-?list|reading-?list|interview|cheat-?sheet|curriculum|100-days|from-scratch|for-beginners|bootcamp|study-|notes$|leaks?$|best-practice|checklist|projects?$|examples?$|demo$|playground$|templates?$|^learn-|^hello-|system-prompts|prompts?-of|教程|面试|从零开始|指南)/i;

export interface GitHubGap {
  repo: string;
  stars: number;
  desc: string;
  topics: string[];
  createdAt: string;
  pushedAt: string;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function token(): string | null {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {
    return null;
  }
}
async function githubGaps(): Promise<GitHubGap[] | null> {
  const tok = token();
  if (!tok) {
    console.error("tool-gaps: no GitHub token (GITHUB_TOKEN or `gh auth login`) — skipping the GitHub source");
    return null;
  }
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const yearAgo = iso(new Date(Date.now() - 365 * 24 * 3600 * 1000));
  const found = new Map<string, GitHubGap>();
  async function search(q: string): Promise<void> {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=40`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" },
    });
    if (res.status === 403 || res.status === 429) {
      await sleep(20000); // secondary rate limit — back off once
      return search(q);
    }
    const j = (await res.json()) as { items?: any[]; message?: string };
    if (!j.items) {
      console.error(`  query "${q}" → ${j.message ?? "no items"}`);
      return;
    }
    for (const r of j.items) {
      const key = String(r.full_name).toLowerCase();
      if (!found.has(key))
        found.set(key, {
          repo: r.full_name,
          stars: r.stargazers_count,
          desc: r.description ?? "",
          topics: r.topics ?? [],
          createdAt: String(r.created_at).slice(0, 10),
          pushedAt: String(r.pushed_at).slice(0, 10),
        });
    }
  }
  for (const q of QUERIES) {
    // The all-time head of the topic, and separately what was CREATED in the
    // last year — a 6-month-old tool with 3k★ never enters the first list.
    await search(`${q} pushed:>${yearAgo}`);
    await sleep(1200);
    await search(`${q} created:>${yearAgo}`);
    await sleep(1200);
  }
  return [...found.values()]
    .filter((r) => !tileByRepo.has(r.repo.toLowerCase()) && !skipped.has(r.repo.toLowerCase()))
    .filter((r) => r.stars >= MIN_STARS)
    .filter((r) => !NON_TOOL.test(r.repo.split("/")[1]) && !NON_TOOL.test(r.desc))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// --check: the daily job's post-run gate
// ---------------------------------------------------------------------------
function check(): never {
  const remaining = feedGaps();
  const status = execSync(`git status --porcelain -- ${TOOLS_DIR} ${SKIPS} src/data/learn/landscape.json`, {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
  const newPages = status.filter((l) => /^(A |\?\?)/.test(l) && l.includes(`${TOOLS_DIR}/`)).length;
  const skipsTouched = status.some((l) => l.includes(SKIPS));
  const landscapeTouched = status.some((l) => l.includes("landscape.json"));
  console.log(
    `tool-gaps --check: ${remaining.length} feed-sourced gap(s) remain; this run: ${newPages} new tool page(s), skips ${skipsTouched ? "updated" : "untouched"}, landscape ${landscapeTouched ? "edited" : "untouched"}`,
  );
  if (remaining.length > 0 && newPages === 0 && !skipsTouched) {
    console.error(
      `\ntool-gaps --check FAILED: ${remaining.length} feed-covered tool(s) are still missing from the catalogue and this run neither added a tool page nor recorded a skip in ${SKIPS}.` +
        `\nA no-op day is only correct when fromFeed is empty. Next up:`,
    );
    for (const g of remaining.slice(0, 8))
      console.error(`  - ${g.repo}  (${g.importance}, ${g.date})  ${g.tileOnly ? `tile-only: ${g.tileOnly}` : "no tile"}  [${g.id}]`);
    process.exit(1);
  }
  process.exit(0);
}
if (flag("--check")) check();

// ---------------------------------------------------------------------------
// Default: write the candidate file + summary
// ---------------------------------------------------------------------------
const fromFeed = feedGaps();
const fromGitHub = flag("--no-github") ? null : await githubGaps();
mkdirSync(".claude/tmp", { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      feedDays: FEED_DAYS,
      minStars: MIN_STARS,
      skippedRepos: skipped.size,
      fromFeed,
      fromGitHub: fromGitHub ?? [],
      githubSearched: fromGitHub !== null,
    },
    null,
    2,
  ) + "\n",
);

const fmt = (n: number) =>
  n < 1000 ? String(n) : n < 1e6 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : (n / 1e6).toFixed(2) + "M";

console.log(`Tools catalogue: ${tileByRepo.size} repos listed, ${skipped.size} repo(s) on the skip list.`);
console.log(
  `\nFROM OUR FEED (last ${FEED_DAYS} days, no star floor — the feed already judged these notable): ${fromFeed.length}. Add every one that IS a tool, newest first.`,
);
for (const g of fromFeed)
  console.log(
    `  ${g.date}  ${g.importance.padEnd(7)}  ${g.repo.padEnd(40)}  ${g.tileOnly ? `tile-only (${g.tileOnly}) → write the page` : "no tile → tile + page"}  [${g.id}]`,
  );
if (fromGitHub) {
  console.log(`\nFROM GITHUB (≥ ${fmt(MIN_STARS)}★, pushed or created in the last year, non-list): ${fromGitHub.length}. Judge notability; add the real tools.`);
  for (const r of fromGitHub)
    console.log(`  ${fmt(r.stars).padStart(7)}★  created ${r.createdAt}  ${r.repo.padEnd(40)}  ${r.desc.slice(0, 80)}`);
} else {
  console.log(`\n(GitHub source not searched this run)`);
}
console.log(`\nwrote ${OUT}`);
