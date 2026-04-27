// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Resolve the API base URL for the account portal.
 *
 * - When the SPA is mounted under `/_account/` on the same origin as the API
 *   server (production / preview), use the same origin.
 * - When running standalone (e.g. `pnpm --filter @objectstack/account dev`),
 *   talk to the local API server at `http://localhost:3000`.
 * - Override with `VITE_SERVER_URL` for non-default deployments.
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/_account')) {
      return window.location.origin;
    }
  }
  return 'http://localhost:3000';
}
