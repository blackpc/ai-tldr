#!/usr/bin/env bun
/**
 * Notify IndexNow (Bing, Yandex, Seznam, Naver — one submission, all
 * participating engines) of the URLs that changed in the latest sweep.
 *
 * Run by the sweep workflow AFTER the commit/push (which triggers the
 * Cloudflare deploy). We submit only what actually changed this run — the
 * homepage, /stats, and the release pages added this sweep — so we never
 * spam IndexNow with unchanged URLs.
 *
 * Ownership is proved by the key file at /<KEY>.txt (public/<KEY>.txt, copied
 * into the deploy by vite). The IndexNow key is public by design (it's served
 * at that URL), so it lives in source, not in a secret.
 *
 * Best-effort: this script NEVER fails the build — it logs and exits 0.
 *
 * Dry run (build the payload without submitting):
 *   INDEXNOW_DRY_RUN=1 bun scripts/ping-indexnow.ts
 */
import { readFileSync } from "node:fs";

const SITE = "https://ai-tldr.dev";
const HOST = "ai-tldr.dev";
const KEY = "69109beda2c94dd788a6d254b1131c7e";
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Release URLs added in the most recent sweep (from the sweep log). */
function latestAddedUrls(): string[] {
  try {
    const log = JSON.parse(readFileSync("src/data/sweeps.json", "utf8")) as {
      sweeps: { added?: { id?: string }[] }[];
    };
    const last = log.sweeps[log.sweeps.length - 1];
    return (last?.added ?? [])
      .map((a) => a.id)
      .filter((id): id is string => !!id)
      .map((id) => `${SITE}/releases/${id}/`);
  } catch {
    return [];
  }
}

// The homepage + /stats genuinely change every sweep (new items, new counts),
// so submitting them each run is legitimate, not spam.
const urlList = Array.from(
  new Set([`${SITE}/`, `${SITE}/stats/`, ...latestAddedUrls()]),
).slice(0, 1000); // IndexNow caps at 10k; we're always well under.

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList,
};

if (process.env.INDEXNOW_DRY_RUN) {
  console.log("[indexnow] DRY RUN — would submit:");
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

try {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  // 200 = accepted, 202 = accepted/pending validation. Anything else we just
  // log — never fail the workflow over a notification.
  console.log(
    `[indexnow] submitted ${urlList.length} url(s) -> ${res.status} ${res.statusText}`,
  );
} catch (err) {
  console.log(`[indexnow] submit failed (non-fatal): ${String(err)}`);
}
process.exit(0);
