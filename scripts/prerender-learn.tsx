/**
 * Learn-section prerender — called by scripts/prerender.ts (never run
 * directly). For every Learn page (hub, categories, subcategories, one
 * per article) it:
 *
 *   - renders the REAL React components (the same ones the SPA uses)
 *     to static HTML and injects it into the SPA shell's #root, so
 *     crawlers get the full article content without JavaScript
 *   - inlines learn.css so the static content is styled before the
 *     lazy Learn chunk loads (no-FOUC for visitors landing from Google)
 *   - embeds the article JSON in a <script id="__LEARN_DATA__"> tag so
 *     the SPA's first client render matches the static HTML instantly
 *   - injects per-page meta + JSON-LD (TechArticle/LearningResource +
 *     BreadcrumbList + FAQPage for articles; CollectionPage + ItemList
 *     for hubs)
 *
 * Returns the sitemap URL list for sitemap-learn.xml.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import type { LearnArticle } from "../src/data/learn/schema";
import {
  learnArticlePath,
  learnCategoryPath,
  learnHubPath,
  learnLandscapePath,
  learnMapPath,
  learnSubcategoryPath,
  learnToolPath,
} from "../src/data/learn/schema";
import type { Landscape, LandscapeToolDetail } from "../src/data/learn/schema";
import { learnTaxonomy, learnArticleCount } from "../src/data/learn/nav";
import { ArticleBody } from "../src/components/learn/ArticleBody";
import LearnMap from "../src/components/learn/LearnMap";
import { LearnLandscapePage } from "../src/components/learn/LearnLandscape";
import { LearnToolPage } from "../src/components/learn/LearnTool";
import landscapeData from "../src/data/learn/landscape.json";
import {
  LearnCategoryPage,
  LearnHubPage,
  LearnSubcategoryPage,
} from "../src/components/learn/LearnPages";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ARTICLES_DIR = join(ROOT, "src", "data", "learn", "articles");
const LEARN_CSS = readFileSync(
  join(ROOT, "src", "components", "learn", "learn.css"),
  "utf8",
);

// ---- minimal duplicates of prerender.ts types (kept tiny on purpose) ----

export interface LearnPageMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  ogImage: string;
  publishedTime?: string;
}

export interface LearnSitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

type InjectMeta = (
  template: string,
  meta: LearnPageMeta,
  extraJsonLd?: string,
) => string;
type WrapJsonLd = (data: unknown) => string;
type WriteHtml = (relPath: string, html: string) => Promise<void>;

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function walk(dir: string): string[] {
  let out: string[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out = out.concat(walk(full));
    else if (e.endsWith(".json")) out.push(full);
  }
  return out;
}

function loadArticles(): Map<string, LearnArticle> {
  const map = new Map<string, LearnArticle>();
  for (const file of walk(ARTICLES_DIR)) {
    try {
      const a = JSON.parse(readFileSync(file, "utf8")) as LearnArticle;
      map.set(a.slug, a);
    } catch {
      console.warn(`[prerender-learn] skipping unparseable ${file}`);
    }
  }
  return map;
}

const TOOLS_DIR = join(ROOT, "src", "data", "learn", "tools");

function loadToolDetails(): Map<string, LandscapeToolDetail> {
  const map = new Map<string, LandscapeToolDetail>();
  let files: string[] = [];
  try {
    files = readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return map; // dir may not exist yet
  }
  for (const f of files) {
    try {
      const d = JSON.parse(readFileSync(join(TOOLS_DIR, f), "utf8")) as LandscapeToolDetail;
      map.set(d.slug, d);
    } catch {
      console.warn(`[prerender-learn] skipping unparseable tool ${f}`);
    }
  }
  return map;
}

/** Static page chrome around the prerendered Learn content. Uses the
 *  main stylesheet's classes (already linked in the template head) so
 *  the page looks like the site before React boots. React replaces all
 *  of #root on mount with the identical SPA-rendered tree. */
function staticShell(inner: string): string {
  return (
    `<div class="page">` +
    `<header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a>` +
    `</header>` +
    `<main class="lrn-main">${inner}</main>` +
    `<footer class="page-footer">` +
    `<a href="/">Releases</a> · <a href="${learnHubPath}">Learn AI</a> · ` +
    `<a href="/influencers/">Influencers</a></footer>` +
    `</div>`
  );
}

/** Replace the empty #root in the built shell with prerendered HTML,
 *  inline learn.css, and (for articles) embed the data payload. */
