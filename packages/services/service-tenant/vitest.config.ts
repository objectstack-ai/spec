import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@objectstack/spec/cloud': path.resolve(__dirname, '../../spec/src/cloud/index.ts'),
      '@objectstack/spec/contracts': path.resolve(__dirname, '../../spec/src/contracts/index.ts'),
      '@objectstack/spec/data': path.resolve(__dirname, '../../spec/src/data/index.ts'),
      '@objectstack/spec/system': path.resolve(__dirname, '../../spec/src/system/index.ts'),
      '@objectstack/spec': path.resolve(__dirname, '../../spec/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
