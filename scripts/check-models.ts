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
  if (!Array.isArray(mk.families) || mk.families.length === 0) {
    err(mk.id, "maker.families must be a non-empty array");
    continue;
  }
  for (const fam of mk.families) {
    if (!fam.id || !fam.title) err(mk.id, `family missing id/title: ${JSON.stringify(fam.id)}`);
    if (!Array.isArray(fam.models) || fam.models.length === 0) {
      err(`${mk.id}/${fam.id}`, "family.models must be a non-empty array");
      continue;
    }
    for (const m of fam.models) {
      const scope = `${mk.id}/${fam.id}/${m.slug}`;
      tileCount++;
      if (!m.slug || !SLUG_RE.test(m.slug)) err(scope, `invalid slug ${JSON.stringify(m.slug)}`);
      if (tileSlugs.has(m.slug)) err(scope, `duplicate slug ${m.slug}`);
      tileSlugs.add(m.slug);
      if (!m.name) err(scope, "tile.name required");
      if (!m.blurb) err(scope, "tile.blurb required");
      if (!Array.isArray(m.tags) || m.tags.length === 0) err(scope, "tile.tags required");
      for (const t of m.tags ?? [])
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

  // required identity fields
  for (const k of ["slug", "name", "maker", "makerTitle", "family", "familyTitle",
    "tagline", "seoTitle", "metaDescription", "license"] as const) {
    if (!d[k] || typeof d[k] !== "string") err(scope, `missing required string field "${k}"`);
  }
  if (typeof d.openWeights !== "boolean") err(scope, "openWeights must be a boolean");
  if (!Array.isArray(d.modalities) || d.modalities.length === 0) err(scope, "modalities must be a non-empty array");
  if (!Array.isArray(d.overview) || d.overview.length === 0) err(scope, "overview must be a non-empty array");
  if (!Array.isArray(d.strengths) || d.strengths.length === 0) err(scope, "strengths must be a non-empty array");
  if (!Array.isArray(d.useCases) || d.useCases.length === 0) err(scope, "useCases must be a non-empty array");
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

writeFileSync(COUNT_FILE, JSON.stringify({ models: tileCount, makers: makerCount }, null, 2) + "\n");

console.log(`models ok — ${tileCount} models across ${makerCount} makers, ${detailSlugs.size} detail files, all sourced; count.json refreshed`);
