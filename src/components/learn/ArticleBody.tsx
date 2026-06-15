/**
 * Full article page body — the single master template every Learn article
 * renders through. Breadcrumbs, header, sticky TOC, sections, FAQ,
 * related cards, prev/next, further reading.
 *
 * SSR-safe: all links are plain <a href>; internal ones carry
 * `data-internal` and are intercepted by LearnSection's click delegate
 * in the SPA. No vite-specific APIs here (prerender imports this file).
 */

import { useEffect } from "react";

import type { LearnArticle } from "../../data/learn/schema";
import {
  LEARN_DIFFICULTY_META,
  learnArticlePath,
  learnCategoryPath,
  learnHubPath,
  learnReadingMinutes,
  learnSubcategoryPath,
} from "../../data/learn/schema";
import {
  findLearnArticle,
  learnPrevNext,
  type LearnArticleLocation,
} from "../../data/learn/nav";
import { renderInlineMd } from "./markdown";
import { Block } from "./Blocks";
import { markRead } from "./learnProgress";
import githubStars from "../../data/learn/github-stars.json";

function locPath(loc: LearnArticleLocation): string {
  return learnArticlePath(
    loc.category.slug,
    loc.subcategory.slug,
    loc.article.slug,
  );
}

// GitHub octocat mark (16×16), filled with currentColor.
const GH_MARK =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z";

/** Parse a GitHub repo URL → {owner, repo}, or null if not a repo link. */
function githubRepo(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, "") !== "github.com") return null;
    const p = u.pathname.split("/").filter(Boolean);
    if (p.length < 2) return null;
    if (["features", "marketplace", "sponsors", "about", "topics"].includes(p[0].toLowerCase())) return null;
    return { owner: p[0], repo: p[1] };
  } catch {
    return null;
  }
}

/** GitHub-style star count: 950, 1.2k, 82.9k, 174k. */
function formatStars(n: number): string {
  if (n < 1000) return String(n);
  if (n < 100000) {
    const k = (n / 1000).toFixed(1).replace(/\.0$/, "");
    return `${k}k`;
  }
  return `${Math.round(n / 1000)}k`;
}

/** Label + short display for the prominent official-link button. */
function homepageMeta(url: string): { kind: string; display: string } {
  let host = "";
  let pathname = "";
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    pathname = u.pathname;
  } catch {
    return { kind: "OFFICIAL", display: url };
  }
  const seg = (n: number) => pathname.split("/").filter(Boolean).slice(0, n).join("/");
  if (host === "github.com") return { kind: "GITHUB", display: `github.com/${seg(2)}` };
  if (host === "huggingface.co") return { kind: "HUGGING FACE", display: `huggingface.co/${seg(2)}` };
  if (host === "arxiv.org") return { kind: "PAPER", display: "arXiv" };
  if (host.endsWith("wikipedia.org")) return { kind: "REFERENCE", display: "Wikipedia" };
  if (host.startsWith("docs.") || /(^|\/)docs(\/|$)/.test(pathname))
    return { kind: "DOCS", display: host };
  return { kind: "OFFICIAL SITE", display: host };
}

export function DifficultyBadge({
  level,
}: {
  level: LearnArticle["difficulty"];
}) {
  const meta = LEARN_DIFFICULTY_META[level];
  return <span className={`badge lrn-diff ${meta.cls}`}>{meta.label}</span>;
}

