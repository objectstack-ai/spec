import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

const hmrConfig = process.env.VITE_HMR_PORT
  ? { port: parseInt(process.env.VITE_HMR_PORT), clientPort: parseInt(process.env.VITE_HMR_PORT) }
  : undefined;

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/_account/',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
  },
  plugins: [TanStackRouterVite(), react()],
  server: {
    port: parseInt(process.env.VITE_PORT || '5174'),
    hmr: hmrConfig,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@objectstack/client-react'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages/],
      exclude: [/\.node$/, /rollup/, /fsevents/],
      transformMixedEsModules: true,
    },
  },
});
