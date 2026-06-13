#!/usr/bin/env bun
/**
 * YouTube metadata helper.
 *
 * Usage:  bun scripts/yt-meta.ts <youtube-url-or-id> [channelId]
 *
 * Hits the public oembed endpoint (no auth, no scraping) and returns
 * a normalized JSON blob the agent can drop directly into a video item:
 *
 *   { videoId, title, channelName, channelUrl, thumbnailUrl,
 *     uploadDate, uploadDateSource, ageHours, freshFor72hBar }
 *
 * Upload date resolution (in order):
 *   1. If a channelId (UC…) is passed, read it from the channel RSS feed
 *      `youtube.com/feeds/videos.xml` — this is DATACENTER-SAFE and is
 *      the only reliable path on GitHub Actions runners. ALWAYS pass the
 *      channelId from yt-rss-scan.ts when you have it.
 *   2. Fallback: scrape the watch page for uploadDate. This works from a
 *      residential IP but YouTube bot-walls the watch page from
 *      datacenter IPs (CI), where it returns null → freshFor72hBar:false
 *      → the video gets dropped. That exact failure silently killed every
 *      cron video for 5+ weeks (SWEEP_MEMORY 2026-06-13). Never rely on
 *      this path in CI; pass channelId instead.
 *
 * Exit 0 = found, exit 1 = invalid input or oembed failure.
 */
const arg = process.argv[2];
const channelIdArg = process.argv[3];
if (!arg) {
  console.error("usage: bun scripts/yt-meta.ts <youtube-url-or-id> [channelId]");
  process.exit(1);
}

function extractVideoId(input: string): string | null {
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const u = new URL(input);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/(?:embed|shorts|v)\/([\w-]{11})/);
    if (m) return m[1];
  } catch {
    /* not a URL */
  }
  return null;
}

const videoId = extractVideoId(arg);
if (!videoId) {
  console.error(`could not extract video id from: ${arg}`);
  process.exit(1);
}

const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
  watchUrl,
)}&format=json`;

async function fetchUploadDateFromRss(
  channelId: string,
  id: string,
): Promise<string | null> {
  // The channel RSS feed is reachable from datacenter IPs (CI) and its
  // <published> is the authoritative upload timestamp. Fresh videos are
  // always present in the feed (latest ~15 entries), so this resolves any
  // ≤72h video reliably.
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { "User-Agent": "ai-tldr-sweep-bot" } },
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
    for (const entry of entries) {
      const vid = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      if (vid === id) {
        return entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchUploadDate(id: string): Promise<string | null> {
  // Scrape the watch page for the uploadDate / datePublished meta tag.
  // YouTube exposes these in JSON-LD and as <meta itemprop="datePublished">.
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ai-tldr-sweep-bot; +https://ai-tldr.dev)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/"uploadDate":"([^"]+)"/) ??
      html.match(/<meta itemprop="datePublished" content="([^"]+)"/) ??
      html.match(/"datePublished":"([^"]+)"/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

try {
  const res = await fetch(oembedUrl, {
    headers: { "User-Agent": "ai-tldr-sweep-bot" },
  });
  if (!res.ok) {
    console.error(`oembed returned ${res.status} for ${videoId}`);
    process.exit(1);
  }
  const data = (await res.json()) as {
    title?: string;
    author_name?: string;
    author_url?: string;
  };
  // Resolve the upload date: RSS first (datacenter-safe), watch-page
  // scrape only as a fallback for ad-hoc videos with no channelId.
  let uploadDate: string | null = null;
  let uploadDateSource: "rss" | "watch-page" | null = null;
  if (channelIdArg && /^UC[\w-]{22}$/.test(channelIdArg)) {
    uploadDate = await fetchUploadDateFromRss(channelIdArg, videoId);
    if (uploadDate) uploadDateSource = "rss";
  }
  if (!uploadDate) {
    uploadDate = await fetchUploadDate(videoId);
    if (uploadDate) uploadDateSource = "watch-page";
  }
  let ageHours: number | null = null;
  if (uploadDate) {
    const ms = Date.now() - new Date(uploadDate).getTime();
    if (Number.isFinite(ms)) ageHours = Math.floor(ms / (1000 * 60 * 60));
  }
  const out = {
    videoId,
    watchUrl,
    title: data.title ?? "",
    channelName: data.author_name ?? "",
    channelUrl: data.author_url ?? "",
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    uploadDate,
    uploadDateSource,
    ageHours,
    freshFor72hBar: ageHours !== null && ageHours <= 72,
  };
  console.log(JSON.stringify(out, null, 2));
} catch (err) {
  console.error(`oembed fetch failed: ${(err as Error).message}`);
  process.exit(1);
}
