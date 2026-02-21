import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
// ...existing code...
import { registerSW } from 'virtual:pwa-register'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    onRegistered(r) { console.log('SW registered', r) },
    onRegisterError(err) { console.warn('SW register error', err) }
  })
}
// ...existing code...