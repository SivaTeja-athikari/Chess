import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'chess-vendor': ['chess.js', 'zustand'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'canvas-confetti'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
