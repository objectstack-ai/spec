import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { DataEngine, ObjectStackRuntimeProtocol, RuntimePlugin } from '@objectstack/runtime';

export interface HonoServerOptions {
  port?: number;
  staticRoot?: string;
  cors?: boolean;
  logger?: boolean;
}

/**
 * Hono Server Runtime Plugin
 * 
 * Exposes the ObjectStack Kernel via standard HTTP Protocol using Hono.
 * Can be used for Production (Standalone) or Development.
 */
export class HonoServerPlugin implements RuntimePlugin {
  name = 'com.objectstack.server.hono';
  
  private options: HonoServerOptions;

  constructor(options: HonoServerOptions = {}) {
    this.options = { 
        port: 3000, 
        cors: true,
        logger: true,
        ...options 
    };
  }

  async onStart(ctx: { engine: DataEngine }) {
    const app = new Hono();
    const protocol = new ObjectStackRuntimeProtocol(ctx.engine);

    // 1. Middlewares
    if (this.options.logger) app.use('*', logger());
    if (this.options.cors) app.use('*', cors());

    // 2. Wiring Protocol (Automatic)
    // Discovery
    app.get('/api/v1', (c) => c.json(protocol.getDiscovery()));
    
    // Meta Protocol
    app.get('/api/v1/meta', (c) => c.json(protocol.getMetaTypes()));
    app.get('/api/v1/meta/:type', (c) => c.json(protocol.getMetaItems(c.req.param('type'))));
    app.get('/api/v1/meta/:type/:name', (c) => {
        try {
            return c.json(protocol.getMetaItem(c.req.param('type'), c.req.param('name')));
        } catch(e:any) {
            return c.json({error: e.message}, 404);
        }
    });
    
    // Data Protocol
    app.get('/api/v1/data/:object', async (c) => {
        try { return c.json(await protocol.findData(c.req.param('object'), c.req.query())); } 
        catch(e:any) { return c.json({error:e.message}, 400); }
    });
    app.get('/api/v1/data/:object/:id', async (c) => {
        try { return c.json(await protocol.getData(c.req.param('object'), c.req.param('id'))); }
        catch(e:any) { return c.json({error:e.message}, 404); }
    });
    app.post('/api/v1/data/:object', async (c) => {
        try { return c.json(await protocol.createData(c.req.param('object'), await c.req.json()), 201); }
        catch(e:any) { return c.json({error:e.message}, 400); }
    });
    app.patch('/api/v1/data/:object/:id', async (c) => {
        try { return c.json(await protocol.updateData(c.req.param('object'), c.req.param('id'), await c.req.json())); }
        catch(e:any) { return c.json({error:e.message}, 400); }
    });
    app.delete('/api/v1/data/:object/:id', async (c) => {
        try { return c.json(await protocol.deleteData(c.req.param('object'), c.req.param('id'))); }
        catch(e:any) { return c.json({error:e.message}, 400); }
    });

    // UI Protocol
    // @ts-ignore
    app.get('/api/v1/ui/view/:object', (c) => {
        try { 
            const viewType = (c.req.query('type') as 'list' | 'form') || 'list';
            return c.json(protocol.getUiView(c.req.param('object'), viewType)); 
        }
        catch(e:any) { return c.json({error:e.message}, 404); }
    });

    // 3. Static Files (Optional)
    if (this.options.staticRoot) {
        app.get('/', serveStatic({ root: this.options.staticRoot, path: 'index.html' }));
        app.get('/*', serveStatic({ root: this.options.staticRoot }));
    }

    console.log('');
    console.log(`🌍 ObjectStack Server (Hono) running at: http://localhost:${this.options.port}`);
    console.log('');
    
    serve({ fetch: app.fetch, port: this.options.port });
  }
}
