/**
 * Reading-progress tracker for the Learn section — the fuel for the
 * knowledge-map gamification. Article pages call markRead() on view;
 * the 3D map reads the set to light up "charted" topics and award ranks.
 *
 * localStorage only (no backend, no identity): progress is per-browser,
 * silently absent during SSR/prerender.
 */

const KEY = "lrn-read-v1";

export function getReadSet(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function markRead(slug: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    const set = getReadSet();
    if (set.has(slug)) return;
    set.add(slug);
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* storage full / blocked — gamification is best-effort */
  }
}

/** City ranks, by fraction of the encyclopedia powered up. */
const RANKS: [number, string][] = [
  [0.9, "SINGULARITY"],
  [0.6, "MAYOR"],
  [0.35, "ARCHITECT"],
  [0.15, "ENGINEER"],
  [0.05, "OPERATOR"],
  [0.000001, "RESIDENT"], // anything read at all
  [0, "TOURIST"],
];

export function learnRank(read: number, total: number): string {
  const f = total > 0 ? read / total : 0;
  for (const [min, name] of RANKS) if (f >= min) return name;
  return "VISITOR";
}
