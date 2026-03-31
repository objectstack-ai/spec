---
"@objectstack/studio": patch
---

Fix Vercel deployment API endpoints returning HTML instead of JSON.

The `bundle-api.mjs` script was emitting the serverless function to `api/index.js`
at the project root, but `vercel.json` sets `outputDirectory: "dist"` — causing
Vercel to never find the function entrypoint and fall back to the SPA HTML route
for all `/api/*` requests.

- Change esbuild `outfile` from `api/index.js` to `dist/api/index.js` so the
  bundled serverless function lands inside the Vercel output directory.
- Add explicit `functions` config in `vercel.json` pointing to `api/index.js`
  (relative to `outputDirectory`) with `@vercel/node@3` runtime.
- Remove obsolete `.gitignore` entries for `api/index.js` and `api/index.js.map`
  (now emitted under `dist/` which is already git-ignored).
