/**
 * Pure radial-tree layout for the Learn mind map (/learn/map).
 *
 * Turns the taxonomy (root → 14 categories → subcategories → articles)
 * into a deterministic set of positioned nodes + curved links. Pure and
 * SSR-safe (no DOM, no randomness, no Date) so the exact same geometry is
 * produced by scripts/prerender-learn.tsx and the client hydrate — the
 * static SVG and the interactive SVG line up pixel-for-pixel.
 *
 * Geometry: every article (leaf) gets an evenly-spaced angular slot around
 * the full circle; each internal node sits at the mid-angle of its children
 * (a classic radial tidy-tree). Radius is fixed per depth, so collapsing a
 * branch only hides nodes — nothing ever moves.
 */

import { learnTaxonomy } from "../../data/learn/nav";
import {
  learnArticlePath,
  learnCategoryPath,
  learnSubcategoryPath,
} from "../../data/learn/schema";
import { categoryVisual } from "./categoryVisuals";

export type GraphKind = "root" | "category" | "subcategory" | "article";

export interface GraphNode {
  id: string;
  kind: GraphKind;
  label: string;
  /** Internal site path (categories / subs / articles); root has none. */
  href?: string;
  depth: 0 | 1 | 2 | 3;
  angle: number; // radians
  radius: number;
  x: number;
  y: number;
  /** Owning category's accent color (root = brand yellow). */
  accent: string;
  /** Owning category slug ("" for root). */
  catSlug: string;
  parentId: string | null;
}

export interface GraphLink {
  id: string;
  source: GraphNode;
  target: GraphNode;
  accent: string;
  catSlug: string;
}

export interface LearnGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  byId: Map<string, GraphNode>;
  /** node id → child node ids (root, categories, subcategories). */
  childrenOf: Map<string, string[]>;
  /** node id → ordered ancestor ids up to (not including) root. */
  ancestorsOf: Map<string, string[]>;
  /** Half-extent of the node geometry (before labels), for the viewBox. */
  extent: number;
}

/** Radius of each depth ring. Tuned so 142 leaves breathe and the whole
 *  graph (plus label gutter) fits a square viewBox. */
export const RING = [0, 165, 345, 525] as const;
const START = -Math.PI / 2; // first leaf at 12 o'clock
const TWO_PI = Math.PI * 2;

