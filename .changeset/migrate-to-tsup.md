---
"@objectstack/spec-monorepo": patch
"@objectstack/core": patch
"@objectstack/objectql": patch
"@objectstack/runtime": patch
"@objectstack/plugin-hono-server": patch
"@objectstack/driver-memory": patch
"@objectstack/plugin-msw": patch
"@objectstack/hono": patch
"@objectstack/nextjs": patch
"@objectstack/nestjs": patch
"@objectstack/client": patch
"@objectstack/client-react": patch
"@objectstack/metadata": patch
"@objectstack/types": patch
"@objectstack/spec": patch
---

refactor: migrate build system from tsc to tsup for faster builds
- Replaced `tsc` with `tsup` (using esbuild) across all packages
- Added shared `tsup.config.ts` in workspace root
- Added `tsup` as workspace dev dependency
- significantly improved build performance
