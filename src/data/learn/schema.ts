/**
 * Content schema for the Learn section — a beginner-friendly AI/LLM/agent
 * encyclopedia under /learn.
 *
 * Three-level hierarchy:
 *   category (/learn/<cat>) → subcategory (/learn/<cat>/<sub>)
 *     → article (/learn/<cat>/<sub>/<slug>)
 *
 * The taxonomy tree lives in `src/data/learn/taxonomy.json`; one JSON file
 * per article lives in `src/data/learn/articles/<cat>/<sub>/<slug>.json`.
 * Article slugs are globally unique across the whole tree.
 *
 * Articles are STRUCTURED, not freeform markdown — every article is a list
 * of sections built from a fixed block vocabulary. That is what keeps every
 * page consistent: the renderer enforces the layout, the writer only
 * supplies content. `scripts/check-learn.ts` validates every rule below.
 */

export type LearnDifficulty = "beginner" | "intermediate" | "advanced";

// -------------------------------------------------------------------------
// Taxonomy
// -------------------------------------------------------------------------

/** SEO + listing metadata for one article. Mirrored in the article file. */
export interface LearnArticleRef {
  /** Globally-unique kebab-case slug, e.g. "what-is-rag". */
  slug: string;
  /** H1 — clear, beginner-readable. */
  title: string;
  /** <title> tag content (brand suffix added by prerender). ≤ 65 chars. */
  seoTitle: string;
  /** Meta description, 90–165 chars. */
  metaDescription: string;
  /** Long-tail queries this page targets. 2–8 entries. */
  keywords: string[];
  difficulty: LearnDifficulty;
  /** One-sentence promise of what the reader will understand. */
  oneLiner: string;
}

export interface LearnSubcategory {
  slug: string;
  title: string;
  tagline: string;
  /** Ordered beginner → advanced. First article = the "What is X" piece. */
  articles: LearnArticleRef[];
}

export interface LearnCategory {
  slug: string;
  title: string;
  tagline: string;
  subcategories: LearnSubcategory[];
}

export interface LearnTaxonomy {
  categories: LearnCategory[];
}

// -------------------------------------------------------------------------
// Article body blocks
// -------------------------------------------------------------------------
//
// `md` strings support ONLY the inline subset rendered by
// src/components/learn/markdown.tsx: **bold**, *italic*, `code`,
// [link](url). No raw HTML, no block-level markdown. Internal links must
// be absolute site paths ("/learn/..."); external links must be https.
//

export interface LearnDiagramNode {
  label: string;
  /** Small secondary line under the label. */
  sub?: string;
  /** Highlight this node in the accent color. */
  accent?: boolean;
}

/**
 * Diagram DSL — rendered by src/components/learn/Diagram.tsx as styled
 * HTML (responsive, brutalist boxes + arrows). Writers never supply SVG;
 * the fixed vocabulary is what keeps diagrams visually consistent.
 */
export type LearnDiagram =
  /** Linear pipeline: A → B → C (wraps vertically on mobile). */
  | { kind: "flow"; title?: string; steps: LearnDiagramNode[] }
  /** Closed loop, e.g. the agent loop. Steps cycle back to the first. */
  | { kind: "cycle"; title?: string; steps: LearnDiagramNode[] }
  /** Side-by-side comparison columns. */
  | {
      kind: "compare";
      title?: string;
      columns: { title: string; accent?: boolean; items: string[] }[];
    }
  /** Vertical stack of layers, top first (e.g. serving stack). */
  | { kind: "stack"; title?: string; layers: LearnDiagramNode[] }
  /** One root fanning out to N children (e.g. a router, orchestrator). */
  | {
      kind: "split";
      title?: string;
      root: LearnDiagramNode;
      children: LearnDiagramNode[];
    };

export type LearnBlock =
  /** Paragraph. */
  | { type: "p"; md: string }
  /** Sub-heading inside a section (renders as h3). */
  | { type: "h3"; text: string }
  /** Bullet or numbered list; items support the inline md subset. */
  | { type: "list"; ordered?: boolean; items: string[] }
  /** Simple table; cells support the inline md subset. */
  | { type: "table"; headers: string[]; rows: string[][] }
  /** Code sample. `lang`: python|typescript|javascript|bash|json|yaml|sql|text */
  | { type: "code"; lang: string; title?: string; code: string }
  /** Highlighted aside. */
  | { type: "callout"; tone: "tip" | "warn" | "note"; md: string }
  /** Consistent, responsive diagram from the fixed DSL above. */
  | { type: "diagram"; diagram: LearnDiagram }
  /**
   * A real image. Either a self-hosted file served from our own domain
   * (a site-rooted path like "/learn-media/learn-001.jpg") or a stable
   * external https asset (official logo / docs screenshot), verified live
   * at authoring time. `credit` carries source attribution.
   */
  | {
      type: "image";
      url: string;
      alt: string;
      caption?: string;
      credit?: string;
    };

