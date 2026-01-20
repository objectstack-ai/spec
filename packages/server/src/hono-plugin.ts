import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { RuntimePlugin, RuntimeContext, ObjectStackRuntimeProtocol } from '@objectstack/runtime';

export interface HonoPluginOptions {
    port?: number;
    staticRoot?: string;
}

export class HonoServerPlugin implements RuntimePlugin {
    name = 'hono-server';
    private options: HonoPluginOptions;
    private app: Hono;

    constructor(options: HonoPluginOptions = {}) {
        this.options = { 
            port: 3000,
            ...options
        };
        this.app = new Hono();
    }

    install(ctx: RuntimeContext) {
        const { engine } = ctx;
        const protocol = new ObjectStackRuntimeProtocol(engine);

        // Middleware
        this.app.use('*', logger());
        this.app.use('*', cors());

        // --- Bind Protocol to Hono ---
        
        // 1. Discovery
        this.app.get('/api/v1', (c) => c.json(protocol.getDiscovery()));

        // 2. Meta
        this.app.get('/api/v1/meta', (c) => c.json(protocol.getMetaTypes()));
        this.app.get('/api/v1/meta/:type', (c) => c.json(protocol.getMetaItems(c.req.param('type'))));
        this.app.get('/api/v1/meta/:type/:name', (c) => {
             try {
                 return c.json(protocol.getMetaItem(c.req.param('type'), c.req.param('name')));
             } catch (e: any) {
                 return c.json({ error: e.message }, 404);
             }
        });

        // 3. Data
        this.app.get('/api/v1/data/:object', async (c) => {
            try {
                const result = await protocol.findData(c.req.param('object'), c.req.query());
                return c.json(result);
            } catch (e: any) {
                return c.json({ error: e.message }, 404);
            }
        });

        this.app.get('/api/v1/data/:object/:id', async (c) => {
            try {
                const result = await protocol.getData(c.req.param('object'), c.req.param('id'));
                return c.json(result);
            } catch (e: any) {
                return c.json({ error: e.message }, 404);
            }
        });

        this.app.post('/api/v1/data/:object', async (c) => {
            try {
                const body = await c.req.json();
                const result = await protocol.createData(c.req.param('object'), body);
                return c.json(result, 201);
            } catch (e: any) {
                return c.json({ error: e.message }, 400);
            }
        });

        this.app.patch('/api/v1/data/:object/:id', async (c) => {
            try {
                const body = await c.req.json();
                const result = await protocol.updateData(c.req.param('object'), c.req.param('id'), body);
                return c.json(result);
            } catch (e: any) {
                return c.json({ error: e.message }, 400);
            }
        });

        this.app.delete('/api/v1/data/:object/:id', async (c) => {
            try {
                const result = await protocol.deleteData(c.req.param('object'), c.req.param('id'));
                return c.json(result);
            } catch (e: any) {
                return c.json({ error: e.message }, 400);
            }
        });
        
        // 4. UI Protocol
        this.app.get('/api/v1/ui/view/:object', (c) => {
            try {
                // @ts-ignore
                const view = protocol.getUiView(c.req.param('object'), c.req.query('type') || 'list');
                return c.json(view);
            } catch (e: any) {
                return c.json({ error: e.message }, 404);
            }
        });

        // Static Files
        if (this.options.staticRoot) {
            this.app.get('/', serveStatic({ root: this.options.staticRoot, path: 'index.html' }));
            this.app.get('/*', serveStatic({ root: this.options.staticRoot }));
        }

        console.log(`[HonoPlugin] Installed routes and middleware.`);
    }

    async onStart(ctx: RuntimeContext) {
        const port = this.options.port;
        console.log(`[HonoPlugin] Starting server...`);
        console.log(`✅ Server is running on http://localhost:${port}`);
        
        serve({
            fetch: this.app.fetch,
            port
        });
    }
}
