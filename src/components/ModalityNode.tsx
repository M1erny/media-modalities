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

const getArchetypeColor = (archetype: string): string => {
  switch (archetype) {
    case 'Algorithmic Attention Sink': return '#00f0ff';
    case 'High-Agency Sandbox': return '#ff0055';
    case 'Deep Focus Moat': return '#a855f7';
    case 'Physical Reality Immersion': return '#10b981';
    case 'High-CapEx Spectacle': return '#f59e0b';
    case 'Ambient Stream': return '#38bdf8';
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
  const shellRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const selectorRing1Ref = useRef<THREE.Mesh>(null);
  const selectorRing2Ref = useRef<THREE.Mesh>(null);
  const groundShadowRef = useRef<THREE.Mesh>(null);
  
  const [hovered, setHovered] = useState(false);
  
  const scaleRef = useRef(1);
  const glowScaleRef = useRef(1);

  // Compute node radius scaling based on TAM sizing
  const nodeRadius = useMemo(() => {
    switch (modality.financialMetrics.tamRating) {
      case 'Massive': return 2.6;
      case 'Large': return 2.3;
      case 'Medium': return 2.0;
      case 'Small': return 1.8;
      case 'Micro': return 1.6;
      default: return 2.0;
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

  // Set initial position once
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

  // Smooth animation every frame
  useFrame((_, delta) => {
    // Lerp scale
    const targetScale = isSelected ? 1.6 : (hovered ? 1.3 : 1.0);
    const targetGlow = isSelected ? 2.6 : (hovered ? 2.0 : 1.3);
    
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 8);
    glowScaleRef.current = THREE.MathUtils.lerp(glowScaleRef.current, targetGlow, delta * 6);
    
    if (sphereRef.current) sphereRef.current.scale.setScalar(scaleRef.current);
    if (shellRef.current) shellRef.current.scale.setScalar(scaleRef.current * 1.15);
    if (glowRef.current) glowRef.current.scale.setScalar(glowScaleRef.current);

    // Lerp position
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPos[0], delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPos[1], delta * 5);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPos[2], delta * 5);
    }

    // Spin dual selection rings when selected
    if (selectorRing1Ref.current) {
      selectorRing1Ref.current.rotation.x += delta * 1.8;
      selectorRing1Ref.current.rotation.y += delta * 2.2;
    }
    if (selectorRing2Ref.current) {
      selectorRing2Ref.current.rotation.y -= delta * 1.5;
      selectorRing2Ref.current.rotation.z += delta * 2.5;
    }

    // Update ground shadow location
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

  const archetypeColor = getArchetypeColor(modality.financialMetrics.archetype);

  return (
    <>
      {/* Ground Projection Disc (at Y=0) */}
      <mesh
        ref={groundShadowRef}
        position={[initialPos[0], 0.05, initialPos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={noRaycast}
      >
        <ringGeometry args={[0.5, isSelected ? 4.0 : 2.5, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.35 : (hovered ? 0.25 : 0.08)}
          depthWrite={false}
        />
      </mesh>

      <group ref={groupRef} position={initialPos}>
        {/* Invisible enlarged hitbox for smooth hovering */}
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[nodeRadius * 2.2, 12, 12]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* Dual Holographic Selector Rings */}
        {isSelected && (
          <>
            <mesh ref={selectorRing1Ref} raycast={noRaycast}>
              <torusGeometry args={[nodeRadius * 1.9, 0.1, 12, 48]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} />
            </mesh>
            <mesh ref={selectorRing2Ref} raycast={noRaycast}>
              <torusGeometry args={[nodeRadius * 2.2, 0.08, 12, 48]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
            </mesh>
          </>
        )}

        {/* Atmospheric Glow Shell */}
        <mesh ref={glowRef} raycast={noRaycast}>
          <sphereGeometry args={[nodeRadius * 1.5, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.45 : (hovered ? 0.3 : 0.1)}
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

        {/* Tooltip — High-Tech Glass HUD */}
        <Html
          zIndexRange={[100, 0]}
          center
          style={{
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            opacity: hovered && !isSelected ? 1 : 0,
            transform: hovered && !isSelected 
              ? 'translate3d(-50%, -130%, 0) scale(1)' 
              : 'translate3d(-50%, -120%, 0) scale(0.92)',
          }}
        >
          <div className="glass-panel modality-tooltip">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                ${modality.ticker}
              </span>
              <span style={{ 
                fontSize: '9px', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                backgroundColor: archetypeColor + '20', 
                color: archetypeColor, 
                fontWeight: 700, 
                border: `1px solid ${archetypeColor}40`,
                letterSpacing: '0.02em',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {modality.financialMetrics.archetype}
              </span>
            </div>
            
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
              {modality.name}
            </h3>

            {/* Sensory Composition Mini-Bar */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: `${modality.sensoryComposition.visual}%`, backgroundColor: '#00f0ff' }} />
                <div style={{ width: `${modality.sensoryComposition.auditory}%`, backgroundColor: '#ffb700' }} />
                <div style={{ width: `${modality.sensoryComposition.physical}%`, backgroundColor: '#ff0055' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', fontFamily: 'monospace', marginTop: '3px' }}>
                <span>V:{modality.sensoryComposition.visual}%</span>
                <span>A:{modality.sensoryComposition.auditory}%</span>
                <span>P:{modality.sensoryComposition.physical}%</span>
              </div>
            </div>
            
            {viewMode === 'economic' ? (
              <>
                <div className="stat-row">
                  <span style={{ color: '#f59e0b' }}>Production Cost (CapEx)</span>
                  <span className="stat-value">{modality.financialMetrics.capex}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#10b981' }}>Attention Yield (ROI)</span>
                  <span className="stat-value">{modality.financialMetrics.attentionYield}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#06b6d4' }}>Retention Moat (LTV)</span>
                  <span className="stat-value">{modality.financialMetrics.retentionMoat}</span>
                </div>
              </>
            ) : (
              <>
                <div className="stat-row">
                  <span style={{ color: '#ff5555' }}>Cognitive Load</span>
                  <span className="stat-value">{modality.cognitiveLoad}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#ff2a6d' }}>Systemic Agency</span>
                  <span className="stat-value">{modality.systemicAgency}</span>
                </div>
                <div className="stat-row">
                  <span style={{ color: '#5555ff' }}>Sensory Utilization</span>
                  <span className="stat-value">{modality.sensoryUtilization}</span>
                </div>
              </>
            )}
            
            <div className="stat-divider" />
            <div className="stat-row stat-average">
              <span>{viewMode === 'economic' ? 'Mean Economic Score' : 'Mean Mindshare Score'}</span>
              <span className="stat-value highlight" style={{ color: color }}>
                {viewMode === 'economic' ? economicScore : averageScore}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
              <span>TAM Scale:</span>
              <strong style={{ color: '#e5e7eb' }}>${modality.financialMetrics.globalTamBillions}B USD ({modality.financialMetrics.tamRating})</strong>
            </div>
          </div>
        </Html>

        {/* Persistent Cyber Node Label */}
        <Html
          zIndexRange={[50, 0]}
          center
          style={{
            pointerEvents: 'none',
            transition: 'opacity 0.25s ease',
            opacity: hovered || isSelected ? 0 : 0.85,
          }}
        >
          <div className="modality-label">
            <span style={{ fontSize: '9px', opacity: 0.65, marginRight: '4px', fontFamily: 'monospace' }}>${modality.ticker}</span>
            {modality.name.replace(/ \(.*\)/, '')}
          </div>
        </Html>
      </group>
    </>
  );
};
