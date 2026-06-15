/**
 * /learn/landscape/<slug> — a single open-source tool's detail page.
 *
 * SEO-targeted, standalone page: long-form overview, capability bullets, a
 * grounded getting-started walkthrough with real code, use cases, links and
 * related tools. Pure / SSR-safe — also rendered by prerender-learn.tsx.
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
  return (sub?.tools ?? [])
    .filter((t) => t.slug !== detail.slug)
    .slice(0, 8);
}

export function LearnToolPage({ detail }: { detail: LandscapeToolDetail }) {
  const stars = starsOf(detail.repo);
  const ghUrl = `https://github.com/${detail.repo}`;
  const related = relatedTools(detail);

  return (
    <article className="lrn-page lrn-tool">
      <header className="lrn-tool-head">
        <Breadcrumbs
          trail={[
            { label: "LEARN", href: learnHubPath },
            { label: "Landscape", href: learnLandscapePath },
            { label: detail.name },
          ]}
        />
        <span className="lrn-tool-eyebrow">
          {detail.categoryTitle} · {detail.subcategoryTitle}
        </span>
        <h1 className="lrn-tool-title">{detail.name}</h1>
        <p className="lrn-tool-tagline">{detail.tagline}</p>

        <div className="lrn-tool-actions">
          <a
            className="lrn-tool-gh"
            href={ghUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="lrn-tool-gh-mark" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="15" height="15">
                <path fill="currentColor" d={GH_MARK} />
              </svg>
            </span>
            <span className="lrn-tool-gh-repo">{detail.repo}</span>
            {stars > 0 && (
              <span className="lrn-tool-gh-stars">
                <span className="lrn-tool-star" aria-hidden="true">
                  ★
                </span>
                {formatStars(stars)}
              </span>
            )}
          </a>
          {detail.homepage && (
            <a
              className="lrn-tool-home"
              href={detail.homepage}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website <span aria-hidden="true">↗</span>
            </a>
          )}
          {detail.language && (
            <span className="lrn-tool-chip">{detail.language}</span>
          )}
          {detail.license && (
            <span className="lrn-tool-chip">{detail.license}</span>
          )}
        </div>
      </header>

      <div className="lrn-tool-body">
        <section className="lrn-tool-sec">
          <h2 className="lrn-tool-h2">Overview</h2>
          {detail.overview.map((p, i) => (
            <p className="lrn-tool-p" key={i}>
              {p}
            </p>
          ))}
        </section>

        {detail.features.length > 0 && (
          <section className="lrn-tool-sec">
            <h2 className="lrn-tool-h2">What it does</h2>
            <ul className="lrn-tool-feats">
              {detail.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="lrn-tool-sec">
          <h2 className="lrn-tool-h2">Getting started</h2>
          {detail.gettingStarted.intro && (
            <p className="lrn-tool-p">{detail.gettingStarted.intro}</p>
          )}
          <ol className="lrn-tool-steps">
            {detail.gettingStarted.steps.map((s, i) => (
              <li className="lrn-tool-step" key={i}>
                <h3 className="lrn-tool-step-h">{s.heading}</h3>
                {s.body && <p className="lrn-tool-p">{s.body}</p>}
                {s.code && (
                  <div className="lrn-tool-code">
                    {s.lang && (
                      <span className="lrn-tool-code-lang">{s.lang}</span>
                    )}
                    <pre>
                      <code>{s.code}</code>
                    </pre>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p className="lrn-tool-note">
            Commands and code are distilled from the project's own
            documentation — always check the{" "}
            <a href={ghUrl} target="_blank" rel="noopener noreferrer">
              official repo
            </a>{" "}
            for the latest.
          </p>
        </section>

        {detail.useCases.length > 0 && (
          <section className="lrn-tool-sec">
            <h2 className="lrn-tool-h2">When to use it</h2>
            <ul className="lrn-tool-uses">
              {detail.useCases.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="lrn-tool-sec">
            <h2 className="lrn-tool-h2">
              More in {detail.subcategoryTitle}
            </h2>
            <div className="lrn-tool-related">
              {related.map((t) => (
                <a
                  className="lrn-tool-rel"
                  href={learnToolPath(t.slug)}
                  data-internal="true"
                  key={t.slug}
                >
                  <span className="lrn-tool-rel-name">{t.name}</span>
                  {starsOf(t.repo) > 0 && (
                    <span className="lrn-tool-rel-stars">
                      <span className="lrn-tool-star" aria-hidden="true">
                        ★
                      </span>
                      {formatStars(starsOf(t.repo))}
                    </span>
                  )}
                  <span className="lrn-tool-rel-desc">{t.description}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <a className="lrn-tool-back" href={learnLandscapePath} data-internal="true">
          ← Back to the AI tooling landscape
        </a>
      </div>
    </article>
  );
}