function injectBody(html: string, bodyHtml: string, payload?: unknown): string {
  // Inline the Learn stylesheet so the static content has its styles
  // before the lazy chunk's CSS arrives.
  html = html.replace(
    "</head>",
    () => `  <style data-learn-css>\n${LEARN_CSS}\n</style>\n  </head>`,
  );
  html = html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${staticShell(bodyHtml)}</div>`,
  );
  if (payload !== undefined) {
    // <-escape so "</script>" can never terminate the tag early.
    const json = JSON.stringify(payload).replace(/</g, "\\u003c");
    html = html.replace(
      "</body>",
      () =>
        `  <script type="application/json" id="__LEARN_DATA__">${json}</script>\n  </body>`,
    );
  }
  return html;
}

function clamp(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

function learnTitle(raw: string): string {
  const brand = " | AI/TLDR";
  if ((raw + brand).length <= 65) return raw + brand;
  return raw;
}

// -----------------------------------------------------------------------
// JSON-LD builders
// -----------------------------------------------------------------------

const DIFFICULTY_LEVEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Expert",
};

function breadcrumbLd(
  wrapJsonLd: WrapJsonLd,
  siteUrl: string,
  trail: { name: string; path: string }[],
): string {
  return wrapJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${siteUrl}${t.path}`,
    })),
  });
}

// -----------------------------------------------------------------------
// Main entry — called from prerender.ts
// -----------------------------------------------------------------------

