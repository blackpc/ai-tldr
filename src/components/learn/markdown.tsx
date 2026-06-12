/**
 * Renderer for the inline markdown SUBSET allowed in Learn content
 * (`md` fields): **bold**, *italic*, `code`, [link](url). Nothing else —
 * no raw HTML ever reaches the DOM (everything is plain React text
 * nodes), which makes agent-generated content XSS-safe by construction.
 *
 * Links: internal links must start with "/" and are tagged with
 * `data-internal` so the page-level click handler can route them through
 * pushState; external links must be https and open in a new tab.
 *
 * SSR-safe: used by both the SPA and scripts/prerender-learn.tsx.
 */

import type { ReactNode } from "react";

// First match wins; ** is checked before * so bold isn't eaten by italic.
const TOKEN =
  /(`[^`]+`)|(\*\*[^*]+?\*\*)|(\*[^*\s][^*]*?\*)|(\[[^\]]+?\]\([^)\s]+?\))/;

const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/**
 * Normalize an internal page link to the trailing-slash form the host
 * serves (`foo/index.html` → `/foo/`), so author-written cross-links in
 * article prose never trigger a 307 on click or crawl. The root, already
 * slashed paths, and file assets (a dot in the last segment) are left as
 * is; any #fragment / ?query is preserved after the inserted slash.
 */
function internalHref(url: string): string {
  const m = url.match(/^([^?#]*)([?#].*)?$/);
  const path = m?.[1] ?? url;
  const suffix = m?.[2] ?? "";
  if (path === "/" || path === "" || path.endsWith("/")) return url;
  const lastSeg = path.slice(path.lastIndexOf("/") + 1);
  if (lastSeg.includes(".")) return url;
  return `${path}/${suffix}`;
}

function renderToken(token: string, key: number): ReactNode {
  if (token.startsWith("`")) {
    return <code key={key}>{token.slice(1, -1)}</code>;
  }
  if (token.startsWith("**")) {
    return <strong key={key}>{renderInlineMd(token.slice(2, -2))}</strong>;
  }
  if (token.startsWith("*")) {
    return <em key={key}>{renderInlineMd(token.slice(1, -1))}</em>;
  }
  const link = LINK.exec(token);
  if (link) {
    const [, text, url] = link;
    if (url.startsWith("/")) {
      return (
        <a key={key} href={internalHref(url)} data-internal="true">
          {renderInlineMd(text)}
        </a>
      );
    }
    if (url.startsWith("https://")) {
      return (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer">
          {renderInlineMd(text)}
        </a>
      );
    }
    // Disallowed scheme — render as plain text rather than a link.
    return <span key={key}>{text}</span>;
  }
  return token;
}

/** Parse the inline-md subset into React nodes. */
export function renderInlineMd(md: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = md;
  let key = 0;
  while (rest.length > 0) {
    const m = TOKEN.exec(rest);
    if (!m || m.index === undefined) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    out.push(renderToken(m[0], key++));
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

/** Strip the inline-md markers, for plain-text contexts (meta tags, TOC). */
export function stripInlineMd(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/\*([^*\s][^*]*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}
