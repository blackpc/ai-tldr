/**
 * /tools — the AI tooling directory (open-source + commercial).
 *
 * Finder-style "Miller columns": category ▸ subcategory ▸ tools. The whole
 * structure is visible at a glance (every category in the left column, every
 * subcategory of the selected one in the middle) and you drill in by clicking
 * across. There are NO inner scrollbars — only the page scrolls; the two nav
 * columns stick while the (often long) tools column scrolls past them.
 *
 * Categories are organised by FUNCTION, never by license — a tool's access
 * (open-source / open-core / freemium / commercial / enterprise) is a
 * cross-cutting chip filter (?access=, shared .reg-chip styling with /models),
 * so commercial and OSS tools live side by side in the same category.
 *
 * Live GitHub star counts come from github-stars.json (refreshed by the 2h
 * sweep). Pure/presentational — the data is a static JSON chunk, no network
 * calls at view time. Also rendered server-side by prerender-learn.tsx.
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import landscapeData from "../../data/learn/landscape.json";
import githubStars from "../../data/learn/github-stars.json";
import type {
  Landscape,
  LandscapeSubcategory,
  LandscapeTool,
} from "../../data/learn/schema";
import { learnToolPath } from "../../data/learn/schema";

const DATA = landscapeData as Landscape;
const STARS = githubStars as Record<string, number>;

const GH_MARK =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z";

/** Per-category accent, cycled across a fixed neon palette (17 distinct). */
const ACCENTS = [
  "#f7ff00", "#4fe0c0", "#6aa6ff", "#ff86c2", "#b98bff", "#ffb14a",
  "#8ce85a", "#ff6b5d", "#39d0d8", "#d8d84a", "#ff9e64", "#7aa2f7",
  "#bb9af7", "#9ece6a", "#e0af68", "#f7768e", "#2ac3de",
];
const accentOf = (idx: number) => ACCENTS[idx % ACCENTS.length];

function starsOf(repo?: string): number {
  return repo ? STARS[repo.toLowerCase()] ?? 0 : 0;
}

/** Bare domain of a homepage URL, e.g. "https://www.pinecone.io/" → "pinecone.io". */
function domainOf(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
}

const ACCESS_LABEL: Record<string, string> = {
  "open-core": "OPEN CORE",
  freemium: "FREEMIUM",
  commercial: "COMMERCIAL",
  enterprise: "ENTERPRISE",
};

/** License/access facet — a cross-cutting filter, NOT a category. Every tool
 *  has exactly one value (OSS tools omit the field → "open-source"). The chip
 *  row mirrors the tag filter on /models (shared .reg-chip styling). */
type Access =
  | "open-source"
  | "open-core"
  | "freemium"
  | "commercial"
  | "enterprise";
const ACCESS_ORDER: Access[] = [
  "open-source",
  "open-core",
  "freemium",
  "commercial",
  "enterprise",
];
const ACCESS_CHIP: Record<Access, string> = {
  "open-source": "Open source",
  "open-core": "Open core",
  freemium: "Freemium",
  commercial: "Commercial",
  enterprise: "Enterprise",
};
const accessOf = (t: LandscapeTool): Access =>
  (t.access as Access | undefined) ?? "open-source";

/** Deterministic dark hue for a tool's monogram fallback (no logo on file). */
function monoStyle(seed: string): CSSProperties {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return { background: `hsl(${h} 42% 26%)` };
}

/** Brand/owner logo on a small plate, or a deterministic monogram fallback so
 *  EVERY tool has a visual. */
function ToolLogo({ tool }: { tool: LandscapeTool }) {
  if (tool.logo) {
    return (
      <span className="lrn-ls-logo" aria-hidden="true">
        <img src={tool.logo} alt="" loading="lazy" />
      </span>
    );
  }
  const letter =
    tool.name.replace(/[^a-zA-Z0-9]/g, "").charAt(0).toUpperCase() || "#";
  return (
    <span className="lrn-ls-logo lrn-ls-logo-mono" style={monoStyle(tool.slug)} aria-hidden="true">
      {letter}
    </span>
  );
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
    (t.repo?.toLowerCase().includes(q) ?? false) ||
    t.description.toLowerCase().includes(q)
  );
}

function sortTools(tools: LandscapeTool[], byStars: boolean): LandscapeTool[] {
  return [...tools].sort((a, b) =>
    byStars ? starsOf(b.repo) - starsOf(a.repo) : a.name.localeCompare(b.name),
  );
}

