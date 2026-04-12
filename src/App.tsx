import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";

import { allItems, categoryCounts, feed, filterItems } from "./data/feed";
import type { Category, ReleaseItem } from "./data/schema";
import { ReleaseCard } from "./components/ReleaseCard";
import { FilterBar } from "./components/FilterBar";
import { ReleaseModal } from "./components/ReleaseModal";

/** Find item by id from hash. Hash format: #item-id */
function itemFromHash(items: ReleaseItem[]): ReleaseItem | null {
  const hash = window.location.hash.slice(1); // strip #
  if (!hash) return null;
  return items.find((i) => i.id === hash) ?? null;
}

function App() {
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
        <div className="page-head-right">
          <span className="head-stat">
            <span className="head-stat-num">{feed.items.length}</span>
            <span className="head-stat-lbl">RELEASES</span>
          </span>
          <span className="head-stat">
            <span className="head-stat-num">
              {feed.generatedAt.slice(0, 10)}
            </span>
            <span className="head-stat-lbl">LAST SWEEP</span>
          </span>
        </div>
      </header>

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
