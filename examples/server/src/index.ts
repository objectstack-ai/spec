import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { loadPlugins } from './loader';
import { SchemaRegistry } from './kernel/registry';
import { DataEngine } from './kernel/engine';

// 1. Initialize Kernel
const app = new Hono();
const dataEngine = new DataEngine(); // Engine loads plugins internally now

app.use('*', logger());
app.use('*', cors());

// 3. Define Unified Routes

/**
 * System Discovery API
 * GET /api/v1
 */
app.get('/api/v1', (c) => {
  return c.json({
    name: 'ObjectOS Local Server',
    version: '1.0.0',
    environment: 'development',
    routes: {
      discovery: '/api/v1',
      metadata: '/api/v1/meta',
      data: '/api/v1/data',
      auth: '/api/v1/auth'
    },
    capabilities: {
      search: true,
      files: true
    }
  });
});

/**
 * Metadata Discovery API: List all available metadata types
 * GET /api/v1/meta
 */
app.get('/api/v1/meta', (c) => {
  const types = SchemaRegistry.getRegisteredTypes();
  const summary = types.map(type => ({
    type: type,
    href: `/api/v1/meta/${type}`,
    count: SchemaRegistry.listItems(type).length
  }));
  return c.json({ data: summary });
});

/**
 * Unified Metadata API: List Items by Type
 * GET /api/v1/meta/objects
 * GET /api/v1/meta/apps
 */
app.get('/api/v1/meta/:type', (c) => {
  const typePlural = c.req.param('type');
  
  const type = typePlural; // Direct pass-through for exact match with Registry keys
  
  const items = SchemaRegistry.listItems(type);
  
  // Optional: Summary transformation based on type
  const summaries = items.map((item: any) => ({
    id: item.id, // Some items use ID (plugins)
    name: item.name,
    label: item.label,
    type: item.type,
    icon: item.icon,
    description: item.description,
    // Add dynamic links
    ...(type === 'object' ? { path: `/api/v1/data/${item.name}` } : {}),
    self: `/api/v1/meta/${typePlural}/${item.name || item.id}`
  }));

  return c.json({ data: summaries });
});

/**
 * Unified Metadata API: Get Single Item
 * GET /api/v1/meta/objects/account
 * GET /api/v1/meta/apps/crm
 */
app.get('/api/v1/meta/:type/:name', (c) => {
  const typePlural = c.req.param('type');
  const name = c.req.param('name');
  
  // const typeMap: Record<string, string> = {
  //   'objects': 'object',
  //   'apps': 'app',
  //   'flows': 'flow',
  //   'reports': 'report',
  //   'plugins': 'plugin',
  //   'kinds': 'kind'
  // };
  // const type = typeMap[typePlural] || typePlural;
  const type = typePlural; // Direct pass-through

  const item = SchemaRegistry.getItem(type, name);
  if (!item) return c.json({ error: `Metadata not found: ${type}/${name}` }, 404);
  
  return c.json(item);
});

/**
 * Data API: Find
 */
app.get('/api/v1/data/:object', async (c) => {
  const objectName = c.req.param('object');
  const query = c.req.query();
  
  try {
    const result = await dataEngine.find(objectName, query);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

/**
 * Data API: Get
 */
app.get('/api/v1/data/:object/:id', async (c) => {
  const objectName = c.req.param('object');
  const id = c.req.param('id');
  
  try {
    const result = await dataEngine.get(objectName, id);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

/**
 * Data API: Create
 */
app.post('/api/v1/data/:object', async (c) => {
  const objectName = c.req.param('object');
  const body = await c.req.json();
  
  try {
    const result = await dataEngine.create(objectName, body);
    return c.json(result, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

/**
 * Data API: Update
 */
app.patch('/api/v1/data/:object/:id', async (c) => {
  const objectName = c.req.param('object');
  const id = c.req.param('id');
  const body = await c.req.json();
  
  try {
    const result = await dataEngine.update(objectName, id, body);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

/**
 * Data API: Delete
 */
app.delete('/api/v1/data/:object/:id', async (c) => {
  const objectName = c.req.param('object');
  const id = c.req.param('id');
  
  try {
    const result = await dataEngine.delete(objectName, id);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// 4. Start Server
const port = 3004;

(async () => {
  console.log('--- Starting ObjectStack Server ---');
  try {
    await loadPlugins();
    console.log('--- Plugins Loaded ---');
  } catch (err) {
    console.error('Failed to load plugins:', err);
  }

  console.log(`Server is running on http://localhost:${port}`);

  serve({
    fetch: app.fetch,
    port
  });
})();
