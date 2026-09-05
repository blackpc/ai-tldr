/**
 * Shared helper: which GitHub repository is a feed item ABOUT?
 *
 * Used by the catalogue-sync gate (check-catalogue-sync.ts) and the daily
 * registry context (registry-freshness.ts) so both agree on the join key
 * between a `tool`/`repo` feed item and a landscape tile (`repo` field,
 * "owner/repo").
 */
import type { ReleaseItem } from "../src/data/schema.ts";

/** Path roots under github.com that are NOT "<owner>/<repo>". */
const NOT_OWNERS = new Set([
  "features", "en", "orgs", "topics", "marketplace", "apps", "sponsors",
  "about", "site", "login", "settings", "pricing", "blog", "docs", "explore",
  "trending", "collections", "events", "github", "search", "security",
  "customer-stories", "enterprise", "team", "contact", "resources",
  "solutions", "readme", "new", "notifications", "issues", "pulls",
  "copilot", "changelog", "mobile", "premium-support", "codespaces",
]);

const REPO_RE = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:[/?#]|$)/;

/** "owner/repo" from a github.com URL, or null for non-repo GitHub paths. */
export function repoFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  const m = REPO_RE.exec(url);
  if (!m) return null;
  const owner = m[1];
  let repo = m[2];
  if (NOT_OWNERS.has(owner.toLowerCase())) return null;
  repo = repo.replace(/\.git$/, "");
  if (!repo || repo === "-") return null;
  return `${owner}/${repo}`;
}

/**
 * The repo an item is about: its own `url` first, then links labelled like a
 * repository, then any remaining github link. Null when the item links no
 * repo at all (a SaaS product, a blog-only announcement).
 */
export function githubRepoOf(item: Pick<ReleaseItem, "url" | "links">): string | null {
  const own = repoFromUrl(item.url);
  if (own) return own;
  const links = item.links ?? [];
  const labelled = links.filter((l) => /repo|github|source|code/i.test(l.label ?? ""));
  for (const l of [...labelled, ...links]) {
    const r = repoFromUrl(l.url);
    if (r) return r;
  }
  return null;
}

/**
 * Does this item belong to the tools catalogue's remit at all? `tool`/`repo`
 * items, EXCEPT model releases: a weights/inference repo tagged `model` +
 * `repo` (Qwen, GLM, Granite…) is the LLM registry's business, not a tool.
 */
export function isToolItem(item: Pick<ReleaseItem, "categories">): boolean {
  const cats = item.categories ?? [];
  if (cats.includes("model")) return false;
  return cats.some((c) => c === "tool" || c === "repo");
}
