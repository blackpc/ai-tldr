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
import { learnArticlePath } from "../../data/learn/schema";
import { learnTaxonomy } from "../../data/learn/nav";
import { Breadcrumbs, DifficultyBadge } from "./ArticleBody";
import { categoryVisual } from "./categoryVisuals";

function pad(n: number): string {
  return String(n + 1).padStart(2, "0");
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
        <span className="lrn-hub-eyebrow">// THE FIELD GUIDE</span>
        <h1 className="lrn-hub-title">
          LEARN <span className="lrn-hub-title-accent">AI</span>
        </h1>
        <p className="lrn-hub-dek">
          A plain-English encyclopedia of AI engineering — LLMs, RAG,
          vector databases, agents, fine-tuning and the tools around them.
          Pick a track. Every page starts from zero and ends deep.
        </p>
      </header>

      <div className="lrn-cat-grid">
        {learnTaxonomy.categories.map((cat, i) => {
          const { accent, Icon } = categoryVisual(cat.slug);
          return (
            <a
              className="lrn-cat-card"
              href={`/learn/${cat.slug}`}
              data-internal="true"
              key={cat.slug}
              style={accentVar(accent)}
            >
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

/** One article as a compact, clickable list row (difficulty + title). */
function ArticleListItem({
  category,
  subcategory,
  article,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
  article: LearnArticleRef;
}) {
  return (
    <a
      className="lrn-item"
      href={learnArticlePath(category.slug, subcategory.slug, article.slug)}
      data-internal="true"
    >
      <DifficultyBadge level={article.difficulty} />
      <span className="lrn-item-title">{article.title}</span>
      <span className="lrn-item-arr" aria-hidden="true">
        →
      </span>
    </a>
  );
}

/** A subcategory rendered as a full-width section: header (links to the
 *  subcategory page) + a responsive grid of article cells that wraps and
 *  grows as articles are added — no fixed-height boxes. */
function CategorySection({
  category,
  subcategory,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
}) {
  return (
    <section className="lrn-catsec">
      <div className="lrn-catsec-head">
        <h2 className="lrn-catsec-title">
          <a
            href={`/learn/${category.slug}/${subcategory.slug}`}
            data-internal="true"
          >
            {subcategory.title}
          </a>
        </h2>
        <p className="lrn-catsec-tagline">{subcategory.tagline}</p>
      </div>
      <div className="lrn-catsec-grid">
        {subcategory.articles.map((a) => (
          <ArticleListItem
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
  return (
    <div className="lrn-page" style={accentVar(accent)}>
      <header className="lrn-cat-hero">
        <Breadcrumbs
          trail={[{ label: "LEARN", href: "/learn" }, { label: category.title }]}
        />
        <div className="lrn-cat-hero-row">
          <span className="lrn-cat-hero-icon" aria-hidden="true">
            <Icon />
          </span>
          <div className="lrn-cat-hero-text">
            <h1 className="lrn-cat-hero-title">{category.title}</h1>
            <p className="lrn-dek">{category.tagline}</p>
          </div>
        </div>
      </header>

      {category.subcategories.map((sub) => (
        <CategorySection
          key={sub.slug}
          category={category}
          subcategory={sub}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// Subcategory — /learn/<cat>/<sub>
// ---------------------------------------------------------------------

/** The single foundational article shown as a prominent feature card. */
function FeatureArticle({
  category,
  subcategory,
  article,
}: {
  category: LearnCategory;
  subcategory: LearnSubcategory;
  article: LearnArticleRef;
}) {
  return (
    <a
      className="lrn-feature"
      href={learnArticlePath(category.slug, subcategory.slug, article.slug)}
      data-internal="true"
    >
      <span className="lrn-feature-rail" aria-hidden="true" />
      <span className="lrn-feature-eyebrow">START HERE</span>
      <span className="lrn-feature-title">{article.title}</span>
      <span className="lrn-feature-line">{article.oneLiner}</span>
      <span className="lrn-feature-foot">
        <DifficultyBadge level={article.difficulty} />
        <span className="lrn-feature-go" aria-hidden="true">
          READ ARTICLE →
        </span>
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

  return (
    <div className="lrn-page" style={accentVar(accent)}>
      <header className="lrn-cat-hero">
        <Breadcrumbs
          trail={[
            { label: "LEARN", href: "/learn" },
            { label: category.title, href: `/learn/${category.slug}` },
            { label: subcategory.title },
          ]}
        />
        <div className="lrn-cat-hero-row">
          <span className="lrn-cat-hero-icon" aria-hidden="true">
            <Icon />
          </span>
          <div className="lrn-cat-hero-text">
            <h1 className="lrn-cat-hero-title">{subcategory.title}</h1>
            <p className="lrn-dek">{subcategory.tagline}</p>
          </div>
        </div>
      </header>

      <div className="lrn-feature-wrap">
        {subcategory.articles[0] && (
          <FeatureArticle
            category={category}
            subcategory={subcategory}
            article={subcategory.articles[0]}
          />
        )}
        {subcategory.articles.length > 1 && (
          <div className="lrn-sub-list">
            {subcategory.articles.slice(1).map((a) => (
              <ArticleListItem
                key={a.slug}
                category={category}
                subcategory={subcategory}
                article={a}
              />
            ))}
          </div>
        )}
      </div>

      <nav className="lrn-pn" aria-label="Previous and next section">
        {prev ? (
          <a
            className="lrn-pn-link lrn-pn-prev"
            href={`/learn/${category.slug}/${prev.slug}`}
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
            href={`/learn/${category.slug}/${next.slug}`}
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
