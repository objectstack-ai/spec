import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { type ObjectKernel } from '@objectstack/runtime';

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
    // Check capabilities based on registered services
    const services = (kernel as any).services || {};
    const hasGraphQL = !!(services['graphql'] || (kernel as any).graphql); // Kernel often has direct graphql support
    const hasSearch = !!services['search'];
    const hasWebSockets = !!services['realtime'];
    const hasFiles = !!(services['file-storage'] || services['storage']?.supportsFiles);

    return c.json({
      name: 'ObjectOS',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      routes: {
        data: `${prefix}/data`,
        metadata: `${prefix}/metadata`,
        auth: `${prefix}/auth`,
        graphql: hasGraphQL ? `${prefix}/graphql` : undefined,
        storage: hasFiles ? `${prefix}/storage` : undefined,
      },
      features: {
        graphql: hasGraphQL,
        search: hasSearch,
        websockets: hasWebSockets,
        files: hasFiles,
      },
    });
  });

  // --- 1. Auth (Generic Auth Handler) ---
  app.all(`${prefix}/auth/*`, async (c) => {
    // 1. Try to use generic Auth Service if available
    const authService = (kernel as any).getService?.('auth') || (kernel as any).services?.['auth'];
    if (authService && authService.handler) {
      return authService.handler(c.req.raw);
    }

    // 2. Fallback to Legacy Auth Spec (only for login)
    if (c.req.path.endsWith('/login') && c.req.method === 'POST') {
      return errorHandler(c, async () => {
        const body = await c.req.json();
        const data = await kernel.broker.call('auth.login', body, { request: c.req.raw });
        return c.json(data);
      });
    }

    return c.json({ success: false, error: { message: 'Auth provider not configured', code: 404 } }, 404);
  });

  // --- 2. GraphQL ---
  app.post(`${prefix}/graphql`, async (c) => {
    return errorHandler(c, async () => {
      const { query, variables } = await c.req.json();
      const result = await kernel.graphql(query, variables, {
        request: c.req.raw,
      });
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
