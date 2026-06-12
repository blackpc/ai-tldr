/**
 * /learn/map — the WebGL engine behind the 3D knowledge galaxy.
 *
 * Pure three.js, zero React: LearnMap.tsx dynamic-imports this module in
 * a client-only effect, so three.js ships as its own lazy chunk that only
 * the map page ever downloads, and prerender never touches WebGL.
 *
 * Scene model: the taxonomy as a galaxy. The AI core burns in the center,
 * 14 category "systems" orbit it on a wobbled disk, subcategory clusters
 * ring each system, and every article is a star in its cluster. Charted
 * (read) articles burn bright; uncharted ones smolder until visited.
 * Hierarchy edges are additive light-lines. The whole galaxy slow-rotates
 * when idle; clicking a system warps the camera to it.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Map3DKind = "root" | "cat" | "sub" | "art";

export interface Map3DNode {
  id: string;
  kind: Map3DKind;
  label: string;
  /** Category accent hex, inherited down the branch. */
  color: string;
  /** Site path to navigate to on click (articles). */
  href?: string;
  catSlug?: string;
  parentId?: string;
  difficulty?: string;
}

export interface Map3DHover {
  node: Map3DNode;
  /** Pointer position in canvas-local px, for the HTML tooltip. */
  x: number;
  y: number;
  read: boolean;
  catRead?: number;
  catTotal?: number;
}

export interface Map3DOptions {
  canvas: HTMLCanvasElement;
  /** Absolutely-positioned div the engine fills with projected labels. */
  labelLayer: HTMLElement;
  nodes: Map3DNode[];
  readSet: Set<string>;
  onHover(h: Map3DHover | null): void;
  onSelect(node: Map3DNode): void;
}

export interface Map3DHandle {
  dispose(): void;
  zoom(factor: number): void;
  resetView(): void;
  /** Warp to a category system (null = clear focus, keep camera). */
  focusCategory(slug: string | null): void;
  /** Recolor to a search query; returns the number of article matches. */
  setFilter(q: string): number;
  focusFirstMatch(): void;
  setReadSet(read: Set<string>): void;
}

const BG = 0x050505;
const UP = new THREE.Vector3(0, 1, 0);
const WHITE = new THREE.Color(1, 1, 1);
const HOME_POS = new THREE.Vector3(0, 135, 345);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

const SIZE: Record<Map3DKind, number> = { root: 0, cat: 17, sub: 9, art: 5 };

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Soft radial glow used by every star/point in the scene. */
function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

interface Tier {
  points: THREE.Points;
  nodes: Map3DNode[];
  /** Unfiltered per-vertex colors (filter recolors are derived from this). */
  base: Float32Array;
  geo: THREE.BufferGeometry;
}

