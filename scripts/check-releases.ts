#!/usr/bin/env bun
/**
 * Validate the TYPED, structured release fields the sweep can populate:
 *   - benchmarks[]  — comparison-bar data (name + numeric scores)
 *   - pricing       — pricing-table rows
 *
 * The zero-hallucination invariant for both: every `source` URL MUST also be a
 * cited link on the item (`links[].url` or the item `url`). That makes the
 * numbers traceable — you can't render a bar or a price without pointing at
 * where it came from. Scores must be real numbers within their scale so the
 * bars can't overflow or render NaN.
 *
 * Wired into `bun run build` + `bun run typecheck` (after check-feed), so a
 * malformed benchmark/pricing block fails the build instead of shipping a
 * broken chart. Pure validation — writes nothing.
 */
import feed from "../src/data/releases.json" with { type: "json" };
import type { ReleaseItem } from "../src/data/schema";

const items = (feed as { items: ReleaseItem[] }).items;

const errors: string[] = [];
const err = (id: string, msg: string) => errors.push(`  [${id}] ${msg}`);

/** URLs we accept as a valid `source` for an item: its own url + cited links. */
function citedUrls(item: ReleaseItem): Set<string> {
  const s = new Set<string>();
  if (item.url) s.add(item.url.trim());
  for (const l of item.links ?? []) if (l.url) s.add(l.url.trim());
  return s;
}

let withBench = 0;
let withPricing = 0;

for (const item of items) {
  const cited = citedUrls(item);

  // ---- benchmarks ----
  if (item.benchmarks !== undefined) {
    if (!Array.isArray(item.benchmarks) || item.benchmarks.length === 0) {
      err(item.id, "benchmarks must be a non-empty array when present");
    } else {
      withBench++;
      item.benchmarks.forEach((b, bi) => {
        const at = `benchmarks[${bi}]`;
        if (!b.name || typeof b.name !== "string") {
          err(item.id, `${at}.name is required`);
        }
        if (!b.source || !cited.has(b.source.trim())) {
          err(
            item.id,
            `${at}.source "${b.source}" must be the item url or one of links[] (add it to links[])`,
          );
        }
        const max = b.max ?? 100;
        if (typeof max !== "number" || !(max > 0)) {
          err(item.id, `${at}.max must be a positive number (got ${b.max})`);
        }
        if (!Array.isArray(b.results) || b.results.length === 0) {
          err(item.id, `${at}.results must be a non-empty array`);
        } else {
          let highlights = 0;
          b.results.forEach((r, ri) => {
            const rat = `${at}.results[${ri}]`;
            if (!r.name || typeof r.name !== "string") {
              err(item.id, `${rat}.name is required`);
            }
            if (typeof r.score !== "number" || !Number.isFinite(r.score)) {
              err(item.id, `${rat}.score must be a finite number (got ${r.score})`);
            } else if (r.score < 0 || r.score > max) {
              err(item.id, `${rat}.score ${r.score} is outside 0..${max}`);
            }
            if (r.highlight) highlights++;
          });
          // With competitors, exactly one row must be flagged as the subject so
          // the accent bar is unambiguous.
          if (b.results.length > 1 && highlights !== 1) {
            err(
              item.id,
              `${at} has ${b.results.length} results but ${highlights} highlighted — flag exactly one (the subject) with highlight:true`,
            );
          }
        }
      });
    }
  }

  // ---- pricing ----
  if (item.pricing !== undefined) {
    const p = item.pricing;
    if (!p || typeof p !== "object" || !Array.isArray(p.tiers) || p.tiers.length === 0) {
      err(item.id, "pricing.tiers must be a non-empty array when pricing is present");
    } else {
      withPricing++;
      if (!p.source || !cited.has(p.source.trim())) {
        err(
          item.id,
          `pricing.source "${p.source}" must be the item url or one of links[] (add it to links[])`,
        );
      }
      p.tiers.forEach((t, ti) => {
        if (!t.plan || typeof t.plan !== "string") err(item.id, `pricing.tiers[${ti}].plan is required`);
        if (!t.price || typeof t.price !== "string") err(item.id, `pricing.tiers[${ti}].price is required`);
      });
    }
  }
}

if (errors.length > 0) {
  console.error("releases: typed benchmark/pricing validation FAILED:");
  console.error(errors.join("\n"));
  console.error(
    "\nEvery benchmark/pricing `source` must be a cited link (zero-hallucination). " +
      "See prompts/update-releases.md.",
  );
  process.exit(1);
}

console.log(
  `releases ok — ${items.length} items (${withBench} with benchmarks, ${withPricing} with pricing), all sourced`,
);
