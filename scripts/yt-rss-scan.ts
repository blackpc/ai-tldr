#!/usr/bin/env bun
/**
 * Scans YouTube RSS feeds for all listed creators and returns videos
 * uploaded within the last 72 hours.
 *
 * Usage: bun scripts/yt-rss-scan.ts
 *
 * Output: JSON array of fresh, SHIP-READY video candidates, sorted by
 * publishedAt DESC. Each entry carries everything needed to build a
 * `video` ReleaseItem with no further network calls:
 *   { channelName, channelId, videoId, watchUrl, channelUrl, thumbnailUrl,
 *     title, publishedAt, uploadDate, ageHours, freshFor72hBar }
 *
 * Why this is the authoritative freshness source (DO NOT re-derive the
 * upload date from a watch-page scrape): the RSS endpoint
 * `youtube.com/feeds/videos.xml` is reachable from datacenter IPs
 * (GitHub Actions runners), whereas the watch page `youtube.com/watch`
 * is bot-walled there and returns a consent page with NO uploadDate.
 * `<published>` in the RSS entry IS the upload timestamp, so it is both
 * correct and CI-safe. See SWEEP_MEMORY 2026-06-13 (the "919h, zero
 * videos in CI" bug). `freshFor72hBar` is always true here — only
 * videos within the 72h window are returned.
 */

const CHANNELS: { name: string; id: string }[] = [
  { name: "Two Minute Papers",  id: "UCbfYPyITQ-7l4upoX8nvctg" },
  { name: "AI Explained",       id: "UCNJ1Ymd5yFuUPtn21xtRbbw" },
  { name: "Yannic Kilcher",     id: "UCZHmQk67mSJgfCCTn7xBfew" },
  { name: "Fireship",           id: "UCsBjURrPoezykLs9EqgamOA" },
  { name: "Matthew Berman",     id: "UCzi5kcwU8aT4aLR7LcYhfWQ" },
  { name: "Sam Witteveen",      id: "UC55ODQSvARtgSyc8ThfiepQ" },
  { name: "1littlecoder",       id: "UCpV_X0VrL8-jg3t6wYGS-1g" },
  { name: "Wes Roth",           id: "UCqcbQf6yw5KzRoDDcZ_wBSw" },
];

const WINDOW_H = 72;

interface FreshVideo {
  channelName: string;
  channelId: string;
  videoId: string;
  watchUrl: string;
  /** Canonical channel page — datacenter-safe, always valid. */
  channelUrl: string;
  /** Deterministic thumbnail (i.ytimg.com returns 200 image/* from CI). */
  thumbnailUrl: string;
  title: string;
  publishedAt: string;
  /** Authoritative RSS upload timestamp (== publishedAt). Use as `date`. */
  uploadDate: string;
  ageHours: number;
  /** Always true: only ≤72h videos are returned. The CI-safe gate. */
  freshFor72hBar: true;
}

async function scanChannel(channel: { name: string; id: string }): Promise<FreshVideo[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "ai-tldr-sweep-bot" } });
    if (!res.ok) {
      console.error(`[yt-rss-scan] ${channel.name} (${channel.id}): HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
    const now = Date.now();
    const fresh: FreshVideo[] = [];

    for (const entry of entries) {
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      if (!videoId || !title || !published) continue;

      const ageHours = Math.floor((now - new Date(published).getTime()) / (1000 * 60 * 60));
      if (ageHours <= WINDOW_H) {
        fresh.push({
          channelName: channel.name,
          channelId: channel.id,
          videoId,
          watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
          channelUrl: `https://www.youtube.com/channel/${channel.id}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          title,
          publishedAt: published,
          uploadDate: published,
          ageHours,
          freshFor72hBar: true,
        });
      }
    }
    return fresh;
  } catch (err) {
    console.error(`[yt-rss-scan] ${channel.name}: ${(err as Error).message}`);
    return [];
  }
}

const results = (await Promise.all(CHANNELS.map(scanChannel))).flat();
results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

console.log(JSON.stringify(results, null, 2));
if (results.length === 0) {
  console.error("[yt-rss-scan] No fresh videos found in the last 72h across all channels.");
}
