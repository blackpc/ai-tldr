/**
 * Validate src/data/learn/landscape.json (the AI tools directory rendered
 * at /tools). Mirrors check-learn's spirit:
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
// Homepages shared by GENUINELY DISTINCT products of one company (reviewed
// 2026-06-19). Anything NOT here that shares a homepage is warned as a likely
// duplicate. Same DISPLAY NAME is always an error (see below) — these pairs all
// have distinct names.
const HOMEPAGE_MULTI = new Set([
  "lambda.ai",          // GPU cloud vs hosted inference API
  "writer.com",         // Palmyra model API vs the Writer app
  "stability.ai",       // OSS model code vs the media API
  "resemble.ai",        // Chatterbox (OSS TTS) vs the platform
  "lakera.ai",          // Lakera Red vs Lakera Guard
  "invariantlabs.ai",   // Invariant guardrails vs gateway
]);
const normHome = (u: string) =>
  u.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");

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
const nameSeen = new Map<string, string>(); // lower name → first location (dup guard)
const homeSeen = new Map<string, string[]>(); // normalized homepage → slugs
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
      // Duplicate-product guard: the commercial expansion added some products
      // TWICE under different slugs (modal/modal-labs, scale-ai/…). A shared
      // DISPLAY NAME is a reliable "same product" signal → hard error. Two
      // genuinely-different tools that share a name (e.g. two "Infinity"s) must
      // be disambiguated in their `name`, not allowlisted here.
      if (typeof t.name === "string") {
        const nk = t.name.toLowerCase().trim();
        if (nameSeen.has(nk))
          err(`duplicate product name "${t.name}" (also in ${nameSeen.get(nk)}) — same name = same product; dedupe, or disambiguate the names if truly distinct`);
        else nameSeen.set(nk, tw);
      }
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
            // The detail file caches its category/subcategory (+ titles) for the
            // breadcrumb, related list and compare table. They MUST track the
            // tool's real home in landscape.json — a move that doesn't update
            // both leaves the page pointing at the wrong subcategory.
            if (d.category !== c.id) err(`${t.slug}.json category "${d.category}" ≠ landscape "${c.id}" (re-sync detail)`);
            if (d.subcategory !== s.id) err(`${t.slug}.json subcategory "${d.subcategory}" ≠ landscape "${s.id}" (re-sync detail)`);
            if (d.categoryTitle !== c.title) err(`${t.slug}.json categoryTitle stale ("${d.categoryTitle}" ≠ "${c.title}")`);
            if (d.subcategoryTitle !== s.title) err(`${t.slug}.json subcategoryTitle stale ("${d.subcategoryTitle}" ≠ "${s.title}")`);
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
        else if (typeof t.slug === "string") {
          const hk = normHome(t.homepage);
          (homeSeen.get(hk) ?? homeSeen.set(hk, []).get(hk)!).push(t.slug);
        }
      }
      // Derive the `detail` flag (tiles use it to link in vs out).
      if (hasDetail && t.detail !== true) { t.detail = true; dirty = true; }
      else if (!hasDetail && t.detail !== undefined) { delete t.detail; dirty = true; }
    }
  }
}

if (detailMissing)
  console.warn(`[check-landscape] ${detailMissing}/${toolCount} tools are tile-only (no detail page — link out to homepage)`);

// Soft duplicate check: distinct slugs sharing a homepage are often (not always)
// the same product listed twice. Reviewed-OK multi-product domains are skipped;
// anything else is surfaced for a human to confirm it isn't a dupe.
const sharedHomes = [...homeSeen].filter(
  ([h, slugs]) => slugs.length > 1 && !HOMEPAGE_MULTI.has(h),
);
if (sharedHomes.length) {
  console.warn(`[check-landscape] ${sharedHomes.length} homepage(s) shared by multiple tools — verify these aren't duplicates:`);
  for (const [h, slugs] of sharedHomes)
    console.warn(`  - ${h}: ${slugs.join(", ")}`);
}

// Persist the derived `detail` flags (only when something changed). Keep the
// 1-space indent the data file uses so this never reformats the whole file.
if (dirty && errors.length === 0)
  writeFileSync(LANDSCAPE, JSON.stringify(data, null, 1) + "\n");
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
