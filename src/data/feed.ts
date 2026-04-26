import raw from "./releases.json";
import type { Category, ReleaseFeed, ReleaseItem } from "./schema";

export const feed = raw as ReleaseFeed;

/**
 * Items are always ordered by `publishDate` DESC — when we added the item
 * to the feed — so sweep additions land at the top with a NEW badge.
 * `publishDate` falls back to `date` for pre-2026-04 items that predate
 * the field. ISO timestamps and YYYY-MM-DD strings both sort correctly
 * lexically.
 */
const sortKey = (item: ReleaseItem): string =>
  item.publishDate ?? item.date;

export const allItems = (): ReleaseItem[] =>
  [...feed.items].sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : -1));

export const itemsByCategory = (cat: Category): ReleaseItem[] =>
  feed.items
    .filter((i) => i.categories.includes(cat))
    .sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : -1));

// 36h instead of 24 so an item added at (say) 11pm yesterday still
// reads as NEW through tomorrow — `publishDate` is date-only granularity.
const NEW_WINDOW_MS = 36 * 60 * 60 * 1000;

export const isFresh = (item: ReleaseItem): boolean => {
  const pub = new Date(item.publishDate ?? item.date).getTime();
  return Date.now() - pub < NEW_WINDOW_MS;
};

export const filterItems = (
  items: ReleaseItem[],
  opts: { categories?: Set<Category>; query?: string },
): ReleaseItem[] => {
  const q = opts.query?.trim().toLowerCase();
  return items.filter((i) => {
    if (opts.categories && opts.categories.size > 0) {
      // multi-category match: item passes if ANY of its categories
      // is in the active filter set
      const hit = i.categories.some((c) => opts.categories!.has(c));
      if (!hit) return false;
    }
    if (q) {
      const hay = `${i.title} ${i.org} ${i.summary} ${i.tags.join(" ")} ${i.explainer.tagline}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
};

/**
 * Counts each item once per category it belongs to. An item with
 * categories=[repo, tool] adds 1 to both REPO and TOOL counts.
 */
export const categoryCounts = (): Record<Category, number> => {
  const out = {} as Record<Category, number>;
  for (const i of feed.items) {
    for (const c of i.categories) {
      out[c] = (out[c] ?? 0) + 1;
    }
  }
  return out;
};