function ToolTile({ tool }: { tool: LandscapeTool }) {
  const stars = starsOf(tool.repo);
  const ghUrl = tool.repo ? `https://github.com/${tool.repo}` : undefined;
  const toDetail = !!tool.detail;
  // Tools with a detail page open it (internal SPA nav, stretched ::after);
  // tile-only entries open their homepage directly in a new tab.
  const primaryHref = toDetail
    ? learnToolPath(tool.slug)
    : tool.homepage ?? ghUrl ?? "#";
  const access = tool.access && tool.access !== "open-source" ? tool.access : null;
  return (
    <div className="lrn-ls-tool">
      <a
        className="lrn-ls-tool-link"
        href={primaryHref}
        {...(toDetail
          ? { "data-internal": "true" }
          : { target: "_blank", rel: "noopener noreferrer" })}
        aria-label={`${tool.name}${toDetail ? " — details" : ""}`}
      >
        <span className="lrn-ls-tool-row">
          <ToolLogo tool={tool} />
          <span className="lrn-ls-tool-name">{tool.name}</span>
          {access && (
            <span className={`lrn-ls-acc lrn-ls-acc-${access}`}>
              {ACCESS_LABEL[access]}
            </span>
          )}
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
      </a>
      <span className="lrn-ls-tool-foot">
        {tool.repo ? (
          <a
            className="lrn-ls-tool-repo"
            href={ghUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${tool.repo} on GitHub`}
          >
            <span className="lrn-ls-gh" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="12" height="12">
                <path fill="currentColor" d={GH_MARK} />
              </svg>
            </span>
            {tool.repo} ↗
          </a>
        ) : tool.homepage ? (
          <a
            className="lrn-ls-tool-repo"
            href={tool.homepage}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${tool.name}`}
          >
            {domainOf(tool.homepage)} ↗
          </a>
        ) : (
          <span />
        )}
        <span className="lrn-ls-tool-site">{toDetail ? "details →" : "visit ↗"}</span>
      </span>
    </div>
  );
}

interface FilteredSub extends LandscapeSubcategory {
  tools: LandscapeTool[];
}
interface FilteredCat {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  count: number;
  subcategories: FilteredSub[];
}

/** Read the current category / subcategory selection from the URL query
 *  (?cat=&sub=). SSR-safe: returns nulls when there is no window. */
function readSelection(): { cat: string | null; sub: string | null } {
  if (typeof window === "undefined") return { cat: null, sub: null };
  const p = new URLSearchParams(window.location.search);
  return { cat: p.get("cat"), sub: p.get("sub") };
}

/** Read the active access filter from the URL (?access=a,b). SSR-safe. */
function readAccess(): Set<Access> {
  if (typeof window === "undefined") return new Set();
  const raw = new URLSearchParams(window.location.search).get("access");
  if (!raw) return new Set();
  const valid = new Set(ACCESS_ORDER);
  return new Set(
    raw
      .split(",")
      .map((t) => t.trim())
      .filter((t): t is Access => valid.has(t as Access)),
  );
}

