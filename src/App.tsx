import { useState } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';

function App() {
  const [viewMode, setViewMode] = useState<'biological' | 'economic'>('biological');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#06070a' }}>
      {/* 3D Canvas Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Scene
          viewMode={viewMode}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </div>
      
      {/* 2D HTML Overlay Layer */}
      <UIOverlay
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
      />
    </div>
  );
}

export default App;
