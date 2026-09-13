import React, { useMemo, useState } from 'react';
import { FAMILY_CONFIG, getParetoFrontier } from '../data/modalities';
import type { Modality, ModalityFamily } from '../data/modalities';
import type { CameraPreset } from './Scene';

interface UIOverlayProps {
  viewMode: 'biological' | 'economic';
  setViewMode: (mode: 'biological' | 'economic') => void;
  colorMode: 'sensory' | 'family';
  setColorMode: (mode: 'sensory' | 'family') => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  modalities: Modality[];
  onUpdateModality: (updated: Modality) => void;
  onResetModality: (id: string) => void;
  onResetAllModalities: () => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  isRecordMode: boolean;
  onToggleRecordMode: () => void;
  isAutoOrbiting: boolean;
  onToggleAutoOrbit: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  viewMode,
  setViewMode,
  colorMode,
  setColorMode,
  selectedNodeId,
  onSelectNode,
  modalities,
  onUpdateModality,
  onResetModality,
  cameraPreset,
  setCameraPreset,
  isRecordMode,
  onToggleRecordMode,
  isAutoOrbiting,
  onToggleAutoOrbit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFamilyFilter, setActiveFamilyFilter] = useState<'ALL' | ModalityFamily>('ALL');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isPrinciplesModalOpen, setIsPrinciplesModalOpen] = useState(false);
  const [showCalibrationSliders, setShowCalibrationSliders] = useState(false);
  const [groupByFamily, setGroupByFamily] = useState(false);

  const selectedNode = useMemo(
    () => modalities.find(m => m.id === selectedNodeId) || null,
    [selectedNodeId, modalities]
  );

  // Compute Pareto frontier assets for badging
  const frontierModalities = useMemo(
    () => getParetoFrontier(modalities, viewMode),
    [modalities, viewMode]
  );

  const frontierIds = useMemo(
    () => new Set(frontierModalities.map(m => m.id)),
    [frontierModalities]
  );

  const averageScore = useMemo(
    () => selectedNode ? Math.round((selectedNode.cognitiveLoad + selectedNode.sensoryUtilization + selectedNode.systemicAgency) / 3) : 0,
    [selectedNode]
  );

  const economicScore = useMemo(
    () => selectedNode ? Math.round((selectedNode.financialMetrics.capex + selectedNode.financialMetrics.attentionYield + selectedNode.financialMetrics.retentionMoat) / 3) : 0,
    [selectedNode]
  );

  // Sorting state for the watchlist
  const [sortField, setSortField] = useState<'name' | 'attr1' | 'attr2' | 'attr3' | 'avg'>('avg');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleHeaderClick = (field: 'name' | 'attr1' | 'attr2' | 'attr3' | 'avg') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  const filteredWatchList = useMemo(() => {
    return modalities.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) || 
        item.ticker.toLowerCase().includes(query) ||
        item.family.toLowerCase().includes(query) ||
        item.financialMetrics.archetype.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeFamilyFilter !== 'ALL' && item.family !== activeFamilyFilter) {
        return false;
      }

      return true;
    });
  }, [modalities, searchQuery, activeFamilyFilter]);

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

  // Grouped by MECE family
  const groupedWatchList = useMemo(() => {
    const groups: Record<ModalityFamily, Modality[]> = {
      'Interactive Gaming': [],
      'Audio & Acoustic': [],
      'Linear Audiovisual': [],
      'Physical & Spatial': [],
      'Text & Symbolic': [],
      'Generative & Co-Creation': [],
    };

    sortedWatchList.forEach(m => {
      groups[m.family].push(m);
    });

    return groups;
  }, [sortedWatchList]);

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

  const renderHeader = (
    label: string,
    field: 'name' | 'attr1' | 'attr2' | 'attr3' | 'avg',
    flexVal: string,
    alignment: 'left' | 'right',
    color?: string
  ) => {
    const isActive = sortField === field;
    return (
      <div
        onClick={() => handleHeaderClick(field)}
        style={{
          flex: flexVal,
          textAlign: alignment,
          cursor: 'pointer',
          color: isActive ? (color || '#ffffff') : '#64748b',
          display: 'flex',
          justifyContent: alignment === 'left' ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          gap: '3px',
          userSelect: 'none',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        <span>{label}</span>
        {isActive && (
          <span style={{ fontSize: '8px', color: '#00f0ff' }}>
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    );
  };

  // ─── RECORDING MODE VIEW (MINIMAL CINEMATIC HUD) ───────────
  if (isRecordMode) {
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
          padding: '24px',
          zIndex: 1,
        }}
      >
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', color: '#ffffff', fontFamily: 'monospace' }}>
              ATTENTION SPACE // {viewMode === 'economic' ? 'CAPITAL ASSET MATRIX' : 'BIOLOGICAL NEURAL LOOP'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', boxShadow: '0 12px 40px rgba(0,0,0,0.8)' }}>
            <button
              onClick={onToggleAutoOrbit}
              className={`hud-btn ${isAutoOrbiting ? 'active' : ''}`}
              style={{ fontWeight: 700 }}
            >
              {isAutoOrbiting ? '⏸ Pause Orbit' : '▶ Auto-Orbit'}
            </button>

            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

            <button
              onClick={() => setViewMode(viewMode === 'biological' ? 'economic' : 'biological')}
              className="hud-btn"
            >
              {viewMode === 'biological' ? 'Switch to 💰 Capital' : 'Switch to 🧠 Biological'}
            </button>

            <button
              onClick={() => setColorMode(colorMode === 'sensory' ? 'family' : 'sensory')}
              className="hud-btn"
            >
              {colorMode === 'sensory' ? '🎨 Families' : '🌈 Sensory RGB'}
            </button>

            <button
              onClick={() => setCameraPreset('isometric')}
              className={`hud-btn ${cameraPreset === 'isometric' ? 'active' : ''}`}
            >
              🌐 3D
            </button>
            <button
              onClick={() => setCameraPreset('frontier')}
              className={`hud-btn ${cameraPreset === 'frontier' ? 'active' : ''}`}
            >
              ⚡ Frontier
            </button>
            <button
              onClick={() => setCameraPreset('xy')}
              className={`hud-btn ${cameraPreset === 'xy' ? 'active' : ''}`}
            >
              📐 Front
            </button>

            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

            <button
              onClick={onToggleRecordMode}
              className="hud-btn"
              style={{ color: '#f87171' }}
              title="Exit Recording Mode (Esc)"
            >
              ✕ Exit Record
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STANDARD INTERACTIVE VIEW ─────────────────────────────
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
        padding: '16px',
        zIndex: 1,
      }}
    >
      {/* ─── FLOATING TOP CONTROL BAR ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', width: '100%' }}>
        
        {/* Left: Brand Identity & Mode Toggle */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00f0ff', boxShadow: '0 0 8px #00f0ff' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
              ATTENTION SPACE
            </span>
          </div>

          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>|</span>

          {/* Model Dimension Toggle */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '3px', borderRadius: '7px' }}>
            <button
              onClick={() => setViewMode('biological')}
              style={{
                padding: '4px 10px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                backgroundColor: viewMode === 'biological' ? '#1e293b' : 'transparent',
                color: viewMode === 'biological' ? '#38bdf8' : '#64748b',
                boxShadow: viewMode === 'biological' ? '0 2px 8px rgba(56, 189, 248, 0.25)' : 'none',
              }}
            >
              🧠 Biological
            </button>
            <button
              onClick={() => setViewMode('economic')}
              style={{
                padding: '4px 10px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                backgroundColor: viewMode === 'economic' ? '#1e293b' : 'transparent',
                color: viewMode === 'economic' ? '#10b981' : '#64748b',
                boxShadow: viewMode === 'economic' ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
              }}
            >
              💰 Capital
            </button>
          </div>

          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>|</span>

          {/* Color Mode Switcher */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '3px', borderRadius: '7px' }}>
            <button
              onClick={() => setColorMode('sensory')}
              style={{
                padding: '4px 8px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                backgroundColor: colorMode === 'sensory' ? '#1e293b' : 'transparent',
                color: colorMode === 'sensory' ? '#00f0ff' : '#64748b',
              }}
              title="Color by Biological Sensory Channel blend (Cyan Photons, Amber Acoustics, Magenta Somatosensory)"
            >
              🌈 Sensory RGB
            </button>
            <button
              onClick={() => setColorMode('family')}
              style={{
                padding: '4px 8px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                backgroundColor: colorMode === 'family' ? '#1e293b' : 'transparent',
                color: colorMode === 'family' ? '#a855f7' : '#64748b',
              }}
              title="Color by MECE Substrate Families (Gaming, Audio, Audiovisual, Physical, Text, AI)"
            >
              🏷️ Families
            </button>
          </div>
        </div>

        {/* Center: Camera Presets */}
        <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '5px 8px' }}>
          <button
            onClick={() => setCameraPreset('isometric')}
            className={`hud-btn ${cameraPreset === 'isometric' ? 'active' : ''}`}
            title="3D Free Orbit"
          >
            🌐 3D
          </button>
          <button
            onClick={() => setCameraPreset('xy')}
            className={`hud-btn ${cameraPreset === 'xy' ? 'active' : ''}`}
            title={viewMode === 'economic' ? 'Supply vs Yield' : 'Cognitive vs Agency'}
          >
            📐 Front
          </button>
          <button
            onClick={() => setCameraPreset('zy')}
            className={`hud-btn ${cameraPreset === 'zy' ? 'active' : ''}`}
            title={viewMode === 'economic' ? 'Moat vs Yield' : 'Sensory vs Agency'}
          >
            📊 Side
          </button>
          <button
            onClick={() => setCameraPreset('xz')}
            className={`hud-btn ${cameraPreset === 'xz' ? 'active' : ''}`}
            title="Top-Down Ground Plane"
          >
            🗺️ Top
          </button>
          <button
            onClick={() => setCameraPreset('frontier')}
            className={`hud-btn ${cameraPreset === 'frontier' ? 'active' : ''}`}
            title="Pareto Optimal Frontier"
          >
            ⚡ Frontier
          </button>
        </div>

        {/* Right: Record Tour, Drawer & Principles Triggers */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onToggleRecordMode}
            className="glass-panel"
            style={{
              padding: '7px 13px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#ffffff',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
            title="Clean cinematic auto-orbit for recording Substack GIF/video"
          >
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
            <span>🎬 Record Tour</span>
          </button>

          <button
            onClick={() => setIsPrinciplesModalOpen(true)}
            className="glass-panel"
            style={{
              padding: '7px 12px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            ⓘ MECE Logic
          </button>

          <button
            onClick={() => setIsWatchlistOpen(prev => !prev)}
            className="glass-panel"
            style={{
              padding: '7px 14px',
              fontSize: '11px',
              fontWeight: 700,
              color: isWatchlistOpen ? '#00f0ff' : '#ffffff',
              border: isWatchlistOpen ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            ☰ Watchlist ({modalities.length})
          </button>
        </div>
      </div>

      {/* ─── BOTTOM/LEFT: FLOATING INSPECTOR CARD ──────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'auto', width: '100%' }}>
        {selectedNode ? (
          <div
            className="glass-panel"
            style={{
              width: '380px',
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '18px 20px',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Inspector Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, fontFamily: 'monospace' }}>
                    ${selectedNode.ticker}
                  </span>
                  
                  {/* Family Tag */}
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: FAMILY_CONFIG[selectedNode.family].color + '20',
                    color: FAMILY_CONFIG[selectedNode.family].color,
                    border: `1px solid ${FAMILY_CONFIG[selectedNode.family].color}40`,
                  }}>
                    {FAMILY_CONFIG[selectedNode.family].icon} {selectedNode.family}
                  </span>

                  {/* Pareto Frontier Badge */}
                  {frontierIds.has(selectedNode.id) && (
                    <span style={{
                      fontSize: '8px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: viewMode === 'economic' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                      color: viewMode === 'economic' ? '#10b981' : '#00f0ff',
                      fontWeight: 800,
                      border: viewMode === 'economic' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(0, 240, 255, 0.4)',
                    }}>
                      ⚡ PARETO FRONTIER
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  {selectedNode.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {viewMode === 'economic' ? 'Capital Index:' : 'Neural Index:'}
                  </span>
                  <strong style={{ fontSize: '12px', color: viewMode === 'economic' ? '#10b981' : '#38bdf8', fontFamily: 'monospace' }}>
                    {viewMode === 'economic' ? economicScore : averageScore}/100
                  </strong>
                </div>
              </div>
              <button
                onClick={() => onSelectNode(null)}
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Inspection Body */}
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '2px' }} className="custom-scrollbar">
              
              {/* First-Principles Dimension Gauges */}
              <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
                  {viewMode === 'economic' ? 'CAPITAL DIMENSIONS (SUPPLY / FLOW / STOCK)' : 'BIOLOGICAL DIMENSIONS (INPUT / COMPUTE / OUTPUT)'}
                </div>

                {viewMode === 'economic' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#cbd5e1' }}>Supply Barrier (CapEx)</span>
                        <strong style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{selectedNode.financialMetrics.capex}/100</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedNode.financialMetrics.capex}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#cbd5e1' }}>Extraction Yield (Flow)</span>
                        <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{selectedNode.financialMetrics.attentionYield}/100</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedNode.financialMetrics.attentionYield}%`, height: '100%', backgroundColor: '#10b981' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#cbd5e1' }}>Retention Moat (Stock)</span>
                        <strong style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{selectedNode.financialMetrics.retentionMoat}/100</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedNode.financialMetrics.retentionMoat}%`, height: '100%', backgroundColor: '#06b6d4' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#cbd5e1' }}>Cognitive Load (Compute)</span>
                        <strong style={{ color: '#ff5555', fontFamily: 'monospace' }}>{selectedNode.cognitiveLoad}/100</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedNode.cognitiveLoad}%`, height: '100%', backgroundColor: '#ff5555' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#cbd5e1' }}>Systemic Agency (Feedback)</span>
                        <strong style={{ color: '#ff2a6d', fontFamily: 'monospace' }}>{selectedNode.systemicAgency}/100</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedNode.systemicAgency}%`, height: '100%', backgroundColor: '#ff2a6d' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#cbd5e1' }}>Sensory Bandwidth (Input)</span>
                        <strong style={{ color: '#5555ff', fontFamily: 'monospace' }}>{selectedNode.sensoryUtilization}/100</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedNode.sensoryUtilization}%`, height: '100%', backgroundColor: '#5555ff' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sensory Channels Ratio */}
              <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                  <span>SENSORY CHANNELS RATIO</span>
                  <span style={{ color: '#00f0ff' }}>${selectedNode.financialMetrics.globalTamBillions}B TAM</span>
                </div>
                <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ width: `${selectedNode.sensoryComposition.visual}%`, backgroundColor: '#00f0ff' }} />
                  <div style={{ width: `${selectedNode.sensoryComposition.auditory}%`, backgroundColor: '#ffb700' }} />
                  <div style={{ width: `${selectedNode.sensoryComposition.physical}%`, backgroundColor: '#ff0055' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8' }}>
                  <span style={{ color: '#00f0ff' }}>VIS: {selectedNode.sensoryComposition.visual}%</span>
                  <span style={{ color: '#ffb700' }}>AUD: {selectedNode.sensoryComposition.auditory}%</span>
                  <span style={{ color: '#ff0055' }}>PHY: {selectedNode.sensoryComposition.physical}%</span>
                </div>
              </div>

              {/* Thesis Summary */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
                  FIRST-PRINCIPLES THESIS
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {selectedNode.financialMetrics.thesis}
                </p>
              </div>

              {/* Calibration Toggle */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <button
                  onClick={() => setShowCalibrationSliders(prev => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00f0ff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 0',
                  }}
                >
                  {showCalibrationSliders ? '▲ Hide Slider Weights' : '▼ Adjust Parameter Weights'}
                </button>

                {showCalibrationSliders && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {viewMode === 'economic' ? (
                      <>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                            <span>CapEx:</span>
                            <span>{selectedNode.financialMetrics.capex}</span>
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
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                            <span>Yield:</span>
                            <span>{selectedNode.financialMetrics.attentionYield}</span>
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
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                            <span>Moat:</span>
                            <span>{selectedNode.financialMetrics.retentionMoat}</span>
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
                      </>
                    ) : (
                      <>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                            <span>Cognitive Load:</span>
                            <span>{selectedNode.cognitiveLoad}</span>
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
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                            <span>Systemic Agency:</span>
                            <span>{selectedNode.systemicAgency}</span>
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
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                            <span>Sensory Utilization:</span>
                            <span>{selectedNode.sensoryUtilization}</span>
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
                      </>
                    )}
                    <button
                      onClick={() => onResetModality(selectedNode.id)}
                      className="reset-btn"
                      style={{ marginTop: '4px', padding: '4px' }}
                    >
                      ↺ Restore Default Weights
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* Subtle Empty State Helper */
          <div className="glass-panel" style={{ padding: '8px 14px', fontSize: '11px', color: '#64748b' }}>
            Click any modality orb to inspect first-principles breakdown.
          </div>
        )}

        {/* Legend Pill based on active colorMode */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', fontSize: '10px' }}>
          {colorMode === 'sensory' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00f0ff' }} />
                <span style={{ color: '#94a3b8' }}>Visual</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffb700' }} />
                <span style={{ color: '#94a3b8' }}>Audio</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff0055' }} />
                <span style={{ color: '#94a3b8' }}>Physical</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {(Object.keys(FAMILY_CONFIG) as ModalityFamily[]).map((fam) => (
                <div key={fam} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: FAMILY_CONFIG[fam].color }} />
                  <span style={{ color: '#94a3b8' }}>{FAMILY_CONFIG[fam].icon} {fam.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── SLIDE-OVER WATCHLIST DRAWER ─────────────────────── */}
      {isWatchlistOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '64px',
            right: '16px',
            width: '410px',
            height: 'calc(100% - 80px)',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            zIndex: 10,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
          }}
        >
          {/* Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
              ATTENTION ASSETS ({sortedWatchList.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setGroupByFamily(prev => !prev)}
                style={{
                  background: groupByFamily ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: groupByFamily ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: groupByFamily ? '#00f0ff' : '#94a3b8',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {groupByFamily ? 'Ungroup' : 'Group by Family'}
              </button>
              <button
                onClick={() => setIsWatchlistOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: '8px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search format, ticker, or family..."
              className="search-input"
            />
          </div>

          {/* MECE Family Filter Chips */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '2px' }} className="custom-scrollbar">
            <button onClick={() => setActiveFamilyFilter('ALL')} className={`filter-chip ${activeFamilyFilter === 'ALL' ? 'active' : ''}`}>
              All (25)
            </button>
            {(Object.keys(FAMILY_CONFIG) as ModalityFamily[]).map((fam) => (
              <button
                key={fam}
                onClick={() => setActiveFamilyFilter(fam)}
                className={`filter-chip ${activeFamilyFilter === fam ? 'active' : ''}`}
                style={{
                  borderColor: activeFamilyFilter === fam ? FAMILY_CONFIG[fam].color : undefined,
                  color: activeFamilyFilter === fam ? FAMILY_CONFIG[fam].color : undefined,
                }}
              >
                {FAMILY_CONFIG[fam].icon} {fam.replace(' & ', ' ')}
              </button>
            ))}
          </div>

          {/* Table Headers */}
          <div style={{ display: 'flex', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
            {renderHeader('FORMAT', 'name', '1.6', 'left', '#ffffff')}
            {renderHeader(viewMode === 'economic' ? 'CAPEX' : 'LOAD', 'attr1', '0.6', 'right', viewMode === 'economic' ? '#f59e0b' : '#ff5555')}
            {renderHeader(viewMode === 'economic' ? 'YIELD' : 'AGENCY', 'attr2', '0.6', 'right', viewMode === 'economic' ? '#10b981' : '#ff2a6d')}
            {renderHeader(viewMode === 'economic' ? 'MOAT' : 'SENSORY', 'attr3', '0.6', 'right', viewMode === 'economic' ? '#06b6d4' : '#5555ff')}
            {renderHeader('AVG', 'avg', '0.6', 'right', '#c084fc')}
          </div>

          {/* Scrollable Watchlist Table */}
          <div style={{ flexGrow: 1, overflowY: 'auto' }} className="custom-scrollbar">
            {groupByFamily ? (
              /* Grouped by Family Layout */
              (Object.keys(groupedWatchList) as ModalityFamily[]).map((fam) => {
                const items = groupedWatchList[fam];
                if (items.length === 0) return null;
                const famCfg = FAMILY_CONFIG[fam];

                return (
                  <div key={fam} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 2px', borderBottom: `1px solid ${famCfg.color}33`, marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px' }}>{famCfg.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: famCfg.color, letterSpacing: '0.04em' }}>
                        {fam.toUpperCase()} ({items.length})
                      </span>
                    </div>

                    {items.map((item) => {
                      const avg = Math.round(
                        viewMode === 'economic'
                          ? (item.financialMetrics.capex + item.financialMetrics.attentionYield + item.financialMetrics.retentionMoat) / 3
                          : (item.cognitiveLoad + item.systemicAgency + item.sensoryUtilization) / 3
                      );
                      const isItemSel = selectedNodeId === item.id;
                      const isItemFrontier = frontierIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectNode(item.id)}
                          className="watchlist-row"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '5px 4px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            backgroundColor: isItemSel ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                            borderLeft: isItemSel ? '2px solid #00f0ff' : '2px solid transparent',
                          }}
                        >
                          <div style={{ flex: '1.6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '4px' }}>
                            <span style={{ fontSize: '9px', color: famCfg.color, fontFamily: 'monospace', fontWeight: 700, marginRight: '4px' }}>
                              ${item.ticker}
                            </span>
                            <span style={{ color: isItemSel ? '#ffffff' : '#cbd5e1' }}>{item.name.replace(/ \(.*\)/, '')}</span>
                            {isItemFrontier && (
                              <span style={{ fontSize: '7px', color: '#00f0ff', fontWeight: 800, marginLeft: '4px' }}>⚡</span>
                            )}
                          </div>
                          <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#f59e0b' : '#ff5555' }}>
                            {viewMode === 'economic' ? item.financialMetrics.capex : item.cognitiveLoad}
                          </div>
                          <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#10b981' : '#ff2a6d' }}>
                            {viewMode === 'economic' ? item.financialMetrics.attentionYield : item.systemicAgency}
                          </div>
                          <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#06b6d4' : '#5555ff' }}>
                            {viewMode === 'economic' ? item.financialMetrics.retentionMoat : item.sensoryUtilization}
                          </div>
                          <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: '#c084fc', fontWeight: 700 }}>
                            {avg}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              /* Flat Sortable List */
              sortedWatchList.map((item) => {
                const avg = Math.round(
                  viewMode === 'economic'
                    ? (item.financialMetrics.capex + item.financialMetrics.attentionYield + item.financialMetrics.retentionMoat) / 3
                    : (item.cognitiveLoad + item.systemicAgency + item.sensoryUtilization) / 3
                );
                const isItemSel = selectedNodeId === item.id;
                const isItemFrontier = frontierIds.has(item.id);
                const famCfg = FAMILY_CONFIG[item.family];

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectNode(item.id)}
                    className="watchlist-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      borderRadius: '5px',
                      backgroundColor: isItemSel ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                      borderLeft: isItemSel ? '2px solid #00f0ff' : '2px solid transparent',
                    }}
                  >
                    <div style={{ flex: '1.6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '4px' }}>
                      <span style={{ fontSize: '9px', color: famCfg.color, fontFamily: 'monospace', fontWeight: 700, marginRight: '4px' }}>
                        ${item.ticker}
                      </span>
                      <span style={{ color: isItemSel ? '#ffffff' : '#cbd5e1' }}>{item.name.replace(/ \(.*\)/, '')}</span>
                      {isItemFrontier && (
                        <span style={{ fontSize: '7px', color: '#00f0ff', fontWeight: 800, marginLeft: '4px', backgroundColor: 'rgba(0, 240, 255, 0.15)', padding: '1px 3px', borderRadius: '2px' }}>
                          ⚡FRONTIER
                        </span>
                      )}
                    </div>
                    <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#f59e0b' : '#ff5555' }}>
                      {viewMode === 'economic' ? item.financialMetrics.capex : item.cognitiveLoad}
                    </div>
                    <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#10b981' : '#ff2a6d' }}>
                      {viewMode === 'economic' ? item.financialMetrics.attentionYield : item.systemicAgency}
                    </div>
                    <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: viewMode === 'economic' ? '#06b6d4' : '#5555ff' }}>
                      {viewMode === 'economic' ? item.financialMetrics.retentionMoat : item.sensoryUtilization}
                    </div>
                    <div style={{ flex: '0.6', textAlign: 'right', fontFamily: 'monospace', color: '#c084fc', fontWeight: 700 }}>
                      {avg}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── MECE PRINCIPLES EXPLANATION MODAL ─────────────────── */}
      {isPrinciplesModalOpen && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 100,
          }}
          onClick={() => setIsPrinciplesModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '640px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px 32px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                First Principles & MECE Framework
              </h2>
              <button
                onClick={() => setIsPrinciplesModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
              
              {/* MECE Substrates Section */}
              <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#c084fc', marginBottom: '8px' }}>
                  1. The 6 MECE Media Substrate Families
                </h3>
                <p style={{ marginBottom: '10px', fontSize: '12px', color: '#94a3b8' }}>
                  Every media modality is partitioned into an exact physical/computational substrate:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                  {(Object.keys(FAMILY_CONFIG) as ModalityFamily[]).map((fam) => (
                    <div key={fam} style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${FAMILY_CONFIG[fam].color}33` }}>
                      <strong style={{ color: FAMILY_CONFIG[fam].color }}>{FAMILY_CONFIG[fam].icon} {fam}</strong>
                      <p style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>{FAMILY_CONFIG[fam].description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biological Section */}
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                  2. Biological Neural Loop (Perception $\to$ Compute $\to$ Action)
                </h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <li><strong style={{ color: '#5555ff' }}>Sensory Bandwidth (Z):</strong> Physical transducer channels engaged (photons, acoustics, somatosensory).</li>
                  <li><strong style={{ color: '#ff5555' }}>Cognitive Load (X):</strong> Cortical working memory required to decode abstract symbols.</li>
                  <li><strong style={{ color: '#ff2a6d' }}>Systemic Agency (Y):</strong> Closed-loop causal control of the motor cortex over the system's state.</li>
                </ul>
              </div>

              {/* Economic Section */}
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
                  3. Capital Attention Economics (Supply $\to$ Flow $\to$ Stock)
                </h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <li><strong style={{ color: '#f59e0b' }}>Supply Barrier (CapEx - X):</strong> Upfront capital intensity required to manufacture 1 hour of consumable supply.</li>
                  <li><strong style={{ color: '#10b981' }}>Extraction Yield (Flow - Y):</strong> Monetization velocity and attention capture rate per minute.</li>
                  <li><strong style={{ color: '#06b6d4' }}>Retention Moat (Stock - Z):</strong> Network effects, switching costs, and customer lifetime value.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
