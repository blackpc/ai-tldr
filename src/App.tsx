import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

import { allItems, categoryCounts, feed, filterItems } from "./data/feed";
import type { Category, ReleaseItem } from "./data/schema";
import { ReleaseCard } from "./components/ReleaseCard";
import { FilterBar } from "./components/FilterBar";
import { ReleaseModal } from "./components/ReleaseModal";
import { InfluencersPage } from "./components/InfluencersPage";
import { influencers } from "./data/influencers";

/** Parse current URL into a route. Supported paths:
 *   /                     → feed home
 *   /influencers          → influencers page
 *   /releases/<id>        → feed with modal open for that item
 * Legacy hash formats (#id, #influencers) still work so old bookmarks
 * and shared links keep functioning.
 */
type Route =
  | { kind: "feed" }
  | { kind: "influencers" }
  | { kind: "release"; id: string };

function parseRoute(): Route {
  const hash = window.location.hash.slice(1);
  if (hash === "influencers") return { kind: "influencers" };

  const path = window.location.pathname;
  if (path === "/influencers" || path === "/influencers/") {
    return { kind: "influencers" };
  }
  const m = path.match(/^\/releases\/([^/]+)\/?$/);
  if (m) return { kind: "release", id: m[1] };

  if (hash) return { kind: "release", id: hash };
  return { kind: "feed" };
}

function itemFromRoute(
  route: Route,
  items: ReleaseItem[],
): ReleaseItem | null {
  if (route.kind !== "release") return null;
  return items.find((i) => i.id === route.id) ?? null;
}

type Page = "feed" | "influencers";

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const page: Page = route.kind === "influencers" ? "influencers" : "feed";
  const [active, setActive] = useState<Set<Category>>(new Set());
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => allItems(), []);
  const counts = useMemo(() => categoryCounts(), []);
  const visible = useMemo(
    () => filterItems(sorted, { categories: active, query }),
    [sorted, active, query],
  );

  const openItem = useMemo(
    () => itemFromRoute(route, sorted),
    [route, sorted],
  );

  // Nav: go to feed home
  const goFeed = useCallback(() => {
    window.history.pushState(null, "", "/");
    setRoute({ kind: "feed" });
  }, []);

  // Nav: go to influencers
  const goInfluencers = useCallback(() => {
    window.history.pushState(null, "", "/influencers");
    setRoute({ kind: "influencers" });
  }, []);

  // Open modal = navigate to /releases/<id>
  const openModal = useCallback((item: ReleaseItem) => {
    window.history.pushState(null, "", `/releases/${item.id}`);
    setRoute({ kind: "release", id: item.id });
  }, []);

  // Close modal = go back to feed (or influencers if that's where we came
  // from). replaceState, NOT history.back() — back() could navigate to a
  // previous entry with a different modal already open.
  const closeModal = useCallback(() => {
    const target = page === "influencers" ? "/influencers" : "/";
    window.history.replaceState(null, "", target);
    setRoute(page === "influencers" ? { kind: "influencers" } : { kind: "feed" });
  }, [page]);

  // Sync route with browser back/forward
  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keep <title> and <meta description> in sync with current route
  // so the tab title updates as users navigate and Google's JS-rendering
  // crawler sees the right thing. Static HTML pages already have the
  // correct tags baked in by scripts/prerender.ts.
  useEffect(() => {
    if (route.kind === "release") {
      const item = sorted.find((i) => i.id === route.id);
      if (item) {
        document.title = `${item.title} — ${item.org} | AI/TLDR`;
        return;
      }
    }
    if (route.kind === "influencers") {
      document.title = "AI Influencers — Who to Follow | AI/TLDR";
      return;
    }
    document.title = "AI/TLDR — New AI Models, Tools & Papers This Week";
  }, [route, sorted]);

  const toggle = (c: Category) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  return (
    <div className="page">
      <header className="page-head">
        <div className="brand">
          <span className="brand-mark">█</span>
          <h1 className="brand-name">AI/TLDR</h1>
          <span className="brand-sub">
            daily release sweep · v{feed.promptVersion}
          </span>
        </div>
        <nav className="page-nav">
          <button
            type="button"
            className={`nav-link ${page === "feed" ? "nav-active" : ""}`}
            onClick={goFeed}
          >
            <span className="nav-link-lbl">RELEASES</span>
            <span className="nav-link-num">{feed.items.length}</span>
          </button>
          <button
            type="button"
            className={`nav-link ${page === "influencers" ? "nav-active" : ""}`}
            onClick={goInfluencers}
          >
            <span className="nav-link-lbl">INFLUENCERS</span>
            <span className="nav-link-num">{influencers.length}</span>
          </button>
        </nav>
        <div className="page-head-right">
          <span className="head-stat">
            <span className="head-stat-num">
              {feed.generatedAt.slice(0, 10)}
            </span>
            <span className="head-stat-lbl">LAST SWEEP</span>
          </span>
        </div>
      </header>

      {page === "feed" ? (
        <>
          <FilterBar
            active={active}
            counts={counts}
            query={query}
            onToggle={toggle}
            onClear={() => setActive(new Set())}
            onQuery={setQuery}
            totalShown={visible.length}
            totalAll={sorted.length}
          />

          <div className="legend">
            <span className="legend-item"><span className="legend-swatch swatch-seismic"></span>SEISMIC — resets the field</span>
            <span className="legend-item"><span className="legend-swatch swatch-major"></span>MAJOR — broad impact</span>
            <span className="legend-item"><span className="legend-swatch swatch-notable"></span>NOTABLE — solid, niche</span>
            <span className="legend-item"><span className="legend-swatch swatch-picked"></span>EDITOR'S CHOICE</span>
          </div>

          <main className="grid" role="feed" aria-label="AI release feed">
            {visible.length === 0 ? (
              <div className="grid-empty">
                // no releases match — adjust filters
              </div>
            ) : (
              visible.map((item) => (
                <ReleaseCard key={item.id} item={item} onOpen={openModal} />
              ))
            )}
          </main>

          {openItem && (
            <ReleaseModal item={openItem} onClose={closeModal} />
          )}
        </>
      ) : (
        <InfluencersPage />
      )}

      <footer className="page-footer">
        Built with{" "}
        <a href="https://shep.bot" target="_blank" rel="noopener noreferrer">
          Shep
        </a>{" "}
        ·{" "}
        <a
          href="https://github.com/shep-ai/shep"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
