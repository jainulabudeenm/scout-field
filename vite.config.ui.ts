import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Figma loads the UI from a single inline HTML file — no external assets.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: 'src/ui',
  build: {
    emptyOutDir: false,
    outDir: '../../dist',
    target: 'esnext',
    rollupOptions: { input: 'src/ui/ui.html' },
  },
});
