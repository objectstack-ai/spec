// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Hono } from 'hono';
import { type ObjectKernel, HttpDispatcher, HttpDispatcherResult } from '@objectstack/runtime';

export interface ObjectStackHonoOptions {
  kernel: ObjectKernel;
  prefix?: string;
}

/**
 * Auth service interface with handleRequest method
 */
interface AuthService {
  handleRequest(request: Request): Promise<Response>;
}

/**
 * Middleware mode for existing Hono apps
 */
export function objectStackMiddleware(kernel: ObjectKernel) {
  return async (c: any, next: any) => {
    c.set('objectStack', kernel);
    await next();
  };
}

/**
 * Creates a full-featured Hono app with all ObjectStack route dispatchers.
 * Provides Auth, GraphQL, Metadata, Data, and Storage routes matching
 * Next.js/NestJS adapter completeness.
 *
 * @example
 * ```ts
 * import { createHonoApp } from '@objectstack/hono';
 * const app = createHonoApp({ kernel });
 * export default app;
 * ```
 */
export function createHonoApp(options: ObjectStackHonoOptions): Hono {
  const app = new Hono();
  const prefix = options.prefix || '/api';
  const dispatcher = new HttpDispatcher(options.kernel);

  const errorJson = (c: any, message: string, code: number = 500) => {
    return c.json({ success: false, error: { message, code } }, code);
  };

  const toResponse = (c: any, result: HttpDispatcherResult) => {
    if (result.handled) {
      if (result.response) {
        if (result.response.headers) {
          Object.entries(result.response.headers).forEach(([k, v]) => c.header(k, v as string));
        }
        return c.json(result.response.body, result.response.status);
      }
      if (result.result) {
        const res = result.result;
        if (res.type === 'redirect' && res.url) {
          return c.redirect(res.url);
        }
        if (res.type === 'stream' && res.stream) {
          if (res.headers) {
            Object.entries(res.headers).forEach(([k, v]) => c.header(k, v as string));
          }
          return new Response(res.stream, { status: 200 });
        }
        return c.json(res, 200);
      }
    }
    return errorJson(c, 'Not Found', 404);
  };

  // --- Discovery ---
  app.get(`${prefix}`, async (c) => {
    return c.json({ data: await dispatcher.getDiscoveryInfo(prefix) });
  });

  // --- .well-known ---
  app.get('/.well-known/objectstack', (c) => {
    return c.redirect(prefix);
  });

  // --- Auth ---
  app.all(`${prefix}/auth/*`, async (c) => {
    try {
      const path = c.req.path.substring(`${prefix}/auth/`.length);
      const method = c.req.method;

      // Try AuthPlugin service first (prefer async to support factory-based services)
      let authService: AuthService | null = null;
      try {
        if (typeof options.kernel.getServiceAsync === 'function') {
          authService = await options.kernel.getServiceAsync<AuthService>('auth');
        } else if (typeof options.kernel.getService === 'function') {
          authService = options.kernel.getService<AuthService>('auth');
        }
      } catch {
        // Service not registered — fall through to dispatcher
        authService = null;
      }

      if (authService && typeof authService.handleRequest === 'function') {
        const response = await authService.handleRequest(c.req.raw);
        return new Response(response.body, {
          status: response.status,
          headers: response.headers,
        });
      }

      // Fallback to legacy dispatcher
      const body = method === 'GET' || method === 'HEAD'
        ? {}
        : await c.req.json().catch(() => ({}));
      const result = await dispatcher.handleAuth(path, method, body, { request: c.req.raw });
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  });

  // --- GraphQL ---
  app.post(`${prefix}/graphql`, async (c) => {
    try {
      const body = await c.req.json();
      const result = await dispatcher.handleGraphQL(body, { request: c.req.raw });
      return c.json(result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  });

  // --- Metadata ---
  const metaHandler = async (c: any) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/meta`.length);
      const method = c.req.method;

      let body: any = undefined;
      if (method === 'PUT' || method === 'POST') {
        body = await c.req.json().catch(() => ({}));
      }

      const queryParams: Record<string, any> = {};
      const url = new URL(c.req.url);
      url.searchParams.forEach((val, key) => { queryParams[key] = val; });

      const result = await dispatcher.handleMetadata(subPath, { request: c.req.raw }, method, body, queryParams);
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  };
  app.all(`${prefix}/meta/*`, metaHandler);
  app.all(`${prefix}/meta`, metaHandler);

  // --- Data ---
  app.all(`${prefix}/data/*`, async (c) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/data`.length);
      const method = c.req.method;

      let body: any = {};
      if (method === 'POST' || method === 'PATCH') {
        body = await c.req.json().catch(() => ({}));
      }

      const queryParams: Record<string, any> = {};
      const url = new URL(c.req.url);
      url.searchParams.forEach((val, key) => { queryParams[key] = val; });

      const result = await dispatcher.handleData(subPath, method, body, queryParams, { request: c.req.raw });
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  });

  // --- Storage ---
  app.all(`${prefix}/storage/*`, async (c) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/storage`.length);
      const method = c.req.method;

      let file: any = undefined;
      if (method === 'POST' && subPath === '/upload') {
        const formData = await c.req.formData();
        file = formData.get('file');
      }

      const result = await dispatcher.handleStorage(subPath, method, file, { request: c.req.raw });
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  });

  // --- Packages ---
  const packagesHandler = async (c: any) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/packages`.length);
      const method = c.req.method;

      let body: any = {};
      if (method === 'POST' || method === 'PATCH') {
        body = await c.req.json().catch(() => ({}));
      }

      const queryParams: Record<string, any> = {};
      const url = new URL(c.req.url);
      url.searchParams.forEach((val, key) => { queryParams[key] = val; });

      const result = await dispatcher.handlePackages(subPath, method, body, queryParams, { request: c.req.raw });
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  };
  app.all(`${prefix}/packages/*`, packagesHandler);
  app.all(`${prefix}/packages`, packagesHandler);

  // --- Analytics ---
  const analyticsHandler = async (c: any) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/analytics`.length);
      const method = c.req.method;

      let body: any = undefined;
      if (method === 'POST') {
        body = await c.req.json().catch(() => ({}));
      }

      const result = await dispatcher.handleAnalytics(subPath, method, body, { request: c.req.raw });
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  };
  app.all(`${prefix}/analytics/*`, analyticsHandler);
  app.all(`${prefix}/analytics`, analyticsHandler);

  // --- Automation ---
  const automationHandler = async (c: any) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/automation`.length);
      const method = c.req.method;

      let body: any = undefined;
      if (method === 'POST' || method === 'PUT') {
        body = await c.req.json().catch(() => ({}));
      }

      const queryParams: Record<string, any> = {};
      const url = new URL(c.req.url);
      url.searchParams.forEach((val, key) => { queryParams[key] = val; });

      const result = await dispatcher.handleAutomation(subPath, method, body, { request: c.req.raw }, queryParams);
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  };
  app.all(`${prefix}/automation/*`, automationHandler);
  app.all(`${prefix}/automation`, automationHandler);

  // --- i18n ---
  const i18nHandler = async (c: any) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/i18n`.length);
      const method = c.req.method;

      const queryParams: Record<string, any> = {};
      const url = new URL(c.req.url);
      url.searchParams.forEach((val, key) => { queryParams[key] = val; });

      const result = await dispatcher.handleI18n(subPath, method, queryParams, { request: c.req.raw });
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  };
  app.all(`${prefix}/i18n/*`, i18nHandler);
  app.all(`${prefix}/i18n`, i18nHandler);

  // --- UI ---
  app.all(`${prefix}/ui/*`, async (c) => {
    try {
      const subPath = c.req.path.substring(`${prefix}/ui`.length);

      const queryParams: Record<string, any> = {};
      const url = new URL(c.req.url);
      url.searchParams.forEach((val, key) => { queryParams[key] = val; });

      const result = await dispatcher.handleUi(subPath, queryParams, { request: c.req.raw });
      return toResponse(c, result);
    } catch (err: any) {
      return errorJson(c, err.message || 'Internal Server Error', err.statusCode || 500);
    }
  });

  return app;
}
