import React, { useMemo, useState } from 'react';
import type { Modality, ModalityArchetype } from '../data/modalities';
import type { CameraPreset } from './Scene';

interface UIOverlayProps {
  viewMode: 'biological' | 'economic';
  setViewMode: (mode: 'biological' | 'economic') => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  modalities: Modality[];
  onUpdateModality: (updated: Modality) => void;
  onResetModality: (id: string) => void;
  onResetAllModalities: () => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
}

const getArchetypeColor = (archetype: ModalityArchetype): string => {
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

export const UIOverlay: React.FC<UIOverlayProps> = ({
  viewMode,
  setViewMode,
  selectedNodeId,
  onSelectNode,
  modalities,
  onUpdateModality,
  onResetModality,
  onResetAllModalities,
  cameraPreset,
  setCameraPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'VISUAL' | 'AUDITORY' | 'PHYSICAL' | 'HIGH_AGENCY'>('ALL');
  const [isUiCollapsed, setIsUiCollapsed] = useState(false);

  const selectedNode = useMemo(
    () => modalities.find(m => m.id === selectedNodeId) || null,
    [selectedNodeId, modalities]
  );

  const averageScore = useMemo(
    () => selectedNode ? Math.round((selectedNode.cognitiveLoad + selectedNode.sensoryUtilization + selectedNode.systemicAgency) / 3) : 0,
    [selectedNode]
  );

  // Portfolio-wide aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalTam = modalities.reduce((acc, m) => acc + m.financialMetrics.globalTamBillions, 0);
    const meanYield = Math.round(modalities.reduce((acc, m) => acc + m.financialMetrics.attentionYield, 0) / modalities.length);
    const meanMoat = Math.round(modalities.reduce((acc, m) => acc + m.financialMetrics.retentionMoat, 0) / modalities.length);
    const meanMindshare = Math.round(modalities.reduce((acc, m) => acc + (m.cognitiveLoad + m.systemicAgency + m.sensoryUtilization) / 3, 0) / modalities.length);

    return { totalTam, meanYield, meanMoat, meanMindshare };
  }, [modalities]);

  // Sorting state for the watchlist
  const [sortField, setSortField] = useState<'name' | 'attr1' | 'attr2' | 'attr3' | 'avg' | 'tam'>('avg');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleHeaderClick = (field: 'name' | 'attr1' | 'attr2' | 'attr3' | 'avg' | 'tam') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Filtered & Sorted watchlist
  const filteredWatchList = useMemo(() => {
    return modalities.filter((item) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) || 
        item.ticker.toLowerCase().includes(query) ||
        item.financialMetrics.archetype.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Filter chips
      if (activeFilter === 'VISUAL') return item.sensoryComposition.visual >= 50;
      if (activeFilter === 'AUDITORY') return item.sensoryComposition.auditory >= 40;
      if (activeFilter === 'PHYSICAL') return item.sensoryComposition.physical >= 30;
      if (activeFilter === 'HIGH_AGENCY') return item.systemicAgency >= 60;

      return true;
    });
  }, [modalities, searchQuery, activeFilter]);

  const sortedWatchList = useMemo(() => {
    const getSortValue = (item: Modality) => {
      switch (sortField) {
        case 'name':
          return item.name;
        case 'attr1':
          return viewMode === 'economic' ? item.financialMetrics.capex : item.cognitiveLoad;
        case 'attr2':
          return viewMode === 'economic' ? item.financialMetrics.attentionYield : item.systemicAgency;
        case 'attr3':
          return viewMode === 'economic' ? item.financialMetrics.retentionMoat : item.sensoryUtilization;
        case 'avg':
          return viewMode === 'economic'
            ? (item.financialMetrics.capex + item.financialMetrics.attentionYield + item.financialMetrics.retentionMoat) / 3
            : (item.cognitiveLoad + item.systemicAgency + item.sensoryUtilization) / 3;
        case 'tam':
          return item.financialMetrics.globalTamBillions;
        default:
          return 0;
      }
    };

    return [...filteredWatchList].sort((a, b) => {
      const valA = getSortValue(a);
      const valB = getSortValue(b);

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [filteredWatchList, sortField, sortDirection, viewMode]);

  const handleSliderChange = (key: string, val: number) => {
    if (!selectedNode) return;
    
    let updated: Modality;
    if (['capex', 'attentionYield', 'retentionMoat'].includes(key)) {
      updated = {
        ...selectedNode,
        financialMetrics: {
          ...selectedNode.financialMetrics,
          [key]: val
        }
      };
    } else {
      updated = {
        ...selectedNode,
        [key]: val
      };
    }
    onUpdateModality(updated);
  };

  const handleMetaChange = (key: string, val: any) => {
    if (!selectedNode) return;
    
    const updated: Modality = {
      ...selectedNode,
      financialMetrics: {
        ...selectedNode.financialMetrics,
        [key]: val
      }
    };
    onUpdateModality(updated);
  };

  const renderHeader = (
    label: string,
    field: 'name' | 'attr1' | 'attr2' | 'attr3' | 'avg' | 'tam',
    flexVal: string,
    alignment: 'left' | 'right',
    activeColor?: string
  ) => {
    const isActive = sortField === field;
    const isLeft = alignment === 'left';
    return (
      <div
        onClick={() => handleHeaderClick(field)}
        style={{
          flex: flexVal,
          textAlign: alignment,
          cursor: 'pointer',
          color: isActive ? (activeColor || '#ffffff') : '#64748b',
          display: 'flex',
          justifyContent: isLeft ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          gap: '3px',
          userSelect: 'none',
          transition: 'color 0.15s ease',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.06em',
        }}
        className="watchlist-header-col"
      >
        <span>{label}</span>
        {isActive && (
          <span style={{ fontSize: '8px', color: '#00f0ff', fontFamily: 'monospace' }}>
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        zIndex: 1,
      }}
    >
      {/* ─── TOP BAR HUD (Aggregate Metrics & Viewport Controls) ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', marginBottom: '14px' }}>
        
        {/* Left: Branding & Status Tag */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00f0ff', boxShadow: '0 0 8px #00f0ff' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
              ATTENTION TERMINAL
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>|</span>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
            <span>Market TAM: <strong style={{ color: '#00f0ff', fontFamily: 'monospace' }}>${aggregateMetrics.totalTam}B</strong></span>
            <span>Yield: <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{aggregateMetrics.meanYield}/100</strong></span>
            <span>Moat: <strong style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{aggregateMetrics.meanMoat}/100</strong></span>
          </div>
        </div>

        {/* Center: Camera Viewport Switcher Toolbar */}
        <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '6px 10px', backgroundColor: 'rgba(8, 12, 20, 0.85)' }}>
          <button
            onClick={() => setCameraPreset('isometric')}
            className={`hud-btn ${cameraPreset === 'isometric' ? 'active' : ''}`}
            title="3D Isometric Orbit View"
          >
            🌐 3D Orbit
          </button>
          <button
            onClick={() => setCameraPreset('xy')}
            className={`hud-btn ${cameraPreset === 'xy' ? 'active' : ''}`}
            title={viewMode === 'economic' ? 'Cost vs Yield (Front)' : 'Cognitive vs Agency (Front)'}
          >
            📐 {viewMode === 'economic' ? 'CapEx / Yield' : 'Load / Agency'}
          </button>
          <button
            onClick={() => setCameraPreset('zy')}
            className={`hud-btn ${cameraPreset === 'zy' ? 'active' : ''}`}
            title={viewMode === 'economic' ? 'Moat vs Yield (Side)' : 'Sensory vs Agency (Side)'}
          >
            📊 {viewMode === 'economic' ? 'Moat / Yield' : 'Sensory / Agency'}
          </button>
          <button
            onClick={() => setCameraPreset('xz')}
            className={`hud-btn ${cameraPreset === 'xz' ? 'active' : ''}`}
            title="Top-Down Ground Projection View"
          >
            🗺️ Top-Down
          </button>
          <button
            onClick={() => setCameraPreset('frontier')}
            className={`hud-btn ${cameraPreset === 'frontier' ? 'active' : ''}`}
            title="Efficient Frontier Alignment"
          >
            ⚡ Frontier
          </button>
        </div>

        {/* Right: UI Visibility Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsUiCollapsed(prev => !prev)}
            className="glass-panel"
            style={{
              padding: '10px 16px',
              fontSize: '11px',
              fontWeight: 700,
              color: isUiCollapsed ? '#00f0ff' : '#94a3b8',
              cursor: 'pointer',
              border: isUiCollapsed ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s',
            }}
          >
            {isUiCollapsed ? '👁️ SHOW HUD' : '✕ HIDE HUD'}
          </button>
        </div>
      </div>

      {/* ─── MAIN PANELS LAYER (Collapsible) ─── */}
      {!isUiCollapsed && (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1, gap: '20px', minHeight: 0 }}>
          
          {/* ─── LEFT COLUMN: Model Controls & Dynamic Legend ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '380px', pointerEvents: 'auto', maxHeight: '100%', overflowY: 'auto' }} className="custom-scrollbar">
            
            {/* Header / Intro Card */}
            <div className="glass-panel" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', backgroundColor: 'rgba(0, 240, 255, 0.12)', color: '#00f0ff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  HEDGE FUND MATRIX
                </span>
                <span style={{ fontSize: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#9ca3af', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  v3.0 CYBER
                </span>
              </div>
              <h1
                style={{
                  fontSize: '20px',
                  marginBottom: '6px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Attention Portfolio Mapper
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.55 }}>
                Quantitative 3D positioning framework mapping 25 media formats as financial attention assets. Explore pareto efficiency, pricing power, and neural bandwidth.
              </p>
            </div>

            {/* Model Projection Selector */}
            <div className="glass-panel" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '10px' }}>
                SELECT MATHEMATICAL PROJECTION
              </div>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0, 0, 0, 0.35)', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setViewMode('biological')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    backgroundColor: viewMode === 'biological' ? '#1e293b' : 'transparent',
                    color: viewMode === 'biological' ? '#38bdf8' : '#64748b',
                    boxShadow: viewMode === 'biological' ? '0 2px 8px rgba(56, 189, 248, 0.2)' : 'none',
                  }}
                >
                  🧠 Biological Loop
                </button>
                <button
                  onClick={() => setViewMode('economic')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    backgroundColor: viewMode === 'economic' ? '#1e293b' : 'transparent',
                    color: viewMode === 'economic' ? '#10b981' : '#64748b',
                    boxShadow: viewMode === 'economic' ? '0 2px 8px rgba(16, 185, 129, 0.2)' : 'none',
                  }}
                >
                  💰 Economic Asset
                </button>
              </div>
            </div>

            {/* Dynamic MECE Axis Legend */}
            <div className="glass-panel" style={{ padding: '16px 20px' }}>
              {viewMode === 'economic' ? (
                <>
                  <div style={{ fontSize: '11px', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    AXIS GUIDE (ECONOMIC ASSET)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>X: Production Cost (CapEx)</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                        Supply-side capital & technological barrier to build/maintain the medium.
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Y: Attention Yield (ROI)</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                        Conversion velocity and attention monetizability per minute of consumption.
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4', boxShadow: '0 0 6px #06b6d4' }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Z: Retention Moat (LTV)</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                        Network defensibility, switching costs, and customer lifetime value.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '11px', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    AXIS GUIDE (BIOLOGICAL NEURAL LOOP)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5555', boxShadow: '0 0 6px #ff5555' }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>X: Cognitive Load</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                        Central processing throughput: working memory, focus & semantic compute.
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff2a6d', boxShadow: '0 0 6px #ff2a6d' }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Y: Systemic Agency</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                        Motor output control: active decision-making authority onto the medium.
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5555ff', boxShadow: '0 0 6px #5555ff' }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Z: Sensory Utilization</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                        Perceptual input bandwidth: physical channels engaged (ceiling = physical reality).
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
              
              {/* Sensory Composition Color Spectrum */}
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                NODE COLOR INDEX (SENSORY RATIO)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00f0ff', boxShadow: '0 0 6px #00f0ff' }} />
                  <span style={{ color: '#cbd5e1' }}>Visual Focus</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffb700', boxShadow: '0 0 6px #ffb700' }} />
                  <span style={{ color: '#cbd5e1' }}>Audio Focus</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff0055', boxShadow: '0 0 6px #ff0055' }} />
                  <span style={{ color: '#cbd5e1' }}>Physical Focus</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00f0ff, #ffb700, #ff0055)',
                    }}
                  />
                  <span style={{ color: '#cbd5e1' }}>Mixed Blend</span>
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={onResetAllModalities}
                  className="reset-btn"
                  title="Reset all modalities back to baseline parameters"
                >
                  ↺ Reset All Modalities to Default
                </button>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Watchlist Matrix or Modality Inspector ─── */}
          <div style={{ width: '450px', display: 'flex', flexDirection: 'column', height: '100%', pointerEvents: 'auto' }}>
            {selectedNode ? (
              /* Detailed Modality Equity Research Inspector */
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '22px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        ${selectedNode.ticker}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: getArchetypeColor(selectedNode.financialMetrics.archetype) + '22',
                        color: getArchetypeColor(selectedNode.financialMetrics.archetype),
                        border: `1px solid ${getArchetypeColor(selectedNode.financialMetrics.archetype)}44`,
                      }}>
                        {selectedNode.financialMetrics.archetype}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
                      {selectedNode.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => onSelectNode(null)}
                    style={{
                      border: 'none',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#94a3b8',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable Report Content & Sliders */}
                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                  
                  {/* Sensory Composition Profile Stack Bar */}
                  <div style={{ marginBottom: '16px', backgroundColor: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>SENSORY CHANNELS RATIO</span>
                      <span style={{ fontSize: '10px', color: '#00f0ff', fontFamily: 'monospace' }}>
                        ${selectedNode.financialMetrics.globalTamBillions}B TAM ({selectedNode.financialMetrics.tamRating})
                      </span>
                    </div>
                    <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: `${selectedNode.sensoryComposition.visual}%`, backgroundColor: '#00f0ff' }} title={`Visual: ${selectedNode.sensoryComposition.visual}%`} />
                      <div style={{ width: `${selectedNode.sensoryComposition.auditory}%`, backgroundColor: '#ffb700' }} title={`Auditory: ${selectedNode.sensoryComposition.auditory}%`} />
                      <div style={{ width: `${selectedNode.sensoryComposition.physical}%`, backgroundColor: '#ff0055' }} title={`Physical: ${selectedNode.sensoryComposition.physical}%`} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace' }}>
                      <span style={{ color: '#00f0ff' }}>VIS: {selectedNode.sensoryComposition.visual}%</span>
                      <span style={{ color: '#ffb700' }}>AUD: {selectedNode.sensoryComposition.auditory}%</span>
                      <span style={{ color: '#ff0055' }}>PHY: {selectedNode.sensoryComposition.physical}%</span>
                    </div>
                  </div>

                  {/* Parameter Adjustments (Dynamic Sliders) */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                      <h4 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                        Real-Time Parameter Calibration
                      </h4>
                      <button
                        onClick={() => onResetModality(selectedNode.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#00f0ff',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          padding: '2px 6px',
                        }}
                      >
                        Reset Node
                      </button>
                    </div>
                    
                    {/* Economic Parameters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                        ECONOMIC DIMENSIONS (SUPPLY / FLOW / MOAT)
                      </div>
                      
                      {/* CapEx */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Production Cost (CapEx):</span>
                          <strong style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{selectedNode.financialMetrics.capex} / 100</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedNode.financialMetrics.capex}
                          onChange={(e) => handleSliderChange('capex', parseInt(e.target.value))}
                          className="analyst-slider slider-capex"
                        />
                      </div>

                      {/* Attention Yield */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Attention Yield (ROI):</span>
                          <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{selectedNode.financialMetrics.attentionYield} / 100</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedNode.financialMetrics.attentionYield}
                          onChange={(e) => handleSliderChange('attentionYield', parseInt(e.target.value))}
                          className="analyst-slider slider-yield"
                        />
                      </div>

                      {/* Retention Moat */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Retention Moat (LTV):</span>
                          <strong style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{selectedNode.financialMetrics.retentionMoat} / 100</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedNode.financialMetrics.retentionMoat}
                          onChange={(e) => handleSliderChange('retentionMoat', parseInt(e.target.value))}
                          className="analyst-slider slider-moat"
                        />
                      </div>
                    </div>

                    {/* Biological Parameters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>BIOLOGICAL DIMENSIONS</span>
                        <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>Mindshare: {averageScore}/100</span>
                      </div>

                      {/* Cognitive Load */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Cognitive Load:</span>
                          <strong style={{ color: '#ff5555', fontFamily: 'monospace' }}>{selectedNode.cognitiveLoad} / 100</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedNode.cognitiveLoad}
                          onChange={(e) => handleSliderChange('cognitiveLoad', parseInt(e.target.value))}
                          className="analyst-slider slider-cog"
                        />
                      </div>

                      {/* Systemic Agency */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Systemic Agency:</span>
                          <strong style={{ color: '#ff2a6d', fontFamily: 'monospace' }}>{selectedNode.systemicAgency} / 100</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedNode.systemicAgency}
                          onChange={(e) => handleSliderChange('systemicAgency', parseInt(e.target.value))}
                          className="analyst-slider slider-agency"
                        />
                      </div>

                      {/* Sensory Utilization */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Sensory Utilization:</span>
                          <strong style={{ color: '#5555ff', fontFamily: 'monospace' }}>{selectedNode.sensoryUtilization} / 100</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedNode.sensoryUtilization}
                          onChange={(e) => handleSliderChange('sensoryUtilization', parseInt(e.target.value))}
                          className="analyst-slider slider-sensory"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thesis Section */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                      Investment Thesis (Editable)
                    </h4>
                    <textarea
                      value={selectedNode.financialMetrics.thesis}
                      onChange={(e) => handleMetaChange('thesis', e.target.value)}
                      className="analyst-textarea custom-scrollbar"
                      rows={3}
                      placeholder="Enter investment thesis..."
                    />
                  </div>

                  {/* Risks Section */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                      Risk & Friction Vectors (Editable)
                    </h4>
                    <textarea
                      value={selectedNode.financialMetrics.risks}
                      onChange={(e) => handleMetaChange('risks', e.target.value)}
                      className="analyst-textarea custom-scrollbar"
                      rows={3}
                      placeholder="Enter risk factors..."
                    />
                  </div>

                </div>
              </div>
            ) : (
              /* Bloomberg Terminal-style Watchlist Matrix */
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '18px 20px', overflow: 'hidden' }}>
                
                {/* Header & Instant Search */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.02em', color: '#ffffff' }}>
                      ATTENTION ASSET WATCHLIST
                    </h2>
                    <span style={{ fontSize: '10px', color: '#00f0ff', fontFamily: 'monospace', fontWeight: 700 }}>
                      {sortedWatchList.length} / {modalities.length} ASSETS
                    </span>
                  </div>

                  {/* Search Input */}
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ticker, name, or archetype..."
                      className="search-input"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Chips */}
                  <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }} className="custom-scrollbar">
                    <button
                      onClick={() => setActiveFilter('ALL')}
                      className={`filter-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
                    >
                      All (25)
                    </button>
                    <button
                      onClick={() => setActiveFilter('VISUAL')}
                      className={`filter-chip ${activeFilter === 'VISUAL' ? 'active' : ''}`}
                    >
                      👁️ Visual
                    </button>
                    <button
                      onClick={() => setActiveFilter('AUDITORY')}
                      className={`filter-chip ${activeFilter === 'AUDITORY' ? 'active' : ''}`}
                    >
                      🎧 Audio
                    </button>
                    <button
                      onClick={() => setActiveFilter('PHYSICAL')}
                      className={`filter-chip ${activeFilter === 'PHYSICAL' ? 'active' : ''}`}
                    >
                      🖐️ Physical
                    </button>
                    <button
                      onClick={() => setActiveFilter('HIGH_AGENCY')}
                      className={`filter-chip ${activeFilter === 'HIGH_AGENCY' ? 'active' : ''}`}
                    >
                      🎮 High Agency
                    </button>
                  </div>
                </div>

                {/* List Headers */}
                <div
                  style={{
                    display: 'flex',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '6px',
                  }}
                >
                  {renderHeader('TICKER / FORMAT', 'name', '1.5', 'left', '#e2e8f0')}
                  {renderHeader(viewMode === 'economic' ? 'CAPEX' : 'LOAD', 'attr1', '0.7', 'right', viewMode === 'economic' ? '#f59e0b' : '#ff5555')}
                  {renderHeader(viewMode === 'economic' ? 'YIELD' : 'AGENCY', 'attr2', '0.7', 'right', viewMode === 'economic' ? '#10b981' : '#ff2a6d')}
                  {renderHeader(viewMode === 'economic' ? 'MOAT' : 'SENSORY', 'attr3', '0.7', 'right', viewMode === 'economic' ? '#06b6d4' : '#5555ff')}
                  {renderHeader('AVG', 'avg', '0.6', 'right', '#a855f7')}
                </div>

                {/* Scrollable List Table */}
                <div style={{ flexGrow: 1, overflowY: 'auto' }} className="custom-scrollbar">
                  {sortedWatchList.map((item) => {
                    const avgVal = Math.round(
                      viewMode === 'economic'
                        ? (item.financialMetrics.capex + item.financialMetrics.attentionYield + item.financialMetrics.retentionMoat) / 3
                        : (item.cognitiveLoad + item.systemicAgency + item.sensoryUtilization) / 3
                    );
                    const archetypeCol = getArchetypeColor(item.financialMetrics.archetype);

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectNode(item.id)}
                        className="watchlist-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '7px 4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                          transition: 'all 0.15s ease',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ flex: '1.5', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '6px' }}>
                          <span style={{ fontSize: '10px', color: archetypeCol, marginRight: '5px', fontFamily: 'monospace', fontWeight: 700 }}>
                            ${item.ticker}
                          </span>
                          <span style={{ color: '#e2e8f0' }}>{item.name.replace(/ \(.*\)/, '')}</span>
                        </div>
                        <div style={{ flex: '0.7', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#f59e0b' : '#ff5555', fontWeight: 600 }}>
                          {viewMode === 'economic' ? item.financialMetrics.capex : item.cognitiveLoad}
                        </div>
                        <div style={{ flex: '0.7', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#10b981' : '#ff2a6d', fontWeight: 600 }}>
                          {viewMode === 'economic' ? item.financialMetrics.attentionYield : item.systemicAgency}
                        </div>
                        <div style={{ flex: '0.7', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#06b6d4' : '#5555ff', fontWeight: 600 }}>
                          {viewMode === 'economic' ? item.financialMetrics.retentionMoat : item.sensoryUtilization}
                        </div>
                        <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: '#c084fc', fontWeight: 800 }}>
                          {avgVal}
                        </div>
                      </div>
                    );
                  })}

                  {sortedWatchList.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '12px' }}>
                      No media modalities match your filter.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
