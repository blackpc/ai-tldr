/**
 * /learn/map — KNOWLEDGE CITY: the Learn encyclopedia as a procedural
 * night city, rendered in WebGL (three.js).
 *
 * World model:
 *   - 14 DISTRICTS (categories) on a 5x3 city grid, accent-trimmed plates
 *   - named BLOCKS (subcategories): raised platforms, neon curbs, street
 *     signs that fade in as you approach
 *   - every article is a TOWER. Walls are real lit geometry (PBR, moon
 *     shadows); windows are a separate emissive layer. Reading an article
 *     powers the building: full window grid burns in the district color.
 *     Unread towers show only sparse dim windows, like a real skyline.
 *   - tall towers get setback tiers, antenna masts, blinking aviation
 *     lights; fully-read districts fire a sky beacon
 *   - shaded car bodies drive the avenues with headlights/taillights;
 *     lamp poles pool warm light on the asphalt (baked); the sky dome is
 *     a baked gradient with faint stars and a moon
 *
 * Pipeline: hemisphere + shadow-casting moonlight, ACES tone mapping,
 * restrained UnrealBloom (only true emitters glow). Deterministic
 * procedural geometry; the 342 buildings cost 4 instanced draw calls.
 *
 * Dynamic-imported by LearnMap.tsx client-side only — three.js ships as
 * its own lazy chunk and never touches SSR.
 */

import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// ---------------------------------------------------------------------------
// Public data model (unchanged API)
// ---------------------------------------------------------------------------

export interface CityArticle {
  slug: string;
  /** Short bare-topic label shown on the tower. */
  title: string;
  /** Full keyword-rich title — hidden, kept so search still matches it. */
  searchTitle?: string;
  difficulty: string;
  href: string;
}

export interface CityBlock {
  slug: string;
  title: string;
  articles: CityArticle[];
}

export interface CityDistrict {
  slug: string;
  title: string;
  color: string;
  blocks: CityBlock[];
}

export interface CityTowerInfo {
  slug: string;
  title: string;
  /** Full keyword-rich title — kept for search matching only. */
  searchTitle?: string;
  difficulty: string;
  href: string;
  district: string;
  districtSlug: string;
  block: string;
  color: string;
  read: boolean;
}

export interface CityHover {
  kind: "tower" | "block" | "district" | "core";
  label: string;
  sub?: string;
  color: string;
  x: number;
  y: number;
  read?: boolean;
}

export interface CityView {
  pos: [number, number, number];
  tar: [number, number, number];
}

export interface CityOptions {
  canvas: HTMLCanvasElement;
  districts: CityDistrict[];
  readSet: Set<string>;
  /** Restore a previous camera (skips the intro flyover). */
  initialView?: CityView;
  onHover(h: CityHover | null): void;
  onSelectTower(t: CityTowerInfo | null): void;
  onFocusDistrict(slug: string | null): void;
}

export interface CityHandle {
  dispose(): void;
  zoom(factor: number): void;
  resetView(): void;
  focusDistrict(slug: string | null): void;
  setFilter(q: string): number;
  nextTarget(): CityTowerInfo | null;
  setReadSet(read: Set<string>): void;
  /** Current camera state, for restoring after SPA navigation. */
  getView(): CityView;
}

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const CELL = 175;
const PLATE = 142;
const COLS = 5;
const ROWS = 3;
const CORE_CELL = { col: 2, row: 1 };
const BLOCK_SIZE = 38;
const GROUND_W = 2600;
const GROUND_D = 1800;
const HOME_POS = new THREE.Vector3(0, 310, 340);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

const BLOCK_OFFSETS: [number, number][] = [
  [0, 0],
  [-46, -46],
  [46, -46],
  [-46, 46],
  [46, 46],
  [0, -46],
  [0, 46],
  [-46, 0],
  [46, 0],
];

const H_STREETS = [-CELL / 2, CELL / 2];
const V_STREETS = [-CELL * 1.5, -CELL / 2, CELL / 2, CELL * 1.5];
const SPAN_H = CELL * 2.6;
const SPAN_V = CELL * 1.6;

// ---------------------------------------------------------------------------
// Procedural textures
// ---------------------------------------------------------------------------

