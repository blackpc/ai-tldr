import type { Category } from "./schema";

/**
 * Category metadata — single source of truth for the category badge
 * shown on every release card and in the filter bar.
 *
 * To add a new category:
 *   1. Add it to `Category` and `CATEGORY_ORDER` in src/data/schema.ts.
 *   2. Add an entry below.
 *   3. Done — cards and filters auto-include it.
 */

export interface CategoryMeta {
  id: Category;
  label: string;   // shown on the badge
  short: string;   // 1–3 char glyph for tight spaces
  blurb: string;   // shown in filter tooltip / hero
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  model: {
    id: "model",
    label: "MODEL",
    short: "M",
    blurb: "Frontier + open-weights releases",
  },
  repo: {
    id: "repo",
    label: "REPO",
    short: "</>",
    blurb: "Trending GitHub drops",
  },
  tool: {
    id: "tool",
    label: "TOOL",
    short: ">_",
    blurb: "Shipped products, CLIs, IDE features",
  },
  security: {
    id: "security",
    label: "SECURITY",
    short: "🛡",
    blurb: "AI/LLM security tools, red-teaming, guardrails",
  },
  algorithm: {
    id: "algorithm",
    label: "ALGORITHM",
    short: "fx",
    blurb: "Named techniques worth knowing",
  },
  paper: {
    id: "paper",
    label: "PAPER",
    short: "P",
    blurb: "arXiv / conference picks",
  },
  dataset: {
    id: "dataset",
    label: "DATASET",
    short: "DB",
    blurb: "New training / eval corpora",
  },
  benchmark: {
    id: "benchmark",
    label: "BENCH",
    short: "##",
    blurb: "Leaderboards + evals",
  },
  ecosystem: {
    id: "ecosystem",
    label: "ECOSYSTEM",
    short: "Ψ",
    blurb: "Governance, foundations, license / org changes",
  },
  tutorial: {
    id: "tutorial",
    label: "TUTORIAL",
    short: "▶",
    blurb: "Guides, cookbooks, how-tos you can follow tonight",
  },
  showcase: {
    id: "showcase",
    label: "SHOWCASE",
    short: "★",
    blurb: "Impressive demos, shipped projects, 'look what I built'",
  },
  resource: {
    id: "resource",
    label: "RESOURCE",
    short: "≡",
    blurb: "Curated lists, cheat sheets, learning paths",
  },
  article: {
    id: "article",
    label: "ARTICLE",
    short: "✎",
    blurb: "Blog posts, threads, essays from influential voices",
  },
  video: {
    id: "video",
    label: "VIDEO",
    short: "▷",
    blurb: "YouTube, talks, and viral demos from top AI creators",
  },
  rumor: {
    id: "rumor",
    label: "RUMOR",
    short: "?",
    blurb: "Credible speculation from reliable sources",
  },
};
