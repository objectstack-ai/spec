// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineConfig } from 'tsup';

const entries = [
  'src/index.ts',
  'src/data/index.ts',
  'src/system/index.ts',
  'src/kernel/index.ts',
  'src/automation/index.ts',
  'src/api/index.ts',
  'src/ui/index.ts',
  'src/ai/index.ts',
  'src/security/index.ts',
  'src/contracts/index.ts',
  'src/integration/index.ts',
  'src/studio/index.ts',
  'src/cloud/index.ts',
  'src/qa/index.ts',
  'src/identity/index.ts',
  'src/shared/index.ts'
];

// Generate DTS separately to avoid memory issues
const isDts = process.env.BUILD_DTS === 'true';

export default defineConfig({
  entry: entries,
  splitting: false,
  sourcemap: true,
  clean: !isDts, // Only clean on main build, not on DTS pass
  dts: !isDts ? false : { only: true }, // Only generate DTS on explicit pass, without JS
  format: ['esm', 'cjs'],
  target: 'es2020',
  treeshake: true,
});
