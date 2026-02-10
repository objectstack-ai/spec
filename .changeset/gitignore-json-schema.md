---
"@objectstack/spec": patch
"@objectstack/cli": patch
---

chore: exclude generated json-schema from git tracking

- Add `packages/spec/json-schema/` to `.gitignore` (1277 generated files, 5MB)
- JSON schema files are still generated during `pnpm build` and included in npm publish via `files` field
- Fix studio module resolution logic for better compatibility
