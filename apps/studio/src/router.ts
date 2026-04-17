// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Route Tree Configuration
 *
 * TanStack Router auto-generates this file from routes/ directory.
 * This import is required for the router to work.
 */

import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

/**
 * Compute the router basepath for TanStack Router.
 *
 * When Studio is mounted under a sub-path (e.g. `/_studio/`), TanStack Router
 * must strip that prefix before matching route patterns. Otherwise URLs such
 * as `/_studio/packages` are mis-interpreted as `/$package="_studio"/packages`.
 *
 * Resolution order (first match wins):
 *
 *   1. **Runtime global `window.__OBJECTSTACK_STUDIO_BASEPATH__`** — injected
 *      into `index.html` by the host server (see `createStudioStaticPlugin`
 *      in `@objectstack/cli`) when the pre-built dist is served under a
 *      sub-path. This is the authoritative signal for *any* deployment where
 *      the same pre-built bundle is re-hosted at a different mount point —
 *      `import.meta.env.BASE_URL` is a build-time constant and cannot
 *      capture this.
 *
 *   2. **Vite `import.meta.env.BASE_URL`** — works at dev-server time when
 *      `VITE_BASE` is set (e.g. the CLI dev proxy), and for bundles that
 *      were explicitly built with a non-default `base` config.
 *
 *   3. Fallback: `'/'` (root deployment).
 *
 * TanStack Router expects the basepath WITHOUT a trailing slash (except for
 * the root `'/'`), so we normalise accordingly.
 */
function normalise(base: string): string {
  const trimmed = base.trim();
  if (!trimmed || trimmed === '/' || trimmed === './') return '/';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function resolveBasepath(): string {
  // 1. Runtime injection from host server (works for any pre-built dist)
  if (typeof window !== 'undefined') {
    const injected = (window as unknown as { __OBJECTSTACK_STUDIO_BASEPATH__?: string })
      .__OBJECTSTACK_STUDIO_BASEPATH__;
    if (typeof injected === 'string' && injected.length > 0) {
      return normalise(injected);
    }
  }

  // 2. Vite build-time / dev-server base
  return normalise(import.meta.env.BASE_URL ?? '/');
}

export const router = createRouter({
  routeTree,
  basepath: resolveBasepath(),
});

// Register things for type-safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
