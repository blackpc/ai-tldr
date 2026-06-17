#!/usr/bin/env bun
/**
 * Post-build static page generation for AI/TLDR.
 *
 * Reads the single source of truth (src/data/releases.json and
 * src/data/influencers.ts) and, for every release + the influencers
 * page, writes a pre-rendered HTML file at the right path with the
 * correct <title>, <meta>, and Open Graph tags injected.
 *
 * After this script runs, dist/ looks like:
 *
 *   dist/
 *     index.html                                 ← homepage
 *     influencers/index.html                     ← influencers page
 *     releases/<id>/index.html                   ← one per release
 *     sitemap.xml
 *     robots.txt
 *
 * Cloudflare Pages/Workers serves static files first, so a request to
 * /releases/anthropic-glasswing-mythos gets the pre-rendered file (and
 * Googlebot/social scrapers see real meta tags). The SPA shell in that
 * file then boots React, detects the path, and shows the modal for the
 * matching item.
 *
 * Fallbacks (paths that don't match a generated file) are handled by
 * the Cloudflare Worker's SPA asset fallback (wrangler.jsonc
 * `not_found_handling: "single-page-application"`), which serves
 * /index.html with a 200 for any unknown path so client routing works.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import feed from "../src/data/releases.json" with { type: "json" };
import sweepsData from "../src/data/sweeps.json" with { type: "json" };
import type { ReleaseItem, Category } from "../src/data/schema";
import { CATEGORY_ORDER as CATEGORY_ORDER_RELEASE } from "../src/data/schema";
import {
  influencers,
  type Influencer,
  CATEGORY_META,
  CATEGORY_ORDER,
  REACH_LABEL,
  PLATFORM_META,
} from "../src/data/influencers";
import {
  injectLearnLinksIntoHome,
  prerenderLearn,
} from "./prerender-learn.tsx";
import {
  injectModelsLinksIntoHome,
  prerenderModels,
} from "./prerender-models.tsx";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StatsPage } from "../src/components/StatsPage";
import statsData from "../src/data/stats.json" with { type: "json" };
import type { StatsData } from "../src/data/stats";
import landscapeData from "../src/data/learn/landscape.json" with { type: "json" };
import registryData from "../src/data/models/registry.json" with { type: "json" };
import type { ModelRegistry } from "../src/data/models/schema";
import { modelPath } from "../src/data/models/schema";
import { normalizeMetrics } from "../src/lib/metric-labels";

// Flat list of landscape tool pages ({name, slug}) — used to cross-link a
// fresh release page to the evergreen tool page it names. Build-script only;
// this never reaches the SPA bundle (the "no landscape in main bundle" rule).
const LANDSCAPE_TOOLS: { name: string; slug: string }[] = (
  landscapeData as {
    categories: { subcategories: { tools: { name: string; slug: string }[] }[] }[];
  }
).categories.flatMap((c) =>
  c.subcategories.flatMap((s) => s.tools.map((t) => ({ name: t.name, slug: t.slug }))),
);

// Flat list of LLM-registry model pages ({name, slug}) — used to cross-link a
// release that NAMES a model (e.g. "GPT-5.5", "Claude Opus 4.8") to its
// evergreen /models/<slug> detail page. Build-script only; never bundled.
const LLM_MODELS: { name: string; slug: string }[] = (
  registryData as ModelRegistry
).makers.flatMap((mk) =>
  mk.lines.flatMap((l) => l.versions.map((v) => ({ name: v.name, slug: v.slug }))),
);

// -----------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ||
  "https://ai-tldr.dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

// Cloudflare Pages serves directory pages with a trailing slash
// (`foo/index.html` → `/foo/`) and 307-redirects the slash-less form, so
// every page URL we emit (canonical, og:url, sitemap loc, JSON-LD) ends in
// `/` to match the served URL — Google never sees a redirect in the
// sitemap or a canonical that points at one. Asset files (*.png, *.xml)
// and the root keep their exact paths.
const releaseUrl = (id: string) => `${SITE_URL}/releases/${id}/`;
// Category hub pages: /releases/<cat>/ — a crawlable index per primary
// category. Gives every release a real internal link from a topical hub
// (not just the homepage/sitemap) and a 3-level breadcrumb to sit in.
const releaseCatUrl = (cat: Category) => `${SITE_URL}/releases/${cat}/`;
const INFLUENCERS_URL = `${SITE_URL}/influencers/`;
const LOG_URL = `${SITE_URL}/log/`;
const STATS_URL = `${SITE_URL}/stats/`;

const __dirname = dirname(fileURLToPath(import.meta.url));
// `@cloudflare/vite-plugin` splits the build into:
//   dist/client/   ← static assets (the SPA) — what we post-process
//   dist/ai_tldr/  ← compiled Worker + a wrangler.json that points
//                    `assets.directory` at `../client`
// Everything we generate (HTML, sitemap, robots.txt, feed.json) MUST
// land in dist/client/ — files written to dist/ alone are NOT served.
const DIST = join(__dirname, "..", "dist", "client");
const TEMPLATE_PATH = join(DIST, "index.html");

// -----------------------------------------------------------------------
// HTML escaping — plain values only, never arbitrary HTML
// -----------------------------------------------------------------------

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Visible hostname (drops www.) — used for the source-credibility chips so
 *  a reader (and an AI engine) can see at a glance which outlet each citation
 *  comes from. Mirrors hostOf() in ReleaseModal.tsx. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Truncate a string on a word boundary with an ellipsis. Used to keep
 * JSON-LD `headline` under Google's 110-char hard limit (over-length
 * headlines silently disqualify the Article rich result).
 */
function clampHeadline(s: string, max = 110): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

/**
 * JSON-LD image value. We only KNOW the dimensions of our own
 * og-image.png (1200×630); third-party thumbnails vary wildly
 * (GitHub OG = 1200×600, YouTube hqdefault = 480×360), so asserting
 * 1200×630 on them is a lie that hurts the image signal. For unknown
 * hosts, return the bare URL and let Google measure it.
 */
function jsonLdImage(url: string): unknown {
  return url === DEFAULT_OG_IMAGE
    ? { "@type": "ImageObject", url, width: 1200, height: 630 }
    : url;
}

// -----------------------------------------------------------------------
// Meta tag injection
// -----------------------------------------------------------------------

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  ogImage: string;
  ogImageAlt?: string;
  publishedTime?: string;
  /** Author/byline org name — emits an `article:author` OG tag when set. */
  author?: string;
  /**
   * Robots directive for this page. Defaults to DEFAULT_ROBOTS (index,
   * follow + rich-result hints). Set to e.g. "noindex, follow" to keep a
   * thin/utility page out of the index while still letting crawlers follow
   * its links.
   */
  robots?: string;
}

// Default robots directive: index everything, allow large image previews and
// unbounded snippets (lets Google show the hero + full explainer text).
const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1";

// -----------------------------------------------------------------------
// JSON-LD helpers
// -----------------------------------------------------------------------
//
// One JSON-LD block per page, tuned for the schema type that matches the
// page's content. Google's rich result validators are picky: missing a
// required property silently disables the rich result, so we err on the
// side of filling every optional field that has a cheap source of truth.
//

function wrapJsonLd(data: unknown): string {
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

const ORG_REF = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: "AI/TLDR",
  url: `${SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/og-image.png`,
    width: 1200,
    height: 630,
  },
  // Entity-linking (sameAs) so AI engines + Google's Knowledge Graph resolve
  // "AI/TLDR" to ONE entity instead of hallucinating. Only verified,
  // brand-owned references belong here (zero-hallucination): the canonical
  // Wikidata item (Q140264340) and the public source repo. No brand
  // X/LinkedIn handle exists yet — add them to this array when claimed, and
  // mirror any change in the dev fallback in index.html.
  sameAs: [
    "https://www.wikidata.org/wiki/Q140264340",
    "https://github.com/blackpc/ai-tldr",
  ],
};

// Canonical homepages for the orgs that author releases — used as
// `author.url` on the Article/Software/TechArticle/Dataset schema (an
// E-E-A-T / provenance signal that AI answer engines and Google use). Curated
// and conservative: ONLY well-known, unambiguous official domains. An org not
// in this map ships NO author.url (graceful) rather than a guessed one.
const ORG_HOMEPAGES: Record<string, string> = {
  Anthropic: "https://www.anthropic.com",
  OpenAI: "https://openai.com",
  Google: "https://www.google.com",
  "Google DeepMind": "https://deepmind.google",
  NVIDIA: "https://www.nvidia.com",
  Microsoft: "https://www.microsoft.com",
  Meta: "https://about.meta.com",
  xAI: "https://x.ai",
  "Mistral AI": "https://mistral.ai",
  "Hugging Face": "https://huggingface.co",
  Apple: "https://www.apple.com",
  GitHub: "https://github.com",
  DeepSeek: "https://www.deepseek.com",
  Cohere: "https://cohere.com",
  Cloudflare: "https://www.cloudflare.com",
  "Allen Institute for AI": "https://allenai.org",
  "IBM Research": "https://research.ibm.com",
  "Stanford University": "https://www.stanford.edu",
  "Nous Research": "https://nousresearch.com",
  Spotify: "https://www.spotify.com",
  Snowflake: "https://www.snowflake.com",
  Mozilla: "https://www.mozilla.org",
  Tencent: "https://www.tencent.com",
  "Vercel Labs": "https://vercel.com",
  Vercel: "https://vercel.com",
  LlamaIndex: "https://www.llamaindex.ai",
  "Liquid AI": "https://www.liquid.ai",
  Cursor: "https://www.cursor.com",
  "Zed Industries": "https://zed.dev",
  "Z.ai": "https://z.ai",
  Cognition: "https://cognition.ai",
};

/** Verified homepage for an org, or undefined if we don't have one. */
function orgUrl(org: string): string | undefined {
  return ORG_HOMEPAGES[org];
}

const WEBSITE_REF = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: "AI/TLDR",
  alternateName: "AI TLDR",
  description:
    "Every new AI model, repo, tool, and paper worth knowing — refreshed every 2 hours and explained in plain English.",
  inLanguage: "en-US",
  publisher: { "@id": `${SITE_URL}/#org` },
  // Sitelinks SearchBox — Google deprecated this rich result Nov 2024
  // but the markup is still valid schema.org and is shipped here for
  // completeness (other crawlers + voice surfaces may still use it).
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/**
 * FAQPage JSON-LD — Google sunset the rich result May 7 2026, but
 * shipping the markup is harmless and other surfaces (Bing, voice
 * assistants, AI chatbots) still use it. Mirrors the visible FAQ
 * accordion rendered by <Faq /> on the homepage.
 */
const HOME_FAQ = [
  {
    q: "What is AI/TLDR?",
    a: "AI/TLDR is a high-volume tracker of new AI releases — models, open-source repos, developer tools, papers, datasets, benchmarks and security findings — refreshed every 2 hours and explained in plain English.",
  },
  {
    q: "How often is the feed updated?",
    a: "An automated agent sweeps every 2 hours and publishes a fresh build to the site. Items are sorted by ingest time so the newest releases always float to the top.",
  },
  {
    q: "Is AI/TLDR free?",
    a: "Yes — the site is free to read with no signup. There is an optional newsletter and a Buy-Me-a-Coffee tip jar if you want to support it.",
  },
  {
    q: "Where does the data come from?",
    a: "Every item is fetched and verified from a primary source — vendor blog post, GitHub release, arXiv paper, official announcement. Nothing is hallucinated; if a URL or claim cannot be verified, the item is dropped.",
  },
  {
    q: "How do you decide what's worth covering?",
    a: "We catch the hype: frontier-lab releases, hyped open-source drops, multi-outlet stories, pricing or capability shifts. Items are tagged seismic, major or notable based on impact.",
  },
  {
    q: "Can I subscribe to a newsletter?",
    a: "Yes — there is a daily digest delivered via Buttondown. Subscribe from the homepage banner.",
  },
];

/**
 * Injects a static, crawler-visible FAQ section into the homepage HTML
 * just before `</body>`. Google requires FAQPage markup to match
 * content actually visible on the page — this is the visible content.
 * The React app doesn't touch it (it lives outside `#root`), so it
 * survives hydration.
 */
