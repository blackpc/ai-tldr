#!/usr/bin/env bun
/**
 * Validator for the Learn section — the consistency gate every article
 * must pass before the build is allowed to ship. Checks:
 *
 *   1. taxonomy.json shape, slug format, global slug uniqueness
 *   2. taxonomy ↔ article-file bijection (no missing, no orphans)
 *   3. ref-field equality between taxonomy and article file
 *   4. the canonical section flow (in-plain-english first,
 *      going-deeper last, required sections present)
 *   5. per-block rules (code langs, table shapes, diagram DSL, https)
 *   6. inline-md hygiene (no raw HTML / block markdown / dead internal links)
 *   7. SEO constraints (seoTitle ≤ 65, metaDescription 90–165, keywords 2–8)
 *   8. word-count floor so no article ships thin
 *
 * Also regenerates src/data/learn/count.json (the tiny nav-badge count
 * imported by the main bundle) when it drifts.
 *
 * Run: bun scripts/check-learn.ts   (wired into typecheck + build)
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  LearnArticle,
  LearnArticleRef,
  LearnBlock,
  LearnTaxonomy,
} from "../src/data/learn/schema";
import {
  LEARN_CODE_LANGS,
  LEARN_REQUIRED_SECTIONS,
} from "../src/data/learn/schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LEARN_DIR = join(ROOT, "src", "data", "learn");
const ARTICLES_DIR = join(LEARN_DIR, "articles");

const errors: string[] = [];
const warnings: string[] = [];

function err(ctx: string, msg: string) {
  errors.push(`[${ctx}] ${msg}`);
}
function warn(ctx: string, msg: string) {
  warnings.push(`[${ctx}] ${msg}`);
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// -----------------------------------------------------------------------
// 1. Taxonomy
// -----------------------------------------------------------------------

const taxonomy = JSON.parse(
  readFileSync(join(LEARN_DIR, "taxonomy.json"), "utf8"),
) as LearnTaxonomy;

interface Loc {
  cat: string;
  sub: string;
  ref: LearnArticleRef;
}
const bySlug = new Map<string, Loc>();
const validPaths = new Set<string>(["/learn"]);

const catSlugs = new Set<string>();
for (const cat of taxonomy.categories) {
  const cctx = `taxonomy:${cat.slug}`;
  if (!SLUG.test(cat.slug)) err(cctx, "category slug not kebab-case");
  if (catSlugs.has(cat.slug)) err(cctx, "duplicate category slug");
  catSlugs.add(cat.slug);
  if (!cat.title?.trim()) err(cctx, "missing title");
  if (!cat.tagline?.trim()) err(cctx, "missing tagline");
  validPaths.add(`/learn/${cat.slug}`);

  const subSlugs = new Set<string>();
  for (const sub of cat.subcategories) {
    const sctx = `taxonomy:${cat.slug}/${sub.slug}`;
    if (!SLUG.test(sub.slug)) err(sctx, "subcategory slug not kebab-case");
    if (subSlugs.has(sub.slug)) err(sctx, "duplicate subcategory slug");
    subSlugs.add(sub.slug);
    if (!sub.title?.trim()) err(sctx, "missing title");
    if (!sub.tagline?.trim()) err(sctx, "missing tagline");
    validPaths.add(`/learn/${cat.slug}/${sub.slug}`);

    if (sub.articles.length === 0) err(sctx, "subcategory has no articles");
    // shortTitle is the bare-topic listing label — must be clean (no
    // interrogative framing the H1 keeps) and distinguishable within its
    // track, since cards sit under the cat + sub heading already.
    const shortSeen = new Map<string, string>();
    for (const ref of sub.articles) {
      const actx = `taxonomy:${ref.slug}`;
      if (!SLUG.test(ref.slug)) err(actx, "article slug not kebab-case");
      if (bySlug.has(ref.slug))
        err(actx, `article slug duplicated (also in ${bySlug.get(ref.slug)!.cat}/${bySlug.get(ref.slug)!.sub})`);
      bySlug.set(ref.slug, { cat: cat.slug, sub: sub.slug, ref });
      validPaths.add(`/learn/${cat.slug}/${sub.slug}/${ref.slug}`);

      const st = ref.shortTitle;
      if (!st?.trim()) err(actx, "missing shortTitle");
      else {
        if (st.length > 42) err(actx, `shortTitle ${st.length} chars (max 42)`);
        if (/^(what|how|why|when|where|which|who)\b/i.test(st))
          err(actx, `shortTitle starts with an interrogative ("${st}")`);
        if (/\?$/.test(st)) err(actx, `shortTitle ends with "?" ("${st}")`);
        if (/&(?:[a-z]+|#\d+);/.test(st))
          err(actx, `HTML entity in shortTitle (write the literal character): "${st}"`);
        if (st.toLowerCase() === sub.title.toLowerCase())
          err(actx, "shortTitle equals its subcategory title");
        if (st.toLowerCase() === cat.title.toLowerCase())
          err(actx, "shortTitle equals its category title");
        const lc = st.toLowerCase();
        if (shortSeen.has(lc))
          err(actx, `shortTitle "${st}" duplicated within subcategory (also ${shortSeen.get(lc)})`);
        shortSeen.set(lc, ref.slug);
      }
    }
  }
}

// -----------------------------------------------------------------------
// 2. File walk — bijection with taxonomy
// -----------------------------------------------------------------------

function walk(dir: string): string[] {
  let out: string[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out = out.concat(walk(full));
    else if (e.endsWith(".json")) out.push(full);
  }
  return out;
}

const files = walk(ARTICLES_DIR);
const fileBySlug = new Map<string, string>();
for (const file of files) {
  const slug = file.split(/[\\/]/).pop()!.replace(/\.json$/, "");
  if (fileBySlug.has(slug)) err(slug, "duplicate article file");
  fileBySlug.set(slug, file);
}

for (const [slug, loc] of bySlug) {
  const file = fileBySlug.get(slug);
  if (!file) {
    err(slug, "in taxonomy but no article file");
    continue;
  }
  const expected = join(ARTICLES_DIR, loc.cat, loc.sub, `${slug}.json`);
  if (relative(expected, file) !== "")
    err(slug, `file at wrong path: ${relative(ROOT, file)} (expected ${relative(ROOT, expected)})`);
}
for (const [slug, file] of fileBySlug) {
  if (!bySlug.has(slug)) err(slug, `orphan article file: ${relative(ROOT, file)}`);
}

// -----------------------------------------------------------------------
// 3.–8. Per-article validation
// -----------------------------------------------------------------------

// Inline-md hygiene: catch raw HTML and block-level markdown that the
// inline renderer would print literally. Angle brackets INSIDE inline
// code spans (`<thinking>`, `<system>`…) are legitimate — the renderer
// escapes them safely — so strip code spans before the raw-HTML test.
function checkMd(ctx: string, md: string) {
  const outsideCode = md.replace(/`[^`]*`/g, "");
  if (/<[a-zA-Z/!]/.test(outsideCode))
    err(ctx, `raw HTML in md (wrap tags like \`<tag>\` in backticks): "${md.slice(0, 60)}…"`);
  if (/&(?:[a-z]+|#\d+);/.test(outsideCode))
    err(ctx, `HTML entity in md (write the literal character): "${md.slice(0, 60)}…"`);
  if (/(^|\n)\s*#{1,6}\s/.test(md)) err(ctx, "block markdown heading in md");
  if (md.includes("```")) err(ctx, "code fence in md (use a code block)");
  for (const m of md.matchAll(/\]\(([^)\s]+)\)/g)) {
    const url = m[1];
    if (url.startsWith("/")) {
      const clean = url.replace(/[#?].*$/, "").replace(/\/$/, "");
      if (!validPaths.has(clean)) err(ctx, `dead internal link: ${url}`);
    } else if (!url.startsWith("https://")) {
      err(ctx, `non-https link: ${url}`);
    }
  }
}

function wordsOf(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function checkBlock(ctx: string, b: LearnBlock, counters: { words: number; visuals: number; code: number }) {
  switch (b.type) {
    case "p":
    case "callout":
      checkMd(ctx, b.md);
      counters.words += wordsOf(b.md);
      if (b.type === "callout" && !["tip", "warn", "note"].includes(b.tone))
        err(ctx, `bad callout tone: ${b.tone}`);
      break;
    case "h3":
      counters.words += wordsOf(b.text);
      break;
    case "list":
      if (!b.items?.length) err(ctx, "empty list");
      for (const item of b.items ?? []) {
        checkMd(ctx, item);
        counters.words += wordsOf(item);
      }
      break;
    case "table": {
      if (!b.headers?.length || !b.rows?.length) err(ctx, "empty table");
      for (const row of b.rows ?? []) {
        if (row.length !== b.headers.length)
          err(ctx, `table row width ${row.length} ≠ headers ${b.headers.length}`);
        for (const cell of row) {
          checkMd(ctx, cell);
          counters.words += wordsOf(cell);
        }
      }
      break;
    }
    case "code":
      if (!(LEARN_CODE_LANGS as readonly string[]).includes(b.lang))
        err(ctx, `unknown code lang: ${b.lang}`);
      if (!b.code?.trim()) err(ctx, "empty code block");
      counters.code++;
      break;
    case "diagram": {
      const d = b.diagram;
      counters.visuals++;
      // Every node must be an object with a non-empty string `label` — a
      // bare-string node renders `node.sub` as String.prototype.sub (a
      // function), which React rejects as a child.
      const checkNode = (n: unknown, where: string) => {
        if (typeof n !== "object" || n === null)
          err(ctx, `${where} must be an object with a label (got ${typeof n})`);
        else if (typeof (n as { label?: unknown }).label !== "string" || !(n as { label: string }).label.trim())
          err(ctx, `${where} missing string label`);
      };
      if (d.kind === "flow" || d.kind === "cycle") {
        if (!d.steps || d.steps.length < 2) err(ctx, `${d.kind} needs ≥2 steps`);
        else d.steps.forEach((s, i) => checkNode(s, `${d.kind} step ${i}`));
      } else if (d.kind === "compare") {
        if (!d.columns || d.columns.length < 2) err(ctx, "compare needs ≥2 columns");
        else
          d.columns.forEach((c, i) => {
            if (typeof c?.title !== "string" || !c.title.trim())
              err(ctx, `compare column ${i} missing title`);
            if (!Array.isArray(c?.items) || c.items.length === 0)
              err(ctx, `compare column ${i} has no items`);
          });
      } else if (d.kind === "stack") {
        if (!d.layers || d.layers.length < 2) err(ctx, "stack needs ≥2 layers");
        else d.layers.forEach((l, i) => checkNode(l, `stack layer ${i}`));
      } else if (d.kind === "split") {
        if (!d.root || !d.children || d.children.length < 2)
          err(ctx, "split needs root + ≥2 children");
        else {
          checkNode(d.root, "split root");
          d.children.forEach((c, i) => checkNode(c, `split child ${i}`));
        }
      } else {
        err(ctx, `unknown diagram kind: ${(d as { kind: string }).kind}`);
      }
      break;
    }
    case "image":
      counters.visuals++;
      // Either an external https asset or a self-hosted, site-rooted file
      // under /learn-media/ (served from our own domain).
      if (!b.url?.startsWith("https://") && !b.url?.startsWith("/"))
        err(ctx, `image url must be https:// or site-rooted (/…): ${b.url}`);
      if (!b.alt?.trim()) err(ctx, "image missing alt text");
      break;
    default:
      err(ctx, `unknown block type: ${(b as { type: string }).type}`);
  }
}

const REF_FIELDS = [
  "title",
  "shortTitle",
  "seoTitle",
  "metaDescription",
  "difficulty",
  "oneLiner",
] as const;

const imageBySlug = new Map<string, string>();
// slug -> official `links` (used by the cross-article dup guard below)
const linksBySlug = new Map<string, string[]>();

for (const [slug, loc] of bySlug) {
  const file = fileBySlug.get(slug);
  if (!file) continue;
  let article: LearnArticle;
  try {
    article = JSON.parse(readFileSync(file, "utf8")) as LearnArticle;
  } catch (e) {
    err(slug, `invalid JSON: ${(e as Error).message}`);
    continue;
  }

  // first image block = the article's listing thumbnail (article-images.json)
  const heroImg = (article.sections ?? [])
    .flatMap((s) => s.blocks ?? [])
    .find((b) => b.type === "image") as { url?: string } | undefined;
  if (heroImg?.url) imageBySlug.set(slug, heroImg.url);

  // 3. ref equality with taxonomy (listing pages must agree with the page)
  if (article.slug !== slug) err(slug, `slug field mismatch: ${article.slug}`);
  for (const f of REF_FIELDS) {
    if (article[f] !== loc.ref[f])
      err(slug, `${f} differs from taxonomy ("${String(article[f]).slice(0, 50)}" vs "${String(loc.ref[f]).slice(0, 50)}")`);
  }
  if (JSON.stringify(article.keywords) !== JSON.stringify(loc.ref.keywords))
    err(slug, "keywords differ from taxonomy");

  // 7. SEO constraints
  if (!article.seoTitle || article.seoTitle.length > 65)
    err(slug, `seoTitle ${article.seoTitle?.length ?? 0} chars (max 65)`);
  if (
    !article.metaDescription ||
    article.metaDescription.length < 90 ||
    article.metaDescription.length > 165
  )
    err(slug, `metaDescription ${article.metaDescription?.length ?? 0} chars (need 90–165)`);
  if (!article.keywords || article.keywords.length < 2 || article.keywords.length > 8)
    err(slug, `keywords count ${article.keywords?.length ?? 0} (need 2–8)`);
  if (!DATE.test(article.updated ?? "")) err(slug, `bad updated date: ${article.updated}`);

  // 4. canonical section flow
  const ids = article.sections?.map((s) => s.id) ?? [];
  if (new Set(ids).size !== ids.length) err(slug, "duplicate section ids");
  for (const required of LEARN_REQUIRED_SECTIONS) {
    if (!ids.includes(required)) err(slug, `missing required section "${required}"`);
  }
  if (ids[0] !== "in-plain-english")
    err(slug, `first section must be in-plain-english (got "${ids[0]}")`);
  if (ids.length && ids[ids.length - 1] !== "going-deeper")
    err(slug, `last section must be going-deeper (got "${ids[ids.length - 1]}")`);
  for (const id of ids) {
    if (!SLUG.test(id)) err(slug, `section id not kebab-case: ${id}`);
  }
  if (ids.includes("faq")) err(slug, 'section id "faq" is reserved');

  // 5. blocks
  const counters = { words: 0, visuals: 0, code: 0 };
  for (const section of article.sections ?? []) {
    if (!section.title?.trim()) err(slug, `section ${section.id} missing title`);
    if (!section.blocks?.length) err(slug, `section ${section.id} has no blocks`);
    for (const block of section.blocks ?? [])
      checkBlock(`${slug}:${section.id}`, block, counters);
  }
  if (counters.visuals < 1) err(slug, "article has no diagram or image");

  // FAQ / related / furtherReading
  if (!article.faq || article.faq.length < 3 || article.faq.length > 7)
    err(slug, `faq count ${article.faq?.length ?? 0} (need 3–7)`);
  for (const f of article.faq ?? []) {
    if (!f.q?.trim() || !f.a?.trim()) err(slug, "empty faq entry");
    else {
      checkMd(`${slug}:faq`, f.a);
      counters.words += wordsOf(f.q) + wordsOf(f.a);
    }
  }
  if (!article.related || article.related.length < 2 || article.related.length > 6)
    err(slug, `related count ${article.related?.length ?? 0} (need 2–6)`);
  for (const r of article.related ?? []) {
    if (r === slug) err(slug, "article relates to itself");
    else if (!bySlug.has(r)) err(slug, `related slug not in taxonomy: ${r}`);
  }
  for (const f of article.furtherReading ?? []) {
    if (!f.url?.startsWith("https://"))
      err(slug, `furtherReading url not https: ${f.url}`);
    if (!f.title?.trim()) err(slug, "furtherReading entry missing title");
  }

  // official tool links (optional) — prominent buttons at the top of the page
  if (article.links !== undefined) {
    if (!Array.isArray(article.links) || article.links.length < 1 || article.links.length > 6)
      err(slug, `links must be 1–6 entries (got ${article.links?.length})`);
    for (const u of article.links ?? []) {
      if (typeof u !== "string" || !u.startsWith("https://"))
        err(slug, `links entry not https: ${u}`);
    }
    if (article.links && new Set(article.links).size !== article.links.length)
      err(slug, "duplicate links entry");
    if (Array.isArray(article.links) && article.links.length)
      linksBySlug.set(slug, article.links as string[]);
  }

  // 8. word count
  if (counters.words < 700) err(slug, `too thin: ~${counters.words} words (need ≥700)`);
  if (counters.words > 3800)
    warn(slug, `very long: ~${counters.words} words — consider splitting`);
}

// -----------------------------------------------------------------------
// 9. Cross-article duplication guards (anti-cannibalization)
//
// check-learn used to enforce slug uniqueness globally but shortTitle
// uniqueness only WITHIN a subcategory, so the same tool/concept could be —
// and was — written twice across different subcategories. These guards make
// the build FAIL when two pages would compete for the same listing label or
// SERP snippet. Multiple articles per tool are fine BY DESIGN (an intro plus
// feature deep-dives) — but each must occupy a DISTINCT slot: a unique H1,
// listing label, <title>, meta description, and promise.
// -----------------------------------------------------------------------

// (a) global metadata uniqueness — title / shortTitle / seoTitle /
//     metaDescription / oneLiner must each be unique across ALL articles.
//     (Two pages with the same one are either duplicates or self-competing
//     search results — neither is acceptable.)
{
  const fields: [string, (r: LearnArticleRef) => string][] = [
    ["title", (r) => r.title],
    ["shortTitle", (r) => r.shortTitle],
    ["seoTitle", (r) => r.seoTitle],
    ["metaDescription", (r) => r.metaDescription],
    ["oneLiner", (r) => r.oneLiner],
  ];
  for (const [name, get] of fields) {
    const seen = new Map<string, string>();
    for (const [slug, loc] of bySlug) {
      const key = get(loc.ref).toLowerCase().trim();
      if (!key) continue;
      const prev = seen.get(key);
      if (prev)
        err(
          "dup",
          `${name} duplicated across articles — differentiate or merge: "${get(loc.ref).slice(0, 60)}" in "${slug}" and "${prev}"`,
        );
      else seen.set(key, slug);
    }
  }
}

// (b) same-tool intro guard (WARNING) — two "What is X" intros that share an
//     official product link AND overlap heavily on keywords are almost
//     certainly the same tool introduced twice (the failure mode that slips
//     past (a) when the two happen to pick different shortTitles). A warning,
//     not an error: different products from one vendor legitimately share a
//     homepage, and a tool can appear as a link in another tool's article.
{
  const normUrl = (u: string) =>
    u
      .toLowerCase()
      .replace(/^https?:\/\/(www\.)?/, "")
      .replace(/\/+$/, "")
      .replace(/[#?].*$/, "");
  const isIntro = (title: string) =>
    /^(what (?:is|are|was|were)|what's|introduction to|intro to)\b/i.test(
      title.trim(),
    );
  const kwOf = (slug: string) =>
    new Set((bySlug.get(slug)!.ref.keywords ?? []).map((k) => k.toLowerCase().trim()));
  const byLink = new Map<string, string[]>();
  for (const [slug, links] of linksBySlug) {
    const loc = bySlug.get(slug);
    if (!loc || !isIntro(loc.ref.title)) continue; // intros only
    for (const u of links) {
      const n = normUrl(u);
      if (!n) continue;
      (byLink.get(n) ?? byLink.set(n, []).get(n)!).push(slug);
    }
  }
  const warned = new Set<string>();
  for (const [u, slugs] of byLink) {
    const uniq = [...new Set(slugs)];
    if (uniq.length < 2) continue;
    for (let i = 0; i < uniq.length; i++)
      for (let j = i + 1; j < uniq.length; j++) {
        const a = kwOf(uniq[i]);
        const b = kwOf(uniq[j]);
        let inter = 0;
        for (const x of a) if (b.has(x)) inter++;
        const jac = inter / (a.size + b.size - inter || 1);
        const key = [uniq[i], uniq[j]].sort().join("|");
        if (jac >= 0.4 && !warned.has(key)) {
          warned.add(key);
          warn(
            "dup",
            `possible same-tool duplicate intros (share ${u}, keyword overlap ${jac.toFixed(2)}): "${uniq[i]}" and "${uniq[j]}"`,
          );
        }
      }
  }
}

// -----------------------------------------------------------------------
// count.json — keep the nav badge in sync without bundling the taxonomy
// -----------------------------------------------------------------------

const total = bySlug.size;
const countPath = join(LEARN_DIR, "count.json");
const currentCount = JSON.parse(readFileSync(countPath, "utf8")) as {
  articles: number;
};
if (currentCount.articles !== total) {
  writeFileSync(countPath, JSON.stringify({ articles: total }, null, 2) + "\n", "utf8");
  console.log(`[check-learn] count.json updated → ${total}`);
}

// article-images.json — slug → listing thumbnail (each article's first image
// block), consumed by the subcategory syllabus pages. Regenerated on drift,
// same contract as count.json.
const imagesPath = join(LEARN_DIR, "article-images.json");
const nextImages =
  JSON.stringify(Object.fromEntries(imageBySlug), null, 2) + "\n";
let currentImages = "";
try {
  currentImages = readFileSync(imagesPath, "utf8");
} catch {
  /* first run — file doesn't exist yet */
}
if (currentImages !== nextImages) {
  writeFileSync(imagesPath, nextImages, "utf8");
  console.log(
    `[check-learn] article-images.json updated → ${imageBySlug.size} entries`,
  );
}

// -----------------------------------------------------------------------
// Report
// -----------------------------------------------------------------------

for (const w of warnings) console.warn(`learn WARN  ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`learn ERROR ${e}`);
  console.error(`\nlearn check FAILED — ${errors.length} error(s) across ${total} articles`);
  process.exit(1);
}
console.log(
  `learn ok — ${taxonomy.categories.length} categories, ${total} articles, all consistent`,
);
