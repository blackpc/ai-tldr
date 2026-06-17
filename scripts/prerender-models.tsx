/**
 * LLM-registry prerender — called by scripts/prerender.ts (never run
 * directly). For the registry hub (/models) and every model detail page
 * (/models/<slug>) it:
 *
 *   - renders the REAL React components (ModelsRegistryPage / ModelDetailPage)
 *     to static HTML and injects it into the SPA shell's #root, so crawlers
 *     get the full content without JavaScript
 *   - inlines models.css so the static content is styled before the lazy
 *     Models chunk loads (no FOUC for visitors landing from search)
 *   - embeds the detail JSON in a <script id="__MODELS_DATA__"> tag so the
 *     SPA's first client render matches the static HTML instantly
 *   - injects per-page meta + JSON-LD (CollectionPage + ItemList for the hub;
 *     SoftwareApplication + BreadcrumbList + FAQPage for each model)
 *
 * Returns the sitemap URL list for sitemap-models.xml.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import type { ModelRegistry, ModelDetail } from "../src/data/models/schema";
import { modelPath } from "../src/data/models/schema";
import registryData from "../src/data/models/registry.json";
import { ModelsRegistryPage } from "../src/components/models/ModelsRegistry";
import { ModelDetailPage } from "../src/components/models/ModelDetail";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODELS_DIR = join(ROOT, "src", "data", "models", "models");
const MODELS_CSS = readFileSync(
  join(ROOT, "src", "components", "models", "models.css"),
  "utf8",
);

const REGISTRY = registryData as ModelRegistry;
const MODELS_PATH = "/models/";

// ---- shared helper types (mirror prerender-learn) -------------------------

export interface ModelsPageMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  ogImage: string;
  publishedTime?: string;
}
export interface ModelsSitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}
type InjectMeta = (template: string, meta: ModelsPageMeta, extraJsonLd?: string) => string;
type WrapJsonLd = (data: unknown) => string;
type WriteHtml = (relPath: string, html: string) => Promise<void>;

// ---- data loading ---------------------------------------------------------

function loadDetails(): Map<string, ModelDetail> {
  const map = new Map<string, ModelDetail>();
  let files: string[] = [];
  try {
    files = readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return map;
  }
  for (const f of files) {
    try {
      const d = JSON.parse(readFileSync(join(MODELS_DIR, f), "utf8")) as ModelDetail;
      map.set(d.slug, d);
    } catch {
      console.warn(`[prerender-models] skipping unparseable ${f}`);
    }
  }
  return map;
}

// ---- HTML shell + injection ----------------------------------------------

function staticShell(inner: string): string {
  return (
    `<div class="page">` +
    `<header class="page-head">` +
    `<a class="brand" href="/" aria-label="AI/TLDR — home">` +
    `<span class="brand-mark">█</span><p class="brand-name">AI/TLDR</p></a>` +
    `</header>` +
    `<main class="reg-main">${inner}</main>` +
    `<footer class="page-footer">` +
    `<a href="/">Releases</a> · <a href="${MODELS_PATH}">LLM Registry</a> · ` +
    `<a href="/learn/">Learn AI</a> · <a href="/learn/landscape/">Landscape</a></footer>` +
    `</div>`
  );
}

function injectBody(html: string, bodyHtml: string, payload?: unknown): string {
  html = html.replace(
    "</head>",
    () => `  <style data-models-css>\n${MODELS_CSS}\n</style>\n  </head>`,
  );
  html = html.replace(
    /<div id="root"><\/div>/,
    () => `<div id="root">${staticShell(bodyHtml)}</div>`,
  );
  if (payload !== undefined) {
    const json = JSON.stringify(payload).replace(/</g, "\\u003c");
    html = html.replace(
      "</body>",
      () => `  <script type="application/json" id="__MODELS_DATA__">${json}</script>\n  </body>`,
    );
  }
  return html;
}

function clamp(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}
function modelsTitle(raw: string): string {
  const brand = " | AI/TLDR";
  return (raw + brand).length <= 65 ? raw + brand : raw;
}

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

/** A crawlable, grouped list of every model in the registry, appended to the
 *  hub's static body. The Miller view only renders the selected family's tiles
 *  server-side, so this guarantees every detail page is reachable by a real
 *  <a href> from the hub (not just from the sitemap / JSON-LD). */
function allModelsIndex(): string {
  const groups = REGISTRY.makers
    .map((mk) => {
      const links = mk.lines
        .flatMap((l) => l.versions)
        .map(
          (m) =>
            `<li><a href="${modelPath(m.slug)}" data-internal="true">${m.name}</a></li>`,
        )
        .join("");
      return `<div class="reg-allgrp"><h2>${mk.title}</h2><ul>${links}</ul></div>`;
    })
    .join("");
  return (
    `<section class="reg-allindex" aria-label="All models by maker">` +
    `<h2 class="reg-allindex-h">All models</h2>${groups}</section>`
  );
}

// ---- main entry -----------------------------------------------------------

