import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

import { allItems, categoryCounts, feed, filterItems } from "./data/feed";

const SWEEP_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours in ms

/** Format duration as "Xh Ym" */
function formatDuration(ms: number): string {
  const totalMins = Math.floor(ms / 60000);
  if (totalMins < 1) return "now";
  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/** Live sweep timer showing time since last sweep and until next */
function SweepTimer({ lastSweep }: { lastSweep: string }) {
  const lastTime = new Date(lastSweep).getTime();

  const calcState = () => {
    const now = Date.now();
    const elapsed = now - lastTime;
    const remaining = Math.max(0, lastTime + SWEEP_INTERVAL - now);
    const progress = Math.min(1, elapsed / SWEEP_INTERVAL);
    return { elapsed, remaining, progress };
  };

  const [state, setState] = useState(calcState);
  const [flip, setFlip] = useState(false);
  const [sweep, setSweep] = useState(false);

  useEffect(() => {
    const tick = () => {
      // Trigger flip animation
      setFlip(true);
      setTimeout(() => {
        setState(calcState());
        setFlip(false);
      }, 150);

      // Trigger sweep glow
      setSweep(true);
      setTimeout(() => setSweep(false), 600);
    };

    // Sync to start of each minute
    const now = Date.now();
    const msToNextMin = 60000 - (now % 60000);
    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 60000);
      return () => clearInterval(interval);
    }, msToNextMin);

    return () => clearTimeout(timeout);
  }, [lastTime]);

  return (
    <span className={`sweep-timer${sweep ? " sweep-timer-glow" : ""}`}>
      <span className="sweep-timer-row">
        <span className={`sweep-timer-ago${flip ? " sweep-flip" : ""}`}>
          {formatDuration(state.elapsed)} ago
        </span>
        <span className={`sweep-timer-next${flip ? " sweep-flip" : ""}`}>
          next {formatDuration(state.remaining)}
        </span>
      </span>
      <span
        className="sweep-timer-bar"
        style={{ "--progress": state.progress } as React.CSSProperties}
      />
    </span>
  );
}
import type { Category, ReleaseItem } from "./data/schema";
import { ReleaseCard } from "./components/ReleaseCard";
import { FilterBar } from "./components/FilterBar";
import { ReleaseModal } from "./components/ReleaseModal";
import { InfluencersPage } from "./components/InfluencersPage";
import { SweepLogPage } from "./components/SweepLogPage";
import { influencers } from "./data/influencers";

/** Parse current URL into a route. Supported paths:
 *   /                     → feed home
 *   /influencers          → influencers page
 *   /log                  → sweep log page
 *   /releases/<id>        → feed with modal open for that item
 * Legacy hash formats (#id, #influencers) still work so old bookmarks
 * and shared links keep functioning.
 */
type Route =
  | { kind: "feed" }
  | { kind: "influencers" }
  | { kind: "log" }
  | { kind: "release"; id: string };

function parseRoute(): Route {
  const hash = window.location.hash.slice(1);
  if (hash === "influencers") return { kind: "influencers" };
  if (hash === "log") return { kind: "log" };

  const path = window.location.pathname;
  if (path === "/influencers" || path === "/influencers/") {
    return { kind: "influencers" };
  }
  if (path === "/log" || path === "/log/") {
    return { kind: "log" };
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

type Page = "feed" | "influencers" | "log";

function pageFromRoute(route: Route): Page {
  if (route.kind === "influencers") return "influencers";
  if (route.kind === "log") return "log";
  return "feed";
}

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const page: Page = pageFromRoute(route);
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

  // Nav: go to sweep log
  const goLog = useCallback(() => {
    window.history.pushState(null, "", "/log");
    setRoute({ kind: "log" });
  }, []);

  // Open modal = navigate to /releases/<id>
  const openModal = useCallback((item: ReleaseItem) => {
    window.history.pushState(null, "", `/releases/${item.id}`);
    setRoute({ kind: "release", id: item.id });
  }, []);

  // Open a release from the sweep log — the caller only knows the id.
  const openReleaseById = useCallback(
    (id: string) => {
      window.history.pushState(null, "", `/releases/${id}`);
      setRoute({ kind: "release", id });
    },
    [],
  );

  // Close modal = go back to whichever page we came from. replaceState,
  // NOT history.back() — back() could navigate to a previous entry with
  // a different modal already open.
  const closeModal = useCallback(() => {
    const target =
      page === "influencers"
        ? "/influencers"
        : page === "log"
          ? "/log"
          : "/";
    const next: Route =
      page === "influencers"
        ? { kind: "influencers" }
        : page === "log"
          ? { kind: "log" }
          : { kind: "feed" };
    window.history.replaceState(null, "", target);
    setRoute(next);
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
    if (route.kind === "log") {
      document.title = "Sweep Log — What Changed & When | AI/TLDR";
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
          {/*
            The brand element doubles as the <h1> ONLY on the feed home,
            since that's where "AI/TLDR" is also the page's semantic
            topic heading. On /influencers and /log, the page's own
            visible heading becomes the <h1>, so the brand degrades to a
            <p> here — single-H1-per-page is the SEO rule Google wants.
          */}
          {page === "feed" ? (
            <h1 className="brand-name">AI/TLDR</h1>
          ) : (
            <p className="brand-name">AI/TLDR</p>
          )}
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
          <button
            type="button"
            className={`nav-link nav-link-icon ${page === "log" ? "nav-active" : ""}`}
            onClick={goLog}
            title="Sweep log — what changed & when"
            aria-label="Sweep log"
          >
            <span className="nav-link-glyph" aria-hidden="true">▤</span>
          </button>
        </nav>
        <div className="page-head-right">
          <span className="head-stat sweep-stat">
            <SweepTimer lastSweep={feed.generatedAt} />
            <span className="head-stat-lbl">SWEEP CYCLE</span>
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
        </>
      ) : page === "influencers" ? (
        <InfluencersPage />
      ) : (
        <SweepLogPage onOpenRelease={openReleaseById} />
      )}

      {openItem && <ReleaseModal item={openItem} onClose={closeModal} />}

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
