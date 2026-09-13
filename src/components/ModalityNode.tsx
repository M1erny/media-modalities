import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { FAMILY_CONFIG } from '../data/modalities';
import type { Modality } from '../data/modalities';

interface ModalityNodeProps {
  modality: Modality;
  viewMode: 'biological' | 'economic';
  isSelected: boolean;
  isFrontier?: boolean;
  onSelectNode: (id: string | null) => void;
  color: string;
}

const noRaycast = () => null;

export const ModalityNode: React.FC<ModalityNodeProps> = ({
  modality,
  viewMode,
  isSelected,
  isFrontier = false,
  onSelectNode,
  color,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const selectorRing1Ref = useRef<THREE.Mesh>(null);
  const selectorRing2Ref = useRef<THREE.Mesh>(null);
  const frontierHaloRef = useRef<THREE.Mesh>(null);
  const groundShadowRef = useRef<THREE.Mesh>(null);
  
  const [hovered, setHovered] = useState(false);
  
  const scaleRef = useRef(1);
  const glowScaleRef = useRef(1);

  // Compute node radius scaling based on TAM sizing
  const nodeRadius = useMemo(() => {
    switch (modality.financialMetrics.tamRating) {
      case 'Massive': return 2.5;
      case 'Large': return 2.2;
      case 'Medium': return 1.9;
      case 'Small': return 1.7;
      case 'Micro': return 1.5;
      default: return 1.8;
    }
  }, [modality.financialMetrics.tamRating]);

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

  const initialPos = useMemo(() => {
    return [...targetPos] as [number, number, number];
  }, []);

  const averageScore = useMemo(
    () => Math.round((modality.cognitiveLoad + modality.sensoryUtilization + modality.systemicAgency) / 3),
    [modality]
  );

  const economicScore = useMemo(
    () => Math.round((modality.financialMetrics.capex + modality.financialMetrics.attentionYield + modality.financialMetrics.retentionMoat) / 3),
    [modality]
  );

  useFrame((_, delta) => {
    const targetScale = isSelected ? 1.5 : (hovered ? 1.25 : 1.0);
    const targetGlow = isSelected ? 2.4 : (hovered ? 1.8 : 1.2);
    
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 8);
    glowScaleRef.current = THREE.MathUtils.lerp(glowScaleRef.current, targetGlow, delta * 6);
    
    if (sphereRef.current) sphereRef.current.scale.setScalar(scaleRef.current);
    if (shellRef.current) shellRef.current.scale.setScalar(scaleRef.current * 1.15);
    if (glowRef.current) glowRef.current.scale.setScalar(glowScaleRef.current);

    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPos[0], delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPos[1], delta * 5);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPos[2], delta * 5);
    }

    if (selectorRing1Ref.current) {
      selectorRing1Ref.current.rotation.x += delta * 1.8;
      selectorRing1Ref.current.rotation.y += delta * 2.2;
    }
    if (selectorRing2Ref.current) {
      selectorRing2Ref.current.rotation.y -= delta * 1.5;
      selectorRing2Ref.current.rotation.z += delta * 2.5;
    }

    // Slow rotation for frontier aura
    if (frontierHaloRef.current) {
      frontierHaloRef.current.rotation.z += delta * 0.8;
    }

    if (groundShadowRef.current && groupRef.current) {
      groundShadowRef.current.position.x = groupRef.current.position.x;
      groundShadowRef.current.position.z = groupRef.current.position.z;
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

  const familyConfig = FAMILY_CONFIG[modality.family];

  return (
    <>
      {/* Ground Projection Disc */}
      <mesh
        ref={groundShadowRef}
        position={[initialPos[0], 0.05, initialPos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={noRaycast}
      >
        <ringGeometry args={[0.4, isSelected ? 3.5 : 2.0, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.35 : (hovered ? 0.2 : 0.06)}
          depthWrite={false}
        />
      </mesh>

      <group ref={groupRef} position={initialPos}>
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[nodeRadius * 2.2, 12, 12]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* Dual Selector Rings (When Selected) */}
        {isSelected && (
          <>
            <mesh ref={selectorRing1Ref} raycast={noRaycast}>
              <torusGeometry args={[nodeRadius * 1.8, 0.08, 12, 48]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} />
            </mesh>
            <mesh ref={selectorRing2Ref} raycast={noRaycast}>
              <torusGeometry args={[nodeRadius * 2.1, 0.06, 12, 48]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
            </mesh>
          </>
        )}

        {/* Pulsing Frontier Aura Ring (For Non-Dominated Pareto Champions) */}
        {isFrontier && !isSelected && (
          <mesh ref={frontierHaloRef} raycast={noRaycast}>
            <torusGeometry args={[nodeRadius * 1.5, 0.05, 8, 36]} />
            <meshBasicMaterial
              color={viewMode === 'economic' ? '#10b981' : '#00f0ff'}
              transparent
              opacity={0.5}
            />
          </mesh>
        )}

        {/* Atmospheric Glow Shell */}
        <mesh ref={glowRef} raycast={noRaycast}>
          <sphereGeometry args={[nodeRadius * 1.4, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.4 : (hovered ? 0.25 : 0.08)}
            depthWrite={false}
          />
        </mesh>

        {/* Outer Translucent Glass Shell */}
        <mesh ref={shellRef} raycast={noRaycast}>
          <sphereGeometry args={[nodeRadius, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.8 : (hovered ? 0.5 : 0.15)}
            roughness={0.1}
            metalness={0.2}
            transmission={0.4}
            thickness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Inner Luminous Core Sphere */}
        <mesh ref={sphereRef} raycast={noRaycast}>
          <sphereGeometry args={[nodeRadius * 0.7, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2.5 : (hovered ? 1.8 : 0.8)}
            roughness={0.2}
            metalness={0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Tooltip on Hover (When Not Selected) */}
        <Html
          zIndexRange={[100, 0]}
          center
          style={{
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            opacity: hovered && !isSelected ? 1 : 0,
            transform: hovered && !isSelected 
              ? 'translate3d(-50%, -125%, 0) scale(1)' 
              : 'translate3d(-50%, -115%, 0) scale(0.95)',
          }}
        >
          <div className="glass-panel modality-tooltip">
            {/* Header: Ticker + Family Badge + Frontier Tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, fontFamily: 'monospace' }}>
                  ${modality.ticker}
                </span>
                <span style={{ 
                  fontSize: '9px', 
                  padding: '1px 6px', 
                  borderRadius: '4px', 
                  backgroundColor: familyConfig.color + '22', 
                  color: familyConfig.color, 
                  fontWeight: 700, 
                  border: `1px solid ${familyConfig.color}40`,
                }}>
                  {familyConfig.icon} {modality.family}
                </span>
              </div>

              {isFrontier && (
                <span style={{
                  fontSize: '8px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: viewMode === 'economic' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                  color: viewMode === 'economic' ? '#10b981' : '#00f0ff',
                  fontWeight: 800,
                  border: viewMode === 'economic' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(0, 240, 255, 0.4)',
                }}>
                  ⚡ FRONTIER
                </span>
              )}
            </div>
            
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>
              {modality.name}
            </h3>

            {/* Sensory Composition Mini-Bar */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: `${modality.sensoryComposition.visual}%`, backgroundColor: '#00f0ff' }} />
                <div style={{ width: `${modality.sensoryComposition.auditory}%`, backgroundColor: '#ffb700' }} />
                <div style={{ width: `${modality.sensoryComposition.physical}%`, backgroundColor: '#ff0055' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                <span>VIS:{modality.sensoryComposition.visual}%</span>
                <span>AUD:{modality.sensoryComposition.auditory}%</span>
                <span>PHY:{modality.sensoryComposition.physical}%</span>
              </div>
            </div>
            
            {viewMode === 'economic' ? (
              <>
                <div className="stat-row">
                  <span style={{ color: '#f59e0b' }}>Supply Barrier (CapEx)</span>
                  <span className="stat-value">{modality.financialMetrics.capex}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#10b981' }}>Extraction Yield (Flow)</span>
                  <span className="stat-value">{modality.financialMetrics.attentionYield}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#06b6d4' }}>Retention Moat (Stock)</span>
                  <span className="stat-value">{modality.financialMetrics.retentionMoat}</span>
                </div>
              </>
            ) : (
              <>
                <div className="stat-row">
                  <span style={{ color: '#ff5555' }}>Cognitive Load (Compute)</span>
                  <span className="stat-value">{modality.cognitiveLoad}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#ff2a6d' }}>Systemic Agency (Feedback)</span>
                  <span className="stat-value">{modality.systemicAgency}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#5555ff' }}>Sensory Bandwidth (Input)</span>
                  <span className="stat-value">{modality.sensoryUtilization}</span>
                </div>
              </>
            )}
            
            <div className="stat-divider" />
            <div className="stat-row stat-average">
              <span>{viewMode === 'economic' ? 'Mean Economic Index' : 'Mean Neural Index'}</span>
              <span className="stat-value highlight" style={{ color: color }}>
                {viewMode === 'economic' ? economicScore : averageScore}
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
            transition: 'opacity 0.2s ease',
            opacity: hovered || isSelected ? 0 : 0.8,
          }}
        >
          <div className="modality-label">
            <span style={{ fontSize: '9px', opacity: 0.6, marginRight: '3px', fontFamily: 'monospace' }}>${modality.ticker}</span>
            {modality.name.replace(/ \(.*\)/, '')}
          </div>
        </Html>
      </group>
    </>
  );
};
