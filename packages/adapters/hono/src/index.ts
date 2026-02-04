import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { type ObjectKernel, HttpDispatcher, HttpDispatcherResult } from '@objectstack/runtime';

export interface ObjectStackHonoOptions {
  kernel: ObjectKernel;
  prefix?: string;
}

/**
 * Creates a Hono application tailored for ObjectStack
 * Fully compliant with @objectstack/spec
 */
export function createHonoApp(options: ObjectStackHonoOptions) {
  const app = new Hono();
  const { prefix = '/api' } = options;
  const dispatcher = new HttpDispatcher(options.kernel);

  app.use('*', cors());

  // --- Helper for Response Normalization ---
  const normalizeResponse = (c: any, result: HttpDispatcherResult) => {
      if (result.handled) {
          if (result.response) {
               return c.json(result.response.body, result.response.status as any, result.response.headers);
          }
          if (result.result) {
              const res = result.result;
              // Redirect
              if (res.type === 'redirect' && res.url) {
                  return c.redirect(res.url);
              }
              // Stream
              if (res.type === 'stream' && res.stream) {
                  return c.body(res.stream, 200, res.headers);
              }
               
              // Hono handles standard Response objects
              return res;
          }
      }
      return c.json({ success: false, error: { message: 'Not Found', code: 404 } }, 404);
  }

  // --- 0. Discovery Endpoint ---
  app.get(prefix, (c) => {
    return c.json(dispatcher.getDiscoveryInfo(prefix));
  });

  // --- 1. Auth ---
  app.all(`${prefix}/auth/*`, async (c) => {
    try {
      // subpath from /api/auth/login -> login
      const path = c.req.path.substring(c.req.path.indexOf('/auth/') + 6);
      const body = await c.req.parseBody().catch(() => ({})); 
      
      const result = await dispatcher.handleAuth(path, c.req.method, body, { request: c.req.raw });
      return normalizeResponse(c, result);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  // --- 2. GraphQL ---
  app.post(`${prefix}/graphql`, async (c) => {
    try {
      const body = await c.req.json();
      const result = await dispatcher.handleGraphQL(body, { request: c.req.raw });
      return c.json(result);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  // --- 3. Metadata Endpoints ---
  app.all(`${prefix}/metadata*`, async (c) => {
    try {
      const path = c.req.path.substring(c.req.path.indexOf('/metadata') + 9);
      const result = await dispatcher.handleMetadata(path, { request: c.req.raw });
      return normalizeResponse(c, result);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  // --- 4. Data Endpoints ---
  app.all(`${prefix}/data*`, async (c) => {
    try {
      const path = c.req.path.substring(c.req.path.indexOf('/data') + 5);
      const method = c.req.method;
      
      let body = {};
      if (method === 'POST' || method === 'PATCH') {
          body = await c.req.json().catch(() => ({}));
      }
      const query = c.req.query();

      const result = await dispatcher.handleData(path, method, body, query, { request: c.req.raw });
      return normalizeResponse(c, result);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  // --- 5. Analytics Endpoints ---
  app.all(`${prefix}/analytics*`, async (c) => {
    try {
      const path = c.req.path.substring(c.req.path.indexOf('/analytics') + 10);
      const method = c.req.method;
      
      let body = {};
      if (method === 'POST') {
          body = await c.req.json().catch(() => ({}));
      }

      const result = await dispatcher.handleAnalytics(path, method, body, { request: c.req.raw });
      return normalizeResponse(c, result);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  // --- 6. Hub Endpoints ---
  app.all(`${prefix}/hub*`, async (c) => {
    try {
      const path = c.req.path.substring(c.req.path.indexOf('/hub') + 4);
      const method = c.req.method;
      
      let body = {};
      if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
          body = await c.req.json().catch(() => ({}));
      }
      const query = c.req.query();

      const result = await dispatcher.handleHub(path, method, body, query, { request: c.req.raw });
      return normalizeResponse(c, result);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  // --- 7. Automation Endpoints ---
  app.all(`${prefix}/automation*`, async (c) => {
      try {
        const path = c.req.path.substring(c.req.path.indexOf('/automation') + 11);
        const method = c.req.method;
        
        let body = {};
        if (method === 'POST') {
            body = await c.req.json().catch(() => ({}));
        }

        const result = await dispatcher.handleAutomation(path, method, body, { request: c.req.raw });
        return normalizeResponse(c, result);
      } catch (err: any) {
        return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
      }
  });

  // --- 8. Storage Endpoints ---
  app.all(`${prefix}/storage*`, async (c) => {
    try {
      const path = c.req.path.substring(c.req.path.indexOf('/storage') + 8);
      const method = c.req.method;
      
      let file: any = undefined;
      if (method === 'POST' && path.includes('upload')) {
          const body = await c.req.parseBody();
          file = body['file'];
      }

      const result = await dispatcher.handleStorage(path, method, file, { request: c.req.raw });
      return normalizeResponse(c, result);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  return app;
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
