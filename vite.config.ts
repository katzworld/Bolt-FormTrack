import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: './', // Base path for GitHub Pages deployment
  build: {
    assetsDir: 'assets', // Place assets in a specific directory
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    }
  },
});