function injectVisibleFaq(html: string): string {
  const items = HOME_FAQ.map(
    (f) =>
      `      <details class="static-faq-item"><summary>${escapeText(f.q)}</summary><p>${escapeText(f.a)}</p></details>`,
  ).join("\n");
  // FAQ must be user-visible for the FAQPage rich-result match. This
  // section is rendered AFTER #root, so React's SPA mount doesn't
  // touch it. Inline styles keep it legible without depending on the
  // bundled CSS load order.
  const style = `<style>
      .static-faq{max-width:760px;margin:64px auto 96px;padding:0 24px;color:#cfcfcf;font-family:Inter,system-ui,sans-serif}
      .static-faq h2{font-size:24px;font-weight:700;color:#fff;margin:0 0 24px}
      .static-faq-item{border-top:1px solid #222;padding:16px 0}
      .static-faq-item summary{cursor:pointer;font-weight:600;color:#fff;list-style:none}
      .static-faq-item summary::-webkit-details-marker{display:none}
      .static-faq-item summary::after{content:"+";float:right;font-weight:300;color:#888}
      .static-faq-item[open] summary::after{content:"−"}
      .static-faq-item p{margin:12px 0 0;line-height:1.6;color:#bbb}
    </style>`;
  const section = `    ${style}
    <section class="static-faq" aria-label="Frequently asked questions">
      <h2>Frequently asked questions</h2>
${items}
    </section>`;
  return html.replace("</body>", () => `${section}\n  </body>`);
}

function renderJsonLdFaq(): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  });
}

/**
 * Homepage JSON-LD: WebSite + Organization as a @graph so Google can
 * pick up sitelinks search metadata + rich brand metadata in one block.
 */
function renderJsonLdHome(): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@graph": [WEBSITE_REF, ORG_REF],
  });
}

/**
 * CollectionPage JSON-LD for the /influencers and /log index pages.
 * Ties the page back to the WebSite + Organization entities via @id.
 */
function renderJsonLdCollectionPage(opts: {
  url: string;
  name: string;
  description: string;
}): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: "en-US",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#org` },
  });
}

/**
 * AI Release Index (/stats) — Dataset + BreadcrumbList. The page IS an
 * original dataset (a GEO citation magnet — a unique number forces
 * attribution), so Dataset is the right type; it ties back to the WebSite +
 * Organization entities.
 */
function renderJsonLdStats(): string {
  const s = statsData as StatsData;
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "AI Release Index",
    description:
      "Statistics on new AI releases and open-source AI tools tracked by AI/TLDR — counts by lab, category and week, plus the most-starred open-source tools.",
    url: STATS_URL,
    creator: { "@id": `${SITE_URL}/#org` },
    publisher: { "@id": `${SITE_URL}/#org` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en-US",
    dateModified: s.generatedAt,
    keywords:
      "AI releases, AI statistics, AI release tracker, open-source AI tools, AI models",
    measurementTechnique:
      "Aggregated from the AI/TLDR verified release feed and open-source landscape.",
    variableMeasured: [
      "AI releases tracked",
      "AI Release Velocity Index (releases per week)",
      "AI Release Cadence Index (mean days between releases per lab)",
      "Frontier releases in the last 90 days",
      "Releases by lab",
      "Releases by category",
      "Releases per week",
      "GitHub stars of tracked open-source tools",
    ],
    // Machine-readable download surfaces so an engine can fetch the data,
    // not just read the page. /stats.json is emitted by main(); the Worker
    // also serves it (and /api/stats.json) with CORS.
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${SITE_URL}/stats.json`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/html",
        contentUrl: STATS_URL,
      },
    ],
  });
}

function renderJsonLdStatsBreadcrumb(): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AI/TLDR", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "AI Release Index", item: STATS_URL },
    ],
  });
}

/**
 * Promote a date-only `YYYY-MM-DD` to a full W3C datetime. Google's News
 * sitemap + the freshness window treat a bare date as midnight UTC, which
 * makes a launch-day story look ~a day old by afternoon and can push it out
 * of the "fresh" window we're built to win. Noon UTC is a stable, neutral
 * placeholder for a date-only source — it never claims a precision we don't
 * have, and it keeps the sitemap and the page's JSON-LD agreeing to the
 * second. An already-full ISO timestamp is passed through untouched.
 */
function toW3CDateTime(date: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00+00:00` : date;
}

/**
 * Assemble the verified explainer prose into one `articleBody` string. This is
 * the SAME text already shown on the page — giving the NewsArticle a real body
 * (not just a headline + description) is what lets Google and AI answer engines
 * treat the page as a full article rather than a stub. Zero new content: it
 * only concatenates fields the sweep already wrote and verified.
 */
function buildArticleBody(item: ReleaseItem): string {
  const ex = item.explainer;
  return [
    item.summary,
    ex?.whatIsIt,
    ex?.howItWorks,
    ex?.whyItMatters,
    ex?.forWho,
  ]
    .filter((s): s is string => !!s && s.trim().length > 0)
    .join("\n\n");
}

function renderJsonLdArticle(item: ReleaseItem): string {
  const url = releaseUrl(item.id);
  const description = item.explainer?.tagline ?? item.summary;
  const articleBody = buildArticleBody(item);
  const data = {
    "@context": "https://schema.org",
    // NewsArticle is the right subtype: AI/TLDR is a release-tracking news
    // feed, every item has a real publication date, and Google's News
    // surfaces (Top Stories, News tab, Discover) require NewsArticle.
    "@type": "NewsArticle",
    // Google hard-caps headline at 110 chars; longer disables the result.
    headline: clampHeadline(item.title),
    description,
    url,
    datePublished: toW3CDateTime(item.date),
    // Release content doesn't change after publish and we don't track
    // per-item edits, so dateModified = the publish date. (Stamping the
    // feed-level generatedAt made every page claim "modified now" on every
    // 2h build — a false freshness signal that wastes crawl budget.)
    // Full datetime (noon UTC) so this agrees to the second with the news
    // sitemap's publication_date, which Google cross-checks.
    dateModified: toW3CDateTime(item.date),
    author: {
      "@type": "Organization",
      name: item.org,
      ...(orgUrl(item.org) ? { url: orgUrl(item.org) } : {}),
    },
    publisher: { "@id": `${SITE_URL}/#org` },
    image: jsonLdImage(item.image?.url ?? DEFAULT_OG_IMAGE),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    articleSection: item.categories[0],
    inLanguage: "en-US",
    // Full article body (the verified explainer prose already on the page) +
    // its word count — turns a headline-only stub into a complete article in
    // the eyes of Google and AI answer engines.
    ...(articleBody
      ? { articleBody, wordCount: articleBody.split(/\s+/).filter(Boolean).length }
      : {}),
    keywords: item.tags.join(", "),
    // Speakable: tells Google Assistant / voice surfaces which parts of
    // the page are read out loud. Still a beta feature limited to
    // US-English news sites, which is exactly what we are.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["title", "meta[name=description]"],
    },
  };
  return wrapJsonLd(data);
}

/**
 * VideoObject JSON-LD — emitted on release pages whose primary category
 * is `video`. Promotes the page into Google's video carousel + Watch tab.
 */
function renderJsonLdVideo(item: ReleaseItem): string | null {
  if (!item.categories.includes("video")) return null;
  const url = releaseUrl(item.id);
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: item.title,
    description: item.explainer?.tagline ?? item.summary,
    thumbnailUrl: item.image?.url ?? DEFAULT_OG_IMAGE,
    uploadDate: item.date,
    contentUrl: item.url,
    embedUrl: item.url,
    publisher: { "@id": `${SITE_URL}/#org` },
    ...(item.author && {
      creator: {
        "@type": "Person",
        name: item.author.name,
        ...(item.author.profileUrl && { url: item.author.profileUrl }),
      },
    }),
  });
}

/**
 * SoftwareApplication / SoftwareSourceCode JSON-LD — emitted for items
 * whose primary category is `tool`, `repo`, or `model`. Lets Google
 * render software-specific rich results (name, category, free pricing).
 */
function renderJsonLdSoftware(item: ReleaseItem): string | null {
  const primary = item.categories[0];
  const isRepo = item.categories.includes("repo");
  const isTool = item.categories.includes("tool") || primary === "tool";
  const isModel = primary === "model";
  if (!isRepo && !isTool && !isModel) return null;

  const url = releaseUrl(item.id);
  if (isRepo) {
    return wrapJsonLd({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: item.title,
      description: item.explainer?.tagline ?? item.summary,
      codeRepository: item.url,
      url,
      author: { "@type": "Organization", name: item.org, ...(orgUrl(item.org) ? { url: orgUrl(item.org) } : {}) },
      programmingLanguage: item.tags.find((t) =>
        ["python", "typescript", "javascript", "rust", "go", "c++", "cuda"].includes(
          t.toLowerCase(),
        ),
      ),
      keywords: item.tags.join(", "),
    });
  }
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.title,
    description: item.explainer?.tagline ?? item.summary,
    url,
    applicationCategory: isModel ? "DeveloperApplication" : "DeveloperApplication",
    operatingSystem: "Any",
    author: { "@type": "Organization", name: item.org, ...(orgUrl(item.org) ? { url: orgUrl(item.org) } : {}) },
    image: item.image?.url ?? DEFAULT_OG_IMAGE,
    // Offers: real published prices when the item has a verified pricing table,
    // otherwise $0 (most items are free / open-weight; the $0 offer still
    // unlocks the SoftwareApplication rich result).
    offers: softwareOffers(item),
    keywords: item.tags.join(", "),
  });
}

/** First number in a price string ("$3.00" → 3, "Free"/"$0" → 0). */
function parsePrice(s: string): number {
  const m = s.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

/** Offer(s) for SoftwareApplication JSON-LD: real tiers when priced, else $0. */
function softwareOffers(item: ReleaseItem): unknown {
  if (item.pricing && item.pricing.tiers.length > 0) {
    return item.pricing.tiers.map((t) => ({
      "@type": "Offer",
      price: parsePrice(t.price),
      priceCurrency: "USD",
      description: [t.plan, t.unit, t.note].filter(Boolean).join(" "),
    }));
  }
  return { "@type": "Offer", price: 0, priceCurrency: "USD" };
}

/**
 * Dataset JSON-LD — for release items in the `dataset` category.
 */
function renderJsonLdDataset(item: ReleaseItem): string | null {
  if (!item.categories.includes("dataset")) return null;
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: item.title,
    description: item.explainer?.tagline ?? item.summary,
    url: releaseUrl(item.id),
    creator: { "@type": "Organization", name: item.org, ...(orgUrl(item.org) ? { url: orgUrl(item.org) } : {}) },
    datePublished: item.date,
    keywords: item.tags.join(", "),
    distribution: {
      "@type": "DataDownload",
      contentUrl: item.url,
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
  });
}

/**
 * TechArticle JSON-LD — for paper / algorithm / benchmark items
 * (research-y categories where TechArticle is more accurate than
 * NewsArticle for non-news surfaces).
 */
function renderJsonLdTechArticle(item: ReleaseItem): string | null {
  const techCats: string[] = ["paper", "algorithm", "benchmark", "tutorial"];
  if (!item.categories.some((c) => techCats.includes(c))) return null;
  const url = releaseUrl(item.id);
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: clampHeadline(item.title),
    description: item.explainer?.tagline ?? item.summary,
    url,
    datePublished: item.date,
    author: { "@type": "Organization", name: item.org, ...(orgUrl(item.org) ? { url: orgUrl(item.org) } : {}) },
    publisher: { "@id": `${SITE_URL}/#org` },
    proficiencyLevel: "Expert",
    dependencies: item.tags.join(", "),
  });
}

/**
 * Course / LearningResource JSON-LD — emitted for `tutorial` items so
 * Google Education surfaces can pick them up.
 */
function renderJsonLdCourse(item: ReleaseItem): string | null {
  if (!item.categories.includes("tutorial")) return null;
  const url = releaseUrl(item.id);
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": ["Course", "LearningResource"],
    name: item.title,
    description: item.explainer?.tagline ?? item.summary,
    url,
    provider: { "@type": "Organization", name: item.org },
    educationalLevel: "Advanced",
    learningResourceType: "Tutorial",
    inLanguage: "en",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: "PT1H",
    },
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  });
}

