import { NextRequest, NextResponse } from 'next/server';
import { type ObjectKernel, HttpDispatcher } from '@objectstack/runtime';

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
  const dispatcher = new HttpDispatcher(options.kernel);

  const success = (data: any, meta?: any) => NextResponse.json({ success: true, data, meta });
  const error = (msg: string, code: number = 500) => NextResponse.json({ success: false, error: { message: msg, code } }, { status: code });

  return async function handler(req: NextRequest, { params }: { params: { objectstack: string[] } }) {
    const resolvedParams = await Promise.resolve(params);
    const segments = resolvedParams.objectstack || [];
    const method = req.method;
    
    // --- 0. Discovery Endpoint ---
    if (segments.length === 0 && method === 'GET') {
      return NextResponse.json(dispatcher.getDiscoveryInfo(options.prefix || '/api'));
    }

    // --- 1. Auth (Generic Auth Handler) ---
    if (segments[0] === 'auth') {
       const subPath = segments.slice(1).join('/');
       try {
           const body = method === 'POST' ? await req.json().catch(() => ({})) : {};
           const result = await dispatcher.handleAuth(subPath, method, body, { request: req });
           if (result.handled) {
                if (result.response) {
                    return NextResponse.json(result.response.body, { status: result.response.status });
                }
                if (result.result) return result.result;
           }
           return error('Auth provider not configured', 404);
       } catch (e: any) {
           return error(e.message, e.statusCode || 500);
       }
    }

    try {
        const rawRequest = req;

        // 1. GraphQL
        if (segments[0] === 'graphql' && method === 'POST') {
            const body = await req.json();
            const result = await dispatcher.handleGraphQL(body, { request: rawRequest });
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
                return success(data);
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