export async function prerenderLearn(opts: {
  template: string;
  siteUrl: string;
  defaultOgImage: string;
  injectMeta: InjectMeta;
  wrapJsonLd: WrapJsonLd;
  writeHtml: WriteHtml;
}): Promise<LearnSitemapUrl[]> {
  const { template, siteUrl, defaultOgImage, injectMeta, wrapJsonLd, writeHtml } =
    opts;
  const articles = loadArticles();
  const urls: LearnSitemapUrl[] = [];
  const today = new Date().toISOString().slice(0, 10);
  let pages = 0;

  // Truthful lastmod for index pages: the newest `updated` among child
  // articles. Stamping `today` on every build (even when nothing changed)
  // teaches Google to distrust lastmod site-wide — Google treats lastmod
  // trust as roughly binary. So we only ever claim a date we can stand
  // behind; falls back to `today` only when a node has no dated children.
  const latestUpdated = (refs: { slug: string }[]): string => {
    const dates = refs
      .map((r) => articles.get(r.slug)?.updated)
      .filter((d): d is string => !!d)
      .sort();
    return dates.length ? dates[dates.length - 1] : today;
  };

  // ---- hub ----
  const hubMeta: LearnPageMeta = {
    title: "Learn AI — LLMs, RAG, Agents & More, Explained | AI/TLDR",
    description:
      "A plain-English encyclopedia of AI engineering: LLMs, RAG, vector databases, agents, fine-tuning and the tools around them. Free and beginner-friendly.",
    canonical: `${siteUrl}${learnHubPath}`,
    ogType: "website",
    ogImage: defaultOgImage,
  };
  const hubLd = [
    wrapJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}${learnHubPath}#webpage`,
      url: `${siteUrl}${learnHubPath}`,
      name: "Learn AI",
      description: hubMeta.description,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#org` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: learnTaxonomy.categories.length,
        itemListElement: learnTaxonomy.categories.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.title,
          url: `${siteUrl}${learnCategoryPath(c.slug)}`,
        })),
      },
    }),
    breadcrumbLd(wrapJsonLd, siteUrl, [
      { name: "AI/TLDR", path: "/" },
      { name: "Learn AI", path: learnHubPath },
    ]),
  ].join("\n    ");
  await writeHtml(
    "learn/index.html",
    injectBody(
      injectMeta(template, hubMeta, hubLd),
      renderToStaticMarkup(<LearnHubPage />),
    ),
  );
  pages++;
  urls.push({ loc: `${siteUrl}${learnHubPath}`, lastmod: today, changefreq: "weekly", priority: 0.9 });

  // ---- map (/learn/map) ----
  const mapPath = learnMapPath;
  const mapMeta: LearnPageMeta = {
    title: "AI Knowledge Map — Every Topic, Visualized | AI/TLDR",
    description:
      "An interactive mind map of the whole Learn AI encyclopedia: every category, subcategory and article as one explorable radial graph. Free and beginner-friendly.",
    canonical: `${siteUrl}${mapPath}`,
    ogType: "website",
    ogImage: defaultOgImage,
  };
  const mapLd = [
    wrapJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}${mapPath}#webpage`,
      url: `${siteUrl}${mapPath}`,
      name: "AI Knowledge Map",
      description: mapMeta.description,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#org` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: learnTaxonomy.categories.length,
        itemListElement: learnTaxonomy.categories.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.title,
          url: `${siteUrl}${learnCategoryPath(c.slug)}`,
        })),
      },
    }),
    breadcrumbLd(wrapJsonLd, siteUrl, [
      { name: "AI/TLDR", path: "/" },
      { name: "Learn AI", path: learnHubPath },
      { name: "Map", path: mapPath },
    ]),
  ].join("\n    ");
  await writeHtml(
    "learn/map/index.html",
    injectBody(
      injectMeta(template, mapMeta, mapLd),
      renderToStaticMarkup(<LearnMap />),
    ),
  );
  pages++;
  urls.push({ loc: `${siteUrl}${mapPath}`, lastmod: today, changefreq: "weekly", priority: 0.8 });

  // ---- AI tools directory (/tools) ----
  // A static, fully-crawlable list of every open-source tool with its
  // description + repo link. The ItemList JSON-LD exposes the whole catalog.
  const lsPath = learnLandscapePath;
  const ls = landscapeData as Landscape;
  const lsTools = ls.categories.flatMap((c) =>
    c.subcategories.flatMap((s) => s.tools),
  );
  const lsMeta: LearnPageMeta = {
    title:
      "AI Tools Directory — Open-Source & Commercial | AI/TLDR",
    description:
      "A browsable map of the AI stack — open-source libraries and commercial/enterprise platforms alike: model APIs, cloud AI, agents, RAG, vector databases, coding assistants, observability, media generation and more, grouped by category.",
    canonical: `${siteUrl}${lsPath}`,
    ogType: "website",
    ogImage: defaultOgImage,
  };
  const lsLd = [
    wrapJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}${lsPath}#webpage`,
      url: `${siteUrl}${lsPath}`,
      name: "AI Tools Directory",
      description: lsMeta.description,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#org` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: lsTools.length,
        itemListElement: lsTools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          description: t.description,
          url: t.repo
            ? `https://github.com/${t.repo}`
            : t.homepage ?? `${siteUrl}${learnToolPath(t.slug)}`,
        })),
      },
    }),
    breadcrumbLd(wrapJsonLd, siteUrl, [
      { name: "AI/TLDR", path: "/" },
      { name: "AI Tools", path: lsPath },
    ]),
  ].join("\n    ");
  await writeHtml(
    "tools/index.html",
    injectBody(
      injectMeta(template, lsMeta, lsLd),
      renderToStaticMarkup(<LearnLandscapePage />),
    ),
  );
  pages++;
  urls.push({ loc: `${siteUrl}${lsPath}`, lastmod: today, changefreq: "weekly", priority: 0.8 });

  for (const cat of learnTaxonomy.categories) {
    // ---- category page ----
    const catPath = learnCategoryPath(cat.slug);
    const catLd = [
      wrapJsonLd({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${siteUrl}${catPath}#webpage`,
        url: `${siteUrl}${catPath}`,
        name: cat.title,
        description: cat.tagline,
        inLanguage: "en-US",
        isPartOf: { "@id": `${siteUrl}/#website` },
        publisher: { "@id": `${siteUrl}/#org` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: cat.subcategories.reduce((n, s) => n + s.articles.length, 0),
          itemListElement: cat.subcategories.flatMap((s) =>
            s.articles.map((a) => ({
              "@type": "ListItem",
              name: a.title,
              url: `${siteUrl}${learnArticlePath(cat.slug, s.slug, a.slug)}`,
            })),
          ).map((item, i) => ({ ...item, position: i + 1 })),
        },
      }),
      breadcrumbLd(wrapJsonLd, siteUrl, [
        { name: "AI/TLDR", path: "/" },
        { name: "Learn AI", path: learnHubPath },
        { name: cat.title, path: catPath },
      ]),
    ].join("\n    ");
    await writeHtml(
      `learn/${cat.slug}/index.html`,
      injectBody(
        injectMeta(
          template,
          {
            title: learnTitle(`${cat.title} — Learn AI`),
            description: clamp(cat.tagline, 158),
            canonical: `${siteUrl}${catPath}`,
            ogType: "website",
            ogImage: defaultOgImage,
          },
          catLd,
        ),
        renderToStaticMarkup(<LearnCategoryPage category={cat} />),
      ),
    );
    pages++;
    urls.push({
      loc: `${siteUrl}${catPath}`,
      lastmod: latestUpdated(cat.subcategories.flatMap((s) => s.articles)),
      changefreq: "weekly",
      priority: 0.7,
    });

    for (const sub of cat.subcategories) {
      // ---- subcategory page ----
      const subPath = learnSubcategoryPath(cat.slug, sub.slug);
      const subLd = [
        wrapJsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${siteUrl}${subPath}#webpage`,
          url: `${siteUrl}${subPath}`,
          name: sub.title,
          description: sub.tagline,
          inLanguage: "en-US",
          isPartOf: { "@id": `${siteUrl}/#website` },
          publisher: { "@id": `${siteUrl}/#org` },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: sub.articles.length,
            itemListElement: sub.articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: a.title,
              url: `${siteUrl}${learnArticlePath(cat.slug, sub.slug, a.slug)}`,
            })),
          },
        }),
        breadcrumbLd(wrapJsonLd, siteUrl, [
          { name: "AI/TLDR", path: "/" },
          { name: "Learn AI", path: learnHubPath },
          { name: cat.title, path: catPath },
          { name: sub.title, path: subPath },
        ]),
      ].join("\n    ");
      await writeHtml(
        `learn/${cat.slug}/${sub.slug}/index.html`,
        injectBody(
          injectMeta(
            template,
            {
              title: learnTitle(`${sub.title} — Learn AI`),
              description: clamp(sub.tagline, 158),
              canonical: `${siteUrl}${subPath}`,
              ogType: "website",
              ogImage: defaultOgImage,
            },
            subLd,
          ),
          renderToStaticMarkup(
            <LearnSubcategoryPage category={cat} subcategory={sub} />,
          ),
        ),
      );
      pages++;
      urls.push({
        loc: `${siteUrl}${subPath}`,
        lastmod: latestUpdated(sub.articles),
        changefreq: "weekly",
        priority: 0.6,
      });

      // ---- article pages ----
      for (const ref of sub.articles) {
        const article = articles.get(ref.slug);
        if (!article) {
          console.warn(`[prerender-learn] no article file for ${ref.slug} — skipped`);
          continue;
        }
        const artPath = learnArticlePath(cat.slug, sub.slug, ref.slug);
        const artUrl = `${siteUrl}${artPath}`;
        const artLd = [
          wrapJsonLd({
            "@context": "https://schema.org",
            "@type": ["TechArticle", "LearningResource"],
            headline: article.title,
            description: article.metaDescription,
            url: artUrl,
            datePublished: article.updated,
            dateModified: article.updated,
            author: { "@id": `${siteUrl}/#org` },
            publisher: { "@id": `${siteUrl}/#org` },
            isPartOf: { "@id": `${siteUrl}/#website` },
            mainEntityOfPage: { "@type": "WebPage", "@id": artUrl },
            image: defaultOgImage,
            inLanguage: "en-US",
            keywords: article.keywords.join(", "),
            articleSection: cat.title,
            proficiencyLevel: DIFFICULTY_LEVEL[article.difficulty],
            educationalLevel: DIFFICULTY_LEVEL[article.difficulty],
            learningResourceType: "Article",
            teaches: article.oneLiner,
            isAccessibleForFree: true,
          }),
          wrapJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: article.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
          // DefinedTerm: the Learn section is a glossary of "what is X" topics,
          // and DefinedTerm is the schema type AI engines use to extract a
          // term's authoritative definition. name = the bare-topic shortTitle,
          // description = the one-liner definition, set = the category glossary.
          wrapJsonLd({
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            "@id": `${artUrl}#term`,
            name: article.shortTitle,
            description: article.oneLiner,
            url: artUrl,
            inDefinedTermSet: {
              "@type": "DefinedTermSet",
              name: `AI/TLDR Learn — ${cat.title}`,
              url: `${siteUrl}${catPath}`,
            },
          }),
          breadcrumbLd(wrapJsonLd, siteUrl, [
            { name: "AI/TLDR", path: "/" },
            { name: "Learn AI", path: learnHubPath },
            { name: cat.title, path: catPath },
            { name: sub.title, path: subPath },
            // mirror the visible breadcrumb (ArticleBody uses shortTitle here)
            { name: article.shortTitle, path: artPath },
          ]),
        ].join("\n    ");
        await writeHtml(
          `learn/${cat.slug}/${sub.slug}/${ref.slug}/index.html`,
          injectBody(
            injectMeta(
              template,
              {
                title: learnTitle(article.seoTitle),
                description: clamp(article.metaDescription, 160),
                canonical: artUrl,
                ogType: "article",
                ogImage: defaultOgImage,
                publishedTime: article.updated,
              },
              artLd,
            ),
            renderToStaticMarkup(<ArticleBody article={article} />),
            article,
          ),
        );
        pages++;
        urls.push({
          loc: artUrl,
          lastmod: article.updated,
          changefreq: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  // ---- tool detail pages (/tools/<slug>) ----
  const toolDetails = loadToolDetails();
  let toolPages = 0;
  for (const detail of toolDetails.values()) {
    const tp = learnToolPath(detail.slug);
    const tUrl = `${siteUrl}${tp}`;
    const ghUrl = `https://github.com/${detail.repo}`;
    const toolLd = [
      wrapJsonLd({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "@id": `${tUrl}#software`,
        name: detail.name,
        description: detail.tagline,
        url: tUrl,
        codeRepository: ghUrl,
        ...(detail.language ? { programmingLanguage: detail.language } : {}),
        ...(detail.license ? { license: detail.license } : {}),
        applicationCategory: detail.categoryTitle,
        isAccessibleForFree: true,
        author: { "@id": `${siteUrl}/#org` },
      }),
      wrapJsonLd({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `Getting started with ${detail.name}`,
        description: detail.gettingStarted.intro || `Install and run ${detail.name}.`,
        step: detail.gettingStarted.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.heading,
          text: [s.body, s.code].filter(Boolean).join("\n") || s.heading,
        })),
      }),
      breadcrumbLd(wrapJsonLd, siteUrl, [
        { name: "AI/TLDR", path: "/" },
        { name: "AI Tools", path: learnLandscapePath },
        { name: detail.categoryTitle, path: `${learnLandscapePath}?cat=${detail.category}` },
        { name: detail.subcategoryTitle, path: `${learnLandscapePath}?cat=${detail.category}&sub=${detail.subcategory}` },
        { name: detail.name, path: tp },
      ]),
    ].join("\n    ");
    await writeHtml(
      `tools/${detail.slug}/index.html`,
      injectBody(
        injectMeta(
          template,
          {
            title: learnTitle(detail.seoTitle),
            description: clamp(detail.metaDescription, 160),
            canonical: tUrl,
            ogType: "article",
            ogImage: defaultOgImage,
          },
          toolLd,
        ),
        renderToStaticMarkup(<LearnToolPage detail={detail} />),
        detail,
      ),
    );
    toolPages++;
    // No lastmod: tool pages have no real per-page edit date (the live star
    // count comes from github-stars.json, merged at render — the README-derived
    // body is otherwise static). Omitting lastmod is more honest than stamping
    // `today` every build, and buildSitemap only emits <lastmod> when present.
    urls.push({ loc: tUrl, changefreq: "weekly", priority: 0.6 });
  }

  console.log(
    `[prerender-learn] wrote ${pages} learn pages (${learnArticleCount()} articles in taxonomy, ${articles.size} article files) + ${toolPages} tool pages`,
  );
  return urls;
}

