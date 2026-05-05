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
    dedupe: ['react', 'react-dom', 'lucide-react', 'react-router-dom', 'react-router'],
    alias: {
      ...workspaceAliases,
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      // Force a single react-router copy. When @object-ui/* are aliased to
      // sibling source, Node's resolver finds react-router-dom in
      // ../objectui/node_modules — a different physical install than the one
      // dashboard's App.tsx imports from. Two copies = two Router contexts =
      // "<Navigate> may be used only in the context of a <Router>".
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
      // Don't alias 'react-router' as a string (it would intercept the
      // 'react-router/dom' subpath import inside react-router-dom). The
      // dedupe entry above is enough to ensure a single copy.
      // Force a single lucide-react copy. @object-ui/app-shell pulls 0.544.0
      // while @object-ui/components and the plugins pull 1.14.0 — letting both
      // through produces duplicate icon chunks where one references a stale
      // `createLucideIcon` symbol from the main bundle and crashes at runtime.
      'lucide-react': path.resolve(
        __dirname,
        '../../node_modules/.pnpm/lucide-react@1.14.0_react@19.2.5/node_modules/lucide-react',
      ),
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    cssCodeSplit: true,
    // Don't auto-emit `<link rel="modulepreload">` for every chunk; with
    // Vite-Rolldown's per-icon code splitting that would inject 1700+
    // preload tags into the HTML, defeating lazy loading. Mirrors
    // objectui/apps/console.
    modulePreload: false,
    commonjsOptions: {
      include: [/node_modules/, /packages/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Manual chunking ported verbatim from objectui/apps/console — the
        // proven shape that avoids the per-leaf TDZ ("X is not a function")
        // crashes triggered by Vite-Rolldown's default dynamic-import
        // splitting against @object-ui's static+dynamic widget imports.
        manualChunks(id: string) {
          // Vendor: React ecosystem
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          // Vendor: Radix UI primitives
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix';
          }
          // Vendor: @objectstack/* SDK & spec
          if (
            id.includes('node_modules/@objectstack/') ||
            id.includes('/@objectstack+') ||
            id.includes('\\@objectstack+')
          ) {
            return 'vendor-objectstack';
          }
          // Vendor: Lucide icons — only bundle the runtime helpers; per-icon
          // chunks then import a fully-initialized factory.
          if (
            id.includes('node_modules/lucide-react/dist/lucide-react') ||
            id.includes('node_modules/lucide-react/dist/esm/Icon') ||
            id.includes('node_modules/lucide-react/dist/esm/createLucideIcon') ||
            id.includes('node_modules/lucide-react/dist/esm/defaultAttributes') ||
            id.includes('node_modules/lucide-react/dist/esm/shared')
          ) {
            return 'vendor-icons-core';
          }
          // Vendor: UI utilities
          if (
            id.includes('node_modules/class-variance-authority/') ||
            id.includes('node_modules/clsx/') ||
            id.includes('node_modules/tailwind-merge/') ||
            id.includes('node_modules/sonner/')
          ) {
            return 'vendor-ui-utils';
          }
          if (id.includes('node_modules/zod/')) {
            return 'vendor-zod';
          }
          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/victory-')
          ) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/@dnd-kit/')) {
            return 'vendor-dndkit';
          }
          if (
            id.includes('node_modules/i18next') ||
            id.includes('node_modules/react-i18next/')
          ) {
            return 'vendor-i18n';
          }
          // @object-ui/core + @object-ui/react (framework)
          if (
            id.includes('/packages/core/') ||
            id.includes('/packages/react/') ||
            id.includes('/packages/types/')
          ) {
            return 'framework';
          }
          // @object-ui/components + @object-ui/fields
          if (
            id.includes('/packages/components/') ||
            id.includes('/packages/fields/') ||
            id.includes('/@object-ui/components/') ||
            id.includes('/@object-ui/fields/')
          ) {
            return 'ui-components';
          }
          if (id.includes('/packages/layout/')) {
            return 'ui-layout';
          }
          if (id.includes('/packages/data-objectstack/')) {
            return 'data-adapter';
          }
          if (
            id.includes('/packages/auth/') ||
            id.includes('/packages/permissions/') ||
            id.includes('/packages/tenant/') ||
            id.includes('/packages/i18n/')
          ) {
            return 'infrastructure';
          }
          if (id.includes('/packages/plugin-grid/')) return 'plugin-grid';
          if (id.includes('/packages/plugin-form/')) return 'plugin-form';
          if (id.includes('/packages/plugin-view/')) return 'plugin-view';
          if (
            id.includes('/packages/plugin-detail/') ||
            id.includes('/packages/plugin-list/') ||
            id.includes('/packages/plugin-dashboard/') ||
            id.includes('/packages/plugin-report/')
          ) {
            return 'plugins-views';
          }
          if (id.includes('/packages/plugin-charts/')) return 'plugin-charts';
          if (id.includes('/packages/plugin-calendar/')) return 'plugin-calendar';
          if (id.includes('/packages/plugin-kanban/')) return 'plugin-kanban';
          if (id.includes('/packages/plugin-chatbot/')) return 'plugin-chatbot';
          if (id.includes('/packages/app-shell/')) return 'app-shell';
        },
      },
    },
  },
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
