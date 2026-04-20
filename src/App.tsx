import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./App.css";

import { allItems, categoryCounts, feed, filterItems } from "./data/feed";

const SWEEP_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in ms

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
          {formatDuration(state.elapsed) === "now" ? "just now" : `${formatDuration(state.elapsed)} ago`}
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
import { CATEGORY_ORDER, type Category, type ReleaseItem } from "./data/schema";
import { ReleaseCard } from "./components/ReleaseCard";
import { FilterBar } from "./components/FilterBar";
import { ReleaseModal } from "./components/ReleaseModal";
import { InfluencersPage } from "./components/InfluencersPage";
import { SweepLogPage } from "./components/SweepLogPage";
import { influencers } from "./data/influencers";
import { Subscribe } from "./components/Subscribe";

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

/** Parse ?cat=a,b,c from current URL into a validated category set. */
function parseCategoriesFromUrl(): Set<Category> {
  const valid = new Set<Category>(CATEGORY_ORDER);
  const cat = new URLSearchParams(window.location.search).get("cat");
  if (!cat) return new Set();
  return new Set(
    cat
      .split(",")
      .map((c) => c.trim())
      .filter((c): c is Category => valid.has(c as Category)),
  );
}

/** Initial card count rendered; incremented by PAGE_SIZE as the
 *  user scrolls. Tuned so the first paint stays cheap but the
 *  viewport isn't obviously empty below the fold. Count lives in
 *  React state (deliberately not URL-stateful — this is UI scroll
 *  depth, not a shareable query), plus a sessionStorage snapshot so
 *  refresh restores where you were. */
const INITIAL_COUNT = 30;
const PAGE_SIZE = 20;

/** Feed scroll/count is persisted in `window.history.state` for the
 *  current entry — invisible in the URL, survives refresh (the
 *  browser reattaches state to the same entry), and each back/
 *  forward entry gets its own stash. The payload pins the active
 *  category string so a refresh under a different filter falls back
 *  to a fresh page instead of restoring into a now-empty region. */
type ScrollSnapshot = { y: number; n: number; cat: string };

function serializeCat(active: Set<Category>): string {
  return CATEGORY_ORDER.filter((c) => active.has(c)).join(",");
}

function currentUrl(): string {
  return window.location.pathname + window.location.search;
}

function readScrollState(): ScrollSnapshot | null {
  const s = window.history.state as unknown;
  if (s && typeof s === "object") {
    const obj = s as Record<string, unknown>;
    if (
      typeof obj.y === "number" &&
      typeof obj.n === "number" &&
      typeof obj.cat === "string"
    ) {
      return { y: obj.y, n: obj.n, cat: obj.cat };
    }
  }
  return null;
}

function writeScrollState(snap: ScrollSnapshot): void {
  window.history.replaceState(snap, "", currentUrl());
}

function clearScrollState(): void {
  window.history.replaceState(null, "", currentUrl());
}

