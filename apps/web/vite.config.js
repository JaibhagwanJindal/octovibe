import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // './' keeps asset paths relative so the bundle works when deployed
  // to GitHub Pages under a sub-path (e.g. /octovibe/).
  base: './',
  resolve: {
    // Ensure workspace packages resolve correctly in monorepo
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
