import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./App.css";

import { allItems, categoryCounts, filterItems } from "./data/feed";
import { CATEGORY_ORDER, type Category, type ReleaseItem } from "./data/schema";
import { ReleaseCard } from "./components/ReleaseCard";
import { FilterBar } from "./components/FilterBar";
import { ReleaseModal } from "./components/ReleaseModal";
import { InfluencersPage } from "./components/InfluencersPage";
import { SweepLogPage } from "./components/SweepLogPage";
import { StatsPage } from "./components/StatsPage";
import { Subscribe } from "./components/Subscribe";
import { BuyMeCoffee } from "./components/BuyMeCoffee";
import { track, useHeartbeat, useScrollDepth } from "./lib/analytics";
import type { LearnRoute } from "./components/learn/LearnSection";
import type { ModelsRoute } from "./components/models/ModelsSection";
import statsData from "./data/stats.json";
import type { StatsData } from "./data/stats";

// The whole Learn section (components + taxonomy + CSS) is one lazy
// chunk — feed readers never download it, so the main bundle stays
// taxonomy-free.
const LearnSection = lazy(() => import("./components/learn/LearnSection"));

// The LLM registry (/models) is likewise a self-contained lazy chunk —
// the registry tree, every per-model detail JSON, and its CSS ship apart
// from the feed bundle so the registry stays out of main.
const ModelsSection = lazy(() => import("./components/models/ModelsSection"));

/** Parse current URL into a route. Supported paths:
 *   /                     → feed home
 *   /influencers          → influencers page
 *   /log                  → sweep log page
 *   /releases/<id>        → feed with modal open for that item
 *   /releases/<category>  → feed filtered to that category (hub page)
 *   /learn[/cat[/sub[/slug]]] → Learn section (lazy chunk)
 * Legacy hash formats (#id, #influencers) still work so old bookmarks
 * and shared links keep functioning.
 */
type Route =
  | { kind: "feed" }
  | { kind: "influencers" }
  | { kind: "log" }
  | { kind: "release"; id: string }
  | { kind: "release-cat"; cat: Category }
  | { kind: "stats" }
  | LearnRoute
  | ModelsRoute;

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
  if (path === "/stats" || path === "/stats/") {
    return { kind: "stats" };
  }
  if (path === "/models" || path === "/models/") {
    return { kind: "models" };
  }
  const modelMatch = path.match(/^\/models\/([^/]+)\/?$/);
  if (modelMatch) return { kind: "model", slug: modelMatch[1] };

  const m = path.match(/^\/releases\/([^/]+)\/?$/);
  if (m) {
    // /releases/<category>/ is a hub page (prerendered) — render it in the
    // SPA as a category-filtered feed so the JS view matches the static page
    // instead of every hub collapsing to an identical unfiltered feed.
    if ((CATEGORY_ORDER as readonly string[]).includes(m[1])) {
      return { kind: "release-cat", cat: m[1] as Category };
    }
    return { kind: "release", id: m[1] };
  }

  if (path === "/learn/map" || path === "/learn/map/") {
    return { kind: "learn-map" };
  }

  if (path === "/learn/landscape" || path === "/learn/landscape/") {
    return { kind: "learn-landscape" };
  }

  const toolMatch = path.match(/^\/learn\/landscape\/([^/]+)\/?$/);
  if (toolMatch) return { kind: "learn-tool", slug: toolMatch[1] };

  const learn = path.match(/^\/learn(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?\/?$/);
  if (learn) {
    const [, cat, sub, slug] = learn;
    if (cat && sub && slug) return { kind: "learn-article", cat, sub, slug };
    if (cat && sub) return { kind: "learn-sub", cat, sub };
    if (cat) return { kind: "learn-cat", cat };
    return { kind: "learn" };
  }

  if (hash) return { kind: "release", id: hash };
  return { kind: "feed" };
}

/** Parse ?q=… from the current URL. Seeds the feed search box so the
 *  WebSite SearchAction entry point — `/?q=term`, used by Google's
 *  sitelinks search box and any shared search link — lands directly on
 *  filtered results. Capped to a sane length. */
