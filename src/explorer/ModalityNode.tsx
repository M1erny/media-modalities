import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Modality } from '../data/modalities';
import type { Lens } from '../data/derive';

export interface LabelSlot {
  visible: boolean;
  dx: number;
  dy: number;
}

interface Props {
  modality: Modality;
  position: [number, number, number];
  radius: number;
  color: string;
  lens: Lens;
  isSelected: boolean;
  isFrontier: boolean;
  isDimmed?: boolean;
  labelSlot?: LabelSlot;
  onHover?: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  preview?: boolean;
}

const noRaycast = () => null;
const tmp = new THREE.Vector3();

/** One experience: a sphere at its lens position, a vertical stem to the floor, its shadow on the floor, and (when inspected) projection lines and wall shadows. */
export function ModalityNode({
  modality: m,
  position,
  radius,
  color,
  lens: _lens,
  isSelected,
  isFrontier,
  isDimmed = false,
  labelSlot,
  onHover,
  onSelect,
  preview,
}: Props) {
  void _lens;
  const group = useRef<THREE.Group>(null);
  const stem = useRef<THREE.Mesh>(null);
  const floor = useRef<THREE.Mesh>(null);
  const wallXY = useRef<THREE.Mesh>(null);
  const wallZY = useRef<THREE.Mesh>(null);
  const projXY = useRef<THREE.Mesh>(null);
  const projZY = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const scale = useRef(1);
  const [hovered, setHovered] = useState(false);

  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    tmp.set(...position);
    g.position.lerp(tmp, Math.min(1, delta * 5));
    const target = isSelected ? 1.35 : hovered ? 1.2 : isDimmed ? 0.84 : 1;
    scale.current = THREE.MathUtils.lerp(scale.current, target, Math.min(1, delta * 8));
    g.scale.setScalar(scale.current);
    const { x, y, z } = g.position;
    floor.current?.position.set(x, 0.05, z);
    if (stem.current) {
      stem.current.position.set(x, y / 2, z);
      stem.current.scale.set(1, Math.max(0.01, y), 1);
    }
    wallXY.current?.position.set(x, y, 0.05);
    wallZY.current?.position.set(0.05, y, z);
    if (projXY.current) {
      projXY.current.position.set(x, y, z / 2);
      projXY.current.scale.set(1, Math.max(0.01, z), 1);
    }
    if (projZY.current) {
      projZY.current.position.set(x / 2, y, z);
      projZY.current.scale.set(1, Math.max(0.01, x), 1);
    }
    if (halo.current) halo.current.rotation.z += delta * 0.6;
  });

  const shadowOpacity = isDimmed ? 0.08 : isSelected ? 0.62 : hovered ? 0.48 : 0.2;
  const stemOpacity = isDimmed ? 0.09 : isSelected ? 0.65 : hovered ? 0.48 : 0.18;
  const sphereOpacity = isDimmed ? 0.28 : 1;

  return (
    <>
      <mesh ref={stem} raycast={noRaycast}>
        <cylinderGeometry args={[isSelected || hovered ? 0.14 : 0.07, isSelected || hovered ? 0.14 : 0.07, 1, 6]} />
        <meshBasicMaterial color={color} transparent opacity={stemOpacity} depthWrite={false} />
      </mesh>
      <mesh ref={floor} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <circleGeometry args={[radius * 0.8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={shadowOpacity} depthWrite={false} />
      </mesh>
      {(hovered || isSelected) && (
        <>
          <mesh ref={projXY} position={[position[0], position[1], position[2] / 2]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
            <cylinderGeometry args={[0.07, 0.07, 1, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} />
          </mesh>
          <mesh ref={projZY} position={[position[0] / 2, position[1], position[2]]} rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
            <cylinderGeometry args={[0.07, 0.07, 1, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} />
          </mesh>
          <mesh ref={wallXY} position={[position[0], position[1], 0.05]} raycast={noRaycast}>
            <circleGeometry args={[radius * 0.85, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <mesh ref={wallZY} position={[0.05, position[1], position[2]]} rotation={[0, Math.PI / 2, 0]} raycast={noRaycast}>
            <circleGeometry args={[radius * 0.85, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
          </mesh>
        </>
      )}

      <group ref={group} position={position}>
        <mesh
          onPointerOver={(e) => {
            if (preview) return;
            e.stopPropagation();
            setHovered(true);
            onHover?.(m.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover?.(null);
            document.body.style.cursor = '';
          }}
          onClick={(e) => {
            if (preview) return;
            e.stopPropagation();
            onSelect(m.id);
          }}
        >
          <sphereGeometry args={[Math.max(radius, 2.4) * 1.2, 12, 12]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <mesh raycast={noRaycast}>
          <sphereGeometry args={[radius, 32, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.8 : hovered ? 0.58 : isDimmed ? 0.1 : 0.28}
            roughness={0.35}
            metalness={0.05}
            transparent={isDimmed}
            opacity={sphereOpacity}
          />
        </mesh>

        {isSelected && (
          <Billboard>
            <mesh raycast={noRaycast}>
              <torusGeometry args={[radius * 1.48, 0.13, 12, 64]} />
              <meshBasicMaterial color="#eef0f4" />
            </mesh>
          </Billboard>
        )}
        {isFrontier && !isSelected && !isDimmed && (
          <Billboard>
            <mesh ref={halo} raycast={noRaycast}>
              <torusGeometry args={[radius * 1.42, 0.1, 8, 48]} />
              <meshBasicMaterial color="#a99bff" transparent opacity={0.9} />
            </mesh>
          </Billboard>
        )}

        {(hovered || isSelected || (labelSlot ? labelSlot.visible : !isDimmed)) && (
          <Html center zIndexRange={hovered || isSelected ? [45, 30] : [20, 0]} style={{ pointerEvents: 'none' }} position={[0, 0, 0]}>
            <div
              className={`node-label${hovered || isSelected ? ' on' : ''}${isFrontier ? ' frontier' : ''}${preview ? ' preview' : ''}`}
              style={{
                transform: `translate(${labelSlot?.dx ?? 0}px, ${labelSlot?.dy ?? -20}px)`,
              }}
            >
              {m.short}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
