// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useMemo } from 'react';
import { useParams, useLocation } from '@tanstack/react-router';

/**
 * Runtime context shipped to the Universal Assistant on every
 * request. Mirrors {@link import('@objectstack/service-ai').SkillContext}.
 *
 * Values are derived from the current TanStack Router state so that
 * skills with `triggerConditions` (e.g. "only active when objectName
 * == 'view'") activate automatically as the user navigates.
 */
export interface AssistantContext {
  /** Always "studio" — distinguishes from runtime apps in skill triggers. */
  appName: 'studio';
  /** Active project ID, when inside `/projects/$projectId/...`. */
  projectId?: string;
  /** Active package ID, when inside a package route. */
  packageName?: string;
  /**
   * Object name (in metadata-edit routes this is the metadata *type*,
   * e.g. "view" / "agent" / "skill" / "object"). Skills can target a
   * specific metadata type via `triggerConditions: [{ field: 'objectName' … }]`.
   */
  objectName?: string;
  /** Identifier of the metadata record currently open. */
  recordId?: string;
  /** Pathname (useful for fallback / debugging). */
  route?: string;
}

interface RouteParams {
  projectId?: string;
  package?: string;
  type?: string;
  name?: string;
}

/**
 * Derive the SkillContext for the current Studio route.
 *
 * The mapping is intentionally simple — Studio's routes already encode
 * the relevant identity in path params:
 *
 * | Route                                               | objectName | recordId |
 * |:----------------------------------------------------|:-----------|:---------|
 * | `/projects/:p/:pkg/metadata/:type/:name`            | `:type`    | `:name`  |
 * | `/projects/:p/:pkg/objects/:name`                   | `object`   | `:name`  |
 * | `/projects/:p/:pkg/...`                             | —          | —        |
 *
 * The result is referentially stable as long as the underlying params
 * do not change, which makes it safe to use as a `useEffect` /
 * `useMemo` dependency.
 */
export function useAssistantContext(): AssistantContext {
  const params = useParams({ strict: false }) as RouteParams;
  const location = useLocation();

  return useMemo<AssistantContext>(() => {
    const ctx: AssistantContext = { appName: 'studio' };
    if (params.projectId) ctx.projectId = params.projectId;
    if (params.package) ctx.packageName = params.package;

    if (params.type && params.name) {
      ctx.objectName = params.type;
      ctx.recordId = params.name;
    } else if (params.name && location.pathname.includes('/objects/')) {
      ctx.objectName = 'object';
      ctx.recordId = params.name;
    }

    ctx.route = location.pathname;
    return ctx;
  }, [params.projectId, params.package, params.type, params.name, location.pathname]);
}

/**
 * Encode a {@link AssistantContext} as URL search params suitable for
 * `GET /api/v1/ai/assistant?...`. Skips empty / undefined fields so
 * the server's `parseContextFromQuery` only sees real values.
 */
export function encodeAssistantContext(ctx: AssistantContext): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(ctx)) {
    if (value == null || value === '') continue;
    params.set(key, String(value));
  }
  return params;
}
