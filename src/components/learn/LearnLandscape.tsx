/**
 * /learn/landscape — the open-source AI tooling landscape.
 *
 * A single, full-width, collapsible board of every notable open-source AI
 * project, grouped by category → subcategory. Each tool shows its live
 * GitHub star count (from github-stars.json, refreshed by the 2h sweep) and
 * a plain-English description revealed on hover. Pure/presentational — the
 * data is a static JSON chunk; no network calls at view time.
 */

import { useMemo, useState } from "react";

import landscapeData from "../../data/learn/landscape.json";
import githubStars from "../../data/learn/github-stars.json";
import type {
  Landscape,
  LandscapeCategory,
  LandscapeTool,
} from "../../data/learn/schema";
import { learnHubPath, learnToolPath } from "../../data/learn/schema";
import { Breadcrumbs } from "./ArticleBody";

const DATA = landscapeData as Landscape;
const STARS = githubStars as Record<string, number>;

const GH_MARK =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z";

/** Per-category accent, cycled across a fixed neon palette. */
const ACCENTS = [
  "#f7ff00",
  "#4fe0c0",
  "#6aa6ff",
  "#ff86c2",
  "#b98bff",
  "#ffb14a",
  "#8ce85a",
  "#ff6b5d",
];

function starsOf(repo: string): number {
  return STARS[repo.toLowerCase()] ?? 0;
}