export function LearnLandscapePage() {
  const [query, setQuery] = useState("");
  const [sortByStars, setSortByStars] = useState(true);
  // Selection lives in the URL (?cat=&sub=) so it is shareable and the
  // browser Back / Forward buttons step through it.
  const [sel, setSel] = useState(readSelection);
  // The access filter likewise lives in the URL (?access=a,b).
  const [access, setAccess] = useState<Set<Access>>(readAccess);

  // Re-read selection + filters when the user navigates Back / Forward.
  useEffect(() => {
    const onPop = () => {
      setSel(readSelection());
      setAccess(readAccess());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const q = query.trim().toLowerCase();

  // Global, unfiltered stats for the hero.
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

  // Which access values actually appear, in canonical order — drives the chips.
  const availableAccess = useMemo(() => {
    const s = new Set<Access>();
    for (const c of DATA.categories)
      for (const sc of c.subcategories)
        for (const t of sc.tools) s.add(accessOf(t));
    return ACCESS_ORDER.filter((a) => s.has(a));
  }, []);

  // A tool survives the query AND the access facet. Access is OR-within-facet
  // (a tool has one license): pick "Commercial" + "Enterprise" → either shows.
  const passes = (t: LandscapeTool) => {
    if (q && !matchTool(t, q)) return false;
    if (access.size && !access.has(accessOf(t))) return false;
    return true;
  };

  // The tree, filtered by query + access with tools sorted. Categories /
  // subcategories with no surviving tools drop out so the columns only ever
  // show things you can actually open.
  const tree = useMemo<FilteredCat[]>(() => {
    return DATA.categories
      .map((c, i) => {
        const subs = c.subcategories
          .map((sc) => ({ ...sc, tools: sortTools(sc.tools.filter(passes), sortByStars) }))
          .filter((sc) => sc.tools.length > 0);
        const count = subs.reduce((n, sc) => n + sc.tools.length, 0);
        return {
          id: c.id,
          title: c.title,
          blurb: c.blurb,
          accent: accentOf(i),
          count,
          subcategories: subs,
        };
      })
      .filter((c) => c.subcategories.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sortByStars, access]);

  // Resolve the effective selection during render (no setState-in-effect): if
  // the chosen category/subcategory was filtered away, fall back to the first
  // available one.
  const cat = tree.find((c) => c.id === sel.cat) ?? tree[0];
  const sub = cat
    ? cat.subcategories.find((s) => s.id === sel.sub) ?? cat.subcategories[0]
    : undefined;

  // Push a new history entry per selection so Back returns to the previous
  // category/subcategory. The pathname is unchanged, so the SPA router keeps
  // this page mounted — only the ?cat=&sub= query changes.
  const navigate = (catId: string, subId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("cat", catId);
    params.set("sub", subId);
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    setSel({ cat: catId, sub: subId });
  };

  const selectCat = (id: string) => {
    const next = tree.find((c) => c.id === id);
    navigate(id, next?.subcategories[0]?.id ?? "");
  };
  const selectSub = (id: string) => {
    if (cat) navigate(cat.id, id);
  };

  // Toggle one access chip; the set is persisted to ?access= via pushState so
  // it is shareable and Back / Forward steps through filter states too.
  const writeAccess = (next: Set<Access>) => {
    const params = new URLSearchParams(window.location.search);
    if (next.size) params.set("access", [...next].join(","));
    else params.delete("access");
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    setAccess(next);
  };
  const toggleAccess = (a: Access) => {
    const next = new Set(access);
    if (next.has(a)) next.delete(a);
    else next.add(a);
    writeAccess(next);
  };

  return (
    <div className="lrn-page lrn-ls-page">
      {/* One row: title · search · sort · stats */}
      <div className="lrn-ls-bar">
        <h1 className="lrn-ls-title">
          AI <span className="lrn-ls-title-accent">Tools</span>
        </h1>
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
        <dl className="lrn-ls-stats">
          <div className="lrn-ls-stat">
            <dd>{stats.tools}</dd>
            <dt>tools</dt>
          </div>
          <div className="lrn-ls-stat">
            <dd>{stats.categories}</dd>
            <dt>cats</dt>
          </div>
          <div className="lrn-ls-stat">
            <dd>{compactInt(stats.stars)}</dd>
            <dt>★</dt>
          </div>
        </dl>
      </div>

      {availableAccess.length > 0 && (
        <div className="reg-tagbar" role="group" aria-label="Filter by access">
          {availableAccess.map((a) => (
            <button
              key={a}
              type="button"
              className={`reg-chip${access.has(a) ? " is-on" : ""}`}
              onClick={() => toggleAccess(a)}
              aria-pressed={access.has(a)}
            >
              {ACCESS_CHIP[a]}
            </button>
          ))}
          {access.size > 0 && (
            <button
              type="button"
              className="reg-chip reg-chip-clear"
              onClick={() => writeAccess(new Set())}
            >
              clear
            </button>
          )}
        </div>
      )}

      {!cat || !sub ? (
        <p className="lrn-ls-empty">
          No tools match{query ? ` “${query}”` : ""}
          {access.size ? " with that access" : ""}. Try a broader filter.
        </p>
      ) : (
        <div className="lrn-ls-miller">
          {/* Column 1 — categories */}
          <div className="lrn-ls-mcol lrn-ls-mcol-cats">
            <div className="lrn-ls-msticky">
              <div className="lrn-ls-mhdr">
                Categories <span className="lrn-ls-mhdr-n">{tree.length}</span>
              </div>
              {tree.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`lrn-ls-mrow${c.id === cat.id ? " is-on" : ""}`}
                  style={{ ["--cat" as string]: c.accent }}
                  onClick={() => selectCat(c.id)}
                  aria-current={c.id === cat.id}
                >
                  <span className="lrn-ls-mbar" aria-hidden="true" />
                  <span className="lrn-ls-mname">{c.title}</span>
                  <span className="lrn-ls-mn">{c.count}</span>
                  <span className="lrn-ls-marr" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2 — subcategories of the selected category */}
          <div
            className="lrn-ls-mcol lrn-ls-mcol-subs"
            style={{ ["--cat" as string]: cat.accent }}
          >
            <div className="lrn-ls-msticky">
              <div className="lrn-ls-mhdr">{cat.title}</div>
              {cat.subcategories.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`lrn-ls-mrow${s.id === sub.id ? " is-on" : ""}`}
                  onClick={() => selectSub(s.id)}
                  aria-current={s.id === sub.id}
                >
                  <span className="lrn-ls-mname">{s.title}</span>
                  <span className="lrn-ls-mn">{s.tools.length}</span>
                  <span className="lrn-ls-marr" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3 — tools in the selected subcategory */}
          <div
            className="lrn-ls-mcol lrn-ls-mcol-tools"
            style={{ ["--cat" as string]: cat.accent }}
          >
            <div className="lrn-ls-mhdr lrn-ls-mhdr-tools">
              <span className="lrn-ls-mhdr-title">{sub.title}</span>
              <span className="lrn-ls-mhdr-sub">
                {cat.title} · {sub.tools.length} tool
                {sub.tools.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="lrn-ls-mtiles">
              {sub.tools.map((t) => (
                <ToolTile key={t.slug} tool={t} />
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="lrn-ls-note">
        Open-source and commercial AI tools, grouped by what they do — filter by
        access (open source, freemium, commercial, enterprise) with the chips
        above. Open-source projects link to a detail page with a plain-English
        overview and a getting-started guide; their star counts are pulled live
        from GitHub and refreshed every few hours.
      </p>
    </div>
  );
}
