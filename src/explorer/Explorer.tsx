import { useEffect, useMemo, useState } from 'react';
import { modalitiesData, type Modality } from '../data/modalities';
import { economicFrontier, modeOf, type Lens } from '../data/derive';
import { Scene } from './Scene';
import type { CameraPreset, ColorMode } from './colors';
import { Hud, type FilterState } from './Hud';

interface Props {
  preview?: boolean;
  onClose?: () => void;
  onOpenMethod?: () => void;
}

/** 3D explorer. In preview mode it only auto-orbits, as the backdrop for the essay's last section. */
export default function Explorer({ preview, onClose, onOpenMethod }: Props) {
  const [lens, setLens] = useState<Lens>('economic');
  const [colorMode, setColorMode] = useState<ColorMode>('mode');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>('All');
  const [modalities, setModalities] = useState<Modality[]>(modalitiesData);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [tour, setTour] = useState(false);

  useEffect(() => {
    if (preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('.method')) return;
      if (tour) setTour(false);
      else if (selectedId) setSelectedId(null);
      else if (filter !== 'All') setFilter('All');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview, tour, selectedId, filter]);

  const activeIds = useMemo(() => {
    if (filter === 'All') return null;
    if (filter === 'Frontier') return economicFrontier(modalities);
    if (filter === 'Lean-back' || filter === 'Lean-forward' || filter === 'Out-of-home') {
      return new Set(modalities.filter((m) => modeOf(m) === filter).map((m) => m.id));
    }
    return new Set(modalities.filter((m) => m.family === filter).map((m) => m.id));
  }, [filter, modalities]);

  const update = (next: Modality) => setModalities((list) => list.map((m) => (m.id === next.id ? next : m)));
  const reset = (id: string) => setModalities((list) => list.map((m) => (m.id === id ? modalitiesData.find((o) => o.id === id)! : m)));

  return (
    <div className={`explorer${preview ? ' is-preview' : ''}`}>
      <Scene
        lens={preview ? 'economic' : lens}
        colorMode={colorMode}
        modalities={modalities}
        selectedId={selectedId}
        activeIds={preview ? null : activeIds}
        onSelect={setSelectedId}
        cameraPreset={cameraPreset}
        autoRotate={preview || tour}
        preview={preview}
      />
      {!preview && (
        <Hud
          lens={lens}
          setLens={setLens}
          colorMode={colorMode}
          setColorMode={setColorMode}
          cameraPreset={cameraPreset}
          setCameraPreset={setCameraPreset}
          filter={filter}
          setFilter={setFilter}
          tour={tour}
          setTour={(on) => {
            setTour(on);
            if (on) setSelectedId(null);
          }}
          modalities={modalities}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={update}
          onReset={reset}
          onResetAll={() => setModalities(modalitiesData)}
          onClose={onClose}
          onOpenMethod={onOpenMethod}
        />
      )}
    </div>
  );
}