export function createLearnMap3D(opts: Map3DOptions): Map3DHandle {
  const { canvas, labelLayer, nodes, onHover, onSelect } = opts;
  let readSet = new Set(opts.readSet);

  // --- graph indexes ------------------------------------------------------
  const root = nodes.find((n) => n.kind === "root")!;
  const cats = nodes.filter((n) => n.kind === "cat");
  const subs = nodes.filter((n) => n.kind === "sub");
  const arts = nodes.filter((n) => n.kind === "art");
  const childrenOf = new Map<string, Map3DNode[]>();
  for (const n of nodes) {
    if (!n.parentId) continue;
    if (!childrenOf.has(n.parentId)) childrenOf.set(n.parentId, []);
    childrenOf.get(n.parentId)!.push(n);
  }
  const artsByCat = new Map<string, Map3DNode[]>();
  for (const a of arts) {
    const key = a.catSlug ?? "";
    if (!artsByCat.has(key)) artsByCat.set(key, []);
    artsByCat.get(key)!.push(a);
  }

  // --- layout: deterministic galaxy geometry ------------------------------
  const pos = new Map<string, THREE.Vector3>();
  pos.set(root.id, new THREE.Vector3(0, 0, 0));

  cats.forEach((c, i) => {
    const a = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
    const y = 30 * Math.sin(a * 2.7 + 1.3); // disk wobble
    pos.set(c.id, new THREE.Vector3(Math.cos(a) * 175, y, Math.sin(a) * 175));
  });

  for (const c of cats) {
    const cp = pos.get(c.id)!;
    const out = cp.clone().setY(0).normalize();
    const u = new THREE.Vector3().crossVectors(UP, out).normalize();
    const v = new THREE.Vector3().crossVectors(out, u).normalize();
    const subList = childrenOf.get(c.id) ?? [];
    subList.forEach((s, j) => {
      const b = (j / subList.length) * Math.PI * 2 + 0.7;
      const r2 = subList.length > 6 ? 62 : 52;
      const sp = cp
        .clone()
        .addScaledVector(u, Math.cos(b) * r2)
        .addScaledVector(v, Math.sin(b) * r2 * 0.85)
        .addScaledVector(out, Math.sin(b * 2 + j) * 9);
      pos.set(s.id, sp);

      const w1 = u.clone().applyAxisAngle(out, j * 0.9);
      const w2 = v.clone().applyAxisAngle(out, j * 0.9);
      const artList = childrenOf.get(s.id) ?? [];
      artList.forEach((art, k) => {
        const b2 = (k / artList.length) * Math.PI * 2 + j;
        const r3 = artList.length > 5 ? 19 : 15;
        const ap = sp
          .clone()
          .addScaledVector(w1, Math.cos(b2) * r3)
          .addScaledVector(w2, Math.sin(b2) * r3)
          .addScaledVector(out, Math.cos(b2 * 2 + k) * 4);
        pos.set(art.id, ap);
      });
    });
  }

  // --- renderer / scene / camera ------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.0008);

  const camera = new THREE.PerspectiveCamera(55, 1, 1, 4000);
  camera.position.copy(HOME_POS);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 24;
  controls.maxDistance = 950;
  controls.enablePan = false;

  const galaxy = new THREE.Group();
  scene.add(galaxy);

  const tex = glowTexture();

  // --- node colors ----------------------------------------------------------
  const colorOf = (n: Map3DNode): THREE.Color => {
    const c = new THREE.Color(n.color);
    if (n.kind === "sub") return c.lerp(WHITE, 0.12);
    if (n.kind === "art") {
      return readSet.has(n.id)
        ? c.lerp(WHITE, 0.6) // charted: burns bright
        : c.multiplyScalar(0.42); // uncharted: smolders
    }
    return c;
  };

  // --- point tiers (one draw call per tier) ---------------------------------
  function makeTier(list: Map3DNode[], size: number): Tier {
    const position = new Float32Array(list.length * 3);
    const color = new Float32Array(list.length * 3);
    list.forEach((n, i) => {
      const p = pos.get(n.id)!;
      position.set([p.x, p.y, p.z], i * 3);
      const c = colorOf(n);
      color.set([c.r, c.g, c.b], i * 3);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(color, 3));
    const mat = new THREE.PointsMaterial({
      size,
      map: tex,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    galaxy.add(points);
    return { points, nodes: list, base: color.slice(), geo };
  }

  const catTier = makeTier(cats, SIZE.cat);
  const subTier = makeTier(subs, SIZE.sub);
  const artTier = makeTier(arts, SIZE.art);
  const tierOf = new Map<THREE.Object3D, Tier>([
    [catTier.points, catTier],
    [subTier.points, subTier],
    [artTier.points, artTier],
  ]);

  // --- the AI core -----------------------------------------------------------
  const coreGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      color: 0xf7ff00,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  coreGlow.scale.setScalar(64);
  galaxy.add(coreGlow);
  const coreHeart = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      color: 0xffffff,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  coreHeart.scale.setScalar(18);
  galaxy.add(coreHeart);

  // --- hierarchy edges as light-lines ----------------------------------------
  function makeEdges(
    pairs: [Map3DNode, Map3DNode][],
    pDim: number,
    cDim: number,
    opacity: number,
  ): THREE.LineSegments {
    const position = new Float32Array(pairs.length * 6);
    const color = new Float32Array(pairs.length * 6);
    pairs.forEach(([p, c], i) => {
      const pp = pos.get(p.id)!;
      const cp = pos.get(c.id)!;
      position.set([pp.x, pp.y, pp.z, cp.x, cp.y, cp.z], i * 6);
      const pc = new THREE.Color(p.kind === "root" ? "#f7ff00" : p.color).multiplyScalar(pDim);
      const cc = new THREE.Color(c.color).multiplyScalar(cDim);
      color.set([pc.r, pc.g, pc.b, cc.r, cc.g, cc.b], i * 6);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(color, 3));
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(geo, mat);
    lines.frustumCulled = false;
    galaxy.add(lines);
    return lines;
  }

  const trunkPairs: [Map3DNode, Map3DNode][] = [
    ...cats.map((c): [Map3DNode, Map3DNode] => [root, c]),
    ...subs.map((s): [Map3DNode, Map3DNode] => [byIdOrThrow(s.parentId), s]),
  ];
  const leafPairs: [Map3DNode, Map3DNode][] = arts.map((a) => [
    byIdOrThrow(a.parentId),
    a,
  ]);
  function byIdOrThrow(id: string | undefined): Map3DNode {
    const n = nodes.find((x) => x.id === id);
    if (!n) throw new Error(`map3d: missing parent ${id}`);
    return n;
  }
  makeEdges(trunkPairs, 0.6, 0.4, 0.55);
  makeEdges(leafPairs, 0.3, 0.18, 0.45);

  // --- starfield backdrop -----------------------------------------------------
  const starGeo = new THREE.BufferGeometry();
  {
    const N = 1400;
    const arr = new Float32Array(N * 3);
    let seed = 1337;
    const rnd = () => {
      // deterministic LCG so SSR snapshots / reloads look identical
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1)
        .normalize()
        .multiplyScalar(480 + rnd() * 520);
      arr.set([v.x, v.y, v.z], i * 3);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 1.6,
      map: tex,
      color: 0x99a3aa,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    }),
  );
  stars.frustumCulled = false;
  scene.add(stars);

  // --- hover highlight ---------------------------------------------------------
  const highlight = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      color: 0xffffff,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  highlight.visible = false;
  scene.add(highlight);
  let hovered: Map3DNode | null = null;

  // --- HTML labels (projected every frame) --------------------------------------
  let focusedCatId: string | null = null;
  const labelEls = new Map<string, HTMLElement>();

  function catChartedText(c: Map3DNode): string {
    const list = artsByCat.get(c.catSlug ?? "") ?? [];
    const read = list.filter((a) => readSet.has(a.id)).length;
    return `${read}/${list.length}`;
  }

  function buildLabels(): void {
    labelLayer.textContent = "";
    labelEls.clear();
    for (const c of cats) {
      const el = document.createElement("span");
      el.className = "lm3-label lm3-label-cat";
      el.style.color = c.color;
      el.textContent = c.label;
      const i = document.createElement("i");
      i.textContent = catChartedText(c);
      el.appendChild(i);
      labelLayer.appendChild(el);
      labelEls.set(c.id, el);
    }
    if (focusedCatId) {
      for (const s of childrenOf.get(focusedCatId) ?? []) {
        const el = document.createElement("span");
        el.className = "lm3-label lm3-label-sub";
        el.textContent = s.label;
        labelLayer.appendChild(el);
        labelEls.set(s.id, el);
      }
    }
  }
  buildLabels();

  const projV = new THREE.Vector3();
  function updateLabels(): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    galaxy.updateMatrixWorld();
    for (const [id, el] of labelEls) {
      projV.copy(pos.get(id)!).applyMatrix4(galaxy.matrixWorld).project(camera);
      if (projV.z > 1 || projV.x < -1.1 || projV.x > 1.1 || projV.y < -1.1 || projV.y > 1.1) {
        el.style.display = "none";
        continue;
      }
      el.style.display = "";
      const x = (projV.x * 0.5 + 0.5) * w;
      const y = (-projV.y * 0.5 + 0.5) * h;
      el.style.transform = `translate(-50%, -160%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }
  }

  // --- picking --------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points = { threshold: 5 };
  const ndc = new THREE.Vector2();

  function pick(clientX: number, clientY: number): Map3DNode | null {
    const rect = canvas.getBoundingClientRect();
    ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(
      [artTier.points, subTier.points, catTier.points, coreHeart],
      false,
    );
    for (const h of hits) {
      if (h.object === coreHeart) return root;
      const tier = tierOf.get(h.object);
      if (tier && h.index !== undefined) return tier.nodes[h.index] ?? null;
    }
    return null;
  }

  // --- camera warp -------------------------------------------------------------------
  interface Tween {
    t0: number;
    dur: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTar: THREE.Vector3;
    toTar: THREE.Vector3;
  }
  let tween: Tween | null = null;

  function worldPos(id: string): THREE.Vector3 {
    galaxy.updateMatrixWorld();
    return pos.get(id)!.clone().applyMatrix4(galaxy.matrixWorld);
  }

  function flyTo(target: THREE.Vector3, dist: number): void {
    const dir = target.clone().sub(worldPos(root.id));
    if (dir.lengthSq() < 1) dir.set(0, 0.25, 1);
    dir.normalize();
    const toPos = target
      .clone()
      .addScaledVector(dir, dist)
      .add(new THREE.Vector3(0, dist * 0.38, 0));
    tween = {
      t0: performance.now(),
      dur: 900,
      fromPos: camera.position.clone(),
      toPos,
      fromTar: controls.target.clone(),
      toTar: target.clone(),
    };
    controls.enabled = false;
  }

  // --- input ------------------------------------------------------------------------
  let downX = 0;
  let downY = 0;
  let downT = 0;
  let interacting = false;
  let lastUser = performance.now();

  const onControlStart = (): void => {
    interacting = true;
  };
  const onControlEnd = (): void => {
    interacting = false;
    lastUser = performance.now();
  };
  controls.addEventListener("start", onControlStart);
  controls.addEventListener("end", onControlEnd);

  const onPointerMove = (e: PointerEvent): void => {
    lastUser = performance.now();
    const node = pick(e.clientX, e.clientY);
    if (node !== hovered) {
      hovered = node;
      if (node && node.kind !== "root") {
        highlight.visible = true;
        highlight.position.copy(worldPos(node.id));
        highlight.material.color.set(node.color);
      } else {
        highlight.visible = false;
      }
    }
    canvas.style.cursor = node ? "pointer" : "grab";
    if (node) {
      const rect = canvas.getBoundingClientRect();
      const h: Map3DHover = {
        node,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        read: readSet.has(node.id),
      };
      if (node.kind === "cat") {
        const list = artsByCat.get(node.catSlug ?? "") ?? [];
        h.catRead = list.filter((a) => readSet.has(a.id)).length;
        h.catTotal = list.length;
      }
      onHover(h);
    } else {
      onHover(null);
    }
  };

  const onPointerLeave = (): void => {
    hovered = null;
    highlight.visible = false;
    onHover(null);
  };

  const onPointerDown = (e: PointerEvent): void => {
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
  };

  const onPointerUp = (e: PointerEvent): void => {
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (moved > 6 || performance.now() - downT > 600) return; // was a drag
    const node = pick(e.clientX, e.clientY);
    if (!node) return;
    if (node.kind === "art") {
      onSelect(node);
    } else if (node.kind === "root") {
      resetView();
    } else if (node.kind === "cat") {
      focusCategory(node.catSlug ?? null);
    } else {
      flyTo(worldPos(node.id), 42);
    }
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);

  // --- public ops ----------------------------------------------------------------------
  function resetView(): void {
    focusedCatId = null;
    buildLabels();
    tween = {
      t0: performance.now(),
      dur: 900,
      fromPos: camera.position.clone(),
      toPos: HOME_POS.clone(),
      fromTar: controls.target.clone(),
      toTar: HOME_TARGET.clone(),
    };
    controls.enabled = false;
  }

  function focusCategory(slug: string | null): void {
    if (!slug) {
      focusedCatId = null;
      buildLabels();
      return;
    }
    const cat = cats.find((c) => c.catSlug === slug);
    if (!cat) return;
    focusedCatId = cat.id;
    buildLabels();
    flyTo(worldPos(cat.id), 120);
  }

  // --- filter ------------------------------------------------------------------------
  let matchIds: string[] = [];

  function applyTierColors(
    tier: Tier,
    mod: (n: Map3DNode, c: THREE.Color) => void,
  ): void {
    const attr = tier.geo.getAttribute("color") as THREE.BufferAttribute;
    const out = attr.array as Float32Array;
    const c = new THREE.Color();
    tier.nodes.forEach((n, i) => {
      c.setRGB(tier.base[i * 3], tier.base[i * 3 + 1], tier.base[i * 3 + 2]);
      mod(n, c);
      out[i * 3] = c.r;
      out[i * 3 + 1] = c.g;
      out[i * 3 + 2] = c.b;
    });
    attr.needsUpdate = true;
  }

  function setFilter(qRaw: string): number {
    const q = qRaw.trim().toLowerCase();
    if (!q) {
      matchIds = [];
      for (const tier of [catTier, subTier, artTier]) applyTierColors(tier, () => {});
      return 0;
    }
    const matches = new Set<string>();
    const liveSubs = new Set<string>();
    const liveCats = new Set<string>();
    for (const a of arts) {
      if (a.label.toLowerCase().includes(q)) {
        matches.add(a.id);
        if (a.parentId) liveSubs.add(a.parentId);
        if (a.catSlug) liveCats.add(a.catSlug);
      }
    }
    matchIds = arts.filter((a) => matches.has(a.id)).map((a) => a.id);
    applyTierColors(artTier, (n, c) => {
      if (matches.has(n.id)) c.set("#ffe93d").multiplyScalar(1.6);
      else c.multiplyScalar(0.08);
    });
    applyTierColors(subTier, (n, c) => {
      if (!liveSubs.has(n.id)) c.multiplyScalar(0.15);
    });
    applyTierColors(catTier, (n, c) => {
      if (!liveCats.has(n.catSlug ?? "")) c.multiplyScalar(0.2);
    });
    return matchIds.length;
  }

  function focusFirstMatch(): void {
    const id = matchIds[0];
    if (id) flyTo(worldPos(id), 26);
  }

  function setReadSet(read: Set<string>): void {
    readSet = new Set(read);
    artTier.nodes.forEach((n, i) => {
      const c = colorOf(n);
      artTier.base[i * 3] = c.r;
      artTier.base[i * 3 + 1] = c.g;
      artTier.base[i * 3 + 2] = c.b;
    });
    if (matchIds.length === 0) applyTierColors(artTier, () => {});
    for (const c of cats) {
      const el = labelEls.get(c.id)?.querySelector("i");
      if (el) el.textContent = catChartedText(c);
    }
  }

  function zoom(factor: number): void {
    const v = camera.position.clone().sub(controls.target);
    const len = THREE.MathUtils.clamp(
      v.length() / factor,
      controls.minDistance,
      controls.maxDistance,
    );
    camera.position.copy(controls.target).addScaledVector(v.normalize(), len);
  }

  // --- resize ---------------------------------------------------------------------------
  const stage = canvas.parentElement!;
  function applySize(): void {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  applySize();
  const ro = new ResizeObserver(applySize);
  ro.observe(stage);

  // --- main loop --------------------------------------------------------------------------
  let raf = 0;
  let prev = performance.now();

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;

    // camera warp tween
    if (tween) {
      const t = Math.min(1, (now - tween.t0) / tween.dur);
      const e = easeInOutCubic(t);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
      controls.target.lerpVectors(tween.fromTar, tween.toTar, e);
      if (t >= 1) {
        tween = null;
        controls.enabled = true;
        lastUser = now;
      }
    }

    // idle drift: the galaxy breathes when nobody is flying it
    if (!tween && !interacting && now - lastUser > 3500 && !focusedCatId) {
      galaxy.rotation.y += dt * 0.05;
    }
    stars.rotation.y -= dt * 0.004;

    // core + highlight pulse
    const s = 1 + 0.06 * Math.sin(now / 480);
    coreGlow.scale.setScalar(64 * s);
    coreHeart.scale.setScalar(18 * (2 - s));
    if (highlight.visible && hovered) {
      highlight.position.copy(worldPos(hovered.id));
      highlight.scale.setScalar(
        SIZE[hovered.kind] * (2.1 + 0.25 * Math.sin(now / 160)),
      );
    }

    controls.update();
    updateLabels();
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  // --- teardown ------------------------------------------------------------------------------
  function dispose(): void {
    cancelAnimationFrame(raf);
    ro.disconnect();
    controls.removeEventListener("start", onControlStart);
    controls.removeEventListener("end", onControlEnd);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    controls.dispose();
    scene.traverse((o) => {
      const obj = o as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      const m = (obj as { material?: THREE.Material | THREE.Material[] }).material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    });
    tex.dispose();
    renderer.dispose();
    labelLayer.textContent = "";
  }

  return {
    dispose,
    zoom,
    resetView,
    focusCategory,
    setFilter,
    focusFirstMatch,
    setReadSet,
  };
}
