import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Essay } from './essay/Essay';
import { MethodPanel } from './essay/MethodPanel';

const Explorer = lazy(() => import('./explorer/Explorer'));

/** The essay comes first; the 3D explorer opens full-screen at the end of it (or via #explorer). */
function App() {
  const [methodOpen, setMethodOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(() => window.location.hash === '#explorer');

  const openExplorer = useCallback(() => {
    setExplorerOpen(true);
    history.replaceState(null, '', '#explorer');
  }, []);

  const closeExplorer = useCallback(() => {
    setExplorerOpen(false);
    history.replaceState(null, '', '#explore');
    requestAnimationFrame(() => document.getElementById('explore')?.scrollIntoView());
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', explorerOpen || methodOpen);
  }, [explorerOpen, methodOpen]);

  return (
    <>
      <Essay onOpenMethod={() => setMethodOpen(true)} onOpenExplorer={openExplorer} explorerOpen={explorerOpen} />
      {explorerOpen && (
        <div className="explorer-full">
          <Suspense fallback={<div className="stage-loading">Loading 3D…</div>}>
            <Explorer onClose={closeExplorer} onOpenMethod={() => setMethodOpen(true)} />
          </Suspense>
        </div>
      )}
      <MethodPanel open={methodOpen} onClose={() => setMethodOpen(false)} />
    </>
  );
}

export default App;
