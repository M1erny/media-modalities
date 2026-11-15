import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Billboard } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';
import type { Modality } from '../data/modalities';
import { economicFrontier, fmtMoney, fmtPrice, lensPosition, pricePerHour, type Lens } from '../data/derive';
import { AXIS_STYLE } from './axes3d';
import { ModalityNode, type LabelSlot } from './ModalityNode';

import { nodeColor, type CameraPreset, type ColorMode } from './colors';

interface SceneProps {
  lens: Lens;
  colorMode: ColorMode;
  modalities: Modality[];
  selectedId: string | null;
  activeIds?: Set<string> | null;
  onSelect: (id: string | null) => void;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  preview?: boolean;
}

interface HoverScreen {
  id: string;
  x: number;
  y: number;
  r: number;
}

interface NodeItem {
  m: Modality;
  pos: [number, number, number];
  r: number;
  color: string;
  isFrontier: boolean;
  isDimmed: boolean;
}

const PRESETS: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
  isometric: { pos: [182, 124, 182], look: [48, 46, 48] },
  xy: { pos: [50, 52, 265], look: [50, 52, 0] },
  zy: { pos: [265, 52, 50], look: [0, 52, 50] },
  xz: { pos: [50, 265, 50.1], look: [50, 0, 50] },
};

function CameraController({ preset, focus, autoRotate, preview }: { preset: CameraPreset; focus: [number, number, number] | null; autoRotate: boolean; preview?: boolean }) {
  const controls = useRef<OrbitControlsType>(null);
  const targetPos = useRef(new THREE.Vector3(...PRESETS.isometric.pos));
  const targetLook = useRef(new THREE.Vector3(...PRESETS.isometric.look));
  const moving = useRef(false);

  useEffect(() => {
    targetPos.current.set(...PRESETS[preset].pos);
    targetLook.current.set(...PRESETS[preset].look);
    moving.current = true;
  }, [preset]);

  useEffect(() => {
    if (!focus) return;
    targetLook.current.set(...focus);
    targetPos.current.set(focus[0] + 45, focus[1] + 30, focus[2] + 45);
    moving.current = true;
  }, [focus]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const stop = () => (moving.current = false);
    c.addEventListener('start', stop);
    return () => c.removeEventListener('start', stop);
  }, []);

  useFrame(({ camera }, delta) => {
    const c = controls.current;
    if (!c) return;
    if (moving.current) {
      camera.position.lerp(targetPos.current, Math.min(1, delta * 4));
      c.target.lerp(targetLook.current, Math.min(1, delta * 4));
      if (camera.position.distanceTo(targetPos.current) < 0.2 && c.target.distanceTo(targetLook.current) < 0.2) moving.current = false;
    }
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.08}
      enabled={!preview}
      minDistance={15}
      maxDistance={600}
      target={PRESETS.isometric.look}
      autoRotate={autoRotate}
      autoRotateSpeed={preview ? 0.6 : 1.2}
    />
  );
}

