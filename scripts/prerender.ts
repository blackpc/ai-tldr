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
 * public/_redirects — Cloudflare Pages serves /index.html with a 200
 * for any unknown path so client routing still works.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import feed from "../src/data/releases.json" with { type: "json" };
import type { ReleaseItem } from "../src/data/schema";
import { influencers } from "../src/data/influencers";

// -----------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ||
  "https://ai-tldr.dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

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
}

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
};

const WEBSITE_REF = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: "AI/TLDR",
  alternateName: "AI TLDR",
  description:
    "Every new AI model, repo, tool, and paper worth knowing — refreshed every 8 hours and explained in plain English.",
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
    a: "AI/TLDR is a high-volume tracker of new AI releases — models, open-source repos, developer tools, papers, datasets, benchmarks and security findings — refreshed every 8 hours and explained in plain English.",
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

function renderJsonLdArticle(item: ReleaseItem): string {
  const url = `${SITE_URL}/releases/${item.id}`;
  const description = item.explainer?.tagline ?? item.summary;
  const data = {
    "@context": "https://schema.org",
    // NewsArticle is the right subtype: AI/TLDR is a release-tracking news
    // feed, every item has a real publication date, and Google's News
    // surfaces (Top Stories, News tab, Discover) require NewsArticle.
    "@type": "NewsArticle",
    headline: item.title,
    description,
    url,
    datePublished: item.date,
    // We don't track per-item modification timestamps, so fall back to the
    // feed-level generatedAt — crawlers use this to decide whether to
    // recrawl, and "never modified" signals a stale feed.
    dateModified: (feed as { generatedAt?: string }).generatedAt ?? item.date,
    author: {
      "@type": "Organization",
      name: item.org,
    },
    publisher: { "@id": `${SITE_URL}/#org` },
    image: {
      "@type": "ImageObject",
      url: item.image?.url ?? DEFAULT_OG_IMAGE,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    articleSection: item.categories[0],
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
  const url = `${SITE_URL}/releases/${item.id}`;
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

  const url = `${SITE_URL}/releases/${item.id}`;
  if (isRepo) {
    return wrapJsonLd({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: item.title,
      description: item.explainer?.tagline ?? item.summary,
      codeRepository: item.url,
      url,
      author: { "@type": "Organization", name: item.org },
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
    author: { "@type": "Organization", name: item.org },
    image: item.image?.url ?? DEFAULT_OG_IMAGE,
    // Most items we track are free / open-weight; the rare paid model
    // still benefits from being listed as $0 because the offer block
    // unlocks the SoftwareApplication rich result.
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
    },
    keywords: item.tags.join(", "),
  });
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
    url: `${SITE_URL}/releases/${item.id}`,
    creator: { "@type": "Organization", name: item.org },
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
  const url = `${SITE_URL}/releases/${item.id}`;
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: item.title,
    description: item.explainer?.tagline ?? item.summary,
    url,
    datePublished: item.date,
    author: { "@type": "Organization", name: item.org },
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
  const url = `${SITE_URL}/releases/${item.id}`;
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
      url: `${SITE_URL}/releases/${item.id}`,
      name: item.title,
    })),
  });
}

/**
 * ProfilePage + ItemList JSON-LD for the influencers index page. Each
 * influencer is marked up as a Person with handle, image, sameAs links,
 * and follower count via interactionStatistic.
 */
function renderJsonLdInfluencers(
  list: { id: string; name: string; realName?: string; handle: string; bio: string; image: string; url: string; followersRaw: number; platform: string; links?: { url: string }[] }[],
): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/influencers#webpage`,
    url: `${SITE_URL}/influencers`,
    name: "Top AI Influencers to Follow",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#org` },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: list.length,
      itemListElement: list.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: p.realName ?? p.name,
          alternateName: p.name,
          identifier: p.handle,
          description: p.bio,
          image: p.image.startsWith("http")
            ? p.image
            : `${SITE_URL}${p.image}`,
          url: p.url,
          sameAs: [p.url, ...(p.links?.map((l) => l.url) ?? [])],
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/FollowAction",
            userInteractionCount: p.followersRaw,
          },
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
function renderJsonLdBreadcrumb(item: ReleaseItem): string {
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
        name: item.title,
        item: `${SITE_URL}/releases/${item.id}`,
      },
    ],
  });
}

