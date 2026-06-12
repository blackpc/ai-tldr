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

function locPath(loc: LearnArticleLocation): string {
  return learnArticlePath(
    loc.category.slug,
    loc.subcategory.slug,
    loc.article.slug,
  );
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
      <span className="lrn-rel-title">{loc.article.title}</span>
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
              { label: article.title },
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
            <span className="lrn-pn-title">{prev.article.title}</span>
          </a>
        ) : (
          <span className="lrn-pn-spacer" />
        )}
        {next ? (
          <a className="lrn-pn-link lrn-pn-next" href={locPath(next)} data-internal="true">
            <span className="lrn-pn-dir">NEXT →</span>
            <span className="lrn-pn-title">{next.article.title}</span>
          </a>
        ) : (
          <span className="lrn-pn-spacer" />
        )}
      </nav>
    </article>
  );
}
