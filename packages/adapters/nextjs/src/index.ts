import { NextRequest, NextResponse } from 'next/server';
import { type ObjectKernel } from '@objectstack/runtime';

export interface NextAdapterOptions {
  kernel: ObjectKernel;
  prefix?: string;
}

/**
 * Creates a route handler for Next.js App Router
 * Handles /api/[...objectstack] pattern
 */
export function createRouteHandler(options: NextAdapterOptions) {
  const kernel = options.kernel as any;

  const success = (data: any, meta?: any) => NextResponse.json({ success: true, data, meta });
  const error = (msg: string, code: number = 500) => NextResponse.json({ success: false, error: { message: msg, code } }, { status: code });

  return async function handler(req: NextRequest, { params }: { params: { objectstack: string[] } }) {
    const segments = params.objectstack || [];
    const method = req.method;
    
    // Parse path: /api/...segments...
    // e.g., /api/graphql
    // /api/metadata
    // /api/data/contacts/query

    // --- 0. Discovery Endpoint ---
    if (segments.length === 0 && method === 'GET') {
      const prefix = options.prefix || '/api';
      const services = (kernel as any).services || {};
      const hasGraphQL = !!(services['graphql'] || (kernel as any).graphql);
      const hasSearch = !!services['search'];
      const hasWebSockets = !!services['realtime'];
      const hasFiles = !!(services['file-storage'] || services['storage']?.supportsFiles);

      return NextResponse.json({
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
    }

    // --- 1. Auth (Generic Auth Handler) ---
    if (segments[0] === 'auth') {
       const authService = (kernel as any).getService?.('auth') || (kernel as any).services?.['auth'];
       if (authService && authService.handler) {
          return authService.handler(req);
       }
       
       // Fallback for /api/auth/login
       if (segments[1] === 'login' && method === 'POST') {
          try {
             // Clone request body because it might be consumed by handler above? No, we checked availability.
             const body = await req.json();
             const data = await kernel.broker.call('auth.login', body, { request: req });
             return NextResponse.json(data);
          } catch (e: any) {
             return error(e.message, e.statusCode || 500);
          }
       }
       return error('Auth provider not configured', 404);
    }

    try {
        const rawRequest = req;

        // 0. Auth
        if (segments[0] === 'auth') {
            if (segments[1] === 'login' && method === 'POST') {
                const body = await req.json() as any;
                const data = await kernel.broker.call('auth.login', body, { request: rawRequest });
                return NextResponse.json(data);
            }
        }

        // 1. GraphQL
        if (segments[0] === 'graphql' && method === 'POST') {
            const body = await req.json() as any;
            const result = await kernel.graphql(body.query, body.variables, { request: rawRequest });
            return NextResponse.json(result);
        }

        // 2. Metadata
        if (segments[0] === 'metadata') {
            // GET /metadata
            if (segments.length === 1 && method === 'GET') {
                const data = await kernel.broker.call('metadata.objects', {}, { request: rawRequest });
                return success(data);
            }
            // GET /metadata/:objectName
            if (segments.length === 2 && method === 'GET') {
                const objectName = segments[1];
                const data = await kernel.broker.call('metadata.getObject', { objectName }, { request: rawRequest });
                return success(data);
            }
        }

        // 3. Data
        if (segments[0] === 'data') {
            const objectName = segments[1];
            if (!objectName) return error('Object name required', 400);

            // POST /data/:objectName/query
            if (segments[2] === 'query' && method === 'POST') {
                const body = await req.json() as any;
                const result = await kernel.broker.call('data.query', { object: objectName, ...body }, { request: rawRequest });
                return success(result.data, { count: result.count, limit: body.limit, skip: body.skip });
            }

            // POST /data/:objectName/batch
            if (segments[2] === 'batch' && method === 'POST') {
                const body = await req.json() as any;
                const result = await kernel.broker.call('data.batch', { object: objectName, operations: body.operations }, { request: rawRequest });
                return success(result);
            }

            // GET /data/:objectName (List)
            if (segments.length === 2 && method === 'GET') {
                const url = new URL(req.url);
                const queryParams: Record<string, any> = {};
                url.searchParams.forEach((val, key) => queryParams[key] = val);
                
                const result = await kernel.broker.call('data.query', { object: objectName, filters: queryParams }, { request: rawRequest });
                return success(result.data, { count: result.count });
            }

            // POST /data/:objectName (Create)
            if (segments.length === 2 && method === 'POST') {
                const body = await req.json();
                const data = await kernel.broker.call('data.create', { object: objectName, data: body }, { request: rawRequest });
                return success(data); // 201 not easy with helper, but ok
            }

            // GET /data/:objectName/:id
            if (segments.length === 3 && method === 'GET') {
                const id = segments[2];
                // Need to parse query params manually from req.url if needed
                const url = new URL(req.url);
                const queryParams: Record<string, any> = {};
                url.searchParams.forEach((val, key) => queryParams[key] = val);
                
                const data = await kernel.broker.call('data.get', { object: objectName, id, ...queryParams }, { request: rawRequest });
                return success(data);
            }

            // PATCH /data/:objectName/:id
            if (segments.length === 3 && method === 'PATCH') {
                const id = segments[2];
                const body = await req.json();
                const data = await kernel.broker.call('data.update', { object: objectName, id, data: body }, { request: rawRequest });
                return success(data);
            }

            // DELETE /data/:objectName/:id
            if (segments.length === 3 && method === 'DELETE') {
                const id = segments[2];
                await kernel.broker.call('data.delete', { object: objectName, id }, { request: rawRequest });
                return success({ id, deleted: true });
            }
        }

        // 4. Storage (Files)
        if (segments[0] === 'storage') {
            const storageService = (kernel as any).getService?.('file-storage') || (kernel as any).services?.['file-storage'];
            if (!storageService) return error('File storage not configured', 501);

            // POST /storage/upload
            if (segments[1] === 'upload' && method === 'POST') {
                try {
                    const formData = await req.formData();
                    const file = formData.get('file');
                    
                    if (!file) return error('No file provided', 400);
                    
                    const result = await storageService.upload(file, { request: rawRequest });
                    return success(result);
                } catch (e: any) {
                    return error(e.message, e.statusCode || 500);
                }
            }

            // GET /storage/file/:id
            if (segments[1] === 'file' && segments[2] && method === 'GET') {
                const id = segments[2];
                try {
                    const result = await storageService.download(id, { request: rawRequest });
                    if (result.url && result.redirect) {
                        return NextResponse.redirect(result.url);
                    }
                    if (result.stream) {
                         return new NextResponse(result.stream, {
                             headers: {
                                 'Content-Type': result.mimeType || 'application/octet-stream',
                                 'Content-Length': result.size,
                             }
                         });
                    }
                    return success(result);
                } catch (e: any) {
                     return error(e.message, e.statusCode || 500);
                }
            }
        }
        
        return error('Not Found', 404);

    } catch (err: any) {
        return error(err.message || 'Internal Server Error', err.statusCode || 500);
    }
  }
}