function Axes({ lens, preview }: { lens: Lens; preview?: boolean }) {
  const a = AXIS_STYLE[lens];
  const color = '#b8bdc8';
  const axis = (pos: [number, number, number], rot: [number, number, number]) => (
    <mesh position={pos} rotation={rot}>
      <cylinderGeometry args={[0.16, 0.16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
  const label = (pos: [number, number, number], [title, range]: readonly [string, string]) => (
    <Billboard position={pos}>
      <Text color="#eef0f4" fontSize={3.2} anchorX="center" anchorY="bottom" outlineWidth={0.22} outlineColor="#0b0d12">
        {title}
      </Text>
      <Text color="#9aa1ae" fontSize={2.1} anchorX="center" anchorY="top" position={[0, -0.5, 0]} outlineWidth={0.18} outlineColor="#0b0d12">
        {range}
      </Text>
    </Billboard>
  );
  return (
    <group>
      {axis([50, 0, 0], [0, 0, Math.PI / 2])}
      {axis([0, 50, 0], [0, 0, 0])}
      {axis([0, 0, 50], [Math.PI / 2, 0, 0])}
      {!preview && (
        <>
          {a.ticks.x.map((t) => (
            <group key={`xt-${t.value}`} position={[t.value, 0, 0]}>
              <mesh position={[0, -0.8, 0]}>
                <boxGeometry args={[0.16, 1.6, 0.16]} />
                <meshBasicMaterial color={color} transparent opacity={0.45} />
              </mesh>
              <Billboard position={[t.value === 0 ? 4 : 0, -2.8, -1.8]}>
                <Text color="#9aa1ae" fontSize={1.75} anchorX="center" anchorY="middle" outlineWidth={0.15} outlineColor="#0b0d12">
                  {t.label}
                </Text>
              </Billboard>
            </group>
          ))}
          {a.ticks.y.map((t) => (
            <group key={`yt-${t.value}`} position={[0, t.value, 0]}>
              <mesh position={[-0.8, 0, -0.8]}>
                <boxGeometry args={[1.4, 0.16, 1.4]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
              </mesh>
              <Billboard position={[-4.2, 0, -4.2]}>
                <Text color="#9aa1ae" fontSize={1.75} anchorX="center" anchorY="middle" outlineWidth={0.15} outlineColor="#0b0d12">
                  {t.label}
                </Text>
              </Billboard>
            </group>
          ))}
          {a.ticks.z.map((t) => (
            <group key={`zt-${t.value}`} position={[0, 0, t.value]}>
              <mesh position={[0, -0.8, 0]}>
                <boxGeometry args={[0.16, 1.6, 0.16]} />
                <meshBasicMaterial color={color} transparent opacity={0.45} />
              </mesh>
              <Billboard position={[-2.2, -2.8, 0]}>
                <Text color="#9aa1ae" fontSize={1.75} anchorX="center" anchorY="middle" outlineWidth={0.15} outlineColor="#0b0d12">
                  {t.label}
                </Text>
              </Billboard>
            </group>
          ))}
        </>
      )}
      {label([50, -14, -12], a.x)}
      {label([0, 106, -3], a.y)}
      {label([-18, -13, 50], a.z)}
    </group>
  );
}

/** Reference back walls with crisp subtle scale grids and perimeter framing so 3D projections read clearly from any angle. */
function Walls() {
  const { majorGeo, minorGeo } = useMemo(() => {
    const major: number[] = [];
    const minor: number[] = [];
    const pushLine = (target: number[], x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      target.push(x1, y1, z1, x2, y2, z2);
    };
    for (const v of [25, 50, 75, 100]) {
      const dst = v === 50 || v === 100 ? major : minor;
      // XY back wall (z = -0.25)
      pushLine(dst, 0, v, -0.25, 100, v, -0.25);
      pushLine(dst, v, 0, -0.25, v, 100, -0.25);
      // ZY back wall (x = -0.25)
      pushLine(dst, -0.25, v, 0, -0.25, v, 100);
      pushLine(dst, -0.25, 0, v, -0.25, 100, v);
    }
    // XZ floor outer edges at 100
    pushLine(major, 100, 0.02, 0, 100, 0.02, 100);
    pushLine(major, 0, 0.02, 100, 100, 0.02, 100);

    const gMajor = new THREE.BufferGeometry();
    gMajor.setAttribute('position', new THREE.Float32BufferAttribute(major, 3));
    const gMinor = new THREE.BufferGeometry();
    gMinor.setAttribute('position', new THREE.Float32BufferAttribute(minor, 3));
    return { majorGeo: gMajor, minorGeo: gMinor };
  }, []);

  useEffect(
    () => () => {
      majorGeo.dispose();
      minorGeo.dispose();
    },
    [majorGeo, minorGeo],
  );

  return (
    <group>
      <mesh position={[50, 50, -0.35]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#151923" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <mesh position={[-0.35, 50, 50]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#151923" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <lineSegments geometry={minorGeo}>
        <lineBasicMaterial color="#252c3b" transparent opacity={0.48} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={majorGeo}>
        <lineBasicMaterial color="#3b455c" transparent opacity={0.62} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

interface SolverProps {
  items: NodeItem[];
  selectedId: string | null;
  hoveredId: string | null;
  lens: Lens;
  preview?: boolean;
  onLabels: (layout: Record<string, LabelSlot>) => void;
  onHoverScreen: (info: HoverScreen | null) => void;
}

const pTmp = new THREE.Vector3();
const pTop = new THREE.Vector3();

function SceneSolver({ items, selectedId, hoveredId, lens, preview, onLabels, onHoverScreen }: SolverProps) {
  const { camera, size } = useThree();
  const lastKey = useRef('');
  const lastHoverKey = useRef('');
  const lastLayoutSig = useRef('');
  const lastSolveAt = useRef(0);
  const settleUntil = useRef(0);

  useEffect(() => {
    settleUntil.current = performance.now() + 1200;
    lastKey.current = '';
  }, [lens, items, selectedId, hoveredId, size.width, size.height]);

  useFrame(() => {
    const now = performance.now();
    camera.updateMatrixWorld();
    const camKey = `${camera.position.x.toFixed(0)}:${camera.position.y.toFixed(0)}:${camera.position.z.toFixed(0)}:${camera.quaternion.x.toFixed(2)}:${camera.quaternion.y.toFixed(2)}:${camera.quaternion.z.toFixed(2)}:${size.width}x${size.height}:${selectedId ?? ''}:${hoveredId ?? ''}:${lens}`;

    if (hoveredId) {
      const hoveredItem = items.find((it) => it.m.id === hoveredId);
      if (hoveredItem) {
        pTmp.set(...hoveredItem.pos).project(camera);
        pTop.set(hoveredItem.pos[0], hoveredItem.pos[1] + hoveredItem.r, hoveredItem.pos[2]).project(camera);
        const sx = (pTmp.x * 0.5 + 0.5) * size.width;
        const sy = (-pTmp.y * 0.5 + 0.5) * size.height;
        const syTop = (-pTop.y * 0.5 + 0.5) * size.height;
        const sr = Math.max(8, Math.abs(sy - syTop));
        const hKey = `${hoveredId}:${Math.round(sx / 2)}:${Math.round(sy / 2)}`;
        if (hKey !== lastHoverKey.current) {
          lastHoverKey.current = hKey;
          onHoverScreen({ id: hoveredId, x: sx, y: sy, r: sr });
        }
      }
    } else if (lastHoverKey.current) {
      lastHoverKey.current = '';
      onHoverScreen(null);
    }

    if (camKey === lastKey.current && (now > settleUntil.current || now - lastSolveAt.current < 120)) return;
    lastKey.current = camKey;
    lastSolveAt.current = now;

    const padX = preview ? 10 : 14;
    const safeTop = preview ? 10 : size.width <= 1360 ? 152 : 114;
    const safeBottom = preview ? size.height - 10 : size.height - 106;
    const wSafe = Math.max(200, size.width);
    const hSafe = Math.max(200, size.height);

    interface Proj {
      it: NodeItem;
      sx: number;
      sy: number;
      sr: number;
      inFront: boolean;
      score: number;
    }

    const projected: Proj[] = items.map((it) => {
      pTmp.set(...it.pos).project(camera);
      pTop.set(it.pos[0], it.pos[1] + it.r, it.pos[2]).project(camera);
      const sx = (pTmp.x * 0.5 + 0.5) * wSafe;
      const sy = (-pTmp.y * 0.5 + 0.5) * hSafe;
      const syTop = (-pTop.y * 0.5 + 0.5) * hSafe;
      const sr = Math.max(5, Math.min(44, Math.abs(sy - syTop)));
      const inFront = pTmp.z >= -1 && pTmp.z <= 1;
      let score = it.m.revenueB;
      if (it.isFrontier) score += 1e6;
      if (it.m.id === hoveredId) score = 9e8;
      if (it.m.id === selectedId) score = 1e9;
      if (it.isDimmed && it.m.id !== hoveredId && it.m.id !== selectedId) score = -1;
      return { it, sx, sy, sr, inFront, score };
    });

    projected.sort((a, b) => b.score - a.score);

    interface Rect {
      x: number;
      y: number;
      w: number;
      h: number;
    }

    const placed: Rect[] = [];
    if (!preview) {
      const axisAnchors: [number, number, number][] = [
        [50, -14, -12],
        [0, 106, -3],
        [-18, -13, 50],
      ];
      for (const [ax, ay, az] of axisAnchors) {
        pTmp.set(ax, ay, az).project(camera);
        if (pTmp.z >= -1 && pTmp.z <= 1) {
          const sx = (pTmp.x * 0.5 + 0.5) * wSafe;
          const sy = (-pTmp.y * 0.5 + 0.5) * hSafe;
          placed.push({ x: sx - 76, y: sy - 20, w: 152, h: 42 });
        }
      }
    }
    const activeCircles = projected.filter((p) => p.inFront && !p.it.isDimmed);
    const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w + 4 && a.x + a.w + 4 > b.x && a.y < b.y + b.h + 3 && a.y + a.h + 3 > b.y;
    const hitsCircle = (rect: Rect, c: Proj) => {
      const cx = Math.max(rect.x, Math.min(c.sx, rect.x + rect.w));
      const cy = Math.max(rect.y, Math.min(c.sy, rect.y + rect.h));
      return (cx - c.sx) ** 2 + (cy - c.sy) ** 2 < (c.sr + 2) ** 2;
    };

    const nextLayout: Record<string, LabelSlot> = {};
    let visibleCount = 0;
    const maxLabels = preview ? 14 : 32;

    for (const p of projected) {
      const id = p.it.m.id;
      const force = id === hoveredId || id === selectedId;
      const fallbackDy = -Math.round(p.sr + 14);
      if (!p.inFront || (!force && (p.it.isDimmed || visibleCount >= maxLabels))) {
        nextLayout[id] = { visible: false, dx: 0, dy: fallbackDy };
        continue;
      }

      const labelW = p.it.m.short.length * (preview ? 5.6 : 6.4) + 14;
      const labelH = preview ? 16 : 20;

      const slots: [number, number][] = [
        [0, -(p.sr + labelH / 2 + 5)],
        [p.sr + labelW / 2 + 7, 0],
        [-(p.sr + labelW / 2 + 7), 0],
        [0, p.sr + labelH / 2 + 5],
        [p.sr + labelW * 0.42 + 5, -(p.sr + labelH * 0.45 + 3)],
        [-(p.sr + labelW * 0.42 + 5), -(p.sr + labelH * 0.45 + 3)],
        [p.sr + labelW * 0.42 + 5, p.sr + labelH * 0.45 + 3],
        [-(p.sr + labelW * 0.42 + 5), p.sr + labelH * 0.45 + 3],
      ];

      let chosen: [number, number] | null = null;
      for (const [dx, dy] of slots) {
        const rect: Rect = { x: p.sx + dx - labelW / 2, y: p.sy + dy - labelH / 2, w: labelW, h: labelH };
        if (rect.x < padX || rect.x + rect.w > wSafe - padX || rect.y < safeTop || rect.y + rect.h > safeBottom) continue;
        if (placed.some((r) => overlaps(rect, r))) continue;
        if (!force && activeCircles.some((c) => c.it.m.id !== id && hitsCircle(rect, c))) continue;
        placed.push(rect);
        chosen = [Math.round(dx), Math.round(dy)];
        break;
      }

      if (chosen) {
        visibleCount++;
        nextLayout[id] = { visible: true, dx: chosen[0], dy: chosen[1] };
      } else if (force) {
        const clampedDy = p.sy + fallbackDy - labelH / 2 < safeTop ? Math.round(p.sr + labelH / 2 + 6) : fallbackDy;
        nextLayout[id] = { visible: true, dx: 0, dy: clampedDy };
      } else {
        nextLayout[id] = { visible: false, dx: 0, dy: fallbackDy };
      }
    }

    let sig = '';
    for (const it of items) {
      const s = nextLayout[it.m.id];
      sig += `${it.m.id}:${s.visible ? 1 : 0}:${s.dx},${s.dy};`;
    }
    if (sig !== lastLayoutSig.current) {
      lastLayoutSig.current = sig;
      onLabels(nextLayout);
    }
  });

  return null;
}

function NodeTipOverlay({
  modality: m,
  lens,
  isFrontier,
  screen,
  stageW,
  stageH,
}: {
  modality: Modality;
  lens: Lens;
  isFrontier: boolean;
  screen: HoverScreen;
  stageW: number;
  stageH: number;
}) {
  const tipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; ready: boolean }>({ left: 0, top: 0, ready: false });

  useLayoutEffect(() => {
    const el = tipRef.current;
    if (!el) return;
    const tipW = el.offsetWidth || 256;
    const tipH = el.offsetHeight || 170;
    const safeTop = stageW <= 1360 ? 154 : 118;
    const safeBottom = stageH - (stageW <= 600 ? 78 : 116);
    const safeLeft = 14;
    const safeRight = stageW - 14;

    let left = screen.x + screen.r + 16;
    if (left + tipW > safeRight) {
      left = screen.x - screen.r - 16 - tipW;
    }
    left = Math.max(safeLeft, Math.min(Math.max(safeLeft, safeRight - tipW), left));

    const rawTop = screen.y - tipH * 0.45;
    const maxTop = Math.max(safeTop, safeBottom - tipH);
    const top = Math.max(safeTop, Math.min(maxTop, rawTop));
    setPos({ left: Math.round(left), top: Math.round(top), ready: true });
  }, [m.id, screen.x, screen.y, screen.r, stageW, stageH]);

  const lensRows =
    lens === 'economic'
      ? [
          ['Revenue / hour', fmtPrice(pricePerHour(m))],
          ['Platform moat', String(m.moat)],
        ]
      : [
          ['Cognitive load', String(m.cognitiveLoad)],
          ['Agency', String(m.agency)],
          ['Sensory', String(m.sensoryBandwidth)],
        ];

  return (
    <div ref={tipRef} className="node-tip node-tip-float" style={{ left: pos.left, top: pos.top, opacity: pos.ready ? 1 : 0 }}>
      <div className="tip-head">
        <b>{m.name}</b>
        <span>${m.ticker}</span>
      </div>
      <div className="tip-sub">
        {m.family} · {fmtMoney(m.revenueB)} a year
      </div>
      <dl className="tip-rows">
        {lensRows.map(([k, v]) => (
          <span key={k} style={{ display: 'contents' }}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </span>
        ))}
      </dl>
      {isFrontier && <div className="tip-flag">On the efficient frontier</div>}
    </div>
  );
}

export function Scene({ lens, colorMode, modalities, selectedId, activeIds, onSelect, cameraPreset, autoRotate, preview }: SceneProps) {
  const frontier = useMemo(() => (lens === 'economic' ? economicFrontier(modalities) : new Set<string>()), [lens, modalities]);
  const maxRevenue = useMemo(() => Math.max(...modalities.map((m) => m.revenueB)), [modalities]);
  const selected = modalities.find((m) => m.id === selectedId) ?? null;
  const focus = useMemo(() => (selected ? lensPosition(selected, lens) : null), [selected, lens]);

  const items = useMemo<NodeItem[]>(
    () =>
      modalities.map((m) => ({
        m,
        pos: lensPosition(m, lens),
        r: Math.max(1.1, 5 * Math.sqrt(m.revenueB / maxRevenue)),
        color: nodeColor(m, colorMode),
        isFrontier: frontier.has(m.id),
        isDimmed: activeIds ? !activeIds.has(m.id) && m.id !== selectedId : false,
      })),
    [modalities, lens, maxRevenue, colorMode, frontier, activeIds, selectedId],
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 1200, h: 800 });
  const [labels, setLabels] = useState<Record<string, LabelSlot>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverScreen, setHoverScreen] = useState<HoverScreen | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setStageSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId((prev) => (id === null && prev === null ? null : id));
    if (id === null) setHoverScreen(null);
  }, []);

  const hoveredItem = !preview && hoveredId && hoveredId !== selectedId ? items.find((it) => it.m.id === hoveredId) ?? null : null;

  return (
    <div ref={stageRef} className="scene-stage">
      <Canvas
        camera={{ position: PRESETS.isometric.pos, fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={['#0b0d12']} />
        <hemisphereLight args={['#dfe6ff', '#1a1f2a', 1.1]} />
        <directionalLight position={[120, 160, 100]} intensity={1.6} />
        <directionalLight position={[-80, 60, -60]} intensity={0.5} color="#a99bff" />

        <CameraController preset={cameraPreset} focus={focus} autoRotate={autoRotate} preview={preview} />
        <Axes lens={lens} preview={preview} />
        <Walls />
        <Grid position={[50, 0, 50]} args={[100, 100]} cellSize={10} cellThickness={0.4} cellColor="#161b25" sectionSize={25} sectionThickness={0.8} sectionColor="#272e3e" fadeDistance={340} />

        <SceneSolver
          items={items}
          selectedId={selectedId}
          hoveredId={hoveredId}
          lens={lens}
          preview={preview}
          onLabels={setLabels}
          onHoverScreen={setHoverScreen}
        />

        {items.map((it) => (
          <ModalityNode
            key={it.m.id}
            modality={it.m}
            position={it.pos}
            radius={it.r}
            color={it.color}
            lens={lens}
            isSelected={it.m.id === selectedId}
            isFrontier={it.isFrontier}
            isDimmed={it.isDimmed}
            labelSlot={labels[it.m.id]}
            onHover={handleHover}
            onSelect={onSelect}
            preview={preview}
          />
        ))}
      </Canvas>

      {hoveredItem && hoverScreen && hoverScreen.id === hoveredItem.m.id && (
        <NodeTipOverlay
          modality={hoveredItem.m}
          lens={lens}
          isFrontier={hoveredItem.isFrontier}
          screen={hoverScreen}
          stageW={stageSize.w}
          stageH={stageSize.h}
        />
      )}
    </div>
  );
}
