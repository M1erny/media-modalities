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
  const cVisual = new THREE.Color('#00f0ff');   // Cyan
  const cAuditory = new THREE.Color('#ffb700'); // Amber
  const cPhysical = new THREE.Color('#ff0055'); // Magenta

  const r = (cVisual.r * visual + cAuditory.r * auditory + cPhysical.r * physical) / 100;
  const g = (cVisual.g * visual + cAuditory.g * auditory + cPhysical.g * physical) / 100;
  const b = (cVisual.b * visual + cAuditory.b * auditory + cPhysical.b * physical) / 100;

  const finalColor = new THREE.Color(r, g, b);
  return '#' + finalColor.getHexString();
};

/* ── Smooth, Fluid Camera Controller (Non-Blocking OrbitControls) ── */
const CameraController: React.FC<{
  cameraPreset: CameraPreset;
  selectedNode: Modality | null;
  viewMode: 'biological' | 'economic';
}> = ({ cameraPreset, selectedNode, viewMode }) => {
  const controlsRef = useRef<OrbitControlsType>(null);
  const targetCamPos = useRef(new THREE.Vector3(140, 95, 140));
  const targetLookAt = useRef(new THREE.Vector3(50, 45, 50));
  const isTransitioning = useRef(false);

  // Set camera target positions on preset change
  useEffect(() => {
    isTransitioning.current = true;
    switch (cameraPreset) {
      case 'xy':
        targetCamPos.current.set(50, 50, 210);
        targetLookAt.current.set(50, 50, 0);
        break;
      case 'zy':
        targetCamPos.current.set(210, 50, 50);
        targetLookAt.current.set(0, 50, 50);
        break;
      case 'xz':
        targetCamPos.current.set(50, 210, 50);
        targetLookAt.current.set(50, 0, 50);
        break;
      case 'frontier':
        targetCamPos.current.set(110, 80, 160);
        targetLookAt.current.set(45, 55, 45);
        break;
      case 'isometric':
      default:
        targetCamPos.current.set(140, 95, 140);
        targetLookAt.current.set(50, 45, 50);
        break;
    }
  }, [cameraPreset]);

  // Adjust focus target on node selection
  useEffect(() => {
    if (selectedNode) {
      isTransitioning.current = true;
      const nodeX = viewMode === 'economic' ? selectedNode.financialMetrics.capex : selectedNode.cognitiveLoad;
      const nodeY = viewMode === 'economic' ? selectedNode.financialMetrics.attentionYield : selectedNode.systemicAgency;
      const nodeZ = viewMode === 'economic' ? selectedNode.financialMetrics.retentionMoat : selectedNode.sensoryUtilization;
      
      targetLookAt.current.set(nodeX, nodeY, nodeZ);

      // Position camera at a nice offset from the node
      targetCamPos.current.set(nodeX + 45, nodeY + 30, nodeZ + 45);
    }
  }, [selectedNode, viewMode]);

  // Handle user manual interaction to immediately cancel auto-transition
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onUserInteract = () => {
      // User is zooming, rotating, or panning — stop auto-lerping
      isTransitioning.current = false;
    };

    controls.addEventListener('start', onUserInteract);
    return () => {
      controls.removeEventListener('start', onUserInteract);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    if (!controlsRef.current) return;

    // ONLY lerp when an active programmatic transition is running
    if (isTransitioning.current) {
      const posDist = camera.position.distanceTo(targetCamPos.current);
      const targetDist = controlsRef.current.target.distanceTo(targetLookAt.current);

      if (posDist > 0.3 || targetDist > 0.3) {
        camera.position.lerp(targetCamPos.current, delta * 4.5);
        controlsRef.current.target.lerp(targetLookAt.current, delta * 4.5);
      } else {
        // Transition finished — release to full free user orbit control
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

/* ── Axis Ticks Component ────────────────────────────────────── */
const AxisTicks: React.FC<{ viewMode: 'biological' | 'economic' }> = ({ viewMode }) => {
  const ticks = [0, 25, 50, 75, 100];

  const colors = useMemo(() => {
    if (viewMode === 'economic') {
      return { x: '#f59e0b', y: '#10b981', z: '#06b6d4' };
    }
    return { x: '#ff5555', y: '#ff2a6d', z: '#5555ff' };
  }, [viewMode]);

  return (
    <group>
      {ticks.map((v) => (
        <React.Fragment key={`tick-${v}`}>
          {/* X axis ticks */}
          <Billboard position={[v, -4, 0]}>
            <Text color={colors.x} fontSize={2.4} anchorX="center" anchorY="middle">{v}</Text>
          </Billboard>
          {/* Y axis ticks */}
          <Billboard position={[-4, v, 0]}>
            <Text color={colors.y} fontSize={2.4} anchorX="center" anchorY="middle">{v}</Text>
          </Billboard>
          {/* Z axis ticks */}
          <Billboard position={[-4, 0, v]}>
            <Text color={colors.z} fontSize={2.4} anchorX="center" anchorY="middle">{v}</Text>
          </Billboard>
        </React.Fragment>
      ))}
    </group>
  );
};

/* ── 3D Coordinate Bounding Wireframe ────────────────────────── */
const CoordinateBoundingBox: React.FC = () => {
  const lines = useMemo(() => {
    // 12 edges of the 100x100x100 bounding cube
    const pts: [number, number, number][][] = [
      [[0, 100, 0], [100, 100, 0]],
      [[100, 100, 0], [100, 100, 100]],
      [[100, 100, 100], [0, 100, 100]],
      [[0, 100, 100], [0, 100, 0]],
      
      [[100, 0, 0], [100, 0, 100]],
      [[100, 0, 100], [0, 0, 100]],
      
      [[100, 0, 0], [100, 100, 0]],
      [[100, 0, 100], [100, 100, 100]],
      [[0, 0, 100], [0, 100, 100]],
    ];
    return pts;
  }, []);

  return (
    <group>
      {lines.map((edge, idx) => (
        <Line
          key={`box-edge-${idx}`}
          points={edge}
          color="#1f293d"
          lineWidth={1.0}
          transparent
          opacity={0.35}
        />
      ))}
    </group>
  );
};

/* ── 3D Axes with Directional Glow Cones ──────────────────────── */
const Axes: React.FC<{ viewMode: 'biological' | 'economic' }> = ({ viewMode }) => {
  const config = useMemo(() => {
    if (viewMode === 'economic') {
      return {
        xColor: '#f59e0b',
        yColor: '#10b981',
        zColor: '#06b6d4',
        xLabel: 'Production Cost (CapEx)',
        yLabel: 'Attention Yield (ROI)',
        zLabel: 'Retention Moat (LTV)',
      };
    }
    return {
      xColor: '#ff5555',
      yColor: '#ff2a6d',
      zColor: '#5555ff',
      xLabel: 'Cognitive Load',
      yLabel: 'Systemic Agency',
      zLabel: 'Sensory Utilization',
    };
  }, [viewMode]);

  return (
    <group>
      {/* ─── X Axis (horizontal) ─── */}
      <mesh position={[50, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 100]} />
        <meshBasicMaterial color={config.xColor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.9, 3.0, 16]} />
        <meshBasicMaterial color={config.xColor} />
      </mesh>
      <Billboard position={[109, 0, 0]}>
        <Text color={config.xColor} fontSize={2.8} anchorX="center" anchorY="middle" fontWeight="bold">High</Text>
      </Billboard>
      <Billboard position={[-8, 0, 0]}>
        <Text color={config.xColor} fontSize={2.5} anchorX="center" anchorY="middle">Low</Text>
      </Billboard>
      <Billboard position={[50, -12, 0]}>
        <Text color={config.xColor} fontSize={3.8} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.xLabel}
        </Text>
      </Billboard>

      {/* ─── Y Axis (vertical) ─── */}
      <mesh position={[0, 50, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 100]} />
        <meshBasicMaterial color={config.yColor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 100, 0]}>
        <coneGeometry args={[0.9, 3.0, 16]} />
        <meshBasicMaterial color={config.yColor} />
      </mesh>
      <Billboard position={[0, 109, 0]}>
        <Text color={config.yColor} fontSize={2.8} anchorX="center" anchorY="middle" fontWeight="bold">High</Text>
      </Billboard>
      <Billboard position={[0, -8, 0]}>
        <Text color={config.yColor} fontSize={2.5} anchorX="center" anchorY="middle">Low</Text>
      </Billboard>
      <Billboard position={[-18, 50, 0]}>
        <Text color={config.yColor} fontSize={3.8} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.yLabel}
        </Text>
      </Billboard>

      {/* ─── Z Axis (depth) ─── */}
      <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 100]} />
        <meshBasicMaterial color={config.zColor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.9, 3.0, 16]} />
        <meshBasicMaterial color={config.zColor} />
      </mesh>
      <Billboard position={[0, 0, 109]}>
        <Text color={config.zColor} fontSize={2.8} anchorX="center" anchorY="middle" fontWeight="bold">High</Text>
      </Billboard>
      <Billboard position={[0, 0, -8]}>
        <Text color={config.zColor} fontSize={2.5} anchorX="center" anchorY="middle">Low</Text>
      </Billboard>
      <Billboard position={[0, -12, 50]}>
        <Text color={config.zColor} fontSize={3.8} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.zLabel}
        </Text>
      </Billboard>
    </group>
  );
};

