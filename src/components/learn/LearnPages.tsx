/**
 * Learn hub (/learn), category (/learn/<cat>) and subcategory
 * (/learn/<cat>/<sub>) pages. Pure + SSR-safe — also rendered by
 * scripts/prerender-learn.tsx for the static HTML.
 *
 * Each category carries its own line icon + accent color (see
 * categoryVisuals) so the landing pages read as a set of distinct,
 * color-coded modules rather than a flat list. No article/topic counts
 * anywhere — the chrome stays editorial, not dashboard-y.
 */

import type { CSSProperties } from "react";
import type {
  LearnArticleRef,
  LearnCategory,
  LearnSubcategory,
} from "../../data/learn/schema";
import {
  learnArticlePath,
  learnCategoryPath,
  learnHubPath,
  learnMapPath,
  learnSubcategoryPath,
} from "../../data/learn/schema";
import { learnTaxonomy } from "../../data/learn/nav";
import articleImages from "../../data/learn/article-images.json";
import { Breadcrumbs, DifficultyBadge } from "./ArticleBody";
import { categoryVisual } from "./categoryVisuals";

/** Listing thumbnail for an article (its first image block), if any. */
function articleImage(slug: string): string | undefined {
  return (articleImages as Record<string, string>)[slug];
}

function pad(n: number): string {
  return String(n + 1).padStart(2, "0");
}

/** Tiny radial-graph glyph for the "see the whole map" hub link. */
function MapGlyph() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="16" y1="16" x2="16" y2="6" />
      <line x1="16" y1="16" x2="24" y2="11" />
      <line x1="16" y1="16" x2="25" y2="21" />
      <line x1="16" y1="16" x2="9" y2="23" />
      <line x1="16" y1="16" x2="7" y2="12" />
      <circle cx="16" cy="16" r="2.4" />
      <circle cx="16" cy="6" r="1.7" />
      <circle cx="24" cy="11" r="1.7" />
      <circle cx="25" cy="21" r="1.7" />
      <circle cx="9" cy="23" r="1.7" />
      <circle cx="7" cy="12" r="1.7" />
    </svg>
  );
}

/** Sets the per-category accent as a CSS custom property on a node. */
function accentVar(accent: string): CSSProperties {
  return { ["--cat" as string]: accent };
}

// ---------------------------------------------------------------------
// Hub — /learn
// ---------------------------------------------------------------------

