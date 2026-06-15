/**
 * Client entry for the Learn section — the ONLY file the SPA imports
 * (lazily, via React.lazy in App.tsx), so the entire Learn feature +
 * taxonomy + CSS ships as a separate chunk that feed readers never load.
 *
 * Owns: per-article JSON loading (vite glob chunks), document.title /
 * meta description / canonical sync, and pushState interception for
 * internal links rendered by the pure components.
 */

import { useEffect, useMemo, useState } from "react";
import "./learn.css";

import type { LearnArticle } from "../../data/learn/schema";
import {
  learnArticlePath,
  learnCategoryPath,
  learnHubPath,
  learnLandscapePath,
  learnMapPath,
  learnSubcategoryPath,
} from "../../data/learn/schema";
import {
  findLearnArticle,
  findLearnCategory,
  findLearnSubcategory,
} from "../../data/learn/nav";
import { ArticleBody } from "./ArticleBody";
import LearnMap from "./LearnMap";
import { LearnLandscapePage } from "./LearnLandscape";
import {
  LearnCategoryPage,
  LearnHubPage,
  LearnSubcategoryPage,
} from "./LearnPages";
import { track } from "../../lib/analytics";

export type LearnRoute =
  | { kind: "learn" }
  | { kind: "learn-map" }
  | { kind: "learn-landscape" }
  | { kind: "learn-cat"; cat: string }
  | { kind: "learn-sub"; cat: string; sub: string }
  | { kind: "learn-article"; cat: string; sub: string; slug: string };

// Every article JSON becomes its own lazy vite chunk; key by slug
// (basename) since slugs are globally unique.
const articleModules = import.meta.glob<{ default: LearnArticle }>(
  "../../data/learn/articles/**/*.json",
);
const articleLoaders = new Map<string, () => Promise<{ default: LearnArticle }>>();
for (const [path, loader] of Object.entries(articleModules)) {
  const slug = path.split("/").pop()!.replace(/\.json$/, "");
  articleLoaders.set(slug, loader);
}

/** Prerendered pages embed the article JSON so the SPA's first render
 *  matches the static HTML without waiting for the chunk fetch. */
function embeddedArticle(slug: string): LearnArticle | null {
  const el = document.getElementById("__LEARN_DATA__");
  if (!el?.textContent) return null;
  try {
    const data = JSON.parse(el.textContent) as LearnArticle;
    return data.slug === slug ? data : null;
  } catch {
    return null;
  }
}

function setPageMeta(title: string, description: string, path: string) {
  document.title = title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", description);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", `https://ai-tldr.dev${path}`);
}

function NotFound({ what }: { what: string }) {
  return (
    <div className="lrn-page">
      <header className="lrn-head">
        <h1 className="lrn-title">404 // NOT FOUND</h1>
        <p className="lrn-dek">
          No {what} here.{" "}
          <a href={learnHubPath} data-internal="true">
            Back to Learn AI →
          </a>
        </p>
      </header>
    </div>
  );
}

function LearnArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<LearnArticle | null>(() =>
    embeddedArticle(slug),
  );

  useEffect(() => {
    if (article?.slug === slug) return;
    setArticle(null);
    const loader = articleLoaders.get(slug);
    if (!loader) return;
    let cancelled = false;
    loader().then((mod) => {
      if (!cancelled) setArticle(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, article]);

  if (!articleLoaders.has(slug)) return <NotFound what="article" />;
  if (!article) {
    return (
      <div className="lrn-page">
        <div className="lrn-loading">// loading…</div>
      </div>
    );
  }
  return <ArticleBody article={article} />;
}

export default function LearnSection({
  route,
  onNavigate,
}: {
  route: LearnRoute;
  onNavigate: (path: string) => void;
}) {
  // Sync title/description/canonical on every learn route change.
  useEffect(() => {
    if (route.kind === "learn") {
      setPageMeta(
        "Learn AI — LLMs, RAG, Agents & More, Explained | AI/TLDR",
        "A plain-English encyclopedia of AI engineering: LLMs, RAG, vector databases, agents, fine-tuning and the tools around them. Free, beginner-friendly, no signup.",
        learnHubPath,
      );
    } else if (route.kind === "learn-map") {
      setPageMeta(
        "Knowledge City — Explore Every AI Topic in 3D | AI/TLDR",
        "The whole Learn AI encyclopedia as an explorable 3D city: every article is a tower, reading it lights the building. Roam the districts, power up the city.",
        learnMapPath,
      );
    } else if (route.kind === "learn-landscape") {
      setPageMeta(
        "AI Tooling Landscape — Open-Source Libraries & Frameworks | AI/TLDR",
        "A browsable map of the open-source AI stack: runtimes, agents, RAG, vector databases, fine-tuning, eval, serving and more — grouped by category, ranked by GitHub stars.",
        learnLandscapePath,
      );
    } else if (route.kind === "learn-cat") {
      const cat = findLearnCategory(route.cat);
      if (cat)
        setPageMeta(
          `${cat.title} — Learn AI | AI/TLDR`,
          cat.tagline,
          learnCategoryPath(cat.slug),
        );
    } else if (route.kind === "learn-sub") {
      const found = findLearnSubcategory(route.cat, route.sub);
      if (found)
        setPageMeta(
          `${found.subcategory.title} — Learn AI | AI/TLDR`,
          found.subcategory.tagline,
          learnSubcategoryPath(found.category.slug, found.subcategory.slug),
        );
    } else {
      const loc = findLearnArticle(route.slug);
      if (loc)
        setPageMeta(
          `${loc.article.seoTitle} | AI/TLDR`,
          loc.article.metaDescription,
          learnArticlePath(loc.category.slug, loc.subcategory.slug, loc.article.slug),
        );
    }
    track("learn:view", { kind: route.kind });
  }, [route]);

  // Delegate clicks on internal links (breadcrumbs, cards, md links…)
  // through the SPA router. Modified clicks (new tab etc.) pass through.
  const onClick = useMemo(
    () => (e: React.MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const a = target.closest("a[data-internal]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      onNavigate(href);
    },
    [onNavigate],
  );

  let body: React.ReactNode;
  if (route.kind === "learn") {
    body = <LearnHubPage />;
  } else if (route.kind === "learn-map") {
    body = <LearnMap onNavigate={onNavigate} />;
  } else if (route.kind === "learn-landscape") {
    body = <LearnLandscapePage />;
  } else if (route.kind === "learn-cat") {
    const cat = findLearnCategory(route.cat);
    body = cat ? <LearnCategoryPage category={cat} /> : <NotFound what="topic" />;
  } else if (route.kind === "learn-sub") {
    const found = findLearnSubcategory(route.cat, route.sub);
    body = found ? (
      <LearnSubcategoryPage
        category={found.category}
        subcategory={found.subcategory}
      />
    ) : (
      <NotFound what="section" />
    );
  } else {
    body = <LearnArticleView slug={route.slug} />;
  }

  return (
    <main className="lrn-main" onClick={onClick}>
      {body}
    </main>
  );
}
