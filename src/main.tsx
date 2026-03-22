import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Skip service worker registration inside Tauri — it uses a custom protocol
// that doesn't benefit from SW caching and can cause asset conflicts.
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

if (!isTauri && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