export function LearnHubPage() {
  return (
    <div className="lrn-page">
      <header className="lrn-hub-head">
        <div className="lrn-hub-headline">
          <span className="lrn-hub-eyebrow">// THE FIELD GUIDE</span>
          <h1 className="lrn-hub-title">
            LEARN <span className="lrn-hub-title-accent">AI</span>
          </h1>
          <p className="lrn-hub-dek">
            A plain-English encyclopedia of AI engineering — LLMs, RAG,
            vector databases, agents, fine-tuning and the tools around them.
            Every page starts from zero and ends deep.
          </p>
        </div>
        <div className="lrn-hub-ctas">
          <a
            className="lrn-hub-citycta"
            href={learnMapPath}
            data-internal="true"
            style={{ backgroundImage: "url(/learn-media/city-hero.jpg)" }}
          >
            <span className="lrn-hub-citycta-grad" aria-hidden="true" />
            <span className="lrn-hub-citycta-top">
              <span className="lrn-hub-citycta-ic" aria-hidden="true">
                <MapGlyph />
              </span>
              <span className="lrn-hub-citycta-tag">INTERACTIVE · 3D</span>
            </span>
            <span className="lrn-hub-citycta-body">
              <span className="lrn-hub-citycta-lead">Enter Knowledge City</span>
              <span className="lrn-hub-citycta-sub">
                every article is a tower — read it to light it up
              </span>
              <span className="lrn-hub-citycta-go">
                ENTER <span aria-hidden="true">→</span>
              </span>
            </span>
          </a>
        </div>
      </header>

      <div className="lrn-cat-grid">
        {learnTaxonomy.categories.map((cat, i) => {
          const { accent, Icon } = categoryVisual(cat.slug);
          return (
            <a
              className="lrn-cat-card"
              href={learnCategoryPath(cat.slug)}
              data-internal="true"
              key={cat.slug}
              style={accentVar(accent)}
            >
              <span
                className="lrn-cat-bg"
                aria-hidden="true"
                style={{
                  backgroundImage: `url(/learn-media/cat-${cat.slug}.jpg)`,
                }}
              />
              <span className="lrn-cat-rail" aria-hidden="true" />
              <span className="lrn-cat-idx" aria-hidden="true">
                {pad(i)}
              </span>
              <span className="lrn-cat-head">
                <span className="lrn-cat-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="lrn-cat-title">{cat.title}</span>
              </span>
              <span className="lrn-cat-tagline">{cat.tagline}</span>
              <span className="lrn-cat-subs">
                {cat.subcategories.map((s) => (
                  <span className="lrn-cat-sub" key={s.slug}>
                    {s.title}
                  </span>
                ))}
              </span>
              <span className="lrn-cat-go" aria-hidden="true">
                EXPLORE <span className="lrn-cat-go-arrow">→</span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Category — /learn/<cat>
// ---------------------------------------------------------------------

/** One article as a visual mini-card: its figure on top, title below. */
function ArticleCard({
  category,
  subcategory,
  article,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
  article: LearnArticleRef;
}) {
  const img = articleImage(article.slug);
  return (
    <a
      className="lrn-acard"
      href={learnArticlePath(category.slug, subcategory.slug, article.slug)}
      data-internal="true"
    >
      <span
        className="lrn-acard-thumb"
        aria-hidden="true"
        style={img ? { backgroundImage: `url(${img})` } : undefined}
      />
      <span className="lrn-acard-body">
        <span className="lrn-acard-title">{article.shortTitle}</span>
        <span className="lrn-acard-foot">
          <DifficultyBadge level={article.difficulty} />
          <span className="lrn-acard-arr" aria-hidden="true">
            →
          </span>
        </span>
      </span>
    </a>
  );
}

/** A subcategory as a numbered "track board": header + card grid. */
function TrackSection({
  category,
  subcategory,
  index,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
  index: number;
}) {
  const href = learnSubcategoryPath(category.slug, subcategory.slug);
  return (
    <section className="lrn-track">
      <div className="lrn-track-head">
        <span className="lrn-track-num" aria-hidden="true">
          {pad(index)}
        </span>
        <div className="lrn-track-text">
          <h2 className="lrn-track-title">
            <a href={href} data-internal="true">
              {subcategory.title}
            </a>
          </h2>
          <p className="lrn-track-tagline">{subcategory.tagline}</p>
        </div>
        <a className="lrn-track-open" href={href} data-internal="true">
          OPEN TRACK <span aria-hidden="true">→</span>
        </a>
      </div>
      <div className="lrn-track-grid">
        {subcategory.articles.map((a) => (
          <ArticleCard
            key={a.slug}
            category={category}
            subcategory={subcategory}
            article={a}
          />
        ))}
      </div>
    </section>
  );
}

export function LearnCategoryPage({ category }: { category: LearnCategory }) {
  const { accent, Icon } = categoryVisual(category.slug);
  const idx = learnTaxonomy.categories.findIndex(
    (c) => c.slug === category.slug,
  );
  const articleCount = category.subcategories.reduce(
    (n, s) => n + s.articles.length,
    0,
  );
  const present = DIFF_ORDER.filter((d) =>
    category.subcategories.some((s) =>
      s.articles.some((a) => a.difficulty === d),
    ),
  );
  const diffSpan =
    present.length > 1
      ? `${present[0]} → ${present[present.length - 1]}`
      : (present[0] ?? "");

  return (
    <div className="lrn-page" style={accentVar(accent)}>
      <header className="lrn-sub-hero">
        <span
          className="lrn-sub-hero-bg"
          aria-hidden="true"
          style={{
            backgroundImage: `url(/learn-media/cat-${category.slug}.jpg)`,
          }}
        />
        <span className="lrn-sub-hero-idx" aria-hidden="true">
          {pad(idx)}
        </span>
        <div className="lrn-sub-hero-inner">
          <Breadcrumbs
            trail={[
              { label: "LEARN", href: learnHubPath },
              { label: category.title },
            ]}
          />
          <div className="lrn-sub-hero-row">
            <span className="lrn-sub-hero-icon" aria-hidden="true">
              <Icon />
            </span>
            <div className="lrn-sub-hero-text">
              <span className="lrn-sub-hero-eyebrow">
                SYSTEM {pad(idx)}/{pad(learnTaxonomy.categories.length - 1)} ·
                THE FIELD GUIDE
              </span>
              <h1 className="lrn-sub-hero-title">{category.title}</h1>
              <p className="lrn-sub-hero-dek">{category.tagline}</p>
            </div>
          </div>
          <div className="lrn-sub-hero-meta">
            <span className="lrn-sub-hero-stat">
              {category.subcategories.length} TRACKS
            </span>
            <span className="lrn-sub-hero-stat">{articleCount} ARTICLES</span>
            {diffSpan && <span className="lrn-sub-hero-stat">{diffSpan}</span>}
          </div>
        </div>
      </header>

      {category.subcategories.map((sub, i) => (
        <TrackSection
          key={sub.slug}
          category={category}
          subcategory={sub}
          index={i}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// Subcategory — /learn/<cat>/<sub>
// ---------------------------------------------------------------------

const DIFF_ORDER = ["beginner", "intermediate", "advanced"] as const;

/** The foundational article as a split lead card: text + its own figure. */
function LeadArticle({
  category,
  subcategory,
  article,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
  article: LearnArticleRef;
}) {
  const img = articleImage(article.slug);
  return (
    <a
      className="lrn-lead"
      href={learnArticlePath(category.slug, subcategory.slug, article.slug)}
      data-internal="true"
    >
      <span className="lrn-lead-body">
        <span className="lrn-lead-eyebrow">01 · START HERE</span>
        <span className="lrn-lead-title">{article.shortTitle}</span>
        <span className="lrn-lead-line">{article.oneLiner}</span>
        <span className="lrn-lead-foot">
          <DifficultyBadge level={article.difficulty} />
          <span className="lrn-lead-go" aria-hidden="true">
            READ ARTICLE →
          </span>
        </span>
      </span>
      <span
        className="lrn-lead-media"
        aria-hidden="true"
        style={img ? { backgroundImage: `url(${img})` } : undefined}
      />
    </a>
  );
}

/** One article as a numbered syllabus row with its figure as thumbnail. */
function SyllabusRow({
  category,
  subcategory,
  article,
  number,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
  article: LearnArticleRef;
  number: string;
}) {
  const img = articleImage(article.slug);
  return (
    <a
      className="lrn-srow"
      href={learnArticlePath(category.slug, subcategory.slug, article.slug)}
      data-internal="true"
    >
      <span className="lrn-srow-num" aria-hidden="true">
        {number}
      </span>
      <span
        className="lrn-srow-thumb"
        aria-hidden="true"
        style={img ? { backgroundImage: `url(${img})` } : undefined}
      />
      <span className="lrn-srow-main">
        <span className="lrn-srow-title">{article.shortTitle}</span>
        <span className="lrn-srow-line">{article.oneLiner}</span>
      </span>
      <DifficultyBadge level={article.difficulty} />
      <span className="lrn-srow-arr" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export function LearnSubcategoryPage({
  category,
  subcategory,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
}) {
  const { accent, Icon } = categoryVisual(category.slug);
  const subs = category.subcategories;
  const idx = subs.findIndex((s) => s.slug === subcategory.slug);
  const prev = subs[idx - 1] ?? null;
  const next = subs[idx + 1] ?? null;
  const arts = subcategory.articles;

  // difficulty span across the track, e.g. "beginner → advanced"
  const present = DIFF_ORDER.filter((d) =>
    arts.some((a) => a.difficulty === d),
  );
  const diffSpan =
    present.length > 1
      ? `${present[0]} → ${present[present.length - 1]}`
      : (present[0] ?? "");

  return (
    <div className="lrn-page" style={accentVar(accent)}>
      <header className="lrn-sub-hero">
        <span
          className="lrn-sub-hero-bg"
          aria-hidden="true"
          style={{
            backgroundImage: `url(/learn-media/cat-${category.slug}.jpg)`,
          }}
        />
        <span className="lrn-sub-hero-idx" aria-hidden="true">
          {pad(idx)}
        </span>
        <div className="lrn-sub-hero-inner">
          <Breadcrumbs
            trail={[
              { label: "LEARN", href: learnHubPath },
              { label: category.title, href: learnCategoryPath(category.slug) },
              { label: subcategory.title },
            ]}
          />
          <div className="lrn-sub-hero-row">
            <span className="lrn-sub-hero-icon" aria-hidden="true">
              <Icon />
            </span>
            <div className="lrn-sub-hero-text">
              <span className="lrn-sub-hero-eyebrow">
                {category.title} · TRACK {pad(idx)}/{pad(subs.length - 1)}
              </span>
              <h1 className="lrn-sub-hero-title">{subcategory.title}</h1>
              <p className="lrn-sub-hero-dek">{subcategory.tagline}</p>
            </div>
          </div>
          <div className="lrn-sub-hero-meta">
            <span className="lrn-sub-hero-stat">{arts.length} ARTICLES</span>
            {diffSpan && (
              <span className="lrn-sub-hero-stat">{diffSpan}</span>
            )}
          </div>
        </div>
      </header>

      <section className="lrn-syll">
        <div className="lrn-syll-head">
          <span className="lrn-syll-eyebrow">// THE TRACK</span>
          <span className="lrn-syll-rule" aria-hidden="true" />
        </div>

        {arts[0] && (
          <LeadArticle
            category={category}
            subcategory={subcategory}
            article={arts[0]}
          />
        )}

        {arts.length > 1 && (
          <div className="lrn-syll-list">
            {arts.slice(1).map((a, i) => (
              <SyllabusRow
                key={a.slug}
                category={category}
                subcategory={subcategory}
                article={a}
                number={pad(i + 1)}
              />
            ))}
          </div>
        )}
      </section>

      <nav className="lrn-pn" aria-label="Previous and next section">
        {prev ? (
          <a
            className="lrn-pn-link lrn-pn-prev"
            href={learnSubcategoryPath(category.slug, prev.slug)}
            data-internal="true"
          >
            <span className="lrn-pn-dir">← PREV</span>
            <span className="lrn-pn-title">{prev.title}</span>
          </a>
        ) : (
          <span className="lrn-pn-spacer" />
        )}
        {next ? (
          <a
            className="lrn-pn-link lrn-pn-next"
            href={learnSubcategoryPath(category.slug, next.slug)}
            data-internal="true"
          >
            <span className="lrn-pn-dir">NEXT →</span>
            <span className="lrn-pn-title">{next.title}</span>
          </a>
        ) : (
          <span className="lrn-pn-spacer" />
        )}
      </nav>
    </div>
  );
}
