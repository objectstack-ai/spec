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
 * Metadata API: Get All Objects
 */
app.get('/api/v1/meta/objects', (c) => {
  const objects = SchemaRegistry.getAll().map(obj => ({
    name: obj.name,
    label: obj.label,
    icon: obj.icon,
    path: `/api/v1/data/${obj.name}`
  }));
  return c.json({ data: objects });
});

/**
 * Metadata API: Get Single Object
 */
app.get('/api/v1/meta/objects/:name', (c) => {
  const name = c.req.param('name');
  const schema = SchemaRegistry.get(name);
  if (!schema) return c.json({ error: 'Not found' }, 404);
  return c.json(schema);
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
const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
