/**
 * LLM Registry (/models) — an Artificial-Analysis-style directory of large
 * language models, structured as Miller columns: maker ▸ family ▸ model
 * (the same finder pattern as /learn/landscape's category ▸ subcategory ▸ tool).
 *
 * Two layers, same split as the landscape:
 *   - registry.json   — the curated TREE of lightweight model tiles.
 *   - models/<slug>.json — one rich, SEO-targeted detail page per model.
 *
 * Zero-hallucination: every benchmark number, price, context window, and URL
 * must trace to a verified source. check-models.ts fails the build otherwise.
 */

/** Canonical site path for a model's detail page. */
export function modelPath(slug: string): string {
  return `/models/${slug}/`;
}

/**
 * Cross-cutting tags used for the registry's filter chips. A model can carry
 * several. Kept to a small controlled vocabulary so filtering is predictable.
 */
export type ModelTag =
  | "frontier"
  | "open-weights"
  | "proprietary"
  | "reasoning"
  | "multimodal"
  | "coding"
  | "long-context"
  | "on-device"
  | "free-tier"
  | "agentic";

/**
 * One VERSION tile in the registry's third column. EVERY version of a line is
 * its own entry with its own detail page (`/models/<slug>`) — the current
 * release and every historical version alike. The registry tree is therefore
 * maker ▸ line ▸ versions (column 1 ▸ 2 ▸ 3).
 */
export interface ModelEntry {
  /** Display name, e.g. "Claude Opus 4.8". */
  name: string;
  /** Globally-unique URL slug for the detail page. */
  slug: string;
  /** Card description: what changed in this version, or its tagline. */
  blurb: string;
  /** Cross-cutting filter tags. */
  tags: ModelTag[];
  /** Short context-window label, e.g. "200K", "1M". */
  contextWindow?: string;
  /** License label, e.g. "Proprietary", "Apache-2.0", "Llama 4 Community". */
  license?: string;
  /** Public release date, YYYY-MM-DD or YYYY-MM. */
  date?: string;
  /** True for the line's current/latest version. */
  current?: boolean;
  /** True when this version has a fully-researched page (benchmarks/pricing). */
  rich?: boolean;
}

/** A model LINE / tier (e.g. "Claude Opus", "Gemini Flash", "Gemma") — column 2
 *  of the registry. Its `versions` (column 3) are the line's releases, newest
 *  first, each a clickable detail page. */
export interface ModelLine {
  id: string;
  /** Display name, e.g. "Claude Opus", "Gemini Flash". */
  title: string;
  /** One plain sentence: what this line is for. */
  blurb: string;
  versions: ModelEntry[];
}

export interface ModelMaker {
  id: string;
  /** Display name, e.g. "Anthropic". */
  title: string;
  /** One-line description of the maker. */
  blurb: string;
  /** Official homepage (https). */
  homepage?: string;
  lines: ModelLine[];
}

export interface ModelRegistry {
  makers: ModelMaker[];
}

// ----- detail page ---------------------------------------------------------

/** One benchmark score on a model detail page (rendered as a bar). */
export interface ModelBenchmark {
  /** Benchmark name, e.g. "MMLU-Pro", "GPQA Diamond", "SWE-bench Verified". */
  name: string;
  /** Numeric score (drives the bar). */
  score: number;
  /** Display suffix, default "%". Use "" for index points. */
  unit?: string;
  /** Scale max for the bar, default 100. */
  max?: number;
  /** Source URL — MUST be present in `links[]`. */
  source: string;
}

/** A provider that serves the model via API. */
export interface ModelApi {
  /** Provider name, e.g. "Anthropic API", "OpenRouter", "Together". */
  provider: string;
  /** Docs / console URL. */
  url: string;
  /** The model id string to pass, e.g. "claude-opus-4-8". */
  modelId?: string;
}

/** Token / usage pricing for a model. */
export interface ModelPricing {
  /** Input price as shown, e.g. "$3.00". */
  input?: string;
  /** Output price as shown. */
  output?: string;
  /** Cached-input price, if published. */
  cachedInput?: string;
  /** The unit both prices are per, e.g. "/ 1M tokens". Default "/ 1M tokens". */
  unit?: string;
  /** Optional one-line qualifier. */
  note?: string;
  /** Source URL — MUST be present in `links[]`. */
  source: string;
}

export type ModelLinkKind =
  | "official"
  | "model-card"
  | "api-docs"
  | "paper"
  | "announcement"
  | "benchmark"
  | "review"
  | "tutorial"
  | "playground";

/** A useful external link on a model detail page. */
export interface ModelLink {
  label: string;
  url: string;
  kind: ModelLinkKind;
}

/**
 * Full, SEO-targeted detail page for one model. One per file at
 * src/data/models/models/<slug>.json (lazy vite chunk), rendered both
 * client-side and by the prerenderer. Self-contained.
 */
export interface ModelDetail {
  slug: string;
  name: string;
  maker: string;
  makerTitle: string;
  /** The model line this version belongs to, e.g. line id "claude-opus". */
  line: string;
  /** Line display name, e.g. "Claude Opus". */
  lineTitle: string;
  tagline: string;
  seoTitle: string;
  metaDescription: string;

  // identity / specs (all verified)
  releaseDate?: string;
  /** "Generally available" | "Preview" | "Research preview" | "Deprecated". */
  status?: string;
  license: string;
  /** True if weights are downloadable (open-weight); false for API-only. */
  openWeights: boolean;
  /** Modality labels, e.g. ["Text", "Vision", "Audio"]. */
  modalities: string[];
  contextWindow?: string;
  maxOutput?: string;
  /** "Undisclosed" | "405B" | "671B total · 37B active", etc. */
  parameters?: string;
  knowledgeCutoff?: string;
  /** "Dense transformer" | "Mixture-of-Experts", etc. */
  architecture?: string;
  tags: ModelTag[];

  // rich content
  overview: string[];
  strengths: string[];
  useCases: string[];
  benchmarks?: ModelBenchmark[];
  pricing?: ModelPricing;
  apis?: ModelApi[];
  links: ModelLink[];
  faq?: { q: string; a: string }[];
  /**
   * Version timeline of this model's line, NEWEST FIRST — the lineage section
   * ("Opus 4.8 ← Opus 4.7 ← …"). Each entry's date must be verifiable; omit a
   * date rather than guess. `current: true` marks this page's model.
   */
  versionHistory?: ModelVersion[];
}

/** One entry in a model line's version history. */
export interface ModelVersion {
  /** Version label, e.g. "Claude Opus 4.8", "GPT-5.4". */
  version: string;
  /** Release date (YYYY-MM-DD / YYYY-MM), if verifiable. */
  date?: string;
  /** One short note on what changed, if known. */
  note?: string;
  /** True for the model this page is about. */
  current?: boolean;
  /**
   * Slug of this version's own detail page, when one exists. Every version in
   * the registry now gets its own page, so the version-history timeline links
   * straight to each sibling version (the current entry points back at this
   * page). Omitted only for legacy lineage entries with no dedicated page.
   */
  slug?: string;
}
