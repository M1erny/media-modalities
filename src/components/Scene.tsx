import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Billboard, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Modality } from '../data/modalities';
import { ModalityNode } from './ModalityNode';

interface SceneProps {
  viewMode: 'biological' | 'economic';
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  modalities: Modality[];
}

const getColorForAgency = (agency: number): string => {
  const c1 = new THREE.Color('#45f3ff');
  const c2 = new THREE.Color('#ff2a6d');
  return '#' + c1.clone().lerp(c2, agency / 100).getHexString();
};

/* ── Axis Ticks component with dynamic colors ────────────────── */
const AxisTicks: React.FC<{ viewMode: 'biological' | 'economic' }> = ({ viewMode }) => {
  const ticks = [0, 25, 50, 75, 100];

  const colors = useMemo(() => {
    if (viewMode === 'economic') {
      return { x: '#f59e0b', y: '#10b981', z: '#06b6d4' };
    }
    return { x: '#ff8888', y: '#88ff88', z: '#8888ff' };
  }, [viewMode]);

  return (
    <group>
      {ticks.map((v) => (
        <React.Fragment key={`tick-${v}`}>
          {/* X axis ticks */}
          <Billboard position={[v, -4, 0]}>
            <Text color={colors.x} fontSize={2.2} anchorX="center" anchorY="middle">{v}</Text>
          </Billboard>
          {/* Y axis ticks */}
          <Billboard position={[-4, v, 0]}>
            <Text color={colors.y} fontSize={2.2} anchorX="center" anchorY="middle">{v}</Text>
          </Billboard>
          {/* Z axis ticks */}
          <Billboard position={[-4, 0, v]}>
            <Text color={colors.z} fontSize={2.2} anchorX="center" anchorY="middle">{v}</Text>
          </Billboard>
        </React.Fragment>
      ))}
    </group>
  );
};

/* ── 3D Axes with separated High / Low labels ───────────────── */
const Axes: React.FC<{ viewMode: 'biological' | 'economic' }> = ({ viewMode }) => {
  const axisOpacity = 0.6;

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
      yColor: '#55ff55',
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
        <cylinderGeometry args={[0.15, 0.15, 100]} />
        <meshBasicMaterial color={config.xColor} transparent opacity={axisOpacity} />
      </mesh>
      <mesh position={[100, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.8, 2.5, 12]} />
        <meshBasicMaterial color={config.xColor} />
      </mesh>
      <Billboard position={[108, 0, 0]}>
        <Text color={config.xColor} fontSize={2.5} anchorX="center" anchorY="middle">High</Text>
      </Billboard>
      <Billboard position={[-8, 0, 0]}>
        <Text color={config.xColor} fontSize={2.5} anchorX="center" anchorY="middle">Low</Text>
      </Billboard>
      <Billboard position={[50, -12, 0]}>
        <Text color={config.xColor} fontSize={3.5} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.xLabel}
        </Text>
      </Billboard>

      {/* ─── Y Axis (vertical) ─── */}
      <mesh position={[0, 50, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 100]} />
        <meshBasicMaterial color={config.yColor} transparent opacity={axisOpacity} />
      </mesh>
      <mesh position={[0, 100, 0]}>
        <coneGeometry args={[0.8, 2.5, 12]} />
        <meshBasicMaterial color={config.yColor} />
      </mesh>
      <Billboard position={[0, 108, 0]}>
        <Text color={config.yColor} fontSize={2.5} anchorX="center" anchorY="middle">High</Text>
      </Billboard>
      <Billboard position={[0, -8, 0]}>
        <Text color={config.yColor} fontSize={2.5} anchorX="center" anchorY="middle">Low</Text>
      </Billboard>
      <Billboard position={[-18, 50, 0]}>
        <Text color={config.yColor} fontSize={3.5} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.yLabel}
        </Text>
      </Billboard>

      {/* ─── Z Axis (depth) ─── */}
      <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 100]} />
        <meshBasicMaterial color={config.zColor} transparent opacity={axisOpacity} />
      </mesh>
      <mesh position={[0, 0, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.8, 2.5, 12]} />
        <meshBasicMaterial color={config.zColor} />
      </mesh>
      <Billboard position={[0, 0, 108]}>
        <Text color={config.zColor} fontSize={2.5} anchorX="center" anchorY="middle">High</Text>
      </Billboard>
      <Billboard position={[0, 0, -8]}>
        <Text color={config.zColor} fontSize={2.5} anchorX="center" anchorY="middle">Low</Text>
      </Billboard>
      <Billboard position={[0, -12, 50]}>
        <Text color={config.zColor} fontSize={3.5} anchorX="center" anchorY="middle" fontWeight="bold">
          {config.zLabel}
        </Text>
      </Billboard>
    </group>
  );
};