function polar(r: number, a: number): { x: number; y: number } {
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

let cached: LearnGraph | null = null;

export function buildLearnGraph(): LearnGraph {
  if (cached) return cached;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const childrenOf = new Map<string, string[]>();

  const cats = learnTaxonomy.categories;
  const totalLeaves = cats.reduce(
    (n, c) => n + c.subcategories.reduce((m, s) => m + Math.max(1, s.articles.length), 0),
    0,
  );

  const root: GraphNode = {
    id: "root",
    kind: "root",
    label: "LEARN AI",
    depth: 0,
    angle: 0,
    radius: 0,
    x: 0,
    y: 0,
    accent: "#f7ff00",
    catSlug: "",
    parentId: null,
  };
  nodes.push(root);

  let leaf = 0;
  const slot = () => {
    const a = START + ((leaf + 0.5) / totalLeaves) * TWO_PI;
    leaf += 1;
    return a;
  };

  const catIds: string[] = [];

  for (const cat of cats) {
    const { accent } = categoryVisual(cat.slug);
    const catId = `cat:${cat.slug}`;
    const subIds: string[] = [];
    const subAngles: number[] = [];

    for (const sub of cat.subcategories) {
      const subId = `sub:${cat.slug}/${sub.slug}`;
      const artIds: string[] = [];
      const artAngles: number[] = [];

      for (const art of sub.articles) {
        const a = slot();
        const p = polar(RING[3], a);
        const id = `art:${art.slug}`;
        nodes.push({
          id,
          kind: "article",
          label: art.title,
          href: learnArticlePath(cat.slug, sub.slug, art.slug),
          depth: 3,
          angle: a,
          radius: RING[3],
          x: p.x,
          y: p.y,
          accent,
          catSlug: cat.slug,
          parentId: subId,
        });
        artIds.push(id);
        artAngles.push(a);
      }
      // A subcategory with no articles still claims one slot so the ring
      // stays evenly spaced (defensive — every sub has ≥2 in practice).
      const sa = artAngles.length
        ? (artAngles[0] + artAngles[artAngles.length - 1]) / 2
        : slot();
      const sp = polar(RING[2], sa);
      nodes.push({
        id: subId,
        kind: "subcategory",
        label: sub.title,
        href: learnSubcategoryPath(cat.slug, sub.slug),
        depth: 2,
        angle: sa,
        radius: RING[2],
        x: sp.x,
        y: sp.y,
        accent,
        catSlug: cat.slug,
        parentId: catId,
      });
      childrenOf.set(subId, artIds);
      subIds.push(subId);
      subAngles.push(sa);
    }

    const ca = subAngles.length
      ? (subAngles[0] + subAngles[subAngles.length - 1]) / 2
      : START;
    const cp = polar(RING[1], ca);
    nodes.push({
      id: catId,
      kind: "category",
      label: cat.title,
      href: learnCategoryPath(cat.slug),
      depth: 1,
      angle: ca,
      radius: RING[1],
      x: cp.x,
      y: cp.y,
      accent,
      catSlug: cat.slug,
      parentId: "root",
    });
    childrenOf.set(catId, subIds);
    catIds.push(catId);
  }
  childrenOf.set("root", catIds);

  // Resolve links + ancestor chains now that every node exists.
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const [parentId, kids] of childrenOf) {
    const parent = byId.get(parentId)!;
    for (const kid of kids) {
      const target = byId.get(kid)!;
      links.push({
        id: `${parentId}->${kid}`,
        source: parent,
        target,
        accent: target.accent,
        catSlug: target.catSlug,
      });
    }
  }

  const ancestorsOf = new Map<string, string[]>();
  for (const n of nodes) {
    const chain: string[] = [];
    let cur = n.parentId;
    while (cur && cur !== "root") {
      chain.push(cur);
      cur = byId.get(cur)?.parentId ?? null;
    }
    ancestorsOf.set(n.id, chain);
  }

  cached = {
    nodes,
    links,
    byId,
    childrenOf,
    ancestorsOf,
    extent: RING[3],
  };
  return cached;
}

/**
 * Smooth radial link path (the d3.linkRadial shape) from a parent node to
 * a child node: a cubic Bézier whose control points ride the mid-radius at
 * each end's angle, so links fan out cleanly without crossing their nodes.
 */
export function radialLinkPath(source: GraphNode, target: GraphNode): string {
  // From the center hub (radius 0) the source has no meaningful angle, so a
  // curve would bend toward an arbitrary direction (east) and pull the burst
  // off-center — draw those spokes straight instead.
  if (source.radius === 0) {
    return `M0,0L${target.x.toFixed(2)},${target.y.toFixed(2)}`;
  }
  const midR = (source.radius + target.radius) / 2;
  const c1 = polar(midR, source.angle);
  const c2 = polar(midR, target.angle);
  return `M${source.x.toFixed(2)},${source.y.toFixed(2)}C${c1.x.toFixed(2)},${c1.y.toFixed(2)} ${c2.x.toFixed(2)},${c2.y.toFixed(2)} ${target.x.toFixed(2)},${target.y.toFixed(2)}`;
}

/** Label transform that keeps text upright and reading away from center. */
export function labelTransform(node: GraphNode, gap: number): {
  transform: string;
  anchor: "start" | "end";
} {
  const deg = (node.angle * 180) / Math.PI;
  const flip = Math.cos(node.angle) < 0;
  const base = `rotate(${deg.toFixed(2)}) translate(${(node.radius + gap).toFixed(2)},0)`;
  return {
    transform: flip ? `${base} rotate(180)` : base,
    anchor: flip ? "end" : "start",
  };
}
