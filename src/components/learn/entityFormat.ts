/**
 * Pure helpers behind the catalogue product-page masthead (EntityHero.tsx).
 * They live in their own module because a file that exports BOTH components
 * and plain functions breaks React fast-refresh (eslint react-refresh).
 * Framework-free, so the prerenderers can use them too.
 */

import type { CSSProperties } from "react";

/**
 * Deterministic hue for an entity's monogram fallback. SHARED by the
 * landscape tiles and the tool page's hero icon — the same tool must get the
 * same monogram colour in the directory and on its own page, which is exactly
 * what two copies of this function would eventually break.
 */
export function monoStyle(seed: string): CSSProperties {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return { background: `hsl(${h} 42% 26%)` };
}

const INSTALL_RE =
  /^(pip|pip3|uv|uvx|npm|npx|pnpm|yarn|bun|bunx|brew|docker|curl|wget|go|cargo|conda|poetry|gem|apt|helm|git clone)\b/;

/**
 * The single-line install command for a tool, taken from the FIRST
 * getting-started step (which is README-grounded, so this invents nothing).
 * Returns null unless that step opens with a recognisable package-manager
 * command short enough to read at a glance — a multi-line snippet belongs in
 * the walkthrough, not the masthead.
 */
export function installCommand(code?: string): string | null {
  if (!code) return null;
  const first = code
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)[0];
  if (!first) return null;
  const cmd = first.replace(/^[$>]\s+/, "");
  if (cmd.length > 64 || !INSTALL_RE.test(cmd)) return null;
  return cmd;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-08-26" → "26 Aug 2026". A fixed table, not toLocaleDateString, so
 *  the prerendered HTML and the browser can't disagree about the locale. */
export function formatDay(iso?: string): string | undefined {
  if (!iso) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}
