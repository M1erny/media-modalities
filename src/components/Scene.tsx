import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Billboard, Stars, Sparkles } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';
import { FAMILY_CONFIG, getParetoFrontier } from '../data/modalities';
import type { Modality } from '../data/modalities';
import { ModalityNode } from './ModalityNode';

export type CameraPreset = 'isometric' | 'xy' | 'zy' | 'xz' | 'frontier';

interface SceneProps {
  viewMode: 'biological' | 'economic';
  colorMode?: 'sensory' | 'family';
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  modalities: Modality[];
  cameraPreset?: CameraPreset;
  isAutoOrbiting?: boolean;
}

const getColorForSensory = (visual: number, auditory: number, physical: number): string => {
  // Pure channel dominance shortcuts for maximum punch
  if (visual >= 70 && auditory <= 15 && physical <= 15) return '#00f5ff'; // Pure Electric Cyan
  if (auditory >= 70 && visual <= 15 && physical <= 15) return '#ffb000'; // Pure Electric Gold/Amber
  if (physical >= 50 && auditory <= 20 && visual <= 30) return '#ff0055'; // Pure Electric Magenta

  // Chromatic angles in HSL color space:
  // Visual (Photons): 185° (Cyan)
  // Auditory (Acoustics): 42° (Amber/Gold)
  // Physical (Somatosensory): 325° (Magenta/Pink)
  const radVis = (185 * Math.PI) / 180;
  const radAud = (42 * Math.PI) / 180;
  const radPhy = (325 * Math.PI) / 180;

  // Amplify contrast with power weighting (1.5) so dominant sensory channels stand out crisply
  const wV = Math.pow(Math.max(0, visual), 1.5);
  const wA = Math.pow(Math.max(0, auditory), 1.5);
  const wP = Math.pow(Math.max(0, physical), 1.5);
  const sumW = wV + wA + wP || 1;

  const nV = wV / sumW;
  const nA = wA / sumW;
  const nP = wP / sumW;

  const x = nV * Math.cos(radVis) + nA * Math.cos(radAud) + nP * Math.cos(radPhy);
  const y = nV * Math.sin(radVis) + nA * Math.sin(radAud) + nP * Math.sin(radPhy);

  let angle = Math.atan2(y, x) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  // Maximum saturation (100%) and optimal lightness (54%) for eye-popping visibility
  const col = new THREE.Color();
  col.setHSL(angle / 360, 1.0, 0.54);
  return '#' + col.getHexString();
};

/* ── Smooth, Fluid Camera Controller with Auto-Orbit ───────── */
const CameraController: React.FC<{
  cameraPreset: CameraPreset;
  selectedNode: Modality | null;
  viewMode: 'biological' | 'economic';
  isAutoOrbiting: boolean;
}> = ({ cameraPreset, selectedNode, viewMode, isAutoOrbiting }) => {
  const controlsRef = useRef<OrbitControlsType>(null);
  const targetCamPos = useRef(new THREE.Vector3(140, 95, 140));
  const targetLookAt = useRef(new THREE.Vector3(50, 45, 50));
  const isTransitioning = useRef(false);

  useEffect(() => {
    isTransitioning.current = true;
    switch (cameraPreset) {
      case 'xy':
        targetCamPos.current.set(50, 50, 200);
        targetLookAt.current.set(50, 50, 0);
        break;
      case 'zy':
        targetCamPos.current.set(200, 50, 50);
        targetLookAt.current.set(0, 50, 50);
        break;
      case 'xz':
        targetCamPos.current.set(50, 200, 50);
        targetLookAt.current.set(50, 0, 50);
        break;
      case 'frontier':
        targetCamPos.current.set(115, 85, 155);
        targetLookAt.current.set(45, 55, 45);
        break;
      case 'isometric':
      default:
        targetCamPos.current.set(140, 95, 140);
        targetLookAt.current.set(50, 45, 50);
        break;
    }
  }, [cameraPreset]);

  useEffect(() => {
    if (selectedNode) {
      isTransitioning.current = true;
      const nodeX = viewMode === 'economic' ? selectedNode.financialMetrics.capex : selectedNode.cognitiveLoad;
      const nodeY = viewMode === 'economic' ? selectedNode.financialMetrics.attentionYield : selectedNode.systemicAgency;
      const nodeZ = viewMode === 'economic' ? selectedNode.financialMetrics.retentionMoat : selectedNode.sensoryUtilization;
      
      targetLookAt.current.set(nodeX, nodeY, nodeZ);
      targetCamPos.current.set(nodeX + 40, nodeY + 28, nodeZ + 40);
    }
  }, [selectedNode, viewMode]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onUserInteract = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', onUserInteract);
    return () => {
      controls.removeEventListener('start', onUserInteract);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioning.current) {
      const posDist = camera.position.distanceTo(targetCamPos.current);
      const targetDist = controlsRef.current.target.distanceTo(targetLookAt.current);

      if (posDist > 0.2 || targetDist > 0.2) {
        camera.position.lerp(targetCamPos.current, delta * 4.5);
        controlsRef.current.target.lerp(targetLookAt.current, delta * 4.5);
      } else {
        isTransitioning.current = false;
      }
    }

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.08}
      rotateSpeed={0.85}
      zoomSpeed={1.3}
      panSpeed={1.1}
      screenSpacePanning={true}
      minDistance={10}
      maxDistance={700}
      target={[50, 45, 50]}
      autoRotate={isAutoOrbiting}
      autoRotateSpeed={1.4}
    />
  );
};