export async function prerenderModels(opts: {
  template: string;
  siteUrl: string;
  defaultOgImage: string;
  injectMeta: InjectMeta;
  wrapJsonLd: WrapJsonLd;
  writeHtml: WriteHtml;
}): Promise<ModelsSitemapUrl[]> {
  const { template, siteUrl, defaultOgImage, injectMeta, wrapJsonLd, writeHtml } = opts;
  const details = loadDetails();
  const urls: ModelsSitemapUrl[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const allModels = REGISTRY.makers.flatMap((mk) =>
    mk.lines.flatMap((l) => l.versions),
  );

  // ---- hub (/models) ----
  const hubMeta: ModelsPageMeta = {
    title: "LLM Registry — Compare AI Models, Benchmarks & Pricing | AI/TLDR",
    description:
      "A browsable registry of large language models — frontier and open-weight — with verified specs, benchmarks, pricing and APIs. Filter by maker, family and capability.",
    canonical: `${siteUrl}${MODELS_PATH}`,
    ogType: "website",
    ogImage: defaultOgImage,
  };
  const hubLd = [
    wrapJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl}${MODELS_PATH}#webpage`,
      url: `${siteUrl}${MODELS_PATH}`,
      name: "LLM Registry",
      description: hubMeta.description,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#org` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: allModels.length,
        itemListElement: allModels.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: m.name,
          description: m.blurb,
          url: `${siteUrl}${modelPath(m.slug)}`,
        })),
      },
    }),
    breadcrumbLd(wrapJsonLd, siteUrl, [
      { name: "AI/TLDR", path: "/" },
      { name: "LLM Registry", path: MODELS_PATH },
    ]),
  ].join("\n    ");
  await writeHtml(
    "models/index.html",
    injectBody(
      injectMeta(template, hubMeta, hubLd),
      renderToStaticMarkup(<ModelsRegistryPage />) + allModelsIndex(),
    ),
  );
  urls.push({ loc: `${siteUrl}${MODELS_PATH}`, lastmod: today, changefreq: "weekly", priority: 0.8 });

  // ---- per-model detail pages (/models/<slug>) ----
  let modelPages = 0;
  for (const detail of details.values()) {
    const mp = modelPath(detail.slug);
    const mUrl = `${siteUrl}${mp}`;
    const maker = REGISTRY.makers.find((mk) => mk.id === detail.maker);
    const makerHref = `/models/?maker=${detail.maker}`;
    const lineHref = `/models/?maker=${detail.maker}&line=${detail.line}`;

    const softwareLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${mUrl}#software`,
      name: detail.name,
      description: detail.metaDescription,
      url: mUrl,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Large Language Model",
      operatingSystem: "Cloud",
      author: {
        "@type": "Organization",
        name: detail.makerTitle,
        ...(maker?.homepage ? { url: maker.homepage } : {}),
      },
      publisher: { "@id": `${siteUrl}/#org` },
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntityOfPage: { "@type": "WebPage", "@id": mUrl },
      image: defaultOgImage,
      inLanguage: "en-US",
      keywords: detail.tags.join(", "),
      featureList: [
        ...detail.modalities.map((m) => `${m} input/output`),
        ...(detail.contextWindow ? [`${detail.contextWindow} context window`] : []),
        ...(detail.architecture ? [detail.architecture] : []),
      ],
      ...(detail.releaseDate ? { datePublished: detail.releaseDate } : {}),
      license: detail.license,
    };
    // Only assert a free offer when weights are openly downloadable (true).
    if (detail.openWeights) softwareLd.isAccessibleForFree = true;

    const blocks = [
      wrapJsonLd(softwareLd),
      breadcrumbLd(wrapJsonLd, siteUrl, [
        { name: "AI/TLDR", path: "/" },
        { name: "LLM Registry", path: MODELS_PATH },
        { name: detail.makerTitle, path: makerHref },
        { name: detail.lineTitle, path: lineHref },
        { name: detail.name, path: mp },
      ]),
      ...(detail.faq?.length
        ? [
            wrapJsonLd({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: detail.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          ]
        : []),
    ].join("\n    ");

    await writeHtml(
      `models/${detail.slug}/index.html`,
      injectBody(
        injectMeta(
          template,
          {
            title: modelsTitle(detail.seoTitle),
            description: clamp(detail.metaDescription, 160),
            canonical: mUrl,
            ogType: "article",
            ogImage: defaultOgImage,
            publishedTime: detail.releaseDate,
          },
          blocks,
        ),
        renderToStaticMarkup(<ModelDetailPage detail={detail} />),
        detail,
      ),
    );
    modelPages++;
    urls.push({
      loc: mUrl,
      lastmod: detail.releaseDate ?? today,
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  console.log(
    `[prerender-models] wrote 1 hub + ${modelPages} model pages (${allModels.length} models in registry, ${details.size} detail files)`,
  );
  return urls;
}

/**
 * Visible "Compare LLMs" link strip injected into the prerendered HOMEPAGE
 * (outside #root, like the static FAQ / Learn strip) — internal links so
 * crawlers discover the registry from the strongest page on the site.
 */
export function injectModelsLinksIntoHome(html: string): string {
  const links = REGISTRY.makers
    .map(
      (mk) =>
        `<a href="/models/?maker=${mk.id}" style="color:#4fe0c0;text-decoration:none;border:1px solid #2a2a28;padding:4px 10px;display:inline-block;margin:0 6px 6px 0;font:600 11px 'JetBrains Mono',monospace;text-transform:uppercase">${mk.title}</a>`,
    )
    .join("");
  const total = REGISTRY.makers.reduce(
    (n, mk) => n + mk.lines.reduce((m, l) => m + l.versions.length, 0),
    0,
  );
  const section =
    `<section class="static-models" aria-label="LLM Registry" style="max-width:760px;margin:0 auto 48px;padding:0 24px;font-family:Inter,system-ui,sans-serif">` +
    `<h2 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px">Compare AI models</h2>` +
    `<p style="color:#bbb;line-height:1.6;margin:0 0 16px">Our <a href="${MODELS_PATH}" style="color:#4fe0c0">LLM registry</a> tracks ${total} large language models — frontier and open-weight — with verified specs, benchmarks, pricing and APIs, one detail page each.</p>` +
    `<div>${links}</div></section>`;
  return html.replace("</body>", () => `${section}\n  </body>`);
}
