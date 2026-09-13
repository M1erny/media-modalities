import { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import type { CameraPreset } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { modalitiesData } from './data/modalities';
import type { Modality } from './data/modalities';

function App() {
  const [viewMode, setViewMode] = useState<'biological' | 'economic'>('biological');
  const [colorMode, setColorMode] = useState<'sensory' | 'family'>('sensory');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalities, setModalities] = useState<Modality[]>(modalitiesData);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [isRecordMode, setIsRecordMode] = useState<boolean>(false);
  const [isAutoOrbiting, setIsAutoOrbiting] = useState<boolean>(false);

  const handleUpdateModality = (updated: Modality) => {
    setModalities(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleResetModality = (id: string) => {
    const original = modalitiesData.find(m => m.id === id);
    if (original) {
      setModalities(prev => prev.map(m => m.id === id ? { ...original } : m));
    }
  };

  const handleResetAllModalities = () => {
    setModalities([...modalitiesData]);
  };

  // Keyboard shortcut to toggle or exit record mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isRecordMode) {
          setIsRecordMode(false);
          setIsAutoOrbiting(false);
        } else if (selectedNodeId) {
          setSelectedNodeId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecordMode, selectedNodeId]);

  const handleToggleRecordMode = () => {
    setIsRecordMode(prev => {
      const next = !prev;
      setIsAutoOrbiting(next);
      if (next) {
        setSelectedNodeId(null);
      }
      return next;
    });
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#020408' }}>
      {/* 3D Canvas Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Scene
          viewMode={viewMode}
          colorMode={colorMode}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          modalities={modalities}
          cameraPreset={cameraPreset}
          isAutoOrbiting={isAutoOrbiting}
        />
      </div>
      
      {/* 2D HTML Overlay Layer */}
      <UIOverlay
        viewMode={viewMode}
        setViewMode={setViewMode}
        colorMode={colorMode}
        setColorMode={setColorMode}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        modalities={modalities}
        onUpdateModality={handleUpdateModality}
        onResetModality={handleResetModality}
        onResetAllModalities={handleResetAllModalities}
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
        isRecordMode={isRecordMode}
        onToggleRecordMode={handleToggleRecordMode}
        isAutoOrbiting={isAutoOrbiting}
        onToggleAutoOrbit={() => setIsAutoOrbiting(prev => !prev)}
      />
    </div>
  );
}

export default App;