/* ── Clean Minimalist Axes ───────────────────────────────────── */
const MinimalAxes: React.FC<{ viewMode: 'biological' | 'economic' }> = ({ viewMode }) => {
  const config = useMemo(() => {
    if (viewMode === 'economic') {
      return {
        xColor: '#f59e0b',
        yColor: '#10b981',
        zColor: '#06b6d4',
        xLabel: 'Supply Barrier (CapEx)',
        yLabel: 'Extraction Yield (Flow)',
        zLabel: 'Retention Moat (Stock)',
      };
    }
    return {
      xColor: '#ff5555',
      yColor: '#ff2a6d',
      zColor: '#5555ff',
      xLabel: 'Cognitive Load (Compute)',
      yLabel: 'Systemic Agency (Feedback)',
      zLabel: 'Sensory Bandwidth (Input)',
    };
  }, [viewMode]);

  return (
    <group>
      {/* X Axis */}
      <mesh position={[50, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 100]} />
        <meshBasicMaterial color={config.xColor} transparent opacity={0.7} />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.8, 2.5, 16]} />
        <meshBasicMaterial color={config.xColor} />
      </mesh>
      <Billboard position={[108, 0, 0]}>
        <Text color={config.xColor} fontSize={2.4} anchorX="center" anchorY="middle" fontWeight="bold">100</Text>
      </Billboard>
      <Billboard position={[50, -8, 0]}>
        <Text color={config.xColor} fontSize={3.2} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.xLabel}
        </Text>
      </Billboard>

      {/* Y Axis */}
      <mesh position={[0, 50, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 100]} />
        <meshBasicMaterial color={config.yColor} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 100, 0]}>
        <coneGeometry args={[0.8, 2.5, 16]} />
        <meshBasicMaterial color={config.yColor} />
      </mesh>
      <Billboard position={[0, 108, 0]}>
        <Text color={config.yColor} fontSize={2.4} anchorX="center" anchorY="middle" fontWeight="bold">100</Text>
      </Billboard>
      <Billboard position={[-14, 50, 0]}>
        <Text color={config.yColor} fontSize={3.2} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.yLabel}
        </Text>
      </Billboard>

      {/* Z Axis */}
      <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 100]} />
        <meshBasicMaterial color={config.zColor} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.8, 2.5, 16]} />
        <meshBasicMaterial color={config.zColor} />
      </mesh>
      <Billboard position={[0, 0, 108]}>
        <Text color={config.zColor} fontSize={2.4} anchorX="center" anchorY="middle" fontWeight="bold">100</Text>
      </Billboard>
      <Billboard position={[0, -8, 50]}>
        <Text color={config.zColor} fontSize={3.2} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.zLabel}
        </Text>
      </Billboard>
    </group>
  );
};

/* ── Minimal Ambient Drop Line ───────────────────────────────── */
const MinimalDropLine: React.FC<{ targetPos: [number, number, number]; isSelected: boolean }> = ({ targetPos, isSelected }) => {
  const lineRef = useRef<any>(null);
  const currentPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]));

  useFrame((_, delta) => {
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetPos[0], delta * 5);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetPos[1], delta * 5);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetPos[2], delta * 5);

    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array;
      positions[0] = currentPos.current.x;
      positions[1] = currentPos.current.y;
      positions[2] = currentPos.current.z;
      positions[3] = currentPos.current.x;
      positions[4] = 0;
      positions[5] = currentPos.current.z;
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const initialPoints = useMemo(() => {
    return new Float32Array([
      targetPos[0], targetPos[1], targetPos[2],
      targetPos[0], 0, targetPos[2]
    ]);
  }, []);

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[initialPoints, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={isSelected ? '#00f0ff' : '#ffffff'}
        transparent
        opacity={isSelected ? 0.4 : 0.04}
      />
    </line>
  );
};

