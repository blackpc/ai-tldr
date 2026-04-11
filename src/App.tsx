import { useMemo, useState } from "react";

import "./App.css";

import { allItems, categoryCounts, feed, filterItems } from "./data/feed";
import type { Category, ReleaseItem } from "./data/schema";
import { ReleaseCard } from "./components/ReleaseCard";
import { FilterBar } from "./components/FilterBar";
import { ReleaseModal } from "./components/ReleaseModal";

function App() {
  const [active, setActive] = useState<Set<Category>>(new Set());
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<ReleaseItem | null>(null);

  const sorted = useMemo(() => allItems(), []);
  const counts = useMemo(() => categoryCounts(), []);
  const visible = useMemo(
    () => filterItems(sorted, { categories: active, query }),
    [sorted, active, query],
  );

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
          <span className="brand-name">AI/TLDR</span>
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
            <span className="head-stat-num">{feed.generatedAt.slice(0, 10)}</span>
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

      <main className="grid">
        {visible.length === 0 ? (
          <div className="grid-empty">
            // no releases match — adjust filters
          </div>
        ) : (
          visible.map((item) => (
            <ReleaseCard key={item.id} item={item} onOpen={setOpenItem} />
          ))
        )}
      </main>

      {openItem && (
        <ReleaseModal item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
}

export default App;