/** Build a feed-home URL (/, optionally with ?cat=a,b,c) from a category set. */
function buildFeedUrl(active: Set<Category>): string {
  if (active.size === 0) return "/";
  const cats = CATEGORY_ORDER.filter((c) => active.has(c)).join(",");
  return `/?cat=${cats}`;
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
  const [active, setActive] = useState<Set<Category>>(() =>
    parseCategoriesFromUrl(),
  );
  const [query, setQuery] = useState("");

  // Rehydrate the scroll state from history once at mount. The same
  // entry keeps its state across refresh, so landing here with a
  // matching cat string means we were here before — restore both
  // visibleCount (now, for the render) and scrollY (in a layout
  // effect, below). Stale-cat states are dropped so you can't land
  // in an empty region after switching filters out-of-band.
  const initialSnapshotRef = useRef<ScrollSnapshot | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    const snap = readScrollState();
    if (!snap) return INITIAL_COUNT;
    const currentCat = new URLSearchParams(window.location.search).get("cat") ?? "";
    if (snap.cat !== currentCat) return INITIAL_COUNT;
    initialSnapshotRef.current = snap;
    return Math.max(snap.n, INITIAL_COUNT);
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const sorted = useMemo(() => allItems(), []);
  const counts = useMemo(() => categoryCounts(), []);
  const visible = useMemo(
    () => filterItems(sorted, { categories: active, query }),
    [sorted, active, query],
  );
  const shown = useMemo(
    () => visible.slice(0, visibleCount),
    [visible, visibleCount],
  );
  const hasMore = visibleCount < visible.length;

  const openItem = useMemo(
    () => itemFromRoute(route, sorted),
    [route, sorted],
  );

  // Nav: go to feed home. Drops any active category filter — clicking the
  // nav link is a "reset" action; to keep a filter, users navigate back.
  const goFeed = useCallback(() => {
    window.history.pushState(null, "", "/");
    setRoute({ kind: "feed" });
    setActive(new Set());
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
  // a different modal already open. For the feed route we also re-
  // attach the current scroll snapshot to the entry we're writing, so
  // refresh-at-modal-close still lands exactly where the feed was.
  const closeModal = useCallback(() => {
    const isFeed = page !== "influencers" && page !== "log";
    const target = page === "influencers"
      ? "/influencers"
      : page === "log"
        ? "/log"
        : buildFeedUrl(active);
    const next: Route = page === "influencers"
      ? { kind: "influencers" }
      : page === "log"
        ? { kind: "log" }
        : { kind: "feed" };
    const state = isFeed && window.scrollY > 0
      ? { y: window.scrollY, n: visibleCount, cat: serializeCat(active) }
      : null;
    window.history.replaceState(state, "", target);
    setRoute(next);
  }, [page, active, visibleCount]);

  // Sync route + filter with browser back/forward. visibleCount is
  // intentionally not URL-synced, so popstate leaves it alone.
  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute());
      setActive(parseCategoriesFromUrl());
    };
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

  // Each chip toggle is a new history entry so the back button walks
  // through prior filter states. Changing the filter always resets the
  // scroll-depth back to the first page — otherwise you could land on
  // "page 5" of a category you just toggled on, with nothing above it
  // matching. Only meaningful on the feed page; chips aren't shown
  // elsewhere, so no other route can trigger this.
  const toggle = useCallback((c: Category) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      // pushState with null state creates a clean entry — no stale
      // scroll snapshot from the prior filter.
      window.history.pushState(null, "", buildFeedUrl(next));
      return next;
    });
    setVisibleCount(INITIAL_COUNT);
    window.scrollTo(0, 0);
  }, []);

  const clearFilters = useCallback(() => {
    setActive(new Set());
    setVisibleCount(INITIAL_COUNT);
    window.history.pushState(null, "", "/");
    window.scrollTo(0, 0);
  }, []);

  // Query changes also reset scroll-depth for the same reason filters
  // do — the matching-set changes, so prior counts are meaningless.
  // No pushState here (search is UI-local, not URL-stateful), so we
  // clear the current entry's state explicitly.
  const handleQuery = useCallback((q: string) => {
    setQuery(q);
    setVisibleCount(INITIAL_COUNT);
    clearScrollState();
  }, []);

  // Infinite scroll: grow the rendered slice when the sentinel enters
  // the viewport. rootMargin 800px pre-loads the next page before the
  // user hits the bottom, so the grid appears seamless.
  useEffect(() => {
    if (!hasMore || route.kind !== "feed") return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, visible.length));
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, route.kind, visible.length]);

  // Restore scroll-Y once after the initial render, if the snapshot
  // we rehydrated at mount time is still applicable. Runs in a layout
  // effect so the scroll lands before paint (no visible jump). We
  // also take over scroll-restoration from the browser for this path
  // — the default "auto" mode would race our restore and usually
  // lose, since our cards haven't all measured yet on the first tick.
  useLayoutEffect(() => {
    const snap = initialSnapshotRef.current;
    if (!snap || route.kind !== "feed") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, snap.y);
    initialSnapshotRef.current = null;
  }, [route.kind]);

  // Persist scrollY + visibleCount to sessionStorage as the user
  // scrolls (rAF-throttled) and on page hide. Reads the current
  // `active` / `visibleCount` via refs so the listener doesn't need
  // to re-attach on every state tick.
  const visibleCountRef = useRef(visibleCount);
  const activeRef = useRef(active);
  useEffect(() => { visibleCountRef.current = visibleCount; }, [visibleCount]);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    if (route.kind !== "feed") return;
    let raf = 0;
    const save = () => {
      const y = window.scrollY;
      // At the top = "clean state". Drop any snapshot so a refresh
      // lands on a fresh 30-item page rather than restoring the max
      // scroll the user ever reached this session.
      if (y <= 0) {
        clearScrollState();
        return;
      }
      writeScrollState({
        y,
        n: visibleCountRef.current,
        cat: serializeCat(activeRef.current),
      });
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        save();
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      if (raf) window.cancelAnimationFrame(raf);
      save(); // catch the final position on route change
    };
  }, [route.kind]);

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
        <Subscribe />
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
            onClear={clearFilters}
            onQuery={handleQuery}
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
              shown.map((item) => (
                <ReleaseCard key={item.id} item={item} onOpen={openModal} />
              ))
            )}
          </main>
          {hasMore && (
            <div
              ref={sentinelRef}
              className="feed-sentinel"
              aria-hidden="true"
            >
              <span className="feed-sentinel-dot" />
              <span className="feed-sentinel-dot" />
              <span className="feed-sentinel-dot" />
            </div>
          )}
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
        {" "}·{" "}
        <a href="mailto:support@shep.bot">support@shep.bot</a>
      </footer>
    </div>
  );
}

export default App;