/* ── Smoothly Animating Drop Line Component ─────────────────── */
const DropLine: React.FC<{ targetPos: [number, number, number]; isSelected: boolean }> = ({ targetPos, isSelected }) => {
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
        opacity={isSelected ? 0.35 : 0.08}
      />
    </line>
  );
};

/* ── Efficient Frontier Line with Animated Pulse ────────────── */
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
    return curve.getPoints(60);
  }, [viewMode, modalities]);

  useFrame((state) => {
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset = -state.clock.getElapsedTime() * 0.8;
    }
  });

  const color = viewMode === 'economic' ? '#10b981' : '#00f0ff';
  const labelText = viewMode === 'economic' ? '⚡ Attention Yield Frontier' : '⚡ Optimal Perception Frontier';

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color={color}
        lineWidth={3.0}
        dashed
        dashScale={1.8}
        gapSize={1.2}
        transparent
        opacity={0.85}
      />
      {points.length > 0 && (
        <Billboard position={[points[points.length - 1].x, points[points.length - 1].y + 6, points[points.length - 1].z]}>
          <Text
            color={color}
            fontSize={2.4}
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

/* ── Main Scene ──────────────────────────────────────────── */
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
        <color attach="background" args={['#04060a']} />

        <Stars radius={350} depth={80} count={1800} factor={3.0} saturation={0.25} fade speed={0.4} />

        {/* Cinematic Multi-Angle Lighting */}
        <ambientLight intensity={0.45} />
        <pointLight position={[100, 140, 100]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-40, 90, -40]} intensity={1.4} color="#00f0ff" />
        <pointLight position={[90, -10, 90]} intensity={1.0} color="#ff0055" />
        <pointLight position={[50, 100, 50]} intensity={0.8} color="#ffb700" />
        <Environment preset="city" />

        <CameraController
          cameraPreset={cameraPreset}
          selectedNode={selectedNode}
          viewMode={viewMode}
        />

        <Axes viewMode={viewMode} />
        <AxisTicks viewMode={viewMode} />
        <CoordinateBoundingBox />
        
        {/* Drop lines */}
        <group>
          {modalities.map((m) => {
            const pos: [number, number, number] = viewMode === 'economic'
              ? [m.financialMetrics.capex, m.financialMetrics.attentionYield, m.financialMetrics.retentionMoat]
              : [m.cognitiveLoad, m.systemicAgency, m.sensoryUtilization];
            return (
              <DropLine
                key={m.id + '-drop'}
                targetPos={pos}
                isSelected={selectedNodeId === m.id}
              />
            );
          })}
        </group>

        <EfficientFrontier viewMode={viewMode} modalities={modalities} />

        {/* 3D High-Tech Grids */}
        <group>
          {/* Floor (XZ) */}
          <Grid
            position={[50, 0, 50]}
            args={[100, 100]}
            cellSize={10}
            cellThickness={0.5}
            cellColor="#0e1726"
            sectionSize={25}
            sectionThickness={1.0}
            sectionColor="#1e293b"
            fadeDistance={280}
          />
          {/* Back wall (XY) */}
          <Grid
            position={[50, 50, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[100, 100]}
            cellSize={10}
            cellThickness={0.4}
            cellColor="#0e1726"
            sectionSize={25}
            sectionThickness={0.8}
            sectionColor="#1e293b"
            fadeDistance={280}
          />
          {/* Side wall (YZ) */}
          <Grid
            position={[0, 50, 50]}
            rotation={[0, 0, Math.PI / 2]}
            args={[100, 100]}
            cellSize={10}
            cellThickness={0.4}
            cellColor="#0e1726"
            sectionSize={25}
            sectionThickness={0.8}
            sectionColor="#1e293b"
            fadeDistance={280}
          />
        </group>

        {/* Data nodes */}
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
