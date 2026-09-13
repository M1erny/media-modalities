import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Billboard, Stars, Line } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';
import type { Modality } from '../data/modalities';
import { ModalityNode } from './ModalityNode';

export type CameraPreset = 'isometric' | 'xy' | 'zy' | 'xz' | 'frontier';

interface SceneProps {
  viewMode: 'biological' | 'economic';
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  modalities: Modality[];
  cameraPreset?: CameraPreset;
}

const getColorForSensory = (visual: number, auditory: number, physical: number): string => {
  const cVisual = new THREE.Color('#00f0ff');   // Cyan (Photons)
  const cAuditory = new THREE.Color('#ffb700'); // Amber (Acoustics)
  const cPhysical = new THREE.Color('#ff0055'); // Magenta (Somatosensory/Physical)

  const r = (cVisual.r * visual + cAuditory.r * auditory + cPhysical.r * physical) / 100;
  const g = (cVisual.g * visual + cAuditory.g * auditory + cPhysical.g * physical) / 100;
  const b = (cVisual.b * visual + cAuditory.b * auditory + cPhysical.b * physical) / 100;

  const finalColor = new THREE.Color(r, g, b);
  return '#' + finalColor.getHexString();
};

/* ── Smooth, Fluid Camera Controller (Non-Blocking) ────────── */
const CameraController: React.FC<{
  cameraPreset: CameraPreset;
  selectedNode: Modality | null;
  viewMode: 'biological' | 'economic';
}> = ({ cameraPreset, selectedNode, viewMode }) => {
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

/* ── Pareto Frontier Curve ───────────────────────────────────── */
interface EfficientFrontierProps {
  viewMode: 'biological' | 'economic';
  modalities: Modality[];
}

const EfficientFrontier: React.FC<EfficientFrontierProps> = ({ viewMode, modalities }) => {
  const lineRef = useRef<any>(null);

  const points = useMemo(() => {
    let rawPoints: THREE.Vector3[] = [];

    const getNodePos = (id: string, mode: 'biological' | 'economic'): THREE.Vector3 => {
      const node = modalities.find(n => n.id === id);
      if (!node) return new THREE.Vector3(0, 0, 0);
      if (mode === 'economic') {
        return new THREE.Vector3(node.financialMetrics.capex, node.financialMetrics.attentionYield, node.financialMetrics.retentionMoat);
      } else {
        return new THREE.Vector3(node.cognitiveLoad, node.systemicAgency, node.sensoryUtilization);
      }
    };

    if (viewMode === 'economic') {
      rawPoints = [
        getNodePos('short_form_video', 'economic'),
        getNodePos('social_media', 'economic'),
        getNodePos('irl_streaming', 'economic'),
        getNodePos('podcasts', 'economic'),
        getNodePos('video_games_grand', 'economic'),
        getNodePos('gen_ai', 'economic'),
      ];
    } else {
      rawPoints = [
        getNodePos('short_form_video', 'biological'),
        getNodePos('social_media', 'biological'),
        getNodePos('irl_streaming', 'biological'),
        getNodePos('tv_series', 'biological'),
        getNodePos('video_games_open', 'biological'),
        getNodePos('tabletop_rpgs', 'biological'),
      ];
    }

    const curve = new THREE.CatmullRomCurve3(rawPoints);
    return curve.getPoints(50);
  }, [viewMode, modalities]);

  useFrame((state) => {
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset = -state.clock.getElapsedTime() * 0.7;
    }
  });

  const color = viewMode === 'economic' ? '#10b981' : '#00f0ff';
  const labelText = viewMode === 'economic' ? 'Pareto Yield Frontier' : 'Optimal Perception Frontier';

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color={color}
        lineWidth={2.5}
        dashed
        dashScale={1.6}
        gapSize={1.2}
        transparent
        opacity={0.8}
      />
      {points.length > 0 && (
        <Billboard position={[points[points.length - 1].x, points[points.length - 1].y + 5, points[points.length - 1].z]}>
          <Text
            color={color}
            fontSize={2.2}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {labelText}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

/* ── Main Clean Scene ────────────────────────────────────────── */
export const Scene: React.FC<SceneProps> = ({
  viewMode,
  selectedNodeId,
  onSelectNode,
  modalities,
  cameraPreset = 'isometric',
}) => {
  const selectedNode = useMemo(
    () => modalities.find(m => m.id === selectedNodeId) || null,
    [selectedNodeId, modalities]
  );

  const colorMap = useMemo(
    () => Object.fromEntries(modalities.map((m) => [
      m.id, 
      getColorForSensory(m.sensoryComposition.visual, m.sensoryComposition.auditory, m.sensoryComposition.physical)
    ])),
    [modalities]
  );

  const handleBackgroundClick = () => {
    onSelectNode(null);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [140, 95, 140], fov: 42 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
        onClick={handleBackgroundClick}
      >
        <color attach="background" args={['#030508']} />

        <Stars radius={300} depth={60} count={1200} factor={2.5} saturation={0.2} fade speed={0.3} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[100, 140, 100]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-40, 90, -40]} intensity={1.2} color="#00f0ff" />
        <pointLight position={[90, -10, 90]} intensity={0.8} color="#ff0055" />
        <Environment preset="city" />

        <CameraController
          cameraPreset={cameraPreset}
          selectedNode={selectedNode}
          viewMode={viewMode}
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

        <EfficientFrontier viewMode={viewMode} modalities={modalities} />

        {/* Single Clean Floor Grid (XZ only — no cluttering side/back walls) */}
        <Grid
          position={[50, 0, 50]}
          args={[100, 100]}
          cellSize={10}
          cellThickness={0.4}
          cellColor="#0b1320"
          sectionSize={25}
          sectionThickness={0.8}
          sectionColor="#152338"
          fadeDistance={260}
        />

        {/* 3D Bubble Data Nodes */}
        <group>
          {modalities.map((modality) => (
            <ModalityNode
              key={modality.id}
              modality={modality}
              viewMode={viewMode}
              isSelected={selectedNodeId === modality.id}
              onSelectNode={onSelectNode}
              color={colorMap[modality.id]}
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
};