/**
 * HowTo JSON-LD — Google removed the rich result Sept 2023 but the
 * markup remains valid schema.org. Emitted for tutorial items that
 * include an explicit `tryIt` snippet (a single concrete step).
 */
function renderJsonLdHowTo(item: ReleaseItem): string | null {
  if (!item.categories.includes("tutorial")) return null;
  const tryIt = item.explainer?.tryIt;
  if (!tryIt) return null;
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: item.title,
    description: item.explainer?.tagline ?? item.summary,
    step: [
      {
        "@type": "HowToStep",
        name: "Try it",
        text: tryIt,
      },
    ],
  });
}

/**
 * Review JSON-LD — every release IS an editorial review (the explainer
 * block IS the review body). Google's review-snippet rich result
 * supports a fixed list of `itemReviewed` types. We only emit a
 * Review when the item maps cleanly to SoftwareApplication
 * (tool/model) or VideoObject (video) — otherwise the markup
 * produces no rich result and risks being flagged as spam.
 *
 * Rating is derived from editorial `importance`: seismic=5, major=4,
 * notable=3, rumor=2. This is a real editorial signal, not a fake user
 * rating.
 */
function renderJsonLdReview(item: ReleaseItem): string | null {
  const ratings: Record<string, number> = {
    seismic: 5,
    major: 4,
    notable: 3,
    rumor: 2,
  };
  const rating = ratings[item.importance];
  if (!rating) return null;
  const ex = item.explainer;
  if (!ex) return null;

  const primary = item.categories[0];
  const isSoftware = ["tool", "model"].includes(primary) || item.categories.includes("tool");
  const isVideo = item.categories.includes("video");
  if (!isSoftware && !isVideo) return null;

  const itemReviewed = isSoftware
    ? {
        "@type": "SoftwareApplication",
        name: item.title,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
      }
    : {
        "@type": "VideoObject",
        name: item.title,
        description: ex.tagline,
        thumbnailUrl: item.image?.url ?? DEFAULT_OG_IMAGE,
        uploadDate: item.date,
      };

  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed,
    author: { "@type": "Organization", name: "AI/TLDR" },
    publisher: { "@id": `${SITE_URL}/#org` },
    datePublished: item.date,
    reviewBody: `${ex.whatIsIt} ${ex.howItWorks} ${ex.whyItMatters}`.slice(0, 5000),
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: 5,
      worstRating: 1,
    },
  });
}

/**
 * ItemList JSON-LD for the homepage — top N most recent releases. Even
 * though the carousel rich result is restricted to specific verticals,
 * Google still uses ItemList markup to understand list structure and it
 * can surface in "List of …" SERPs.
 */
function renderJsonLdHomeItemList(items: ReleaseItem[]): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest AI Releases",
    description: "Most recent AI model, tool, repo, paper and benchmark releases.",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: releaseUrl(item.id),
      name: item.title,
    })),
  });
}

/**
 * ProfilePage + ItemList JSON-LD for the influencers index page. Each
 * influencer is marked up as a Person with handle, image, sameAs links,
 * and follower count via interactionStatistic.
 */
function renderJsonLdInfluencers(list: Influencer[]): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${INFLUENCERS_URL}#webpage`,
    url: INFLUENCERS_URL,
    name: "Top AI Influencers to Follow",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#org` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: list.length,
      // No interactionStatistic: we deliberately don't publish precise
      // follower counts (zero-hallucination — reach is a coarse band only).
      itemListElement: list.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: p.realName ?? p.name,
          alternateName: p.name,
          identifier: p.handle,
          description: p.bio,
          ...(p.image
            ? {
                image: p.image.startsWith("http")
                  ? p.image
                  : `${SITE_URL}${p.image}`,
              }
            : {}),
          url: p.url,
          sameAs: [p.url, ...(p.links?.map((l) => l.url) ?? [])],
        },
      })),
    },
  });
}

/**
 * BreadcrumbList for release pages. Two levels: Home → release title.
 * (There's no intermediate `/releases` index page — the homepage IS
 * the release listing — so we link straight back to `/`.)
 */
/** FAQPage JSON-LD for a release's sub-question FAQ (only when present).
 *  This is the schema AI answer engines lift for literal follow-up queries
 *  ("X pricing?", "X vs Y?"). The helper existed only for the homepage; this
 *  wires it to release pages, where the launch-day Q&A demand actually is. */
function renderJsonLdReleaseFaq(item: ReleaseItem): string {
  if (!item.faq?.length) return "";
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: item.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

/**
 * Per-category hub copy. Hand-written (NOT templated) so each of the 15
 * `/releases/<cat>/` pages has a distinct H1, <title>, breadcrumb label and
 * intro — a real category index, not 15 boilerplate clones (which would risk
 * the 2026 scaled-content penalty). `crumb` is the short breadcrumb leaf;
 * `title`/`lede` drive the hub's meta + visible intro.
 */
const RELEASE_HUB_COPY: Record<Category, { crumb: string; title: string; lede: string }> = {
  model: {
    crumb: "Models",
    title: "New AI Model Releases — LLMs & Open Weights | AI/TLDR",
    lede: "Every new AI model worth knowing — frontier and open-weight releases, explained in plain English with the context window, parameters and benchmarks that matter.",
  },
  repo: {
    crumb: "Repos",
    title: "New AI GitHub Repos — Trending Open-Source Drops | AI/TLDR",
    lede: "Trending open-source AI projects fresh off GitHub — new repos, libraries and frameworks, with what each one does and why it's picking up stars.",
  },
  tool: {
    crumb: "Tools",
    title: "New AI Tools — Products, CLIs & IDE Features | AI/TLDR",
    lede: "The newest AI tools, products, CLIs and IDE features — what shipped, who it's for, and how to try it tonight, in plain English.",
  },
  security: {
    crumb: "Security",
    title: "AI Security Releases — Red-Teaming & LLM Guardrails | AI/TLDR",
    lede: "New AI and LLM security work — red-teaming tools, guardrails, jailbreak research and defenses, explained for builders who actually ship.",
  },
  algorithm: {
    crumb: "Algorithms",
    title: "New AI Algorithms & Techniques Worth Knowing | AI/TLDR",
    lede: "Named AI techniques and algorithms worth knowing — the methods behind the models, distilled into plain-English explainers.",
  },
  paper: {
    crumb: "Papers",
    title: "New AI Research Papers — arXiv Picks Explained | AI/TLDR",
    lede: "The AI research papers worth your time — handpicked arXiv and conference work, each summarised in plain English with why it matters.",
  },
  dataset: {
    crumb: "Datasets",
    title: "New AI Datasets — Training & Eval Corpora | AI/TLDR",
    lede: "New training and evaluation datasets for AI — fresh corpora and benchmarks, with what's inside each one and how to use it.",
  },
  benchmark: {
    crumb: "Benchmarks",
    title: "New AI Benchmarks & Leaderboards | AI/TLDR",
    lede: "New AI benchmarks, evals and leaderboards — how today's models are measured, and who's actually on top, explained plainly.",
  },
  ecosystem: {
    crumb: "Ecosystem",
    title: "AI Ecosystem News — Governance & Licensing | AI/TLDR",
    lede: "The AI ecosystem moves that matter — governance, foundations, funding, and the license or org changes that reshape who builds what.",
  },
  tutorial: {
    crumb: "Tutorials",
    title: "New AI Tutorials & How-To Guides | AI/TLDR",
    lede: "Hands-on AI tutorials and cookbooks you can follow tonight — guides for building with the latest models and tools, step by step.",
  },
  showcase: {
    crumb: "Showcases",
    title: "AI Showcases — Demos & Shipped Projects | AI/TLDR",
    lede: "The best AI demos and shipped projects — the 'look what I built' moments that show what today's models can actually do.",
  },
  resource: {
    crumb: "Resources",
    title: "AI Resources — Curated Lists & Cheat Sheets | AI/TLDR",
    lede: "Curated AI resources — lists, cheat sheets and learning paths that save you hours of searching, gathered in one place.",
  },
  article: {
    crumb: "Articles",
    title: "AI Articles & Essays from Influential Voices | AI/TLDR",
    lede: "Sharp AI writing worth reading — posts, threads and essays from the people shaping the field, each with a plain-English take.",
  },
  video: {
    crumb: "Videos",
    title: "AI Videos — Talks & Demos from Top Creators | AI/TLDR",
    lede: "The AI videos worth watching — talks, explainers and viral demos from top AI creators, with a quick note on what each covers.",
  },
  rumor: {
    crumb: "Rumors",
    title: "AI Rumors — Credible Speculation, Tracked | AI/TLDR",
    lede: "Credible AI speculation, clearly flagged as rumor — what reliable sources are hinting at before it's official, so you're not blindsided.",
  },
};

/**
 * 3-level BreadcrumbList for release pages: Home → category hub → release.
 * (Previously two levels straight to `/` — the category hub is a real page
 * now, so the trail matches the visible breadcrumb and the URL structure.)
 */
function renderJsonLdBreadcrumb(item: ReleaseItem): string {
  const cat = item.categories[0];
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AI/TLDR",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: RELEASE_HUB_COPY[cat].crumb,
        item: releaseCatUrl(cat),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: releaseUrl(item.id),
      },
    ],
  });
}

function renderMetaBlock(meta: PageMeta): string {
  const rows = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    `<meta name="robots" content="${escapeAttr(meta.robots ?? DEFAULT_ROBOTS)}" />`,
    // Self-referential x-default — single-language site, but the tag keeps
    // Search Console quiet and states the default-language URL explicitly.
    `<link rel="alternate" hreflang="x-default" href="${escapeAttr(meta.canonical)}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="AI/TLDR" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
    `<meta property="og:image" content="${escapeAttr(meta.ogImage)}" />`,
    // Only assert dimensions for our own og-image.png (known 1200×630).
    // Third-party thumbnails have unknown/varied dims — asserting 1200×630
    // there causes social-card cropping. Omit and let scrapers measure.
    meta.ogImage === DEFAULT_OG_IMAGE
      ? `<meta property="og:image:width" content="1200" />`
      : null,
    meta.ogImage === DEFAULT_OG_IMAGE
      ? `<meta property="og:image:height" content="630" />`
      : null,
    meta.ogImageAlt
      ? `<meta property="og:image:alt" content="${escapeAttr(meta.ogImageAlt)}" />`
      : null,
    `<meta property="og:locale" content="en_US" />`,
    meta.publishedTime
      ? `<meta property="article:published_time" content="${escapeAttr(meta.publishedTime)}" />`
      : null,
    meta.author
      ? `<meta property="article:author" content="${escapeAttr(meta.author)}" />`
      : null,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(meta.ogImage)}" />`,
  ].filter((r): r is string => r !== null);
  return rows.join("\n    ");
}

/**
 * Given the built Vite index.html, strip the existing <title> +
 * <meta> + <link rel="canonical"> tags and replace them with ours.
 * Leaves the rest of the document (fonts, scripts, styles, root div)
 * intact so the SPA still boots.
 */
