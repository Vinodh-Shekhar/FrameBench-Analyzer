import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tauri: don't clear terminal output so Tauri can print to it
  clearScreen: false,
  base: '/',
  server: {
    port: 5173,
    // Tauri expects a specific port; don't fail if 5173 is busy
    strictPort: false,
  },
  // Expose TAURI_ env vars to the frontend alongside VITE_ ones
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri uses Chromium on Windows via WebView2; targeting ES2021 + chrome105 gives
    // maximum compat while keeping modern JS features.
    target: ['es2021', 'chrome105'],
    // Don't minify in debug builds (TAURI_DEBUG is set by `tauri dev`)
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