/* ── Main Clean Scene ────────────────────────────────────────── */
export const Scene: React.FC<SceneProps> = ({
  viewMode,
  colorMode = 'sensory',
  selectedNodeId,
  onSelectNode,
  modalities,
  cameraPreset = 'isometric',
  isAutoOrbiting = false,
}) => {
  const selectedNode = useMemo(
    () => modalities.find(m => m.id === selectedNodeId) || null,
    [selectedNodeId, modalities]
  );

  // Dynamic Pareto Frontier calculation
  const frontierModalities = useMemo(
    () => getParetoFrontier(modalities, viewMode),
    [modalities, viewMode]
  );

  const frontierIds = useMemo(
    () => new Set(frontierModalities.map(m => m.id)),
    [frontierModalities]
  );

  // Dynamic Color Mapping based on active colorMode
  const colorMap = useMemo(() => {
    return Object.fromEntries(modalities.map((m) => {
      if (colorMode === 'family') {
        return [m.id, FAMILY_CONFIG[m.family].color];
      }
      return [
        m.id, 
        getColorForSensory(m.sensoryComposition.visual, m.sensoryComposition.auditory, m.sensoryComposition.physical)
      ];
    }));
  }, [modalities, colorMode]);

  const handleBackgroundClick = () => {
    onSelectNode(null);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [140, 95, 140], fov: 40 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
        onClick={handleBackgroundClick}
      >
        <color attach="background" args={['#020408']} />

        {/* Ambient Cosmic Shimmer & Starfield */}
        <Stars radius={300} depth={80} count={1600} factor={2.8} saturation={0.25} fade speed={0.4} />
        <Sparkles count={90} scale={[150, 150, 150]} size={2.0} speed={0.3} opacity={0.25} color="#00f0ff" />
        <Sparkles count={50} scale={[150, 150, 150]} size={1.8} speed={0.2} opacity={0.2} color="#ffb700" />

        {/* Studio 3-Point Lighting */}
        <ambientLight intensity={0.45} />
        <pointLight position={[100, 140, 100]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-60, 90, -60]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[90, -10, 90]} intensity={1.0} color="#ff0055" />
        <pointLight position={[50, 120, 50]} intensity={0.8} color="#ffb700" />
        <Environment preset="city" />

        <CameraController
          cameraPreset={cameraPreset}
          selectedNode={selectedNode}
          viewMode={viewMode}
          isAutoOrbiting={isAutoOrbiting}
        />

        <MinimalAxes viewMode={viewMode} />

        {/* Minimal Drop Lines */}
        <group>
          {modalities.map((m) => {
            const pos: [number, number, number] = viewMode === 'economic'
              ? [m.financialMetrics.capex, m.financialMetrics.attentionYield, m.financialMetrics.retentionMoat]
              : [m.cognitiveLoad, m.systemicAgency, m.sensoryUtilization];
            return (
              <MinimalDropLine
                key={m.id + '-drop'}
                targetPos={pos}
                isSelected={selectedNodeId === m.id}
              />
            );
          })}
        </group>

        {/* Luminous Floor Disc Reflection */}
        <mesh position={[50, -0.2, 50]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[75, 64]} />
          <meshBasicMaterial
            color={viewMode === 'economic' ? '#06b6d4' : '#6366f1'}
            transparent
            opacity={0.04}
            depthWrite={false}
          />
        </mesh>

        {/* Single Clean Floor Grid */}
        <Grid
          position={[50, 0, 50]}
          args={[100, 100]}
          cellSize={10}
          cellThickness={0.4}
          cellColor="#08101d"
          sectionSize={25}
          sectionThickness={0.8}
          sectionColor="#111e33"
          fadeDistance={280}
        />

        {/* 3D Bubble Data Nodes */}
        <group>
          {modalities.map((modality) => (
            <ModalityNode
              key={modality.id}
              modality={modality}
              viewMode={viewMode}
              isSelected={selectedNodeId === modality.id}
              isFrontier={frontierIds.has(modality.id)}
              onSelectNode={onSelectNode}
              color={colorMap[modality.id]}
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
};