function injectMeta(
  template: string,
  meta: PageMeta,
  extraJsonLd?: string,
): string {
  let html = template;

  // Remove existing title
  html = html.replace(/<title>[^<]*<\/title>\s*/g, "");
  // Remove existing description, canonical, og:*, twitter:*, article:*
  // Match any <meta> tag whose name/property matches these, regardless
  // of attribute order. The content attribute may contain slashes
  // (e.g. "AI/TLDR"), so we can't use [^/]* — match up to the closing
  // `>` with a non-greedy quantifier on non-`>` chars.
  html = html.replace(
    /<meta\s+(?:name|property)="(?:description|twitter:[^"]+|og:[^"]+|article:[^"]+)"[^>]*?>\s*/g,
    "",
  );
  html = html.replace(/<link\s+rel="canonical"[^>]*?>\s*/g, "");
  // Strip the template's default robots meta so renderMetaBlock can emit a
  // per-page directive (default index,follow — or noindex for utility pages)
  // without leaving two conflicting robots tags in the head.
  html = html.replace(/<meta\s+name="robots"[^>]*?>\s*/g, "");
  // Strip the dev-fallback JSON-LD block from the template. Prerender
  // injects a page-specific JSON-LD stack (WebSite+Org for home,
  // CollectionPage for /influencers + /log, Article+Breadcrumb for each
  // release) so each page carries exactly the schema that matches its
  // content instead of sharing the dev WebSite fallback.
  html = html.replace(
    /<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/g,
    "",
  );
  // Clean up the "<!-- Canonical -->", "<!-- Open Graph -->", and
  // "<!-- Twitter Card -->" section comments so the resulting head
  // isn't littered with empty labels.
  html = html.replace(/<!--\s*(?:Canonical|Open Graph|Twitter Card)\s*-->\s*/g, "");
  // Drop empty HTML comments left over from the meta tags that were
  // commented out in the source template (`<!-- -->`).
  html = html.replace(/<!--\s*-->\s*/g, "");

  // Inject our block right after <meta name="viewport" ...>. Use a
  // function replacement, NOT a string replacement, because `block`
  // contains user-supplied content (titles, taglines, descriptions)
  // that may include `$` — `String.replace` interprets `$&`, `$1`,
  // `$'`, `$\`` etc. in the replacement string and would otherwise
  // splice the wrong text into the page.
  const block = renderMetaBlock(meta);
  html = html.replace(
    /<meta\s+name="viewport"[^>]*?>/,
    (m) => `${m}\n    ${block}`,
  );

  // Inject the page-specific JSON-LD stack just before </head>. Same
  // `$`-escaping pitfall — use a function replacement so user content
  // in the JSON-LD body can't hijack the result.
  if (extraJsonLd) {
    html = html.replace("</head>", () => `  ${extraJsonLd}\n  </head>`);
  }

  return html;
}

// -----------------------------------------------------------------------
// Per-item meta builders
// -----------------------------------------------------------------------

/**
 * Build a release page's `<title>`, aiming to stay under 60 characters
 * so Google doesn't silently truncate the brand suffix. Priority order:
 *   1. `${title} — ${org} | AI/TLDR`  (ideal)
 *   2. `${title} | AI/TLDR`            (drop org)
 *   3. `${title}`                      (title alone; release names
 *       longer than 60 chars will still wrap in SERPs, but at least
 *       we don't waste a truncated brand suffix)
 */
