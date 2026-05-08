/**
 * Cloudflare Worker entrypoint.
 *
 * The site is 99% static — pre-rendered HTML + assets served by the
 * `ASSETS` binding. The Worker exists for one job:
 *
 *   /sitemap-news.xml  →  generate a Google News sitemap LIVE at
 *                          request time, filtered to items published in
 *                          the last 48 hours according to *now*, not
 *                          according to whenever the last build ran.
 *
 * Everything else falls through to the static asset binding (which
 * itself has SPA fallback configured in wrangler.jsonc).
 */

import type { ReleaseItem, ReleaseFeed } from "./data/schema";

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

const SITE_URL = "https://ai-tldr.dev";
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Fetch the deployed feed via the ASSETS binding. The build pipeline
 * copies `src/data/releases.json` to `dist/feed.json` so it's
 * available at /feed.json on the live site. Going through ASSETS
 * means the JSON is NOT inlined into the Worker bundle (which would
 * blow past the 1MB script-size limit).
 */
async function loadFeed(env: Env, request: Request): Promise<ReleaseFeed> {
  const feedUrl = new URL("/feed.json", request.url);
  const res = await env.ASSETS.fetch(new Request(feedUrl));
  if (!res.ok) throw new Error(`feed.json fetch failed: ${res.status}`);
  return (await res.json()) as ReleaseFeed;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildNewsSitemap(items: ReleaseItem[]): string {
  const cutoff = Date.now() - NEWS_WINDOW_MS;
  const recent = items
    .filter((it) => {
      const t = Date.parse(it.publishDate ?? it.date);
      return Number.isFinite(t) && t >= cutoff;
    })
    .slice(0, 1000);

  const urls = recent
    .map((it) => {
      const loc = `${SITE_URL}/releases/${it.id}`;
      const pubDate = it.publishDate ?? new Date(it.date).toISOString();
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>AI/TLDR</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(pubDate)}</news:publication_date>
      <news:title>${escapeXml(it.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap-news.xml") {
      const feed = await loadFeed(env, request);
      return new Response(buildNewsSitemap(feed.items), {
        headers: {
          "content-type": "application/xml; charset=utf-8",
          // Cache for 5 minutes at the edge — the news window is 48h,
          // so freshness here is generous; we just don't want the
          // sitemap to be regenerated on every Googlebot poke.
          "cache-control": "public, max-age=300, s-maxage=300",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