export interface LearnSection {
  /** Anchor id, kebab-case. Drives the table of contents. */
  id: string;
  /** h2 heading. */
  title: string;
  blocks: LearnBlock[];
}

export interface LearnFaqEntry {
  /** A real long-tail question, phrased the way people search. */
  q: string;
  /** Plain answer; inline md subset allowed. 1–4 sentences. */
  a: string;
}

/**
 * One article. Canonical section flow (enforced by check-learn):
 *   1. id "in-plain-english"  — what it is, with an analogy   (required, first)
 *   2. id "why-it-matters"    — the problem it solves          (required)
 *   3. id "how-it-works"      — mechanics, with ≥1 diagram     (required)
 *   4. …free sections: examples, comparisons, pitfalls, tools…
 *   5. id "going-deeper"      — the advanced material          (required, last)
 * Plus FAQ (3–7), related (2–6 existing slugs), furtherReading (verified).
 */
export interface LearnArticle extends LearnArticleRef {
  /** YYYY-MM-DD the content was last reviewed/updated. */
  updated: string;
  sections: LearnSection[];
  faq: LearnFaqEntry[];
  /** Slugs of related articles (rendered as cards). */
  related: string[];
  /** Verified external links to official docs/papers. */
  furtherReading: { title: string; url: string }[];
}

// -------------------------------------------------------------------------
// Helpers shared by app + prerender
// -------------------------------------------------------------------------

export const LEARN_CODE_LANGS = [
  "python",
  "typescript",
  "javascript",
  "bash",
  "json",
  "yaml",
  "sql",
  "text",
] as const;

export const LEARN_REQUIRED_SECTIONS = [
  "in-plain-english",
  "why-it-matters",
  "how-it-works",
  "going-deeper",
] as const;

export const LEARN_DIFFICULTY_META: Record<
  LearnDifficulty,
  { label: string; cls: string }
> = {
  beginner: { label: "BEGINNER", cls: "lrn-diff-beginner" },
  intermediate: { label: "INTERMEDIATE", cls: "lrn-diff-intermediate" },
  advanced: { label: "ADVANCED", cls: "lrn-diff-advanced" },
};

/** Rough reading time from the article's text content. */
export function learnReadingMinutes(article: LearnArticle): number {
  let words = 0;
  const count = (s: string) => {
    words += s.split(/\s+/).filter(Boolean).length;
  };
  for (const sec of article.sections) {
    count(sec.title);
    for (const b of sec.blocks) {
      if (b.type === "p" || b.type === "callout") count(b.md);
      else if (b.type === "h3") count(b.text);
      else if (b.type === "list") b.items.forEach(count);
      else if (b.type === "table") {
        b.headers.forEach(count);
        b.rows.forEach((r) => r.forEach(count));
      } else if (b.type === "code") {
        // code reads slower than prose; weight lines, not words
        words += b.code.split("\n").length * 6;
      }
    }
  }
  for (const f of article.faq) {
    count(f.q);
    count(f.a);
  }
  return Math.max(2, Math.round(words / 220));
}

// Pages are served with a trailing slash (Cloudflare Pages turns
// `foo/index.html` into `/foo/` and 307-redirects the slash-less form),
// so every internal path we emit ends in `/` to match the served URL —
// no redirect on click, refresh, share, or crawl.

/** Canonical site path for the Learn hub. */
export const learnHubPath = "/learn/";

/** Canonical site path for the Learn mind map. */
export const learnMapPath = "/learn/map/";

/** Canonical site path for a category listing page. */
export function learnCategoryPath(cat: string): string {
  return `/learn/${cat}/`;
}

/** Canonical site path for a subcategory listing page. */
export function learnSubcategoryPath(cat: string, sub: string): string {
  return `/learn/${cat}/${sub}/`;
}

/** Canonical site path for an article, given its category + subcategory. */
export function learnArticlePath(
  cat: string,
  sub: string,
  slug: string,
): string {
  return `/learn/${cat}/${sub}/${slug}/`;
}
