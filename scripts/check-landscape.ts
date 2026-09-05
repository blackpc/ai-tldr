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
const RELEASES = "src/data/releases.json";
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
// Feed item ids — a changelog entry's `releaseId` must point at a REAL feed
// item (zero-hallucination: the agent can't invent our own coverage either).
const releaseIds = new Set<string>(
  existsSync(RELEASES)
    ? (JSON.parse(readFileSync(RELEASES, "utf8")).items as { id: string }[]).map(
        (i) => i.id,
      )
    : [],
);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// catalogue-skips.json — persistent "not a tool" rulings keyed by "owner/repo".
// Read by tool-gaps.ts (candidates) and check-catalogue-sync.ts (the sweep
// gate). Shape-checked here so a hand edit can't silently disable either.
const SKIPS = "src/data/learn/catalogue-skips.json";
if (existsSync(SKIPS)) {
  let skips: unknown;
  try {
    skips = JSON.parse(readFileSync(SKIPS, "utf8"));
  } catch {
    err(`${SKIPS} is not valid JSON`);
  }
  if (skips && typeof skips === "object" && !Array.isArray(skips)) {
    for (const [repo, s] of Object.entries(skips as Record<string, any>)) {
      const w = `${SKIPS} → "${repo}"`;
      if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) err(`${w}: key must be "owner/repo"`);
      if (s?.reason !== "not-a-tool") err(`${w}: reason must be "not-a-tool" (per-item reasons live on the sweep report)`);
      if (typeof s?.why !== "string" || s.why.trim().length < 12) err(`${w}: why must be one auditable sentence (≥12 chars)`);
      if (!DATE_RE.test(String(s?.date))) err(`${w}: date must be YYYY-MM-DD`);
    }
  } else if (skips !== undefined) {
    err(`${SKIPS} must be an object keyed by "owner/repo"`);
  }
}

/** Validate a tool detail's optional changelog (see ToolChangelogEntry in
 *  src/data/learn/schema.ts): newest-first, dated, grounded links only. */
function checkChangelog(slug: string, changelog: unknown): void {
  if (changelog === undefined) return;
  if (!Array.isArray(changelog)) {
    err(`${slug}.json changelog must be an array`);
    return;
  }
  let prev: string | null = null;
  changelog.forEach((c, i) => {
    const w = `${slug}.json changelog[${i}]`;
    if (typeof c !== "object" || c === null) return err(`${w} not an object`);
    const e = c as Record<string, unknown>;
    if (typeof e.date !== "string" || !DATE_RE.test(e.date))
      err(`${w} date must be YYYY-MM-DD (got ${JSON.stringify(e.date)})`);
    else {
      if (prev !== null && e.date > prev)
        err(`${w} out of order — changelog must be NEWEST first`);
      prev = e.date;
    }
    if (typeof e.note !== "string" || e.note.trim().length < 12)
      err(`${w} note too short (1–2 plain sentences required)`);
    if (e.note && typeof e.note === "string" && e.note.length > 400)
      err(`${w} note too long (${e.note.length} > 400)`);
    if (e.version !== undefined && typeof e.version !== "string")
      err(`${w} version must be a string`);
    if (e.url !== undefined && (typeof e.url !== "string" || !e.url.startsWith("https://")))
      err(`${w} url must be https`);
    if (e.releaseId !== undefined) {
      if (typeof e.releaseId !== "string") err(`${w} releaseId must be a string`);
      else if (releaseIds.size > 0 && !releaseIds.has(e.releaseId))
        err(`${w} releaseId "${e.releaseId}" not found in releases.json`);
    }
    if (e.releaseId === undefined && e.url === undefined)
      err(`${w} needs a releaseId or a url — an unlinked entry is unverifiable`);
  });
}

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
            checkChangelog(t.slug, d.changelog);
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
