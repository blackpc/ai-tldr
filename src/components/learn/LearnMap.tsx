/**
 * /learn/map — the Learn section as an interactive radial mind map.
 *
 * The whole taxonomy (root → 14 categories → 64 subcategories → 142
 * articles) is drawn as one full-bleed SVG radial tree: pan (drag the
 * canvas anywhere), zoom (wheel or the +/− buttons), hover to trace a
 * branch to its root, fold a category/subcategory by clicking its node,
 * jump to any page by clicking its label. The title + controls + legend
 * float over the canvas so the graph gets the whole viewport.
 *
 * Pure-presentational + SSR-safe: geometry comes from learnGraph (no DOM,
 * no randomness). All interactivity lives in client-only effects/handlers,
 * which never run during renderToStaticMarkup.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent } from "react";

import { learnTaxonomy } from "../../data/learn/nav";
import { categoryVisual } from "./categoryVisuals";
import {
  buildLearnGraph,
  labelTransform,
  radialLinkPath,
  RING,
  type GraphNode,
} from "./learnGraph";

const VIEW = 920; // viewBox half-extent (graph reaches RING[3]=525 + labels)
const MIN_K = 0.45;
const MAX_K = 4.5;

interface ViewState {
  k: number;
  x: number;
  y: number;
}

const IDENTITY: ViewState = { k: 1, x: 0, y: 0 };

export default function LearnMap() {
  const graph = useMemo(() => buildLearnGraph(), []);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [focusCat, setFocusCat] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewState>(IDENTITY);

  const q = query.trim().toLowerCase();

  // --- visibility (a node hides when any ancestor branch is folded) ------
  const isVisible = useCallback(
    (n: GraphNode) => {
      if (n.depth <= 1) return true;
      const anc = graph.ancestorsOf.get(n.id) ?? [];
      return !anc.some((id) => collapsed.has(id));
    },
    [graph, collapsed],
  );

  // --- the active set drives highlight + dimming -------------------------
  const branchOf = useCallback(
    (id: string): Set<string> => {
      const out = new Set<string>([id]);
      for (const a of graph.ancestorsOf.get(id) ?? []) out.add(a);
      const stack = [id];
      while (stack.length) {
        const cur = stack.pop()!;
        for (const kid of graph.childrenOf.get(cur) ?? []) {
          out.add(kid);
          stack.push(kid);
        }
      }
      return out;
    },
    [graph],
  );

  const activeSet = useMemo<Set<string> | null>(() => {
    if (hovered) return branchOf(hovered);
    if (q) {
      const out = new Set<string>();
      for (const n of graph.nodes) {
        if (n.label.toLowerCase().includes(q)) {
          out.add(n.id);
          for (const a of graph.ancestorsOf.get(n.id) ?? []) out.add(a);
        }
      }
      return out;
    }
    if (focusCat) {
      const out = new Set<string>(["root"]);
      for (const n of graph.nodes) if (n.catSlug === focusCat) out.add(n.id);
      return out;
    }
    return null;
  }, [hovered, q, focusCat, graph, branchOf]);

  const isActive = useCallback(
    (id: string) => (activeSet ? activeSet.has(id) : true),
    [activeSet],
  );

  // --- pan / zoom (work in SVG user space via the live screen matrix) ----
  const clientToView = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    return { x: (cx - ctm.e) / ctm.a, y: (cy - ctm.f) / ctm.d };
  }, []);

  const userScale = useCallback(() => {
    const ctm = svgRef.current?.getScreenCTM();
    return ctm ? ctm.a : 1;
  }, []);

  const zoomAt = useCallback((vx: number, vy: number, factor: number) => {
    setView((cur) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, cur.k * factor));
      const gx = (vx - cur.x) / cur.k;
      const gy = (vy - cur.y) / cur.k;
      return { k, x: vx - k * gx, y: vy - k * gy };
    });
  }, []);

  // Native, non-passive wheel listener so preventDefault actually stops
  // the page from scrolling while zooming (React's onWheel is passive).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = clientToView(e.clientX, e.clientY);
      zoomAt(p.x, p.y, e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [clientToView, zoomAt]);

  const drag = useRef<{ id: number; lx: number; ly: number } | null>(null);
  const onBgDown = useCallback((e: RPointerEvent<SVGRectElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
  }, []);
  const onBgMove = useCallback(
    (e: RPointerEvent<SVGRectElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const s = userScale();
      const dx = (e.clientX - d.lx) / s;
      const dy = (e.clientY - d.ly) / s;
      d.lx = e.clientX;
      d.ly = e.clientY;
      setView((cur) => ({ ...cur, x: cur.x + dx, y: cur.y + dy }));
    },
    [userScale],
  );
  const onBgUp = useCallback((e: RPointerEvent<SVGRectElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  }, []);

  const toggleFold = useCallback((id: string) => {
    setCollapsed((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsed(() => {
      const next = new Set<string>();
      for (const c of learnTaxonomy.categories) next.add(`cat:${c.slug}`);
      return next;
    });
  }, []);

  // ----------------------------------------------------------------------
  const links = graph.links.filter(
    (l) => isVisible(l.source) && isVisible(l.target),
  );
  const nodes = graph.nodes.filter(isVisible);
  const dimmed = activeSet !== null;
  const articleCount = graph.nodes.filter((n) => n.kind === "article").length;

  return (
    <div className="lrn-map-page">
      <div className="lrn-map-canvas">
        <svg
          ref={svgRef}
          className="lrn-map-svg"
          viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Radial map of every Learn AI topic"
        >
          {/* Oversized hit-plane so panning works across the whole
              canvas, including the letterboxed sides of the square viewBox. */}
          <rect
            x={-VIEW * 12}
            y={-VIEW * 12}
            width={VIEW * 24}
            height={VIEW * 24}
            fill="transparent"
            className="lrn-map-bg"
            onPointerDown={onBgDown}
            onPointerMove={onBgMove}
            onPointerUp={onBgUp}
            onPointerCancel={onBgUp}
          />
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {RING.slice(1).map((r) => (
              <circle key={r} cx={0} cy={0} r={r} className="lrn-map-ring" />
            ))}

            <g className="lrn-map-links">
              {links.map((l) => {
                const on = isActive(l.target.id);
                return (
                  <path
                    key={l.id}
                    d={radialLinkPath(l.source, l.target)}
                    stroke={l.accent}
                    className={`lrn-map-link${on ? " is-on" : ""}${
                      dimmed && !on ? " is-dim" : ""
                    }`}
                    strokeWidth={l.source.id === "root" ? 1.4 : 1}
                  />
                );
              })}
            </g>

            <g className="lrn-map-nodes">
              {nodes.map((n) => (
                <MapNode
                  key={n.id}
                  node={n}
                  active={isActive(n.id)}
                  dim={dimmed && !isActive(n.id)}
                  folded={collapsed.has(n.id)}
                  showLabel={
                    n.kind !== "article" ||
                    (activeSet !== null && activeSet.has(n.id))
                  }
                  onHover={setHovered}
                  onToggle={toggleFold}
                />
              ))}
            </g>
          </g>
        </svg>

        {/* title — floats over the canvas, top-left */}
        <div className="lrn-map-ui lrn-map-ui-tl">
          <a className="lrn-map-back" href="/learn" data-internal="true">
            ← LEARN
          </a>
          <div className="lrn-map-word">
            THE <span className="lrn-hub-title-accent">MAP</span>
          </div>
          <p className="lrn-map-hint">
            {articleCount} topics · drag to pan · scroll to zoom · click a dot
            to fold
          </p>
        </div>

        {/* controls — top-right */}
        <div className="lrn-map-ui lrn-map-ui-tr">
          <div className="lrn-map-search">
            <span className="lrn-map-search-ic" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              className="lrn-map-search-in"
              placeholder="FILTER…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter mind-map nodes by name"
            />
          </div>
          <div className="lrn-map-btns">
            <button
              type="button"
              className="lrn-map-btn"
              onClick={() => zoomAt(0, 0, 1.25)}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="lrn-map-btn"
              onClick={() => zoomAt(0, 0, 1 / 1.25)}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="lrn-map-btn lrn-map-btn-wide"
              onClick={() => {
                setView(IDENTITY);
                setCollapsed(new Set());
                setFocusCat(null);
              }}
            >
              RESET
            </button>
            <button
              type="button"
              className="lrn-map-btn lrn-map-btn-wide"
              onClick={collapseAll}
            >
              FOLD
            </button>
          </div>
        </div>

        {/* category legend — click to focus a branch */}
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
                onClick={() => setFocusCat(on ? null : c.slug)}
                onMouseEnter={() => setHovered(`cat:${c.slug}`)}
                onMouseLeave={() => setHovered(null)}
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

