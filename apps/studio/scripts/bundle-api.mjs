/**
 * Pre-bundles the Vercel serverless API function.
 *
 * Vercel's @vercel/node builder resolves pnpm workspace packages via symlinks,
 * which can cause esbuild to resolve to TypeScript source files rather than
 * compiled dist output — producing ERR_MODULE_NOT_FOUND at runtime.
 *
 * This script bundles api/index.ts with all @objectstack/* workspace packages
 * inlined, while keeping third-party npm packages external (they resolve
 * normally from node_modules at runtime).
 *
 * Run from the apps/studio directory during the Vercel build step.
 */

import { build } from 'esbuild';
import { unlinkSync } from 'node:fs';

await build({
  entryPoints: ['api/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'es2020',
  outfile: 'api/index.mjs',
  sourcemap: true,
  // Maintain proper __dirname / import.meta.url behaviour
  define: {},
  plugins: [{
    name: 'externalize-non-workspace',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        // Bundle relative imports (../src/lib/*, ../objectstack.config.js, etc.)
        if (args.path.startsWith('.') || args.path.startsWith('/')) return null;
        // Bundle @objectstack/* workspace packages inline
        if (args.path.startsWith('@objectstack/')) return null;
        // Externalize everything else (npm packages, node builtins)
        return { path: args.path, external: true };
      });
    },
  }],
});

// Remove the TypeScript source so Vercel only sees the compiled .mjs
unlinkSync('api/index.ts');

console.log('[bundle-api] Bundled api/index.ts → api/index.mjs');
