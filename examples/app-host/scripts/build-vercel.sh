#!/usr/bin/env bash
set -euo pipefail

# Build script for Vercel deployment of @example/app-host.
#
# Follows the Vercel deployment pattern:
#   - api/[[...route]].js is committed to the repo (Vercel detects it pre-build)
#   - esbuild bundles server/index.ts → api/_handler.js (self-contained bundle)
#   - The committed .js wrapper re-exports from _handler.js at runtime
#
# Steps:
#   1. Build the project with turbo
#   2. Bundle the API serverless function (→ api/_handler.js)
#   3. Copy native/external modules into local node_modules for Vercel packaging

echo "[build-vercel] Starting app-host build..."

# 1. Build the project with turbo (from monorepo root)
cd ../..
pnpm turbo run build --filter=@example/app-host
cd examples/app-host

# 2. Bundle API serverless function
node scripts/bundle-api.mjs

# 3. Copy native/external modules into local node_modules for Vercel packaging.
#
#    This monorepo uses pnpm's default strict node_modules structure. Transitive
#    native dependencies like better-sqlite3 only exist in the monorepo root's
#    node_modules/.pnpm/ virtual store — they're NOT symlinked into
#    examples/app-host/node_modules/.
#
#    The vercel.json includeFiles pattern references node_modules/ relative to
#    examples/app-host/, so we must copy the actual module files here for Vercel
#    to include them in the serverless function's deployment package.
echo "[build-vercel] Copying external native modules to local node_modules..."
for mod in better-sqlite3; do
  src="../../node_modules/$mod"
  if [ -e "$src" ]; then
    dest="node_modules/$mod"
    mkdir -p "$(dirname "$dest")"
    cp -rL "$src" "$dest"
    echo "[build-vercel]   ✓ Copied $mod"
  else
    echo "[build-vercel]   ⚠ $mod not found at $src (skipped)"
  fi
done

echo "[build-vercel] Done. Serverless function in api/[[...route]].js → api/_handler.js"
