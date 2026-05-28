import React, { useMemo, useState } from 'react';
import type { Modality } from '../data/modalities';

interface UIOverlayProps {
  viewMode: 'biological' | 'economic';
  setViewMode: (mode: 'biological' | 'economic') => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  modalities: Modality[];
  onUpdateModality: (updated: Modality) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  viewMode,
  setViewMode,
  selectedNodeId,
  onSelectNode,
  modalities,
  onUpdateModality,
}) => {
  const selectedNode = useMemo(
    () => modalities.find(m => m.id === selectedNodeId) || null,
    [selectedNodeId, modalities]
  );

  const averageScore = useMemo(
    () => selectedNode ? Math.round((selectedNode.cognitiveLoad + selectedNode.sensoryUtilization + selectedNode.systemicAgency) / 3) : 0,
    [selectedNode]
  );

  // Sorting state for the watchlist
  const [sortField, setSortField] = useState<'name' | 'attr1' | 'attr2' | 'attr3' | 'avg'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleHeaderClick = (field: 'name' | 'attr1' | 'attr2' | 'attr3' | 'avg') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  const renderHeader = (
    label: string,
    field: 'name' | 'attr1' | 'attr2' | 'attr3' | 'avg',
    alignment: 'left' | 'right',
    activeColor?: string
  ) => {
    const isActive = sortField === field;
    const isLeft = alignment === 'left';
    return (
      <div
        onClick={() => handleHeaderClick(field)}
        style={{
          flex: field === 'name' ? '1.6' : '0.8',
          textAlign: alignment,
          cursor: 'pointer',
          color: isActive ? (activeColor || '#ffffff') : '#4b5563',
          display: 'flex',
          justifyContent: isLeft ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          gap: '4px',
          userSelect: 'none',
          transition: 'color 0.15s ease',
        }}
        className="watchlist-header-col"
      >
        <span>{label}</span>
        {isActive && (
          <span style={{ fontSize: '9px', color: '#45f3ff', fontFamily: 'monospace' }}>
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    );
  };

  // Sorted watchlist for the Bloomberg panel
  const watchList = useMemo(() => {
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
        default:
          return 0;
      }
    };

    return [...modalities].sort((a, b) => {
      const valA = getSortValue(a);
      const valB = getSortValue(b);

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [modalities, sortField, sortDirection, viewMode]);

  const totalAssetCount = modalities.length;

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
        justifyContent: 'space-between',
        padding: '24px',
        zIndex: 1,
      }}
    >
      {/* ─── LEFT COLUMN: Title & Navigation ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '380px', pointerEvents: 'auto' }}>
        
        {/* Header Panel */}
        <header className="glass-panel" style={{ padding: '22px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(69, 243, 255, 0.15)', color: '#45f3ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>
              EQUITY RESEARCH
            </span>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#9ca3af', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              v2.1 (MUTABLE)
            </span>
          </div>
          
          <h1
            style={{
              fontSize: '22px',
              marginBottom: '6px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff, #9ca3af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Attention Portfolio Mapper
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6 }}>
            An interactive framework mapping media formats as financial assets competing in the global attention economy. Drag sliders to adjust model weights in real-time.
          </p>
        </header>

        {/* View Mode Toggle Panel */}
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '12px' }}>
            SELECT MODEL PROJECTION
          </div>
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('biological')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
                backgroundColor: viewMode === 'biological' ? '#1e293b' : 'transparent',
                color: viewMode === 'biological' ? '#38bdf8' : '#9ca3af',
              }}
            >
              🧠 Biological
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
                fontWeight: 600,
                transition: 'all 0.2s',
                backgroundColor: viewMode === 'economic' ? '#1e293b' : 'transparent',
                color: viewMode === 'economic' ? '#10b981' : '#9ca3af',
              }}
            >
              💰 Economic
            </button>
          </div>
        </div>

        {/* Dynamic Legend Panel */}
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          {viewMode === 'economic' ? (
            <>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                AXIS GUIDE (ECONOMIC PROJECTION)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <span style={{ color: '#e5e7eb', fontWeight: 600 }}>X: Production Cost (CapEx)</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                    Supply-side input barrier. Initial capital, technology, and operational complexity to build/supply the format.
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ color: '#e5e7eb', fontWeight: 600 }}>Y: Attention Yield (ROI)</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                    Throughput capture efficiency. Immediate attention conversion velocity and return rate per unit of exposure.
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                    <span style={{ color: '#e5e7eb', fontWeight: 600 }}>Z: Retention Moat (LTV)</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                    Output defensibility value. Switching costs, community network effects, and lifetime asset stickiness.
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />
              <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.4' }}>
                <strong style={{ color: '#8892b0' }}>MECE Framework:</strong> Mapped as a mutually exclusive and collectively exhaustive system of <span style={{ color: '#e5e7eb' }}>Input Cost</span> (X), <span style={{ color: '#e5e7eb' }}>Conversion Flow</span> (Y), and <span style={{ color: '#e5e7eb' }}>Defensible Moat Asset Value</span> (Z).
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                AXIS GUIDE (BIOLOGICAL PROJECTION)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5555' }} />
                    <span style={{ color: '#e5e7eb', fontWeight: 600 }}>X: Cognitive Load</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                    Central processing throughput. Mental effort, working memory, and semantic focus required by the brain.
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#55ff55' }} />
                    <span style={{ color: '#e5e7eb', fontWeight: 600 }}>Y: Systemic Agency</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                    Motor output control. The degree of user decision-making influence and feedback loops onto the medium.
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5555ff' }} />
                    <span style={{ color: '#e5e7eb', fontWeight: 600 }}>Z: Sensory Utilization</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '16px', marginTop: '2px', lineHeight: '1.4' }}>
                    Perceptual input bandwidth. Number and density of physical sensory channels engaged (ceiling = physical reality).
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />
              <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.4' }}>
                <strong style={{ color: '#8892b0' }}>Neural Loop (MECE):</strong> The biological axes exhaustively model the neural feedback loop: <span style={{ color: '#e5e7eb' }}>Sensory Input Bandwidth</span> (Z), <span style={{ color: '#e5e7eb' }}>Cognitive Compute Load</span> (X), and <span style={{ color: '#e5e7eb' }}>Agency Output Control</span> (Y).
              </div>
            </>
          )}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />
          
          <div style={{ fontSize: '11px', marginBottom: '8px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            NODE COLOR INDEX (SYSTEMIC AGENCY)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#45f3ff', fontWeight: 500 }}>Low Agency</span>
            <div
              style={{
                flexGrow: 1,
                height: '6px',
                borderRadius: '3px',
                background: 'linear-gradient(to right, #45f3ff, #a855f7, #ff2a6d)',
              }}
            />
            <span style={{ fontSize: '11px', color: '#ff2a6d', fontWeight: 500 }}>High Agency</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Equity Research Report / Watchlist ─── */}
      <div style={{ width: '420px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 48px)', pointerEvents: 'auto' }}>
        {selectedNode ? (
          /* Detailed Equity Research Report Editor */
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em' }}>
                  TICKER: ${selectedNode.ticker}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  {selectedNode.name}
                </h2>
              </div>
              <button
                onClick={() => onSelectNode(null)}
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#9ca3af',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                ✕
              </button>
            </div>


            {/* Scrollable Report Content & Sliders */}
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
              
              {/* Parameter Adjustments (Dynamic Sliders) */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '11px', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  Adjust Model Parameters
                </h4>
                
                {/* Economic Parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '2px' }}>
                    ECONOMIC MODEL METRICS
                  </div>
                  
                  {/* CapEx */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>Production Cost (CapEx):</span>
                      <strong style={{ color: '#f59e0b' }}>{selectedNode.financialMetrics.capex} / 100</strong>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>Attention Yield (ROI):</span>
                      <strong style={{ color: '#10b981' }}>{selectedNode.financialMetrics.attentionYield} / 100</strong>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>Retention Moat (LTV):</span>
                      <strong style={{ color: '#06b6d4' }}>{selectedNode.financialMetrics.retentionMoat} / 100</strong>
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

                  {/* TAM Rating */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '12px' }}>
                    <span style={{ color: '#9ca3af' }}>Target Addressable Market (TAM):</span>
                    <select
                      value={selectedNode.financialMetrics.tamRating}
                      onChange={(e) => handleMetaChange('tamRating', e.target.value)}
                      className="analyst-select"
                    >
                      <option value="Micro">Micro</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Massive">Massive</option>
                    </select>
                  </div>
                </div>

                {/* Biological Parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em' }}>BIOLOGICAL MODEL METRICS</span>
                    <span style={{ fontSize: '10px', color: '#45f3ff', fontWeight: 700 }}>Avg Mindshare: {averageScore}/100</span>
                  </div>

                  {/* Cognitive Load */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>Cognitive Load:</span>
                      <strong style={{ color: '#ff5555' }}>{selectedNode.cognitiveLoad} / 100</strong>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>Systemic Agency:</span>
                      <strong style={{ color: '#ff2a6d' }}>{selectedNode.systemicAgency} / 100</strong>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>Sensory Utilization:</span>
                      <strong style={{ color: '#5555ff' }}>{selectedNode.sensoryUtilization} / 100</strong>
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
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                  Investment Thesis (Editable)
                </h4>
                <textarea
                  value={selectedNode.financialMetrics.thesis}
                  onChange={(e) => handleMetaChange('thesis', e.target.value)}
                  className="analyst-textarea custom-scrollbar"
                  rows={4}
                  placeholder="Enter investment thesis..."
                />
              </div>

              {/* Risks Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                  Risk & Friction Vectors (Editable)
                </h4>
                <textarea
                  value={selectedNode.financialMetrics.risks}
                  onChange={(e) => handleMetaChange('risks', e.target.value)}
                  className="analyst-textarea custom-scrollbar"
                  rows={4}
                  placeholder="Enter risk factors..."
                />
              </div>

            </div>
          </div>
        ) : (
          /* Bloomberg Terminal-style Watchlist */
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', overflow: 'hidden' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
                  ATTENTION ASSET WATCHLIST
                </h2>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                  SEC_PORTFOLIO
                </span>
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '11px', color: '#6b7280' }}>
                <span>Total Tracked Assets: <strong style={{ color: '#e5e7eb' }}>{totalAssetCount}</strong></span>
              </div>
            </div>

            {/* List Headers */}
            <div
              style={{
                display: 'flex',
                fontSize: '10px',
                fontWeight: 700,
                color: '#4b5563',
                letterSpacing: '0.08em',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '6px',
              }}
            >
              {renderHeader('TICKER / FORMAT', 'name', 'left', '#e5e7eb')}
              {renderHeader(viewMode === 'economic' ? 'CAPEX' : 'LOAD', 'attr1', 'right', viewMode === 'economic' ? '#f59e0b' : '#ff5555')}
              {renderHeader(viewMode === 'economic' ? 'YIELD' : 'AGENCY', 'attr2', 'right', viewMode === 'economic' ? '#10b981' : '#ff2a6d')}
              {renderHeader(viewMode === 'economic' ? 'MOAT' : 'SENSORY', 'attr3', 'right', viewMode === 'economic' ? '#06b6d4' : '#5555ff')}
              {renderHeader('AVG', 'avg', 'right', '#a855f7')}
            </div>

            {/* Scrollable List */}
            <div style={{ flexGrow: 1, overflowY: 'auto' }} className="custom-scrollbar">
              {watchList.map((item) => {
                const avgVal = Math.round(
                  viewMode === 'economic'
                    ? (item.financialMetrics.capex + item.financialMetrics.attentionYield + item.financialMetrics.retentionMoat) / 3
                    : (item.cognitiveLoad + item.systemicAgency + item.sensoryUtilization) / 3
                );
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectNode(item.id)}
                    className="watchlist-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 0',
                      fontSize: '12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.01)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ flex: '1.6', fontWeight: 600, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#6b7280', marginRight: '6px', fontFamily: 'monospace' }}>
                        ${item.ticker}
                      </span>
                      {item.name.replace(/ \(.*\)/, '')}
                    </div>
                    <div style={{ flex: '0.8', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#f59e0b' : '#ff5555', fontWeight: 500 }}>
                      {viewMode === 'economic' ? item.financialMetrics.capex : item.cognitiveLoad}
                    </div>
                    <div style={{ flex: '0.8', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#10b981' : '#ff2a6d', fontWeight: 500 }}>
                      {viewMode === 'economic' ? item.financialMetrics.attentionYield : item.systemicAgency}
                    </div>
                    <div style={{ flex: '0.8', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#06b6d4' : '#5555ff', fontWeight: 500 }}>
                      {viewMode === 'economic' ? item.financialMetrics.retentionMoat : item.sensoryUtilization}
                    </div>
                    <div style={{ flex: '0.8', textAlign: 'right', fontFamily: 'monospace', color: '#a855f7', fontWeight: 700 }}>
                      {avgVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
