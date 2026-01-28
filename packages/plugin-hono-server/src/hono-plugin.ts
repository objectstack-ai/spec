import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { 
    Plugin, 
    PluginContext, 
    ObjectStackRuntimeProtocol 
} from '@objectstack/runtime';

export interface HonoPluginOptions {
    port?: number;
    staticRoot?: string;
}

/**
 * Hono Server Plugin
 * 
 * Provides HTTP server capabilities using Hono framework.
 * Registers routes for ObjectStack Runtime Protocol.
 * 
 * Dependencies: None (can work standalone)
 * Services: 
 * - 'http-server': Hono app instance
 * 
 * @example
 * const server = new HonoServerPlugin({ port: 3000 });
 * kernel.use(server);
 */
export class HonoServerPlugin implements Plugin {
    name = 'com.objectstack.server.hono';
    version = '1.0.0';
    
    private options: HonoPluginOptions;
    private app: Hono;
    private server: any;

    constructor(options: HonoPluginOptions = {}) {
        this.options = { 
            port: 3000,
            ...options
        };
        this.app = new Hono();
    }

    /**
     * Init phase - Setup HTTP server and register as service
     */
    async init(ctx: PluginContext) {
        // Middleware
        this.app.use('*', logger());
        this.app.use('*', cors());

        // Register HTTP server service
        ctx.registerService('http-server', this.app);
        ctx.logger.log('[HonoServerPlugin] HTTP server service registered');
    }

    /**
     * Start phase - Bind routes and start listening
     */
    async start(ctx: PluginContext) {
        // Get ObjectQL directly from services
        let protocol: ObjectStackRuntimeProtocol | null = null;
        
        try {
            const objectql = ctx.getService<any>('objectql');
            
            // Create Protocol Instance with faked Kernel
            // This is necessary because Protocol expects full Kernel but we only have Context
            protocol = new ObjectStackRuntimeProtocol({
                getService: (name: string) => {
                    if (name === 'objectql') return objectql;
                    throw new Error(`[HonoPlugin] Service ${name} not found`);
                }
            } as any);

        } catch (e) {
            ctx.logger.log('[HonoServerPlugin] ObjectQL service not found, skipping protocol routes');
        }

        // Register protocol routes if available
        if (protocol) {
            const p = protocol!;
            this.app.get('/api/v1', (c) => c.json(p.getDiscovery()));

            // Meta Protocol
            this.app.get('/api/v1/meta', (c) => c.json(p.getMetaTypes()));
            this.app.get('/api/v1/meta/:type', (c) => c.json(p.getMetaItems(c.req.param('type'))));
            this.app.get('/api/v1/meta/:type/:name', (c) => {
                try {
                    return c.json(p.getMetaItem(c.req.param('type'), c.req.param('name')));
                } catch(e:any) {
                    return c.json({error: e.message}, 404);
                }
            });
            
            // Data Protocol
            this.app.get('/api/v1/data/:object', async (c) => {
                try { return c.json(await p.findData(c.req.param('object'), c.req.query())); } 
                catch(e:any) { return c.json({error:e.message}, 400); }
            });
            this.app.get('/api/v1/data/:object/:id', async (c) => {
                try { return c.json(await p.getData(c.req.param('object'), c.req.param('id'))); }
                catch(e:any) { return c.json({error:e.message}, 404); }
            });
            this.app.post('/api/v1/data/:object', async (c) => {
                try { return c.json(await p.createData(c.req.param('object'), await c.req.json()), 201); }
                catch(e:any) { return c.json({error:e.message}, 400); }
            });
            this.app.patch('/api/v1/data/:object/:id', async (c) => {
                try { return c.json(await p.updateData(c.req.param('object'), c.req.param('id'), await c.req.json())); }
                catch(e:any) { return c.json({error:e.message}, 400); }
            });
            this.app.delete('/api/v1/data/:object/:id', async (c) => {
                try { return c.json(await p.deleteData(c.req.param('object'), c.req.param('id'))); }
                catch(e:any) { return c.json({error:e.message}, 400); }
            });

            // UI Protocol
            // @ts-ignore
            this.app.get('/api/v1/ui/view/:object', (c) => {
                try { 
                    const viewType = (c.req.query('type') as 'list' | 'form') || 'list';
                    return c.json(p.getUiView(c.req.param('object'), viewType)); 
                }
                catch(e:any) { return c.json({error:e.message}, 404); }
            });
        }

        // Static files
        if (this.options.staticRoot) {
            this.app.get('/', serveStatic({ root: this.options.staticRoot, path: 'index.html' }));
            this.app.get('/*', serveStatic({ root: this.options.staticRoot }));
        }

        // Start server on kernel:ready hook
        ctx.hook('kernel:ready', () => {
            const port = this.options.port;
            ctx.logger.log('[HonoServerPlugin] Starting server...');
            ctx.logger.log(`✅ Server is running on http://localhost:${port}`);
            
            this.server = serve({
                fetch: this.app.fetch,
                port
            });
        });
    }

    /**
     * Destroy phase - Stop server
     */
    async destroy() {
        // Note: Hono's serve function may not return a server with close method
        // This is a best-effort cleanup
        if (this.server && typeof this.server.close === 'function') {
            this.server.close();
            console.log('[HonoServerPlugin] Server stopped');
        }
    }
}