/**
 * Visible "Learn AI" link strip injected into the prerendered HOMEPAGE
 * (outside #root, like the static FAQ) — internal links so crawlers
 * discover the Learn tree from the strongest page on the site.
 */
export function injectLearnLinksIntoHome(html: string): string {
  const links = learnTaxonomy.categories
    .map(
      (c) =>
        `<a href="${learnCategoryPath(c.slug)}" style="color:#f7ff00;text-decoration:none;border:1px solid #2a2a28;padding:4px 10px;display:inline-block;margin:0 6px 6px 0;font:600 11px 'JetBrains Mono',monospace;text-transform:uppercase">${c.title}</a>`,
    )
    .join("");
  const section =
    `<section class="static-learn" aria-label="Learn AI" style="max-width:760px;margin:0 auto 48px;padding:0 24px;font-family:Inter,system-ui,sans-serif">` +
    `<h2 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px">Learn AI from zero</h2>` +
    `<p style="color:#bbb;line-height:1.6;margin:0 0 16px">New to LLMs, RAG or agents? Our <a href="${learnHubPath}" style="color:#f7ff00">free Learn AI encyclopedia</a> explains every concept, tool and framework in plain English — ${learnArticleCount()} articles and counting.</p>` +
    `<div>${links}</div></section>`;
  return html.replace("</body>", () => `${section}\n  </body>`);
}
