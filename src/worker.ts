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

/**
 * Security headers applied to every response. We deploy on Workers, not
 * Pages, so a `public/_headers` file would be ignored — these live in code.
 *
 * The CSP allowlist is tailored to what the site actually loads:
 *   - script:  self + inline + pomegra analytics + Google Fonts loader
 *   - style/font: self + inline + Google Fonts
 *   - img:     any https (article/source thumbnails), plus data:/blob:
 *   - connect: self (feed.json, chunks) + Buttondown (newsletter) + pomegra
 *   - frame:   YouTube (release video embeds in ReleaseImage.tsx)
 * `frame-ancestors 'none'` blocks clickjacking; `object-src 'none'` blocks
 * legacy plugin embeds. External <a href> links are navigations, which CSP
 * does not restrict, so the many outbound article links need no allowlisting.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://analytics.pomegra.io https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://buttondown.com https://analytics.pomegra.io",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/** Return a copy of `res` with the security headers added. */
function withSecurityHeaders(res: Response): Response {
  const out = new Response(res.body, res);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    out.headers.set(name, value);
  }
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap-news.xml") {
      const feed = await loadFeed(env, request);
      return withSecurityHeaders(
        new Response(buildNewsSitemap(feed.items), {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            // Cache for 5 minutes at the edge — the news window is 48h,
            // so freshness here is generous; we just don't want the
            // sitemap to be regenerated on every Googlebot poke.
            "cache-control": "public, max-age=300, s-maxage=300",
          },
        }),
      );
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
