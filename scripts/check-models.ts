#!/usr/bin/env bun
/**
 * Validate the LLM registry (/models) and regenerate its nav-badge count.json.
 *
 * Enforced invariants:
 *   - registry.json is a well-formed maker ▸ family ▸ model tree
 *   - every model slug is globally unique and URL-safe
 *   - registry ⇆ detail files are in 1:1 sync (no orphan tile, no orphan file)
 *   - each detail file has the required identity fields + valid tags
 *   - ZERO-HALLUCINATION: every benchmark.source and pricing.source is also a
 *     link in links[] (so every number traces to a cited URL)
 *   - benchmark scores are finite and within their scale (bars can't overflow)
 *   - versionHistory (when present) flags exactly one `current` entry
 *
 * Wired into `bun run build` + `bun run typecheck` (after check-landscape), so a
 * malformed registry fails the build instead of shipping broken pages. Also
 * regenerates src/data/models/count.json (the nav badge) — keeps the registry
 * out of the main bundle, like check-learn does for the Learn count.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import registryData from "../src/data/models/registry.json" with { type: "json" };
import type { ModelRegistry, ModelDetail, ModelTag, ModelLinkKind } from "../src/data/models/schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODELS_DIR = join(ROOT, "src", "data", "models", "models");
const COUNT_FILE = join(ROOT, "src", "data", "models", "count.json");
const REGISTRY_FILE = join(ROOT, "src", "data", "models", "registry.json");

const registry = registryData as ModelRegistry;

const errors: string[] = [];
const err = (scope: string, msg: string) => errors.push(`  [${scope}] ${msg}`);

const VALID_TAGS = new Set<ModelTag>([
  "frontier", "open-weights", "proprietary", "reasoning", "multimodal",
  "coding", "long-context", "on-device", "free-tier", "agentic",
]);
const VALID_LINK_KINDS = new Set<ModelLinkKind>([
  "official", "model-card", "api-docs", "paper", "announcement",
  "benchmark", "review", "tutorial", "playground",
]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---- 1. walk the registry tree --------------------------------------------

const tileSlugs = new Set<string>();
let tileCount = 0;
let makerCount = 0;

if (!Array.isArray(registry.makers) || registry.makers.length === 0) {
  err("registry", "makers must be a non-empty array");
}
for (const mk of registry.makers ?? []) {
  makerCount++;
  if (!mk.id || !mk.title) err("registry", `maker missing id/title: ${JSON.stringify(mk.id)}`);
  if (typeof mk.blurb !== "string") err(mk.id, "maker.blurb must be a string");
  if (!Array.isArray(mk.lines) || mk.lines.length === 0) {
    err(mk.id, "maker.lines must be a non-empty array");
    continue;
  }
  for (const line of mk.lines) {
    if (!line.id || !line.title) err(mk.id, `line missing id/title: ${JSON.stringify(line.id)}`);
    if (!Array.isArray(line.versions) || line.versions.length === 0) {
      err(`${mk.id}/${line.id}`, "line.versions must be a non-empty array");
      continue;
    }
    for (const v of line.versions) {
      const scope = `${mk.id}/${line.id}/${v.slug}`;
      tileCount++;
      if (!v.slug || !SLUG_RE.test(v.slug)) err(scope, `invalid slug ${JSON.stringify(v.slug)}`);
      if (tileSlugs.has(v.slug)) err(scope, `duplicate slug ${v.slug}`);
      tileSlugs.add(v.slug);
      if (!v.name) err(scope, "version.name required");
      if (!v.blurb) err(scope, "version.blurb required");
      if (!Array.isArray(v.tags) || v.tags.length === 0) err(scope, "version.tags required");
      for (const t of v.tags ?? [])
        if (!VALID_TAGS.has(t)) err(scope, `unknown tag "${t}"`);
    }
  }
}

// ---- 2. load detail files --------------------------------------------------

let detailFiles: string[] = [];
try {
  detailFiles = readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json"));
} catch {
  err("models/", "directory missing — no detail files");
}

const detailSlugs = new Set<string>();
const detailBySlug = new Map<string, ModelDetail>();
for (const file of detailFiles) {
  let d: ModelDetail;
  try {
    d = JSON.parse(readFileSync(join(MODELS_DIR, file), "utf8")) as ModelDetail;
  } catch (e) {
    err(file, `unparseable JSON: ${(e as Error).message}`);
    continue;
  }
  const scope = d.slug || file;
  const expected = `${d.slug}.json`;
  if (file !== expected) err(scope, `filename ${file} must match slug (${expected})`);
  detailSlugs.add(d.slug);
  detailBySlug.set(d.slug, d);

  // required identity fields
  for (const k of ["slug", "name", "maker", "makerTitle", "line", "lineTitle",
    "tagline", "seoTitle", "metaDescription", "license"] as const) {
    if (!d[k] || typeof d[k] !== "string") err(scope, `missing required string field "${k}"`);
  }
  if (typeof d.openWeights !== "boolean") err(scope, "openWeights must be a boolean");
  if (!Array.isArray(d.modalities) || d.modalities.length === 0) err(scope, "modalities must be a non-empty array");
  if (!Array.isArray(d.overview) || d.overview.length === 0) err(scope, "overview must be a non-empty array");
  // strengths/useCases are OPTIONAL (concise lineage pages may omit them) but
  // must be arrays when present.
  if (!Array.isArray(d.strengths)) err(scope, "strengths must be an array");
  if (!Array.isArray(d.useCases)) err(scope, "useCases must be an array");
  if (!Array.isArray(d.tags) || d.tags.length === 0) err(scope, "tags must be a non-empty array");
  for (const t of d.tags ?? []) if (!VALID_TAGS.has(t)) err(scope, `unknown tag "${t}"`);

  // links
  if (!Array.isArray(d.links) || d.links.length === 0) {
    err(scope, "links must be a non-empty array");
  }
  const linkUrls = new Set((d.links ?? []).map((l) => l.url?.trim()));
  for (const l of d.links ?? []) {
    if (!l.label || !l.url) err(scope, "each link needs label + url");
    if (!VALID_LINK_KINDS.has(l.kind)) err(scope, `unknown link kind "${l.kind}"`);
    if (l.url && !/^https?:\/\//.test(l.url)) err(scope, `link url not absolute: ${l.url}`);
  }

  // benchmarks — source must be cited, score within scale
  for (const [bi, b] of (d.benchmarks ?? []).entries()) {
    const at = `benchmarks[${bi}]`;
    if (!b.name) err(scope, `${at}.name required`);
    if (!b.source || !linkUrls.has(b.source.trim()))
      err(scope, `${at}.source "${b.source}" must be present in links[] (zero-hallucination)`);
    const max = b.max ?? 100;
    if (typeof b.score !== "number" || !Number.isFinite(b.score)) err(scope, `${at}.score must be finite (got ${b.score})`);
    else if (b.score < 0 || b.score > max) err(scope, `${at}.score ${b.score} outside 0..${max}`);
  }

  // pricing — source must be cited
  if (d.pricing) {
    if (!d.pricing.source || !linkUrls.has(d.pricing.source.trim()))
      err(scope, `pricing.source "${d.pricing.source}" must be present in links[] (zero-hallucination)`);
    if (!d.pricing.input && !d.pricing.output)
      err(scope, "pricing present but has neither input nor output");
  }

  // apis
  for (const [ai, a] of (d.apis ?? []).entries()) {
    if (!a.provider || !a.url) err(scope, `apis[${ai}] needs provider + url`);
  }

  // version history — exactly one current
  if (d.versionHistory) {
    if (!Array.isArray(d.versionHistory) || d.versionHistory.length === 0) {
      err(scope, "versionHistory must be a non-empty array when present");
    } else {
      const current = d.versionHistory.filter((v) => v.current).length;
      if (current !== 1) err(scope, `versionHistory must flag exactly one current entry (got ${current})`);
      for (const [vi, v] of d.versionHistory.entries())
        if (!v.version) err(scope, `versionHistory[${vi}].version required`);
    }
  }

  // SEO length guidance (warn-as-error to keep snippets clean)
  if (d.seoTitle && d.seoTitle.length > 60) err(scope, `seoTitle ${d.seoTitle.length} chars > 60`);
  if (d.metaDescription && d.metaDescription.length > 165) err(scope, `metaDescription ${d.metaDescription.length} chars > 165`);
}

// ---- 3. registry ⇆ detail 1:1 sync ----------------------------------------

for (const slug of tileSlugs)
  if (!detailSlugs.has(slug)) err("sync", `registry tile "${slug}" has no detail file models/${slug}.json`);
for (const slug of detailSlugs)
  if (!tileSlugs.has(slug)) err("sync", `detail file "${slug}.json" is not referenced in registry.json`);

// ---- report + regenerate count.json ---------------------------------------

if (errors.length > 0) {
  console.error("models: registry validation FAILED:");
  console.error(errors.join("\n"));
  process.exit(1);
}

// Derive two flags onto the registry tree (the detail files / version dates are
// the source of truth), then persist count.json:
//   - `current`: the line's newest version. DERIVED so it can't go stale —
//     adding a newer-dated version auto-demotes the old "current" (this is what
//     keeps the daily registry-maintenance sweep honest). Advance-only: current
//     only ever moves to a STRICTLY-newer-dated sibling, never backward, so a
//     correct hand-set flag is never regressed by a missing/odd date.
//   - `rich`: the version has a fully-researched page (benchmarks/pricing).
// `date` is "YYYY-MM-DD" or "YYYY-MM"; pad the latter so string compare is
// chronological. Missing date sorts oldest.
const dkey = (d?: string) => (!d ? "" : d.length === 7 ? `${d}-01` : d);
const TODAY = new Date().toISOString().slice(0, 10);
// A version may only BECOME current if it's actually RELEASED — the registry is
// full of preview / announced / research-preview / superseded / retired entries
// (and gemini-3-1-pro is even a curated "current" despite Preview status), so a
// naive newest-date rule would promote an unshipped model. Gate on the detail's
// status + a non-future date. The existing current stays the baseline even if
// it's itself a preview; we only ADVANCE to a released, strictly-newer sibling.
const NOT_RELEASED =
  /preview|announce|supersed|deprecat|retire|upcoming|unreleased|not released|coming (?:next|soon|month)/i;
const isReleased = (slug: string, date?: string) => {
  const st = detailBySlug.get(slug)?.status ?? "";
  if (NOT_RELEASED.test(st)) return false;
  return dkey(date) <= dkey(TODAY);
};

// Time-relative words rot on an evergreen catalog page (a "current"/"latest"
// model is only current until the next ships). check derives `current`
// mechanically above and the maintenance sweep is told to phrase blurbs by
// DATE, not recency — so SOFT-warn stale wording here (cosmetic, not a
// fabrication: never fail the build on it, same discipline as the feed sweep).
const TIME_RELATIVE =
  /\b(current(?:ly)?|latest|newest|most[- ]recent|now the|brand[- ]new|just (?:released|launched|shipped|out))\b/i;
const rotWarnings: string[] = [];

let lineCount = 0;
let dirty = false;
for (const mk of registry.makers) {
  lineCount += mk.lines.length;
  for (const line of mk.lines) {
    // start from the existing current (or the first/newest-authored entry),
    // then advance only to a RELEASED, strictly-newer-dated sibling.
    let head = line.versions.find((v) => v.current) ?? line.versions[0];
    for (const v of line.versions)
      if (isReleased(v.slug, v.date) && dkey(v.date) > dkey(head.date)) head = v;
    for (const v of line.versions) {
      const wantCurrent = v === head;
      if (wantCurrent && !v.current) { v.current = true; dirty = true; }
      else if (!wantCurrent && v.current) { delete v.current; dirty = true; }

      const d = detailBySlug.get(v.slug);
      const rich = !!(d?.benchmarks?.length || d?.pricing);
      if (rich && !v.rich) { v.rich = true; dirty = true; }
      else if (!rich && v.rich) { delete v.rich; dirty = true; }

      if (TIME_RELATIVE.test(v.blurb))
        rotWarnings.push(`  [${v.slug}] blurb uses time-relative wording (rots on evergreen page): "${v.blurb}"`);
    }
  }
}
if (dirty) writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2) + "\n");
writeFileSync(COUNT_FILE, JSON.stringify({ models: tileCount, makers: makerCount, lines: lineCount }, null, 2) + "\n");

if (rotWarnings.length > 0) {
  console.warn(`models WARN — ${rotWarnings.length} blurb(s) use time-relative wording (use dated phrasing instead):`);
  console.warn(rotWarnings.join("\n"));
}
console.log(`models ok — ${tileCount} versions across ${lineCount} lines, ${makerCount} makers, ${detailSlugs.size} detail files; count.json refreshed`);
