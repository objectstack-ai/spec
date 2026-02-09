// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

// Export IHttpServer from core
export * from '@objectstack/core';

import { 
    IHttpServer, 
    RouteHandler, 
    Middleware 
} from '@objectstack/core';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

/**
 * Hono Implementation of IHttpServer
 */
export class HonoHttpServer implements IHttpServer {
    private app: Hono;
    private server: any;
    private listeningPort: number | undefined;

    constructor(
        private port: number = 3000,
        private staticRoot?: string
    ) {
        this.app = new Hono();
    }

    // internal helper to convert standard handler to Hono handler
    private wrap(handler: RouteHandler) {
        return async (c: any) => {
            let body: any = {};
            
            // Try to parse JSON body first if content-type is JSON
            if (c.req.header('content-type')?.includes('application/json')) {
                try { 
                    body = await c.req.json(); 
                } catch(e) {
                    // If JSON parsing fails, try parseBody
                    try { 
                        body = await c.req.parseBody(); 
                    } catch(e2) {}
                }
            } else {
                // For non-JSON content types, use parseBody
                try { 
                    body = await c.req.parseBody(); 
                } catch(e) {}
            }
            
            const req = {
                params: c.req.param(),
                query: c.req.query(),
                body,
                headers: c.req.header(),
                method: c.req.method,
                path: c.req.path
            };

            let capturedResponse: any;

            const res = {
                json: (data: any) => { capturedResponse = c.json(data); },
                send: (data: string) => { capturedResponse = c.html(data); },
                status: (code: number) => { c.status(code); return res; },
                header: (name: string, value: string) => { c.header(name, value); return res; }
            };

            await handler(req as any, res as any);
            return capturedResponse;
        };
    }

    get(path: string, handler: RouteHandler) {
        this.app.get(path, this.wrap(handler));
    }
    post(path: string, handler: RouteHandler) {
        this.app.post(path, this.wrap(handler));
    }
    put(path: string, handler: RouteHandler) {
        this.app.put(path, this.wrap(handler));
    }
    delete(path: string, handler: RouteHandler) {
        this.app.delete(path, this.wrap(handler));
    }
    patch(path: string, handler: RouteHandler) {
        this.app.patch(path, this.wrap(handler));
    }
    
    use(pathOrHandler: string | Middleware, handler?: Middleware) {
        if (typeof pathOrHandler === 'string' && handler) {
             // Path based middleware
             // Hono middleware signature is different (c, next) => ...
             this.app.use(pathOrHandler, async (c, next) => {
                 // Simplistic conversion
                 await handler({} as any, {} as any, next);
             });
        } else if (typeof pathOrHandler === 'function') {
             // Global middleware
             this.app.use('*', async (c, next) => {
                 await pathOrHandler({} as any, {} as any, next);
             });
        }
    }

    /**
     * Mount a sub-application or router
     */
    mount(path: string, subApp: Hono) {
        this.app.route(path, subApp);
    }


    async listen(port: number) {
        return new Promise<void>((resolve) => {
            if (this.staticRoot) {
                this.app.get('/*', serveStatic({ root: this.staticRoot }));
            }
            
            const targetPort = port || this.port;
            this.server = serve({
                fetch: this.app.fetch,
                port: targetPort
            }, (info) => {
                this.listeningPort = info.port;
                resolve();
            });
        });
    }

    getPort() {
        return this.listeningPort || this.port;
    }

    // Expose raw app for scenarios where standard interface is not enough
    getRawApp() {
        return this.app;
    }

    async close() {
        if (this.server && typeof this.server.close === 'function') {
            this.server.close();
        }
    }


}