/* ── Smoothly animating Drop Line component ────────────────── */
const DropLine: React.FC<{ targetPos: [number, number, number] }> = ({ targetPos }) => {
  const lineRef = useRef<any>(null);
  const currentPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]));

  useFrame((_, delta) => {
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetPos[0], delta * 5);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetPos[1], delta * 5);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetPos[2], delta * 5);

    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array;
      // Start (node position)
      positions[0] = currentPos.current.x;
      positions[1] = currentPos.current.y;
      positions[2] = currentPos.current.z;
      // End (floor plane, Y=0)
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
      <lineBasicMaterial color="#ffffff" transparent opacity={0.06} />
    </line>
  );
};

interface DropLinesProps {
  viewMode: 'biological' | 'economic';
  modalities: Modality[];
}

const DropLines: React.FC<DropLinesProps> = ({ viewMode, modalities }) => {
  const targets = useMemo(() => {
    return modalities.map((m) => {
      const targetPos: [number, number, number] = viewMode === 'economic'
        ? [m.financialMetrics.capex, m.financialMetrics.attentionYield, m.financialMetrics.retentionMoat]
        : [m.cognitiveLoad, m.systemicAgency, m.sensoryUtilization];
      return { id: m.id, pos: targetPos };
    });
  }, [viewMode, modalities]);

  return (
    <group>
      {targets.map((t) => (
        <DropLine key={t.id + '-drop'} targetPos={t.pos} />
      ))}
    </group>
  );
};

/* ── Efficient Frontier Line ────────────────────────────────── */
interface EfficientFrontierProps {
  viewMode: 'biological' | 'economic';
  modalities: Modality[];
}

const EfficientFrontier: React.FC<EfficientFrontierProps> = ({ viewMode, modalities }) => {
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
      // Optimal assets sorted by capex: TikTok, Social Media, IRL Live Streaming, Podcasts, Grand Strategy, Gen AI
      rawPoints = [
        getNodePos('short_form_video', 'economic'),
        getNodePos('social_media', 'economic'),
        getNodePos('irl_streaming', 'economic'),
        getNodePos('podcasts', 'economic'),
        getNodePos('video_games_grand', 'economic'),
        getNodePos('gen_ai', 'economic'),
      ];
    } else {
      // Optimal attention path: TikTok, Social Media, IRL Live Streaming, TV Series, Open World Games, Tabletop RPGs
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

  const color = viewMode === 'economic' ? '#10b981' : '#06b6d4';
  const labelText = viewMode === 'economic' ? 'Attention Yield Frontier' : 'Optimal Attention Path';

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={2.5}
        dashed
        dashScale={2}
        gapSize={1}
      />
      {points.length > 0 && (
        <Billboard position={[points[points.length - 1].x, points[points.length - 1].y + 5, points[points.length - 1].z]}>
          <Text
            color={color}
            fontSize={2.0}
            anchorX="center"
            anchorY="middle"
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
}) => {
  const colorMap = useMemo(
    () => Object.fromEntries(modalities.map((m) => [m.id, getColorForAgency(m.systemicAgency)])),
    [modalities]
  );

  const handleBackgroundClick = () => {
    // Deselect if clicked on empty space
    onSelectNode(null);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [140, 90, 140], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        onClick={handleBackgroundClick}
      >
        <color attach="background" args={['#05070c']} />

        <Stars radius={300} depth={60} count={1200} factor={2.5} saturation={0.15} fade speed={0.3} />

        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[100, 120, 100]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-30, 80, -30]} intensity={1.0} color="#06b6d4" />
        <pointLight position={[80, -20, 80]} intensity={0.6} color="#ff2a6d" />
        <Environment preset="city" />

        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={40}
          maxDistance={350}
          target={[50, 45, 50]}
          rotateSpeed={0.5}
        />

        <Axes viewMode={viewMode} />
        <AxisTicks viewMode={viewMode} />
        <DropLines viewMode={viewMode} modalities={modalities} />
        <EfficientFrontier viewMode={viewMode} modalities={modalities} />

        {/* 3D Grids */}
        <group>
          {/* Floor (XZ) */}
          <Grid
            position={[50, 0, 50]}
            args={[100, 100]}
            cellSize={10}
            cellThickness={0.4}
            cellColor="#111827"
            sectionSize={25}
            sectionThickness={0.8}
            sectionColor="#1f2937"
            fadeDistance={250}
          />
          {/* Back wall (XY) */}
          <Grid
            position={[50, 50, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[100, 100]}
            cellSize={10}
            cellThickness={0.4}
            cellColor="#111827"
            sectionSize={25}
            sectionThickness={0.8}
            sectionColor="#1f2937"
            fadeDistance={250}
          />
          {/* Side wall (YZ) */}
          <Grid
            position={[0, 50, 50]}
            rotation={[0, 0, Math.PI / 2]}
            args={[100, 100]}
            cellSize={10}
            cellThickness={0.4}
            cellColor="#111827"
            sectionSize={25}
            sectionThickness={0.8}
            sectionColor="#1f2937"
            fadeDistance={250}
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
