import { Context } from 'hono';
import { ServerPlugin } from '../plugin';
import { SchemaRegistry } from '@objectstack/runtime';

export const CoreRestApiPlugin: ServerPlugin = {
  name: 'core-rest-api',
  version: '1.0.0',
  install: (server) => {
    const { app, engine } = server;

    // 1. Discovery
    app.get('/api/v1', (c) => {
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
    app.get('/api/v1/meta', (c) => {
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
    app.get('/api/v1/meta/:type', (c) => {
      const typePlural = c.req.param('type');
      
      const typeMap: Record<string, string> = {
        'objects': 'object',
        'apps': 'app',
        'flows': 'flow',
        'reports': 'report',
        'plugins': 'plugin',
        'kinds': 'kind'
      };
      const type = typeMap[typePlural] || typePlural;

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
    app.get('/api/v1/meta/:type/:name', (c) => {
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
    app.get('/api/v1/ui/view/:object', (c) => {
      const objectName = c.req.param('object');
      const type = (c.req.query('type') as 'list' | 'form') || 'list';
      try {
        const view = engine.getView(objectName, type);
        if (!view) return c.json({ error: 'View not generated' }, 404);
        return c.json(view);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 6. Data: Find
    app.get('/api/v1/data/:object', async (c) => {
      const objectName = c.req.param('object');
      const query = c.req.query();
      
      try {
        const result = await engine.find(objectName, query);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 7. Data: Query (Advanced AST)
    app.post('/api/v1/data/:object/query', async (c) => {
      const objectName = c.req.param('object');
      const body = await c.req.json();
      
      try {
        const result = await engine.find(objectName, body);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 8. Data: Get
    app.get('/api/v1/data/:object/:id', async (c) => {
      const objectName = c.req.param('object');
      const id = c.req.param('id');
      try {
        const result = await engine.get(objectName, id);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    });

    // 9. Data: Create
    app.post('/api/v1/data/:object', async (c) => {
      const objectName = c.req.param('object');
      const body = await c.req.json();
      try {
        const result = await engine.create(objectName, body);
        return c.json(result, 201);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 10. Data: Update
    app.patch('/api/v1/data/:object/:id', async (c) => {
      const objectName = c.req.param('object');
      const id = c.req.param('id');
      const body = await c.req.json();
      try {
        const result = await engine.update(objectName, id, body);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 11. Data: Delete
    app.delete('/api/v1/data/:object/:id', async (c) => {
      const objectName = c.req.param('object');
      const id = c.req.param('id');
      try {
        const result = await engine.delete(objectName, id);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 12. Batch Operations (Placeholders)
    app.post('/api/v1/data/:object/batch', async (c) => {
       return c.json({ error: 'Not implemented' }, 501);
    });
    app.delete('/api/v1/data/:object/batch', async (c) => {
       return c.json({ error: 'Not implemented' }, 501);
    });
  }
};
