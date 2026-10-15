import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// No StrictMode: its dev-only double mount tears down the lazily mounted three.js
// canvas (react-three-fiber forces a WebGL context loss on unmount), leaving it blank.
createRoot(document.getElementById('root')!).render(<App />)
