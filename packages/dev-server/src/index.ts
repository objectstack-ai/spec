import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { DataEngine, ObjectStackRuntimeProtocol, RuntimePlugin } from '@objectstack/runtime';

export interface DevServerOptions {
  port?: number;
  staticRoot?: string;
  cors?: boolean;
}

/**
 * ObjectStack Development Server Plugin
 * 
 * Drop-in plugin to expose Kernel via HTTP for UI development.
 * NOT for production use.
 */
export class DevServerPlugin implements RuntimePlugin {
  name = 'dev-server';
  private port: number;
  private staticRoot: string;
  private enableCors: boolean;

  constructor(options: DevServerOptions = {}) {
    this.port = options.port || 3004;
    this.staticRoot = options.staticRoot || './public';
    this.enableCors = options.cors !== false;
  }

  async onStart(ctx: { engine: DataEngine }) {
    const app = new Hono();
    const protocol = new ObjectStackRuntimeProtocol(ctx.engine);

    // 1. Dev Middlewares
    app.use('*', logger());
    if (this.enableCors) {
        app.use('*', cors());
    }

    // 2. Wiring Protocol (Automatic)
    // Discovery
    app.get('/api/v1', (c) => c.json(protocol.getDiscovery()));
    
    // Meta (Types)
    app.get('/api/v1/meta', (c) => c.json(protocol.getMetaTypes()));
    // Meta (List)
    app.get('/api/v1/meta/:type', (c) => c.json(protocol.getMetaItems(c.req.param('type'))));
    // Meta (Item)
    app.get('/api/v1/meta/:type/:name', (c) => { 
        try {
            return c.json(protocol.getMetaItem(c.req.param('type'), c.req.param('name')))
        } catch(e:any) {
            return c.json({error: e.message}, 404);
        }
    });

    // Data (Read)
    app.get('/api/v1/data/:object', async (c) => {
        try { return c.json(await protocol.findData(c.req.param('object'), c.req.query())); } 
        catch(e:any) { return c.json({error:e.message}, 400); }
    });
    app.get('/api/v1/data/:object/:id', async (c) => {
        try { return c.json(await protocol.getData(c.req.param('object'), c.req.param('id'))); }
        catch(e:any) { return c.json({error:e.message}, 404); }
    });
    
    // Data (Write)
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

    // UI View
    // @ts-ignore
    app.get('/api/v1/ui/view/:object', (c) => {
        try { 
            const viewType = (c.req.query('type') as 'list' | 'form') || 'list';
            return c.json(protocol.getUiView(c.req.param('object'), viewType)); 
        }
        catch(e:any) { return c.json({error:e.message}, 404); }
    });

    // 3. Static Files (UI Hosting)
    if (this.staticRoot) {
        app.get('/', serveStatic({ root: this.staticRoot, path: 'index.html' }));
        app.get('/*', serveStatic({ root: this.staticRoot }));
    }

    console.log('');
    console.log(`📦 ObjectStack Dev Server running at: http://localhost:${this.port}`);
    console.log(`➜  API Discovery: http://localhost:${this.port}/api/v1`);
    console.log(`➜  UI Playground: http://localhost:${this.port}/index.html`);
    console.log('');

    serve({ fetch: app.fetch, port: this.port });
  }
}