function buildReleaseTitle(item: ReleaseItem): string {
  const brand = " | AI/TLDR";
  const withOrg = `${item.title} — ${item.org}${brand}`;
  if (withOrg.length <= 60) return withOrg;
  const withoutOrg = `${item.title}${brand}`;
  if (withoutOrg.length <= 60) return withoutOrg;
  // Title alone exceeds the SERP budget. Truncate the title on a word
  // boundary so the brand suffix STILL fits in ~60 chars — previously we
  // shipped a 100+ char bare title with no brand (92% of pages), which
  // truncates mid-phrase in SERPs and reinforces no brand.
  const budget = 60 - brand.length - 1; // room for "…" + brand
  const cut = item.title.slice(0, budget);
  const lastSpace = cut.lastIndexOf(" ");
  const truncated = (lastSpace > budget * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return `${truncated}…${brand}`;
}

function releaseMeta(item: ReleaseItem): PageMeta {
  const tagline = item.explainer?.tagline ?? item.summary;
  // Use the snippet budget (~120–155 chars). A short tagline wastes it,
  // so append the summary when it adds new information; then clamp.
  let description = tagline;
  if (description.length < 120 && item.summary && item.summary !== tagline) {
    description = `${tagline} ${item.summary}`;
  }
  description = description.length > 155
    ? description.slice(0, 152).trimEnd() + "…"
    : description;

  return {
    title: buildReleaseTitle(item),
    description,
    canonical: releaseUrl(item.id),
    ogType: "article",
    ogImage: item.image?.url ?? DEFAULT_OG_IMAGE,
    ogImageAlt: item.image?.alt,
    publishedTime: item.date,
    author: item.org,
  };
}

// -----------------------------------------------------------------------
// Release page body — crawlable static content injected into #root
// -----------------------------------------------------------------------
//
// Until now every /releases/<id> page shipped an EMPTY #root: full
// JSON-LD but no visible body, so crawlers (and no-JS users) saw nothing
// but shared boilerplate. The SPA mounts with createRoot().render(),
// which REPLACES #root wholesale on boot, so we can inject any static
// HTML here with zero hydration risk (same pattern the Learn section
// uses). This gives each page unique, indexable text that backs up its
// structured data.

const RELEASE_BODY_STYLE = `<style data-rls-css>
      .rls-main{max-width:760px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif;color:#cfcfcf}
      .rls-crumbs{font-size:13px;color:#888;margin:0 0 8px}
      .rls-crumbs a{color:#9ab}
      .rls-kicker{font-size:12px;color:#9a9a9a;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}
      .rls-article h1{font-size:30px;line-height:1.22;color:#fff;margin:6px 0 14px}
      .rls-article h2{font-size:18px;color:#fff;margin:26px 0 8px}
      .rls-article p{line-height:1.6;margin:0 0 12px}
      .rls-summary{font-size:18px;color:#e8e8e8}
      .rls-tagline{font-style:italic;color:#bdbdbd}
      .rls-figure{margin:16px 0}
      .rls-img{max-width:100%;height:auto;border-radius:10px;border:1px solid #1e1e1e;display:block}
      .rls-img-credit{font-size:12px;color:#7f7f7f;margin:6px 0 0}
      .rls-metrics{padding-left:18px}
      .rls-links{list-style:none;padding:0;margin:6px 0}
      .rls-links li{border-bottom:1px solid #1e1e1e}
      .rls-links a{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;padding:9px 0;text-decoration:none}
      .rls-src-num{color:#7f7f7f;font-variant-numeric:tabular-nums;font-size:13px}
      .rls-src-label{color:#7db3ff;font-weight:500;overflow-wrap:anywhere}
      .rls-src-host{color:#8a8a85;font-size:12px;margin-left:auto;overflow-wrap:anywhere}
      .rls-tags{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px}
      .rls-tags li{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:999px;padding:3px 10px;font-size:12px;color:#bbb}
      .rls-article a{color:#7db3ff}
      .rls-qf,.rls-spec{border-collapse:collapse;width:100%;margin:6px 0 8px;font-size:14px}
      .rls-qf th,.rls-spec th{text-align:left;color:#9a9a9a;font-weight:600;padding:7px 12px 7px 0;vertical-align:top;white-space:nowrap;border-bottom:1px solid #1e1e1e}
      .rls-qf td,.rls-spec td{color:#e8e8e8;padding:7px 0;border-bottom:1px solid #1e1e1e;overflow-wrap:anywhere}
      .rls-faq dt{color:#fff;font-weight:600;margin:14px 0 4px}
      .rls-faq dd{margin:0;color:#cfcfcf;line-height:1.6}
      .rls-back{margin-top:28px}
      .rls-body pre{background:#111;border:1px solid #222;border-radius:8px;padding:12px;overflow:auto}
      .rls-feed{list-style:none;padding:0;margin:24px 0 0}
      .rls-feed-item{border-top:1px solid #1e1e1e;padding:16px 0}
      .rls-feed-item a{color:#fff;text-decoration:none;font-size:18px}
      .rls-feed-meta{display:block;font-size:12px;color:#9a9a9a;margin:4px 0}
      .rls-feed-item p{margin:6px 0 0;color:#bbb;font-size:14px}
      .rls-related{margin-top:28px;border-top:1px solid #1e1e1e;padding-top:8px}
      .rls-bench{margin:0 0 16px}
      .rls-bench-h{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}
      .rls-bench-table{border-collapse:collapse;width:100%;font-size:13px}
      .rls-bench-table tr{border-bottom:1px solid #1e1e1e}
      .rls-bench-name{text-align:left;color:#9a9a9a;font-weight:600;white-space:nowrap;padding:6px 12px 6px 0;width:1%;overflow-wrap:anywhere}
      .rls-bench-bar{width:100%;padding:6px 10px}
      .rls-bar{display:block;height:11px;min-width:2px;background:#2a2a2a}
      .rls-bench-val{text-align:right;font-family:'JetBrains Mono',monospace;color:#e8e8e8;white-space:nowrap;padding:6px 0}
      .rls-bench-hl .rls-bench-name{color:#fff}
      .rls-bench-hl .rls-bar{background:#f7ff00}
      .rls-bench-hl .rls-bench-val{color:#f7ff00}
      .rls-bench-src{display:inline-block;margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#9a9a9a}
      .rls-price-table{border-collapse:collapse;width:100%;font-size:14px;margin:6px 0}
      .rls-price-table th{text-align:left;color:#e8e8e8;font-weight:600;padding:7px 12px 7px 0;border-bottom:1px solid #1e1e1e;overflow-wrap:anywhere}
      .rls-price-table td{text-align:right;padding:7px 0;border-bottom:1px solid #1e1e1e;white-space:nowrap}
      .rls-price-amt{font-family:'JetBrains Mono',monospace;font-weight:700;color:#f7ff00}
      .rls-price-unit,.rls-price-note{color:#9a9a9a;font-size:12px;font-weight:400}
    </style>`;

/** Section whose body is already escaped/linkified HTML (entity-linked prose). */
function sectionHtml(label: string, innerHtml: string): string {
  if (!innerHtml) return "";
  return `<section><h2>${escapeText(label)}</h2><p>${innerHtml}</p></section>`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** An entity (landscape tool OR registry model) eligible for in-prose linking,
 *  carrying its own destination href + a unique key for first-mention dedup. */
type LinkEntity = { name: string; key: string; href: string };

/**
 * Linkify the FIRST mention of each high-confidence entity in a prose string to
 * its evergreen page — a landscape tool (`/learn/landscape/<slug>`) or a
 * registry model (`/models/<slug>/`). Operates on RAW text and escapes every
 * segment as it builds, so it can never split an HTML tag.
 *
 * Conservative on purpose (avoids the false-positive trap of free-text entity
 * linking over 500+ names — "Continue", "Cursor", "Jan" are real English words
 * too): callers pass ONLY entities that `matchedTools()` / `matchedModels()`
 * already matched in this release's title/tags, so we know the page is genuinely
 * about them. The shared `used` set enforces first-mention-only across the page.
 */
function linkifyEntities(
  text: string,
  entities: LinkEntity[],
  used: Set<string>,
): string {
  if (!text) return "";
  // earliest not-yet-linked whole-word entity match in this string
  let best: { idx: number; len: number; href: string; key: string } | null = null;
  for (const e of entities) {
    if (used.has(e.key) || e.name.length < 3) continue;
    const re = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(e.name)}(?![A-Za-z0-9])`, "i");
    const m = re.exec(text);
    if (m && (best === null || m.index < best.idx)) {
      best = { idx: m.index, len: m[0].length, href: e.href, key: e.key };
    }
  }
  if (!best) return escapeText(text);
  used.add(best.key);
  const before = text.slice(0, best.idx);
  const matched = text.slice(best.idx, best.idx + best.len);
  const after = text.slice(best.idx + best.len);
  return (
    escapeText(before) +
    `<a href="${escapeAttr(best.href)}">${escapeText(matched)}</a>` +
    linkifyEntities(after, entities, used) // keep linking other entities
  );
}

/**
 * Related releases for crawl-depth + co-citation: until now every release
 * page only linked back to `/`, making each a dead-end reachable only from
 * the homepage or the sitemap. Score other items by shared org (3), shared
 * primary category (2), and shared tags (≤2), newest-first as the tiebreak.
 */
function relatedReleases(item: ReleaseItem, all: ReleaseItem[]): ReleaseItem[] {
  const primary = item.categories[0];
  return all
    .filter((x) => x.id !== item.id)
    .map((x) => {
      let score = 0;
      if (x.org === item.org) score += 3;
      if (x.categories[0] === primary) score += 2;
      score += Math.min(x.tags.filter((t) => item.tags.includes(t)).length, 2);
      return { x, score };
    })
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(b.x.publishDate ?? b.x.date).localeCompare(String(a.x.publishDate ?? a.x.date)),
    )
    .slice(0, 6)
    .map((s) => s.x);
}

function renderRelatedSection(item: ReleaseItem, all: ReleaseItem[]): string {
  const related = relatedReleases(item, all);
  if (!related.length) return "";
  const links = related
    .map(
      (r) =>
        `<li class="rls-feed-item"><a href="${escapeAttr(`/releases/${r.id}/`)}">` +
        `<strong>${escapeText(r.title)}</strong></a>` +
        `<span class="rls-feed-meta">${escapeText(r.org)} · ${escapeText(r.date)} · ${escapeText(r.categories[0])}</span></li>`,
    )
    .join("");
  return `<nav class="rls-related" aria-label="Related releases"><h2>Related releases</h2><ul class="rls-feed">${links}</ul></nav>`;
}

/** Landscape tool pages whose tool name is named (as a whole word) in this
 *  release's title or tags — relevant evergreen links from a fresh page. */
function matchedTools(item: ReleaseItem): { name: string; slug: string }[] {
  const hay = ` ${item.title} ${item.tags.join(" ")} `.toLowerCase();
  const boundary = (ch: string | undefined) => ch === undefined || !/[a-z0-9]/.test(ch);
  const out: { name: string; slug: string }[] = [];
  for (const tool of LANDSCAPE_TOOLS) {
    const n = tool.name.toLowerCase();
    if (n.length < 3) continue; // skip 1-2 char names ("ML") to avoid noise
    const idx = hay.indexOf(n);
    if (idx === -1) continue;
    if (boundary(hay[idx - 1]) && boundary(hay[idx + n.length])) {
      out.push(tool);
      if (out.length >= 3) break;
    }
  }
  return out;
}

/** Registry models NAMED (as a whole word) in this release's title or tags —
 *  e.g. a "GPT-5.5" release links to /models/gpt-5-5/. Model names are highly
 *  distinctive ("Claude Opus 4.8", "Llama 4 Maverick"), so false-positive risk
 *  is far lower than for tool names; still whole-word + capped for safety. */
function matchedModels(item: ReleaseItem): { name: string; slug: string }[] {
  const hay = ` ${item.title} ${item.tags.join(" ")} `.toLowerCase();
  const boundary = (ch: string | undefined) => ch === undefined || !/[a-z0-9]/.test(ch);
  const out: { name: string; slug: string }[] = [];
  for (const model of LLM_MODELS) {
    const n = model.name.toLowerCase();
    if (n.length < 3) continue;
    const idx = hay.indexOf(n);
    if (idx === -1) continue;
    if (boundary(hay[idx - 1]) && boundary(hay[idx + n.length])) {
      out.push(model);
      if (out.length >= 3) break;
    }
  }
  return out;
}

/** Combined in-prose link entities for a release: matched landscape tools
 *  (→ /learn/landscape/<slug>) + matched registry models (→ /models/<slug>/).
 *  Keys are namespaced so a tool and a model can't collide in the `used` set. */
function releaseLinkEntities(item: ReleaseItem): LinkEntity[] {
  return [
    ...matchedTools(item).map((t) => ({
      name: t.name,
      key: `tool:${t.slug}`,
      href: `/learn/landscape/${t.slug}`,
    })),
    ...matchedModels(item).map((m) => ({
      name: m.name,
      key: `model:${m.slug}`,
      href: modelPath(m.slug),
    })),
  ];
}

/**
 * Cross-link a release page INTO the evergreen silos (Learn, landscape,
 * /stats). Releases were near crawl dead-ends — reachable only from home or
 * the sitemap, and passing no link equity to the high-authority evergreen
 * pages. Matched tool + model links add topical relevance; the always-on links
 * use varied, descriptive anchors (anchor variety beats one templated keyword).
 */
function renderLearnCrossLinks(item: ReleaseItem): string {
  const toolLinks = matchedTools(item)
    .map(
      (t) =>
        `<li><a href="/learn/landscape/${escapeAttr(t.slug)}">${escapeText(t.name)} — overview &amp; getting started</a></li>`,
    )
    .join("");
  const modelLinks = matchedModels(item)
    .map(
      (m) =>
        `<li><a href="${escapeAttr(modelPath(m.slug))}">${escapeText(m.name)} — specs, benchmarks &amp; pricing</a></li>`,
    )
    .join("");
  const evergreen =
    `<li><a href="/learn/">Learn AI — a plain-English encyclopedia</a></li>` +
    `<li><a href="/learn/landscape/">The open-source AI landscape</a></li>` +
    `<li><a href="/models/">The LLM registry — compare AI models</a></li>` +
    `<li><a href="/stats/">AI Release Index — live release stats</a></li>`;
  return (
    `<nav class="rls-related" aria-label="Learn more on AI/TLDR">` +
    `<h2>Learn more on AI/TLDR</h2>` +
    `<ul class="rls-links">${modelLinks}${toolLinks}${evergreen}</ul></nav>`
  );
}

function renderReleaseBody(item: ReleaseItem, allItems: ReleaseItem[]): string {
  const ex = item.explainer;
  const img = item.image;
  // Spec bar — same normalizer the modal uses, so the prerendered page and
  // the live React modal surface the SAME deduped, cleanly-labeled metrics.
  // A labeled <table> (not a camelCase `<ul>`) is what AI engines lift.
  const specs = normalizeMetrics(item.metrics);
  const specRows = specs
    .map(
      (s) =>
        `<tr><th scope="row">${escapeText(s.label)}</th><td>${escapeText(s.value)}</td></tr>`,
    )
    .join("");
  // Sources — numbered, with the visible outlet domain, mirroring the modal.
  // Drop rel="nofollow": every link is a web-VERIFIED primary source (the
  // zero-hallucination sweep checks each URL), so citing it dofollow is the
  // honest signal — and a trust/provenance cue AI answer engines reward.
  const links =
    item.links && item.links.length > 0
      ? item.links
      : [{ label: "Source", url: item.url }];
  const outlets = new Set(links.map((l) => hostOf(l.url))).size;
  const linkRows = links
    .map(
      (l, i) =>
        `<li><a href="${escapeAttr(l.url)}" rel="noopener">` +
        `<span class="rls-src-num">[${i + 1}]</span> ` +
        `<span class="rls-src-label">${escapeText(l.label)}</span> ` +
        `<span class="rls-src-host">${escapeText(hostOf(l.url))}</span></a></li>`,
    )
    .join("");
  const tagRows = item.tags.map((t) => `<li>${escapeText(t)}</li>`).join("");
  // Labeled facts table — AI engines lift a labeled table far more readily
  // than the same facts in prose.
  const quickFactRows = (item.quickFacts ?? [])
    .map(
      (f) =>
        `<tr><th scope="row">${escapeText(f.label)}</th><td>${escapeText(f.value)}</td></tr>`,
    )
    .join("");
  // Sub-question FAQ as a visible <dl> (matched by the FAQPage JSON-LD).
  const faqItems = (item.faq ?? [])
    .map((f) => `<dt>${escapeText(f.q)}</dt><dd>${escapeText(f.a)}</dd>`)
    .join("");

  // Benchmark comparison bars (CSS-width, no SVG) — mirrors the modal. A
  // labeled table + visible source = an extractable, citable comparison.
  const benchHtml = (item.benchmarks ?? [])
    .map((b) => {
      const max = b.max ?? 100;
      const unit = b.unit ?? "%";
      const rows = b.results
        .map((r) => {
          const w = Math.min(100, Math.max(0, (r.score / max) * 100));
          return (
            `<tr class="${r.highlight ? "rls-bench-hl" : ""}">` +
            `<th scope="row" class="rls-bench-name">${escapeText(r.name)}</th>` +
            `<td class="rls-bench-bar"><span class="rls-bar" style="width:${w.toFixed(1)}%"></span></td>` +
            `<td class="rls-bench-val">${escapeText(String(r.score))}${escapeText(unit)}</td></tr>`
          );
        })
        .join("");
      return (
        `<figure class="rls-bench"><figcaption class="rls-bench-h">${escapeText(b.name)}</figcaption>` +
        `<table class="rls-bench-table"><tbody>${rows}</tbody></table>` +
        `<a class="rls-bench-src" href="${escapeAttr(b.source)}" rel="noopener">source ↗</a></figure>`
      );
    })
    .join("");
  // Pricing table — mirrors the modal; "<X> pricing" is a top-intent query.
  const pricingRows =
    item.pricing && item.pricing.tiers.length > 0
      ? item.pricing.tiers
          .map(
            (t) =>
              `<tr><th scope="row">${escapeText(t.plan)}` +
              (t.note ? ` <span class="rls-price-note">· ${escapeText(t.note)}</span>` : "") +
              `</th><td><span class="rls-price-amt">${escapeText(t.price)}</span>` +
              (t.unit ? ` <span class="rls-price-unit">${escapeText(t.unit)}</span>` : "") +
              `</td></tr>`,
          )
          .join("")
      : "";

  // Inline entity links: first mention of each tool/model this release is
  // genuinely about (matched in its title/tags) → its evergreen landscape or
  // /models page. `used` enforces first-mention-only across the whole body.
  // Contextual in-prose links beat a footer list for crawl-depth + entity
  // association (a release naming "GPT-5.5" links straight to /models/gpt-5-5/).
  const entities = releaseLinkEntities(item);
  const usedLinks = new Set<string>();
  const prose = (t?: string) => (t ? linkifyEntities(t, entities, usedLinks) : "");

  const cat = item.categories[0];

  return (
    `<div class="page rls-body"><header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a></header>` +
    `<main class="rls-main"><article class="rls-article">` +
    `<nav class="rls-crumbs" aria-label="Breadcrumb"><a href="/">AI/TLDR</a> › ` +
    `<a href="${escapeAttr(`/releases/${cat}/`)}">${escapeText(RELEASE_HUB_COPY[cat].crumb)}</a> › ` +
    `<span>${escapeText(item.title)}</span></nav>` +
    `<p class="rls-kicker">${escapeText(item.org)} · ${escapeText(item.date)} · ${escapeText(item.importance)}</p>` +
    `<h1>${escapeText(item.title)}</h1>` +
    `<p class="rls-summary">${prose(item.summary)}</p>` +
    (img
      ? `<figure class="rls-figure"><img class="rls-img" src="${escapeAttr(img.url)}" alt="${escapeAttr(img.alt ?? item.title)}" loading="lazy" />` +
        (img.credit ? `<figcaption class="rls-img-credit">${escapeText(img.credit)}</figcaption>` : "") +
        `</figure>`
      : "") +
    (ex?.tagline ? `<p class="rls-tagline">${escapeText(ex.tagline)}</p>` : "") +
    (specRows
      ? `<section class="rls-specs"><h2>Key specs</h2>` +
        `<table class="rls-spec"><tbody>${specRows}</tbody></table></section>`
      : "") +
    (quickFactRows
      ? `<section class="rls-quickfacts"><h2>Quick facts</h2>` +
        `<table class="rls-qf"><tbody>${quickFactRows}</tbody></table></section>`
      : "") +
    (benchHtml ? `<section class="rls-benchmarks"><h2>Benchmarks</h2>${benchHtml}</section>` : "") +
    (pricingRows
      ? `<section class="rls-pricing"><h2>Pricing</h2>` +
        `<table class="rls-price-table"><tbody>${pricingRows}</tbody></table>` +
        `<a class="rls-bench-src" href="${escapeAttr(item.pricing!.source)}" rel="noopener">source ↗</a></section>`
      : "") +
    sectionHtml("What is it?", prose(ex?.whatIsIt)) +
    sectionHtml("How does it work?", prose(ex?.howItWorks)) +
    sectionHtml("Why does it matter?", prose(ex?.whyItMatters)) +
    sectionHtml("Who is it for?", prose(ex?.forWho)) +
    (faqItems
      ? `<section class="rls-faq"><h2>Frequently asked questions</h2><dl>${faqItems}</dl></section>`
      : "") +
    (ex?.tryIt
      ? `<section><h2>Try it</h2><pre><code>${escapeText(ex.tryIt)}</code></pre></section>`
      : "") +
    (linkRows
      ? `<section class="rls-sources"><h2>Sources${outlets >= 2 ? ` · ${outlets} outlets` : ""}</h2>` +
        `<ul class="rls-links">${linkRows}</ul></section>`
      : "") +
    (tagRows ? `<section><h2>Tags</h2><ul class="rls-tags">${tagRows}</ul></section>` : "") +
    renderRelatedSection(item, allItems) +
    renderLearnCrossLinks(item) +
    `<p class="rls-back"><a href="/">← All releases</a> · <a href="/learn/">Learn AI</a></p>` +
    `</article></main></div>`
  );
}

/** Inline the release body styles and fill the empty #root with the
 *  crawlable article. Function replacements throughout: release content
 *  can contain `$`, which String.replace would otherwise interpret. */
function injectReleaseBody(
  html: string,
  item: ReleaseItem,
  allItems: ReleaseItem[],
): string {
  html = html.replace("</head>", () => `  ${RELEASE_BODY_STYLE}\n  </head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${renderReleaseBody(item, allItems)}</div>`,
  );
  return html;
}

// -----------------------------------------------------------------------
// Category hub pages — /releases/<cat>/
// -----------------------------------------------------------------------
//
// A crawlable index per primary category. Each release now has a real
// internal link from a topical hub (not just the homepage/sitemap), the
// 3-level breadcrumb resolves to a live page, and the hub itself is a
// keyword-targeted landing page ("new AI models", "new AI tools", …).

/** Clean H1 for a hub — the meta <title> minus the " | AI/TLDR" suffix. */
function hubH1(cat: Category): string {
  return RELEASE_HUB_COPY[cat].title.replace(/\s*\|\s*AI\/TLDR\s*$/, "");
}

/** Releases whose PRIMARY category is `cat`, newest-first. */
function releasesInCategory(cat: Category, all: ReleaseItem[]): ReleaseItem[] {
  return all
    .filter((x) => x.categories[0] === cat)
    .sort((a, b) =>
      String(b.publishDate ?? b.date).localeCompare(String(a.publishDate ?? a.date)),
    );
}

function hubMeta(cat: Category): PageMeta {
  const copy = RELEASE_HUB_COPY[cat];
  const description =
    copy.lede.length > 155 ? copy.lede.slice(0, 152).trimEnd() + "…" : copy.lede;
  return {
    title: copy.title,
    description,
    canonical: releaseCatUrl(cat),
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: `${hubH1(cat)} — AI/TLDR`,
  };
}

/** BreadcrumbList for a hub: Home → category. */
function renderJsonLdHubBreadcrumb(cat: Category): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AI/TLDR", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: RELEASE_HUB_COPY[cat].crumb,
        item: releaseCatUrl(cat),
      },
    ],
  });
}

/** ItemList of the hub's releases (capped — Google reads ~the first 50). */
function renderJsonLdHubItemList(cat: Category, inCat: ReleaseItem[]): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: hubH1(cat),
    numberOfItems: inCat.length,
    itemListElement: inCat.slice(0, 50).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: releaseUrl(r.id),
      name: r.title,
    })),
  });
}

/** Crawlable hub body: intro + newest-first release list + sibling-hub nav. */
function renderHubBody(cat: Category, all: ReleaseItem[], hubCats: Category[]): string {
  const copy = RELEASE_HUB_COPY[cat];
  const inCat = releasesInCategory(cat, all);
  // Cap the on-page list so a 180-item hub doesn't balloon page weight; the
  // sitemap still carries every release URL, so nothing is lost to crawlers.
  const HUB_CAP = 120;
  const shown = inCat.slice(0, HUB_CAP);
  const overflow = inCat.length - shown.length;
  const listItems = shown
    .map(
      (r) =>
        `<li class="rls-feed-item"><a href="${escapeAttr(`/releases/${r.id}/`)}">` +
        `<strong>${escapeText(r.title)}</strong></a>` +
        `<span class="rls-feed-meta">${escapeText(r.org)} · ${escapeText(r.date)} · ${escapeText(r.importance)}</span>` +
        `<p>${escapeText(r.explainer?.tagline ?? r.summary)}</p></li>`,
    )
    .join("");
  const siblings = hubCats
    .filter((c) => c !== cat)
    .map(
      (c) =>
        `<li><a href="${escapeAttr(`/releases/${c}/`)}">${escapeText(RELEASE_HUB_COPY[c].crumb)}</a></li>`,
    )
    .join("");

  return (
    `<div class="page rls-body"><header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a></header>` +
    `<main class="rls-main"><article class="rls-article">` +
    `<nav class="rls-crumbs" aria-label="Breadcrumb"><a href="/">AI/TLDR</a> › ` +
    `<span>${escapeText(copy.crumb)}</span></nav>` +
    `<h1>${escapeText(hubH1(cat))}</h1>` +
    `<p class="rls-summary">${escapeText(copy.lede)}</p>` +
    `<p class="rls-kicker">${inCat.length} ${inCat.length === 1 ? "release" : "releases"} tracked</p>` +
    `<ul class="rls-feed">${listItems}</ul>` +
    (overflow > 0
      ? `<p class="rls-kicker">+ ${overflow} more in the <a href="/sitemap.xml">sitemap</a>.</p>`
      : "") +
    `<nav class="rls-related" aria-label="Browse by category"><h2>Browse other categories</h2>` +
    `<ul class="rls-links">${siblings}</ul></nav>` +
    `<p class="rls-back"><a href="/">← All releases</a> · <a href="/learn/">Learn AI</a></p>` +
    `</article></main></div>`
  );
}

function injectHubBody(
  html: string,
  cat: Category,
  all: ReleaseItem[],
  hubCats: Category[],
): string {
  html = html.replace("</head>", () => `  ${RELEASE_BODY_STYLE}\n  </head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${renderHubBody(cat, all, hubCats)}</div>`,
  );
  return html;
}

/** Crawlable latest-releases list for the homepage #root. The homepage
 *  carried ItemList JSON-LD but no visible links to any release page, so
 *  the only internal-link path to the 725 release pages was the sitemap.
 *  This emits real anchors (the strongest discovery signal). React
 *  replaces #root on mount, so JS users still get the live feed. */
/** "A", "A and B", or "A, B and C". */
function listJoin(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Extractable "answer capsule" for the homepage: a question heading + a
 * single self-contained paragraph an AI engine can lift whole to answer
 * "what AI shipped today / latest AI releases". Every number is real
 * (counted from the feed at build time), names the entity instead of "it",
 * and states the 2h freshness — our strongest, most-citable fact. Rendered
 * inside the prerendered #root, so JS-less AI crawlers read it.
 */
function renderHomeAnswerBlock(items: ReleaseItem[]): string {
  const sorted = [...items].sort((a, b) =>
    String(b.publishDate ?? b.date).localeCompare(String(a.publishDate ?? a.date)),
  );
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const n = sorted.filter((it) => {
    const t = Date.parse(it.publishDate ?? it.date);
    return Number.isFinite(t) && t >= dayAgo;
  }).length;
  const names = sorted.slice(0, 3).map((it) => escapeText(it.title));
  const lead =
    n > 0
      ? `In the last 24 hours AI/TLDR tracked ${n} new AI release${n === 1 ? "" : "s"}`
      : `AI/TLDR tracks new AI releases as they ship`;
  const examples = names.length ? `, including ${listJoin(names)}` : "";
  return (
    `<section class="rls-answer"><h2>What AI shipped today?</h2>` +
    `<p>${lead}${examples}. AI/TLDR is an AI release tracker that follows new AI ` +
    `models, open-source tools, papers, datasets and benchmarks — refreshed every ` +
    `2 hours from verified primary sources and explained in plain English.</p></section>`
  );
}

function renderHomeBody(items: ReleaseItem[]): string {
  // Cap the crawlable list at 40: link-equity per outbound link thins out
  // past ~45-50 links on a page (Zyppy), and React replaces #root on mount
  // so JS users still get the full live feed.
  const recent = [...items]
    .sort((a, b) =>
      String(b.publishDate ?? b.date).localeCompare(String(a.publishDate ?? a.date)),
    )
    .slice(0, 40);
  const cards = recent
    .map(
      (it) =>
        `<li class="rls-feed-item"><a href="${escapeAttr(`/releases/${it.id}/`)}">` +
        `<strong>${escapeText(it.title)}</strong></a>` +
        `<span class="rls-feed-meta">${escapeText(it.org)} · ${escapeText(it.date)} · ${escapeText(it.categories[0])}</span>` +
        `<p>${escapeText(it.summary)}</p></li>`,
    )
    .join("");
  return (
    `<div class="page rls-body"><header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a></header>` +
    `<main class="rls-main">` +
    `<h1>AI/TLDR — every new AI model, tool, repo &amp; paper</h1>` +
    `<p class="rls-summary">The latest AI releases, refreshed every 2 hours and explained in plain English.</p>` +
    renderHomeAnswerBlock(items) +
    `<p><a href="/stats/">AI Release Index — live stats on AI releases</a> · <a href="/learn/">Learn AI</a></p>` +
    `<ul class="rls-feed">${cards}</ul>` +
    `</main></div>`
  );
}

function injectHomeBody(html: string, items: ReleaseItem[]): string {
  html = html.replace("</head>", () => `  ${RELEASE_BODY_STYLE}\n  </head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${renderHomeBody(items)}</div>`,
  );
  return html;
}

interface SweepReportLite {
  timestamp?: string;
  source?: string;
  summary?: string;
  added?: { id?: string; title?: string }[];
}

/** Crawlable changelog body for /log (was an empty #root at sitemap
 *  priority 0.7/daily — Google recrawling nothing). Newest sweep first. */
function renderLogBody(reports: SweepReportLite[]): string {
  const recent = reports.slice(-50).reverse();
  const rows = recent
    .map((r) => {
      const added = (r.added ?? [])
        .map((a) => (a.title ? `<li>${escapeText(a.title)}</li>` : ""))
        .filter(Boolean)
        .join("");
      const when = (r.timestamp ?? "").slice(0, 16).replace("T", " ");
      return (
        `<section><h2>${escapeText(when)} · ${escapeText(r.source ?? "")}</h2>` +
        (r.summary ? `<p>${escapeText(r.summary)}</p>` : "") +
        (added ? `<ul class="rls-links">${added}</ul>` : "") +
        `</section>`
      );
    })
    .join("");
  return (
    `<div class="page rls-body"><header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a></header>` +
    `<main class="rls-main"><article class="rls-article">` +
    `<nav class="rls-crumbs" aria-label="Breadcrumb"><a href="/">AI/TLDR</a> › <span>Changelog</span></nav>` +
    `<h1>AI Release Changelog</h1>` +
    `<p class="rls-summary">Every automated sweep that refreshed the AI/TLDR feed, newest first.</p>` +
    rows +
    `<p class="rls-back"><a href="/">← All releases</a></p>` +
    `</article></main></div>`
  );
}

function injectLogBody(html: string, reports: SweepReportLite[]): string {
  html = html.replace("</head>", () => `  ${RELEASE_BODY_STYLE}\n  </head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${renderLogBody(reports)}</div>`,
  );
  return html;
}

/** Crawlable, role-grouped influencer directory for /influencers (the #root
 *  was previously empty — only JSON-LD, nothing for crawlers to read or for
 *  the Person markup to match against). React replaces this on hydration. */
function renderInfluencersBody(list: Influencer[]): string {
  const sections = CATEGORY_ORDER.map((cat) => {
    const people = list.filter((p) => p.category === cat);
    if (!people.length) return "";
    const items = people
      .map((p) => {
        const reach = p.reach ? ` · ${REACH_LABEL[p.reach]}` : "";
        const real = p.realName ? ` — ${escapeText(p.realName)}` : "";
        const secondary = (p.links ?? [])
          .map(
            (l) =>
              `<a href="${escapeAttr(l.url)}" rel="noopener">${escapeText(
                PLATFORM_META[l.platform].label,
              )}</a>`,
          )
          .join(" · ");
        return (
          `<li><a href="${escapeAttr(p.url)}" rel="noopener">` +
          `<strong>${escapeText(p.name)}</strong></a>${real} ` +
          `<span class="inf-x-meta">@${escapeText(p.handle)} · ${escapeText(
            PLATFORM_META[p.platform].label,
          )}${reach}</span>` +
          `<p>${escapeText(p.bio)}</p>` +
          (secondary ? `<p class="rls-links">${secondary}</p>` : "") +
          `</li>`
        );
      })
      .join("");
    return (
      `<section><h2>${escapeText(CATEGORY_META[cat].label)}</h2>` +
      `<p>${escapeText(CATEGORY_META[cat].blurb)}</p>` +
      `<ul class="inf-x-list">${items}</ul></section>`
    );
  }).join("");
  return (
    `<div class="page rls-body"><header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a></header>` +
    `<main class="rls-main"><article class="rls-article">` +
    `<nav class="rls-crumbs" aria-label="Breadcrumb"><a href="/">AI/TLDR</a> › <span>Influencers</span></nav>` +
    `<h1>Top AI Influencers to Follow</h1>` +
    `<p class="rls-summary">${escapeText(
      `${list.length} AI people worth following, grouped by what they actually do.`,
    )}</p>` +
    sections +
    `<p class="rls-back"><a href="/">← All releases</a></p>` +
    `</article></main></div>`
  );
}

function injectInfluencersBody(html: string, list: Influencer[]): string {
  html = html.replace("</head>", () => `  ${RELEASE_BODY_STYLE}\n  </head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${renderInfluencersBody(list)}</div>`,
  );
  return html;
}

/** Crawlable AI Release Index body — renders the real StatsPage component to
 *  static markup (styled by the bundled CSS link in the template), wrapped in
 *  the brand-header shell. React replaces #root wholesale on mount. */
function renderStatsRoot(): string {
  const body = renderToStaticMarkup(
    createElement(StatsPage, { data: statsData as StatsData }),
  );
  return (
    `<div class="page"><header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a></header>` +
    body +
    `</div>`
  );
}

function injectStatsBody(html: string): string {
  return html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${renderStatsRoot()}</div>`,
  );
}

// ---- Static page meta ---------------------------------------------------
// Title guidance:  primary keyword first, brand suffix, ≤60 chars.
// Description guidance:  120–158 chars, natural keyword usage, CTA.

const HOME_META: PageMeta = {
  title: "New AI Releases Daily — Models, Tools & Papers | AI/TLDR",
  description:
    "Every new AI model, repo, tool, and paper worth knowing — refreshed every 2 hours and explained in plain English. Track what's shipping today.",
  canonical: `${SITE_URL}/`,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "AI/TLDR — new AI releases explained daily",
};

const INFLUENCERS_META: PageMeta = {
  title: `Top AI Influencers to Follow — ${influencers.length} People by Role | AI/TLDR`,
  description:
    "The AI people worth following, grouped by what they actually do — frontier-lab founders, researchers, educators, engineers, tool creators, podcasts and newsletters.",
  canonical: INFLUENCERS_URL,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "Top AI influencers to follow, curated by role",
};

const LOG_META: PageMeta = {
  title: "AI Release Changelog — What Shipped & When | AI/TLDR",
  description:
    "The full changelog of AI/TLDR sweeps — every AI model, repo, tool, paper and dataset added, with a one-line note on why each was picked.",
  canonical: LOG_URL,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "AI/TLDR sweep log — changelog of AI releases",
};

const STATS_META: PageMeta = {
  title: "AI Release Index — Stats on New AI Releases | AI/TLDR",
  description:
    "Live stats on the AI releases & open-source tools AI/TLDR tracks — counts by lab, category and week, plus the most-starred open-source AI tools.",
  canonical: STATS_URL,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "AI Release Index — statistics on new AI releases",
};

// -----------------------------------------------------------------------
// Sitemap
// -----------------------------------------------------------------------

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  /** Image URL(s) attached to this page — emits <image:image> entries. */
  images?: { loc: string; caption?: string; title?: string }[];
  /** Video metadata — emits a single <video:video> entry per URL. */
  video?: {
    thumbnail_loc: string;
    title: string;
    description: string;
    content_loc?: string;
    player_loc?: string;
    publication_date?: string;
  };
}

