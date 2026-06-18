/**
 * Validate src/data/learn/landscape.json (the open-source AI tooling
 * landscape rendered at /learn/landscape). Mirrors check-learn's spirit:
 * fail the build on any structural problem so a bad edit can't ship.
 *
 * Checks: required fields + types, "owner/repo" repo format, globally
 * unique repos, non-empty descriptions, https/non-github homepages, and
 * that every repo has a star count in github-stars.json (warn only — a
 * brand-new repo may be added before the next star refresh runs).
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";

const LANDSCAPE = "src/data/learn/landscape.json";
const STARS = "src/data/learn/github-stars.json";
const PUBLIC_DIR = "public";
const ACCESS = new Set([
  "open-source", "open-core", "freemium", "commercial", "enterprise",
]);

const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);

const data = JSON.parse(readFileSync(LANDSCAPE, "utf8"));
const stars: Record<string, number> = existsSync(STARS)
  ? JSON.parse(readFileSync(STARS, "utf8"))
  : {};

if (!Array.isArray(data.categories) || data.categories.length === 0)
  err("categories must be a non-empty array");

const repoSeen = new Map<string, string>(); // lower → first display location
const slugSeen = new Map<string, string>();
const catIds = new Set<string>();
let toolCount = 0;
let detailMissing = 0;
let dirty = false;
const REPO_RE = /^[^/\s]+\/[^/\s]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOOLS_DIR = "src/data/learn/tools";

for (const c of data.categories ?? []) {
  const where = `category "${c.id}"`;
  if (!c.id || typeof c.id !== "string") err(`a category is missing a string id`);
  if (catIds.has(c.id)) err(`duplicate category id: ${c.id}`);
  catIds.add(c.id);
  if (!c.title) err(`${where} missing title`);
  if (!c.blurb) err(`${where} missing blurb`);
  if (!Array.isArray(c.subcategories) || c.subcategories.length === 0)
    err(`${where} has no subcategories`);

  const subIds = new Set<string>();
  for (const s of c.subcategories ?? []) {
    const sw = `${where} → sub "${s.id}"`;
    if (!s.id) err(`${where} has a subcategory with no id`);
    if (subIds.has(s.id)) err(`${where} duplicate subcategory id: ${s.id}`);
    subIds.add(s.id);
    if (!s.title) err(`${sw} missing title`);
    if (!Array.isArray(s.tools) || s.tools.length === 0)
      err(`${sw} has no tools`);

    for (const t of s.tools ?? []) {
      toolCount++;
      const tw = `${sw} → "${t.name}"`;
      if (!t.name || typeof t.name !== "string") err(`${sw} a tool is missing a name`);
      let hasDetail = false;
      if (typeof t.slug !== "string" || !SLUG_RE.test(t.slug))
        err(`${tw} slug invalid: ${t.slug}`);
      else {
        if (slugSeen.has(t.slug))
          err(`duplicate slug ${t.slug} (also in ${slugSeen.get(t.slug)})`);
        slugSeen.set(t.slug, tw);
        // Detail pages are OPTIONAL — broad directory entries can be tile-only
        // and link straight to their homepage. When a detail file IS present,
        // validate it fully.
        const file = `${TOOLS_DIR}/${t.slug}.json`;
        if (!existsSync(file)) {
          detailMissing++;
        } else {
          hasDetail = true;
          try {
            const d = JSON.parse(readFileSync(file, "utf8"));
            const need = [
              "slug", "name", "tagline", "seoTitle", "metaDescription",
              "overview", "features", "gettingStarted", "useCases",
            ];
            for (const k of need)
              if (d[k] == null) err(`${t.slug}.json missing ${k}`);
            if (d.slug !== t.slug) err(`${t.slug}.json slug mismatch (${d.slug})`);
            if (t.repo && d.repo && d.repo !== t.repo) err(`${t.slug}.json repo mismatch (${d.repo})`);
            if (!Array.isArray(d.overview) || d.overview.length < 2)
              err(`${t.slug}.json overview needs ≥2 paragraphs`);
            if (!d.gettingStarted?.steps?.length)
              err(`${t.slug}.json gettingStarted has no steps`);
            if ((d.seoTitle ?? "").length > 70)
              err(`${t.slug}.json seoTitle too long (${d.seoTitle.length})`);
          } catch {
            err(`${t.slug}.json is not valid JSON`);
          }
        }
      }
      // repo OPTIONAL — validate format + uniqueness only when present.
      if (t.repo !== undefined) {
        if (typeof t.repo !== "string" || !REPO_RE.test(t.repo))
          err(`${tw} repo not "owner/repo": ${t.repo}`);
        else {
          const key = t.repo.toLowerCase();
          if (repoSeen.has(key))
            err(`duplicate repo ${t.repo} (also in ${repoSeen.get(key)})`);
          repoSeen.set(key, tw);
          if (!(key in stars)) warnings.push(`${t.repo} has no star count yet`);
        }
      }
      // Every tool must be linkable: it needs a repo OR a homepage.
      if (!t.repo && !t.homepage) err(`${tw} has neither repo nor homepage`);
      if (t.access !== undefined && !ACCESS.has(t.access))
        err(`${tw} invalid access "${t.access}"`);
      if (t.logo !== undefined) {
        if (typeof t.logo !== "string") err(`${tw} logo must be a string`);
        else if (t.logo.startsWith("/")) {
          if (!existsSync(`${PUBLIC_DIR}${t.logo}`)) err(`${tw} logo file missing: ${t.logo}`);
        } else if (!/^https:\/\//.test(t.logo)) {
          err(`${tw} logo must be a site-rooted path or https url: ${t.logo}`);
        }
      }
      if (typeof t.description !== "string" || t.description.trim().length < 12)
        err(`${tw} description too short`);
      if (t.description && t.description.length > 240)
        err(`${tw} description too long (${t.description.length})`);
      if (t.homepage !== undefined) {
        if (typeof t.homepage !== "string" || !t.homepage.startsWith("https://"))
          err(`${tw} homepage not https: ${t.homepage}`);
        else if (/^https?:\/\/(www\.)?github\.com\//i.test(t.homepage))
          err(`${tw} homepage points at github (redundant): ${t.homepage}`);
      }
      // Derive the `detail` flag (tiles use it to link in vs out).
      if (hasDetail && t.detail !== true) { t.detail = true; dirty = true; }
      else if (!hasDetail && t.detail !== undefined) { delete t.detail; dirty = true; }
    }
  }
}

if (detailMissing)
  console.warn(`[check-landscape] ${detailMissing}/${toolCount} tools are tile-only (no detail page — link out to homepage)`);
// Persist the derived `detail` flags (only when something changed).
if (dirty && errors.length === 0)
  writeFileSync(LANDSCAPE, JSON.stringify(data, null, 2) + "\n");
const starless = warnings.filter((w) => w.includes("star count")).length;
if (starless)
  console.warn(`[check-landscape] ${starless} repos missing star counts (will fill on next refresh)`);

if (errors.length) {
  console.error(`[check-landscape] FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `landscape ok — ${data.categories.length} categories, ${repoSeen.size} unique tools`,
);