export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className="lrn-crumbs" aria-label="Breadcrumb">
      {trail.map((c, i) => (
        <span className="lrn-crumb" key={i}>
          {i > 0 && <span className="lrn-crumb-sep" aria-hidden="true">/</span>}
          {c.href ? (
            <a href={c.href} data-internal="true">
              {c.label}
            </a>
          ) : (
            <span className="lrn-crumb-here" aria-current="page">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

function RelatedCard({ loc }: { loc: LearnArticleLocation }) {
  return (
    <a className="lrn-rel-card" href={locPath(loc)} data-internal="true">
      <span className="lrn-rel-meta">
        <DifficultyBadge level={loc.article.difficulty} />
        <span className="lrn-rel-cat">{loc.subcategory.title}</span>
      </span>
      <span className="lrn-rel-title">{loc.article.shortTitle}</span>
      <span className="lrn-rel-line">{loc.article.oneLiner}</span>
    </a>
  );
}

export function ArticleBody({ article }: { article: LearnArticle }) {
  // Chart this topic on the knowledge galaxy (client-only; no-op in SSR).
  useEffect(() => {
    markRead(article.slug);
  }, [article.slug]);

  const loc = findLearnArticle(article.slug);
  const { prev, next } = learnPrevNext(article.slug);
  const minutes = learnReadingMinutes(article);
  const links = article.links ?? [];
  const related = article.related
    .map((slug) => findLearnArticle(slug))
    .filter((l): l is LearnArticleLocation => l !== null && l.article.slug !== article.slug);

  const toc = [
    ...article.sections.map((s) => ({ id: s.id, title: s.title })),
    ...(article.faq.length > 0 ? [{ id: "faq", title: "FAQ" }] : []),
  ];

  return (
    <article className="lrn-article">
      <header className="lrn-art-head">
        {loc && (
          <Breadcrumbs
            trail={[
              { label: "LEARN", href: learnHubPath },
              {
                label: loc.category.title,
                href: learnCategoryPath(loc.category.slug),
              },
              {
                label: loc.subcategory.title,
                href: learnSubcategoryPath(loc.category.slug, loc.subcategory.slug),
              },
              { label: article.shortTitle },
            ]}
          />
        )}
        <h1 className="lrn-art-title">{article.title}</h1>
        <p className="lrn-art-tagline">{article.oneLiner}</p>
        <div className="lrn-art-meta">
          <DifficultyBadge level={article.difficulty} />
          <span className="lrn-art-minutes">{minutes} MIN READ</span>
          <span className="lrn-art-updated">UPDATED {article.updated}</span>
        </div>
        {links.length > 0 && (
          <div className="lrn-art-links" aria-label="Official links">
            {links.map((url) => {
              const gh = githubRepo(url);
              if (gh) {
                const stars = (githubStars as Record<string, number>)[
                  `${gh.owner}/${gh.repo}`.toLowerCase()
                ];
                return (
                  <a
                    key={url}
                    className="lrn-art-home lrn-art-gh"
                    href={url}
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
                    <span className="lrn-art-home-loc">
                      {gh.owner}/{gh.repo}
                    </span>
                    {typeof stars === "number" && (
                      <span className="lrn-gh-stars">
                        <span className="lrn-gh-star" aria-hidden="true">
                          ★
                        </span>
                        {formatStars(stars)}
                      </span>
                    )}
                  </a>
                );
              }
              const m = homepageMeta(url);
              return (
                <a
                  key={url}
                  className="lrn-art-home"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="lrn-art-home-kind">{m.kind}</span>
                  <span className="lrn-art-home-loc">{m.display}</span>
                  <span className="lrn-art-home-arrow" aria-hidden="true">↗</span>
                </a>
              );
            })}
          </div>
        )}
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
          {article.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="lrn-section"
              aria-labelledby={`${section.id}-h`}
            >
              <h2 className="lrn-h2" id={`${section.id}-h`}>
                <span className="lrn-h2-mark" aria-hidden="true">//</span>{" "}
                {section.title}
              </h2>
              {section.blocks.map((block, i) => (
                <Block block={block} key={i} />
              ))}
            </section>
          ))}

          {article.faq.length > 0 && (
            <section id="faq" className="lrn-section lrn-faq" aria-labelledby="faq-h">
              <h2 className="lrn-h2" id="faq-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> FAQ
              </h2>
              {article.faq.map((f, i) => (
                <details className="lrn-faq-item" key={i}>
                  <summary>{f.q}</summary>
                  <p>{renderInlineMd(f.a)}</p>
                </details>
              ))}
            </section>
          )}

          {article.furtherReading.length > 0 && (
            <section className="lrn-section lrn-further">
              <h2 className="lrn-h2">
                <span className="lrn-h2-mark" aria-hidden="true">//</span>{" "}
                Further reading
              </h2>
              <ul className="lrn-further-list">
                {article.furtherReading.map((f, i) => (
                  <li key={i}>
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {f.title} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="lrn-related" aria-label="Related articles">
          <h2 className="lrn-h2">
            <span className="lrn-h2-mark" aria-hidden="true">//</span> Related
          </h2>
          <div className="lrn-rel-grid">
            {related.map((l) => (
              <RelatedCard loc={l} key={l.article.slug} />
            ))}
          </div>
        </section>
      )}

      <nav className="lrn-pn" aria-label="Previous and next article">
        {prev ? (
          <a className="lrn-pn-link lrn-pn-prev" href={locPath(prev)} data-internal="true">
            <span className="lrn-pn-dir">← PREV</span>
            <span className="lrn-pn-title">{prev.article.shortTitle}</span>
          </a>
        ) : (
          <span className="lrn-pn-spacer" />
        )}
        {next ? (
          <a className="lrn-pn-link lrn-pn-next" href={locPath(next)} data-internal="true">
            <span className="lrn-pn-dir">NEXT →</span>
            <span className="lrn-pn-title">{next.article.shortTitle}</span>
          </a>
        ) : (
          <span className="lrn-pn-spacer" />
        )}
      </nav>
    </article>
  );
}
