import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { type ObjectKernel, HttpDispatcher } from '@objectstack/runtime';

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
  const kernel = options.kernel as any;
  const dispatcher = new HttpDispatcher(options.kernel);

  app.use('*', cors());

  // --- Helper for Success Response ---
  const success = (data: any, meta?: any) => ({
    success: true,
    data,
    meta,
  });

  // --- Helper for Error Response ---
  const errorHandler = async (c: any, fn: () => Promise<any>) => {
    try {
      return await fn();
    } catch (err: any) {
      return c.json({
        success: false,
        error: {
          code: err.statusCode || 500,
          message: err.message || 'Internal Server Error',
          details: err.details,
        },
      }, err.statusCode || 500);
    }
  };

  // --- 0. Discovery Endpoint ---
  app.get(prefix, (c) => {
    return c.json(dispatcher.getDiscoveryInfo(prefix));
  });

  // --- 1. Auth (Generic Auth Handler) ---
  app.all(`${prefix}/auth/*`, async (c) => {
    // subpath from /api/auth/login -> login
    const path = c.req.path.substring(c.req.path.indexOf('/auth/') + 6);
    
    try {
      const result = await dispatcher.handleAuth(path, c.req.method, await c.req.parseBody().catch(() => ({})), { request: c.req.raw });
      
      if (result.handled) {
        if (result.response) {
             return c.json(result.response.body, result.response.status as any, result.response.headers);
        }
        if (result.result) {
             // If handler returns a response object
             return result.result;
        }
      }
      return c.json({ success: false, error: { message: 'Auth provider not configured', code: 404 } }, 404);
    } catch (err: any) {
      return c.json({ success: false, error: { message: err.message, code: err.statusCode || 500 } }, err.statusCode || 500);
    }
  });

  // --- 2. GraphQL ---
  app.post(`${prefix}/graphql`, async (c) => {
    return errorHandler(c, async () => {
      const body = await c.req.json();
      const result = await dispatcher.handleGraphQL(body, { request: c.req.raw });
      return c.json(result);
    });
  });

  // --- 2. Metadata Endpoints ---

  // List All Objects
  app.get(`${prefix}/metadata`, async (c) => {
    return errorHandler(c, async () => {
      const data = await kernel.broker.call('metadata.objects', {}, { request: c.req.raw });
      return c.json(success(data));
    });
  });

  // Get Object Metadata
  app.get(`${prefix}/metadata/:objectName`, async (c) => {
    return errorHandler(c, async () => {
      const { objectName } = c.req.param();
      const data = await kernel.broker.call('metadata.getObject', { objectName }, { request: c.req.raw });
      return c.json(success(data));
    });
  });

  // --- 3. Data Endpoints ---

  // List Records (Standard REST)
  app.get(`${prefix}/data/:objectName`, async (c) => {
    return errorHandler(c, async () => {
      const { objectName } = c.req.param();
      const query = c.req.query();
      // Basic support: pass query params as filter
      // In a real implementation, we might parse OData or JSON filters from query params
      const result = await kernel.broker.call('data.query', { object: objectName, filters: query }, { request: c.req.raw });
      return c.json(success(result.data, { count: result.count }));
    });
  });

  // Query Records (POST with JSON body)
  app.post(`${prefix}/data/:objectName/query`, async (c) => {
    return errorHandler(c, async () => {
      const { objectName } = c.req.param();
      const body = await c.req.json();
      const result = await kernel.broker.call('data.query', { object: objectName, ...body }, { request: c.req.raw });
      return c.json(success(result.data, { count: result.count, limit: body.limit, skip: body.skip }));
    });
  });

  // Get Single Record
  app.get(`${prefix}/data/:objectName/:id`, async (c) => {
    return errorHandler(c, async () => {
      const { objectName, id } = c.req.param();
      const query = c.req.query(); 
      const data = await kernel.broker.call('data.get', { object: objectName, id, ...query }, { request: c.req.raw });
      return c.json(success(data));
    });
  });

  // Create Record
  app.post(`${prefix}/data/:objectName`, async (c) => {
    return errorHandler(c, async () => {
      const { objectName } = c.req.param();
      const body = await c.req.json();
      const data = await kernel.broker.call('data.create', { object: objectName, data: body }, { request: c.req.raw });
      return c.json(success(data), 201);
    });
  });

  // Update Record
  app.patch(`${prefix}/data/:objectName/:id`, async (c) => {
    return errorHandler(c, async () => {
      const { objectName, id } = c.req.param();
      const body = await c.req.json();
      const data = await kernel.broker.call('data.update', { object: objectName, id, data: body }, { request: c.req.raw });
      return c.json(success(data));
    });
  });

  // Delete Record
  app.delete(`${prefix}/data/:objectName/:id`, async (c) => {
    return errorHandler(c, async () => {
      const { objectName, id } = c.req.param();
      await kernel.broker.call('data.delete', { object: objectName, id }, { request: c.req.raw });
      return c.json(success({ id, deleted: true }));
    });
  });

  // Batch Operations
  app.post(`${prefix}/data/:objectName/batch`, async (c) => {
    return errorHandler(c, async () => {
        const { objectName } = c.req.param();
        const { operations } = await c.req.json();
        const data = await kernel.broker.call('data.batch', { object: objectName, operations }, { request: c.req.raw });
        return c.json(success(data));
    });
  });

  // --- 4. Storage & Files ---
  
  // Upload File
  app.post(`${prefix}/storage/upload`, async (c) => {
    return errorHandler(c, async () => {
      const storageService = (kernel as any).getService?.('file-storage') || (kernel as any).services?.['file-storage'];
      if (!storageService) throw { statusCode: 501, message: 'File storage not configured' };

      const body = await c.req.parseBody();
      const file = body['file']; 
      
      if (!file) throw { statusCode: 400, message: 'No file provided' };
      
      // Allow service to handle raw file object or buffer
      const result = await storageService.upload(file, { request: c.req.raw });
      return c.json(success(result));
    });
  });

  // Get File
  app.get(`${prefix}/storage/file/:id`, async (c) => {
    return errorHandler(c, async () => {
        const storageService = (kernel as any).getService?.('file-storage') || (kernel as any).services?.['file-storage'];
        if (!storageService) throw { statusCode: 501, message: 'File storage not configured' };

        const { id } = c.req.param();
        const result = await storageService.download(id, { request: c.req.raw });
        
        // If result is a stream or blob, return it. 
        // If result is a URL (e.g. S3 signed url), redirect.
        if (result.url && result.redirect) {
            return c.redirect(result.url);
        }
        if (result.stream) {
            return c.body(result.stream, 200, {
                'Content-Type': result.mimeType || 'application/octet-stream',
                'Content-Length': result.size,
            });
        }
        return c.json(success(result));
    });
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
