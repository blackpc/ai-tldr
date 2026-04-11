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
};
