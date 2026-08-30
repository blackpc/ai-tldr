/**
 * Generate src/data/entity-index.json — the SLIM {name, slug} index of
 * linkable catalogue entities used for cross-linking feed items to their
 * evergreen pages:
 *
 *   - tools:  landscape tools that HAVE a detail page (src/data/learn/
 *             tools/<slug>.json exists) → linkable to /tools/<slug>/.
 *             Tile-only tools are excluded on purpose: they have no page
 *             of ours to link to.
 *   - models: every version in the LLM registry → /models/<slug>/
 *             (check-models enforces a 1:1 registry↔detail mapping).
 *
 * The SPA main bundle imports this index (src/lib/entities.ts) so release
 * cards + the modal can link tool/model mentions WITHOUT pulling the full
 * landscape/registry JSON into the feed bundle. Regenerated on every
 * typecheck/build (like stats.json / count.json) — a committed copy is
 * kept as a seed so `tsc` can resolve the import.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const LANDSCAPE = "src/data/learn/landscape.json";
const REGISTRY = "src/data/models/registry.json";
const TOOLS_DIR = "src/data/learn/tools";
const OUT = "src/data/entity-index.json";

interface EntityRef {
  name: string;
  slug: string;
}

const landscape = JSON.parse(readFileSync(LANDSCAPE, "utf8")) as {
  categories: {
    subcategories: { tools: { name: string; slug: string }[] }[];
  }[];
};
const registry = JSON.parse(readFileSync(REGISTRY, "utf8")) as {
  makers: { lines: { versions: { name: string; slug: string }[] }[] }[];
};

const tools: EntityRef[] = [];
for (const c of landscape.categories)
  for (const s of c.subcategories)
    for (const t of s.tools)
      if (existsSync(`${TOOLS_DIR}/${t.slug}.json`))
        tools.push({ name: t.name, slug: t.slug });

const models: EntityRef[] = [];
for (const mk of registry.makers)
  for (const l of mk.lines)
    for (const v of l.versions) models.push({ name: v.name, slug: v.slug });

function writeIfChanged(path: string, content: string, label: string): void {
  const prev = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (content !== prev) {
    writeFileSync(path, content);
    console.log(`[entity-index] wrote ${label}`);
  } else {
    console.log(`[entity-index] up to date: ${label}`);
  }
}

writeIfChanged(
  OUT,
  JSON.stringify({ tools, models }, null, 1) + "\n",
  `${OUT} (${tools.length} tools, ${models.length} models)`,
);

// ---------------------------------------------------------------------------
// Per-entity news maps — slug → up to 8 feed items naming that entity,
// newest public date first. Generated here (and consumed by the LAZY learn /
// models chunks) so tool/model pages get their "In the news" list WITHOUT
// importing the multi-MB releases.json into those chunks. Built by INVERTING
// the same releaseEntities() matcher the cards/modal/prerender use, so an
// item's chips and the entity's news list always agree.
// ---------------------------------------------------------------------------

const TOOL_NEWS_OUT = "src/data/learn/tool-news.json";
const MODEL_NEWS_OUT = "src/data/models/model-news.json";
const NEWS_CAP = 8;

// Dynamic import AFTER entity-index.json is written — the lib reads that file.
const { releaseEntities } = await import("../src/lib/entities");

interface FeedItem {
  id: string;
  title: string;
  tags: string[];
  date: string;
  publishDate: string;
  importance: string;
}
const feed = JSON.parse(readFileSync("src/data/releases.json", "utf8")) as {
  items: FeedItem[];
};

type NewsRef = { id: string; date: string; title: string; importance: string };
const toolNews: Record<string, NewsRef[]> = {};
const modelNews: Record<string, NewsRef[]> = {};

// Tools ↔ LLMs bridge: when one feed item names BOTH a tool and a model
// (e.g. "vLLM v0.28.0 — Kimi K3 gets a speed pass"), that co-mention is
// evidence the pair belongs together — far stronger than scanning evergreen
// prose, where tool pages say "Llama" generically while registry names are
// versioned. Counted across the whole feed, top co-mentions per entity.
const toolModelCount: Record<string, Record<string, number>> = {};
const modelToolCount: Record<string, Record<string, number>> = {};
const entityName: Record<string, string> = {};

const sorted = [...feed.items].sort(
  (a, b) =>
    b.date.localeCompare(a.date) || b.publishDate.localeCompare(a.publishDate),
);
for (const it of sorted) {
  const ents = releaseEntities(it);
  for (const e of ents) {
    entityName[`${e.kind}:${e.slug}`] = e.name;
    const bucket = e.kind === "tool" ? toolNews : modelNews;
    const list = (bucket[e.slug] ??= []);
    if (list.length < NEWS_CAP)
      list.push({ id: it.id, date: it.date, title: it.title, importance: it.importance });
  }
  const itemTools = ents.filter((e) => e.kind === "tool");
  const itemModels = ents.filter((e) => e.kind === "model");
  for (const t of itemTools)
    for (const m of itemModels) {
      (toolModelCount[t.slug] ??= {})[m.slug] =
        ((toolModelCount[t.slug] ??= {})[m.slug] ?? 0) + 1;
      (modelToolCount[m.slug] ??= {})[t.slug] =
        ((modelToolCount[m.slug] ??= {})[t.slug] ?? 0) + 1;
    }
}

/** Top-N co-mentioned counterparts as {name, slug}, most co-mentions first. */
function topRelated(
  counts: Record<string, Record<string, number>>,
  kind: "tool" | "model",
  cap: number,
): Record<string, EntityRef[]> {
  const out: Record<string, EntityRef[]> = {};
  for (const [slug, others] of Object.entries(counts)) {
    out[slug] = Object.entries(others)
      .sort((a, b) => b[1] - a[1])
      .slice(0, cap)
      .map(([s]) => ({ name: entityName[`${kind}:${s}`] ?? s, slug: s }));
  }
  return out;
}

const toolModels = topRelated(toolModelCount, "model", 4);
const modelTools = topRelated(modelToolCount, "tool", 5);

writeIfChanged(
  TOOL_NEWS_OUT,
  JSON.stringify(toolNews, null, 1) + "\n",
  `${TOOL_NEWS_OUT} (${Object.keys(toolNews).length} tools with news)`,
);
writeIfChanged(
  MODEL_NEWS_OUT,
  JSON.stringify(modelNews, null, 1) + "\n",
  `${MODEL_NEWS_OUT} (${Object.keys(modelNews).length} models with news)`,
);
writeIfChanged(
  "src/data/learn/tool-models.json",
  JSON.stringify(toolModels, null, 1) + "\n",
  `tool-models.json (${Object.keys(toolModels).length} tools with related LLMs)`,
);
writeIfChanged(
  "src/data/models/model-tools.json",
  JSON.stringify(modelTools, null, 1) + "\n",
  `model-tools.json (${Object.keys(modelTools).length} models with related tools)`,
);
