import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
      'node:fs/promises': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:fs': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:events': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:stream': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:string_decoder': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:path': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:url': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:util': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:os': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'node:crypto': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'events': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'stream': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'string_decoder': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'path': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'fs/promises': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'fs': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'util': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'os': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'crypto': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      'url': path.resolve(__dirname, './mocks/node-polyfills.ts'),
      // Fix for chokidar in browser
      'chokidar': path.resolve(__dirname, './src/mocks/noop.ts'),
    }
  },
  define: {
    'process.env': {},
    // 'process.cwd': '() => "/"', 
    // 'process.platform': '"browser"'
  },
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: [
      'msw', 
      'msw/browser',
      '@objectstack/spec',
      '@objectstack/spec/data', // Force pre-bundling for CJS compatibility
      '@objectstack/spec/system',
      '@objectstack/spec/ui',
      '@objectstack/client-react'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages/],
      exclude: [/\.node$/, /rollup/, /fsevents/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      // Suppress warnings for optional dynamic imports in runtime
      onwarn(warning, warn) {
        // Ignore unresolved import warnings for @objectstack/driver-memory
        // This is an optional fallback dynamic import in the runtime kernel.
        // It's safe to suppress because the driver is explicitly imported in src/mocks/browser.ts
        if (
          warning.code === 'UNRESOLVED_IMPORT' &&
          warning.message.includes('@objectstack/driver-memory')
        ) {
          return;
        }
        warn(warning);
      }
    }
  }
});
