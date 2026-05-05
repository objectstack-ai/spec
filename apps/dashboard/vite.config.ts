import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const hmrConfig = process.env.VITE_HMR_PORT
  ? { port: parseInt(process.env.VITE_HMR_PORT), clientPort: parseInt(process.env.VITE_HMR_PORT) }
  : undefined;

// Resolve @object-ui/* to the workspace `src/` folders in the sibling
// objectui checkout when present. This is required for local development
// because the published rolldown bundles inline their own private
// ComponentRegistry instance per plugin — breaking cross-plugin component
// lookup (e.g. plugin-list cannot find `object-grid` registered by
// plugin-grid). Pointing at source ensures a single shared
// @object-ui/core ComponentRegistry instance.
//
// In CI / fork-ready builds where the sibling checkout is not available,
// we fall back to the published @object-ui/* packages from node_modules
// (matches the official `examples/console-starter` template behaviour).
const OBJECTUI_ROOT = path.resolve(__dirname, '../../../objectui');
const OBJECTUI_PACKAGES_DIR = path.resolve(OBJECTUI_ROOT, 'packages');
const useObjectUiSource = fs.existsSync(OBJECTUI_PACKAGES_DIR);

const objectUiPackages = [
  'app-shell',
  'auth',
  'collaboration',
  'components',
  'core',
  'data-objectstack',
  'fields',
  'i18n',
  'layout',
  'mobile',
  'permissions',
  'plugin-calendar',
  'plugin-charts',
  'plugin-chatbot',
  'plugin-dashboard',
  'plugin-detail',
  'plugin-form',
  'plugin-grid',
  'plugin-kanban',
  'plugin-list',
  'plugin-report',
  'plugin-view',
  'react',
  'types',
];

const workspaceAliases: Record<string, string> = useObjectUiSource
  ? Object.fromEntries(
      objectUiPackages.map((name) => [
        `@object-ui/${name}`,
        path.resolve(OBJECTUI_PACKAGES_DIR, name, 'src'),
      ]),
    )
  : {};

export default defineConfig({
  base: process.env.VITE_BASE || '/_dashboard/',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      ...workspaceAliases,
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT || '5175'),
    hmr: hmrConfig,
    fs: {
      // Allow vite to read sources outside the project root (sibling objectui).
      allow: useObjectUiSource
        ? [path.resolve(__dirname, '../..'), OBJECTUI_ROOT]
        : [path.resolve(__dirname, '../..')],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
      '/.well-known': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
