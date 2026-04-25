// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

const polyfillPath = path.resolve(__dirname, './mocks/node-polyfills.ts');

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [path.resolve(__dirname, './test/setup.ts')],
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockServiceWorker.js',
        'dist/',
        'src/routeTree.gen.ts',
        'src/mocks/',
      ],
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
      // Node built-ins stubbed for browser-like test env
      'node:fs/promises': polyfillPath,
      'node:fs': polyfillPath,
      'node:events': polyfillPath,
      'node:stream': polyfillPath,
      'node:string_decoder': polyfillPath,
      'node:path': polyfillPath,
      'node:url': polyfillPath,
      'node:util': polyfillPath,
      'node:os': polyfillPath,
      'node:crypto': polyfillPath,
      'events': polyfillPath,
      'stream': polyfillPath,
      'string_decoder': polyfillPath,
      'path': polyfillPath,
      'fs/promises': polyfillPath,
      'fs': polyfillPath,
      'util': polyfillPath,
      'os': polyfillPath,
      'crypto': polyfillPath,
      'url': polyfillPath,
      // Chokidar stub (not needed in the browser/test environment)
      'chokidar': path.resolve(__dirname, './src/mocks/noop.ts'),
    },
  },
});