function parseQueryFromUrl(): string {
  return (new URLSearchParams(window.location.search).get("q") ?? "").slice(0, 200);
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

/** Active category set seeded from the URL — `?cat=…` OR a `/releases/<cat>/`
 *  hub path (which prerenders a single-category index). Keeps the SPA's filter
 *  in step with whichever URL scheme the user landed on. */
function activeFromUrl(): Set<Category> {
  const m = window.location.pathname.match(/^\/releases\/([^/]+)\/?$/);
  if (m && (CATEGORY_ORDER as readonly string[]).includes(m[1])) {
    return new Set<Category>([m[1] as Category]);
  }
  return parseCategoriesFromUrl();
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

type Page = "feed" | "influencers" | "log" | "learn" | "stats" | "models";

function pageFromRoute(route: Route): Page {
  if (route.kind === "influencers") return "influencers";
  if (route.kind === "log") return "log";
  if (route.kind === "stats") return "stats";
  if (route.kind === "models" || route.kind === "model") return "models";
  if (route.kind.startsWith("learn")) return "learn";
  return "feed";
}

/** Both the plain feed and a `/releases/<cat>/` hub render the scrollable feed,
 *  so they share the infinite-scroll + scroll-restore machinery. */
function isFeedRoute(route: Route): boolean {
  return route.kind === "feed" || route.kind === "release-cat";
}

/** Cool isometric 3D-city glyph for the nav CITY link — two shaded towers, the
 *  faces lit at different opacities so it reads as 3D in a single colour. */
function CityGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      {/* tall tower (left) */}
      <polygon points="8,4 12,6 8,8 4,6" />
      <polygon points="4,6 8,8 8,18 4,16" opacity="0.5" />
      <polygon points="12,6 8,8 8,18 12,16" opacity="0.78" />
      {/* short tower (right) */}
      <polygon points="16,9 20,11 16,13 12,11" opacity="0.92" />
      <polygon points="12,11 16,13 16,20 12,18" opacity="0.45" />
      <polygon points="20,11 16,13 16,20 20,18" opacity="0.68" />
    </svg>
  );
}

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const page: Page = pageFromRoute(route);
  const isMap = route.kind === "learn-map";
  // The landscape + per-tool pages live under the Learn section but get their
  // own nav link, so split the "learn" active state between the two.
  const isLandscape =
    route.kind === "learn-landscape" || route.kind === "learn-tool";
  const [active, setActive] = useState<Set<Category>>(() => activeFromUrl());
  const [query, setQuery] = useState(() => parseQueryFromUrl());
  // Mobile hamburger drawer (nav + BMC + Subscribe). No-op on desktop
  // because CSS shows the secondary actions inline regardless.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !menuBtnRef.current?.contains(t)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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

  const pageRef = useRef<Page>(page);
  useEffect(() => { pageRef.current = page; }, [page]);

  // Passive engagement tracking — scroll depth milestones and 15s
  // heartbeats. Keyed on route.kind so each page (feed, influencers,
  // log, release-modal) is measured independently.
  useScrollDepth(route.kind);
  useHeartbeat(route.kind);

  // Nav: go to feed home. Drops any active category filter — clicking the
  // nav link is a "reset" action; to keep a filter, users navigate back.
  const goFeed = useCallback(() => {
    track("nav", { to: "feed", from: pageRef.current });
    window.history.pushState(null, "", "/");
    setRoute({ kind: "feed" });
    setActive(new Set());
  }, []);

  // Nav: go to influencers
  const goInfluencers = useCallback(() => {
    track("nav", { to: "influencers", from: pageRef.current });
    window.history.pushState(null, "", "/influencers/");
    setRoute({ kind: "influencers" });
  }, []);

  // Nav: go to sweep log
  const goLog = useCallback(() => {
    track("nav", { to: "log", from: pageRef.current });
    window.history.pushState(null, "", "/log/");
    setRoute({ kind: "log" });
  }, []);

  // Nav: AI Release Index (/stats). Linked from the footer + homepage body
  // (not the top nav — the header is already tight).
  const goStats = useCallback(() => {
    track("nav", { to: "stats", from: pageRef.current });
    window.history.pushState(null, "", "/stats/");
    setRoute({ kind: "stats" });
    window.scrollTo(0, 0);
  }, []);

  // Nav within the Learn section (and into it). Learn components render
  // plain <a href data-internal> links; LearnSection delegates clicks
  // here so navigation stays client-side. Every learn page starts at
  // the top — learn pages don't participate in feed scroll restore.
  const goLearnPath = useCallback((path: string) => {
    track("nav", { to: path, from: pageRef.current });
    window.history.pushState(null, "", path);
    setRoute(parseRoute());
    window.scrollTo(0, 0);
  }, []);

  // Nav within the LLM registry (and into it). ModelsSection renders plain
  // <a href data-internal> links and delegates clicks here, mirroring the
  // Learn section. Registry pages always start at the top.
  const goModelsPath = useCallback((path: string) => {
    track("nav", { to: path, from: pageRef.current });
    window.history.pushState(null, "", path);
    setRoute(parseRoute());
    window.scrollTo(0, 0);
  }, []);

  // Open modal = navigate to /releases/<id>
  const openModal = useCallback((item: ReleaseItem) => {
    track("release:open", {
      id: item.id,
      category: item.categories[0],
      importance: item.importance,
      source: "card",
    });
    window.history.pushState(null, "", `/releases/${item.id}/`);
    setRoute({ kind: "release", id: item.id });
  }, []);

  // Open a release from the sweep log — the caller only knows the id.
  const openReleaseById = useCallback(
    (id: string) => {
      const item = sorted.find((i) => i.id === id);
      track("release:open", {
        id,
        category: item?.categories[0],
        importance: item?.importance,
        source: "log",
      });
      window.history.pushState(null, "", `/releases/${id}/`);
      setRoute({ kind: "release", id });
    },
    [sorted],
  );

  // Close modal = go back to whichever page we came from. replaceState,
  // NOT history.back() — back() could navigate to a previous entry with
  // a different modal already open. For the feed route we also re-
  // attach the current scroll snapshot to the entry we're writing, so
  // refresh-at-modal-close still lands exactly where the feed was.
  const closeModal = useCallback(() => {
    const isFeed = page !== "influencers" && page !== "log";
    const target = page === "influencers"
      ? "/influencers/"
      : page === "log"
        ? "/log/"
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
      setActive(activeFromUrl());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keep <title> and <meta description> in sync with current route
  // so the tab title updates as users navigate and Google's JS-rendering
  // crawler sees the right thing. Static HTML pages already have the
  // correct tags baked in by scripts/prerender.ts.
  useEffect(() => {
    // Learn pages own their <title>/<meta> (set inside LearnSection,
    // which has the taxonomy data) — don't fight them here.
    if (route.kind.startsWith("learn")) return;
    // Likewise the LLM registry sets its own <title>/<meta> in ModelsSection.
    if (route.kind === "models" || route.kind === "model") return;
    if (route.kind === "release") {
      const item = sorted.find((i) => i.id === route.id);
      if (item) {
        document.title = `${item.title} — ${item.org} | AI/TLDR`;
        return;
      }
    }
    if (route.kind === "release-cat") {
      // Keep the prerendered hub title's intent on client nav (the static
      // file's own <title> is the canonical, richer one).
      const label = route.cat.charAt(0).toUpperCase() + route.cat.slice(1);
      document.title = `New AI ${label} Releases | AI/TLDR`;
      return;
    }
    if (route.kind === "influencers") {
      document.title = "AI Influencers — Who to Follow | AI/TLDR";
      return;
    }
    if (route.kind === "log") {
      document.title = "Sweep Log — What Changed & When | AI/TLDR";
      return;
    }
    if (route.kind === "stats") {
      document.title = "AI Release Index — Stats on New AI Releases | AI/TLDR";
      return;
    }
    document.title = "AI/TLDR — New AI Models, Tools & Papers This Week";
  }, [route, sorted]);

  // The homepage's static FAQ + "Learn AI from zero" link strip are
  // injected OUTSIDE #root (just before </body>) by scripts/prerender.ts
  // so crawlers see them in the raw HTML of `/` — they back the FAQPage
  // JSON-LD. React doesn't own those nodes, so once `/` is loaded they'd
  // linger in the DOM through every client-side SPA navigation, showing a
  // stray FAQ on /learn, /influencers, etc. — and a SECOND FAQ on article
  // pages, which render their own. They belong only on the feed home, so
  // toggle their visibility with the route. (On a direct landing on any
  // other page the static file has no such section, so this is a no-op.)
  useEffect(() => {
    document
      .querySelectorAll<HTMLElement>(".static-faq, .static-learn, .static-models")
      .forEach((el) => {
        el.style.display = page === "feed" ? "" : "none";
      });
  }, [page]);

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
      track("filter:toggle", {
        category: c,
        active: next.has(c),
        totalActive: next.size,
      });
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
    if (!hasMore || !isFeedRoute(route)) return;
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
  }, [hasMore, route, visible.length]);

  // Restore scroll-Y once after the initial render, if the snapshot
  // we rehydrated at mount time is still applicable. Runs in a layout
  // effect so the scroll lands before paint (no visible jump). We
  // also take over scroll-restoration from the browser for this path
  // — the default "auto" mode would race our restore and usually
  // lose, since our cards haven't all measured yet on the first tick.
  useLayoutEffect(() => {
    const snap = initialSnapshotRef.current;
    if (!snap || !isFeedRoute(route)) return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, snap.y);
    initialSnapshotRef.current = null;
  }, [route]);

  // Persist scrollY + visibleCount to sessionStorage as the user
  // scrolls (rAF-throttled) and on page hide. Reads the current
  // `active` / `visibleCount` via refs so the listener doesn't need
  // to re-attach on every state tick.
  const visibleCountRef = useRef(visibleCount);
  const activeRef = useRef(active);
  useEffect(() => { visibleCountRef.current = visibleCount; }, [visibleCount]);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    if (!isFeedRoute(route)) return;
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
  }, [route]);

  return (
    <div className="page">
      <header className="page-head">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            // Let middle-click / Ctrl+click / Cmd+click / Shift-click open
            // in a new tab or window the way a normal link would — only
            // intercept plain left-clicks to do client-side nav.
            if (
              e.button !== 0 ||
              e.ctrlKey ||
              e.metaKey ||
              e.shiftKey ||
              e.altKey
            ) {
              return;
            }
            e.preventDefault();
            goFeed();
          }}
          aria-label="AI/TLDR — home"
        >
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
        </a>

        <a
          className="bmc-icon"
          href="https://buymeacoffee.com/silver_d"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy me a coffee"
          title="Buy me a coffee"
          onClick={() => track("bmc:click")}
        >
          <img src="/coffee.png" alt="" aria-hidden="true" />
          <span className="bmc-icon-text">Buy me a coffee</span>
        </a>

        <button
          ref={menuBtnRef}
          type="button"
          className={`hamburger ${menuOpen ? "hamburger-open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="page-head-secondary"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="hamburger-glyph" aria-hidden="true">
            {menuOpen ? "✕" : "☰"}
          </span>
        </button>

        <div
          id="page-head-secondary"
          ref={menuRef}
          className={`page-head-secondary ${menuOpen ? "secondary-open" : ""}`}
        >
          <BuyMeCoffee />
          <nav className="page-nav">
            <button
              type="button"
              className={`nav-link ${page === "feed" ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goFeed();
              }}
            >
              <span className="nav-link-lbl">RELEASES</span>
            </button>
            <button
              type="button"
              className={`nav-link ${page === "learn" && !isLandscape && !isMap ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goLearnPath("/learn/");
              }}
            >
              <span className="nav-link-lbl">LEARN</span>
            </button>
            <button
              type="button"
              className={`nav-link ${isLandscape ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goLearnPath("/learn/landscape/");
              }}
            >
              <span className="nav-link-lbl">TOOLS</span>
            </button>
            <button
              type="button"
              className={`nav-link nav-link-city ${isMap ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goLearnPath("/learn/map/");
              }}
              title="Knowledge City — the interactive 3D map of Learn"
            >
              <span className="nav-link-3dic" aria-hidden="true">
                <CityGlyph />
              </span>
              <span className="nav-link-lbl">CITY</span>
            </button>
            <button
              type="button"
              className={`nav-link ${page === "models" ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goModelsPath("/models/");
              }}
            >
              <span className="nav-link-lbl">LLMS</span>
            </button>
            <button
              type="button"
              className={`nav-link ${page === "influencers" ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goInfluencers();
              }}
            >
              <span className="nav-link-lbl">INFLUENCERS</span>
            </button>
            <button
              type="button"
              className={`nav-link nav-link-icon ${page === "log" ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goLog();
              }}
              title="Sweep log — what changed & when"
              aria-label="Sweep log"
            >
              <span className="nav-link-glyph" aria-hidden="true">▤</span>
            </button>
            <button
              type="button"
              className={`nav-link nav-link-icon ${page === "stats" ? "nav-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                goStats();
              }}
              title="AI Release Index — stats on AI releases"
              aria-label="AI Release Index"
            >
              <span className="nav-link-glyph" aria-hidden="true">▦</span>
            </button>
          </nav>
          <Subscribe />
        </div>
      </header>

      <div className="subscribe-bar-mobile">
        <Subscribe />
      </div>

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
      ) : page === "learn" ? (
        <Suspense
          fallback={<div className="lrn-loading-fallback">// loading…</div>}
        >
          <LearnSection route={route as LearnRoute} onNavigate={goLearnPath} />
        </Suspense>
      ) : page === "models" ? (
        <Suspense
          fallback={<div className="lrn-loading-fallback">// loading…</div>}
        >
          <ModelsSection route={route as ModelsRoute} onNavigate={goModelsPath} />
        </Suspense>
      ) : page === "log" ? (
        <SweepLogPage onOpenRelease={openReleaseById} />
      ) : (
        <StatsPage data={statsData as StatsData} />
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
        {" "}·{" "}
        <a
          href="/stats/"
          onClick={(e) => {
            e.preventDefault();
            goStats();
          }}
        >
          AI Release Index
        </a>
      </footer>
    </div>
  );
}

export default App;
