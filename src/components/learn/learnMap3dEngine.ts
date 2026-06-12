/**
 * /learn/map — KNOWLEDGE CITY: the Learn encyclopedia as a procedural
 * neon city at night, rendered in WebGL (three.js).
 *
 * World model:
 *   - 14 DISTRICTS (categories) on a 5x3 city grid, accent-edged plates
 *   - named BLOCKS inside each district (subcategories): raised platforms
 *     with accent curbs and distance-faded street-level signs
 *   - every article is a TOWER (height = difficulty); reading it powers
 *     the building — its windows light up in the district color. Tall
 *     towers get setback tiers, antennas, and blinking aviation lights.
 *   - fully-powered districts fire a rotating sky beacon
 *   - the AI core spire burns in the central plaza; street lamps and
 *     headlight/taillight traffic line the avenues
 *
 * Render pipeline: ACES filmic tone mapping + UnrealBloom — emissive
 * windows, neon signs, lamps and beacons actually glow; dark concrete
 * doesn't. Gradient sky dome + gridded ground instead of a void.
 *
 * Deterministic procedural geometry (zero assets, zero Math.random) and
 * few draw calls: all 342 towers are 3 InstancedMeshes (base/tier/mast).
 *
 * Dynamic-imported by LearnMap.tsx in a client-only effect, so three.js
 * ships as its own lazy chunk and never touches SSR.
 */

import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// ---------------------------------------------------------------------------
// Public data model
// ---------------------------------------------------------------------------