function renderMetaBlock(meta: PageMeta): string {
  const rows = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="AI/TLDR" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
    `<meta property="og:image" content="${escapeAttr(meta.ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    meta.ogImageAlt
      ? `<meta property="og:image:alt" content="${escapeAttr(meta.ogImageAlt)}" />`
      : null,
    `<meta property="og:locale" content="en_US" />`,
    meta.publishedTime
      ? `<meta property="article:published_time" content="${escapeAttr(meta.publishedTime)}" />`
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
  return item.title;
}

function releaseMeta(item: ReleaseItem): PageMeta {
  const tagline = item.explainer?.tagline ?? item.summary;
  // Description should be ≤ 160 chars for best SEO truncation behavior.
  const description = tagline.length > 155
    ? tagline.slice(0, 152) + "…"
    : tagline;

  return {
    title: buildReleaseTitle(item),
    description,
    canonical: `${SITE_URL}/releases/${item.id}`,
    ogType: "article",
    ogImage: item.image?.url ?? DEFAULT_OG_IMAGE,
    ogImageAlt: item.image?.alt,
    publishedTime: item.date,
  };
}

// ---- Static page meta ---------------------------------------------------
// Title guidance:  primary keyword first, brand suffix, ≤60 chars.
// Description guidance:  120–158 chars, natural keyword usage, CTA.

const HOME_META: PageMeta = {
  title: "New AI Releases Daily — Models, Tools & Papers | AI/TLDR",
  description:
    "Every new AI model, repo, tool, and paper worth knowing — refreshed every 8 hours and explained in plain English. Track what's shipping today.",
  canonical: `${SITE_URL}/`,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "AI/TLDR — new AI releases explained daily",
};

const INFLUENCERS_META: PageMeta = {
  title: "Top AI Influencers to Follow — 110 Creators Ranked | AI/TLDR",
  description:
    "The AI creators, researchers and newsletter authors worth following — ranked by reach across YouTube, X/Twitter, GitHub, podcasts, blogs and Substack.",
  canonical: `${SITE_URL}/influencers`,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "Top AI influencers to follow — ranked by reach",
};

const LOG_META: PageMeta = {
  title: "AI Release Changelog — What Shipped & When | AI/TLDR",
  description:
    "The full changelog of AI/TLDR sweeps — every AI model, repo, tool, paper and dataset added, with a one-line note on why each was picked.",
  canonical: `${SITE_URL}/log`,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "AI/TLDR sweep log — changelog of AI releases",
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
 * This file is regenerated on every build (every 8h) AND served live by
 * a Cloudflare Pages Function (functions/sitemap-news.xml.ts) that
 * filters against the request-time clock so stale items vanish from the
 * news feed even between deploys.
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
      const url = `${SITE_URL}/releases/${it.id}`;
      const pubDate = it.publishDate ?? new Date(it.date).toISOString();
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
  homeHtml = injectVisibleFaq(homeHtml);
  await writeHtml("index.html", homeHtml);

  // 2. Influencers page — ProfilePage + ItemList of Person entries
  await writeHtml(
    "influencers/index.html",
    injectMeta(
      template,
      INFLUENCERS_META,
      renderJsonLdInfluencers(influencers),
    ),
  );

  // 3. Sweep log page — CollectionPage JSON-LD
  await writeHtml(
    "log/index.html",
    injectMeta(
      template,
      LOG_META,
      renderJsonLdCollectionPage({
        url: `${SITE_URL}/log`,
        name: "AI Release Changelog",
        description: LOG_META.description,
      }),
    ),
  );

  // 4. One page per release — full structured-data stack. Most blocks
  // are conditional on category/importance; releases that don't match
  // a condition simply skip those types.
  let count = 0;
  for (const item of items) {
    const blocks = [
      renderJsonLdArticle(item),       // NewsArticle (always)
      renderJsonLdBreadcrumb(item),    // BreadcrumbList (always)
      renderJsonLdReview(item),        // Review (when itemReviewed is supported)
      renderJsonLdVideo(item),         // VideoObject (video category)
      renderJsonLdSoftware(item),      // SoftwareApplication / SoftwareSourceCode
      renderJsonLdDataset(item),       // Dataset (dataset category)
      renderJsonLdTechArticle(item),   // TechArticle (paper/algorithm/benchmark/tutorial)
      renderJsonLdCourse(item),        // Course + LearningResource (tutorial)
      renderJsonLdHowTo(item),         // HowTo (tutorial w/ tryIt)
    ].filter((b): b is string => !!b);
    const jsonLd = blocks.join("\n    ");
    const html = injectMeta(template, releaseMeta(item), jsonLd);
    await writeHtml(`releases/${item.id}/index.html`, html);
    count++;
  }

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
      loc: `${SITE_URL}/influencers`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: `${SITE_URL}/log`,
      lastmod: today,
      changefreq: "daily",
      priority: 0.7,
    },
    ...items.map((i): SitemapUrl => {
      const loc = `${SITE_URL}/releases/${i.id}`;
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
  // version is served by functions/sitemap-news.xml.ts (Cloudflare
  // Pages Function) which re-filters on every request.
  const newsSitemap = buildNewsSitemap(items);
  await writeFile(join(DIST, "sitemap-news-static.xml"), newsSitemap, "utf8");

  // 7. Sitemap index — what robots.txt points at. Splits the load across
  // a static main sitemap and the live CF-function-served news sitemap.
  const sitemapIndex = buildSitemapIndex([
    { loc: `${SITE_URL}/sitemap-main.xml`, lastmod: today },
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

  // 8. robots.txt — point at the index AND the news sitemap directly so
  // Google News surfaces it explicitly.
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap-news.xml
`;
  await writeFile(join(DIST, "robots.txt"), robots, "utf8");

  console.log(
    `[prerender] wrote ${count} release pages + influencers + /log + sitemap index + main + news + robots.txt`,
  );
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
