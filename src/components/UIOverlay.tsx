import { useMemo } from 'react';
import { modalitiesData } from '../data/modalities';

interface UIOverlayProps {
  viewMode: 'biological' | 'economic';
  setViewMode: (mode: 'biological' | 'economic') => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

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

export const UIOverlay: React.FC<UIOverlayProps> = ({
  viewMode,
  setViewMode,
  selectedNodeId,
  onSelectNode,
}) => {
  const selectedNode = useMemo(
    () => modalitiesData.find(m => m.id === selectedNodeId) || null,
    [selectedNodeId]
  );

  const averageScore = useMemo(
    () => selectedNode ? Math.round((selectedNode.cognitiveLoad + selectedNode.sensoryUtilization + selectedNode.systemicAgency) / 3) : 0,
    [selectedNode]
  );

  // Sorted watchlist for the Bloomberg panel
  const watchList = useMemo(() => {
    return [...modalitiesData].sort((a, b) => {
      // Sort priority: STRONG BUY -> BUY -> HOLD -> UNDERPERFORM -> SHORT
      const priority: Record<string, number> = {
        'STRONG BUY': 5,
        'BUY': 4,
        'HOLD': 3,
        'UNDERPERFORM': 2,
        'SHORT': 1,
      };
      return (priority[b.financialMetrics.recommendation] || 0) - (priority[a.financialMetrics.recommendation] || 0);
    });
  }, []);

  const totalAssetCount = modalitiesData.length;
  const strongBuysCount = modalitiesData.filter(m => m.financialMetrics.recommendation === 'STRONG BUY').length;
  const shortsCount = modalitiesData.filter(m => m.financialMetrics.recommendation === 'SHORT').length;

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
              v2.0
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
            An interactive framework mapping media formats as financial assets competing in the global attention economy.
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
                AXIS GUIDE (ECONOMIC)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <span style={{ color: '#e5e7eb', fontWeight: 500 }}>X: Production Cost (CapEx)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ color: '#e5e7eb', fontWeight: 500 }}>Y: Attention Yield (ROI)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                  <span style={{ color: '#e5e7eb', fontWeight: 500 }}>Z: Retention Moat (LTV)</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                AXIS GUIDE (BIOLOGICAL)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5555' }} />
                  <span style={{ color: '#e5e7eb', fontWeight: 500 }}>X: Cognitive Load</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#55ff55' }} />
                  <span style={{ color: '#e5e7eb', fontWeight: 500 }}>Y: Systemic Agency</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5555ff' }} />
                  <span style={{ color: '#e5e7eb', fontWeight: 500 }}>Z: Sensory Utilization</span>
                </div>
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
          /* Detailed Equity Research Report */
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

            {/* Recommendation Rating Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: getRecommendationColor(selectedNode.financialMetrics.recommendation) + '15',
                border: `1px solid ${getRecommendationColor(selectedNode.financialMetrics.recommendation)}33`,
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e5e7eb' }}>Analyst Consensus:</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: getRecommendationColor(selectedNode.financialMetrics.recommendation),
                  letterSpacing: '0.05em',
                  textShadow: `0 0 10px ${getRecommendationColor(selectedNode.financialMetrics.recommendation)}55`,
                }}
              >
                {selectedNode.financialMetrics.recommendation}
              </span>
            </div>

            {/* Scrollable Report Content */}
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
              
              {/* Thesis Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                  Investment Thesis
                </h4>
                <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.6 }}>
                  {selectedNode.financialMetrics.thesis}
                </p>
              </div>

              {/* Risks Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
                  Risk & Friction Vectors
                </h4>
                <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.6 }}>
                  {selectedNode.financialMetrics.risks}
                </p>
              </div>

              {/* Grid of Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                
                {/* Economic Scores */}
                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
                    ECONOMIC STATS
                  </div>
                  <div className="report-metric-row">
                    <span>CapEx Requirement:</span>
                    <strong>{selectedNode.financialMetrics.capex}/100</strong>
                  </div>
                  <div className="report-metric-row">
                    <span>Attention Yield:</span>
                    <strong>{selectedNode.financialMetrics.attentionYield}/100</strong>
                  </div>
                  <div className="report-metric-row">
                    <span>Retention Moat:</span>
                    <strong>{selectedNode.financialMetrics.retentionMoat}/100</strong>
                  </div>
                  <div className="report-metric-row" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>TAM:</span>
                    <span style={{ color: '#66fcf1', fontWeight: 700 }}>{selectedNode.financialMetrics.tamRating}</span>
                  </div>
                </div>

                {/* Biological Scores */}
                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
                    BIOLOGICAL STATS
                  </div>
                  <div className="report-metric-row">
                    <span>Cognitive Load:</span>
                    <strong>{selectedNode.cognitiveLoad}/100</strong>
                  </div>
                  <div className="report-metric-row">
                    <span>Systemic Agency:</span>
                    <strong>{selectedNode.systemicAgency}/100</strong>
                  </div>
                  <div className="report-metric-row">
                    <span>Sensory Util:</span>
                    <strong>{selectedNode.sensoryUtilization}/100</strong>
                  </div>
                  <div className="report-metric-row" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Avg Mindshare:</span>
                    <span style={{ color: '#45f3ff', fontWeight: 700 }}>{averageScore}/100</span>
                  </div>
                </div>

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
                <span>Assets: <strong style={{ color: '#e5e7eb' }}>{totalAssetCount}</strong></span>
                <span>Strong Buy: <strong style={{ color: '#10b981' }}>{strongBuysCount}</strong></span>
                <span>Shorts: <strong style={{ color: '#ef4444' }}>{shortsCount}</strong></span>
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
              <div style={{ flex: '1.2' }}>TICKER / FORMAT</div>
              <div style={{ flex: '1', textAlign: 'right' }}>{viewMode === 'economic' ? 'YIELD' : 'COGNITIVE'}</div>
              <div style={{ flex: '1', textAlign: 'right' }}>{viewMode === 'economic' ? 'MOAT' : 'AGENCY'}</div>
              <div style={{ flex: '1.4', textAlign: 'right' }}>RATING</div>
            </div>

            {/* Scrollable List */}
            <div style={{ flexGrow: 1, overflowY: 'auto' }} className="custom-scrollbar">
              {watchList.map((item) => {
                const recColor = getRecommendationColor(item.financialMetrics.recommendation);
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
                    <div style={{ flex: '1.2', fontWeight: 600, color: '#e5e7eb' }}>
                      <span style={{ fontSize: '10px', color: '#6b7280', marginRight: '6px', fontFamily: 'monospace' }}>
                        ${item.ticker}
                      </span>
                      {item.name.replace(/ \(.*\)/, '')}
                    </div>
                    <div style={{ flex: '1', textAlign: 'right', fontFamily: 'monospace', color: '#9ca3af' }}>
                      {viewMode === 'economic' ? item.financialMetrics.attentionYield : item.cognitiveLoad}
                    </div>
                    <div style={{ flex: '1', textAlign: 'right', fontFamily: 'monospace', color: '#9ca3af' }}>
                      {viewMode === 'economic' ? item.financialMetrics.retentionMoat : item.systemicAgency}
                    </div>
                    <div
                      style={{
                        flex: '1.4',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '10px',
                        color: recColor,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.financialMetrics.recommendation}
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
