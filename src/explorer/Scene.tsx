import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Billboard } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';
import type { Modality } from '../data/modalities';
import { economicFrontier, lensPosition, type Lens } from '../data/derive';
import { ModalityNode } from './ModalityNode';

import { nodeColor, type CameraPreset, type ColorMode } from './colors';

interface SceneProps {
  lens: Lens;
  colorMode: ColorMode;
  modalities: Modality[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  preview?: boolean;
}

const PRESETS: Record<CameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
  isometric: { pos: [172, 118, 172], look: [50, 40, 50] },
  xy: { pos: [50, 50, 235], look: [50, 50, 0] },
  zy: { pos: [235, 50, 50], look: [0, 50, 50] },
  xz: { pos: [50, 235, 50.1], look: [50, 0, 50] },
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

const AXIS_STYLE = {
  biological: { x: ['Cognitive load', 'effortless → effortful'], y: ['Agency', 'fixed → co-created'], z: ['Sensory bandwidth', 'text → physical'] },
  economic: { x: ['Supply cost', '$100 → $100M per hour'], y: ['Revenue per hour', '1¢ → $100'], z: ['Platform moat', 'none → social graph'] },
} as const;

function Axes({ lens }: { lens: Lens }) {
  const a = AXIS_STYLE[lens];
  const color = '#b8bdc8';
  const axis = (pos: [number, number, number], rot: [number, number, number]) => (
    <mesh position={pos} rotation={rot}>
      <cylinderGeometry args={[0.16, 0.16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} />
    </mesh>
  );
  const label = (pos: [number, number, number], [title, range]: readonly [string, string]) => (
    <Billboard position={pos}>
      <Text color="#eef0f4" fontSize={3.4} anchorX="center" anchorY="bottom">
        {title}
      </Text>
      <Text color="#8a909c" fontSize={2.2} anchorX="center" anchorY="top" position={[0, -0.6, 0]}>
        {range}
      </Text>
    </Billboard>
  );
  return (
    <group>
      {axis([50, 0, 0], [0, 0, Math.PI / 2])}
      {axis([0, 50, 0], [0, 0, 0])}
      {axis([0, 0, 50], [Math.PI / 2, 0, 0])}
      {label([50, -9, 0], a.x)}
      {label([0, 112, 0], a.y)}
      {label([0, -9, 50], a.z)}
    </group>
  );
}

/** Faint back walls so each node's projection onto the three planes can be read without rotating. */
function Walls() {
  return (
    <group>
      <mesh position={[50, 50, -0.3]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#1a1f2a" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh position={[-0.3, 50, 50]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#1a1f2a" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Scene({ lens, colorMode, modalities, selectedId, onSelect, cameraPreset, autoRotate, preview }: SceneProps) {
  const frontier = useMemo(() => (lens === 'economic' ? economicFrontier(modalities) : new Set<string>()), [lens, modalities]);
  const maxRevenue = useMemo(() => Math.max(...modalities.map((m) => m.revenueB)), [modalities]);
  const selected = modalities.find((m) => m.id === selectedId) ?? null;
  const focus = useMemo(() => (selected ? lensPosition(selected, lens) : null), [selected, lens]);

  return (
    <Canvas camera={{ position: PRESETS.isometric.pos, fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} onPointerMissed={() => onSelect(null)}>
      <color attach="background" args={['#0b0d12']} />
      <hemisphereLight args={['#dfe6ff', '#1a1f2a', 1.1]} />
      <directionalLight position={[120, 160, 100]} intensity={1.6} />
      <directionalLight position={[-80, 60, -60]} intensity={0.5} color="#a99bff" />

      <CameraController preset={cameraPreset} focus={focus} autoRotate={autoRotate} preview={preview} />
      <Axes lens={lens} />
      <Walls />
      <Grid position={[50, 0, 50]} args={[100, 100]} cellSize={10} cellThickness={0.4} cellColor="#161b25" sectionSize={25} sectionThickness={0.8} sectionColor="#252a33" fadeDistance={320} />

      {modalities.map((m) => (
        <ModalityNode
          key={m.id}
          modality={m}
          position={lensPosition(m, lens)}
          radius={Math.max(1.1, 5 * Math.sqrt(m.revenueB / maxRevenue))}
          color={nodeColor(m, colorMode)}
          lens={lens}
          isSelected={m.id === selectedId}
          isFrontier={frontier.has(m.id)}
          onSelect={onSelect}
          preview={preview}
        />
      ))}
    </Canvas>
  );
}
