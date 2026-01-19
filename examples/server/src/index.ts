import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { loadPlugins } from './loader';
import { SchemaRegistry } from './kernel/registry';
import { DataEngine } from './kernel/engine';

// 1. Initialize Kernel
const app = new Hono();
const dataEngine = new DataEngine();

app.use('*', logger());
app.use('*', cors());

// 2. Load Plugins (CRM, Todo)
console.log('--- Starting ObjectStack Server ---');
loadPlugins();
console.log('--- Plugins Loaded ---');

// 3. Define Unified Routes

/**
 * Discovery Endpoint
 * Allows clients to dynamically discover API routes and capabilities.
 */
const discoveryHandler = (c: any) => {
  return c.json({
    name: "ObjectStack Example Server",
    version: "0.1.0",
    environment: "development",
    routes: {
      data: "/api/v1/data",
      metadata: "/api/v1/meta",
      auth: "/api/v1/auth", // Not implemented yet
      actions: "/api/v1/actions",
      storage: "/api/v1/storage", // Not implemented yet
    },
    features: {
      graphql: false,
      search: true,
      files: false
    },
    locale: {
      default: "en-US",
      supported: ["en-US", "zh-CN"],
      timezone: "UTC"
    }
  });
};

app.get('/.well-known/objectstack', discoveryHandler);
app.get('/api/v1/discovery', discoveryHandler);

/**
 * Unified Metadata API: List Items by Type
 * GET /api/v1/meta/objects
 * GET /api/v1/meta/apps
 */
app.get('/api/v1/meta/:type', (c) => {
  const typePlural = c.req.param('type');
  
  // Dynamic singularization:
  // 1. Check hardcoded map (for exceptions like 'indexes' -> 'index' if needed)
  // 2. Or fallback to removing trailing 's'
  const typeMap: Record<string, string> = {
    // Add specific exceptions here if english pluralization rules fail
  };
  const type = typeMap[typePlural] || (typePlural.endsWith('s') ? typePlural.slice(0, -1) : typePlural);
  
  const items = SchemaRegistry.listItems(type);
  
  // Optional: Summary transformation based on type
  const summaries = items.map((item: any) => ({
    name: item.name,
    label: item.label,
    icon: item.icon,
    description: item.description,
    // Add dynamic links
    ...(type === 'object' ? { path: `/api/v1/data/${item.name}` } : {}),
    self: `/api/v1/meta/${typePlural}/${item.name}`
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
  
  const typeMap: Record<string, string> = {};
  const type = typeMap[typePlural] || (typePlural.endsWith('s') ? typePlural.slice(0, -1) : typePlural);

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
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
