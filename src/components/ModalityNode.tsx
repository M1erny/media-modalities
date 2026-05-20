import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Modality } from '../data/modalities';

interface ModalityNodeProps {
  modality: Modality;
  viewMode: 'biological' | 'economic';
  isSelected: boolean;
  onSelectNode: (id: string | null) => void;
  color: string;
}

const noRaycast = () => null;

const getRecommendationColor = (rec: string): string => {
  switch (rec) {
    case 'STRONG BUY': return '#10b981';
    case 'BUY': return '#34d399';
    case 'HOLD': return '#fbbf24';
    case 'UNDERPERFORM': return '#f87171';
    case 'SHORT': return '#ef4444';
    default: return '#9ca3af';
  }
};

export const ModalityNode: React.FC<ModalityNodeProps> = ({
  modality,
  viewMode,
  isSelected,
  onSelectNode,
  color,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const selectorRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const scaleRef = useRef(1);
  const glowScaleRef = useRef(1);

  // Compute targets based on viewMode
  const targetPos = useMemo(() => {
    if (viewMode === 'economic') {
      return [
        modality.financialMetrics.capex,
        modality.financialMetrics.attentionYield,
        modality.financialMetrics.retentionMoat,
      ];
    }
    return [
      modality.cognitiveLoad,
      modality.systemicAgency,
      modality.sensoryUtilization,
    ];
  }, [viewMode, modality]);

  // Set initial position once
  const initialPos = useMemo(() => {
    return [...targetPos] as [number, number, number];
  }, []);

  const averageScore = useMemo(
    () => Math.round((modality.cognitiveLoad + modality.sensoryUtilization + modality.systemicAgency) / 3),
    [modality]
  );

  // Smooth animation every frame
  useFrame((_, delta) => {
    // Lerp scale
    const targetScale = isSelected ? 1.8 : (hovered ? 1.4 : 1.0);
    const targetGlow = isSelected ? 2.8 : (hovered ? 2.2 : 1.5);
    
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 8);
    glowScaleRef.current = THREE.MathUtils.lerp(glowScaleRef.current, targetGlow, delta * 6);
    
    if (sphereRef.current) sphereRef.current.scale.setScalar(scaleRef.current);
    if (glowRef.current) glowRef.current.scale.setScalar(glowScaleRef.current);

    // Lerp position
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPos[0], delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPos[1], delta * 5);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPos[2], delta * 5);
    }

    // Spin selection torus
    if (selectorRef.current) {
      selectorRef.current.rotation.x += delta * 1.5;
      selectorRef.current.rotation.y += delta * 2.0;
    }
  });

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onSelectNode(modality.id);
  }, [modality.id, onSelectNode]);

  const recColor = getRecommendationColor(modality.financialMetrics.recommendation);

  return (
    <group ref={groupRef} position={initialPos}>
      {/* Invisible hitbox — receives raycasts */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[4.5, 12, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Selector Ring (Spinning Torus when selected) */}
      {isSelected && (
        <mesh ref={selectorRef} raycast={noRaycast}>
          <torusGeometry args={[3.8, 0.15, 8, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Outer glow ring */}
      <mesh ref={glowRef} raycast={noRaycast}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.3 : (hovered ? 0.2 : 0.06)}
          depthWrite={false}
        />
      </mesh>

      {/* Visible sphere */}
      <mesh ref={sphereRef} raycast={noRaycast}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.6 : (hovered ? 1.2 : 0.35)}
          roughness={0.1}
          metalness={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Tooltip — showing biological or economic stats */}
      <Html
        zIndexRange={[100, 0]}
        center
        style={{
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          opacity: hovered && !isSelected ? 1 : 0,
          transform: hovered && !isSelected 
            ? 'translate3d(-50%, -125%, 0) scale(1)' 
            : 'translate3d(-50%, -115%, 0) scale(0.9)',
        }}
      >
        <div className="glass-panel modality-tooltip">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.05em' }}>
              ${modality.ticker}
            </span>
            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: recColor + '22', color: recColor, fontWeight: 700, border: `1px solid ${recColor}44` }}>
              {modality.financialMetrics.recommendation}
            </span>
          </div>
          
          <h3>{modality.name}</h3>
          
          {viewMode === 'economic' ? (
            <>
              <div className="stat-row">
                <span>💰 CapEx / Cost</span>
                <span className="stat-value">{modality.financialMetrics.capex}</span>
              </div>
              <div className="stat-row">
                <span>📈 Attention Yield</span>
                <span className="stat-value">{modality.financialMetrics.attentionYield}</span>
              </div>
              <div className="stat-row">
                <span>🛡 Retention Moat</span>
                <span className="stat-value">{modality.financialMetrics.retentionMoat}</span>
              </div>
            </>
          ) : (
            <>
              <div className="stat-row">
                <span>🧠 Cognitive Load</span>
                <span className="stat-value">{modality.cognitiveLoad}</span>
              </div>
              <div className="stat-row">
                <span>👁 Sensory Util.</span>
                <span className="stat-value">{modality.sensoryUtilization}</span>
              </div>
              <div className="stat-row">
                <span>🎮 Systemic Agency</span>
                <span className="stat-value">{modality.systemicAgency}</span>
              </div>
            </>
          )}
          
          <div className="stat-divider" />
          <div className="stat-row stat-average">
            <span>⌀ {viewMode === 'economic' ? 'Yield/Moat Score' : 'Biological Score'}</span>
            <span className="stat-value highlight" style={{ color: color }}>
              {viewMode === 'economic' 
                ? Math.round((modality.financialMetrics.attentionYield + modality.financialMetrics.retentionMoat) / 2)
                : averageScore}
            </span>
          </div>
        </div>
      </Html>

      {/* Persistent Node Label */}
      <Html
        zIndexRange={[50, 0]}
        center
        style={{
          pointerEvents: 'none',
          transition: 'opacity 0.25s ease',
          opacity: hovered || isSelected ? 0 : 0.8,
        }}
      >
        <div className="modality-label">
          <span style={{ fontSize: '9px', opacity: 0.65, marginRight: '4px' }}>${modality.ticker}</span>
          {modality.name}
        </div>
      </Html>
    </group>
  );
};
