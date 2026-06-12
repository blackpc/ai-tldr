/**
 * /learn/map — the Learn section as a 3D knowledge galaxy.
 *
 * The taxonomy (AI core → 14 category systems → subcategory clusters →
 * 342 article stars) renders in WebGL via learnMap3dEngine, which this
 * component dynamic-imports in a client-only effect — three.js ships as
 * its own lazy chunk and never touches SSR/prerender (the static build
 * emits just this HUD shell).
 *
 * Gamified: reading an article "charts" it (learnProgress/localStorage).
 * Charted stars burn bright on the map, every category shows its charted
 * count, and the HUD awards an explorer rank for overall coverage.
 *
 * Controls: drag to orbit, scroll to zoom, click a system/cluster to
 * warp, click a star to read it, filter to hunt topics.
 */

import { useEffect, useRef, useState } from "react";

import { learnTaxonomy } from "../../data/learn/nav";
import { learnArticlePath, learnHubPath } from "../../data/learn/schema";
import { categoryVisual } from "./categoryVisuals";
import { getReadSet, learnRank } from "./learnProgress";
import type { Map3DHandle, Map3DHover, Map3DNode } from "./learnMap3dEngine";

function buildNodes(): Map3DNode[] {
  const out: Map3DNode[] = [
    { id: "root", kind: "root", label: "AI", color: "#f7ff00" },
  ];
  for (const cat of learnTaxonomy.categories) {
    const { accent } = categoryVisual(cat.slug);
    out.push({
      id: `cat:${cat.slug}`,
      kind: "cat",
      label: cat.title.toUpperCase(),
      color: accent,
      catSlug: cat.slug,
      parentId: "root",
    });
    for (const sub of cat.subcategories) {
      out.push({
        id: `sub:${sub.slug}`,
        kind: "sub",
        label: sub.title,
        color: accent,
        catSlug: cat.slug,
        parentId: `cat:${cat.slug}`,
      });
      for (const a of sub.articles) {
        out.push({
          id: a.slug,
          kind: "art",
          label: a.title,
          color: accent,
          catSlug: cat.slug,
          parentId: `sub:${sub.slug}`,
          href: learnArticlePath(cat.slug, sub.slug, a.slug),
          difficulty: a.difficulty,
        });
      }
    }
  }
  return out;
}

interface Stats {
  read: number;
  total: number;
  pct: number;
  rank: string;
}

const KIND_LABEL: Record<string, string> = {
  root: "THE CORE",
  cat: "SYSTEM",
  sub: "CLUSTER",
  art: "ARTICLE",
};

