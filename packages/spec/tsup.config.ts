// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
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
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  target: 'es2020',
  treeshake: true,
});