export interface CityArticle {
  slug: string;
  title: string;
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

export interface CityOptions {
  canvas: HTMLCanvasElement;
  districts: CityDistrict[];
  readSet: Set<string>;
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
  /** Fly to the next unread tower (least-powered district first). */
  nextTarget(): CityTowerInfo | null;
  setReadSet(read: Set<string>): void;
}

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

const BG = 0x030308;

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
// Procedural textures
// ---------------------------------------------------------------------------

/** Facade texture: window grid with lived-in variety — bright rooms, dim
 *  rooms, dark floors, a dead roof band. Multiplied by instance color:
 *  dark gray = unlit concrete; bright accent = powered building. */
function facadeTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1b1d22";
  g.fillRect(0, 0, 128, 256);
  const rnd = lcg(20260612);
  for (let row = 0; row < 23; row++) {
    const floorDead = rnd() < 0.12; // whole floor dark
    for (let col = 0; col < 9; col++) {
      const x = 7 + col * 13.4;
      const y = 16 + row * 10.2;
      const r = rnd();
      let a: number;
      if (floorDead || r < 0.38) a = 0.05; // dark room
      else if (r < 0.72) a = 0.32 + rnd() * 0.25; // dim glow
      else a = 0.78 + rnd() * 0.22; // bright room
      g.fillStyle = `rgba(255,244,214,${a})`;
      g.fillRect(x, y, 7.2, 5.4);
    }
  }
  // dead band at the roof line
  g.fillStyle = "#15161a";
  g.fillRect(0, 0, 128, 12);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Ground texture: city grid + radial vignette, baked once. */
function groundTexture(): THREE.CanvasTexture {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#07070b";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = "rgba(150,160,190,0.07)";
  g.lineWidth = 1;
  for (let i = 0; i <= S; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, S);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(S, i);
    g.stroke();
  }
  const grad = g.createRadialGradient(S / 2, S / 2, S * 0.22, S / 2, S / 2, S * 0.62);
  grad.addColorStop(0, "rgba(3,3,8,0)");
  grad.addColorStop(1, "rgba(3,3,8,1)");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Night-sky dome gradient: near-black zenith → cold haze at the horizon. */
function skyTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#020207");
  grad.addColorStop(0.62, "#04040c");
  grad.addColorStop(0.88, "#0a0d1c");
  grad.addColorStop(1, "#11152a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Neon sign sprite texture (district + block names). */
function signTexture(text: string, color: string, px = 64): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = px * 2;
  const g = c.getContext("2d")!;
  g.font = `700 ${px}px 'JetBrains Mono', 'Cascadia Code', Consolas, monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = color;
  g.shadowBlur = px * 0.22;
  g.fillStyle = color;
  g.fillText(text.toUpperCase(), 512, px, 1000);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Soft radial glow (selection marker, lamps). */
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
// Layout constants
// ---------------------------------------------------------------------------

const CELL = 175;
const PLATE = 142;
const COLS = 5;
const ROWS = 3;
const CORE_CELL = { col: 2, row: 1 };
const BLOCK_SIZE = 38;
const HOME_POS = new THREE.Vector3(0, 320, 330);
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

interface Tower {
  info: CityTowerInfo;
  pos: THREE.Vector3;
  w: number;
  h: number;
}

interface BlockSite {
  district: CityDistrict;
  block: CityBlock;
  center: THREE.Vector3;
  towers: Tower[];
  label: THREE.Sprite;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function createLearnMap3D(opts: CityOptions): CityHandle {
  const { canvas, districts, onHover, onSelectTower, onFocusDistrict } = opts;
  let readSet = new Set(opts.readSet);

  // --- district cells --------------------------------------------------------
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

  // --- renderer / pipeline ----------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.00115);

  const camera = new THREE.PerspectiveCamera(50, 1, 1, 6000);
  camera.position.set(0, 520, 740); // intro flyover start

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.5);
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

  const disposables: { dispose(): void }[] = [];
  function track<T extends { dispose(): void }>(x: T): T {
    disposables.push(x);
    return x;
  }

  // --- sky + ground -------------------------------------------------------------
  const skyTex = track(skyTexture());
  const sky = new THREE.Mesh(
    track(new THREE.SphereGeometry(2600, 24, 16)),
    track(
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false }),
    ),
  );
  scene.add(sky);

  const groundTex = track(groundTexture());
  const ground = new THREE.Mesh(
    track(new THREE.PlaneGeometry(2600, 1800)),
    track(new THREE.MeshBasicMaterial({ map: groundTex })),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  scene.add(ground);

  // --- district plates + edges ------------------------------------------------------
  const plateGeo = track(new THREE.BoxGeometry(PLATE, 1.4, PLATE));
  const plateEdgeGeo = track(new THREE.EdgesGeometry(plateGeo));
  const plateMat = track(new THREE.MeshBasicMaterial({ color: 0x0d0d11 }));
  for (const d of districts) {
    const p = districtCenter.get(d.slug)!;
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(p.x, 0, p.z);
    scene.add(plate);
    const edge = new THREE.LineSegments(
      plateEdgeGeo,
      track(
        new THREE.LineBasicMaterial({
          color: new THREE.Color(d.color).multiplyScalar(0.7),
          transparent: true,
          opacity: 0.95,
        }),
      ),
    );
    edge.position.copy(plate.position);
    scene.add(edge);
  }

  // --- blocks (SUBCATEGORIES): platforms + curbs + street signs ----------------------
  const towers: Tower[] = [];
  const towersByDistrict = new Map<string, Tower[]>();
  const blockSites: BlockSite[] = [];
  const blockOf = new Map<THREE.Object3D, BlockSite>();

  const blockGeo = track(new THREE.BoxGeometry(BLOCK_SIZE, 1.1, BLOCK_SIZE));
  const blockEdgeGeo = track(new THREE.EdgesGeometry(blockGeo));
  const blockMat = track(new THREE.MeshBasicMaterial({ color: 0x131318 }));
  const signTextures: THREE.Texture[] = [];

  for (const d of districts) {
    const center = districtCenter.get(d.slug)!;
    const districtTowers: Tower[] = [];

    d.blocks.forEach((b, j) => {
      const [ox, oz] = BLOCK_OFFSETS[j % BLOCK_OFFSETS.length];
      const bc = new THREE.Vector3(center.x + ox, 0, center.z + oz);

      // platform + accent curb
      const plat = new THREE.Mesh(blockGeo, blockMat);
      plat.position.set(bc.x, 0.7, bc.z);
      scene.add(plat);
      const curb = new THREE.LineSegments(
        blockEdgeGeo,
        track(
          new THREE.LineBasicMaterial({
            color: new THREE.Color(d.color).multiplyScalar(0.32),
            transparent: true,
            opacity: 0.9,
          }),
        ),
      );
      curb.position.copy(plat.position);
      scene.add(curb);

      // street-level sign (distance-faded in the loop)
      const tex = track(signTexture(b.title, "#e8ecf2", 46));
      signTextures.push(tex);
      const label = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
        ),
      );
      label.position.set(bc.x, 4.4, bc.z + BLOCK_SIZE / 2 + 3.4);
      label.scale.set(30, 3.75, 1);
      label.raycast = () => undefined; // labels are display-only
      scene.add(label);

      // towers on the platform
      const arts = b.articles;
      const cols = Math.ceil(Math.sqrt(Math.max(1, arts.length)));
      const rows = Math.ceil(arts.length / cols);
      const blockTowers: Tower[] = [];
      arts.forEach((a, k) => {
        const rnd = lcg(hash(a.slug));
        const col = k % cols;
        const row = Math.floor(k / cols);
        const x = bc.x + (col - (cols - 1) / 2) * 11.4 + (rnd() - 0.5) * 2.4;
        const z = bc.z + (row - (rows - 1) / 2) * 11.4 + (rnd() - 0.5) * 2.4;
        const base =
          a.difficulty === "advanced" ? 27 : a.difficulty === "intermediate" ? 17 : 10;
        const h = base + rnd() * 9;
        const w = 6.4 + rnd() * 2.2;
        const tower: Tower = {
          info: {
            slug: a.slug,
            title: a.title,
            difficulty: a.difficulty,
            href: a.href,
            district: d.title,
            districtSlug: d.slug,
            block: b.title,
            color: d.color,
            read: readSet.has(a.slug),
          },
          pos: new THREE.Vector3(x, h / 2 + 1.25, z),
          w,
          h,
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

  // --- instanced towers: base + setback tier + antenna mast ---------------------------
  const facadeTex = track(facadeTexture());
  const boxGeo = track(new THREE.BoxGeometry(1, 1, 1));
  const towerMat = track(new THREE.MeshBasicMaterial({ map: facadeTex }));

  const baseMesh = new THREE.InstancedMesh(boxGeo, towerMat, towers.length);
  const tierIdx: number[] = [];
  const mastIdx: number[] = [];
  towers.forEach((t, i) => {
    if (t.h > 20) tierIdx.push(i);
    if (t.h > 27) mastIdx.push(i);
  });
  const tierMesh = new THREE.InstancedMesh(boxGeo, towerMat, tierIdx.length);
  const mastMat = track(new THREE.MeshBasicMaterial());
  const mastMesh = new THREE.InstancedMesh(boxGeo, mastMat, mastIdx.length);

  const m4 = new THREE.Matrix4();
  towers.forEach((t, i) => {
    m4.makeScale(t.w, t.h, t.w);
    m4.setPosition(t.pos);
    baseMesh.setMatrixAt(i, m4);
  });
  tierIdx.forEach((ti, i) => {
    const t = towers[ti];
    const th = t.h * 0.34;
    m4.makeScale(t.w * 0.62, th, t.w * 0.62);
    m4.setPosition(t.pos.x, t.pos.y + t.h / 2 + th / 2, t.pos.z);
    tierMesh.setMatrixAt(i, m4);
  });
  mastIdx.forEach((ti, i) => {
    const t = towers[ti];
    const rnd = lcg(hash(t.info.slug) ^ 0xbeef);
    const len = 5 + rnd() * 5;
    const topY = t.pos.y + t.h / 2 + t.h * 0.34;
    m4.makeScale(0.6, len, 0.6);
    m4.setPosition(t.pos.x, topY + len / 2, t.pos.z);
    mastMesh.setMatrixAt(i, m4);
  });
  scene.add(baseMesh, tierMesh, mastMesh);

  const DARK = new THREE.Color(0x707788); // dark concrete, windows still read
  const towerColor = (t: Tower): THREE.Color =>
    readSet.has(t.info.slug)
      ? new THREE.Color(t.info.color).lerp(new THREE.Color(1, 1, 1), 0.16).multiplyScalar(2.1)
      : DARK.clone();

  const baseColors = new Float32Array(towers.length * 3);
  function paint(mod?: (t: Tower, c: THREE.Color) => void): void {
    const c = new THREE.Color();
    towers.forEach((t, i) => {
      c.setRGB(baseColors[i * 3], baseColors[i * 3 + 1], baseColors[i * 3 + 2]);
      mod?.(t, c);
      baseMesh.setColorAt(i, c);
    });
    tierIdx.forEach((ti, i) => {
      c.setRGB(baseColors[ti * 3], baseColors[ti * 3 + 1], baseColors[ti * 3 + 2]);
      mod?.(towers[ti], c);
      tierMesh.setColorAt(i, c);
    });
    mastIdx.forEach((ti, i) => {
      c.setRGB(baseColors[ti * 3], baseColors[ti * 3 + 1], baseColors[ti * 3 + 2]);
      mod?.(towers[ti], c);
      mastMesh.setColorAt(i, c.clone().multiplyScalar(0.6));
    });
    baseMesh.instanceColor!.needsUpdate = true;
    if (tierIdx.length) tierMesh.instanceColor!.needsUpdate = true;
    if (mastIdx.length) mastMesh.instanceColor!.needsUpdate = true;
  }
  function rebase(): void {
    towers.forEach((t, i) => {
      const c = towerColor(t);
      baseColors.set([c.r, c.g, c.b], i * 3);
    });
  }
  rebase();
  paint();

  // --- aviation lights on the tallest towers ---------------------------------------------
  const aviGeo = track(new THREE.BufferGeometry());
  {
    const arr = new Float32Array(mastIdx.length * 3);
    mastIdx.forEach((ti, i) => {
      const t = towers[ti];
      const rnd = lcg(hash(t.info.slug) ^ 0xbeef);
      const len = 5 + rnd() * 5;
      arr.set([t.pos.x, t.pos.y + t.h / 2 + t.h * 0.34 + len + 0.8, t.pos.z], i * 3);
    });
    aviGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }
  const aviMat = track(
    new THREE.PointsMaterial({
      size: 2.2,
      color: 0xff2d20,
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

  // --- district neon signs ------------------------------------------------------------------
  const signDistrict = new Map<THREE.Object3D, CityDistrict>();
  for (const d of districts) {
    const tex = track(signTexture(d.title, d.color));
    signTextures.push(tex);
    const sprite = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
          color: 0xc4c4c4, // keep neon signs under the bloom blow-out point
        }),
      ),
    );
    const p = districtCenter.get(d.slug)!;
    sprite.position.set(p.x, 50, p.z);
    sprite.scale.set(58, 7.25, 1);
    scene.add(sprite);
    signDistrict.set(sprite, d);
  }

  // --- completion beacons ----------------------------------------------------------------------
  const beaconGeo = track(new THREE.CylinderGeometry(1.1, 2.1, 340, 8, 1, true));
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
            color: new THREE.Color(d.color).multiplyScalar(1.4),
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        );
        const p = districtCenter.get(d.slug)!;
        beam.position.set(p.x, 170, p.z);
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

  // --- the AI core --------------------------------------------------------------------------------
  const coreBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(17, 24, 17)),
    track(new THREE.MeshBasicMaterial({ map: facadeTex, color: 0x8a8650 })),
  );
  coreBase.position.y = 12;
  scene.add(coreBase);
  const coreSpire = new THREE.Mesh(
    track(new THREE.BoxGeometry(6.4, 56, 6.4)),
    track(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf7ff00).multiplyScalar(1.9) })),
  );
  coreSpire.position.y = 24 + 28;
  scene.add(coreSpire);
  const coreBeam = new THREE.Mesh(
    beaconGeo,
    track(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf7ff00).multiplyScalar(1.3),
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    ),
  );
  coreBeam.position.y = 230;
  scene.add(coreBeam);
  const coreSign = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(signTexture("A I", "#f7ff00")),
        transparent: true,
        depthWrite: false,
      }),
    ),
  );
  coreSign.position.y = 94;
  coreSign.scale.set(34, 4.25, 1);
  scene.add(coreSign);

  // --- street lamps ----------------------------------------------------------------------------------
  {
    const pts: number[] = [];
    const hStreets = [-CELL / 2, CELL / 2];
    const vStreets = [-CELL * 1.5, -CELL / 2, CELL / 2, CELL * 1.5];
    for (const z of hStreets)
      for (let x = -CELL * 2.4; x <= CELL * 2.4; x += 34) pts.push(x, 5, z - 8, x, 5, z + 8);
    for (const x of vStreets)
      for (let z = -CELL * 1.4; z <= CELL * 1.4; z += 34) pts.push(x - 8, 5, z, x + 8, 5, z);
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const lamps = new THREE.Points(
      geo,
      track(
        new THREE.PointsMaterial({
          size: 2.6,
          color: new THREE.Color(0xffc97a).multiplyScalar(1.25),
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          map: track(glowTexture()),
        }),
      ),
    );
    lamps.frustumCulled = false;
    scene.add(lamps);
  }

  // --- traffic ------------------------------------------------------------------------------------------
  interface Car {
    horizontal: boolean;
    fixed: number;
    t: number;
    speed: number;
    dir: 1 | -1;
  }
  const CARS = 110;
  const cars: Car[] = [];
  const carRnd = lcg(777);
  {
    const hStreets = [-CELL / 2, CELL / 2];
    const vStreets = [-CELL * 1.5, -CELL / 2, CELL / 2, CELL * 1.5];
    for (let i = 0; i < CARS; i++) {
      const horizontal = carRnd() > 0.45;
      cars.push({
        horizontal,
        fixed: horizontal
          ? hStreets[Math.floor(carRnd() * hStreets.length)]
          : vStreets[Math.floor(carRnd() * vStreets.length)],
        t: carRnd(),
        speed: 0.02 + carRnd() * 0.05,
        dir: carRnd() > 0.5 ? 1 : -1,
      });
    }
  }
  const carGeo = track(new THREE.BufferGeometry());
  const carPos = new Float32Array(CARS * 3);
  const carCol = new Float32Array(CARS * 3);
  cars.forEach((car, i) => {
    const c =
      car.dir > 0
        ? new THREE.Color(0xfff3cf).multiplyScalar(1.5)
        : new THREE.Color(0xff2d20).multiplyScalar(1.2);
    carCol.set([c.r, c.g, c.b], i * 3);
  });
  carGeo.setAttribute("position", new THREE.BufferAttribute(carPos, 3));
  carGeo.setAttribute("color", new THREE.BufferAttribute(carCol, 3));
  const carPoints = new THREE.Points(
    carGeo,
    track(
      new THREE.PointsMaterial({
        size: 2.1,
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
  carPoints.frustumCulled = false;
  scene.add(carPoints);

  const SPAN_H = CELL * 2.6;
  const SPAN_V = CELL * 1.6;
  function updateCars(dt: number): void {
    cars.forEach((car, i) => {
      car.t += car.speed * dt * car.dir;
      if (car.t > 1) car.t -= 1;
      if (car.t < 0) car.t += 1;
      const along = car.horizontal ? (car.t * 2 - 1) * SPAN_H : (car.t * 2 - 1) * SPAN_V;
      carPos[i * 3] = car.horizontal ? along : car.fixed + (car.dir > 0 ? 2.4 : -2.4);
      carPos[i * 3 + 1] = 0.9;
      carPos[i * 3 + 2] = car.horizontal ? car.fixed + (car.dir > 0 ? 2.4 : -2.4) : along;
    });
    (carGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  }

  // --- stars ---------------------------------------------------------------------------------------------
  {
    const N = 600;
    const arr = new Float32Array(N * 3);
    const rnd = lcg(9001);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 0.85 + 0.2, rnd() * 2 - 1)
        .normalize()
        .multiplyScalar(2200);
      arr.set([v.x, v.y, v.z], i * 3);
    }
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const stars = new THREE.Points(
      geo,
      track(
        new THREE.PointsMaterial({
          size: 1.4,
          color: 0x97a3b8,
          transparent: true,
          opacity: 0.55,
          sizeAttenuation: false,
          depthWrite: false,
          fog: false,
        }),
      ),
    );
    stars.frustumCulled = false;
    scene.add(stars);
  }

  // --- hover highlight + selection marker -------------------------------------------------------------------
  const hlMat = track(
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }),
  );
  const hl = new THREE.LineSegments(track(new THREE.EdgesGeometry(boxGeo)), hlMat);
  hl.visible = false;
  scene.add(hl);

  const selMarker = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(glowTexture()),
        color: 0xffffff,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  selMarker.visible = false;
  selMarker.scale.set(11, 11, 1);
  scene.add(selMarker);

  // --- picking -----------------------------------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  type Pick =
    | { kind: "tower"; tower: Tower }
    | { kind: "block"; site: BlockSite }
    | { kind: "district"; district: CityDistrict }
    | { kind: "core" }
    | null;

  const pickables: THREE.Object3D[] = [
    baseMesh,
    tierMesh,
    coreBase,
    coreSpire,
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
    if ((h.object === baseMesh || h.object === tierMesh) && h.instanceId !== undefined) {
      const idx = h.object === baseMesh ? h.instanceId : tierIdx[h.instanceId];
      return { kind: "tower", tower: towers[idx] };
    }
    if (h.object === coreBase || h.object === coreSpire) return { kind: "core" };
    const d = signDistrict.get(h.object);
    if (d) return { kind: "district", district: d };
    const site = blockOf.get(h.object);
    if (site) return { kind: "block", site };
    return null;
  }

  // --- camera tween --------------------------------------------------------------------------------------------
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

  flyTo(HOME_TARGET, HOME_POS.clone().sub(HOME_TARGET), 2100); // intro

  // --- input -------------------------------------------------------------------------------------------------------
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
      return;
    }
    if (p.kind === "tower") selectTower(p.tower);
    else if (p.kind === "block")
      flyTo(p.site.center.clone(), new THREE.Vector3(30, 52, 56), 850);
    else if (p.kind === "district") focusDistrict(p.district.slug);
    else resetView();
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);

  function selectTower(t: Tower): void {
    selMarker.visible = true;
    selMarker.position.set(t.pos.x, t.pos.y + t.h / 2 + 8, t.pos.z);
    selMarker.material.color.set(t.info.color);
    flyTo(
      new THREE.Vector3(t.pos.x, t.h * 0.5, t.pos.z),
      new THREE.Vector3(32, 24 + t.h * 0.4, 32),
      850,
    );
    onSelectTower({ ...t.info, read: readSet.has(t.info.slug) });
  }

  // --- public ops ----------------------------------------------------------------------------------------------------
  function resetView(): void {
    onFocusDistrict(null);
    onSelectTower(null);
    selMarker.visible = false;
    flyTo(HOME_TARGET, HOME_POS.clone().sub(HOME_TARGET), 1100);
  }

  function focusDistrict(slug: string | null): void {
    onFocusDistrict(slug);
    if (!slug) return;
    const center = districtCenter.get(slug);
    if (!center) return;
    flyTo(center, new THREE.Vector3(45, 150, 95), 950);
  }

  let matchSlugs: string[] = [];
  function setFilter(qRaw: string): number {
    const q = qRaw.trim().toLowerCase();
    if (!q) {
      matchSlugs = [];
      paint();
      return 0;
    }
    const matches = new Set(
      towers.filter((t) => t.info.title.toLowerCase().includes(q)).map((t) => t.info.slug),
    );
    matchSlugs = towers.filter((t) => matches.has(t.info.slug)).map((t) => t.info.slug);
    paint((t, c) => {
      if (matches.has(t.info.slug)) c.set(0xffe93d).multiplyScalar(2.4);
      else c.multiplyScalar(0.14);
    });
    return matchSlugs.length;
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
    rebase();
    if (matchSlugs.length === 0) paint();
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

  // --- resize ----------------------------------------------------------------------------------------------------------
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

  // --- main loop ----------------------------------------------------------------------------------------------------------
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

    // block signs fade in as you approach their district
    camV.copy(camera.position);
    for (const site of blockSites) {
      const d = camV.distanceTo(site.center);
      const o = THREE.MathUtils.clamp(1 - (d - 150) / 130, 0, 1);
      const mat = site.label.material;
      if (o <= 0.02) {
        if (site.label.visible) site.label.visible = false;
      } else {
        site.label.visible = true;
        mat.opacity = o * 0.95;
      }
    }

    // pulses
    const pulse = 1 + 0.09 * Math.sin(now / 430);
    coreSpire.scale.set(pulse, 1, pulse);
    coreBeam.rotation.y += dt * 0.4;
    for (const beam of beacons.values()) beam.rotation.y += dt * 0.35;
    aviMat.opacity = 0.55 + 0.45 * Math.sin(now / 520);
    if (selMarker.visible) selMarker.position.y += Math.sin(now / 240) * 0.05;

    controls.update();
    composer.render();
  }
  raf = requestAnimationFrame(frame);

  // --- teardown -----------------------------------------------------------------------------------------------------------
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
    baseMesh.dispose();
    tierMesh.dispose();
    mastMesh.dispose();
    composer.dispose();
    renderer.dispose();
  }

  return {
    dispose,
    zoom,
    resetView,
    focusDistrict,
    setFilter,
    nextTarget,
    setReadSet,
  };
}
