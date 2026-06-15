/**
 * Refresh src/data/learn/github-stars.json — the live star counts shown on
 * the GitHub buttons of Learn tool articles.
 *
 * Runs in the 2h release-sweep GitHub Action (so the counts stay current and
 * get prerendered into every deploy) and can be run by hand:
 *     bun run refresh-stars
 *
 * Auth, in order of preference:
 *   1. GITHUB_TOKEN env (CI / Actions) — REST API, ~1000 req/h.
 *   2. the `gh` CLI if authenticated (local dev) — ~5000 req/h.
 *   3. unauthenticated REST API — only ~60 req/h, best-effort.
 *
 * NON-DESTRUCTIVE: existing counts are kept for any repo that fails to
 * fetch, and the file is only rewritten when something actually changed —
 * so a missing token never wipes the data.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ARTICLES = "src/data/learn/articles";
const OUT = "src/data/learn/github-stars.json";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

function walk(dir: string): string[] {
  let out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

const SKIP_OWNERS = new Set(["features", "marketplace", "sponsors", "about", "topics"]);

// collect real-case repos, deduped case-insensitively
const repos = new Map<string, string>();
for (const f of walk(ARTICLES)) {
  const a = JSON.parse(readFileSync(f, "utf8"));
  for (const u of a.links ?? []) {
    const m = (u as string).match(/^https:\/\/github\.com\/([^/]+)\/([^/?#]+)/i);
    if (!m || SKIP_OWNERS.has(m[1].toLowerCase())) continue;
    const key = `${m[1]}/${m[2]}`.toLowerCase();
    if (!repos.has(key)) repos.set(key, `${m[1]}/${m[2]}`);
  }
}

const existing: Record<string, number> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, "utf8"))
  : {};

let ghOk = false;
if (!TOKEN) {
  try { execSync("gh auth status", { stdio: "ignore" }); ghOk = true; } catch { ghOk = false; }
}

async function viaRest(repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        "User-Agent": "ai-tldr-stars",
        Accept: "application/vnd.github+json",
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    });
    if (!res.ok) return null;
    const j: any = await res.json();
    return typeof j.stargazers_count === "number" ? j.stargazers_count : null;
  } catch {
    return null;
  }
}
function viaGh(repo: string): number | null {
  try {
    const out = execSync(`gh api repos/${repo} --jq .stargazers_count`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const n = parseInt(out, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

const next: Record<string, number> = { ...existing };
let fetched = 0;
let failed = 0;
for (const [key, repo] of repos) {
  const n = ghOk ? viaGh(repo) : await viaRest(repo);
  if (n === null) { failed++; continue; } // keep existing value
  next[key] = n;
  fetched++;
}

// drop entries for repos no longer referenced anywhere
for (const key of Object.keys(next)) if (!repos.has(key)) delete next[key];

const before = JSON.stringify(existing);
const after = JSON.stringify(next, null, 2) + "\n";
if (JSON.stringify(next) !== before) {
  writeFileSync(OUT, after, "utf8");
  console.log(`[stars] refreshed ${fetched} repos (${failed} kept previous) — github-stars.json updated`);
} else {
  console.log(`[stars] ${fetched} repos checked, no change`);
}
if (!TOKEN && !ghOk) console.warn("[stars] no GITHUB_TOKEN and gh not authenticated — used unauth API (60/h); counts may be incomplete");
