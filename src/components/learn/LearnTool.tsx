/**
 * /tools/<slug> — a single tool's detail page.
 *
 * Uses the EXACT same layout primitives as a Learn article (lrn-article →
 * lrn-art-head + lrn-art-layout with a TOC rail → lrn-section / lrn-h2, and
 * the shared CodeBlock) so a tool page reads as part of the same encyclopedia.
 * Pure / SSR-safe — also rendered by prerender-learn.tsx.
 */

import landscapeData from "../../data/learn/landscape.json";
import githubStars from "../../data/learn/github-stars.json";
import type { Landscape, LandscapeToolDetail } from "../../data/learn/schema";
import {
  learnLandscapePath,
  learnToolPath,
} from "../../data/learn/schema";
import { Breadcrumbs } from "./ArticleBody";
import { Block } from "./Blocks";

const DATA = landscapeData as Landscape;
const STARS = githubStars as Record<string, number>;

const GH_MARK =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z";

function formatStars(n: number): string {
  if (n < 1000) return String(n);
  if (n < 100000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(n / 1000)}k`;
}

function starsOf(repo?: string): number {
  return repo ? STARS[repo.toLowerCase()] ?? 0 : 0;
}

/** Sibling tools in the same subcategory (excluding the current one). */
function relatedTools(detail: LandscapeToolDetail) {
  const cat = DATA.categories.find((c) => c.id === detail.category);
  const sub = cat?.subcategories.find((s) => s.id === detail.subcategory);
  return (sub?.tools ?? []).filter((t) => t.slug !== detail.slug).slice(0, 6);
}

interface CmpRow {
  name: string;
  slug: string;
  stars: number;
  description: string;
  isCurrent: boolean;
}

/**
 * Comparison rows for the whole subcategory (incl. this tool), by stars desc.
 * A crawlable comparison table is what AI answer engines lift for "best /
 * vs / alternatives" queries — built from data we already verify (tile
 * descriptions + stars). The current tool is always kept in the table.
 */
function comparisonRows(detail: LandscapeToolDetail): CmpRow[] {
  const cat = DATA.categories.find((c) => c.id === detail.category);
  const sub = cat?.subcategories.find((s) => s.id === detail.subcategory);
  const rows: CmpRow[] = (sub?.tools ?? [])
    .map((t) => ({
      name: t.name,
      slug: t.slug,
      stars: starsOf(t.repo),
      description: t.slug === detail.slug ? detail.tagline : t.description,
      isCurrent: t.slug === detail.slug,
    }))
    .sort((a, b) => b.stars - a.stars);
  const top = rows.slice(0, 8);
  if (!top.some((r) => r.isCurrent)) {
    const cur = rows.find((r) => r.isCurrent);
    if (cur) top[top.length - 1] = cur;
  }
  return top;
}

/** Small globe glyph for the website link. */
function GlobeGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.4" />
      <ellipse cx="8" cy="8" rx="2.6" ry="6.4" />
      <line x1="1.6" y1="8" x2="14.4" y2="8" />
    </svg>
  );
}

/** The full domain of a homepage URL, e.g. "https://www.ray.io/" → "ray.io". */
function domainOf(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function LearnToolPage({ detail }: { detail: LandscapeToolDetail }) {
  const stars = starsOf(detail.repo);
  const ghUrl = detail.repo ? `https://github.com/${detail.repo}` : undefined;
  const related = relatedTools(detail);
  const comparison = comparisonRows(detail);

  const toc = [
    { id: "overview", title: "Overview" },
    ...(detail.features.length > 0 ? [{ id: "features", title: "What it does" }] : []),
    { id: "getting-started", title: "Getting started" },
    ...(detail.useCases.length > 0 ? [{ id: "use-cases", title: "When to use it" }] : []),
    ...(comparison.length > 1 ? [{ id: "compare", title: "Compare" }] : []),
  ];

  const catHref = `${learnLandscapePath}?cat=${detail.category}&sub=${detail.subcategory}`;

  return (
    <article className="lrn-article lrn-tool">
      <header className="lrn-art-head lrn-tool-head">
        <Breadcrumbs
          trail={[
            { label: "AI Tools", href: learnLandscapePath },
            { label: detail.categoryTitle, href: `${learnLandscapePath}?cat=${detail.category}` },
            { label: detail.subcategoryTitle, href: catHref },
            { label: detail.name },
          ]}
        />
        <div className="lrn-tool-head-row">
          <div className="lrn-tool-head-main">
            <h1 className="lrn-art-title">{detail.name}</h1>
            <p className="lrn-art-tagline">{detail.tagline}</p>
          </div>
          {(detail.repo || detail.homepage) && (
            <div className="lrn-tool-head-links">
              {detail.repo && (
                <a
                  className="lrn-tool-headlink"
                  href={ghUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="lrn-gh-mark" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d={GH_MARK} />
                  </svg>
                  <span className="lrn-tool-headlink-loc">github.com/{detail.repo}</span>
                  {stars > 0 && (
                    <span className="lrn-tool-headlink-stars">★ {formatStars(stars)}</span>
                  )}
                </a>
              )}
              {detail.homepage && (
                <a
                  className="lrn-tool-headlink"
                  href={detail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GlobeGlyph />
                  <span className="lrn-tool-headlink-loc">{domainOf(detail.homepage)}</span>
                  <span className="lrn-tool-headlink-arrow" aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="lrn-tool-layout">
        <nav className="lrn-toc" aria-label="On this page">
          <span className="lrn-toc-h">// ON THIS PAGE</span>
          <ol>
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`}>{t.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lrn-art-content">
          <section id="overview" className="lrn-section" aria-labelledby="overview-h">
            <h2 className="lrn-h2" id="overview-h">
              <span className="lrn-h2-mark" aria-hidden="true">//</span> Overview
            </h2>
            {detail.overview.map((p, i) => (
              <p className="lrn-p" key={i}>
                {p}
              </p>
            ))}
          </section>

          {detail.features.length > 0 && (
            <section id="features" className="lrn-section" aria-labelledby="features-h">
              <h2 className="lrn-h2" id="features-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> What it does
              </h2>
              <ul className="lrn-list">
                {detail.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          )}

          <section
            id="getting-started"
            className="lrn-section"
            aria-labelledby="getting-started-h"
          >
            <h2 className="lrn-h2" id="getting-started-h">
              <span className="lrn-h2-mark" aria-hidden="true">//</span> Getting started
            </h2>
            {detail.gettingStarted.intro && (
              <p className="lrn-p">{detail.gettingStarted.intro}</p>
            )}
            {detail.gettingStarted.steps.map((s, i) => (
              <div key={i}>
                <h3 className="lrn-h3">{s.heading}</h3>
                {s.body && <p className="lrn-p">{s.body}</p>}
                {s.code && (
                  <Block block={{ type: "code", lang: s.lang || "text", code: s.code }} />
                )}
              </div>
            ))}
            <p className="lrn-p lrn-tool-src">
              Commands and code are distilled from the project's own
              documentation — always check the{" "}
              <a href={ghUrl ?? detail.homepage} target="_blank" rel="noopener noreferrer">
                {ghUrl ? "official repo" : "official docs"}
              </a>{" "}
              for the latest.
            </p>
          </section>

          {detail.useCases.length > 0 && (
            <section id="use-cases" className="lrn-section" aria-labelledby="use-cases-h">
              <h2 className="lrn-h2" id="use-cases-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> When to use it
              </h2>
              <ul className="lrn-list">
                {detail.useCases.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </section>
          )}

          {comparison.length > 1 && (
            <section id="compare" className="lrn-section" aria-labelledby="compare-h">
              <h2 className="lrn-h2" id="compare-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> How{" "}
                {detail.name} compares
              </h2>
              <p className="lrn-p">
                {detail.name} alongside other open-source{" "}
                {detail.subcategoryTitle.toLowerCase()} tools AI/TLDR tracks,
                ranked by GitHub stars.
              </p>
              <div className="lrn-table-wrap"><table className="lrn-table lrn-cmp">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th className="lrn-cmp-stars">Stars</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((r) => (
                    <tr key={r.slug} className={r.isCurrent ? "lrn-cmp-cur" : undefined}>
                      <td className="lrn-cmp-name">
                        {r.isCurrent ? (
                          <strong>{r.name}</strong>
                        ) : (
                          <a href={learnToolPath(r.slug)} data-internal="true">
                            {r.name}
                          </a>
                        )}
                      </td>
                      <td className="lrn-cmp-stars">
                        {r.stars > 0 ? `★ ${formatStars(r.stars)}` : "—"}
                      </td>
                      <td>{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </section>
          )}
        </div>

        <aside className="lrn-tool-aside" aria-label="Tool details">
          {/* Repo + website live in the header now (not duplicated here).
              Category + subcategory live in the breadcrumb. */}
          {(detail.language || detail.license) && (
            <dl className="lrn-tool-facts">
              {detail.language && (
                <div>
                  <dt>Language</dt>
                  <dd>{detail.language}</dd>
                </div>
              )}
              {detail.license && (
                <div>
                  <dt>License</dt>
                  <dd>{detail.license}</dd>
                </div>
              )}
            </dl>
          )}

          {related.length > 0 && (
            <div className="lrn-tool-related">
              <span className="lrn-tool-aside-h">
                // MORE IN {detail.subcategoryTitle}
              </span>
              <ul>
                {related.map((t) => (
                  <li key={t.slug}>
                    <a href={learnToolPath(t.slug)} data-internal="true">
                      <span className="lrn-tool-related-name">{t.name}</span>
                      {starsOf(t.repo) > 0 && (
                        <span className="lrn-tool-related-stars">
                          ★ {formatStars(starsOf(t.repo))}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <nav className="lrn-pn" aria-label="Back to the landscape">
        <a className="lrn-pn-link lrn-pn-prev" href={learnLandscapePath} data-internal="true">
          <span className="lrn-pn-dir">← AI TOOLS</span>
          <span className="lrn-pn-title">All open-source AI tools</span>
        </a>
        <span className="lrn-pn-spacer" />
      </nav>
    </article>
  );
}
