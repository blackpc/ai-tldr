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

/** Explorer ranks, by fraction of the encyclopedia charted. */
const RANKS: [number, string][] = [
  [0.9, "SINGULARITY"],
  [0.6, "COMMANDER"],
  [0.35, "PILOT"],
  [0.15, "NAVIGATOR"],
  [0.05, "EXPLORER"],
  [0.000001, "CADET"], // anything read at all
  [0, "VISITOR"],
];

export function learnRank(read: number, total: number): string {
  const f = total > 0 ? read / total : 0;
  for (const [min, name] of RANKS) if (f >= min) return name;
  return "VISITOR";
}
