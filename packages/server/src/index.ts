import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { SchemaRegistry, DataEngine } from '@objectstack/objectql';

export interface ServerConfig {
  port?: number;
  static?: {
    root: string;
    path?: string;
  };
  logger?: boolean;
  plugins?: any[];
}

export class ObjectStackServer {
  public app: Hono;
  public engine: DataEngine;
  private config: ServerConfig;

  constructor(config: ServerConfig = {}) {
    this.config = {
      port: 3000,
      logger: true,
      plugins: [],
      ...config
    };

    this.app = new Hono();
    this.engine = new DataEngine(this.config.plugins);

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeStatic();
  }

  private initializeMiddleware() {
    if (this.config.logger) {
      this.app.use('*', logger());
    }
    this.app.use('*', cors());
  }

  private initializeStatic() {
    if (this.config.static) {
      const root = this.config.static.root;
      this.app.get('/', serveStatic({ root, path: this.config.static.path || 'index.html' }));
      this.app.get('/*', serveStatic({ root }));
    }
  }

  private initializeRoutes() {
    // 1. Discovery
    this.app.get('/api/v1', (c) => {
      return c.json({
        name: 'ObjectOS Server',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        routes: {
          discovery: '/api/v1',
          metadata: '/api/v1/meta',
          data: '/api/v1/data',
          auth: '/api/v1/auth',
          ui: '/api/v1/ui'
        },
        capabilities: {
          search: true,
          files: true
        }
      });
    });

    // 2. Metadata: List Types
    this.app.get('/api/v1/meta', (c) => {
      const types = SchemaRegistry.getRegisteredTypes();
      return c.json({ 
        data: types.map(type => ({
          type,
          href: `/api/v1/meta/${type}s`, // Convention: pluralize
          count: SchemaRegistry.listItems(type).length
        }))
      });
    });

    // 3. Metadata: List Items by Type
    this.app.get('/api/v1/meta/:type', (c) => {
      const typePlural = c.req.param('type');
      
      // Simple Singularization Mapping
      const typeMap: Record<string, string> = {
        'objects': 'object',
        'apps': 'app',
        'flows': 'flow',
        'reports': 'report',
        'plugins': 'plugin',
        'kinds': 'kind'
      };
      const type = typeMap[typePlural] || typePlural; // Fallback to direct pass

      const items = SchemaRegistry.listItems(type);
      
      const summaries = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        label: item.label,
        type: item.type,
        icon: item.icon,
        description: item.description,
        ...(type === 'object' ? { path: `/api/v1/data/${item.name}` } : {}),
        self: `/api/v1/meta/${typePlural}/${item.name || item.id}`
      }));

      return c.json({ data: summaries });
    });

    // 4. Metadata: Get Single Item
    this.app.get('/api/v1/meta/:type/:name', (c) => {
      const typePlural = c.req.param('type');
      const name = c.req.param('name');
      
      const typeMap: Record<string, string> = {
        'objects': 'object',
        'apps': 'app',
        'flows': 'flow',
        'reports': 'report',
        'plugins': 'plugin',
        'kinds': 'kind'
      };
      const type = typeMap[typePlural] || typePlural;

      const item = SchemaRegistry.getItem(type, name);
      if (!item) return c.json({ error: `Metadata not found: ${type}/${name}` }, 404);
      
      return c.json(item);
    });

    // 5. UI: View Definition
    this.app.get('/api/v1/ui/view/:object', (c) => {
      const objectName = c.req.param('object');
      const type = (c.req.query('type') as 'list' | 'form') || 'list';
      try {
        const view = this.engine.getView(objectName, type);
        if (!view) return c.json({ error: 'View not generated' }, 404);
        return c.json(view);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 6. Data: Find
    this.app.get('/api/v1/data/:object', async (c) => {
      const objectName = c.req.param('object');
      const query = c.req.query();
      
      try {
        // TODO: Map query params to cleaner AST if needed, or Engine does simple mapping
        // e.g. ?sort=-name -> { sort: ['-name'] }
        const result = await this.engine.find(objectName, query);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 7. Data: Query (Advanced AST)
    this.app.post('/api/v1/data/:object/query', async (c) => {
      const objectName = c.req.param('object');
      const body = await c.req.json();
      
      try {
        // Body is Partial<QueryAST>
        // Engine find expects (object, filters/options)
        // If engine.find signature supports AST passing, we pass it.
        // Currently engine.find(object, filters: any).
        // Let's assume engine handles it or we adapt it.
        // For now, pass body as the filter/options object.
        const result = await this.engine.find(objectName, body);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 8. Data: Get
    this.app.get('/api/v1/data/:object/:id', async (c) => {
      const objectName = c.req.param('object');
      const id = c.req.param('id');
      try {
        const result = await this.engine.get(objectName, id);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    });

    // 9. Data: Create
    this.app.post('/api/v1/data/:object', async (c) => {
      const objectName = c.req.param('object');
      const body = await c.req.json();
      try {
        const result = await this.engine.create(objectName, body);
        return c.json(result, 201);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 10. Data: Update
    this.app.patch('/api/v1/data/:object/:id', async (c) => {
      const objectName = c.req.param('object');
      const id = c.req.param('id');
      const body = await c.req.json();
      try {
        const result = await this.engine.update(objectName, id, body);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 11. Data: Delete
    this.app.delete('/api/v1/data/:object/:id', async (c) => {
      const objectName = c.req.param('object');
      const id = c.req.param('id');
      try {
        const result = await this.engine.delete(objectName, id);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });
    
    // 12. Data: Batch Operations
    this.app.post('/api/v1/data/:object/batch', async (c) => {
         // TODO: Implement batch in Engine
         return c.json({ error: 'Not implemented' }, 501);
    });
    this.app.delete('/api/v1/data/:object/batch', async (c) => {
         // TODO: Implement batch in Engine
         return c.json({ error: 'Not implemented' }, 501);
    });
  }

  public async start() {
    console.log('--- Starting ObjectStack Server ---');
    await this.engine.start();
    
    console.log(`Server is running on http://localhost:${this.config.port}`);
    
    serve({
      fetch: this.app.fetch,
      port: this.config.port
    });
  }
}
