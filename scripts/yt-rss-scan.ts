#!/usr/bin/env bun
/**
 * Scans YouTube RSS feeds for all listed creators and returns videos
 * uploaded within the last 72 hours.
 *
 * Usage: bun scripts/yt-rss-scan.ts
 *
 * Output: JSON array of fresh video candidates, sorted by publishedAt DESC.
 * Each entry: { channelName, videoId, watchUrl, title, publishedAt, ageHours }
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
  title: string;
  publishedAt: string;
  ageHours: number;
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
          title,
          publishedAt: published,
          ageHours,
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
