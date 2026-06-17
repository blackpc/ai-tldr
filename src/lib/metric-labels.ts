/**
 * Metric normalization — shared by the release modal, the spec bar, and the
 * prerendered release page so all three render metrics identically.
 *
 * The sweep has historically emitted the SAME fact under many key spellings
 * (GitHub stars appear under "GitHub stars", "stars", "githubStars",
 * "github-stars", "Stars", "Repo stars"). Showing the raw camelCase key
 * (`inputPricePerMTokens: $10`) looks unfinished and splits one fact across
 * rows. This collapses synonyms to a canonical key + a clean label + a stable
 * display order, with a humanized fallback for anything unrecognized.
 *
 * Zero-hallucination: this only RELABELS/REORDERS the agent's verified values.
 * It never invents a value.
 */

export interface NormalizedMetric {
  /** Canonical key (deduped). */
  key: string;
  /** Human label, e.g. "GitHub stars", "Price (input)". */
  label: string;
  /** The original value, lightly formatted (numbers get thousands separators). */
  value: string;
  /** Lower = shown first. */
  order: number;
  /** Price/headline metrics get the accent color. */
  accent?: boolean;
}

interface Canon {
  canon: string;
  label: string;
  order: number;
  accent?: boolean;
}

/** normalized-alias → canonical metric. Alias is lowercased + alnum-only. */
const ALIAS: Record<string, Canon> = {};
function register(c: Canon, aliases: string[]) {
  for (const a of aliases) ALIAS[a.toLowerCase().replace(/[^a-z0-9]/g, "")] = c;
}

// order groups: identity/spec (10-39) · popularity (40-49) · price (50-59) · benchmarks (60+)
register({ canon: "version", label: "Version", order: 12 }, ["version", "ver", "release"]);
register({ canon: "license", label: "License", order: 14 }, ["license", "licence", "licensing"]);
register({ canon: "params", label: "Parameters", order: 16 }, [
  "params", "parameters", "parametercount", "modelsize", "size", "totalparams",
]);
register({ canon: "activeParams", label: "Active params", order: 17 }, [
  "activeparams", "activeparameters", "activeparam",
]);
register({ canon: "context", label: "Context window", order: 18 }, [
  "context", "contextwindow", "contextlength", "contexttokens", "maxcontext", "ctx",
]);
register({ canon: "architecture", label: "Architecture", order: 20 }, ["architecture", "arch"]);
register({ canon: "modalities", label: "Modalities", order: 21 }, ["modalities", "modality"]);
register({ canon: "stars", label: "GitHub stars", order: 40 }, [
  "stars", "githubstars", "githubstar", "repostars", "ghstars", "star", "githubstargazers",
]);
register({ canon: "downloads", label: "Downloads", order: 42 }, [
  "downloads", "hfdownloads", "downloadcount", "installs",
]);
register({ canon: "priceInput", label: "Price (input)", order: 50, accent: true }, [
  "priceinput", "inputprice", "inputpricepermtokens", "inputcost", "pricein",
  "pricepermtokeninput", "inputtokenprice", "inputpermillion",
]);
register({ canon: "priceOutput", label: "Price (output)", order: 51, accent: true }, [
  "priceoutput", "outputprice", "outputpricepermtokens", "outputcost", "priceout",
  "pricepermtokenoutput", "outputtokenprice", "outputpermillion",
]);
register({ canon: "price", label: "Price", order: 52, accent: true }, [
  "price", "pricing", "cost", "pricepermtoken", "pricepermtok",
]);
register({ canon: "swebench", label: "SWE-bench", order: 60 }, [
  "swebench", "swebenchverified", "swebenchscore", "swebenchverifiedscore",
]);
register({ canon: "mmlu", label: "MMLU", order: 62 }, ["mmlu", "mmlupro", "mmluproscore"]);
register({ canon: "gpqa", label: "GPQA", order: 63 }, ["gpqa", "gpqadiamond"]);
register({ canon: "humaneval", label: "HumanEval", order: 64 }, ["humaneval"]);

/** Turn a number-ish value into a display string with thousands separators. */
function fmtValue(raw: string | number): string {
  if (typeof raw === "number") return raw.toLocaleString("en-US");
  const s = String(raw).trim();
  // a bare integer string like "1593" or "1253" → group; leave "7.7K", "$3/Mtok", etc. as-is
  if (/^\d{4,}$/.test(s)) return Number(s).toLocaleString("en-US");
  return s;
}

/** Humanize an unrecognized key: split camelCase, replace -/_ with space, Title-case. */
function humanizeKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/);
  return words
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Normalize a release's freeform `metrics` map into a clean, ordered,
 * de-duplicated list. First spelling of a synonym wins.
 */
export function normalizeMetrics(
  metrics: Record<string, string | number> | undefined,
): NormalizedMetric[] {
  if (!metrics) return [];
  const seen = new Set<string>();
  const out: NormalizedMetric[] = [];
  let unknownOrder = 80;
  for (const [rawKey, rawVal] of Object.entries(metrics)) {
    if (rawVal === null || rawVal === undefined || String(rawVal).trim() === "") continue;
    const norm = rawKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    const canon = ALIAS[norm];
    const key = canon?.canon ?? norm;
    if (seen.has(key)) continue; // first spelling of a synonym wins
    seen.add(key);
    out.push({
      key,
      label: canon?.label ?? humanizeKey(rawKey),
      value: fmtValue(rawVal),
      order: canon?.order ?? unknownOrder++,
      accent: canon?.accent,
    });
  }
  return out.sort((a, b) => a.order - b.order);
}
