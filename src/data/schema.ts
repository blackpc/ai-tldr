/**
 * Content schema for AI/TLDR releases.
 *
 * The external update agent MUST emit JSON conforming to `ReleaseFeed`.
 * Adding a new category = add an entry to `CATEGORY_ORDER` below + a section
 * config in `src/sections/registry.ts`. No other code changes required.
 */

export type Category =
  | "model"
  | "repo"
  | "tool"
  | "algorithm"
  | "paper"
  | "dataset"
  | "benchmark"
  | "ecosystem"
  | "tutorial"
  | "showcase"
  | "resource";

export const CATEGORY_ORDER: Category[] = [
  "model",
  "repo",
  "tool",
  "tutorial",
  "showcase",
  "resource",
  "algorithm",
  "paper",
  "dataset",
  "benchmark",
  "ecosystem",
];

export type Importance = "rumor" | "notable" | "major" | "seismic";

/**
 * The "explain like an enthusiast, not a paper reviewer" block.
 * Every item MUST have one. Keep each field punchy and concrete —
 * no marketing words, no hand-waving.
 */
export interface Explainer {
  /** One-sentence elevator pitch. Max ~140 chars. */
  tagline: string;
  /** What is it, plainly. 2–3 sentences. */
  whatIsIt: string;
  /** How does it actually work under the hood. 2–4 sentences. */
  howItWorks: string;
  /** Why does this matter / who should care. 2–3 sentences. */
  whyItMatters: string;
  /** Optional: who this is most useful for (e.g. "indie devs", "ML researchers"). */
  forWho?: string;
  /** Optional: a single command, URL, or 1-line "how to try it". */
  tryIt?: string;
}

/**
 * Image associated with a release. Strongly preferred but technically
 * optional — if missing the card renders a category-tinted text placeholder.
 * The agent prompt requires `image` on every item it produces.
 */
export interface ReleaseImage {
  /** Direct image URL — must be HTTPS, must return 200 when fetched. */
  url: string;
  /** Alt text — required for a11y. */
  alt: string;
  /** How the image should fit its frame. Default 'cover'. */
  fit?: "cover" | "contain";
  /** Optional credit line shown under the modal hero. */
  credit?: string;
}

export interface ReleaseItem {
  id: string;
  /**
   * One or more categories. An item with [repo, tool] shows up under both
   * the REPO and TOOL filter chips. The first entry is the "primary"
   * category and is used for the prominent badge on the card.
   */
  categories: Category[];
  title: string;
  org: string;
  date: string;
  url: string;
  /** Short summary — the headline blurb. ≤240 chars. */
  summary: string;
  tags: string[];
  importance: Importance;
  metrics?: Record<string, string | number>;
  links?: { label: string; url: string }[];
  explainer: Explainer;
  image?: ReleaseImage;
}

export interface ReleaseFeed {
  generatedAt: string;
  promptVersion: string;
  source: string;
  /** Item IDs pinned as "Editor's Choice" — displayed at the top of the feed regardless of date. */
  editorChoice?: string[];
  items: ReleaseItem[];
}