// -------------------------------------------------------------------------
// One node: its dot (foldable for category/sub) + its label (a link).
// The label is positioned from the origin via labelTransform, so it sits
// just outside its own dot — no double-offset.
// -------------------------------------------------------------------------
function MapNode({
  node,
  active,
  dim,
  folded,
  showLabel,
  onHover,
  onToggle,
}: {
  node: GraphNode;
  active: boolean;
  dim: boolean;
  folded: boolean;
  showLabel: boolean;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
}) {
  const enter = () => onHover(node.id);
  const leave = () => onHover(null);

  if (node.kind === "root") {
    return (
      <g
        className="lrn-map-node lrn-map-node-root"
        onMouseEnter={enter}
        onMouseLeave={leave}
      >
        <rect x={-13} y={-13} width={26} height={26} className="lrn-map-root-box" />
        <text className="lrn-map-root-label" textAnchor="middle" dy="0.32em">
          AI
        </text>
        <text className="lrn-map-root-cap" textAnchor="middle" y={30}>
          LEARN
        </text>
      </g>
    );
  }

  const gap = node.kind === "category" ? 12 : node.kind === "subcategory" ? 9 : 7;
  const { transform, anchor } = labelTransform(node, gap);
  const cls = `lrn-map-node lrn-map-node-${node.kind}${active ? " is-on" : ""}${
    dim ? " is-dim" : ""
  }`;
  const foldable = node.kind === "category" || node.kind === "subcategory";
  const r =
    node.kind === "category" ? 6.5 : node.kind === "subcategory" ? 4.2 : 2.6;

  return (
    <g className={cls} onMouseEnter={enter} onMouseLeave={leave}>
      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill={node.accent}
        className="lrn-map-dot"
        style={foldable ? { cursor: "pointer" } : undefined}
        onClick={
          foldable
            ? (e) => {
                e.stopPropagation();
                onToggle(node.id);
              }
            : undefined
        }
      />
      {folded && (
        <circle
          cx={node.x}
          cy={node.y}
          r={r + 3}
          className="lrn-map-folded-ring"
          stroke={node.accent}
        />
      )}
      {showLabel && (
        <a href={node.href} data-internal="true">
          <text
            className="lrn-map-label"
            transform={transform}
            textAnchor={anchor}
            dy="0.32em"
            fill={node.kind === "article" ? undefined : node.accent}
          >
            {node.label}
          </text>
        </a>
      )}
    </g>
  );
}
