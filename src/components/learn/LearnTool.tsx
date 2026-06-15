/**
 * /learn/landscape/<slug> — a single open-source tool's detail page.
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
  learnHubPath,
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

function starsOf(repo: string): number {
  return STARS[repo.toLowerCase()] ?? 0;
}

/** Sibling tools in the same subcategory (excluding the current one). */
function relatedTools(detail: LandscapeToolDetail) {
  const cat = DATA.categories.find((c) => c.id === detail.category);
  const sub = cat?.subcategories.find((s) => s.id === detail.subcategory);
  return (sub?.tools ?? []).filter((t) => t.slug !== detail.slug).slice(0, 6);
}

export function LearnToolPage({ detail }: { detail: LandscapeToolDetail }) {
  const stars = starsOf(detail.repo);
  const ghUrl = `https://github.com/${detail.repo}`;
  const related = relatedTools(detail);

  const toc = [
    { id: "overview", title: "Overview" },
    { id: "features", title: "What it does" },
    { id: "getting-started", title: "Getting started" },
    { id: "use-cases", title: "When to use it" },
    ...(related.length > 0 ? [{ id: "related", title: "Related tools" }] : []),
  ];

  return (
    <article className="lrn-article">
      <header className="lrn-art-head">
        <Breadcrumbs
          trail={[
            { label: "LEARN", href: learnHubPath },
            { label: "Landscape", href: learnLandscapePath },
            { label: detail.name },
          ]}
        />
        <h1 className="lrn-art-title">{detail.name}</h1>
        <p className="lrn-art-tagline">{detail.tagline}</p>
        <div className="lrn-art-meta">
          <span className="lrn-art-updated">
            {detail.categoryTitle} · {detail.subcategoryTitle}
          </span>
          {detail.language && (
            <span className="lrn-art-updated">{detail.language}</span>
          )}
          {detail.license && (
            <span className="lrn-art-updated">{detail.license}</span>
          )}
        </div>
        <div className="lrn-art-links" aria-label="Official links">
          <a
            className="lrn-art-home lrn-art-gh"
            href={ghUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="lrn-gh-mark"
              viewBox="0 0 16 16"
              width="15"
              height="15"
              aria-hidden="true"
            >
              <path fill="currentColor" d={GH_MARK} />
            </svg>
            <span className="lrn-art-home-loc">{detail.repo}</span>
            {stars > 0 && (
              <span className="lrn-gh-stars">
                <span className="lrn-gh-star" aria-hidden="true">
                  ★
                </span>
                {formatStars(stars)}
              </span>
            )}
          </a>
          {detail.homepage && (
            <a
              className="lrn-art-home"
              href={detail.homepage}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="lrn-art-home-kind">WEBSITE</span>
              <span className="lrn-art-home-loc">
                {detail.homepage.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </span>
              <span className="lrn-art-home-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          )}
        </div>
      </header>

      <div className="lrn-art-layout">
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
              <a href={ghUrl} target="_blank" rel="noopener noreferrer">
                official repo
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
        </div>
      </div>

      {related.length > 0 && (
        <section id="related" className="lrn-related" aria-label="Related tools">
          <h2 className="lrn-h2">
            <span className="lrn-h2-mark" aria-hidden="true">//</span> More in{" "}
            {detail.subcategoryTitle}
          </h2>
          <div className="lrn-rel-grid">
            {related.map((t) => (
              <a
                className="lrn-rel-card"
                href={learnToolPath(t.slug)}
                data-internal="true"
                key={t.slug}
              >
                <span className="lrn-rel-meta">
                  <span className="lrn-rel-cat">{detail.subcategoryTitle}</span>
                  {starsOf(t.repo) > 0 && (
                    <span className="lrn-rel-stars">
                      ★ {formatStars(starsOf(t.repo))}
                    </span>
                  )}
                </span>
                <span className="lrn-rel-title">{t.name}</span>
                <span className="lrn-rel-line">{t.description}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <nav className="lrn-pn" aria-label="Back to the landscape">
        <a className="lrn-pn-link lrn-pn-prev" href={learnLandscapePath} data-internal="true">
          <span className="lrn-pn-dir">← LANDSCAPE</span>
          <span className="lrn-pn-title">All open-source AI tools</span>
        </a>
        <span className="lrn-pn-spacer" />
      </nav>
    </article>
  );
}
