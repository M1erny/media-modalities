import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Modality } from '../data/modalities';
import { fmtMoney, fmtPrice, pricePerHour, type Lens } from '../data/derive';

interface Props {
  modality: Modality;
  position: [number, number, number];
  radius: number;
  color: string;
  lens: Lens;
  isSelected: boolean;
  isFrontier: boolean;
  onSelect: (id: string | null) => void;
  preview?: boolean;
}

const noRaycast = () => null;
const tmp = new THREE.Vector3();

/** One experience: a sphere at its lens position, its shadow on the floor, and (when inspected) on both back walls. */
export function ModalityNode({ modality: m, position, radius, color, lens, isSelected, isFrontier, onSelect, preview }: Props) {
  const group = useRef<THREE.Group>(null);
  const floor = useRef<THREE.Mesh>(null);
  const wallXY = useRef<THREE.Mesh>(null);
  const wallZY = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const scale = useRef(1);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    tmp.set(...position);
    g.position.lerp(tmp, Math.min(1, delta * 5));
    const target = isSelected ? 1.35 : hovered ? 1.2 : 1;
    scale.current = THREE.MathUtils.lerp(scale.current, target, Math.min(1, delta * 8));
    g.scale.setScalar(scale.current);
    const { x, y, z } = g.position;
    floor.current?.position.set(x, 0.05, z);
    wallXY.current?.position.set(x, y, 0.05);
    wallZY.current?.position.set(0.05, y, z);
    if (halo.current) halo.current.rotation.z += delta * 0.6;
  });

  const shadowOpacity = isSelected ? 0.55 : hovered ? 0.4 : 0.14;
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
    <>
      <mesh ref={floor} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <circleGeometry args={[radius * 0.8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={shadowOpacity} depthWrite={false} />
      </mesh>
      {(hovered || isSelected) && (
        <>
          <mesh ref={wallXY} position={[position[0], position[1], 0.05]} raycast={noRaycast}>
            <circleGeometry args={[radius * 0.8, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
          </mesh>
          <mesh ref={wallZY} position={[0.05, position[1], position[2]]} rotation={[0, Math.PI / 2, 0]} raycast={noRaycast}>
            <circleGeometry args={[radius * 0.8, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
          </mesh>
        </>
      )}

      <group ref={group} position={position}>
        <mesh
          onPointerOver={(e) => {
            if (preview) return;
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = '';
          }}
          onClick={(e) => {
            if (preview) return;
            e.stopPropagation();
            onSelect(m.id);
          }}
        >
          <sphereGeometry args={[Math.max(radius, 2.2) * 1.15, 12, 12]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <mesh raycast={noRaycast}>
          <sphereGeometry args={[radius, 32, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : hovered ? 0.55 : 0.25} roughness={0.35} metalness={0.05} />
        </mesh>

        {isSelected && (
          <mesh raycast={noRaycast}>
            <torusGeometry args={[radius * 1.45, 0.12, 12, 64]} />
            <meshBasicMaterial color="#eef0f4" />
          </mesh>
        )}
        {isFrontier && !isSelected && (
          <mesh ref={halo} raycast={noRaycast}>
            <torusGeometry args={[radius * 1.4, 0.08, 8, 48]} />
            <meshBasicMaterial color="#a99bff" transparent opacity={0.85} />
          </mesh>
        )}

        <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }} position={[0, radius + 2.2, 0]}>
          <div className={`node-label${hovered || isSelected ? ' on' : ''}${preview ? ' preview' : ''}`}>{m.short}</div>
        </Html>

        {hovered && !isSelected && !preview && (
          <Html zIndexRange={[60, 40]} style={{ pointerEvents: 'none' }} position={[radius + 2, 0, 0]}>
            <div className="node-tip">
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
          </Html>
        )}
      </group>
    </>
  );
}
