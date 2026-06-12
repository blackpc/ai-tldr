/**
 * /learn/map — KNOWLEDGE CITY: the Learn encyclopedia as a procedural
 * neon city at night, rendered in WebGL (three.js).
 *
 * Not a graph. A game world:
 *   - 14 DISTRICTS (categories) on a city grid, each in its accent color
 *   - city BLOCKS inside each district (subcategories)
 *   - every article is a TOWER. Reading it powers the building — its
 *     windows light up in the district color. Unread towers stand dark.
 *   - the AI CORE spire burns in the central plaza
 *   - completed districts fire a light beacon into the sky
 *   - headlight/taillight traffic flows through the streets
 *
 * RTS controls (MapControls): drag to roam, right-drag to orbit, wheel
 * to zoom, arrow keys to pan. Click a tower to inspect it, click a
 * district sign to fly there. Deterministic procedural geometry — no
 * assets, no randomness across reloads.
 *
 * This module is dynamic-imported by LearnMap.tsx in a client-only
 * effect, so three.js ships as its own lazy chunk and never touches SSR.
 */

import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";

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
  kind: "tower" | "district" | "core";
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

const BG = 0x050505;

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

/** Shared window-grid texture: dark walls, faint window cells. Instance
 *  color multiplies it — dark gray for unread concrete, bright accent for
 *  powered buildings whose windows then glow. */
function windowsTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#3a3a3a";
  g.fillRect(0, 0, 64, 128);
  const rnd = lcg(424242);
  for (let y = 6; y < 122; y += 10) {
    for (let x = 5; x < 58; x += 9) {
      const on = rnd();
      g.fillStyle =
        on > 0.45 ? `rgba(255,255,255,${0.55 + on * 0.45})` : "rgba(255,255,255,0.10)";
      g.fillRect(x, y, 5, 6);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Neon district sign rendered to a sprite texture. */
function signTexture(text: string, color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.font = "700 64px 'JetBrains Mono', 'Cascadia Code', Consolas, monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = color;
  g.shadowBlur = 26;
  g.fillStyle = color;
  g.fillText(text.toUpperCase(), 512, 64, 990);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------------------
// City layout constants
// ---------------------------------------------------------------------------

const CELL = 175; // district grid pitch (plate + street)
const PLATE = 140; // district plate size
const COLS = 5;
const ROWS = 3;
const CORE_CELL = { col: 2, row: 1 }; // central plaza
const HOME_POS = new THREE.Vector3(0, 270, 400);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

const BLOCK_OFFSETS: [number, number][] = [
  [0, 0],
  [-44, -44],
  [44, -44],
  [-44, 44],
  [44, 44],
  [0, -44],
  [0, 44],
  [-44, 0],
  [44, 0],
];

interface Tower {
  info: CityTowerInfo;
  pos: THREE.Vector3;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function createLearnMap3D(opts: CityOptions): CityHandle {
  const { canvas, districts, onHover, onSelectTower, onFocusDistrict } = opts;
  let readSet = new Set(opts.readSet);

  // --- district cell positions (skip the core plaza cell) -------------------
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

  // --- towers ----------------------------------------------------------------
  const towers: Tower[] = [];
  const towersByDistrict = new Map<string, Tower[]>();

  for (const d of districts) {
    const center = districtCenter.get(d.slug)!;
    const list: Tower[] = [];
    d.blocks.forEach((b, j) => {
      const [ox, oz] = BLOCK_OFFSETS[j % BLOCK_OFFSETS.length];
      const arts = b.articles;
      const cols = Math.ceil(Math.sqrt(Math.max(1, arts.length)));
      const rows = Math.ceil(arts.length / cols);
      arts.forEach((a, k) => {
        const rnd = lcg(hash(a.slug));
        const col = k % cols;
        const row = Math.floor(k / cols);
        const x = center.x + ox + (col - (cols - 1) / 2) * 12 + (rnd() - 0.5) * 3;
        const z = center.z + oz + (row - (rows - 1) / 2) * 12 + (rnd() - 0.5) * 3;
        const base =
          a.difficulty === "advanced" ? 26 : a.difficulty === "intermediate" ? 17 : 10;
        const h = base + rnd() * 9;
        const w = 7 + rnd() * 2.4;
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
          pos: new THREE.Vector3(x, h / 2 + 0.8, z),
          w,
          h,
        };
        towers.push(tower);
        list.push(tower);
      });
    });
    towersByDistrict.set(d.slug, list);
  }

  // --- renderer / scene / camera ----------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.0011);

  const camera = new THREE.PerspectiveCamera(50, 1, 1, 5000);
  camera.position.set(0, 540, 720); // intro flyover start

  const controls = new MapControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 30;
  controls.maxDistance = 900;
  controls.maxPolarAngle = 1.42; // never dive below the streets
  controls.listenToKeyEvents(window);
  controls.keyPanSpeed = 24;

  // --- ground + streets ----------------------------------------------------------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2400, 1600),
    new THREE.MeshBasicMaterial({ color: 0x070708 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  scene.add(ground);

  // street center-lines (additive, faint) + district plates with accent edges
  const streetVerts: number[] = [];
  for (let c = 0; c <= COLS - 1; c++) {
    const x = (c - 2) * CELL + CELL / 2;
    if (c < COLS - 1) streetVerts.push(x, 0.25, -CELL * 1.6, x, 0.25, CELL * 1.6);
  }
  for (let r = 0; r < ROWS - 1; r++) {
    const z = (r - 1) * CELL + CELL / 2;
    streetVerts.push(-CELL * 2.6, 0.25, z, CELL * 2.6, 0.25, z);
  }
  const streetGeo = new THREE.BufferGeometry();
  streetGeo.setAttribute("position", new THREE.Float32BufferAttribute(streetVerts, 3));
  scene.add(
    new THREE.LineSegments(
      streetGeo,
      new THREE.LineBasicMaterial({
        color: 0x2a2a20,
        transparent: true,
        opacity: 0.8,
      }),
    ),
  );

  const plateGeo = new THREE.BoxGeometry(PLATE, 1.2, PLATE);
  const plateMat = new THREE.MeshBasicMaterial({ color: 0x0c0c0e });
  const plates: THREE.Mesh[] = [];
  const plateDistrict = new Map<THREE.Object3D, CityDistrict>();
  const edgeGeo = new THREE.EdgesGeometry(plateGeo);
  for (const d of districts) {
    const p = districtCenter.get(d.slug)!;
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(p.x, 0, p.z);
    scene.add(plate);
    plates.push(plate);
    plateDistrict.set(plate, d);
    const edge = new THREE.LineSegments(
      edgeGeo,
      new THREE.LineBasicMaterial({
        color: new THREE.Color(d.color).multiplyScalar(0.55),
        transparent: true,
        opacity: 0.9,
      }),
    );
    edge.position.copy(plate.position);
    scene.add(edge);
  }

  // --- instanced towers -------------------------------------------------------------
  const winTex = windowsTexture();
  const towerGeo = new THREE.BoxGeometry(1, 1, 1);
  const towerMat = new THREE.MeshBasicMaterial({ map: winTex });
  const towerMesh = new THREE.InstancedMesh(towerGeo, towerMat, towers.length);
  const m4 = new THREE.Matrix4();
  towers.forEach((t, i) => {
    m4.makeScale(t.w, t.h, t.w);
    m4.setPosition(t.pos);
    towerMesh.setMatrixAt(i, m4);
  });

  const DARK = new THREE.Color(0x53565e); // unread concrete (windows stay faint)
  const towerColor = (t: Tower): THREE.Color =>
    readSet.has(t.info.slug)
      ? new THREE.Color(t.info.color).lerp(new THREE.Color(1, 1, 1), 0.18).multiplyScalar(1.5)
      : DARK.clone();

  const baseColors = new Float32Array(towers.length * 3);
  towers.forEach((t, i) => {
    const c = towerColor(t);
    baseColors.set([c.r, c.g, c.b], i * 3);
    towerMesh.setColorAt(i, c);
  });
  towerMesh.instanceColor!.needsUpdate = true;
  scene.add(towerMesh);

  function repaintTowers(mod?: (t: Tower, c: THREE.Color) => void): void {
    const c = new THREE.Color();
    towers.forEach((t, i) => {
      c.setRGB(baseColors[i * 3], baseColors[i * 3 + 1], baseColors[i * 3 + 2]);
      mod?.(t, c);
      towerMesh.setColorAt(i, c);
    });
    towerMesh.instanceColor!.needsUpdate = true;
  }

  // --- district signs + completion beacons ----------------------------------------------
  const signSprites: THREE.Sprite[] = [];
  const signDistrict = new Map<THREE.Object3D, CityDistrict>();
  const signTextures: THREE.Texture[] = [];
  for (const d of districts) {
    const tex = signTexture(d.title, d.color);
    signTextures.push(tex);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    const p = districtCenter.get(d.slug)!;
    sprite.position.set(p.x, 47, p.z);
    sprite.scale.set(64, 8, 1);
    scene.add(sprite);
    signSprites.push(sprite);
    signDistrict.set(sprite, d);
  }

  const beaconGeo = new THREE.CylinderGeometry(1.6, 2.6, 340, 8, 1, true);
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
            color: d.color,
            transparent: true,
            opacity: 0.28,
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

  // --- the AI core spire -----------------------------------------------------------------
  const core = new THREE.Group();
  const coreBase = new THREE.Mesh(
    new THREE.BoxGeometry(18, 26, 18),
    new THREE.MeshBasicMaterial({ map: winTex, color: 0xbbb36a }),
  );
  coreBase.position.y = 13;
  core.add(coreBase);
  const coreSpire = new THREE.Mesh(
    new THREE.BoxGeometry(7, 58, 7),
    new THREE.MeshBasicMaterial({ map: winTex, color: 0xf7ff00 }),
  );
  coreSpire.position.y = 26 + 29;
  core.add(coreSpire);
  const coreBeam = new THREE.Mesh(
    beaconGeo,
    new THREE.MeshBasicMaterial({
      color: 0xf7ff00,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  coreBeam.position.y = 230;
  core.add(coreBeam);
  const glowTex = signTexture("◆", "#f7ff00");
  const coreSign = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: signTexture("A I", "#f7ff00"),
      transparent: true,
      depthWrite: false,
    }),
  );
  coreSign.position.y = 98;
  coreSign.scale.set(40, 5, 1);
  core.add(coreSign);
  scene.add(core);

  // --- street traffic (headlights white, taillights red) -----------------------------------
  interface Car {
    horizontal: boolean;
    fixed: number;
    t: number;
    speed: number;
    dir: 1 | -1;
  }
  const CARS = 90;
  const cars: Car[] = [];
  const carRnd = lcg(777);
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
  const carGeo = new THREE.BufferGeometry();
  const carPos = new Float32Array(CARS * 3);
  const carCol = new Float32Array(CARS * 3);
  cars.forEach((car, i) => {
    const c = car.dir > 0 ? new THREE.Color(0xfff6d8) : new THREE.Color(0xff3b30);
    carCol.set([c.r, c.g, c.b], i * 3);
  });
  carGeo.setAttribute("position", new THREE.BufferAttribute(carPos, 3));
  carGeo.setAttribute("color", new THREE.BufferAttribute(carCol, 3));
  const carPoints = new THREE.Points(
    carGeo,
    new THREE.PointsMaterial({
      size: 2.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
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
      const along = car.horizontal
        ? (car.t * 2 - 1) * SPAN_H
        : (car.t * 2 - 1) * SPAN_V;
      carPos[i * 3] = car.horizontal ? along : car.fixed + (car.dir > 0 ? 2.4 : -2.4);
      carPos[i * 3 + 1] = 0.7;
      carPos[i * 3 + 2] = car.horizontal ? car.fixed + (car.dir > 0 ? 2.4 : -2.4) : along;
    });
    (carGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  }

  // --- night sky ------------------------------------------------------------------------------
  {
    const N = 700;
    const arr = new Float32Array(N * 3);
    const rnd = lcg(9001);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 0.9 + 0.18, rnd() * 2 - 1)
        .normalize()
        .multiplyScalar(1400 + rnd() * 400);
      arr.set([v.x, v.y, v.z], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 1.6,
        color: 0x6b7480,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: false,
        depthWrite: false,
      }),
    );
    stars.frustumCulled = false;
    scene.add(stars);
  }

  // --- hover highlight + selection marker ---------------------------------------------------
  const hlGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  const hlMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });
  const hl = new THREE.LineSegments(hlGeo, hlMat);
  hl.visible = false;
  scene.add(hl);

  const selMarker = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffffff,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  selMarker.visible = false;
  selMarker.scale.set(10, 10, 1);
  scene.add(selMarker);

  function placeBox(target: THREE.LineSegments, t: Tower, grow: number): void {
    target.position.copy(t.pos);
    target.scale.set(t.w + grow, t.h + grow, t.w + grow);
  }

  // --- picking --------------------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  type Pick =
    | { kind: "tower"; tower: Tower }
    | { kind: "district"; district: CityDistrict }
    | { kind: "core" }
    | null;

  function pick(clientX: number, clientY: number): Pick {
    const rect = canvas.getBoundingClientRect();
    ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(
      [towerMesh, coreBase, coreSpire, ...signSprites],
      false,
    );
    const h = hits[0];
    if (!h) return null;
    if (h.object === towerMesh && h.instanceId !== undefined)
      return { kind: "tower", tower: towers[h.instanceId] };
    if (h.object === coreBase || h.object === coreSpire) return { kind: "core" };
    const d = signDistrict.get(h.object);
    if (d) return { kind: "district", district: d };
    return null;
  }

  // --- camera tween -----------------------------------------------------------------------------
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

  // intro flyover
  flyTo(HOME_TARGET, HOME_POS.clone().sub(HOME_TARGET), 2000);

  // --- input -------------------------------------------------------------------------------------
  let downX = 0;
  let downY = 0;
  let downT = 0;

  const onPointerMove = (e: PointerEvent): void => {
    const p = pick(e.clientX, e.clientY);
    if (p?.kind === "tower") {
      placeBox(hl, p.tower, 1.2);
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
    else if (p.kind === "district") focusDistrict(p.district.slug);
    else resetView();
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);

  function selectTower(t: Tower): void {
    selMarker.visible = true;
    selMarker.position.set(t.pos.x, t.pos.y + t.h / 2 + 7, t.pos.z);
    selMarker.material.color.set(t.info.color);
    flyTo(
      new THREE.Vector3(t.pos.x, t.h * 0.5, t.pos.z),
      new THREE.Vector3(34, 26 + t.h * 0.4, 34),
      850,
    );
    onSelectTower({ ...t.info, read: readSet.has(t.info.slug) });
  }

  // --- public ops -----------------------------------------------------------------------------------
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
    flyTo(center, new THREE.Vector3(70, 120, 110), 950);
  }

  let matchSlugs: string[] = [];
  function setFilter(qRaw: string): number {
    const q = qRaw.trim().toLowerCase();
    if (!q) {
      matchSlugs = [];
      repaintTowers();
      return 0;
    }
    const matches = new Set(
      towers.filter((t) => t.info.title.toLowerCase().includes(q)).map((t) => t.info.slug),
    );
    matchSlugs = towers.filter((t) => matches.has(t.info.slug)).map((t) => t.info.slug);
    repaintTowers((t, c) => {
      if (matches.has(t.info.slug)) c.set(0xffe93d).multiplyScalar(1.7);
      else c.multiplyScalar(0.16);
    });
    return matchSlugs.length;
  }

  function nextTarget(): CityTowerInfo | null {
    // least-powered district first, then taxonomy order
    const ranked = [...districts].sort((a, b) => {
      const la = towersByDistrict.get(a.slug) ?? [];
      const lb = towersByDistrict.get(b.slug) ?? [];
      const ra = la.length ? la.filter((t) => readSet.has(t.info.slug)).length / la.length : 1;
      const rb = lb.length ? lb.filter((t) => readSet.has(t.info.slug)).length / lb.length : 1;
      return ra - rb;
    });
    for (const d of ranked) {
      const t = (towersByDistrict.get(d.slug) ?? []).find(
        (x) => !readSet.has(x.info.slug),
      );
      if (t) {
        selectTower(t);
        return { ...t.info, read: false };
      }
    }
    return null;
  }

  function setReadSet(read: Set<string>): void {
    readSet = new Set(read);
    towers.forEach((t, i) => {
      const c = towerColor(t);
      baseColors.set([c.r, c.g, c.b], i * 3);
    });
    if (matchSlugs.length === 0) repaintTowers();
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

  // --- resize -------------------------------------------------------------------------------------------
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

  // --- main loop -------------------------------------------------------------------------------------------
  let raf = 0;
  let prev = performance.now();

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

    // core spire breathes; beams shimmer; selection marker bobs
    const pulse = 1 + 0.1 * Math.sin(now / 420);
    (coreSpire.material as THREE.MeshBasicMaterial).color.setScalar(0).set(0xf7ff00);
    coreSpire.scale.set(pulse, 1, pulse);
    coreBeam.rotation.y += dt * 0.4;
    for (const beam of beacons.values()) beam.rotation.y += dt * 0.35;
    if (selMarker.visible) selMarker.position.y += Math.sin(now / 240) * 0.05;

    controls.update();
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  // --- teardown ----------------------------------------------------------------------------------------------
  function dispose(): void {
    cancelAnimationFrame(raf);
    ro.disconnect();
    controls.stopListenToKeyEvents();
    controls.dispose();
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    scene.traverse((o) => {
      const obj = o as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      const m = (obj as { material?: THREE.Material | THREE.Material[] }).material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose();
    });
    for (const t of signTextures) t.dispose();
    winTex.dispose();
    glowTex.dispose();
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
