import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/driver/index.ts',
    'src/data/index.ts',
    'src/system/index.ts',
    'src/auth/index.ts',
    'src/kernel/index.ts',
    'src/automation/index.ts',
    'src/api/index.ts',
    'src/ui/index.ts',
    'src/permission/index.ts',
    'src/contracts/index.ts',
    'src/integration/index.ts'
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  target: 'es2020',
});
