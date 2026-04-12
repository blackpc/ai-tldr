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
import { influencers } from "../src/data/influencers";
import type { ReleaseItem } from "../src/data/schema";

// -----------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ||
  "https://ai-tldr.blackpc-me.workers.dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
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

function renderJsonLdArticle(item: ReleaseItem): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.explainer?.tagline ?? item.summary,
    datePublished: item.date,
    author: {
      "@type": "Organization",
      name: item.org,
    },
    publisher: {
      "@type": "Organization",
      name: "AI/TLDR",
    },
    image: item.image?.url ?? DEFAULT_OG_IMAGE,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/releases/${item.id}`,
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
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
  // Clean up the "<!-- Canonical -->", "<!-- Open Graph -->", and
  // "<!-- Twitter Card -->" section comments so the resulting head
  // isn't littered with empty labels.
  html = html.replace(/<!--\s*(?:Canonical|Open Graph|Twitter Card)\s*-->\s*/g, "");
  // Drop empty HTML comments left over from the meta tags that were
  // commented out in the source template (`<!-- -->`).
  html = html.replace(/<!--\s*-->\s*/g, "");

  // Inject our block right after <meta name="viewport" ...>
  const block = renderMetaBlock(meta);
  html = html.replace(
    /(<meta\s+name="viewport"[^>]*?>)/,
    `$1\n    ${block}`,
  );

  // Optional: inject an additional JSON-LD block (e.g. Article schema
  // for individual release pages) just before </head>. The existing
  // WebSite JSON-LD stays for the homepage.
  if (extraJsonLd) {
    html = html.replace("</head>", `  ${extraJsonLd}\n  </head>`);
  }

  return html;
}

// -----------------------------------------------------------------------
// Per-item meta builders
// -----------------------------------------------------------------------

function releaseMeta(item: ReleaseItem): PageMeta {
  const tagline = item.explainer?.tagline ?? item.summary;
  // Description should be ≤ 160 chars for best SEO truncation behavior.
  const description = tagline.length > 155
    ? tagline.slice(0, 152) + "…"
    : tagline;

  return {
    title: `${item.title} — ${item.org} | AI/TLDR`,
    description,
    canonical: `${SITE_URL}/releases/${item.id}`,
    ogType: "article",
    ogImage: item.image?.url ?? DEFAULT_OG_IMAGE,
    ogImageAlt: item.image?.alt,
    publishedTime: item.date,
  };
}

const INFLUENCERS_META: PageMeta = {
  title: "AI Influencers — Who to Follow in AI | AI/TLDR",
  description:
    "Curated list of top AI creators, researchers, and newsletter authors across YouTube, Twitter/X, GitHub, blogs, and podcasts — sorted by reach.",
  canonical: `${SITE_URL}/influencers`,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
};

const HOME_META: PageMeta = {
  title: "AI/TLDR — New AI Models, Tools & Papers This Week",
  description:
    "Daily curated feed of new AI releases — each explained so you actually understand what shipped and why it matters.",
  canonical: `${SITE_URL}/`,
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
};

// -----------------------------------------------------------------------
// Sitemap
// -----------------------------------------------------------------------

function buildSitemap(
  urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[],
): string {
  const body = urls
    .map((u) => {
      const parts = [`    <loc>${escapeText(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority !== undefined)
        parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
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

  // 1. Homepage — overwrite dist/index.html with full meta block
  await writeHtml("index.html", injectMeta(template, HOME_META));

  // 2. Influencers page
  await writeHtml(
    "influencers/index.html",
    injectMeta(template, INFLUENCERS_META),
  );

  // 3. One page per release
  let count = 0;
  const items = feed.items as ReleaseItem[];
  for (const item of items) {
    const html = injectMeta(
      template,
      releaseMeta(item),
      renderJsonLdArticle(item),
    );
    await writeHtml(`releases/${item.id}/index.html`, html);
    count++;
  }

  // 4. Sitemap
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = buildSitemap([
    { loc: `${SITE_URL}/`, lastmod: today, changefreq: "daily", priority: 1.0 },
    {
      loc: `${SITE_URL}/influencers`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    },
    ...items.map((i) => ({
      loc: `${SITE_URL}/releases/${i.id}`,
      lastmod: i.date,
      changefreq: "monthly" as const,
      priority: 0.6,
    })),
  ]);
  await writeFile(join(DIST, "sitemap.xml"), sitemap, "utf8");

  // 5. robots.txt
  const robots = `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await writeFile(join(DIST, "robots.txt"), robots, "utf8");

  console.log(
    `[prerender] wrote ${count} release pages + 1 influencers page + sitemap.xml + robots.txt`,
  );
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
