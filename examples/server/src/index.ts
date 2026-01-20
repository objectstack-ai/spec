import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// 1. 引入核心内核 (The Kernel)
import { DataEngine, ObjectStackRuntimeProtocol } from '@objectstack/runtime';
// 2. 引入驱动 (The Driver)
import { InMemoryDriver } from '@objectstack/driver-memory';
// 3. 引入业务插件 (The Apps)
import CrmApp from '@objectstack/example-crm/objectstack.config';
import TodoApp from '@objectstack/example-todo/objectstack.config';
import BiPluginManifest from '@objectstack/plugin-bi/objectstack.config';

(async () => {
  console.log('🚀 Starting ObjectStack in Raw Kernel Mode...');

  // --- A. 初始化内核 (Kernel Layer) ---
  
  // 1. 创建数据引擎，加载业务插件
  const engine = new DataEngine([
      CrmApp, 
      TodoApp, 
      BiPluginManifest
  ]);

  // 2. 注册驱动 (显式注入)
  engine.ql.registerDriver(new InMemoryDriver());

  // 3. 创建协议处理器 (Protocol Layer)
  // 这是 HTTP 和 Kernel 之间的翻译官
  const protocol = new ObjectStackRuntimeProtocol(engine);

  // 4. 启动内核 (执行数据初始化/Seed)
  await engine.start();


  // --- B. 初始化宿主 (Host Layer / Server Shell) ---
  
  const app = new Hono();

  // 中间件
  app.use('*', logger());
  app.use('*', cors());

  // --- C. 路由映射 (Wiring) ---
  // 这里展示了 "Server 只是个壳"：它只负责把 Request 转给 Protocol

  // 1. Discovery
  app.get('/api/v1', (c) => c.json(protocol.getDiscovery()));

  // 2. Meta API
  app.get('/api/v1/meta', (c) => c.json(protocol.getMetaTypes()));
  app.get('/api/v1/meta/:type', (c) => c.json(protocol.getMetaItems(c.req.param('type'))));
  app.get('/api/v1/meta/:type/:name', (c) => {
    try {
        return c.json(protocol.getMetaItem(c.req.param('type'), c.req.param('name')));
    } catch (e: any) {
        return c.json({ error: e.message }, 404);
    }
  });

  // 3. Data API (CRUD)
  app.get('/api/v1/data/:object', async (c) => {
    // 将 URL Query (HTTP) 转换为 Protocol Query
    try {
        const result = await protocol.findData(c.req.param('object'), c.req.query());
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
  });

  app.get('/api/v1/data/:object/:id', async (c) => {
    try {
        const result = await protocol.getData(c.req.param('object'), c.req.param('id'));
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 404);
    }
  });

  app.post('/api/v1/data/:object', async (c) => {
    try {
        const body = await c.req.json();
        const result = await protocol.createData(c.req.param('object'), body);
        return c.json(result, 201);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
  });

  app.patch('/api/v1/data/:object/:id', async (c) => {
     try {
        const body = await c.req.json();
        const result = await protocol.updateData(c.req.param('object'), c.req.param('id'), body);
        return c.json(result);
     } catch (e: any) {
        return c.json({ error: e.message }, 400);
     }
  });

  app.delete('/api/v1/data/:object/:id', async (c) => {
     try {
        const result = await protocol.deleteData(c.req.param('object'), c.req.param('id'));
        return c.json(result);
     } catch (e: any) {
        return c.json({ error: e.message }, 400);
     }
  });

  // 4. UI Protocol
  app.get('/api/v1/ui/view/:object', (c) => {
    try {
        // @ts-ignore
        const view = protocol.getUiView(c.req.param('object'), c.req.query('type') || 'list');
        return c.json(view);
    } catch (e: any) {
        return c.json({ error: e.message }, 404);
    }
  });

  // --- D. 静态资源 (前端宿主) ---
  app.get('/', serveStatic({ root: './public', path: 'index.html' }));
  app.get('/index.html', serveStatic({ root: './public', path: 'index.html' }));


  // --- E. 启动监听 ---
  const port = 3004;
  console.log(`✅ Server is running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });

})();
