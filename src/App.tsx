import { useState } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { modalitiesData } from './data/modalities';
import type { Modality } from './data/modalities';

function App() {
  const [viewMode, setViewMode] = useState<'biological' | 'economic'>('biological');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalities, setModalities] = useState<Modality[]>(modalitiesData);

  const handleUpdateModality = (updated: Modality) => {
    setModalities(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#06070a' }}>
      {/* 3D Canvas Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Scene
          viewMode={viewMode}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          modalities={modalities}
        />
      </div>
      
      {/* 2D HTML Overlay Layer */}
      <UIOverlay
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        modalities={modalities}
        onUpdateModality={handleUpdateModality}
      />
    </div>
  );
}

export default App;
