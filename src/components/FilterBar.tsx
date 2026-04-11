import { CATEGORY_ORDER, type Category } from "../data/schema";
import { CATEGORY_META } from "../data/categories";

export function FilterBar({
  active,
  counts,
  query,
  onToggle,
  onClear,
  onQuery,
  totalShown,
  totalAll,
}: {
  active: Set<Category>;
  counts: Record<Category, number>;
  query: string;
  onToggle: (cat: Category) => void;
  onClear: () => void;
  onQuery: (q: string) => void;
  totalShown: number;
  totalAll: number;
}) {
  return (
    <div className="filterbar">
      <div className="filterbar-chips">
        <button
          type="button"
          className={`chip chip-all ${active.size === 0 ? "chip-on" : ""}`}
          onClick={onClear}
        >
          ALL <span className="chip-count">{totalAll}</span>
        </button>
        {CATEGORY_ORDER.map((c) => {
          const meta = CATEGORY_META[c];
          const on = active.has(c);
          return (
            <button
              type="button"
              key={c}
              className={`chip ${on ? "chip-on" : ""}`}
              onClick={() => onToggle(c)}
              title={meta.blurb}
            >
              {meta.label} <span className="chip-count">{counts[c] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div className="filterbar-right">
        <span className="filterbar-status">
          {totalShown}/{totalAll}
        </span>
        <div className="search">
          <span className="search-prompt">/</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="search title, org, tag…"
            aria-label="Search releases"
          />
        </div>
      </div>
    </div>
  );
}
