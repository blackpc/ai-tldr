/**
 * /learn/map — KNOWLEDGE CITY. The Learn encyclopedia as a playable
 * procedural city: every article is a tower, reading it lights the
 * building, districts are categories, beacons fire when a district is
 * fully powered. learnMap3dEngine renders the world (three.js, dynamic-
 * imported client-side so it ships as its own lazy chunk); this component
 * is the game HUD — power meter, rank, quest button, tower card, filter,
 * district chips.
 *
 * SSR/prerender emit only this shell; the canvas boots in the browser.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { learnTaxonomy } from "../../data/learn/nav";
import { learnArticlePath, learnHubPath } from "../../data/learn/schema";
import { categoryVisual } from "./categoryVisuals";
import { getReadSet, learnRank } from "./learnProgress";
import type {
  CityDistrict,
  CityHandle,
  CityHover,
  CityTowerInfo,
  CityView,
} from "./learnMap3dEngine";

// Survives SPA navigation (the chunk stays loaded): reading an article and
// coming back restores the exact camera instead of replaying the intro.
let savedView: CityView | null = null;

function buildDistricts(): CityDistrict[] {
  return learnTaxonomy.categories.map((cat) => ({
    slug: cat.slug,
    title: cat.title,
    color: categoryVisual(cat.slug).accent,
    blocks: cat.subcategories.map((sub) => ({
      slug: sub.slug,
      title: sub.title,
      articles: sub.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        difficulty: a.difficulty,
        href: learnArticlePath(cat.slug, sub.slug, a.slug),
      })),
    })),
  }));
}

interface Stats {
  read: number;
  total: number;
  pct: number;
  rank: string;
  perCat: Map<string, { read: number; total: number }>;
}

function computeStats(): Stats {
  const readSet = getReadSet();
  const perCat = new Map<string, { read: number; total: number }>();
  let read = 0;
  let total = 0;
  for (const cat of learnTaxonomy.categories) {
    let r = 0;
    let t = 0;
    for (const sub of cat.subcategories)
      for (const a of sub.articles) {
        t++;
        if (readSet.has(a.slug)) r++;
      }
    perCat.set(cat.slug, { read: r, total: t });
    read += r;
    total += t;
  }
  return {
    read,
    total,
    pct: Math.round((read / Math.max(1, total)) * 100),
    rank: learnRank(read, total),
    perCat,
  };
}

export default function LearnMap({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CityHandle | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [hover, setHover] = useState<CityHover | null>(null);
  const [selected, setSelected] = useState<CityTowerInfo | null>(null);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<number | null>(null);
  const [focusCat, setFocusCat] = useState<string | null>(null);
  const [webglDown, setWebglDown] = useState(false);

  const articleCount = useMemo(
    () =>
      learnTaxonomy.categories.reduce(
        (n, c) => n + c.subcategories.reduce((m, s) => m + s.articles.length, 0),
        0,
      ),
    [],
  );

  // Boot the city, client-only. three.js loads on demand here.
  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStats(computeStats());

    import("./learnMap3dEngine")
      .then(({ createLearnMap3D }) => {
        if (disposed) return;
        engineRef.current = createLearnMap3D({
          canvas,
          districts: buildDistricts(),
          readSet: getReadSet(),
          initialView: savedView ?? undefined,
          onHover: setHover,
          onSelectTower: setSelected,
          onFocusDistrict: setFocusCat,
        });
      })
      .catch(() => setWebglDown(true));

    return () => {
      disposed = true;
      if (engineRef.current) savedView = engineRef.current.getView();
      engineRef.current?.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (q: string): void => {
    setQuery(q);
    const n = engineRef.current?.setFilter(q) ?? 0;
    setMatches(q.trim() ? n : null);
  };

  const openSelected = (e: React.MouseEvent): void => {
    if (!selected) return;
    if (onNavigate) {
      e.preventDefault();
      onNavigate(selected.href);
    }
  };

  return (
    <div className="lrn-map-page">
      <div className="lrn-map-canvas">
        <canvas ref={canvasRef} className="lrn-map3-canvas" />

        {webglDown && (
          <div className="lrn-map3-fallback">
            <p>
              The city needs WebGL.{" "}
              <a href={learnHubPath} data-internal="true">
                Browse the index instead →
              </a>
            </p>
          </div>
        )}

        {/* title + power HUD — top-left */}
        <div className="lrn-map-ui lrn-map-ui-tl">
          <a className="lrn-map-back" href={learnHubPath} data-internal="true">
            ← LEARN
          </a>
          <div className="lrn-map-word">
            KNOWLEDGE <span className="lrn-hub-title-accent">CITY</span>
          </div>
          <p className="lrn-map-hint">
            {articleCount} towers · every article is a building — reading it
            lights it up · drag to roam · right-drag to orbit · scroll to zoom
          </p>
          <div className="lrn-map-rank">
            <span className="lrn-map-rank-name">{stats ? stats.rank : "—"}</span>
            <span className="lrn-map-rank-nums">
              {stats
                ? `CITY POWER ${stats.pct}% · ${stats.read}/${stats.total} TOWERS LIT`
                : ""}
            </span>
            <span className="lrn-map-rank-bar" aria-hidden="true">
              <i style={{ width: `${stats ? stats.pct : 0}%` }} />
            </span>
          </div>
        </div>

        {/* controls — top-right */}
        <div className="lrn-map-ui lrn-map-ui-tr">
          {matches !== null && <span className="lrn-map-hits">{matches} HITS</span>}
          <div className="lrn-map-search">
            <span className="lrn-map-search-ic" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              className="lrn-map-search-in"
              placeholder="FIND A TOWER…"
              value={query}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") engineRef.current?.nextTarget();
              }}
              aria-label="Find a tower by topic name"
            />
          </div>
          <div className="lrn-map-btns">
            <button
              type="button"
              className="lrn-map-btn lrn-map-btn-quest"
              onClick={() => engineRef.current?.nextTarget()}
            >
              ⚡ NEXT TARGET
            </button>
            <button
              type="button"
              className="lrn-map-btn"
              onClick={() => engineRef.current?.zoom(1.3)}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="lrn-map-btn"
              onClick={() => engineRef.current?.zoom(1 / 1.3)}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="lrn-map-btn lrn-map-btn-wide"
              onClick={() => {
                setFilter("");
                engineRef.current?.resetView();
              }}
            >
              RESET
            </button>
          </div>
        </div>

        {/* hover tooltip */}
        {hover && !selected && (
          <div
            className="lrn-map-tip"
            style={{
              left: hover.x + 16,
              top: hover.y + 16,
              ["--cat" as string]: hover.color,
            }}
          >
            <span className="lrn-map-tip-kind">
              {hover.kind === "tower"
                ? hover.read
                  ? "TOWER · LIT ✓"
                  : "TOWER · DARK"
                : hover.kind === "block"
                  ? "BLOCK"
                  : hover.kind === "district"
                    ? "DISTRICT"
                    : "MONUMENT"}
            </span>
            <span className="lrn-map-tip-title">{hover.label}</span>
            {hover.sub && <span className="lrn-map-tip-meta">{hover.sub}</span>}
          </div>
        )}

        {/* selected tower card */}
        {selected && (
          <div
            className="lrn-map-card"
            style={{ ["--cat" as string]: selected.color }}
          >
            <button
              type="button"
              className="lrn-map-card-x"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <span className="lrn-map-tip-kind">
              {selected.district} · {selected.block}
            </span>
            <span className="lrn-map-card-title">{selected.title}</span>
            <span className="lrn-map-tip-meta">
              {selected.difficulty.toUpperCase()} ·{" "}
              {selected.read ? (
                <b className="is-read">LIT ✓ — READ AGAIN</b>
              ) : (
                <b>DARK — POWER IT UP</b>
              )}
            </span>
            <a
              className="lrn-map-card-go"
              href={selected.href}
              data-internal="true"
              onClick={openSelected}
            >
              READ ARTICLE →
            </a>
          </div>
        )}

        {/* district chips with power counters */}
        <div className="lrn-map-legend">
          {learnTaxonomy.categories.map((c) => {
            const { accent } = categoryVisual(c.slug);
            const p = stats?.perCat.get(c.slug);
            const on = focusCat === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                className={`lrn-map-chip${on ? " is-on" : ""}`}
                style={{ ["--cat" as string]: accent }}
                onClick={() => engineRef.current?.focusDistrict(on ? null : c.slug)}
              >
                <span className="lrn-map-chip-dot" />
                {c.title}
                {p && (
                  <span className="lrn-map-chip-n">
                    {p.read}/{p.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