export default function LearnMap({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelsRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Map3DHandle | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [hover, setHover] = useState<Map3DHover | null>(null);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<number | null>(null);
  const [focusCat, setFocusCat] = useState<string | null>(null);
  const [webglDown, setWebglDown] = useState(false);

  const articleCount = learnTaxonomy.categories.reduce(
    (n, c) => n + c.subcategories.reduce((m, s) => m + s.articles.length, 0),
    0,
  );

  // Boot the WebGL engine, client-only. three.js loads on demand here.
  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current;
    const labelLayer = labelsRef.current;
    if (!canvas || !labelLayer) return;

    const readSet = getReadSet();
    setStats({
      read: readSet.size,
      total: articleCount,
      pct: Math.round((readSet.size / Math.max(1, articleCount)) * 100),
      rank: learnRank(readSet.size, articleCount),
    });

    import("./learnMap3dEngine")
      .then(({ createLearnMap3D }) => {
        if (disposed) return;
        engineRef.current = createLearnMap3D({
          canvas,
          labelLayer,
          nodes: buildNodes(),
          readSet,
          onHover: setHover,
          onSelect: (node) => {
            if (node.href && onNavigate) onNavigate(node.href);
            else if (node.href) window.location.assign(node.href);
          },
        });
      })
      .catch(() => setWebglDown(true));

    return () => {
      disposed = true;
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

  const toggleCat = (slug: string): void => {
    const next = focusCat === slug ? null : slug;
    setFocusCat(next);
    engineRef.current?.focusCategory(next);
  };

  const tipX = hover ? Math.min(hover.x + 16, 9999) : 0;
  const tipY = hover ? hover.y + 16 : 0;

  return (
    <div className="lrn-map-page">
      <div className="lrn-map-canvas" ref={stageRef}>
        <canvas ref={canvasRef} className="lrn-map3-canvas" />
        <div ref={labelsRef} className="lrn-map3-labels" aria-hidden="true" />

        {webglDown && (
          <div className="lrn-map3-fallback">
            <p>
              The 3D map needs WebGL.{" "}
              <a href={learnHubPath} data-internal="true">
                Browse the index instead →
              </a>
            </p>
          </div>
        )}

        {/* title + rank — floats top-left */}
        <div className="lrn-map-ui lrn-map-ui-tl">
          <a className="lrn-map-back" href={learnHubPath} data-internal="true">
            ← LEARN
          </a>
          <div className="lrn-map-word">
            THE <span className="lrn-hub-title-accent">GALAXY</span>
          </div>
          <p className="lrn-map-hint">
            {articleCount} topics · drag to orbit · scroll to zoom · click a
            system to fly · click a star to read
          </p>
          <div className="lrn-map-rank">
            <span className="lrn-map-rank-name">
              {stats ? stats.rank : "—"}
            </span>
            <span className="lrn-map-rank-nums">
              {stats ? `${stats.read}/${stats.total} CHARTED · ${stats.pct}%` : ""}
            </span>
            <span className="lrn-map-rank-bar" aria-hidden="true">
              <i style={{ width: `${stats ? stats.pct : 0}%` }} />
            </span>
          </div>
        </div>

        {/* controls — top-right */}
        <div className="lrn-map-ui lrn-map-ui-tr">
          {matches !== null && (
            <span className="lrn-map-hits">{matches} HITS</span>
          )}
          <div className="lrn-map-search">
            <span className="lrn-map-search-ic" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              className="lrn-map-search-in"
              placeholder="FILTER…"
              value={query}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") engineRef.current?.focusFirstMatch();
              }}
              aria-label="Filter the galaxy by topic name"
            />
          </div>
          <div className="lrn-map-btns">
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
                setFocusCat(null);
                setFilter("");
                engineRef.current?.resetView();
              }}
            >
              RESET
            </button>
          </div>
        </div>

        {/* hover tooltip */}
        {hover && (
          <div
            className="lrn-map-tip"
            style={{ left: tipX, top: tipY, ["--cat" as string]: hover.node.color }}
          >
            <span className="lrn-map-tip-kind">
              {KIND_LABEL[hover.node.kind]}
              {hover.node.kind === "cat" &&
                hover.catTotal !== undefined &&
                ` · ${hover.catRead}/${hover.catTotal} CHARTED`}
            </span>
            <span className="lrn-map-tip-title">{hover.node.label}</span>
            {hover.node.kind === "art" && (
              <span className="lrn-map-tip-meta">
                {hover.node.difficulty?.toUpperCase()}
                {" · "}
                {hover.read ? (
                  <b className="is-read">CHARTED ✓</b>
                ) : (
                  <b>UNCHARTED</b>
                )}
                {" · CLICK TO READ"}
              </span>
            )}
            {hover.node.kind === "cat" && (
              <span className="lrn-map-tip-meta">CLICK TO FLY THERE</span>
            )}
          </div>
        )}

        {/* category legend — click to warp to a system */}
        <div className="lrn-map-legend">
          {learnTaxonomy.categories.map((c) => {
            const { accent } = categoryVisual(c.slug);
            const on = focusCat === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                className={`lrn-map-chip${on ? " is-on" : ""}`}
                style={{ ["--cat" as string]: accent }}
                onClick={() => toggleCat(c.slug)}
              >
                <span className="lrn-map-chip-dot" />
                {c.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
