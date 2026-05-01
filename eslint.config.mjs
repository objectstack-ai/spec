// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

// Flat ESLint config — guards against memory-bloating import patterns.
//
// Background: `export * as Namespace from './sub'` is NOT tree-shakeable in
// Node ESM. The 16 namespace re-exports previously in
// `packages/spec/src/index.ts` force-evaluated ~400 Zod schema closures on the
// first `import { Data } from '@objectstack/spec'`, ballooning RSS by ~1.2GB
// in `@objectstack/objectos`. Those root barrels are gone — this rule prevents
// them coming back via consumer imports.
//
// To enable: `pnpm add -DW eslint` then `pnpm exec eslint .`

const SUBPATH_NAMES = [
  'Data', 'UI', 'System', 'AI', 'API', 'Automation',
  'Security', 'Kernel', 'Cloud', 'QA', 'Identity',
  'Integration', 'Contracts', 'Studio', 'Shared',
];

const SUBPATH_RULE_MESSAGE =
  'Use subpath imports: `import * as Data from "@objectstack/spec/data"` ' +
  'or `import { Field } from "@objectstack/spec/data"`. Root namespace ' +
  're-exports were removed because Node ESM cannot tree-shake them — see ' +
  'packages/spec/src/index.ts.';

export default [
  {
    files: ['**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      'packages/spec/**',
      // CLI/scaffold templates contain `@objectstack/spec` strings that are
      // emitted to user projects, not actual imports in this repo.
      'packages/cli/src/commands/init.ts',
      'packages/cli/src/commands/generate.ts',
      'packages/cli/src/commands/create.ts',
      'packages/create-objectstack/src/index.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: '@objectstack/spec',
          importNames: SUBPATH_NAMES,
          message: SUBPATH_RULE_MESSAGE,
        }],
      }],
    },
  },
];
