import { defineConfig } from 'vite';

// The Figma sandbox has no module loader. code.js must be one plain IIFE.
export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    target: 'es2017',
    minify: false,
    lib: {
      entry: 'src/main/code.ts',
      formats: ['iife'],
      name: 'scout',
      fileName: () => 'code.js',
    },
  },
});