/** Wall albedo: dark panels with floor lines — shading needs detail. */
function wallAlbedo(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5b5f6a";
  g.fillRect(0, 0, 128, 256);
  const rnd = lcg(11);
  // vertical panel seams
  for (let x = 0; x < 128; x += 16) {
    g.fillStyle = `rgba(0,0,0,${0.22 + rnd() * 0.14})`;
    g.fillRect(x, 0, 2, 256);
  }
  // floor lines
  for (let y = 12; y < 256; y += 10) {
    g.fillStyle = "rgba(0,0,0,0.34)";
    g.fillRect(0, y, 128, 1.6);
  }
  // roof band
  g.fillStyle = "#41454e";
  g.fillRect(0, 0, 128, 12);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Window emissive layers: full grid (powered) / sparse (dark building).
 *  Transparent except the window rects, drawn aligned to the albedo floors. */
function windowLayer(density: number, seed: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 128, 256);
  const rnd = lcg(seed);
  for (let row = 0; row < 24; row++) {
    for (let col = 0; col < 7; col++) {
      if (rnd() > density) continue;
      const a = 0.45 + rnd() * 0.55;
      g.fillStyle = `rgba(255,255,255,${a})`;
      g.fillRect(8 + col * 17, 16 + row * 10, 9, 5.4);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface LampSpot {
  x: number;
  z: number;
}

/** Ground: asphalt noise, lane dashes along every street, and a warm
 *  baked light pool under each lamp. */
function groundTexture(lamps: LampSpot[]): THREE.CanvasTexture {
  const W = 2048;
  const H = Math.round((W * GROUND_D) / GROUND_W);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#15161a";
  g.fillRect(0, 0, W, H);
  const rnd = lcg(31337);
  // asphalt speckle
  for (let i = 0; i < 26000; i++) {
    const v = rnd();
    g.fillStyle = `rgba(${v > 0.5 ? "255,255,255" : "0,0,0"},${0.015 + rnd() * 0.03})`;
    g.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
  }
  const tx = (x: number): number => ((x + GROUND_W / 2) / GROUND_W) * W;
  const tz = (z: number): number => ((z + GROUND_D / 2) / GROUND_D) * H;
  const sx = W / GROUND_W;
  // street asphalt (slightly lighter) + center dashes
  g.fillStyle = "#1e1f24";
  for (const z of H_STREETS) g.fillRect(tx(-SPAN_H), tz(z) - 14 * sx, (SPAN_H * 2) * sx, 28 * sx);
  for (const x of V_STREETS) g.fillRect(tx(x) - 14 * sx, tz(-SPAN_V), 28 * sx, (SPAN_V * 2) * sx);
  g.fillStyle = "rgba(214,201,120,0.5)";
  for (const z of H_STREETS)
    for (let x = -SPAN_H; x < SPAN_H; x += 18)
      g.fillRect(tx(x), tz(z) - 0.8 * sx, 8 * sx, 1.6 * sx);
  for (const x of V_STREETS)
    for (let z = -SPAN_V; z < SPAN_V; z += 18)
      g.fillRect(tx(x) - 0.8 * sx, tz(z), 1.6 * sx, 8 * sx);
  // lamp light pools
  for (const l of lamps) {
    const px = tx(l.x);
    const pz = tz(l.z);
    const r = 26 * sx;
    const grad = g.createRadialGradient(px, pz, 0, px, pz, r);
    grad.addColorStop(0, "rgba(255,176,89,0.3)");
    grad.addColorStop(1, "rgba(255,176,89,0)");
    g.fillStyle = grad;
    g.fillRect(px - r, pz - r, r * 2, r * 2);
  }
  // vignette
  const v = g.createRadialGradient(W / 2, H / 2, W * 0.24, W / 2, H / 2, W * 0.6);
  v.addColorStop(0, "rgba(4,5,8,0)");
  v.addColorStop(1, "rgba(4,5,8,1)");
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Night sky: vertical gradient, faint baked stars, a moon with halo. */
function skyTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#05060d");
  grad.addColorStop(0.55, "#070912");
  grad.addColorStop(0.82, "#0c1020");
  grad.addColorStop(1, "#161b33");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  // stars: only the upper sky, tiny, mostly dim
  const rnd = lcg(501);
  for (let i = 0; i < 900; i++) {
    const x = rnd() * W;
    const y = rnd() * rnd() * H * 0.55;
    const a = 0.12 + rnd() * rnd() * 0.5;
    const s = rnd() < 0.92 ? 1 : 2;
    g.fillStyle = `rgba(214,224,248,${a})`;
    g.fillRect(x, y, s, s);
  }
  // the moon
  const mx = W * 0.69;
  const my = H * 0.2;
  const halo = g.createRadialGradient(mx, my, 6, mx, my, 110);
  halo.addColorStop(0, "rgba(228,236,255,0.55)");
  halo.addColorStop(0.25, "rgba(200,214,248,0.12)");
  halo.addColorStop(1, "rgba(200,214,248,0)");
  g.fillStyle = halo;
  g.fillRect(mx - 110, my - 110, 220, 220);
  g.fillStyle = "#e7edfb";
  g.beginPath();
  g.arc(mx, my, 17, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(190,200,225,0.5)"; // craters
  g.beginPath();
  g.arc(mx - 5, my - 3, 4, 0, Math.PI * 2);
  g.arc(mx + 6, my + 5, 3, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Neon sign sprite texture. `fill` defaults to the glow color. */
function signTexture(
  text: string,
  color: string,
  px = 64,
  fill?: string,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = px * 2;
  const g = c.getContext("2d")!;
  g.font = `700 ${px}px 'JetBrains Mono', 'Cascadia Code', Consolas, monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = color;
  g.shadowBlur = px * 0.22;
  g.fillStyle = fill ?? color;
  g.fillText(text.toUpperCase(), 512, px, 1000);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.7)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

interface Tower {
  info: CityTowerInfo;
  pos: THREE.Vector3;
  w: number;
  h: number;
  hasTier: boolean;
}

interface BlockSite {
  district: CityDistrict;
  block: CityBlock;
  center: THREE.Vector3;
  towers: Tower[];
  label: THREE.Sprite;
}

export function createLearnMap3D(opts: CityOptions): CityHandle {
  const { canvas, districts, onHover, onSelectTower, onFocusDistrict } = opts;
  let readSet = new Set(opts.readSet);

  const disposables: { dispose(): void }[] = [];
  function track<T extends { dispose(): void }>(x: T): T {
    disposables.push(x);
    return x;
  }

  // --- district cells ----------------------------------------------------------
  const cells: { col: number; row: number }[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      if (!(col === CORE_CELL.col && row === CORE_CELL.row)) cells.push({ col, row });

  const districtCenter = new Map<string, THREE.Vector3>();
  districts.forEach((d, i) => {
    const cell = cells[i % cells.length];
    districtCenter.set(
      d.slug,
      new THREE.Vector3((cell.col - 2) * CELL, 0, (cell.row - 1) * CELL),
    );
  });

  // --- renderer / lights / pipeline -----------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070d, 0.00095);

  const camera = new THREE.PerspectiveCamera(50, 1, 1, 6000);
  camera.position.set(0, 520, 760);

  const hemi = new THREE.HemisphereLight(0x9aacd8, 0x23252c, 1.5);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xdde6ff, 2.3);
  moon.position.set(430, 540, 250);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -580;
  moon.shadow.camera.right = 580;
  moon.shadow.camera.top = 420;
  moon.shadow.camera.bottom = -420;
  moon.shadow.camera.near = 60;
  moon.shadow.camera.far = 1400;
  moon.shadow.bias = -0.0005;
  moon.shadow.normalBias = 0.9;
  scene.add(moon);
  scene.add(moon.target);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.42, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const controls = new MapControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 26;
  controls.maxDistance = 900;
  controls.maxPolarAngle = 1.42;
  controls.listenToKeyEvents(window);
  controls.keyPanSpeed = 24;

  // --- sky -----------------------------------------------------------------------
  const sky = new THREE.Mesh(
    track(new THREE.SphereGeometry(2500, 32, 18)),
    track(
      new THREE.MeshBasicMaterial({
        map: track(skyTexture()),
        side: THREE.BackSide,
        fog: false,
      }),
    ),
  );
  scene.add(sky);

  // --- lamps (positions first — their pools are baked into the ground) -------------
  const lampSpots: LampSpot[] = [];
  for (const z of H_STREETS)
    for (let x = -CELL * 2.3; x <= CELL * 2.3; x += 36)
      lampSpots.push({ x, z: z + (Math.round(x / 36) % 2 === 0 ? 10.4 : -10.4) });
  for (const x of V_STREETS)
    for (let z = -CELL * 1.3; z <= CELL * 1.3; z += 36)
      lampSpots.push({ x: x + (Math.round(z / 36) % 2 === 0 ? 10.4 : -10.4), z });

  // --- ground ------------------------------------------------------------------------
  const groundTex = track(groundTexture(lampSpots));
  // max anisotropy kills the lane-dash shimmer at grazing angles
  groundTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const ground = new THREE.Mesh(
    track(new THREE.PlaneGeometry(GROUND_W, GROUND_D)),
    track(
      new THREE.MeshStandardMaterial({
        map: groundTex,
        roughness: 0.96,
        metalness: 0,
      }),
    ),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  ground.receiveShadow = true;
  scene.add(ground);

  // --- lamp poles + heads ----------------------------------------------------------------
  {
    const poleGeo = track(new THREE.BoxGeometry(0.5, 7.2, 0.5));
    const poleMat = track(
      new THREE.MeshStandardMaterial({ color: 0x3a3e46, roughness: 0.8, metalness: 0.4 }),
    );
    const poles = new THREE.InstancedMesh(poleGeo, poleMat, lampSpots.length);
    const m = new THREE.Matrix4();
    const headPos = new Float32Array(lampSpots.length * 3);
    lampSpots.forEach((l, i) => {
      m.makeTranslation(l.x, 3.6, l.z);
      poles.setMatrixAt(i, m);
      headPos.set([l.x, 7.6, l.z], i * 3);
    });
    scene.add(poles);
    const headGeo = track(new THREE.BufferGeometry());
    headGeo.setAttribute("position", new THREE.BufferAttribute(headPos, 3));
    const heads = new THREE.Points(
      headGeo,
      track(
        new THREE.PointsMaterial({
          size: 2.4,
          color: new THREE.Color(0xffb869).multiplyScalar(1.35),
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          map: track(glowTexture()),
        }),
      ),
    );
    heads.frustumCulled = false;
    scene.add(heads);
  }

  // --- district plates -------------------------------------------------------------------
  const plateGeo = track(new THREE.BoxGeometry(PLATE, 1.4, PLATE));
  const plateEdges = track(new THREE.EdgesGeometry(plateGeo));
  const plateMat = track(
    new THREE.MeshStandardMaterial({ color: 0x2b2d34, roughness: 0.92, metalness: 0.05 }),
  );
  for (const d of districts) {
    const p = districtCenter.get(d.slug)!;
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(p.x, 0, p.z);
    plate.receiveShadow = true;
    scene.add(plate);
    const edge = new THREE.LineSegments(
      plateEdges,
      track(
        new THREE.LineBasicMaterial({
          color: new THREE.Color(d.color).multiplyScalar(0.65),
          transparent: true,
          opacity: 0.9,
        }),
      ),
    );
    // lift + inflate slightly so the line never coplanes with the plate
    // faces (z-fighting flicker while panning/zooming)
    edge.position.copy(plate.position);
    edge.position.y += 0.06;
    edge.scale.set(1.003, 1.08, 1.003);
    scene.add(edge);
  }

  // --- blocks (subcategories) ----------------------------------------------------------------
  const towers: Tower[] = [];
  const towersByDistrict = new Map<string, Tower[]>();
  const blockSites: BlockSite[] = [];
  const blockOf = new Map<THREE.Object3D, BlockSite>();

  const blockGeo = track(new THREE.BoxGeometry(BLOCK_SIZE, 1.2, BLOCK_SIZE));
  const blockEdges = track(new THREE.EdgesGeometry(blockGeo));
  const blockMat = track(
    new THREE.MeshStandardMaterial({ color: 0x33363e, roughness: 0.9, metalness: 0.05 }),
  );

  for (const d of districts) {
    const center = districtCenter.get(d.slug)!;
    const districtTowers: Tower[] = [];

    d.blocks.forEach((b, j) => {
      const [ox, oz] = BLOCK_OFFSETS[j % BLOCK_OFFSETS.length];
      const bc = new THREE.Vector3(center.x + ox, 0, center.z + oz);

      const plat = new THREE.Mesh(blockGeo, blockMat);
      plat.position.set(bc.x, 0.75, bc.z);
      plat.receiveShadow = true;
      scene.add(plat);
      const curb = new THREE.LineSegments(
        blockEdges,
        track(
          new THREE.LineBasicMaterial({
            color: new THREE.Color(d.color).multiplyScalar(0.3),
            transparent: true,
            opacity: 0.85,
          }),
        ),
      );
      curb.position.copy(plat.position);
      curb.position.y += 0.06; // off the platform faces — no z-fight flicker
      curb.scale.set(1.004, 1.1, 1.004);
      scene.add(curb);

      const label = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: track(signTexture(b.title, d.color, 56, "#f4f7fd")),
            transparent: true,
            depthWrite: false,
          }),
        ),
      );
      label.position.set(bc.x, 5.6, bc.z + BLOCK_SIZE / 2 + 4.2);
      label.scale.set(42, 4.6, 1);
      label.raycast = () => undefined;
      scene.add(label);

      const arts = b.articles;
      const cols = Math.ceil(Math.sqrt(Math.max(1, arts.length)));
      const rows = Math.ceil(arts.length / cols);
      const blockTowers: Tower[] = [];
      arts.forEach((a, k) => {
        const rnd = lcg(hash(a.slug));
        const col = k % cols;
        const row = Math.floor(k / cols);
        const x = bc.x + (col - (cols - 1) / 2) * 11.4 + (rnd() - 0.5) * 2.2;
        const z = bc.z + (row - (rows - 1) / 2) * 11.4 + (rnd() - 0.5) * 2.2;
        const base =
          a.difficulty === "advanced" ? 27 : a.difficulty === "intermediate" ? 17 : 10;
        const h = base + rnd() * 9;
        const w = 6.6 + rnd() * 2.2;
        const tower: Tower = {
          info: {
            slug: a.slug,
            title: a.title,
            searchTitle: a.searchTitle,
            difficulty: a.difficulty,
            href: a.href,
            district: d.title,
            districtSlug: d.slug,
            block: b.title,
            color: d.color,
            read: readSet.has(a.slug),
          },
          pos: new THREE.Vector3(x, h / 2 + 1.35, z),
          w,
          h,
          hasTier: h > 20,
        };
        towers.push(tower);
        blockTowers.push(tower);
        districtTowers.push(tower);
      });

      const site: BlockSite = { district: d, block: b, center: bc, towers: blockTowers, label };
      blockSites.push(site);
      blockOf.set(plat, site);
    });

    towersByDistrict.set(d.slug, districtTowers);
  }

  // --- buildings: shaded walls + emissive window layers -------------------------------------------
  // Instance list = base boxes for every tower + setback tier boxes for the
  // tall ones. The same transforms back three meshes: PBR walls, a "full
  // grid" window layer (powered) and a "sparse" window layer (dark), with
  // the inactive layer collapsed to zero scale per instance.
  interface Slab {
    tower: Tower;
    pos: THREE.Vector3;
    sx: number;
    sy: number;
    sz: number;
  }
  const slabs: Slab[] = [];
  for (const t of towers) {
    slabs.push({ tower: t, pos: t.pos.clone(), sx: t.w, sy: t.h, sz: t.w });
    if (t.hasTier) {
      const th = t.h * 0.34;
      slabs.push({
        tower: t,
        pos: new THREE.Vector3(t.pos.x, t.pos.y + t.h / 2 + th / 2, t.pos.z),
        sx: t.w * 0.62,
        sy: th,
        sz: t.w * 0.62,
      });
    }
  }
  const slabIndexByTower = new Map<string, number[]>();
  slabs.forEach((s, i) => {
    const arr = slabIndexByTower.get(s.tower.info.slug) ?? [];
    arr.push(i);
    slabIndexByTower.set(s.tower.info.slug, arr);
  });

  const boxGeo = track(new THREE.BoxGeometry(1, 1, 1));
  const wallsMat = track(
    new THREE.MeshStandardMaterial({
      map: track(wallAlbedo()),
      roughness: 0.85,
      metalness: 0.18,
    }),
  );
  const walls = new THREE.InstancedMesh(boxGeo, wallsMat, slabs.length);
  walls.castShadow = true;
  walls.receiveShadow = true;

  const winFullTex = track(windowLayer(0.86, 77));
  const winSparseTex = track(windowLayer(0.12, 78));
  const winMatBase = {
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  } as const;
  const winFull = new THREE.InstancedMesh(
    boxGeo,
    track(new THREE.MeshBasicMaterial({ map: winFullTex, ...winMatBase })),
    slabs.length,
  );
  const winSparse = new THREE.InstancedMesh(
    boxGeo,
    track(new THREE.MeshBasicMaterial({ map: winSparseTex, ...winMatBase })),
    slabs.length,
  );

  const m4 = new THREE.Matrix4();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  slabs.forEach((s, i) => {
    m4.makeScale(s.sx, s.sy, s.sz);
    m4.setPosition(s.pos);
    walls.setMatrixAt(i, m4);
  });

  function syncWindowMatrices(): void {
    slabs.forEach((s, i) => {
      const lit = readSet.has(s.tower.info.slug);
      m4.makeScale(s.sx * 1.004, s.sy * 1.004, s.sz * 1.004);
      m4.setPosition(s.pos);
      winFull.setMatrixAt(i, lit ? m4 : ZERO);
      winSparse.setMatrixAt(i, lit ? ZERO : m4);
    });
    winFull.instanceMatrix.needsUpdate = true;
    winSparse.instanceMatrix.needsUpdate = true;
  }
  syncWindowMatrices();
  scene.add(walls, winFull, winSparse);

  // masts + aviation lights on skyscrapers
  const mastTowers = towers.filter((t) => t.h > 27);
  const mastMat = track(
    new THREE.MeshStandardMaterial({ color: 0x424650, roughness: 0.7, metalness: 0.5 }),
  );
  const masts = new THREE.InstancedMesh(boxGeo, mastMat, mastTowers.length);
  const aviPos = new Float32Array(mastTowers.length * 3);
  mastTowers.forEach((t, i) => {
    const rnd = lcg(hash(t.info.slug) ^ 0xbeef);
    const len = 5 + rnd() * 5;
    const topY = t.pos.y + t.h / 2 + (t.hasTier ? t.h * 0.34 : 0);
    m4.makeScale(0.55, len, 0.55);
    m4.setPosition(t.pos.x, topY + len / 2, t.pos.z);
    masts.setMatrixAt(i, m4);
    aviPos.set([t.pos.x, topY + len + 0.8, t.pos.z], i * 3);
  });
  scene.add(masts);

  const aviGeo = track(new THREE.BufferGeometry());
  aviGeo.setAttribute("position", new THREE.BufferAttribute(aviPos, 3));
  const aviMat = track(
    new THREE.PointsMaterial({
      size: 1.9,
      color: new THREE.Color(0xff3326).multiplyScalar(1.6),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      map: track(glowTexture()),
    }),
  );
  const aviLights = new THREE.Points(aviGeo, aviMat);
  aviLights.frustumCulled = false;
  scene.add(aviLights);

  // --- building colors ----------------------------------------------------------------------------
  const WALL_DARK = new THREE.Color(0xffffff); // albedo carries the tone
  const WIN_DIM = new THREE.Color(0xa89a72);

  function paint(
    mod?: (t: Tower, walls: THREE.Color, win: THREE.Color) => void,
  ): void {
    const wc = new THREE.Color();
    const fc = new THREE.Color();
    slabs.forEach((s, i) => {
      const t = s.tower;
      const lit = readSet.has(t.info.slug);
      if (lit) {
        wc.set(t.info.color).lerp(new THREE.Color(1, 1, 1), 0.55);
        fc.set(t.info.color).lerp(new THREE.Color(1, 1, 1), 0.35).multiplyScalar(2.6);
      } else {
        wc.copy(WALL_DARK);
        fc.copy(WIN_DIM);
      }
      mod?.(t, wc, fc);
      walls.setColorAt(i, wc);
      winFull.setColorAt(i, fc);
      winSparse.setColorAt(i, lit ? fc : fc.clone());
    });
    walls.instanceColor!.needsUpdate = true;
    winFull.instanceColor!.needsUpdate = true;
    winSparse.instanceColor!.needsUpdate = true;
  }
  paint();

  // --- district signs --------------------------------------------------------------------------------
  const signDistrict = new Map<THREE.Object3D, CityDistrict>();
  for (const d of districts) {
    const sprite = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: track(signTexture(d.title, d.color)),
          transparent: true,
          depthWrite: false,
          color: 0xbababa,
        }),
      ),
    );
    const p = districtCenter.get(d.slug)!;
    sprite.position.set(p.x, 49, p.z);
    sprite.scale.set(56, 7, 1);
    scene.add(sprite);
    signDistrict.set(sprite, d);
  }

  // --- completion beacons -------------------------------------------------------------------------------
  const beaconGeo = track(new THREE.CylinderGeometry(1.1, 2.0, 330, 8, 1, true));
  const beacons = new Map<string, THREE.Mesh>();
  function syncBeacons(): void {
    for (const d of districts) {
      const list = towersByDistrict.get(d.slug) ?? [];
      const done = list.length > 0 && list.every((t) => readSet.has(t.info.slug));
      const existing = beacons.get(d.slug);
      if (done && !existing) {
        const beam = new THREE.Mesh(
          beaconGeo,
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(d.color).multiplyScalar(1.5),
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        );
        const p = districtCenter.get(d.slug)!;
        beam.position.set(p.x, 166, p.z);
        scene.add(beam);
        beacons.set(d.slug, beam);
      } else if (!done && existing) {
        scene.remove(existing);
        (existing.material as THREE.Material).dispose();
        beacons.delete(d.slug);
      }
    }
  }
  syncBeacons();

  // --- the AI core: a Burj-Khalifa-style landmark spire -----------------------------------------------------
  // A tri-lobed tower of stacked tiers that taper and spiral upward (the Burj's
  // signature setbacks), crowned by a slender glowing needle — the single
  // tallest structure in the city, rising far above every article tower. The
  // tier boxes are one InstancedMesh; the shaft + spire are solid meshes. All
  // of them resolve to { kind: "core" } when picked.
  const coreSolids: THREE.Mesh[] = [];
  const coreFacadeMat = track(
    new THREE.MeshStandardMaterial({
      map: wallsMat.map,
      color: 0xcdbb86, // champagne-gold glass — the lit landmark
      roughness: 0.34,
      metalness: 0.52,
      emissive: 0xffe7a4,
      emissiveMap: winFullTex,
      emissiveIntensity: 0.5,
    }),
  );

  interface CoreInst {
    x: number;
    y: number;
    z: number;
    sx: number;
    sy: number;
    sz: number;
    ry: number;
  }
  const coreInsts: CoreInst[] = [];

  // stepped podium so the tower reads as grounded, not floating
  coreInsts.push({ x: 0, y: 3, z: 0, sx: 30, sy: 6, sz: 30, ry: 0 });
  coreInsts.push({ x: 0, y: 8.4, z: 0, sx: 23, sy: 5, sz: 23, ry: Math.PI / 12 });

  // tri-lobe body: stacked tiers, each a central hub + three radial wings, that
  // shrink and rotate as they climb to carve the spiralling-setback silhouette.
  const TIERS = 22;
  const TIER_H = 4.8;
  const BODY_Y0 = 11;
  const TWIST = 0.062; // radians of spin added per tier
  for (let i = 0; i < TIERS; i++) {
    const f = i / (TIERS - 1); // 0 at base → 1 at the crown
    const cy = BODY_Y0 + i * TIER_H + TIER_H / 2;
    const rot = i * TWIST;
    const hub = 7.6 * (1 - f * 0.56);
    coreInsts.push({ x: 0, y: cy, z: 0, sx: hub, sy: TIER_H * 1.05, sz: hub, ry: rot });
    const wingLen = 11.5 * (1 - f * 0.88) + 1.4; // radial reach, tapers to a stub
    const wingThick = 5.8 * (1 - f * 0.5);
    const reach = hub / 2 + wingLen / 2 - 0.7;
    for (let k = 0; k < 3; k++) {
      const ang = rot + (k * Math.PI * 2) / 3;
      coreInsts.push({
        x: Math.cos(ang) * reach,
        y: cy,
        z: Math.sin(ang) * reach,
        sx: wingLen,
        sy: TIER_H * 1.02,
        sz: wingThick,
        ry: ang,
      });
    }
  }
  const bodyTopY = BODY_Y0 + TIERS * TIER_H; // ≈ 116.6

  // crown collar where the body hands off to the shaft
  coreInsts.push({
    x: 0,
    y: bodyTopY + 1.2,
    z: 0,
    sx: 6.8,
    sy: 2.4,
    sz: 6.8,
    ry: TIERS * TWIST,
  });

  const coreTiers = new THREE.InstancedMesh(boxGeo, coreFacadeMat, coreInsts.length);
  coreTiers.castShadow = true;
  coreTiers.receiveShadow = true;
  {
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const sc = new THREE.Vector3();
    const ps = new THREE.Vector3();
    const mm = new THREE.Matrix4();
    coreInsts.forEach((d, i) => {
      e.set(0, d.ry, 0);
      q.setFromEuler(e);
      sc.set(d.sx, d.sy, d.sz);
      ps.set(d.x, d.y, d.z);
      mm.compose(ps, q, sc);
      coreTiers.setMatrixAt(i, mm);
    });
    coreTiers.instanceMatrix.needsUpdate = true;
  }
  scene.add(coreTiers);

  // tapering metal shaft rising out of the crown
  const SHAFT_H = 34;
  const shaft = new THREE.Mesh(
    track(new THREE.CylinderGeometry(2.0, 3.6, SHAFT_H, 16, 1)),
    track(
      new THREE.MeshStandardMaterial({
        color: 0x26282f,
        roughness: 0.28,
        metalness: 0.8,
        emissive: 0x7d8430,
        emissiveIntensity: 0.22,
      }),
    ),
  );
  shaft.position.y = bodyTopY + SHAFT_H / 2;
  shaft.castShadow = true;
  coreSolids.push(shaft);
  scene.add(shaft);
  const shaftTopY = bodyTopY + SHAFT_H; // ≈ 150.6

  // the iconic glowing needle spire
  const SPIRE_H = 66;
  const spire = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.06, 1.8, SPIRE_H, 18, 1)),
    track(
      new THREE.MeshStandardMaterial({
        color: 0x0b0c0f,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0xf7ff00,
        emissiveIntensity: 1.8,
      }),
    ),
  );
  spire.position.y = shaftTopY + SPIRE_H / 2;
  spire.castShadow = true;
  coreSolids.push(spire);
  scene.add(spire);
  const spireTipY = shaftTopY + SPIRE_H; // ≈ 216.6

  // beacon beam streaming up from the crown into the night sky
  const coreBeam = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.9, 2.0, 380, 12, 1, true)),
    track(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf7ff00).multiplyScalar(1.2),
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    ),
  );
  coreBeam.position.y = shaftTopY + 380 / 2 - 26;
  scene.add(coreBeam);

  // red aviation beacon at the spire base (pulses in the render loop)
  const coreBeacon = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(glowTexture()),
        color: new THREE.Color(0xff3326).multiplyScalar(1.7),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  coreBeacon.position.y = shaftTopY + 1.5;
  coreBeacon.scale.set(5.5, 5.5, 1);
  scene.add(coreBeacon);

  // "A I" marquee floating above the spire tip
  const coreSign = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(signTexture("A I", "#f7ff00")),
        transparent: true,
        depthWrite: false,
        color: 0xc9c9c9,
      }),
    ),
  );
  coreSign.position.y = spireTipY + 12;
  coreSign.scale.set(26, 3.4, 1);
  scene.add(coreSign);

  // --- traffic: shaded car bodies + head/tail lights -----------------------------------------------------------
  interface Car {
    horizontal: boolean;
    fixed: number;
    t: number;
    speed: number;
    dir: 1 | -1;
  }
  const CARS = 96;
  const cars: Car[] = [];
  const carRnd = lcg(777);
  for (let i = 0; i < CARS; i++) {
    const horizontal = carRnd() > 0.45;
    cars.push({
      horizontal,
      fixed: horizontal
        ? H_STREETS[Math.floor(carRnd() * H_STREETS.length)]
        : V_STREETS[Math.floor(carRnd() * V_STREETS.length)],
      t: carRnd(),
      speed: 0.018 + carRnd() * 0.045,
      dir: carRnd() > 0.5 ? 1 : -1,
    });
  }
  const carGeo = track(new THREE.BoxGeometry(2.0, 1.15, 4.4));
  const carMat = track(
    new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.6 }),
  );
  const carMesh = new THREE.InstancedMesh(carGeo, carMat, CARS);
  const CAR_PAINTS = [0x6a7080, 0x8a8f9a, 0x4a5562, 0x9a4a52, 0x46647a, 0xa39a84];
  cars.forEach((_, i) => {
    carMesh.setColorAt(i, new THREE.Color(CAR_PAINTS[i % CAR_PAINTS.length]));
  });
  carMesh.instanceColor!.needsUpdate = true;
  scene.add(carMesh);

  const lightGeo = track(new THREE.BufferGeometry());
  const lightPos = new Float32Array(CARS * 2 * 3);
  const lightCol = new Float32Array(CARS * 2 * 3);
  {
    const head = new THREE.Color(0xfff3cf).multiplyScalar(1.7);
    const tail = new THREE.Color(0xff2d20).multiplyScalar(1.3);
    for (let i = 0; i < CARS; i++) {
      lightCol.set([head.r, head.g, head.b], i * 6);
      lightCol.set([tail.r, tail.g, tail.b], i * 6 + 3);
    }
  }
  lightGeo.setAttribute("position", new THREE.BufferAttribute(lightPos, 3));
  lightGeo.setAttribute("color", new THREE.BufferAttribute(lightCol, 3));
  const carLights = new THREE.Points(
    lightGeo,
    track(
      new THREE.PointsMaterial({
        size: 1.7,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        map: track(glowTexture()),
      }),
    ),
  );
  carLights.frustumCulled = false;
  scene.add(carLights);

  const carM = new THREE.Matrix4();
  const rotH = new THREE.Matrix4().makeRotationY(Math.PI / 2);
  function updateCars(dt: number): void {
    for (let i = 0; i < CARS; i++) {
      const car = cars[i];
      car.t += car.speed * dt * car.dir;
      if (car.t > 1) car.t -= 1;
      if (car.t < 0) car.t += 1;
      const along = car.horizontal ? (car.t * 2 - 1) * SPAN_H : (car.t * 2 - 1) * SPAN_V;
      const lane = car.dir > 0 ? 3.4 : -3.4;
      const x = car.horizontal ? along : car.fixed + lane;
      const z = car.horizontal ? car.fixed + lane : along;
      if (car.horizontal) carM.copy(rotH);
      else carM.identity();
      carM.setPosition(x, 0.85, z);
      carMesh.setMatrixAt(i, carM);
      // lights at the bumpers, along the travel axis
      const fx = car.horizontal ? car.dir * 2.4 : 0;
      const fz = car.horizontal ? 0 : car.dir * 2.4;
      lightPos.set([x + fx, 0.95, z + fz], i * 6);
      lightPos.set([x - fx, 1.05, z - fz], i * 6 + 3);
    }
    carMesh.instanceMatrix.needsUpdate = true;
    (lightGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  }
  updateCars(0);

  // --- hover highlight + selection marker --------------------------------------------------------------------------
  const hlMat = track(
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }),
  );
  const hl = new THREE.LineSegments(track(new THREE.EdgesGeometry(boxGeo)), hlMat);
  hl.visible = false;
  scene.add(hl);

  // game-style selection marker: a small spinning diamond hovering over
  // the roof (absolute positioning each frame — never drifts/clips)
  const selMat = track(
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }),
  );
  const selMarker = new THREE.Mesh(track(new THREE.OctahedronGeometry(2.4)), selMat);
  selMarker.visible = false;
  scene.add(selMarker);
  const selGlow = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(glowTexture()),
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  selGlow.visible = false;
  selGlow.scale.set(7, 7, 1);
  scene.add(selGlow);
  let selTopY = 0; // roof height of the selected tower

  // --- picking ----------------------------------------------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  type Pick =
    | { kind: "tower"; tower: Tower }
    | { kind: "block"; site: BlockSite }
    | { kind: "district"; district: CityDistrict }
    | { kind: "core" }
    | null;

  const pickables: THREE.Object3D[] = [
    walls,
    coreTiers,
    ...coreSolids,
    ...signDistrict.keys(),
    ...blockOf.keys(),
  ];

  function pick(clientX: number, clientY: number): Pick {
    const rect = canvas.getBoundingClientRect();
    ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    const h = hits[0];
    if (!h) return null;
    if (h.object === walls && h.instanceId !== undefined)
      return { kind: "tower", tower: slabs[h.instanceId].tower };
    if (h.object === coreTiers || coreSolids.includes(h.object as THREE.Mesh))
      return { kind: "core" };
    const d = signDistrict.get(h.object);
    if (d) return { kind: "district", district: d };
    const site = blockOf.get(h.object);
    if (site) return { kind: "block", site };
    return null;
  }

  // --- camera tween ---------------------------------------------------------------------------------------------------------
  interface Tween {
    t0: number;
    dur: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTar: THREE.Vector3;
    toTar: THREE.Vector3;
  }
  let tween: Tween | null = null;

  function flyTo(target: THREE.Vector3, offset: THREE.Vector3, dur = 1000): void {
    tween = {
      t0: performance.now(),
      dur,
      fromPos: camera.position.clone(),
      toPos: target.clone().add(offset),
      fromTar: controls.target.clone(),
      toTar: target.clone(),
    };
    controls.enabled = false;
  }

  if (opts.initialView) {
    // returning from an article — restore the exact camera, no intro
    camera.position.fromArray(opts.initialView.pos);
    controls.target.fromArray(opts.initialView.tar);
  } else {
    flyTo(HOME_TARGET, HOME_POS.clone().sub(HOME_TARGET), 2100); // intro flyover
  }

  // --- input ----------------------------------------------------------------------------------------------------------------------
  let downX = 0;
  let downY = 0;
  let downT = 0;

  const onPointerMove = (e: PointerEvent): void => {
    const p = pick(e.clientX, e.clientY);
    if (p?.kind === "tower") {
      hl.position.copy(p.tower.pos);
      hl.scale.set(p.tower.w + 1.2, p.tower.h + 1.2, p.tower.w + 1.2);
      hlMat.color.set(p.tower.info.color);
      hl.visible = true;
    } else {
      hl.visible = false;
    }
    canvas.style.cursor = p ? "pointer" : "grab";
    if (!p) {
      onHover(null);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (p.kind === "tower") {
      onHover({
        kind: "tower",
        label: p.tower.info.title,
        sub: `${p.tower.info.district} · ${p.tower.info.block}`,
        color: p.tower.info.color,
        x,
        y,
        read: readSet.has(p.tower.info.slug),
      });
    } else if (p.kind === "block") {
      const lit = p.site.towers.filter((t) => readSet.has(t.info.slug)).length;
      onHover({
        kind: "block",
        label: p.site.block.title,
        sub: `${p.site.district.title} · ${lit}/${p.site.towers.length} LIT · CLICK TO FLY`,
        color: p.site.district.color,
        x,
        y,
      });
    } else if (p.kind === "district") {
      const list = towersByDistrict.get(p.district.slug) ?? [];
      const lit = list.filter((t) => readSet.has(t.info.slug)).length;
      onHover({
        kind: "district",
        label: p.district.title,
        sub: `${lit}/${list.length} TOWERS LIT · CLICK TO FLY`,
        color: p.district.color,
        x,
        y,
      });
    } else {
      onHover({
        kind: "core",
        label: "THE AI CORE",
        sub: "CLICK TO FLY HOME",
        color: "#f7ff00",
        x,
        y,
      });
    }
  };

  const onPointerLeave = (): void => {
    hl.visible = false;
    onHover(null);
  };

  const onPointerDown = (e: PointerEvent): void => {
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
  };

  const onPointerUp = (e: PointerEvent): void => {
    if (
      Math.hypot(e.clientX - downX, e.clientY - downY) > 6 ||
      performance.now() - downT > 600
    )
      return;
    const p = pick(e.clientX, e.clientY);
    if (!p) {
      onSelectTower(null);
      selMarker.visible = false;
      selGlow.visible = false;
      return;
    }
    if (p.kind === "tower") selectTower(p.tower);
    else if (p.kind === "block")
      flyTo(p.site.center.clone(), new THREE.Vector3(30, 50, 56), 850);
    else if (p.kind === "district") focusDistrict(p.district.slug);
    else resetView();
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);

  function selectTower(t: Tower): void {
    // roof = top of the tier if the tower has one
    selTopY = t.pos.y + t.h / 2 + (t.hasTier ? t.h * 0.34 : 0);
    selMarker.visible = true;
    selGlow.visible = true;
    selMarker.position.set(t.pos.x, selTopY + 7, t.pos.z);
    selGlow.position.copy(selMarker.position);
    selMat.color.set(t.info.color);
    selGlow.material.color.set(t.info.color);
    flyTo(
      new THREE.Vector3(t.pos.x, t.h * 0.5, t.pos.z),
      new THREE.Vector3(32, 24 + t.h * 0.4, 32),
      850,
    );
    onSelectTower({ ...t.info, read: readSet.has(t.info.slug) });
  }

  // --- public ops ------------------------------------------------------------------------------------------------------------------------
  function resetView(): void {
    onFocusDistrict(null);
    onSelectTower(null);
    selMarker.visible = false;
    selGlow.visible = false;
    flyTo(HOME_TARGET, HOME_POS.clone().sub(HOME_TARGET), 1100);
  }

  function focusDistrict(slug: string | null): void {
    onFocusDistrict(slug);
    if (!slug) return;
    const center = districtCenter.get(slug);
    if (!center) return;
    flyTo(center, new THREE.Vector3(45, 145, 95), 950);
  }

  let filtering = false;
  function setFilter(qRaw: string): number {
    const q = qRaw.trim().toLowerCase();
    if (!q) {
      filtering = false;
      paint();
      return 0;
    }
    filtering = true;
    let n = 0;
    const matched = new Set<string>();
    for (const t of towers)
      if (`${t.info.title} ${t.info.searchTitle ?? ""}`.toLowerCase().includes(q)) {
        matched.add(t.info.slug);
        n++;
      }
    paint((t, wc, fc) => {
      if (matched.has(t.info.slug)) {
        wc.set(0xfff7c2);
        fc.set(0xffe93d).multiplyScalar(3.2);
      } else {
        wc.multiplyScalar(0.3);
        fc.multiplyScalar(0.12);
      }
    });
    return n;
  }

  function nextTarget(): CityTowerInfo | null {
    const ranked = [...districts].sort((a, b) => {
      const la = towersByDistrict.get(a.slug) ?? [];
      const lb = towersByDistrict.get(b.slug) ?? [];
      const ra = la.length ? la.filter((t) => readSet.has(t.info.slug)).length / la.length : 1;
      const rb = lb.length ? lb.filter((t) => readSet.has(t.info.slug)).length / lb.length : 1;
      return ra - rb;
    });
    for (const d of ranked) {
      const t = (towersByDistrict.get(d.slug) ?? []).find((x) => !readSet.has(x.info.slug));
      if (t) {
        selectTower(t);
        return { ...t.info, read: false };
      }
    }
    return null;
  }

  function setReadSet(read: Set<string>): void {
    readSet = new Set(read);
    syncWindowMatrices();
    if (!filtering) paint();
    syncBeacons();
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

  // --- resize --------------------------------------------------------------------------------------------------------------------------------
  const stage = canvas.parentElement!;
  function applySize(): void {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  applySize();
  const ro = new ResizeObserver(applySize);
  ro.observe(stage);

  // --- main loop -------------------------------------------------------------------------------------------------------------------------------
  let raf = 0;
  let prev = performance.now();
  const camV = new THREE.Vector3();

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;

    if (tween) {
      const t = Math.min(1, (now - tween.t0) / tween.dur);
      const e = easeInOutCubic(t);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
      controls.target.lerpVectors(tween.fromTar, tween.toTar, e);
      if (t >= 1) {
        tween = null;
        controls.enabled = true;
      }
    }

    updateCars(dt);

    // block signs fade in near their district
    camV.copy(camera.position);
    for (const site of blockSites) {
      const d = camV.distanceTo(site.center);
      const o = THREE.MathUtils.clamp(1 - (d - 175) / 150, 0, 1);
      if (o <= 0.02) {
        if (site.label.visible) site.label.visible = false;
      } else {
        site.label.visible = true;
        site.label.material.opacity = o;
      }
    }

    coreBeam.rotation.y += dt * 0.4;
    coreBeacon.material.opacity = 0.4 + 0.5 * Math.abs(Math.sin(now / 600));
    for (const beam of beacons.values()) beam.rotation.y += dt * 0.35;
    aviMat.opacity = 0.45 + 0.55 * Math.sin(now / 540);
    if (selMarker.visible) {
      // absolute bob above the roof — never wanders into the building
      selMarker.position.y = selTopY + 7 + Math.sin(now / 320) * 1.3;
      selMarker.rotation.y += dt * 2.2;
      selGlow.position.copy(selMarker.position);
    }

    controls.update();
    composer.render();
  }
  raf = requestAnimationFrame(frame);

  // --- teardown ---------------------------------------------------------------------------------------------------------------------------------
  function dispose(): void {
    cancelAnimationFrame(raf);
    ro.disconnect();
    controls.stopListenToKeyEvents();
    controls.dispose();
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    for (const beam of beacons.values()) (beam.material as THREE.Material).dispose();
    for (const x of disposables) x.dispose();
    walls.dispose();
    winFull.dispose();
    winSparse.dispose();
    masts.dispose();
    carMesh.dispose();
    composer.dispose();
    renderer.dispose();
  }

  function getView(): CityView {
    return {
      pos: camera.position.toArray() as [number, number, number],
      tar: controls.target.toArray() as [number, number, number],
    };
  }

  return {
    dispose,
    zoom,
    resetView,
    focusDistrict,
    setFilter,
    nextTarget,
    setReadSet,
    getView,
  };
}
