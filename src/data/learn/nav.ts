/**
 * Lookup layer over the Learn taxonomy. Imported by the lazy-loaded Learn
 * chunk (NOT the main bundle) and by scripts/prerender-learn.tsx, so keep
 * it framework-free.
 */

import taxonomyJson from "./taxonomy.json";
import type {
  LearnArticleRef,
  LearnCategory,
  LearnSubcategory,
  LearnTaxonomy,
} from "./schema";

export const learnTaxonomy = taxonomyJson as LearnTaxonomy;

export interface LearnArticleLocation {
  category: LearnCategory;
  subcategory: LearnSubcategory;
  article: LearnArticleRef;
  /** Index of the article within its subcategory. */
  index: number;
}

const bySlug = new Map<string, LearnArticleLocation>();
for (const category of learnTaxonomy.categories) {
  for (const subcategory of category.subcategories) {
    subcategory.articles.forEach((article, index) => {
      bySlug.set(article.slug, { category, subcategory, article, index });
    });
  }
}

export function learnArticleCount(): number {
  let n = 0;
  for (const c of learnTaxonomy.categories)
    for (const s of c.subcategories) n += s.articles.length;
  return n;
}

export function findLearnCategory(slug: string): LearnCategory | null {
  return learnTaxonomy.categories.find((c) => c.slug === slug) ?? null;
}

export function findLearnSubcategory(
  cat: string,
  sub: string,
): { category: LearnCategory; subcategory: LearnSubcategory } | null {
  const category = findLearnCategory(cat);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  return category && subcategory ? { category, subcategory } : null;
}

export function findLearnArticle(slug: string): LearnArticleLocation | null {
  return bySlug.get(slug) ?? null;
}

/**
 * Previous/next article in reading order. Order is the taxonomy's
 * flattened order: category → subcategory → article, which the taxonomy
 * deliberately arranges foundations-first.
 */
export function learnPrevNext(slug: string): {
  prev: LearnArticleLocation | null;
  next: LearnArticleLocation | null;
} {
  const flat: LearnArticleLocation[] = [];
  for (const category of learnTaxonomy.categories)
    for (const subcategory of category.subcategories)
      subcategory.articles.forEach((article, index) =>
        flat.push({ category, subcategory, article, index }),
      );
  const i = flat.findIndex((l) => l.article.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: flat[i - 1] ?? null, next: flat[i + 1] ?? null };
}