/** GitHub-style star count: 950, 1.2k, 82.9k, 174k. */
function formatStars(n: number): string {
  if (n < 1000) return String(n);
  if (n < 100000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(n / 1000)}k`;
}

function compactInt(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

function matchTool(t: LandscapeTool, q: string): boolean {
  return (
    t.name.toLowerCase().includes(q) ||
    t.repo.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q)
  );
}

function ToolRow({ tool }: { tool: LandscapeTool }) {
  const stars = starsOf(tool.repo);
  return (
    <a className="lrn-ls-tool" href={learnToolPath(tool.slug)} data-internal="true">
      <span className="lrn-ls-tool-row">
        <span className="lrn-ls-gh" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="13" height="13">
            <path fill="currentColor" d={GH_MARK} />
          </svg>
        </span>
        <span className="lrn-ls-tool-name">{tool.name}</span>
        {stars > 0 && (
          <span className="lrn-ls-tool-stars">
            <span className="lrn-ls-star" aria-hidden="true">
              ★
            </span>
            {formatStars(stars)}
          </span>
        )}
      </span>
      <span className="lrn-ls-tool-desc">{tool.description}</span>
      <span className="lrn-ls-tool-foot">
        <span className="lrn-ls-tool-repo">{tool.repo}</span>
        <span className="lrn-ls-tool-site">details →</span>
      </span>
    </a>
  );
}

function CategoryPanel({
  cat,
  accent,
  open,
  onToggle,
  query,
  sortByStars,
}: {
  cat: LandscapeCategory;
  accent: string;
  open: boolean;
  onToggle: () => void;
  query: string;
  sortByStars: boolean;
}) {
  // Build the visible subcategories (filtered by the query, tools sorted).
  const subs = useMemo(() => {
    return cat.subcategories
      .map((sc) => {
        let tools = query ? sc.tools.filter((t) => matchTool(t, query)) : sc.tools;
        tools = [...tools].sort((a, b) =>
          sortByStars
            ? starsOf(b.repo) - starsOf(a.repo)
            : a.name.localeCompare(b.name),
        );
        return { ...sc, tools };
      })
      .filter((sc) => sc.tools.length > 0);
  }, [cat, query, sortByStars]);

  const count = subs.reduce((n, sc) => n + sc.tools.length, 0);
  const totalStars = subs.reduce(
    (n, sc) => n + sc.tools.reduce((s, t) => s + starsOf(t.repo), 0),
    0,
  );
  if (count === 0) return null;
  // When searching, force open so matches are always visible.
  const expanded = open || query.length > 0;

  return (
    <section
      className={`lrn-ls-panel${expanded ? " is-open" : ""}`}
      style={{ ["--cat" as string]: accent }}
    >
      <button
        className="lrn-ls-head"
        onClick={onToggle}
        aria-expanded={expanded}
        type="button"
      >
        <span className="lrn-ls-head-bar" aria-hidden="true" />
        <span className="lrn-ls-head-main">
          <span className="lrn-ls-head-title">{cat.title}</span>
          <span className="lrn-ls-head-blurb">{cat.blurb}</span>
        </span>
        <span className="lrn-ls-head-meta">
          <span className="lrn-ls-head-stars">
            <span className="lrn-ls-star" aria-hidden="true">
              ★
            </span>
            {compactInt(totalStars)}
          </span>
          <span className="lrn-ls-head-count">{count}</span>
          <span className="lrn-ls-chevron" aria-hidden="true">
            {expanded ? "–" : "+"}
          </span>
        </span>
      </button>
      {expanded && (
        <div className="lrn-ls-body">
          {subs.map((sc) => (
            <div className="lrn-ls-sub" key={sc.id}>
              <h3 className="lrn-ls-sub-title">
                {sc.title}
                <span className="lrn-ls-sub-n">{sc.tools.length}</span>
              </h3>
              <div className="lrn-ls-tools">
                {sc.tools.map((t) => (
                  <ToolRow key={t.repo} tool={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function LearnLandscapePage() {
  const [query, setQuery] = useState("");
  const [sortByStars, setSortByStars] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const q = query.trim().toLowerCase();

  const stats = useMemo(() => {
    let tools = 0;
    let stars = 0;
    for (const c of DATA.categories)
      for (const s of c.subcategories)
        for (const t of s.tools) {
          tools++;
          stars += starsOf(t.repo);
        }
    return { tools, stars, categories: DATA.categories.length };
  }, []);

  // Categories that survive the current search (so the "no results" state is
  // accurate and we can show how many matched).
  const visibleCats = useMemo(() => {
    if (!q) return DATA.categories;
    return DATA.categories.filter((c) =>
      c.subcategories.some((s) => s.tools.some((t) => matchTool(t, q))),
    );
  }, [q]);

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () =>
    setCollapsed(new Set(DATA.categories.map((c) => c.id)));

  return (
    <div className="lrn-page lrn-ls-page">
      <header className="lrn-ls-hero">
        <Breadcrumbs
          trail={[
            { label: "LEARN", href: learnHubPath },
            { label: "Landscape" },
          ]}
        />
        <div className="lrn-ls-hero-row">
          <div className="lrn-ls-hero-text">
            <span className="lrn-ls-eyebrow">// THE OPEN-SOURCE MAP</span>
            <h1 className="lrn-ls-title">
              AI TOOLING <span className="lrn-ls-title-accent">LANDSCAPE</span>
            </h1>
            <p className="lrn-ls-dek">
              The open-source AI stack on one page — runtimes, agents, RAG,
              vector stores, fine-tuning, eval, serving and more. Browse the
              tree, follow the stars, discover what you've been missing.
            </p>
          </div>
          <dl className="lrn-ls-stats">
            <div className="lrn-ls-stat">
              <dt>tools</dt>
              <dd>{stats.tools}</dd>
            </div>
            <div className="lrn-ls-stat">
              <dt>categories</dt>
              <dd>{stats.categories}</dd>
            </div>
            <div className="lrn-ls-stat">
              <dt>★ combined</dt>
              <dd>{compactInt(stats.stars)}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="lrn-ls-bar">
        <label className="lrn-ls-search">
          <span className="lrn-ls-search-ic" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            placeholder="Filter tools — name, repo or what it does…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter tools"
          />
          {query && (
            <button
              className="lrn-ls-search-x"
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
            >
              ✕
            </button>
          )}
        </label>
        <div className="lrn-ls-bar-actions">
          <span className="lrn-ls-sort">
            <button
              type="button"
              className={sortByStars ? "is-on" : ""}
              onClick={() => setSortByStars(true)}
            >
              ★ stars
            </button>
            <button
              type="button"
              className={!sortByStars ? "is-on" : ""}
              onClick={() => setSortByStars(false)}
            >
              A–Z
            </button>
          </span>
          <button
            type="button"
            className="lrn-ls-toggle-all"
            onClick={expandAll}
            disabled={q.length > 0}
          >
            expand all
          </button>
          <button
            type="button"
            className="lrn-ls-toggle-all"
            onClick={collapseAll}
            disabled={q.length > 0}
          >
            collapse all
          </button>
        </div>
      </div>

      {visibleCats.length === 0 ? (
        <p className="lrn-ls-empty">
          No tools match “{query}”. Try a broader term.
        </p>
      ) : (
        <div className="lrn-ls-grid">
          {visibleCats.map((cat) => {
            const idx = DATA.categories.indexOf(cat);
            return (
              <CategoryPanel
                key={cat.id}
                cat={cat}
                accent={ACCENTS[idx % ACCENTS.length]}
                open={!collapsed.has(cat.id)}
                onToggle={() => toggle(cat.id)}
                query={q}
                sortByStars={sortByStars}
              />
            );
          })}
        </div>
      )}

      <p className="lrn-ls-note">
        Open-source projects only. Click any tool for a detail page with a
        plain-English overview and a getting-started guide. Star counts are
        pulled live from GitHub and refreshed every few hours.
      </p>
    </div>
  );
}
