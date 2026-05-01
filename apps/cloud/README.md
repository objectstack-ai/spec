# @objectstack/cloud

Cloud-mode host for ObjectStack — multi-project, control-plane connected,
deployed as a Vercel serverless function.

This app is the cloud counterpart to [`@objectstack/objectos`](../objectos),
which hosts local single-project / standalone deployments.

## Modes

This config is **cloud-only**. Boot orchestration lives in
`@objectstack/service-cloud`; this package only supplies the
cloud-specific knobs:

- **`templates`** — Studio's template registry (Blank / CRM / Todo).
- **`appBundles`** — filesystem-backed app bundle resolver.

Set `OS_MODE=cloud` (default for this app) to boot the
multi-project plugin stack.

## Local development

```bash
# From repo root
pnpm install
pnpm --filter @objectstack/cloud dev
```

## Build

```bash
pnpm --filter @objectstack/cloud build
```

Produces `dist/objectstack.config.js`, consumed by
`objectstack serve --prebuilt`.

## Vercel deployment

`vercel.json` and `scripts/build-vercel.sh` mirror the apps/objectos
deployment recipe — bundle `server/index.ts` with esbuild, copy Studio +
Account SPAs into `public/`, and ship `api/[[...route]].js` as the
catch-all serverless function.