function buildSitemap(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const parts = [`    <loc>${escapeText(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority !== undefined)
        parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
      for (const img of u.images ?? []) {
        const inner = [`      <image:loc>${escapeText(img.loc)}</image:loc>`];
        if (img.caption)
          inner.push(`      <image:caption>${escapeText(img.caption)}</image:caption>`);
        if (img.title)
          inner.push(`      <image:title>${escapeText(img.title)}</image:title>`);
        parts.push(`    <image:image>\n${inner.join("\n")}\n    </image:image>`);
      }
      if (u.video) {
        const v = u.video;
        const inner = [
          `      <video:thumbnail_loc>${escapeText(v.thumbnail_loc)}</video:thumbnail_loc>`,
          `      <video:title>${escapeText(v.title)}</video:title>`,
          `      <video:description>${escapeText(v.description)}</video:description>`,
        ];
        if (v.content_loc)
          inner.push(`      <video:content_loc>${escapeText(v.content_loc)}</video:content_loc>`);
        if (v.player_loc)
          inner.push(`      <video:player_loc>${escapeText(v.player_loc)}</video:player_loc>`);
        if (v.publication_date)
          inner.push(`      <video:publication_date>${v.publication_date}</video:publication_date>`);
        parts.push(`    <video:video>\n${inner.join("\n")}\n    </video:video>`);
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${body}
</urlset>
`;
}

/**
 * News sitemap — Google's separate index for news content. Strict spec:
 *  - last 2 days only
 *  - max 1000 entries
 *  - <news:publication> with name + language required
 *  - <news:publication_date> in W3C format, <news:title> required
 *
 * This static file is a build-time fallback only. The LIVE news sitemap
 * at /sitemap-news.xml is served by the Cloudflare Worker (src/worker.ts),
 * which re-filters against the request-time clock so stale items vanish
 * between deploys. Keep this generator in sync with the Worker's copy
 * (trailing-slash loc, publication_date = it.date).
 */
function buildNewsSitemap(items: ReleaseItem[]): string {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = items
    .filter((it) => {
      const t = Date.parse(it.publishDate ?? it.date);
      return Number.isFinite(t) && t >= cutoff;
    })
    .slice(0, 1000);
  const body = recent
    .map((it) => {
      const url = releaseUrl(it.id);
      // Real release date as a full W3C datetime (noon UTC) — matches the
      // page's NewsArticle datePublished to the second and keeps launch-day
      // items inside Google News's freshness window.
      const pubDate = toW3CDateTime(it.date);
      return `  <url>
    <loc>${escapeText(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>AI/TLDR</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeText(it.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>
`;
}

/**
 * Sitemap index — points at the main sitemap + news sitemap. Lets us
 * split concerns (and lets the news sitemap be served by a live CF
 * function while the main sitemap stays static).
 */
function buildSitemapIndex(entries: { loc: string; lastmod: string }[]): string {
  const body = entries
    .map(
      (e) => `  <sitemap>
    <loc>${escapeText(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

// -----------------------------------------------------------------------
// Atom feed + llms.txt (AI-era discovery surfaces)
// -----------------------------------------------------------------------

/**
 * Atom 1.0 feed of the last 50 releases — a clean, machine-readable surface
 * for RSS readers, aggregators, and AI ingestion. Discovered via the
 * `<link rel="alternate" type="application/atom+xml">` in index.html.
 */
function buildAtomFeed(items: ReleaseItem[]): string {
  const recent = [...items]
    .sort((a, b) =>
      String(b.publishDate ?? b.date).localeCompare(String(a.publishDate ?? a.date)),
    )
    .slice(0, 50);
  const updated = recent[0]
    ? recent[0].publishDate ?? new Date(recent[0].date).toISOString()
    : new Date().toISOString();
  const entries = recent
    .map((it) => {
      const url = releaseUrl(it.id);
      const published = new Date(it.date).toISOString();
      const upd = it.publishDate ?? published;
      const summary = it.explainer?.tagline ?? it.summary;
      return `  <entry>
    <title>${escapeText(it.title)}</title>
    <id>${escapeText(url)}</id>
    <link href="${escapeAttr(url)}" />
    <published>${published}</published>
    <updated>${upd}</updated>
    <author><name>${escapeText(it.org)}</name></author>
    <category term="${escapeAttr(it.categories[0])}" />
    <summary>${escapeText(summary)}</summary>
  </entry>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>AI/TLDR — New AI Releases</title>
  <subtitle>Every new AI model, repo, tool, and paper worth knowing — refreshed every few hours and explained in plain English.</subtitle>
  <id>${SITE_URL}/</id>
  <link href="${SITE_URL}/" />
  <link rel="self" type="application/atom+xml" href="${SITE_URL}/feed.xml" />
  <updated>${updated}</updated>
  <author><name>AI/TLDR</name></author>
${entries}
</feed>
`;
}

/**
 * /llms.txt — the emerging AI-crawler convention (llmstxt.org). Honest
 * verdict: no major engine consumes it as of mid-2026, but it's a cheap,
 * harmless hedge. Plain Markdown/text, served as text/plain, so no escaping.
 */
function buildLlmsTxt(items: ReleaseItem[]): string {
  const recent = [...items]
    .sort((a, b) =>
      String(b.publishDate ?? b.date).localeCompare(String(a.publishDate ?? a.date)),
    )
    .slice(0, 20);
  const releaseLines = recent
    .map((it) => `- [${it.title}](${releaseUrl(it.id)}): ${it.explainer?.tagline ?? it.summary}`)
    .join("\n");
  return `# AI/TLDR

> Every new AI model, repo, tool, paper, dataset and benchmark worth knowing — refreshed every few hours and explained in plain English. Zero-hallucination: every URL, metric and claim is fetched and verified before publishing.

## Site
- [Home — latest AI releases](${SITE_URL}/): the live feed, newest first, sized by impact.
- [Learn AI](${SITE_URL}/learn/): a beginner-friendly AI encyclopedia (structured articles, FAQs, diagrams).
- [Open-source AI landscape](${SITE_URL}/learn/landscape/): a map of open-source AI tools by category, each with its own page.
- [LLM registry](${SITE_URL}/models/): every notable large language model — frontier and open-weight — with verified specs, benchmarks, pricing and APIs, one detail page each.
- [AI influencers](${SITE_URL}/influencers/): AI people worth following, grouped by role.
- [Changelog](${SITE_URL}/log/): every automated sweep that refreshed the feed.

## Latest releases
${releaseLines}

## Optional
- [AI Release Index (stats)](${SITE_URL}/stats/): original derived data — release velocity, lab cadence, most-starred tools.
- [Free JSON API — releases](${SITE_URL}/api/releases.json): the full verified feed (CORS-enabled, CC-BY).
- [Free JSON API — open-source tools](${SITE_URL}/api/tools.json): the landscape of tracked OSS AI tools.
- [Free JSON API — stats](${SITE_URL}/api/stats.json): the AI Release Index data.
- [Embeddable badge](${SITE_URL}/embed): a live "AI releases this week" SVG you can embed.
- [Atom feed](${SITE_URL}/feed.xml)
- [Sitemap index](${SITE_URL}/sitemap.xml)
`;
}

/**
 * /llms-full.txt — fuller inlined context for AI ingestion. Bounds size to
 * the 60 most recent releases; the always-current full feed is feed.json.
 */
function buildLlmsFullTxt(items: ReleaseItem[]): string {
  const recent = [...items]
    .sort((a, b) =>
      String(b.publishDate ?? b.date).localeCompare(String(a.publishDate ?? a.date)),
    )
    .slice(0, 60);
  const blocks = recent
    .map((it) => {
      const ex = it.explainer;
      return `### ${it.title}
- URL: ${releaseUrl(it.id)}
- Org: ${it.org} · Date: ${it.date} · Importance: ${it.importance} · Category: ${it.categories[0]}
- ${ex?.tagline ?? it.summary}${ex?.whatIsIt ? `\n- What it is: ${ex.whatIsIt}` : ""}`;
    })
    .join("\n\n");
  return `# AI/TLDR — full context

> Every new AI model, repo, tool, paper, dataset and benchmark worth knowing, refreshed every few hours and explained in plain English. Zero-hallucination: every URL, metric and claim is verified.

This file inlines the most recent releases for AI ingestion. The full,
always-current feed is at ${SITE_URL}/feed.json and ${SITE_URL}/feed.xml.

## Sections
- Home: ${SITE_URL}/
- Learn AI encyclopedia: ${SITE_URL}/learn/
- Open-source AI landscape: ${SITE_URL}/learn/landscape/
- LLM registry (specs, benchmarks, pricing): ${SITE_URL}/models/
- AI influencers: ${SITE_URL}/influencers/
- Changelog: ${SITE_URL}/log/

## Recent releases

${blocks}
`;
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

async function writeHtml(relPath: string, html: string): Promise<void> {
  const full = join(DIST, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html, "utf8");
}

async function main() {
  console.log(`[prerender] SITE_URL = ${SITE_URL}`);
  const template = await readFile(TEMPLATE_PATH, "utf8");

  const items = feed.items as ReleaseItem[];

  // 1. Homepage — WebSite + Organization graph + ItemList of latest
  //    releases + FAQPage. Also injects a visible FAQ section into the
  //    static HTML so Google can match the FAQPage markup against
  //    rendered content (FAQ rich-result requirement, even post-2026
  //    sunset — for Bing/voice surfaces).
  const homeJsonLd = [
    renderJsonLdHome(),
    renderJsonLdHomeItemList(items),
    renderJsonLdFaq(),
  ].join("\n    ");
  let homeHtml = injectMeta(template, HOME_META, homeJsonLd);
  homeHtml = injectHomeBody(homeHtml, items);
  homeHtml = injectVisibleFaq(homeHtml);
  // Static, crawler-visible link strip into the Learn section — internal
  // links from the homepage are the strongest discovery signal we have.
  homeHtml = injectLearnLinksIntoHome(homeHtml);
  // …and into the LLM registry — the second evergreen hub crawlers should
  // reach straight from the homepage.
  homeHtml = injectModelsLinksIntoHome(homeHtml);
  await writeHtml("index.html", homeHtml);

  // 2. Influencers page — ProfilePage + ItemList of Person entries, plus a
  //    crawlable role-grouped body (was an empty #root).
  {
    let infHtml = injectMeta(
      template,
      INFLUENCERS_META,
      renderJsonLdInfluencers(influencers),
    );
    infHtml = injectInfluencersBody(infHtml, influencers);
    await writeHtml("influencers/index.html", infHtml);
  }

  // 3. Sweep log page — CollectionPage JSON-LD + crawlable changelog body
  {
    let logHtml = injectMeta(
      template,
      LOG_META,
      renderJsonLdCollectionPage({
        url: LOG_URL,
        name: "AI Release Changelog",
        description: LOG_META.description,
      }),
    );
    logHtml = injectLogBody(
      logHtml,
      (sweepsData as { sweeps: SweepReportLite[] }).sweeps ?? [],
    );
    await writeHtml("log/index.html", logHtml);
  }

  // 3b. AI Release Index (/stats) — Dataset + Breadcrumb JSON-LD + the real
  //     StatsPage rendered to static HTML. An original dataset built from the
  //     verified feed + landscape (a GEO citation magnet).
  {
    const statsJsonLd = [
      renderJsonLdStats(),
      renderJsonLdStatsBreadcrumb(),
    ].join("\n    ");
    let statsHtml = injectMeta(template, STATS_META, statsJsonLd);
    statsHtml = injectStatsBody(statsHtml);
    await writeHtml("stats/index.html", statsHtml);
  }

  // 4. One page per release — full structured-data stack. Most blocks
  // are conditional on category/importance; releases that don't match
  // a condition simply skip those types.
  let count = 0;
  for (const item of items) {
    const blocks = [
      renderJsonLdArticle(item),       // NewsArticle (always)
      renderJsonLdBreadcrumb(item),    // BreadcrumbList (always)
      renderJsonLdReleaseFaq(item),    // FAQPage (when the item has a sub-question FAQ)
      renderJsonLdReview(item),        // Review (when itemReviewed is supported)
      renderJsonLdVideo(item),         // VideoObject (video category)
      renderJsonLdSoftware(item),      // SoftwareApplication / SoftwareSourceCode
      renderJsonLdDataset(item),       // Dataset (dataset category)
      renderJsonLdTechArticle(item),   // TechArticle (paper/algorithm/benchmark/tutorial)
      renderJsonLdCourse(item),        // Course + LearningResource (tutorial)
      renderJsonLdHowTo(item),         // HowTo (tutorial w/ tryIt)
    ].filter((b): b is string => !!b);
    const jsonLd = blocks.join("\n    ");
    let html = injectMeta(template, releaseMeta(item), jsonLd);
    html = injectReleaseBody(html, item, items);
    await writeHtml(`releases/${item.id}/index.html`, html);
    count++;
  }

  // 4a-bis. Category hub pages — /releases/<cat>/ — one crawlable index per
  // primary category that actually appears in the feed. Each release links up
  // to its hub (3-level breadcrumb) and each hub links down to its releases +
  // across to sibling hubs, so the release pages stop being crawl dead-ends.
  const hubCats = (CATEGORY_ORDER_RELEASE as Category[]).filter((c) =>
    items.some((i) => i.categories[0] === c),
  );
  for (const cat of hubCats) {
    const inCat = releasesInCategory(cat, items);
    const hubJsonLd = [
      renderJsonLdCollectionPage({
        url: releaseCatUrl(cat),
        name: hubH1(cat),
        description: RELEASE_HUB_COPY[cat].lede,
      }),
      renderJsonLdHubBreadcrumb(cat),
      renderJsonLdHubItemList(cat, inCat),
    ].join("\n    ");
    let hubHtml = injectMeta(template, hubMeta(cat), hubJsonLd);
    hubHtml = injectHubBody(hubHtml, cat, items, hubCats);
    await writeHtml(`releases/${cat}/index.html`, hubHtml);
  }

  // 4b. Learn section — hub + category + subcategory + one page per
  // article, each with full prerendered content, meta and JSON-LD.
  // Returns the URL set for its own sitemap (kept separate so the
  // 2h-cron release churn doesn't re-date 300+ evergreen pages).
  const learnUrls = await prerenderLearn({
    template,
    siteUrl: SITE_URL,
    defaultOgImage: DEFAULT_OG_IMAGE,
    injectMeta,
    wrapJsonLd,
    writeHtml,
  });

  // 4c. LLM registry — the /models hub + one page per model, each with
  // prerendered content, meta and JSON-LD. Returns its own sitemap URL set
  // (kept separate, like learn, so the 2h release churn doesn't re-date the
  // evergreen model pages).
  const modelUrls = await prerenderModels({
    template,
    siteUrl: SITE_URL,
    defaultOgImage: DEFAULT_OG_IMAGE,
    injectMeta,
    wrapJsonLd,
    writeHtml,
  });

  // 5. Main sitemap — every URL, with image + video extensions on
  // release pages so Google Images / Video also picks them up.
  const today = new Date().toISOString().slice(0, 10);
  const mainSitemap = buildSitemap([
    {
      loc: `${SITE_URL}/`,
      lastmod: today,
      changefreq: "hourly",
      priority: 1.0,
      images: [{ loc: DEFAULT_OG_IMAGE, title: "AI/TLDR — daily AI release tracker" }],
    },
    {
      loc: INFLUENCERS_URL,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: LOG_URL,
      lastmod: today,
      changefreq: "daily",
      priority: 0.7,
    },
    {
      loc: STATS_URL,
      lastmod: (statsData as StatsData).generatedAt,
      changefreq: "daily",
      priority: 0.8,
    },
    // Category hubs — lastmod tracks the newest release in each category.
    ...hubCats.map((cat): SitemapUrl => {
      const inCat = releasesInCategory(cat, items);
      return {
        loc: releaseCatUrl(cat),
        lastmod: inCat[0]?.date ?? today,
        changefreq: "daily",
        priority: 0.7,
      };
    }),
    ...items.map((i): SitemapUrl => {
      const loc = releaseUrl(i.id);
      const url: SitemapUrl = {
        loc,
        lastmod: i.date,
        changefreq: "weekly",
        priority: 0.7,
      };
      if (i.image?.url) {
        url.images = [
          {
            loc: i.image.url,
            caption: i.explainer?.tagline ?? i.summary,
            title: i.title,
          },
        ];
      }
      if (i.categories.includes("video")) {
        url.video = {
          thumbnail_loc: i.image?.url ?? DEFAULT_OG_IMAGE,
          title: i.title.slice(0, 100),
          description: (i.explainer?.tagline ?? i.summary).slice(0, 2048),
          content_loc: i.url,
          player_loc: i.url,
          publication_date: i.publishDate ?? new Date(i.date).toISOString(),
        };
      }
      return url;
    }),
  ]);
  await writeFile(join(DIST, "sitemap-main.xml"), mainSitemap, "utf8");

  // 6. News sitemap — last-48h items only. Static fallback; the live
  // version is served by the Cloudflare Worker (src/worker.ts), which
  // re-filters on every request.
  const newsSitemap = buildNewsSitemap(items);
  await writeFile(join(DIST, "sitemap-news-static.xml"), newsSitemap, "utf8");

  // 6b. Learn sitemap — all /learn URLs, lastmod from each article's
  // `updated` date so crawlers only re-fetch what actually changed.
  const learnSitemap = buildSitemap(learnUrls);
  await writeFile(join(DIST, "sitemap-learn.xml"), learnSitemap, "utf8");

  // 6c. Models sitemap — the /models hub + every model detail page. Kept
  // separate (evergreen, like learn) so release churn never re-dates them.
  const modelsSitemap = buildSitemap(modelUrls);
  await writeFile(join(DIST, "sitemap-models.xml"), modelsSitemap, "utf8");

  // 7. Sitemap index — what robots.txt points at. Splits the load across
  // a static main sitemap, the learn sitemap, and the live
  // Worker-served news sitemap.
  const sitemapIndex = buildSitemapIndex([
    { loc: `${SITE_URL}/sitemap-main.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-learn.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-models.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-news.xml`, lastmod: today },
  ]);
  await writeFile(join(DIST, "sitemap.xml"), sitemapIndex, "utf8");

  // 7b. Expose the feed at /feed.json so the live news-sitemap Worker
  // can fetch it via the ASSETS binding without inlining the JSON.
  await writeFile(
    join(DIST, "feed.json"),
    JSON.stringify(feed),
    "utf8",
  );

  // 7c. Expose the precomputed AI Release Index at /stats.json — the
  // machine-readable download referenced by the Dataset JSON-LD's
  // `distribution`, and what the Worker serves (with CORS) at /api/stats.json.
  await writeFile(join(DIST, "stats.json"), JSON.stringify(statsData), "utf8");

  // 7d. Expose the open-source landscape at /landscape.json — the source the
  // Worker serves (with CORS) at /api/tools.json (the free public API).
  await writeFile(join(DIST, "landscape.json"), JSON.stringify(landscapeData), "utf8");

  // 8. robots.txt — point at the index AND the news sitemap directly so
  // Google News surfaces it explicitly. The AI answer-engine / search
  // crawlers are named EXPLICITLY (not just covered by `*`) so this file
  // is auditable and a future "block AI bots" reflex can't silently cut
  // the pipes into ChatGPT (OAI-SearchBot reads our pages; Bing feeds
  // ChatGPT Search), Perplexity, Copilot, Gemini and Claude. We WANT
  // maximum reach — training crawlers (GPTBot, ClaudeBot) are allowed too.
  const aiBots = [
    "OAI-SearchBot",
    "ChatGPT-User",
    "GPTBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "bingbot",
    "CCBot",
  ];
  const robots = `# AI/TLDR — every crawler welcome, nothing disallowed.
User-agent: *
Allow: /

${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap-news.xml
`;
  await writeFile(join(DIST, "robots.txt"), robots, "utf8");

  // 9. Atom feed — last 50 releases (RSS readers, aggregators, AI ingestion).
  await writeFile(join(DIST, "feed.xml"), buildAtomFeed(items), "utf8");

  // 10. llms.txt / llms-full.txt — AI-crawler convention. Cheap hedge;
  //     no major engine consumes it yet (mid-2026), so we don't over-invest.
  await writeFile(join(DIST, "llms.txt"), buildLlmsTxt(items), "utf8");
  await writeFile(join(DIST, "llms-full.txt"), buildLlmsFullTxt(items), "utf8");

  console.log(
    `[prerender] wrote ${count} release pages + influencers + /log + sitemap index + main + news + robots.txt + feed.xml + llms.txt`,
  );
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
