import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

import { allItems, categoryCounts, feed, filterItems } from "./data/feed";
import type { Category, ReleaseItem } from "./data/schema";
import { ReleaseCard } from "./components/ReleaseCard";
import { FilterBar } from "./components/FilterBar";
import { ReleaseModal } from "./components/ReleaseModal";
import { InfluencersPage } from "./components/InfluencersPage";
import { influencers } from "./data/influencers";

/** Find item by id from hash. Hash format: #item-id */
function itemFromHash(items: ReleaseItem[]): ReleaseItem | null {
  const hash = window.location.hash.slice(1); // strip #
  if (!hash) return null;
  return items.find((i) => i.id === hash) ?? null;
}

type Page = "feed" | "influencers";

function App() {
  const [page, setPage] = useState<Page>(() =>
    window.location.hash === "#influencers" ? "influencers" : "feed",
  );
  const [active, setActive] = useState<Set<Category>>(new Set());
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => allItems(), []);
  const counts = useMemo(() => categoryCounts(), []);
  const visible = useMemo(
    () => filterItems(sorted, { categories: active, query }),
    [sorted, active, query],
  );

  // Modal state driven by URL hash
  const [openItem, setOpenItem] = useState<ReleaseItem | null>(() =>
    itemFromHash(sorted),
  );

  // Open modal = push hash into URL
  const openModal = useCallback(
    (item: ReleaseItem) => {
      window.history.pushState(null, "", `#${item.id}`);
      setOpenItem(item);
    },
    [],
  );

  // Close modal = clear hash on *current* history entry (replaceState),
  // NOT history.back(). back() would navigate to the previous entry which
  // might have a *different* modal's hash → reopening that modal.
  const closeModal = useCallback(() => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    setOpenItem(null);
  }, []);

  // Sync modal state with browser back/forward
  useEffect(() => {
    const onPop = () => {
      setOpenItem(itemFromHash(sorted));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [sorted]);

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
            onClick={() => { setPage("feed"); window.history.replaceState(null, "", window.location.pathname); }}
          >
            <span className="nav-link-lbl">RELEASES</span>
            <span className="nav-link-num">{feed.items.length}</span>
          </button>
          <button
            type="button"
            className={`nav-link ${page === "influencers" ? "nav-active" : ""}`}
            onClick={() => { setPage("influencers"); window.history.replaceState(null, "", "#influencers"); }}
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
