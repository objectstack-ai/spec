import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI binary entry — needs shebang
  {
    entry: ['src/bin.ts'],
    format: ['esm'],
    clean: true,
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Library entry — no shebang, with types
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    shims: true,
  },
]);
