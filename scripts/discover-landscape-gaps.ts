/**
 * Landscape gap discovery — the missing half of the pipeline.
 *
 * ROOT CAUSE this fixes: the landscape was discovered from what the research
 * LLMs already knew, then verified against GitHub. It was never diffed against
 * GitHub's ACTUAL top-starred AI repos, so popular tools the models didn't
 * recall (OpenHands, Langflow, Flowise, gpt4all, …) were silently missing — and
 * refresh-learn-stars.ts only updates stars of tools already listed; it never
 * discovers new ones. So the set was frozen and incomplete.
 *
 * This script queries GitHub's most-starred repos across the AI topics our
 * categories cover, removes obvious non-tools (awesome-lists, courses, books),
 * subtracts everything we already list, and prints the popular tools we're
 * missing. Run it on a schedule (or in the sweep) so a trending tool can never
 * again sit at the top of GitHub while absent from our "complete" landscape.
 *
 *   bun scripts/discover-landscape-gaps.ts            # default ≥8000★
 *   GAP_MIN_STARS=20000 bun scripts/discover-landscape-gaps.ts
 *   bun scripts/discover-landscape-gaps.ts --json     # machine-readable
 *
 * Needs a GitHub token (gh auth token, or GITHUB_TOKEN env).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const MIN_STARS = Number(process.env.GAP_MIN_STARS ?? 8000);
const JSON_OUT = process.argv.includes("--json");

function token(): string {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { encoding: "utf8" }).trim();
  } catch {
    console.error("No GitHub token (set GITHUB_TOKEN or run `gh auth login`).");
    process.exit(1);
  }
}
const TOKEN = token();

// Topics / keyword searches spanning the 9 landscape categories. Sorted by
// stars so a single page (top 40) reliably captures the head of each space.
const QUERIES = [
  "topic:llm", "topic:llmops", "topic:llm-inference", "topic:llm-serving",
  "topic:rag", "topic:retrieval-augmented-generation", "topic:vector-database",
  "topic:embeddings", "topic:ai-agents", "topic:ai-agent", "topic:agentic-ai",
  "topic:llm-agent", "topic:multi-agent", "topic:autonomous-agents",
  "topic:agent", "topic:generative-ai", "topic:fine-tuning", "topic:llmops",
  "topic:prompt-engineering", "topic:ai-observability", "topic:llm-evaluation",
  "topic:text-to-image", "topic:text-to-speech", "topic:web-scraping",
  "AI agent framework", "LLM framework", "RAG framework", "AI coding agent",
];

// Things we intentionally don't list: curated lists, courses, books, papers,
// raw model/dataset dumps, generic infra that isn't an AI tool.
const NON_TOOL =
  /(awesome|roadmap|tutorial|-?course|cookbook|handbook|^guides?$|guide-|papers?-?list|reading-?list|interview|cheat-?sheet|curriculum|100-days|from-scratch|for-beginners|bootcamp|study-|notes$|leaks?$|best-practice|checklist|projects?$|examples?$|demo$|playground$|templates?$)/i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function search(q: string) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=40`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
  });
  if (res.status === 403) {
    await sleep(20000); // secondary rate limit — back off once
    return search(q);
  }
  return (await res.json()) as { items?: any[]; message?: string };
}

const data = JSON.parse(readFileSync("src/data/learn/landscape.json", "utf8"));
const ours = new Set<string>();
for (const c of data.categories)
  for (const s of c.subcategories) for (const t of s.tools) if (t.repo) ours.add(t.repo.toLowerCase());

const found = new Map<string, { repo: string; stars: number; desc: string; topics: string[] }>();
for (const q of QUERIES) {
  const j = await search(q);
  if (!j.items) {
    console.error(`  query "${q}" → ${j.message ?? "no items"}`);
    continue;
  }
  for (const r of j.items) {
    const key = r.full_name.toLowerCase();
    if (!found.has(key))
      found.set(key, { repo: r.full_name, stars: r.stargazers_count, desc: r.description ?? "", topics: r.topics ?? [] });
  }
  await sleep(1500);
}

const missing = [...found.values()]
  .filter((r) => !ours.has(r.repo.toLowerCase()))
  .filter((r) => r.stars >= MIN_STARS)
  .filter((r) => !NON_TOOL.test(r.repo.split("/")[1]) && !NON_TOOL.test(r.desc))
  .sort((a, b) => b.stars - a.stars);

const fmt = (n: number) =>
  n < 1000 ? String(n) : n < 1e6 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : (n / 1e6).toFixed(2) + "M";

if (JSON_OUT) {
  writeFileSync(".claude/tmp/landscape-gaps.json", JSON.stringify(missing, null, 2) + "\n");
  console.log(`wrote .claude/tmp/landscape-gaps.json — ${missing.length} missing tools ≥ ${MIN_STARS}★`);
} else {
  console.log(
    `\nLandscape: ${ours.size} repos. Scanned ${found.size} top GitHub AI repos.\n` +
      `MISSING popular tools (≥ ${fmt(MIN_STARS)}★, non-list): ${missing.length}\n`,
  );
  for (const r of missing) console.log(`  ${fmt(r.stars).padStart(7)} ★  ${r.repo}  —  ${r.desc.slice(0, 90)}`);
}
