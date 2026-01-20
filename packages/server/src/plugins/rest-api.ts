import { ServerPlugin } from '../plugin';
import { ObjectStackRuntimeProtocol } from '@objectstack/runtime';

export const CoreRestApiPlugin: ServerPlugin = {
  name: 'core-rest-api',
  version: '1.0.0',
  install: (server) => {
    const { app, engine } = server;
    // Instantiate Transport-Agnostic Protocol Layer
    const protocol = new ObjectStackRuntimeProtocol(engine);

    // 1. Discovery
    app.get('/api/v1', (c) => c.json(protocol.getDiscovery()));

    // 2. Meta: Types
    app.get('/api/v1/meta', (c) => c.json(protocol.getMetaTypes()));

    // 3. Meta: Items by Type
    app.get('/api/v1/meta/:type', (c) => c.json(protocol.getMetaItems(c.req.param('type'))));

    // 4. Meta: Single Item
    app.get('/api/v1/meta/:type/:name', (c) => {
      try {
        return c.json(protocol.getMetaItem(c.req.param('type'), c.req.param('name')));
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    });

    // 5. Data: Find (with Query)
    app.get('/api/v1/data/:object', async (c) => {
      try {
        const result = await protocol.findData(c.req.param('object'), c.req.query());
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 6. Data: Get Single
    app.get('/api/v1/data/:object/:id', async (c) => {
      try {
        const result = await protocol.getData(c.req.param('object'), c.req.param('id'));
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    });

    // 7. Data: Create
    app.post('/api/v1/data/:object', async (c) => {
      try {
        const body = await c.req.json();
        const result = await protocol.createData(c.req.param('object'), body);
        return c.json(result, 201);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 8. Data: Update
    app.patch('/api/v1/data/:object/:id', async (c) => {
      try {
        const body = await c.req.json();
        const result = await protocol.updateData(c.req.param('object'), c.req.param('id'), body);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 9. Data: Delete
    app.delete('/api/v1/data/:object/:id', async (c) => {
      try {
        const result = await protocol.deleteData(c.req.param('object'), c.req.param('id'));
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 400);
      }
    });

    // 10. UI: View Definition
    app.get('/api/v1/ui/view/:object', (c) => {
      try {
        // @ts-ignore
        const view = protocol.getUiView(c.req.param('object'), c.req.query('type') || 'list');
        return c.json(view);
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    });
  }
};
